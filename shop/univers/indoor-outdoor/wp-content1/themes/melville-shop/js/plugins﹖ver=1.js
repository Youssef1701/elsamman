/* Avoid `console` errors in browsers that lack a console
   -------------------------------------------------------------------------- */
    (function() {
        var method;
        var noop = function () {};
        var methods = [
            'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
            'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
            'timeStamp', 'trace', 'warn'
        ];
        var length = methods.length;
        var console = (window.console = window.console || {});

        while (length--) {
            method = methods[length];

            // Only stub undefined methods.
            if (!console[method]) {
                console[method] = noop;
            }
        }
    }());


/* Reverse a selection
   -------------------------------------------------------------------------- */
    jQuery.fn.reverse = [].reverse;


/* Shuffle a selection
   -------------------------------------------------------------------------- */
	$.fn.shuffle = function() {

	  var elements = this.get()
	  var copy = [].concat(elements)
	  var shuffled = []
	  var placeholders = []

	  // Shuffle the element array
	  while (copy.length) {
	    var rand = Math.floor(Math.random() * copy.length)
	    var element = copy.splice(rand,1)[0]
	    shuffled.push(element)
	  }

	  // replace all elements with a plcaceholder
	  for (var i = 0; i < elements.length; i++) {
	    var placeholder = document.createTextNode('')
	    findAndReplace(elements[i], placeholder)
	    placeholders.push(placeholder)
	  }

	  // replace the placeholders with the shuffled elements
	  for (var i = 0; i < elements.length; i++) {
	    findAndReplace(placeholders[i], shuffled[i])
	  }

	  return $(shuffled)

	}

	function findAndReplace(find, replace) {
	  find.parentNode.replaceChild(replace, find)
	}


/* Convert string to Camel Case
   -------------------------------------------------------------------------- */
    String.prototype.toCamel = function(){
        var string = this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
        string = string.replace(/(\/.*)/g, '');
        string = string.replace(/(^.){1}/g, function($1){return $1.toUpperCase();});
        return string;
    };


/* Get hash from URL
   -------------------------------------------------------------------------- */
	String.prototype.getHash = function(){
		var string = this.replace(WRK.host, '').replace(/^\//g, '').replace(/\/$/g, '');

		if (string == '')
			string = 'home';
		return string;
	}


/* Get slug from URL
   -------------------------------------------------------------------------- */
	String.prototype.getSlug = function(){
		var string = this.replace(WRK.host, '').replace(/^\//g, '').replace(/\/$/g, '');

		if (string == '')
			string = 'home';
		return string;
	}


/* Trim slash from string
   -------------------------------------------------------------------------- */
	String.prototype.trimSlash = function() {
		return this.replace(/^\/+|\/+$/gm,'');
	}


/* Check if image is loaded
   -------------------------------------------------------------------------- */
	function isImageOk(img) {
		_img = img.data('img');
		if (typeof _img == 'undefined') {
			var _img = new Image();
			if (img.is('div'))
				_img.src = img.css('backgroundImage').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
			else if (img.attr('src'))
				_img.src = img.attr('src');
			else if (img.attr('xlink:href'))
				_img.src = img.attr('xlink:href');
			else
				_img.src = img;

			img.data('img', _img);
		}

		if (!_img.complete) {
			return false;
		}

		if (typeof _img.naturalWidth != "undefined" && _img.naturalWidth == 0) {
			return false;
		}

		return true;
	}


/* Check if video is loaded
   -------------------------------------------------------------------------- */
	function isVideoOk(video) {
		if (typeof(video) == 'object')
			video = video.get(0);

		if (video.readyState === 4)
			return true;
		else
			return false;
	}


/* Images queue loading
   -------------------------------------------------------------------------- */
	var imagesToLoad = null;

	(function( $ ) {
		$.fn.queueLoading = function() {
			var maxLoading = 2;

			var images = $(this);
			if (imagesToLoad == null || imagesToLoad.length == 0)
				imagesToLoad = images;
			else
				imagesToLoad = imagesToLoad.add(images);
			var imagesLoading = null;

			function checkImages() {
				// Get loading images
				imagesLoading = imagesToLoad.filter('.is-loading');

				// Check if loading images are ready or not
				imagesLoading.each(function() {
					var image = $(this);

					if (isImageOk(image)) {
						image.addClass('is-loaded').removeClass('is-loading');
						image.trigger('loaded');
					}
				});

				// Remove loaded images from images to load list
				imagesToLoad = images.not('.is-loaded');

				// Load next images
				loadNextImages();
			}

			function loadNextImages() {
				// Get images not already loading
				imagesLoading = imagesToLoad.filter('.is-loading');
				var nextImages = imagesToLoad.slice(0, maxLoading-imagesLoading.length);

				nextImages.each(function() {
					var image = $(this);
					if (image.hasClass('is-loading'))
						return;

					// Start loading
					image.attr('src', image.attr('data-src'));
					image.addClass('is-loading');
				});

				if (imagesToLoad.length != 0)
					setTimeout(checkImages, 25);
			}

			checkImages();
		};
	}( jQuery ));


/* Open a popup centered in viewport
   -------------------------------------------------------------------------- */
	function popupCenter(url, title, w, h) {
		// Fixes dual-screen position Most browsers Firefox
		var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

		var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

		var left = ((width / 2) - (w / 2)) + dualScreenLeft;
		var top = ((height / 3) - (h / 3)) + dualScreenTop;

		var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

		// Puts focus on the newWindow
		if (window.focus)
			newWindow.focus();
	}


/* Easing
   -------------------------------------------------------------------------- */
	(function() {

		// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

		var baseEasings = {};

		$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
			baseEasings[ name ] = function( p ) {
				return Math.pow( p, i + 2 );
			};
		});

		$.extend( baseEasings, {
			Sine: function( p ) {
				return 1 - Math.cos( p * Math.PI / 2 );
			},
			Circ: function( p ) {
				return 1 - Math.sqrt( 1 - p * p );
			},
			Elastic: function( p ) {
				return p === 0 || p === 1 ? p :
					-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
			},
			Back: function( p ) {
				return p * p * ( 3 * p - 2 );
			},
			Bounce: function( p ) {
				var pow2,
					bounce = 4;

				while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
				return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
			}
		});

		$.each( baseEasings, function( name, easeIn ) {
			$.easing[ "easeIn" + name ] = easeIn;
			$.easing[ "easeOut" + name ] = function( p ) {
				return 1 - easeIn( 1 - p );
			};
			$.easing[ "easeInOut" + name ] = function( p ) {
				return p < 0.5 ?
					easeIn( p * 2 ) / 2 :
					1 - easeIn( p * -2 + 2 ) / 2;
			};
		});

	})();


