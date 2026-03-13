// ========================================
// DormX AI Image Validator
// Uses face-api.js for person and face detection
// ========================================

// ========================================
// Configuration
// ========================================
const AI_CONFIG = {
    // Minimum confidence threshold for detection
    MIN_CONFIDENCE: 0.5,
    // Timeout for detection (ms)
    TIMEOUT: 5000,
    // Model path - using a reliable CDN
    MODEL_PATH: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'
};

// ========================================
// State
// ========================================
let modelsLoaded = false;
let modelsLoading = false;

// ========================================
// Load AI Models
// ========================================
async function loadAIModels() {
    if (modelsLoaded) return true;
    if (modelsLoading) {
        // Wait for existing load to complete
        while (modelsLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return modelsLoaded;
    }

    modelsLoading = true;
    console.log('Loading AI models...');

    try {
        // Load face detection models from CDN
        await faceapi.nets.tinyFaceDetector.loadFromUri(AI_CONFIG.MODEL_PATH);
        await faceapi.nets.faceLandmark68Net.loadFromUri(AI_CONFIG.MODEL_PATH);
        await faceapi.nets.faceExpressionNet.loadFromUri(AI_CONFIG.MODEL_PATH);
        
        modelsLoaded = true;
        console.log('AI models loaded successfully!');
        return true;
    } catch (error) {
        console.error('Error loading AI models:', error);
        modelsLoading = false;
        return false;
    }
}

// ========================================
// Main Validation Function
// ========================================
/**
 * Validates an image to detect if it contains any person/face
 * @param {string} imageDataUrl - Base64 encoded image data
 * @returns {Promise<{
 *   person_detected: boolean,
 *   face_detected: boolean,
 *   confidence_score: number,
 *   message: string
 * }>}
 */
async function validateProductImage(imageDataUrl) {
    const startTime = Date.now();
    
    // If no image, allow the product (image is optional)
    if (!imageDataUrl) {
        return {
            person_detected: false,
            face_detected: false,
            confidence_score: 0,
            message: 'No image provided, allowing product'
        };
    }

    // Load models if not already loaded
    const modelsReady = await loadAIModels();
    if (!modelsReady) {
        console.warn('AI models not ready, allowing image');
        return {
            person_detected: false,
            face_detected: false,
            confidence_score: 0,
            message: 'AI models not available, allowing image'
        };
    }

    try {
        // Create image element from data URL
        const img = await loadImage(imageDataUrl);
        
        // Detect faces with TinyFaceDetector (fast and efficient)
        const detections = await faceapi.detectAllFaces(
            img, 
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: AI_CONFIG.MIN_CONFIDENCE
            })
        );

        // Also check for face landmarks/expressions to detect more accurately
        const landmarkDetections = await faceapi.detectAllFaces(
            img,
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 416,
                scoreThreshold: 0.3
            })
        );

        // Calculate detection results
        const faceDetected = detections.length > 0;
        
        // Calculate confidence score based on detections
        let maxConfidence = 0;
        if (detections.length > 0) {
            maxConfidence = Math.max(...detections.map(d => d.score));
        }

        // Additional check: Multiple faces could indicate a group selfie
        const multipleFaces = detections.length > 1;
        
        // If multiple faces detected, definitely reject
        const personDetected = faceDetected && (maxConfidence > AI_CONFIG.MIN_CONFIDENCE || multipleFaces);

        const elapsedTime = Date.now() - startTime;
        console.log(`Image validation completed in ${elapsedTime}ms`);
        console.log(`Faces detected: ${detections.length}, Person detected: ${personDetected}`);

        return {
            person_detected: personDetected,
            face_detected: faceDetected,
            confidence_score: maxConfidence,
            message: personDetected 
                ? `Detected ${detections.length} face(s) - Image contains a person`
                : 'No person detected - Image is product-only'
        };

    } catch (error) {
        console.error('Error validating image:', error);
        // On error, allow the image (fail-safe)
        return {
            person_detected: false,
            face_detected: false,
            confidence_score: 0,
            message: 'Error in image validation, allowing image'
        };
    }
}

// ========================================
// Helper Function - Load Image from Data URL
// ========================================
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ========================================
// Quick Validation (Simplified)
// ========================================
/**
 * Quick validation check - returns true if image should be rejected
 * @param {string} imageDataUrl - Base64 encoded image
 * @returns {Promise<boolean>}
 */
async function shouldRejectImage(imageDataUrl) {
    if (!imageDataUrl) return false;
    
    const result = await validateProductImage(imageDataUrl);
    return result.person_detected;
}

