
// ========================================
// DormX - College Marketplace Platform
// JavaScript Application
// ========================================

// ========================================
// Constants & Configuration
// ========================================
const ADMIN_PASSWORD = 'DORMX1234';
const COLLEGE_ADMIN_PASSWORDS = {
    'IIIT_MANIPUR': 'IIIT1234',
    'NIT_MANIPUR': 'NIT1234',
    'NIELIT_MANIPUR': 'NIELIT1234'
};
const STORAGE_KEYS = {
    USERS: 'dormx_users',
    PRODUCTS: 'dormx_products',
    CURRENT_USER: 'dormx_current_user',
    IS_ADMIN: 'dormx_is_admin',
    SAVED_ITEMS: 'dormx_saved_items'
};

// College constants with full names
const COLLEGES = {
    'IIIT_MANIPUR': 'Indian Institute of Information Technology Manipur',
    'NIT_MANIPUR': 'National Institute of Technology Manipur',
    'NIELIT_MANIPUR': 'National Institute of Electronics and Information Technology Manipur'
};

// Get college display name from key
function getCollegeDisplayName(collegeKey) {
    return COLLEGES[collegeKey] || collegeKey;
}

// ========================================
// State Management
// ========================================
let currentUser = null;
let isAdminSession = false;
let isCollegeAdminSession = false;
let currentCollegeAdmin = null;
let selectedProductImage = null;
let selectedProfileImage = null;
let selectedIdCardImage = null;
let currentViewingProductId = null;

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen after a short delay
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);

// Check for existing session
    checkSession();

    // Initialize event listeners
    initializeEventListeners();

    // Add sample data if first time
    addSampleDataIfNeeded();
}

function checkSession() {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const isAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true';

    if (userData) {
        currentUser = JSON.parse(userData);
        isAdminSession = isAdmin;

        if (currentUser.status === 'active') {
            showPage('marketplace-page');
            updateMarketplaceUI();
        } else {
            showPage('verification-pending-page');
        }
    }
}

function initializeEventListeners() {
    // Registration form
    document.getElementById('registration-form').addEventListener('submit', handleRegistration);
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Password validation
    document.getElementById('reg-password').addEventListener('input', validatePassword);
    
    // Add product form
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    
    // Change password form
    document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);
    
    // Admin login form
    document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);
    
    // Product image upload
    document.getElementById('product-image').addEventListener('change', handleImageUpload);
    
    // Edit profile form
    document.getElementById('edit-profile-form').addEventListener('submit', handleEditProfile);
    
    // Search input
    document.getElementById('search-input').addEventListener('input', searchProducts);
}

// ========================================
// ID Card Upload Handler
// ========================================
function handleIdCardUpload(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('id-card-preview');
    
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showToast('Please upload a valid image file (JPG, JPEG, or PNG)', 'error');
            e.target.value = '';
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File too large. Maximum size is 5MB.', 'error');
            e.target.value = '';
            return;
        }
        
        // Read and display preview
        const reader = new FileReader();
        reader.onload = function(event) {
            selectedIdCardImage = event.target.result;
            preview.innerHTML = `
                <img src="${selectedIdCardImage}" alt="ID Card Preview">
                <p class="file-name"><i class="fas fa-check-circle"></i> Uploaded: ${file.name}</p>
            `;
            preview.classList.add('has-file');
        };
        reader.readAsDataURL(file);
    } else {
        selectedIdCardImage = null;
        preview.innerHTML = '';
        preview.classList.remove('has-file');
    }
}

// ========================================
// Sample Data - Pre-defined Users and Products
// ========================================

// Default users that will be created on first load
const DEFAULT_USERS = [
    // IIIT Manipur Users
    {
        id: 'jack_user_001',
        name: 'Jack',
        college: 'IIIT_MANIPUR',
        mobile: '9876543210',
        roll: '2021001',
        email: 'jack@college.edu',
        password: encryptPassword('Jack1234'),
        status: 'active',
        createdAt: '2024-01-15T10:00:00.000Z'
    },
    {
        id: 'john_user_002',
        name: 'John',
        college: 'IIIT_MANIPUR',
        mobile: '9876543211',
        roll: '2021002',
        email: 'john@college.edu',
        password: encryptPassword('John1234'),
        status: 'active',
        createdAt: '2024-01-16T10:00:00.000Z'
    },
    // NIT Manipur Users
    {
        id: 'nit_user_001',
        name: 'Rahul',
        college: 'NIT_MANIPUR',
        mobile: '9876543220',
        roll: 'NIT2021001',
        email: 'rahul@nit.edu',
        password: encryptPassword('Rahul1234'),
        status: 'active',
        createdAt: '2024-01-17T10:00:00.000Z'
    },
    {
        id: 'nit_user_002',
        name: 'Priya',
        college: 'NIT_MANIPUR',
        mobile: '9876543221',
        roll: 'NIT2021002',
        email: 'priya@nit.edu',
        password: encryptPassword('Priya1234'),
        status: 'active',
        createdAt: '2024-01-18T10:00:00.000Z'
    },
    // NIELIT Manipur Users
    {
        id: 'nielit_user_001',
        name: 'Amit',
        college: 'NIELIT_MANIPUR',
        mobile: '9876543230',
        roll: 'NIELIT2021001',
        email: 'amit@nielit.edu',
        password: encryptPassword('Amit1234'),
        status: 'active',
        createdAt: '2024-01-19T10:00:00.000Z'
    },
    {
        id: 'nielit_user_002',
        name: 'Sneha',
        college: 'NIELIT_MANIPUR',
        mobile: '9876543231',
        roll: 'NIELIT2021002',
        email: 'sneha@nielit.edu',
        password: encryptPassword('Sneha1234'),
        status: 'active',
        createdAt: '2024-01-20T10:00:00.000Z'
    }
];

// Default products that will be created on first load
const DEFAULT_PRODUCTS = [
    // IIIT Manipur Products
    {
        id: 'prod_001',
        name: 'C++ Book',
        price: 450,
        purchaseDate: '2024-01-10',
        condition: 'Good',
        description: 'C++ programming book for beginners and advanced learners. Covers all fundamental concepts.',
        image: null,
        sellerId: 'jack_user_001',
        sellerName: 'Jack',
        sellerEmail: 'jack@college.edu',
        sellerPhone: '9876543210',
        college: 'IIIT_MANIPUR',
        createdAt: '2024-01-20T10:00:00.000Z'
    },
    {
        id: 'prod_002',
        name: 'Introduction to Machine Learning with Python',
        price: 650,
        purchaseDate: '2024-01-12',
        condition: 'Like New',
        description: 'Comprehensive guide to machine learning using Python. Perfect for students.',
        image: null,
        sellerId: 'jack_user_001',
        sellerName: 'Jack',
        sellerEmail: 'jack@college.edu',
        sellerPhone: '9876543210',
        college: 'IIIT_MANIPUR',
        createdAt: '2024-01-21T10:00:00.000Z'
    },
    {
        id: 'prod_003',
        name: 'Alarm Clock',
        price: 300,
        purchaseDate: '2024-01-05',
        condition: 'Good',
        description: 'Digital alarm clock with multiple alarm settings. Very useful for morning classes.',
        image: null,
        sellerId: 'john_user_002',
        sellerName: 'John',
        sellerEmail: 'john@college.edu',
        sellerPhone: '9876543211',
        college: 'IIIT_MANIPUR',
        createdAt: '2024-01-22T10:00:00.000Z'
    },
    {
        id: 'prod_004',
        name: 'Scientific Calculator',
        price: 550,
        purchaseDate: '2024-01-08',
        condition: 'New',
        description: 'Advanced scientific calculator for engineering and science students. All functions included.',
        image: null,
        sellerId: 'john_user_002',
        sellerName: 'John',
        sellerEmail: 'john@college.edu',
        sellerPhone: '9876543211',
        college: 'IIIT_MANIPUR',
        createdAt: '2024-01-23T10:00:00.000Z'
    },
    // NIT Manipur Products
    {
        id: 'nit_prod_001',
        name: 'Engineering Mathematics Vol 1',
        price: 400,
        purchaseDate: '2024-01-11',
        condition: 'Good',
        description: 'Engineering mathematics textbook for all semesters. Covers calculus, linear algebra, and differential equations.',
        image: null,
        sellerId: 'nit_user_001',
        sellerName: 'Rahul',
        sellerEmail: 'rahul@nit.edu',
        sellerPhone: '9876543220',
        college: 'NIT_MANIPUR',
        createdAt: '2024-01-24T10:00:00.000Z'
    },
    {
        id: 'nit_prod_002',
        name: 'Physics Lab Manual',
        price: 250,
        purchaseDate: '2024-01-14',
        condition: 'Like New',
        description: 'Complete physics lab manual with all experiments for B.Tech first year.',
        image: null,
        sellerId: 'nit_user_002',
        sellerName: 'Priya',
        sellerEmail: 'priya@nit.edu',
        sellerPhone: '9876543221',
        college: 'NIT_MANIPUR',
        createdAt: '2024-01-25T10:00:00.000Z'
    },
    // NIELIT Manipur Products
    {
        id: 'nielit_prod_001',
        name: 'Python Programming Basics',
        price: 350,
        purchaseDate: '2024-01-13',
        condition: 'Good',
        description: 'Learn Python from scratch. Perfect for beginners in programming.',
        image: null,
        sellerId: 'nielit_user_001',
        sellerName: 'Amit',
        sellerEmail: 'amit@nielit.edu',
        sellerPhone: '9876543230',
        college: 'NIELIT_MANIPUR',
        createdAt: '2024-01-26T10:00:00.000Z'
    },
    {
        id: 'nielit_prod_002',
        name: 'Wireless Mouse',
        price: 450,
        purchaseDate: '2024-01-15',
        condition: 'New',
        description: 'Wireless mouse with USB receiver. Works perfectly for laptops and desktops.',
        image: null,
        sellerId: 'nielit_user_002',
        sellerName: 'Sneha',
        sellerEmail: 'sneha@nielit.edu',
        sellerPhone: '9876543231',
        college: 'NIELIT_MANIPUR',
        createdAt: '2024-01-27T10:00:00.000Z'
    }
];

