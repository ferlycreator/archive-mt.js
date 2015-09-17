(function () {

	var ie = 'ActiveXObject' in window,
		ielt9 = ie && !document.addEventListener,

		// terrible browser detection to work around Safari / iOS / Android browser bugs
		ua = navigator.userAgent.toLowerCase(),
		webkit = ua.indexOf('webkit') !== -1,
		chrome = ua.indexOf('chrome') !== -1,
		phantomjs = ua.indexOf('phantom') !== -1,
		android = ua.indexOf('android') !== -1,
		android23 = ua.search('android [23]') !== -1,
		gecko = ua.indexOf('gecko') !== -1,

		mobile = typeof orientation !== undefined + '',
		msPointer = window.navigator && window.navigator.msPointerEnabled &&
	    	window.navigator.msMaxTouchPoints && !window.PointerEvent,
		pointer = (window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints) ||
				  msPointer,
	    retina = ('devicePixelRatio' in window && window['devicePixelRatio'] > 1) ||
	             ('matchMedia' in window && window['matchMedia']('(min-resolution:144dpi)') &&
	              window['matchMedia']('(min-resolution:144dpi)').matches),

	    doc = document.documentElement,
	    ie3d = ie && ('transition' in doc.style),
	    webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window['WebKitCSSMatrix']()) && !android23,
	    gecko3d = 'MozPerspective' in doc.style,
	    opera3d = 'OTransition' in doc.style,
	    any3d = !window['L_DISABLE_3D'] && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs,
	    language = navigator.browserLanguage?navigator.browserLanguage:navigator.language;


	// PhantomJS has 'ontouchstart' in document.documentElement, but doesn't actually support touch.
	// https://github.com/Leaflet/Leaflet/pull/1434#issuecomment-13843151

	var touch = !window.L_NO_TOUCH && !phantomjs && (function () {

		var startName = 'ontouchstart';

		// IE10+ (We simulate these into touch* events in L.DomEvent and L.DomEvent.Pointer) or WebKit, etc.
		if (pointer || (startName in doc)) {
			return true;
		}

		// Firefox/Gecko
		var div = document.createElement('div'),
		    supported = false;

		if (!div.setAttribute) {
			return false;
		}
		div.setAttribute(startName, 'return;');

		if (typeof div[startName] === 'function') {
			supported = true;
		}

		div.removeAttribute(startName);
		div = null;

		return supported;
	}());

    /**
     * 浏览器
     * @class maptalks.Browser
     * @author Maptalks Team
     */
	Z.Browser = {
	    /**
         * @property {Boolean} 是否为id
         * @static
         */
		ie: ie,
		/**
         * @property {Boolean} 是否为ie9以下
         * @static
         */
		ielt9: ielt9,
		webkit: webkit,
		gecko: gecko && !webkit && !window.opera && !ie,

        /**
         * @property {Boolean} 是否为android系统
         * @static
         */
		android: android,
		android23: android23,

        /**
         * @property {Boolean} 是否为chrome
         * @static
         */
		chrome: chrome,

        /**
         * @property {Boolean} 是否支持3D
         * @static
         */
		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		opera3d: opera3d,
		any3d: any3d,

        /**
         * @property {Boolean} 是否为移动设备
         * @static
         */
		mobile: mobile,
		mobileWebkit: mobile && webkit,
		mobileWebkit3d: mobile && webkit3d,
		mobileOpera: mobile && window.opera,

        /**
         * @property {Boolean} 是否触摸屏
         * @static
         */
		touch: touch,
		msPointer: msPointer,
		pointer: pointer,

        /**
         * @property {Boolean} 是否为retina屏
         * @static
         */
		retina: retina,

        /**
         * @property {String} 语言
         * @static
         */
		language:language,
		translateDom:(any3d && !ie),

        /**
         * @property {Boolean} 是否支持canvas
         * @static
         */
		canvas:!!document.createElement("canvas").getContext
	};

}());