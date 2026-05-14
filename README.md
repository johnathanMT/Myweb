# 🌐 MTN.Digitosphere - Personal Portfolio Website

![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-2ea44f?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech_Stack-HTML5%20|%20CSS3%20|%20Vanilla_JS-3498db?style=for-the-badge)

A modern, highly interactive personal portfolio website built entirely from scratch without using any heavy frontend frameworks. This project showcases my journey from the healthcare sector to software development, featuring complex JavaScript logic, responsive UI design, and dynamic content rendering.

🔗 **Live Preview:** [Visit My Portfolio](https://johnathanmt.github.io/Myweb/) *(Update this link if needed)*

---

## ✨ Key Technical Features & Implementations

This project is driven by custom vanilla JavaScript logic to ensure high performance and seamless user experience.

### 1. 🌍 Dynamic Multi-Language System (Custom i18n)
Built a fully custom internationalization (i18n) system supporting **6 languages** (English, Myanmar, Japanese, Vietnamese, Nepali, Indonesian).
* **Implementation:** Utilizes a centralized JavaScript dictionary object (`translations`).
* **DOM Manipulation:** Dynamically updates all elements with the `data-i18n` attribute instantly without reloading the page.
* **State Preservation:** Uses browser `localStorage` to save the user's language preference across sessions.

### 2. 🎡 Custom Dial-Controlled Carousel (Seasonal Lens)
Engineered a unique horizontal scrolling gallery inspired by camera dials.
* **Logic:** Synchronized two separate scrolling containers (the image carousel and the dial track).
* **Interactivity:** Implemented native Mouse Drag (Click & Drag) logic by calculating `mousedown`, `mousemove`, and `mouseup` coordinates.
* **Automation:** Features an auto-scroll mechanism using `requestAnimationFrame` for buttery-smooth animations that pause intelligently on user interaction (`mouseenter`).

### 3. 📰 Dynamic Article & Gallery Injection (Modal System)
Developed a reusable modal system for the "Travel Diary" section.
* **Data Handling:** Stores article data and image arrays in a structured JS object (`diaryData`).
* **Dynamic Rendering:** When a user clicks a diary entry, the system automatically fetches the correct localized text and dynamically creates `<img>` elements to inject the photo gallery into the DOM on the fly.
* **UI/UX:** Features a sleek glass-morphism overlay with background scrolling locked (`overflow: hidden`) when the modal is active.

### 4. 🎨 Modern CSS Architecture & UI/UX
* **Bento Grid Layout:** Utilized CSS Grid to create a modern, Apple-style Bento grid for the diary section.
* **Terminal UI Component:** Crafted a mock code-editor interface (`philosophy.py`) using pure CSS and a blinking cursor animation to highlight my passion for coding.
* **Particle Animations:** Integrated `tsParticles` to create a lightweight, subtle snowfall effect in the background.
* **Fully Responsive:** Extensive use of Flexbox, Grid, and Media Queries ensures a flawless experience from desktop to mobile.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3, ES6+ JavaScript (Vanilla)
* **Icons:** FontAwesome 6
* **Animations:** tsParticles (for background effects), Custom CSS Keyframes
* **Deployment:** GitHub Pages

---

## 📂 Project Structure

* `index.html` - Main landing page (Hero, About, Tech Stack, Polymath grid).
* `myweb_PPortfolio.html` - Detailed professional timeline and work experience.
* `myweb_PStudying.html` - Academic journey, current curriculum, and assignments.
* `myweb_python.html` - Showcase of Python automation scripts and tools.
* `myweb.css` - Global stylesheet including variables, layouts, and responsive rules.
* `myweb.js` - Core logic for routing, state management, i18n, and interactive components.

---

## 🚀 How to Run Locally

Since this is a vanilla web project, no build tools or package managers (like npm) are required.

1. Clone the repository:
   ```bash
   git clone [https://github.com/johnathanMT/Myweb.git](https://github.com/johnathanMT/Myweb.git)