// Check if default data has been initialized
const DEFAULT_DATA_INITIALIZED = 'dormx_default_data_initialized';

function addSampleDataIfNeeded() {
    // Check if default data has already been initialized
    const isInitialized = localStorage.getItem(DEFAULT_DATA_INITIALIZED);
    
    if (!isInitialized) {
        // Initialize with default users (only if no users exist)
        const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        if (!existingUsers || JSON.parse(existingUsers).length === 0) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        }
        
        // Initialize with default products (only if no products exist)
        const existingProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (!existingProducts || JSON.parse(existingProducts).length === 0) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
        }
        
        // Mark as initialized
        localStorage.setItem(DEFAULT_DATA_INITIALIZED, 'true');
    }
}

// Function to reset default data (for testing purposes)
function resetDefaultData() {
    localStorage.removeItem(DEFAULT_DATA_INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
    localStorage.removeItem(STORAGE_KEYS.SAVED_ITEMS);
    location.reload();
}

// ========================================
// Page Navigation
// ========================================
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show the selected page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.remove('hidden');
    }

    // Refresh data if needed
    if (pageId === 'marketplace-page') {
        updateMarketplaceUI();
    } else if (pageId === 'profile-page') {
        updateProfileUI();
    } else if (pageId === 'admin-dashboard-page') {
        updateAdminDashboard();
    } else if (pageId === 'verification-pending-page') {
        // Just show the verification pending page
    }
}

function showLoginPage() {
    showPage('login-page');
}

// Check verification status from login page
function checkVerificationStatus() {
    const identifier = prompt('Enter your email or mobile number to check verification status:');
    
    if (!identifier) return;
    
    const users = getUsers();
    const user = users.find(u => u.email === identifier || u.mobile === identifier);
    
    if (!user) {
        showToast('No account found with this email/mobile', 'error');
        return;
    }
    
    if (user.status === 'pending') {
        showToast('Your account is still pending verification. Please wait for admin approval.', 'warning');
    } else if (user.status === 'active') {
        showToast('Your account is active! You can now login.', 'success');
    } else if (user.status === 'rejected') {
        showToast('Your account has been rejected. Contact admin.', 'error');
    }
}

// Show profile page
function showProfilePage() {
    updateProfileUI();
    showPage('profile-page');
}

// ========================================
// Modal Management
// ========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        
        // Reset forms
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // Clear product image preview
        if (modalId === 'add-product-modal') {
            document.getElementById('image-preview').innerHTML = '';
            document.getElementById('image-preview').classList.remove('has-image');
            selectedProductImage = null;
        }
        
        // Clear profile image state
        if (modalId === 'edit-profile-modal') {
            selectedProfileImage = null;
            const validationStatus = document.getElementById('profile-image-validation-status');
            if (validationStatus) {
                validationStatus.style.display = 'none';
                validationStatus.className = 'validation-status';
            }
        }
    }
}

function showAddProductModal() {
    openModal('add-product-modal');
}

function showChangePasswordModal() {
    openModal('change-password-modal');
}

function showEditProfileModal() {
    if (!currentUser) return;
    
    // Pre-fill form with current user data
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-mobile').value = currentUser.mobile;
    
    openModal('edit-profile-modal');
}

function handleEditProfile(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const newName = document.getElementById('edit-name').value.trim();
    const newMobile = document.getElementById('edit-mobile').value.trim();
    
    if (!newName || !newMobile) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    // Update user in localStorage
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        // Update user data
        users[userIndex].name = newName;
        users[userIndex].mobile = newMobile;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Update current user session
        currentUser.name = newName;
        currentUser.mobile = newMobile;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        // Also update seller info in products
        let products = getProducts();
        products = products.map(p => {
            if (p.sellerId === currentUser.id) {
                p.sellerName = newName;
                p.sellerPhone = newMobile;
            }
            return p;
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        
        showToast('Profile updated successfully', 'success');
        closeModal('edit-profile-modal');
        
        // Update UI
        updateProfileUI();
    }
}

function showAdminPanel() {
    openModal('admin-login-modal');
}

function showAdminPanelFromHome() {
    openModal('admin-login-modal');
}

// ========================================
// Password Toggle
// ========================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ========================================
// Password Validation
// ========================================
function validatePassword() {
    const password = document.getElementById('reg-password').value;
    
    // Validation rules
    const rules = {
        ruleLength: password.length >= 8,
        ruleUpper: /[A-Z]/.test(password),
        ruleLower: /[a-z]/.test(password),
        ruleNumber: /[0-9]/.test(password),
        ruleSpecial: /[!@#$%^&*]/.test(password)
    };
    
    // Update UI
    Object.keys(rules).forEach(ruleId => {
        const element = document.getElementById(ruleId);
        if (rules[ruleId]) {
            element.classList.add('valid');
            element.querySelector('i').classList.remove('fa-circle');
            element.querySelector('i').classList.add('fa-check-circle');
        } else {
            element.classList.remove('valid');
            element.querySelector('i').classList.add('fa-circle');
            element.querySelector('i').classList.remove('fa-check-circle');
        }
    });
    
    return Object.values(rules).every(rule => rule);
}

// ========================================
// Registration Handler
// ========================================
function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const college = document.getElementById('reg-college').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const roll = document.getElementById('reg-roll').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    
    // Validate ID card upload
    if (!selectedIdCardImage) {
        showToast('Please upload your college ID card to complete registration.', 'error');
        return;
    }
    
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    // Simple password validation - just check minimum length
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    // Get existing users
    const users = getUsers();
    
    // Check if user already exists
    if (users.some(u => u.email === email || u.mobile === mobile)) {
        showToast('User with this email or mobile already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        name,
        college,
        mobile,
        roll,
        email,
        password: encryptPassword(password),
        status: 'pending',
        idCardImage: selectedIdCardImage,
        createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Show success and redirect
    showToast('Registration successful! Please wait for admin verification.', 'success');
    document.getElementById('registration-form').reset();
    
    // Reset ID card preview
    selectedIdCardImage = null;
    const idCardPreview = document.getElementById('id-card-preview');
    if (idCardPreview) {
        idCardPreview.innerHTML = '';
        idCardPreview.classList.remove('has-file');
    }
    
    // Show verification pending page
    setTimeout(() => {
        showPage('verification-pending-page');
    }, 1500);
}

// ========================================
// Login Handler
// ========================================
function handleLogin(e) {
    e.preventDefault();
    
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Get users
    const users = getUsers();
    
    // Find user
    const user = users.find(u => 
        (u.email === identifier || u.mobile === identifier) && 
        u.password === encryptPassword(password)
    );
    
    if (!user) {
        showToast('Invalid credentials or account not verified', 'error');
        return;
    }
    
    if (user.status === 'pending') {
        showToast('Your account is pending verification', 'warning');
        return;
    }
    
    if (user.status === 'rejected') {
        showToast('Your account has been rejected. Contact admin.', 'error');
        return;
    }
    
    // Set current user
    currentUser = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    
    // Clear form
    document.getElementById('login-form').reset();
    
    // Show success
    showToast(`Welcome back, ${user.name}!`, 'success');
    
    // Update saved items badge
    updateSavedCountBadge();
    
    // Redirect
    showPage('marketplace-page');
    updateMarketplaceUI();
}

// ========================================
// Logout Handler
// ========================================
function logout() {
    currentUser = null;
    isAdminSession = false;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'false');
    
    showToast('Logged out successfully', 'success');
    showPage('home-page');
}

// ========================================
// Product Management
// ========================================
// ========================================
// AI Image Validation Handler
// ========================================
let isValidatingImage = false;

function showValidationLoading() {
    const modal = document.getElementById('add-product-modal');
    const form = document.getElementById('add-product-form');
    let loadingEl = document.getElementById('validation-loading');
    
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'validation-loading';
        loadingEl.className = 'validation-loading';
        loadingEl.innerHTML = `
            <div class="validation-spinner"></div>
            <p>Analyzing image with AI...</p>
            <small>Detecting faces and people</small>
        `;
        form.appendChild(loadingEl);
    }
    
    loadingEl.style.display = 'flex';
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    }
}

