/**
 * ZIHAN FAKIR - PROFESSIONAL PORTFOLIO
 * Main Interactive Logic: Clean Domain & URLs, Theme Switcher, Typewriter, Filters, Modals & Animations
 */

// ============================================================================
// Clean Domain & Fresh URL Core
// ============================================================================
(function enforceCleanDomain() {
  try {
    const h = window.location.hostname.toLowerCase();
    const p = window.location.pathname;
    
    // Redirect GitHub Pages URL to primary custom domain
    if (h.includes('github.io')) {
      let cleanPath = p.replace(/^\/(zihan-xyz|zihan-uk)/i, '');
      if (cleanPath.endsWith('/index.html')) cleanPath = cleanPath.slice(0, -10);
      else if (cleanPath.endsWith('.html')) cleanPath = cleanPath.slice(0, -5);
      window.location.replace('https://zihan.uk' + (cleanPath || '/') + window.location.search + window.location.hash);
      return;
    }

    // Clean URL: strip .html extension in address bar
    if (window.history && window.history.replaceState && window.location.protocol.startsWith('http')) {
      if (p.endsWith('/index.html') || p === '/index.html') {
        const cleanPath = p.replace(/\/index\.html$/, '') || '/';
        window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
      } else if (p.endsWith('.html')) {
        const cleanPath = p.slice(0, -5);
        window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
      }
    }
  } catch (err) {}
})();


