# DormX - College Marketplace Platform 🎓

[![Status](https://img.shields.io/badge/status-production-green.svg)](https://github.com/)

## 🚀 Live Demo
- Frontend: [http://localhost:8080](http://localhost:8080) (after `node server.js`)
- Backend API: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 📱 Features
- **Student Registration**: OTP verification via Email & Mobile (SMS simulated)
- **College-Specific Marketplaces**: IIIT Manipur, NIT Manipur, NIELIT Manipur
- **Product Listing**: Add/sell used items with photos, condition, purchase date
- **Admin Dashboard**: Super Admin + College Admin panels
- **Profile Management**: Edit mobile, upload profile photo (face detection)
- **Search & Saved Items**: Product search, wishlist functionality
- **Responsive Design**: Modern UI with gradients, 3D effects, loading screens
- **AI Image Validation**: Face detection for ID cards/profile photos

## 🏗️ Tech Stack
- **Frontend**: HTML5, CSS3 (Poppins font, Font Awesome), Vanilla JavaScript
- **Backend**: Node.js, Express.js, Nodemailer (Email OTP)
- **Validation**: Face-API.js for ID photo verification, Custom image validator
- **Database**: In-memory (production: MongoDB/PostgreSQL)

## 📦 Quick Setup

1. **Clone & Install**
```bash
git clone <your-repo-url>
cd DormX
npm install
```

2. **Configure Email (for OTP)**
Edit `server.js`:
```js
auth: {
    user: 'your-email@gmail.com',     // Your Gmail
    pass: 'your-16-char-app-password' // Gmail App Password (not regular password)
}
```
[Generate Gmail App Password](https://myaccount.google.com/apppasswords)

3. **Run Backend (Port 3000)**
```bash
node server.js
```

4. **Test Frontend**
Open `index.html` or serve on port 8080

## 🏫 Supported Colleges
- Indian Institute of Information Technology Manipur (IIIT_MANIPUR)
- National Institute of Technology Manipur (NIT_MANIPUR)
- National Institute of Electronics & IT Manipur (NIELIT_MANIPUR)

## 📂 Project Structure
```
DormX/
├── index.html          # Main frontend
├── app.js             # Client-side logic
├── styles.css         # Styles & animations
├── server.js          # OTP Backend API
├── imageValidator.js  # Face detection
├── package.json       # Dependencies
├── TODO.md            # Tasks & changelog
└── Book folders/      # Sample images
```

## 🔧 Production Deployment
1. Replace simulated SMS with Twilio/Msg91
2. Add MongoDB/PostgreSQL
3. HTTPS + PM2
4. Environment variables (.env)

## 🤝 Contributing
1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push & PR

## 📄 License
MIT License - See [LICENSE](LICENSE) (add if needed)

## 🙌 Credits
- Built for college hackathons
- Face detection: [@vladmandic/face-api](https://github.com/vladmandic/face-api)
- UI Inspiration: Modern marketplace designs

---

⭐ Star if helpful! Questions? Open an issue.
