/* =============================================================================
   TOOLS
   ========================================================================== */
var tools = (function () {
    var isIE = (IEVersion = false);

    /**
     * Init tools
     */
    var init = function () {
        bindEvents();
    };

    /**
     * Bind events
     */
    var bindEvents = function () {
        // Prevent image dragging
        $("body").on("mousedown", "img", function () {
            return false;
        });

        // Fill container
        $("body").on("fill", ".fillcontainer", fillContainer);
    };

    /**
     * Fill container
     */
    var fillContainer = function () {
        var element = $(this);
        var container = element.parent();

        // Get ratio
        var ratio = element.attr("data-ratio");
        if (typeof ratio == "undefined") {
            ratio = element.width() / element.height();
            element.attr("data-ratio", ratio);
        }

        // Fill container
        var newWidth = container.width();
        var newHeight = newWidth / ratio;
        if (newHeight < container.height()) {
            newHeight = container.height();
            newWidth = newHeight * ratio;
        }
        element.css({ width: newWidth, height: newHeight });

        // Position element
        element.css({
            top: (container.height() - newHeight) / 2,
            left: (container.width() - newWidth) / 2,
        });
    };

    /**
     * Check if device is desktop
     */
    var isDesktop = function () {
        return $(window).width() >= 992;
    };

    /**
     * Check if device is tablet
     */
    var isTablet = function () {
        return $(window).width() < 992 && $(window).width() >= 768;
    };

    /**
     * Check if device is smartphone
     */
    var isSmartphone = function () {
        return $(window).width() < 768;
    };

    /**
     * Check if device is handhekd
     */
    var isSmartphone = function () {
        return isTablet() || isSmartphone();
    };

    /**
     * Detect IE
     */
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
        if (rv != -1) isIE = true;

        return rv;
    };

    /**
     * Check if device is running iOs
     */
    var isIOS = function () {
        var isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        return isIOS;
    };

    /**
     * Simplified version
     */
    var simplifiedVersion = function () {
        IEVersion = getInternetExplorerVersion();

        if (!isDesktop() || (isIE && IEVersion < 10)) return true;
        else return false;
    };

    /**
     * Public API
     */
    return {
        init: init,
        isDesktop: isDesktop,
        isTablet: isTablet,
        isSmartphone: isSmartphone,
        isIOS: isIOS,
        simplifiedVersion: simplifiedVersion,
    };
})();

/* =============================================================================
   CONTROLLER: =Site
   ========================================================================== */
