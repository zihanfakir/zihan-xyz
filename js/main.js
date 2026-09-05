/**
 * ZIHAN FAKIR - PROFESSIONAL PORTFOLIO
 * Main Interactive Logic: Theme Switcher, Typing Effect, Filters, Modal, Form & Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // Helper Utilities (Safe Storage & HTML Escaping)
  // ------------------------------------------------------------------------
  function safeGetStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn('Storage read blocked:', err);
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn('Storage write blocked:', err);
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ------------------------------------------------------------------------
  // 1. Light & Dark Theme Controller (Default: System Theme + Manual Persistence)
  // ------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const systemPrefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener: () => {} };
  
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  // Get active theme: check user's saved choice first, otherwise default to System Theme
  function getEffectiveTheme() {
    const savedTheme = safeGetStorage('zihan-portfolio-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to Device / OS System Theme
    return systemPrefersDark.matches ? 'dark' : 'light';
  }

  applyTheme(getEffectiveTheme());

  // Automatically react to system theme changes if user hasn't manually chosen one
  if (systemPrefersDark.addEventListener) {
    systemPrefersDark.addEventListener('change', (e) => {
      const savedTheme = safeGetStorage('zihan-portfolio-theme');
      if (!savedTheme) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Toggle button event: remembers user's manual choice across reloads
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = activeTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      safeSetStorage('zihan-portfolio-theme', newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
    });
  }

  // ------------------------------------------------------------------------
  // 2. Dynamic Typewriter Effect for Hero Section
  // ------------------------------------------------------------------------
  const typedTextEl = document.getElementById('typed-text');
  const roles = [
    'Full Stack Software Developer',
    'Open Source Innovator',
    'GenAI & LLM Solutions Builder',
    'AI-Powered Full Stack Engineer',
    'Prompt Engineer & Problem Solver'
  ];
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeRole() {
    if (!typedTextEl) return;
    
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typedTextEl.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typedTextEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 110;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at full word
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(typeRole, typingSpeed);
  }

  typeRole();

  // ------------------------------------------------------------------------
  // 3. Mobile Navigation Menu Toggle
  // ------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('open')) {
          icon.className = 'fas fa-times';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  }

  // ------------------------------------------------------------------------
  // Clean URL Architecture: Prevent & Strip URL Hashes (#about, #projects)
  // Keeps address bar strictly clean as https://zihan.xyz/
  // ------------------------------------------------------------------------
  function cleanUrlHash() {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  // Remove any existing hash on initial page load
  cleanUrlHash();
  window.addEventListener('hashchange', cleanUrlHash);

  // Global smooth scrolling for all anchor links without hash in the address bar
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href*="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
      return;
    }

    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    const targetId = href.substring(hashIndex);
    if (!targetId || targetId === '#') return;

    try {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Close mobile drawer if open
        if (navMenu && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          const icon = mobileToggle?.querySelector('i');
          if (icon) icon.className = 'fas fa-bars';
        }

        const headerHeight = siteHeader ? siteHeader.offsetHeight : 64;
        const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });

        // Ensure URL stays strictly clean as https://zihan.xyz/
        cleanUrlHash();
      }
    } catch (err) {}
  });

  // ------------------------------------------------------------------------
  // 4. Scroll Header & Active Navigation Highlighting (Throttled via rAF)
  // ------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const siteHeader = document.querySelector('.site-header');
  let scrollTicking = false;
  
  function highlightNavOnScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;

    if (siteHeader) {
      if (scrollY > 15) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const targetNavLink = document.querySelector(`.nav-menu a[href*='${sectionId}']`);

      if (targetNavLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetNavLink.classList.add('active');
        } else {
          targetNavLink.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        highlightNavOnScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ------------------------------------------------------------------------
  // 5. Projects Filter (Zero Race-Condition with WeakMap)
  // ------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const cardAnimationTimeouts = new WeakMap();

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (cardAnimationTimeouts.has(card)) {
          clearTimeout(cardAnimationTimeouts.get(card));
        }

        if (filterValue === 'all' || category === filterValue || (category && category.split(' ').includes(filterValue))) {
          card.style.display = 'flex';
          const tId = setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
          cardAnimationTimeouts.set(card, tId);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          const tId = setTimeout(() => {
            card.style.display = 'none';
          }, 250);
          cardAnimationTimeouts.set(card, tId);
        }
      });
    });
  });

  // ------------------------------------------------------------------------
  // 6. Project Details Modal
  // ------------------------------------------------------------------------
  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContentEl = document.getElementById('modal-details-body');
  const viewDetailBtns = document.querySelectorAll('.view-project-details');

  const projectDetailsDatabase = {
    'proj-1': {
      title: 'আলোকপথ AI — Multi-Model Generative AI Platform',
      category: 'Flagship Generative AI & Full Stack Platform',
      duration: 'Active Production Flagship',
      description: 'Alokpath AI (আলোকপথ AI) is a powerful, production-ready multi-model AI chat platform engineered by Zihan Fakir. Designed with an ultra-secure serverless proxy architecture that prevents client-side API key leakage, it provides access to 11 top-tier frontier models (Gemini, Claude, DeepSeek, GPT-4o, Llama). Features include live token streaming, image & document context parsing, token counters, and a rich Bengali user interface.',
      features: [
        'Access to 11 industry-leading LLMs in one unified workspace (Gemini, Claude, GPT, DeepSeek)',
        'Zero-trust security: all API communications proxied safely without client-side key leakage',
        'Real-time token streaming with smooth dynamic rendering and markdown formatting',
        'Multimodal intelligence: supports image analysis and text/code document extraction',
        'Custom Bengali user interface & prompt engineering tailored for native Bengali interactions',
        'Live production deployment on custom domain: https://ai.zihan.xyz with Cloudflare edge caching'
      ],
      techStack: ['GenAI & LLMs', 'JavaScript (ES6+)', 'Serverless API', 'Cloudflare Edge', 'Markdown / Prism', 'Bengali UI'],
      liveUrl: 'https://ai.zihan.xyz',
      codeUrl: 'https://github.com/zihanfakir/ai.zihan.xyz'
    },
    'proj-2': {
      title: 'Ecomace — Full Stack Modern E-Commerce',
      category: 'Full Stack & E-Commerce',
      duration: 'Active Production',
      description: 'A high-performance modern e-commerce platform built with a decoupled React frontend and Node/Express backend. Features ultra-fast render-as-you-fetch data streaming, responsive catalog browsing, persistent cart synchronization, and production deployment on Vercel.',
      features: [
        'Ultra-fast render-as-you-fetch architecture prefetching critical catalog data',
        'Decoupled React client on Vercel communicating with dedicated backend API services',
        'Dynamic product filtering, responsive catalog layout, and instant search',
        'Persistent multi-item shopping cart state and smooth checkout workflow',
        '170+ commits of continuous engineering, clean code, and performance optimization'
      ],
      techStack: ['React', 'Node.js', 'Express', 'Vite', 'TailwindCSS', 'REST APIs', 'Vercel'],
      liveUrl: 'https://ecomace.vercel.app/',
      codeUrl: 'https://github.com/zihanfakir/Ecomace'
    },
    'proj-3': {
      title: 'Alokpo — Web Search Engine & Indexing API',
      category: 'Search Engine & APIs',
      duration: 'Active Project',
      description: 'A custom web search engine engineered with a decoupled architecture. Features an ultra-responsive frontend search interface, sub-second query latency, indexing algorithms, and a dedicated backend crawler server.',
      features: [
        'Decoupled architecture: standalone frontend client communicating with dedicated crawler & indexing backend API',
        'High-speed search query execution with sub-second response times',
        'Built-in theme switcher (Dark & Light modes) and SEO structured data schemas',
        'Dedicated crawler server repository (alokpo-backend) for crawling and indexing nodes',
        'Live deployment and instant hosting via GitHub Pages'
      ],
      techStack: ['JavaScript', 'Node.js', 'Express', 'Crawler API', 'REST API', 'GitHub Pages'],
      liveUrl: 'https://zihanfakir.github.io/alokpo-search/',
      codeUrl: 'https://github.com/zihanfakir/alokpo-search',
      backendUrl: 'https://github.com/zihanfakir/alokpo-backend'
    },
    'proj-4': {
      title: 'বয়স ক্যালকুলেটর (Age Calculator by Zihan 26.0)',
      category: 'Frontend & Utilities',
      duration: 'Completed Project',
      description: 'A feature-packed, bilingual chronological age calculator and lifetime metrics utility built with pure JavaScript, modern CSS, and semantic HTML. Delivers real-time ticking counters down to the second, next birthday countdowns, and intriguing lifetime statistics.',
      features: [
        'Detailed chronological age computation (Years, Months, Days, Hours, Minutes, Seconds)',
        'Live real-time ticking counter with continuous dynamic clock intervals',
        'Fascinating lifetime health stats (Estimated total heartbeats, breaths, sleeping hours)',
        'Upcoming birthday celebration countdown with exact days and months remaining',
        'Responsive, accessible mobile-friendly UI published and hosted via GitHub Pages'
      ],
      techStack: ['JavaScript', 'HTML5', 'CSS3', 'GitHub Pages', 'Responsive Design'],
      liveUrl: 'https://zihanfakir.github.io/Age-Calculator-by-Zihan-26.0/',
      codeUrl: 'https://github.com/zihanfakir/Age-Calculator-by-Zihan-26.0'
    },
    'proj-5': {
      title: 'DevCollab - Real-Time Code Room',
      category: 'Developer Tools',
      duration: '2.5 Months',
      description: 'A developer-first interactive browser environment supporting live collaborative code editing, syntax highlighting, integrated terminal simulation, and peer audio/video calls.',
      features: [
        'Monaco editor integration with multi-cursor sync',
        'WebRTC peer-to-peer audio and screen sharing',
        'In-browser JavaScript code execution sandbox',
        'One-click room generation with access controls'
      ],
      techStack: ['React', 'Socket.io', 'WebRTC', 'Monaco Editor', 'Node.js', 'TailwindCSS'],
      liveUrl: 'https://zihan.xyz',
      codeUrl: 'https://github.com/zihanfakir/dev-collab'
    },
    'proj-6': {
      title: 'HealthSync Mobile Care App',
      category: 'Mobile / Cross-Platform',
      duration: '3 Months',
      description: 'A holistic healthcare and appointment booking mobile application connecting patients with specialized doctors, managing electronic prescriptions, and tracking vitals.',
      features: [
        'Instant doctor consultation appointment scheduling',
        'Digital prescription storage with PDF export',
        'Daily medication reminder push notifications',
        'Vitals tracking with visual trend charts'
      ],
      techStack: ['React Native', 'Expo', 'Node.js', 'Firebase', 'Redux'],
      liveUrl: 'https://zihan.xyz',
      codeUrl: 'https://github.com/zihanfakir/health-sync'
    }
  };

  let lastFocusedTrigger = null;

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      modalCloseBtn?.focus();
    }, 80);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedTrigger && lastFocusedTrigger.focus) {
      lastFocusedTrigger.focus();
    }
  }

  viewDetailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      lastFocusedTrigger = btn;
      const projId = btn.getAttribute('data-project-id');
      const data = projectDetailsDatabase[projId];

      if (data && modal && modalContentEl) {
        modalContentEl.innerHTML = `
          <div style="margin-bottom: 20px; padding-right: 44px;">
            <span class="section-tag">${data.category}</span>
            <h2 style="font-size: 1.8rem; margin: 8px 0 12px; color: var(--text-main);">${data.title}</h2>
            <p style="color: var(--text-secondary); line-height: 1.7; font-size: 1.05rem;">${data.description}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--text-main);"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 8px;"></i>Key Features:</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
              ${data.features.map(f => `<li style="display: flex; align-items: flex-start; gap: 10px; color: var(--text-secondary); font-size: 0.95rem;"><i class="fas fa-arrow-right" style="color: var(--secondary); margin-top: 5px; font-size: 0.8rem;"></i> ${f}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom: 28px;">
            <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--text-main);"><i class="fas fa-layer-group" style="color: var(--primary); margin-right: 8px;"></i>Technologies:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${data.techStack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              <i class="fas fa-external-link-alt"></i> Live Demo
            </a>
            <a href="${data.codeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <i class="fab fa-github"></i> ${data.backendUrl ? 'Frontend Code' : 'View Source'}
            </a>
            ${data.backendUrl ? `
            <a href="${data.backendUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <i class="fab fa-github"></i> Backend Code
            </a>` : ''}
          </div>
        `;
        openModal();
      }
    });
  });

  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Escape key closes topmost overlay first
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('open')) {
        closeModal();
      } else if (aiChatWindow && aiChatWindow.classList.contains('open')) {
        aiChatWindow.classList.remove('open');
      }
    }
  });

  // ------------------------------------------------------------------------
  // 7. Skill Bars Animation on Scroll
  // ------------------------------------------------------------------------
  // 7. Skill Progress Bars Animation
  // ------------------------------------------------------------------------
  const skillProgressFills = document.querySelectorAll('.skill-progress-fill');
  
  if (window.IntersectionObserver) {
    const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillProgressFills.forEach(fill => {
            const targetWidth = fill.getAttribute('data-percentage') || '85%';
            fill.style.width = targetWidth;
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
      skillsObserver.observe(skillsSection);
    }
  } else {
    // Fallback if IntersectionObserver is not supported
    skillProgressFills.forEach(fill => {
      fill.style.width = fill.getAttribute('data-percentage') || '85%';
    });
  }

  // ------------------------------------------------------------------------
  // 7.1 Interactive Skill Card Details Modal
  // ------------------------------------------------------------------------
  const skillsData = {
    'html': {
      title: 'HTML5 & Semantic Web',
      category: 'Frontend Engineering',
      proficiency: '98%',
      experience: '4+ Years Production Experience',
      icon: 'fab fa-html5',
      iconColor: '#e34f26',
      summary: 'Architecting clean, semantic, accessible (WCAG compliant), and SEO-optimized web structures. Ensuring fast DOM rendering, metadata integrity, and modern HTML5 APIs.',
      highlights: [
        'Semantic HTML5 structure (article, section, nav, main, header, footer)',
        'Accessibility (ARIA roles, screen reader optimization, keyboard navigation)',
        'SEO metadata, OpenGraph tags, and Twitter Cards optimization',
        'Responsive media embedding, canvas, and modern web storage APIs'
      ],
      usedIn: ['Ecomace eCommerce Store', 'Alokpo Search UI', 'Age Calculator 26.0', 'Portfolio Architecture']
    },
    'css': {
      title: 'CSS3, Flexbox & Grid',
      category: 'Frontend & UI Engineering',
      proficiency: '96%',
      experience: '4+ Years Production Experience',
      icon: 'fab fa-css3-alt',
      iconColor: '#1572b6',
      summary: 'Crafting responsive, pixel-perfect, and modern user interfaces with advanced CSS3, CSS custom properties (variables), Flexbox, CSS Grid, keyframe animations, and glassmorphism styling.',
      highlights: [
        'Complex 2D/3D layouts using CSS Grid and Flexbox',
        'Light & Dark mode themes via CSS Variables and data attributes',
        'Hardware-accelerated animations, transitions, and micro-interactions',
        'Cross-browser compatibility and mobile-first responsive media queries'
      ],
      usedIn: ['Ecomace UI Design', 'Age Calculator 26.0 Interactive Layout', 'Custom Portfolio Glassmorphism']
    },
    'js': {
      title: 'JavaScript (ES6+ & Modern Web APIs)',
      category: 'Core Programming Language',
      proficiency: '95%',
      experience: '4+ Years Production Experience',
      icon: 'fab fa-js-square',
      iconColor: '#f7df1e',
      summary: 'Deep expertise in vanilla modern JavaScript (ES6 through ES2026), asynchronous programming (Promises, async/await), DOM manipulation, Fetch/XHR, Web Workers, and state management.',
      highlights: [
        'Advanced ES6+ syntax (Destructuring, Spread, Modules, Arrow functions)',
        'Event loop, closures, prototypical inheritance, and asynchronous flows',
        'Client-side state persistence via localStorage and sessionStorage',
        'High-performance DOM manipulation with IntersectionObserver'
      ],
      usedIn: ['Age Calculator 26.0 (Ticking chrono-engine)', 'Alokpo Frontend Search Engine', 'Interactive Portfolio Engine']
    },
    'react': {
      title: 'React & Next.js Ecosystem',
      category: 'Frontend Framework & Architecture',
      proficiency: '95%',
      experience: '3+ Years Production Experience',
      icon: 'fab fa-react',
      iconColor: '#06b6d4',
      summary: 'Building high-performance, single-page and server-rendered web applications using React and Next.js. Designing reusable component architectures with custom hooks, state management, and optimized render cycles.',
      highlights: [
        'Server-Side Rendering (SSR), Static Site Generation (SSG), and Server Components',
        'Render-as-you-fetch data streaming and Suspense boundaries',
        'Custom React hooks, Context API, and state libraries (Redux Toolkit, Zustand)',
        'Next.js App Router, dynamic API routes, and incremental revalidation'
      ],
      usedIn: ['Ecomace Production eCommerce Platform (170+ commits on Vercel)', 'Modern Cloud Dashboard UIs']
    },
    'genai': {
      title: 'GenAI & LLMs (Gemini, Claude, OpenAI, DeepSeek)',
      category: 'Artificial Intelligence & Smart Automation',
      proficiency: '99%',
      experience: 'Specialized 10x AI Speed Superpower',
      icon: 'fas fa-brain',
      iconColor: '#a855f7',
      summary: 'Unlocking 10x engineering speed by integrating cutting-edge LLMs, building autonomous coding workflows, and deploying intelligent AI assistants into production software with prompt engineering and structured API schemas.',
      highlights: [
        '10x development velocity using AI coding agents and automated refactoring',
        'Google Gemini (3.6 Flash / 2.5 Pro) API integration with custom system instructions',
        'Prompt Engineering: Few-shot prompting, chain-of-thought, deterministic JSON outputs',
        'Multi-model orchestration across Anthropic Claude, OpenAI GPT-4o, and DeepSeek'
      ],
      usedIn: ['Live Portfolio AI Assistant (Gemini 3.6 Flash)', 'Autonomous Dev Workflows', 'Smart Code Generation']
    },
    'typescript': {
      title: 'TypeScript',
      category: 'Type-Safe Programming',
      proficiency: '92%',
      experience: '3+ Years Experience',
      icon: 'fas fa-code',
      iconColor: '#3178c6',
      summary: 'Writing scalable, enterprise-grade, bug-resistant code with TypeScript. Utilizing strict typing, generics, interfaces, union types, and utility types across both frontend and backend systems.',
      highlights: [
        'Strict type checking, type inference, and custom generic utilities',
        'Interface and type definitions for complex API schemas and state models',
        'Seamless integration with React, Next.js, Express, and Prisma',
        'Eliminating runtime null/undefined crashes during compilation'
      ],
      usedIn: ['Large-scale full stack web applications', 'API contracts and data layers']
    },
    'node': {
      title: 'Node.js & Express',
      category: 'Backend & Server Architecture',
      proficiency: '90%',
      experience: '3+ Years Production Experience',
      icon: 'fab fa-node-js',
      iconColor: '#10b981',
      summary: 'Developing scalable, non-blocking, asynchronous RESTful APIs and backend microservices using Node.js and Express. Managing authentication, middleware pipelines, and third-party integrations.',
      highlights: [
        'RESTful API design, routing, and modular controller architecture',
        'Authentication & authorization via JWT, bcrypt, and secure sessions',
        'Event-driven asynchronous I/O and stream processing',
        'Rate limiting, CORS security, input validation, and centralized error handling'
      ],
      usedIn: ['Alokpo Backend Crawler & Indexer', 'Ecomace Backend Server', 'Microservices API']
    },
    'python': {
      title: 'Python & FastAPI',
      category: 'Backend & Machine Learning Services',
      proficiency: '86%',
      experience: '2+ Years Experience',
      icon: 'fab fa-python',
      iconColor: '#3b82f6',
      summary: 'Developing blazing-fast asynchronous backend APIs using FastAPI and Python. Implementing data processing scripts, automated web scrapers, and AI tool integrations.',
      highlights: [
        'FastAPI async routes, Pydantic data validation, and automated Swagger documentation',
        'Python web scraping, data cleaning, and automated tasks',
        'AI/ML integration pipelines and LLM wrapper endpoints',
        'Clean, PEP 8 compliant, modular Python code'
      ],
      usedIn: ['Web crawler services', 'Data pipelines & automation scripts']
    },
    'postgres': {
      title: 'PostgreSQL & Prisma ORM',
      category: 'Relational Database Engineering',
      proficiency: '88%',
      experience: '3+ Years Experience',
      icon: 'fas fa-database',
      iconColor: '#0284c7',
      summary: 'Designing resilient relational database schemas, complex SQL queries, index optimization, and data migrations using PostgreSQL and modern ORMs like Prisma.',
      highlights: [
        'Relational schema design (1:1, 1:N, N:M) with foreign key constraints',
        'Prisma ORM schema modeling, type-safe queries, and automated migrations',
        'Query optimization, indexing strategies, and ACID transaction safety',
        'Connection pooling and cloud database deployment (Supabase, Neon, AWS RDS)'
      ],
      usedIn: ['Ecomace product & user relational storage', 'Production transactional backends']
    },
    'mongo': {
      title: 'MongoDB & Redis',
      category: 'NoSQL & High-Speed In-Memory Cache',
      proficiency: '85%',
      experience: '3+ Years Experience',
      icon: 'fas fa-leaf',
      iconColor: '#10b981',
      summary: 'Leveraging MongoDB for flexible, document-based NoSQL storage and Redis for sub-millisecond in-memory caching, session management, and rate limiting.',
      highlights: [
        'MongoDB document design, schema validation, and aggregation pipelines',
        'Redis caching strategies (Cache-Aside, Write-Through, TTL expiration)',
        'Distributed session storage and API rate limiting via Redis keys',
        'High-throughput data storage for search indexing and crawler payloads'
      ],
      usedIn: ['Alokpo Search Index storage', 'Session & fast memory caching']
    },
    'tailwind': {
      title: 'Tailwind CSS & Modern UI/UX',
      category: 'Design Systems & Utility Styling',
      proficiency: '96%',
      experience: '3+ Years Experience',
      icon: 'fab fa-css3-alt',
      iconColor: '#06b6d4',
      summary: 'Creating high-velocity, consistent, responsive design systems using Tailwind CSS. Translating Figma mockups into interactive, accessible, and polished user interfaces in record time.',
      highlights: [
        'Utility-first styling with zero CSS bloat and purge optimization',
        'Custom Tailwind design tokens, typography scales, and color palettes',
        'Responsive breakpoints, dark mode variants, and pseudo-class states',
        'Component UI libraries integration (Shadcn/UI, Radix, TailwindUI)'
      ],
      usedIn: ['Ecomace Modern Storefront', 'Portfolio Design System', 'Landing Pages']
    },
    'docker': {
      title: 'Docker & Cloud DevOps',
      category: 'Containerization & Deployment',
      proficiency: '82%',
      experience: '2+ Years Experience',
      icon: 'fab fa-docker',
      iconColor: '#2563eb',
      summary: 'Containerizing full-stack web applications for predictable, reproducible environments from local development to cloud production. Setting up automated CI/CD deployment pipelines.',
      highlights: [
        'Multi-stage Dockerfile builds for minimal, secure production container images',
        'Docker Compose for multi-container development (Frontend, Backend, DB, Redis)',
        'Automated CI/CD pipelines via GitHub Actions',
        'Cloud deployments on Vercel, Render, Railway, and AWS EC2'
      ],
      usedIn: ['Ecomace deployment workflows', 'Containerized development microservices']
    }
  };

  const skillCards = document.querySelectorAll('.skill-card');
  skillCards.forEach(card => {
    function triggerSkillModal() {
      lastFocusedTrigger = card;
      const skillId = card.getAttribute('data-skill-id');
      const data = skillsData[skillId];
      if (data && modal && modalContentEl) {
        modalContentEl.innerHTML = `
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-right: 44px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(139, 92, 246, 0.12); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: ${data.iconColor}; flex-shrink: 0;">
              <i class="${data.icon}"></i>
            </div>
            <div>
              <span class="section-tag" style="margin-bottom: 4px; display: inline-block;">${data.category}</span>
              <h2 style="font-size: 1.6rem; margin: 4px 0 2px; color: var(--text-main);">${data.title}</h2>
              <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${data.iconColor}; margin-right: 6px;"></span>
                Proficiency: ${data.proficiency} • ${data.experience}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="color: var(--text-secondary); line-height: 1.7; font-size: 1.05rem;">${data.summary}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--text-main);">
              <i class="fas fa-check-circle" style="color: var(--primary); margin-right: 8px;"></i>Core Competencies & Capabilities:
            </h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
              ${data.highlights.map(h => `<li style="display: flex; align-items: flex-start; gap: 10px; color: var(--text-secondary); font-size: 0.95rem;"><i class="fas fa-arrow-right" style="color: var(--secondary); margin-top: 5px; font-size: 0.8rem;"></i> ${h}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--text-main);">
              <i class="fas fa-laptop-code" style="color: var(--primary); margin-right: 8px;"></i>Applied In Real Projects:
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${data.usedIn.map(u => `<span class="tech-tag" style="background: rgba(99, 102, 241, 0.12); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.25);">${u}</span>`).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-top: 24px;">
            <a href="#projects" class="btn btn-primary btn-sm modal-action-btn">
              <i class="fas fa-folder-open"></i> View Projects
            </a>
            <a href="#contact" class="btn btn-secondary btn-sm modal-action-btn">
              <i class="fas fa-paper-plane"></i> Discuss This Tech
            </a>
          </div>
        `;

        modalContentEl.querySelectorAll('.modal-action-btn').forEach(actionBtn => {
          actionBtn.addEventListener('click', closeModal);
        });

        openModal();
      }
    }

    card.addEventListener('click', triggerSkillModal);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerSkillModal();
      }
    });
  });

  // ------------------------------------------------------------------------
  // 8. Contact Form Handling: Direct Email (mailto) & WhatsApp Integration
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const whatsappBtn = document.getElementById('contact-whatsapp-btn');

  function getFormData() {
    const name = document.getElementById('form-name')?.value.trim() || '';
    const email = document.getElementById('form-email')?.value.trim() || '';
    const subject = document.getElementById('form-subject')?.value.trim() || '';
    const message = document.getElementById('form-message')?.value.trim() || '';
    return { name, email, subject, message };
  }

  // Handle Send via Email (mailto to x@zihan.uk)
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const { name, email, subject, message } = getFormData();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.', 'error');
        return;
      }

      const emailSubject = encodeURIComponent(subject ? `[Portfolio Inquiry] ${subject}` : `[Portfolio Inquiry] Message from ${name}`);
      const emailBody = encodeURIComponent(
        `Hi Zihan,\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Subject: ${subject || 'General Inquiry'}\n\n` +
        `Message:\n${message}\n\n` +
        `---\nSent from zihan.xyz portfolio`
      );

      const mailtoUrl = `mailto:x@zihan.uk?subject=${emailSubject}&body=${emailBody}`;

      showToast(`Opening your email app to send to x@zihan.uk...`, 'info');
      
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 400);
    });
  }

  // Handle Send via WhatsApp (+880 1402-963123)
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const { name, email, subject, message } = getFormData();

      if (!name || !message) {
        showToast('Please enter at least your Name and Message to chat on WhatsApp.', 'error');
        return;
      }

      const waText = encodeURIComponent(
        `Hi Zihan,\n\n` +
        `*Name:* ${name}\n` +
        (email ? `*Email:* ${email}\n` : '') +
        (subject ? `*Subject:* ${subject}\n` : '') +
        `\n*Message:*\n${message}`
      );

      const waUrl = `https://wa.me/8801402963123?text=${waText}`;

      showToast(`Opening WhatsApp chat with +880 1402-963123...`, 'success');
      
      window.open(waUrl, '_blank');
    });
  }

  // ------------------------------------------------------------------------
  // 9. Floating Back-to-Top Button
  // ------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 350) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ------------------------------------------------------------------------
  // 10. Toast Notification System (XSS-Safe & Debounced)
  // ------------------------------------------------------------------------
  let lastToastTime = 0;
  function showToast(message, type = 'info') {
    const now = Date.now();
    if (now - lastToastTime < 500) return;
    lastToastTime = now;

    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-triangle';

    const iconEl = document.createElement('i');
    iconEl.className = `fas ${iconClass}`;
    iconEl.setAttribute('aria-hidden', 'true');

    const spanEl = document.createElement('span');
    spanEl.textContent = message;

    toast.appendChild(iconEl);
    toast.appendChild(spanEl);
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  // ------------------------------------------------------------------------
  // 11. Interactive AI Portfolio Assistant
  // ------------------------------------------------------------------------
  const aiChatBtn = document.getElementById('ai-chat-btn');
  const aiChatWindow = document.getElementById('ai-chat-window');
  const aiChatClose = document.getElementById('ai-chat-close');
  const aiChatForm = document.getElementById('ai-chat-form');
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiChatMessages = document.getElementById('ai-chat-messages');
  const aiChips = document.querySelectorAll('.ai-chip');

  if (aiChatBtn && aiChatWindow) {
    let lastActionTime = 0;

    function openAIChat() {
      aiChatWindow.classList.add('open');
      aiChatBtn.setAttribute('aria-expanded', 'true');
      setTimeout(() => aiChatInput?.focus(), 150);
    }

    function closeAIChat() {
      aiChatWindow.classList.remove('open');
      aiChatBtn.setAttribute('aria-expanded', 'false');
    }

    function toggleAIChat(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const now = Date.now();
      if (now - lastActionTime < 350) return;
      lastActionTime = now;

      if (aiChatWindow.classList.contains('open')) {
        closeAIChat();
      } else {
        openAIChat();
      }
    }

    // Expose globally for inline onclick fallback
    window.toggleAIChatGlobal = toggleAIChat;

    aiChatBtn.addEventListener('click', toggleAIChat);
    aiChatBtn.addEventListener('touchend', toggleAIChat, { passive: false });

    aiChatClose?.addEventListener('click', (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeAIChat();
    });

    aiChatClose?.addEventListener('touchend', (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeAIChat();
    }, { passive: false });

    aiChatWindow.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    aiChatWindow.addEventListener('touchend', (e) => {
      e.stopPropagation();
    }, { passive: true });

    document.addEventListener('click', (e) => {
      if (Date.now() - lastActionTime < 350) return;
      if (aiChatWindow.classList.contains('open') &&
          !aiChatWindow.contains(e.target) &&
          !aiChatBtn.contains(e.target)) {
        closeAIChat();
      }
    });

    function appendMessage(text, sender = 'bot', isHTML = false) {
      if (!aiChatMessages) return;
      const msgDiv = document.createElement('div');
      msgDiv.className = `ai-msg ai-msg-${sender}`;
      if (isHTML) {
        msgDiv.innerHTML = text;
      } else {
        msgDiv.textContent = text;
      }
      aiChatMessages.appendChild(msgDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    const GEMINI_API_KEY = window.GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
    const GEMINI_API_URL = GEMINI_API_KEY
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
      : '';

    const AI_SYSTEM_INSTRUCTION = `You are the official Portfolio AI Assistant on Zihan Fakir's website (zihan.xyz).
Your goal is to represent Zihan Fakir with high intelligence, professionalism, and warmth, answering questions from recruiters, clients, and developers.

Profile of Zihan Fakir:
- Full Name: Zihan Fakir
- Official Domain: https://zihan.xyz
- Primary Email: x@zihan.uk (Backup: zihanfakir@gmail.com)
- Phone & WhatsApp: +880 1402-963123 (01402963123)
- Universal Social Username: @zihanfakir across all networks (GitHub: https://github.com/zihanfakir , Facebook: https://facebook.com/zihanfakir , Instagram: https://instagram.com/zihanfakir , Telegram: https://t.me/zihanfakir , LinkedIn: https://linkedin.com/in/zihanfakir , Twitter/X: https://x.com/zihanfakir)
- Core Superpower: Builds and ships production-grade software 10x faster than traditional developers using advanced AI workflows, prompt engineering, and autonomous coding agents without compromising code architecture or security.
- Technical Skills: GenAI & LLMs (Gemini, Claude, OpenAI, DeepSeek - 99%), HTML5 (98%), CSS3 (96%), JavaScript ES6+ (95%), React & Next.js (95%), TypeScript (92%), Node.js & Express (90%), Python & FastAPI (86%), PostgreSQL & Prisma (88%), MongoDB & Redis (85%), Tailwind CSS (96%), Docker (82%).
- Real Production Projects:
  1. Alokpath AI (আলোকপথ AI): Zihan's flagship multi-model generative AI platform powered by 11 frontier models (Gemini, Claude, GPT-4o, DeepSeek, Llama). Features zero client-side API key exposure (100% secure serverless proxy), real-time token streaming, multimodal document/image analysis, and full Bengali UI. (Live: https://ai.zihan.xyz | Code: https://github.com/zihanfakir/ai.zihan.xyz)
  2. Ecomace: Modern full-stack eCommerce engine with decoupled React client and Node/Express backend. Features render-as-you-fetch data streaming, persistent multi-item cart, 170+ commits, deployed on Vercel. (Live: https://ecomace.vercel.app/ | Code: https://github.com/zihanfakir/Ecomace)
  3. Alokpo: Custom web search engine & crawler backend. Modern search UI communicating with crawler indexing APIs. (Live: https://zihanfakir.github.io/alokpo-search/ | Frontend: https://github.com/zihanfakir/alokpo-search | Backend: https://github.com/zihanfakir/alokpo-backend)
  4. বয়স ক্যালকুলেটর (Age Calculator 26.0): Real-time ticking chronological age calculator with lifetime stats (heartbeats, breaths, next birthday countdown). (Live: https://zihanfakir.github.io/Age-Calculator-by-Zihan-26.0/ | Code: https://github.com/zihanfakir/Age-Calculator-by-Zihan-26.0)
- Curriculum Vitae (CV / Resume): Available for download at "Zihan Fakir CV.pdf". Covers Zihan's Full Stack (MERN), Android (Kotlin), AI development, application security auditing, and top projects.

Guidelines:
- If the visitor speaks Bengali (Bangla), reply in polite and friendly Bengali. If they speak English, reply in English.
- Keep answers concise, clear, and engaging (1 to 3 short paragraphs or bullet points).
- Do NOT use raw emojis in your responses. Always use clean professional text formatting.
- Format text nicely with HTML tags like <strong>, <br>, or clickable links <a href="..." target="_blank">.`;

    function formatMarkdown(text) {
      if (!text) return '';
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return escaped
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/(https?:\/\/[^\s<]+[^\s<.,!?:;()])/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">$1</a>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    }

    function generateLocalAIResponse(query) {
      const q = query.toLowerCase().trim();

      if (q.includes('alokpath') || q.includes('আলোকপথ') || q.includes('chatbot') || q.includes('chat bot') || q.includes('ai bot') || q.includes('ai.zihan.xyz')) {
        return `<i class="fas fa-brain" style="color:var(--primary);margin-right:6px;"></i> <strong>About আলোকপথ AI (Alokpath AI):</strong><br>
        Zihan Fakir's flagship generative AI chat platform powered by <strong>11 frontier AI models</strong> (Gemini, Claude, GPT-4o, DeepSeek, Llama). Features zero client-side API key exposure (100% secure serverless proxy), real-time token streaming, multimodal image and file recognition, and an intuitive Bengali user interface.<br>
        <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> <a href="https://ai.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">Try Live at ai.zihan.xyz</a> • <i class="fab fa-github" style="margin-right:4px;"></i> <a href="https://github.com/zihanfakir/ai.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">GitHub Repository</a>`;
      }

      if (q.includes('cv') || q.includes('resume') || q.includes('curriculum') || q.includes('bio') || q.includes('pdf')) {
        return `<i class="fas fa-file-pdf" style="color:#ef4444;margin-right:6px;"></i> <strong>Zihan Fakir's Curriculum Vitae:</strong><br>
        Zihan's official CV details his full-stack engineering skills, MERN stack, Android (Kotlin), AI development, and production software portfolio.<br><br>
        <i class="fas fa-download" style="color:var(--primary);margin-right:4px;"></i> <a href="Zihan%20Fakir%20CV.pdf" target="_blank" rel="noopener noreferrer" download="Zihan Fakir CV.pdf" style="color:var(--primary);font-weight:700;text-decoration:underline;">Download Zihan Fakir CV (PDF)</a>`;
      }

      if (q.includes('fast') || q.includes('speed') || q.includes('quick') || q.includes('druto') || q.includes('time') || q.includes('delivery')) {
        return `<i class="fas fa-bolt" style="color:var(--accent-amber);margin-right:6px;"></i> <strong>10x AI Delivery Superpower:</strong><br>
        Zihan builds and ships production-ready applications <strong>up to 10x faster than traditional developers</strong>!<br>
        • <strong>How?</strong> By mastering advanced generative AI workflows, prompt engineering, and autonomous coding agents.<br>
        • <strong>Quality:</strong> Strict maintainability, clean modular architecture, and zero technical debt.<br>
        • <strong>Result:</strong> Extreme velocity from wireframe concept to live production!`;
      }

      if (q.includes('ai') || q.includes('llm') || q.includes('prompt') || q.includes('agent') || q.includes('gpt') || q.includes('gemini') || q.includes('claude') || q.includes('deepseek')) {
        return `<i class="fas fa-brain" style="color:var(--primary);margin-right:6px;"></i> <strong>Zihan's AI Engineering Capabilities:</strong><br>
        • <strong>Alokpath AI (আলোকপথ AI):</strong> Multi-model flagship chat platform with 11 LLMs at <a href="https://ai.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--primary);font-weight:700;">ai.zihan.xyz</a>.<br>
        • <strong>GenAI & LLMs:</strong> 99% proficiency working with Google Gemini, Anthropic Claude, OpenAI, and DeepSeek.<br>
        • <strong>Prompt Engineering:</strong> Expert in crafting structured system instructions, few-shot prompting, and deterministic JSON schemas.<br>
        • <strong>Autonomous Agents:</strong> Designing tool-calling agents and automated reasoning workflows.<br>
        • <strong>10x AI-Powered Dev:</strong> Accelerating delivery speed using modern AI developer tooling while maintaining rigorous code quality.`;
      }

      if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('banano')) {
        return `<i class="fas fa-layer-group" style="color:var(--secondary);margin-right:6px;"></i> <strong>Zihan's Top Real Projects:</strong><br>
        1. <a href="https://ai.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--primary);font-weight:700;">আলোকপথ AI (Alokpath AI)</a>: Flagship multi-model AI platform powered by 11 LLMs with Bengali UI.<br>
        2. <a href="https://ecomace.vercel.app/" target="_blank" rel="noopener noreferrer" style="color:var(--primary);font-weight:700;">Ecomace</a>: High-performance eCommerce engine with render-as-you-fetch data streaming.<br>
        3. <a href="https://zihanfakir.github.io/alokpo-search/" target="_blank" rel="noopener noreferrer" style="color:var(--primary);font-weight:700;">Alokpo</a>: Decoupled web search engine & crawler backend.<br>
        4. <a href="https://zihanfakir.github.io/Age-Calculator-by-Zihan-26.0/" target="_blank" rel="noopener noreferrer" style="color:var(--primary);font-weight:700;">বয়স ক্যালকুলেটর (v26.0)</a>: Real-time ticking chronological age calculator with lifetime stats!`;
      }

      if (q.includes('ecomace') || q.includes('ecommerce') || q.includes('shop') || q.includes('store')) {
        return `<i class="fas fa-shopping-bag" style="color:var(--primary);margin-right:6px;"></i> <strong>About Ecomace:</strong><br>
        A decoupled modern eCommerce platform built with React, Node.js, Express, and Vite. Deployed on Vercel with 170+ commits, featuring render-as-you-fetch streaming, persistent multi-item cart, and product search.<br>
        <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> <a href="https://ecomace.vercel.app/" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">Live Demo</a> • <i class="fab fa-github" style="margin-right:4px;"></i> <a href="https://github.com/zihanfakir/Ecomace" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">GitHub Source</a>`;
      }

      if (q.includes('alokpo') || q.includes('search')) {
        return `<i class="fas fa-search" style="color:var(--secondary);margin-right:6px;"></i> <strong>About Alokpo Search Engine:</strong><br>
        A custom search engine with a modern frontend interface and a dedicated backend web crawler API for rapid index queries.<br>
        <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> <a href="https://zihanfakir.github.io/alokpo-search/" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">Live Search</a> • <i class="fab fa-github" style="margin-right:4px;"></i> <a href="https://github.com/zihanfakir/alokpo-search" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">Frontend Repo</a> • <i class="fab fa-github" style="margin-right:4px;"></i> <a href="https://github.com/zihanfakir/alokpo-backend" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">Backend Repo</a>`;
      }

      if (q.includes('age') || q.includes('calculator') || q.includes('boyos') || q.includes('বয়স')) {
        return `<i class="fas fa-calculator" style="color:var(--accent-pink);margin-right:6px;"></i> <strong>About বয়স ক্যালকুলেটর (v26.0):</strong><br>
        Interactive chronological age calculator with real-time ticking second counter, next birthday countdown, and fun lifetime health stats (estimated total heartbeats and breaths).<br>
        <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> <a href="https://zihanfakir.github.io/Age-Calculator-by-Zihan-26.0/" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">Try Live Calculator</a>`;
      }

      if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('hire') || q.includes('whatsapp') || q.includes('reach')) {
        return `<i class="fas fa-envelope-open-text" style="color:var(--accent-emerald);margin-right:6px;"></i> <strong>Contact Zihan Fakir:</strong><br>
        • <strong>Email:</strong> <a href="mailto:x@zihan.uk" style="color:var(--primary);">x@zihan.uk</a><br>
        • <strong>Phone & WhatsApp:</strong> <a href="tel:+8801402963123" style="color:var(--primary);">+880 1402-963123</a><br>
        • <strong>Domain:</strong> <a href="https://zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);">zihan.xyz</a><br>
        • <strong>All Usernames:</strong> <strong style="color:var(--text-main);">@zihanfakir</strong> (GitHub, Facebook, Instagram, Telegram, LinkedIn, X)`;
      }

      if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('language')) {
        return `<i class="fas fa-code" style="color:var(--primary);margin-right:6px;"></i> <strong>Zihan's Tech Stack:</strong><br>
        • <strong>Frontend:</strong> React, Next.js, TypeScript, JavaScript, HTML5/CSS3, Tailwind CSS<br>
        • <strong>Backend & APIs:</strong> Node.js, Express, Python, FastAPI, REST APIs<br>
        • <strong>AI & LLMs:</strong> Gemini, Claude, OpenAI, DeepSeek (99%), Prompt Engineering, Agents<br>
        • <strong>Database & DevOps:</strong> PostgreSQL, MongoDB, Redis, Docker, Vercel, Git`;
      }

      return `Thanks for asking! Zihan Fakir is a Full Stack Engineer & AI Builder. You can check out his projects (<a href="https://ecomace.vercel.app/" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">Ecomace</a>, <a href="https://zihanfakir.github.io/alokpo-search/" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">Alokpo</a>), his 10x AI speed, or contact him directly via <a href="mailto:x@zihan.uk" style="color:var(--primary);">x@zihan.uk</a> or WhatsApp (<a href="https://wa.me/8801402963123" target="_blank" rel="noopener noreferrer" style="color:var(--accent-emerald);">+880 1402-963123</a>).`;
    }

    let isAIResponding = false;

    async function handleUserQuery(query) {
      if (!query || !query.trim() || isAIResponding) return;
      if (!aiChatMessages) return;

      isAIResponding = true;
      appendMessage(query, 'user', false);

      // Show animated typing indicator
      const indicator = document.createElement('div');
      indicator.className = 'ai-msg ai-msg-bot typing-indicator';
      indicator.innerHTML = '<span></span><span></span><span></span>';
      aiChatMessages.appendChild(indicator);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

      try {
        if (!GEMINI_API_KEY || !GEMINI_API_URL) {
          await new Promise(resolve => setTimeout(resolve, 350));
          indicator.remove();
          const localReply = generateLocalAIResponse(query);
          appendMessage(localReply, 'bot', true);
          isAIResponding = false;
          return;
        }

        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: AI_SYSTEM_INSTRUCTION }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: query }]
              }
            ]
          })
        });

        indicator.remove();

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0];
          const textPart = candidate?.content?.parts?.find(p => p.text && !p.thought);
          const rawText = textPart?.text || candidate?.content?.parts?.[0]?.text;

          if (rawText) {
            appendMessage(formatMarkdown(rawText), 'bot', true);
            isAIResponding = false;
            return;
          }
        }

        // Fallback to local intelligent response if API response format is unexpected
        const localReply = generateLocalAIResponse(query);
        appendMessage(localReply, 'bot', true);
      } catch (err) {
        console.warn('Gemini API fetch error, using local fallback:', err);
        indicator.remove();
        const fallbackReply = generateLocalAIResponse(query);
        appendMessage(fallbackReply, 'bot', true);
      } finally {
        isAIResponding = false;
      }
    }

    aiChatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!aiChatInput) return;
      const text = aiChatInput.value;
      aiChatInput.value = '';
      handleUserQuery(text);
    });

    aiChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const queryType = chip.getAttribute('data-query');
        let queryText = 'Tell me about your projects';
        if (queryType === 'ai') queryText = 'What are your AI skills and how fast do you build?';
        if (queryType === 'contact') queryText = 'How can I contact Zihan Fakir?';
        if (queryType === 'ecomace') queryText = 'Tell me about Ecomace project';
        handleUserQuery(queryText);
      });
    });
  }

  // ------------------------------------------------------------------------
  // 12. Full Website Content & Text Copy Protection (Refined & Anti-Duplicate)
  // ------------------------------------------------------------------------
  function isInputField(element) {
    if (!element) return false;
    const tag = element.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || element.isContentEditable;
  }

  function isPermittedSelection(target) {
    if (!target) return false;
    if (isInputField(target)) return true;
    if (target.closest && (target.closest('.contact-info-card') || target.closest('.social-link') || target.closest('a') || target.closest('.ai-msg-bot'))) {
      return true;
    }
    return false;
  }

  // Intercept Copy event
  document.addEventListener('copy', (e) => {
    if (!isPermittedSelection(document.activeElement || e.target)) {
      e.preventDefault();
      showToast('Text copying is disabled on this website.', 'error');
    }
  });

  // Intercept Cut event
  document.addEventListener('cut', (e) => {
    if (!isInputField(document.activeElement || e.target)) {
      e.preventDefault();
    }
  });

  // Intercept Right Click Context Menu (permit on interactive links)
  document.addEventListener('contextmenu', (e) => {
    if (!isInputField(e.target) && !e.target.closest('a') && !e.target.closest('button')) {
      e.preventDefault();
      showToast('Right-click is disabled to protect content.', 'info');
    }
  });

  // Intercept Keyboard Copy Shortcuts (Ctrl+C, Cmd+C) without duplicate toast
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      if (!isPermittedSelection(document.activeElement)) {
        e.preventDefault();
        showToast('Text copying is disabled on this website.', 'error');
      }
    }
  });

  // Prevent Dragging Images and Text
  document.addEventListener('dragstart', (e) => {
    if (!isInputField(e.target)) {
      e.preventDefault();
    }
  });

  // ------------------------------------------------------------------------
  // 13. Dynamic Current Year for Copyright
  // ------------------------------------------------------------------------
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Expose toast function for debugging/testing
  window.showToast = showToast;
});
