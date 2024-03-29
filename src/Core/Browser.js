if (!Z.runningInNode) {
    (function () {

            var ua = navigator.userAgent.toLowerCase(),
            doc = document.documentElement,

            ie = 'ActiveXObject' in window,

            webkit    = ua.indexOf('webkit') !== -1,
            phantomjs = ua.indexOf('phantom') !== -1,
            android23 = ua.search('android [23]') !== -1,
            chrome    = ua.indexOf('chrome') !== -1,
            gecko     = ua.indexOf('gecko') !== -1  && !webkit && !window.opera && !ie,

            mobile = typeof orientation !== 'undefined' || ua.indexOf('mobile') !== -1,
            msPointer = !window.PointerEvent && window.MSPointerEvent,
            pointer = (window.PointerEvent && navigator.pointerEnabled) || msPointer,

            ie3d = ie && ('transition' in doc.style),
            webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
            gecko3d = 'MozPerspective' in doc.style,
            opera12 = 'OTransition' in doc.style,
            any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantomjs;

        var touch = !window.L_NO_TOUCH && !phantomjs && (pointer || 'ontouchstart' in window ||
                (window.DocumentTouch && document instanceof window.DocumentTouch));

        Z.Browser = {
            ie: ie,
            ielt9: ie && !document.addEventListener,
            edge: 'msLaunchUri' in navigator && !('documentMode' in document),
            webkit: webkit,
            gecko: gecko,
            android: ua.indexOf('android') !== -1,
            android23: android23,
            chrome: chrome,
            safari: !chrome && ua.indexOf('safari') !== -1,

            ie3d: ie3d,
            webkit3d: webkit3d,
            gecko3d: gecko3d,
            opera12: opera12,
            any3d: any3d,

            mobile: mobile,
            mobileWebkit: mobile && webkit,
            mobileWebkit3d: mobile && webkit3d,
            mobileOpera: mobile && window.opera,
            mobileGecko: mobile && gecko,

            touch: !!touch,
            msPointer: !!msPointer,
            pointer: !!pointer,

            retina: (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1,

            /**
             * @property {String} 语言
             * @static
             */
            language: navigator.browserLanguage?navigator.browserLanguage:navigator.language,
            ie9: (ie && document.documentMode === 9),
            /**
             * @property {Boolean} 是否支持canvas
             * @static
             */
            canvas: (!!document.createElement("canvas").getContext)
        };
        Z.Browser.translateDom = (Z.Browser.any3d && !ie);
    }());
} else {
    //usually in node
    Z.Browser = {
        canvas:true
    };
}

