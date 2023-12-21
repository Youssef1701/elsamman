var tools = (function () {
  var isIE = (IEVersion = !1);
  var init = function () {
    bindEvents();
  };
  var bindEvents = function () {
    $("body").on("mousedown", "img", function () {
      return !1;
    });
  };
  var isDesktop = function () {
    return $(window).width() >= 992;
  };
  var isTablet = function () {
    return $(window).width() < 992 && $(window).width() >= 768;
  };
  var isSmartphone = function () {
    return $(window).width() < 768;
  };
  var isSmartphone = function () {
    return isTablet() || isSmartphone();
  };
  var getInternetExplorerVersion = function () {
    var rv = -1;
    if (navigator.appName == "Microsoft Internet Explorer") {
      var ua = navigator.userAgent;
      var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
      if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
    } else if (navigator.appName == "Netscape") {
      var ua = navigator.userAgent;
      var re = new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})");
      if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
    }
    if (rv != -1) isIE = !0;
    return rv;
  };
  var isIOS = function () {
    var isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return isIOS;
  };
  var isMobile = function () {
    return $("html").hasClass("is-handheld");
  };
  var simplifiedVersion = function () {
    IEVersion = getInternetExplorerVersion();
    if (isMobile() || !isDesktop() || (isIE && IEVersion < 10)) {
      return !0;
    } else {
      return !1;
    }
  };
  return {
    init: init,
    isDesktop: isDesktop,
    isTablet: isTablet,
    isSmartphone: isSmartphone,
    isIOS: isIOS,
    simplifiedVersion: simplifiedVersion,
  };
})();
var site = (function () {
  var isDev = !1;
  var pageOpeningWait = !0;
  var siteIsLoading = !0;
  var pageSwitchBlocked = !1;
  var globalLoader = $(".global-loader");
  var currentURL = window.location.href;
  var pageSlug = null;
  var page = null;
  var oldPage = null;
  var ajaxNav = Modernizr.history;
  var pagesData = [];
  var linkTransition = !1;
  var siteIntroDelay = 0;
  var initTime = Date.now();
  var init = function () {
    tools.init();
    bindEvents();
    pageSlug = $(".page-container").attr("data-page").toCamel();
    page = window["page" + pageSlug];
    savePagesData(window.location.href, document.documentElement.outerHTML);
    var animLogo = bodymovin.loadAnimation({
      container: $(".site-title .animation-container").get(0),
      renderer: "svg",
      loop: !1,
      autoplay: !1,
      animationData: bmAnimationsData.logo,
    });
    $(".site-title .animation-container").data("bmAnim", animLogo);
    pageInit();
    contentLoading();
    initAccessMap();
    if (!tools.simplifiedVersion()) {
      initSmoothScroll();
      requestAnimationFrame(smoothScrollMove);
    }
  };
  var historyStateChanged = function () {
    var url = window.location.href;
    pageLoading(url, !1);
  };
  var bindEvents = function () {
    $("body").on("click", "a", linkHandler);
    $(window).on("resize orientationchange", resizeHandler);
    $(window).on("scroll", scrollHandler);
    $(".nav-main .nav-toggle, .nav-main .background").on(
      "click",
      navMainToggle
    );
    $("body").on(
      "click",
      ".link-block-access, .nav-head .link-access a, .block-access .block-toggle, .block-access .background",
      blockAccessToggle
    );
    $("body").on(
      "loaded",
      "img.queue-loading.as-background",
      setImagesAsBackground
    );
    $("body").on("loaded", "img.queue-loading", checkImageLoaded);
    $("body").on("reveal", ".scroll-reveal", scrollRevealHandler);
    $("body").on("submit", "#searchform", searchHandler);
  };
  var siteLoaded = function () {
    $(window).trigger("resize");
    siteIsLoading = !1;
  };
  var resizeHandler = function () {
    $(window).trigger("scroll");
    resizeAccessMap();
    if (!tools.simplifiedVersion()) {
      resizeContainer();
      scrollParallaxResize();
    }
  };
  var scrollHandler = function () {
    var scrollTop = $(window).scrollTop();
    if (scrollTop > 5) $(".site-head").addClass("is-sticked");
    else $(".site-head").removeClass("is-sticked");
  };
  var linkHandler = function (e) {
    var link = $(this);
    var url = link.attr("href").trimSlash();
    if (link.hasClass("no-link")) return;
    if (url.indexOf(WRK.host) === 0) {
      e.preventDefault();
      if (window.location.href.trimSlash() == url || url == "#") return;
      var wait = $(".nav-main").data("wait");
      if (wait) return;
      var transition = link.data("transition");
      if (transition != undefined) linkTransition = transition;
      else linkTransition = !1;
      link.trigger("loading");
      pageLoading(url, !0);
      if ($(".nav-main").hasClass("is-opened")) {
        navMainToggle();
      }
    }
  };
  var searchHandler = function (e) {
    var form = $(this);
    var url = form.attr("action") + "?s=" + form.find('[name="s"]').val();
    pageLoading(url, !0);
    e.preventDefault();
  };
  var showPreloader = function () {
    var container = globalLoader.find(".loader-container");
    var text = container.find("> .text");
    text.css({ opacity: 0 });
    if (isDev) siteLoaded();
    else $(window).on("load", siteLoaded);
    var tl = new TimelineLite();
    tl.pause();
    tl.to(container, 0.5, { alpha: 1 }, 0);
    tl.fromTo(
      text,
      1,
      { y: 50, alpha: 0 },
      { y: 0, alpha: 1, ease: Power3.easeOut },
      0.5
    );
    tl.call(init, null, null, 1);
    tl.play();
  };
  var pageLoading = function (url, push) {
    if ($("body").hasClass("wpb-js-composer")) {
      window.location.href = url;
      return;
    }
    if (pageSwitchBlocked) return;
    pageSwitchBlocked = !0;
    pageOutro();
    var data = getPagesData(url);
    if (data == undefined) {
      $.get(url, function (data) {
        savePagesData(url, data);
        pageCreate(data);
      }).fail(function () {
        window.location = "/404";
      });
    } else {
      pageCreate(data);
    }
    if (push) history.pushState(null, null, url.addEndSlash());
  };
  var pageCreate = function (data) {
    var html = $("<div/>").html(data);
    var newContainer = html.find(".page-container");
    newContainer.css({
      opacity: 0,
      position: "absolute",
      top: 0,
      left: "-999em",
      width: "100%",
    });
    newContainer.insertBefore(".page-container:first");
    $(".site-head").attr("class", html.find(".site-head").attr("class"));
    $(".global-container").attr(
      "class",
      html.find(".global-container").attr("class")
    );
    $("head meta")
      .filter('[name="description"], [name="keywords"], [property="og:image"]')
      .remove();
    html
      .find("meta")
      .filter('[name="description"], [name="keywords"], [property="og:image"]')
      .insertAfter('head meta[name="viewport"]');
    $(".nav-main .menu").replaceWith(html.find(".nav-main .menu"));
    $("head title").text(html.find("title").text());
    var newPageSlug = newContainer.attr("data-page").toCamel();
    oldPage = page;
    page = window["page" + newPageSlug];
    pageInit();
    pageContentLoading();
  };
  var showLoader = function () {
    var loader = $(".page-loader");
    loader.addClass("is-visible");
  };
  var hideLoader = function () {
    var loader = $(".page-loader");
    var tl = new TimelineLite();
    tl.pause();
    tl.staggerFromTo(
      loader.find(".line"),
      0.8,
      { scaleY: 1 },
      { scaleY: 0, ease: Power3.easeInOut },
      0.1
    );
    tl.call(function () {
      loader.find(".line").css({ transform: "" });
      loader.removeClass("is-visible");
      pageIntro();
    });
    tl.play();
  };
  var pageOutro = function () {
    var oldContainer = $(".page-container").first();
    var elements = $(".site-head > .site-title, .site-foot");
    var tl = new TimelineLite();
    tl.pause();
    tl.to(oldContainer, 0.4, { alpha: 0 }, 0);
    tl.to(elements, 0.4, { alpha: 0 }, 0);
    tl.to(oldContainer, 0.5, { y: 50, ease: Power2.easeIn }, 0);
    tl.call(function () {
      if (
        $(".page-container").length == 1 ||
        $(".page-container").first().data("loaded") != !0
      )
        showLoader();
    });
    tl.play();
  };
  var pageIntro = function () {
    var newContainer = $(".page-container").first();
    var oldContainer = $(".page-container").not(newContainer);
    var elements = $(".site-head > .site-title, .site-foot");
    var scroll = $(".page-scroll");
    $(window).trigger("resize");
    $(window).scrollTop(0);
    if (!tools.simplifiedVersion()) {
      $(".scroll-container").css({ transform: "translate3d(0, 0px, 0)" });
    }
    newContainer.css({ opacity: 1 });
    pageSwitch();
    var tl = new TimelineLite();
    tl.pause();
    tl.to(elements, 0.4, { alpha: 1 }, 0.8);
    tl.call(function () {
      elements.css({ opacity: "" });
      scroll.addClass("is-visible");
    });
    tl.play();
  };
  var pageSwitch = function () {
    if ($(".page-container").length > 1) {
      var newContainer = $(".page-container").first();
      var oldContainer = $(".page-container").not(newContainer);
      newContainer.css({
        opacity: "",
        position: "",
        top: "",
        left: "",
        width: "",
      });
      oldContainer.css({
        opacity: 0,
        position: "absolute",
        top: 0,
        left: "-999em",
        width: "100%",
      });
      $(window).trigger("resize");
      pageKill();
    } else {
      $(".page-container").css({
        opacity: "",
        position: "",
        top: "",
        left: "",
        width: "",
      });
    }
    initScrollAnimations();
  };
  var pageInit = function () {
    $(window).trigger("resize");
    if (!tools.simplifiedVersion()) scrollParallaxInit();
    initAccessMap();
    $(".page-container:first form").each(function () {
      var $form = $(this);
      if ($form.find(".ajax-loader").length == 0) {
        wpcf7.init($form.get(0));
      }
    });
    $("img.queue-loading").not(".is-loaded").queueLoading();
    slideshow.init();
    if (page != undefined && page.init != undefined) page.init();
  };
  var contentLoading = function () {
    var siteLoaded = !siteIsLoading;
    if (page != undefined && page.contentLoading != undefined)
      var pageLoaded = page.contentLoading();
    else var pageLoaded = !0;
    if (siteLoaded) {
      var now = Date.now();
      if (!isDev && now - initTime < siteIntroDelay) siteLoaded = !1;
    }
    if ((isDev && siteLoaded) || (siteLoaded && pageLoaded)) {
      intro();
    } else {
      setTimeout(contentLoading, 100);
    }
  };
  var pageContentLoading = function () {
    if (page != undefined && page.contentLoading != undefined)
      var pageLoaded = page.contentLoading();
    else var pageLoaded = !0;
    if (pageLoaded) {
      if ($(".page-intro .queue-loading").not(".is-loaded").length != 0)
        pageLoaded = !1;
    }
    if (pageLoaded) {
      $(".page-container").first().data("loaded", !0);
      hideLoader();
    } else {
      setTimeout(pageContentLoading, 100);
    }
  };
  var intro = function () {
    if (isDev) {
      globalLoader.remove();
      pageSwitch();
      if (page != undefined && page.intro != undefined) page.intro();
    } else {
      var animContainer = $(".site-title .animation");
      var animLogo = animContainer.data("bmAnim");
      var logo = $(".site-head > .site-title .svg-logo-melville");
      var navToggle = $(".nav-main .nav-toggle");
      var navIcon = navToggle.find(".open");
      var headLinks = $(".nav-head .menu-item");
      var footer = $(".site-foot");
      var scroll = $(".page-scroll");
      navToggle.css({ opacity: 0 });
      headLinks.css({ opacity: 0 });
      footer.css({ opacity: 0 });
      logo.hide();
      var tl = new TimelineLite();
      tl.pause();
      tl.staggerFromTo(
        globalLoader.find(".line"),
        0.5,
        { scaleY: 1 },
        { scaleY: 0, ease: Power3.easeInOut },
        0.1
      );
      tl.call(function () {
        globalLoader.remove();
        animLogo.play();
      });
      tl.fromTo(
        navToggle,
        0.5,
        { alpha: 0, x: -50 },
        { alpha: 1, x: 0, ease: Power3.easeOut },
        1.6
      );
      tl.fromTo(
        navIcon,
        0.5,
        { alpha: 0, x: -50 },
        { alpha: 1, x: 0, ease: Power3.easeOut },
        1.7
      );
      tl.staggerFromTo(
        headLinks,
        0.5,
        { alpha: 0, y: 40 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.1,
        1.6
      );
      tl.to(footer, 0.5, { alpha: 1 }, 1.7);
      tl.call(
        function () {
          scroll.addClass("is-visible");
        },
        null,
        null,
        2.5
      );
      tl.call(
        function () {
          pageSwitch();
          if (page != undefined && page.intro != undefined) page.intro();
          $(window).bind("popstate", historyStateChanged);
        },
        null,
        null,
        1.8
      );
      tl.play();
    }
  };
  var pageKill = function () {
    var newContainer = $(".page-container").first();
    var oldContainer = $(".page-container").not(newContainer);
    var controller = oldContainer.data("scrollController");
    controller.destroy();
    if (oldPage != undefined && oldPage.kill != undefined) {
      oldPage.kill();
    } else {
      oldContainer.remove();
    }
    pageSwitchBlocked = !1;
  };
  var getPage = function () {
    return page;
  };
  var savePagesData = function (url, data) {
    url = url.replace(/\/$/, "");
    pagesData[url] = data;
  };
  var getPagesData = function (url) {
    url = url.replace(/\/$/, "");
    return pagesData[url];
  };
  var initSmoothScroll = function () {
    $(".scroll-container").addClass("is-active");
  };
  var initScrollAnimations = function () {
    var controller = new ScrollMagic.Controller({ addIndicators: !1 });
    $(".page-container:first .scroll-reveal").each(function () {
      var element = $(this);
      var scene = new ScrollMagic.Scene({
        triggerHook: 0.75,
        triggerElement: element.get(0),
        reverse: !1,
      });
      scene.on("start", function (e) {
        if (e.scrollDirection != "REVERSE") {
          element.trigger("reveal");
          scene.remove();
        }
      });
      scene.addTo(controller);
    });
    $(".page-container:first").data("scrollController", controller);
  };
  var scrollParallaxInit = function () {
    var scrollElements = $(".scroll-parallax");
    scrollElements.each(function () {
      var level = $(this).attr("data-level");
      if (level == undefined) {
        var level = $(this).css("zIndex");
        if (level == "auto") level = 1;
        if (level > 5) level = 5;
        $(this).attr("data-level", level);
      } else if (level == "rand") {
        level = Math.random();
        $(this).attr("data-level", level);
      }
    });
    scrollParallaxResize();
  };
  var scrollParallaxResize = function () {
    $(".scroll-parallax").each(function () {
      var element = $(this);
      var transform = element.css("transform");
      element.css({ transform: "" });
      element.attr("data-top", element.offset().top);
      element.attr("data-bottom", element.offset().top + element.outerHeight());
      element.attr("data-start", element.offset().top - $(window).height());
      element.attr("data-stop", element.offset().top + element.outerHeight());
      element.css({ transform: transform });
    });
  };
  var smoothScrollMove = function () {
    var container = $(".scroll-container");
    var windowHeight = $(body).height();
    var windowScrollTop = $(body).scrollTop();
    var destY = windowScrollTop / 2;
    var currentY = -getTranslateY(container);
    if (Math.round(currentY) != Math.round(destY)) {
      var newY = Math.round(currentY + (destY - currentY) * 0.1);
      container.css({ transform: "translate3d(0, -" + newY + "px, 0)" });
      $(window).trigger("smoothscroll");
    }
    var scrollElements = $(".scroll-parallax");
    if (scrollElements != null) {
      scrollElements.each(function () {
        var element = $(this);
        var offsetTop = element.attr("data-top");
        var offsetBottom = element.attr("data-bottom");
        var level = Number(element.attr("data-level"));
        var amplitude = -windowHeight;
        var movement = amplitude / (5 / level);
        if (offsetTop > windowScrollTop + windowHeight * 1.3) {
          element.css({
            transform: "translate3d(0, " + -movement * 0.5 + "px, 0)",
          });
        } else if (offsetBottom < windowScrollTop * 0.7) {
          element.css({
            transform: "translate3d(0, " + movement * 0.5 + "px, 0)",
          });
        } else {
          var start = element.attr("data-start");
          var stop = element.attr("data-stop");
          var percent = (windowScrollTop - start) / (stop - start);
          percent = percent - 0.5;
          var destY = movement * percent;
          var currentY = 0;
          var transform = element.css("transform");
          if (transform != "none")
            currentY = parseFloat(element.css("transform").split(",")[5]);
          if (level > 0) var newY = currentY + (destY - currentY) * 0.1;
          else var newY = currentY + (destY - currentY) * 0.5;
          element.css({ transform: "translate3d(0, " + newY + "px, 0)" });
          var image = element
            .find("> .image, .image-container > .image")
            .not(".fixed");
          if (image.length == 1) {
            image.css({ top: 100 * percent });
          }
        }
      });
    }
    requestAnimationFrame(smoothScrollMove);
  };
  var scrollRevealHandler = function () {
    var element = $(this);
    if (element.hasClass("is-revealed")) return;
    if (element.is(".page-intro-images")) {
      var images = element.find(".image-container");
      var btn = element.find(".btn");
      var mlines = element.find(".mlines");
      var breadcrumb = element.find(".breadcrumb");
      var otherImages = element
        .find(".slideshow-intro .image")
        .not(".is-active");
      btn.css({ opacity: 0 });
      breadcrumb.css({ opacity: 0 });
      otherImages.css({ opacity: 0 });
      var splitText = new SplitText(
        element.find(".page-title span, .intro-text p, .article-meta span"),
        {
          type: "lines,words",
          linesClass: "split-line",
          wordsClass: "split-word",
        }
      );
      var lines = element.find(".split-line");
      var words = element.find(".split-word");
      words.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.call(
        function () {
          images.each(function (index) {
            var image = $(this);
            setTimeout(function () {
              image.addClass("is-visible");
            }, index * 300);
          });
        },
        null,
        null,
        0
      );
      tl.call(
        function () {
          mlines.each(function (index) {
            var line = $(this);
            setTimeout(function () {
              line.addClass("is-visible");
            }, index * 300);
          });
        },
        null,
        null,
        0.6
      );
      tl.to(breadcrumb, 0.3, { alpha: 1 }, 0.8);
      lines.each(function (index) {
        var line = $(this);
        tl.fromTo(
          line.find(".split-word"),
          0.8,
          { alpha: 1, top: line.height() },
          { alpha: 1, top: -2, ease: Power3.easeOut },
          0.8 + index * 0.1
        );
      });
      tl.fromTo(
        btn,
        0.3,
        { alpha: 0, y: 20 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        1 + lines.length * 0.1
      );
      tl.call(function () {
        btn.css({ opacity: "", transform: "" });
        breadcrumb.css({ opacity: "" });
        element.css({ opacity: "" });
        introSlideshow.init();
        otherImages.css({ opacity: "" });
        splitText.revert();
      });
      tl.play();
    } else if (element.is(".page-intro-text")) {
      var btn = element.find(".btn");
      var mlines = element.find(".mlines");
      btn.css({ opacity: 0 });
      var splitText = new SplitText(
        element.find(".page-title span, .intro-text p"),
        {
          type: "lines,words",
          linesClass: "split-line",
          wordsClass: "split-word",
        }
      );
      var lines = element.find(".split-line");
      var words = element.find(".split-word");
      words.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      lines.each(function (index) {
        var line = $(this);
        tl.fromTo(
          line.find(".split-word"),
          0.8,
          { alpha: 1, top: line.height() },
          { alpha: 1, top: -2, ease: Power3.easeOut },
          0 + index * 0.1
        );
      });
      tl.fromTo(
        btn,
        0.3,
        { alpha: 0, y: 20 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.2 + lines.length * 0.1
      );
      tl.call(
        function () {
          mlines.each(function (index) {
            var line = $(this);
            setTimeout(function () {
              line.addClass("is-visible");
            }, index * 300);
          });
        },
        null,
        null,
        0.4
      );
      tl.call(function () {
        btn.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
        splitText.revert();
      });
      tl.play();
    } else if (element.is(".section-news")) {
      var images = element.find(".image-container");
      var pages = element.find(".page");
      var mlines = element.find(".mlines");
      var elements = element.find(".section-title, .is-active .slide-body > *");
      pages.css({ opacity: 0, transition: "none" });
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.call(
        function () {
          images.each(function (index) {
            var image = $(this);
            setTimeout(function () {
              image.addClass("is-visible");
            }, index * 300);
          });
        },
        null,
        null,
        0
      );
      tl.call(
        function () {
          mlines.each(function (index) {
            var line = $(this);
            setTimeout(function () {
              line.addClass("is-visible");
            }, index * 300);
          });
        },
        null,
        null,
        1
      );
      tl.staggerFromTo(
        pages,
        0.3,
        { alpha: 1, scaleY: 0 },
        { alpha: 1, scaleY: 1, ease: Power3.easeOut },
        0.1,
        1
      );
      tl.staggerFromTo(
        elements,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.15,
        1
      );
      tl.call(function () {
        pages.css({ opacity: "", transform: "", transition: "" });
        elements.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (
      element.is(".section-shop-product") ||
      element.is(".page-section-image-large")
    ) {
      element.addClass("is-revealed");
      element.find(".image-container").addClass("is-visible");
    } else if (element.is(".image-container")) {
      element.addClass("is-revealed is-visible");
    } else if (element.is(".mlines")) {
      element.addClass("is-revealed is-visible");
    } else if (element.is(".section-body")) {
      var btn = element.find(".btn");
      var elements = element.find(".section-title, .section-text, .btn");
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.staggerFromTo(
        elements,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.15,
        0
      );
      tl.call(function () {
        elements.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (element.is(".post-preview")) {
      var elements = element.find(".post-title, .post-description, .btn");
      var image = element.find(".image-container");
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.call(
        function () {
          image.addClass("is-visible");
        },
        null,
        null,
        0
      );
      tl.staggerFromTo(
        elements,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.15,
        0.6
      );
      tl.call(function () {
        elements.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (element.is(".page-section-text-images")) {
      var elements = element.find(".text > *");
      var images = element.find(".image-container");
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.call(
        function () {
          images.each(function (index) {
            var image = $(this);
            setTimeout(function () {
              image.addClass("is-visible");
            }, index * 300);
          });
        },
        null,
        null,
        0
      );
      tl.staggerFromTo(
        elements,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.15,
        0.8
      );
      tl.call(function () {
        elements.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (
      element.is(".page-section-two-column") ||
      element.is(".page-section-one-column")
    ) {
      var elements = element.find(".text > *");
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.staggerFromTo(
        elements,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.15,
        0
      );
      tl.call(function () {
        elements.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (element.is(".concept-style")) {
      var elements = element.find(".style-title, .style-text");
      var image = element.find(".image-container");
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.call(
        function () {
          image.addClass("is-visible");
        },
        null,
        null,
        0
      );
      tl.staggerFromTo(
        elements,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.15,
        0.6
      );
      tl.call(function () {
        elements.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (element.is(".section-brands")) {
      var mask = element.find(".is-active .image-container .mask");
      var description = element.find(".is-active .brand-description > *");
      var names = element.find(".brand-name");
      var mlines = element.find(".mlines");
      mask.css({ left: 0 });
      names.css({ opacity: 0 });
      description.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.to(mask, 0.8, { left: mask.width(), ease: Power3.easeInOut }, 1);
      if (!tools.simplifiedVersion()) {
        tl.staggerFromTo(
          names,
          0.8,
          { alpha: 0, x: 30 },
          {
            alpha: 1,
            x: 0,
            ease: Power3.easeOut,
            onComplete: function () {
              mask.addClass("has-anim");
            },
          },
          0.15,
          1
        );
      } else {
        tl.fromTo(
          names,
          0.8,
          { alpha: 0, x: 30 },
          {
            alpha: 1,
            x: 0,
            ease: Power3.easeOut,
            onComplete: function () {
              mask.addClass("has-anim");
            },
          },
          1
        );
      }
      tl.call(
        function () {
          mlines.addClass("is-visible");
        },
        null,
        null,
        1.4
      );
      tl.to(description, 0.3, { alpha: 1 }, 2);
      tl.call(function () {
        mask.css({ left: "" });
        description.css({ opacity: "" });
        names.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (element.is(".b2b-range")) {
      var slides = element.find(".slides");
      var arrows = element.find(".navigation .arrow");
      var title = element.find(".range-title");
      var description = element.find(".range-description");
      var mlines = element.find(".mlines");
      slides.css({ opacity: 0 });
      arrows.css({ opacity: 0 });
      title.css({ opacity: 0 });
      description.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.fromTo(
        title,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0
      );
      tl.fromTo(
        slides,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.15
      );
      tl.fromTo(
        arrows.filter(".prev"),
        0.4,
        { alpha: 0, x: 10 },
        { alpha: 1, x: 0, ease: Power3.easeOut },
        0.4
      );
      tl.fromTo(
        arrows.filter(".next"),
        0.4,
        { alpha: 0, x: -10 },
        { alpha: 1, x: 0, ease: Power3.easeOut },
        0.4
      );
      tl.fromTo(
        description,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.3
      );
      tl.call(
        function () {
          mlines.addClass("is-visible");
        },
        null,
        null,
        0.5
      );
      tl.call(function () {
        slides.css({ opacity: "", transform: "" });
        arrows.css({ opacity: "", transform: "" });
        title.css({ opacity: "", transform: "" });
        description.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (element.is(".magazine-article")) {
      var elements = element.find(".article-body > *");
      var image = element.find(".image-container");
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.call(
        function () {
          image.addClass("is-visible");
        },
        null,
        null,
        0
      );
      tl.staggerFromTo(
        elements,
        0.8,
        { alpha: 0, y: 30 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.15,
        0.6
      );
      tl.call(function () {
        elements.css({ opacity: "", transform: "" });
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (element.is(".form-search")) {
      element.css({ opacity: 0 }).addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.to(element, 0.4, { alpha: 1 }, 0);
      tl.call(function () {
        element.css({ opacity: "" });
      });
      tl.play();
    } else if (element.is(".section-contact")) {
      var map = element.find(".map-container");
      var elements = element.find(".section-body > *");
      var mlines = element.find(".mlines");
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.staggerFromTo(
        elements,
        0.4,
        { alpha: 0, y: 20 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.1,
        0.6
      );
      tl.call(
        function () {
          map.addClass("is-visible");
        },
        null,
        null,
        1.2
      );
      tl.call(
        function () {
          mlines.addClass("is-visible");
        },
        null,
        null,
        1.4
      );
      tl.call(function () {
        elements.css({ opacity: "", transform: "" });
      });
      tl.play();
    } else if (element.is(".block-page-access")) {
      var elements = element.find(".block-title, .intro, .hours, .contacts");
      var map = element.find(".map-container");
      elements.css({ opacity: 0 });
      element.addClass("is-revealed");
      var tl = new TimelineLite();
      tl.pause();
      tl.staggerFromTo(
        elements,
        0.4,
        { alpha: 0, y: 20 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.1,
        0
      );
      tl.call(
        function () {
          map.addClass("is-visible");
        },
        null,
        null,
        0.4
      );
      tl.call(function () {
        elements.css({ opacity: "", transform: "" });
      });
      tl.play();
    } else if (element.is(".hit")) {
      element.closest(".page-scroll").addClass("is-hidden");
    }
  };
  var navMainToggle = function () {
    var nav = $(".nav-main");
    var wait = nav.data("wait");
    if (wait) return;
    nav.data("wait", !0);
    var container = nav.find(".nav-container");
    var inner = container.find(".nav-inner");
    var logo = nav.find(".site-title");
    var langs = nav.find(".lang");
    var links = nav.find(".menu-item");
    var socialTitle = nav.find(".social-links .title");
    var socialLinks = nav.find(".social-links .link");
    var background = nav.find(".background");
    if (nav.hasClass("is-opened")) {
      container.css({ display: "block" });
      nav.removeClass("is-opened");
      var tl = new TimelineLite();
      tl.pause();
      tl.to(inner, 0.5, { x: -inner.width(), ease: Power3.easeInOut }, 0);
      tl.to(background, 0.3, { alpha: 0 }, 0.2);
      tl.call(function () {
        container.css({ display: "" });
        inner.css({ transform: "" });
        background.css({ opacity: "" });
        nav.data("wait", !1);
      });
      tl.play();
    } else {
      inner.css({ opacity: 0 });
      logo.css({ opacity: 0 });
      langs.css({ opacity: 0 });
      links.css({ opacity: 0 });
      socialTitle.css({ opacity: 0 });
      socialLinks.css({ opacity: 0 });
      background.css({ opacity: 0 });
      container.css({ display: "block" });
      nav.addClass("is-opened");
      var tl = new TimelineLite();
      tl.pause();
      tl.to(background, 0.5, { alpha: 1 }, 0);
      tl.fromTo(
        inner,
        0.8,
        { alpha: 1, x: -inner.width() },
        { alpha: 1, x: 0, ease: Power3.easeInOut },
        0
      );
      tl.to(logo, 0.3, { alpha: 1 }, 0.7);
      tl.staggerFromTo(
        links,
        0.4,
        { alpha: 0, y: 20 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.05,
        0.4
      );
      tl.staggerFromTo(
        langs,
        0.4,
        { alpha: 0, y: 10 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.05,
        0.8
      );
      tl.to(socialTitle, 0.4, { alpha: 1 }, 0.6);
      tl.staggerFromTo(
        socialLinks,
        0.4,
        { alpha: 1, rotationY: 90 },
        { alpha: 1, rotationY: 0, ease: Power3.easeInOut },
        0.05,
        0.7
      );
      tl.call(function () {
        inner.css({ opacity: "", transform: "" });
        logo.css({ opacity: "" });
        langs.css({ opacity: "" });
        links.css({ opacity: "", transform: "" });
        socialTitle.css({ opacity: "" });
        socialLinks.css({ opacity: "", transform: "" });
        background.css({ opacity: "" });
        container.css({ display: "" });
        nav.data("wait", !1);
      });
      tl.play();
    }
  };
  var blockAccessToggle = function (e) {
    e.preventDefault();
    var block = $(".block-access");
    var wait = block.data("wait");
    if (wait) return;
    block.data("wait", !0);
    var inner = block.find(".block-inner");
    var elements = block.find(".block-title, .intro, .hours, .contacts");
    var map = block.find(".map-container");
    var close = block.find(".block-toggle");
    var background = block.find(".background");
    if (block.hasClass("is-opened")) {
      block.css({ top: 0, left: 0 });
      block.removeClass("is-opened");
      var tl = new TimelineLite();
      tl.pause();
      tl.to(inner, 0.5, { x: inner.outerWidth(), ease: Power3.easeInOut }, 0);
      tl.to(background, 0.3, { alpha: 0 }, 0.4);
      tl.call(function () {
        block.css({ top: "", left: "" });
        inner.css({ transform: "" });
        background.css({ opacity: "" });
        map.removeClass("is-visible");
        block.data("wait", !1);
      });
      tl.play();
    } else {
      inner.css({ opacity: 0 });
      elements.css({ opacity: 0 });
      close.css({ opacity: 0 });
      background.css({ opacity: 0 });
      block.css({ top: 0, left: 0 });
      block.addClass("is-opened");
      var tl = new TimelineLite();
      tl.pause();
      tl.to(background, 0.5, { alpha: 1 }, 0);
      tl.fromTo(
        inner,
        0.8,
        { alpha: 1, x: inner.outerWidth() },
        { alpha: 1, x: 0, ease: Power3.easeInOut },
        0
      );
      tl.staggerFromTo(
        elements,
        0.4,
        { alpha: 0, y: 20 },
        { alpha: 1, y: 0, ease: Power3.easeOut },
        0.1,
        0.6
      );
      tl.to(close, 0.4, { alpha: 1 }, 0);
      tl.call(
        function () {
          map.addClass("is-visible");
        },
        null,
        null,
        1
      );
      tl.call(function () {
        inner.css({ opacity: "", transform: "" });
        elements.css({ opacity: "", transform: "" });
        close.css({ opacity: "" });
        background.css({ opacity: "" });
        block.css({ display: "" });
        block.data("wait", !1);
      });
      tl.play();
    }
  };
  var initAccessMap = function () {
    var containers = $(
      ".block-access .map-container, .block-page-access .map-container"
    );
    containers.each(function () {
      var container = $(this);
      var mapContainer = container.find(".ggmap");
      if (mapContainer.data("map") != undefined) return;
      var styles = [
        {
          featureType: "all",
          elementType: "all",
          stylers: [{ saturation: "-100" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "administrative",
          elementType: "labels.text.fill",
          stylers: [{ lightness: "-62" }],
        },
        {
          featureType: "administrative",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "administrative.province",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "landscape",
          elementType: "geometry.fill",
          stylers: [
            { visibility: "on" },
            { lightness: "100" },
            { gamma: "10.00" },
            { saturation: "-100" },
          ],
        },
        {
          featureType: "landscape",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "landscape",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "landscape.natural",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: "simplified" }],
        },
        {
          featureType: "poi",
          elementType: "geometry.fill",
          stylers: [{ lightness: "70" }],
        },
        {
          featureType: "poi",
          elementType: "labels.icon",
          stylers: [{ lightness: "0" }],
        },
        {
          featureType: "poi.attraction",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.attraction",
          elementType: "labels.icon",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "poi.business",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.government",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.medical",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.park",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.place_of_worship",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.school",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.sports_complex",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [{ lightness: "-100" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [
            { visibility: "on" },
            { weight: "0.1" },
            { lightness: "-100" },
          ],
        },
        {
          featureType: "road",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.fill",
          stylers: [{ weight: "1" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road.highway.controlled_access",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road.arterial",
          elementType: "geometry.fill",
          stylers: [{ weight: "0.60" }, { lightness: "26" }],
        },
        {
          featureType: "road.arterial",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road.arterial",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road.local",
          elementType: "geometry.fill",
          stylers: [
            { weight: "0.38" },
            { saturation: "0" },
            { lightness: "75" },
            { gamma: "0.92" },
            { visibility: "on" },
          ],
        },
        {
          featureType: "road.local",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road.local",
          elementType: "labels.text",
          stylers: [{ visibility: "on" }, { weight: "1" }],
        },
        {
          featureType: "road.local",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels.text",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels.text.fill",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels.text.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels.icon",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "transit.line",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "transit.station",
          elementType: "all",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [
            { visibility: "on" },
            { saturation: "-100" },
            { lightness: "71" },
          ],
        },
      ];
      var mapCenter = new google.maps.LatLng(
        mapContainer.attr("data-lat"),
        mapContainer.attr("data-lng")
      );
      var mapOptions = {
        center: mapCenter,
        zoom: 14,
        styles: styles,
        streetViewControl: !1,
        mapTypeControl: !1,
        scrollwheel: !0,
      };
      var map = new google.maps.Map(mapContainer.get(0), mapOptions);
      var marker = new google.maps.Marker({
        position: mapCenter,
        map: map,
        icon: {
          url: "/wp-content/themes/melville-site/img/map-marker.png",
          size: new google.maps.Size(12, 20),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(6, 20),
        },
      });
      marker.addListener("click", function () {
        window.open(mapContainer.attr("data-link"));
      });
      mapContainer.data("map", map);
      mapContainer.data("mapCenter", mapCenter);
    });
    resizeAccessMap();
  };
  var resizeAccessMap = function () {
    var containers = $(
      ".block-access .map-container, .block-page-access .map-container"
    );
    containers.each(function () {
      var container = $(this);
      var block = container.closest(".block-inner");
      var mapContainer = container.find(".ggmap");
      if (block.length == 1) {
        var maxHeight = block.height() - container.position().top;
        container.css({ height: maxHeight });
      }
      var map = mapContainer.data("map");
      if (typeof map == "undefined") return;
      var mapCenter = mapContainer.data("mapCenter");
      map.setCenter(mapCenter);
      google.maps.event.trigger(map, "resize");
    });
  };
  var resizeContainer = function () {
    var container = $(".scroll-container");
    $("body").css({ height: container.outerHeight() });
  };
  var setImagesAsBackground = function () {
    var image = $(this);
    var container = image.parent();
    container.css({ backgroundImage: 'url("' + image.attr("src") + '")' });
    if (!image.hasClass("visible")) image.hide();
  };
  var checkImageLoaded = function () {
    var images = $("img.queue-loading").not(".is-loaded");
    if (images.length == 0) $(window).trigger("resize");
  };
  return {
    init: init,
    showPreloader: showPreloader,
    setImagesAsBackground: setImagesAsBackground,
    getPage: getPage,
    pageSwitch: pageSwitch,
  };
})();
var pageBrands = (function () {
  var pageSlug = "brands";
  var pageContainer = null;
  var init = function () {
    pageContainer = $('.page-container[data-page="' + pageSlug + '"]').first();
    bindEvents();
  };
  var bindEvents = function () {
    $(window).on("scroll smoothscroll", scrollHandler);
    pageContainer.on("click", ".brand-name", moveToBrand);
  };
  var unbindEvents = function () {
    $(window).off("scroll", scrollHandler);
    pageContainer.off("click", ".brand-name", moveToBrand);
  };
  var scrollHandler = function () {
    switchBrands();
  };
  var switchBrands = function () {
    var container = pageContainer.find(".brands");
    var brands = container.find(".brand");
    var scrollTop = $(window).scrollTop();
    var minScroll = container.offset().top - $(window).height() * 0.4;
    var maxScrollTop =
      $(document).height() - $(".site-foot").outerHeight() - $(window).height();
    var percentScroll = 0;
    if (scrollTop >= minScroll)
      var percentScroll = (scrollTop - minScroll) / (maxScrollTop - minScroll);
    var index = Math.floor(brands.length * percentScroll);
    if (index >= brands.length) index = brands.length - 1;
    var newBrand = brands.eq(index);
    brands.removeClass("is-active");
    newBrand.addClass("is-active");
  };
  var stickBrands = function () {
    var container = pageContainer.find(".brands");
    var image = container.find(".image-container").first();
    var scrollTop = $(window).scrollTop();
    var topBound = container.offset().top - scrollTop + image.height() / 2;
    var bottomBound = container.offset().top + container.height();
    container.removeClass("is-fixed is-absolute-bottom");
    if (topBound <= $(window).height() / 2) container.addClass("is-fixed");
    if (image.offset().top + image.height() > bottomBound)
      container.removeClass("is-fixed").addClass("is-absolute-bottom");
  };
  var moveToBrand = function (e) {
    var name = $(this);
    var brand = name.closest(".brand");
    var container = pageContainer.find(".brands");
    var brands = container.find(".brand");
    var minScroll = container.offset().top - $(window).height() * 0.4;
    var maxScrollTop =
      $(document).height() - $(".site-foot").outerHeight() - $(window).height();
    var percent = brand.index() / (brands.length - 1);
    var percentGap = 1 / brands.length;
    var scrollTop = (maxScrollTop - minScroll) * percent + minScroll;
    $("html,body").animate(
      { scrollTop: scrollTop },
      { duration: 500, easing: "easeInOutCubic" }
    );
  };
  var kill = function () {
    unbindEvents();
    pageContainer.remove();
  };
  return {
    init: init,
    kill: kill,
    pageSlug: pageSlug,
    pageContainer: pageContainer,
  };
})();
var pagePress = (function () {
  var pageSlug = "press";
  var pageContainer = null;
  var init = function () {
    pageContainer = $('.page-container[data-page="' + pageSlug + '"]').first();
    bindEvents();
  };
  var bindEvents = function () {
    $(window).on("resize orientationchange", resizeHandler);
  };
  var unbindEvents = function () {
    $(window).off("resize orientationchange", resizeHandler);
  };
  var resizeHandler = function () {
    $(window).trigger("scroll");
    pageContainer.find(".article").each(function () {
      var article = $(this);
      var image = article.find(".image");
      var title = article.find(".title");
      title.css({ width: image.width() });
    });
  };
  var kill = function () {
    unbindEvents();
    pageContainer.remove();
  };
  return {
    init: init,
    kill: kill,
    pageSlug: pageSlug,
    pageContainer: pageContainer,
  };
})();
var pageContact = (function () {
  var pageSlug = "contact";
  var pageContainer = null;
  var init = function () {
    pageContainer = $('.page-container[data-page="' + pageSlug + '"]').first();
    bindEvents();
    initMap();
  };
  var bindEvents = function () {
    $(window).on("resize orientationchange", resizeHandler);
  };
  var unbindEvents = function () {
    $(window).off("resize orientationchange", resizeHandler);
  };
  var resizeHandler = function () {
    $(window).trigger("scroll");
    resizeMap();
  };
  var initMap = function () {
    var container = pageContainer.find(".map-container");
    var mapContainer = container.find(".ggmap");
    var styles = [
      {
        featureType: "all",
        elementType: "all",
        stylers: [{ saturation: "-100" }],
      },
      {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "administrative",
        elementType: "labels.text.fill",
        stylers: [{ lightness: "-62" }],
      },
      {
        featureType: "administrative",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "administrative.province",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "landscape",
        elementType: "geometry.fill",
        stylers: [
          { visibility: "on" },
          { lightness: "100" },
          { gamma: "10.00" },
          { saturation: "-100" },
        ],
      },
      {
        featureType: "landscape",
        elementType: "geometry.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "landscape",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "landscape.natural",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "poi",
        elementType: "all",
        stylers: [{ visibility: "simplified" }],
      },
      {
        featureType: "poi",
        elementType: "geometry.fill",
        stylers: [{ lightness: "70" }],
      },
      {
        featureType: "poi",
        elementType: "labels.icon",
        stylers: [{ lightness: "0" }],
      },
      {
        featureType: "poi.attraction",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.attraction",
        elementType: "labels.icon",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "poi.business",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.government",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.medical",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.park",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.place_of_worship",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.school",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.sports_complex",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ lightness: "-100" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [
          { visibility: "on" },
          { weight: "0.1" },
          { lightness: "-100" },
        ],
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{ weight: "1" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.highway.controlled_access",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry.fill",
        stylers: [{ weight: "0.60" }, { lightness: "26" }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.arterial",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.local",
        elementType: "geometry.fill",
        stylers: [
          { weight: "0.38" },
          { saturation: "0" },
          { lightness: "75" },
          { gamma: "0.92" },
          { visibility: "on" },
        ],
      },
      {
        featureType: "road.local",
        elementType: "geometry.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.local",
        elementType: "labels.text",
        stylers: [{ visibility: "on" }, { weight: "1" }],
      },
      {
        featureType: "road.local",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        elementType: "labels.text",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        elementType: "labels.text.fill",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "transit.line",
        elementType: "geometry.stroke",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "transit.station",
        elementType: "all",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [
          { visibility: "on" },
          { saturation: "-100" },
          { lightness: "71" },
        ],
      },
    ];
    var mapCenter = new google.maps.LatLng(
      mapContainer.attr("data-lat"),
      mapContainer.attr("data-lng")
    );
    var mapOptions = {
      center: mapCenter,
      zoom: 14,
      styles: styles,
      streetViewControl: !1,
      mapTypeControl: !1,
      scrollwheel: !0,
    };
    var map = new google.maps.Map(mapContainer.get(0), mapOptions);
    var marker = new google.maps.Marker({
      position: mapCenter,
      map: map,
      icon: {
        url: "/wp-content/themes/melville-site/img/map-marker.png",
        size: new google.maps.Size(12, 20),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(6, 20),
      },
    });
    marker.addListener("click", function () {
      window.open(mapContainer.attr("data-link"));
    });
    mapContainer.data("map", map);
    mapContainer.data("mapCenter", mapCenter);
    resizeMap();
  };
  var resizeMap = function () {
    var container = pageContainer.find(".map-container");
    var mapContainer = container.find(".ggmap");
    var map = mapContainer.data("map");
    if (typeof map == "undefined") return;
    var mapCenter = mapContainer.data("mapCenter");
    map.setCenter(mapCenter);
    google.maps.event.trigger(map, "resize");
  };
  var kill = function () {
    unbindEvents();
    pageContainer.remove();
  };
  return {
    init: init,
    kill: kill,
    pageSlug: pageSlug,
    pageContainer: pageContainer,
  };
})();
var slideshow = (function () {
  var slideshowDuration = 4000;
  var init = function () {
    var pageContainer = $(".page-container").first();
    var slideshows = pageContainer.find(".slideshow");
    slideshows.each(function () {
      var slideshow = $(this);
      slideshow.swipe({
        swipeLeft: function () {
          nextSlide($(this), !1, !1);
        },
        swipeRight: function () {
          nextSlide($(this), !0, !1);
        },
        preventDefaultEvents: !tools.isIOS(),
      });
      slideshow.on("click", ".navigation .arrow", navigationClick);
      slideshow.on("click", ".pagination .page", paginationClick);
      if (slideshow.is('[data-auto="true"]')) {
        var timeout = setTimeout(function () {
          nextSlide(slideshow, !1, !0);
        }, slideshowDuration);
        slideshow.data("timeout", timeout);
      }
    });
    $(window).on("resize orientationchange", resizeSlideshow);
    $(".slideshow-strip .image").on("loaded", resizeSlideshow);
  };
  var resizeSlideshow = function () {
    var pageContainer = $(".page-container").first();
    if ($(this).is(".image"))
      var slideshows = $(this).closest(".slideshow-strip");
    else var slideshows = pageContainer.find(".slideshow-strip");
    slideshows.each(function () {
      var slideshow = $(this);
      var wrapper = slideshow.find(".slides-wrapper");
      var slides = slideshow.find(".slide");
      var activeSlide = slides.filter(".is-active");
      slides.each(function () {
        var slide = $(this);
        var container = slide.find(".image-container");
        var image = container.find(".image");
        container.css({ width: "" });
        container.css({ width: image.width() });
      });
      wrapper.css({ width: "" });
      var width =
        slides.last().position().left + slides.last().outerWidth() + 2;
      wrapper.css({ width: width });
      var left =
        -activeSlide.position().left +
        (slideshow.width() - activeSlide.outerWidth()) / 2;
      var minLeft = slideshow.width() - wrapper.width();
      left = Math.min(Math.max(left, minLeft), 0);
      wrapper.css({ left: left });
    });
  };
  var switchSlides = function (slideshow, index, auto) {
    if (slideshow.data("wait")) return;
    var container = slideshow.find(".slides");
    var slides = slideshow.find(".slide");
    var activeSlide = slides.filter(".is-active");
    var newSlide = slides.eq(index);
    var pages = slideshow.find(".pagination .page");
    if (newSlide.is(activeSlide)) return;
    if (slideshow.is(".slideshow-grid")) {
      var tl = new TimelineLite();
      tl.pause();
      activeSlide.each(function () {
        var slide = $(this);
        var images = slide.find(".image-container");
        var masks = slide.find(".image-container .mask");
        var elements = slide.find(".slide-title, .slide-intro, .btn");
        elements = elements.reverse();
        masks.css({ transition: "none" });
        masks.css({ left: 0, right: "100%", background: "#fff" });
        tl.staggerTo(masks, 0.5, { right: 0, ease: Power3.easeInOut }, 0.1, 0);
        tl.staggerFromTo(
          elements,
          0.3,
          { y: 0, alpha: 1 },
          { y: 20, alpha: 0, ease: Power3.easeIn },
          0.1,
          0
        );
        tl.call(function () {
          activeSlide.css({ display: "none" });
          masks.css({ left: "", right: "", transition: "", background: "" });
          elements.css({ transform: "", opacity: "" });
          images.removeClass("is-visible");
        });
      });
      newSlide.each(function () {
        var slide = $(this);
        var images = slide.find(".image-container");
        var elements = slide.find(".slide-title, .slide-intro, .btn");
        slide.css({ display: "block", zIndex: 3 });
        images.removeClass("is-visible");
        elements.css({ opacity: 0 });
        tl.call(
          function () {
            images.each(function (index) {
              var image = $(this);
              setTimeout(function () {
                image.addClass("is-visible");
              }, index * 100);
            });
          },
          null,
          null,
          0.6
        );
        tl.staggerFromTo(
          elements,
          0.3,
          { y: 20, alpha: 0 },
          { y: 0, alpha: 1, ease: Power3.easeOut },
          0.1,
          1
        );
        tl.call(function () {
          elements.css({ transform: "", opacity: "" });
        });
      });
      tl.call(
        function () {
          pages.removeClass("is-active");
          pages.eq(newSlide.index()).addClass("is-active");
        },
        null,
        null,
        0.6
      );
      tl.call(function () {
        newSlide.css({ display: "", zIndex: "" });
        activeSlide.css({ display: "" });
        newSlide.addClass("is-active");
        activeSlide.removeClass("is-active");
        slideshow.data("wait", !1);
      });
      tl.play();
    } else if (slideshow.is(".slideshow-simple")) {
      var activeImage = activeSlide.find(".image-container, .video-container");
      var newImage = newSlide.find(".image-container, .video-container");
      if (newSlide.index() > activeSlide.index()) {
        var activeLeft = 0;
        var activeRight = "auto";
        var newLeft = "auto";
        var newRight = 0;
        var fromX = 100;
      } else {
        var activeLeft = "auto";
        var activeRight = 0;
        var newLeft = 0;
        var newRight = "auto";
        var fromX = -100;
      }
      activeImage.css({
        left: activeLeft,
        right: activeRight,
        width: activeSlide.width(),
      });
      activeSlide.css({ left: activeLeft, right: activeRight });
      newImage.css({
        left: newLeft,
        right: newRight,
        width: activeSlide.width(),
      });
      newSlide.css({
        display: "block",
        left: newLeft,
        right: newRight,
        width: 0,
      });
      var tl = new TimelineLite();
      tl.pause();
      tl.to(activeSlide, 0.8, { width: 0, ease: Power3.easeInOut }, 0);
      tl.to(activeImage, 0.8, { x: -fromX, ease: Power3.easeInOut }, 0);
      tl.to(
        newSlide,
        0.8,
        { width: activeSlide.width(), ease: Power3.easeInOut },
        0
      );
      tl.fromTo(
        newImage,
        0.8,
        { x: fromX },
        { x: 0, ease: Power3.easeInOut },
        0
      );
      tl.call(function () {
        activeSlide.css({ left: "", right: "", width: "" });
        activeImage.css({ left: "", right: "", width: "", transform: "" });
        newSlide.css({ display: "", width: "", left: "", right: "" });
        newImage.css({ left: "", right: "", width: "", transform: "" });
        newSlide.addClass("is-active");
        activeSlide.removeClass("is-active");
        slideshow.data("wait", !1);
      });
      tl.play();
    } else if (slideshow.is(".slideshow-strip")) {
      var wrapper = slideshow.find(".slides-wrapper");
      newSlide.addClass("is-active");
      activeSlide.removeClass("is-active");
      var left =
        -newSlide.position().left +
        (slideshow.width() - newSlide.outerWidth()) / 2;
      var minLeft = slideshow.width() - wrapper.width();
      left = Math.min(Math.max(left, minLeft), 0);
      var tl = new TimelineLite();
      tl.pause();
      tl.to(wrapper, 0.8, { left: left, ease: Power2.easeInOut });
      tl.play();
    } else {
      newSlide.addClass("is-active");
      activeSlide.removeClass("is-active");
      pages.removeClass("is-active");
      pages.eq(newSlide.index()).addClass("is-active");
      slideshow.data("wait", !1);
    }
    if (auto) {
      timeout = setTimeout(function () {
        switchSlides(slideshow, !1, !0);
      }, slideshowDuration);
      slideshow.data("timeout", timeout);
    }
  };
  var nextSlide = function (slideshow, previous, auto) {
    var slides = slideshow.find(".slide");
    var activeSlide = slides.filter(".is-active");
    var newSlide = null;
    if (previous) {
      newSlide = activeSlide.prev(".slide");
      if (newSlide.length == 0) newSlide = slides.last();
    } else {
      newSlide = activeSlide.next(".slide");
      if (newSlide.length == 0) newSlide = slides.filter(".slide").first();
    }
    switchSlides(slideshow, newSlide.index(), auto);
  };
  var navigationClick = function () {
    nextSlide($(this).closest(".slideshow"), $(this).hasClass("prev"));
  };
  var paginationClick = function () {
    var page = $(this);
    var slideshow = page.closest(".slideshow");
    switchSlides(slideshow, page.index(), !1);
  };
  return { init: init };
})();
var introSlideshow = (function () {
  var slideshowDuration = 8000;
  var init = function () {
    var pageContainer = $(".page-container").first();
    var slideshows = pageContainer.find(".slideshow-intro");
    slideshows.each(function () {
      var slideshow = $(this);
      var timeout = setTimeout(function () {
        nextImages(slideshow);
      }, slideshowDuration);
      slideshow.data("timeout", timeout);
      loadImages(slideshow);
      slideshow.addClass("slideshow-active");
    });
  };
  var switchImages = function (slideshow, index) {
    if (slideshow.data("wait")) return;
    var images = slideshow.find(".image");
    var activeImages = images.filter(".is-active");
    var newImages = images.filter(":nth-child(" + (index + 1) + ")");
    var delay = 250;
    activeImages.each(function (i) {
      var image = $(this);
      setTimeout(function () {
        image.removeClass("is-active");
      }, i * delay);
    });
    newImages.each(function (i) {
      var image = $(this);
      setTimeout(function () {
        image.addClass("is-active");
      }, i * delay);
    });
    timeout = setTimeout(function () {
      nextImages(slideshow);
    }, slideshowDuration);
    slideshow.data("timeout", timeout);
  };
  var nextImages = function (slideshow) {
    var containers = slideshow.find(".image-container");
    var images = slideshow.find(".image");
    var activeIndex = images.filter(".is-active").first().index();
    var maxIndex = containers.first().find(".image").length - 1;
    var nextIndex = activeIndex + 1;
    if (nextIndex > maxIndex) nextIndex = 0;
    switchImages(slideshow, nextIndex);
  };
  var loadImages = function (slideshow) {
    slideshow.find("img").not(".queue-loading").css({ opacity: "" });
    slideshow
      .find("img")
      .not(".queue-loading")
      .on("loaded", site.setImagesAsBackground);
    slideshow.find("img").not(".queue-loading").queueLoading();
  };
  return { init: init };
})();
site.showPreloader();