/*! modernizr 3.3.1 (Custom Build) | MIT *
 * https://modernizr.com/download/?-touchevents-setclasses !*/
!function(e,n,t){function o(e,n){return typeof e===n}function s(){var e,n,t,s,a,i,r;for(var l in c)if(c.hasOwnProperty(l)){if(e=[],n=c[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(s=o(n.fn,"function")?n.fn():n.fn,a=0;a<e.length;a++)i=e[a],r=i.split("."),1===r.length?Modernizr[r[0]]=s:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=s),f.push((s?"":"no-")+r.join("-"))}}function a(e){var n=u.className,t=Modernizr._config.classPrefix||"";if(p&&(n=n.baseVal),Modernizr._config.enableJSClass){var o=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(o,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),p?u.className.baseVal=n:u.className=n)}function i(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):p?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function r(){var e=n.body;return e||(e=i(p?"svg":"body"),e.fake=!0),e}function l(e,t,o,s){var a,l,f,c,d="modernizr",p=i("div"),h=r();if(parseInt(o,10))for(;o--;)f=i("div"),f.id=s?s[o]:d+(o+1),p.appendChild(f);return a=i("style"),a.type="text/css",a.id="s"+d,(h.fake?h:p).appendChild(a),h.appendChild(p),a.styleSheet?a.styleSheet.cssText=e:a.appendChild(n.createTextNode(e)),p.id=d,h.fake&&(h.style.background="",h.style.overflow="hidden",c=u.style.overflow,u.style.overflow="hidden",u.appendChild(h)),l=t(p,e),h.fake?(h.parentNode.removeChild(h),u.style.overflow=c,u.offsetHeight):p.parentNode.removeChild(p),!!l}var f=[],c=[],d={_version:"3.3.1",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){c.push({name:e,fn:n,options:t})},addAsyncTest:function(e){c.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=d,Modernizr=new Modernizr;var u=n.documentElement,p="svg"===u.nodeName.toLowerCase(),h=d._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];d._prefixes=h;var m=d.testStyles=l;Modernizr.addTest("touchevents",function(){var t;if("ontouchstart"in e||e.DocumentTouch&&n instanceof DocumentTouch)t=!0;else{var o=["@media (",h.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");m(o,function(e){t=9===e.offsetTop})}return t}),s(),a(f),delete d.addTest,delete d.addAsyncTest;for(var v=0;v<Modernizr._q.length;v++)Modernizr._q[v]();e.Modernizr=Modernizr}(window,document);