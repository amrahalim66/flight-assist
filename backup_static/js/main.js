(function () {
  "use strict";

  /* ─── Theme Toggle ─── */
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem("theme") || "light";
  html.setAttribute("data-theme", currentTheme);

  // Store Vanta instances
  let vantaHero = null;
  let vantaService = null;

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const theme = html.getAttribute("data-theme");
      const newTheme = theme === "light" ? "dark" : "light";
      html.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  /* ─── Vanta.js Clouds Background ─── */
  function initVantaClouds() {
    if (typeof VANTA === "undefined") return;

    var vantaOpts = {
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 3,
      scaleMobile: 8,
      speed: 1.0
    };

    var heroBg = document.getElementById("vanta-hero");
    if (heroBg) {
      vantaHero = VANTA.CLOUDS(Object.assign({ el: heroBg }, vantaOpts));
    }

    var heroServiceBg = document.getElementById("vanta-hero-service");
    if (heroServiceBg) {
      vantaService = VANTA.CLOUDS(Object.assign({ el: heroServiceBg }, vantaOpts));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVantaClouds);
  } else {
    initVantaClouds();
  }

  const header = document.getElementById("header");
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a[href^="#"]');

  /* ─── Sticky header ─── */
  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ─── Mobile menu ─── */
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    mobileNav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        document.body.style.overflow = "";
      });
    });
  }

  /* ─── Active nav on scroll ─── */
  const sections = document.querySelectorAll("section[id]");

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    let current = "";

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === "#" + current) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* ─── Smooth scroll for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ─── Form handlers (preview — no backend) ─── */
  function handleFormSubmit(form, successMessage) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = "Sent!";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = originalText;
        btn.disabled = false;
        form.reset();
      }, 2500);
      if (successMessage) {
        console.info(successMessage);
      }
    });
  }

  const subscribeForm = document.getElementById("subscribeForm");
  const contactForm = document.getElementById("contactForm");

  if (subscribeForm) handleFormSubmit(subscribeForm, "Subscribe submitted");
  if (contactForm) handleFormSubmit(contactForm, "Contact form submitted");

  /* ─── Enhanced scroll animations ─── */
  const observerOptions = { threshold: 0.12, rootMargin: "0px 0px -40px 0px" };

  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      } else {
        entry.target.style.opacity = "0";
        entry.target.style.transform = "translateY(24px)";
      }
    });
  }, observerOptions);

  /* Animate service page elements */
  document.querySelectorAll(".feature-detail, .overview-item, .cta-center").forEach(function (el, i) {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "opacity 0.8s ease " + (i % 3) * 0.1 + "s, transform 0.8s ease " + (i % 3) * 0.1 + "s";
    fadeObserver.observe(el);
  });

  /* Animate feature list items */
  document.querySelectorAll(".feature-list li").forEach(function (el, i) {
    el.style.opacity = "0";
    el.style.transform = "translateX(-20px)";
    el.style.transition = "opacity 0.6s ease " + i * 0.05 + "s, transform 0.6s ease " + i * 0.05 + "s";

    const listObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateX(0)";
        } else {
          entry.target.style.opacity = "0";
          entry.target.style.transform = "translateX(-20px)";
        }
      });
    }, observerOptions);

    listObserver.observe(el);
  });

  /* Standard fade-in for homepage elements */
  document.querySelectorAll(".gradient-card, .benefit-card, .stat-card, .showcase-visual").forEach(function (el, i) {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.6s ease " + (i % 3) * 0.08 + "s, transform 0.6s ease " + (i % 3) * 0.08 + "s";
    fadeObserver.observe(el);
  });
})();