function hideValidationLoading() {
    const loadingEl = document.getElementById('validation-loading');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
    const form = document.getElementById('add-product-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> List Product';
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    if (!currentUser || currentUser.status !== 'active') {
        showToast('Please login to list products', 'error');
        return;
    }
    
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const purchaseDate = document.getElementById('product-purchase-date').value;
    const condition = document.getElementById('product-condition').value;
    const description = document.getElementById('product-description').value.trim();
    
    // Show loading indicator
    showValidationLoading();
    isValidatingImage = true;
    
    try {
        // Run AI Image Validation if image is present
        if (selectedProductImage) {
            console.log('Starting AI image validation...');
            const validationResult = await validateProductImage(selectedProductImage);
            
            console.log('Validation result:', validationResult);
            
            // Check if person or face detected
            if (validationResult.person_detected || validationResult.face_detected) {
                hideValidationLoading();
                isValidatingImage = false;
                showToast('The uploaded image contains a person. Please upload a product-only image.', 'error');
                return;
            }
        }
        
        // If validation passed (or no image), create and save product
        const product = {
            id: generateId(),
            name,
            price,
            purchaseDate,
            condition,
            description,
            image: selectedProductImage,
            sellerId: currentUser.id,
            sellerName: currentUser.name,
            sellerEmail: currentUser.email,
            sellerPhone: currentUser.mobile,
            college: currentUser.college,
            createdAt: new Date().toISOString()
        };
        
        // Save product
        const products = getProducts();
        products.push(product);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        
        // Close modal and refresh
        closeModal('add-product-modal');
        hideValidationLoading();
        isValidatingImage = false;
        showToast('Product listed successfully!', 'success');
        updateMarketplaceUI();
        
    } catch (error) {
        console.error('Error during product creation:', error);
        hideValidationLoading();
        isValidatingImage = false;
        // Allow product to be listed if validation fails (fail-safe)
        showToast('Image validation encountered an error. Product will be listed.', 'warning');
        
        // Create product anyway
        const product = {
            id: generateId(),
            name,
            price,
            purchaseDate,
            condition,
            description,
            image: selectedProductImage,
            sellerId: currentUser.id,
            sellerName: currentUser.name,
            sellerEmail: currentUser.email,
            sellerPhone: currentUser.mobile,
            college: currentUser.college,
            createdAt: new Date().toISOString()
        };
        
        const products = getProducts();
        products.push(product);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        
        closeModal('add-product-modal');
        updateMarketplaceUI();
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            selectedProductImage = event.target.result;
            const preview = document.getElementById('image-preview');
            preview.innerHTML = `<img src="${selectedProductImage}" alt="Preview">`;
            preview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
}

function contactSeller() {
    const sellerPhone = document.getElementById('detail-seller-phone').textContent;
    showToast(`Contact seller at: ${sellerPhone}`, 'success');
}

function deleteProduct(productId) {
    showConfirmModal('Are you sure you want to delete this product?', () => {
        const products = getProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index > -1) {
            products.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            showToast('Product deleted successfully', 'success');
            updateMarketplaceUI();
        }
    });
}

// ========================================
// Profile Management
// ========================================
function updateProfileUI() {
    if (!currentUser) return;
    
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-college').textContent = getCollegeDisplayName(currentUser.college) || currentUser.college;
    document.getElementById('profile-roll').textContent = currentUser.roll;
    document.getElementById('profile-mobile').textContent = currentUser.mobile;
    document.getElementById('profile-email').textContent = currentUser.email;
    
    const statusBadge = document.getElementById('profile-status');
    statusBadge.textContent = currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1);
    statusBadge.className = `status-badge ${currentUser.status}`;
    
    // Update profile avatar image
    const profileAvatar = document.getElementById('profile-avatar');
    if (currentUser.profileImage) {
        profileAvatar.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile Image">`;
        profileAvatar.style.background = 'none';
    } else {
        profileAvatar.innerHTML = `<i class="fas fa-user-graduate"></i>`;
        profileAvatar.style.background = 'var(--gradient-primary)';
    }
}

function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    // Validate current password
    if (currentUser.password !== encryptPassword(currentPassword)) {
        showToast('Current password is incorrect', 'error');
        return;
    }
    
    // Validate new password
    if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }
    
    // Update password
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        users[userIndex].password = encryptPassword(newPassword);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Update current user
        currentUser.password = encryptPassword(newPassword);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        showToast('Password updated successfully', 'success');
        closeModal('change-password-modal');
    }
}

// ========================================
// Admin Management
// ========================================
let selectedAdminCollege = 'IIIT_MANIPUR';

function handleAdminLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    
    if (password !== ADMIN_PASSWORD) {
        showToast('Invalid admin password', 'error');
        return;
    }
    
    isAdminSession = true;
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
    
    closeModal('admin-login-modal');
    document.getElementById('admin-password').value = '';
    
    showToast('Welcome to Admin Dashboard', 'success');
    showPage('admin-dashboard-page');
    updateAdminDashboard();
}

// Force refresh admin dashboard to ensure data is loaded
function refreshAdminDashboard() {
    updateAdminDashboard();
}

function showAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.admin-tab').classList.add('active');
    
    // Show/hide content
    document.getElementById('verification-tab').classList.add('hidden');
    document.getElementById('users-tab').classList.add('hidden');
    document.getElementById('marketplaces-tab').classList.add('hidden');
    
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Load products if marketplaces tab is selected
    if (tabName === 'marketplaces') {
        loadAdminProducts(selectedAdminCollege);
    }
}

function updateAdminDashboard() {
    const users = getUsers();
    
    // Update pending count
    const pendingUsers = users.filter(u => u.status === 'pending');
    document.getElementById('pending-count').textContent = pendingUsers.length;
    
    // Render pending requests
    const pendingContainer = document.getElementById('pending-requests');
    const noPendingDiv = document.getElementById('no-pending');
    
    if (pendingUsers.length === 0) {
        pendingContainer.innerHTML = '';
        noPendingDiv.style.display = 'block';
    } else {
        noPendingDiv.style.display = 'none';
        pendingContainer.innerHTML = pendingUsers.map(user => `
            <div class="request-card">
                <div class="request-info">
                    <h4>${user.name}</h4>
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-phone"></i> ${user.mobile}</p>
                    <p><i class="fas fa-university"></i> ${user.college}</p>
                </div>
                <div class="request-actions">
                    <button class="btn-approve" onclick="approveUser('${user.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-reject" onclick="rejectUser('${user.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Render users list
    const usersContainer = document.getElementById('users-list');
    const noUsersDiv = document.getElementById('no-users');
    
    if (users.length === 0) {
        usersContainer.innerHTML = '';
        noUsersDiv.style.display = 'block';
    } else {
        noUsersDiv.style.display = 'none';
        usersContainer.innerHTML = users.map(user => `
            <div class="user-card">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-university"></i> ${user.college}</p>
                    <p><i class="fas fa-info-circle"></i> Status: ${user.status}</p>
                </div>
                <div class="user-actions">
                    <button class="btn-remove" onclick="confirmRemoveUser('${user.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function approveUser(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex > -1) {
        users[userIndex].status = 'active';
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        showToast('User approved successfully', 'success');
        updateAdminDashboard();
    }
}

function rejectUser(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex > -1) {
        users[userIndex].status = 'rejected';
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        showToast('User rejected', 'success');
        updateAdminDashboard();
    }
}

function confirmRemoveUser(userId) {
    showConfirmModal('Are you sure you want to remove this user?', () => {
        removeUser(userId);
    });
}

function removeUser(userId) {
    let users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex > -1) {
        const removedUser = users[userIndex];
        users.splice(userIndex, 1);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Also remove their products
        let products = getProducts();
        products = products.filter(p => p.sellerId !== userId);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        
        // If current user was removed, logout
        if (currentUser && currentUser.id === userId) {
            logout();
            return;
        }
        
        showToast('User removed successfully', 'success');
        updateAdminDashboard();
    }
}

// ========================================
// Manage Marketplaces Functions
// ========================================