// ========================================
// Profile Image Validation (Human Face Only)
// ========================================
/**
 * Validates profile image - requires exactly ONE human face
 * @param {string} imageDataUrl - Base64 encoded image data
 * @returns {Promise<{
 *   valid: boolean,
 *   face_count: number,
 *   confidence_score: number,
 *   message: string
 * }>}
 */
async function validateProfileImage(imageDataUrl) {
    const startTime = Date.now();
    
    // If no image, return invalid (profile image is required)
    if (!imageDataUrl) {
        return {
            valid: false,
            face_count: 0,
            confidence_score: 0,
            message: 'No image provided. Please upload a profile photo.'
        };
    }

    // Load models if not already loaded
    const modelsReady = await loadAIModels();
    if (!modelsReady) {
        console.warn('AI models not ready');
        return {
            valid: false,
            face_count: 0,
            confidence_score: 0,
            message: 'AI models not available. Please try again.'
        };
    }

    try {
        // Create image element from data URL
        const img = await loadImage(imageDataUrl);
        
        // Detect all faces with higher precision
        const detections = await faceapi.detectAllFaces(
            img, 
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 416,
                scoreThreshold: 0.3
            })
        );

        // Also check face landmarks for additional validation
        const landmarkDetections = await faceapi.detectAllFaces(
            img,
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.5
            })
        );

        const faceCount = detections.length;
        let maxConfidence = 0;
        
        if (detections.length > 0) {
            maxConfidence = Math.max(...detections.map(d => d.score));
        }

        const elapsedTime = Date.now() - startTime;
        console.log(`Profile image validation completed in ${elapsedTime}ms`);
        console.log(`Faces detected: ${faceCount}, Confidence: ${maxConfidence}`);

        // Validation rules for profile images
        if (faceCount === 0) {
            return {
                valid: false,
                face_count: 0,
                confidence_score: maxConfidence,
                message: 'Invalid image. Please upload a clear photo of a real human face. Only human profile pictures are allowed.'
            };
        }
        
        if (faceCount > 1) {
            return {
                valid: false,
                face_count: faceCount,
                confidence_score: maxConfidence,
                message: 'Invalid image. Please upload a photo with only one person. Multiple faces detected.'
            };
        }
        
        if (maxConfidence < 0.5) {
            return {
                valid: false,
                face_count: faceCount,
                confidence_score: maxConfidence,
                message: 'Invalid image. The face in the photo is not clear enough. Please upload a clearer photo.'
            };
        }

        // All validations passed - exactly one face with good confidence
        return {
            valid: true,
            face_count: faceCount,
            confidence_score: maxConfidence,
            message: 'Profile image is valid!'
        };

    } catch (error) {
        console.error('Error validating profile image:', error);
        return {
            valid: false,
            face_count: 0,
            confidence_score: 0,
            message: 'Error validating image. Please try again with a different photo.'
        };
    }
}

// ========================================
// Image Processing Utilities
// ========================================
/**
 * Crops image to square and compresses it
 * @param {string} imageDataUrl - Base64 encoded image
 * @param {number} maxSize - Maximum dimension
 * @returns {Promise<string>} - Processed image as base64
 */
async function processProfileImage(imageDataUrl, maxSize = 400) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Calculate square crop dimensions
            const size = Math.min(img.width, img.height);
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;
            
            // Create canvas for processing
            const canvas = document.createElement('canvas');
            canvas.width = maxSize;
            canvas.height = maxSize;
            const ctx = canvas.getContext('2d');
            
            // Draw cropped and resized image
            ctx.drawImage(img, x, y, size, size, 0, 0, maxSize, maxSize);
            
            // Compress to JPEG with 0.8 quality
            const processed = canvas.toDataURL('image/jpeg', 0.8);
            resolve(processed);
        };
        img.onerror = reject;
        img.src = imageDataUrl;
    });
}

/**
 * Checks file size before processing
 * @param {File} file - Image file
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean}
 */
function validateFileSize(file, maxSizeMB = 5) {
    const fileSizeMB = file.size / (1024 * 1024);
    return fileSizeMB <= maxSizeMB;
}

/**
 * Validates file type
 * @param {File} file - Image file
 * @returns {boolean}
 */
function validateFileType(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file.type);
}

// ========================================
// Preload Models on Page Load
// ========================================
// Auto-load models when this script is included
if (typeof window !== 'undefined') {
    // Preload models after page loads
    window.addEventListener('load', () => {
        loadAIModels();
    });
}

