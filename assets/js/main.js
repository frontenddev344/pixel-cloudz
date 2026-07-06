/* ============================================================
   PIXELCLOUDZ — MAIN JS
   jQuery + vanilla helpers, AOS, Swiper init hooks
   ============================================================ */
(function ($) {
  "use strict";

  $(document).ready(function () {

    /* ---------- AOS ---------- */
    if (window.AOS) {
      AOS.init({ duration: 700, once: true, offset: 60, easing: "ease-out-cubic" });
    }

    /* ---------- Sticky Navbar ---------- */
    const $nav = $(".pc-navbar");
    function handleScroll() {
      if ($(window).scrollTop() > 40) $nav.addClass("scrolled");
      else $nav.removeClass("scrolled");

      if ($(window).scrollTop() > 500) $(".back-to-top").addClass("show");
      else $(".back-to-top").removeClass("show");
    }
    handleScroll();
    $(window).on("scroll", handleScroll);

    /* ---------- Back to top ---------- */
    $(".back-to-top").on("click", function () {
      $("html, body").animate({ scrollTop: 0 }, 500);
    });

    /* ---------- Mobile menu ---------- */
    $(".pc-burger").on("click", function () {
      $(".pc-mobile-menu").addClass("active");
      $(".pc-mobile-backdrop").addClass("active");
      $("body").css("overflow", "hidden");
    });
    function closeMobileMenu() {
      $(".pc-mobile-menu").removeClass("active");
      $(".pc-mobile-backdrop").removeClass("active");
      $("body").css("overflow", "");
    }
    $(".pc-mobile-backdrop, .pc-mobile-close").on("click", closeMobileMenu);
    $(".pc-mobile-menu a").on("click", closeMobileMenu);

    /* ---------- Search overlay ---------- */
    $(".pc-search-trigger").on("click", function () {
      $(".pc-search-overlay").addClass("active");
      setTimeout(() => $(".pc-search-input").trigger("focus"), 200);
    });
    $(".pc-search-close, .pc-search-overlay").on("click", function (e) {
      if (e.target === this || $(e.target).hasClass("pc-search-close")) {
        $(".pc-search-overlay").removeClass("active");
      }
    });
    $(document).on("keydown", function (e) {
      if (e.key === "Escape") {
        $(".pc-search-overlay").removeClass("active");
        closeMobileMenu();
      }
    });

    /* ---------- Hero particles ---------- */
    const $particleField = $(".hero-particles");
    if ($particleField.length) {
      const count = 40;
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const duration = Math.random() * 14 + 10;
        const delay = Math.random() * 12;
        $("<span>", { class: "particle" }).css({
          width: size + "px",
          height: size + "px",
          left: left + "%",
          bottom: "-10px",
          animationDuration: duration + "s",
          animationDelay: delay + "s"
        }).appendTo($particleField);
      }
    }

    /* ---------- Counter animation ---------- */
    function animateCounters($scope) {
      $scope.find("[data-counter]").each(function () {
        const $el = $(this);
        if ($el.data("counted")) return;
        const target = parseFloat($el.data("counter"));
        const suffix = $el.data("suffix") || "";
        const isFloat = target % 1 !== 0;
        $({ val: 0 }).animate({ val: target }, {
          duration: 1600,
          easing: "swing",
          step: function () {
            $el.text((isFloat ? this.val.toFixed(1) : Math.floor(this.val)) + suffix);
          },
          complete: function () {
            $el.text((isFloat ? target.toFixed(1) : target) + suffix);
            $el.data("counted", true);
          }
        });
      });
    }
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animateCounters($(entry.target));
      });
    }, { threshold: 0.4 });
    document.querySelectorAll(".counter-group").forEach(el => counterObserver.observe(el));

    /* ---------- Smooth scroll for in-page anchors ---------- */
    $('a[href^="#"]').not('[href="#"]').on("click", function (e) {
      const target = $(this.getAttribute("href"));
      if (target.length) {
        e.preventDefault();
        $("html, body").animate({ scrollTop: target.offset().top - 90 }, 500);
      }
    });

    /* ---------- Newsletter validation ---------- */
    $(".newsletter-form").on("submit", function (e) {
      e.preventDefault();
      const $form = $(this);
      const $input = $form.find('input[type="email"]');
      const $msg = $form.siblings(".form-msg");
      const val = $input.val().trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(val)) {
        $msg.removeClass("success").addClass("error").text("Please enter a valid email address.");
        return;
      }
      $msg.removeClass("error").addClass("success").text("You're subscribed! Welcome to the PixelCloudz crew.");
      $input.val("");
    });

    /* ---------- Contact form validation ---------- */
    $("#contactForm").on("submit", function (e) {
      const $form = $(this);
      let valid = true;
      $form.find("[required]").each(function () {
        if (!$(this).val() || ($(this).attr("type") === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($(this).val()))) {
          valid = false;
          $(this).addClass("is-invalid");
        } else {
          $(this).removeClass("is-invalid");
        }
      });
      const $status = $("#contactFormStatus");
      if (!valid) {
        e.preventDefault();
        $status.removeClass("success").addClass("error").text("Please fill in all fields correctly.").show();
        return;
      }
      // Validation passed — let the form submit for real (to FormSubmit).
      $status.removeClass("error").addClass("success").text("Sending your message...").show();
    });

    /* ---------- Review filters (reviews.html) ---------- */
    function applyFilters() {
      const search = ($("#filterSearch").val() || "").toLowerCase();
      const genre = $("#filterGenre").val();
      const platform = $("#filterPlatform").val();
      const rating = $("#filterRating").val();
      let visible = 0;

      $(".filterable-card").each(function () {
        const $card = $(this);
        const title = ($card.data("title") || "").toLowerCase();
        const g = $card.data("genre") || "";
        const p = ($card.data("platforms") || "").toString();
        const r = parseFloat($card.data("rating")) || 0;

        let show = true;
        if (search && title.indexOf(search) === -1) show = false;
        if (genre && genre !== "all" && g !== genre) show = false;
        if (platform && platform !== "all" && p.indexOf(platform) === -1) show = false;
        if (rating && rating !== "all" && r < parseFloat(rating)) show = false;

        $card.closest(".filter-col")[show ? "show" : "hide"]();
        if (show) visible++;
      });

      $("#noResults").toggle(visible === 0);
    }
    $("#filterSearch, #filterGenre, #filterPlatform, #filterRating").on("input change", applyFilters);

    function sortCards() {
      const sortBy = $("#sortBy").val();
      const $grid = $("#reviewGrid");
      const $cards = $grid.find(".filter-col").get();
      $cards.sort(function (a, b) {
        const $a = $(a).find(".filterable-card");
        const $b = $(b).find(".filterable-card");
        if (sortBy === "rating-desc") return parseFloat($b.data("rating")) - parseFloat($a.data("rating"));
        if (sortBy === "rating-asc") return parseFloat($a.data("rating")) - parseFloat($b.data("rating"));
        if (sortBy === "az") return ($a.data("title") || "").localeCompare($b.data("title") || "");
        if (sortBy === "za") return ($b.data("title") || "").localeCompare($a.data("title") || "");
        return parseInt($b.data("year")) - parseInt($a.data("year")); // newest default
      });
      $.each($cards, function (i, el) { $grid.append(el); });
    }
    $("#sortBy").on("change", sortCards);

    /* ---------- Tabs (system requirements etc, bootstrap handles most) ---------- */

    /* ---------- Screenshot lightbox thumb sync handled by Swiper in page script ---------- */

  });

})(jQuery);