function selectAdminCollege(collegeKey) {
    selectedAdminCollege = collegeKey;
    
    // Update button styles
    document.querySelectorAll('.college-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.college-btn').classList.add('active');
    
    // Load products for this college
    loadAdminProducts(collegeKey);
}

function loadAdminProducts(collegeKey) {
    const products = getProducts();
    const grid = document.getElementById('admin-products-grid');
    const emptyState = document.getElementById('no-admin-products');
    
    // Filter products by college
    const collegeProducts = products.filter(p => p.college === collegeKey);
    
    if (collegeProducts.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort by newest first
    collegeProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    grid.innerHTML = collegeProducts.map(product => `
        <div class="admin-product-card">
            <div class="admin-product-image">
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.name}">`
                    : `<div class="admin-product-image-placeholder"><i class="fas fa-box"></i></div>`
                }
            </div>
            <div class="admin-product-info">
                <h4>${product.name}</h4>
                <p class="admin-product-price">₹${product.price}</p>
                <p class="admin-product-condition"><i class="fas fa-star"></i> ${product.condition}</p>
                <p class="admin-product-seller"><i class="fas fa-user"></i> ${product.sellerName}</p>
                <p class="admin-product-college"><i class="fas fa-university"></i> ${getCollegeDisplayName(product.college)}</p>
                ${product.description ? `<p class="admin-product-desc">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>` : ''}
            </div>
            <div class="admin-product-actions">
                <button class="btn-danger" onclick="adminDeleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete Product
                </button>
            </div>
        </div>
    `).join('');
}

function adminDeleteProduct(productId) {
    showConfirmModal('Are you sure you want to delete this product?', () => {
        const products = getProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index > -1) {
            products.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            
            showToast('Product deleted successfully', 'success');
            
            // Refresh the admin products list
            loadAdminProducts(selectedAdminCollege);
        }
    });
}

// ========================================
// UI Updates
// ========================================
function updateMarketplaceUI() {
    if (!currentUser) return;
    
    // Update college name in navbar - use full college name
    const collegeName = getCollegeDisplayName(currentUser.college) || currentUser.college;
    document.getElementById('display-college-name').textContent = collegeName;
    
    // Update marketplace header with college-specific message
    const marketplaceHeader = document.querySelector('.marketplace-header');
    if (marketplaceHeader) {
        marketplaceHeader.innerHTML = `
            <h1>${collegeName} Marketplace</h1>
            <p>Find great deals from students in ${collegeName}</p>
        `;
    }
    
    // Show/hide admin button
    const adminBtn = document.getElementById('admin-btn');
    if (isAdminSession) {
        adminBtn.style.display = 'flex';
    } else {
        adminBtn.style.display = 'none';
    }
    
    // Load products
    loadProducts();
}

function loadProducts(searchQuery) {
    const products = getProducts();
    const grid = document.getElementById('product-grid');
    const emptyState = document.getElementById('empty-products');
    
    // Filter products by user's college - only show products from the same college
    let allProducts = products.filter(p => p.college === currentUser.college);
    
    // Filter by search query if provided
    if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        allProducts = allProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.condition.toLowerCase().includes(query) ||
            p.price.toString().includes(query)
        );
    }
    
    if (allProducts.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort by newest first
    allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    grid.innerHTML = allProducts.map(product => {
        const isSaved = isProductSaved(product.id);
        const isOwnProduct = currentUser && product.sellerId === currentUser.id;
        return `
        <div class="product-card">
            <div class="product-card-image-container" onclick="showProductDetails('${product.id}')">
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.name}" class="product-card-image">`
                    : `<div class="product-card-image-placeholder"><i class="fas fa-box"></i></div>`
                }
                ${isOwnProduct ? `<button class="product-delete-btn" onclick="event.stopPropagation(); deleteProductById('${product.id}')" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
            </div>
            <div class="product-card-body">
                <h3 class="product-card-title" onclick="showProductDetails('${product.id}')">${product.name}</h3>
                <div class="product-card-price">₹${product.price}</div>
                <div class="product-card-meta">
                    <span><i class="fas fa-star"></i> ${product.condition}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(product.purchaseDate)}</span>
                </div>
                ${isOwnProduct ? '<div class="own-product-badge">Your Listing</div>' : ''}
                <div class="product-card-actions">
                    <button class="btn-buy-now" onclick="event.stopPropagation(); buyNowProduct('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Buy Now
                    </button>
                    ${currentUser && !isOwnProduct ? `<button class="btn-save-later ${isSaved ? 'saved' : ''}" onclick="event.stopPropagation(); quickSaveProduct('${product.id}')">
                        <i class="fas fa-bookmark"></i> ${isSaved ? 'Saved' : 'Save'}
                    </button>` : ''}
                </div>
            </div>
        </div>
    `}).join('');
}

// Search products function
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        loadProducts(searchInput.value);
    }
}

// Quick save from marketplace card
function quickSaveProduct(productId) {
    if (!currentUser) {
        showToast('Please login to save products', 'error');
        return;
    }
    
    let savedItems = getSavedItems();
    
    if (savedItems.includes(productId)) {
        // Remove from saved
        savedItems = savedItems.filter(id => id !== productId);
        showToast('Product removed from saved items', 'success');
    } else {
        // Add to saved
        savedItems.push(productId);
        showToast('Product saved for later!', 'success');
    }
    
    saveSavedItems(savedItems);
    updateSavedCountBadge();
    loadProducts(); // Refresh to update button states
}

// Delete product by ID (from marketplace card)
function deleteProductById(productId) {
    showConfirmModal('Are you sure you want to delete this product permanently?', () => {
        const products = getProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index > -1) {
            products.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            showToast('Product deleted successfully', 'success');
            updateMarketplaceUI();
        }
    });
}

// Buy Now from marketplace
function buyNowProduct(productId) {
    showProductDetails(productId);
}

// ========================================
// Toast Notifications
// ========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon i');
    const messageEl = toast.querySelector('.toast-message');
    
    // Set message
    messageEl.textContent = message;
    
    // Set type
    toast.className = `toast ${type}`;
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-times-circle';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Auto hide
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ========================================
// Confirmation Modal
// ========================================
let confirmCallback = null;

function showConfirmModal(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    confirmCallback = callback;
    
    document.getElementById('confirm-yes-btn').onclick = () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeModal('confirm-modal');
        confirmCallback = null;
    };
    
    openModal('confirm-modal');
}

// ========================================
// Utility Functions
// ========================================
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function encryptPassword(password) {
    // Simple base64 encoding (in production, use proper encryption)
    return btoa(password + 'dormx_salt');
}

function getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
}

function getProducts() {
    const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return products ? JSON.parse(products) : [];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ========================================
// Event Listeners for Start Button
// ========================================
// Start button now uses onclick in HTML to show login page directly

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// ========================================
// Saved Items Management
// ========================================

// Get saved items for current user
function getSavedItems() {
    if (!currentUser) return [];
    const savedItems = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
    const allSaved = savedItems ? JSON.parse(savedItems) : {};
    return allSaved[currentUser.id] || [];
}

// Save saved items for current user
function saveSavedItems(items) {
    if (!currentUser) return;
    const savedItems = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
    const allSaved = savedItems ? JSON.parse(savedItems) : {};
    allSaved[currentUser.id] = items;
    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(allSaved));
}

// Check if product is saved
function isProductSaved(productId) {
    const savedItems = getSavedItems();
    return savedItems.includes(productId);
}

// Toggle save product (from product details)
function toggleSaveProduct() {
    if (!currentUser) {
        showToast('Please login to save products', 'error');
        return;
    }
    
    if (!currentViewingProductId) return;
    
    let savedItems = getSavedItems();
    const productId = currentViewingProductId;
    
    if (savedItems.includes(productId)) {
        // Remove from saved
        savedItems = savedItems.filter(id => id !== productId);
        showToast('Product removed from saved items', 'success');
        updateSaveButtonState(false);
    } else {
        // Add to saved
        savedItems.push(productId);
        showToast('Product saved for later!', 'success');
        updateSaveButtonState(true);
    }
    
    saveSavedItems(savedItems);
    updateSavedCountBadge();
}

// Update save button state
function updateSaveButtonState(isSaved) {
    const saveLaterBtn = document.getElementById('save-later-btn');
    const saveLaterText = document.getElementById('save-later-text');
    const icon = saveLaterBtn.querySelector('i');
    
    if (isSaved) {
        saveLaterBtn.classList.add('saved-active');
        saveLaterText.textContent = 'Saved';
        icon.classList.remove('fa-bookmark');
        icon.classList.add('fa-bookmark');
    } else {
        saveLaterBtn.classList.remove('saved-active');
        saveLaterText.textContent = 'Save for Later';
        icon.classList.remove('fa-bookmark');
        icon.classList.add('fa-bookmark');
    }
}

