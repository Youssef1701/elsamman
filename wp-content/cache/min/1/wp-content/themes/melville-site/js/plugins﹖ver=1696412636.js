(function(){var method;var noop=function(){};var methods=['assert','clear','count','debug','dir','dirxml','error','exception','group','groupCollapsed','groupEnd','info','log','markTimeline','profile','profileEnd','table','time','timeEnd','timeStamp','trace','warn'];var length=methods.length;var console=(window.console=window.console||{});while(length--){method=methods[length];if(!console[method]){console[method]=noop}}}());jQuery.fn.reverse=[].reverse;String.prototype.toCamel=function(){var string=this.replace(/(\-[a-z])/g,function($1){return $1.toUpperCase().replace('-','')});string=string.replace(/(\/.*)/g,'');string=string.replace(/(^.){1}/g,function($1){return $1.toUpperCase()});return string};String.prototype.getHash=function(){var string=this.replace(AWBP.host,'').replace(/^\//g,'').replace(/\/$/g,'');if(string=='')
string='home';return string}
String.prototype.getSlug=function(){var string=this.replace(AWBP.host,'').replace(/^\//g,'').replace(/\/$/g,'');if(string=='')
string='home';return string}
String.prototype.trimSlash=function(){return this.replace(/^\/+|\/+$/gm,'')}
String.prototype.addEndSlash=function(){if(this.indexOf('?s=')!=-1){return this}else{var string=this+'/';return string.replace(/\/\/+$/gm,'/')}}
function isImageOk(img){_img=img.data('img');if(typeof _img=='undefined'){var _img=new Image();_img.src=img.attr('src');img.data('img',_img)}
if(!_img.complete){return!1}
if(typeof _img.naturalWidth!="undefined"&&_img.naturalWidth==0){return!1}
return!0}
var imagesToLoad=null;(function($){$.fn.queueLoading=function(){var maxLoading=2;var images=$(this);if(imagesToLoad==null||imagesToLoad.length==0)
imagesToLoad=images;else imagesToLoad=imagesToLoad.add(images);var imagesLoading=null;function checkImages(){imagesLoading=imagesToLoad.filter('.is-loading');imagesLoading.each(function(){var image=$(this);if(isImageOk(image)){image.addClass('is-loaded').removeClass('is-loading');image.trigger('loaded')}});imagesToLoad=images.not('.is-loaded');loadNextImages()}
function loadNextImages(){imagesLoading=imagesToLoad.filter('.is-loading');var nextImages=imagesToLoad.slice(0,maxLoading-imagesLoading.length);nextImages.each(function(){var image=$(this);if(image.hasClass('is-loading'))
return;image.attr('src',image.attr('data-src'));image.addClass('is-loading')});if(imagesToLoad.length!=0)
setTimeout(checkImages,25)}
checkImages()}}(jQuery));function popupCenter(url,title,w,h){var dualScreenLeft=window.screenLeft!==undefined?window.screenLeft:screen.left;var dualScreenTop=window.screenTop!==undefined?window.screenTop:screen.top;var width=window.innerWidth?window.innerWidth:document.documentElement.clientWidth?document.documentElement.clientWidth:screen.width;var height=window.innerHeight?window.innerHeight:document.documentElement.clientHeight?document.documentElement.clientHeight:screen.height;var left=((width/2)-(w/2))+dualScreenLeft;var top=((height/3)-(h/3))+dualScreenTop;var newWindow=window.open(url,title,'scrollbars=yes, width='+w+', height='+h+', top='+top+', left='+left);if(window.focus)
newWindow.focus()}(function(){var baseEasings={};$.each(["Quad","Cubic","Quart","Quint","Expo"],function(i,name){baseEasings[name]=function(p){return Math.pow(p,i+2)}});$.extend(baseEasings,{Sine:function(p){return 1-Math.cos(p*Math.PI/2)},Circ:function(p){return 1-Math.sqrt(1-p*p)},Elastic:function(p){return p===0||p===1?p:-Math.pow(2,8*(p-1))*Math.sin(((p-1)*80-7.5)*Math.PI/15)},Back:function(p){return p*p*(3*p-2)},Bounce:function(p){var pow2,bounce=4;while(p<((pow2=Math.pow(2,--bounce))-1)/11){}
return 1/Math.pow(4,3-bounce)-7.5625*Math.pow((pow2*3-2)/22-p,2)}});$.each(baseEasings,function(name,easeIn){$.easing["easeIn"+name]=easeIn;$.easing["easeOut"+name]=function(p){return 1-easeIn(1-p)};$.easing["easeInOut"+name]=function(p){return p<0.5?easeIn(p*2)/2:1-easeIn(p*-2+2)/2}})})();window.Modernizr=function(a,b,c){function y(a){i.cssText=a}function z(a,b){return y(l.join(a+";")+(b||""))}function A(a,b){return typeof a===b}function B(a,b){return!!~(""+a).indexOf(b)}function C(a,b){for(var d in a){var e=a[d];if(!B(e,"-")&&i[e]!==c)return b=="pfx"?e:!0}return!1}function D(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:A(f,"function")?f.bind(d||b):f}return!1}function E(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+n.join(d+" ")+d).split(" ");return A(b,"string")||A(b,"undefined")?C(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),D(e,b,c))}var d="2.8.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l=" -webkit- -moz- -o- -ms- ".split(" "),m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v=function(a,c,d,e){var h,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),l.appendChild(j);return h=["&#173;",'<style id="s',g,'">',a,"</style>"].join(""),l.id=g,(m?l:n).innerHTML+=h,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=f.style.overflow,f.style.overflow="hidden",f.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),f.style.overflow=k),!!i},w={}.hasOwnProperty,x;!A(w,"undefined")&&!A(w.call,"undefined")?x=function(a,b){return w.call(a,b)}:x=function(a,b){return b in a&&A(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e}),p.history=function(){return!!a.history&&!!history.pushState},p.csstransforms3d=function(){var a=!!E("perspective");return a&&"webkitPerspective"in f.style&&v("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a};for(var F in p)x(p,F)&&(u=F.toLowerCase(),e[u]=p[F](),s.push((e[u]?"":"no-")+u));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)x(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},y(""),h=j=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=l,e._domPrefixes=o,e._cssomPrefixes=n,e.testProp=function(a){return C([a])},e.testAllProps=E,e.testStyles=v,e}(this,this.document);function getTranslateY(element){var style=window.getComputedStyle(element.get(0));var matrix=style.getPropertyValue("-webkit-transform")||style.getPropertyValue("-moz-transform")||style.getPropertyValue("-ms-transform")||style.getPropertyValue("-o-transform")||style.getPropertyValue("transform");if(matrix==='none'){matrix='matrix(0,0,0,0,0)'}
var values=matrix.match(/([-+]?[\d\.]+)/g);return values[14]||values[5]||0}