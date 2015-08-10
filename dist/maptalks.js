(function(){

var Z = window['Z'] = Z || {};

Z.DEBUG=true;

Z.loadModule=function(module,callback,context) {
    var suffix = '.min.js';
    if (Z.DEBUG) {
        suffix = '.js';
    }
    var url = Z.host+'/engine/js/build/v2/modules/'+module+suffix;
    Z.Util.Ajax.getScript(url,function() {
            callback.call(context);
        });
};

//常量定义
//Z['foo']方式定义为对外的公开常量
//Z.foo方式定义为不对外公开的常量
Z['defaultCoordinateType'] = Z.defaultCoordinateType = 'gcj02';

Z.Util = {

    globalCounter:0,

    extend: function (dest) { // (Object[, Object, ...]) ->
        var sources = Array.prototype.slice.call(arguments, 1),i, j, len, src;

        for (j = 0, len = sources.length; j < len; j++) {
            src = sources[j] || {};
            for (i in src) {
                if (src.hasOwnProperty(i)) {
                    dest[i] = src[i];
                }
            }
        }
        return dest;
    },

    setOptions: function (obj, options) {
        if (!obj.hasOwnProperty('options')) {
            obj.options = obj.options ? Z.Util.create(obj.options) : {};
        }
        for (var i in options) {
            obj.options[i] = options[i];
        }
        return obj.options;
    },

    trim: function (str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    },

    splitWords: function (str) {
        return Z.Util.trim(str).split(/\s+/);
    },

    fixPNG:function(img) {
        
    },

    GUID:function() {
        return '___GLOBAL_'+(Z.Util.globalCounter++);
    },

    stamp: function (obj) {
        obj._Z_id = obj._Z_id || ++Z.Util.lastId;
        return obj._Z_id;
    },

    lastId: 0,

    parseJson:function(str) {
        if (!str || !Z.Util.isString(str)) {
            return null;
        }
        return JSON.parse(str);
    },

    create: Object.create || (function () {
        function F() {}
        return function (proto) {
            F.prototype = proto;
            return new F();
        };
    })(),

    bind: function (fn, obj) {
        var slice = Array.prototype.slice;

        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }

        var args = slice.call(arguments, 2);

        return function () {
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
    },
    
    /**
     * 遍历数组中的每个元素,并执行fn操作, 兼容一维数组和二维数组, 如果数组中有null或undefined,则continue不作处理
     * @param  {[type]}   points [description]
     * @param  {Function} fn     [description]
     * @return {[type]}          [description]
     */
    eachInArray:function(points, context, fn) {
        if (!this.isArray(points)) {
            return null;
        }
        var result = [];
        for (var i=0,len=points.length;i<len;i++) {
            var p = points[i];
            if (Z.Util.isNil(p)) {
                continue;
            }
            if (Z.Util.isArray(p)) {
                //二维数组
                var p_r = [];
                for (var j=0,jlen=p.length;j<jlen;j++) {
                    if (Z.Util.isNil(p[j])) {
                        continue;
                    }
                    p_r.push(fn.call(context,p[j]));
                }
                result.push(p_r);
            } else {
                var pp = fn.call(context,p);
                result.push(pp);   
            }
            
        }
        return result;
    },

    /**
     * 在数组arr中查找obj,并返回其序号index
     * @param  {Object} obj 查找的对象
     * @param  {目标数组} arr 查找的目标数组
     * @return {Number}     序号
     */
    searchInArray:function(obj, arr) {
        if (!obj || arr) {
            return -1;
        }
        
        for (var i = 0, len=arr.length; i < len; i++) {
            if (arr[i] == obj) {
                return i;
            }
        }
        return -1;
    },

    /**
     * canvas坐标值处理
     * @param  {Number} num 坐标值
     * @return {Number}     处理后的坐标值
     */
    canvasNumber:function(num) {
        return (0.5 + num) << 0 + 0.5;
    },

    isCoordinate:function(obj) {
        if (obj instanceof Z.Coordinate) {
            return true;
        }
        if (obj && !Z.Util.isNil(obj.x) && !Z.Util.isNil(obj.y)) {
            return true;
        }
        return false;
    },
    /**
     * 判断obj是否为undefined或者null
     * @param  {[type]}  obj [description]
     * @return {Boolean}     [description]
     */
    isNil:function(obj) {
        return (obj === undefined || obj === null);
    },

    /**
     * 判断val是不是合法的数字, 即数字类型且不是NaN
     * @param  {Object}  val 考察的数字
     * @return {Boolean}     结果
     */
    isNumber:function(val) {
        return (typeof val === 'number') && !isNaN(val);
    },

    /**
     * 数字四舍五入, 效率较高
     * @param  {[type]} num [description]
     * @return {[type]}     [description]
     */
    roundNumber:function(num) {
        return (0.5+num) << 0;
    },

    isArrayHasData:function(obj) {
        return this.isArray(obj) && obj.length>0;
    },

    isArray:function(obj) {
        if (!obj) {return false;}
        return typeof obj == 'array' || (obj.constructor !== null && obj.constructor == Array);
    },

    isString:function(_str) {
        if (_str === null || _str === undefined) {return false;}
        return typeof _str == 'string' || (_str.constructor!==null && _str.constructor == String);
    },

    isFunction:function(_func) {
        if (this.isNil(_func)) {
            return false;
        }
        return typeof _func == 'function' || (_func.constructor!==null && _func.constructor == Function);
    },

    /**
     * 转换对象属性变量名风格, 即将属性名在camel风格到minus风格间转换
     * @param  {Object} symbol 对象
     * @param  {String} style   转换风格:'minus'或'camel'
     * @return {Object}    转换后的对象
     */
    convertFieldNameStyle:function(symbol,style) {
        if (!symbol) {
            return null;
        }
        var fn;
        if (style === 'minus') {
            fn = this.convertCamelToMinus;
        } else {
            fn = this.convertMinusToCamel;
        }
        var option = {};
        for (var p in symbol) {
            if (symbol.hasOwnProperty(p)) {
                if (p === "") {continue;}
                option[fn(p)]=symbol[p];
            }
        }
        return option;
    },

    /**
     * 将带减号的名称转化为camel名称, 如foo-class -> fooClass
     * @param  {String} p 带减号名称
     * @return {String}   camel名称
     */
    convertMinusToCamel:function(p) {
        if (!p) {
            return null;
        }
        var catched = false;
        var ret = [];
        for ( var i = 0, len = p.length; i < len; i++) {
            var currChar = p[i];
            if (Z.Util.isNil(currChar)) {
                currChar = p.charAt(i);
            }
            if (currChar === "-") {
                catched = true;
                continue;
            }
            if (catched) {
                ret.push(currChar.toUpperCase());
                catched = false;
            } else {
                ret.push(currChar);
            }
        }
        return ret.join("");
    },

    /**
     * 将camel名称转化为带减号的名称, 如fooClass -> foo-class
     * @param  {String} p camel名称
     * @return {String}   带减号名称
     */
    convertCamelToMinus:function(p) {
        function isUpperCase(chr) {
            if (!chr) {return false;}
            return (chr.charCodeAt(0)>=65)&&(chr.charCodeAt(0)<=90);
        }
        if (!p) {return null;}
        var ret=[];
        for (var i=0, len=p.length;i<len;i++) {
            var currChar = p[i];
            if (!currChar) {
                //ie 6, ie 7取字符方法
                currChar = p.charAt(i);
            }
            if (isUpperCase(currChar)) {
                ret.push("-");
                ret.push(currChar.toLowerCase());
            } else {
                ret.push(currChar);
            }
        }
        return ret.join("");
    },

    //borrowed from jquery, Evaluates a script in a global context
    globalEval: function( code ) {
        var script = document.createElement( "script" );

        script.text = code;
        document.head.appendChild( script ).parentNode.removeChild( script );
    }


};


//动画
(function () {
    // inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

    function getPrefixed(name) {
        return window['webkit' + name] || window['moz' + name] || window['ms' + name];
    }

    var lastTime = 0;

    // fallback for IE 7-8
    function timeoutDefer(fn) {
        var time = +new Date(),
            timeToCall = Math.max(0, 16 - (time - lastTime));

        lastTime = time + timeToCall;
        return window.setTimeout(fn, timeToCall);
    }

    var requestFn = window['requestAnimationFrame'] || getPrefixed('RequestAnimationFrame') || timeoutDefer,
        cancelFn = window['cancelAnimationFrame'] || getPrefixed('CancelAnimationFrame') ||
                   getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };


    Z.Util.requestAnimFrame = function (fn) {
            return requestFn.call(window, fn);
    };

    Z.Util.cancelAnimFrame = function (id) {
        if (id) {
            cancelFn.call(window, id);
        }
    };
})();

Z.Util.Ajax=function(sUrl,sRecvTyp,sQueryString,oResultFunc,responseType) {
    this.Url = sUrl;
    this.QueryString = sQueryString;
    this.resultFunc = oResultFunc;
    this.reponseType = responseType;
    this.XmlHttp = this.createXMLHttpRequest();     
    if (!this.XmlHttp) {
        alert("error");
        return;
    }
    var objxml = this.XmlHttp;
    var me = this;
    if((window.XDomainRequest && document["documentMode"] === 8) || objxml.withCredentials!==undefined){    //xhr2直接用onload 
        objxml.onload = function (){me.handleStateChange(objxml,sRecvTyp,oResultFunc);};
    }else{      
        objxml.onreadystatechange = function (){me.handleStateChange(objxml,sRecvTyp,oResultFunc);};
    }
};

Z.Util.Ajax.prototype= {
    createXMLHttpRequest : function() {
        if (Z.Browser.ie) {
            if (document["documentMode"] == 8) {
                try { return new XDomainRequest();} catch(e) {}
            }
        }
        try { return new XMLHttpRequest(); } catch(e) {}
        try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch(e) {}
        try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {}
        
        return null;
    },

    createQueryString : function () {
        var queryString = this.QueryString;
        return queryString;
    },

    get : function () {
        var sUrl = this.Url;
        var xmlHttp = this.XmlHttp;
        var queryString = this.createQueryString();
        var url = sUrl+(!queryString?"":("?"+queryString));
        xmlHttp.open("GET",url,true);
        if (this.reponseType  && xmlHttp.responseType) {
            xmlHttp.responseType=this.responseType;
        }
        xmlHttp.send(null); 
    },

    post : function() {
        var sUrl = this.Url;    
        var queryString = this.createQueryString();
        this.XmlHttp.open("POST",sUrl,true);    
        if (this.reponseType && this.XmlHttp.responseType) {        
            this.XmlHttp.responseType=this.responseType;
        }
        //alert((typeof this.XmlHttp));
        if(!window.XDomainRequest){     
            this.XmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");      
        }
        this.XmlHttp.send(queryString);
    },

    handleStateChange : function (XmlHttp,sRecvTyp,oResultFunc) {
        if(XmlHttp.withCredentials !== undefined || (window.XDomainRequest && Z.Browser.ie && document["documentMode"] === 8)) {
            oResultFunc(XmlHttp.responseText);
            //XmlHttp.responseText=null;
            XmlHttp = null;
        }else{      
            if (XmlHttp.readyState == 4) {
                if (XmlHttp.status == 200) {
                    oResultFunc(sRecvTyp?XmlHttp.responseXML:XmlHttp.responseText);
                    //XmlHttp.responseText=null;
                    XmlHttp = null;
                } else {
                    if (XmlHttp.status === 0) {
                        XmlHttp = null;
                        return;
                    }
                    oResultFunc('{"success":false,"error":\"Status:'+XmlHttp.status+","+XmlHttp.statusText+'\"}');
                    XmlHttp = null;
                }
            }
        }
    }
};

//载入外部资源, 并执行回调函数, 参数为资源内容
Z.Util.Ajax.getResource=function(url, callback, context) {
    var resourceAjax = new Z.Util.Ajax(url,0,null,function(responseText){
            if (callback) {
                if (context) {
                    callback.call(context,responseText);
                } else {
                    callback(responseText);
                }
            }
        });

    resourceAjax.get();
    resourceAjax = null;
};

//载入script, 执行script, 并执行回调
Z.Util.Ajax.getScript=function(url, callback, context) {
    var realCallback = function(responseText) {
        Z.Util.globalEval(responseText);
        if (callback) {
            if (context) {
                callback.call(context);
            } else {
                callback();
            }
        }
    };
    Z.Util.Ajax.getResource(url,realCallback,context);
};
Z.DomUtil = {

    createEl:function(tagName) {
        return document.createElement(tagName);
    },

    createElOn:function(tagName, style, container) {
        var el = this.createEl(tagName);
        if(style) {
            this.setStyle(el, style);
        }
        if (container) {
            container.appendChild(el);
        }
        return el;
    },

    removeDomNode:function(node){
        if (!node) {return;}
        if (Z.Browser.ie) {
            var d = Z.DomUtil.createEl('div');
            d.appendChild(node);
            d.innerHTML = '';
            d = null;
        } else {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
    },

    addDomEvent:function(obj, typeArr, handler, context) {
        if (!obj || !typeArr || !handler) {return this;}
        var eventHandler = function (e) {
            if (!e) {
                e = window.event;
            }
            return handler.call(context || obj, e);
        };
        var types = typeArr.split(' ');
        for (var i = types.length - 1; i >= 0; i--) {
            var type = types[i];
            if (!type) {
                continue;
            }
            
            if (!obj['Z__'+type]) {
                obj['Z__'+type]=[];

            }
            if (this.hasDomEvent(obj,type,handler) >= 0) {
                return this;
            }
            obj['Z__'+type].push({callback:eventHandler,src:handler});
            // obj['Z__'+type]=eventHandler;
            if ('addEventListener' in obj) {
                //滚轮事件的特殊处理
                if (type === "mousewheel" && document['mozHidden'] !== undefined) {
                    type = "DOMMouseScroll";
                }
                obj.addEventListener(type, eventHandler, false);
            } else if ('attachEvent' in obj) {
                obj.attachEvent('on' + type, eventHandler);
            }
        }
        return this;

    },

    removeDomEvent:function(obj,typeArr, handler) {
        function doRemove(type,callback) {
            if ('removeEventListener' in obj) {
                //滚轮事件的特殊处理
                if (type === "mousewheel" && document['mozHidden'] !== undefined) {
                    type = "DOMMouseScroll";
                }
                obj.removeEventListener(type, callback, false);
            } else if ('detachEvent' in obj) {
                obj.detachEvent('on' + type, callback);
            }
        }
        if (!obj || !typeArr) {return;}
         var types = typeArr.split(' ');
        for (var i = types.length - 1; i >= 0; i--) {
            var type = types[i];
            if (!type) {
                continue;
            }
            //如果handler为空,则删除所有的注册事件
            if (!handler && obj['Z__'+type]) {
                var handlers = obj['Z__'+type];
                for (var i=0,len=handlers.length;i<len;i++) {
                    doRemove(handlers[i].callback);
                }
                delete obj['Z__'+type];
                return;
            }
            //删除注册的handler事件
            var hit = this.hasDomEvent(obj,type,handler);
            if (hit < 0) {
                return;
            }
            var hitHandler = obj['Z__'+type][hit];
            doRemove(type,hitHandler.callback);
            obj['Z__'+type].splice(hit,1);
        }
        return this;
    },

    /**
     * 检查是否重复注册事件
     * @param  {[type]}  obj     [description]
     * @param  {[type]}  type    [description]
     * @param  {[type]}  handler [description]
     * @return {Boolean}         [description]
     */
    hasDomEvent:function(obj, type, handler) {
        if (!obj || !obj['Z__'+type] || !handler) {
            return -1;
        }
        var handlers = obj['Z__'+type];
        for (var i=0,len=handlers.length;i<len;i++) {
            if (handlers[i].src == handler) {
                return i;
            }
        }
        return -1;
    },

    /**
     * [preventDefault Cancels the event if it is cancelable, without stopping further propagation of the event.]
     * @param  {[Event]} event [Dom event]
     */
    preventDefault: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },

    /**
     * 阻止时间冒泡
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    stopPropagation: function (e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }

        return this;
    },

    /**
     * return dom element's position offset
     * @param  {Dom} dom dom Element
     * @param {Object} [offset] [偏移量]
     * @return {Object} position offset
     */
    offsetDom: function(dom,offset) {
        if (!dom) {return null;}
        if (!offset) {
            return {
                'left' : parseInt(dom.style.left,0),
                'top' : parseInt(dom.style.top,0)
            };
        } else {
            dom['style']['left']= offset['left']+'px';
            dom['style']['top'] = offset['top']+'px';
            return offset;
        }
    },

    offsetDomTranslate:function(dom,offset) {
        var useTranslate = (Z.Browser.translateDom);
        if (!useTranslate) {
            return;
        }
        if (!offset) {
            return this.parseCssTranslate(dom);
        } else {
            dom.style[this.TRANSFORM]='translate3d('+offset['left']+'px,'+offset['top']+'px,0px)';
            return offset;
        }
    },

    /**
     * 解析css translate3d值
     * @param  {[type]} dom [description]
     * @return {[type]}     [description]
     */
    parseCssTranslate:function(dom) {
        var transValue = dom.style[this.TRANSFORM];
        if (!transValue) {
            return {
                'left':0,
                'top':0
            };
        }
        var splitted = transValue.split(',');
        var left = parseInt(splitted[0].split('(')[1],0),
            top = parseInt(splitted[1],0);
        return {
            'left':left,
            'top':top
        };
    },

    /**
     * 获取dom对象在页面上的屏幕坐标
     * @param  {Dom Element} obj Dom对象
     * @return {Object}     屏幕坐标
     */
    getPageCoordinate:function(obj) {
        var topValue= 0,leftValue= 0;
        // obj=obj.offsetParent;
        while(obj){
            leftValue+= parseInt(obj.offsetLeft,0);
            topValue+= parseInt(obj.offsetTop,0);
            obj= obj.offsetParent;
        }
       var finalvalue = {left:leftValue,top:topValue};
       return finalvalue;
    },


    getEventPageCoordinate:function(ev) {
        ev = window.event || ev;
        if(ev.pageX || ev.pageY){
            return {x:ev.pageX, y:ev.pageY};
        }else{
            //解决是否定义DOCTYPE W3C DTD标准取值滚动条参数
            var dBody = document.body;//无标准这有效
            var dElement = document.documentElement;//有标准这有效
            var scrollLeft = dElement.scrollLeft?dElement.scrollLeft:dBody.scrollLeft;
            var clientLeft = dElement.clientLeft?dElement.clientLeft:dBody.clientLeft;
            var scrollTop = dElement.scrollTop?dElement.scrollTop:dBody.scrollTop;
            var clientTop = dElement.clientTop?dElement.clientTop:dBody.clientTop;
            return {
                x:ev.clientX + scrollLeft - clientLeft,
                y:ev.clientY + scrollTop  - clientTop
            };
        }
    },

    /**
     * 获取鼠标在容器上的绝对坐标
     * @param ev  触发的事件
     * @return    left:鼠标在页面上的横向位置, top:鼠标在页面上的纵向位置
     */
    getEventDomCoordinate:function(ev, dom) {
        if (!ev) {
            ev = window.event;
        }
        var domScreenPos = Z.DomUtil.getPageCoordinate(dom);
        /*if (domScreenPos) {
            domScreenPos = Z.DomUtil.getPageCoordinate(dom);
            dom["map_position"] = domScreenPos;
        }*/
        var mousePagePos = Z.DomUtil.getEventPageCoordinate(ev);
        var ret = {
            left:mousePagePos.x-domScreenPos['left'],
            top:mousePagePos.y-domScreenPos['top']
        };
        return ret;
    },

    testCssProp: function (props) {
        var style = document.documentElement.style;
        for (var i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    },

    setDomTransform:function(node,transformStr){
        node.style[this.TRANSFORM] = transformStr;
    },

    getDomTransformOrigin:function(node) {
        return node.style[this.TRANSFORM_ORIGIN];
    },

    setDomTransformOrigin:function(node,transformOriginStr){
        node.style[this.TRANSFORM_ORIGIN] = transformOriginStr;
    },

    /**
     * 将fooProperty转化为foo-opacity格式
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    convertUpperCaseToSlash:function(p) {
        function isUpperCase(chr) {
            if (!chr) {return false;}
            return (chr.charCodeAt(0)>=65)&&(chr.charCodeAt(0)<=90);
        }
         if (Z.Util.isNil(p)) {return null;}
        var ret=[];
        for (var i=0, len=p.length;i<len;i++) {
            var currChar = p[i];
            if (Z.Util.isNil(currChar)) {
                currChar = p.charAt(i);
            }
            if (isUpperCase(currChar)) {
                ret.push("-");
                ret.push(currChar.toLowerCase());
            } else {
                ret.push(currChar);
            }
        }
        return ret.join("");
    },

    setStyle : function(dom, strCss) {
        function endsWith(str, suffix) {
            var l = str.length - suffix.length;
            return l >= 0 && str.indexOf(suffix, l) == l;
        }
        var style = dom.style,
            cssText = style.cssText;
        if(!endsWith(cssText, ';')){
            cssText += ';';
        }
        dom.style.cssText = cssText + strCss;
    },

    removeStyle: function(dom) {
        dom.style.cssText = '';
    },

    addStyle: function(dom, attr, value) {
         var css = dom.style.cssText;
         if(attr && value) {
             var newStyle = attr+':'+value+';';
             dom.style.cssText = css + newStyle;
         }
    },
     
     hasClass: function (el, name) {
        if (el.classList !== undefined) {
            return el.classList.contains(name);
        }
        var className = Z.DomUtil.getClass(el);
        return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
    },

    addClass: function (el, name) {
        if (el.classList !== undefined) {
            var classes = Z.Util.splitWords(name);
            for (var i = 0, len = classes.length; i < len; i++) {
                el.classList.add(classes[i]);
            }
        } else if (!Z.DomUtil.hasClass(el, name)) {
            var className = Z.DomUtil.getClass(el);
            Z.DomUtil.setClass(el, (className ? className + ' ' : '') + name);
        }
    },

    removeClass: function (el, name) {
        if (el.classList !== undefined) {
            el.classList.remove(name);
        } else {
            Z.DomUtil.setClass(el, Z.Util.trim((' ' + Z.DomUtil.getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
        }
    },

    setClass: function (el, name) {
        if (el.className.baseVal === undefined) {
            el.className = name;
        } else {
            el.className.baseVal = name;
        }
    },

    getClass: function (el) {
        return el.className.baseVal === undefined ? el.className : el.className.baseVal;
    },

    getPixelValue: function(pixelStr) {
        if(pixelStr&&pixelStr.length>2) {
            var str = pixelStr.substring(0,pixelStr.length-2);
            return parseInt(str);
        }
        return 0;
    }
};

Z.DomUtil.TRANSFORM = Z.DomUtil.testCssProp(['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

Z.DomUtil.TRANSFORM_ORIGIN= Z.DomUtil.testCssProp(['transformOrigin', 'WebkitTransformOrigin', 'OTransformOrigin', 'MozTransformOrigin', 'msTransformOrigin']);


Z.DomUtil.disableImageDrag = function () {
    Z.DomUtil.on(window, 'dragstart', Z.DomUtil.preventDefault);
};
Z.DomUtil.enableImageDrag = function () {
    Z.DomUtil.off(window, 'dragstart', Z.DomUtil.preventDefault);
};

Z.DomUtil.preventOutline = function (element) {
    Z.DomUtil.restoreOutline();
    this._outlineElement = element;
    this._outlineStyle = element.style.outline;
    element.style.outline = 'none';
    Z.DomUtil.on(window, 'keydown', Z.DomUtil.restoreOutline, this);
};

Z.DomUtil.restoreOutline = function () {
    if (!this._outlineElement) { return; }
    this._outlineElement.style.outline = this._outlineStyle;
    delete this._outlineElement;
    delete this._outlineStyle;
    Z.DomUtil.off(window, 'keydown', Z.DomUtil.restoreOutline, this);
};

Z.DomUtil.on = Z.DomUtil.addDomEvent;
Z.DomUtil.off = Z.DomUtil.removeDomEvent;

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


	Z.Browser = {
		ie: ie,
		ielt9: ielt9,
		webkit: webkit,
		gecko: gecko && !webkit && !window.opera && !ie,

		android: android,
		android23: android23,

		chrome: chrome,

		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		opera3d: opera3d,
		any3d: any3d,

		mobile: mobile,
		mobileWebkit: mobile && webkit,
		mobileWebkit3d: mobile && webkit3d,
		mobileOpera: mobile && window.opera,

		touch: touch,
		msPointer: msPointer,
		pointer: pointer,

		retina: retina,

		language:language,
		translateDom:(any3d && !ie)
	};

}());
(function(){
    //解析host地址，插入css和vml定义
    var head= document.getElementsByTagName('head')[0];   

    var headChildren = head.childNodes;
    var viewPortMeta = null;
    for (var i=0, len = headChildren.length;i<len;i++) {
    if ("meta" === headChildren[i].nodeName.toLowerCase()) {
        var metaName = (headChildren[i].getAttribute?headChildren[i].getAttribute("name"):null);
        if ("viewport" === metaName) {
            viewPortMeta = headChildren[i];
        }
    }       
    }

    //根据script查找
    Z.host = '';
    var scriptTags = document.getElementsByTagName('script');
    var regex = /(?:\/engine).*[\/]maptalks(?:\.min)?\.js/;
    for (var i=0, len = scriptTags.length;i<len;i++) {
        var src = (scriptTags[i].getAttribute?scriptTags[i].getAttribute("src"):null);
        if (src !== null && src.match(regex)) {
            Z.host = src.split(regex)[0];
            if (!Z.host) {
                Z.host = window.location.protocol + '\/\/' + window.location.host;
            }
            break;
        }
    }

    if (Z.Browser.mobile) {
        if (viewPortMeta === null) {
            viewPortMeta=Z.DomUtil.createEl('meta');
            viewPortMeta.setAttribute("viewport");
            viewPortMeta.setAttribute("content","user-scalable=no");
            head.appendChild(viewPortMeta); 
        } else {
            var viewPortContent = viewPortMeta.getAttribute("content");
            if (viewPortContent.indexOf("user-scalable=no") < 0) {
                viewPortMeta.setAttribute("content",viewPortContent+",user-scalable=no");
            }
        }
    }
    var controlStyle=Z.DomUtil.createEl('link'); 
    controlStyle.href=Z.host+"/engine/css/controls.min.css"; 
    controlStyle.rel='stylesheet'; 
    controlStyle.type='text/css'; 
    head.appendChild(controlStyle);
    //ie插入vml定义 
    if (Z.Browser.ielt9) {
        //chrome frame meta标签
        var cfMeta = Z.DomUtil.createEl('meta');
        cfMeta.setAttribute("http-equiv","X-UA-Compatible");
        cfMeta.setAttribute("content","IE=edge,chrome=1");
        head.appendChild(cfMeta);
        //<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    }
    if (!window['JSON']) {
        var script = document.createElement("script");
        script['type'] = "text/javascript";
        script['src'] = Z.host+"/engine/js/build/v2/json3.min.js";
        head.appendChild(script);
    }
})();
/*
*   事件处理机制,为需要的类添加事件处理机制
*/
Z.Eventable={
    "addEventListener":function(eventTypeArr, handler, context) {
        if (!eventTypeArr || !handler) {return this;}
        if (!this.eventMap) {
            this.eventMap = {};
        }
        var eventTypes = eventTypeArr.split(' ');
        var eventType;
        if(!context) context = this;
        for (var j = 0, jl = eventTypes.length; j <jl; j++) {
            eventType = eventTypes[j];
            var handlerChain = this.eventMap[eventType];
            if (!handlerChain) {
                handlerChain = [];
                this.eventMap[eventType]=handlerChain;
            }
            for (var i=0, len=handlerChain.length;i<len;i++) {
                if (handler == handlerChain[i].handler) {
                    if ((context && handlerChain[i].context == context) || (Z.Util.isNil(context) && Z.Util.isNil(handlerChain[i].context))) {
                        return this;
                    }
                }
            }
            handlerChain.push({
                handler:handler,
                context:context
            });
        }
        return this;
    },

    "removeEventListener":function(eventTypeArr, handler, context) {
        if (!eventTypeArr || !this.eventMap || !handler) {return this;}
        var eventTypes = eventTypeArr.split(' ');
        var eventType;
        if(!context) context = this;
        for (var j = 0, jl = eventTypes.length; j <jl; j++) {
            eventType = eventTypes[j];
            var handlerChain =  this.eventMap[eventType];
            if (!handlerChain) {return this;}
            var hits = [];
            for (var i=0, len= handlerChain.length;i<len;i++) {
                if (handler == handlerChain[i].handler) {
                    if ((context && (handlerChain[i].context == context)) || Z.Util.isNil(context)) {
                        hits.push(i);
                    }
                }
            }
            if (hits.length > 0) {
                for (var len=hits.length, i=len-1;i>=0;i--) {
                    handlerChain.splice(hits[i],1);   
                }
                // handlerChain.splice(start,1);
            }
        }
        return this;
    },

    clearListeners:function(eventType) {
        if (!this.eventMap) {return;}
        var handlerChain =  this.eventMap[eventType];
        if (!handlerChain) {return;}
        this.eventMap[eventType] = null;
    },
    
    clearAllListeners:function() {
        this.eventMap = null;               
    },
    
    hasListeners:function(eventType) {
        if (!this.eventMap) {return false;}
        var handlerChain =  this.eventMap[eventType];
        if (!handlerChain) {return false;}
        return handlerChain && handlerChain.length >0;
    },

    executeListeners:function(eventType, param) {
        if (!this.eventMap) {return;}
        if (!this.hasListeners(eventType)) {return;}
        var handlerChain = this.eventMap[eventType];
        if (!handlerChain) {return;}
        for (var i=0, len = handlerChain.length;i<len; i++) {       
            if (!handlerChain[i]) {continue;}
            var context = handlerChain[i].context;
            if (context) {
                if (!param) {
                    param = {};
                }
                handlerChain[i].handler.call(context,param);
            } else {
                handlerChain[i].handler(param);
            }
        }
    }
};
Z.Eventable.on = Z.Eventable['addEventListener'];
Z.Eventable.off = Z.Eventable['removeEventListener'];

Z.Eventable.bind = Z.Eventable['addEventListener'];
Z.Eventable.unbind = Z.Eventable['removeEventListener'];
Z.Eventable.fire = Z.Eventable.executeListeners;
Z.Eventable.isBind=Z.Eventable.hasListeners;
/*
 * OOP facilities of the library.
 * Thanks to Leaflet's inspiration (http://www.leafletjs.com)
 */
Z.Class = function () {};

Z.Class.extend = function (props) {
    // extended class with the new prototype
    var NewClass = function () {
        //将类上的options定义复制到对象上
        if (this.options) {
            var classOptions = this.options;
            this.options = {};
            Z.Util.extend(this.options, classOptions);
        }
        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        // call all constructor hooks
        if(this._initHooks) {
            this.callInitHooks();
        }

        if (this['exceptionDefs']) {
            this.exceptions = this['exceptionDefs'][Z.Browser.language];
        }
    };

    var parentProto = NewClass.__super__ = this.prototype;

    var proto = Z.Util.create(parentProto);

    proto.constructor = NewClass;

    NewClass.prototype = proto;

    // inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix static properties into the class
    if (props.statics) {
        Z.Util.extend(NewClass, props.statics);
        delete props.statics;
    }

    // mix includes into the prototype
    if (props.includes) {
        Z.Util.extend.apply(null, [proto].concat(props.includes));
        delete props.includes;
    }

    // merge options
    if (proto.options) {
        props.options = Z.Util.extend(Z.Util.create(proto.options), props.options);
    }

    // mix given properties into the prototype
    Z.Util.extend(proto, props);

    proto._initHooks = [];

    // add method for calling all hooks
    proto.callInitHooks = function () {

        if (this._initHooksCalled) { return; }

        if (parentProto.callInitHooks) {
            parentProto.callInitHooks.call(this);
        }

        this._initHooksCalled = true;

        for (var i = 0, len = proto._initHooks.length; i < len; i++) {
            proto._initHooks[i].call(this);
        }
    };

    return NewClass;
};


// method for adding properties to prototype
Z.Class.include = function (props) {
    Z.Util.extend(this.prototype, props);
};

// merge new default options to the Class
Z.Class.mergeOptions = function (options) {
    Z.Util.extend(this.prototype.options, options);
};

// add a constructor hook
Z.Class.addInitHook = function (fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var init = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
};

Z['Coordinate'] = Z.Coordinate = function(x,y) {
    //支持输入数组
    if (Z.Util.isArray(x)) {
        this.x = parseFloat(x[0]);
        this.y = parseFloat(x[1]);
    } else {
        this.x=parseFloat(x);
        this.y=parseFloat(y);   
    }
};
Z.Coordinate.equals=function(c1,c2) {
            if (!Z.Util.isCoordinate(c1) || !Z.Util.isCoordinate(c2)) {
                return false;
            }
            return c1.x === c2.x && c1.y === c2.y;
        };

Z.Coordinate.fromGeoJsonCoordinate=function(coordinates) {
    if (!Z.Util.isArray(coordinates)) {
        return null;
    }
    for (var i=0, len=coordinates.length;i<len;i++) {
        var child = coordinates[i];
        if (Z.Util.isArray(child) && !Z.Util.isArray(child[0])) {

        } else {

        }
    }
};



Z['Point']=Z.Point=Z.Class.extend({
	initialize:function(left,top){
		this['left']=left;
		this['top']=top;
	}
});


Z.Projection={    
    getInstance:function(projection) {
        if (!projection) {return null;}
        var instance = null;
        for (var p in Z.ProjectionInstance) {
            if (Z.ProjectionInstance.hasOwnProperty(p)) {
                if ((''+projection).toUpperCase() === Z.ProjectionInstance[p].srs) {
                    instance = Z.ProjectionInstance[p];
                    break;
                }    
            }
        }
        if (instance) {
            Z.Util.extend(instance,Z.Projection.Util);
        } else {
            instance = this.getDefault();
        }
        return instance;
    },

    getDefault:function() {
        return Z.Util.extend(Z.ProjectionInstance.ESPG3857,Z.Projection.Util);
    }
};

/**
 * 所有的Projection类共有的工具方法
 * @type {Object}
 */
Z.Projection.Util={        
    /**
     * 计算一组坐标的投影坐标
     * @param  {[type]} points [description]
     * @return {[type]}        [description]
     */
    projectPoints:function(points) {
        return Z.Util.eachInArray(points, this, this.project);
    },

    /**
     * 计算一组投影坐标的经纬度坐标
     * @param  {[type]} points [description]
     * @return {[type]}           [description]
     */
    unprojectPoints:function(points) {
        return Z.Util.eachInArray(points, this, this.unproject);
    }
};
//---------------------------------------
//空间计算方法
//如计算长度,面积, 根据距离locate另一个点的坐标等
//---------------------------------------
Z.ProjectionInstance={};
Z.ProjectionInstance.GeoMethods={};
Z.ProjectionInstance.GeoMethods.Geodesic={
    getGeodesicLength:function(mlonlat1,mlonlat2){
        if (!mlonlat1 || !mlonlat2) {return 0;}
        try {
            var b=this.rad(mlonlat1.y),d=this.rad(mlonlat2.y),e=b-d,f=this.rad(mlonlat1.x)-this.rad(mlonlat2.x);
            b=2*Math.asin(Math.sqrt(Math.pow(Math.sin(e/2),2)+Math.cos(b)*Math.cos(d)*Math.pow(Math.sin(f/2),2)));b*=6378137;
            return Math.round(b*1E4)/1E4;
        } catch (err) {
            return 0;
        }   
    },
    getGeodesicArea:function(rings) {
        var a=6378137*Math.PI/180,
            b=0,
            c=rings,
            d=c.length;
        if (d<3) {return 0;}
        for(var i=0;i<d-1;i++)
        {
            var e=c[i],
                f=c[i+1];
            b+=e.x*a*Math.cos(e.y*Math.PI/180)*f.y*a-f.x*a*Math.cos(f.y*Math.PI/180)*e.y*a;
            // console.log(b);
        }
        d=c[i];
        c=c[0];
        b+=d.x*a*Math.cos(d.y*Math.PI/180)*c.y*a-c.x*a*Math.cos(c.y*Math.PI/180)*d.y*a;
        return 0.5*Math.abs(b);
    },
    locate:function(mlonlat, xDistance, yDistance) {
        if (!mlonlat) {return null;}
        if (!xDistance) {xDistance = 0;}
        if (!yDistance) {yDistance = 0;}
        if (!xDistance && !yDistance) {return mlonlat;}
        var dx = Math.abs(xDistance);
        var dy = Math.abs(yDistance);
        var ry = this.rad(mlonlat.y);
        var rx = this.rad(mlonlat.x);
        var sy = Math.sin(dy / (2 * 6378137)) * 2;
        ry = ry + sy * (yDistance > 0 ? 1 : -1);
        var sx = 2 * Math.sqrt(Math.pow(Math.sin(dx / (2 * 6378137)), 2)/ Math.pow(Math.cos(ry), 2));
        //              2 * Math.asin(Math.sqrt(Math.abs((Math.sin(xDistance
        //              / (2 * 6378137)))
        //              / (2 * Math.pow(Math.cos(ry), 2)))));
        rx = rx + sx * (xDistance > 0 ? 1 : -1);
        return {'x':rx * 180 / Math.PI, 'y':ry * 180 / Math.PI};
    }
};
Z.ProjectionInstance.GeoMethods.Pixel={
    getGeodesicLength:function(mlonlat1,mlonlat2){
        if (!mlonlat1 || !mlonlat2) {return 0;}
        try {
            return Math.sqrt(Math.pow(mlonlat1.x-mlonlat2.x,2)+Math.pow(mlonlat1.y-mlonlat2.y,2));
        } catch (err) {
            return 0;
        }   
    },
    getGeodesicArea:function(rings) {
        if (!Z.Util.isArrayHasData(rings)) {
            return 0;
        }
        var area = 0;
        for ( var i = 0, len = rings.length; i < len; i++) {
            var pLonlat = rings[i];
            var pLonlat2 = null;
            if (i === len - 1) {
                pLonlat2 = rings[0];
            } else {
                pLonlat2 = rings[i+1];
            }
            area += pLonlat.x * pLonlat2.y - pLonlat.y * pLonlat2.x;
        }
        return Math.abs(area / 2);
    },
    locate:function(mlonlat, xDistance, yDistance) {
        if (!mlonlat) {return null;}
        if (!xDistance) {xDistance = 0;}
        if (!yDistance) {yDistance = 0;}
        if (!xDistance && !yDistance) {return mlonlat;}
        return {'x':mlonlat.x+xDistance, 'y':mlonlat.y+yDistance};
    }
};
Z.ProjectionInstance.ESPG3857={
    srs:'ESPG:3857',
    EARCH_RADIUS:2.003750834E7,
    project:function(p){
        if (!p) {
            var i=1;
        }
        var x = p.x,y=p.y;
        if (!x || !y) {return null;}
        var lon = x,
            lat = y;
        var EARCH_RADIUS = this.EARCH_RADIUS;
        var c=Math.log(Math.tan((90+lat)*Math.PI/360))/(Math.PI/180);
        return new Z.Coordinate(lon*EARCH_RADIUS/180,c*EARCH_RADIUS/180);
    },
    unproject:function(p){
        // if (!Z.Util.isCoordinate(p)) {return null;}
        var x = p.x,y=p.y;
        if (!x || !y) {return null;}
        var lon = x,
            lat = y;
        var EARCH_RADIUS = this.EARCH_RADIUS;
        var c=lat/EARCH_RADIUS*180;
        c=180/Math.PI*(2*Math.atan(Math.exp(c*Math.PI/180))-Math.PI/2);
        return new Z.Coordinate(lon/EARCH_RADIUS*180,c);
    },
    
    rad:function(a){return a*Math.PI/180;}
};

Z.Util.extend(Z.ProjectionInstance.ESPG3857, Z.ProjectionInstance.GeoMethods.Geodesic);
Z.ProjectionInstance.ESPG4326={
	srs:'ESPG:4326',	
	project:function(p){ 
        return new Z.Coordinate(p.x,p.y);
    },
    unproject:function(p){
        return new Z.Coordinate(p.x,p.y);
    }
};
Z.Util.extend(Z.ProjectionInstance.ESPG4326, Z.ProjectionInstance.GeoMethods.Geodesic);
Z.ProjectionInstance.Baidu={
	srs:'BAIDU',
	project:function(p){
		return this.projections.convertLL2MC(p);
	},
	unproject:function(p){
		return this.projections.convertMC2LL(p);
	},
    rad:function(a){return a*Math.PI/180;}
};

Z.Util.extend(Z.ProjectionInstance.Baidu, Z.ProjectionInstance.GeoMethods.Geodesic);

Z.ProjectionInstance.Baidu.projections={
    EARTHRADIUS: 6370996.81,
    MCBAND: [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0],
    LLBAND: [75, 60, 45, 30, 15, 0],
    MC2LL: [[1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2], [ - 7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86], [ - 3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37], [ - 1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06], [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4], [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]],
    LL2MC: [[ - 0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5], [0.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5], [0.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5], [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5], [ - 0.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5], [ - 0.0003218135878613132, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]],
    
    convertMC2LL: function(cB) {
        var cC, cE;
        cC = {x:Math.abs(cB.x), y:Math.abs(cB.y)};
        for (var cD = 0, len=this.MCBAND.length; cD < len; cD++) {
            if (cC.y >= this.MCBAND[cD]) {
                cE = this.MC2LL[cD];
                break;
            }
        }
        var T = this.convertor(cB, cE);
        var cB = new Z.Coordinate(T.x.toFixed(6), T.y.toFixed(6));
        return cB;
    },
    convertLL2MC: function(T) {
        var cB, cD;
        T.x = this.getLoop(T.x, -180, 180);
        T.y = this.getRange(T.y, -74, 74);
        cB = new Z.Coordinate(T.x, T.y);
        for (var cC = 0,len = this.LLBAND.length; cC < len; cC++) {
            if (cB.y >= this.LLBAND[cC]) {
                cD = this.LL2MC[cC];
                break;
            }
        }
        if (!cD) {
            for (var cC = this.LLBAND.length - 1; cC >= 0; cC--) {
                if (cB.y <= -this.LLBAND[cC]) {
                    cD = this.LL2MC[cC];
                    break;
                }
            }
        }
        var cE = this.convertor(T, cD);
        var T = new Z.Coordinate(cE.x.toFixed(2), cE.y.toFixed(2));
        return T;
    },
    convertor: function(cC, cD) {
        if (!cC || !cD) {
            return;
        }
        var T = cD[0] + cD[1] * Math.abs(cC.x);
        var cB = Math.abs(cC.y) / cD[9];
        var cE = cD[2] + cD[3] * cB + cD[4] * cB * cB + 
        		cD[5] * cB * cB * cB + cD[6] * cB * cB * cB * cB + 
        		cD[7] * cB * cB * cB * cB * cB + 
        		cD[8] * cB * cB * cB * cB * cB * cB;
        T *= (cC.x < 0 ? -1 : 1);
        cE *= (cC.y < 0 ? -1 : 1);
        return new Z.Coordinate(T, cE);
    },
    toRadians: function(T) {
        return Math.PI * T / 180;
    },
    toDegrees: function(T) {
        return (180 * T) / Math.PI;
    },
    getRange: function(cC, cB, T) {
        if (cB != null) {
            cC = Math.max(cC, cB);
        }
        if (T != null) {
            cC = Math.min(cC, T);
        }
        return cC;
    },
    getLoop: function(cC, cB, T) {
        while (cC > T) {
            cC -= T - cB;
        }
        while (cC < cB) {
            cC += T - cB;
        }
        return cC;
    }
};
Z.ProjectionInstance.Pixel={
	srs:'PIXEL',	
	project:function(p){ 
        return new Z.Coordinate(p.x,p.y);
    },
    unproject:function(p){
        return new Z.Coordinate(p.x,p.y);
    }
};
Z.Util.extend(Z.ProjectionInstance.Pixel, Z.ProjectionInstance.GeoMethods.Pixel);
Z.Handler = Z.Class.extend({
	includes: Z.Eventable,

	initialize: function (map) {
		this['map'] = map;
	},

	/**
	 * 激活Handler
	 */
	enable:function(){
		this.addHooks();
	},

	/**
	 * 取消激活Handler
	 */
	disable:function(){
		this.removeHooks();
	}
});
Z.Handler.Drag = Z.Handler.extend({

    initialize:function(dom, opts){
        this.dom = dom;
        if (opts) {
            Z.Util.extend(this,opts);   
        }
        
    },  

    enable:function(){
        if (!this.dom) {return;}
        Z.DomUtil.on(this.dom, 'mousedown', this.onMouseDown, this);
    },

    disable:function(){
        if (!this.dom) {return;}
        Z.DomUtil.off(this.dom, 'mousedown', this.onMouseDown);
    },

    onMouseDown:function(event) {       
        var dom = this.dom;
        if(dom.setCapture) {
            dom.setCapture();
        } else if(window.captureEvents) {
            window.captureEvents(window['Event'].MOUSEMOVE|window['Event'].MOUSEUP);
        }
        dom['ondragstart'] = function() { return false; };
        Z.DomUtil.on(dom,'mousemove',this.onMouseMove,this);
        Z.DomUtil.on(dom,'mouseup',this.onMouseUp,this);
        if (!dom.style.cursor || dom.style.cursor === 'default') {
            dom.style.cursor = 'move';
        }
        this.fire('dragstart',{
            'mousePos':{
                'left': parseInt(event.clientX,0),
                'top': parseInt(event.clientY,0)
            }
        });
    },

    onMouseMove:function(event) {
        this.fire('dragging',{
            'mousePos':{
                'left':parseInt(event.clientX,0),
                'top':parseInt(event.clientY,0)
            }
        });
    },

    onMouseUp:function(event){
        var dom = this.dom;
        Z.DomUtil.off(dom,'mousemove',this.onMouseMove);
        Z.DomUtil.off(dom,'mouseup',this.onMouseUp);
        if(dom['releaseCapture']) {
            dom['releaseCapture']();
        } else if(window.captureEvents) {
            window.captureEvents(window['Event'].MOUSEMOVE|window['Event'].MOUSEUP);
        }
        if (dom.style.cursor === 'move') {
            dom.style.cursor = 'default';
        }
        this.fire('dragend',{
            'mousePos':{
                'left':parseInt(event.clientX,0),
                'top':parseInt(event.clientY,0)
            }
        });
    }
});
Z['DrawTool'] = Z.DrawTool = Z.Class.extend({
    includes: [Z.Eventable],
    /**
    * 初始化绘制工具
    * options:{mode:Z.Geometry.TYPE_CIRCLE, afterdraw: fn, afterdrawdisable: true}
    */
    initialize: function(options, map) {
        Z.Util.extend(this, options);
        if(map) {
            this.addTo(map);
        }
        return this;
    },
    /**
     * 默认的线型
     * @type {Object}
     */
    defaultStrokeSymbol:{'strokeSymbol' : {'stroke':'#474cf8', 'strokeWidth':3, 'strokeOpacity':1}},

    addTo: function(map) {
        this.map = map;
        if (!this.map) {return;}
        this.lodConfig = map.getLodConfig();
        this.enable();
        return this;
    },

    /**
     * 激活
     * @export
     */
    enable:function() {
        if (!this.map) {return;}
        this.drawToolLayer = this.getDrawLayer();
        this.clearEvents();
        this.registerEvents();
        return this;
    },

    /**
     * 停止激活
     * @export
     */
    disable:function() {
        if (!this.map) {
            return;
        }
        this.endDraw();
        this.map.removeLayer(this.getDrawLayer());
        this.clearEvents();
    },

    /**
     * 设置绘图模式
     * @param {Number} [node] [绘图模式]
     * @export
     */
    setMode:function(mode) {
        if (this.geometry) {
            this.geometry.remove();
            delete this.geometry;
        }
        this['mode'] = mode;
        this.clearEvents();
        this.registerEvents();
    },

    /**
     * 获得drawtool的绘制样式
     * @return {Object} [绘制样式]
     * @export
     */
    getSymbol:function() {
        if(this['symbol']) {
            return this['symbol'];
        } else {
            return this.defaultStrokeSymbol;
        }
    },

    /**
     * 设置drawtool的绘制样式
     * @param {Object} symbol [绘制样式]
     */
    setSymbol:function(symbol) {
        if (!symbol) {
            return;
        }
        this['symbol'] = symbol;
        if (this.geometry) {
            this.geometry.setSymbol(symbol);
        }
    },

    getProjection:function() {
        if (!this.lodConfig) {
            return null;
        }
        return this.lodConfig.getProjectionInstance();
    },

    /**
     * 注册鼠标响应事件
     */
    registerEvents: function() {
        this.preventEvents();
        var mode = this['mode'];
        if (Z.Util.isNil(mode)) {
            mode = Z.Geometry['TYPE_CIRCLE'];
        }
        if (Z.Geometry['TYPE_POLYGON'] == mode || Z.Geometry['TYPE_POLYLINE'] == mode) {
            this.map.on('click',this.clickForPath, this);
            this.map.on('mousemove',this.mousemoveForPath,this);
            this.map.on('dblclick',this.dblclickForPath,this);
        } else if (Z.Geometry['TYPE_POINT'] == mode) {
            this.map.on('click',this.clickForPoint, this);
        } else {
            this.map.on('mousedown',this.mousedownToDraw, this);
        }
    },

    preventEvents: function() {
        this.map.disableDragPropagation();
        this.map['doubleClickZoom'] = false;
    },

    clearEvents: function() {
        this.map.off('click',this.clickForPath, this);
        this.map.off('click',this.clickForPoint, this);
        this.map.off('mousemove',this.mousemoveForPath,this);
        this.map.off('dblclick',this.dblclickForPath,this);
        this.map.off('mousedown',this.mousedownToDraw,this);
        this.map.enableDragPropagation();
        this.map['doubleClickZoom'] = true;
    },

    clickForPoint: function(event) {
        var screenXY = this.getMouseScreenXY(event);
        var coordinate = this.screenXYToLonlat(screenXY);
        var param = {'coordinate':coordinate, 'pixel':screenXY};
        if(this.afterdraw){
            this.afterdraw(param);
        }
        this.fireEvent('afterdraw', param);
        if(this.afterdrawdisable) {
           this.disable();
        }
    },

    clickForPath:function(event) {
        var screenXY = this.getMouseScreenXY(event);
        var coordinate = this.screenXYToLonlat(screenXY);
        if (!this.geometry) {
            //无论画线还是多边形, 都是从线开始的
            this.geometry = new Z.Polyline([coordinate]);
            var symbol = this.getSymbol();
            if (symbol) {
                this.geometry.setSymbol(symbol);
            }
            /**
            * 绘制开始事件
            * @event startdraw
            * @param coordinate {seegoo.maps.MLonLat} 初始坐标
            * @param pixel {Pixel} 初始像素坐标
            */
            this.fireEvent('startdraw', {'coordinate':coordinate,'pixel':screenXY});
        } else {
            var path = this.getLonlats();
            path.push(coordinate);
            //这一行代码取消注册后, 会造成dblclick无法响应, 可能是存在循环调用,造成浏览器无法正常响应事件
            // this.setLonlats(path);
            if (this.map.hasListeners('drawring')) {
                /**
                 * 端点绘制事件，当为多边形或者多折线绘制了一个新的端点后会触发此事件
                 * @event drawring
                 * @param coordinate {seegoo.maps.MLonLat} 新端点的地理坐标
                 * @param pixel {Pixel} 新端点的像素坐标
                 */
                this.fireEvent('drawring',{'target':this.geometry,'coordinate':coordinate,'pixel':screenXY});
            }
        }
    },

    mousemoveForPath : function(event) {
        if (!this.geometry) {return;}
        var screenXY = this.getMouseScreenXY(event);
        if (!this.isValidScreenXY(screenXY)) {return;}
        var coordinate = this.screenXYToLonlat(screenXY);
        var drawLayer = this.getDrawLayer();
        var path = this.getLonlats();
        if (path.length === 1) {
            path.push(coordinate);
             drawLayer.addGeometry(this.geometry);
        } else {
            path[path.length-1] = coordinate;
            //path.push(coordinate);
        }
        // this.drawToolLayer.removeGeometry(this.geometry);
        this.setLonlats(path);
        // this.drawToolLayer.addGeometry(this.geometry);
    },

    dblclickForPath:function(event) {
        if (!this.geometry) {return;}
        var screenXY = this.getMouseScreenXY(event);
        if (!this.isValidScreenXY(screenXY)) {return;}
        var coordinate = this.screenXYToLonlat(screenXY);
        var path = this.getLonlats();
        path.push(coordinate);
        if (path.length < 2) {return;}
        //去除重复的端点
        var nIndexes = [];
        for (var i=1,len=path.length;i<len;i++) {
            if (path[i].x === path[i-1].x && path[i].y === path[i-1].y) {
                nIndexes.push(i);
            }
        }
        for (var i=nIndexes.length-1;i>=0;i--) {
            path.splice(nIndexes[i],1);
        }

        if (path.length < 2 || (Z.Geometry['TYPE_POLYGON'] == this.mode && path.length < 3)) {
            return;
        }
        this.geometry.remove();
        //-->2014-10-28 增加只在双击时才封闭多边形
        if (Z.Geometry['TYPE_POLYGON'] == this.mode) {

            this.geometry = new Z.Polygon(path);
            var symbol=this.getSymbol();
            if (symbol) {
                this.geometry.setSymbol(symbol);
            }
            this.drawToolLayer.addGeometry(this.geometry);
        } else {
            this.geometry.setPath(path);
        }
        //<--
        this.endDraw(coordinate, screenXY);
    },

    mousedownToDraw : function(event) {
        var me = this;
        var onMouseUp;
        function genGeometry(coordinate) {
            var symbol = me.getSymbol();
            var geometry = me.geometry;
            var drawLayer = me.getDrawLayer();
            var _map = me.map;
            switch (me.mode) {
            case Z.Geometry['TYPE_CIRCLE']:
                if (!geometry) {
                    geometry = new Z.Circle(coordinate,0);
                    geometry.setSymbol(symbol);
                    drawLayer.addGeometry(geometry);
                    break;
                }
                var center =geometry.getCenter();
                var radius = _map.computeDistance(center,coordinate);
                geometry.setRadius(radius);
            break;
            case Z.Geometry['TYPE_ELLIPSE']:
                if (!geometry) {
                    geometry = new Z.Ellipse(coordinate,0,0);
                    geometry.setSymbol(symbol);
                    drawLayer.addGeometry(geometry);
                    break;
                }
                var center = geometry.getCenter();
                var rx = _map.computeDistance(center,{x:coordinate.x, y:center.y});
                var ry = _map.computeDistance(center,{x:center.x, y:coordinate.y});
                geometry.setWidth(rx);
                geometry.setHeight(ry);
            break;
            case Z.Geometry['TYPE_RECT']:
                if (!geometry) {
                    geometry = new Z.Rectangle(coordinate,0,0);
                    geometry.setSymbol(symbol);
                    drawLayer.addGeometry(geometry);
                    break;
                }
                var nw =geometry.getNw();
                var width = _map.computeDistance(nw,{x:coordinate.x, y:nw.y});
                var height = _map.computeDistance(nw,{x:nw.x, y:coordinate.y});
                geometry.setWidth(width);
                geometry.setHeight(height);
            break;
            }
            me.geometry=geometry;

        }
        function onMouseMove(_event) {
            if (!this.geometry) {
                return false;
            }
            var screenXY = this.getMouseScreenXY(_event);
            if (!this.isValidScreenXY(screenXY)) {return;}
            var coordinate = this.screenXYToLonlat(screenXY);
            genGeometry(coordinate);
            return false;
        }
        onMouseUp = function(_event) {
            if (!this.geometry) {
                return false;
            }
            var screenXY = this.getMouseScreenXY(_event);
            if (!this.isValidScreenXY(screenXY)) {return;}
            var coordinate = this.screenXYToLonlat(screenXY);
            genGeometry(coordinate);
            this.map.off('mousemove',onMouseMove, this);
            this.map.off('mouseup',onMouseUp, this);
            this.endDraw(coordinate, screenXY);
            return false;
        };
        var screenXY = this.getMouseScreenXY(event);
        if (!this.isValidScreenXY(screenXY)) {return;}
        var coordinate = this.screenXYToLonlat(screenXY);
        /**
         * 绘制开始事件
         * @event startdraw
         * @param coordinate {seegoo.maps.MLonLat} 初始坐标
         * @param pixel {Pixel} 初始像素坐标
         */
        this.fireEvent('startdraw',{'coordinate':coordinate,'pixel':screenXY});
        genGeometry(coordinate);
        this.map.on('mousemove',onMouseMove,this);
        this.map.on('mouseup',onMouseUp,this);
        return false;
    },

    endDraw : function(coordinate, screenXY) {
        if (!this.geometry) {
            return;
        }
        var target = this.geometry.copy();
        this.geometry.remove();
        delete this.geometry;
         /**
         * 绘制结束事件
         * @event afterdraw
         * @param coordinate {seegoo.maps.MLonLat} 结束坐标
         * @param pixel {Pixel} 结束像素坐标
         */
         var param = {'target':target,'coordinate':coordinate, 'pixel':screenXY};
         if(this.afterdraw){
            this.afterdraw(param);
         }
         this.fireEvent('afterdraw', param);
         if(this.afterdrawdisable) {
           this.disable();
         }
    },

    /**
     * 返回多边形或多折线的坐标数组
     * @return {[type]} [description]
     */
    getLonlats:function() {
        if (this.geometry.getRing) {
            return this.geometry.getRing();
        }
        return this.geometry.getPath();
    },

    setLonlats:function(lonlats) {
        if (this.geometry.setRing) {
            this.geometry.setRing(lonlats);
        } else {
            this.geometry.setPath(lonlats);
        }
    },

    /**
     * 获得鼠标事件在地图容器上的屏幕坐标
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    getMouseScreenXY:function(event) {
        Z.DomUtil.stopPropagation(event);
        var result = Z.DomUtil.getEventDomCoordinate(event,this.map.containerDOM);
        return result;
    },

    /**
     * 事件坐标转化为地图上的经纬度坐标
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    screenXYToLonlat:function(screenXY) {
        var projection = this.getProjection(),
            map = this.map;

        //projected pLonlat
        var pLonlat = map.transform(screenXY);
        return projection.unproject(pLonlat);
    },

    isValidScreenXY:function(screenXY) {
        var mapSize = this.map.getSize();
        var w = mapSize['width'],
            h = mapSize['height'];
        if (screenXY['left'] < 0 || screenXY['top'] < 0) {
            return false;
        } else if (screenXY['left']> w || screenXY['top'] > h){
            return false;
        }
        return true;
    },

    getDrawLayer:function() {
        var drawLayerId = '____system_layer_drawtool';
        var drawToolLayer = this.map.getLayer(drawLayerId);
        if (!drawToolLayer) {
            drawToolLayer = new Z.SVGLayer(drawLayerId);
            this.map.addLayer(drawToolLayer);
        }
        return drawToolLayer;
    },

    fireEvent:function(eventName, param) {
        if (!param) {
            param = {};
        }
        this.fire(eventName, param);
    }

});
/**
 * 测距鼠标工具类
 */
Z['DistanceTool'] = Z.DistanceTool = Z.Class.extend({
	includes: [Z.Eventable],
	/**
    * 初始化测距工具
    * options:{aftermeasure: fn}
    */
    initialize: function(options, map) {
        Z.Util.extend(this, options);
        if(map) {
            this.addTo(map);
        }
        return this;
    },

    addTo: function(map) {
		this.map = map;
		if (!this.map) {return;}
		this.layerId = '____system_layer_distancetool';
		this.drawLayer = null;
		this.drawTool = null;
		this.rings = [];
		this.enable();
		return this;
	},

	enable:function() {
		if (!this.map) return;
		var drawTool = this.drawTool;
		this.drawLayer = this.map.getLayer(this.layerId);
		if (this.drawLayer != null && drawTool != null) {
			drawTool.enable();
			return;
		}
		if (this.drawLayer != null) {
			this.map.removeLayer(this.layerId);
		}
		var _canvas = this.map.panels.canvasLayerContainer;

		this.drawLayer = new Z.SVGLayer(this.layerId);

		this.map.addLayer(this.drawLayer);

        drawTool = new Z.DrawTool({
            'mode':Z.Geometry.TYPE_POLYLINE,
            'symbol': {'strokeSymbol':{'stroke':'#ff0000', 'stroke-width':3, 'opacity':0.6}},
            'afterdrawdisable': true
        }).addTo(this.map);

		drawTool.on('startdraw', Z.Util.bind(this.startMeasure, this));
		drawTool.on('drawring', Z.Util.bind(this.measureRing, this));
		drawTool.on('afterdraw', Z.Util.bind(this.afterMeasure, this));

		this.counter = 0;
		this.rings = [];
		this.tmpMarkers = [];
	},

	/**
	 * 停止测距鼠标工具
	 * @export
	 */
	disable:function() {
		if (!this.map) return;
		this.clear();
		var drawTool =this.drawTool;
		var _canvas = this.map.canvasDom;
		if (!_canvas)
			this.changeCursor('default');
		if (drawTool != null)
			drawTool.disable();

	},

	startMeasure : function(param) {
		var startDiv = this.outline('起点', 28);
		var coordinate = param['coordinate'];
		this.rings.push(coordinate);

		var point = this.genMesurePoint(coordinate, this.layerId + '_startp_' + this.counter);
		var marker = new Z.Marker(coordinate, this.layerId + '_start_' + this.counter);
		marker.setIcon({
			'type' : 'html',
			'content' : startDiv
		});
		this.drawLayer.addGeometry([point,marker]);
		this.tmpMarkers.push(point);
		this.tmpMarkers.push(marker);
	},

	measureRing : function(param) {
		var content = null;
		var coordinate = param['coordinate'];
		rings.push(coordinate);
		var lenSum = this.caculateLenSum();
		if (lenSum>1000) {
			content = (lenSum/1000).toFixed(1)+'公里';
		} else {
			content = lenSum + '米';
		}
		var measureDiv = this.outline(content, 50);
		var point = this.genMesurePoint(coordinate, this.layerId + '_ringp_' + this.rings.length+'_' + this.counter);
		var marker = new Z.Marker(coordinate, _this.layerId + '_ring_' + this.rings.length + '_' + this.counter);
		marker.setIcon({
			'type' : 'html',
			'content' : measureDiv
		});
		this.drawLayer.addGeometry([point,marker]);
		this.tmpMarkers.push(point);
		this.tmpMarkers.push(marker);
	},

	afterMeasure : function(param) {
		var polyline = param.target;
		var coordinate = param['coordinate'];
		this.rings.push(coordinate);
		var divContent = '总长';
		var lenSum = this.caculateLenSum();
		if (lenSum>1000) {
			divContent += (lenSum/1000).toFixed(1)+'公里';
		} else {
			divContent += lenSum.toFixed(1)+'米';
		}
		this.endMeasure(coordinate, divContent, polyline);
		this.changeCursor('default');
		this.counter++;
		this.rings = [];
		/**
		 * 距离量算结束事件
		 * @event aftermeasure
		 * @param result: 总长度
		 */
		this.fire('aftermeasure', {'result': lenSum});
	},

	caculateLenSum : function() {
		var rings = this.rings;
		if (rings.length <= 1) return 0;
		var lenSum = 0;
		var projection = this.map.getProjection();
		for (var i=1,len=rings.length;i<len;i++){
			lenSum += projection.getGeodesicLength(rings[i-1],rings[i]);
		}
		return parseFloat(lenSum);
	},

	genMesurePoint: function(coordinate, id) {
		var point = new Z.Marker(coordinate, id);
		point.setSymbol({
			'icon':{
				'type'   : 'picture',
				'url'    : Z.host + '/engine/images/point.png',
				'width'  : 16,
				'height' : 17,
				'offset' : {
					'x'  : 0,
					'y'  : -8
				}
			}

		});
		return point;
	},

	/**
	 * 清除测量结果
	 * @export
	 */
	clear: function(){
		if (this.drawLayer != null && this.map!=null) {
			this.drawLayer.clear();
		}
		this.rings = [];
		this.counter = 0;
		this.tmpMarkers = [];
	},

	outline: function(content,width,top,left) {
		if (top==null) top=-10;
		if (left==null) left = 10;
		return '<div class="MAP_CONTROL_PointTip" style="top:'
				+top+'px;left:'+left+'px;width:'+width+'px">'+content+'</div>';
	},

	endMeasure: function(coordinate, divContent, geo) {
		var _geo = geo;
		var counter = this.counter;
		var tmpMarkers = this.tmpMarkers;
		var map = this.map;
		var point = this.genMesurePoint(coordinate, this.layerId+'_endp_'+counter);

		var rings;
		if(geo.getPath) {
			rings = geo.getPath();
		} else if(geo.getRing) {
			rings = geo.getRing();
		}
		var offsetX,offsetY;
		//TODO 不清楚map.incre是什么？
//		if (map.incre.x*(rings[rings.length-1].x - rings[rings.length-2].x)>0) {
		if ((rings[rings.length-1].x - rings[rings.length-2].x)>0) {
			offsetX = 15;
		} else {
			offsetX = -20;
		}
//		if (map.incre.y*(rings[rings.length-1].y - rings[rings.length-2].y)>0) {
		if ((rings[rings.length-1].y - rings[rings.length-2].y)>0) {
			offsetY = -30;
		} else {
			offsetY = 10;
		}
		var endDiv = this.outline('<b>'+divContent+'<b>',80,offsetY);
		var marker = new Z.Marker(coordinate, this.layerId+'_end_'+counter);
		marker.setSymbol({
			'icon':{
				'type' : 'html',
				'content' : endDiv
			}
		});
		var closeBtn = new Z.Marker(coordinate, this.layerId + '_close_' + counter);
		closeBtn.setSymbol({
			'icon' : {
				'type'   : 'picture',
				'url'    : Z.host + '/engine/images/m_close.png',
				'width'  : 12,
				'height' : 12,
				'offset' : {
					x : offsetX,
					y : -6
				}
			}
		});

		closeBtn.setAttributes(counter);
		closeBtn.on('click',function() {
			_geo.remove();
			for (var i = 0, len = tmpMarkers.length;i<len;i++) {
				if (strEndWith(this.tmpMarkers[i].getId(),"_"+closeBtn.getAttributes()))
					this.tmpMarkers[i].remove();
			}
		});

		//去掉最后一个点的标签
		if(tmpMarkers&&tmpMarkers.length>0) {
			var center = tmpMarkers[tmpMarkers.length-1].getCenter();

			var endIndexes = [tmpMarkers.length-1];
			for (var i=tmpMarkers.length-3;i>0;i-=2) {
				if (tmpMarkers[i].center.x === center.x && tmpMarkers[i].center.y === center.y) {
					endIndexes.push(i);
				} else {
					break;
				}
			}
			for (var i=0, len=endIndexes.length;i<len;i++) {
				tmpMarkers[endIndexes[i]].remove();
			}
		}

		this.drawLayer.addGeometry([point,closeBtn,marker,_geo]);

		tmpMarkers.push(marker);
		tmpMarkers.push(point);
		tmpMarkers.push(closeBtn);
		function strEndWith(str, end) {
			if (str==null||str==''||str.length==0||end.length>str.length)
			 return false;
			if (str.substring(str.length-end.length)===end)
			 return true;
			else
			 return false;
			return true;
		}

	},

	changeCursor:function(cursorStyle) {
	   /*if (_canvas.style!=null && !_canvas.style.cursor)
			_canvas.style.cursor = cursorStyle;*/
   }
});
/**
 * 测面积鼠标工具类
 */
Z['ComputeAreaTool'] = Z.ComputeAreaTool = Z.Class.extend({
	includes: [Z.Eventable],
	/**
	* 初始化测面积工具
	* options:{aftermeasure: fn}
	*/
	initialize: function(options, map) {
		Z.Util.extend(this, options);
		if(map) {
			this.addTo(map);
		}
		return this;
	},

	addTo: function(map) {
		this.map = map;
		if (!this.map) {return;}
		if (!this.mode) {
			this.mode = Z.Geometry.TYPE_POLYGON;
		}
		this.layerId = '____system_layer_computeareatool';
		this.drawLayer = null;
		this.drawTool = null;
		this.rings = [];
		this.enable();
		return this;
	},
	/**
	* 激活测距鼠标工具
	* @export
	*/
	enable: function() {
		if (!this.map) return;
		this.drawLayer = this.map.getLayer(this.layerId);
		if (this.drawLayer != null && this.drawTool != null) {
			this.drawTool.enable();
			return;
		}
		if (this.drawLayer != null) {
			this.map.removeLayer(this.layerId);
		}
		var _canvas = this.map.canvasDom;

		this.drawLayer = new Z.SVGLayer(this.layerId);
		this.map.addLayer(this.drawLayer);

		drawTool = new Z.DrawTool({
			'mode':Z.Geometry.TYPE_POLYGON,
			'symbol': {
				'strokeSymbol':{'stroke':'#ff0000', 'stroke-width':2, 'opacity':1},
				'fillSymbol':{'fill':'#ff0000', 'fill-opacity':0.2}
			},
			'afterdrawdisable': true
		}).addTo(this.map);

		drawTool.on('startdraw', Z.Util.bind(this.startMeasure, this));
		drawTool.on('drawring', Z.Util.bind(this.measureRing, this));
		drawTool.on('afterdraw', Z.Util.bind(this.afterMeasure, this));

		this.counter = 0;
		this.pointCounter = 0;
		this.tmpMarkers = [];
	},

	/**
	* 停止测距鼠标工具
	* @export
	*/
	disable: function() {
		this.clear();
		if (this.drawTool != null) {
			this.drawTool.disable();
		}
	},

	measureRing: function (param) {
		var coordinate = param['coordinate'];
		this.pointCounter ++;
		var point = this.genMesurePoint(coordinate,this.layerId + '_ringp_' + this.pointCounter + '_' + this.counter);
		this.drawLayer.addGeometry([point]);
		this.tmpMarkers.push(point);
	},

	startMeasure: function(param) {
		var coordinate = param['coordinate'];
		var point = this.genMesurePoint(coordinate,this.layerId + '_ringp_' + this.pointCounter +'_' + this.counter);
		this.drawLayer.addGeometry([point]);
		this.tmpMarkers.push(point);
	},

	afterMeasure: function(param) {
		var coordinate = param['coordinate'];
		var polygon = param['target'];
		var area = this.map.computeGeodesicArea(polygon);
		var divContent = null;
		if (area > 1000000) {
			divContent = (area/1000000).toFixed(1)+'平方公里';
		} else {
			divContent = area.toFixed(1)+'平方米';
		}

		this.endMeasure(coordinate, divContent, polygon);
		this.changeCursor('default');
		this.counter++;
		/**
		 * 面积量算结束事件
		 * @event aftermeasure
		 * @param result: 总面积
		 */
		this.fire('aftermeasure', {'result' : area});
	},

	/**
	 * 清除测量过程中产生的标注
	 * @export
	 */
	clear:function(){
		if (!this.map) return;
		if (this.drawLayer != null) {
			this.drawLayer.clear();
		}
		var _canvas = this.map.canvasDom;
		if (!_canvas)
			this.changeCursor('default');
		this.rings = [];
	},

	outline: Z.DistanceTool.prototype.outline,
	genMesurePoint: Z.DistanceTool.prototype.genMesurePoint,
	endMeasure: Z.DistanceTool.prototype.endMeasure,
	changeCursor: Z.DistanceTool.prototype.changeCursor
});
Z['LodInfo']={
    'crs3857':{
        'projection':'ESPG:3857', //gcj02 | gcj02ll | 4326 | 3857 | bd09
        'maxZoomLevel':18,
        'minZoomLevel':1,
        'resolutions':[
            156543.0339,
            78271.51695,
            39135.758475,                                             
            19567.8792375,
            9783.93961875,
            4891.969809375,
            2445.9849046875,
            1222.99245234375,
            611.496226171875,
            305.7481130859375,
            152.87405654296876,
            76.43702827148438,
            38.21851413574219,
            19.109257067871095,
            9.554628533935547,
            4.777314266967774,
            2.388657133483887,
            1.1943285667419434,
            0.5971642833709717
        ],
        'origin': {
            "top":20037508.34,
            "left":-20037508.34,
            "bottom":-20037508.34,
            "right":20037508.34
        },
        'tileSize':{
            'width':256,
            'height':256
        }
    },
    'globalmercator':{
        'projection':'ESPG:3857', //gcj02 | gcj02ll | 4326 | 3857 | bd09
        'maxZoomLevel':18,
        'minZoomLevel':1,
        'resolutions':[
            156543.0339,
            78271.51695,
            39135.758475,
            19567.8792375,
            9783.93961875,
            4891.969809375,
            2445.9849046875,
            1222.99245234375,
            611.496226171875,
            305.7481130859375,
            152.87405654296876,
            76.43702827148438,
            38.21851413574219,
            19.109257067871095,
            9.554628533935547,
            4.777314266967774,
            2.388657133483887,
            1.1943285667419434,
            0.5971642833709717
        ],
        'origin': {
            "top":20037508.34,
            "left":-20037508.34,
            "bottom":-20037508.34,
            "right":20037508.34
        },
        'tileSize':{
            'width':256,
            'height':256
        }
    },
    'baidu':{
        'projection':'BAIDU',
        'maxZoomLevel':19,
        'minZoomLevel':1,
        'resolutions':(function() {
            var res = Math.pow(2,18);
            var resolutions = [];
            for (var i = 0; i < 20; i++){
                resolutions[i] = res;
                res *= 0.5;
            }
            return resolutions;
        })(),
        'origin':{
            "top":33554432,
            "left":-33554432,
            "bottom":-33554432,
            "right":33554432
        },
        'tileSize':{
            'width':256,
            'height':256
        }
    }
};

//其他类似google地图结构的地图lodinfo的初始化
// Z['LodInfo']['mapabc']={};
// Z.Util.extend(Z['LodInfo']['mapabc'],Z['LodInfo']['google']);
// Z['LodInfo']['mapabc']['getTileUrl']=function(x,y,z) {
//  return "http://emap"+Math.round(Math.random()*(3-1)+1)+".mapabc.com/mapabc/maptile?&x=" + x + "&y=" + y + "&z=" + z;
// };


Z.LodUtil={
    Common:{
        caculateScales:function(base) {
            var xscales=[];
            var yscales=[];
            var projection = this.projection;
            var resolutions = this['resolutions'];
            if (!base) {base = {"x":121.45634,"y":31.22787};}
            var pBase = projection.project({x:base.x, y:base.y});
            for (var i=0, len=resolutions.length;i<len;i++) {
                var xcac = projection.unproject({x:pBase.x+resolutions[i],y:pBase.y}); //加上resolution后反算真经纬度
                var ycac = projection.unproject(pBase.x,pBase.y+resolutions[i]); //加上resolution后反算真经纬度
                var xscale = projection.getGeodesicLength(base,xcac);
                var yScale = projection.getGeodesicLength(base,ycac);
                xscales.push(xscale);
                yscales.push(yScale);
            }
            this.xscales = xscales;
            this.yscales = yscales;
        }
    },
    Default:{
        /**
         * 根据中心点投影坐标, 计算中心点对应的瓦片和瓦片内偏移量
         * @param  {[type]} pLonlat   [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getCenterTileInfo:function( pLonlat, zoomLevel) {
            if (!pLonlat || zoomLevel === null || zoomLevel === undefined) {return null;}
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            var tileLeft = tileSize['width']*tileX * resolution+this['origin']['left'];
            var tileTop = this['origin']['top'] - tileY* resolution * tileSize['height'];
            var offsetLeft = Math.abs(Math.round((pLonlat.x-tileLeft)/resolution));
            var offsetTop = Math.abs(Math.round((pLonlat.y-tileTop)/resolution));
            return {'x':tileX, 'y':tileY, 'offsetLeft':offsetLeft, 'offsetTop':offsetTop};
        },
        /**
         * 根据投影坐标,计算瓦片编号
         * @param  {[type]} pLonlat   [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getTileIndex:function(pLonlat, zoomLevel) {
            var tileSize=this['tileSize'];
            var maxExtent=this['origin'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.ceil((maxExtent['top'] - pLonlat.y) / ( resolution* tileSize['height'])) - 1;
            var tileX = Math.floor((pLonlat.x - maxExtent['left']) / (resolution * tileSize['width']));
            return {'y':tileY,'x':tileX};
        },
        /**
         * 根据给定的瓦片编号,和坐标编号偏移量,计算指定的瓦片编号
         * @param  {[type]} tileY   [description]
         * @param  {[type]} tileX   [description]
         * @param  {[type]} offsetY [description]
         * @param  {[type]} offsetX [description]
         * @return {[type]}         [description]
         */
        getNeighorTileIndex:function(tileY, tileX, offsetY,offsetX) {
            return {'y':(tileY+offsetY), 'x':(tileX+offsetX)};
        },
        /**
         * 计算瓦片左上角的经纬度坐标
         * @param  {[type]} tileY     [description]
         * @param  {[type]} tileX     [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getTileProjectedNw:function(tileY,tileX,zoomLevel) {
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            var maxExtent = this['origin'];
            var y = maxExtent['top'] - tileY*(resolution* tileSize['height']);
            var x = tileX*resolution*tileSize['width']+maxExtent["left"];
            return this.getProjectionInstance().unproject({x:x,y:y});
        }
    },
    GLOALMERCATOR:{
        getCenterTileInfo:function(pLonlat, zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            var tileLeft = tileSize['width']*tileX * resolution+this['origin']['left'];
            var tileTop = (tileY+1)* resolution * tileSize['height']+this['origin']['bottom'];
            var offsetLeft = Math.round((pLonlat.x-tileLeft)/resolution);
            var offsetTop = Math.round((tileTop-pLonlat.y)/resolution);
            return {"y":tileY, "x":tileX, "offsetLeft":offsetLeft, "offsetTop":offsetTop};
        },
        getTileIndex:function( pLonlat, zoomLevel) {
            var maxExtent = this['origin'];
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.floor((pLonlat.y-maxExtent['bottom'])/(resolution* tileSize['height']));
            var tileX = Math.floor((pLonlat.x-maxExtent['left']) / (resolution * tileSize['width']));
            return {'y':tileY,'x':tileX};
        },
        getNeighorTileIndex:function(tileY, tileX, offsetY,offsetX) {
            return {'y':(tileY-offsetY), 'x':(tileX+offsetX)};
        },
        getTileProjectedNw:function(tileY,tileX,zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var y = (tileY+1)*(resolution* tileSize['height'])+this['origin']['bottom'];
            var x = tileX*resolution*tileSize['width']+this['origin']['left'];
            return this.getProjectionInstance().unproject({x:x,y:y});
        }
    },
    BD09:{
        getCenterTileInfo:function(pLonlat, zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            var tileLeft = tileSize['width']*tileX * resolution;
            var tileTop = (tileY+1)* resolution * tileSize['height'];
            var offsetLeft = Math.round((pLonlat.x-tileLeft)/resolution);
            var offsetTop = Math.round((tileTop-pLonlat.y)/resolution);
            return {"y":tileY, "x":tileX, "offsetLeft":offsetLeft, "offsetTop":offsetTop};
        },
        getTileIndex:function( pLonlat, zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.floor(pLonlat.y/(resolution* tileSize['height']));
            var tileX = Math.floor((pLonlat.x) / (resolution * tileSize['width']));
            return {'y':tileY,'x':tileX};
        },
        getNeighorTileIndex:function(tileY, tileX, offsetY,offsetX) {
            return {'y':(tileY-offsetY), 'x':(tileX+offsetX)};
        },
        getTileProjectedNw:function(tileY,tileX,zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var y = (tileY+1)*(resolution* tileSize['height']);
            var x = tileX*resolution*tileSize['width'];
            return this.getProjectionInstance().unproject({x:x,y:y});
        }
    }
};
Z.LodConfig=Z.Class.extend({

        includes:Z.LodUtil.Common,

        /**
         * 初始化方法
         * @param  {[LodInfo]} lodInfo [图层配置属性,参考LodInfo.js中的例子]
         * @return {[type]}         [description]
         */
        initialize:function(lodInfo) {
            if (!this.checkLodInfo(lodInfo)) {return;}
            //lodInfo是预设值的字符串
            var lodName = null;
            if (Z.Util.isString(lodInfo)) {
                lodName = lodInfo;
                lodInfo = Z['LodInfo'][lodInfo.toLowerCase()];
            }
            this.lodInfo = lodInfo;
            Z.Util.extend(this,lodInfo);
            if (!this['padding']) {
                this['padding'] = {
                    'width':0,
                    'height':0
                };
            }
            this.projectionInstance = Z.Projection.getInstance(lodInfo['projection']);
            if ('baidu' === lodInfo['projection'].toLowerCase()) {
                Z.Util.extend(this,Z.LodUtil.BD09);
            }  else {
                if (lodName && 'globalmercator' === lodName) {
                    Z.Util.extend(this,Z.LodUtil.GLOALMERCATOR);
                } else {
                    Z.Util.extend(this,Z.LodUtil.Default);
                }

            }
            if (this['origin']) {
                //direction of projected coordinate
                this.dx = (this['origin']['right']>=this['origin']['left'])?1:-1;
                this.dy = (this['origin']['top']>=this['origin']['bottom'])?1:-1;
            }
        },

        checkLodInfo:function(lodInfo) {
            if (!lodInfo) {return false;}
            if (Z.Util.isString(lodInfo) && (Z['LodInfo'][lodInfo.toLowerCase()])) {
                return true;
            }
            if (!lodInfo['srs']) {
                return false;
            }
            return true;
        },

        load:function(afterLoadFn){
            //如果已经有resolutions等属性,则说明无需初始化
            if (this['resolutions']) {
                if (afterLoadFn) {
                    afterLoadFn();
                }
                return;
            }
            //TODO arcgis初始化
        },

        equals:function(lodConfig, zoomLevel) {
            try {
                return lodConfig['resolutions'][zoomLevel] === this['resolutions'][zoomLevel] && 
                this['projection'] === lodConfig['projection'];             
            } catch (error) {
                return false;
            }
            
        },

        getProjectionInstance:function() {

            return this.projectionInstance;
        },

        getResolution:function(z) {
            if (this['resolutions']) {
                return this['resolutions'][z];
            }
            return 0;
        }

        
});


Z.ResourceLoader=Z.Class.extend({

		includes:Z.Eventable,

		defaultIconImg : null,


		initialize:function(urls) {
			this.imgUrls = urls;
			this.resourcesCache={};
			this.defaultIconUrl = "/engine/images/marker.png";
		},

		load:function(successFn, invoker) {
			this.successFn = successFn;
			this.successFnInvoker = invoker;
			if (!this.defaultIconImg) {
				var _this = this;
				this.defaultIconImg = new Image();
				this.defaultIconImg.onload=function() {
					_this.loadImages();
				};
				this.defaultIconImg.src=Z.host +this.defaultIconUrl;				
			} else {
				this.loadImages();
			}						
		},
		addResource:function(url) {
			if (!Z.Util.isString(url)) {
				return;
			}
			if (!this.imgUrls) {this.imgUrls = [];}
			if (this.resourcesCache[url]) {
				return;
			}
			this.imgUrls.push(url);
		},
		loadImages:function() {
			function onResourceLoad(image) {
				if (!image) {
					image = this;
				}
				if (!(image instanceof Image)) {
					image = this;
				}
				if (image && image["in"]) {
					_this.resourcesCache[image["in"]] = image;
				}				
				_this.check();
			}
			function onResourceFail() {
				_this.resourcesCache[this["in"]] = this.defaultIconImg;
			}

			if (!this.imgUrls || !Z.Util.isArray(this.imgUrls)) {
				this.onComplete();
				return;
			}
			var _this = this;
			var hasNew = false;
			for (var i = 0, len=this.imgUrls.length;i<len;i++) {
				if (!this.imgUrls[i]) {continue;}
				if (this.resourcesCache[this.imgUrls[i]]) {continue;}
				hasNew = true;
				var image = new Image();
				//防止绝对地址变成了相对地址
				image["in"] = this.imgUrls[i];
				image.onload=onResourceLoad;
				image.onerror=onResourceFail;
				image.onabort=onResourceFail;
				image.src=this.imgUrls[i];
				if (image["complete"]) {
					onResourceLoad(image);
				}
			}
			if (!hasNew) {
				this.check();
			}
			
		},
		getImage:function(url) {
			if (!this.resourcesCache || !url) {
				return this.defaultIconImg;
			}
			var img = this.resourcesCache[url];
			if (!img) {
				img = this.defaultIconImg;
			}
			return img;
		},
		check:function() {
			var allLoaded = true;
			for (var u in this.resourcesCache) {
				if (!this.resourcesCache[u]["complete"]) {
					allLoaded = false;
					break;
				}
			}
			if (allLoaded) {
				this.onComplete();
				
			}
		},
		onComplete:function() {
			if (this.completeExecutor) {
				clearTimeout(this.completeExecutor);
			}
			var _this = this;
			this.completeExecutor=setTimeout(function() {
				//_this.executeListeners("loadcomplete");
				if (_this.successFn) {
					if (this.successFnInvoker) {
						_this.successFn.call(this.successFnInvoker);
					} else {
						_this.successFn();
					}
				}
			},10);
		}
});

/**
 * 所有图层的基类
 * 供Map调用的图层方法有:
 * load,onMoving, onMoveEnd, onResize, onZoomStart, onZoomEnd
 * @param  {[type]} map             [description]
 * @param  {[type]} zIndex)         {		if        (!map) {return;}		this.map [description]
 * @param  {[type]} getId:function( [description]
 * @return {[type]}                 [description]
 */
Z['Layer']=Z.Layer=Z.Class.extend({
	
	includes: Z.Eventable,

	events:{
		LAYER_LOADED:'layerloaded'
	},


	prepare:function(map,zIndex) {
		if (!map) {return;}
		this.map = map;
		this.setZIndex(zIndex);
		if (Z.Util.isNil(this.visible)) {
			this.visible = true;
		}
	},


	getZIndex:function() {
		return this.zIndex;
	},
	
	/**
	 * 获取图层id
	 * @returns
	 * @export
	 */
	getId:function() {
		return this.identifier;
	},

	/**
	 * 设置图层id
	 * @param {String} [id] [图层id]
	 * @export
	 */
	setId:function(id) {
		this.identifier = id;
	},

	/**
	 * 获取图层所属的地图对象
	 * @export
	 * @returns {seegoo.maps.Map}
	 */
	getMap:function() {
		if (this.map) {
			return this.map;
		}
		return null;
	},


	/**
	 * 获取图层的Extent
	 * @return {Extent} 图层的Extent
	 */
	getExtent:function() {
		if (!this.extent) {return null;}
		return this.extent;
	},

	/**
	 * 将图层置顶
	 * @export
	 */
	bringToFront:function() {
		var layers = this.getLayerList();
		var hit=this.getLayerIndexOfList(layers);
		if (hit === layers.length-1) {return;}
		if (hit >= 0) {
			layers.splice(hit,1);
			layers.push(this);
		}
		for (var i=0, len=layers.length;i<len;i++) {
			layers[i].setZIndex(layers[i].baseZIndex+i);
		}
	},
	
	/**
	 * 将图层置底
	 * @export
	 */
	bringToBack:function(){
		var layers = this.getLayerList();
		var hit=this.getLayerIndexOfList(layers);
		if (hit === 0) {
			return;
		}
		if (hit > 0) {
			layers.splice(hit,1);
			layers.push(this);
		}
		for (var i=0, len=layers.length;i<len;i++) {
			layers[i].setZIndex(layers[i].baseZIndex+i);
		}
	},
	
	/**
	 * 获取图层在图层列表中的index
	 * @param layers
	 * @returns {Number}
	 */
	getLayerIndexOfList:function(layers) {
		if (!layers) {return -1;}
		var hit = -1;
		for (var i =0, len=layers.length;i<len;i++) {
			if (layers[i] == this) {
				hit = i;
				break;
			}
		}
		return hit;
	},
	
	/**
	 * 获取该图层所属的list
	 */
	getLayerList:function() {
		if (!this.map) {return null;}
		if (this instanceof Z.SVGLayer) {
			return this.map.svgLayers;
		} else if (this instanceof Z.CanvasLayer) {
			return this.map.canvasLayers;
		} else if (this instanceof Z.CanvasLayer.Base) {
			return this.map.canvasLayers;
		} else if (this instanceof Z.DynamicLayer) {
			return this.dynLayers;
		} else if (this instanceof Z.TileLayer) {
			return this.overlapLayers;
		} else if (this instanceof Z.HeatLayer) {
			return this.map.heatLayers;
		}
		return null;
	}
});

/**
 * [initialize description]
 * 
 */
Z['TileLayer'] = Z.TileLayer = Z.Layer.extend({

    //瓦片图层的基础ZIndex
    baseDomZIndex:15,

    options: {
        'opacity':1,      
        'errorTileUrl':Z.host+'/engine/images/error.png',
        //是否检查
        'showOnTileLoadComplete':true
    },
    
    /**
     * <pre>
     * 瓦片图层类构造函数
     * 图层配置如下:
     *     crs: 空间参考系设置,例如ESGP:3857
     *     opacity:图层透明度
     *     urlTemplate:URL模板,例如http://{s}.example.com/{z}/{y}/{x}.png
     *     subdomains:数组,用来轮流替换url模板中的{s}变量
     *     tileSize:{width:256,height:256}
     * crs的值可为字符串类型的预定义配置或属性对象:
     *      预定义配置有:"crs3857","crs4326","baidu"
     *      如果是属性对象,则需要指定
     * </pre>     
     * @param  {String} id 图层identifier
     * @param  {Object} opts 图层配置
     */
    initialize:function(id,opts) {
        this.setId(id);
        this.lodConfig = new Z.LodConfig(opts['crs']);
        delete opts['crs'];
        //将其他设置存入this.options中
        Z.Util.setOptions(this,opts);
        //替换url模板中的大写变量为小写
        if (this.options['urlTemplate']) {
            this.options['urlTemplate'] = this.options['urlTemplate'].replace(/{X}/g,'{x}').replace(/{Y}/g,'{y}').replace(/{Z}/g,'{z}').replace(/{S}/g,'{s}');
        }
        // this.extent = lodInfo['fullExtent'];
    },

    getLodConfig:function(){
        if (!this.lodConfig) {
            //如果tilelayer本身没有设定lodconfig,则继承地图基础底图的lodconfig
            if (this.map) {
                return this.map.getLodConfig();
            }
        }
        return this.lodConfig;
    },

    getTileUrl:function(x,y,z) {
        if (!this.options['urlTemplate']) {
            return this.options['errorTileUrl'];
        }
        var urlTemplate = this.options['urlTemplate'];
        var domain = '';
        if (this.options['subdomains']) {
            var subdomains = this.options['subdomains'];
            if (Z.Util.isArray(subdomains) && subdomains.length>0) {
                var rand = Math.round(Math.random()*(subdomains.length-1));    
                domain = subdomains[rand];
            }
        }
        return urlTemplate.replace(/{x}/g,x).replace(/{y}/g,y).replace(/{z}/g,z).replace(/{s}/g,domain);        
    },

    /**
     * 设置图层的层级
     * @param zIndex
     */
    setZIndex:function(zIndex) {    
        this.zIndex = zIndex;
        if (this.tileContainer) {
            this.tileContainer.style.zIndex = (this.baseDomZIndex+zIndex);
        }
    },

    
    /**
     * 地图中心点变化时的响应函数
     */
    onMoving:function() {
        this.fillTiles(false);
    },

    onMoveEnd:function() {
        this.fillTiles(false);
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    onZoomStart:function(donotRemoveTiles) {
        this.clearExecutors();
        if (!donotRemoveTiles && this.tileContainer) {
            this.clear();
        }
    },

    onZoomEnd:function() {
        //this.fillTiles(true);
        this.load();
    },

    onResize:function() {
        this.fillTiles(false);
    },

    /**
     * 载入前的准备操作     
     */
    prepareLoad:function() {
        //nothing to do here, just return true
        return true;
    },

    /**
     * 载入地图
     */
    load:function(){
        if (!this.getMap()) {return;}
        if (!this.tileContainer) {
            this.initPanel();    
        }
        this.clear();
        if (this.prepareLoad()) {
            this.clearExecutors();
            var me = this;
            this.tileLoadExecutor = setTimeout(function() {                
                me.fillTiles(me.options['showOnTileLoadComplete']);
            },20);
        }
    },

    clear:function() {
        this.tileMap = {};
        this.tileContainer.innerHTML="";
    },

    getTileSize:function() {
        return this.getLodConfig()['tileSize'];
    },

    getPadding:function() {
        var padding = this.getLodConfig()['padding'];
        if (!padding) {
            padding = {
                'width':0,
                'height':0
            };
        }
        return padding;
    },

    /**
     * 清除瓦片加载的执行器
     * @return {[type]} [description]
     */
    clearExecutors:function() {
        if (this.tileLoadExecutor) {
            clearTimeout(this.tileLoadExecutor);
        }
        if (this.fireEventExecutor) {
            clearTimeout(this.fireEventExecutor);
        }
        if (this.completeExecutor) {
            clearTimeout(this.completeExecutor);
        }
    },

    /**
     * 载入瓦片
     * @param  {Boolean} isCheckTileLoad 检查瓦片是否载入完,如果为true,则在瓦片载入完后再显示图层容器元素
     */
    fillTiles:function(isCheckTileLoad) {
        // isCheckTileLoad = false;
        var map =this.map;
        if (!map) {
            return;
        }        
        var tileContainer = this.tileContainer;
        var lodConfig = this.getLodConfig();        
        if (!tileContainer || !lodConfig) {return;}
        var me = this;
        var tileImages = [];
        var dSegment = document.createDocumentFragment(); 
        function checkAndLoad() {
            var len = tileImages.length;
            var counter = 0;
            for (var i=0;i<len;i++) {
                if (tileImages[i]["complete"]) {
                    counter ++;
                }
            }
            
            if (counter > len*2/3) {
                if (me.completeExecutor) {
                    clearTimeout(me.completeExecutor);
                }
                if (me.fireEventExecutor) {
                        clearTimeout(me.fireEventExecutor);
                    }
                me.completeExecutor=setTimeout(function() {
                    tileContainer.appendChild(dSegment);
                    me.fireEventExecutor=setTimeout(function() {
                        // me.executeListeners("layerloaded");
                        me.fire(me.events.LAYER_LOADED,{'target':this});
                    },500);
                },10);
                /*if (counter == len) {
                    if (me.fireEventExecutor) {
                        clearTimeout(me.fireEventExecutor);
                    }
                    me.fireEventExecutor=setTimeout(function() {
                        // me.executeListeners("layerloaded");
                        me.fire(this.events.LAYER_LOADED,{'target':this});
                    },500);                
                }   */
            }
        }        
        var tileSize = this.getTileSize(),
            zoomLevel = map.getZoomLevel(),         
            mapDomOffset = map.offsetPlatform();
        var holderLeft=mapDomOffset["left"],
            holderTop = mapDomOffset["top"],
            mapWidth = map.width,
            mapHeight = map.height;
            //中心瓦片信息,包括瓦片编号,和中心点在瓦片上相对左上角的位置
        var centerTileInfo =  lodConfig.getCenterTileInfo(map.getPCenter(), zoomLevel);

        //计算中心瓦片的top和left偏移值    
        var centerOffset={};    
        centerOffset.top=Math.round(parseFloat(mapHeight/2-centerTileInfo["offsetTop"]));
        centerOffset.left=Math.round(parseFloat(mapWidth/2-centerTileInfo["offsetLeft"]));
        //中心瓦片上下左右的瓦片数
        var tileTopNum =Math.ceil(Math.abs(centerOffset.top)/tileSize["width"]),
            tileLeftNum=Math.ceil(Math.abs(centerOffset.left)/tileSize["height"]),
            tileBottomNum=Math.ceil(Math.abs(mapHeight-centerOffset.top)/tileSize["height"]),
            tileRightNum=Math.ceil(Math.abs(mapWidth-centerOffset.left)/tileSize["width"]);
        
    //  只加中心的瓦片，用做调试
    //  var centerTileImg = this._createTileImage(centerOffset.left,centerOffset.top,this.config.getTileUrl(centerTileInfo["topIndex"],centerTileInfo["leftIndex"],zoomLevel),tileSize["height"],tileSize["width"]);
    //  tileContainer.appendChild(centerTileImg);   
        
        var currentTiles = this.tileMap;        
        //TODO 瓦片从中心开始加起
        for (var i=-(tileLeftNum);i<tileRightNum;i++){
            for (var j=-(tileTopNum);j<=tileBottomNum;j++){                 
                    var tileIndex = lodConfig.getNeighorTileIndex(centerTileInfo["y"], centerTileInfo["x"], j,i);               
                    var tileId=tileIndex["y"]+","+tileIndex["x"];
                    var tileLeft = centerOffset.left + tileSize["width"]*i-holderLeft;
                    var tileTop = centerOffset.top +tileSize["height"]*j-holderTop;
                    if (!currentTiles[tileId]) {
                        var tileUrl = this.getTileUrl(tileIndex["x"],tileIndex["y"],zoomLevel);
                        var tileImage = this.createTileImage(tileLeft,tileTop, tileUrl,(isCheckTileLoad?checkAndLoad:null));
                        if (!tileImage) {
                            continue;
                        }
                        tileImage.id = tileId;
                        if (isCheckTileLoad) {
                            tileImages.push(tileImage);
                        } 
                        dSegment.appendChild(tileImage);                        
                        currentTiles[tileId] = {left:tileLeft, top:tileTop, tile:tileImage};
                    } else {
                        var image = currentTiles[tileId].tile;
                        if (tileLeft != currentTiles[tileId].left || tileTop != currentTiles[tileId].top) {
                            image.style.left = (tileLeft)+"px";
                            image.style.top = (tileTop)+"px";
                            currentTiles[tileId].left = tileLeft;
                            currentTiles[tileId].top = tileTop;
                        }
                    }
            }
        }
        if (isCheckTileLoad) {
            checkAndLoad();
        } else {
            tileContainer.appendChild(dSegment);
        }
        
        if (this.removeout_timeout) {
            clearTimeout(this.removeout_timeout);
        }
        this.removeout_timeout = setTimeout(function() {
            me.removeTilesOutOfHolder();
        },500);
        
        
        
    },

    /*fillTiles:function() {
        var tileContainer = this.tileContainer;
        var lodConfig = this.lodConfig;
        var map =this.map;
        if (!map || !tileContainer || !this.lodConfig) {return;}
        var _this = this;
        var dSegment = document.createDocumentFragment(); 
        
        var tileSize = lodConfig["tileSize"],
            zoomLevel = map.getZoomLevel(),         
            mapDomOffset = map.offsetPlatform();
        var holderLeft=mapDomOffset["left"],
            holderTop = mapDomOffset["top"],
            mapWidth = map.width,
            mapHeight = map.height;
        var centerTileInfo =  lodConfig.getCenterTileInfo(map.getPCenter(), zoomLevel);
        //计算中心瓦片的top和left偏移值    
        var centerOffset={};    
        centerOffset.top=Math.round(parseFloat(mapHeight/2-centerTileInfo["offsetTop"]));
        centerOffset.left=Math.round(parseFloat(mapWidth/2-centerTileInfo["offsetLeft"]));
        //中心瓦片上下左右的瓦片数
        var tileTopNum =Math.ceil(Math.abs(centerOffset.top)/tileSize["width"]),
            tileLeftNum=Math.ceil(Math.abs(centerOffset.left)/tileSize["height"]),
            tileBottomNum=Math.ceil(Math.abs(mapHeight-centerOffset.top)/tileSize["height"]),
            tileRightNum=Math.ceil(Math.abs(mapWidth-centerOffset.left)/tileSize["width"]);
        
    //  只加中心的瓦片，用做调试
    //  var centerTileImg = this._createTileImage(centerOffset.left,centerOffset.top,this.config.getTileUrl(centerTileInfo["topIndex"],centerTileInfo["leftIndex"],zoomLevel),tileSize["height"],tileSize["width"]);
    //  tileContainer.appendChild(centerTileImg);   
        var padding = this.lodConfig["padding"];
        if (!padding) {
            padding = {
                'width':0,
                'height':0
            };
        }
        var currentTiles = this.tileMap;        
        var tileIndexes = [];


        //TODO 瓦片从中心开始加起
        for (var i=-(tileLeftNum);i<tileRightNum;i++){
            for (var j=-(tileTopNum);j<=tileBottomNum;j++){
                    var tileIndex = lodConfig.getNeighorTileIndex(centerTileInfo["y"], centerTileInfo["x"], j,i);                                   
                    var tileLeft = centerOffset.left + tileSize["width"]*i-holderLeft;
                    var tileTop = centerOffset.top +tileSize["height"]*j-holderTop;
                    var tileId=tileIndex["x"]+","+tileIndex["y"];
                    if (currentTiles[tileId]) {
                        var image = currentTiles[tileId].tile;
                        if (tileLeft != currentTiles[tileId].left || tileTop != currentTiles[tileId].top) {
                            image.style.left = (tileLeft)+"px";
                            image.style.top = (tileTop)+"px";
                        }
                    } else {
                        tileIndexes.push({index:tileIndex, l:tileLeft,t:tileTop});
                    }
            }
        }

        function genTile(tileIndex,tileLeft,tileTop) {
            var tileId=tileIndex["x"]+","+tileIndex["y"];
            var tileUrl = lodConfig["getTileUrl"](tileIndex["x"],tileIndex["y"],zoomLevel);
            var tileImage = this.createTileImage(tileLeft,tileTop,tileUrl);
            if (!tileImage) {
                return;
            }
            tileImage.id = tileId;
            dSegment.appendChild(tileImage);                        
            currentTiles[tileId] = {left:tileLeft, top:tileTop, tile:tileImage};
        }
        //sort tiles to append from center
        tileIndexes.sort(function(a,b) {
            return (Math.abs((a.index.x-centerTileInfo['x'])*(a.index.y-centerTileInfo['y']))-Math.abs((b.index.x-centerTileInfo['x'])*(b.index.y-centerTileInfo['y'])));
        });

        for (var n =0, len=tileIndexes.length;n<len;n++) {
            genTile.call(this,tileIndexes[n].index, tileIndexes[n].l, tileIndexes[n].t);
        }


        tileContainer.appendChild(dSegment);
        
        this.fire(this.events.LAYER_LOADED,{'target':this});
        
        if (this.removeout_timeout) {
            clearTimeout(this.removeout_timeout);
        }
        this.removeout_timeout = setTimeout(function() {
            _this.removeTilesOutOfHolder();
        },1000);
        
        
    },*/

    /**
     * 生成瓦片图片
     * @param  {Number} _tileLeft    瓦片的style.left
     * @param  {Number} _tileTop     瓦片的style.top
     * @param  {String} url          瓦片地址
     * @param  {Fn}     loadcallback 额外的瓦片图片onload回调
     * @return {Image}              瓦片图片对象
     */
    createTileImage:function(_tileLeft, _tileTop, url,  onloadFn) {        
        var tileImage = new Image(),
            tileSize = this.getTileSize();
        var padding = this.getPadding();
        

        var width = tileSize['width']+padding['width'],
            height = tileSize['height']+padding['height'],
            defaultTileUrl = Z.host + '/engine/images/transparent.gif';
        //border:1px green solid;
        //TODO 当前padding设定为整个瓦片增加的宽度和高度, 改为纵向每边增加的高度, 横向每边增加的宽度,即为当前的1/2
        tileImage.style.cssText = 'width:'+width+'px;height:'+height+'px;unselectable:on;position:absolute;left: '+
                                    (_tileLeft-padding['width']/2)+'px;top: '+(_tileTop-padding['height']/2)+ 'px;max-width:none;-moz-user-select: -moz-none;-webkit-user-select: none;';
        tileImage.className="MAP_FADE_ANIM";
        tileImage["onload"]=function(){
            this.style.cssText+=";opacity:1;";
            Z.Util.fixPNG(this);
            if (onloadFn) {
                onloadFn();
            }
        };
        tileImage["onerror"]=function(){
            this.onload=null;
            this.onerror=null;
            this.onabort=null;
            this.src=defaultTileUrl;            
            Z.Util.fixPNG(this);
            if (onloadFn) {
                onloadFn();
            }
        };
        tileImage["onabort"]=function() {
            this.onload=null;
            this.onerror=null;
            this.onabort=null;
            this.src=defaultTileUrl;
            Z.Util.fixPNG(this);
            if (onloadFn) {
                onloadFn();
            }
        };
        tileImage.src=url;
        return tileImage;
    },

    /**
     * 移除tileContainer之外的瓦片
     */
    removeTilesOutOfHolder:function() {
        //var _mapContainer = this.map.mapContainer;
        if (this.map.isBusy) {
            //console.log("blocked");
            return;
        }       
        var tileContainer = this.tileContainer;
        if (!tileContainer) {return;}
        var map = this.map;
        var mapHeight = map.height,
            mapWidth = map.width,
            mapDomOffset = map.offsetPlatform(),
            lodConfig = this.getLodConfig();
        var _holderLeft = mapDomOffset["left"],
            _holderTop = mapDomOffset["top"],
            _tileSize = lodConfig["tileSize"],
            padding = this.getPadding();
        var currentTile = null;
        try {
            currentTile = tileContainer.firstChild;
        } catch (err) {
            
        }
        
        if (!currentTile) {return;}
        var tilesToRemove = [];
        while (currentTile) {
            if (!this.tileMap[currentTile.id]) {
                currentTile = currentTile.nextSibling;
                continue;
            }
            var tileLeft = this.tileMap[currentTile.id].left+padding["width"]/2+_holderLeft,
                tileTop = this.tileMap[currentTile.id].top+padding["height"]/2+_holderTop;
            if ( tileLeft >=mapWidth ||  tileLeft <= -_tileSize["width"] || tileTop > mapHeight || tileTop <  -_tileSize["height"]) {
                tilesToRemove.push(currentTile);            
                delete this.tileMap[currentTile.id];
            } 
            currentTile = currentTile.nextSibling;
        }
        var count = tilesToRemove.length;
        if ( count === 0) {return;}
        for (var i=0;i<count;i++) {     
            Z.DomUtil.removeDomNode(tilesToRemove[i]);
        }
    },


    initPanel:function() {
        var mapContainer = this.map.panels.mapContainer;
        if (!mapContainer) {return;}
        //生成地图瓦片装载div       
        var tileContainer = Z.DomUtil.createEl('div');     
        tileContainer.style.cssText = 'position:absolute;top:0px;left:0px;z-index:'+(this.baseDomZIndex+this.getZIndex());
        var currentTileContainers = mapContainer.childNodes;
        if (currentTileContainers && currentTileContainers.length > 0) {
            var firstChild = currentTileContainers[0];              
            mapContainer.insertBefore(tileContainer,firstChild);
        } else {
            mapContainer.appendChild(tileContainer);
        }
        if (Z.Browser.ie) {
            tileContainer['onselectstart'] = function(e) {
                return false;
            };
            tileContainer.setAttribute('unselectable', 'on');
            tileContainer['ondragstart'] = function(e) { return false; };
        }
        this.tileContainer = tileContainer;     
    }
});
Z['DynamicLayer']=Z.DynamicLayer=Z.TileLayer.extend({
    //瓦片图层的基础ZIndex
    baseDomZIndex:50,

    options:{
        'showOnTileLoadComplete':false
    },

    initialize:function(id, opts) {
        this.setId(id);
        // this.options={};
        this.guid=this.GUID();
        Z.Util.extend(this.options, opts);
        //reload时n会增加,改变瓦片请求参数,以刷新浏览器缓存
        this.n=0;
    },

    GUID:function() {
        return new Date().getTime()+""+(((1 + Math.random()) * 0x10000 + new Date().getTime()) | 0).toString(16).substring(1);
    },

    /**
     * 重新载入动态图层，当改变了图层条件时调用
     * @export
     */
    reload:function() {
        this.n=this.n+1;
        this.load();
    },

    /**
     * 载入前的准备, 由父类中的load方法调用
     */
    prepareLoad:function() {
        var map = this.getMap();
        var zoomLevel=map.getZoomLevel();
        var min = this.getMinZoomLevel();
        var max = this.getMaxZoomLevel();
        if (!Z.Util.isNil(min) && min>=0 && zoomLevel<min) {
            return false;
        }
        if (!Z.Util.isNil(max) && max>=0 && zoomLevel>max) {
            return false;
        }
        if (!this.options['layers'] || !this.options['mapdb']) {
            return false;
        }
        var me = this;
        var url=Z.host+"/dynamic/index";
        var param_spatialFilter= null;
        var spatialFilter = this.getSpatialFilter();
        if (spatialFilter) {
            param_spatialFilter = JSON.stringify(spatialFilter.toJson());
        }
        var queryString=this.formQueryString( this.getCondition(), param_spatialFilter);
        var ajax = new Z.Util.Ajax(url,0,queryString,function(responseText){
            var result = Z.Util.parseJson(responseText);
            if (result && result["success"]) {
                me.fillTiles(me.options['showOnTileLoadComplete']);
            }
        });
        //保证在高频率load时，dynamicLayer总能在zoom结束时只调用一次
        if (this.loadDynamicTimeout) {
            clearTimeout(this.loadDynamicTimeout);
        }

        this.loadDynamicTimeout = setTimeout(function() {
            ajax.post();
            if (!me.heartBeator) {
                me.heartBeator = new Z.Util.Ajax(Z.host+"/dynamic/heartbeat",0,"guid="+me.guid,function(responseText){
                });
                setInterval(function() {
                    me.heartBeator.get();
                },60*1000);
            }
        },map.getZoomMillisecs()+80);
        //通知父类先不载入瓦片
        return false;
    },

    getTilePadding:function() {
        return this.options['padding'];
    },

    getTileUrl:function(x,y,z) {
        return this.getRequestUrl(y,x,z);
    },

    /**
     * 获得瓦片请求地址
     * @param topIndex
     * @param leftIndex
     * @param zoomLevel
     * @returns
     */
    getRequestUrl:function(topIndex,leftIndex,zoomLevel){
            var src= Z.host+"/dynamic/tile?";
            src+=this.getRequestUrlParams(topIndex,leftIndex,zoomLevel);
            return src;
    },

    getRequestUrlParams:function(topIndex,leftIndex,zoomLevel) {
        var map = this.getMap();
        var lodConfig = map.getLodConfig();
        var tileNw = lodConfig.getTileProjectedNw(topIndex,leftIndex,zoomLevel);
        var params="";
        params+="guid="+this.guid;
        params+="&nw="+tileNw.x+","+tileNw.y;
        params+="&z="+map.zoomLevel;
        params+="&c="+this.n;
        return params;
    },

    formQueryString:function(condition,spatialFilter) {
        var map = this.getMap();
        var lodConfig = map.getLodConfig();
        var padding = this.getPadding();
        var config = {
            'coordinateType':(Z.Util.isNil(this.options['coordinateType'])?null:this.options['coordinateType']),
            'projection':lodConfig['projection'],
            'guid':this.guid,
            'encoding':'utf-8',
            'mapdb':this.options['mapdb'],
            'padding':padding["width"]+","+padding["height"],
            'len':lodConfig["tileSize"]["width"],
            'res':lodConfig['resolutions'][map.getZoomLevel()],
            'layers':this.options['layers'],
            'condition':condition,
            'spatialFilter':(Z.Util.isNil(spatialFilter)?null:encodeURIComponent(spatialFilter)),
            'opacity':(Z.Util.isNil(this.getOpacity())?null:this.getOpacity()),
            'symbolConfig':(Z.Util.isNil(this.options['symbolConfig'])?null:encodeURIComponent(JSON.stringify(this.options['symbolConfig'])))
        };
        var params = [];
        for (var p in config) {
            if (config.hasOwnProperty(p) && !Z.Util.isNil(config[p])) {
                params.push(p+'='+config[p]);
            }
        }
        return params.join('&');
        /*var ret = "projection="+lodConfig['projection']+"&guid="+this.guid;
        ret+="&encoding=utf-8";
        ret+="&mapdb="+this.options["mapdb"];
        // ret+="&coordinateType="+map.getCoordinateType();

        ret+="&padding="+padding["width"]+","+padding["height"];
        ret+="&len="+lodConfig["tileSize"]["width"];
        var opacity = this.getOpacity();
        if (!Z.Util.isNil(opacity)) {
            ret += "&opacity="+this.opacity;
        }

        if (map) {
            ret+="&r="+lodConfig['resolutions'][map.getZoomLevel()];
            var nt = (map.getProjection().srs != 'ESPG:4326');
            ret+="&nt="+nt;
        }

        if (this.options['layers']) {
            ret += ("&layer="+this.options['layers']);
        }
        if (!Z.Util.isNil(spatialFilter)) {
            ret += ("&spatialFilter="+encodeURIComponent(spatialFilter));
        }
        if (!Z.Util.isNil(condition)) {
            ret += ("&condition="+encodeURIComponent(condition));
        }*/
        /*if (!Z.Util.isNil(fieldFilter)) {
            ret += ("&cond="+encodeURIComponent(fieldFilter));
        }*/
        // return ret;
    },

    /**
     * 获取图层瓦片的padding设置
     * @return {Object} 图层padding设置
     * @export
     */
    getPadding:function() {
        var padding = this.options['padding'];
        if (!padding) {
            padding = {'width':0, 'height':0};
        }
        return padding;
    },

    /**
     * 设置图层瓦片的padding
     * @param {Object} padding 图层padding设置
     * @export
     */
    setPadding:function(padding) {
        this.options['padding'] = padding;
        return this;
    },

    /**
     * 获取最小显示比例尺级别
     * @export
     * @returns {Number}
     */
    getMinZoomLevel:function(){
        var map = this.getMap();
        var ret =  this.options['minZoomLevel'];
        if (Z.Util.isNil(ret)) {
            ret = map.getMinZoomLevel();
        }
        return ret;
    },
    /**
     * 获取最大显示比例尺级别
     * @export
     * @returns {Number}
     */
    getMaxZoomLevel:function(){
         var map = this.getMap();
        var ret =  this.options['maxZoomLevel'];
        if (Z.Util.isNil(ret)) {
            ret = map.getMaxZoomLevel();
        }
        return ret;
    },
    /**
     * 设定动态图层的最小显示比例尺层级
     * @export
     * @param zoomLevel {Number}
     *
     */
    setMinZoomLevel:function(zoomLevel) {
        if (this.map) {
            var mapmin = this.map.getMinZoomLevel();
            if (zoomLevel < mapmin) {
                zoomLevel = mapmin;
            }
        }
        this.options['minZoomLevel']=zoomLevel;
        return this;
    },
    /**
     * 设定动态图层的最大显示比例尺层级
     * @export
     * @param zoomLevel {Number}
     */
    setMaxZoomLevel:function(zoomLevel) {
        if (this.map) {
            var mapmax = this.map.getMaxZoomLevel();
            if (zoomLevel > mapmax) {
                zoomLevel = mapmax;
            }
        }
        this.options['maxZoomLevel']=zoomLevel;
        return this;
    },

    /**
     * 设定动态图层的透明度
     * @param opacity
     * @export
     */
    setOpacity:function(opacity) {
        this.options['opacity'] = opacity;
        return this;
    },

    /**
     * 返回动态图层的透明度
     * @return {Number} 透明度
     * @export
     */
    getOpacity:function() {
        return this.options['opacity'];
    },

    /**
     * 设定查询过滤条件
     * @param {String} condition 查询过滤条件
     * @export
     */
    setCondition:function(condition) {
        this.options['condition'] = condition;
        return this;
    },

    /**
     * 获取查询过滤条件
     * @return {String} 查询过滤条件
     * @export
     */
    getCondition:function() {
        return this.options['condition'];
    },

    /**
     * 设定空间过滤条件
     * @param {SpatialFilter} spatialFilter 空间过滤条件
     * @export
     */
    setSpatialFilter:function(spatialFilter) {
        this.options['spatialFilter'] = spatialFilter;
        return this;
    },

    /**
     * 获取空间过滤条件
     * @return {SpatialFilter} 空间过滤条件
     * @export
     */
    getSpatialFilter:function() {
        return this.options['spatialFilter'];
    }
});
/**
 * 抽象类, 允许叠加Geometry的图层的共同父类
 * @type {Z.OverlayLayer}
 */
Z.OverlayLayer=Z.Layer.extend({
    //根据不同的语言定义不同的错误信息
    'exceptionDefs':{
        'en-US':{
            'DUPLICATE_GEOMETRY_ID':'Duplicate ID for the geometry'
        },
        'zh-CN':{
            'DUPLICATE_GEOMETRY_ID':'重复的Geometry ID'
        }
    },

    /**
     * 通过geometry的id取得Geometry
     * @param  {[String|Integer]} id [Geometry的id]
     * @return {[Geometry]}    [Geometry]
     * @export
     */
    getGeometryById:function(id) {
        if (Z.Util.isNil(id) || id === '') {
            return null;
        }
        if (!this._geoMap[id]) {
            //避免出现undefined
            return null;
        }
        return this._geoMap[id];
    },

    /**
     * 返回图层上所有的Geometry
     * @return {Array} [Geometry数组]
     * @export
     */
    getAllGeometries:function() {
        var cache = this._geoCache;
        var result = [];
        for (var p in cache) {
            if (cache.hasOwnProperty(p)) {
                result.push(cache[p]);
            }
        }
        return result;
    },

    /**
     * 向图层中添加geometry
     * @param {Geometry|[Geometry]} geometries 添加的geometry
     * @param {[type]} fitView    添加后是否聚焦到geometry上
     * @export
     */
    addGeometry:function(geometries,fitView) {
        if (!geometries) {return;}
        if (!Z.Util.isArray(geometries)) {
            this.addGeometry([geometries],fitView);
            return;
        }
        var fitCounter = 0;
        var centerSum = {x:0,y:0};
        var extent = null;
        for (var i=0, len=geometries.length;i<len;i++) {
            var geo = geometries[i];
            if (!geo) {continue;}
            
            var geoId = geo.getId();
            if (geoId) {
                if (!Z.Util.isNil(this._geoMap[geoId])) {
                    throw new Error(this.exceptions['DUPLICATE_GEOMETRY_ID']+':'+geoId);
                }
                this._geoMap[geoId] = geo;
            }
            var internalId = Z.Util.GUID();
            //内部全局唯一的id
            geo.setInternalId(internalId);
            this._geoCache[internalId] = geo;
            geo.prepare(this);
            if (fitView) {
                var geoCenter = geo.getCenter();
                var geoExtent = geo.getExtent();
                if (geoCenter && geoExtent) {                    
                    centerSum.x += geoCenter.x;
                    centerSum.y += geoCenter.y;
                    extent = Z.Extent.combine(extent,geoExtent);
                    fitCounter++;
                }
            }
        }
        var map = this.getMap();
        if (map) {
            this.paintGeometries(geometries);
            if (fitView) {
                var z = map.getFitZoomLevel(extent);
                var center = {x:centerSum.x/fitCounter, y:centerSum.y/fitCounter};
                map.setCenterAndZoom(center,z);
            }
        }
        return this;
    },

    /**
     * 遍历geometry
     * @param  {Function} fn 回调函数
     */
    eachGeometry:function(fn,obj) {
        var cache = this._geoCache;
        if (!obj) {
            obj=this;
        }
        for (var g in cache) {
            if (cache.hasOwnProperty(g)) {
                fn.call(obj,cache[g]);
            }
        }
    },

    /**
     * 从图层上移除Geometry
     * @param  {Geometry} geometry 要移除的Geometry
     * @export
     */
    removeGeometry:function(geometry) {
        if (!(geometry instanceof Z.Geometry)) {
            geometry = this.getGeometryById(geometry);
        }
        if (!geometry) {return;}
        if (this != geometry.getLayer()) {
            return;
        }
        geometry.remove();
        return this;
    },

    /**
     * clear all geometries in this layer
     * @export
     */
    clear:function() {
        this.eachGeometry(function(geo) {
            geo.remove();
        });
        this._geoMap={};
        this._geoCache={};
        return this;
    },

    /**
     * 当geometry被移除时触发
     * @param  {[type]} geometry [description]
     * @return {[type]}          [description]
     */
    onGeometryRemove:function(geometry) {
        if (!geometry) {return;}
        //考察geometry是否属于该图层
        if (this != geometry.getLayer()) {
            return;
        }
        var internalId = geometry.getInternalId();
        if (Z.Util.isNil(internalId)) {
            return;
        }
        var geoId = geometry.getId();
        if (!Z.Util.isNil(geoId)) {
            delete this._geoMap[geoId];
        }
        delete this._geoCache[internalId];
    }, 

    onRemove:function() {
        this.clear();       
        delete this.map;
    },

    getGeoCache:function() {
        return this._geoCache;
    }
});

Z.OverlayLayer.addInitHook(function() {
    this._geoCache={};
    this._geoMap={};
    this._resources={};
});
Z['SVGLayer']=Z.SVGLayer=Z.OverlayLayer.extend({

    //瓦片图层的基础ZIndex
    baseDomZIndex:200,
    /**
     * 构造函数
     * @param  {String} id 图层identifier
     */
    initialize:function(id) {
        this.identifier = id;
    },  

    /**
     * 显示图层
     * @export
     */
    show:function() {
        if (this.visible) {
            return;
        }
        this.eachGeometry(function(geo) {
            geo.show();
        });
        this.visible=true;
        return this;
    },

    /**
     * 隐藏图层
     * @export
     */
    hide:function() {
        if (!this.visible) {
            return;
        }
        this.eachGeometry(function(geo) {
            geo.hide();
        });
        this.visible=false;
        return this;
    },

    /**
     * 图层是否显示
     * @return {Boolean} 图层是否显示
     * @export
     */
    isVisible:function() {
        return this.visible && this.layerDom && this.layerDom.style.display !== 'none';
    },    

    /**
     * 绘制Geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    paintGeometries:function(geometries) {
        for (var i=0,len=geometries.length;i<len;i++) {
            var geo = geometries[i];
            if (!geo) {
                continue;
            }
            if (geo.getPainter()) {
                geo.getPainter().paint(this.layerDom,  this.zIndex);    
            }
        }
    },

    

    addTo:function() {        
        this.eachGeometry(function(geo) {
            if (geo.getPainter()) {
                geo.getPainter().paint(this.layerDom,  this.zIndex);
            }
        });
    },


    load:function() {
        var map = this.getMap();
        this.layerDom = map.panels.svgContainer;
        map.createSVGPaper();
        this.addTo();
    },

    setZIndex:function(zIndex) {
        this.zIndex=zIndex;
        this.eachGeometry(function(geo) {
            if (geo.getPainter()) {
                geo.getPainter().setZIndex(zIndex);    
            }
        });
    },

    onMoveStart:function() {
        //nothing to do
    },

    /**
     * 地图中心点变化时的响应函数
     */
    onMoving:function() {
        //nothing to do 
    },

    onMoveEnd:function() {
        //nothing to do
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    onZoomStart:function() {
        //this.hide();
    },

    onZoomEnd:function() {      
        this.eachGeometry(function(geo) {
            geo.onZoomEnd();
        });
        //this.show();
    },

    onResize:function() {
        //nothing to do
    }
    

});
Z['CanvasLayer']=Z.CanvasLayer=Z.OverlayLayer.extend({
    /**
     * 构造函数
     * @param  {string} identifier 图层identifier
     * @param  {lodconfig} lodconfig 图层的lodconfig
     */
    initialize:function(identifier) {
        this.identifier = identifier;
    },

    /**
     * 显示图层
     * @export
     */
    show:function() {
        if (this.visible) {
            return;
        }
        this.visible=true;
        this.paintGeometries();
        return this;
    },

    /**
     * 隐藏图层
     * @export
     */
    hide:function() {
        if (!this.visible) {
            return;
        }
        this.visible=false;
        this.paintGeometries();
        return this;
    },

    /**
     * 图层是否显示
     * @return {boolean} 图层是否显示
     * @export
     */
    isVisible:function() {
        return this.visible;
    },

    setZIndex:function(zindex) {
        this.zindex=zindex;
    },

     /**
     * 绘制geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    paintGeometries:function(geometries) {
        var map = this.getMap();
        map.repaintBaseCanvasLayer();
    }
});
Z.CanvasLayer.Base=Z.OverlayLayer.extend({
    //load,onMoving, onMoveEnd, onResize, onZoomStart, onZoomEnd
    
    //GeometryID的counter
    _stamp:0,

    initialize:function() {
        this.resourceLoader = new Z.ResourceLoader();
    },

    load:function() {
        // this._geoCache = [];
        var map = this.getMap();
        this.layerContainer = map.panels.canvasLayerContainer;
        this.createLayerCanvas();
        // this.refreshCache();
        this.repaint();
    },

    createLayerCanvas:function() {
        if (!this.layerCanvas) {
            var map = this.getMap();
            if (!this.layerContainer || !map) {return;}

            //初始化
            var layerCanvas = Z.DomUtil.createEl('canvas');
            layerCanvas.style.cssText = 'position:absolute;top:0px;left:0px;';
            this._updateCanvasSize(layerCanvas);
            this.layerContainer.appendChild(layerCanvas);
            this.layerCanvas = layerCanvas;
            this.canvasCtx = this.layerCanvas.getContext("2d");
            this.canvasCtx.translate(0.5, 0.5);
            if (Z.Browser.retina) {
                this.canvasCtx['scale'](2,2);
            }
        }
    },

    _updateCanvasSize:function(canvas) {
        var mapSize = this.map.getSize();
        //retina屏支持
        var r = Z.Browser.retina ? 2:1;
        canvas.height = r * mapSize['height'];
        canvas.width = r * mapSize['width'];
        canvas.style.width = mapSize['width']+'px';
        canvas.style.height = mapSize['height']+'px';
    },

    /**
     * 清除缓存
     * @return {[type]} [description]
     */
    /*clearCache:function() {
        this._geoCache = [];
    },*/

    /**
     * 从CanvasLayer中载入所有的geometry
     * @return {[type]} [description]
     */
    /*refreshCache:function() {
        var layers = this.getLayerList();
        this.clearCache();
        if (!Z.Util.isArrayHasData(layers)) {
            return;
        }
        var cache = [];
        for (var i=0, len=layers.length;i<len;i++) {
            if (!layers[i].isVisible()) {
                continue;
            }
            var geos = layers[i].getAllGeometries();
            if (Z.Util.isArrayHasData(geos)) {
                cache = cache.concat(geos);   
            }
        }
        this._geoCache=cache;
    },*/

    /**
     * 不载入Geometry并绘制
     * @param  {boolean} isRealTime 是否是实时绘制
     * @return {[type]}        [description]
     */
    repaint:function(isRealTime) {
        //延迟执行,减少刷新次数
        var me = this;
        if (isRealTime) {
            me.doRepaint();
        } else {
            if (this.repaintTimeout) {
                clearTimeout(this.repaintTimeout);
            }
            this.repaintTimeout = setTimeout(function() {
                me.doRepaint();
            },10);
        }
        
        
    },

    doRepaint:function() {
        this.loadResource(function(){
            var me = this;
            var map = me.getMap();
            var mapSize = map.getSize();            
            me.canvasCtx.clearRect(0, 0, mapSize['width'], mapSize['height']);
            var mapExtent = map.getExtent();                    
            /*me.layerCanvas.width = mapSize.width;
            me.layerCanvas.height = mapSize.height;*/
            me._updateCanvasSize(me.layerCanvas);
            var containerOffset = map.offsetPlatform();
            me.layerCanvas.style.left=(-containerOffset['left'])+"px";
            me.layerCanvas.style.top=(-containerOffset['top'])+"px";
            //载入资源后再进行绘制
            me.repaintInExtent(mapExtent);
        });
    },

    /**
     * 重绘某一个区域的图形
     * @param  {[type]} extent [description]
     * @return {[type]}        [description]
     */
    repaintInExtent:function(extent) {
        var me = this;
        var map = me.getMap();
        var mapExtent = map.getExtent();
        if (extent && Z.Extent.isIntersect(extent, mapExtent)) {
            this.clearCanvas(extent);
            me.eachGeometry(function(geo) {
                if (!geo || !geo.isVisible()) {
                    return;
                }
                var ext = geo.computeVisualExtent(geo.getProjection());
                if (!ext || !Z.Extent.isIntersect(ext,extent)) {
                    return;
                }
                geo.getPainter().paint(me.canvasCtx,me.resourceLoader);                 
            });
        }
    },

    clearCanvas:function(extent) {
        var map = this.getMap(),
            projection = map.getProjection();
        var p1 = projection.project({x:extent['xmin'],y:extent['ymin']}),
            p2 = projection.project({x:extent['xmax'],y:extent['ymax']});
        var px1 = map.untransform(p1),
            px2 = map.untransform(p2);
        this.canvasCtx.clearRect(Math.min(px1['left'],px2['left']), Math.min(px1['top'],px2['top']), 
                                    Math.abs(px1['left']-px2['left']), Math.abs(px1['top']-px2['top']));
    },

    loadResource:function(onComplete) {
        var me = this;
        //20150530 loadResource不加载canvasLayer中的geometry icon资源，故每次绘制canvas都去重新检查并下载资源
        //if (!me.resourceLoaded) {
            var map = me.getMap();
            var mapExtent = map.getExtent();
            me.eachGeometry(function(geo) {
                if (!geo || !geo.isVisible()) {
                    return;
                }
                var ext = geo.getExtent();
                if (!ext || !Z.Extent.isIntersect(ext,mapExtent)) {
                    return;
                }
                var resource = geo.getExternalResource();
                if (resource) {
                    me.resourceLoader.addResource(resource);
                }                    
            });
            me.resourceLoader.load(function() {
                me.resourceLoaded = true;
                onComplete.call(me);
            });
        //} else {
            //onComplete.call(me);
        //}
        
    },

    /**
     * 遍历geometry
     * @param  {Function} fn 回调函数
     */
    eachGeometry:function(fn,obj) {
        var layers = this.getLayerList();
        if (!Z.Util.isArrayHasData(layers)) {
            return;
        }
        if (!obj) {
            obj=this;
        }
        for (var i=0, len=layers.length;i<len;i++) {
            if (!layers[i] || !layers[i].isVisible()) {
                continue;
            }
            var cache = layers[i].getGeoCache();
            if (!cache) {
                continue;
            }
            for (var p in cache) {
                if (cache.hasOwnProperty(p)) {
                    fn.call(obj,cache[p]);
                }
            }
        }
    },

    hide:function() {
        if (this.layerCanvas) {
            this.layerCanvas.style.display="none";
        }
    },

    show:function() {
        if (this.layerCanvas) {
            this.layerCanvas.style.display="";
        }
    },

    onMoving:function(param) {
        //nothing to do
    },

    onMoveEnd:function(param) {
        this.repaint();
    },

    onResize:function(param) {
        this.repaint();
    },

    onZoomStart:function(param) {
        this.hide();        
        var mapSize = this.getMap().getSize();            
        this.canvasCtx.clearRect(0, 0, mapSize['width'], mapSize['height']);
    },

    onZoomEnd:function(param) {
        this.repaint();
        this.show();
    },

    setZIndex:function() {
       //nothing to do
    }
});
Z['VisualizerLayer']=Z.VisualizerLayer=Z.Layer.extend({

});
Z['HeatmapLayer'] = Z.HeatmapLayer = Z.Layer.extend({

      statics:{
          CSS_TRANSFORM: (function() {
               var div = Z.DomUtil.createEl('div');
               var props = [
               'transform',
               'WebkitTransform',
               'MozTransform',
               'OTransform',
               'msTransform'
               ];

               for (var i = 0; i < props.length; i++) {
                 var prop = props[i];
                 if (div.style[prop] !== undefined) {
                   return prop;
                 }
               }
               return props[0];
             })()

      },

      initialize: function (config) {
        this.cfg = config;
        this._el = Z.DomUtil.createEl('div');
        this._data = [];
        this._max = 1;
        this.cfg.container = this._el;
      },

      onAdd: function (map) {
        var size = map.getSize();

        this._map = map;

        this._width = size.width;
        this._height = size.height;

        this._el.style.width = this._width  + 'px';
        this._el.style.height = this._height + 'px';
        this._el.style["z-index"] = 300;

        this._resetOrigin();

        map.getPanels().appendChild(this._el);

        if (!this._heatmap) {
          this._heatmap = h337.create(this.cfg);
        }

        // on zoom, reset origin
        map.on('zoomend', this._resetOrigin, this);
        // redraw whenever dragend
        map.on('dragend', this._draw, this);

        this._draw();
      },

      onRemove: function (map) {
        // remove layer's DOM elements and listeners
        map.getPanels().removeChild(this._el);

        map.off('zoomend', this._resetOrigin, this);
        map.off('dragend', this._draw, this);
      },

      _draw: function() {
        if (!this._map) { return; }
        /**
        * 将投影坐标转化为屏幕偏移坐标
        */
        var point = this._map.coordinateToScreenPoint(this._origin);

        // reposition the layer
        this._el.style[Z.HeatmapLayer.CSS_TRANSFORM] = 'translate(' +
          -Math.round(point.left) + 'px,' +
          -Math.round(point.top) + 'px)';

        this._update();
      },

      _update: function() {
        var bounds, zoom, scale;

        bounds = this._map.getExtent();
        zoom = this._map.getZoomLevel();
        scale = Math.pow(2, zoom);

        if (this._data.length == 0) {
          return;
        }

        var generatedData = { max: this._max };
        var latLngPoints = [];
        var radiusMultiplier = this.cfg.scaleRadius ? scale : 1;
        var localMax = 0;
        var valueField = this.cfg.valueField;
        var len = this._data.length;

        while (len--) {
          var entry = this._data[len];
          var value = entry[valueField];
          var coordinate = entry.coordinate;

          // we don't wanna render points that are not even on the map ;-)
          if (!Z.GeoUtils.isPointInRect(coordinate, bounds)) {
            continue;
          }
          // local max is the maximum within current bounds
          if (value > localMax) {
            localMax = value;
          }

          if(!Z.GeoUtils.isPointInRect(coordinate, bounds)) {
            continue;
          }

          var point = this._map.coordinateToScreenPoint(coordinate);
          var latlngPoint = { x: Math.round(point.left), y: Math.round(point.top) };
          latlngPoint[valueField] = value;

          var radius;

          if (entry.radius) {
            radius = entry.radius * radiusMultiplier;
          } else {
            radius = (this.cfg.radius || 2) * radiusMultiplier;
          }
          latlngPoint.radius = radius;
          latLngPoints.push(latlngPoint);
        }
        if (this.cfg.useLocalExtrema) {
          generatedData.max = localMax;
        }

        generatedData.data = latLngPoints;

        this._heatmap.setData(generatedData);
      },

      setData: function(data) {
        this._max = data.max || this._max;
        var yField = this.cfg.yField || 'y';
        var xField = this.cfg.xField || 'x';
        var valueField = this.cfg.valueField || 'value';

        // transform data to latlngs
        var data = data.data;
        var len = data.length;
        var d = [];

        while (len--) {
          var entry = data[len];
          var coordinate = new Z.Coordinate( entry[xField], entry[yField]);
          var dataObj = { coordinate: coordinate };
          dataObj[valueField] = entry[valueField];
          if (entry.radius) {
            dataObj.radius = entry.radius;
          }
          d.push(dataObj);
        }
        this._data = d;

        this._draw();
      },

      addData: function(pointOrArray) {
        if (pointOrArray.length > 0) {
          var len = pointOrArray.length;
          while(len--) {
            this.addData(pointOrArray[len]);
          }
        } else {
          var yField = this.cfg.yField || 'y';
          var xField = this.cfg.xField || 'x';
          var valueField = this.cfg.valueField || 'value';
          var entry = pointOrArray;
          var coordinate = new Z.Coordinate(entry[xField], entry[yField]);
          var dataObj = { coordinate: coordinate };

          dataObj[valueField] = entry[valueField];
          this._max = Math.max(this._max, dataObj[valueField]);

          if (entry.radius) {
            dataObj.radius = entry.radius;
          }
          this._data.push(dataObj);
          this._draw();
        }
      },

      _resetOrigin: function () {
        this._origin = this._map.screenPointToCoordinate(new Z.Point(0, 0));
        this._draw();
      }

});
Z.GeometryExt={};
Z.GeometryExt.Util={
	toGeoJsonCoordinates:function(coordinates) {
		if (!Z.Util.isArray(coordinates)) {
			return null;
		}
		var result = [];
		for (var i=0, len=coordinates.length;i<len;i++) {
			result.push([coordinates[i].x, coordinates[i].y]);
		}
		return result;
	}
};

Z.GeometryExt.Edit={
    /**
     *  开始编辑Geometry
     * @export
     */
    startEdit: function(opts) {
        this.endEdit();
        this.editor = new Z.Editor(this,opts);
        this.editor.start();
    },


    /**
     * 结束编辑
     * @export
     */
    endEdit: function() {
        if (this.editor) {
            this.editor.stop();
        }
    },      

    /**
     * Geometry是否处于编辑状态中
     * @return {Boolean} 是否处于编辑状态
     * @export
     */
    isEditing: function() {
        if (this.editor) {
            return this.editor.isEditing();
        }
        return false;
    },

    /**
     * 开始移动Geometry, 进入移动模式
     * @export   
     */
    startDrag: function() {
        this._map = this.getMap();
        this.hide();
        var type = this.getType();
        if(type === Z.Geometry.TYPE_POINT) {
            this._dragGeometry = new Z.Marker(this.getCenter());
            var targetIcon = this.getIcon();
            var iconType = (targetIcon?targetIcon['type']:null);
            if ("picture" === iconType) {

            } else if ("text" === iconType) {
                var targetTextStyle = targetIcon['textStyle'];
                var textStyle = {
                    'color': targetTextStyle['color'],
                    'padding': targetTextStyle['padding'],
                    'size': targetTextStyle['size'],
                    'font': targetTextStyle['font'],
                    'weight': targetTextStyle['weight'],
                    'background': targetTextStyle['background'],
                    'stroke': '#ff0000',
                    'strokewidth': targetTextStyle['strokewidth'],
                    'placement': targetTextStyle['placement']
                };
                var icon = {
                    type: 'text',
                    textStyle: textStyle,
                    content: targetIcon['content'],
                    offset: targetIcon['offset']
                };
                this._dragGeometry.setIcon(icon);
            } else if ("vector" === iconType){

            } else {

            }
        } else {//线与面图形
            var strokeSymbol = this.getStrokeSymbol();
            strokeSymbol['stroke'] = '#ff0000';
            this._dragGeometry.setStrokeSymbol(strokeSymbol);
        }
        var _dragLayer = this._getDragLayer();
        _dragLayer.addGeometry(this._dragGeometry);
        this._map.on('mousemove', this._dragging, this)
                 .on('mouseup', this._endDrag, this);
        this.fire('dragstart', {'target': this});
    },

    _dragging: function(event) {
		this.isDragging = true;
		this.endPosition = Z.DomUtil.getEventDomCoordinate(event, this._map.containerDOM);
		if(!this.startPosition) {
            this.startPosition = this.endPosition;
		}
		var dragOffset = {
		    'left' : this.endPosition['left'] - this.startPosition['left'],
		    'top'  : this.endPosition['top'] - this.startPosition['top']
		};
		var geometryPixel = this._map.coordinateToScreenPoint(this._dragGeometry.getCenter());
		var mapOffset = this._map.offsetPlatform();
		var newPosition = {
            'left': geometryPixel['left'] + dragOffset['left'] - mapOffset['left'],
            'top' : geometryPixel['top'] + dragOffset['top'] - mapOffset['top']
		};
		this.startPosition = newPosition;
		var pcenter = this._map.transformFromOffset(newPosition);
        this._dragGeometry.setPCenter(pcenter);
        this._dragGeometry.updateCache();
        this.setPCenter(pcenter);
        this.updateCache();
        this.fire('dragging', {'target': this});
    },

    /**
     * 结束移动Geometry, 退出移动模式  
     */
    _endDrag: function(event) {
		this._dragGeometry.remove();
		this._getDragLayer().clear();
		this.show();
		this.isDragging = false;
        this._map.off('mousemove', this._dragging, this)
                 .off('mouseup', this._endDrag, this);
		this.fire('dragend', {'target': this});
    },

    /**
     * Geometry是否处于移动模式中
     * @return
      {Boolean} 是否处于移动模式中
     * @export
     */
    isDragging: function() {
        if (this.isDragging) {
            return this.isDragging;
        }
        return false;
    },

    _getDragLayer: function() {
        var map = this.getMap();
        if(!map) return;
        var layerId = '__mt__internal_drag_layer';
        if(!map.getLayer(layerId)) {
            map.addLayer(new Z.SVGLayer(layerId));
        }
        return map.getLayer(layerId);
    }

};
Z.GeometryExt.InfoWindow={
    /**
     * 设置Geometry的信息提示框设置
     * @param {Object} tipOption 信息提示框设置
     * @export
     */
    setInfoWindow:function(tipOption) {
        this.map = this.getMap();
        this.infoWindow = new Z.InfoWindow(tipOption);
        this.infoWindow.addTo(this);
        var beforeopenFn = tipOption['beforeopen'];
        if(beforeopenFn) {
            this._beforeOpenInfoWindow();
        }
        return this;
    },

    /**
    * 信息窗口打开前
    */
    _beforeOpenInfoWindow: function() {
        var coordinate = this.getCenter();
        var position = this.getPostion();
        var param = {'coordinate':coordinate, 'pixel':position};
        this.infoWindow.tipOption['showPosition'] = position;
        this.infoWindow.beforeOpen(param);
        return this;
    },

    /**
     * 获取Geometry的信息提示框设置
     * @return {Object} 信息提示框设置
     * @export
     */
    getInfoWindow:function() {
        if (!this.infoWindow) {return null;}
        return this.infoWindow;
    },

    /**
     * 打开geometry的信息提示框
     * @param  {Coordinate} coordinate 提示框位置,可以为空
     * @export
     */
    openInfoWindow:function(coordinate) {
        this.infoWindow.show(coordinate);
    },

    /**
     * 关闭Geometry的信息提示框
     * @export
     */
    closeInfoWindow:function() {
        if (this.infoWindow) {
            this.infoWindow.hide();
        }
    }

};
Z.GeometryExt.Menu = {
    /**
    * 设置Geometry的菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @export
    */
    setMenu: function(menuOption) {
        this.map = this.getMap();
        this.menu = new Z.Menu(menuOption);
        this.menu.addTo(this);
        var beforeopenFn = menuOption['beforeopen'];
        if(beforeopenFn) {
            this._beforeOpenMenu();
        }
        return this;
    },

    /**
    * 菜单打开前
    */
    _beforeOpenMenu: function() {
        var coordinate = this.getCenter();
        var position = this.map.coordinateToScreenPoint(coordinate);
        var param = {'coordinate':coordinate, 'pixel':position};
        this.menu.showPosition = position;
        this.menu.beforeOpen(param);
        return this;
    },

    /**
    * 打开geometry菜单
    * @param {Coordinate} 坐标
    * @export
    */
    openMenu: function(coordinate) {
        if(!coordinate) {
            coordinate = this.showPostion;
        }
        this.menu.show(coordinate);
    },

    /**
    * 添加菜单项目
    * @param {Array} 菜单项数组
    * @export
    */
    setMenuItem: function(items) {
        this.menu.setItems(items);
        return this;
    },

    /**
    * 关闭geometry菜单
    * @export
    */
    closeMenu: function() {
        if(this.menu)
            this.menu.closeMenu();
    }
};

Z.GeometryExt.Events= {

    onEvent: function(event) {
        //还没加载到地图上时, 不处理事件
        if (!this.getMap()) {
            return;
        }
        //map抛过来的事件中有originEvent, 而dom直接抛的没有
        var originalEvent = event.originalEvent || event;
        var eventType = originalEvent.type;
        var eventFired = eventType;
        //事件改名
        if (eventFired === 'contextmenu') {
            eventFired = 'rightclick';
        } else if (eventFired === 'click') {
            var button = originalEvent.button;
            if (button === 2) {
                eventFired = 'rightclick';
            }
        }
        var params = this.getEventParams(originalEvent);
        this.fireEvent(eventFired, params);
    },  

    /**
     * 生成事件参数
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    getEventParams: function(event) {
        var map = this.getMap();
        var pixel = Z.DomUtil.getEventDomCoordinate(event, map.containterDom);
        var coordinate = map.transform(pixel);      
        //统一的参数, target是geometry引用, pixel是事件的屏幕坐标, coordinate是事件的经纬度坐标
        return {'target':this, 'pixel':pixel, 'coordinate':coordinate};
    },

    onMouseOver: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event.originalEvent || event;
        var params = this.getEventParams(originalEvent);
        this.fireEvent('mouseover', params);
    },

    onMouseOut: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event.originalEvent || event;
        var params = this.getEventParams(originalEvent);
        this.fireEvent('mouseout', params);
    }
};
Z.Painter={};
Z['Geometry']=Z.Geometry=Z.Class.extend({
    includes: [Z.Eventable,Z.GeometryExt.Util,Z.GeometryExt.Menu,Z.GeometryExt.InfoWindow,Z.GeometryExt.Edit,Z.GeometryExt.Events],

    //根据不同的语言定义不同的错误信息
    'exceptionDefs':{
        'en-US':{
            'DUPLICATE_LAYER':'Geometry cannot be added to two or more layers at the same time.',
            'INVALID_GEOMETRY_IN_COLLECTION':'Geometry is not valid for collection,index:'
        },
        'zh-CN':{
            'DUPLICATE_LAYER':'Geometry不能被重复添加到多个图层上.',
            'INVALID_GEOMETRY_IN_COLLECTION':'添加到集合中的Geometry是不合法的, index:'
        }
    },

    statics:{
        //--TYPES of geometry
        'TYPE_POINT' : 1,
        'TYPE_POLYLINE' : 2,
        'TYPE_POLYGON' : 3,
        'TYPE_MULTIPOINT' : 4,
        'TYPE_MULTIPOLYLINE' : 5,
        'TYPE_MULTIPOLYGON' : 6,
        'TYPE_GEOMETRYCOLLECTION' : 7,

        'TYPE_RECT' : 100,
        'TYPE_CIRCLE' : 101,
        'TYPE_ELLIPSE' : 102,
        'TYPE_SECTOR' : 103,
        // TYPE_PATH : 7,


        /**
         * 将json字符串或json对象转化为Geometry对象
         * @param  {String | Object | [Object]} json json对象
         * @return {Geometry | [Geometry]}      转化的Geometry对象或数组
         * @export
         */
        fromJson:function(json) {
            if (Z.Util.isString(json)) {
                json = Z.Util.parseJson(json);
            }
            if (Z.Util.isArray(json)) {
                var result = [];
                var jsons = json;
                for (var i=0,len=jsons.length;i<len;i++) {
                    var geo = this.fromJsonObject(jsons[i]);
                    result.push(geo);
                }
                return result;
            } else {
                return this.fromJsonObject(json);
            }
        },

        fromGeoJson:function(geoJson) {
            if (Z.Util.isString(geoJson)) {
                geoJson = Z.Util.parseJson(geoJson);
            }
            if (Z.Util.isArray(geoJson)) {
                var result = [];
                for (var i=0,len=geoJson.length;i<len;i++) {
                    //TODO 从geojson对象解析Geometry对象
                    result.push(geo);
                }
                return result;
            } else {
                //return this.fromJsonObject(geoJson);
            }

        },



        fromJsonObject:function(jsonObj) {
            if (!jsonObj || Z.Util.isNil(jsonObj['type'])) {
                return null;
            }
            switch (jsonObj['type']) {
                case this['TYPE_POINT']:
                    var center = jsonObj['center'];
                    delete jsonObj['center'];
                    return new Z.Marker(center,jsonObj);
                case this['TYPE_POLYGON']:
                    var rings = jsonObj['rings'];
                    delete jsonObj['rings'];
                    if (!Z.Util.isArrayHasData(rings)) {
                        return new Z.Polygon([],jsonObj);
                    }
                    var shell = rings.shift();
                    jsonObj['holes'] = rings;
                    return new Z.Polygon(shell,jsonObj);
                case this['TYPE_POLYLINE']:
                    var path = jsonObj['path'];
                    delete jsonObj['path'];
                    return new Z.Polyline(path,jsonObj);
                case this['TYPE_RECT']:
                    var nw = jsonObj['nw'],
                        width = jsonObj['width'],
                        height = jsonObj['height'];
                    delete jsonObj['nw'];
                    delete jsonObj['width'];
                    delete jsonObj['height'];
                    return new Z.Rectangle(nw,width,height,jsonObj);
                case this['TYPE_CIRCLE']:
                    var center = jsonObj['center'],
                        radius = jsonObj['radius'];
                    delete jsonObj['center'];
                    delete jsonObj['radius'];
                    return new Z.Circle(center,radius,jsonObj);
                case this['TYPE_ELLIPSE']:
                    var center = jsonObj['center'],
                        width = jsonObj['width'],
                        height = jsonObj['height'];
                    delete jsonObj['center'];
                    delete jsonObj['width'];
                    delete jsonObj['height'];
                    return new Z.Ellipse(center,width,height,jsonObj);
                case this['TYPE_SECTOR']:
                    var center = jsonObj['center'],
                        radius = jsonObj['radius'],
                        startAngle = jsonObj['startAngle'],
                        endAngle = jsonObj['endAngle'];
                    delete jsonObj['center'];
                    delete jsonObj['radius'];
                    delete jsonObj['startAngle'];
                    delete jsonObj['endAngle'];
                    return new Z.Sector(center,radius,startAngle,endAngle,jsonObj);
                case this['TYPE_MULTIPOINT']:
                    var multiPoints = jsonObj['multiPoints'];
                    delete jsonObj['multiPoints'];
                    return new Z.MultiPoint(multiPoints,jsonObj);
                case this['TYPE_MULTIPOLYGON']:
                    var multiRings = jsonObj['multiRings'];
                    delete jsonObj['multiRings'];
                    return new Z.MultiPolygon(multiRings, jsonObj);
                case this['TYPE_MULTIPOLYLINE']:
                    var multiPaths = jsonObj['multiPaths'];
                    delete jsonObj['multiPaths'];
                    return new Z.MultiPolyline(multiPaths,jsonObj);
                case this['TYPE_GEOMETRYCOLLECTION']:
                    var geometries = jsonObj['geometries'];
                    delete jsonObj['geometries'];
                    return new Z.GeometryCollection(geometries,jsonObj);
            }
            return null;
        },

        fromGeoJsonObject:function(geoJsonObj) {
            if (!geoJsonObj || Z.Util.isNil(geoJsonObj['type'])) {
                return null;
            }
            switch (geoJsonObj['type']) {
                case this['TYPE_POINT']:
                    return new Z.Marker(new Z.Coordinate(geoJsonObj['coordinates']),geoJsonObj);
                case this['TYPE_POLYGON']:
                    return new Z.Polygon(geoJsonObj['rings'],geoJsonObj);
                case this['TYPE_POLYLINE']:
                    return new Z.Polyline(geoJsonObj['path'],geoJsonObj);
                case this['TYPE_RECT']:
                    return new Z.Rectangle(geoJsonObj['nw'],geoJsonObj['width'],geoJsonObj['height'],geoJsonObj);
                case this['TYPE_CIRCLE']:
                    return new Z.Circle(geoJsonObj['center'],geoJsonObj['radius'],geoJsonObj);
                case this['TYPE_ELLIPSE']:
                    return new Z.Ellipse(geoJsonObj['center'],geoJsonObj['width'],geoJsonObj['height'],geoJsonObj);
                case this['TYPE_SECTOR']:
                    return new Z.Sector(geoJsonObj['center'],geoJsonObj['radius'],geoJsonObj['startAngle'],geoJsonObj['endAngle'],geoJsonObj);
                case this['TYPE_MULTIPOINT']:
                    return new Z.MultiPoint(geoJsonObj['multiPoints'],geoJsonObj);
                case this['TYPE_MULTIPOLYGON']:
                    return new Z.MultiPolygon(geoJsonObj['multiRings'], geoJsonObj);
                case this['TYPE_MULTIPOLYLINE']:
                    return new Z.MultiPolyline(geoJsonObj['multiPaths'],geoJsonObj);
                case this['TYPE_GEOMETRYCOLLECTION']:
                    return new Z.GeometryCollection(geoJsonObj['geometries'],geoJsonObj);
            }
            return null;
        }

    },

    //默认标注样式
    defaultIcon:{
        /*"type":"picture",*/
        "marker-file" : Z.host + "/engine/images/marker.png",
        "marker-height" : 30,
        "marker-width" : 22,
        "marker-offset" : {
            "x" : 0,
            "y" : 0
        }
    },

    // 默认线样式
    defaultSymbol:{
        "line-color" : "#474cf8",
        "line-width" : 3,
        "line-opacity" : 1
    },

    initialize:function() {
        //this.identifier = Z.Util.GUID();

    },

    /**
     * 初始化传入的option参数
     * @param  {Object} opts [option参数]
     */
    initOptions:function(opts) {
        if (!opts) {
            return;
        }
        this.opts = opts;
        if (opts['symbol']) {
            this.setSymbol(opts['symbol']);
        }
        if (!Z.Util.isNil(opts['id'])) {
            this.setId(opts['id']);
        }
        if (opts['infoWindow']) {
            this.setInfoWindow(opts['infoWindow']);
        }
        if (opts['label']) {
            this.setLabel(opts['label']);
        }
        if (opts['properties']) {
            this.setProperties(opts['properties']);
        }
        if (opts['crs']) {
            //设置CRS
            //不需设置crs
        }
    },

    /**
     * 调用prepare时,layer已经注册到map上
     */
    prepare:function(layer) {
        this.rootPrepare(layer);
    },

    rootPrepare:function(layer) {
        //Geometry不允许被重复添加到多个图层上
        if (this.getLayer()) {
            throw new Error(this.exception['DUPLICATE_LAYER']);
        }
        //更新缓存
        this.updateCache();
        this.layer = layer;
        //如果投影发生改变,则清除掉所有的投影坐标属性
        this.clearProjection();
        this.painter = this.assignPainter();
    },

    /**
     * returns Geometry's ID
     * @return {Object} Geometry's id
     * @export
     */
    getId:function() {
        return this.identifier;
    },

    /**
     * set ID
     * @param {Object} id set Geometry's id
     * @export
     */
    setId:function(id) {
        var oldId = this.getId();
        this.identifier=id;
        this.fireEvent('_idchanged',{'target':this,'oldId':oldId,'newId':id});
        return this;
    },

    /**
     * 获取Geometry的Layer
     * @return {Layer} Geometry所属的Layer
     * @export
     */
    getLayer:function() {
        if (!this.layer) {return null;}
        return this.layer;
    },

    /**
     * 获取Geometry所属的地图对象
     * @return {Map} 地图对象
     * @export
     */
    getMap:function() {
        if (!this.layer) {return null;}
        return this.layer.getMap();
    },

    /**
     * 获取Geometry的类型
     * @return {int} Geometry的类型
     * @export
     */
    getType:function() {
        return this.type;
    },

    /**
     * 是否是矢量图形
     * @return {Boolean} true|false
     * @export
     */
    isVector:function() {
        return (Z.Geometry.TYPE_POINT !== this.type);
    },

    /**
     * 获取Geometry的Symbol
     * @return {Symbol} Geometry的Symbol
     * @export
     */
    getSymbol:function() {
        if (!this.symbol) {
            return null;
        }
        return this.symbol;
    },

    /**
     * 设置Geometry的symbol
     * @param {Symbol} symbol 新的Symbol
     * @export
     */
    setSymbol:function(symbol) {
        if (!symbol) {
            this.symbol = null;
        } else {
            //属性的变量名转化为驼峰风格
            var camelSymbol = Z.Util.convertFieldNameStyle(symbol,'camel');
            this.symbol = camelSymbol;
        }
        this.onSymbolChanged();
        return this;
    },

    /**
     * 计算Geometry的外接矩形范围
     * @return {Extent} [Geometry的外接矩形范围]
     * @export
     */
    getExtent:function() {
        if (this.extent) {
            return this.extent;
        }
        return this.computeExtent(this.getProjection());
    },

    getPrjExtent:function() {
        var ext = this.getExtent();
        var p = this.getProjection();
        if (ext) {
            return new Z.Extent(p.project({x:ext['xmin'],y:ext['ymin']}), p.project({x:ext['xmax'],y:ext['ymax']}));
        } else {
            return null;
        }
    },

    /**
     * 计算图形的中心点坐标
     * @return {Coordinate} [中心点坐标]
     * @export
     */
    getCenter:function() {
        return this.computeCenter(this.getProjection());
    },

    getDefaultSymbol:function() {
        return this.defaultSymbol;
    },

    /**
     * 获取Geometry的Properties
     * @return {Object} 自定义属性
     * @export
     */
    getProperties:function() {
        if (!this.properties) {return null;}
        return this.properties;
    },

    /**
     * 设置Geometry的Properties
     * @param {Object} properties 自定义属性
     * @export
     */
    setProperties:function(properties) {
        this.properties = properties;
        return this;
    },

    /**
     * 显示Geometry
     * @export
     */
    show:function() {
        this.visible = true;
        if (this.painter) {
            this.painter.show();
        }
        return this;
    },

    /**
     * 隐藏Geometry
     * @export
     */
    hide:function() {
        this.visible = false;
        if (this.painter) {
            this.painter.hide();
        }
        return this;
    },

    /**
     * 是否可见
     * @return {Boolean} true|false
     * @export
     */
    isVisible:function() {
        if (Z.Util.isNil(this.visible)) {
            return true;
        }
        return this.visible;
    },

    /**
     * 克隆一个不在任何图层上的属性相同的Geometry,但不包含事件注册
     * @return {Geometry} 克隆的Geometry
     * @export
     */
    copy:function() {
        var json = this.toJson();
        var ret = Z.Geometry.fromJson(json);
        return ret;
    },

    /**
     * 将自身从图层中移除
     * @return {[type]} [description]
     * @export
     */
    remove:function() {
        var layer = this.getLayer();
        if (!layer) {
            return;
        }
        //label
        //contextmenu
        this.closeMenu();
        //infowindow
        this.closeInfoWindow();

        var painter = this.getPainter();
        if (painter) {
            painter.remove();
        }
        delete this.painter;

        layer.onGeometryRemove(this);
        delete this.layer;

        this.fireEvent('remove',{'target':this});

    },

    getInternalId:function() {
        return this.internalId;
    },

    /**
     * 只能被图层调用
     * @param {String} id [内部id]
     */
    setInternalId:function(id) {
        this.internalId = id;
    },


    getProjection:function() {
        var map = this.getMap();
        if (map) {
            return map.getProjection();
        }
        return Z.Projection.getDefault();
        // return null;
    },

    /**
     * 获取geometry样式中依赖的外部图片资源
     * @param  {[type]} geometry [description]
     * @return {[type]}          [description]
     */
    getExternalResource:function() {
        var geometry = this;
        var symbol = geometry.getSymbol();
        if (!symbol) {
            return null;
        }
        var icon = symbol['icon'];
        if (icon) {
            if (icon['type'] === 'picture') {
                return icon['url'];
            }
        }
        var fillSymbol = symbol['fillSymbol'];
        if (fillSymbol) {
            var fill = fillSymbol['fill'];
            if (fill && fill.length>7 && "url" ===fill.substring(0,3)) {
                return fill.substring(5,fill.length-2);
            }
        }
        return null;
    },

    getPainter:function() {
        return this.painter;
    },

    removePainter:function() {
        delete this.painter;
    },

    onZoomEnd:function() {
        if (this.painter) {
            this.painter.refresh();
        }
    },

    onShapeChanged:function() {
        var painter = this.getPainter();
        if (painter) {
            painter.refresh();
        }
        this.extent = null;
        if (!this.isEditing || !this.isEditing()) {
            this.fireEvent('shapechanged',{'target':this});
        }
    },

    onPositionChanged:function() {
        var painter = this.getPainter();
        if (painter) {
            painter.refresh();
        }
        this.extent = null;
        if (!this.isEditing || !this.isEditing()) {
            this.fireEvent('positionchanged',{'target':this});
        }
    },

    onSymbolChanged:function() {
        var painter = this.getPainter();
        if (painter) {
            painter.refreshSymbol();
        }
        this.fireEvent('symbolchanged',{'target':this});
    },

    fireEvent:function(eventName, param) {
        if (!param) {
            param = {};
        }
        param['target'] = this;
        this.fire(eventName,param);
    },

    //----------JSON相关方法-----------------
    /**
     * 生成JSON对象
     * @param  {Object} opts 输出配置
     * @return {Object}      JSON对象
     * @export
     */
    toJson:function(opts) {
        if (!opts) {
            opts = {};
        }
        var jsonObject = {};
        if (opts['geometry'] === undefined || opts['geometry']) {
            jsonObject = this.exportJson(opts);
        }
        if (!jsonObject) {
            jsonObject = {};
        }
        //opts没有设定symbol或者设定的symbol值为true,则导出symbol
        if (opts['symbol'] === undefined || opts['symbol']) {
            var symbol = this.getSymbol();
            if (symbol) {
                jsonObject['symbol']=symbol;
            }
        }
        //opts没有设定properties或者设定的properties值为true,则导出properties
        if (opts['properties'] === undefined || opts['properties']) {
            var properties = this.getProperties();
            if (properties) {
                jsonObject['properties'] = properties;
            }
        }
        //TODO 临时代码待服务端relate接口不再需要空间坐标系后移除
        //jsonObject['spatialReference'] = {"coordinateType":"gcj02"};
        return jsonObject;
    },

    /**
     * 按照GeoJson规范生成GeoJson对象
     * @param  {[type]} opts 输出配置
     * @return {Object}      GeoJson对象
     */
    toGeoJson:function(opts) {
        if (!opts) {
            opts = {};
        }
        var feature = {
            'type':'Feature',
            'geometry':null
        };
        if (opts['geometry'] === undefined || opts['geometry']) {
            var geoJson = this.exportGeoJson(opts);
            feature['geometry']=geoJson;
        }
        var properties = {};
        //opts没有设定symbol或者设定的symbol值为true,则导出symbol
        if (opts['symbol'] === undefined || opts['symbol']) {
            var symbol = this.getSymbol();
            if (symbol) {
                properties['symbol']=symbol;
            }
        }
        //opts没有设定properties或者设定的properties值为true,则导出properties
        if (opts['properties'] === undefined || opts['properties']) {
            var geoProperties = this.getProperties();
            if (geoProperties) {
                for (var p in geoProperties) {
                    if (geoProperties.hasOwnProperty(p)) {
                        properties[p] = geoProperties[p];
                    }
                }
            }
        }
        feature['properties'] = properties;
        return feature;
    }

});
Z['Extent']=Z.Extent=Z.Geometry.extend({
    statics:{
        equals:function(ext1,ext2) {
            if (!ext1 || !ext2 || !(ext1 instanceof Z.Extent) || !(ext2 instanceof Z.Extent)) {
                return false;
            }
            return (ext1['xmin'] == ext2['xmin'] && ext1['xmax'] == ext2['xmax'] && ext1['ymin'] == ext2['ymin'] && ext1['ymax'] == ext2['ymax']);
        },
         /**
         * 合并两个extent
         */
        combine:function(ext1,ext2) {
            if (!ext1 || !ext2) {
                if (ext1) {
                    return ext1;
                } else if (ext2) {
                    return ext2;
                }
                return null;
            }
            if (!(ext1 instanceof Z.Extent) || !(ext2 instanceof Z.Extent)) {
                return false;
            }
            var xmin = ext1['xmin'];
            if (!Z.Util.isNumber(xmin)) {
                xmin = ext2['xmin'];
            } else if (Z.Util.isNumber(ext2['xmin'])) {
                if (xmin>ext2['xmin']) {
                    xmin = ext2['xmin'];
                }
            }

            var xmax = ext1['xmax'];
            if (!Z.Util.isNumber(xmax)) {
                xmax = ext2['xmax'];
            } else if (Z.Util.isNumber(ext2['xmax'])) {
                if (xmax<ext2['xmax']) {
                    xmax = ext2['xmax'];
                }
            }

            var ymin = ext1['ymin'];
            if (!Z.Util.isNumber(ymin)) {
                ymin = ext2['ymin'];
            } else if (Z.Util.isNumber(ext2['ymin'])) {
                if (ymin>ext2['ymin']) {
                    ymin = ext2['ymin'];
                }
            }

            var ymax = ext1['ymax'];
            if (!Z.Util.isNumber(ymax)) {
                ymax = ext2['ymax'];
            } else if (Z.Util.isNumber(ext2['ymax'])) {
                if (ymax<ext2['ymax']) {
                    ymax = ext2['ymax'];
                }
            }

            return new Z.Extent(xmin,ymin,xmax,ymax);
        },

        /**
         * 两个Extent是否相交
         * @param  {[type]}  ext1 [description]
         * @param  {[type]}  ext2 [description]
         * @return {Boolean}      [description]
         */
        isIntersect:function(ext1, ext2) {
            if (!ext1 || !ext2) {return false;}
            if (!(ext1 instanceof Z.Extent) || !(ext2 instanceof Z.Extent)) {
                return false;
            }
            if (!ext1.isValid() || !ext2.isValid()) {
                return false;
            }
            var rxmin = Math.max(ext1['xmin'], ext2['xmin']);
            var rymin = Math.max(ext1['ymin'], ext2['ymin']);
            var rxmax = Math.min(ext1['xmax'], ext2['xmax']);
            var rymax = Math.min(ext1['ymax'], ext2['ymax']);
            var intersects = !((rxmin > rxmax) || (rymin > rymax));
            return intersects;
        },
        /**
        * 判断点是否在矩形中
        *
        *
        */
        contains: function(extent, coordinate) {

        },
        /**
         * 扩大Extent
         * @param  {[type]} ext      [description]
         * @param  {[type]} distance [description]
         * @return {[type]}          [description]
         */
        expand:function(ext, distance) {
            if (!ext) {
                return null;
            }
            if (!(ext instanceof Z.Extent)) {
                return null;
            }
            return new Z.Extent(ext['xmin']-distance, ext['ymin']-distance,ext['xmax']+distance,ext['ymax']+distance);
        }
    },

    initialize:function(p1,p2,p3,p4) {
        this['xmin'] = null;
        this['xmax'] = null;
        this['ymin'] = null;
        this['ymax'] = null;
        //构造方法一: 参数都是数字
        if (Z.Util.isNumber(p1)
        && Z.Util.isNumber(p2)
        && Z.Util.isNumber(p3)
        && Z.Util.isNumber(p4)) {
            this['xmin'] = p1;
            this['ymin'] = p2;
            this['xmax'] = p3;
            this['ymax'] = p4;
            return;
        } else {
            //构造方法二: 参数是两个坐标
            if (p1 && p2 && !Z.Util.isNil(p1.x)
            && !Z.Util.isNil(p2.x)
            && !Z.Util.isNil(p1.y)
            && !Z.Util.isNil(p2.y)) {
                if (p1.x>p2.x) {
                    this['xmin'] = p2.x;
                    this['xmax'] = p1.x;
                } else {
                    this['xmin'] = p1.x;
                    this['xmax'] = p2.x;
                }
                if (p1.y>p2.y) {
                    this['ymin'] = p2.y;
                    this['ymax'] = p1.y;
                } else {
                    this['ymin'] = p1.y;
                    this['ymax'] = p2.y;
                }
            }
        }
        
    },

    toJson:function() {
        return {
            'xmin':this['xmin'],
            'ymin':this['ymin'],
            'xmax':this['xmax'],
            'ymax':this['ymax']
        };
    },

    isValid:function() {
        return Z.Util.isNumber(this['xmin'])
        && Z.Util.isNumber(this['ymin'])
        && Z.Util.isNumber(this['xmax'])
        && Z.Util.isNumber(this['ymax']);
    }
});
Z.Vector = Z.Geometry.extend({
    computeVisualExtent:function(projection) {
    	/*var strokeSymbol = this.getStrokeSymbol();*/
    	var width = 0;
    	/*if (!strokeSymbol) {
    		strokeSymbol = this.getDefaultStrokeSymbol();
    	}
    	if (strokeSymbol) {
    		width = strokeSymbol['strokeWidth'];
    		if (!width) {
    			width = strokeSymbol['stroke-width'];
    		}
    	}
    	if (!width) {
    		width = 1;
    	}    	*/
        var extent = this.getPrjExtent();
        var map = this.getMap();
        var res = map.getLodConfig().getResolution(map.getZoomLevel());
        var expanded =  Z.Extent.expand(extent,res*width);
        if (!expanded) {
            return null;
        }
        return new Z.Extent(projection.unproject({x:expanded['xmin'],y:expanded['ymin']}),projection.unproject({x:expanded['xmax'],y:expanded['ymax']}));
    }
});
Z.Geometry.Center={
    /**
     * 计算Geometry中心点在地图容器中的相对坐标
     * @return {[type]} [description]
     */
    getCenterDomOffset:function() {
        var pcenter = this.getPCenter();
        if (!pcenter) {return null;}
        var map=this.getMap();
        if (!map) {
            return null;
        }
        return map.untransformToOffset(pcenter);
    },

    /**
     * 获取Marker的center
     * @return {Coordinate} Marker的center
     * @export
     */
    getCenter:function() {
        return this.center;
    },

    /**
     * 设置新的center
     * @param {Coordinate} center 新的center
     * @export
     */
    setCenter:function(center){
        this.center = center;
        if (!this.center || !this.getMap()) {return;}        
        var projection = this.getProjection();
        this.setPCenter(projection.project(this.center));
        return this;
    },

    getPCenter:function() {
        var projection = this.getProjection();
        if (!projection) {return null;}
        if (!this.pcenter) {            
            if (this.center) {
                this.pcenter = projection.project(this.center);
            }
        }
        return this.pcenter;
    },

    /**
     * 设置投影坐标
     * @param {Coordinate} pcenter 投影坐标
     */
    setPCenter:function(pcenter) {
        this.pcenter=pcenter;
        this.onPositionChanged();
    },
    
    /**
     * 修改投影坐标后调用该方法更新经纬度坐标缓存.
     * @return {[type]} [description]
     */
    updateCache:function() {
        var projection = this.getProjection();
        if (this.pcenter && projection) {
            this.center = projection.unproject(this.pcenter);
        }
    },

    clearProjection:function() {
        this.pcenter = null;
    },

    computeCenter:function(projection) {
        return this.center;
    }
};
Z.Geometry.Poly={
    /**
     * 将points中的坐标转化为用于显示的容器坐标
     * @param  {[type]} points [description]
     * @return {[type]}        [description]
     */
    untransformToOffset:function(points) {
        var map = this.getMap();
        if (!map || !Z.Util.isArrayHasData(points)) {
            return null;
        }
        var result = [];
        var is2D = false;
        for (var i=0,len=points.length;i<len;i++) {
            var p = points[i];
            if (Z.Util.isNil(p)) {
                continue;
            }
            if (Z.Util.isArray(p)) {
                is2D = true;
                //二维数组
                var p_r = [];
                for (var j=0,jlen=p.length;j<jlen;j++) {
                    if (Z.Util.isNil(p[j])) {
                        continue;
                    }
                    p_r.push(map.untransformToOffset(p[j]));
                }
                var simplifiedPoints = Z.Simplify.simplify(p_r, 2, false);
                result.push(simplifiedPoints);
            } else {                
                var pp = map.untransformToOffset(p);
                result.push(pp);   
            }
        }
        if (!is2D) {
            var simpliedResult = Z.Simplify.simplify(result, 2, false);
            return simpliedResult;
        }
        return result;
    },

    setPrjPoints:function(prjPoints) {        
        this.prjPoints = prjPoints;    
        this.onShapeChanged();    
    },

    getPrjPoints:function() {
        if (!this.prjPoints) {
            var points = this.getPoints();
            this.prjPoints = this.projectPoints(points);
        }
        return this.prjPoints;
    },

    /**
     * 直接修改Geometry的投影坐标后调用该方法, 更新经纬度坐标缓存
     */
    updateCache:function() {
        var projection = this.getProjection();
        if (!projection) {
            return;
        }
        this.points = this.unprojectPoints(this.getPrjPoints());
        if (this.holes) {
            this.holes = this.unprojectPoints(this.getPrjHoles());
        }
    },

    clearProjection:function() {
        this.prjPoints = null;
        if (this.prjHoles) {
            this.prjHoles = null;
        }
    },

    projectPoints:function(points) {
        var projection = this.getProjection();
        if (projection) {
            return projection.projectPoints(points);
        }
        return null;
    },

    unprojectPoints:function(prjPoints) {
        var projection = this.getProjection();
        if (projection) {
            return projection.unprojectPoints(prjPoints);
        }
        return null;
    },

    computeCenter:function(projection) {
        var ring=this.getPoints();
        if (!Z.Util.isArrayHasData(ring)) {
            return null;            
        }
        var sumx=0,sumy=0;
        var counter = 0;
        for (var i=0,len=ring.length;i<len;i++) {
            if (ring[i]) {
                if (Z.Util.isNumber(ring[i].x) && Z.Util.isNumber(ring[i].y)) {                    
                        sumx += ring[i].x;
                        sumy += ring[i].y;
                        counter++;
                }
            }
        }
        return {'x':sumx/counter, 'y':sumy/counter};
    },

    computeExtent:function(projection) {    
        var ring = this.getPoints();    
        if (!Z.Util.isArrayHasData(ring)) {
            return null;            
        }        
        var rings = ring;
        if (this.hasHoles && this.hasHoles()) {
            rings = rings.concat(this.getHoles());
        }        
        return this.computePointsExtent(rings,projection);
    },
    
    /**
     * 计算坐标数组的extent, 数组内的元素可以坐标或者坐标数组,坐标为经纬度坐标,而不是投影坐标
     * @param  {[type]} points     [description]
     * @param  {[type]} projection [description]
     * @return {[type]}            [description]
     */
    computePointsExtent:function(points, projection) {
        var result=null;
        var ext;
        for ( var i = 0, len = points.length; i < len; i++) {
            if (Z.Util.isArray(points[i])) {
                for ( var j = 0, jlen = points[i].length; j < jlen; j++) {       
                    ext = new Z.Extent(points[i][j]);             
                    result = Z.Extent.combine(result, ext);
                }
            } else {
                ext = new Z.Extent(points[i],points[i]);
                result = Z.Extent.combine(result, ext);
            }
        }
        return result;
    }
};
Z['Marker']=Z.Marker=Z.Geometry.extend({
    includes:[Z.Geometry.Center],

    initialize:function(center,opts) {
        this.type=Z.Geometry['TYPE_POINT'];
        this.center = center;
        this.initOptions(opts);
    },

    /**
     * 判断Marker是否是矢量标注
     * @return {Boolean} True|False
     * @export
     */
    isVectorIcon:function() {
        var icon = this.getIcon();  
        if (icon) {
            return 'vector' === icon['type'];
        }
        return false;
    },

    getDefaultSymbol:function() {
        return {
            "icon":this.defaultIcon
        };
    },
    /**
     * 设置Marker的Icon
     * @param {Icon} icon 新的Icon
     * @export
     */
    setIcon:function(icon) {
        if (!this.symbol) {
            this.symbol = {};
        }
        this.symbol['icon'] = icon;
        this.onSymbolChanged();
        return this;
    },

    /**
     * 获取Marker的Icon
     * @return {Icon} Marker的Icon
     * @export
     */
    getIcon:function() {
        if (!this.symbol || !this.symbol['icon']) {
            return null;
        }
        return this.symbol['icon'];
    },

    computeExtent:function(projection) {
        var center = this.getCenter();
        if (!center) {return null;}
        return new Z.Extent({'x':center.x,'y':center.y},{'x':center.x,'y':center.y});
        // return {'xmin':center.x, 'ymin':center.y, 'xmax':center.x, 'ymax':center.y};
    },

    computeVisualExtent:function(projection) {
        var geo = this;
        var map = geo.getMap();
        if (!map) {
            return null;
        }
        if(!projection) {
            projection = map.getProjection();
        }
        var icon=geo.getIcon();
        if (!icon) {
            icon = geo.defaultIcon;
        }
        var center=geo.getCenter();
        var offset = icon["offset"];
        if (!offset) {
            offset = {
                'x':0,
                'y':0
            };
        }       
        if (!center) {return null;}
        var pnw,pse;
        var width, height;
        var iconType = icon['type'];
        if (iconType === "picture") {
            height = (icon["height"]?parseInt(icon["height"],10):0);
            width = (icon["width"]?parseInt(icon["width"],10):0);
            pnw = {"top":(height+offset["y"]),"left":(width/2-offset["x"])};
            pse = {"top":(-offset["y"]),"left":(width/2+offset["x"])};
        } else if (iconType === "vector") {
            var radius = icon["size"];
            if (!radius) {return null;}
            pnw = {"top":radius+offset["y"],"left":radius-offset["x"]};
            pse = {"top":radius-offset["y"],"left":radius+offset["x"]};
        } else if (iconType === "text") {
            var painter = this.getPainter();
            var textSize = painter.measureTextMarker();
            if (!textSize) {
                pnw={"top":0,"left":0};
                pse={"top":0,"left":0}; 
            } else {
                var padding = 0;
                try {
                    padding = icon["textStyle"]["padding"];
                }catch (error) {}
                if (!padding) {padding = 0;}
                pnw = {"top":(textSize["offset"].y),"left":(-textSize["offset"].x)};
                pse = {"top":(textSize["height"]-textSize["offset"].y+2*padding),"left":(textSize["width"]+textSize["offset"].x+2*padding)};
            }
            
        } else {
            icon = geo.defaultIcon;
            height = geo.defaultIcon['height'];
            width = geo.defaultIcon['width'];
            pnw = {"top":(height+offset["y"]),"left":(width/2-offset["x"])};
            pse = {"top":(-offset["y"]),"left":(width/2+offset["x"])};
        }
        var pcenter = projection.project(center);
        return map.computeExtentByPixelSize(pcenter,pnw,pse);
    },

    computeVisualSide: function(map) {
        var projection = map.getProjection();
        var extent = this.computeVisualExtent(projection);
        var xmin = extent['xmin'];
        var xmax = extent['xmax'];
        var ymin = extent['ymin'];
        var ymax = extent['ymax'];
        var topLeftPoint = new Z.Coordinate(xmin, ymax);
        var topRightPoint = new Z.Coordinate(xmax, ymax);
        var bottomLeftPoint = new Z.Coordinate(xmin, ymin);
        var width = map.computeDistance(topLeftPoint, topRightPoint);
        var height = map.computeDistance(topLeftPoint, bottomLeftPoint);
        var result = map.distanceToPixel(width, height);
        return {'width': result['px'], 'height': result['py']};
    },

    computeGeodesicLength:function(projection) {
        return 0;
    },

    computeGeodesicArea:function(projection) {
        return 0;
    },

    assignPainter:function() {
        if (!this.layer) {return;}
        if (this.layer instanceof Z.SVGLayer) {
            return new Z.Marker.SVG(this);
        } else if (this.layer instanceof Z.CanvasLayer) {
            return new Z.Marker.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type': Z.Geometry['TYPE_POINT'],
            'center':this.getCenter()
        };
    },

    exportGeoJson:function(opts) {
        var center = this.getCenter();
        return {
            'type':'Point',
            'coordinates':[center.x, center.y]
        };
    }

});
Z['Polygon']=Z.Polygon = Z.Vector.extend({
    includes:[Z.Geometry.Poly],


    /**
     * [多边形构造函数]
     * @param  {一维数组 | 二维数组} ring [description]
     * @param  {[type]} opts [description]
     * @return {[type]}      [description]
     */
    initialize:function(ring, opts) {
        this.type=Z.Geometry['TYPE_POLYGON'];
        this.setRing(ring);
        this.initOptions(opts);
        if (opts) {
            if (opts['holes']) {
                this.setHoles(opts['holes']);
            }
        }
    },    

    getPoints:function() {
        return this.points;
    },

    /**
     * 设置多边形的坐标值
     * @param {Array} ring 坐标数组
     * @export
     */
    setRing:function(ring) {
        this.points = ring;
        this.checkRing();
        if (!this.getMap()) {
            return this;
        }
        this.setPrjPoints(this.projectPoints(this.points));        
        return this;
    },

    checkRing:function() {
        if (!Z.Util.isArray(this.points) || this.points.length < 3) {
            return;
        }
        var lastPoint = this.points[this.points.length-1];
        if (!lastPoint) {
            lastPoint = this.points[this.points.length-2];
        }
        if (this.points[0].x != lastPoint.x || this.points[0].y != lastPoint.y ) {
            this.points.push({x:this.points[0].x,y:this.points[0].y});
        }
    },

    /**
     * 获取多边形坐标值
     * @return {Array} 多边形坐标数组
     * @export
     */
    getRing:function() {
       return this.getPoints();
    },
    
    /**
     * 设置多边形内部的空洞
     * @param {Array} holes 空洞的坐标二维数组
     */
    setHoles:function(holes) {
        this.holes = holes;
        if (!this.getMap()) {
            return this;
        }
        this.setPrjHoles(this.projectPoints(this.holes));
        return this;
    },

    /**
     * 获取Polygon的空洞的坐标
     * @return {Array} 空洞的坐标二维数组
     * @export
     */
    getHoles:function() {
        if (this.hasHoles()) {
            return this.holes;
        }
        return null;
    },

    /**
     * Polygon是否有空洞
     * @return {Boolean} 是否有空洞
     * @export
     */
    hasHoles:function() {
        if (Z.Util.isArrayHasData(this.holes)) {
            if (Z.Util.isArrayHasData(this.holes[0])) {
                return true;
            }
        }
        return false;
    },

    setPrjHoles:function(prjHoles) {
        this.prjHoles = prjHoles;
        this.onShapeChanged();
    },

    getPrjHoles:function() {
        if (!this.prjHoles) {
            this.prjHoles = this.projectPoints(this.holes);
        }
        return this.prjHoles;
    },

    computeGeodesicLength:function(projection) {
        return 0;
    },

    computeGeodesicArea:function(projection) {
        return 0;
    },

    assignPainter:function() {
        if (!this.layer) {return;}
        if (this.layer instanceof Z.SVGLayer) {
            return new Z.Polygon.SVG(this);
        } else if (this.layer instanceof Z.CanvasLayer) {
            return new Z.Polygon.Canvas(this);
        }
    },

    exportJson:function(opts) {
        var shell = this.getPoints();
        var holes = this.getHoles();
        var rings = [shell];
        if (holes) {
            rings = rings.concat(holes);
        }
        return {
            'type':Z.Geometry['TYPE_POLYGON'],
            'rings':rings
        };
    },

    exportGeoJson:function(opts) {
        var points = this.getPoints();
        return {
            'type':'Polygon',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }
});
Z['Polyline']=Z.Polyline = Z.Vector.extend({
    includes:[Z.Geometry.Poly],
    initialize:function(path, opts) {
        this.type=Z.Geometry['TYPE_POLYLINE'];
        this.setPath(path);
        this.initOptions(opts);
    },

    /**
     * 设置多折线的坐标值
     * @param {Array} path 坐标数组
     * @export
     */
    setPath:function(path) {
        this.points = path;
        if (this.getMap()) {
            this.setPrjPoints(this.projectPoints(this.points));
        }
        return this;
    },

    /**
     * 获取多折线坐标值
     * @return {Array} 多边形坐标数组
     * @export
     */
    getPath:function() {
        return this.getPoints();
    },

    getPoints:function() {
        return this.points;
    },


    assignPainter:function() {
        if (!this.layer) {return;}
        if (this.layer instanceof Z.SVGLayer) {
            return new Z.Polyline.SVG(this);
        } else if (this.layer instanceof Z.CanvasLayer) {
            return new Z.Polyline.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type':Z.Geometry['TYPE_POLYLINE'],
            'path':this.getPoints()
        };
    },

    exportGeoJson:function(opts) {
        var points = this.getPoints();
        return {
            'type':'LineString',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }

});
Z['Ellipse']=Z.Ellipse = Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    defaultNumberOfPoints:60,

    initialize:function(center,width,height,opts) {        
        this.type=Z.Geometry['TYPE_ELLIPSE'];
        this.center = center;
        this.width = width;
        this.height = height;
        this.initOptions(opts);
        this.numberOfPoints = this.defaultNumberOfPoints;
        if (opts && opts['numberOfPoints']) {
            this.numberOfPoints = opts['numberOfPoints'];
        }
    },

    /**
     * 返回椭圆的宽度
     * @return {Number} [椭圆宽度]
     * @export
     */
    getWidth:function() {
        return this.width;
    },

    /**
     * 设置椭圆宽度
     * @param {Number} width [新的半径]
     * @export
     */
    setWidth:function(width) {
        this.width = width;
        this.onShapeChanged();
        return this;
    },

    /**
     * 返回椭圆的高度
     * @return {Number} [椭圆高度]
     * @export
     */
    getHeight:function() {
        return this.height;
    },

    /**
     * 设置椭圆高度
     * @param {Number} height [椭圆高度]
     * @export
     */
    setHeight:function(height) {
        this.height = height;
        this.onShapeChanged();
        return this;
    },

    getPoints:function() {
        //var proj = this.getProjection();
        //TODO 获取ellipse的ring
    },

    /**
     * do nothing for Ellipse
     * @param {Array} ring [ring for polygon]
     * @export
     */
    setRing:function(ring) {
        //do nothing for Ellipse as a polygon.
        return this;
    },

    computeExtent:function(projection) {
        if (!projection || !this.center || Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return null;
        }
        var width = this.getWidth(),
            height = this.getHeight();
        var p1 = projection.locate(this.center,width/2,height/2);
        var p2 = projection.locate(this.center,-width/2,-height/2);
        return new Z.Extent(p1,p2);
    },

    computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        //L=2πb+4(a-b)
        //近似值
        var longer = (this.width > this.height?this.width:this.height);
        return 2*Math.PI*longer/2-4*Math.abs(this.width-this.height);
    },

    computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return Math.PI*this.width*this.height/4;
    },


    assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Ellipse.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Ellipse.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type':Z.Geometry['TYPE_ELLIPSE'],
            'center':this.getCenter(),
            'width':this.getWidth(),
            'height':this.getHeight()
        };
    }

});
Z['Circle']=Z.Circle=Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    defaultNumberOfPoints:60,

    initialize:function(center,radius,opts) {
        this.type=Z.Geometry['TYPE_CIRCLE'];
        this.center = center;
        this.radius = radius;
        this.initOptions(opts);
        this.numberOfPoints = this.defaultNumberOfPoints;
        if (opts && opts['numberOfPoints']) {
            this.numberOfPoints = opts['numberOfPoints'];
        }
    },

    /**
     * 返回圆形的半径
     * @return {Number} [圆形半径]
     * @export
     */
    getRadius:function() {
        return this.radius;
    },

    /**
     * 设置圆形半径
     * @param {Number} radius [新的半径]
     * @export
     */
    setRadius:function(radius) {
        this.radius = radius;
        this.onShapeChanged();
        return this;
    },

    /**
     * 获取点
     * @return {Array} ring
     */
    getPoints:function() {
        //var proj = this.getProjection();
        //TODO
        
    },

    /**
     * do nothing for circle
     * @param {Array} ring [ring for polygon]
     * @export
     */
    setRing:function(ring) {
        //do nothing for circle as a polygon.
        return this;
    },

    computeExtent:function(projection) {
        if (!projection || !this.center || Z.Util.isNil(this.radius)) {
            return null;
        }

        var radius = this.radius;
        var p1 = projection.locate(this.center,radius,radius);
        var p2 = projection.locate(this.center,-radius,-radius);
        return new Z.Extent(p1,p2);
    },
    
    computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*2*this.radius;
    },

    computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*Math.pow(this.radius,2);
    },

    assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Circle.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Circle.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type':Z.Geometry['TYPE_CIRCLE'],
            'center':this.getCenter(),
            'radius':this.getRadius()
        };
    }

});
Z['Sector']=Z.Sector=Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    defaultNumberOfPoints:60,

    initialize:function(center,radius,startAngle,endAngle,opts) {        
        this.type=Z.Geometry['TYPE_SECTOR'];
        this.center = center;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.initOptions(opts);
        this.numberOfPoints = this.defaultNumberOfPoints;
        if (opts && opts['numberOfPoints']) {
            this.numberOfPoints = opts['numberOfPoints'];
        }
    },

    /**
     * 返回圆形的半径
     * @return {Number} [圆形半径]
     * @export
     */
    getRadius:function() {
        return this.radius;
    },

    /**
     * 设置圆形半径
     * @param {Number} radius [新的半径]
     * @export
     */
    setRadius:function(radius) {
        this.radius = radius;
        this.onShapeChanged();
        return this;
    },

    /**
     * 返回扇形的开始角
     * @return {Number} 开始角
     * @export
     */
    getStartAngle:function() {
        return this.startAngle;
    },

    /**
     * 设定扇形的开始角
     * @param {Number} startAngle 扇形开始角
     * @export
     */
    setStartAngle:function(startAngle) {
        this.startAngle = startAngle;
        this.onShapeChanged();
        return this;  
    },

    /**
     * 返回扇形的结束角
     * @return {Number} 结束角
     * @export
     */
    getEndAngle:function() {
        return this.endAngle;
    },

    /**
     * 设定扇形的结束角
     * @param {Number} endAngle 扇形结束角
     * @export
     */
    setEndAngle:function(endAngle) {
        this.endAngle = endAngle;
        this.onShapeChanged();
        return this;  
    },

    /**
     * 获取点
     * @return {Array} ring
     */
    getPoints:function() {
        //var proj = this.getProjection();
        //TODO
        
    },

    /**
     * do nothing for circle
     * @param {Array} ring [ring for polygon]
     * @export
     */
    setRing:function(ring) {
        //do nothing for circle as a polygon.
        return this;
    },

    computeExtent:function(projection) {
        if (!projection || !this.center || Z.Util.isNil(this.radius)) {
            return null;
        }

        var radius = this.radius;
        var p1 = projection.locate(this.center,radius,radius);
        var p2 = projection.locate(this.center,-radius,-radius);
        return new Z.Extent(p1,p2);
    },
    
    computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*2*this.radius*Math.abs(this.startAngle-this.endAngle)/360+2*this.radius;
    },

    computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*Math.pow(this.radius,2)*Math.abs(this.startAngle-this.endAngle)/360;
    },

    assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Sector.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Sector.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type':         Z.Geometry['TYPE_SECTOR'],
            'center':       this.getCenter(),
            'radius':       this.getRadius(),
            'startAngle':   this.getStartAngle(),
            'endAngle':     this.getEndAngle()
        };
    }
});
Z['Rectangle'] = Z.Rectangle = Z.Polygon.extend({    

    initialize:function(nw,width,height,opts) {        
        this.type=Z.Geometry['TYPE_RECT'];
        this.nw = nw;
        this.width = width;
        this.height = height;
        this.initOptions(opts);        
    },


    /**
     * 返回矩形左上角坐标
     * @return {Coordinate} [左上角坐标]
     * @export
     */
    getNw:function() {
        return this.nw;
    },

    /**
     * 设置新的center
     * @param {Coordinate} center 新的center
     * @export
     */
    setNw:function(nw){
        this.nw = nw;
        
        if (!this.nw || !this.getMap()) {
            return;
        }
        var projection = this.getProjection();
        this.setPNw(projection.project(this.nw));
        return this;
    },

    getPNw:function() {
        var projection = this.getProjection();
        if (!projection) {return null;}
        if (!this.pnw) {            
            if (this.nw) {
                this.pnw = projection.project(this.nw);
            }
        }
        return this.pnw;
    },

    /**
     * 设置投影坐标
     * @param {Coordinate} pnw 投影坐标
     */
    setPNw:function(pnw) {
        this.pnw=pnw;
        this.onPositionChanged();
    },

    /**
     * 返回矩形的宽度
     * @return {Number} [矩形宽度]
     * @export
     */
    getWidth:function() {
        return this.width;
    },

    /**
     * 设置矩形宽度
     * @param {Number} width [新的半径]
     * @export
     */
    setWidth:function(width) {
        this.width = width;
        this.onShapeChanged();
        return this;
    },

    /**
     * 返回矩形的高度
     * @return {Number} [矩形高度]
     * @export
     */
    getHeight:function() {
        return this.height;
    },

    /**
     * 设置矩形高度
     * @param {Number} height [矩形高度]
     * @export
     */
    setHeight:function(height) {
        this.height = height;
        this.onShapeChanged();
        return this;
    },

    /**
     * 修改投影坐标后调用该方法更新经纬度坐标缓存.
     * @return {[type]} [description]
     */
    updateCache:function() {
        var projection = this.getProjection();
        if (this.pnw && projection) {
            this.nw = projection.unproject(this.pnw);
        }
    },

    clearProjection:function() {
        this.pnw = null;
    },

    /**
     * 计算中心店
     * @param  {[type]} projection [description]
     * @return {[type]}            [description]
     */
    computeCenter:function(projection) {
        
        return projection.locate(this.nw,this.width/2,-this.height/2);
    },

    /**
     * 获取ring
     * @return {Array} ring     
     */
    getPoints:function() {
        var projection = this.getProjection();
        var nw =this.nw;    
        var points = [];
        points.push(nw);
        points.push(projection.locate(nw,this.width,0));
        points.push(projection.locate(nw,this.width,this.height));
        points.push(projection.locate(nw,0,this.height));
        points.push(nw);
        return points;
    },

    /**
     * do nothing for Ellipse
     * @param {Array} ring [ring for polygon]
     * @export
     */
    setRing:function(ring) {
        //do nothing for Ellipse as a polygon.
        return this;
    },

    computeExtent:function(projection) {
        if (!projection || !this.nw || Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return null;
        }
        var width = this.getWidth(),
            height = this.getHeight();
        var p1 = projection.locate(this.nw,width,-height);        
        return new Z.Extent(p1,this.nw);
    },

    computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return 2*(this.width+this.height);
    },

    computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return this.width*this.height;
    },


    assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Rectangle.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Rectangle.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type':Z.Geometry['TYPE_RECT'],
            'nw':this.getNw(),
            'width':this.getWidth(),
            'height':this.getHeight()
        };
    }

});
Z['GeometryCollection'] = Z.GeometryCollection = Z.Geometry.extend({
    initialize:function(geometries, opts) {
        this.type=Z.Geometry['TYPE_GEOMETRYCOLLECTION'];
        this.setGeometries(geometries);
        this.initOptions(opts);
    },

    /**
     * prepare this geometry collection
     * @param  {Z.Layer} layer [description]
     * @return {[type]}       [description]
     * @override
     */
    prepare:function(layer) {
        this.rootPrepare(layer);
        this.prepareGeometries();
    },

    /**
     * prepare the geometries, 在geometries发生改变时调用
     * @return {[type]} [description]
     */
    prepareGeometries:function() {
        var layer = this.getLayer();
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            this.geometries[i].prepare(layer);
        }
    },

    /**
     * 设置
     * @param {[Geometry]} geometries [Geometry数组]
     * @export
     *
     */
    setGeometries:function(geometries) {
        this.checkGeometries(geometries);
        this.geometries = geometries;
        this.prepareGeometries();
        this.onShapeChanged();
        return this;
    },

    /**
     * 获取集合中的Geometries
     * @return {[Geometry]} Geometry数组
     * @export
     */
    getGeometries:function() {
        if (!this.geometries && !Z.Util.isArray(this.geometries)) {
            return [];
        }
        return this.geometries;
    },

    /**
     * 供GeometryCollection的子类调用, 检查geometries是否符合规则
     * @param  {Geometry[]} geometries [供检查的Geometry]
     */
    checkGeometries:function(geometries) {

    },

    /**
     * 集合是否为空
     * @return {Boolean} [是否为空]
     * @export
     */
    isEmpty:function() {
        return !Z.Util.isArrayHasData(this.geometries);
    },

    updateCache:function() {
        for (var i=0, len=this.geometries.length;i<len;i++) {
            if (this.geometries[i] && this.geometries[i].updateCache) {
                this.geometries[i].updateCache();
            }
        }
    },

    computeCenter:function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var sumX=0, sumY=0,counter=0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            if (!this.geometries[i]) {
                continue;
            }
            var center = this.geometries[i].computeCenter(projection);
            sumX += center.x;
            sumY += center.y;
            counter++;
        }
        return new Z.Coordinate(sumX/counter, sumY/counter);
    },

    computeExtent:function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var result = null;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result = Z.Extent.combine(this.geometries[i].computeExtent(projection),result);
        }
        return result;
    },

    computeGeodesicLength:function(projection) {
        if (!projection || this.isEmpty()) {
            return 0;
        }
        var result = 0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result += this.geometries[i].computeGeodesicLength(projection);
        }
        return result;
    },

    computeGeodesicArea:function(projection) {
        if (!projection || this.isEmpty()) {
            return 0;
        }
        var result = 0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result += this.geometries[i].computeGeodesicArea(projection);
        }
        return result;
    },

    computeVisualExtent: function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var result = null;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result = Z.Extent.combine(this.geometries[i].computeVisualExtent(projection),result);
        }
        return result;
    },

    computeVisualSide: function(map) {
        var projection = map.getProjection();
        var extent = this.computeVisualExtent(projection);
        var xmin = extent['xmin'];
        var xmax = extent['xmax'];
        var ymin = extent['ymin'];
        var ymax = extent['ymax'];
        var topLeftPoint = new Z.Coordinate(xmin, ymax);
        var topRightPoint = new Z.Coordinate(xmax, ymax);
        var bottomLeftPoint = new Z.Coordinate(xmin, ymin);
        var width = map.computeDistance(topLeftPoint, topRightPoint);
        var height = map.computeDistance(topLeftPoint, bottomLeftPoint);
        var result = map.distanceToPixel(width, height);
        return {'width': result['px'], 'height': result['py']};
    },

    assignPainter:function() {
        return new Z.GeometryCollection.Painter(this);
    },

    exportJson:function(opts) {
        var geoJsons = [];
        var geometries = this.getGeometries();
        if (Z.Util.isArray(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                geoJsons.push(geometries.exportJson(opts));
            }
        }
        return {
            'type':         Z.Geometry['TYPE_GEOMETRYCOLLECTION'],
            'geometries':   geoJsons
        };
    },


    exportGeoJson:function(opts) {
        var geoJsons = [];
        var geometries = this.getGeometries();
        if (Z.Util.isArray(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                geoJsons.push(geometries.exportGeoJson(opts));
            }
        }
        return {
            'type':         'GeometryCollection',
            'geometries':   geoJsons
        };
    },

    clearProjection:function() {
        var geometries = this.getGeometries();
        if (Z.Util.isArrayHasData(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                this.geometries[i].clearProjection();
            }
        }
    },

//----------覆盖Geometry中的编辑相关方法-----------------

    /**
     * 开始编辑
     * @export
     */
    startEdit:function(opts) {
        if (opts['symbol']) {
            this.originalSymbol = this.getSymbol();
            this.setSymbol(opts['symbol']);
        }
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].startEdit(opts);
        }
        this.editing = true;
        return this;
    },

    /**
     * 停止编辑
     * @export
     */
    endEdit:function() {
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].endEdit();
        }
        if (this.originalSymbol !== undefined) {
            this.setSymbol(this.originalSymbol);
            delete this.originalSymbol;
        }
        this.editing = false;
        return this;
    },

    /**
     * 是否处于编辑状态
     * @return {Boolean} [是否处于编辑状态]
     * @export
     */
    isEditing:function() {
        return this.editing;
    },

    /**
     * 开始拖拽
     * @export
     */
    startDrag:function() {
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].startDrag();
        }
        this.dragging = true;
        return this;
    },

    /**
     * 停止拖拽
     * @export
     */
    endDrag:function() {
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].endDrag();
        }
        this.dragging = false;
        return this;
    },

    /**
     * 是否处于拖拽状态
     * @return {Boolean} [是否处于拖拽状态]
     * @export
     */
    isDragging:function() {
        return this.dragging;
    }
});
Z.MultiPoly = Z.GeometryCollection.extend({

    initialize:function(data, opts) {
        this.type=Z.Geometry['TYPE_MULTIPOLYGON'];
        if (Z.Util.isArrayHasData(data)) {
            if (data[0] instanceof this.GeometryType) {
                this.setGeometries(data);
            } else {
                this.setCoordinates(data);
            }
        }
        this.initOptions(opts);
    },

    checkGeometries:function(geometries) {
        if (Z.Util.isArray(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                if (geometries[i] && !(geometries[i] instanceof this.GeometryType)) {
                    throw new Error(this.exception['INVALID_GEOMETRY_IN_COLLECTION']+i);
                }
            }
        }
    }, 

    /**
     * 获取MultiPolygon的坐标数组
     * @return {Coordinate[][][]} MultiPolygon的坐标数组
     * @export
     */
    getCoordinates:function() {
        var coordinates = [];
        var geometries = this.getGeometries();
        if (!Z.Util.isArray(geometries)) {
            return null;
        }
        for (var i = 0,len=geometries.length;i<len;i++) {
            coordinates.push(geometries.getCoordinates());
        }
        return coordinates;
    },

    /**
     * 设置MultiPolygon
     * @param {Coordinate[][][]} MultiPolygon的坐标数组
     * @export
     */
    setCoordinates:function(coordinates) {
        if (!Z.Util.isArrayHasData(coordinates)) {
            var geometries = [];            
            for (var i=0, len=coordinates.length;i<len;i++) {
                var p = new this.GeometryType(coordinates[i]);
                geometries.push(p);
            }
            this.setGeometries(geometries);
        } else {
            this.setGeometries([]);
        }
        return this;
    }
});
Z['MultiPolygon'] = Z.MultiPolygon = Z.MultiPoly.extend({
    GeometryType:Z.Polygon,    

    exportGeoJson:function(opts) {        
        var points = this.getCoordinates();
        return {
            'type':'MultiPolygon',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }
});
Z['MultiPolyline']=Z.MultiPolyline = Z.MultiPoly.extend({
    GeometryType:Z.Polyline,    

    exportGeoJson:function(opts) {        
        var points = this.getCoordinates();
        return {
            'type':'MultiLineString',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }
});
//判断浏览器是否支持vml和svg
Z.Browser.svg = !!(document['createElementNS'] && document['createElementNS']('http://www.w3.org/2000/svg', 'svg')['createSVGRect']);

Z.Browser.vml = !Z.Browser.svg && (function () {
    try {
        var div = document.createElement('div');
        div.innerHTML = '<v:shape adj="1"/>';

        var shape = div.firstChild;
        shape.style['behavior'] = 'url(#default#VML)';

        return shape && (typeof shape.adj === 'object');

    } catch (e) {
        return false;
    }
}());

Z.SVG={
    defaultStrokeSymbol:{
        "stroke":"#000000",
        "stroke-width":2
    },

    defaultFillSymbol:{
        "fill-opacity":0
    },

    _ISURL: /^url\(['"]?(.+?)['"]?\)$/i,

    createContainer:function() {},

    refreshContainer:function() {},

    refreshVector:function() {},

    refreshVectorSymbol:function() {},

    addVector:function(){},

    removeVector:function() {}
};
//Path中的闭合指令, svg中是Z, vml中是x, 默认为Z
Z.SVG.closeChar = (function() {
        if (Z.Browser.vml) {
            return 'x';
        } else {
            return 'Z';
        }
    })();

Z.SVG.SVG={
    createContainer:function() {
        var paper = document['createElementNS']('http://www.w3.org/2000/svg', 'svg');
        paper.style.overflow = '';
        paper.style.position = 'absolute';
        paper.setAttribute('xmlns','http://www.w3.org/2000/svg');
        var defs = document['createElementNS']('http://www.w3.org/2000/svg', 'defs');
        paper.appendChild(defs);
        paper.defs = defs;
        return paper;
    },

    refreshContainer:function(map,paper) {
        var domOffset = map.offsetPlatform();
        var x = -domOffset['left'],
            y = -domOffset['top'];
        var mapSize =   map.getSize();
        paper.setAttribute('width', mapSize['width']);
        paper.setAttribute('height', mapSize['height']);
        paper.setAttribute('viewBox', [x, y, mapSize['width'], mapSize['height']].join(' '));
        paper.style.left = x + 'px';
        paper.style.top = y + 'px';
    },

    refreshVector:function(vector, vectorBean) {
        if (!vector || !vectorBean) {
            return;
        }
        var path = vectorBean['path'];
        if (!path) {
            return;
        }
        vector.setAttribute('d', path);
    },

    refreshVectorSymbol:function(vector, strokeSymbol, fillSymbol, paper) {
        var key;
        if (!strokeSymbol) {
            strokeSymbol = Z.SVG.defaultStrokeSymbol;
        }

        if (!fillSymbol) {
            fillSymbol = Z.SVG.defaultFillSymbol;
        }

        for (key in strokeSymbol) {
            if (strokeSymbol.hasOwnProperty(key)) {
                vector.setAttribute(key, strokeSymbol[key]);
            }
        }
    

        for (key in fillSymbol) {
            if (fillSymbol.hasOwnProperty(key)) {
                if (key.toLowerCase() === 'fill') {
                    //模式填充
                    var fillValue = fillSymbol[key];
                    var isUrl = fillValue.match(Z.SVG._ISURL);
                    if (isUrl) {
                        var pattern = Z.SVG.SVG.fillWithPattern(isUrl, vector, paper);
                        vector.setAttribute(key, pattern);
                        continue;
                    } 
                } 

                vector.setAttribute(key, fillSymbol[key]);                
                
            }
        }
    },

    /**
     * 模式填充
     * @param  {Boolean} isUrl  [description]
     * @param  {[type]}  vector [description]
     * @param  {[type]}  paper  [description]
     * @return {[type]}         [description]
     */
    fillWithPattern:function(isUrl,vector,paper) {
        function setAttributes(el, attr) {
            var xlink = "http://www.w3.org/1999/xlink";
            if (attr) {            
                for (var key in attr) {
                    if (attr.hasOwnProperty(key)) {
                        if (key.substring(0, 6) == "xlink:") {
                            el.setAttributeNS(xlink, key.substring(6), attr[key]);
                        } else {
                            el.setAttribute(key, attr[key]);
                        }
                    }
                }
            }
            return el;
        }
        function create(el) {
            var el = document.createElementNS("http://www.w3.org/2000/svg", el);
            el.style && (el.style['webkitTapHighlightColor'] = "rgba(0,0,0,0)");
            return el;
        }
        function _preload(src, f) {
            var img = document.createElement("img");
            img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
            img.onload = function () {
                f.call(this);
                this.onload = null;
                document.body.removeChild(this);
            };
            img.onerror = function () {
                document.body.removeChild(this);
            };
            document.body.appendChild(img);
            img.src = src;
        }
        var uid = Z.Util.GUID();
        var pattern = create('pattern');
        pattern.id = uid;
        setAttributes(pattern, {
            'x':0,
            'y':0,
            'patternUnits':'userSpaceOnUse',
            'height': 1, 
            'width': 1
        });
        var image = create('image');
        setAttributes(image, {
            'x':0,
            'y':0, 
            /*'width':20,
            'height':20,  */                         
            "xlink:href": isUrl[1]
        });

        pattern.appendChild(image);
       
        vector._pattern = pattern;
        
        (function () {
        _preload(isUrl[1], function() {
            var w = this.offsetWidth,
                h = this.offsetHeight;
            setAttributes(pattern, {
                'width':w,
                'height':h
            });
            setAttributes(image, {
                'width':w,
                'height':h
            });
        });
        })();
        paper.defs.appendChild(pattern);
        return "url(#" + uid + ")";
        
    },


    addVector:function(container, vectorBean, strokeSymbol, fillSymbol) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', vectorBean['path']);
        

        Z.SVG.refreshVectorSymbol(path, strokeSymbol,fillSymbol, container);
        
        container.appendChild(path);
        
        return path;
    },

    removeVector:function(container, vector) {
        //如果是模式填充, 需要删除模式定义元素
        if (vector._pattern) {
            Z.Util.removeDomNode(vector._pattern);
        }
        if (container && vector) {
            container.removeChild(vector);
        }
    }
};

Z.SVG.VML={
    createContainer:function() {
        return document.createElement('div');
    },

    refreshContainer:function(map,paper) {
        return;
    },

    //更新矢量图形样式
    refreshVectorSymbol:function(vmlShape, strokeSymbol, fillSymbol) {
        if (!vmlShape) {
            return null;
        }
        if (!strokeSymbol) {
            strokeSymbol = Z.SVG.defaultStrokeSymbol;
        }

        if (!fillSymbol) {
            fillSymbol = Z.SVG.defaultFillSymbol;
        }

        if (vmlShape.stroke) {
            Z.Util.removeDomNode(vmlShape.stroke);
            delete vmlShape.stroke;
        }

        var stroke = Z.SVG.create('stroke');
        if (strokeSymbol['stroke-width']) {
            stroke.weight = strokeSymbol['stroke-width'] + 'px';    
        }
        if (strokeSymbol['stroke']) {
            stroke.color = strokeSymbol['stroke'];
        }
        if (strokeSymbol['stroke-opacity']) {
            stroke.opacity = strokeSymbol['stroke-opacity'];
        }
        if (strokeSymbol['stroke-dasharray']) {
            stroke.dashStyle = strokeSymbol['stroke-dasharray'];
        }
        vmlShape.appendChild(stroke);
        vmlShape.stroke = stroke;

        if (vmlShape.fill) {
            Z.Util.removeDomNode(vmlShape.fill);
            delete vmlShape.fill;
        }

        if (fillSymbol) {
            var fill = Z.SVG.create('fill');
            if (fillSymbol['fill']) {
                var isUrl = fillSymbol['fill'].match(Z.SVG._ISURL);
                if (isUrl) {                    
                    fill.rotate = true;
                    fill.src = isUrl[1];
                    fill.type = "tile";                   
                } else {
                    fill.color = fillSymbol['fill'];      
                }
            }
            if (!Z.Util.isNil(fillSymbol['fill-opacity'])) {
                fill.opacity = fillSymbol['fill-opacity'];
            }
            // fill.opacity = 1;
            vmlShape.appendChild(fill);
            vmlShape.fill=fill;
        }
    },

    /**
     * 更新矢量图形的图形属性
     * @param  {[type]} vmlShape     [description]
     * @param  {[type]} vectorBean [description]
     * @return {[type]}            [description]
     */
    refreshVector:function(vmlShape, vectorBean) {
        if (!vmlShape || !vectorBean) {
            return;
        }
        var path = vectorBean['path'];
        if (!path) {

            return;
        }
        vmlShape.path['v'] = path;
    },

    addVector:function(container, vectorBean, strokeSymbol, fillSymbol) {
        if (!container || !vectorBean) {
            return null;
        }
        var vmlShape = Z.SVG.create('shape');
        //以下三行不设置的话, IE8无法显示vml图形,原因不明
        vmlShape.style.width='1px';
        vmlShape.style.height='1px';
        vmlShape['coordsize'] = '1 1';
        vmlShape['coordorigin'] = '0 0';

        var _path = Z.SVG.create('path');
        _path.v = vectorBean['path'];
        vmlShape.appendChild(_path);
        vmlShape.path = _path;

        this.refreshVectorSymbol(vmlShape, strokeSymbol, fillSymbol);

        container.appendChild(vmlShape);
        return vmlShape;
    },

    removeVector:function(container, vector) {
        if (container && vector) {
            container.removeChild(vector);
        }
    }
};

Z.SVG.VML.create = (function () {
        if (Z.Browser.vml) {
            var doc = window.document;
            if (doc.styleSheets.length < 31) {
                doc.createStyleSheet().addRule(".zvml", "behavior:url(#default#VML);display: inline-block;position:absolute;");
            } else {
                // no more room, add to the existing one
                // http://msdn.microsoft.com/en-us/library/ms531194%28VS.85%29.aspx
                doc.styleSheets[0].addRule(".zvml", "behavior:url(#default#VML);display: inline-block;position:absolute;");
            }
            try {
                !doc.namespaces['zvml'] && doc.namespaces.add("zvml", "urn:schemas-microsoft-com:vml");
                return function (tagName) {
                    return doc.createElement('<zvml:' + tagName + ' class="zvml">');
                };
            } catch (e) {
                return function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="zvml">');
                };
            }
        }
        

        /*try {
            document.namespaces.add('vml', 'urn:schemas-microsoft-com:vml');
            return function (name) {
                return document.createElement('<vml:' + name + ' style="behavior: url(#default#VML);display: inline-block;position:absolute;">');
            };
        } catch (e) {
            return function (name) {
                return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" style="behavior: url(#default#VML);display: inline-block;position:absolute;">');
            };
        }*/
        // return function (name) {return document.createElement('<vml:' + name + ' style="behavior: url(#default#VML);display: inline-block;position:absolute;">');};
    })();

if (Z.Browser.vml) {
    Z.Util.extend(Z.SVG, Z.SVG.VML);
} else if (Z.Browser.svg) {
    Z.Util.extend(Z.SVG, Z.SVG.SVG);
} else {
    //vml和svg都不支持
}


Z.Painter = Z.Class.extend({
    includes:[Z.Eventable],
    paint:function() {
        if (!this.geometry || !this.geometry.isVisible()) {
            return;
        }
        this._paint.apply(this,arguments);
        this.registerEvents();
    },

    setSymbol:function(_symbol) {
        var symbol = _symbol;
        if (!symbol) {
            symbol = this.geometry.getSymbol();
            if (!symbol) {
                symbol = this.geometry.getDefaultSymbol();
            }
        }
        //如果有cartoCSS定义, 则优先载入cartoCSS中的symbol
        var map = this.geometry.getMap();
        if (map.options['enableCartoCSS']) {
            var cartoSymbol = map.cartoCSSGeometry(this.geometry);
            if (cartoSymbol) {
                symbol = Z.Util.convertFieldNameStyle(cartoSymbol,'camel');
            }
        }

        this.strokeSymbol = this.prepareStrokeSymbol(symbol);
        this.fillSymbol = this.prepareFillSymbol(symbol);
        this.iconSymbol = this.prepareIcon(symbol);
    },

    /**
     * 构造线渲染所需的symbol字段
     */
    prepareStrokeSymbol:function(symbol) {
        var strokeSymbol = {};
        if (this.geometry.isVector()) {
            strokeSymbol['stroke'] = symbol['lineColor'];
            strokeSymbol['strokeWidth'] = symbol['lineWidth'];
            strokeSymbol['strokeDasharray'] = symbol['lineDasharray'];
            strokeSymbol['strokeOpacity'] = symbol['lineOpacity'];
        } else {
            //如果有marker-file,则忽略其他的样式
            if (!symbol['markerFile']) {
                strokeSymbol['stroke'] = symbol['markerLineColor'];
                strokeSymbol['strokeWidth'] = symbol['markerLineWidth'];
                //markerOpacity优先级较高
                strokeSymbol['strokeOpacity'] = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerLineOpacity']);
            }
        }
        return strokeSymbol;
    },

    /**
     * 构造填充渲染所需的symbol字段
     */
    prepareFillSymbol:function(symbol) {
        var fillSymbol = {};
        if (this.geometry.isVector()) {
            fillSymbol['fill'] = symbol['polygonFill'];

            if (symbol['polygonPatternFile']) {
                fillSymbol['fill'] = symbol['polygonPatternFile'];

            }
            fillSymbol['fillOpacity'] = (!Z.Util.isNil(symbol['polygonOpacity'])?symbol['polygonOpacity']:symbol['polygonPatternOpacity']);
        } else {
            //如果有marker-file,则忽略其他的样式
            if (!symbol['markerFile']) {
                fillSymbol['fill'] = symbol['markerFill'];
                //markerOpacity优先级较高
                fillSymbol['fillOpacity'] = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerFillOpacity']);
            }
        }
        return fillSymbol;
    },

    prepareIcon:function(symbol) {
        var icon = null;
        if (!this.geometry.isVector()) {
            if (symbol['markerFile']) {
                icon = {
                    'type':'picture',
                    'url':symbol['markerFile'],
                    'width':symbol['markerWidth'],
                    'height':symbol['markerHeight']
                };
            } else if (symbol['text-name']){
                //文字
                icon = {
                    'type':'text'
                };
            } else {
                icon = {
                    'type':'vector',
                    'style':symbol['markerType'],
                    'size':symbol['markerWidth']
                };
            }
        }
        return icon;
    },

    //需要实现的接口方法
    setZIndex:function(change) {
        throw new Error("not implemented");
    },

    show:function(){
        throw new Error("not implemented");
    },

    hide:function(){
        throw new Error("not implemented");
    },

    refresh:function(){
        throw new Error("not implemented");
    },

    remove:function() {
        throw new Error("not implemented");
    },

    addDomEvents:function(dom){
        var geometry = this.geometry;
        Z.DomUtil.on(dom, 'mousedown mouseup click dblclick contextmenu', geometry.onEvent, geometry);
        Z.DomUtil.on(dom, 'mouseover', geometry.onMouseOver, geometry);
        Z.DomUtil.on(dom, 'mouseout', geometry.onMouseOut, geometry);
    }

});
Z.Painter.SVG = Z.Painter.extend({

    /**
     * 绘制矢量Geometry
     * @param layer
     * @param config
     */
    drawVector:function(vectorBean,strokeSymbol, fillSymbol) {
        var vectorPaper = this.getVectorPaper();
        if (!vectorBean || !vectorPaper) {return;}
        //样式
        // Z.Util.extend(vectorBean,this.convertPropToCssStyle(strokeSymbol),this.convertPropToCssStyle(fillSymbol));
        if (this.vector) {
            // this.vector['remove']();
            // TODO: only update?           
            Z.SVG.removeVector(vectorPaper, this.vector);
        }
        // var elements = vectorPaper.add([vectorBean]);
        // if (!elements || elements.length === 0) {return;}Ø
        // this.vector=elements[0];
        /*var defaultStrokeSymbol = this.geometry.getDefaultStrokeSymbol();
        if (!strokeSymbol) {
            strokeSymbol = defaultStrokeSymbol;
        }
        if (!strokeSymbol['stroke']) {
            strokeSymbol['stroke'] = defaultStrokeSymbol['stroke'];
        }*/
        var path = Z.SVG.addVector(vectorPaper, vectorBean, Z.Util.convertFieldNameStyle(strokeSymbol,'minus'), Z.Util.convertFieldNameStyle(fillSymbol,'minus'));
        this.vector=path;
        return this.vector;
    },

    remove:function() {
        if (this.vector) {
            var vectorPaper = this.getVectorPaper();
            Z.SVG.removeVector(vectorPaper, this.vector);
            delete this.vector;
        }
        if (this.markerDom) {
            Z.DomUtil.removeDomNode(this.markerDom);
            delete this.markerDom;
        }
    },

    refreshSymbol:function() {
        if (!this.geometry) {return;}
        if (Z.Geometry['TYPE_POINT'] === this.geometry.getType()) {
            this.refreshMarkerSymbol();
        } else {
            this.refreshVectorSymbol();
        }
    },

    /**
     * 刷新Graphic的位置,主要用在缩放地图
     */
    refresh:function() {
        if (this.geometry.type === Z.Geometry["TYPE_POINT"]) {
            this.refreshMarker();
        } else {
            var vectorBean = this.createSVGObj();
            Z.SVG.refreshVector(this.vector, vectorBean);
        }
        this.registerEvents();
    },

    registerEvents:function(){
        var targetDom = this.vector || this.markerDom;
        targetDom && this.addDomEvents(targetDom);
    },

    setZIndex:function(change) {
        if (this.markerDom) {
            this.markerDom.style.zIndex = change;
        }
        if (this.vector) {
            this.vector.style.zIndex = change;
        }
    },

    show:function() {
        if (this.markerDom) {
            this.markerDom.style.display='';
        }
        if (this.vector) {
            this.vector.show();
        }
    },

    hide:function() {
        if (this.markerDom) {
            this.markerDom.style.display = 'none';
        }
        if (this.vector) {
            this.vector.hide();
        }
    },

    convertPropToCssStyle:function(symbol) {
        if (!symbol) {
            return null;
        }
        var option = {};
        for (var p in symbol) {
            if (symbol.hasOwnProperty(p)) {
                if (p === "") {continue;}
                option[Z.Util.convertCamelToMinus(p)]=symbol[p];
            }
        }
        return option;
        
    },

    setVectorPaper:function(paper) {
        this.vectorPaper = paper;
    },

    getVectorPaper:function() {     
        if (this.vectorPaper) {
            return this.vectorPaper;
        }
        if (!this.geometry || !this.geometry.getMap()) {
            return null;
        }        
        var map = this.geometry.getMap();
        map.createSVGPaper();
        return map.vectorPaper;
    }
});
Z.Painter.Canvas = Z.Painter.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    _paint:function(ctx, resources, symbol) {
        var geometry = this.geometry;
        if (!geometry || !ctx || !geometry.getMap() || this.deleting) {
            return;
        }
        this.setSymbol(symbol);
        this.prepareCanvas(ctx,this.strokeSymbol,this.fillSymbol);
        var platformOffset = this.geometry.getMap().offsetPlatform();
        this.doPaint(ctx,resources,platformOffset);
    },

    remove:function() {
        var geometry = this.geometry;
        if (!geometry) {
            return;
        }
        var map = geometry.getMap();
        if (!map) {
            return;
        }
        this.deleting = true;
        this.refresh();
    },

    show:function() {
        this.refresh();
    },

    hide:function() {
        this.refresh();
    },

    refresh:function() {
        var geometry = this.geometry;
        if (!geometry) {
            return;
        }
        var map = geometry.getMap();
        if (!map) {
            return;
        }
        // var extent = geometry.computeVisualExtent(geometry.getProjection());
        var isRealTime = geometry.isEditing();
        map.repaintBaseCanvasLayer(isRealTime);
        this.registerEvents();
    },

    refreshSymbol:function() {
        this.refresh();
    },

    getRgba:function(color, op) {
        //var rop=1;
        if (Z.Util.isNil(op)) {
            op = 1;//op=(""+op).replace("0","");
        } /*else {
            op = 1;
        }*/
        var rgb = {
            r: parseInt(color.slice(1, 3), 16),
            g: parseInt(color.slice(3, 5), 16),
            b: parseInt(color.slice(5, 7), 16)
        };
        return "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+op+")";
    },

    setDefaultCanvasSetting:function(context) {
        context.lineWidth = 1;
        context.strokeStyle = this.getRgba("#474cf8",1);
        context.fillStyle = this.getRgba("#474cf8",0);
        context.textAlign="start";
        context.textBaseline="hanging";
        context.font="11px SIMHEI";
        if (context.setLineDash) {
            context.setLineDash([]);
        }
        context.save();
    },

    /**
     * 根据strokeSymbol和fillSymbol准备canvas的绘制参数
     * @param  {[type]} context      [description]
     * @param  {[type]} strokeSymbol [description]
     * @param  {[type]} fillSymbol   [description]
     * @return {[type]}              [description]
     */
    prepareCanvas:function(context, strokeSymbol, fillSymbol){
        this.setDefaultCanvasSetting(context);
        context.restore();       
        if (strokeSymbol) {
            var strokeWidth = strokeSymbol["strokeWidth"];
            if (!Z.Util.isNil(strokeWidth)) {context.lineWidth = strokeWidth;}
            var strokeOpacity = strokeSymbol["strokeOpacity"];
            if (strokeWidth === 0) {
                strokeOpacity = 0;
            }

            var strokeColor=strokeSymbol["stroke"];
             if (strokeColor)  {
                 if (Z.Util.isNil(strokeOpacity)) {
                     strokeOpacity = 1;
                 }
                 context.strokeStyle = this.getRgba(strokeColor,strokeOpacity);
             }
             //低版本ie不支持该属性
             if (context.setLineDash) {
                 var strokeDash=(strokeSymbol["strokeDasharray"] || strokeSymbol['strokeDashArray']);
                 if (strokeDash && Z.Util.isString(strokeDash) && strokeDash.length>0) {
                     var da = [];
                     for (var i=0, len=strokeDash.length;i<len;i++) {
                            var currChar = strokeDash[i];
                            if (currChar === null) {
                                currChar = strokeDash.charAt(i);
                            }
                            if (currChar === "-") {
                                da.push(9);
                            } else if (currChar === ".") {
                                da.push(3);
                            } else {
                                continue;
                            }
                            da.push(6);
                        }
                     context.setLineDash(da);
                 }
             }
             
        }                
         if (fillSymbol) { 
             var fill=fillSymbol["fill"];
             if (!fill) {return;}
             if (Z.Util.isNil(fillSymbol["fillOpacity"])) {
                 fillSymbol["fillOpacity"] = 1;
             }
             if (fill.length>7 && "url" ===fill.substring(0,3)) {
                 var imgUrl = fill.substring(5,fill.length-2);
                 var imageTexture = document.createElement('img'); 
//               imageTexture.onload=function() {
//                                      
//               };
                 imageTexture.src = imgUrl;        
                 var woodfill = context.createPattern(imageTexture, "repeat"); 
                 context.fillStyle = woodfill;
             }else {
                 context.fillStyle =this.getRgba(fill); 
             }               
         }
    },

    fillGeo:function(context, fillSymbol){
        if (fillSymbol) {
             if (!Z.Util.isNil(fillSymbol["fillOpacity"])) {
                 context.globalAlpha = fillSymbol["fillOpacity"];
             }
             context.fill("evenodd");
             context.globalAlpha = 1;
        }
    },

    registerEvents:function(){

    }
    
});
Z.Marker.PaintUtils = {

    getMarkerDomOffset:function() {
        var domOffset = this.geometry.getCenterDomOffset();
        if (!domOffset) {return null;}
        var moffset = this.getIconOffset();
        var gCenter = [(domOffset["left"] + moffset["left"]),(domOffset["top"] + moffset["top"])];
        return gCenter;
    },

    getIconOffset : function() {
        var icon = this.getGeoIcon();
        if (!icon["offset"]) {
            icon["offset"] = {
                    x:0,
                    y:0
            };
        }
        if ("picture" !== icon["type"]) {
            return {
                "top" : icon["offset"]["y"],
                "left" : icon["offset"]["x"]
            };
        }
        var w = icon["width"];
        if (!w) {w=0;}
        var h = icon["height"];
        if (!h) {h=0;}
        return {
            "top" : (-h - icon["offset"]["y"]),
            "left" : (-Math.round(w / 2) + icon["offset"]["x"])
        };
    },

    getVectorArray:function(gCenter) {  
        var icon = this.getGeoIcon();
        var vType = icon["style"];
        var size = (0.5+icon["size"]) << 0;
        var rad = Math.PI/180;
        if ("triangle" === vType) {
            var v0 = [gCenter[0],gCenter[1]-size];
            var v1 = [Z.Util.roundNumber(gCenter[0]-Math.cos(30*rad)*size),Z.Util.roundNumber(gCenter[1]+Math.sin(30*rad)*size)];
            var v2 = [Z.Util.roundNumber(gCenter[0]+Math.cos(30*rad)*size),Z.Util.roundNumber(gCenter[1]+Math.sin(30*rad)*size)];
            return [v0,v1,v2];
        }  else if ("cross" === vType) {
            var v0 = [(gCenter[0]-size),gCenter[1]];
            var v1 = [(gCenter[0]+size),gCenter[1]];
            var v2 = [(gCenter[0]),(gCenter[1]-size)];
            var v3 = [(gCenter[0]),(gCenter[1]+size)];
            return [v0,v1,v2,v3];
        } else if ("diamond" === vType) {
            var v0 = [(gCenter[0]-size),gCenter[1]];
            var v1 = [(gCenter[0]),(gCenter[1]-size)];
            var v2 = [(gCenter[0]+size),gCenter[1]];
            var v3 = [(gCenter[0]),(gCenter[1]+size)];
            /*_graphicDom = {
                    "type" : "path",                    
                    "path" : "M"+v0[0]+","+v0[1]+"L"+v1[0]+","+v1[1]+"L"+v2[0]+","+v2[1]+"L"+v3[0]+","+v3[1]+"Z"
            };*/
            return [v0,v1,v2,v3];
        } else if ("square" === vType) {
            var v0 = [(gCenter[0]-size),(gCenter[1]+size)];
            var v1 = [(gCenter[0]+size),(gCenter[1]+size)];
            var v2 = [(gCenter[0]+size),(gCenter[1]-size)];
            var v3 = [(gCenter[0]-size),(gCenter[1]-size)];
            /*_graphicDom = {
                    "type" : "path",                    
                    "path" : "M"+v0[0]+","+v0[1]+"L"+v1[0]+","+v1[1]+"L"+v2[0]+","+v2[1]+"L"+v3[0]+","+v3[1]+"Z"
            };*/
            return [v0,v1,v2,v3];
        } else if ("x" === vType || "X" === vType) {
            var r = Math.round(Math.cos(45*rad)*size);
            var v0 = [gCenter[0]-r,gCenter[1]+r];
            var v1 = [gCenter[0]+r,gCenter[1]-r];
            var v2 = [gCenter[0]+r,gCenter[1]+r];
            var v3 = [gCenter[0]-r,gCenter[1]-r];
            /*_graphicDom = {
                    "type" : "path",                    
                    "path" : "M"+v0[0]+","+v0[1]+"L"+v1[0]+","+v1[1]+"M"+v2[0]+","+v2[1]+"L"+v3[0]+","+v3[1]+"Z"
            };*/
            return [v0,v1,v2,v3];
        }
        return null;
    },

    computeLabelOffset: function(width, height, option) {
        var left = -width/2;
        var top = height/2;
        if (option) {
            var placement = option['placement'];
            if('left' === placement) {
                left = -width;
            } else if('right' === placement) {
                left = 0;
            } else if('top' === placement) {
                top = height;
            } else if('bottom' === placement) {
                top = 0;
            }
        }
        return {'x':left, 'y':top};
    },

    getGeoIcon:function() {
        if (this.iconSymbol)  {
            return this.iconSymbol;
        }
        if (this.geometry) {
            return this.geometry.getIcon();
        }
    }
};
Z.Marker.SVG=Z.Painter.SVG.extend({
    includes: Z.Marker.PaintUtils,

    initialize:function(geometry) {
        this.geometry = geometry;
    },

    /**
     * 绘制
     * @param  {[type]} layerContainer [description]
     * @param  {[type]} zIndex         [description]
     */
    _paint:function(layerContainer, zIndex, symbol) {        
        if (!this.geometry) {return;}
        this.layerContainer = layerContainer;
        this.setSymbol(symbol);
        var icon = this.getGeoIcon();
        //普通图形标注
        var iconType = icon['type'];
        if (this.geometry.isVectorIcon()) {
            this.paintVectorMarker();
            return;
        }
        var markerGraphic = this.createMarkerDom(icon);
        this.paintDomMarker(markerGraphic,layerContainer);
        this.setZIndex(zIndex);
        if ('text' === iconType) {
            this.fire('_textadded',{});
        }
    },

    /**
     * 重绘图形，一般在地图放大缩小等需要重新计算图形坐标时调用
     * @param layer
     * @param config
     */
    refreshMarker:function() {
        var icon = this.getGeoIcon();//this.geometry.getIcon();
        
        var iconType = icon['type'];
        if ("vector" === iconType) {
            if (!this.vector) {return;}
            var vectorMarker = this.createSVGObj(this.geometry);
            Z.SVG.refreshVector(this.vector, vectorMarker);
        } else {
            if (!this.markerDom) {return;}
            var gCenter = this.getMarkerDomOffset();
            if (!gCenter) {return;}
            this.markerDom.style.left = gCenter[0] + "px";
            this.markerDom.style.top =gCenter[1] + "px";
        }
    },

    refreshMarkerSymbol:function() {
        this._paint(this.layerContainer, this.markerDom.style.zIndex, this.geometry.getSymbol());
    },

    createMarkerDom:function(icon) {
        var iconType = icon['type'];
        this.markerDom = null;
        var geometry = this.geometry;
        if ("picture" === iconType) {
            this.markerDom =  this.createPictureMarker(geometry);
        } else if ("html" === iconType) {
            this.markerDom = this.createHtmlMarker(this.getMarkerDomOffset(),icon["content"]);
        } else if ("text" === iconType) {
            this.markerDom = this.createTextMarker(geometry);
        }
        return this.markerDom;
    },

    paintDomMarker:function(markerGraphic,layerContainer) {
        if (this.markerDom) {
            Z.DomUtil.removeDomNode(this.markerDom);
            delete this.markerDom;
        }       
        if (!layerContainer || !markerGraphic) {return;}
        this.markerDom = markerGraphic;
        layerContainer.appendChild(this.markerDom);
        this.visualSize = {
            'width':this.markerDom.clientWidth,
            'height':this.markerDom.clientHeight
        };
    },

    measureTextMarker:function() {
        return this.visualSize;
    },

    paintVectorMarker:function() {
        var strokeSymbol = this.strokeSymbol,
            fillSymbol = this.fillSymbol;
        //矢量标注绘制        
        var vectorMarker = this.createSVGObj(this.geometry);
        this.drawVector(vectorMarker,strokeSymbol,fillSymbol);
    },


    /**
     * 生成文字标注
     */
    createTextMarker:function() {
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        var iconSymbol = this.getGeoIcon();
        var text = iconSymbol["content"];
        var option = iconSymbol["textStyle"];
        if (Z.Util.isNil(text) || !gCenter) {return null;}
        var cssText = "position:relative;";
        var fontSize = 12;  
        if (option) {
            var cssArr = [];
            if (option["size"] !== null && option['size'] !== undefined) {
                fontSize = option["size"];
            } 
            cssArr.push("font-size:"+fontSize+"px");
            cssArr.push("line-height:"+(fontSize+1)+"px");
            
            if (option["font"]) {
                cssArr.push("font-family:"+option["font"]);
            }
            if (option["fontstyle"]) {
                cssArr.push("font-style:"+option["fontstyle"]);
            }
            if (option["textStrokeWidth"] !== null && option["textStrokeWidth"] !== undefined) {
                cssArr.push("-webkit-text-stroke-width:"+option["textStrokeWidth"]);
            }
            if (option["textStrokeColor"]) {
                cssArr.push("-webkit-text-stroke-color:"+option["textStrokeColor"]);
                if (option["color"]) {
                    cssArr.push("-webkit-text-fill-color:"+option["color"]);
                }
            } else {
                if (option["color"]) {
                    cssArr.push("color:"+option["color"]);
                }
            }
            var p = option["padding"];
            if (p === null || p === undefined) {
                p = 3;
            }
            cssArr.push("padding:"+p+"px");
            var back = option["background"];
            if (back) {         
                cssArr.push("background:"+back);
            }
            var strokeWidth = option["strokewidth"];
            if (strokeWidth) {
                var c = option["stroke"];
                if (!c) {
                    c = "#000000";
                }
                cssArr.push("border:"+strokeWidth+"px solid "+c);
            }
            if (cssArr.length) {
                cssText += cssArr.join(";");
            }
        }
        var custom = Z.DomUtil.createEl("div");
        custom.style.cssText = cssText;
        custom.innerHTML = '<pre style="display:inline;">'+text+'</pre>';
        var me = this;
        function offsetText() {
            var width = custom.offsetWidth;
            var height = custom.offsetHeight;
            var labelOffset = me.computeLabelOffset(width,height,option);
            custom.style.left = labelOffset["x"]+"px";
            custom.style.top = (-labelOffset["y"])+"px";
        }
        this.on('_textadded',function(param) {
            offsetText();
        });
        return this.createHtmlMarker(gCenter, custom);

    },

    /**
     * 生成html标注
     * @param gCenter
     * @returns {___anonymous55461_55471}
     */
    createHtmlMarker:function(gCenter,content) {
        if (!gCenter) {return null;}
        if (content === null || content === undefined) {return null;}
        var _graphicDom = null;
        _graphicDom = Z.DomUtil.createEl("div");
        _graphicDom.setAttribute("unselectable", "on");
        _graphicDom.style.cssText = "top:" + gCenter[1] + "px;left:" + gCenter[0]
            + "px;position: absolute; padding: 0px;-webkit-user-select: none;";
        var custom = content;
        if (Z.Util.isString(custom)) {
            _graphicDom.innerHTML = custom;
        } else {
            _graphicDom.appendChild(custom);
        }
        return _graphicDom;
    },

    /**
     * 生成矢量标注
     * @param gCenter
     * @returns
     */
    createSVGObj:function() {
        // var geometry = this.geometry;
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        // var iconSymbol = geometry.getIcon();
        var iconSymbol = this.getGeoIcon();
        //矢量标注
        var vType = iconSymbol["fontstyle"];
        var radius = iconSymbol["size"];
        if (!radius) {return null;}
        var svgBean = null;
        var v = this.getVectorArray(gCenter);
        if ("circle" === vType) {
            var path = null;
            if (Z.Browser.vml) {
                path ='AL ' + gCenter[0]+','+gCenter[1] + ' ' + radius + ',' + radius + ' 0,' + (65535 * 360) + ' x';
            } else {
                path = 'M'+gCenter[0]+','+gCenter[1]+' a'+radius+','+radius+' 0,1,0,0,-0.9 Z';
            }
            svgBean = {
                    "type" : "path",
                    'path' : path
            };          
        } else if ("triangle" === vType) {          
            svgBean = {
                    "type" : "path",                    
                    "path" : "M"+v[0][0]+","+v[0][1]+" L"+v[1][0]+","+v[1][1]+" L"+v[2][0]+","+v[2][1]+' '+Z.SVG.closeChar
            };
        }  else if ("cross" === vType || "x" === vType || "X" === vType) {
            svgBean = {
                    "type" : "path",                    
                    "path" : "M"+v[0][0]+","+v[0][1]+" L"+v[1][0]+","+v[1][1]+" M"+v[2][0]+","+v[2][1]+" L"+v[3][0]+","+v[3][1]
            };
        } else if ("diamond" === vType || "square" === vType) {
            svgBean = {
                    "type" : "path",                    
                    "path" : "M"+v[0][0]+","+v[0][1]+" L"+v[1][0]+","+v[1][1]+" L"+v[2][0]+","+v[2][1]+" L"+v[3][0]+","+v[3][1]+' '+Z.SVG.closeChar
            };
        } 
        if (Z.Browser.vml && svgBean) {
            svgBean['path'] += ' e';
        }
        return svgBean;
    },
    
    


    /**
     * 生成图片标注
     * @param gCenter
     * @returns {___anonymous51875_51903}
     */
    createPictureMarker:function() {
        var geometry = this.geometry;
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        var _graphicDom = null;
        var iconSymbol = this.getGeoIcon();//geometry.getIcon();
        if (!iconSymbol["url"]) {
            iconSymbol["url"] = geometry.defaultIcon["url"];
        }
        _graphicDom = Z.DomUtil.createEl("span");
        //_graphicDom.geometry = this;
        _graphicDom.setAttribute("unselectable", "on");
        //用gCenter的话，会出现标注图片无法显示的问题，原因未知
        _graphicDom.style.cssText = "top:" + gCenter[1] + "px;left:"+ gCenter[0]+ "px;position: absolute; padding: 0px; margin: 0px; border: 0px; text-align:center;vertical-align:bottom;-webkit-user-select: none;";

        var markerIcon = Z.DomUtil.createEl("img");
        markerIcon.originCss = "border:none; position:absolute;top:0px;left:0px;cursor:pointer;max-width:none;-webkit-user-select: none;";
        if (iconSymbol["width"] !== null && iconSymbol["width"] !== undefined) {
            markerIcon["width"] = parseInt(iconSymbol["width"],0); 
        }
        if (iconSymbol["height"] !== null && iconSymbol["height"] !== undefined) {
            markerIcon["height"] = parseInt(iconSymbol["height"],0); 
        }
        markerIcon.style.cssText = markerIcon.originCss;
        
        markerIcon.setAttribute("unselectable", "on");
    
        // //png透明
        /*markerIcon.onload = function() {
            seegoo.maps.Util.fixPNG(this);
        };*/
        var _this = geometry;
        markerIcon.onerror = function() {
            this.src = _this.defaultIcon["url"];
            
        };
        markerIcon.onabort = function() {
            this.src = markerIcon.src;
        };
        markerIcon.src = iconSymbol["url"];
        //相对地址转化成绝对地址
        iconSymbol["url"] = markerIcon.src;
        
        geometry.markerIcon = markerIcon;
        _graphicDom.appendChild(markerIcon);
        //_graphicDom.style.zIndex = this.zIndex;
        this.setZIndex(geometry,this.zIndex);
        return _graphicDom;
    }
    
});

Z.Vector.SVG = Z.Painter.SVG.extend({
    /**
     * 将容器相对坐标数组转化为svg path定义
     */
    domOffsetsToSVGPath:function(offsets,isClosePath,isHole) {
        if (!offsets || !Z.Util.isArrayHasData(offsets)) {
            return null;
        }
        var seperator=',';
                
        var coords = [];
        //TODO 这里可以做simplify
        
        for ( var i = 0, len = offsets.length; i < len; i++) {                               
            coords.push(offsets[i]['left']+seperator+offsets[i]['top']);
        }
        var ret = null;
        if (!isHole) {
            ret = 'M'+coords.join('L');
            if (isClosePath) {
                ret += Z.SVG.closeChar;
            }
        } else {
            //如果是空洞,则逆时针绘制
            ret = 'M'+coords.reverse().join('L')+Z.SVG.closeChar;
        }
        
        return ret;
    },

    /**
     * 绘制
     * @param  {[type]} layerContainer [description]
     * @param  {[type]} zIndex         [description]
     */
    _paint:function(layerContainer, zIndex, symbol) {
        if (!this.geometry) {return;}
        this.setSymbol(symbol);
        //矢量标注绘制        
        var vObj = this.createSVGObj();
        this.drawVector(vObj,this.strokeSymbol,this.fillSymbol);
    },

    refreshVectorSymbol:function() {
        if (!this.geometry) {
            return;
        }
        var newSymbol = this.geometry.getSymbol();
        this.setSymbol(newSymbol);
        Z.SVG.refreshVectorSymbol(this.vector, this.strokeSymbol, this.fillSymbol);
    }/*,

    registerEvents:function(){
        this.addDomEvents(this.vector);
    }*/
});
Z.Polygon.SVG=Z.Vector.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        var geometry = this.geometry;
        var offsets = geometry.untransformToOffset(geometry.getPrjPoints());
        var pathString = this.domOffsetsToSVGPath(offsets,true,false);
        if (!pathString) {
            return null;
        }
        var holePathes = this.getHolePathes();
        if (Z.Util.isArrayHasData(holePathes)) {
            pathString = pathString + ' ' + holePathes.join(' ');
        }
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            pathString = pathString +' e';
        }
        return {
            type : 'path',
            path : pathString
        };
    },

    /**
     * 生成hole的SVG Path
     * @return {Array} [hole的SVG Path 数组]
     */
    getHolePathes:function() {
        if (!this.geometry || !this.geometry.hasHoles()) {
            return null;
        }
        var geometry=this.geometry;
        var prjHoles = geometry.getPrjHoles();
        var result = [];
        for (var i=0,len=prjHoles.length;i<len;i++) {
            var holeOffset = geometry.untransformToOffset(prjHoles[i]);
            result.push(this.domOffsetsToSVGPath(holeOffset,true,true));
        } 
        return result;
    }
});
Z.Polyline.SVG=Z.Vector.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        var geometry = this.geometry;
        var offsets = geometry.untransformToOffset(geometry.getPrjPoints());
        var pathString = this.domOffsetsToSVGPath(offsets,false,false);
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            pathString = pathString +' e';
        }
        if (!pathString) {
            return null;
        }
        return {
            type : "path",
            path : pathString
        };
    }

   
});
Z.Ellipse.SVG=Z.Polygon.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        
        //'M0 0' : 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360))
        var geometry = this.geometry;
        var domCenter = geometry.getCenterDomOffset();
        var pr = this.getPixelSize();
        var direction = 0;
        var start = (domCenter['left']-pr['px'])+','+domCenter['top'];
        var path = 'M'+start+' a'+pr['px']+','+pr['py']+' 0,1,'+direction+',0,-0.9Z';
        if (Z.Browser.vml) {
            path ='AL ' + start + ' ' + pr['px'] + ',' + pr['py'] + ' 0,' + (65535 * 360) + ' x ';
        }
        var holePathes = this.getHolePathes();
        if (Z.Util.isArrayHasData(holePathes)) {
            path = path + ' ' + holePathes.join(' ');
        }
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            path = path +' e';
        }
        return {
            'type' : 'path',
            'path' : path
        };
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var w = geometry.getWidth(),
            h = geometry.getHeight();
        var map = geometry.getMap();
        return map.distanceToPixel(w/2,h/2);
    }
});
Z.Circle.SVG=Z.Ellipse.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var radius = geometry.getRadius();
        var map = geometry.getMap();
        return map.distanceToPixel(radius,radius);
    }
});
Z.Sector.SVG=Z.Circle.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        /**
         * 计算扇形的svg path定义
         */
        function sector_update(cx, cy, r, startAngle, endAngle) {
            var rad = Math.PI / 180;
            var x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad);
                //变成整数
            x1 = Z.Util.canvasNumber(x1),
            x2 = Z.Util.canvasNumber(x2),
            y1 = Z.Util.canvasNumber(y1),
            y2 = Z.Util.canvasNumber(y2),
            r = (0.5 + r) << 0;
            //notice there is no "roation" variable
            if (startAngle > endAngle) {
                startAngle -= endAngle;
                endAngle = 360;
            }

            if (Z.Browser.svg) {
                 return ["M", cx, cy, "L", x1, y1, "A", r, r, 0, 
            +(endAngle - startAngle > 180), 0, x2, y2, "z"].join(' ');    
            } else if (Z.Browser.vml) {
                return "M "+cx+','+cy+'AE ' + cx+','+cy + ' ' + r + ',' + r + ' '+65535 * startAngle+',' 
                + (65535 * (endAngle-startAngle))+' x e';
                /*return ["M", cx, cy, "AL", cx, cy, r, r, 65535 * startAngle, 
            65535 * endAngle,  'x e'].join(' ');*/
            }
        }
        var geometry = this.geometry;
        var domCenter = geometry.getCenterDomOffset();
        var pr = this.getPixelSize();
        var ret = {
            type : "path",
            path : sector_update(domCenter['left'],domCenter['top'],pr['px'],geometry.getStartAngle(),geometry.getEndAngle())
        };
        return ret;
    }
});
Z.Rectangle.SVG=Z.Polygon.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        var geometry = this.geometry;
        var map = geometry.getMap();         
        var domNw = map.untransformToOffset(geometry.getPNw());
        var pr = this.getPixelSize();        
        var start = domNw['left']+','+domNw['top'];
        var path = 'M'+start+' L'+(domNw['left']+pr['px'])+','+domNw['top']+
            ' L'+(domNw['left']+pr['px'])+','+(domNw['top']+pr['py'])+
            ' L'+domNw['left']+','+(domNw['top']+pr['py'])+
            ' '+Z.SVG.closeChar;        
        var holePathes = this.getHolePathes();
        if (Z.Util.isArrayHasData(holePathes)) {
            path = path + ' ' + holePathes.join(' ');
        }
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            path = path +' e';
        }        
        return {
            'type' : 'path',
            'path' : path
        };
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var w = geometry.getWidth(),
            h = geometry.getHeight();
        var map = geometry.getMap();
        return map.distanceToPixel(w,h);
    }
});
Z.Marker.Canvas = Z.Painter.Canvas.extend({
    includes:Z.Marker.PaintUtils,

    initialize:function(geometry) {
        this.geometry = geometry;
    },    

    /**
     * 绘制图形
     * @param  {[type]} ctx       [Canvas Context]
     * @param  {[type]} resources [图片资源缓存]
     * @return {[type]}           [description]
     */
    doPaint:function(ctx,resources) {
        var geometry = this.geometry;
        if (!geometry) {
            return;
        }
        var map = geometry.getMap();
        if (!map) {
            return;
        }

        var offset = this.getMarkerDomOffset();        
        var pt = map.domOffsetToScreen({'left':offset[0],top:offset[1]});
        var icon = this.getGeoIcon();
        var iconType = (icon?icon['type']:null);
        if ("picture" === iconType) {
            this.paintPictureMarker(ctx, pt, icon,resources); 
        } else if ("text" === iconType) {
            this.paintTextMarker(ctx,pt,false);
        } else if ("vector" === iconType){
            //矢量标注绘制                
            this.paintVectorMarker(ctx, pt, geometry);
        } else {
            this.paintPictureMarker(ctx, pt, geometry.getDefaultSymbol(), resources);
        }
    },

    paintPictureMarker:function(context, pt, icon, resources) {    
        var width = icon["width"];
        var height = icon["height"];
        var url=icon["url"];
        var img = resources.getImage(url);
        icon['url']=img['src'];
        if (width && height) {
            context.drawImage(img,pt.left,pt.top,width,height); 
         } else {
            context.drawImage(img,pt.left,pt.top);
         }
         return pt;
    },

    paintVectorMarker:function(context, pt) {
        //矢量标注
        var options = this.getGeoIcon();
        var vType = options["fontstyle"];
        var radius = options["size"];
        if (!radius) {return null;}
        var v = this.getVectorArray([pt.left,pt.top]);
        context.beginPath();
        if ("circle" === vType) {                   
            context.arc(pt.left,pt.top,radius,0,2*Math.PI);
            context.stroke();
            this.fillGeo(context, this.fillSymbol);
        }  else if ("triangle" === vType || "diamond" === vType || "square" === vType) {            
             context.moveTo(v[0][0],v[0][1]);
             for (var i = 1, len = v.length;i<len;i++) {
                 context.lineTo(v[i][0],v[i][1]); 
             }
             context.closePath();
             context.stroke();
             this.fillGeo(context, this.fillSymbol);
        }  else if ("cross" === vType || "x" === vType || "X" === vType) {
            context.moveTo(v[0][0],v[0][1]);
            context.lineTo(v[1][0],v[1][1]);
            context.moveTo(v[2][0],v[2][1]);
            context.lineTo(v[3][0],v[3][1]);
            context.stroke();
        }               
    },



    paintTextMarker:function(context,pt,isTest) {
        var icon = this.getGeoIcon();
        var geoLabel = icon["content"];
        if (Z.Util.isNil(geoLabel)) {return null;}
         var option = icon["textStyle"];
         var fontSize = 12;
         var cssText = "";  
         var color = "rgba(0,0,0,1)";
         var stroke = null;
         var strokewidth = null;
        if (!option) {
            option = {};
        }
        if (option["fontstyle"]) {
            cssText += option["fontstyle"];
        } else {
            cssText += "normal";
        }
        if (!Z.Util.isNil(option["size"])) {
            fontSize = option["size"];
        }
        cssText += " "+fontSize+"px";
        if (option["font"]) {
            cssText += " "+option["font"];
        } else {
            cssText += " SIMHEI";
        }
        if (option["strokewidth"]) {
            strokewidth = option["strokewidth"];
        }
        if (option["stroke"]) {
            stroke = this.getRgba(option["stroke"],1);
        }
        if (option["color"]) {
             color = this.getRgba(option["color"], 1);
        }
        context.font=cssText;   
        var p = option["padding"];
        if (Z.Util.isNil(p)) {p = 3;}
        var geoLabelLines = geoLabel.split("\n");
        var labelWidth = 0;
        var labelHeight = 0;
        for (var i=0, len=geoLabelLines.length;i<len;i++) {
            var lineHeight = context.measureText(geoLabelLines[i])["width"];
            if (lineHeight > labelWidth) {
                labelWidth = lineHeight;
            }
            labelHeight += (fontSize);
            if (i !== 0) {
                labelHeight += 2;
            }
        }
        //计算偏移量
        var offset = this.computeLabelOffset(labelWidth+2*p,labelHeight+2*p,option);
        if (!isTest) {
            pt = {
                    left: pt.left+offset["x"],
                    top:pt.top-offset["y"]
            };
            context.beginPath();
            context.rect(pt.left, pt.top,labelWidth+2*p,labelHeight+2*p);
            //绘制背景
            var background = option["background"];
            if (background) {
                context.fillStyle =this.getRgba(background);
                context.fill();                 
            }
            var bStrokeWidth = option["strokewidth"];
            if (bStrokeWidth) {
                var bStroke = option["stroke"];
                if (!bStroke) {bStroke = "#000000";}
                context.lineWidth = bStrokeWidth;
                context.strokeStyle = this.getRgba(bStroke,1);
                context.stroke();
            }
            for (var i=0, len=geoLabelLines.length;i<len;i++) {
                //绘制文字
                if (color) {
                    context.fillStyle = color;
                    context.fillText(geoLabelLines[i],pt.left+p,pt.top+p+i*(fontSize+2));
                }
                /**
                TODO 0830 wj注释，上面已经绘制了stroke了，这里不需要了。
                if (stroke) {
                    context.strokeStyle = stroke;
                    if (strokewidth) {
                        context.lineWidth = strokewidth;
                    } else {
                        context.lineWidth=1;
                    }
                    context.strokeText(geoLabelLines[i],pt.left+p,pt.top+p+i*(fontSize+2));
                }*/
            }
            
        } else {
            var moffset = this.getIconOffset();
            return {
                "width":labelWidth,
                "height":labelHeight,
                "offset": {
                    x:offset.x+moffset["left"],
                    y:offset.y-moffset["top"]
                }
            };
        }        
    },

    measureTextMarker:function() {
        var geometry = this.geometry;
        if (!geometry) {
            return null;
        }
        var map = geometry.getMap();
        if (!map) {
            return null;
        }
        var testContext = map.testContext;
        if (!testContext) {
            var testCanvas=Z.DomUtil.createEl("canvas");
            testCanvas.width=10;
            testCanvas.height=10;
            testContext=testCanvas.getContext("2d");
            map.testContext=testContext;          
        }        
        return this.paintTextMarker(testContext,{'left':0,'top':0},true);
    }
});
Z.Vector.Canvas = Z.Painter.Canvas.extend({
    paintPrjPoints:function(context, prjRings, platformOffset) {     
        if (!Z.Util.isArrayHasData(prjRings)) {return;}
        // var map = this.geometry.getMap();
        var offsets = this.geometry.untransformToOffset(prjRings);
        for (var i=0, len=offsets.length;i<len;i++) {
            /*var px = map.untransformToOffset(prjRings[i]);          
             var pt = {
                     left:(0.5 +px['left']+platformOffset['left'])<<0,
                     top:(0.5 +px['top']+platformOffset['top'])<<0
            };*/
            var pt = {
                     left:Z.Util.canvasNumber(offsets[i]['left']+platformOffset['left']),
                     top:Z.Util.canvasNumber(offsets[i]['top']+platformOffset['top'])
            };
             if (i === 0) {
                 context.moveTo(pt['left'],pt['top']);
             } else {
                 context.lineTo(pt['left'],pt['top']);
             }
        }
    }
});
Z.Polyline.Canvas = Z.Vector.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var points = geometry.getPrjPoints();
        context.beginPath();  
        this.paintPrjPoints(context,points,platformOffset);
        context.stroke();
    }
});
Z.Polygon.Canvas = Z.Vector.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var points = geometry.getPrjPoints();
        context.beginPath();  
        this.paintPrjPoints(context,points,platformOffset);
        context.closePath();
        context.stroke();
        this.fillGeo(context, this.fillSymbol);        
    }
});
Z.Ellipse.Canvas = Z.Polygon.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var center = geometry.getCenterDomOffset();
        var pt = {
             left:center["left"]+platformOffset['left'],
             top:center["top"]+platformOffset['top']
        };
        var pr = this.getPixelSize();
        var width = pr['px'];
        var height = pr['py'];
        this.BezierEllipse(context,pt['left'],pt['top'],width,height);
        // this.drawHoles(context,tileNw,geometry);
        
        this.fillGeo(context, this.fillSymbol);        
    },

    BezierEllipse:function(ctx, x, y, a, b)
    {
       var k = 0.5522848,
       ox = a * k, // 水平控制点偏移量
       oy = b * k; // 垂直控制点偏移量
        ctx.beginPath();
       
       //从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
       ctx.moveTo(x - a, y);
       ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
       ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
       ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
       ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
       ctx.closePath();
       ctx.stroke();

    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var w = geometry.getWidth(),
            h = geometry.getHeight();
        var map = geometry.getMap();
        return map.distanceToPixel(w/2,h/2);
    }
});
Z.Circle.Canvas = Z.Ellipse.Canvas.extend({

    getPixelSize:function() {
        var geometry = this.geometry;
        var radius = geometry.getRadius();
        var map = geometry.getMap();
        return map.distanceToPixel(radius,radius);
    }
});
Z.Rectangle.Canvas = Z.Polygon.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var map = geometry.getMap();
        var nw = map.untransformToOffset(geometry.getPNw());
        var pixelSize = this.getPixelSize();

        var pt = {
             left:nw["left"]+platformOffset['left'],
             top:nw["top"]+platformOffset['top']
        };
        context.beginPath();  
        context.rect(Z.Util.canvasNumber(pt.left), Z.Util.canvasNumber(pt.top),Z.Util.canvasNumber(pixelSize['px']),Z.Util.canvasNumber(pixelSize['py']));
        // this.drawHoles(context,tileNw,geometry);        
        context.stroke();
        this.fillGeo(context, this.fillSymbol);        
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var w = geometry.getWidth(),
            h = geometry.getHeight();
        var map = geometry.getMap();
        return map.distanceToPixel(w,h);
    }
});
Z.Sector.Canvas = Z.Polygon.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var center = geometry.getCenterDomOffset();
        var pt = {
             left:center["left"]+platformOffset['left'],
             top:center["top"]+platformOffset['top']
        };        
        var pr = this.getPixelSize();
        this.sector(context, pt['left'],pt['top'],pr['px'],geometry.getStartAngle(),geometry.getEndAngle());
        context.stroke();
        this.fillGeo(context, geometry.getFillSymbol());    
        
    },

    sector:function(ctx, x, y, radius, startAngle, endAngle) {
        var rad = Math.PI / 180;
        var sDeg = rad*-endAngle;
        var eDeg = rad*-startAngle;
        // 初始保存
        ctx.save();
        // 位移到目标点
        ctx.translate(x, y);
        ctx.beginPath();
        // 画出圆弧
        ctx.arc(0,0,radius,sDeg, eDeg);
        // 再次保存以备旋转
        ctx.save();
        // 旋转至起始角度
        ctx.rotate(eDeg);
        // 移动到终点，准备连接终点与圆心
        //ctx.moveTo(radius,0);
        // 连接到圆心
        ctx.lineTo(0,0);
        // 还原
        ctx.restore();
        // 旋转至起点角度
        ctx.rotate(sDeg);
        // 从圆心连接到起点
        ctx.lineTo(radius,0);
        ctx.closePath();
        ctx.restore();
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var r = geometry.getRadius();
        var map = geometry.getMap();
        return map.distanceToPixel(r,r);
    }
});
Z.GeometryCollection.Painter=Z.Painter.extend({
    initialize:function(geometry) {
        this.geometry = geometry;        
    },

    _paint:function() {
        if (!this.geometry) {
            return;
        }
        var symbol = this.geometry.getSymbol();     
        //将collection的symbol放到末尾,覆盖painter原有的symbol
        Array.prototype.push.call(arguments, symbol);
        
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i].getPainter();
            if (painter) {painter.paint.apply(painter,arguments);}
        }
    },

    remove:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i].getPainter();
            if (painter) {painter.remove.apply(painter,arguments);}
        }
    },

    setZIndex:function(change) {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i].getPainter();
            if (painter) {painter.setZIndex.apply(painter,arguments);}
        }
    },

    show:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i].getPainter();
            if (painter) {painter.show.apply(painter,arguments);}
        }
    },

    hide:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i].getPainter();
            if (painter) {painter.hide.apply(painter,arguments);}
        }
    },

    refresh:function(){
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i].getPainter();
            painter.setSymbol(this.geometry.getSymbol());
            if (painter) {painter.refresh.apply(painter,arguments);}
        }
    },

    refreshSymbol:function(){
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i].getPainter();
            painter.setSymbol(this.geometry.getSymbol());
            if (painter) {painter.refreshSymbol.apply(painter,arguments);}
        }
    },

    registerEvents:function() {
        //TODO GeometryCollection类型数据的处理
    }
});
Z.Editor=Z.Class.extend({
    includes: [Z.Eventable],

    initialize:function(geometry,opts) {
        this.geometry = geometry;
        if (!this.geometry) {return;}
        //Z.Util.extend(this, opts);
        this.opts = opts;
        if (!this.opts) {
            this.opts = {};
        }
    },

    prepare:function() {
        var map=this.geometry.getMap();
        if (!map) {return;}
        this.map=map;
        this.geoType = this.geometry.getType();
        if (!map.panels.editorContainer) {    
            var editorContainer = Z.DomUtil.createEl("div");
            //editorContainer.id = "editorContainer";
            editorContainer.style.cssText="position:absolute;top:0px;left:0px;z-index:2000;";
            map.panels.mapPlatform.appendChild(editorContainer);
            map.panels.editorContainer = editorContainer;
        }
        
        this.container = map.panels.editorContainer;
        //保存原有的Symbol
        /**
         * 保存原有的symbol
         */
        if (this.opts['symbol']) {
            this.originalSymbol=this.geometry.getSymbol();
            this.geometry.setSymbol(this.opts['symbol']);    
        }
        
        this.editHandlers = [];

        map.bind("zoomend",this.onRefreshEnd,this);
        map.bind("zoomstart",this.onRefreshStart,this);
        map.bind('moveend',this.onRefreshEnd,this);
        map.bind("resize",this.onRefreshEnd,this);
    },

    /**
     * 开始编辑     
     */
    start:function() {        
        if (!this.geometry || !this.geometry.getMap() || this.geometry.editing) {return;}
        this.prepare();
        var geometry = this.geometry;
        if (geometry instanceof Z.Marker) {
            this.createMarkerEditor();
            return;
        } else if (geometry instanceof Z.Circle) {
            this.createCircleEditor();
        } else if (geometry instanceof Z.Rectangle) {
            this.createRectEditor();
        } else if (geometry instanceof Z.Ellipse) {
            this.createEllipseEditor();
        } else if (geometry instanceof Z.Polygon || geometry instanceof Z.Polyline){
            this.createPolygonEditor();
        }
        this.editing = true;
    },

    /**
     * 结束编辑
     * @return {[type]} [description]
     */
    stop:function() {
        this.editing = false;
        var map = this.map;
        if (!map || !this.geometry) {
            return;
        }
        map.off('zoomend', this.onRefreshEnd,this);
        map.off('zoomstart', this.onRefreshStart,this);
        map.off('resize', this.onRefreshEnd,this);
        for (var i=0,len=this.editHandlers.length;i<len;i++) {
            Z.DomUtil.removeDomNode(this.editHandlers[i]);
        }
        this.editHandlers=[];

        if (this.opts['symbol']) {
            this.geometry.setSymbol(this.originalSymbol);
            delete this.originalSymbol;
        }
    },

    isEditing:function() {
        if (Z.Util.isNil(this.editing)) {
            return false;
        }
        return this.editing;
    },

    fireEditEvent:function(eventName) {
        if (!this.geometry) {
            return;
        }
        this.geometry.fire(eventName,{"target":this.geometry});
    },

    createHandleDom:function(pixel,opts) {
        if (!opts) {
            opts = {};
        }
        var handle = Z.DomUtil.createEl("div");
        var cursorStyle = opts['cursor'];
        if (!cursorStyle) {
            cursorStyle = 'move';
        }
        handle.style.cssText="display:block;position: absolute; top:"+
            (pixel.top-5)+"px;left:"+(pixel.left-5)+"px;cursor:"+cursorStyle+";";
        handle.innerHTML='<div title="'+opts.tip+'" style="display:block;width:11px;height:11px;background:url('+Z.host+'/engine/images/dd-via.png) 0px 0px no-repeat;"></div>';
        return handle;
    },

    createHandle:function(pixel, opts) {
        if (!opts) {
            opts = {tip:''};
        }
        var handle = this.createHandleDom(pixel,opts);
        var containerDOM = this.map.containerDOM;
        Z.DomUtil.addDomEvent(handle,'mousedown',function(event) {
                            var editor = this;
                            if (opts.onDown) {
                                opts.onDown.call(editor);
                            }
                            //鼠标拖动操作
                            document.onmouseup = function(ev) {
                                ev  = ev || window.event;
                                document.onmousemove=null;
                                document.onmouseup=null;
                                Z.DomUtil.stopPropagation(ev);
                                if (opts.onUp) {
                                    opts.onUp.call(editor);
                                }
                                return false;
                            };
                            document.onmousemove = function(ev){
                                ev  = ev || window.event;
                                editor.hideContext();
                                var mousePos = Z.DomUtil.getEventDomCoordinate(ev,containerDOM);        
                                var handleDomOffset = editor.map.screenToDomOffset(mousePos);
                                handle.style['top']=(handleDomOffset.top-5)+"px";
                                handle.style['left']=(handleDomOffset.left-5)+"px";                                
                                Z.DomUtil.stopPropagation(ev);
                                if (opts.onMove) {
                                    opts.onMove.call(editor,handleDomOffset);
                                }
                                return false;
                            };
                            Z.DomUtil.stopPropagation(event);
                            
                            return false;
                        },this);
        //拖动移图
        this.appendHandler(handle,opts);

        return handle;
    },

    /**
     * 创建中心点编辑
     * @return {[type]} [description]
     */
    createCenterEditor:function(opts){
        if (!opts) {
            opts = {};
        } 
        var geometry = this.geometry;
        var map = this.map; 
        var pxCenter = map.untransformToOffset(geometry.getPCenter());
        //------------------------拖动标注--------------------------
        this.createHandle(pxCenter, {
                        tip:"拖动以移动图形",
                        onDown:function() {
                            if (opts.onDown) {
                                opts.onDown.call(this);
                            }
                        },
                        onMove:function(handleDomOffset) {
                            var pcenter = map.transformFromOffset(handleDomOffset);
                            geometry.setPCenter(pcenter);
                            geometry.updateCache();
                            if (opts.onMove) {
                                opts.onMove.call(this);
                            }
                            this.fireEditEvent('positionchanging');
                        },
                        onUp:function() {
                            if (opts.onUp) {
                                opts.onUp.call(this);
                            }
                            // geometry.fire("positionchanged",{"target":geometry});
                            this.fireEditEvent('positionchanged');
                        },
                        onRefresh:function() {
                            return map.untransformToOffset(geometry.getPCenter());
                        }
                    });
        
    },
    /**
     * 标注和自定义标注编辑器
     */
    createMarkerEditor:function() {
        this.createCenterEditor();
    },

    /**
     * 圆形编辑器
     * @return {[type]} [description]
     */
    createCircleEditor:function() {
        var geometry = this.geometry;
        var map = this.map; 
        function radiusHandleOffset() {
            var pxCenter = map.untransformToOffset(geometry.getPCenter());
            var r = geometry.getRadius();
            var p = map.distanceToPixel(r,0);
            var rPx={'left':pxCenter['left']+p['px'],'top':pxCenter['top']};
            return rPx;
        }       
        var rPx = radiusHandleOffset();
        var radiusHandle = this.createHandle(rPx, {
                                tip:"拖动以调整圆形半径",
                                onMove:function(handleDomOffset) {
                                    var pxCenter = map.untransformToOffset(geometry.getPCenter());
                                    var rPx = handleDomOffset['left']-pxCenter['left'];
                                    var rPy = handleDomOffset['top']-pxCenter['top'];
                                    //if (rPx >= 0 && rPy >= 0) {
                                    var r = map.pixelToDistance(Math.abs(rPx), Math.abs(rPy));
                                    geometry.setRadius(r);
                                    //}
                                    this.fireEditEvent('shapechanging');
                                },
                                onUp:function() {
                                    this.fireEditEvent('shapechanged');                                    
                                },
                                onRefresh:function() {
                                    return radiusHandleOffset();
                                }
                            });
         this.createCenterEditor({
            onDown:function() {
                radiusHandle.style.display='none';
            },
            onUp:function() {
                var rPx = radiusHandleOffset();
                radiusHandle.style.top=(rPx['top']-5)+"px";
                radiusHandle.style.left=(rPx['left']-5)+"px";
                radiusHandle.style.display="";      
            }
        });
    },

    /**
     * 椭圆编辑器
     * @return {[type]} [description]
     */
    createEllipseEditor:function() {
        var geometry = this.geometry;
        var map = this.map; 
        function radiusHandleOffset() {
            var pxCenter = map.untransformToOffset(geometry.getPCenter());
            var rx = Math.round(geometry.getWidth()/2);
            var rh = Math.round(geometry.getHeight()/2);
            var p = map.distanceToPixel(rx,rh);
            var rPx={'left':pxCenter['left']+p['px'],'top':pxCenter['top']+p['py']};
            return rPx;
        }
        //this.createCenterEditor();
        var rPx = radiusHandleOffset();
        var rHandle = this.createHandle(rPx, {
                                tip:"拖动以调整椭圆大小",
                                onMove:function(handleDomOffset) {
                                    var pxCenter = map.untransformToOffset(geometry.getPCenter());
                                    var rxPx = handleDomOffset.left-pxCenter.left;
                                    var ryPx = handleDomOffset.top-pxCenter.top;          
                                    if (rxPx >= 0 && ryPx>=0) {
                                        var w = map.pixelToDistance(Math.abs(rxPx), 0);
                                        var h = map.pixelToDistance(0,Math.abs(ryPx));
                                        geometry.setWidth(w*2);
                                        geometry.setHeight(h*2);
                                    }                                   
                                    this.fireEditEvent('shapechanging');
                                    // geometry.fire("shapechanging",{"target":geometry});
                                },
                                onUp:function() {
                                    this.fireEditEvent('shapechanged');
                                    // geometry.fire("shapechanged",{"target":geometry});
                                },
                                onRefresh:function() {
                                    return radiusHandleOffset();
                                }
                            });
        this.createCenterEditor({
            onDown:function() {
                rHandle.style.display='none';
            },
            onUp:function() {
                var rPx = radiusHandleOffset();
                rHandle.style.top=(rPx['top']-5)+"px";
                rHandle.style.left=(rPx['left']-5)+"px";
                rHandle.style.display="";      
            }
        });
    },
    /**
     * 矩形编辑器
     * @return {[type]} [description]
     */
    createRectEditor:function() {
        var geometry = this.geometry;
        var map = this.map; 
        function radiusHandleOffset() {
            var pxNw = map.untransformToOffset(geometry.getPNw());
            var rw = Math.round(geometry.getWidth());
            var rh = Math.round(geometry.getHeight());
            var p = map.distanceToPixel(rw,rh);
            var rPx={'left':pxNw['left']+p['px'],'top':pxNw['top']+p['py']};
            return rPx;
        }                

        var rPx = radiusHandleOffset();
        var rHandle = this.createHandle(rPx, {
                                tip:"拖动以调整矩形大小",
                                onMove:function(handleDomOffset) {
                                    var pxNw = map.untransformToOffset(geometry.getPNw());
                                    var rxPx = handleDomOffset['left']-pxNw['left'];
                                    var ryPx = handleDomOffset['top']-pxNw['top'];          
                                    if (rxPx >= 0 && ryPx>=0) {
                                        var w = map.pixelToDistance(Math.abs(rxPx), 0);
                                        var h = map.pixelToDistance(0,Math.abs(ryPx));
                                        geometry.setWidth(w);
                                        geometry.setHeight(h);
                                    }
                                    this.fireEditEvent('shapechanging');
                                    //geometry.fire("shapechanging",{"target":geometry});
                                },
                                onUp:function() {
                                    this.fireEditEvent('shapechanged');
                                    // geometry.fire("shapechanged",{"target":geometry});
                                    //geometry.fire("shapechanged",{"target":geometry});
                                },
                                onRefresh:function() {
                                    return radiusHandleOffset();
                                }
                            });
        var pxNw = map.untransformToOffset(geometry.getPNw());
        //------------------------拖动标注--------------------------
        this.createHandle(pxNw, {
            tip:"拖动以移动图形",
            onDown:function() {
                rHandle.style.display='none';
            },
            onMove:function(handleDomOffset) {
                var pnw = map.transformFromOffset(handleDomOffset);
                geometry.setPNw(pnw);
                geometry.updateCache();            
                this.fireEditEvent('positionchanging');
                // geometry.fire("positionchanging",{"target":geometry});
            },
            onUp:function() {
                var rPx = radiusHandleOffset();
                rHandle.style.top=(rPx['top']-5)+"px";
                rHandle.style.left=(rPx['left']-5)+"px";
                rHandle.style.display="";    
                this.fireEditEvent('positionchanged');
                // geometry.fire("positionchanged",{"target":geometry});
            },
            onRefresh:function() {
                return map.untransformToOffset(geometry.getPNw());
            }
        });
    },

    /**
     * 多边形和多折线的编辑器
     * @return {[type]} [description]
     */
    createPolygonEditor:function() {
        var geometry = this.geometry;
        var map = geometry.getMap();
        var vertexHandles = [];
        var closeHandle = null;
        var centerHandle = null;
        var tmpHandle = null;
        var title = ((geometry instanceof Z.Polygon)?'多边形':'多折线');
        function getLonlats() {
            return geometry.getPrjPoints();
        }        
        function createVertexHandle(vertex) {
            //vertex是个引用
            var pxVertex = map.untransformToOffset(vertex);
            //------------------------拖动标注--------------------------
            var handle = this.createHandle(pxVertex, {
                            tip:"拖动以调整"+title+"顶点",
                            onMove:function(handleDomOffset) {
                                hideCloseHandle();
                                var nVertex = map.transformFromOffset(handleDomOffset);
                                vertex.x = nVertex.x;
                                vertex.y = nVertex.y;
                                geometry.updateCache();
                                geometry.onShapeChanged();
                                this.fireEditEvent('shapechanging');
                                // geometry.fire("shapechanging",{"target":geometry});
                                // geometry.fire("shapechanging",{"target":geometry});
                            },
                            onUp:function() {
                                this.fireEditEvent('shapechanged');
                                this.refreshHandles([centerHandle]);
                                // geometry.fire("shapechanged",{"target":geometry});
                                // geometry.fire("shapechanged",{"targetmouseover":geometry});
                            },
                            onRefresh:function() {
                                return map.untransformToOffset(vertex);
                            }
                        });
            Z.DomUtil.addDomEvent(handle,'mouseover',function(event){
                                        closeHandle.style.top = (parseInt(handle.style.top)-2)+"px";
                                        closeHandle.style.left = (parseInt(handle.style.left)+12)+"px";
                                        closeHandle.style.display="block";
                                        closeHandle["source"] = handle;
                                    },this);
            return handle;
        }
        function hideCloseHandle() {
            closeHandle.style.display="none";
            //closeHandle.style.top="-999999px";
            //closeHandle["source"] = null;
            //closeHandle.style.top="-999999px";
        }
        function createRemoveHandle() {
            closeHandle = Z.DomUtil.createEl("div"); 
            closeHandle.style.cssText="display:none;position: absolute; cursor: pointer;top:-9999px;left:0px;";
            closeHandle.innerHTML="<div title=\"点击删除端点\" style=\"display:block;width:14px;height:14px;background:url("+Z.host+"/engine/images/close.gif) 0px 0px no-repeat;\"></div>";
            Z.DomUtil.addDomEvent(closeHandle,'click',function(ev) {
                var ringhandle = closeHandle["source"];
                hideCloseHandle();
                if (!ringhandle) {
                    Z.DomUtil.stopPropagation(ev);
                    return false;
                }
                var hit = Z.Util.searchInArray(ringhandle, vertexHandles);
                /*var hit = -1;
                for (var i=0,len=vertexHandles.length;i<len;i++) {
                    if (vertexHandles[i] == ringhandle) {
                        hit = i;
                        break;
                    }
                }*/
                if (hit < 0) {
                    Z.DomUtil.stopPropagation(ev);
                    return false;
                }
                var lonlats = getLonlats();
                lonlats.splice(hit,1);
                vertexHandles.splice(hit,1);

                Z.DomUtil.removeDomNode(ringhandle);
                geometry.updateCache();
                geometry.onShapeChanged();
                if (centerHandle) {
                    this.refreshHandles([centerHandle]);
                }
                this.fireEditEvent('shapechanged');
                // geometry.fire("shangechanged",{"target":geometry});
                Z.DomUtil.stopPropagation(ev);
                return false;
            },this);
            Z.DomUtil.addDomEvent(closeHandle,'mouseout',function(ev) {
                hideCloseHandle();
                closeHandle["source"] = null;
                Z.DomUtil.stopPropagation(ev);
                return false;
            },this);
            this.appendHandler(closeHandle,{onRefresh:function(){hideCloseHandle();}});
        }
        function computePxCenter() {
            var center = geometry.getCenter();
            var pcenter = map.getProjection().project(center);
            return map.untransformToOffset(pcenter);
        }
        function createCenterHandle() {
            centerHandle = this.createHandle(computePxCenter(), {
                            tip:"拖动以移动"+title,
                            onDown:function() {
                                hideCloseHandle();
                                for (var i=0,len=vertexHandles.length;i<len;i++) {
                                    vertexHandles[i].style.display = "none";
                                }
                            },
                            onMove:function(handleDomOffset) {
                                var pxCenter = computePxCenter();
                                var dragged = {
                                    'left': handleDomOffset['left']+5-pxCenter['left'],
                                    'top' : handleDomOffset['top']+5-pxCenter['top']
                                };
                                //TODO 移动vertex,重新赋值points
                                var lonlats = getLonlats();
                                for (var i=0,len=lonlats.length;i<len;i++) {
                                    var vo = map.untransformToOffset(lonlats[i]);
                                    var n = map.transformFromOffset({'left':vo['left']+dragged['left'], 'top':vo['top']+dragged['top']});
                                    lonlats[i].x = n.x;
                                    lonlats[i].y = n.y;
                                }
                                geometry.updateCache();
                                geometry.onPositionChanged();
                                this.fireEditEvent('positionchanging');
                                // geometry.fire("positionchanging",{"target":geometry});
                            },
                            onUp:function() {
                                this.refreshHandles(vertexHandles);
                                for (var i=0,len=vertexHandles.length;i<len;i++) {
                                    vertexHandles[i].style.display = "";
                                }
                                this.fireEditEvent('positionchanged');
                                // geometry.fire("positionchanged",{"target":geometry});
                            },
                            onRefresh:function() {
                                return computePxCenter();
                            }
                        });
        }
        function isPointOverlapped(p1,p2,tolerance) {
            if (!p1 || !p2) {
                return false;
            }
            var t = (tolerance?Math.abs(tolerance):0);
            if (Math.abs(p1.x-p2.x) <= t && Math.abs(p1.y-p2.y) <= t) {
                return true;
            }
            return false;
        }
        var lonlats = getLonlats();
        for (var i=0,len=lonlats.length;i<len;i++){
            vertexHandles.push(createVertexHandle.call(this,lonlats[i]));
        }
        createCenterHandle.call(this);        
        createRemoveHandle.call(this);
        tmpHandle = this.createHandleDom({'left':0,'top':0},{
                            tip:'点击后增加节点',
                            cursor:'pointer'
                        });
        tmpHandle.style.display='none';
        var pxTolerance = 2;
        Z.DomUtil.addDomEvent(tmpHandle,'click',function(event) {
                            //临时编辑按钮的点击
                            var handleDomOffset = Z.DomUtil.offsetDom(tmpHandle);
                            var res = map.getLodConfig()['resolutions'][map.getZoomLevel()];
                            var plonlat = map.transformFromOffset({'left':handleDomOffset['left']+5,'top':handleDomOffset['top']+5});
                            var interIndex = Z.GeoUtils._isPointOnPath(plonlat, geometry, pxTolerance*res);
                            if (interIndex >= 0) {
                                vertexHandles.splice(interIndex+1,0,createVertexHandle.call(this,plonlat));
                                lonlats.splice(interIndex+1,0,plonlat);
                                geometry.setPrjPoints(lonlats);
                                geometry.updateCache();
                                this.fireEditEvent('shapechanged');
                            }
                        },this);
        
        Z.DomUtil.addDomEvent(map.containerDOM,'mousemove',function(event) {
                        var res = map.getLodConfig()['resolutions'][map.getZoomLevel()];
                        var eventOffset = Z.DomUtil.getEventDomCoordinate(event,map.containerDOM);
                        var plonlat = map.transform(eventOffset);
                        var tolerance = pxTolerance*res; 
                        var interIndex = Z.GeoUtils._isPointOnPath(plonlat, geometry,tolerance);
                        var prjPoints = geometry.getPrjPoints();
                        //不与端点重叠,如果重叠则不显示
                        if (interIndex >= 0 && !isPointOverlapped(plonlat,prjPoints[interIndex],tolerance) && !isPointOverlapped(plonlat,prjPoints[interIndex+1],tolerance)) {
                            var domOffset = map.screenToDomOffset(eventOffset);
                            tmpHandle.style.left = (domOffset['left']-5)+'px';
                            tmpHandle.style.top = (domOffset['top']-5)+'px';
                            tmpHandle.style.display="";
                        } else {
                            tmpHandle.style.display="none";
                        }
                    }, this);
        this.appendHandler(tmpHandle,{onRefresh:function(){tmpHandle.style.display='none';return null;}});

    },

    /**
     * refresh开始前逻辑
     */
    onRefreshStart:function() {
        this.container.style.display="none";
    },

    /**
     * refesh及refresh之后的逻辑
     */
    onRefreshEnd:function() {
        this.refresh();
        this.container.style.display="";
    },

    refresh:function() {
        //TODO 更新手点的位置
        if (!this.editHandlers) {
            return;
        }
        this.refreshHandles(this.editHandlers);
    },

    refreshHandles:function(handles) {
        if (!handles) {
            return;
        }
        for (var i=0,len=handles.length;i<len;i++) {
            if (handles[i] && handles[i].onRefresh) {
                var offset = handles[i].onRefresh();
                if (offset) {
                    handles[i].style.left = (offset['left']-5)+'px';
                    handles[i].style.top = (offset['top']-5)+'px';    
                }
            }
        }
    },

    hideContext:function() {
        if (this.geometry) {
            this.geometry.closeMenu();
            this.geometry.closeInfoWindow();
        }
    },

    appendHandler:function(handle,opts){
        if (!handle) {
            return;
        }        
        if (!this.editHandlers) {
            this.editHandlers = [];
        }
        handle.onRefresh = opts.onRefresh;
        this.editHandlers.push(handle);
        this.container.appendChild(handle);
    },

    removeHandler:function(handle) {
        if (this.editHandlers) {
            var hit = -1;
            for (var i=0,len=this.editHandlers.length;i<len;i++){
                if (this.editHandlers[i] == handle) {
                    hit = i;
                    break;
                }
            }
            if (hit > 0) {
                this.editHandlers.splice(hit,1);
            }
        }
        if (handle) {
            Z.DomUtil.removeDomNode(handle);
        }
    }

});
Z.MapExt = {};
Z.MapExt.Pan={
    
    /**
     * 将地图移动到指定的坐标
     * @param  {Coordinate} coordinate 指定的坐标
     * @export
     */
    panTo:function(coordinate) {
        if (!Z.Util.isCoordinate(coordinate)) {
            return;
        }
        var projection = this.getProjection();
        var p = projection.project(coordinate);
        var span = this.getPixelDistance(p);
        this.panBy(span);
        return this;
    },

    /**
     * 按指定的像素距离移动地图
     * @param  {Point} point [description]
     * @export
     */
    panBy:function(offset) {
        this.offsetPlatform({'left':offset['left'],'top':offset['top']});
        this.offsetCenterByPixel({'left':-offset['left'],'top':-offset['top']});
        this.fireEvent('moving');
        this.onMoveEnd({'target':this});
        return this;
    },

    animatePan:function(moveOffset) {
        if (!moveOffset) {moveOffset = {'left':0, 'top':0};}
        if (!moveOffset['left']) {
            moveOffset['left'] = 0;
        }
        if (!moveOffset['top']) {
            moveOffset['top'] = 0;   
        }
        var xfactor = moveOffset["left"] >= 0 ? 1 : -1;
        var yfactor = moveOffset["top"] >= 0 ? 1 : -1;
        // 求每次移动距离的等差数列
        var xSum = Math.abs(moveOffset["left"]);
        var ySum = Math.abs(moveOffset["top"]);
        var lastx = Math.ceil(xSum / 10 - 1);
        var lasty = Math.ceil(ySum / 10 - 1);
        var xd = (lastx - 1) / 19;
        if (xd <= 0) {
            xd = 1;
        }
        var yd = (lasty - 1) / 19;
        if (yd <= 0) {
            yd = 1;
        }
        
        // 移动距离在这个数组里记录下来
        var spanArr = [];
        var currX = 1, currY = 1;
        var spanCounter = 0;
        var spanX=0,spanY=0;
        while (true) {
            // 等差计算移动距离
            currX = lastx - spanCounter * xd;
            currY = lasty - spanCounter * yd;       
            if (currX < 0 || spanX>xSum) {
                currX = 0;
            }
            if (currY < 0 || spanY>ySum) {
                currY = 0;
            }
            if (currX <= 0 && currY <= 0) {
                break;
            }
            spanArr.push( {
                x : Math.round(currX) * xfactor,
                y : Math.round(currY) * yfactor
            });
            spanCounter++;
            spanX+=currX;
            spanY+=currY;
        }
        var counterLimit = spanArr.length;
    //  console.log(spanArr);
        var _map = this;
        // var pxTop = 0;
        // var pxLeft = 0;
        var counter = 0;
        //var isAnimeSupported = !seegoo.maps.config.browser.mobile && !(seegoo.maps.config.browser.ie && document.documentMode < 9);
        if (_map.dynLayerSlideTimeout) {
            clearTimeout(_map.dynLayerSlideTimeout);
        }
        _map.isBusy = true;
        var _this=this;
        slideMap(); 
        
        function slideMap() {
            if (!Z.Util.isArrayHasData(spanArr)) {
                return;
            }
            if (!_map.allowSlideMap) {
                _map.allowSlideMap = true;
                _map.onMoveEnd({'target':_map});
                return;
            }
            var ySpan = spanArr[counter].y;
            var xSpan = spanArr[counter].x;
            _map.offsetPlatform({'left':xSpan,'top':ySpan});
            _map.offsetCenterByPixel({'left':-xSpan,'top':-ySpan});
            counter++;
            // 每移动3次draw一次
            if (counter <= counterLimit - 1) {
                if (counter % 3 === 0) {
                    if (!Z.Browser.ie6) {
                       // _map.fire('moving',{'target':_map});
                       _map.onMoving({'target':_map});
                    }
                }
                setTimeout(slideMap, 8 + counter);
            } else {
                // 用setTimeout方式调用解决了地图滑动结束时，如果添加有动态图层，或者canvasLayer上有大量数据时，地图会发生顿卡现象的问题
                _map.dynLayerSlideTimeout = setTimeout(function() {
                    //_map._drawTileLayers();
                     _map.onMoveEnd({'target':_map});
                    _map.isBusy = false;
                },50);                      
                
            }
            
        }
    }

};

Z.MapExt.Zoom={
    onZoomStart:function(scale,focusPos,nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer.onZoomStart) {
                layer.onZoomStart();    
            }
        }
        var me = this;
        
        if (me.baseTileLayer) {me.baseTileLayer.onZoomStart(true);}
        me.eachLayer(zoomLayer,me.getAllLayers());
        this.hideOverlayLayers();
        me.animateStart(scale,focusPos);
        me.fireEvent('zoomstart',{'target':this});
    },

    onZoomEnd:function(nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer.onZoomEnd) {
                layer.onZoomEnd();
            }
        }
        
        this.insertBackgroundDom();
        if (this.baseTileLayer) {this.baseTileLayer.clear();}
        this.animateEnd();
        this.resetContainer();
        this.originZoomLevel=nextZoomLevel;     
        if (this.baseTileLayer) {this.baseTileLayer.onZoomEnd();}
        this.eachLayer(zoomLayer,this.getAllLayers());
        this.showOverlayLayers();
        this.fireEvent('zoomend',{'target':this});
    },

    resetContainer:function() {
        var position = this.offsetPlatform();
        Z.DomUtil.offsetDom(this.panels.mapPlatform,{'left':0,'top':0});
        this.refreshSVGPaper();
        if (this.backgroundDOM) {
            //Z.DomUtil.offsetDom(this.backgroundDOM,position);
            this.backgroundDOM.style.left=position["left"]+"px";
            this.backgroundDOM.style.top=position["top"]+"px";
        }
    },

    insertBackgroundDom:function() {
        this.backgroundDOM = this.panels.mapContainer.cloneNode(true);
        this.panels.mapPlatform.insertBefore(this.backgroundDOM,this.panels.mapViewPort);
    },

    checkZoomLevel:function(nextZoomLevel) {
        if (nextZoomLevel < this.minZoomLevel){
            nextZoomLevel = this.minZoomLevel;
        }
        if (nextZoomLevel > this.maxZoomLevel) {
            nextZoomLevel = this.maxZoomLevel;
        }
        return nextZoomLevel;
    },

    zoomOnDblClick:function(param) {
        var me = this;
        if (!me.options['enableZoom'])  {return;}
        function zoomLayer(layer) {
            if (layer) {
                layer.onZoomEnd();
            }
        }
        var mousePos = param['pixel'];
        var nextZoomLevel = me.checkZoomLevel(me.zoomLevel+1);
        if (nextZoomLevel === me.zoomLevel) {
            var move = {
                'top':(mousePos['top']-me.height/2)/2,
                'left':(me.width/2-mousePos['left'])/2
                };
            me.offsetCenterByPixel(move);
            me.offsetPlatform(move);
            
            if (me.baseTileLayer) {me.baseTileLayer.onZoomEnd();}
            me.eachLayer(zoomLayer,me.getAllLayers());
            return;
        }
        me.zoom(nextZoomLevel, param['pixel']);
    },

    zoom:function(nextZoomLevel, focusPos) {
        if (!this.options['enableZoom']) {return;}
        this.allowSlideMap=false;
        nextZoomLevel = this.checkZoomLevel(nextZoomLevel);
        if (this.originZoomLevel === nextZoomLevel) {
            return;
        }
        this.zooming = true;
        if (!focusPos) {
            focusPos = {
                'top':this.height/2,
                'left':this.width/2
            };
        }
        this.removeBackGroundDOM();
        var resolutions=this.lodConfig['resolutions'];
        this.zoomLevel=nextZoomLevel;
        var scale = resolutions[this.originZoomLevel]/resolutions[nextZoomLevel];
        var pixelOffset;
        var zScale;
        if (nextZoomLevel<this.originZoomLevel) {               
            zScale = resolutions[nextZoomLevel+1]/resolutions[nextZoomLevel];
            pixelOffset = {
                "top":-(focusPos['top']-this.height/2)*(1-zScale),
                "left":-(focusPos['left']-this.width/2)*(1-zScale)
                };
        } else {
            zScale = resolutions[nextZoomLevel-1]/resolutions[nextZoomLevel];                       
            pixelOffset = {
                "top":(focusPos['top']-this.height/2)*(zScale-1),
                "left":(focusPos['left']-this.width/2)*(zScale-1)
                };
        }
        this.offsetCenterByPixel(pixelOffset);
        this.onZoomStart(scale,focusPos,nextZoomLevel);
        var me = this;
        if (this.zoom_timeout) {
            clearTimeout(this.zoom_timeout);
        }
        this.zoom_timeout=setTimeout(function() {
            me.zooming = false;
            me.onZoomEnd(nextZoomLevel);
        },this.getZoomMillisecs());
    },

    animateStart:function(scale,pixelOffset){
        if (Z.Browser.ielt9) {return;}
        var domOffset = this.offsetPlatform();
        var offsetTop = domOffset['top'];
        var offsetLeft = domOffset['left']; 
        var mapContainer = this.panels.mapContainer;
        this.panels.mapContainer.className="MAP_ZOOM_ANIMATED";         
        var origin = Z.DomUtil.getDomTransformOrigin(mapContainer);
        var originX = Math.round(this.width/2-offsetLeft),
            originY = Math.round(this.height/2-offsetTop);  
        if ((origin===null || ""===origin) && pixelOffset) {                    
            var mouseOffset= {
                    "top":(pixelOffset.top-this.height/2),
                    "left":(pixelOffset.left-this.width/2)
                    };
            originX += mouseOffset["left"];
            originY += mouseOffset["top"];
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+"px "+ originY+"px");
        } else if (!pixelOffset) {
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+"px "+ originY+"px");
        }
        
        Z.DomUtil.setDomTransform(mapContainer," scale("+scale+","+scale+")");
    },


    animateEnd:function() {
        if (Z.Browser.ielt9) {return;}
        var mapContainer = this.panels.mapContainer;
        mapContainer.className="";
        Z.DomUtil.setDomTransformOrigin(mapContainer,"");
        Z.DomUtil.setDomTransform(mapContainer,"");    
        mapContainer.style.top=0+"px";
        mapContainer.style.left=0+"px";
    },

    getZoomMillisecs:function() {
        return 150;
    }
};


/**
 * Map类的扩展:拓扑计算的相关方法
 */
Z.MapExt.Topo={
    /**
     * 计算两坐标间距离，计算结果单位为米，如果返回-1，则说明参数不合法
     * 
     * @param lonlat1 {seegoo.maps.MLonLat|Object} 坐标1，例如{x:121,y:19}
     * @param lonlat2 {seegoo.maps.MLonLat|Object} 坐标2，例如{x:122,y:19}
     * @returns {Number}
     * @export
     */
    computeDistance: function(lonlat1, lonlat2) {
        if (!Z.Util.isCoordinate(lonlat1) || !Z.Util.isCoordinate(lonlat2) || !this.getProjection()) {return null;}
        if (Z.Coordinate.equals(lonlat1,lonlat2)) {return 0;}
        return this.getProjection().getGeodesicLength(lonlat1, lonlat2);
    },    

    /**
     * 计算Geometry的地理长度
     * @param  {Geometry} geometry [Geometry]
     * @return {Number}          [地理长度]
     * @export
     */
    computeGeodesicLength:function(geometry) {
        return geometry.computeGeodesicLength(this.getProjection());
    },

    /**
     * 计算Geometry的地理面积
     * @param  {Geometry} geometry [Geometry]
     * @return {Number}          [地理面积]
     * @export
     */
    computeGeodesicArea:function(geometry) {
        return geometry.computeGeodesicArea(this.getProjection());
    },

    /**
     * 计算Geometry的外缓冲，该功能需要引擎服务器版的支持
     * 
     * @export
     * @param {Geometry} [geometry] [做缓冲的geometry]
     * @param {Number} distance 缓冲距离，单位为米
     * @param {function} callback 计算完成后的回调函数，参数为返回的图形对象
     */
    buffer:function(geometry, distance, callback) {
        var defaultOption = {
                "fillSymbol":{
                    "fillOpacity" : 0
                },
                "strokeSymbol":{
                    "stroke" : "#800040",
                    "strokeWidth" : 2,
                    "strokeOpacity" : 1,
                    "strokeDasharray" : "--"
                }
        };
        var me = geometry;
        var result = null;
        function formQueryString() {
            var ret = "distance=" + distance;
            ret += "&encoding=utf-8";
            ret += "&data=" + encodeURIComponent(JSON.stringify(me.toJson()));
            return ret;
        }
        // 点和圆形的buffer直接进行计算
        if (me.type === me['TYPE_POINT']) {
            result = new Z['Circle'](me.center, distance);
            result.setSymbol(defaultOption);
            callback({
                "success" : true,
                "data" : result
            });
            return;
        } else if (me.type === me['TYPE_CIRCLE']) {
            var radius = me.radius + distance;      
            result = new Z["Circle"](me.center, radius);
            result.setSymbol(defaultOption);
            callback({
                "success" : true,
                "data" : result
            });
            return;
        } else {
            var url =Z.host + "/enginerest/geometry/buffer";
            var queryString = formQueryString();
            var ajax = new Z.Util.Ajax(url, 0, queryString, function(
                    resultText) {
                var result = Z.Util.parseJson(resultText);
                if (!result["success"]) {
                    callback(result);
                }
                var resultGeo = Z.Geometry.fromJson(result["data"]);
                if (!resultGeo) {
                    callback({
                        "success" : false,
                        "data" : null
                    });
                    return;
                }
                resultGeo.setSymbol(defaultOption);
                callback({
                    "success" : true,
                    "data" : resultGeo
                });
            });
            ajax.post();
        }
    
    },

    /**
     * 判断Geometry和参数中的Geometry数组的空间关系，该功能需要引擎服务器版的支持
     * 
     * @export
     * @param {Geometry} [geometry] [被relate的Geometry]
     * @param geometries [seegoo.maps.Geometry] 输入Geometry数组
     * @param relation {Integer} 空间关系，参考seegoo.maps.constant内的常量定义
     * @param callback {function} 回调函数，参数为布尔类型数组，数组长度与geometries参数数组相同，每一位代表相应的判断结果
     */
    relate:function(geometry, geometries, relation, callback) {
        if (!geometries || !geometries["length"] || relation < 0 || relation > 7) {
            return;
        }
        var _geometry = geometry;
        function formQueryString() {
            var geoJsons = [];
            for (var i=0, len=geometries.length;i<len;i++) {
                geoJsons.push(JSON.stringify(geometries[i].toJson()));
            }       
            var ret = "geo1=" + JSON.stringify(_geometry.toJson());
            ret += "&geos=[" + geoJsons.join(",")+"]";
            ret += "&relation=" + relation;
            return ret;
        }
        var url = Z.host + "/enginerest/geometry/relation";
        var queryString = formQueryString();
        var ajax = new Z.Util.Ajax(url, 0, queryString, function(
                resultText) {
            var result = eval("(" + resultText + ")");
            callback(result);
        });
        ajax.post();
    },

    /**
     * Identify
     * @param  {opts} opts 查询参数 {"coordinate": coordinate,"radius": r, "layers": [], "successFn": fn}
     * @export
     */
    identify: function(opts) {
        if (!opts) {
            return;
        }
        var layers = opts['layers'];
        if(!layers||layers.length==0) {
            return;
        }
        var coordinate = opts['coordinate'];
        var radius = opts['radius'];
        var fn = opts['success'];
        var circle = new Z.Circle(coordinate, radius);
        var geometries = [];
        for (var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var layerId = layer.getId();

            if(!layer || !layer.getMap() || layerId.indexOf('mt__internal_layer') >= 0) continue;
            var allGeos = layers[i].getAllGeometries();
            for (var j=0, length = allGeos.length; j<length; j++) {
                geometries.push(allGeos[j]);
            }
        }
        var data = this.intersectWithCircle(circle, geometries);
        return fn.call(this, {'success':true,'data':data});
    },

    /**
     * 找到与圆相交的geo
     * @param {Circle} 圆形
     * @param {Array} geo数组
     * @return {Array} 与圆相交的geo数组
     */
    intersectWithCircle: function(circle, geometries) {
        if (!circle instanceof Z.Circle) {
            return;
        }
        if (!geometries || !geometries["length"]) {
            return;
        }
        var result = [];
        for (var i=0, len=geometries.length; i<len; i++) {
            var geometry = geometries[i];
            if(this._circleAndGeometryIntersection(circle, geometry)) {
                result.push(geometry);
            }
        }
        return result;
    },

   /**
    * 判断Geo是否与圆相交
    * @param {Circle} 圆形
    * @param {Geometry} 图形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndGeometryIntersection: function(circle, geometry) {
        var geoType = geometry.getType();
        var result;
        switch(geoType) {
            case Z.Geometry.TYPE_POINT :
                result = this._circleAndMarkerIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_POLYGON :
                result = this._circleAndPolygonIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_POLYLINE :
                result = this._circleAndPolylineIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_RECT :
                result = this._circleAndRectIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_CIRCLE :
                result = this._circleAndCircleIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_ELLIPSE :
                result = this._circleAndEllipseIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_SECTOR :
                result = this._circleAndSectorIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_MULTIPOINT :
                result = this._circleAndMultiPointIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_MULTIPOLYGON :
                result = this._circleAndMultiPolygonIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_MULTIPOLYLINE :
                result = this._circleAndMultiPolylineIntersection(circle, geometry);
                break;
            default:
                result = this._visualExtentIntersection(circle, geometry);
                break;

        }
        return result;
    },

   /**
    * 判断marker是否与圆相交
    * @param {Circle} 圆形
    * @param {Marker} 点
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndMarkerIntersection: function(circle, marker) {
        if(this._visualExtentIntersection(circle, marker)){
            //return this._pointInCircle(circle, marker.getCenter());
            //只要可视范围相交即相交
            return true;
        }
        return false;
    },

   /**
    * 点是否在圆中
    * @param {Circle} circle 圆形
    * @param {Coordinate} point 点
    * @return {Boolean} true，相交；false，不相交
    */
    _pointInCircle: function(circle, point) {
        var radius = circle.getRadius();
        var distance = this.computeDistance(circle.getCenter(), point);
        return (radius>=distance);
    },

   /**
    * 判断Polygon是否与圆相交
    * @param {Circle} 圆形
    * @param {Polygon} 多边形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndPolygonIntersection: function(circle, polygon) {
        if(this._visualExtentIntersection(circle, polygon)){
            var center = circle.getCenter();
            if(Z.GeoUtils.isPointInPolygon(center, polygon)) return true;
            var rings = polygon.getRing();
            if(this._circleAndRingsIntersection(circle, rings)) return true;
            return false;
        }
        return false;
    },

   /**
    * 判断Polyline是否与圆相交
    * @param {Circle} circle 圆形
    * @param {Polyline} polyline 多折线
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndPolylineIntersection: function(circle, polyline) {
        if(this._visualExtentIntersection(circle, polyline)){
            var paths = polyline.getPath();
            if(this._circleAndRingsIntersection(circle, paths)) return true;
            return false;
        }
        return false;
    },

   /**
    * 判断Rectangle是否与圆相交
    * @param {Circle} circle 圆形
    * @param {Rectangle} rectangle  矩形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndRectIntersection: function(circle, rect) {
        if(this._visualExtentIntersection(circle, rect)){
            var center = circle.getCenter();
            var projection = this.getProjection();
            if (!rect ||!projection) return false;
            var extent = rect.computeExtent(projection);
            if(Z.GeoUtils.isPointInRect(center, extent)) return true;
            if(this._circleAndRingsIntersection(circle, rect.getPoints())) return true;
            return false;
        }
        return false;
    },

   /**
    * 判断Circle是否与圆相交
    * @param {Circle} circle 圆形
    * @param {Circle} circle 圆形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndCircleIntersection: function(circle, aCircle) {
        if(this._isPointInCircle(circle.getCenter(), aCircle)) return true;
        if(this._visualExtentIntersection(circle, aCircle)){
            var radius = circle.getRadius();
            var aRadius = aCircle.getRadius();
            var distance = this.computeDistance(circle.getCenter(), aCircle.getCenter());
            return ((radius+aRadius)>=distance);
        }
        return false;
    },

   /**
    * 判断Ellipse是否与圆相交
    * @param {Circle} circle 圆形
    * @param {Ellipse} ellipse 椭圆形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndEllipseIntersection: function(circle, ellipse) {
        if(this._visualExtentIntersection(circle, ellipse)){
            var circleCenter = circle.getCenter();
            if(this._isPointInEllipse(circle, ellipse)) return true;
            if(this._isCirclePointInEllipse(circle, ellipse)) return true;
            return false;
        }
        return false;
    },

   /**
    * 判断Sector是否与圆相交
    * @param {Sector} sector 扇形
    * @param {Circle} circle 圆形
    * @return {Boolean} true，相交；false，不相交
    * 思路： 1、判断圆形与扇形的外接矩形是否相交；
    *       2、判断圆形是否与扇形的两条边相交，如果是，直接return；
    *       3、将扇形的两个端点以及扇形中间端点向外延长圆形的直径得到新的坐标；
    *           3.1、求新的坐标的最大最小x，y，判断圆心是否在这个范围内；
    *           3.2、判断圆的圆心到扇形顶点距离是否小于等于圆半径与扇形半径的和
    */
    _circleAndSectorIntersection: function(circle, sector) {
        if(this._visualExtentIntersection(circle, sector)){
            var center = circle.getCenter();
            var radius = circle.getRadius();
            var endpoints = this._getSectorEndpoint(sector, 0);
            var sectorCenter = sector.getCenter();
            var rings = [sectorCenter, endpoints["startPoint"], sectorCenter, endpoints["endPoint"]];
            if(this._circleAndRingsIntersection(circle, rings)) return true;
            var newEndpoints = this._getSectorEndpoint(sector, radius*2);
            var newStartPoint = newEndpoints["startPoint"];
            var newMiddlePoint = newEndpoints["middlePoint"];
            var newEndPoint = newEndpoints["endPoint"];
            //圆形的坐标范围在延长后的扇形弧线范围
            if(this._betweenTwoPoint(newStartPoint, newMiddlePoint, center)
                || this._betweenTwoPoint(newMiddlePoint, newEndPoint, center)){
                //圆心到扇形顶点距离小于半径
                return this._circleAndMarkerIntersection(circle, sectorCenter);
            }
            return false;
        }
        return false;
    },

    /**
    * 判断MultiPoint是否与圆相交
    * @param {Circle} 圆形
    * @param {MultiPoint} 多点
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndMultiPointIntersection: function(circle, multiPoint) {
        var result = false;
        if(this._visualExtentIntersection(circle, multiPoint)){
            var markers = multiPoint.getGeometries();
            if(markers) {
                for(var i=0,len=markers.length;i<len;i++) {
                    var marker = markers[i];
                    if(this.__circleAndMarkerIntersection(circle, marker)) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    },

    /**
    * 判断MultiPolygon是否与圆相交
    * @param {Circle} 圆形
    * @param {MultiPolygon} 多边形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndMultiPolygonIntersection: function(circle, multiPolygon) {
        var result = false;
        if(this._visualExtentIntersection(circle, multiPolygon)){
            var polygons = multiPolygon.getGeometries();
            if(polygons) {
                for(var i=0,len=polygons.length;i<len;i++) {
                    var polygon = polygons[i];
                    if(this._circleAndPolygonIntersection(circle, polygon)) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    },

    /**
    * 判断MultiPolyline是否与圆相交
    * @param {Circle} circle 圆形
    * @param {MultiPolyline} 多折线
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndMultiPolylineIntersection: function(circle, multiPolyline) {
        var result = false;
        if(this._visualExtentIntersection(circle, multiPolyline)){
            var polylines = multiPolyline.getGeometries();
            if(polylines) {
                for(var i=0,len=polylines.length;i<len;i++) {
                    var polyline = polylines[i];
                    if(this._circleAndPolylineIntersection(circle, polyline)) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    },

    /**
     * 判断两个图形的可是外接矩形是否相交
     * @param {Circle} 圆形
     * @param {Geometry} 图形
     * @return {Boolean} true，相交；false，不相交
     */
     _visualExtentIntersection: function(circle, geometry) {
         var projection = this.getProjection();
         if (!projection) {
             return null;
         }
         if(!geometry){
             return false;
         }
         //TODO 这个circle是临时构造的，没有添加到任何图层上，但是computeVisualExtent需要map对象，而geometry也没有了
         //TODO setMap方法，所以目前只能使用computeExtent来该临时圆的外接矩形
         var cExtent = circle.computeExtent(projection);
         var geoExtent = geometry.computeVisualExtent(projection);
         return Z.Extent.isIntersect(cExtent, geoExtent);
     },

    /**
     * 圆与rings组成的线段是否相交
     * @param {Circle} circle
     * @param {Array} coordinate array
     * @return {Boolean} true：相交；false：不相交
     */
    _circleAndRingsIntersection: function(circle, rings) {
        var result = false;
        var points = this._filterRingsInCircleScope(circle, rings);
        for(var i=0,len=points.length;i<len;i++) {
            var startPoint = points[i];
            var endPoint = points[i+1];
            if(this._oneOfEndpointInCircle(startPoint, endPoint, circle)) {
                result = true;
                break;
            }
            if(this._circleAndTwoPointLineIntersection(startPoint, endPoint, circle)) {
                result = true;
                break;
            }
        }
        return result;
    },
    
   /**
    * 希望筛选出靠近圆形外接矩形坐标范围内的坐标点
    * @param {Circle} 圆形
    * @param {Array} coordinate array
    * @return {Array} 符合条件的坐标数组
    * 可行思路，以下四种情况可以排除：
    * 1、两个端点的ymin轴大于圆形的ymax坐标范围
    * 2、两个端点的ymax轴小于圆形的ymin坐标范围
    * 3、两个端点的xmin轴大于圆形的xmax坐标范围
    * 4、两个端点的xmax轴小于圆形的xmin坐标范围
    */
    _filterRingsInCircleScope: function(circle, rings) {
         var result = [];
         var projection = this.getProjection();
         if (!projection) {
              return null;
         }
         var circleExtent = circle.computeExtent(projection);
         for(var i=0,len=rings.length;i<len;i++) {
            if(i<len-1) {
                var startPoint = rings[i];
                var endPoint = rings[i+1];
                var xmax = Math.max(startPoint.x, endPoint.x);
                var xmin = Math.min(startPoint.x, endPoint.x);
                var ymax = Math.max(startPoint.y, endPoint.y);
                var ymin = Math.min(startPoint.y, endPoint.y);
                if(!(xmin>circleExtent.xmax
                    || xmax<circleExtent.xmin
                    || ymin>circleExtent.ymax
                    || ymax<circleExtent.ymin)) {
                    result.push(startPoint);
                    result.push(endPoint);
                }
            }
         }
         return result;
    },

   /**
    * 判断线段的端点是否在圆内
    * @param {Coordinate} startPoint 起点
    * @param {Coordinate} endPoint 终点
    * @param {Circle} 圆形
    * @return {Boolean} true，某个端点在园上或内
    * 算法描述：
    * 1.先判线段上两点是否至少有一点在圆内，如有，则线段穿越圆；
    */
    _oneOfEndpointInCircle: function(startPoint, endPoint, circle) {
        return (this._pointInCircle(circle, startPoint)
                   ||this._pointInCircle(circle, endPoint));
    },

   /**
    * 判断圆与两个端点连线是否相交
    * @param {Coordinate} startPoint
    * @param {Coordinate} endPoint
    * @param {Circle} circle
    * @return {Boolean} true：相交；false：不相交
    * 算法描述：
    * 2.从圆心向该线段所在的直线作垂线，判线段的两个端点是否分布在垂足的两侧，
    * 如在两侧，并且垂线距离小于或等于半径，则线段穿越圆；否则，线段在圆外。
    */
    _circleAndTwoPointLineIntersection: function(startPoint, endPoint, circle) {
        var center = circle.getCenter();
        var point = this._pointOnVerticalLine(startPoint, endPoint, center);
        //垂线交点在线段两个端点之间
        if(this._betweenTwoPoint(startPoint, endPoint, point)){
            //圆心到线段垂直线的交点距离小于半径
            var thisMarker = new Z.Marker(point);
            return this._circleAndMarkerIntersection(circle, thisMarker);
        }
        return false;
    },

   /**
    * 计算点到线段垂线与线段的交点坐标
    * @param {Coordinate} startCoordinate 线段端点
    * @param {Coordinate} endPointCoordinate 线段端点
    * @param {Coordinate} pointCoordinate 点
    * @return {Coordinate} 线段垂线经过的点
    */
    _pointOnVerticalLine: function(startCoordinate, endPointCoordinate, pointCoordinate) {
        var projection = this.getProjection();
        if (!startCoordinate || !endPointCoordinate || !pointCoordinate ||!projection) return null;
        var startPoint = projection.project(startCoordinate);
        var endPoint = projection.project(endPointCoordinate);
        var point = projection.project(pointCoordinate);
        var A = (startPoint.y-endPoint.y)/(startPoint.x- endPoint.x);
        var B = (startPoint.y-A*startPoint.x);
        var m = point.x + A*point.y;
        var x = (m-A*B)/(A*A + 1);
        var y = A*x+B;
        var coordinate = new Z.Coordinate(x, y);
        return projection.unproject(coordinate);
    },

   /**
    * 计算某点是否在两点之间
    * @param {Coordinate} startPoint 点1
    * @param {Coordinate} endPoint 点2
    * @param {Coordinate} point 参照点
    * @return {Boolean} true：在之间；false，不在两点之间
    */
    _betweenTwoPoint: function(startPoint, endPoint, point) {
        if(!point) return false;
        var xmax = Math.max(startPoint.x, endPoint.x);
        var xmin = Math.min(startPoint.x, endPoint.x);
        var ymax = Math.max(startPoint.y, endPoint.y);
        var ymin = Math.min(startPoint.y, endPoint.y);
        if(point.x<=xmax && point.y<=ymax && point.x>=xmin && point.y>=ymin) {
            return true;
        } else {
            return false;
        }
    },

   /**
    * 获取扇形圆弧的两个端点
    * @param {Sector} sector
    * @param {Number} extend 延长值
    * @return {Array} 端点坐标
    */
    _getSectorEndpoint: function(sector, extend) {
        var endpoints = {};
        var center = sector.getCenter();
        var radius = sector.getRadius();
        var startAngle = sector.getStartAngle();
        var endAngle = sector.getEndAngle();
        var startPoint = this._computeSectorEndpoint(startAngle, radius, center, extend);
        var middlePoint = this._computeSectorEndpoint(endAngle/2, radius, center, extend);
        var endPoint = this._computeSectorEndpoint(endAngle, radius, center, extend);
        endpoints["startPoint"] = startPoint;
        endpoints["middlePoint"] = middlePoint;
        endpoints["endPoint"] = endPoint;
        return endpoints;
    },

   /**
    * 计算扇形圆弧的两个端点
    * @param {Number} angle 夹角
    * @param {Number} radius 半径
    * @param {Coordinate} vertex 顶点坐标
    * @param {Number} extend 延长距离
    * @return {Coordinate} 端点坐标
    */
    _computeSectorEndpoint: function(angle, radius, vertex, extend) {
        var y = radius*Math.sin(angle) + extend;
        var x = radius*Math.cos(angle) + extend;
        var projection = this.getProjection();
        return projection.locate(vertex, x, y);
   },

   /**
  * 判断点是否在圆内
  * @param {Coordinate} point
  * @param {Circle} 圆
  * @return {Boolean} true：点在园内；false：点不在园内
  */
  _isPointInCircle: function(point, circle) {
       var projection = this.getProjection();
       var distance = projection.getGeodesicLength(point,circle.getCenter())
       return distance<=circle.getRadius();
  },

  /**
   * 判断点是否在椭圆上
   * @param {Coordinate} point
   * @param {Ellipse} 椭圆
   * @return {Boolean} true：点在椭圆上；false：点不在椭圆上
   */
   _isPointInEllipse: function(point, ellipse) {
        var defaultDistance = this._computePointToFocusDistanceOnEllipse(ellipse);
        var focusPoints = this._computeEllipseFocusPoints(ellipse);
        var leftFocus = focusPoints["leftFocus"];
        var rightFocus = focusPoints["rightFocus"];
        var projection = this.getProjection();
        var distance = projection.getGeodesicLength(point,leftFocus) +
                       projection.getGeodesicLength(point, rightFocus);
        return distance<=defaultDistance;
   },

   /**
    * 判断圆上的点是否与椭圆相交
    * @param {Circle} 圆形
    * @param {Ellipse} 椭圆形
    * @return {Boolean} true：相交
    * 思路：
    * (circleX*circleX)/(a+circleRadius)*(a+circleRadius) +
    * (circleY*circleY)/(b+circleRadius)*(b+circleRadius) < 1
    */
   _isCirclePointInEllipse: function(circle, ellipse) {
       var circleCenter = circle.getCenter();
       var circleX = circleCenter.x;
       var circleY = circleCenter.y;
       var radius = circle.getRadius();
       //椭圆上任意一点到椭圆两个焦点的距离的一半
       var a = this._computePointToFocusDistanceOnEllipse(ellipse);
       var focusPoints = this._computeEllipseFocusPoints(ellipse);
       var leftFocus = focusPoints["leftFocus"];
       var rightFocus = focusPoints["rightFocus"];
       var projection = this.getProjection();
       var c = projection.getGeodesicLength(leftFocus, rightFocus)/2;
       var b = Math.sqrt(a*a-c*c);
       var result = (circleX*circleX)/(a+circleRadius)*(a+circleRadius) +
                    (circleY*circleY)/(b+circleRadius)*(b+circleRadius);
       return result < 1;
   },

   /**
    * 计算椭圆上任意一点到椭圆两焦点的距离
    * @param {Ellipse} 椭圆
    * @return {Number} 距离
    */
    _computePointToFocusDistanceOnEllipse: function(ellipse) {
        var center = ellipse.getCenter();
        var width = ellipse.getWidth();
        var height = ellipse.getHeight();
        var radius = width/2;
        var projection = this.getProjection();
        var pointOnEllipse = projection.locate(center, -radius, 0);
        if(width<height) {
            radius = height/2;
            pointOnEllipse = projection.locate(center, 0, radius);
        }
        var focusPoints = this._computeEllipseFocusPoints(ellipse);
        var leftFocus = focusPoints["leftFocus"];
        var rightFocus = focusPoints["rightFocus"];
        var distance = projection.getGeodesicLength(pointOnEllipse,leftFocus) +
                       projection.getGeodesicLength(pointOnEllipse, rightFocus);
        return distance;
   },

   /**
    * 获取椭圆形的左右焦点
    * @param {Ellipse} 椭圆
    * @return {Coordinate} 焦点数组
    */
    _computeEllipseFocusPoints: function(ellipse) {
        var center = ellipse.getCenter();
        var width = ellipse.getWidth();
        var height = ellipse.getHeight();
        var longAxis = width/2;
        var shortAxis = height/2;
        var projection = this.getProjection();
        var focusDistance = Math.sqrt(longAxis*longAxis-shortAxis*shortAxis);
        var leftFocus = projection.locate(center, -focusDistance, 0);
        var rightFocus = projection.locate(center, focusDistance, 0);
        if(width<height) {
            longAxis = height/2;
            shortAxis = width/2;
            focusDistance = Math.sqrt(longAxis*longAxis-shortAxis*shortAxis);
            leftFocus = projection.locate(center, 0, focusDistance);
            rightFocus = projection.locate(center, 0, -focusDistance);
        }
        var focusPoints = {};
        focusPoints["leftFocus"] = leftFocus;
        focusPoints["rightFocus"] = rightFocus;
        return focusPoints;
    }
};
Z.MapExt.ContextMenu = {
   /**
    * 设置Map的右键菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @export
    */
    setContextMenu: function(menuOption) {
        this.on('contextmenu', this._beforeOpenContextMenu, this);
        this.menu = new Z.Menu(menuOption);
        this.menu.addTo(this);
        return this;
    },

   /**
    * 菜单打开前
    * @param {Event} event 鼠标右击事件
    */
    _beforeOpenContextMenu: function(event) {
        var pixel = Z.DomUtil.getEventDomCoordinate(event, this.containerDOM);
        var coordinate = this.screenPointToCoordinate(pixel);
        var position = this.coordinateToScreenPoint(coordinate);
        var param = {'coordinate':coordinate, 'pixel':position};
        this.menu.showPosition = position;
        var beforeopenFn = this.menu.menuOption['beforeopen'];
        if(beforeopenFn) {
            this.menu.beforeOpen(param);
        }
        return this;
    },

    /**
    * 打开Map右键菜单
    * @param {Coordinate} 坐标
    * @export
    */
    openMenu: function(coordinate) {
        if(!coordinate) {
            coordinate = this.showPostion;
        }
        this.menu.showMenu(coordinate);
    },

   /**
    * 添加菜单项目
    * @param {Array} 菜单项数组
    * @export
    */
    setMenuItem: function(items) {
        this.menu.setItems(items);
        return this;
    },

    /**
    * 关闭右键菜单
    * @export
    */
    closeMenu: function() {
        this.menu.closeMenu();
    }
};

/**
 * 地图的事件处理
 * @type {Object}
 */
Z.MapExt.DomEvents = {
	/**
    * 初始化地图事件
    * @param {Boolean} remove
    */
    _registerDomEvents: function(remove) {
        var events = 'mousedown mouseup ' +
            'mouseover mouseout mousemove click dblclick contextmenu keypress';
        if (remove) {
            Z.DomUtil.removeDomEvent(this.containerDOM, events, this._handleDOMEvent);
        } else {
            Z.DomUtil.addDomEvent(this.containerDOM, events, this._handleDOMEvent, this);
        }

    },

    _handleDOMEvent: function (e) {
        /*if (!this.loaded || Z.DomEvent._skipped(e)) { return; }

        // find the layer the event is propagating from
        var target = this._findEventTarget(e.target || e.srcElement),
            type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;

        // special case for map mouseover/mouseout events so that they're actually mouseenter/mouseleave
        if (!target && (type === 'mouseover' || type === 'mouseout') &&
                !Z.DomEvent._checkMouse(this.containerDOM, e)) { return; }

        // prevents outline when clicking on keyboard-focusable element
        if (type === 'mousedown') {
            Z.DomUtil.preventOutline(e.target || e.srcElement);
        }*/
        var type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;
        this._fireDOMEvent(this, e, type);
    },

   /* _findEventTarget: function (src) {
        while (src) {
            var target = this._targets[Z.Util.stamp(src)];
            if (target) {
                return target;
            }
            if (src === this.containerDOM) {
                break;
            }
            src = src.parentNode;
        }
        return null;
    },*/

    _fireDOMEvent: function (target, e, type) {
    	//TODO DOM事件参数属性应该统一起来
        var data = {
            originalEvent: e
        };
        //阻止右键菜单
        if (type === 'contextmenu') {
            Z.DomUtil.preventDefault(e);
        }
        // prevents firing click after you just dragged an object
        /*if (e.type === 'click' && !e._simulated && this._draggableMoved(target)) { return; }
        if (e.type !== 'keypress') {
            data.containerPoint = target instanceof Z.Marker ?
                    this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
            data.layerPoint = this.containerDOMPointToLayerPoint(data.containerPoint);
            data.latlng = this.layerPointToLatLng(data.layerPoint);
        }*/
        target.fire(type, data, true);
    },

    enableDragPropagation: function() {
        this['dragging'].draggable.enable();
    },

    disableDragPropagation: function() {
        this['dragging'].draggable.disable();
    },

    enableDoubleClickZoom: function() {
        this['doubleClickZoom'] = true;
    },

    disableDoubleClickZoom: function() {
        this['doubleClickZoom'] = false;
    }

    /*_draggableMoved: function (obj) {
        obj = obj.options.draggable ? obj : this;
        return (obj.dragging) || (this.boxZoom);
    },*/
};
Z.MapExt.Snap={
	/**
     * 截图
     * @param  {Object} config 截图设置
     * @export
     */
    snap:function(config) {
        var callback = config['success'];
        var onErrorFn = config['error'];
        var extent = config['extent'];
        var zoomLevel = config['zoomLevel'];
        var geometries = config['geometries'];
        var resultType = config['resultType'];
        var ignoreBase = config['ignoreBase'];
        var lodConfig = this.getLodConfig();
        if (!lodConfig) {
            return;
        }
        var projection = this.getProjection();
        if (!extent) {
            extent = this.getExtent();              
        }
        if (Z.Util.isNil(zoomLevel)) {
            zoomLevel = this.getZoomLevel();
        }
        if (zoomLevel < lodConfig['minZoomLevel']) {
            zoomLevel = lodConfig['minZoomLevel'];
        } else if (zoomLevel > lodConfig['maxZoomLevel']) {
            zoomLevel = lodConfig['maxZoomLevel'];
        }
        var snapSettings = {
            'projection':lodConfig['projection'],
            'res':lodConfig['resolutions'][zoomLevel],
            'extent': extent.toJson()            
        };   
        var layerSettings = {};
        var baseTileLayer = this.getBaseTileLayer();            
        if (baseTileLayer) {
            var layerInfo = genLayerInfo(baseTileLayer);
            var tileNum = layerInfo.num;
            if (tileNum > 3000) {
                if (tileNum > 10000) {
                    alert("截图大小预计会超过150M，请缩小截图范围后再继续截图");
                    return;
                }
                if (!confirm("截图文件大小预计会超过50M，请确定是否继续截图？")) {
                    return;
                }
            }
            if (!ignoreBase) {
                layerSettings['base']=layerInfo.info;
                // params += "\"base\":";
                // params += layerInfo.info+",";
            }
        }
        if (this.tileLayers.length >0){
            var tileLayerSettings=[];
            var tileLayers =this.tileLayers;
            for (var i=0,len=tileLayers.length;i<len;i++) {
                tileLayerSettings.push(genLayerInfo(tileLayers[i]).info);
            }                       
            layerSettings['tilelayers'] = tileLayerSettings;
        }
        if (this.dynLayers.length>0) {
                //动态图层
            var dynLayerSettings = [];
            var dynLayers =this.dynLayers;
            for (var i=0,len=dynLayers.length;i<len;i++) {
                dynLayerSettings.push(genDynlayerInfo(dynLayers[i]));
            }                       
            layerSettings['dynlayers'] = dynLayerSettings;
        }
        var geoJson = [];   
        var markerJson = [];
        if (!geometries || geometries.length === 0) {
            if (this.canvasLayers.length>0) {
                collectLayers(this.canvasLayers);
            }
            if (this.svgLayers.length>0) {
                collectLayers(this.svgLayers);
            }
        } else {
            collectGeos(geometries);
        }
        
        layerSettings['geos'] = geoJson.concat(markerJson);
        snapSettings['layers'] = layerSettings;
        
        
        var url = Z.host + "/snapservice/snap";
        var queryString = "config="+encodeURIComponent(JSON.stringify(snapSettings));
        var ajax = new Z.Util.Ajax(url, 0, queryString, function(resultText) {
            //console.log(resultText);
            var result = Z.Util.parseJson(resultText);
            if (!result || !result['success']) {
                if (onErrorFn) {
                    onErrorFn(result);                          
                }
                return;
            }
            if (result["success"]) {
                var url = null;
                if ('picture' === resultType) {
                    url = Z.host + '/snapservice/snapshots/'+result["data"];
                } else {
                    url = Z.host + "/snapservice/snapshots/fetch.html?url="+result["data"];
                }
                callback(url); 
            }
            
        });
        ajax.post();
        
        function collectLayers(layerList) {
            for (var i=0, len=layerList.length;i<len;i++) {
                if (!layerList[i] || !layerList[i].isVisible()) {continue;}
                var geos = layerList[i]["getAllGeometries"]();
                collectGeos(geos);
            }
        }
        
        function collectGeos(geos) {
            if (!geos) {return;}
            for (var j=0, jLen = geos.length;j<jLen;j++) {
                if (!geos[j].isVisible()) {continue;}
                var geoExtent = geos[j].getExtent();
                if (!Z.Extent.isIntersect(geoExtent,extent)) {
                    continue;
                }
                var layer = geos[j].getLayer();
                if (layer instanceof Z.SVGLayer && 
                    Z.Geometry["TYPE_POINT"] === geos[j].getType()) {
                    var jStr =geos[j].toJson({'attributes':false});
                    markerJson.push(jStr);
                } else {
                    var jStr = geos[j].toJson({'attributes':false});
                    geoJson.push(jStr);
                }
            }
        }

        function genDynlayerInfo(layer) {
            //var lConfig = layer.config;
             var nwTileInfo = lodConfig.getCenterTileInfo(projection.project({x:extent['xmin'],y:extent['ymax']}), zoomLevel);
             var seTileInfo = lodConfig.getCenterTileInfo(projection.project({x:extent['xmax'],y:extent['ymin']}), zoomLevel);
            var dynLayerSetting = {
                'url':layer.getTileUrl("%s","%s","%s"),
                'session':layer.sessionId,
                'tileSize': {
                    'height':lodConfig["tileSize"]["height"],
                    'width':lodConfig["tileSize"]["width"]
                },
                'padding':{
                    'height':lodConfig["padding"]["height"],
                    'width':lodConfig["padding"]["width"]  
                },
                'nw':{
                    'x':nwTileInfo['x'],
                    'y':nwTileInfo['y'],
                    'ox':nwTileInfo['offsetLeft'],
                    'oy':nwTileInfo['offsetTop']
                },
                'se':{
                    'x':seTileInfo['x'],
                    'y':seTileInfo['y'],
                    'ox':seTileInfo['offsetLeft'],
                    'oy':seTileInfo['offsetTop']
                }

            };         
            
            var xFactor = nwTileInfo["x"]<seTileInfo["x"];
            var yFactor = nwTileInfo["y"]<seTileInfo["y"];
            
            var tileParams = [];
            for (var i=nwTileInfo["x"];(xFactor?i<=seTileInfo["x"]:i>=seTileInfo["x"]);(xFactor?i++:i--)) {
                for (var j=nwTileInfo["y"];(yFactor?j<=seTileInfo["y"]:j>=seTileInfo["y"]);(yFactor?j++:j--)) {
                    tileParams.push("\""+layer._getRequestUrlParams(j,i,zoomLevel)+"\"");   
                    
                }
            }
            dynLayerSettings['tiles']=tileParams;
            return dynLayerSettings;
        }
        
        function genLayerInfo(layer) {
            var nwTileInfo = lodConfig.getCenterTileInfo(projection.project({x:extent['xmin'],y:extent['ymax']}), zoomLevel);
            var seTileInfo = lodConfig.getCenterTileInfo(projection.project({x:extent['xmax'],y:extent['ymin']}), zoomLevel);
            var tileLayerSettings={
                'tileSize':{
                     'height':lodConfig["tileSize"]["height"],
                    'width':lodConfig["tileSize"]["width"]
                },
                'padding':{
                    'height':lodConfig["padding"]["height"],
                    'width':lodConfig["padding"]["width"]  
                },
                'zoomLevel':zoomLevel,
                'url':layer.getTileUrl("%s","%s","%s"),
                'nw':{
                    'x':nwTileInfo['x'],
                    'y':nwTileInfo['y'],
                    'ox':nwTileInfo['offsetLeft'],
                    'oy':nwTileInfo['offsetTop']
                },
                'se':{
                    'x':seTileInfo['x'],
                    'y':seTileInfo['y'],
                    'ox':seTileInfo['offsetLeft'],
                    'oy':seTileInfo['offsetTop']
                }

            };
          
            return {info:tileLayerSettings,num:tileNum};
        }

    }
};
Z['Map']=Z.Map=Z.Class.extend({
    
    includes: [Z.Eventable,Z.MapExt.Pan,Z.MapExt.Zoom,Z.MapExt.Topo,Z.MapExt.ContextMenu, Z.MapExt.DomEvents, Z.MapExt.Snap, Z.MapExt.Fullscreen],

    options:{
        'enableMapSliding':true,
        'enableZoom':true,
        'enableInfoWindow':true,
        'zoomMode':'pointer'
    },

    events:{
        LOAD_MAP:'loadmap',
        LODCONFIG_CHANGED:'lodconfigchanged',
        RESIZE:'resize'
    },

    //根据不同的语言定义不同的错误信息
    'exceptionDefs':{
        'en-US':{
            'NO_BASE_TILE_LAYER':'Map has no baseTileLayer, pls specify a baseTileLayer by setBaseTileLayer method before loading.',
            'INVALID_LODCONFIG':'LodConfig of Map is invalid.',
            'INVALID_OPTION':'Invalid options provided.',
            'INVALID_CENTER':'Invalid Center',
            'INVALID_LAYER_ID':'Invalid id for the layer',
            'DUPLICATE_LAYER_ID':'the id of the layer is duplicate with another layer'
        },
        'zh-CN':{
            'NO_BASE_TILE_LAYER':'地图没有设置基础图层,请在调用Map.Load之前调用setBaseTileLayer设定基础图层',
            'INVALID_LODCONFIG':'LOD配置无效.',
            'INVALID_OPTION':'无效的option.',
            'INVALID_CENTER':'无效的中心点',
            'INVALID_LAYER_ID':'图层的id无效',
            'DUPLICATE_LAYER_ID':'重复的图层id'
        }
    },

    /**
     * constructor
     * @param  {String} containerId
     * @param  {Object} options
     */
    initialize:function(container, options) {

        if (!options) {
            throw new Error(this.exceptions['INVALID_OPTION']);
        }

        if (!options['center']) {
            throw new Error(this.exceptions['INVALID_CENTER']);
        }

        this.loaded=false;

        this.container = container;

        if (Z.Util.isString(this.container)) {
            this.containerDOM = document.getElementById(this.container);
        } else {
            this.containerDOM = container;
        }
        options = Z.Util.setOptions(this,options);

        //Layer of Details, always derived from baseTileLayer
        this.lodConfig=null;
        this.panels={};
        //Layers
        this.baseTileLayer=null;
        this.tileLayers=[];
        this.svgLayers=[];
        this.baseCanvasLayer = null;
        this.canvasLayers=[];
        this.dynLayers=[];
        //handler
        this._handlers = [];

        this.zoomLevel = options['zoomLevel'];
        this.maxZoomLevel = options['maxZoomLevel'];
        this.minZoomLevel = options['minZoomLevel'];
        this.center = options['center'];

        this.allowSlideMap = true;


        
        this.initContainer();
    },

    /**
     * Load Map
     * @export
     */
    Load:function(){
        if (this.loaded) {return;}
        if (!this.baseTileLayer || !this.baseTileLayer.getLodConfig) {
            throw new Error(this.exceptions['NO_BASE_TILE_LAYER']);
        }
        var lodConfig = this.baseTileLayer.getLodConfig();
        var _this=this;
        this.setLodConfig(lodConfig,function() {
            _this._Load();
        });
        return this;
    },

    /**
     * 设定地图鼠标跟随提示框内容，设定的提示框会一直跟随鼠标显示
     * @param {Dom} tipElement 鼠标提示框内容
     */
    setMouseTip:function(tipElement) {

    },

    /**
     * 移除鼠标提示框
     * @return {[type]} [description]
     */
    removeMouseTip:function() {

    },

    /**
     * 获取地图容器的宽度和高度
     * @return {{'width':?, 'height':?}}} 地图容器大小,单位像素
     * @export
     */
    getSize:function() {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return this.getContainerDomSize();
        }
        return {
            'width' : this.width,
            'height' : this.height
        };
    },

    /**
     * 获取地图的Extent
     * @return {Extent} 地图的Extent
     * @export
     */
    getExtent:function() {
        var lodConfig = this.getLodConfig();
        if (!lodConfig) {
            return null;
        }
        var projection = this.getProjection();
        if (!projection) {
            return null;
        }
        var res = this.lodConfig['resolutions'][this.zoomLevel];
        if (Z.Util.isNil(res)) {
            return null;
        }
        var size = this.getSize();
        var w = size['width']/2,
            h = size['height']/2;
        var prjCenter = this.getPCenter();
        var point1 = projection.unproject({x:prjCenter.x - w*res, y:prjCenter.y + h*res});
        var point2 = projection.unproject({x:prjCenter.x + w*res, y:prjCenter.y - h*res});
        return new Z.Extent(point1,point2);
    },

    /**
     * 获取地图的中心点
     * @return {Coordinate} 坐标
     * @export
     */
    getCenter:function() {
        if (!this.lodConfig || !this.loaded) {return this.center;}
        var projection = this.lodConfig.getProjectionInstance();
        return projection.unproject(this.pcenter);
    },

    /**
     * 设置地图中心点
     * @param {Coordinate} center [新的中心点坐标]
     * @export
     */
    setCenter:function(center) {
        if (!this.lodConfig || !this.loaded) {
            this.center = center;
            return this;
        }
        var projection = this.getProjection();
        var _pcenter = projection.project(center);
        var span = this.getPixelDistance(_pcenter);
        this.setPCenter(_pcenter);
        this.offsetPlatform(span);
        this.onMoveEnd();
        return this;
    },

    onMoving:function(param) {
        var map = this;
        function movingLayer(layer) {
            if (layer) {
                layer.onMoving(param);
            }
        }
        
        //reduce refresh frequency
        if (2*Math.random() > 1) {map.refreshSVGPaper();}
        if (map.baseTileLayer) {map.baseTileLayer.onMoving();}
        map.eachLayer(movingLayer, map.svgLayers);
        map.fireEvent('moving');
    },

    onMoveEnd:function(param) {
        function endMoveLayer(layer) {
            if (layer) {
                layer.onMoveEnd(param);
            }
        }
        var me=this;
        if (me.baseTileLayer) {me.baseTileLayer.onMoveEnd();}
        me.refreshSVGPaper();
        me.eachLayer(endMoveLayer,me.tileLayers,[me.baseCanvasLayer],me.dynLayers);
        me.fireEvent('moveend');
    },

    /**
     * 获取指定的投影坐标与当前的地图中心点的像素距离
     * @param  {Coordinate} _pcenter 像素坐标
     * @return {Point}          像素距离
     */
    getPixelDistance:function(_pcenter) {
        var _current = this.getPCenter();
        var curr_px = this.untransform(_current);
        var _pcenter_px = this.untransform(_pcenter);
        var span = {'left':(_pcenter_px['left']-curr_px['left']),'top':(curr_px['top']-_pcenter_px['top'])};
        return span;
    },

    /**
     * 获取地图的缩放级别
     * @return {Number} 地图缩放级别
     * @export
     */
    getZoomLevel:function() {
        return this.zoomLevel;
    },

    /**
     * 设置地图的缩放级别
     * @param {Number} z 新的缩放级别
     * @export
     */
    setZoomLevel:function(z) {
        this.zoom(z);
        return this;
    },

    /**
     * 获得地图最大放大级别
     * @return {Number} 最大放大级别
     * @export
     */
    getMaxZoomLevel:function() {
        return this.maxZoomLevel;
    },

    /**
     * 设置最大放大级别
     * @param {Number} zoomLevel 最大放大级别
     * @export
     */
    setMaxZoomLevel:function(zoomLevel) {
        var lodConfig = this.getLodConfig();
        if (zoomLevel > lodConfig['maxZoomLevel']) {
            zoomLevel = lodConfig['maxZoomLevel'];
        }
        this.maxZoomLevel = zoomLevel;
        return this;
    },

    /**
     * 获得地图最小放大级别
     * @return {Number} 最小放大级别
     * @export
     */
    getMinZoomLevel:function() {
        return this.minZoomLevel;
    },

    /**
     * 设置最小放大级别
     * @param {Number} zoomLevel 最小放大级别
     * @export
     */
    setMinZoomLevel:function(zoomLevel) {
        var lodConfig = this.getLodConfig();
        if (zoomLevel < lodConfig['minZoomLevel']) {
            zoomLevel = lodConfig['minZoomLevel'];
        }
        this.minZoomLevel=zoomLevel;
        return this;
    },

    /**
     * 放大地图
     * @export
     */
    zoomIn: function() {
        this.zoom(this.getZoomLevel() + 1);
        return this;
    },

    /**
     * 地图缩小
     * @export
     */
    zoomOut: function() {
        this.zoom(this.getZoomLevel() - 1);
        return this;
    },

    /**
     * 设置中心点并放大缩小
     * @param {Coordinate} center    [新的中心点]
     * @param {Number} zoomLevel [新的缩放级别]
     * @export
     */
    setCenterAndZoom:function(center,zoomLevel) {
        if (!this.lodConfig || !this.loaded) {
            this.center = center;
            this.zoomLevel = zoomLevel;
            return this;
        }
        if (this.zoomLevel != zoomLevel) {
            this.setCenter(center);
            this.zoom(zoomLevel);
        } else {
            this.setCenter(center);
        }
        return this;
    },

    /**
     * 根据地图的extent取得最合适的zoomlevel
     *
     * @category 工具方法
     * @param extent {Extent} Extent对象
     * @returns
     * @export
     */
    getFitZoomLevel: function(extent) {
        if (!extent && !(extent instanceof Z.Extent)) {
            return this.zoomLevel;
        }
        //点类型
        if (extent['xmin'] == extent['xmax'] && extent['ymin'] == extent['ymax']) {
            return this.maxZoomLevel;
        }
        try {
            var projection = this.getProjection();
            var x = Math.abs(extent["xmin"] - extent["xmax"]);
            var y = Math.abs(extent["ymin"] - extent["ymax"]);
            var projectedExtent = projection.project({x:x, y:y});
            var resolutions = this.getLodConfig()['resolutions'];
            var xz = -1;
            var yz = -1;
            for ( var i = this.minZoomLevel, len = this.maxZoomLevel; i < len; i++) {
                if (projectedExtent.x / resolutions[i] >= this.width) {
                    if (xz == -1) {
                        xz = i;
                    }
                }
                if (projectedExtent.y / resolutions[i] >= this.height) {
                    if (yz == -1) {
                        yz = i;
                    }
                }
                if (xz > -1 && yz > -1) {
                    break;
                }
            }
            var ret = xz < yz ? xz : yz;
            if (ret === -1) {
                ret = xz < yz ? yz : xz;
            }
            if (ret === -1) {
                return this.maxZoomLevel;
            }
            return ret - 2;
        } catch (exception) {
            return this.getZoomLevel();
        }
    },

    /**
     * 返回基础地图图层
     * @return {TileLayer} [基础地图图层]
     * @export
     */
    getBaseTileLayer:function() {
        return this.baseTileLayer;
    },

    /**
     * 设定地图的基础瓦片图层
     * @param  {TileLayer} baseTileLayer 瓦片图层
     * @export
     */
    setBaseTileLayer:function(baseTileLayer) {
        if (!baseTileLayer || !baseTileLayer.getLodConfig) {
            //TODO 是否要抛出错误?
            return;
        }
        if (this.baseTileLayer) {
            this.layerRemove(this.baseTileLayer);
            this.removeBackGroundDOM();
        }
        baseTileLayer.prepare(this,-1);
        this.baseTileLayer = baseTileLayer;
        var _this = this;
        //删除背景
        this.baseTileLayer.bind(baseTileLayer.events.LAYER_LOADED,function() {
            _this.removeBackGroundDOM();
        });
        var lodConfig = this.baseTileLayer.getLodConfig();
        this.setLodConfig(lodConfig,function(changed) {
            if (_this.loaded) {
                _this.baseTileLayer.load();
            }
            if (changed) {
                _this.fireEvent(_this.events.LODCONFIG_CHANGED);
                // _this.fire(_this.events.LODCONFIG_CHANGED,{'target':_this});
            }
        });
        return this;
    },

    /**
     * 获取图层
     * @param  {String} id 图层id
     * @return {Layer}  图层
     * @export
     */
    getLayer:function(id) {
        if (!id || !this.layerCache || !this.layerCache[id]) {
            return null;
        }
        return this.layerCache[id];
    },

    /**
     * 向地图里添加图层
     * @param  {Layer} layer 图层对象
     * @export
     */
    addLayer:function(layers){
        if (!layers) {
            return this;
        }
        if (!Z.Util.isArray(layers)) {
            return this.addLayer([layers]);
        }
        if (!this.layerCache) {
            this.layerCache = {};
        }
        for (var i=0,len=layers.length;i<len;i++) {
            var layer = layers[i];
            var id = layer.getId();
            if (Z.Util.isNil(id)) {
                throw new Error(this.exceptions['INVALID_LAYER_ID']+':'+id);
            }
            if (this.layerCache[id]) {
                throw new Error(this.exceptions['DUPLICATE_LAYER_ID']+':'+id);
            }
            this.layerCache[id] = layer;
            //DynamicLayer必须要放在前面, 因为dynamiclayer同时也是tilelayer, tilelayer的代码也同时会执行
            if (layer instanceof Z.DynamicLayer) {
                layer.prepare(this, this.dynLayers.length);
                this.dynLayers.push(layer);
                if (this.loaded) {
                    layer.load();
                }
            } else if (layer instanceof Z.TileLayer) {
                layer.prepare(this, this.tileLayers.length);
                this.tileLayers.push(layer);
                if (this.loaded) {
                    layer.load();
                }
            } else if (layer instanceof Z.SVGLayer) {
                layer.prepare(this,this.svgLayers.length);
                this.svgLayers.push(layer);
                if (this.loaded) {
                    layer.load();
                }
            } else if (layer instanceof Z.CanvasLayer) {
                layer.prepare(this, this.canvasLayers.length);
                this.canvasLayers.push(layer);
                if (!this.baseCanvasLayer) {
                    this.baseCanvasLayer = new Z.CanvasLayer.Base();
                    this.baseCanvasLayer.prepare(this);
                    if (this.loaded) {
                        this.baseCanvasLayer.load();
                    }
                } else {
                    this.repaintBaseCanvasLayer();
                }
            } else {
                continue;
            }

        }
        return this;
    },

    /**
     * 刷新绘制baseCanvasLayer
     * @param  {Boolean} isRealTime 是否是实时绘制
     */
    repaintBaseCanvasLayer:function(isRealTime) {
        if (this.loaded && this.baseCanvasLayer) {
            this.baseCanvasLayer.repaint(isRealTime);
        }
    },

    /**
     * 移除图层
     * @param  {Layer | id} layer 图层或图层id
     * @export
     */
    removeLayer: function(layer) {
        if (!(layer instanceof Z.Layer)) {
            layer = this.getLayer(layer);
        }
        if (!layer) {
            return this;
        }
        var map = layer.getMap();
        if (!map || map != this) {
            return;
        }
        if (layer instanceof Z.SVGLayer) {
            this._removeLayer(layer, this.svgLayers);
        } else if (layer instanceof Z.CanvasLayer) {
            this._removeLayer(layer, this.canvasLayers);
        } else if (layer instanceof Z.TileLayer) {
            this._removeLayer(layer, this.tileLayers);
        }
        var id = layer.getId();
        delete this.layerCache[id];
        return this;
    },

    /**
     * 从layerList中删除某个图层
     */
    _removeLayer:function(layer,layerList) {
        if (!layer || !layerList) {return;}
        var index = Z.Util.searchInArray(layer,layerList);
        if (index > -1) {
            layerList.splice(index, 1);
            if (this.loaded) {
                layer.onRemove();
            }
            for (var j=0, jlen=layerList.length;j<jlen;j++) {
                if (layerList[j].setZIndex) {
                    layerList[j].setZIndex(layerList[j].baseZIndex+j);
                }
            }
        }
    },


    /**
     * [addHandler description]
     * @param {[type]} name         [description]
     * @param {[type]} HandlerClass [description]
     * @export
     */
    addHandler: function (name, HandlerClass) {
        if (!HandlerClass) { return this; }

        var handler = this[name] = new HandlerClass(this);

        this._handlers.push(handler);

        if (this.options[name]) {
            handler.enable();
        }
        return this;
    },

    _clearHandlers: function () {
        for (var i = 0, len = this._handlers.length; i < len; i++) {
            this._handlers[i].disable();
        }
    },

    

    /**
     * 获取地图的坐标类型
     * @return {String} 坐标类型
     * @export
     */
    getCoordinateType:function() {
        var result = this.options['coordinateType'];
        if (!result) {
            result = 'gcj02';
        }
        return result;
    },


//------------------------------坐标转化函数-----------------------------
    /**
     * 将地理坐标转化为屏幕像素坐标
     * @param {Coordinate} 地理坐标
     * @return {Point}
     * @export
     */
    coordinateToScreenPoint: function(coordinate) {
        var projection = this.getProjection();
        if (!coordinate || !projection) {return null;}
        var pCoordinate = projection.project(coordinate);
        return this.untransformToOffset(pCoordinate);
    },

    /**
     * 将屏幕像素坐标转化为地理坐标
     * @param {screenPoint} 屏幕坐标
     * @return {coordinate} 地理坐标
     * @export
     */
    screenPointToCoordinate: function(screenPoint) {
        //var domOffset = this.screenToDomOffset(screenPoint);
        var projection = this.getProjection();
        if (!screenPoint || !projection) {return null;}
        var pCoordinate = this.transform(screenPoint);
        var coordinate = projection.unproject(pCoordinate);
        return coordinate;
    },
//-----------------------------------------------------------------------

    onResize:function(resizeOffset) {
        this.offsetCenterByPixel(resizeOffset);
        this.refreshSVGPaper();
        function resizeLayer(layer) {
            if (layer) {
                layer.onResize();
            }
        }
        if (this.baseTileLayer) {this.baseTileLayer.onResize();}
        this.eachLayer(resizeLayer,this.getAllLayers());
    },

    fireEvent:function(eventName, param) {
        if (!param) {
            param = {};
        }
        param['target']=this;
        this.fire(eventName,param);
    },

    _Load:function() {
        this.originZoomLevel = this.zoomLevel;
        
        this.initContainerWatcher();        
        this._registerDomEvents();
        this.loadAllLayers();
        // this.callInitHooks();
        this.loaded = true;
        this._callOnLoadHooks();
        //this.fire('mapready',{'target':this});
    },

    loadAllLayers:function() {
        function loadLayer(layer) {
            if (layer) {
                layer.load();
            }
        }
        if (this.baseTileLayer) {this.baseTileLayer.load();}
        this.eachLayer(loadLayer,this.getAllLayers());
    },

    getAllLayers:function() {
        var result = [];
        return result.concat(this.tileLayers)
        .concat([this.baseCanvasLayer])
        .concat(this.svgLayers)
        .concat(this.dynLayers);
    },

    eachLayer:function(fn) {
        if (arguments.length < 2) {return;}
        var layerLists = Array.prototype.slice.call(arguments, 1);
        var layers = [];
        for (var i=0, len=layerLists.length;i<len;i++) {
            layers = layers.concat(layerLists[i]);
        }
        for (var j=0, jlen = layers.length;j<jlen;j++) {
            fn.call(fn,layers[j]);
        }
    },

    /**
     * 显示所有的Overlayer图层
     * @return {[type]} [description]
     */
    showOverlayLayers:function() {
        this.panels.svgContainer.style.display="";
        this.panels.canvasLayerContainer.style.display="";
    },

    /**
     * 隐藏所有的Overlayer图层
     * @return {[type]} [description]
     */
    hideOverlayLayers:function() {
        this.panels.svgContainer.style.display="none";
        this.panels.canvasLayerContainer.style.display="none";
        // me.panels.tipContainer.style.display="none";
    },

    getLodConfig:function() {
        return this.lodConfig;
    },

    getProjection:function() {
        var lodConfig = this.getLodConfig();
        if (lodConfig) {
            return lodConfig.getProjectionInstance();
        }
        return null;
    },

    /**
     * 设置地图的lodConfig
     * @param {LodConfig} lodConfig  新的lodConfig
     * @param {Fn} callbackFn 新的lodConfig载入完后的回调函数
     */
    setLodConfig:function(lodConfig,callbackFn) {
        if (!lodConfig || !lodConfig.load) {
            throw new Error(this.exceptions['INVALID_LODCONFIG']);
        }
        //lodConfig相同,无需改变
        if (this.lodConfig && this.lodConfig.equals(lodConfig, this.getZoomLevel())) {
            callbackFn(false);
            return;
        }
        this.lodConfig = lodConfig;
        this.dx = (this.lodConfig['origin']['right']>=this.lodConfig['origin']['left'])?1:-1;
        this.dy = (this.lodConfig['origin']['top']>=this.lodConfig['origin']['bottom'])?1:-1;
        var _this=this;
        lodConfig.load(function() {
            _this.checkMapStatus();
            callbackFn(true);
        });
    },

    /**
     * LodConfig修改后检查当前地图状态是否吻合新的LodConfig规则
     * @return {[type]} [description]
     */
    checkMapStatus:function(){
        if (!this.maxZoomLevel || this.maxZoomLevel > this.lodConfig['maxZoomLevel']) {
            this.maxZoomLevel = this.lodConfig['maxZoomLevel'];
        }
        if (!this.minZoomLevel || this.minZoomLevel < this.lodConfig['minZoomLevel']) {
            this.minZoomLevel = this.lodConfig['minZoomLevel'];
        }
        if (this.maxZoomLevel < this.minZoomLevel) {
            this.maxZoomLevel = this.minZoomLevel;
        }
        if (!this.zoomLevel || this.zoomLevel > this.maxZoomLevel) {
            this.zoomLevel = this.maxZoomLevel;
        }
        if (this.zoomLevel < this.minZoomLevel) {
            this.zoomLevel = this.minZoomLevel;
        }
        this.center = this.getCenter();
        var projection = this.lodConfig.getProjectionInstance();
        this.pcenter = projection.project(this.center);
    },

    

    getContainerDomSize:function(){
        if (!this.containerDOM) {return null;}
        var containerDOM = this.containerDOM;
        var mapWidth = parseInt(containerDOM.offsetWidth,0);
        var mapHeight = parseInt(containerDOM.offsetHeight,0);
        return {
            width: mapWidth,
            height:mapHeight
        };
    },

    setMapSize:function(mSize) {
        if (!mSize) {return;}
        this.width = mSize['width'];
        this.height = mSize['height'];
        var panels = this.panels;
        panels.mapWrapper.style.width = this.width + 'px';
        panels.mapWrapper.style.height = this.height + 'px';
        panels.mapViewPort.style.width = this.width + 'px';
        panels.mapViewPort.style.height = this.height + 'px';
        panels.controlWrapper.style.width = this.width + 'px';
        panels.controlWrapper.style.height = this.height + 'px';
    },

    /**
     * 获得地图的投影坐标
     * @return {Coordinate} 投影坐标
     */
    getPCenter:function() {
        return this.pcenter;
    },

    setPCenter:function(pcenter) {
        this.pcenter=pcenter;
    },

    /**
     * 移除背景Dom对象
     */
    removeBackGroundDOM:function() {
        if (this.backgroundDOM) {
            this.backgroundDOM.innerHTML='';
            Z.DomUtil.removeDomNode(this.backgroundDOM);
            delete this.backgroundDOM;
        }
    },

    /**
     * 以像素距离移动地图中心点
     * @param  {Object} pixel 像素距离,偏移量的正负值关系如下:
     * -1,1|1,1 
     *-1,-1|1,-1
     */
    offsetCenterByPixel:function(pixel) {
        var posX = this.width/2+pixel['left'],
            posY = this.height/2+pixel['top'];
        var pCenter = this.transform({'left':posX,'top':posY});
        this.setPCenter(pCenter);
    },

    
    /**
     * 获取地图容器偏移量或增加容器的偏移量
     * @param  {Pixel} offset 增加的偏移量,如果为null,则直接返回容器的偏移量
     * @return {[type]}        [description]
     */
    offsetPlatform:function(offset) {
        if (!offset) {
            return Z.DomUtil.offsetDom(this.panels.mapPlatform);
        } else {
            var domOffset = Z.DomUtil.offsetDom(this.panels.mapPlatform);
            Z.DomUtil.offsetDom(this.panels.mapPlatform, {
                    'left':domOffset['left']+offset['left'],
                    'top':domOffset['top']+offset['top']
            });
        }
    },

    

    /**
     * transform dom position to geodesic projected coordinate
     * @param  {Object} domPos    dom screen xy, eg {left:10, top:10}
     * @param  {Number} zoomLevel current zoomLevel
     * @return {Coordinate}           Coordinate
     */
    transform:function(domPos) {
        var res = this.lodConfig['resolutions'][this.zoomLevel];
        var pcenter = this.getPCenter();
        var y = pcenter.y + this.dy*(this.height / 2 - domPos['top'])* res;
        var x = pcenter.x + this.dx*(domPos['left'] - this.width / 2)* res;
        return new Z.Coordinate(x, y);
    },

    /**
     * 相对坐标转化为地理投影坐标
     * @param  {[type]} domPos [description]
     * @return {[type]}        [description]
     */
    transformFromOffset:function(domPos) {
        return this.transform(this.domOffsetToScreen(domPos));
    },

    /**
     * transform geodesic projected coordinate to screen xy
     * @param  {[type]} pCoordinate [description]
     * @return {[type]}             [description]
     */
    untransform:function(pCoordinate) {
        var res = this.lodConfig['resolutions'][this.zoomLevel];
        var pcenter = this.getPCenter();
        // var _canvasDom = this.canvasDom;
        var centerTop = this.dy*(pcenter.y - pCoordinate.y) / res;
        var centerLeft = this.dx*(pCoordinate.x - pcenter.x) /res;
        
        var result = {
            "top" : Math.round(this.height / 2 + centerTop),
            "left" : Math.round(this.width / 2 + centerLeft)
        };
        //console.log(browserOffset.left+","+browserOffset.top);
        return result;
    },

    /**
     * 投影坐标转化为容器的相对坐标
     * @param  {Coordinate} pCoordinate 投影坐标
     * @return {Object}             容器相对坐标
     */
    untransformToOffset:function(pCoordinate) {
        var screenXY = this.untransform(pCoordinate);
        return this.screenToDomOffset(screenXY);
    },

    /**
     * 屏幕坐标到地图容器偏移坐标
     * 
     * @param screenXY
     * @returns {domOffset}
     */
    screenToDomOffset: function(screenXY) {
        if (!screenXY) {return null;}
        var platformOffset = this.offsetPlatform();
        return {
            'left' : screenXY['left'] - platformOffset['left'],
            'top' : screenXY['top'] - platformOffset['top']         
        };
        
    },
    
    /**
     * 地图容器偏移坐标到屏幕坐标的转换
     * 
     * @param domOffset
     * @returns {screenXY}
     */
    domOffsetToScreen: function(domOffset) {
        if (!domOffset) {return null;}
        var platformOffset = this.offsetPlatform();
        return {
            'left' : domOffset["left"] + platformOffset["left"],
            'top' : domOffset["top"] + platformOffset["top"]
        };
    },

    /**
     * 根据中心点投影坐标和像素范围,计算像素范围的Extent
     * @param  {Coordinate} plonlat [中心点坐标]
     * @param  {Object} pnw     [左上角像素距离]
     * @param  {Object} pse     [右下角像素距离]
     * @return {Extent}         [Extent计算结果]
     */
    computeExtentByPixelSize: function(plonlat, pnw, pse) {
        var lodConfig = this.getLodConfig();
        if (!lodConfig) {
            return null;
        }
        var projection = lodConfig.getProjectionInstance();
        var res = lodConfig['resolutions'][this.getZoomLevel()];
        var nw = projection.unproject({x: plonlat.x - pnw["left"]*res, y: plonlat.y + pnw["top"]*res});
        var se = projection.unproject({x: plonlat.x + pse["left"]*res, y: plonlat.y - pse["top"]*res});
        return new Z.Extent(nw,se);
    },

    /**
     * 在当前比例尺下将距离转换为像素
     * @param  {double} x [description]
     * @param  {[type]} y [description]
     * @return {[type]}   [description]
     */
    distanceToPixel: function(x,y) {
        var lodConfig = this.getLodConfig();
        if (!lodConfig) {
            return null;
        }
        var projection = lodConfig.getProjectionInstance();
        if (!projection) {
            return null;
        }       
        //计算前刷新scales
        var center = this.getCenter(),
            target = projection.locate(center,x,y),
            z = this.getZoomLevel(),
            resolutions = lodConfig['resolutions'];
        var px = !x?0:(projection.project({x:target.x,y:center.y}).x-projection.project(center).x)/resolutions[z];
        var py = !y?0:(projection.project({x:target.x,y:center.y}).y-projection.project(target).y)/resolutions[z];
        return {'px':Math.round(Math.abs(px)),'py':Math.round(Math.abs(py))};
    },

    /**
     * 像素转化为距离
     * @param  {[type]} px [description]
     * @param  {[type]} py [description]
     * @return {[type]}    [description]
     */
    pixelToDistance:function(px, py) {
        var lodConfig = this.getLodConfig();
        if (!lodConfig) {
            return null;
        }
        var projection = lodConfig.getProjectionInstance();
        if (!projection) {
            return null;
        }       
        //计算前刷新scales
        var center = this.getCenter(),
            pcenter = this.getPCenter(),
            res = lodConfig['resolutions'][this.getZoomLevel()];
        var pTarget = {x:pcenter.x+px*res, y:pcenter.y+py*res};
        var target = projection.unproject(pTarget);
        return projection.getGeodesicLength(target,center);
    },

    /**
     * [createVectorPaper description]
     * @return {[type]} [description]
     */
    createSVGPaper: function(){
        var map = this;
        if (map.vectorPaper) {return;}
        var svgContainer = this.panels.svgContainer;        
        map.vectorPaper = Z.SVG.createContainer();
        this.refreshSVGPaper();
        svgContainer.appendChild(map.vectorPaper);
    },

    refreshSVGPaper: function() {
        var map = this;
        var paper = map.vectorPaper;
        if (paper) {
            Z.SVG.refreshContainer(map,paper);
        }        
    },
    
    /**
     * initialize container DOM of panels
     */
    initContainer:function() {
        var containerDOM;
        if (Z.Util.isString(this.container)) {
            containerDOM = document.getElementById(this.container);
            if (!containerDOM) {
                throw new Error('invalid container id: \''+this.container+'\'');
            }
        } else {
            if (!this.container || !this.container.appendChild) {
                throw new Error('invalid container element');
            }
            containerDOM = this.container;
        }
        this.containerDOM = containerDOM;
        containerDOM.innerHTML = '';

        var controlWrapper = Z.DomUtil.createEl('div');

        var _controlsContainer = Z.DomUtil.createEl('div');
        _controlsContainer.style.cssText = 'z-index:3002';
        controlWrapper.appendChild(_controlsContainer);
        //map wrapper定义了全局的背景色, hidden overflow等css属性
        var mapWrapper = Z.DomUtil.createEl('div');
        mapWrapper.style.cssText = 'position:absolute;overflow:hidden;';
        mapWrapper.className='MAP_TILE_BACK';
        containerDOM.appendChild(mapWrapper);

        // 最外层的div
        var _mapPlatform = Z.DomUtil.createEl('div');
        _mapPlatform.id='_mapPlatform';
        _mapPlatform.style.cssText = 'position:absolute;top:0px;left:0px;';
        mapWrapper.appendChild(_mapPlatform);
        mapWrapper.appendChild(controlWrapper);

        var _mapViewPort = Z.DomUtil.createEl('div');
        _mapViewPort.id='_mapViewPort';
        _mapViewPort.style.cssText = 'position:absolute;top:0px;left:0px;z-index:10;-moz-user-select:none;-webkit-user-select: none;';
        _mapPlatform.appendChild(_mapViewPort);

        var _mapContainer = Z.DomUtil.createEl('div');

        _mapContainer.style.cssText = 'position:absolute;top:0px;left:0px;';
        _mapContainer.style.border = 'none';
        //var _backContainer = _mapContainer.cloneNode(false);
        var _tipContainer = _mapContainer.cloneNode(false);
        var _popMenuContainer = _mapContainer.cloneNode(false);
        var _contextCtrlContainer = _mapContainer.cloneNode(false);
        var _svgContainer = _mapContainer.cloneNode(false);
        var _canvasLayerContainer = _mapContainer.cloneNode(false);
        
        _mapContainer.style.zIndex = 10;
        _mapContainer.id='mapContainer';
        _canvasLayerContainer.style.zIndex=100;
        _svgContainer.style.zIndex = 200;
        _popMenuContainer.style.zIndex = 3000;
        _contextCtrlContainer.style.zIndex = 3000;
        _tipContainer.style.zIndex = 3001;
        
        _mapViewPort.appendChild(_mapContainer);

        _contextCtrlContainer.appendChild(_tipContainer);
        _contextCtrlContainer.appendChild(_popMenuContainer);
        _mapPlatform.appendChild(_contextCtrlContainer);
        _mapViewPort.appendChild(_canvasLayerContainer);
        _mapViewPort.appendChild(_svgContainer);

        //解决ie下拖拽矢量图形时，底图div会选中变成蓝色的bug
        if (Z.Browser.ie) {
            _mapViewPort['onselectstart'] = function(e) {
                return false;
            };
            _mapViewPort['ondragstart'] = function(e) { return false; };
            _mapViewPort.setAttribute('unselectable', 'on');
            
            _mapContainer['onselectstart'] = function(e) {
                return false;
            };
            _mapContainer['ondragstart'] = function(e) { return false; };
            _mapContainer.setAttribute('unselectable', 'on');
            
            
            controlWrapper['onselectstart'] = function(e) {
                return false;
            };
            controlWrapper['ondragstart'] = function(e) { return false; };
            controlWrapper.setAttribute('unselectable', 'on');
            
            mapWrapper.setAttribute('unselectable', 'on');
            _mapPlatform.setAttribute('unselectable', 'on');
        } 


        //store panels 
        var panels = this.panels;
        panels.controlWrapper = controlWrapper;
        panels.mapWrapper = mapWrapper;
        panels.mapViewPort = _mapViewPort;
        panels.mapPlatform = _mapPlatform;
        panels.mapContainer = _mapContainer;
        panels.tipContainer = _tipContainer;
        panels.popMenuContainer = _popMenuContainer;
        panels.svgContainer = _svgContainer;
        panels.canvasLayerContainer = _canvasLayerContainer;
//      
//      
        //初始化mapPlatform的偏移量, 适用css3 translate时设置初始值
        this.offsetPlatform({
            'left':0,
            'top':0
        });
        var mapSize = this.getContainerDomSize();
        this.setMapSize(mapSize);
    },

    /**
    * 获取地图容器
    */
    getPanels: function() {
        return this.panels.mapViewPort;
    },

    /**
     * 设置地图的watcher, 用来监视地图容器的大小变化
     */
    initContainerWatcher:function() {
        var map = this;
        map.watcher = setInterval(function() {
            var watched = map.getContainerDomSize();
            if (map.width !== watched.width || map.height !== watched.height) {
                var oldHeight = map.height;
                var oldWidth = map.width;
                map.setMapSize(watched);
                map.onResize({
                    'left' : ((watched.width-oldWidth) / 2),
                    'top' : ((watched.height-oldHeight) / 2)
                    });
                // 触发onresize事件
                /**
                 * 地图容器大小变化事件
                 * @event resize
                 * @param target {seegoo.maps.Map} 触发事件的地图对象
                 */
                map.fire(map.events.RESIZE, {
                    'target' : map
                });
            }
        },800); 
    }
});

//--------------地图载入完成后的钩子处理----------------

Z.Map.prototype._callOnLoadHooks=function() {     
    var proto = Z.Map.prototype;   
    for (var i = 0, len = proto._onLoadHooks.length; i < len; i++) {
        proto._onLoadHooks[i].call(this);
    }
};

/**
 * 添加底图加载完成后的钩子
 * @param {Function} fn 执行回调函数
 * @export
 */
Z.Map.addOnLoadHook = function (fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var onload = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._onLoadHooks = this.prototype._onLoadHooks || [];
    this.prototype._onLoadHooks.push(onload);
};
Z.Map.include({
    cartoCSS:function(css) {
        if (!Z.Util.isString(css) || css.length===0) {
            return;
        }
        if (!window['carto']) {
            //载入carto.js
           Z.loadModule('carto',function() {
                this.loadCartoCSS(css);
           },this);
        } else {
            this.loadCartoCSS(css);
        }
        
    },

    loadCartoCSS:function(css) {
        var suffix = '.mss';
        var isMss=css.indexOf(suffix, css.length - suffix.length) !== -1;
        if (isMss) {
            Z.Util.Ajax.getResource(css,function(resource) {
                this.rendCartoCSS(resource);
            },this);
        } else {
            this.rendCartoCSS(css);
        }
    },

    rendCartoCSS:function(cssContent) {
        var shader = new window['carto']['RendererJS']()['render'](cssContent);
        this.cartoCSSShader = shader;
        this.fireEvent('cartocssloaded');
    },

    /**
     * 根据输入的geometry获取cartoCSS中定义的样式
     * @param  {Geometry} geometry Geometry对象
     * @return {Object}          cartoCSS中定义的样式
     */
    cartoCSSGeometry:function(geometry) {
        if (!this.cartoCSSShader || !geometry || !geometry.getLayer()) {
            return null;
        }
        var layerId = geometry.getLayer().getId();
        if (!layerId) {
            return null;
        }
        var layerShader = this.cartoCSSShader['findLayer']({'name':'#'+layerId});
        var symbol = layerShader['getStyle'](geometry.getProperties(), { 'zoom': this.getZoomLevel() });
        return symbol;
    }
});

Z.Map.mergeOptions({
    'enableCartoCSS' : true
});

Z.Map.mergeOptions({
	'dragging': true
});

Z.Map.Drag = Z.Handler.extend({
	addHooks: function () {
		if (!this['draggable']) {
            var map = this['map'];
            if (!map) return;
            this.dom = map.containerDOM;
            if (!Z.Browser.mobile) {
                this['draggable'] = new Z.Handler.Drag(this.dom);
            }
            //TODO 其它触摸屏幕
            /*else {
                this['draggable'] = new Z.Handler.Touch(this.dom);
            }*/

            this['draggable'].on("dragstart", this._onDragStart, this);
            this['draggable'].on("dragging", this._onDragging, this);
            this['draggable'].on("dragend", this._onDragEnd, this);
		}
		this['draggable'].enable();
	},

	removeHooks: function () {
		this['draggable'].disable();
	},

	_onDragStart:function(param) {
        var me = this;
        me.map.allowSlideMap=false;
        var map = me.map;
        me.startDragTime = new Date().getTime();
        var domOffset = me.map.offsetPlatform();
        me.startLeft = domOffset['left'];
        me.startTop = domOffset['top'];
        me.preX = param['mousePos']['left'];
        me.preY = param['mousePos']['top'];
        me.startX = me.preX;
        me.startY = me.preY;
        map.fireEvent('movestart');
    },

    _onDragging:function(param) {
        var me = this;
        var map = me.map;
        var mx = param['mousePos']['left'],
            my = param['mousePos']['top'];
        var currentDomLeft = (me.startLeft + mx - me.startX);
        var currentDomTop = (me.startTop + my - me.startY);
        var domOffset = me.map.offsetPlatform();
        me.map.offsetPlatform({
            'left':currentDomLeft-domOffset['left'],
            'top':currentDomTop-domOffset['top']
        });
        map.offsetCenterByPixel({"left":-(currentDomLeft-domOffset['left']),"top":-(currentDomTop-domOffset['top'])});
        me.map.onMoving({'target':map});
        map.fireEvent('moving');
    },

    

    _onDragEnd:function(param) {
        var me = this;
        me.map.allowSlideMap=true;
        var map = me.map;
        var t = new Date().getTime()-me.startDragTime;
        var domOffset = me.map.offsetPlatform();
        var xSpan =  domOffset['left'] - me.startLeft;
        var ySpan =  domOffset['top'] - me.startTop;
        if (t<280 && Math.abs(ySpan) > 5 && Math.abs(xSpan) > 5) {
            map.animatePan({"top":ySpan*Math.ceil(500/t), "left":xSpan*Math.ceil(500/t)});
        } else {
            map.onMoveEnd({'target':map});
        }
        map.fireEvent('moveend');
    }
});

Z.Map.addInitHook('addHandler', 'dragging', Z.Map.Drag);
Z.Map.mergeOptions({
	'doubleClickZoom': true
});

Z.Map.DoubleClickZoom = Z.Handler.extend({
	addHooks: function () {
		this.map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this.map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		if(this.map['doubleClickZoom']) {
			var oldZoom = this.map.getZoomLevel(),
				zoom = e.originalEvent.shiftKey ? Math.ceil(oldZoom) - 1 : Math.floor(oldZoom) + 1;
			var mouseOffset = Z.DomUtil.getEventDomCoordinate(e, this.map.containerDOM);
			this.map.zoom(zoom, mouseOffset);
		}
	}
});

Z.Map.addInitHook('addHandler', 'doubleClickZoom', Z.Map.DoubleClickZoom);

Z.Map.mergeOptions({
	'scrollWheelZoom': true,
	'wheelDebounceTime': 40
});

Z.Map.ScrollWheelZoom = Z.Handler.extend({
	addHooks: function () {
        var map = this.map;
		var containerDOM = map.containerDOM;
		// if(document.addEventListener){
			Z.DomUtil.addDomEvent(containerDOM, 'mousewheel', this._onWheelScroll, this);
		// }
	},

	removeHooks: function () {
		var map = this.map;
		var containerDOM = map.containerDOM;
		Z.DomUtil.removeDomEvent(containerDOM, 'mousewheel', this._onWheelScroll);
	},

	_onWheelScroll: function (evt) {
		// var wheelExecutor = null;
        var map = this.map;
		var containerDOM = map.containerDOM;
		// if (!map.mouseTool) {return;}
		if (map.zooming) {return;}
		// if (!evt) {evt = window.event;}

		var _levelValue = 0;
		_levelValue += (evt.wheelDelta?evt.wheelDelta:evt.detail) > 0 ? 1 : -1;
		if (evt.detail) {
			_levelValue *= -1;
		}
		var mouseOffset = Z.DomUtil.getEventDomCoordinate(evt, containerDOM);
		if (this.wheelExecutor) {
			clearTimeout(this.wheelExecutor);
		}
		this.wheelExecutor = setTimeout(function () {
			map.zoom(map.zoomLevel + _levelValue, mouseOffset);
		},40);

		return false;
	}
});

Z.Map.addInitHook('addHandler', 'scrollWheelZoom', Z.Map.ScrollWheelZoom);

Z.Map.mergeOptions({
	'eventToGeometry': true,
	'mouseoverTarget': []
});

Z.Map.EventToGeometry = Z.Handler.extend({
	addHooks: function() {
        this.map.on('mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this)
        		.on('moving', this._stopQueryGeometries, this)
        		.on('moveend', this._startQueryGeometries, this);
	},

	removeHooks: function() {
		this.map.off('mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);
	},

	_stopQueryGeometries: function(event) {
		this.removeHooks();
	},

	_startQueryGeometries: function(event) {
		this.addHooks();
	},

	_queryGeometries: function(event) {
		var eventType = event['originalEvent']['type'];
		var mouseOffset = Z.DomUtil.getEventDomCoordinate(event, this.map.containerDOM);
		var coordinate = this.map.screenPointToCoordinate(mouseOffset);
		var radius = this.map.pixelToDistance(10, 0);
		var layers = [];
		//2015-07-09 fuzhen dynamiclayer不需要做identify
		layers = layers.concat(this.map.canvasLayers)/*.concat(this.map.dynLayers)*/;

		this.options = {
			'coordinate': coordinate,
			'radius': radius,
			'layers': layers,
			'success': Z.Util.bind(fireGeometryEvent, this)
		};

		if ('mousemove' === eventType) {
			//mousemove才需要做15ms的判断
			var throttle = 15;//15毫秒
			if (this.identifyTimeout) {
				clearTimeout(this.identifyTimeout);
			}
			var me = this;
			this.identifyTimeout = setTimeout(function() {
				me.map.identify(me.options);
			},throttle);
		} else {
			//如果不是mousemove,则立即执行, 不然点击时, 只会响应mousedown, 后续的mouseup和click等都会被timeout屏蔽掉
			this.map.identify(this.options);
		}

		function fireGeometryEvent(result) {
			if(!result['success']){return false;};
            var geometries = result['data'];
			var mouseoutTargets = [];
			if(eventType === 'mousemove') {
				var oldTargets = me.map.options['mouseoverTarget'];
				if (Z.Util.isArrayHasData(oldTargets)) {
					for(var i=0,len=oldTargets.length; i<len; i++) {
						var oldTarget = oldTargets[i];
						if(geometries && geometries.length>0) {
							var mouseout = true;
							/**
							* 鼠标经过的新位置中不包含老的目标geometry
							*/
							for(var j=0,size=geometries.length; j<size; j++) {
								var geometry = geometries[j];
								if(oldTarget === geometry) {
									mouseout = false;
									break;
								}
							}
							if(mouseout) {
								oldTarget.onMouseOut(event);
							}
						} else {//鼠标新的位置不包含任何geometry，将触发之前target的mouseOut事件
							oldTarget.onMouseOut(event);
						}
					}
				}
				if(!geometries) {return;}
				for(var i=0,len=geometries.length; i<len; i++) {
					var geometry = geometries[i];
					geometry.onMouseOver(event);
				}
				me.map.options['mouseoverTarget'] = geometries;
			} else {
				if(!geometries) {return;}
				for(var i=0,len=geometries.length; i<len; i++) {
					var geometry = geometries[i];
					geometry.onEvent(event);
				}
			}
		};

	}
});

Z.Map.addInitHook('addHandler', 'eventToGeometry', Z.Map.EventToGeometry);
Z['InfoWindow'] = Z.InfoWindow = Z.Class.extend({

        /**
        * 异常信息定义
        */
        'exceptionDefs':{
            'en-US':{
                'MUST_PROVIDE_OBJECT':'You must provide object which infowindow add to.'
            },
            'zh-CN':{
                'MUST_PROVIDE_OBJECT':'必须提供添加信息框的对象。'
            }
        },

        statics:{
           'template': "<div class=\"MAP_CONTROL_api MAP_CONTROL_msg\" style=\"z-index:10;cursor:default;display:none;padding:0 0 35px 15px;\">"+
                        "<div style=\"width:345px; height:auto !important;height:150px;min-height:150px; border:1px solid #999; background:#fff;\">"+
                            "<div style=\"font-size:14px; height:30px; line-height:30px; background:#f9f9f9; border-bottom:1px solid #ccc; font-weight:bold; padding-left:15px;\">" +
                                "<span style=\"display:block; float:left;\"></span>" +
                                '<div style="position:relative;float:right;height:30px;width:20px;padding-top:10px;line-height: 0px;">'+
                                    "<a href=\"javascript:void(0)\" class=\"MAP_CONTROL_close\" onclick=\"this.parentNode.parentNode.parentNode.parentNode.m.hide()\"><img width=\"10px\" height=\"10px\" src=\""+Z.host+"/engine/images/tip_close.gif\" style=\"border:none;\"/></a>" +
                                '</div>'+
                            "</div>"+
                            "<div style=\"padding:10px; line-height:20px; color:#444\">"+
                            "</div>"+
                        "</div>"+
                        "<div class=\"MAP_CONTROL_api MAP_CONTROL_jiantou\"></div>"+
                        //"<div style=\"position:absolute;top:0px;left:0px;z-index:10;\"><img src=\""+seegoo.maps.config.host+"/engine/images/shadow.png\" style=\"border:none;\"/></div>"+
                     "</div>"
        },

        /**
        * 初始化信息窗口
        * @return {InfoWindow}
        */
        initialize:function (tipOption) {
            if(tipOption) {
                this.setOption(tipOption);
            }
            return this;
        },

        /**
        * 将信息框添加到对象上
        * @param {Object} map/geometry
        */
        addTo: function(target) {
            var map;
            if(target instanceof Z['Map']) {
                map = target;
            } else { //Geometry的情况
                map = target.getMap();
            }
            if(!map) {
                throw new Error(this.exceptions['ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU']);
            }
            this.target = target;
            this._addEvent(map);
            return this;
        },

        /**
        * 显示信息窗口前
        * @param 参数
        */
        beforeOpen: function(param) {
            var beforeopenFn = this.tipOption['beforeopen'];
            if(beforeopenFn){
                var argLen = beforeopenFn.length;
                if(argLen == 2) {
                    beforeopenFn(param, Z.Util.bind(this.show, this));
                } else {
                    beforeopenFn(param);
                    this.show();
                }
            }
            return this;
        },

        /**
        * 菜单监听地图的事件
        * @param {Map} map
        */
        _addEvent:function(map) {
            this.map = map;
            if (!this.map) {
                return;
            }
            this.map.panels.tipContainer.innerHTML = Z.InfoWindow['template'];
            this.tipDom = this.map.panels.tipContainer.childNodes[0];
            this.tipDom["m"] = this;
            this.msgBox = this.tipDom.childNodes[0].childNodes[1];
            //onmousedown事件解决弹出框内容无法选中的问题
            if(!this.msgBox.addEvent) {
                this._removeEvent();
                Z.DomUtil.addDomEvent(this.msgBox,'mousedown', this.stopPropagation);
                Z.DomUtil.addDomEvent(this.msgBox,'dblclick', this.stopPropagation);
                this.map.on('zoomstart', this.onZoomStart, this);
                this.map.on('zoomend', this.onZoomEnd, this);
                this.msgBox.addEvent = true;
            }
        },

        /**
        * 菜单监听地图的事件
        * @param {Map} map
        */
        _removeEvent:function() {
            Z.DomUtil.removeDomEvent(this.msgBox,'mousedown', this.stopPropagation);
            Z.DomUtil.removeDomEvent(this.msgBox,'dblclick', this.stopPropagation);
            this.map.off('zoomstart', this.onZoomStart, this);
            this.map.off('zoomend', this.onZoomEnd, this);
        },

        stopPropagation: function(event) {
            Z.DomUtil.stopPropagation(event);
        },

        onZoomStart:function() {
            this.map.panels.tipContainer.style.display='none';
        },

        onZoomEnd:function() {
            if (this.visible) {
                //style.display=''必须要在调用 offsetTipDom之前, 要不然tipDom.clientHeight和clientWidth取到的值为0
                this.map.panels.tipContainer.style.display='';
                this.offsetTipDom();
            }
        },

        /**
        * 设置InfoWindow窗口
        * @param {Array} tipOption 项
        * {"items":[], width:240, beforeopen:fn}
        * @export
        */
        setOption: function(tipOption) {
            if (!tipOption) {
                return;
            }
            if(this.tipOption) {
                this.tipOption['title'] = tipOption['title'];
                this.tipOption['content'] = tipOption['content'];
                if(tipOption['beforeopen']) {
                    this.tipOption['beforeopen'] = tipOption['beforeopen'];
                }
            } else {
                this.tipOption = tipOption;
            }
        },

        /**
        * 隐藏信息框
        * @export
        */
        hide:function() {
            this.visible = false;
            this.tipDom.style.display="none";
        },

        /**
         * 判断信息框是否打开
         * @returns {Boolean}
         */
        isOpen:function() {
            return this.visible;
        },

        /**
        * 显示信息框
        * @param {Coordinate} 信息框打开坐标
        */
        show:function(coordinate) {
            if (!this.map) {
                return;
            }
            if (!this.map.options['enableInfoWindow']) return;
            this.hide();
            this.visible = true;
            var map = this.map;
            var tipDom = this.tipDom;
            tipDom.style.display='';
            this.map.panels.tipContainer.style.display='';
            var tipOption = this.tipOption;
            if (tipOption['width']) {
                tipDom.childNodes[0].style.width = tipOption['width']+'px';
            }
            var titleNode = tipDom.childNodes[0].childNodes[0].childNodes[0];
            var contentNode =tipDom.childNodes[0].childNodes[1];    
            if (tipOption['title']) {
                titleNode.style.display = '';
                titleNode.innerHTML = tipOption['title'];
            } else {
                titleNode.style.display = 'none';
            }
            if (tipOption['content']) {
                contentNode.innerHTML = tipOption['content'];
            }

            var tipCoord = this.offsetTipDom(coordinate);
            var size = this.map.getSize();
            var mapWidth = size['width'],
                mapHeight = size['height'];
            if (0 === mapWidth || 0 === mapHeight) {return;}
            //只有当tip不是地图打开的时候，才做tip打开滑动操作
            var absolute = map.domOffsetToScreen(tipCoord);
            var left = 0;
            var top=0;
            if ((absolute["left"])<0) {
                left=-(absolute["left"]-parseInt(tipDom.clientWidth)/2);
            } else if ((absolute["left"]+parseInt(tipDom.clientWidth)-35)>mapWidth) {
                left=(mapWidth-(absolute["left"]+parseInt(tipDom.clientWidth)*3/2));
            } 
            if (absolute["top"]<0) {
                top=-absolute["top"]+10;
            } else if (absolute["top"] > mapHeight){
                top = (mapHeight-absolute["top"]-parseInt(tipDom.clientHeight))-30;
            }
            
            if (top !== 0 || left !== 0) {
                this.tipSlidingExecutor = map.animatePan({"left":left,"top":top});
            }
            return this;
        },

        /**
        * 获取信息框打开位置
        * @param {Coordiante} 信息框对象所在坐标
        * @return {Pixel} 信息框打开位置
        */
        offsetTipDom: function(coordinate) {
            var pxCoord = this._getShowPosition(coordinate);
            var tipDom = this.tipDom;
            var tipCoord = {
                'top':parseInt(pxCoord.top-parseInt(tipDom.clientHeight)),
                'left':parseInt(pxCoord.left-parseInt(tipDom.clientWidth)/2+38)
            };
            tipDom['style']['top'] = tipCoord["top"]+"px";
            tipDom['style']['left'] = tipCoord["left"]+"px";
            return tipCoord;
        },

        /**
        * 获取菜单显示位置
        * @param {Coordinate} 菜单显示位置
        * @return {Pixel} 菜单显示位置像素坐标
        */
        _getShowPosition: function(coordinate) {
            var position;
            if(!coordinate) {
                coordinate = this.showPosition;
            }
            if(coordinate){
                if(coordinate instanceof Z['Coordinate']) {
                    position = this.coordinateToScreenPoint(coordinate);
                } else {
                    position = coordinate;
                }
            } else {
                var center = this.target.getCenter();
                var projection = this.map.getProjection();
                if (!center || !projection) return null;
                var pcenter = projection.project(center);
                var geoTipPos = this.map.untransformToOffset(pcenter);
                position = {
                    'left': geoTipPos['left'],
                    'top' : geoTipPos['top']
                };
            }
            return position;
        }
});
/**
* 菜单类定义各种菜单
*/
Z['Menu'] = Z.Menu = Z.Class.extend({
    /**
    * 异常信息定义
    */
    'exceptionDefs':{
        'en-US':{
            'ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU':'The menu only can add to  map or geometry.'
        },
        'zh-CN':{
            'ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU':'只有Map或Geometry对象才能添加菜单。'
        }
    },

    statics:{
        'template': "<div style=\"position:absolute;cursor:pointer;display:none;width:130px; background:#F0F0F0; color:#3C7796; border:solid 1px #CCCCCC; \"><ul style=\"list-style:none; padding:0px; margin:0px;\">" +
            "</ul></div>",
        'cssMenuItem': "padding:0; display:block; margin:1px; height:24px; line-height:24px;color:#3C7796; font-size:12px; padding:0px 0px 0px 21px;",
        'cssMenuItem_over': "border:solid 1px #CCCCCC; padding:0; display:block; margin:1px; height:22px; line-height:22px; color:#3C7796; font-size:12px; padding:0px 0px 0px 20px;"
    },

    /**
    * 初始化Menu
    * @param {Json} menuOption
    * menuOption:{"items":[], width:240, beforeopen:fn, showPostion:{coordinate/piexl}}
    * @return {Menu} menu
    */
    initialize: function(menuOption) {
        if(menuOption) {
            this.setOption(menuOption);
        }
        return this;
    },

    /**
    * 将菜单添加到目标对象上
    * @param {Object} map/geometry
    * @export
    */
    addTo: function(target) {
        var map;
        if(target instanceof Z['Map']) {
            map = target;
        } else { //Geometry的情况
            map = target.getMap();
        }
        if(!map) {
            throw new Error(this.exceptions['ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU']);
        }
        this.target = target;
        this._addEvent(map);
        return map;
    },

    /**
    * 显示菜单前
    * @param 参数
    */
    beforeOpen: function(param) {
        var beforeopenFn = this.menuOption['beforeopen'];
        if(beforeopenFn){
            var argLen = beforeopenFn.length;
            if(argLen == 2) {
                beforeopenFn(param, Z.Util.bind(this.show, this));
            } else {
                beforeopenFn(param);
                this.show();
            }
        }
        return this;
    },

    /**
    * 菜单监听地图的事件
    * @param {Map} map
    */
    _addEvent:function(map) {
        this.map = map;
        this.map.panels.popMenuContainer.innerHTML = Z['Menu']['template'];
        this.menuDom = this.map.panels.popMenuContainer.firstChild;
        if(!this.menuDom.addEvent) {
            this.closeMenu();
            this._removeEvent(map);
            map.on('zoomstart', this.hide, this);
            map.on('zoomend', this.hide, this);
            map.on('movestart', this.hide, this);
            map.on('dblclick', this.hide, this);
            map.on('click', this.hide, this);
            this.menuDom.addEvent = true;
        }
    },

    /**
    * 菜单监听地图的事件
    * @param {Map} map
    */
    _removeEvent:function(map) {
        map.off('zoomstart', this.hide);
        map.off('zoomend', this.hide);
        map.off('movestart', this.hide);
        map.off('dblclick', this.hide);
        map.off('click', this.hide);
    },

    /**
    * 设置Map的右键菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @export
    */
    setOption: function(menuOption) {
        if (!menuOption) {
            return;
        }
        if (!menuOption['width']) {
            menuOption['width'] = 240;
        }
        if(this.menuOption) {
            this.menuOption['width'] = menuOption['width'];
            this.menuOption['items'] = menuOption['items'];
            if(menuOption['beforeopen']) {
                this.menuOption['beforeopen'] = menuOption['beforeopen'];
            }
        } else {
            this.menuOption = menuOption;
        }
    },

    /**
    * 设置菜单项目
    * @param {Array} menuItems 菜单项
    * @return {Menu} 菜单
    * @export
    */
    setItems: function(items) {
        if (!items) {
            return;
        }
        this.menuOption['items'] = items;
        return this;
    },

   /**
    * 返回Map的菜单设置
    * @return {Object} 菜单设置
    * @export
    */
    getOption: function() {
        return this.menuOption;
    },

    /**
     * 关闭Map的右键菜单
     * @return {[type]} [description]
     * @export
     */
    closeMenu:function() {
        if (this.menu) {
            this.menu.hide();
        }
        return this;
    },

    /**
     * 移除Map的右键菜单设置
     * @export
     */
    removeMenu:function() {
        delete this.menuOption;
        if (this.menu) {
            this.menu.hide();
        }
        return this;
    },

    /**
    * 隐藏菜单
    * @export
    */
    hide: function() {
        if (this.isOpen()) {
            this.menuDom.style.display="none";
            if (this.hasListeners && this.hasListeners('closemenu')) {
                /**
                 * 右键菜单关闭事件
                 * @event closemenu
                 * @param target {seegoo.maps.Geometry} 产生事件的Geometry
                 */
                this.executeListeners('closemenu',{"target":this});
            }
        }
    },

    /**
    *  判断菜单是否打开
    *  @returns {Boolean}
    */
    isOpen:function() {
        return (this.menuDom.style.display!="none");
    },

    /**
    * 显示菜单
    * @param {Coordinate} 坐标
    */
    show:function(coordinate) {
        var menuOption = this.menuOption;
        var pxCoord = this._getShowPosition(coordinate);
        if (Z.Util.isNil(pxCoord) || Z.Util.isNil(menuOption)) {return;}
        this._clearDomAndBindEvent();
        this.hide();
        var me = this;
        var menuDom = me.menuDom;
        menuDom.style.width = menuOption['width']+'px';
        var ulDom = menuDom.firstChild;
        ulDom.innerHTML = '';
        var items = menuOption['items'];
        for (var i=0, len=items.length;i<len;i++) {
            var item = items[i];
            var menuItem = Z.DomUtil.createEl('li');
            menuItem.style.cssText = Z.Menu['cssMenuItem'];
            Z.DomUtil.removeDomNode(menuItem,'mouseover',function(e){
                this.style.cssText = Z.Menu['cssMenuItem_over'];
            });
            Z.DomUtil.removeDomNode(menuItem,'mouseout',function(e){
                this.style.cssText = Z.Menu['cssMenuItem'];
            });
            menuItem['callback'] = item['callback'];
            menuItem['index'] = i;
            Z.DomUtil.removeDomNode(menuItem,'click',function(e) {
                Z.DomUtil.stopPropagation(e);
                var result = this['callback']({'target':me,'index':this['index']});
                if (!Z.Util.isNil(result) && !result) {
                    return;
                }
                me.hide();
            });
            Z.DomUtil.removeDomNode(menuItem,'mousedown',function(e) {
                Z.DomUtil.stopPropagation(e);
                return false;
            });
            Z.DomUtil.removeDomNode(menuItem,'mouseup',function(e) {
                Z.DomUtil.stopPropagation(e);
                return false;
            });
            Z.DomUtil.removeDomNode(menuItem,'dblclick',function(e) {
                Z.DomUtil.stopPropagation(e);
                return false;
            });
            menuItem.innerHTML = item['item'];
            ulDom.appendChild(menuItem);
        }
        //添加菜单项
        menuDom['style']['top'] = pxCoord['top']+'px';
        menuDom['style']['left'] = pxCoord['left']+'px';
        menuDom.style.display = '';
        if (me.hasListeners && me.hasListeners('openmenu')) {
            /**
             * 右键菜单打开事件
             * @event openmenu
             * @param target {seegoo.maps.Geometry} 产生事件的Geometry
             */
            me.fire('openmenu',{'target':me});
        }
        return this;
    },

    /**
    * 清理之前的事件，并绑定新的事件
    */
    _clearDomAndBindEvent: function() {
        var firstChild = this.map.panels.popMenuContainer.firstChild;
        Z.DomUtil.removeDomNode(firstChild);
        this._addEvent(this.map);
    },


    /**
    * 获取菜单显示位置
    * @param {Coordinate} 菜单显示位置
    * @return {Pixel} 菜单显示位置像素坐标
    */
    _getShowPosition: function(coordinate) {
        var position;
        if(!coordinate) {
            coordinate = this.showPosition;
        }
        if(coordinate){
            if(coordinate instanceof Z.Coordinate) {
                position = this.coordinateToScreenPoint(coordinate);
            } else {
                position = coordinate;
            }
        } else {
            var center = this.target.getCenter();
            var projection = this.map.getProjection();
            if (!center || !projection) return null;
            var pcenter = projection.project(center);
            var geoTipPos = this.map.untransformToOffset(pcenter);
            position = {
                'left': geoTipPos['left'],
                'top' : geoTipPos['top']
            };
        }
        return position;
    }

});
Z['Control'] = Z.Control = Z.Class.extend({

	/**
	* 异常信息定义
	*/
	'exceptionDefs':{
		'en-US':{
			'NEED_ID':'You must set id to Control.'
		},
		'zh-CN':{
			'NEED_ID':'你必须为Control设置id。'
		}
	},

	statics: {
		'top_left' : {'top': '40','left': '60'},
		'top_right' : {'top': '40','right': '60'},
		'bottom_left' : {'bottom': '20','left': '60'},
		'bottom_right' : {'bottom': '20','right': '60'},
		'controls': {},
		'getControl': function(id) {
			var obj = Z.Control['controls'];
			for(var key in obj) {
                if(key==id) {
                	return obj[key];
                }
            }
		}
	},

    options:{
    	'position' : this['top_left']
	},

	initialize: function (options) {
		this.setOption(options);
		return this;
	},

	addTo: function (map) {
		var id = this.options['id'];
		if(!id) throw new Error(this.exceptions['NEED_ID']);
		this.remove();
		this._map = map;
		this._controlContainer = map.panels.controlWrapper;

		this._container = Z.DomUtil.createEl('div');
		Z.DomUtil.setStyle(this._container, 'z-index: 3003');
		var controlDom = this.buildOn(map);
		if(controlDom) {
			this._updateContainerPosition();
			this._container.appendChild(controlDom);
			this._controlContainer.appendChild(this._container);
		}
		this._afterAdd();
		Z.Control['controls'][id] = this;
		return this;
	},

	_updateContainerPosition: function(){
		var position = this.options['position'];
		if(position) {
			Z.DomUtil.setStyle(this._container, 'position:absolute');
		}
		if(position['top']) {
			Z.DomUtil.setStyle(this._container, 'top: '+ position['top']+'px');
		}
		if(position['right']) {
			Z.DomUtil.setStyle(this._container, 'right: '+ position['right']+'px');
		}
		if(position['bottom']) {
			Z.DomUtil.setStyle(this._container, 'bottom: '+ position['bottom']+'px');
		}
		if(position['left']) {
			Z.DomUtil.setStyle(this._container, 'left:'+ position['left']+'px');
		}
	},

	/**
	* @export
	*/
	setOption: function(options) {
		if (options) {
			this.options = options;
		}
		return this;
	},

	/**
	* @export
	*/
	getOption: function(options) {
		return this.options;
	},

	/**
	* @export
	*/
	getPosition: function () {
		return this.options['position'];
	},

	/**
	* @export
	*/
	setPosition: function (position) {
		var map = this._map;
		if (map) {
			map['removeControl'](this);
		}
		this.options['position'] = position;
		if (map) {
			map['addControl'](this);
		}
		this._updateContainerPosition();
		return this;
	},

	getContainer: function () {
		return this._container;
	},

	remove: function () {
		if (!this._map) {
			return this;
		}
		Z.DomUtil.removeDomNode(this._container);
		if (this.onRemove) {
			this.onRemove(this._map);
		}
		this._map = null;
		return this;
	},

	_afterAdd: function() {

    },

	_getInternalLayer: function(map, layerId, canvas) {
		if(!map) return;
        var layer = map.getLayer(layerId);
        if(!layer) {
        	if(canvas) {
				layer = new Z.CanvasLayer(layerId);
        	} else {
				layer = new Z.SVGLayer(layerId);
        	}
			map.addLayer(layer);
        }
        return layer;
	}

});

Z.Map.include({
	/*
	* 添加control
	* @export
	*/
	'addControl': function (control) {
		control.addTo(this);
		return this;
	},

	/*
	* 删除control
	* @export
	*/
	'removeControl': function (control) {
		control.remove();
		return this;
	}

});
Z['Control']['Zoom'] = Z.Control.Zoom = Z.Control.extend({

	options:{
		'id': 'CONTROL_ZOOM',
		'position' : Z.Control['top_right']
	},

	buildOn: function (map) {
		this._zoomControlContainer = Z.DomUtil.createElOn('div', 'display:inline-block;_zoom:1;*display:inline;');
        this._zoomInButton  = this._createButton('放大', 'control_zoom_button control_zoom_in', this._zoomIn);
		this._zoomLevelLabel = this._createZoomLevelLabel();
		this._zoomOutButton = this._createButton('缩小', 'control_zoom_button control_zoom_out', this._zoomOut);
		this._zoomSlider = this._createSlider();
		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);
		return this._zoomControlContainer;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	disable: function () {
		this._disabled = true;
		this._updateDisabled();
		return this;
	},

	enable: function () {
		this._disabled = false;
		this._updateDisabled();
		return this;
	},

	_zoomIn: function (e) {
		if (!this._disabled) {
			this._map.zoomIn();
			this._updateSliderPosition();
		}
	},

	_zoomOut: function (e) {
		if (!this._disabled) {
			this._map.zoomOut();
			this._updateSliderPosition();
		}
	},

	_createButton: function (title, className, fn) {
		var link = Z.DomUtil.createElOn('a', '', this._zoomControlContainer);
		Z.DomUtil.addClass(link, className);
		link['title'] = title;
		link['href'] = '#';
		Z.DomUtil.on(link, 'mousedown mousemove dblclick contextmenu', Z.DomUtil.stopPropagation)
				 .on(link, 'mouseover', this._showSlider, this)
				 .on(link, 'mouseout', this._hideSlider, this)
				 .on(link, 'click', Z.DomUtil.stop)
				 .on(link, 'click', fn, this);
		return link;
	},

	_createZoomLevelLabel: function() {
		var zoomLevelLabel = Z.DomUtil.createElOn('div', '', this._zoomControlContainer);
		Z.DomUtil.addClass(zoomLevelLabel, 'control_zoomlevel_bg');
		this._zoomLevelNum = Z.DomUtil.createElOn('div', '', zoomLevelLabel);
		Z.DomUtil.addClass(this._zoomLevelNum, 'control_zoomlevel_num');
		this._updateZoomLevel();
		Z.DomUtil.on(zoomLevelLabel, 'mousedown mousemove click, dblclick contextmenu', Z.DomUtil.stopPropagation)
				 .on(zoomLevelLabel, 'mouseover', this._showSlider, this)
				 .on(zoomLevelLabel, 'mouseout', this._hideSlider, this);
		return zoomLevelLabel;
	},


	_updateZoomLevel: function() {
		this._zoomLevelNum['innerHTML'] = this._map.zoomLevel;
	},

	_createSlider: function() {
		var zoomDrop = Z.DomUtil.createElOn('div', 'display: none');
		Z.DomUtil.addClass(zoomDrop, 'control_zoomdrop');

		var zoom = Z.DomUtil.createElOn('div', '', zoomDrop);
		var zoomBar = Z.DomUtil.createElOn('div', '', zoom);
		Z.DomUtil.addClass(zoomBar, 'control_zoombar');
		var zoomBarBg = Z.DomUtil.createElOn('div', '', zoomBar);
		Z.DomUtil.addClass(zoomBarBg, 'control_zoombar_background');
		this._zoomBarSlider = Z.DomUtil.createElOn('div', '', zoomBar);
		Z.DomUtil.addClass(this._zoomBarSlider, 'control_zoom_slider');

		Z.DomUtil.on(zoomDrop, 'mousemove dblclick contextmenu', Z.DomUtil.stopPropagation)
				 .on(zoomDrop, 'mouseover', this._showSlider, this)
		    	 .on(zoomDrop, 'mouseout', this._hideSlider, this)
		    	 .on(zoomDrop, 'click', Z.DomUtil.stop)
                 .on(zoomDrop, 'click', this._slider, this)
		    	 .on(zoomDrop, 'mousedown', Z.DomUtil.stop);
		if(this.options['position']['bottom']&&this.options['position']['bottom'] > 0) {
			this._zoomControlContainer.insertBefore(zoomDrop, this._zoomControlContainer.firstChild);
		} else {
			this._zoomControlContainer.appendChild(zoomDrop);
		}
		return zoomDrop;
	},


	_slider: function(event) {
		var offsetY = event['offsetY'];
		if(offsetY<=7.2) offsetY = 0;
		var level = this._map.maxZoomLevel - Math.round(offsetY/7.2);
		var top = (this._map.maxZoomLevel-level)*7.2;
        Z.DomUtil.setStyle(this._zoomBarSlider, 'top: ' + top+'px');
        this._map.setZoomLevel(level);
	},

	_showSlider: function() {
		Z.DomUtil.setStyle(this._zoomSlider, 'display: block');
	},

	_hideSlider: function() {
		Z.DomUtil.setStyle(this._zoomSlider, 'display: none');
	},

	_updateDisabled: function () {
		if (this._disabled) {
			Z.DomUtil.setStyle(this._zoomInButton, 'display: none');
			Z.DomUtil.setStyle(this._zoomOutButton, 'display: none');
		} else {
			Z.DomUtil.setStyle(this._zoomInButton, 'display: display:inline-block;_zoom:1;*display:inline;');
			Z.DomUtil.setStyle(this._zoomOutButton, 'display: display:inline-block;_zoom:1;*display:inline;');
		}
		this._updateSliderPosition();
	},

	_updateSliderPosition: function() {
        this._updateZoomLevel();
		var sliderTop = (this._map.maxZoomLevel - this._map.zoomLevel)*7.2;
        Z.DomUtil.setStyle(this._zoomBarSlider, 'top: ' + sliderTop+'px');
	}
});

Z.Map.mergeOptions({
	'zoomControl': true,
	'zoomControlOptions' : {
		'id': 'MAP_CONTROL_ZOOM',
		'position' : Z.Control['top_right']
	}
});

Z.Map.addOnLoadHook(function () {
	if (this.options['zoomControl']) {
		var zoomControlOptions = this['options']['zoomControlOptions'];
		if(!zoomControlOptions['id']) {
			zoomControlOptions['id'] = 'MAP_CONTROL_ZOOM';
		}
		if(!zoomControlOptions['position']) {
			zoomControlOptions['position'] = Z.Control['top_right'];
		}
		this.zoomControl = new Z.Control.Zoom(zoomControlOptions);
		this['addControl'](this.zoomControl);
		this.zoomControl.enable();
	}
});

Z['Control']['Attribution'] = Z.Control.Attribution = Z.Control.extend({

	options:{
		'id': 'CONTROL_ATTRIBUTION',
		'position' : {
			'bottom': '0',
			'right': '0'
		},
		'content' : '<a href="www.gis.com" target="_blank" style="text-decoration:none;cursor: pointer;color: #6490C4; ">@ X-GIS</a>'
	},

	statics: {
		'control_attribution_bg' : 'display: inline-block; background-color: #FAF7F5; opacity: 0.8;'
	},

	buildOn: function (map) {
		this._attributionContainer = Z.DomUtil.createEl('div');
		Z.DomUtil.setStyle(this._attributionContainer, Z.Control.Attribution['control_attribution_bg']);
        Z.DomUtil.on(this._attributionContainer, 'mousedown mousemove dblclick contextmenu', Z.DomUtil.stopPropagation);
        this._update();
		return this._attributionContainer;
	},

	/**
	* @export
	*/
	setContent: function (content) {
		this.options['content'] = content;
		this._update();
		return this;
	},

	_update: function () {
		if (!this._map) { return; }
		this._attributionContainer.innerHTML = this.options['content'];
	}
});

Z.Map.mergeOptions({
	'attributionControl' : true,
	'attributionControlOptions' : {
		'id': 'MAP_CONTROL_ATTRIBUTION',
		'position' : {
			'bottom': '0',
			'right': '0'
		}
	}
});

Z.Map.addOnLoadHook(function () {
	if (this.options['attributionControl']) {
		var attributionControlOptions = this['options']['attributionControlOptions'];
		if(!attributionControlOptions['id']) {
			attributionControlOptions['id'] = 'MAP_CONTROL_ATTRIBUTION';
		}
		if(!attributionControlOptions['position']) {
			attributionControlOptions['position'] = {
				'bottom': '0',
				'right': '0'
			};
		}
		this.attributionControl = new Z.Control.Attribution(attributionControlOptions);
		this['addControl'](this.attributionControl);
	}
});

Z['Control']['Nav'] = Z.Control.Nav = Z.Control.extend({

	options:{
		'id': 'CONTROL_NAV',
		'position' : Z.Control['bottom_right']
	},

	buildOn: function (map) {
		this._map = map;
		this._navControlContainer = Z.DomUtil.createEl('div');
		this._panToLeftButton  = this._createButton('control_nav_button control_nav_left', this._panToLeft);
		this._panToUpButton  = this._createButton('control_nav_button control_nav_up', this._panToUp);
		this._panToRightButton  = this._createButton('control_nav_button control_nav_right', this._panToRight);
		this._panToDownButton  = this._createButton('control_nav_button control_nav_down', this._panToDown);
		this._navBar = Z.DomUtil.createElOn('div', '', this._navControlContainer);
		Z.DomUtil.addClass(this._navBar, 'control_nav_bar control_nav_bg');
		Z.DomUtil.on(this._navControlContainer, 'mouseup', this._stopPan, this);
		return this._navControlContainer;
	},

	_createButton: function (className, fn) {
		var buttonDiv = Z.DomUtil.createElOn('div', '', this._navControlContainer);
		Z.DomUtil.addClass(buttonDiv, className);
		Z.DomUtil.on(buttonDiv, 'mousedown mousemove click dblclick contextmenu', Z.DomUtil.stopPropagation)
				 .on(buttonDiv, 'mousedown', fn, this);
		return buttonDiv;
	},

	_panToLeft: function() {
		Z.DomUtil.setStyle(this._navBar, 'background-position:  -52px 0!important');
		this._startPan('left', 1);
	},

	_panToUp: function() {
		Z.DomUtil.setStyle(this._navBar, 'background-position: -104px 0!important');
		this._startPan('top', 1);
	},

	_panToRight: function() {
		Z.DomUtil.setStyle(this._navBar, 'background-position: -156px 0!important');
		this._startPan('left', -1);
	},

	_panToDown: function() {
		Z.DomUtil.setStyle(this._navBar, 'background-position: -208px 0!important');
		this._startPan('top', -1);
	},

	_stopPan: function() {
		if (this._panTimeout) {
			clearInterval(this._panTimeout);
		}
	},

	_startPan: function(direction, step) {
		var me = this;
		me._step = step;
		me._direction = direction;
		this._panExecutor = setInterval(function() {
			if(me._direction === "left") {
				me._map.panBy({'left':me._step,'top':0});
			} else if (me._direction === "top") {
				me._map.panBy({'left':0,'top':me._step});
			}
		},10);
	},

	_stopPan: function() {
		Z.DomUtil.setStyle(this._navBar, 'background-position:');
		clearInterval(this._panExecutor);
	}

});

Z.Map.mergeOptions({
	'navControl' : true,
	'navControlOptions' : {
		'id': 'MAP_CONTROL_NAV',
		'position' : Z.Control['bottom_right']
	}
});

Z.Map.addOnLoadHook(function () {
	if (this.options['navControl']) {
		var navControlOptions = this['options']['navControlOptions'];
		if(!navControlOptions['id']) {
			navControlOptions['id'] = 'MAP_CONTROL_NAV';
		}
		if(!navControlOptions['position']) {
			navControlOptions['position'] = Z.Control['bottom_right'];
		}
		this.navControl = new Z.Control.Nav(navControlOptions);
		this['addControl'](this.navControl);
	}
});

Z['GeoUtils']=Z.GeoUtils={
    _isPointOnPath:function(point, geo, tolerance) {
            //检查类型
            if(!point || !geo){
                return -1;
            }
            if (Z.Util.isNil(tolerance)) {
                tolerance = 0;
            } else {
                tolerance = Math.abs(tolerance);
            }
            //首先判断点是否在线的外包矩形内，如果在，则进一步判断，否则返回false
            var extent = geo.getPrjExtent();
            extent = Z.Extent.expand(extent,tolerance);
            if(!this.isPointInRect(point, extent)){
                return -1;
            }
            var pts = geo.getPrjPoints();
            //判断点是否在线段上，设点为Q，线段为P1P2 ，
            //判断点Q在该线段上的依据是：( Q - P1 ) × ( P2 - P1 ) = 0，且 Q 在以 P1，P2为对角顶点的矩形内
            //var pts = polyline.getPath();
            for(var i = 0; i < pts.length - 1; i++){
                var curPt = pts[i];
                var nextPt = pts[i + 1];
                var cond_x = (point.x >= Math.min(curPt.x, nextPt.x)-tolerance && point.x <= Math.max(curPt.x, nextPt.x)+tolerance),
                    cond_y = (point.y >= Math.min(curPt.y, nextPt.y)-tolerance && point.y <= Math.max(curPt.y, nextPt.y)+tolerance);
                var precision = null; 
                if (curPt.x === nextPt.x) {
                    if (cond_y) {
                        precision = curPt.x - point.x;
                    }
                } else if (curPt.y === nextPt.y) {
                    if (cond_x) {
                        precision = curPt.y - point.y;
                    }
                } else {
                    //首先判断point是否在curPt和nextPt之间，即：此判断该点是否在该线段的外包矩形内
                    if ( cond_x && cond_y ){
                        //判断点是否在直线上公式
                         //根据数学,求出直接的表达示:y=kx+b  
                        var k = (curPt.y-nextPt.y)/(curPt.x-nextPt.x);  
                        var b = curPt.y-k*curPt.x;  
                        if (Math.abs(nextPt.x-curPt.x) - Math.abs(nextPt.y-curPt.y) > 0) {
                            //将点的x坐标代入表达示中,判断该点是否在直线上  
                            var py = point.x*k+b;  
                            precision = point.y-py;  
                        } else {
                            var px = (point.y-b)/k;
                            precision = point.x-px;  
                        }
                        
                        //console.log(precision);
                        // var precision = (curPt.x - point.x) * (nextPt.y - point.y) - 
                        //     (nextPt.x - point.x) * (curPt.y - point.y);
                                        
                    }
                }
                // console.log(precision);
                if(precision !== null && precision <= tolerance && precision >= -tolerance){//实质判断是否接近0
                    return i;
                }
            }
            
            return -1;
        },
        isPointInRect:function(point, extent) {
            if (!point || !(extent instanceof Z.Extent)) {
                return false;
            }
            return (point.x >= extent['xmin'] && point.x <= extent['xmax'] && point.y >= extent['ymin'] && point.y <= extent['ymax']);
        },
        /**
        * 判断点是否多边形内
        * @param {Coordinate} point 点对象
        * @param {Polyline} polygon 多边形对象
        * @returns {Boolean} 点在多边形内返回true,否则返回false
        */
        isPointInPolygon: function(point, polygon) {
            var pts = polygon.getRing();//获取多边形点
            //下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
            //基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
            //在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。
            var N = pts.length;
            var boundOrVertex = true; //如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
            var intersectCount = 0;//cross points count of x
            var precision = 2e-10; //浮点类型计算时候与0比较时候的容差
            var p1, p2;//neighbour bound vertices
            var p = point; //测试点
            p1 = pts[0];//left vertex
            for(var i = 1; i <= N; ++i){//check all rays
                if(Z.Coordinate(p, p1)){
                    return boundOrVertex;//p is an vertex
                }

                p2 = pts[i % N];//right vertex
                if(p.y < Math.min(p1.y, p2.y) || p.y > Math.max(p1.y, p2.y)){//ray is outside of our interests
                    p1 = p2;
                    continue;//next ray left point
                }

                if(p.y > Math.min(p1.y, p2.y) && p.y < Math.max(p1.y, p2.y)){//ray is crossing over by the algorithm (common part of)
                    if(p.x <= Math.max(p1.x, p2.x)){//x is before of ray
                        if(p1.y == p2.y && p.x >= Math.min(p1.x, p2.x)){//overlies on a horizontal ray
                            return boundOrVertex;
                        }

                        if(p1.x == p2.x){//ray is vertical
                            if(p1.x == p.x){//overlies on a vertical ray
                                return boundOrVertex;
                            }else{//before ray
                                ++intersectCount;
                            }
                        }else{//cross point on the left side
                            var xinters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;//cross point of lng
                            if(Math.abs(p.x - xinters) < precision){//overlies on a ray
                                return boundOrVertex;
                            }

                            if(p.x < xinters){//before ray
                                ++intersectCount;
                            }
                        }
                    }
                }else{//special case when ray is crossing through the vertex
                    if(p.y == p2.y && p.x <= p2.x){//p crossing over p2
                        var p3 = pts[(i+1) % N]; //next vertex
                        if(p.y >= Math.min(p1.y, p3.y) && p.y <= Math.max(p1.y, p3.y)){//p.y lies between p1.y & p3.y
                            ++intersectCount;
                        }else{
                            intersectCount += 2;
                        }
                    }
                }
                p1 = p2;//next ray left point
            }

            if(intersectCount % 2 == 0){//偶数在多边形外
                return false;
            } else { //奇数在多边形内
                return true;
            }
        }
};
Z.Simplify={
	// square distance between 2 points
    getSqDist:function(p1, p2) {

        var dx = p1['left'] - p2['left'],
            dy = p1['top'] - p2['top'];

        return dx * dx + dy * dy;
    },

    // square distance from a point to a segment
    getSqSegDist:function(p, p1, p2) {

        var x = p1['left'],
            y = p1['top'],
            dx = p2['left'] - x,
            dy = p2['top'] - y;

        if (dx !== 0 || dy !== 0) {

            var t = ((p['left'] - x) * dx + (p['top'] - y) * dy) / (dx * dx + dy * dy);

            if (t > 1) {
                x = p2['left'];
                y = p2['top'];

            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }
        dx = p['left'] - x;
        dy = p['top'] - y;

        return dx * dx + dy * dy;
    },
    // rest of the code doesn't care about point format

    // basic distance-based simplification
    simplifyRadialDist:function(points, sqTolerance) {

        var prevPoint = points[0],
            newPoints = [prevPoint],
            point;

        for (var i = 1, len = points.length; i < len; i++) {
            point = points[i];

            if (this.getSqDist(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }

        if (prevPoint !== point) newPoints.push(point);

        return newPoints;
    },

    simplifyDPStep:function(points, first, last, sqTolerance, simplified) {
        var maxSqDist = sqTolerance,
            index;

        for (var i = first + 1; i < last; i++) {
            var sqDist = this.getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            if (index - first > 1) this.simplifyDPStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1) this.simplifyDPStep(points, index, last, sqTolerance, simplified);
        }
    },

    // simplification using Ramer-Douglas-Peucker algorithm
    simplifyDouglasPeucker:function(points, sqTolerance) {
        var last = points.length - 1;

        var simplified = [points[0]];
        this.simplifyDPStep(points, 0, last, sqTolerance, simplified);
        simplified.push(points[last]);

        return simplified;
    },

    // both algorithms combined for awesome performance
    simplify:function(points, tolerance, highestQuality) {

        if (points.length <= 2) return points;

        var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

        points = highestQuality ? points : this.simplifyRadialDist(points, sqTolerance);
        points = this.simplifyDouglasPeucker(points, sqTolerance);

        return points;
    }
};
Z['SpatialFilter']=Z.SpatialFilter=Z.Class.extend({
    statics: {
        'RELATION_INTERSECT' : 0,
        'RELATION_CONTAIN' : 1,
        'RELATION_DISJOINT' : 2,
        'RELATION_OVERLAP' : 3,
        'RELATION_TOUCH' : 4,
        'RELATION_WITHIN' : 5,
        'RELATION_CONTAINCENTER' : 7
    },

    initialize:function(geometry, relation) {
        this.geometry = geometry;
        this.relation = relation;
    },
    /**
     * 获取SpatialFilter中的geometry
     * @return {Geometry} SpatialFilter的Geometry
     * @export
     */
    getGeometry: function() {
        return this.geometry;
    },

    /**
     * 获取SpatialFilter的json
     * @return {String} spatialfilter
     * @export
     */
    toJson: function() {
        var jsonObj = {
          "geometry": this.geometry.toJson(),
          "relation": this.relation
        };
        return jsonObj;
    }

});
Z['Query']=Z.Query=Z.Class.extend({
    intialize:function() {

    },

    /**
     * query
     * @param  {Object} opts 查询参数
     * @export
     */
    query:function(opts) {

    }
});
Z['RemoteQuery']=Z.RemoteQuery=Z.Class.extend({
    /**
     * 查询远程服务器上的数据
     * @param  {[type]} opts [description]
     * @constructor
     */
    initialize:function(opts) {
        if (!opts) {
            return;
        }
        this.host = opts['host'];
        this.port = opts['port'];
        this.mapdb = opts['mapdb'];
    },

    check:function() {
        if (!this.mapdb) {
            return false;
        }
        return true;
    },

    getHost:function() {
        if (this.host && this.port) {
            return this.host+':'+this.port;
        }
        return Z.host;
    },

    /**
     * Identify
     * @param  {Object} opts 查询参数
     * @export
     */
    identify:function(opts) {
        if (!opts) {
            return;
        }
        var coordinate = opts['coordinate'];
        var radius = opts["radius"];
        var spatialFilter = new Z.SpatialFilter(new Z.Circle(coordinate, radius), Z.SpatialFilter.RELATION_INTERSECT);
        var queryFilter = {
            'spatialFilter': spatialFilter,
            'condition': opts['condition'],
            'symbol': true,
            'page': 0,
            'count': 10000
        };
        if (opts['fromCoordinateType']) {
            queryFilter['fromCoordinateType'] = opts['fromCoordinateType'];
        }
        if (opts['toCoordinateType']) {
            queryFilter['toCoordinateType'] = opts['toCoordinateType'];
        }
        opts['queryFilter']=queryFilter;
        this.query(opts);
    },

    /**
     * query
     * @param  {Object} opts 查询参数
     * @export
     */
    query:function(opts) {
        if (!opts || !this.check()) {
            throw new Error('invalid options for RemoteQuery\'s query method.');
        }
        if (!opts['layers']) {
            throw new Error('layers is not specified in query options.');
        }
        var layers = opts['layers'];
        //如果是数组,则变成字符串
        if (Z.Util.isArrayHasData(layers)) {
            layers = layers.join(',');
        }
        if (layers.length === 0) {
            throw new Error('layers is not specified in query options.');
        }
        if (!Z.Util.isFunction(opts['success'])) {
            throw new Error('success callback function is not specified in query options.');
        }
        //•/databases/{db}/layers/{id}/data?op=query
        var url='http://'+this.getHost()+"/enginerest/rest/databases/"+this.mapdb+"/layers/"+layers+"/data?op=query";
        var queryFilter = opts['queryFilter'];
        if (!queryFilter) {
            //默认的queryFilter
            queryFilter = {
                'symbol':true,
                'fields':'*',
                'page':0,
                'count':10
            };
        }
        var queryString=this.formQueryString(queryFilter);
        //var beginTime=new Date().getTime();
        var ajax = new Z.Util.Ajax(url,0,queryString,function(response){
            if (!response) {
                //20000是未知错误的错误代码
                if (Z.Util.isFunction(opts['error'])) {
                    opts['error']({"success":false,"errCode":Z.Constant.ERROR_CODE_UNKNOWN,"error":""});
                }
                return;
            } else {
                var result = Z.Util.parseJson(response);
                if (!result) {
                    //20000是未知错误的错误代码
                    if (Z.Util.isFunction(opts['error'])) {
                        opts['error']({"success":false,"errCode":Z.Constant.ERROR_CODE_UNKNOWN,"error":""});
                    }
                } else if (!result["success"]) {
                    if (Z.Util.isFunction(opts['error'])) {
                        opts['error'](result);
                    }
                } else {
                    var datas=result["data"];
                    if (!Z.Util.isArrayHasData(datas)) {
                        opts['success']({"success":true,"data":[]});
                    } else {
                        var geos = Z.Geometry.fromJson(datas);                         
                        opts['success']({"success":true,"data":geos});
                    }
                }                           
            }
            
            ajax = null;
        }); 
        
        ajax.post();
    },

    formQueryString:function(queryFilter) {
        var ret = "encoding=utf-8";        
        //ret+="&method=add";
        ret+="&mapdb="+this.mapdb;
        if (queryFilter['toCoordinateType']) {
            ret+="&coordinateType="+this.getCoordinateType();
        }
        if (queryFilter['symbol']) {
            ret+="&needsymbol=true";
        }
        if (queryFilter['layers']) {
            ret += ("&layer="+queryFilter['layers']);
        }
        if (Z.Util.isNumber(queryFilter['page'])) {
            ret += "&page="+queryFilter['page'];
        }
        if (Z.Util.isNumber(queryFilter['count'])) {
            ret += "&count="+queryFilter['count'];
        }
        if (queryFilter['spatialFilter']) {
            var spatialFilter = queryFilter['spatialFilter'];
            if (spatialFilter.getGeometry()) {
                if (queryFilter['toCoordinateType']) {
                    spatialFilter.getGeometry().setCoordinateType(queryFilter['toCoordinateType']);
                }
                ret += ("&spatialFilter="+encodeURIComponent(JSON.stringify(queryFilter['spatialFilter'].toJson())));
            }
            
        }
        if (queryFilter['condition']) {
            ret += ("&attributeCond="+encodeURIComponent(queryFilter['condition']));
        }
        if (queryFilter['fields']) {
            ret += ("&fields="+queryFilter['fields']);
        }
        // if (fieldFilter != null) {
        //     ret += ("&cond="+encodeURIComponent(fieldFilter));
        // }
        return ret;
    }
});
window['seegoo']={};
window['seegoo']['maps']=window['Z'];


})();