// Update saved count badge
function updateSavedCountBadge() {
    const badge = document.getElementById('saved-count-badge');
    const savedItems = getSavedItems();
    const count = savedItems.length;
    
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Show saved items page
function showSavedItemsPage() {
    if (!currentUser) {
        showToast('Please login to view saved items', 'error');
        return;
    }
    
    loadSavedItems();
    showPage('saved-items-page');
}

// Load saved items
function loadSavedItems() {
    const savedItems = getSavedItems();
    const allProducts = getProducts();
    
    // Filter products by user's college and saved items
    const savedProducts = allProducts.filter(p => 
        savedItems.includes(p.id) && p.college === currentUser.college
    );
    
    const grid = document.getElementById('saved-items-grid');
    const emptyState = document.getElementById('no-saved-items');
    
    if (savedProducts.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = savedProducts.map(product => `
        <div class="saved-product-card">
            ${product.image 
                ? `<img src="${product.image}" alt="${product.name}" class="saved-product-image">`
                : `<div class="saved-product-image-placeholder"><i class="fas fa-box"></i></div>`
            }
            <div class="saved-product-body">
                <h3 class="saved-product-title">${product.name}</h3>
                <div class="saved-product-price">₹${product.price}</div>
                <div class="saved-product-actions">
                    <button class="btn-remove-saved" onclick="removeFromSaved('${product.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                    <button class="btn-buy-now" onclick="buyNowFromSaved('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Buy Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Remove from saved
function removeFromSaved(productId) {
    let savedItems = getSavedItems();
    savedItems = savedItems.filter(id => id !== productId);
    saveSavedItems(savedItems);
    
    showToast('Product removed from saved items', 'success');
    updateSavedCountBadge();
    loadSavedItems(); // Refresh the page
}

// Buy now from saved items
function buyNowFromSaved(productId) {
    showProductDetails(productId);
}

// ========================================
// Enhanced Product Details
// ========================================

function showProductDetails(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    currentViewingProductId = productId;
    
    // Populate details
    document.getElementById('detail-product-name').textContent = product.name;
    document.getElementById('detail-product-price').textContent = `₹${product.price}`;
    document.getElementById('detail-purchase-date').textContent = formatDate(product.purchaseDate);
    document.getElementById('detail-product-condition').textContent = product.condition;
    document.getElementById('detail-product-description').textContent = product.description || 'No description provided';
    document.getElementById('detail-seller-name').textContent = product.sellerName;
    document.getElementById('detail-seller-email').textContent = product.sellerEmail;
    document.getElementById('detail-seller-phone').textContent = product.sellerPhone;
    document.getElementById('detail-date-listed').textContent = formatDate(product.createdAt);
    
    // Set image
    const imageSection = document.getElementById('detail-product-image');
    if (product.image) {
        imageSection.src = product.image;
        imageSection.style.display = 'block';
    } else {
        imageSection.style.display = 'none';
        imageSection.parentElement.innerHTML = `<div class="product-image-placeholder"><i class="fas fa-box"></i></div>`;
    }
    
    // Update save button state
    if (currentUser) {
        const isSaved = isProductSaved(productId);
        updateSaveButtonState(isSaved);
        
        // Show delete button if it's the user's own product
        const deleteBtn = document.getElementById('delete-product-btn');
        if (product.sellerId === currentUser.id) {
            deleteBtn.style.display = 'block';
        } else {
            deleteBtn.style.display = 'none';
        }
    }
    
    openModal('product-details-modal');
}

// Delete current product from details modal
function deleteCurrentProduct() {
    if (!currentViewingProductId) return;
    
    showConfirmModal('Are you sure you want to delete this product permanently?', () => {
        const products = getProducts();
        const index = products.findIndex(p => p.id === currentViewingProductId);
        
        if (index > -1) {
            products.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            
            showToast('Product deleted permanently', 'success');
            closeModal('product-details-modal');
            currentViewingProductId = null;
            updateMarketplaceUI();
        }
    });
}

// ========================================
// Profile Image Upload & Validation
// ========================================

function showEditProfileModal() {
    if (!currentUser) return;
    
    // Pre-fill form with current user data
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-mobile').value = currentUser.mobile;
    
    // Reset profile image state
    selectedProfileImage = null;
    
    // Update profile image preview
    updateProfileImagePreview();
    
    openModal('edit-profile-modal');
}

function updateProfileImagePreview() {
    const previewContainer = document.getElementById('edit-profile-image-preview');
    const changeBtn = document.getElementById('change-profile-photo-btn');
    
    if (currentUser && currentUser.profileImage) {
        // Show current profile image
        previewContainer.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile Image">`;
    } else {
        // Show default avatar
        previewContainer.innerHTML = `<div class="default-avatar"><i class="fas fa-user"></i></div>`;
    }
    
    // Update button text
    if (changeBtn) {
        changeBtn.textContent = currentUser && currentUser.profileImage ? 'Change Profile Photo' : 'Upload Profile Photo';
    }
}

function handleProfileImageUpload(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!validateFileType(file)) {
        showToast('Invalid file type. Please upload JPG, JPEG, or PNG images only.', 'error');
        e.target.value = '';
        return;
    }
    
    // Validate file size (max 5MB)
    if (!validateFileSize(file, 5)) {
        showToast('File too large. Maximum size is 5MB.', 'error');
        e.target.value = '';
        return;
    }
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = function(event) {
        selectedProfileImage = event.target.result;
        const previewContainer = document.getElementById('edit-profile-image-preview');
        previewContainer.innerHTML = `<img src="${selectedProfileImage}" alt="Profile Preview">`;
        
        // Automatically validate the image
        validateAndShowProfileImageResult(selectedProfileImage);
    };
    reader.readAsDataURL(file);
}

async function validateAndShowProfileImageResult(imageDataUrl) {
    const validationStatus = document.getElementById('profile-image-validation-status');
    const changeBtn = document.getElementById('change-profile-photo-btn');
    
    // Show validating status
    if (validationStatus) {
        validationStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing image...';
        validationStatus.className = 'validation-status validating';
        validationStatus.style.display = 'block';
    }
    
    // Disable change button during validation
    if (changeBtn) {
        changeBtn.disabled = true;
    }
    
    try {
        const result = await validateProfileImage(imageDataUrl);
        
        if (result.valid) {
            // Valid profile image with one face
            if (validationStatus) {
                validationStatus.innerHTML = '<i class="fas fa-check-circle"></i> Profile photo valid!';
                validationStatus.className = 'validation-status valid';
            }
            selectedProfileImage = await processProfileImage(imageDataUrl, 400);
        } else {
            // Invalid - clear the selected image
            selectedProfileImage = null;
            updateProfileImagePreview();
            
            if (validationStatus) {
                validationStatus.innerHTML = `<i class="fas fa-times-circle"></i> ${result.message}`;
                validationStatus.className = 'validation-status invalid';
            }
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Profile image validation error:', error);
        if (validationStatus) {
            validationStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error validating image. Please try again.';
            validationStatus.className = 'validation-status invalid';
        }
    }
    
    // Re-enable change button
    if (changeBtn) {
        changeBtn.disabled = false;
    }
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const newName = document.getElementById('edit-name').value.trim();
    const newMobile = document.getElementById('edit-mobile').value.trim();
    
    if (!newName || !newMobile) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    // If profile image was changed, validate it
    if (selectedProfileImage) {
        const validationResult = await validateProfileImage(selectedProfileImage);
        
        if (!validationResult.valid) {
            showToast(validationResult.message, 'error');
            return;
        }
        
        // Process the image (crop to square, compress)
        selectedProfileImage = await processProfileImage(selectedProfileImage, 400);
    }
    
    // Update user in localStorage
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        // Update user data
        users[userIndex].name = newName;
        users[userIndex].mobile = newMobile;
        
        // Update profile image if changed
        if (selectedProfileImage) {
            users[userIndex].profileImage = selectedProfileImage;
        }
        
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Update current user session
        currentUser.name = newName;
        currentUser.mobile = newMobile;
        if (selectedProfileImage) {
            currentUser.profileImage = selectedProfileImage;
        }
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        // Also update seller info in products
        let products = getProducts();
        products = products.map(p => {
            if (p.sellerId === currentUser.id) {
                p.sellerName = newName;
                p.sellerPhone = newMobile;
            }
            return p;
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        
        showToast('Profile updated successfully', 'success');
        closeModal('edit-profile-modal');
        
        // Update UI
        updateProfileUI();
        updateMarketplaceUI();
    }
}

// ========================================
// College Admin Login
// ========================================

// Initialize college admin form listener
document.addEventListener('DOMContentLoaded', () => {
    const collegeAdminForm = document.getElementById('college-admin-form');
    if (collegeAdminForm) {
        collegeAdminForm.addEventListener('submit', handleCollegeAdminLogin);
    }
});

function showCollegeAdminLogin() {
    openModal('college-admin-modal');
}

function handleCollegeAdminLogin(e) {
    e.preventDefault();
    
    const college = document.getElementById('college-admin-college').value;
    const password = document.getElementById('college-admin-password').value;
    
    if (!college) {
        showToast('Please select a college', 'error');
        return;
    }
    
    // Validate password for the selected college
    const expectedPassword = COLLEGE_ADMIN_PASSWORDS[college];
    
    if (password !== expectedPassword) {
        showToast('Incorrect admin password for the selected college.', 'error');
        return;
    }
    
    // Set college admin session
    isCollegeAdminSession = true;
    currentCollegeAdmin = {
        college: college,
        collegeName: getCollegeDisplayName(college)
    };
    
    // Close modal
    closeModal('college-admin-modal');
    document.getElementById('college-admin-password').value = '';
    
    showToast(`Welcome to ${currentCollegeAdmin.collegeName} Admin Dashboard`, 'success');
    
    // Show college admin dashboard
    showPage('college-admin-dashboard-page');
    updateCollegeAdminDashboard();
}

function showCollegeAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.college-admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.college-admin-tab').classList.add('active');
    
    // Show/hide content
    document.getElementById('college-users-tab').classList.add('hidden');
    document.getElementById('college-products-tab').classList.add('hidden');
    
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Load data based on tab
    if (tabName === 'college-users') {
        loadCollegeAdminUsers();
    } else if (tabName === 'college-products') {
        loadCollegeAdminProducts();
    }
}

function updateCollegeAdminDashboard() {
    if (!currentCollegeAdmin) return;
    
    // Update header
    document.getElementById('college-admin-title').textContent = `${currentCollegeAdmin.collegeName} Admin`;
    
    // Load initial data
    loadCollegeAdminUsers();
}

function loadCollegeAdminUsers() {
    if (!currentCollegeAdmin) return;
    
    const users = getUsers();
    const collegeUsers = users.filter(u => u.college === currentCollegeAdmin.college);
    
    const usersContainer = document.getElementById('college-users-list');
    const noUsersDiv = document.getElementById('no-college-users');
    
    if (collegeUsers.length === 0) {
        usersContainer.innerHTML = '';
        noUsersDiv.style.display = 'block';
        return;
    }
    
    noUsersDiv.style.display = 'none';
    
    usersContainer.innerHTML = collegeUsers.map(user => `
        <div class="request-card">
            <div class="request-info">
                <h4>${user.name}</h4>
                <p><i class="fas fa-envelope"></i> ${user.email}</p>
                <p><i class="fas fa-phone"></i> ${user.mobile}</p>
                <p><i class="fas fa-id-card"></i> ${user.roll}</p>
                <p><i class="fas fa-info-circle"></i> Status: ${user.status}</p>
            </div>
            <div class="request-actions">
                ${user.status === 'pending' ? `
                    <button class="btn-approve" onclick="collegeAdminApproveUser('${user.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-reject" onclick="collegeAdminRejectUser('${user.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                ` : `
                    <button class="btn-remove" onclick="collegeAdminRemoveUser('${user.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

function collegeAdminApproveUser(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex > -1) {
        users[userIndex].status = 'active';
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        showToast('User approved successfully', 'success');
        loadCollegeAdminUsers();
    }
}

function collegeAdminRejectUser(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex > -1) {
        users[userIndex].status = 'rejected';
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        showToast('User rejected', 'success');
        loadCollegeAdminUsers();
    }
}

function collegeAdminRemoveUser(userId) {
    showConfirmModal('Are you sure you want to remove this user?', () => {
        let users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex > -1) {
            users.splice(userIndex, 1);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            
            // Also remove their products
            let products = getProducts();
            products = products.filter(p => p.sellerId !== userId);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            
            showToast('User removed successfully', 'success');
            loadCollegeAdminUsers();
        }
    });
}

function loadCollegeAdminProducts() {
    if (!currentCollegeAdmin) return;
    
    const products = getProducts();
    const collegeProducts = products.filter(p => p.college === currentCollegeAdmin.college);
    
    const grid = document.getElementById('college-products-grid');
    const emptyState = document.getElementById('no-college-products');
    
    if (collegeProducts.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort by newest first
    collegeProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    grid.innerHTML = collegeProducts.map(product => `
        <div class="admin-product-card">
            <div class="admin-product-image">
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.name}">`
                    : `<div class="admin-product-image-placeholder"><i class="fas fa-box"></i></div>`
                }
            </div>
            <div class="admin-product-info">
                <h4>${product.name}</h4>
                <p class="admin-product-price">₹${product.price}</p>
                <p class="admin-product-condition"><i class="fas fa-star"></i> ${product.condition}</p>
                <p class="admin-product-seller"><i class="fas fa-user"></i> ${product.sellerName}</p>
                ${product.description ? `<p class="admin-product-desc">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>` : ''}
            </div>
            <div class="admin-product-actions">
                <button class="btn-danger" onclick="collegeAdminDeleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete Product
                </button>
            </div>
        </div>
    `).join('');
}

function collegeAdminDeleteProduct(productId) {
    showConfirmModal('Are you sure you want to delete this product?', () => {
        const products = getProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index > -1) {
            products.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            
            showToast('Product deleted successfully', 'success');
            loadCollegeAdminProducts();
        }
    });
}

function collegeAdminLogout() {
    isCollegeAdminSession = false;
    currentCollegeAdmin = null;
    showToast('Logged out from college admin', 'success');
    showPage('home-page');
}

// ========================================
// Admin Dot Menu Functions
// ========================================

function toggleAdminMenu() {
    const menu = document.getElementById('admin-popup-menu');
    menu.classList.toggle('active');
}

function closeAdminMenu() {
    const menu = document.getElementById('admin-popup-menu');
    menu.classList.remove('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    const menuContainer = document.querySelector('.admin-menu-container');
    const menu = document.getElementById('admin-popup-menu');
    if (menuContainer && !menuContainer.contains(e.target)) {
        closeAdminMenu();
    }
});

// ========================================
// OTP Verification Functions
// ========================================

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// OTP State
let isMobileVerified = false;
let isEmailVerified = false;
let mobileOTPRequested = false;
let emailOTPRequested = false;

// Handle mobile number input - show/hide Send OTP button
function handleMobileInput() {
    const mobile = document.getElementById('reg-mobile').value.trim();
    const sendBtn = document.getElementById('send-mobile-otp-btn');
    
    // Show Send OTP button when mobile has 10 digits
    if (mobile.length === 10 && /^\d+$/.test(mobile)) {
        sendBtn.style.display = 'block';
    } else {
        sendBtn.style.display = 'none';
        // Reset OTP section if mobile number changes
        if (mobileOTPRequested) {
            resetMobileOTP();
        }
    }
}

// Handle email input - show/hide Send OTP button
function handleEmailInput() {
    const email = document.getElementById('reg-email').value.trim();
    const sendBtn = document.getElementById('send-email-otp-btn');
    
    // Show Send OTP button when email is valid
    if (isValidEmail(email)) {
        sendBtn.style.display = 'block';
    } else {
        sendBtn.style.display = 'none';
        // Reset OTP section if email changes
        if (emailOTPRequested) {
            resetEmailOTP();
        }
    }
}

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Send Mobile OTP
async function sendMobileOTP() {
    const mobile = document.getElementById('reg-mobile').value.trim();
    const sendBtn = document.getElementById('send-mobile-otp-btn');
    const btnText = document.getElementById('mobile-otp-btn-text');
    const otpSection = document.getElementById('mobile-otp-section');
    const statusDiv = document.getElementById('mobile-otp-status');
    
    if (mobile.length !== 10) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Show loading state
    sendBtn.disabled = true;
    sendBtn.classList.add('loading');
    btnText.innerHTML = '<span class="spinner"></span> Sending...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/otp/send-mobile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mobile })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show OTP section
            mobileOTPRequested = true;
            otpSection.style.display = 'block';
            statusDiv.className = 'otp-status info';
            statusDiv.innerHTML = '<i class="fas fa-info-circle"></i> OTP sent to your mobile number';
            
            // Start cooldown timer
            startMobileCooldown();
            
            // Show debug OTP in console for testing
            console.log('Mobile OTP:', data.debugOTP);
        } else {
            statusDiv.className = 'otp-status error';
            statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${data.message}`;
        }
    } catch (error) {
        console.error('Error sending mobile OTP:', error);
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Failed to send OTP. Please try again.';
    } finally {
        // Reset button state
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        btnText.innerHTML = 'Resend OTP';
    }
}

