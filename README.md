# 📚 Shri Krishna Digital Library

> **A better place to focus, learn and grow.**

A modern, responsive and student-focused website developed for **Shri Krishna Digital Library, Musaila Chauraha, Deoria**.

The website provides information about the library's facilities, 24×7 availability, study environment and contact information, helping students quickly understand what the library offers.

---

## 🌐 Live Website

🔗 **[Visit Shri Krishna Digital Library](https://amankumarsingh246810.github.io/shri.krishna.digital.library/)**

--- 

## 📌 About the Project

**Shri Krishna Digital Library** is a modern library website designed to provide students with a comfortable and productive place for studying.

The website focuses on a clean, professional and responsive user experience and highlights the facilities available at the library.

Whether students are preparing for competitive examinations, attending online classes or looking for a distraction-free study environment, the website communicates the library's key facilities in a simple and engaging way.

--- 

## ✨ Features

* 📚 **Modern Landing Page**
* 📱 **Responsive Design**
* 📞 **Direct Call to Library Operator**
* 🧭 **Smooth Navigation Between Sections**
* 📱 **Mobile-Friendly Navigation Menu**
* 💡 **Motivational Quotes for Students**
* 🎨 **Modern UI with Custom CSS**
* ⚡ **Fast Development and Production Builds with Vite**

---

## 🏛️ Library Facilities

| Facility                 | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| 📶 Free Wi-Fi            | High-speed internet access for online classes, research and study |
| ❄️ Air Conditioning      | Comfortable and cool study environment                            |
| 📰 Daily Newspapers      | English and Hindi newspapers available daily                      |
| 📖 Competitive Magazines | Study material for competitive examinations                       |
| 💧 RO Water              | Clean and safe drinking water                                     |
| 🕐 24×7 Access           | Library remains open throughout the day                           |

---

## 🛠️ Tech Stack

### Frontend

* **React.js**
* **JavaScript (ES6+)**
* **CSS3**
* **Lucide React**

### Build Tool

* **Vite**

### Deployment

* **GitHub Pages**

The project currently uses React 18.3.1, Vite 5.4.x and Lucide React for its icon system.

---

## 📂 Project Structure

```text
shri.krishna.digital.library/
│
├── src/
│   ├── main.jsx
│   └── styles.css
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

### Important Files

**`src/main.jsx`**

Contains the main React application, including:

* Navigation
* Hero section
* Library facilities
* Motivational sections
* About section
* Contact section
* Footer

The application uses Lucide React icons such as `Wifi`, `AirVent`, `BookOpen`, `Clock3`, `Droplets`, `Newspaper`, `Phone`, `GraduationCap` and others.

**`src/styles.css`**

Contains the complete styling and responsive layout for the website.

**`vite.config.js`**

Contains the Vite configuration used to build the application.

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/amankumarsingh246810/shri.krishna.digital.library.git
```

### 2. Navigate to the project

```bash
cd shri.krishna.digital.library
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the local development URL shown by Vite.

---

## 🏗️ Build for Production

Create an optimized production build using:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🚀 Deployment on GitHub Pages

Install `gh-pages`:

```bash
npm install --save-dev gh-pages
```

Then add the following scripts to `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Because this project is hosted under the repository path:

```text
/shri.krishna.digital.library/
```

configure the Vite base path in `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/shri.krishna.digital.library/',
})
```

Then deploy:

```bash
npm run deploy
```

Your website should be available at:

```text
https://amankumarsingh246810.github.io/shri.krishna.digital.library/
```

---

## 🎯 Project Goals

The main goals of this project are:

* Provide an online presence for Shri Krishna Digital Library
* Clearly communicate library facilities to students
* Encourage students to maintain consistent study habits
* Provide easy access to library contact information
* Create a modern and professional digital experience
* Make the website accessible across desktop, tablet and mobile devices

---

## 💡 Motivation

> **“Dreams don't work unless you do. Give your goals a place, give them your time.”**

The website is designed around the idea that a dedicated study environment can help students stay focused and consistent with their preparation.

---

## 🔮 Future Improvements

Potential future enhancements include:

* 📍 Google Maps integration
* 📝 Online membership registration
* 💳 Online membership/payment system
* 🪑 Seat availability tracking
* 👤 Student login and registration
* 📅 Seat reservation system
* 📢 Notices and announcements
* 📰 Digital newspaper section
* 📚 Online study-material section
* 🌙 Dark mode
* 🌐 Hindi/English language switcher
* 📊 Admin dashboard
* 🔔 Student notifications

---

## 👨‍💻 Developer

Developed by **Aman Kumar Singh**

### GitHub

🔗 https://github.com/amankumarsingh246810

### Repository

🔗 https://github.com/amankumarsingh246810/shri.krishna.digital.library

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

Your support and feedback are appreciated!

---

## 📄 License

This project is intended for educational and demonstration purposes.

© 2026 Shri Krishna Digital Library. All rights reserved. 
