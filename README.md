# Zihan Fakir - Professional Portfolio Website (zihan.xyz)

An ultra-modern, high-performance, and fully responsive personal portfolio website for **Zihan Fakir** (`@zihanfakir`) hosted on **[zihan.xyz](https://zihan.xyz)** with seamless **Light & Dark Theme** switching, smooth animations, dynamic typewriter effect, interactive project showcase, and a functional contact form.

- **🌐 Domain**: [https://zihan.xyz](https://zihan.xyz)
- **👤 All Usernames**: `@zihanfakir` (GitHub, Facebook, Instagram, Telegram, LinkedIn, Twitter/X)
- **📧 Email**: `x@zihan.uk` (Backup: `zihanfakir@gmail.com`)
- **📱 Phone & WhatsApp**: `+880 1402-963123` (01402963123)

---

## 🌟 Key Features

- **🌓 Dynamic Light & Dark Mode**:
  - Automatically respects user OS system preference (`prefers-color-scheme`).
  - Allows manual toggling via the navbar sun/moon button.
  - Persists selected theme across browser refreshes using `localStorage`.
- **✨ Hero Section**:
  - Real-time dynamic typing effect highlighting core developer specializations.
  - Call-to-action buttons ("View My Work", "Contact Me", "Get CV").
  - Animated profile avatar with rotating morphing gradient glow.
- **📊 Metric Highlights**:
  - Stats counter bar displaying years of experience, completed projects, clients, and satisfaction rate.
- **💻 Interactive Skills & Tech Stack**:
  - Organized showcase for Frontend, Backend, Databases, Cloud & DevOps.
  - Animated proficiency indicators that trigger smoothly as you scroll into view.
- **🚀 Filterable Project Gallery**:
  - Filter projects by category (`All`, `Full Stack`, `Frontend`, `AI & Productivity`, `Mobile`).
  - Interactive project detail popups (modal dialog) with in-depth descriptions, feature lists, tech badges, and direct links.
- **📜 Experience & Education Timeline**:
  - Chronological vertical timeline layout displaying career trajectory and academic degree.
- **📬 Interactive Contact Section**:
  - Direct contact cards (Email, WhatsApp/Phone, Location, Socials).
  - Working client-side contact form with validation and animated toast feedback notifications.
- **📱 100% Responsive & Accessible**:
  - Handcrafted mobile-first design system.
  - Mobile hamburger drawer menu.
  - Floating back-to-top button.

---

## 📁 Project Structure

```
zihan xyz/
│
├── index.html            # Main semantic HTML5 markup
├── README.md             # Documentation & deployment instructions
│
├── css/
│   └── style.css         # Modern CSS design system, variables, animations
│
├── js/
│   └── main.js           # Theme switcher, typewriter, filters, modal, forms
│
└── assets/
    ├── avatar.svg        # Modern developer avatar illustration
    ├── project-1.svg     # SaaS Dashboard UI mockup
    ├── project-2.svg     # E-Commerce Engine UI mockup
    ├── project-3.svg     # AI Workflow Hub UI mockup
    ├── project-4.svg     # Crypto Tracker UI mockup
    ├── project-5.svg     # DevCollab Code Room mockup
    └── project-6.svg     # HealthSync Mobile App mockup
```

---

## 🚀 How to Run Locally

You have several easy options:

### Option 1: Direct Browser Open (Simplest)
Just double-click `index.html` in file explorer or right-click and open with your preferred browser (Chrome, Edge, Firefox, Brave, Safari).

### Option 2: Using Node.js / npx serve
Open PowerShell or Terminal in this folder:
```powershell
npx serve
```
Then visit `http://localhost:3000`.

### Option 3: Using VS Code Live Server
If you use Visual Studio Code, right-click `index.html` and select **"Open with Live Server"**.

---

## ⚙️ How to Customize

- **Name & Bio**: Open [index.html](file:///e:/zihan%20xyz/index.html) and search for `Zihan Fakir` to modify name, titles, bio, and social media URLs.
- **Projects**: Edit project titles, descriptions, and links in [index.html](file:///e:/zihan%20xyz/index.html) and project details in [js/main.js](file:///e:/zihan%20xyz/js/main.js) under `projectDetailsDatabase`.
- **Colors & Styling**: Open [css/style.css](file:///e:/zihan%20xyz/css/style.css) and customize the `:root` and `[data-theme="light"]` CSS variables (`--primary`, `--bg-body`, `--gradient-primary`, etc.).

---

## 🌐 Free 1-Click Deployment

- **GitHub Pages**: Push this directory to a GitHub repository, go to **Settings > Pages**, and select the `main` branch.
- **Vercel / Netlify**: Drag-and-drop this folder onto [Netlify Drop](https://app.netlify.com/drop) or import from GitHub on Vercel.