// Verify Mobile OTP
async function verifyMobileOTP() {
    const mobile = document.getElementById('reg-mobile').value.trim();
    const otp = document.getElementById('reg-mobile-otp').value.trim();
    const verifyBtn = document.getElementById('verify-mobile-otp-btn');
    const verifyText = document.getElementById('mobile-verify-text');
    const statusDiv = document.getElementById('mobile-otp-status');
    
    if (otp.length !== 6) {
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Please enter a valid 6-digit OTP';
        return;
    }
    
    // Show loading state
    verifyBtn.disabled = true;
    verifyText.innerHTML = '<span class="spinner"></span> Verifying...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/otp/verify-mobile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mobile, otp })
        });
        
        const data = await response.json();
        
        if (data.success) {
            isMobileVerified = true;
            statusDiv.className = 'otp-status success';
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Mobile number verified successfully!';
            
            // Add verified badge
            const mobileGroup = document.getElementById('reg-mobile').closest('.form-group');
            mobileGroup.classList.add('mobile-verified');
            
            // Add verified badge element
            const existingBadge = mobileGroup.querySelector('.verified-badge');
            if (!existingBadge) {
                const badge = document.createElement('div');
                badge.className = 'verified-badge';
                badge.innerHTML = '<i class="fas fa-check-circle"></i> Mobile number verified';
                mobileGroup.appendChild(badge);
            }
            
            // Disable the OTP input
            document.getElementById('reg-mobile-otp').disabled = true;
            verifyBtn.disabled = true;
            verifyBtn.classList.add('verified');
            verifyText.innerHTML = '<i class="fas fa-check"></i> Verified';
            
            showToast('Mobile number verified successfully!', 'success');
        } else {
            statusDiv.className = 'otp-status error';
            statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${data.message}`;
        }
    } catch (error) {
        console.error('Error verifying mobile OTP:', error);
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Failed to verify OTP. Please try again.';
    } finally {
        verifyBtn.disabled = false;
        if (!isMobileVerified) {
            verifyText.innerHTML = 'Verify';
        }
    }
}

// Start Mobile Cooldown Timer
function startMobileCooldown() {
    const resendBtn = document.getElementById('resend-mobile-otp-btn');
    const cooldownSpan = document.getElementById('mobile-cooldown');
    let cooldown = 30;
    
    resendBtn.disabled = true;
    
    const interval = setInterval(() => {
        cooldown--;
        cooldownSpan.textContent = `Resend available in ${cooldown}s`;
        
        if (cooldown <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            cooldownSpan.textContent = '';
        }
    }, 1000);
}

// Reset Mobile OTP
function resetMobileOTP() {
    mobileOTPRequested = false;
    isMobileVerified = false;
    
    const otpSection = document.getElementById('mobile-otp-section');
    const statusDiv = document.getElementById('mobile-otp-status');
    const otpInput = document.getElementById('reg-mobile-otp');
    const verifyBtn = document.getElementById('verify-mobile-otp-btn');
    const verifyText = document.getElementById('mobile-verify-text');
    const mobileGroup = document.getElementById('reg-mobile').closest('.form-group');
    
    otpSection.style.display = 'none';
    statusDiv.innerHTML = '';
    otpInput.value = '';
    otpInput.disabled = false;
    verifyBtn.disabled = false;
    verifyBtn.classList.remove('verified');
    verifyText.innerHTML = 'Verify';
    
    // Remove verified badge
    const badge = mobileGroup.querySelector('.verified-badge');
    if (badge) {
        badge.remove();
    }
    mobileGroup.classList.remove('mobile-verified');
}

// Send Email OTP
async function sendEmailOTP() {
    const email = document.getElementById('reg-email').value.trim();
    const sendBtn = document.getElementById('send-email-otp-btn');
    const btnText = document.getElementById('email-otp-btn-text');
    const otpSection = document.getElementById('email-otp-section');
    const statusDiv = document.getElementById('email-otp-status');
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    sendBtn.disabled = true;
    sendBtn.classList.add('loading');
    btnText.innerHTML = '<span class="spinner"></span> Sending...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/otp/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show OTP section
            emailOTPRequested = true;
            otpSection.style.display = 'block';
            statusDiv.className = 'otp-status info';
            statusDiv.innerHTML = '<i class="fas fa-info-circle"></i> OTP sent to your email address';
            
            // Start cooldown timer
            startEmailCooldown();
            
            // Show debug OTP in console for testing
            console.log('Email OTP:', data.debugOTP);
        } else {
            statusDiv.className = 'otp-status error';
            statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${data.message}`;
        }
    } catch (error) {
        console.error('Error sending email OTP:', error);
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Failed to send OTP. Please try again.';
    } finally {
        // Reset button state
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        btnText.innerHTML = 'Resend OTP';
    }
}