document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 0. Lenis Ultra-Smooth Inertia Scroll (Desktop Only, Native 120Hz/60Hz on Mobile)
  // ------------------------------------------------------------------------
  const isMobileDevice = window.innerWidth <= 768;
  let lenis = null;

  if (!isMobileDevice && typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 1,
        wheelMultiplier: 1.0,
        infinite: false,
      });

      function raf(time) {
        if (lenis) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
      }
      requestAnimationFrame(raf);

      // Smooth anchor navigation with header offset compensation
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              e.preventDefault();
              const headerEl = document.querySelector('.site-header');
              const headerOffset = headerEl ? headerEl.offsetHeight + 18 : 80;
              lenis.scrollTo(targetElement, {
                offset: -headerOffset,
                duration: 1.15
              });
            }
          }
        });
      });
    } catch (err) {
      console.warn('Lenis smooth scroll initialization skipped:', err);
    }
  }

  // ------------------------------------------------------------------------
  // Helper Utilities (Safe Storage, HTML Escaping & Toast Notifications)
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
  // 1. Light & Dark Theme Controller (System Theme Default + Manual Persistence)
  // ------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const systemPrefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener: () => {} };
  
  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  function getEffectiveTheme() {
    const savedTheme = safeGetStorage('zihan-portfolio-theme') || safeGetStorage('site_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return systemPrefersDark.matches ? 'dark' : 'light';
  }

  applyTheme(getEffectiveTheme());

  if (systemPrefersDark.addEventListener) {
    systemPrefersDark.addEventListener('change', (e) => {
      const savedTheme = safeGetStorage('zihan-portfolio-theme') || safeGetStorage('site_theme');
      if (!savedTheme) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = activeTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      safeSetStorage('zihan-portfolio-theme', newTheme);
      safeSetStorage('site_theme', newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
    });
  }

  // ------------------------------------------------------------------------
  // 2. Dynamic Typewriter Effect for Hero Section
  // ------------------------------------------------------------------------
  const typedTextEl = document.getElementById('typed-text');
  const roles = [
    'AI Engineer & GenAI Builder',
    'Full Stack Software Developer',
    'Open Source Innovator',
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
      typingSpeed = 45;
    } else {
      typedTextEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 95;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 2200;
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
  // 3. Mobile Navigation Menu Toggle & Header Scroll State
  // ------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const siteHeader = document.querySelector('.site-header');
  const backToTopBtn = document.getElementById('back-to-top');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('nav-menu-open', isOpen);
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
      }
    });

    const closeNav = () => {
      navMenu.classList.remove('open');
      document.body.classList.remove('nav-menu-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      const icon = mobileToggle.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    };

    navLinks.forEach(link => {
      link.addEventListener('click', closeNav);
    });

    const mobileCta = navMenu.querySelector('.nav-mobile-cta');
    if (mobileCta) {
      mobileCta.addEventListener('click', closeNav);
    }

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') &&
          !navMenu.contains(e.target) &&
          !mobileToggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  // Dynamic Scroll Reading Progress Indicator
  let scrollProgressBar = document.getElementById('scroll-progress-bar');
  if (!scrollProgressBar) {
    scrollProgressBar = document.createElement('div');
    scrollProgressBar.id = 'scroll-progress-bar';
    scrollProgressBar.className = 'scroll-progress-bar';
    scrollProgressBar.setAttribute('aria-hidden', 'true');
    document.body.prepend(scrollProgressBar);
  }

  // Unified High-Performance Passive Scroll Handler (rAF Debounced)
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        if (y > 30) {
          siteHeader?.classList.add('scrolled');
        } else {
          siteHeader?.classList.remove('scrolled');
        }
        if (backToTopBtn) {
          if (y > 350) {
            backToTopBtn.classList.add('visible');
          } else {
            backToTopBtn.classList.remove('visible');
          }
        }
        if (scrollProgressBar) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
          scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  // ------------------------------------------------------------------------
  // 4. Multi-Page Navigation Active Link Handler
  // ------------------------------------------------------------------------
  let rawSegment = window.location.pathname.split('/').pop().toLowerCase();
  if (!rawSegment || rawSegment === 'index.html' || rawSegment === 'index') {
    rawSegment = 'index.html';
  } else if (!rawSegment.endsWith('.html')) {
    rawSegment = rawSegment + '.html';
  }
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('#')[0].split('/').pop().toLowerCase();
    
    // Check if this link corresponds to the current page
    const isCurrentPage = (linkPath === rawSegment) || 
      (rawSegment === 'index.html' && (linkPath === 'index.html' || linkPath === ''));
    
    if (!href.startsWith('#')) {
      if (isCurrentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    }
  });

  // Only run in-page section observer for hash links on the current page
  const hashNavLinks = Array.from(navLinks).filter(l => (l.getAttribute('href') || '').startsWith('#'));
  const inPageSections = document.querySelectorAll('section[id]');
  if (hashNavLinks.length > 0 && inPageSections.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          hashNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    inPageSections.forEach(sec => sectionObserver.observe(sec));
  }

  // ------------------------------------------------------------------------
  // 5. Projects & Certificates Category Filter
  // ------------------------------------------------------------------------
  function setupCategoryFilter(filterContainerSelector, itemSelector) {
    const filterContainer = document.querySelector(filterContainerSelector);
    if (!filterContainer) return;
    const btns = filterContainer.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll(itemSelector);
    if (!btns.length || !items.length) return;
    const animationTimeouts = new WeakMap();

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const filterValue = btn.getAttribute('data-filter');

        items.forEach(item => {
          const category = item.getAttribute('data-category');

          if (animationTimeouts.has(item)) {
            clearTimeout(animationTimeouts.get(item));
          }

          if (filterValue === 'all' || category === filterValue || (category && category.split(' ').includes(filterValue))) {
            item.style.display = 'flex';
            const tId = setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 20);
            animationTimeouts.set(item, tId);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(16px)';
            const tId = setTimeout(() => {
              item.style.display = 'none';
            }, 240);
            animationTimeouts.set(item, tId);
          }
        });
      });
    });
  }

  setupCategoryFilter('.projects-filter', '.project-card');
  setupCategoryFilter('.certificates-filter', '.cert-card');

  // ------------------------------------------------------------------------
  // 6. Project Details Modal
  // ------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContentEl = document.getElementById('modal-details-body');
  const viewDetailBtns = document.querySelectorAll('.view-project-details');

  const projectDetailsDatabase = {
    'proj-1': {
      title: 'Alora AI — Multi-Model Generative AI Platform',
      category: 'Flagship Generative AI & Full Stack Platform',
      duration: 'Active Production Flagship',
      description: 'Alora AI is a powerful, production-ready multi-model AI chat platform engineered by Zihan Fakir. Designed with an ultra-secure serverless proxy architecture that prevents client-side API key leakage, it provides access to 11 top-tier frontier models (Gemini, Claude, DeepSeek, GPT-4o, Llama). Features include live token streaming, image & document context parsing, token counters, and a rich Bengali user interface.',
      features: [
        'Access to 11 industry-leading LLMs in one unified workspace (Gemini, Claude, GPT, DeepSeek)',
        'Zero-trust security: all API communications proxied safely without client-side key leakage',
        'Real-time token streaming with smooth dynamic rendering and markdown formatting',
        'Multimodal intelligence: supports image analysis and text/code document extraction',
        'Custom Bengali user interface & prompt engineering tailored for native Bengali interactions',
        'Live production deployment on custom domain: https://alora.zihan.xyz with Cloudflare edge caching'
      ],
      techStack: ['GenAI & LLMs', 'JavaScript (ES6+)', 'Serverless API', 'Cloudflare Edge', 'Markdown / Prism', 'Bengali UI'],
      liveUrl: 'https://alora.zihan.xyz',
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
      liveUrl: 'https://zihan.uk',
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
      liveUrl: 'https://zihan.uk',
      codeUrl: 'https://github.com/zihanfakir/health-sync'
    }
  };

  let lastFocusedTrigger = null;

  function openModal() {
    if (!projectModal) return;
    if (lenis) lenis.stop();
    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      modalCloseBtn?.focus();
    }, 80);
  }

  function closeModal() {
    if (!projectModal) return;
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
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

      if (data && projectModal && modalContentEl) {
        modalContentEl.innerHTML = `
          <div style="margin-bottom: 20px; padding-right: 44px;">
            <span class="section-tag">${escapeHTML(data.category)}</span>
            <h2 style="font-size: 1.8rem; margin: 8px 0 12px; color: var(--text-main);">${escapeHTML(data.title)}</h2>
            <p style="color: var(--text-secondary); line-height: 1.7; font-size: 1.05rem;">${escapeHTML(data.description)}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--text-main);"><i class="fas fa-check-circle" style="color: var(--primary); margin-right: 8px;"></i>Key Features:</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
              ${data.features.map(f => `<li style="display: flex; align-items: flex-start; gap: 10px; color: var(--text-secondary); font-size: 0.95rem;"><i class="fas fa-arrow-right" style="color: var(--secondary); margin-top: 5px; font-size: 0.8rem;"></i> ${escapeHTML(f)}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom: 28px;">
            <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--text-main);"><i class="fas fa-layer-group" style="color: var(--primary); margin-right: 8px;"></i>Technologies:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${data.techStack.map(t => `<span class="tech-tag">${escapeHTML(t)}</span>`).join('')}
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

  if (modalCloseBtn && projectModal) {
    modalCloseBtn.addEventListener('click', closeModal);
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeModal();
    });
  }

  // ------------------------------------------------------------------------
  // 7. Skill Progress Bars Animation & Skill Cards Modal
  // ------------------------------------------------------------------------
  const skillProgressFills = document.querySelectorAll('.skill-progress-fill');
  const isMobileScreen = window.innerWidth <= 768;
  
  if (isMobileScreen) {
    // Mobile: immediately fill progress bars with zero animation or observer overhead
    skillProgressFills.forEach(fill => {
      fill.style.width = fill.getAttribute('data-percentage') || '85%';
    });
  } else if (window.IntersectionObserver) {
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

    const skillsContainer = document.querySelector('.skills-grid') || document.getElementById('skills');
    if (skillsContainer) {
      skillsObserver.observe(skillsContainer);
    }
  } else {
    skillProgressFills.forEach(fill => {
      fill.style.width = fill.getAttribute('data-percentage') || '85%';
    });
  }

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
      category: 'AI Engineering & Acceleration',
      proficiency: '99%',
      experience: '4+ Years AI/Dev Experience',
      icon: 'fas fa-brain',
      iconColor: '#a855f7',
      summary: 'Harnessing generative AI models to construct cutting-edge AI chat platforms, autonomous coding workflows, multimodal understanding systems, and achieving 10x developer delivery speed.',
      highlights: [
        'Architected Alora AI (alora.zihan.xyz) integrating 11 frontier LLMs safely',
        'Zero-trust serverless proxy design preventing client-side API key leakage',
        'Real-time token streaming with server-sent events (SSE) & WebSocket protocols',
        'Advanced prompt engineering (Few-shot, CoT, structured JSON schemas, function calling)'
      ],
      usedIn: ['Alora AI Flagship Multi-Model Chat Platform', 'Portfolio AI Assistant', 'Automated Code Generation']
    },
    'typescript': {
      title: 'TypeScript (Strict Types & Scalability)',
      category: 'Typed Programming',
      proficiency: '92%',
      experience: '3+ Years Production Experience',
      icon: 'fas fa-code',
      iconColor: '#3178c6',
      summary: 'Developing enterprise-grade applications with TypeScript. Applying strict type inference, generic interfaces, union types, and robust architectural boundaries to eliminate runtime errors.',
      highlights: [
        'Comprehensive type declarations, utility types, and strict null safety',
        'Type-safe REST API integration and database schema typing with Prisma/Zod',
        'Scalable monorepo and microservices architecture typing',
        'Seamless integration with React, Express, and modern bundlers'
      ],
      usedIn: ['Enterprise Full Stack SaaS Applications', 'Production API Services']
    },
    'node': {
      title: 'Node.js & Express (Backend Systems)',
      category: 'Backend & Microservices',
      proficiency: '90%',
      experience: '3.5+ Years Production Experience',
      icon: 'fab fa-node-js',
      iconColor: '#10b981',
      summary: 'Designing scalable, asynchronous REST APIs, WebSocket real-time systems, and serverless edge handlers with Node.js and Express.',
      highlights: [
        'High-throughput RESTful API architecture with middleware design patterns',
        'JWT authentication, rate limiting, CORS configuration, and security headers (Helmet)',
        'Streaming data responses and background worker queues',
        'Database abstraction layers and microservice communication'
      ],
      usedIn: ['Ecomace Backend API Server', 'Alokpo Backend Crawler Indexing Engine']
    },
    'python': {
      title: 'Python & FastAPI',
      category: 'Backend, AI & Scripting',
      proficiency: '86%',
      experience: '3+ Years Experience',
      icon: 'fab fa-python',
      iconColor: '#3b82f6',
      summary: 'Crafting high-speed asynchronous APIs with FastAPI, data manipulation, automation scripts, and integrating machine learning pipelines with Python.',
      highlights: [
        'Asynchronous endpoint design with FastAPI and Pydantic validation',
        'Data processing, web scraping, and automation scripts',
        'AI/ML integration with PyTorch, Hugging Face, and LangChain',
        'Clean, PEP 8 compliant, well-documented codebases'
      ],
      usedIn: ['AI Model Microservices', 'Data Automation & Scraping Utilities']
    },
    'postgres': {
      title: 'PostgreSQL & Prisma ORM',
      category: 'Relational Database Architecture',
      proficiency: '88%',
      experience: '3+ Years Experience',
      icon: 'fas fa-database',
      iconColor: '#0284c7',
      summary: 'Designing normalized relational databases, writing optimized SQL queries, executing migrations, and modeling complex schemas using Prisma ORM and PostgreSQL.',
      highlights: [
        'Normalized relational schema design with indexing for high query performance',
        'Prisma ORM schema modeling, type-safe queries, and automated migrations',
        'Complex joins, transactions, aggregate analysis, and connection pooling',
        'ACID-compliant enterprise transactional data integrity'
      ],
      usedIn: ['E-Commerce Data Stores', 'SaaS Production Databases']
    },
    'mongo': {
      title: 'MongoDB & Redis (NoSQL & Caching)',
      category: 'NoSQL & Memory Stores',
      proficiency: '85%',
      experience: '3+ Years Experience',
      icon: 'fas fa-leaf',
      iconColor: '#10b981',
      summary: 'Deploying schema-flexible document databases with MongoDB and lightning-fast in-memory caching and session management with Redis.',
      highlights: [
        'Flexible document modeling and aggregation pipelines in MongoDB',
        'High-speed sub-millisecond caching and session stores with Redis',
        'Pub/Sub real-time messaging workflows',
        'Database clustering, sharding basics, and replication'
      ],
      usedIn: ['Real-Time Chat Data Stores', 'API Rate Limiting & Query Caching']
    },
    'tailwind': {
      title: 'Tailwind CSS & Modern Design Systems',
      category: 'Modern UI/UX Engineering',
      proficiency: '96%',
      experience: '3.5+ Years Experience',
      icon: 'fab fa-css3-alt',
      iconColor: '#06b6d4',
      summary: 'Constructing modern, consistent, and responsive user interfaces using Tailwind CSS utility patterns and custom design token extensions.',
      highlights: [
        'Rapid UI prototyping with utility-first approach and custom configuration',
        'Design systems with coherent spacing, typography, and color tokens',
        'Seamless dark mode implementation and responsive mobile breakpoints',
        'Zero runtime CSS overhead and optimized production bundle purging'
      ],
      usedIn: ['Ecomace Production Storefront', 'Modern Client Portals']
    },
    'docker': {
      title: 'Docker & Cloud DevOps',
      category: 'DevOps & Infrastructure',
      proficiency: '82%',
      experience: '2.5+ Years Experience',
      icon: 'fab fa-docker',
      iconColor: '#2563eb',
      summary: 'Containerizing applications with Docker, managing multi-container setups with Docker Compose, and setting up automated CI/CD deployment pipelines.',
      highlights: [
        'Multi-stage Dockerfile builds for minimal, secure production image sizes',
        'Docker Compose orchestration for local development and microservice testing',
        'GitHub Actions automated testing, building, and deployment workflows',
        'Vercel, Netlify, Cloudflare, and cloud VPS deployments'
      ],
      usedIn: ['Full Stack Containerized Microservices', 'Automated GitHub Actions CI/CD']
    }
  };

  const skillCards = document.querySelectorAll('.skill-card');
  skillCards.forEach(card => {
    card.addEventListener('click', () => {
      const skillId = card.getAttribute('data-skill-id');
      const data = skillsData[skillId];
      if (data && projectModal && modalContentEl) {
        lastFocusedTrigger = card;
        modalContentEl.innerHTML = `
          <div style="margin-bottom: 20px; padding-right: 44px;">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
              <div style="width: 50px; height: 50px; border-radius: 14px; background: var(--bg-body-secondary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: ${data.iconColor};">
                <i class="${data.icon}"></i>
              </div>
              <div>
                <span class="section-tag">${escapeHTML(data.category)}</span>
                <h2 style="font-size: 1.6rem; margin: 4px 0 0; color: var(--text-main);">${escapeHTML(data.title)}</h2>
              </div>
            </div>
            <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
              <span class="tech-tag" style="color: var(--primary); border-color: var(--primary);"><i class="fas fa-chart-line"></i> Proficiency: ${data.proficiency}</span>
              <span class="tech-tag"><i class="fas fa-calendar-check"></i> ${escapeHTML(data.experience)}</span>
            </div>
            <p style="color: var(--text-secondary); line-height: 1.7; font-size: 1.02rem;">${escapeHTML(data.summary)}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.05rem; margin-bottom: 12px; color: var(--text-main);"><i class="fas fa-star" style="color: var(--accent-amber); margin-right: 8px;"></i>Core Capabilities:</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
              ${data.highlights.map(h => `<li style="display: flex; align-items: flex-start; gap: 10px; color: var(--text-secondary); font-size: 0.92rem;"><i class="fas fa-check" style="color: var(--accent-emerald); margin-top: 5px; font-size: 0.8rem;"></i> ${escapeHTML(h)}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.05rem; margin-bottom: 12px; color: var(--text-main);"><i class="fas fa-laptop-code" style="color: var(--secondary); margin-right: 8px;"></i>Applied in Projects:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${data.usedIn.map(u => `<span class="tech-tag" style="background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.3); color: var(--text-main);">${escapeHTML(u)}</span>`).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('modal-close-btn').click();">
              Close Details
            </button>
          </div>
        `;
        openModal();
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ------------------------------------------------------------------------
  // 8. Contact Form Submissions (Email mailto & WhatsApp)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const contactEmailBtn = document.getElementById('contact-email-btn');
  const contactWhatsAppBtn = document.getElementById('contact-whatsapp-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name')?.value.trim();
      const email = document.getElementById('form-email')?.value.trim();
      const subject = document.getElementById('form-subject')?.value.trim() || 'Project Inquiry via Portfolio';
      const message = document.getElementById('form-message')?.value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields (*)', 'error');
        return;
      }

      const bodyContent = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const mailtoUrl = `mailto:x@zihan.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;

      showToast('Opening default email client...', 'info');
      window.location.href = mailtoUrl;
    });
  }

  if (contactWhatsAppBtn) {
    contactWhatsAppBtn.addEventListener('click', () => {
      const name = document.getElementById('form-name')?.value.trim();
      const email = document.getElementById('form-email')?.value.trim();
      const subject = document.getElementById('form-subject')?.value.trim();
      const message = document.getElementById('form-message')?.value.trim();

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
      showToast('Opening WhatsApp chat with +880 1402-963123...', 'success');
      window.open(waUrl, '_blank');
    });
  }

  // ------------------------------------------------------------------------
  // 9. Floating Back-to-Top Button
  // ------------------------------------------------------------------------
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ------------------------------------------------------------------------
  // 10. Toast Notification System
  // ------------------------------------------------------------------------
  let lastToastTime = 0;
  function showToast(message, type = 'info') {
    const now = Date.now();
    if (now - lastToastTime < 450) return;
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
    }, 3600);
  }

  // ------------------------------------------------------------------------
  // 10b. Full Website Copy & Source Protection System
  // ------------------------------------------------------------------------
  // 1. Intercept Copy event
  document.addEventListener('copy', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (!isInput) {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.clearData();
      }
      showToast('Content copying is disabled on this portfolio.', 'warning');
      return false;
    }
  });

  // 2. Intercept Cut event
  document.addEventListener('cut', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (!isInput) {
      e.preventDefault();
      return false;
    }
  });

  // 3. Intercept Selection Start event (drag to highlight text)
  document.addEventListener('selectstart', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (!isInput) {
      e.preventDefault();
      return false;
    }
  });

  // 4. Intercept Context Menu (Right Click)
  document.addEventListener('contextmenu', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (!isInput) {
      e.preventDefault();
      showToast('Right-click & copying is disabled.', 'warning');
      return false;
    }
  });

  // 5. Intercept Copy, Select All & Save Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (!isInput) {
      // Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        showToast('Content copying is disabled on this portfolio.', 'warning');
        return false;
      }
      // Ctrl+A / Cmd+A (Select All)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    }
  });

  // 6. Prevent image dragging
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // ------------------------------------------------------------------------
  // 11. Certificate Database & Interactive Modal Viewer
  // ------------------------------------------------------------------------
  const certDatabase = {
    'cert-1': {
      title: 'Create Image Captioning Models',
      issuer: 'Simplilearn | SkillUp (Powered by Google Cloud)',
      date: 'September 8, 2026',
      id: '10705792',
      idLabel: 'Certificate Code',
      img: 'assets/certificates/cert-1.jpg',
      pdf: 'assets/certificates/cert-1-google-cloud-image-captioning.pdf',
      downloadName: 'Google-Cloud-Image-Captioning-Zihan-Fakir.pdf',
      desc: 'Completed comprehensive course covering computer vision, multimodal neural networks, encoder-decoder architectures, and deep learning models for automatic image captioning on Google Cloud.'
    },
    'cert-2': {
      title: 'Business Analytics with Excel',
      issuer: 'Simplilearn | SkillUp (Powered by Microsoft)',
      date: 'September 8, 2026',
      id: '10706852',
      idLabel: 'Certificate Code',
      img: 'assets/certificates/cert-2.jpg',
      pdf: 'assets/certificates/cert-2-microsoft-business-analytics.pdf',
      downloadName: 'Microsoft-Business-Analytics-Zihan-Fakir.pdf',
      desc: 'Completed advanced training in data analysis with Excel, quantitative modeling, statistical variance, pivot insights, and business decision intelligence.'
    },
    'cert-9': {
      title: 'Automating with AI/ML for Small Business Owners',
      issuer: 'Amazon Web Services (AWS) — AWS Training & Certification',
      date: 'September 09, 2026',
      id: 'AWS-TRAINING-CERTIFICATION-2026',
      idLabel: 'Completion Certificate',
      img: 'assets/certificates/cert-9.jpg',
      pdf: 'assets/certificates/cert-9-aws-automating-ai-ml.pdf',
      downloadName: 'AWS-Automating-AI-ML-Zihan-Fakir.pdf',
      desc: 'Completed official AWS Training & Certification course on automating business workflows with Artificial Intelligence and Machine Learning (AI/ML) cloud services.'
    },
    'cert-3': {
      title: 'Master ChatGPT & Generative AI',
      issuer: 'UniAthena | Athena Global Education (FEDE Member)',
      date: 'September 8, 2026',
      id: '2230-1508-9566',
      idLabel: 'Blockchain ID',
      img: 'assets/certificates/cert-3.jpg',
      pdf: 'assets/certificates/cert-3-uniathena-master-chatgpt.pdf',
      downloadName: 'UniAthena-Master-ChatGPT-Zihan-Fakir.pdf',
      desc: 'Blockchain-verified certificate validating mastery of conversational AI prompt engineering, LLM application architecture, automation pipelines, and advanced ChatGPT workflows.'
    },
    'cert-4': {
      title: 'AI for Beginners',
      issuer: 'HP LIFE | HP Foundation (Michele Malejki, Executive Director)',
      date: 'September 8, 2026',
      id: '834279ba-aa78-4bc1-9e02-c63ef14b1d99',
      idLabel: 'Serial Number',
      img: 'assets/certificates/cert-4.jpg',
      pdf: 'assets/certificates/cert-4-hp-ai-for-beginners.pdf',
      downloadName: 'HP-LIFE-AI-Beginners-Zihan-Fakir.pdf',
      desc: 'Foundational artificial intelligence course covering machine learning taxonomy, business use cases, dataset preparation, and ethical AI deployment standards.'
    },
    'cert-5': {
      title: 'Business Email & Executive Communication',
      issuer: 'HP LIFE | HP Foundation (Michele Malejki, Executive Director)',
      date: 'September 8, 2026',
      id: 'dc217005-8a26-4c68-8e2f-f59f139fe935',
      idLabel: 'Serial Number',
      img: 'assets/certificates/cert-5.jpg',
      pdf: 'assets/certificates/cert-5-hp-business-email.pdf',
      downloadName: 'HP-LIFE-Business-Email-Zihan-Fakir.pdf',
      desc: 'Professional communication training focusing on structural email design, executive tone, client negotiation, and high-impact digital correspondence.'
    },
    'cert-6': {
      title: 'Critical Thinking in the AI Era',
      issuer: 'HP LIFE | HP Foundation (Michele Malejki, Executive Director)',
      date: 'September 8, 2026',
      id: 'd8d2c126-1bfd-4801-a5aa-c19e9fca2608',
      idLabel: 'Serial Number',
      img: 'assets/certificates/cert-6.jpg',
      pdf: 'assets/certificates/cert-6-hp-critical-thinking-ai.pdf',
      downloadName: 'HP-LIFE-Critical-Thinking-AI-Zihan-Fakir.pdf',
      desc: 'Cognitive decision science training on mitigating AI hallucination risks, detecting algorithmic bias, structured fact-checking, and objective reasoning.'
    },
    'cert-7': {
      title: 'ESG Standards & Practices for Islamic Financial Institutions',
      issuer: 'UNDP (United Nations Development Programme) / ICPSD & IsDBI',
      date: 'September 8, 2026',
      id: 'UNDP-ICPSD-VERIFIED-2026',
      idLabel: 'Credential Verification',
      img: 'assets/certificates/cert-7.jpg',
      pdf: 'assets/certificates/cert-7-undp-esg-standards.pdf',
      downloadName: 'UNDP-ESG-Standards-Zihan-Fakir.pdf',
      desc: 'Completed advanced executive curriculum on Environmental, Social, and Governance (ESG) standards, impact measurement, and ethical institutional sustainability signed by Sahba Sobhani (UNDP ICPSD Director).'
    },
    'cert-8': {
      title: 'Strategic Planning in the AI Age',
      issuer: 'HP LIFE | HP Foundation (Michele Malejki, Executive Director)',
      date: 'September 8, 2026',
      id: 'fdd8afd9-46b2-4266-b6f8-4cb0441d7408',
      idLabel: 'Serial Number',
      img: 'assets/certificates/cert-8.jpg',
      pdf: 'assets/certificates/cert-8-hp-strategic-planning-ai.pdf',
      downloadName: 'HP-LIFE-Strategic-Planning-AI-Zihan-Fakir.pdf',
      desc: 'Modern strategic roadmap formulation, strategic agile execution frameworks, and utilizing AI capabilities to achieve competitive enterprise advantages.'
    },
    'cert-10': {
      title: 'AI Search Operating System',
      issuer: 'Semrush Academy (Instructors: Leigh McKenzie & Rita Cidre)',
      date: 'September 09, 2026 (Expires Sep 09, 2027)',
      id: 'f087b01d3c',
      idLabel: 'Certificate ID',
      img: 'assets/certificates/cert-10.jpg',
      pdf: 'assets/certificates/cert-10-semrush-ai-search-operating-system.pdf',
      downloadName: 'Semrush-AI-Search-Operating-System-Zihan-Fakir.pdf',
      desc: 'Mastery of AI-powered search engines, retrieval augmented generation (RAG) principles for search, generative search optimization (GEO), and semantic query understanding.'
    },
    'cert-11': {
      title: 'Become an AI-Powered Marketer',
      issuer: 'Semrush Academy (Instructor: Michael Olaye)',
      date: 'September 09, 2026 (Expires Sep 09, 2027)',
      id: '78ed8d2af5',
      idLabel: 'Certificate ID',
      img: 'assets/certificates/cert-11.jpg',
      pdf: 'assets/certificates/cert-11-semrush-ai-powered-marketer.pdf',
      downloadName: 'Semrush-AI-Powered-Marketer-Zihan-Fakir.pdf',
      desc: 'Completed advanced training on integrating generative AI, automated marketing operations, predictive analytics, and algorithmic audience targeting.'
    },
    'cert-12': {
      title: 'Get a Job in Digital Marketing (with no experience)',
      issuer: 'Semrush Academy (Instructor: Olivia Mae Hanlon)',
      date: 'September 09, 2026 (Expires Sep 09, 2027)',
      id: 'b4a44f8aef',
      idLabel: 'Certificate ID',
      img: 'assets/certificates/cert-12.jpg',
      pdf: 'assets/certificates/cert-12-semrush-digital-marketing.pdf',
      downloadName: 'Semrush-Digital-Marketing-Zihan-Fakir.pdf',
      desc: 'Comprehensive certification in digital marketing campaigns, SEO growth frameworks, conversion funnel design, and performance metrics.'
    }
  };

  let currentActiveCertId = null;

  window.openCertModal = function(certId) {
    const data = certDatabase[certId];
    if (!data) return;
    currentActiveCertId = certId;
    const certModal = document.getElementById('cert-modal');
    const nameEl = document.getElementById('cert-modal-name');
    const imgEl = document.getElementById('cert-modal-img');
    const detailsEl = document.getElementById('cert-modal-details');
    const issuerInfoEl = document.getElementById('cert-modal-issuer-info');
    const downloadLink = document.getElementById('cert-download-link');

    if (nameEl) nameEl.textContent = data.title;
    if (imgEl) {
      imgEl.src = data.img;
      imgEl.alt = `${data.title} Certificate`;
    }
    if (detailsEl) {
      detailsEl.innerHTML = `
        <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem; margin-bottom: 8px;">${escapeHTML(data.desc)}</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.85rem; color: var(--text-muted);">
          <span><strong>Date:</strong> ${escapeHTML(data.date)}</span>
          <span><strong>${escapeHTML(data.idLabel)}:</strong> <code style="font-family: var(--font-mono); color: var(--primary);">${escapeHTML(data.id)}</code></span>
        </div>
      `;
    }
    if (issuerInfoEl) {
      issuerInfoEl.innerHTML = `<i class="fas fa-building" style="color: var(--secondary);"></i> ${escapeHTML(data.issuer)}`;
    }
    if (downloadLink) {
      downloadLink.href = data.pdf;
      downloadLink.setAttribute('download', data.downloadName);
    }
    if (certModal) {
      if (lenis) lenis.stop();
      certModal.classList.add('open');
      certModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCertModal = function() {
    const certModal = document.getElementById('cert-modal');
    if (certModal) {
      certModal.classList.remove('open');
      certModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
  };

  window.copyCertId = function() {
    if (!currentActiveCertId) return;
    const data = certDatabase[currentActiveCertId];
    if (!data || !data.id) return;
    navigator.clipboard.writeText(data.id).then(() => {
      showToast(`Copied ${data.idLabel}: ${data.id}`, 'success');
    }).catch(() => {
      showToast(`${data.idLabel}: ${data.id}`, 'info');
    });
  };

  const certModalEl = document.getElementById('cert-modal');
  if (certModalEl) {
    certModalEl.addEventListener('click', (e) => {
      if (e.target === certModalEl) {
        closeCertModal();
      }
    });
  }

  // ------------------------------------------------------------------------
  // 12. Interactive AI Assistant Chat
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

    window.toggleAIChatGlobal = toggleAIChat;

    aiChatBtn.addEventListener('click', toggleAIChat);

    aiChatClose?.addEventListener('click', (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeAIChat();
    });

    aiChatWindow.addEventListener('click', (e) => e.stopPropagation());

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

    function generateLocalAIResponse(query) {
      const q = query.toLowerCase().trim();

      if (q.includes('alora') || q.includes('alokpath') || q.includes('আলোকপথ') || q.includes('chatbot') || q.includes('ai bot') || q.includes('alora.zihan.xyz') || q.includes('ai.zihan.xyz')) {
        return `<i class="fas fa-brain" style="color:var(--primary);margin-right:6px;"></i> <strong>About Alora AI:</strong><br>
        Zihan Fakir's flagship generative AI chat platform powered by <strong>11 frontier AI models</strong> (Gemini, Claude, GPT-4o, DeepSeek, Llama). Features zero client-side API key exposure (100% secure serverless proxy), real-time token streaming, multimodal image and file recognition, and an intuitive Bengali user interface.<br>
        <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> <a href="https://alora.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">Try Live at alora.zihan.xyz</a> • <i class="fab fa-github" style="margin-right:4px;"></i> <a href="https://github.com/zihanfakir/ai.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;">GitHub Repository</a>`;
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
        • <strong>Alora AI:</strong> Multi-model flagship chat platform with 11 LLMs at <a href="https://alora.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--primary);font-weight:700;">alora.zihan.xyz</a>.<br>
        • <strong>GenAI & LLMs:</strong> 99% proficiency working with Google Gemini, Anthropic Claude, OpenAI, and DeepSeek.<br>
        • <strong>Prompt Engineering:</strong> Expert in crafting structured system instructions, few-shot prompting, and deterministic JSON schemas.<br>
        • <strong>Autonomous Agents:</strong> Designing tool-calling agents and automated reasoning workflows.<br>
        • <strong>10x AI-Powered Dev:</strong> Accelerating delivery speed using modern AI developer tooling while maintaining rigorous code quality.`;
      }

      if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('banano')) {
        return `<i class="fas fa-layer-group" style="color:var(--secondary);margin-right:6px;"></i> <strong>Zihan's Top Real Projects:</strong><br>
        1. <a href="https://alora.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--primary);font-weight:700;">Alora AI</a>: Flagship multi-model AI platform powered by 11 LLMs with Bengali UI.<br>
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
        • <strong>Domain:</strong> <a href="https://zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);">zihan.xyz</a> / <a href="https://zihan.uk" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);">zihan.uk</a><br>
        • <strong>All Usernames:</strong> <strong style="color:var(--text-main);">@zihanfakir</strong> (GitHub, Facebook, Instagram, Telegram, LinkedIn, X)`;
      }

      if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('language')) {
        return `<i class="fas fa-code" style="color:var(--primary);margin-right:6px;"></i> <strong>Zihan's Tech Stack:</strong><br>
        • <strong>Frontend:</strong> React, Next.js, TypeScript, JavaScript, HTML5/CSS3, Tailwind CSS<br>
        • <strong>Backend & APIs:</strong> Node.js, Express, Python, FastAPI, REST APIs<br>
        • <strong>AI & LLMs:</strong> Gemini, Claude, OpenAI, DeepSeek (99%), Prompt Engineering, Agents<br>
        • <strong>Database & DevOps:</strong> PostgreSQL, MongoDB, Redis, Docker, Vercel, Git`;
      }

      if (q.includes('cert') || q.includes('credential') || q.includes('honor') || q.includes('license')) {
        return `<i class="fas fa-award" style="color:var(--primary);margin-right:6px;"></i> <strong>Verified Honors &amp; Certifications (12 Credentials):</strong><br>
        • <strong>Amazon Web Services (AWS):</strong> Automating with AI/ML for Small Business Owners<br>
        • <strong>Google Cloud | Simplilearn:</strong> Create Image Captioning Models (ID: 10705792)<br>
        • <strong>Microsoft | Simplilearn:</strong> Business Analytics with Excel (ID: 10706852)<br>
        • <strong>Semrush Academy:</strong> AI Search Operating System, Become an AI-Powered Marketer, Digital Marketing<br>
        • <strong>UniAthena | FEDE:</strong> Master ChatGPT &amp; Generative AI (Blockchain ID: 2230-1508-9566)<br>
        • <strong>HP Foundation (HP LIFE):</strong> AI for Beginners, Strategic Planning, Critical Thinking, Business Email<br>
        • <strong>UNDP / ICPSD:</strong> ESG Standards &amp; Institutional Governance<br>
        <i class="fas fa-arrow-down" style="margin-right:4px;"></i> Explore interactive previews &amp; credentials in the <strong><a href="#certificates" style="color:var(--secondary);text-decoration:underline;">Certifications Section</a></strong>!`;
      }

      return `Thanks for asking! Zihan Fakir is an AI Engineer & Full Software Developer. You can check out his projects (<a href="https://alora.zihan.xyz" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">Alora AI</a>, <a href="https://ecomace.vercel.app/" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">Ecomace</a>, <a href="https://zihanfakir.github.io/alokpo-search/" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">Alokpo</a>), his 10x AI speed, or contact him directly via <a href="mailto:x@zihan.uk" style="color:var(--primary);">x@zihan.uk</a> or WhatsApp (<a href="https://wa.me/8801402963123" target="_blank" rel="noopener noreferrer" style="color:var(--accent-emerald);">+880 1402-963123</a>).`;
    }

    let isAIResponding = false;

    async function handleUserQuery(query) {
      if (!query || !query.trim() || isAIResponding) return;
      if (!aiChatMessages) return;

      isAIResponding = true;
      appendMessage(query, 'user', false);

      const indicator = document.createElement('div');
      indicator.className = 'ai-msg ai-msg-bot typing-indicator';
      indicator.innerHTML = '<span></span><span></span><span></span>';
      aiChatMessages.appendChild(indicator);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        indicator.remove();
        const localReply = generateLocalAIResponse(query);
        appendMessage(localReply, 'bot', true);
      } catch (err) {
        indicator.remove();
        appendMessage(`Thanks for asking! You can reach out directly to Zihan at <a href="mailto:x@zihan.uk" style="color:var(--primary);">x@zihan.uk</a>.`, 'bot', true);
      } finally {
        isAIResponding = false;
      }
    }

    if (aiChatForm) {
      aiChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = aiChatInput?.value.trim();
        if (text) {
          aiChatInput.value = '';
          handleUserQuery(text);
        }
      });
    }

    aiChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (query) {
          handleUserQuery(query);
        }
      });
    });
  }

  // Escape key closes topmost overlay
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (projectModal && projectModal.classList.contains('open')) {
        closeModal();
      } else if (certModalEl && certModalEl.classList.contains('open')) {
        closeCertModal();
      } else if (aiChatWindow && aiChatWindow.classList.contains('open')) {
        aiChatWindow.classList.remove('open');
      }
    }
  });

  // ------------------------------------------------------------------------
  // 10. Hero Background Interactive Particle Constellation Animation
  // ------------------------------------------------------------------------
  function initHeroParticles() {
    // Extreme Mobile Optimization: Never initialize canvas particles loop on mobile screens
    if (window.innerWidth <= 768) return;

    const canvas = document.getElementById('hero-particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let width = 0, height = 0;
    let particles = [];
    let animationFrameId = null;
    let isVisible = true;
    const particleCount = 42;

    function resize() {
      const hero = document.getElementById('home');
      if (!hero) return;
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Particle {
      constructor() {
        this.x = Math.random() * (width || window.innerWidth);
        this.y = Math.random() * (height || 600);
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.5 + 0.8;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.45)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouse = { x: -1000, y: -1000 };
    const heroEl = document.getElementById('home');
    if (heroEl) {
      heroEl.addEventListener('mousemove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      }, { passive: true });
      heroEl.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
      }, { passive: true });
    }

    function render() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Interactive cursor connection on PC
        if (mouse.x > 0) {
          const mdx = particles[i].x - mouse.x;
          const mdy = particles[i].y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.28 * (1 - mDist / 130)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.16 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    }

    // Performance optimization: Pause loop when hero is off-screen
    if (heroEl && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animationFrameId) {
            animationFrameId = requestAnimationFrame(render);
          } else if (!isVisible && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        });
      }, { threshold: 0.05 });
      observer.observe(heroEl);
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // ------------------------------------------------------------------------
  // 11. Scroll-Triggered Reveal Animations (Fluid Cascading Waterfall Entrance)
  // ------------------------------------------------------------------------
  function initScrollReveal() {
    const isMobile = window.innerWidth <= 768;

    // Leaf elements only — NEVER target .page-hero, .hero-section, or .resume-paper
    const allTargets = document.querySelectorAll(
      '.section-header, .about-text, .dev-dossier-card, .about-connect-card, .about-feature-item, ' +
      '.skill-card, .skill-category-card, .about-visual-card, .gateway-card, .glass-card, ' +
      '.project-card, .projects-filter, .project-callout, .cert-card, .certificates-filter, ' +
      '.timeline-item, .contact-item-card, .contact-form-box, .stat-item, .section-view-all-cta'
    );

    if (!allTargets.length) return;

    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const belowFoldTargets = [];

    // Instant-reveal elements in initial viewport (Zero flicker, zero blank hero)
    allTargets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < windowHeight * 0.85) {
        el.classList.add('revealed', 'reveal-done');
      } else {
        el.classList.add('reveal-on-scroll');
        belowFoldTargets.push(el);
      }
    });

    if (!belowFoldTargets.length) return;

    // Apply staggered delays inside grid containers for below-fold items
    const gridContainers = document.querySelectorAll(
      '.skills-grid, .projects-grid, .cert-grid, .certs-grid, .about-features, .stats-grid, ' +
      '.gateway-grid, .contact-info-cards, .timeline-container'
    );

    gridContainers.forEach(grid => {
      const children = grid.querySelectorAll('.reveal-on-scroll');
      children.forEach((child, idx) => {
        const delay = isMobile ? (idx % 2) * 0.05 : (idx % 4) * 0.08;
        child.style.transitionDelay = `${delay}s`;
      });
    });

    if (!('IntersectionObserver' in window)) {
      belowFoldTargets.forEach(el => {
        el.classList.add('revealed', 'reveal-done');
      });
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('revealed');
          observer.unobserve(el);

          // Clear delay and enable native hover physics after entrance completes
          const delaySec = parseFloat(el.style.transitionDelay) || 0;
          setTimeout(() => {
            el.classList.add('reveal-done');
            el.style.transitionDelay = '';
          }, (delaySec * 1000) + (isMobile ? 360 : 500));
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.08
    });

    belowFoldTargets.forEach(el => revealObserver.observe(el));
  }

  // ------------------------------------------------------------------------
  // 11b. Scroll-Triggered Stat Counter Animation (0 -> Target Count Up)
  // ------------------------------------------------------------------------
  function initCounterAnimation() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    if (!('IntersectionObserver' in window)) return;

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const originalText = el.textContent.trim();
          const match = originalText.match(/^([0-9.]+)(.*)$/);
          if (match) {
            const target = parseFloat(match[1]);
            const suffix = match[2] || '';
            const isFloat = match[1].includes('.');
            const duration = 1400;
            const startTime = performance.now();

            function updateCounter(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 3);
              const current = target * ease;
              el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                el.textContent = originalText;
              }
            }
            requestAnimationFrame(updateCounter);
          }
          observer.unobserve(el);
        }
      });
    }, {
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.1
    });

    statNumbers.forEach(num => counterObserver.observe(num));
  }

  // ------------------------------------------------------------------------
  // 11c. Scroll-Triggered Skill Progress Fill Animation
  // ------------------------------------------------------------------------
  function initSkillProgressAnimation() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const progressFills = document.querySelectorAll('.skill-progress-fill');
    if (!progressFills.length) return;

    progressFills.forEach(fill => {
      const targetWidth = fill.getAttribute('data-percentage') || fill.style.width || '0%';
      fill.setAttribute('data-target-width', targetWidth);
      fill.style.width = '0%';
      fill.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    if (!('IntersectionObserver' in window)) {
      progressFills.forEach(fill => {
        fill.style.width = fill.getAttribute('data-target-width');
      });
      return;
    }

    const skillObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const targetWidth = fill.getAttribute('data-target-width');
          if (targetWidth) {
            fill.style.width = targetWidth;
          }
          observer.unobserve(fill);
        }
      });
    }, {
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.1
    });

    progressFills.forEach(fill => skillObserver.observe(fill));
  }

  // ------------------------------------------------------------------------
  // 12. Interactive Card Cursor Spotlight (Aceternity-style Mouse Physics, PC Only)
  // ------------------------------------------------------------------------
  function initCardSpotlight() {
    if (window.innerWidth <= 768) return;
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!isPointerFine) return;

    const spotlightCards = document.querySelectorAll(
      '.project-card, .cert-card, .skill-card, .skill-category-card, .about-visual-card, ' +
      '.gateway-card, .dev-dossier-card, .about-connect-card, .stat-item, .contact-method-card, .contact-item-card'
    );

    spotlightCards.forEach(card => {
      card.classList.add('card-spotlight');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }, { passive: true });
    });
  }

  // ------------------------------------------------------------------------
  // 13. Dynamic Active Domain Synchronization
  // ------------------------------------------------------------------------
  function initDomainSync() {
    const isXyz = window.location.hostname.toLowerCase().includes('zihan.xyz');
    const activeDomain = isXyz ? 'zihan.xyz' : 'zihan.uk';

    // Update active domain indicators in footer, dossier, links
    document.querySelectorAll('.active-domain-text, .footer-active-domain').forEach(el => {
      el.textContent = activeDomain;
      if (el.tagName === 'A') {
        el.setAttribute('href', `https://${activeDomain}`);
      }
    });

    // Dynamic canonical link update to match active origin and clean page path
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      let cleanPath = window.location.pathname;
      if (cleanPath.endsWith('/index.html')) cleanPath = cleanPath.slice(0, -10) || '/';
      else if (cleanPath.endsWith('.html')) cleanPath = cleanPath.slice(0, -5);
      canonicalTag.setAttribute('href', `https://${activeDomain}${cleanPath || '/'}`);
    }
  }

  // ------------------------------------------------------------------------
  // 14. Viewport & Visibility Aware Marquee Optimization (Zero Idle CPU Drain)
  // ------------------------------------------------------------------------
  function initMarqueeOptimization() {
    const marqueeSections = document.querySelectorAll('.marquee-section');
    if (!marqueeSections.length) return;

    if ('IntersectionObserver' in window) {
      const marqueeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const tracks = entry.target.querySelectorAll('.marquee-track');
          tracks.forEach(track => {
            track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
          });
        });
      }, {
        root: null,
        threshold: 0.05
      });

      marqueeSections.forEach(section => marqueeObserver.observe(section));
    }

    // Pause on page tab hidden
    document.addEventListener('visibilitychange', () => {
      const isVisible = document.visibilityState === 'visible';
      document.querySelectorAll('.marquee-track').forEach(track => {
        if (!isVisible) {
          track.style.animationPlayState = 'paused';
        }
      });
    }, { passive: true });
  }

  // Initialize Active Domain Sync, Hero Particles, and Micro-Interactions
  initDomainSync();
  initHeroParticles();
  initScrollReveal();
  initCounterAnimation();
  initSkillProgressAnimation();
  initCardSpotlight();
  initMarqueeOptimization();
});

