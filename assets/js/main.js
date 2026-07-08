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

    /* ---------- Live site search (header) ---------- */
    const $searchInput = $(".pc-search-input");
    const $searchResults = $("#pcSearchResults");
    const searchIndex = (typeof PC_SEARCH_INDEX !== "undefined") ? PC_SEARCH_INDEX : [];
    let activeResultIndex = -1;

    function renderResults(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        $searchResults.removeClass("show").empty();
        return;
      }
      const matches = searchIndex.filter(item => item.title.toLowerCase().includes(q)).slice(0, 8);
      activeResultIndex = -1;
      if (matches.length === 0) {
        $searchResults.addClass("show").html('<div class="pc-search-empty">No matches for "' + $("<div>").text(query).html() + '". Try a different title.</div>');
        return;
      }
      const html = matches.map((item, i) => {
        const safeTitle = $("<div>").text(item.title).html();
        const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
        const highlighted = safeTitle.replace(re, "<mark>$1</mark>");
        return '<a href="' + item.url + '" class="pc-search-result" data-index="' + i + '">' +
          '<span class="pc-search-result-title">' + highlighted + '</span>' +
          '<span class="pc-search-result-type">' + item.type + '</span>' +
        '</a>';
      }).join("");
      $searchResults.addClass("show").html(html);
    }

    $searchInput.on("input", function () {
      renderResults($(this).val());
    });

    $searchInput.on("keydown", function (e) {
      const $items = $searchResults.find(".pc-search-result");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if ($items.length === 0) return;
        activeResultIndex = Math.min(activeResultIndex + 1, $items.length - 1);
        $items.removeClass("active").eq(activeResultIndex).addClass("active");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if ($items.length === 0) return;
        activeResultIndex = Math.max(activeResultIndex - 1, 0);
        $items.removeClass("active").eq(activeResultIndex).addClass("active");
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeResultIndex >= 0 && $items.eq(activeResultIndex).length) {
          window.location.href = $items.eq(activeResultIndex).attr("href");
        } else if ($items.length > 0) {
          window.location.href = $items.eq(0).attr("href");
        }
      }
    });

    // Reset search state whenever the overlay opens/closes
    $(".pc-search-trigger").on("click", function () {
      $searchInput.val("");
      $searchResults.removeClass("show").empty();
    });
    $(".pc-search-close, .pc-search-overlay").on("click", function (e) {
      if (e.target === this || $(e.target).hasClass("pc-search-close")) {
        $searchInput.val("");
        $searchResults.removeClass("show").empty();
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