var site = (function () {
    // Vars
    var isDev = false;

    /**
     * Init site
     */
    var init = function () {
        // Tools
        tools.init();

        // Bind events
        bindEvents();

        // Init slideshow
        slideshow.init();

        // Load images
        $("img.queue-loading").not(".is-loaded").queueLoading();

        // Custom select
        if ($().select2) {
            $("select.custom").select2({
                minimumResultsForSearch: -1,
            });
        }
        $("select").on("select2:open", function (e) {
            $(".select2-search input").prop("focus", false);
        });

        // Ajax pagination
        ajaxPaginationInit();

        // Update cart
        updateMiniCart();

        // Add to cart
        // $('button.single_add_to_cart_button').on('click', addToCart);

        // Init map
        if ($(".layout-contact").length == 1) initMap();
    };

    /**
     * Bind events
     */
    var bindEvents = function () {
        // Resize handler
        $(window).on("resize orientationchange", resizeHandler);

        // Scroll handler
        $(window).on("scroll", scrollHandler);

        // Nav main toggle
        $(".nav-main .nav-toggle, .nav-main .background").on(
            "click",
            navMainToggle
        );

        // Image as background
        $("body").on(
            "loaded",
            "img.queue-loading.as-background",
            setImagesAsBackground
        );
        $("body").on("loaded", "img.queue-loading", checkImageLoaded);

        // Lazy btn
        $("body").on("click", ".btn-lazy", ajaxPaginationLoad);

        // Mini cart
        if (Modernizr.touch) {
            $(".site-head").on("click", ".link-cart", function (e) {
                var count = Number($(this).find(".counter").text());

                if (count > 0) {
                    e.preventDefault();

                    var container = $(".site-head .block-cart");

                    miniCartToggle(!container.hasClass("is-opened"));
                }
            });
        } else {
            $(".site-head").on(
                "mouseenter mouseleave",
                ".block-cart",
                function (e) {
                    if (e.type == "mouseenter") {
                        miniCartToggle(true);
                    } else {
                        miniCartToggle(false);
                    }
                }
            );
        }

        // Search
        $(".site-head").on(
            "click",
            ".link-search, .form-search .close, .form-search .search-mask",
            searchToggle
        );

        // Stuff...
        $(".woocommerce-categories").on("change", "#cat", categoriesDropdown);
        $(".select-page").on("change", selectPage);
        $(".share-popup").on("click", sharePopup);

        // Reset variations
        $("form").on("click", ".reset_variations", function () {
            var select = $(this).closest("form").find("select.custom");
            select.select2("val", null);
        });

        // Change product image
        $(".variations_form").on(
            "change found_variation reset_image",
            updateProductImage
        );
    };

    /**
     * Resize handler
     */
    var resizeHandler = function () {
        $(window).trigger("scroll");

        // Global things to do on resize
        $(".fillcontainer").trigger("fill");

        // Fullheight elements
        var fullheight = $(".fullscreen, .fullheight");
        fullheight.css({ height: $(window).height() });

        // Map resize
        if ($(".layout-contact").length == 1) resizeMap();
    };

    /**
     * Scroll handler
     */
    var scrollHandler = function () {
        var scrollTop = $(window).scrollTop();

        // Global things to do on scroll
    };

    /**
     * Toggle nav
     */
    var navMainToggle = function () {
        // Selectors
        var nav = $(".nav-main");

        var wait = nav.data("wait");
        if (wait) return;
        nav.data("wait", true);

        var container = nav.find(".nav-container");
        var inner = container.find(".nav-inner");
        var logo = nav.find(".site-title");
        var links = nav.find(".menu-item, .lang");
        var background = nav.find(".background");

        if (nav.hasClass("is-opened")) {
            // Before animation
            container.css({ display: "block" });

            nav.removeClass("is-opened");

            // Animation
            var tl = new TimelineLite();
            tl.pause();

            tl.to(
                inner,
                0.5,
                {
                    x: -inner.outerWidth(),
                    ease: Power3.easeInOut,
                },
                0
            );

            tl.to(
                background,
                0.3,
                {
                    alpha: 0,
                },
                0.2
            );

            tl.call(function () {
                container.css({ display: "" });
                inner.css({ transform: "" });
                background.css({ opacity: "" });

                nav.data("wait", false);
            });

            tl.play();
        } else {
            // Before animation
            inner.css({ opacity: 0 });
            logo.css({ opacity: 0 });
            links.css({ opacity: 0 });
            background.css({ opacity: 0 });
            container.css({ display: "block" });

            nav.addClass("is-opened");

            // Animation
            var tl = new TimelineLite();
            tl.pause();

            tl.to(
                background,
                0.5,
                {
                    alpha: 1,
                },
                0
            );

            tl.fromTo(
                inner,
                0.8,
                {
                    alpha: 1,
                    x: -inner.outerWidth(),
                },
                {
                    alpha: 1,
                    x: 0,
                    ease: Power3.easeInOut,
                },
                0
            );

            tl.to(
                logo,
                0.3,
                {
                    alpha: 1,
                },
                0.7
            );

            tl.staggerFromTo(
                links,
                0.4,
                {
                    alpha: 0,
                    y: 20,
                },
                {
                    alpha: 1,
                    y: 0,
                    ease: Power3.easeOut,
                },
                0.05,
                0.4
            );

            tl.call(function () {
                inner.css({ opacity: "", transform: "" });
                logo.css({ opacity: "" });
                links.css({ opacity: "", transform: "" });
                background.css({ opacity: "" });
                container.css({ display: "" });

                nav.data("wait", false);
            });

            tl.play();
        }
    };

    /**
     * Set images as background
     */
    var setImagesAsBackground = function () {
        var image = $(this);
        var container = image.parent();

        container.css({ backgroundImage: 'url("' + image.attr("src") + '")' });
        if (!image.hasClass("visible")) image.hide();
    };

    /**
     * Check image loaded
     */
    var checkImageLoaded = function () {
        var images = $("img.queue-loading").not(".is-loaded");
        if (images.length == 0) $(window).trigger("resize");
    };

    /**
     * AJAX pagination init
     */
    var ajaxPaginationInit = function () {
        $(".woocommerce-pagination").each(function () {
            var pagination = $(this);
            var list = pagination.find("ul");

            var btn = $(
                '<div class="btn-lazy btn-text">' +
                    pagination.attr("data-link") +
                    "</div>"
            );
            pagination.append(btn);
            list.hide();
        });
    };

    /**
     * AJAX pagination load
     */
    var ajaxPaginationLoad = function () {
        // Selectors
        var btn = $(this);
        var pagination = btn.closest(".woocommerce-pagination");
        if (pagination.hasClass("is-loading")) return;

        // Get url
        var page = Number(pagination.attr("data-page"));
        var total = Number(pagination.attr("data-total"));
        var url = pagination.attr("data-url");
        url = url.replace("%#%", page + 1);

        // Load elements
        pagination.addClass("is-loading");
        $.get(url, {}, function (data) {
            // Get elements
            var elements = $(data).find(".pagination-elements > *");
            var container = $(".pagination-elements");

            // Pre animation
            var fromHeight = container.height();
            container.append(elements);

            // Load images
            $("img.queue-loading").not(".is-loaded").queueLoading();

            var toHeight = container.height();
            container.css({ overflow: "hidden", height: fromHeight });
            elements.css({ opacity: 0, top: 30 });

            $(window).trigger("resize");

            // Animation
            TweenMax.to(container, 0.5, {
                height: toHeight,
                ease: Power3.easeInOut,
                onComplete: function () {
                    container.css({ overflow: "", height: "" });
                    pagination.removeClass("is-loading");

                    $(window).trigger("resize");
                },
            });
            TweenMax.staggerTo(
                elements,
                0.4,
                {
                    alpha: 1,
                    top: 0,
                    ease: Power3.easeInOut,
                },
                0.06,
                function () {
                    elements.css({ opacity: "", top: "" });
                }
            );

            // Toggle page
            page++;
            pagination.attr("data-page", page);
            if (page == total) {
                TweenMax.to(pagination, 0.3, {
                    height: 0,
                    ease: Power3.easeInOut,
                    onComplete: function () {
                        pagination.css({ display: "none" });
                    },
                });
            }
        });
    };

    /**
     * Categories dropdown
     */
    var categoriesDropdown = function () {
        var dropdown = $(this);
        var link = dropdown.find("option:selected").val();
        if (link) location.href = link;
    };

    /**
     * Select page
     */
    var selectPage = function () {
        var dropdown = $(this);
        var link = dropdown.find("option:selected").val();
        if (link) location.href = link;
    };

    /**
     * Share popup
     */
    var sharePopup = function (e) {
        var link = $(this);

        popupCenter(link.attr("href"), link.attr("title"), 580, 470);

        e.preventDefault();
    };

    /**
     * Ajax cart
     */
    var updateMiniCart = function () {
        $.post(
            WRK.ajax_url,
            {
                action: "melville_get_mini_cart",
            },
            function (response) {
                var newCart = $(response);

                $(".site-head .block-cart").replaceWith(newCart);
            }
        );
    };

    /**
     * Toggle mini cart
     */
    var miniCartToggle = function (show) {
        var container = $(".site-head .block-cart");
        var cart = container.find(".site-cart");
        var elements = cart.find(".mini_cart_item, .cart-foot");

        if (show) {
            // Before animation
            elements.css({ opacity: 0 });
            cart.css({ display: "block" });
            container.addClass("is-opened");

            // Animation
            TweenMax.staggerFromTo(
                elements,
                0.5,
                {
                    alpha: 0,
                    y: 30,
                },
                {
                    alpha: 1,
                    y: 0,
                    ease: Power3.easeOut,
                },
                0.1,
                function () {
                    elements.css({ opacity: "", transform: "" });
                    cart.css({ display: "" });
                }
            );
        } else {
            // Before animation
            cart.css({ display: "block" });
            container.removeClass("is-opened");

            // Animation
            TweenMax.to(cart, 0.3, {
                alpha: 0,
                onComplete: function () {
                    cart.css({ display: "", opacity: "" });
                },
            });
        }
    };

    /**
     * Ajax add to cart
     */
    var addToCart = function (e) {
        e.preventDefault();

        // Selectors
        var button = $(this);
        if (button.hasClass("is-loading")) return;

        var form = button.closest("form");
        var modal = button.siblings(".modal");
        var product_id = form
            .find('input[name="product_id"], input[name="add-to-cart"]')
            .first()
            .attr("value");
        var variation_field = form.find('input[name="variation_id"]');
        if (variation_field.length == 1) {
            var variation_id = variation_field.attr("value");
        } else {
            var variation_id = false;
        }

        // Add to cart
        var mask = $(
            '<div class="btn-primary add-to-cart-loader is-loading"><span class="loader"></span><span class="inner">...</span></div>'
        );
        var maskInner = mask.find(".inner");
        var maskLoader = mask.find(".loader");
        button.after(mask);
        var buttonInner = button.find(".btn-inner");

        mask.css({ opacity: 0 });
        buttonInner.css({ display: "block" });
        modal.addClass("is-opened");

        // Animation
        var tl = new TimelineLite();
        tl.pause();

        tl.to(buttonInner, 0.15, {
            y: 10,
            alpha: 0,
            ease: Power2.easeIn,
        });

        tl.set(mask, {
            alpha: 1,
        });

        tl.from(maskLoader, 0.15, {
            alpha: 0,
        });

        tl.call(function () {
            buttonInner.attr("style", "");
            mask.attr("style", "");
            maskLoader.attr("style", "");
        });

        tl.play();

        $.post(
            WRK.ajax_url,
            {
                action: "add_to_cart",
                product_id: product_id,
                variation_id: variation_id,
            },
            function (response) {
                response = jQuery.parseJSON(response);

                if (response.success == 1) {
                    // Add message
                    maskInner.html(response.message);
                    //mask.removeClass('is-loading');

                    modal.addClass("is-opened");

                    // Animation
                    var tl = new TimelineLite();
                    tl.pause();

                    tl.to(maskLoader, 0.15, {
                        y: 10,
                        alpha: 0,
                        ease: Power2.easeIn,
                    });

                    tl.set(maskInner, {
                        alpha: 0,
                    });

                    tl.to(maskInner, 0.15, {
                        alpha: 1,
                    });

                    tl.to(
                        maskInner,
                        0.15,
                        {
                            y: 10,
                            alpha: 0,
                            ease: Power2.easeIn,
                        },
                        "+=1.5"
                    );

                    tl.set(mask, {
                        alpha: 0,
                    });
                    tl.set(buttonInner, {
                        display: "block",
                        alpha: 0,
                    });

                    tl.to(buttonInner, 0.3, {
                        alpha: 1,
                    });

                    tl.call(function () {
                        buttonInner.attr("style", "");
                        mask.remove();
                    });

                    tl.play();

                    // Update cart
                    var newCart = $(response.cart);
                    var oldCart = $(".site-head .block-cart");
                    var counter = oldCart.find(".counter");

                    var tl = new TimelineLite();
                    tl.pause();

                    tl.to(counter, 0.3, {
                        x: -20,
                        alpha: 0,
                        ease: Power3.easeIn,
                    });

                    tl.call(function () {
                        counter.html(newCart.find(".counter").html());
                    });

                    tl.to(counter, 0.3, {
                        x: 0,
                        alpha: 1,
                        ease: Power3.easeOut,
                    });

                    tl.call(function () {
                        oldCart.replaceWith(newCart);
                    });

                    tl.play();
                } else {
                    window.location.reload();
                }
            }
        );
    };

    /**
     * Update product image
     */
    var updateProductImage = function () {
        var image = $(".woocommerce-main-image img");
        var container = image.parent();

        container.css({ backgroundImage: 'url("' + image.attr("src") + '")' });
    };

    /**
     * Toggle search
     */
    var searchToggle = function (e) {
        var form = $(".site-head .form-search");

        var wait = form.data("wait");
        if (wait) return;
        form.data("wait", true);

        var inner = form.find(".search-inner");
        var mask = form.find(".search-mask");
        var input = form.find(".form-control");
        var button = form.find(".button");
        var close = form.find(".close");

        if (form.hasClass("is-visible")) {
            // Animation
            var tl = new TimelineLite();
            tl.pause();

            tl.to(
                input,
                0.3,
                {
                    x: inner.outerWidth(),
                    ease: Power3.easeIn,
                },
                0
            );

            tl.to(
                inner,
                0.3,
                {
                    alpha: 0,
                },
                0
            );

            tl.to(
                mask,
                0.5,
                {
                    alpha: 0,
                },
                0
            );

            tl.call(function () {
                mask.css({ opacity: "" });
                input.css({ opacity: "", transform: "" });
                inner.css({ opacity: "" });

                form.removeClass("is-visible");
                form.data("wait", false);
            });

            tl.play();
        } else {
            // Before animation
            mask.css({ opacity: 0 });
            input.css({ opacity: 0 });
            button.css({ opacity: 0 });
            close.css({ opacity: 0 });

            form.addClass("is-visible");

            // Animation
            var tl = new TimelineLite();
            tl.pause();

            tl.to(
                mask,
                0.5,
                {
                    alpha: 1,
                },
                0
            );

            tl.to(
                button,
                0.3,
                {
                    alpha: 1,
                },
                0
            );

            tl.fromTo(
                input,
                0.5,
                {
                    x: inner.outerWidth(),
                    alpha: 1,
                },
                {
                    x: 0,
                    alpha: 1,
                    ease: Power3.easeOut,
                },
                0.2
            );

            tl.to(
                close,
                0.3,
                {
                    alpha: 1,
                },
                0.5
            );

            tl.call(function () {
                mask.css({ opacity: "" });
                input.css({ opacity: "", transform: "" });
                button.css({ opacity: "" });
                close.css({ opacity: "" });

                form.data("wait", false);

                var field = form.find("#s");
                field.focus();
                field.get(0).setSelectionRange(0, field.val().length);
            });

            tl.play();
        }

        e.preventDefault();
    };

    /**
     * Create map
     */
    var initMap = function () {
        // Selectors
        var container = $(".layout-contact .map-container");
        if (container.length == 0) return;
        var mapContainer = container.find(".ggmap");

        // Style
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

        // Options
        var mapCenter = new google.maps.LatLng(
            mapContainer.attr("data-lat"),
            mapContainer.attr("data-lng")
        );
        var mapOptions = {
            center: mapCenter,
            zoom: 14,
            styles: styles,
            streetViewControl: false,
            mapTypeControl: false,
            // disableDefaultUI: true,
            // draggable: false,
            scrollwheel: true,
        };

        // Map
        var map = new google.maps.Map(mapContainer.get(0), mapOptions);

        // Marker
        var marker = new google.maps.Marker({
            position: mapCenter,
            map: map,
            icon: {
                url: "/wp-content1/themes/melville-shop/img/map-marker.png",
                size: new google.maps.Size(12, 20),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(6, 20),
            },
        });

        marker.addListener("click", function () {
            window.open(mapContainer.attr("data-link"));
        });

        // Save datas
        mapContainer.data("map", map);
        mapContainer.data("mapCenter", mapCenter);

        resizeMap();
    };

    /**
     * Resize map
     */
    var resizeMap = function () {
        // Selectors
        var container = $(".layout-contact .map-container");
        var mapContainer = container.find(".ggmap");

        // Get map
        var map = mapContainer.data("map");
        if (typeof map == "undefined") return;

        var mapCenter = mapContainer.data("mapCenter");
        map.setCenter(mapCenter);

        google.maps.event.trigger(map, "resize");
    };

    /**
     * Public API
     */
    return {
        init: init,
    };
})();

