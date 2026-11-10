# Cherrie Lou Cuenca — Portfolio Website

A responsive, interactive portfolio built with **HTML, CSS, and JavaScript** — based on the Canva prototype with custom improvements (custom cursor, typing animation, project filters, scroll reveals, animated skill bars, stat counters, glassmorphism, and more).

## 🚀 Quick Start (VS Code)

1. **Open the folder in VS Code**
   - File → Open Folder → select the `portfolio` folder

2. **Install the Live Server extension** (one-time setup)
   - Click the Extensions icon in the sidebar (or press `Ctrl+Shift+X`)
   - Search for **"Live Server"** by Ritwick Dey
   - Click **Install**

3. **Run the site**
   - Right-click `index.html` in the file explorer
   - Choose **"Open with Live Server"**
   - The site opens in your default browser at `http://127.0.0.1:5500`

That's it — any changes you save will reload automatically.

## 📁 File Structure

```
portfolio/
├── index.html      ← the main page (all sections)
├── style.css       ← all styles + animations + responsive rules
├── script.js       ← interactivity (cursor, filters, form, animations)
├── README.md       ← this file
└── assets/
    ├── profile.png            ← your portrait
    ├── blender-lamp.png       ← project images...
    ├── blender-room.png
    ├── gimp-tux.png
    ├── gimp-portrait.png
    ├── tech-cafe.png
    ├── tech-registration.png
    ├── ui-candy-menu.png
    ├── ui-candy-corner.png
    └── ui-monday.png
```

## ✨ Features

- **Custom cursor** — a dot + ring that smoothly follows the mouse (disabled on touch devices)
- **Typing animation** in the hero — cycles between "Full-Stack Developer", "UI Enthusiast", "Creative Developer", "Visual Storyteller"
- **Smooth scroll** navigation with active-link highlighting
- **Reveal-on-scroll animations** (using `IntersectionObserver`)
- **Animated skill bars** that fill when scrolled into view
- **Stat counters** that count up from 0 when visible
- **Project filter** — All / 3D / Graphics / Code / UI
- **3D tilt effect** on project cards (subtle mouse-follow rotation)
- **Glassmorphism** cards with blur and border highlights
- **Animated decorative elements** — twinkling dots, slow-spinning concentric circles, parallax effect
- **Contact form** with full client-side validation
- **Mobile responsive** with a hamburger menu under 760px
- **Back-to-top button** that appears after scrolling
- **Accessibility:** `prefers-reduced-motion` respected, keyboard-navigable, semantic HTML

## 🎨 Easy customizations

### Change colors
Open `style.css` and look at the `:root` block at the top. All colors are CSS variables:
```css
--bg-deep: #08152e;        /* main background */
--accent:  #7fbef2;        /* light blue accent (dates, eyebrow text) */
--accent-strong: #3b5bdb;  /* button blue */
```

### Change the typing words
In `index.html` find `data-words="..."` on the hero title and edit the comma-separated list.

### Add/remove projects
In `index.html` find the `.project-grid` section. Each project is a `<article class="project-card glass" data-category="...">`. Just copy-paste a block and change the image, text, and `data-category` (must be one of `3d`, `graphics`, `code`, `ui`).

### Hook the contact form to a real backend
Right now the form just validates and shows a success message. To actually send emails:
- Easiest: sign up at **Formspree.io**, get a form endpoint, then in `index.html` change `<form id="contactForm" novalidate>` to `<form id="contactForm" action="https://formspree.io/f/YOUR_ID" method="POST" novalidate>` and remove the `e.preventDefault()` line in `script.js` (or let Formspree handle the redirect).

## 🌐 Hosting (free options)

When you're ready to publish:
- **GitHub Pages** — free, just push the folder to a GitHub repo and enable Pages in Settings
- **Netlify** — drag-and-drop the folder onto netlify.com/drop
- **Vercel** — connect a GitHub repo or upload directly

Enjoy! Feel free to make it your own.
