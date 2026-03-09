/* ============================================================
   MASSAGE THERAPY CAREERS LANDING PAGE — SCRIPTS
   Lightweight vanilla JS — no frameworks required.
   Safe for defer loading. Uses DOMContentLoaded.
   Respects prefers-reduced-motion.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS
     --------------------------------------------------------- */
  document.querySelectorAll('.career-landing a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ---------------------------------------------------------
     SCROLL-REVEAL & TIMELINE ANIMATION
     Class-based approach — single IntersectionObserver.
     CSS handles transitions via .cl-reveal / .is-visible.
     --------------------------------------------------------- */
  if (!prefersReducedMotion) {
    var revealElements = document.querySelectorAll(
      ".cl-intro__image, .cl-intro__text, " +
      ".cl-gallery .cl-container, " +
      ".cl-form-section__text, .cl-form-section__form-wrap, " +
      ".cl-videos__header, .cl-videos__card, " +
      ".cl-faq__header, .cl-faq__card, " +
      ".cl-testimonials .cl-container > .cl-tag, " +
      ".cl-testimonials .cl-container > h2, " +
      ".cl-final-cta__inner"
    );

    var timelineSteps = document.querySelectorAll(".cl-timeline__step");

    if (revealElements.length > 0 || timelineSteps.length > 0) {
      var scrollObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            scrollObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

      revealElements.forEach(function (el, i) {
        el.classList.add("cl-reveal", "cl-reveal--d" + (i % 4));
        scrollObserver.observe(el);
      });

      timelineSteps.forEach(function (step) {
        scrollObserver.observe(step);
      });
    }
  }

  /* ---------------------------------------------------------
     HORIZONTAL GALLERY — MOUSE DRAG + WHEEL SCROLL
     --------------------------------------------------------- */
  var gallery = document.querySelector(".cl-gallery__track");
  if (gallery) {
    gallery.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        gallery.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    var isDragging = false;
    var startX = 0;
    var scrollStart = 0;
    var hasDragged = false;

    gallery.addEventListener("mousedown", function (e) {
      isDragging = true;
      hasDragged = false;
      startX = e.pageX - gallery.offsetLeft;
      scrollStart = gallery.scrollLeft;
      gallery.style.cursor = "grabbing";
    });

    gallery.addEventListener("mouseleave", function () {
      isDragging = false;
      gallery.style.cursor = "grab";
    });

    gallery.addEventListener("mouseup", function () {
      isDragging = false;
      gallery.style.cursor = "grab";
    });

    gallery.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      e.preventDefault();
      hasDragged = true;
      var x = e.pageX - gallery.offsetLeft;
      gallery.scrollLeft = scrollStart - (x - startX) * 1.8;
    });

    gallery.addEventListener("click", function (e) {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  /* ---------------------------------------------------------
     FAQ FLIP CARDS
     --------------------------------------------------------- */
  document.querySelectorAll(".cl-faq__card").forEach(function (card) {
    function toggle() {
      document.querySelectorAll(".cl-faq__card.is-flipped").forEach(function (other) {
        if (other !== card) {
          other.classList.remove("is-flipped");
          other.setAttribute("aria-expanded", "false");
        }
      });
      var isFlipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-expanded", isFlipped ? "true" : "false");
    }

    card.addEventListener("click", toggle);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ---------------------------------------------------------
     TESTIMONIAL SLIDER
     --------------------------------------------------------- */
  var slider = document.getElementById("testimonial-slider");
  if (slider) {
    var track = slider.querySelector(".cl-testimonials__track");
    var cards = slider.querySelectorAll(".cl-testimonials__card");
    var prevBtn = slider.querySelector(".cl-testimonials__btn--prev");
    var nextBtn = slider.querySelector(".cl-testimonials__btn--next");
    var dotsContainer = document.getElementById("testimonial-dots");
    var currentIndex = 0;

    function getVisibleCount() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function updateSlider() {
      var visibleCount = getVisibleCount();
      var percentage = (100 / visibleCount) * currentIndex;
      track.style.transform = "translateX(-" + percentage + "%)";

      var dots = dotsContainer.querySelectorAll(".cl-testimonials__dot");
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === currentIndex);
      });

      prevBtn.style.opacity = currentIndex === 0 ? "0.4" : "1";
      nextBtn.style.opacity = currentIndex === getMaxIndex() ? "0.4" : "1";
    }

    function buildDots() {
      dotsContainer.innerHTML = "";
      var maxIndex = getMaxIndex();
      for (var i = 0; i <= maxIndex; i++) {
        var dot = document.createElement("button");
        dot.className = "cl-testimonials__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener("click", function () {
          currentIndex = parseInt(this.dataset.index);
          updateSlider();
        });
        dotsContainer.appendChild(dot);
      }
    }

    prevBtn.addEventListener("click", function () {
      currentIndex = Math.max(0, currentIndex - 1);
      updateSlider();
    });

    nextBtn.addEventListener("click", function () {
      currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
      updateSlider();
    });

    var touchStartX = 0;

    track.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener("touchend", function (e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
        } else {
          currentIndex = Math.max(0, currentIndex - 1);
        }
        updateSlider();
      }
    }, { passive: true });

    buildDots();
    updateSlider();
    window.addEventListener("resize", function () {
      currentIndex = Math.min(currentIndex, getMaxIndex());
      buildDots();
      updateSlider();
    });
  }

  /* ---------------------------------------------------------
     STAT COUNTER ANIMATION (on scroll)
     --------------------------------------------------------- */
  var statsSection = document.querySelector(".cl-stats");
  var statsAnimated = false;

  if (statsSection) {
    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          animateStats();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }

  function animateStats() {
    var statNumbers = document.querySelectorAll(".cl-stats__number");
    statNumbers.forEach(function (el) {
      var text = el.textContent.trim();
      var dataTarget = el.getAttribute("data-target");

      if (dataTarget) {
        var target = parseInt(dataTarget);
        if (prefersReducedMotion) {
          el.textContent = target + "%";
        } else {
          animateValue(el, 0, target, 1800, "%");
        }
      } else if (!prefersReducedMotion) {
        var match = text.match(/^(\d+)%$/);
        if (match) {
          animateValue(el, 0, parseInt(match[1]), 1800, "%");
        }
      }
    });
  }

  function animateValue(el, start, end, duration, suffix) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(start + (end - start) * eased) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------
     FORM SUBMISSION HANDLER (placeholder)
     --------------------------------------------------------- */
  var form = document.getElementById("career-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });

      /*
        CRM / MARKETING PLATFORM INTEGRATION:
        Replace this section with your actual form submission logic.
        Options include:
        - HubSpot Forms API
        - Salesforce Web-to-Lead
        - Mailchimp / ActiveCampaign API
        - Custom backend endpoint
        - WordPress admin-ajax.php or REST API
      */

      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = "Thank You!";
      btn.disabled = true;
      btn.style.background = "#1a8a7d";
      btn.style.borderColor = "#1a8a7d";

      setTimeout(function () {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.background = "";
        btn.style.borderColor = "";
        form.reset();
      }, 3000);
    });
  }

});