/* =============================================================================
   WIDGET: =Slideshow
   ========================================================================== */

var slideshow = (function () {
    var slideshowDuration = 4000;

    /**
     * Init
     */
    var init = function () {
        var pageContainer = $(".page-container").first();
        var slideshows = pageContainer.find(".slideshow");

        slideshows.each(function () {
            var slideshow = $(this);

            // Swipe handler
            slideshow.swipe({
                swipeLeft: function () {
                    nextSlide($(this), false, false);
                },
                swipeRight: function () {
                    nextSlide($(this), true, false);
                },
                preventDefaultEvents: !tools.isIOS(),
            });

            // Navigation
            slideshow.on("click", ".navigation .arrow", navigationClick);

            // Pagination
            slideshow.on("click", ".pagination .page", paginationClick);

            // Cycle
            if (slideshow.is('[data-auto="true"]')) {
                var timeout = setTimeout(function () {
                    nextSlide(slideshow, false, true);
                }, slideshowDuration);
                slideshow.data("timeout", timeout);
            }
        });
    };

    /**
     * Switch slides
     */
    var switchSlides = function (slideshow, index, auto) {
        if (slideshow.data("wait")) return;

        // Selectors
        var container = slideshow.find(".slides");
        var slides = slideshow.find(".slide");
        var activeSlide = slides.filter(".is-active");
        var newSlide = slides.eq(index);
        var pages = slideshow.find(".pagination .page");

        if (newSlide.is(activeSlide)) return;

        // Switch
        pages.removeClass("is-active");
        pages.eq(newSlide.index()).addClass("is-active");

        // Before animation
        newSlide.find(".slide-body, .slide-image").css({ opacity: 0 });
        newSlide.css({ display: "block" });

        if (activeSlide.index() > index) var fromX = -50;
        else var fromX = 50;

        // Animation
        var tl = new TimelineLite();
        tl.pause();

        tl.to(
            activeSlide.find(".slide-body"),
            0.5,
            {
                x: 30,
                alpha: 0,
                ease: Power3.easeIn,
            },
            0
        );

        tl.to(
            activeSlide.find(".slide-image"),
            0.5,
            {
                // x: fromX,
                alpha: 0,
                // ease: Power3.easeIn
            },
            0.5
        );

        tl.fromTo(
            newSlide.find(".slide-body"),
            0.5,
            {
                x: 30,
                alpha: 0,
            },
            {
                x: 0,
                alpha: 1,
                ease: Power3.easeOut,
            },
            0.5
        );

        tl.fromTo(
            newSlide.find(".slide-image"),
            0.5,
            {
                // x: -fromX,
                alpha: 0,
            },
            {
                // x: 0,
                alpha: 1,
                // ease: Power3.easeOut
            },
            0.5
        );

        tl.call(function () {
            newSlide
                .find(".slide-body, .slide-image")
                .css({ opacity: "", transform: "" });
            newSlide.css({ display: "" });
            activeSlide
                .find(".slide-body, .slide-image")
                .css({ opacity: "", transform: "" });

            newSlide.addClass("is-active");
            activeSlide.removeClass("is-active");

            slideshow.data("wait", false);

            if (auto) {
                timeout = setTimeout(function () {
                    switchSlides(slideshow, false, true);
                }, slideshowDuration);
                slideshow.data("timeout", timeout);
            }
        });

        tl.play();
    };

    /**
     * Move to next slide
     */
    var nextSlide = function (slideshow, previous, auto) {
        // Selectors
        var slides = slideshow.find(".slide");
        var activeSlide = slides.filter(".is-active");
        var newSlide = null;

        if (previous) {
            newSlide = activeSlide.prev(".slide");

            if (newSlide.length == 0) newSlide = slides.last();
        } else {
            newSlide = activeSlide.next(".slide");

            if (newSlide.length == 0)
                newSlide = slides.filter(".slide").first();
        }

        switchSlides(slideshow, newSlide.index(), auto);
    };

    /**
     * Navigation click callback
     */
    var navigationClick = function () {
        nextSlide($(this).closest(".slideshow"), $(this).hasClass("prev"));
    };

    /**
     * Pagination click callback
     */
    var paginationClick = function () {
        var page = $(this);
        var slideshow = page.closest(".slideshow");

        switchSlides(slideshow, page.index(), false);
    };

    /**
     * Public API
     */
    return {
        init: init,
    };
})();

// Launch site
site.init();