// Verify Email OTP
async function verifyEmailOTP() {
    const email = document.getElementById('reg-email').value.trim();
    const otp = document.getElementById('reg-email-otp').value.trim();
    const verifyBtn = document.getElementById('verify-email-otp-btn');
    const verifyText = document.getElementById('email-verify-text');
    const statusDiv = document.getElementById('email-otp-status');
    
    if (otp.length !== 6) {
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Please enter a valid 6-digit OTP';
        return;
    }
    
    // Show loading state
    verifyBtn.disabled = true;
    verifyText.innerHTML = '<span class="spinner"></span> Verifying...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/otp/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp })
        });
        
        const data = await response.json();
        
        if (data.success) {
            isEmailVerified = true;
            statusDiv.className = 'otp-status success';
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Email verified successfully!';
            
            // Add verified badge
            const emailGroup = document.getElementById('reg-email').closest('.form-group');
            emailGroup.classList.add('email-verified');
            
            // Add verified badge element
            const existingBadge = emailGroup.querySelector('.verified-badge');
            if (!existingBadge) {
                const badge = document.createElement('div');
                badge.className = 'verified-badge';
                badge.innerHTML = '<i class="fas fa-check-circle"></i> Email verified';
                emailGroup.appendChild(badge);
            }
            
            // Disable the OTP input
            document.getElementById('reg-email-otp').disabled = true;
            verifyBtn.disabled = true;
            verifyBtn.classList.add('verified');
            verifyText.innerHTML = '<i class="fas fa-check"></i> Verified';
            
            showToast('Email verified successfully!', 'success');
        } else {
            statusDiv.className = 'otp-status error';
            statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${data.message}`;
        }
    } catch (error) {
        console.error('Error verifying email OTP:', error);
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Failed to verify OTP. Please try again.';
    } finally {
        verifyBtn.disabled = false;
        if (!isEmailVerified) {
            verifyText.innerHTML = 'Verify';
        }
    }
}

// Start Email Cooldown Timer
function startEmailCooldown() {
    const resendBtn = document.getElementById('resend-email-otp-btn');
    const cooldownSpan = document.getElementById('email-cooldown');
    let cooldown = 30;
    
    resendBtn.disabled = true;
    
    const interval = setInterval(() => {
        cooldown--;
        cooldownSpan.textContent = `Resend available in ${cooldown}s`;
        
        if (cooldown <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            cooldownSpan.textContent = '';
        }
    }, 1000);
}

// Reset Email OTP
function resetEmailOTP() {
    emailOTPRequested = false;
    isEmailVerified = false;
    
    const otpSection = document.getElementById('email-otp-section');
    const statusDiv = document.getElementById('email-otp-status');
    const otpInput = document.getElementById('reg-email-otp');
    const verifyBtn = document.getElementById('verify-email-otp-btn');
    const verifyText = document.getElementById('email-verify-text');
    const emailGroup = document.getElementById('reg-email').closest('.form-group');
    
    otpSection.style.display = 'none';
    statusDiv.innerHTML = '';
    otpInput.value = '';
    otpInput.disabled = false;
    verifyBtn.disabled = false;
    verifyBtn.classList.remove('verified');
    verifyText.innerHTML = 'Verify';
    
    // Remove verified badge
    const badge = emailGroup.querySelector('.verified-badge');
    if (badge) {
        badge.remove();
    }
    emailGroup.classList.remove('email-verified');
}

// Check if OTPs are verified before registration
function validateOTPsForRegistration() {
    if (!isMobileVerified) {
        showToast('Please verify your mobile number before completing registration.', 'error');
        return false;
    }
    
    if (!isEmailVerified) {
        showToast('Please verify your email address before completing registration.', 'error');
        return false;
    }
    
    return true;
}

// Override handleRegistration to include OTP validation
const originalHandleRegistration = handleRegistration;
handleRegistration = function(e) {
    e.preventDefault();
    
    // Check OTP verification first
    if (!validateOTPsForRegistration()) {
        return;
    }
    
    // Continue with original registration logic
    const name = document.getElementById('reg-name').value.trim();
    const college = document.getElementById('reg-college').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const roll = document.getElementById('reg-roll').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    
    // Validate ID card upload
    if (!selectedIdCardImage) {
        showToast('Please upload your college ID card to complete registration.', 'error');
        return;
    }
    
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    // Simple password validation - just check minimum length
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    // Get existing users
    const users = getUsers();
    
    // Check if user already exists
    if (users.some(u => u.email === email || u.mobile === mobile)) {
        showToast('User with this email or mobile already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        name,
        college,
        mobile,
        roll,
        email,
        password: encryptPassword(password),
        status: 'pending',
        idCardImage: selectedIdCardImage,
        createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Show success and redirect
    showToast('Registration successful! Please wait for admin verification.', 'success');
    document.getElementById('registration-form').reset();
    
    // Reset ID card preview
    selectedIdCardImage = null;
    const idCardPreview = document.getElementById('id-card-preview');
    if (idCardPreview) {
        idCardPreview.innerHTML = '';
        idCardPreview.classList.remove('has-file');
    }
    
    // Reset OTP states
    isMobileVerified = false;
    isEmailVerified = false;
    mobileOTPRequested = false;
    emailOTPRequested = false;
    
    // Show verification pending page
    setTimeout(() => {
        showPage('verification-pending-page');
    }, 1500);
};

// ========================================
// Edit Profile OTP Verification Functions
// ========================================

let editMobileOTPVerified = false;
let editMobileOTPRequested = false;
let pendingNewMobile = '';

// Handle mobile input in edit profile
function handleEditMobileInput() {
    const mobile = document.getElementById('edit-mobile').value.trim();
    const sendBtn = document.getElementById('edit-send-otp-btn');
    const verifiedBadge = document.getElementById('edit-mobile-verified-badge');
    
    // Only show send button if mobile changed from current and is 10 digits
    if (mobile.length === 10 && /^\d+$/.test(mobile) && mobile !== currentUser.mobile) {
        sendBtn.style.display = 'block';
        verifiedBadge.style.display = 'none';
        editMobileOTPVerified = false;
    } else {
        sendBtn.style.display = 'none';
        // If it's the same as current mobile, show verified badge
        if (mobile === currentUser.mobile) {
            verifiedBadge.style.display = 'inline-flex';
            editMobileOTPVerified = true;
        } else {
            verifiedBadge.style.display = 'none';
        }
    }
}

// Send OTP for mobile change in edit profile
async function sendEditMobileOTP() {
    const mobile = document.getElementById('edit-mobile').value.trim();
    const sendBtn = document.getElementById('edit-send-otp-btn');
    const btnText = document.getElementById('edit-otp-btn-text');
    const otpSection = document.getElementById('edit-mobile-otp-section');
    const statusDiv = document.getElementById('edit-mobile-otp-status');
    
    if (mobile.length !== 10) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Check if mobile already exists
    const users = getUsers();
    if (users.some(u => u.mobile === mobile && u.id !== currentUser.id)) {
        showToast('This mobile number is already registered', 'error');
        return;
    }
    
    pendingNewMobile = mobile;
    
    // Show loading state
    sendBtn.disabled = true;
    sendBtn.classList.add('loading');
    btnText.innerHTML = '<span class="spinner"></span> Sending...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/otp/send-mobile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mobile })
        });
        
        const data = await response.json();
        
        if (data.success) {
            editMobileOTPRequested = true;
            otpSection.style.display = 'block';
            statusDiv.className = 'otp-status info';
            statusDiv.innerHTML = '<i class="fas fa-info-circle"></i> OTP sent to your new mobile number';
            
            startEditMobileCooldown();
            
            console.log('Edit Profile Mobile OTP:', data.debugOTP);
        } else {
            statusDiv.className = 'otp-status error';
            statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${data.message}`;
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Failed to send OTP. Please try again.';
    } finally {
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        btnText.innerHTML = 'Resend OTP';
    }
}

// Verify OTP for mobile change
async function verifyEditMobileOTP() {
    const mobile = pendingNewMobile;
    const otp = document.getElementById('edit-mobile-otp').value.trim();
    const verifyBtn = document.getElementById('edit-verify-otp-btn');
    const verifyText = document.getElementById('edit-verify-text');
    const statusDiv = document.getElementById('edit-mobile-otp-status');
    const verifiedBadge = document.getElementById('edit-mobile-verified-badge');
    
    if (otp.length !== 6) {
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Please enter a valid 6-digit OTP';
        return;
    }
    
    verifyBtn.disabled = true;
    verifyText.innerHTML = '<span class="spinner"></span> Verifying...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/otp/verify-mobile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mobile, otp })
        });
        
        const data = await response.json();
        
        if (data.success) {
            editMobileOTPVerified = true;
            statusDiv.className = 'otp-status success';
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Mobile number verified successfully!';
            
            verifiedBadge.style.display = 'inline-flex';
            document.getElementById('edit-mobile-otp').disabled = true;
            verifyBtn.disabled = true;
            verifyBtn.classList.add('verified');
            verifyText.innerHTML = '<i class="fas fa-check"></i> Verified';
            
            showToast('Mobile number verified!', 'success');
        } else {
            statusDiv.className = 'otp-status error';
            statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${data.message}`;
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        statusDiv.className = 'otp-status error';
        statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Failed to verify OTP. Please try again.';
    } finally {
        verifyBtn.disabled = false;
        if (!editMobileOTPVerified) {
            verifyText.innerHTML = 'Verify';
        }
    }
}

// Cooldown timer for edit profile mobile OTP
function startEditMobileCooldown() {
    const resendBtn = document.getElementById('edit-resend-otp-btn');
    const cooldownSpan = document.getElementById('edit-cooldown');
    let cooldown = 30;
    
    resendBtn.disabled = true;
    
    const interval = setInterval(() => {
        cooldown--;
        cooldownSpan.textContent = `Resend available in ${cooldown}s`;
        
        if (cooldown <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            cooldownSpan.textContent = '';
        }
    }, 1000);
}

// Override showEditProfileModal for new behavior
const originalShowEditProfileModal = showEditProfileModal;
showEditProfileModal = function() {
    if (!currentUser) return;
    
    // Reset edit profile states
    editMobileOTPVerified = false;
    editMobileOTPRequested = false;
    pendingNewMobile = '';
    
    // Pre-fill form with current user data - name is readonly now
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-mobile').value = currentUser.mobile;
    
    // Reset profile image state
    selectedProfileImage = null;
    
    // Update profile image preview
    updateProfileImagePreview();
    
    // Reset OTP section
    document.getElementById('edit-mobile-otp-section').style.display = 'none';
    document.getElementById('edit-mobile-otp-status').innerHTML = '';
    document.getElementById('edit-mobile-otp').value = '';
    document.getElementById('edit-mobile-otp').disabled = false;
    document.getElementById('edit-verify-otp-btn').disabled = false;
    document.getElementById('edit-verify-otp-btn').classList.remove('verified');
    document.getElementById('edit-verify-text').innerHTML = 'Verify';
    document.getElementById('edit-send-otp-btn').style.display = 'none';
    document.getElementById('edit-cooldown').textContent = '';
    
    // Show verified badge for current mobile
    const verifiedBadge = document.getElementById('edit-mobile-verified-badge');
    verifiedBadge.style.display = 'inline-flex';
    editMobileOTPVerified = true;
    
    openModal('edit-profile-modal');
}

// Override handleEditProfile for new behavior
const originalHandleEditProfile = handleEditProfile;
handleEditProfile = function(e) {
    e.preventDefault();
    
    const mobile = document.getElementById('edit-mobile').value.trim();
    
    // Check if mobile was changed and verified
    if (mobile !== currentUser.mobile) {
        if (!editMobileOTPVerified) {
            showToast('Please verify your new mobile number with OTP before saving', 'error');
            return;
        }
    }
    
    // If mobile changed, it must be verified
    if (mobile !== currentUser.mobile && !editMobileOTPVerified) {
        showToast('Mobile number must be verified via OTP', 'error');
        return;
    }
    
    // Update user in localStorage
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        // Only update mobile if it was changed and verified
        if (mobile !== currentUser.mobile && editMobileOTPVerified) {
            users[userIndex].mobile = mobile;
        }
        
        // Update profile image if changed
        if (selectedProfileImage) {
            users[userIndex].profileImage = selectedProfileImage;
        }
        
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Update current user session
        if (mobile !== currentUser.mobile && editMobileOTPVerified) {
            currentUser.mobile = mobile;
        }
        if (selectedProfileImage) {
            currentUser.profileImage = selectedProfileImage;
        }
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        // Also update seller info in products
        let products = getProducts();
        products = products.map(p => {
            if (p.sellerId === currentUser.id) {
                p.sellerPhone = currentUser.mobile;
            }
            return p;
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        
        showToast('Profile updated successfully', 'success');
        closeModal('edit-profile-modal');
        
        // Update UI
        updateProfileUI();
        updateMarketplaceUI();
    }
    
    // Reset states
    editMobileOTPVerified = false;
    editMobileOTPRequested = false;
    selectedProfileImage = null;
};

