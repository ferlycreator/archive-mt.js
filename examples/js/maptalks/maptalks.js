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

    GUID: function() {
        return '___GLOBAL_'+(Z.Util.globalCounter++);
    },

    lastId: 0,

    parseJson:function(str) {
        if (!str || !Z.Util.isString(str)) {
            return str;
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
     * 遍历数组中的每个元素,并执行fn操作, 兼容N维数组, 如果数组中有null或undefined,则continue不作处理
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
               /* //二维数组
                var p_r = [];
                for (var j=0,jlen=p.length;j<jlen;j++) {
                    if (Z.Util.isNil(p[j])) {
                        continue;
                    }
                    p_r.push(fn.call(context,p[j]));
                }
                result.push(p_r);*/
                result.push(Z.Util.eachInArray(p, context, fn));
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

    getLength : function(str) {
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            var a = str.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null) {
                len += 2;
            } else {
                len += 1;
            }
        }
        return len;
    },

    splitContent: function(content, contentLen, size, length) {
        var rowNum = Math.ceil(contentLen/length);
        var length = parseInt(length/size);
        var result = [];
        for(var i=0;i<rowNum;i++) {
            if(i < rowNum -1 ) {
                result.push(content.substring(i*length,(i+1)*length-1));
            } else {
                result.push(content.substring(i*length));
            }
        }
        return result;
    },

    setDefaultValue: function(value, defaultValue) {
        return (!value)?defaultValue:value;
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

    createElOn:function(tagName, style, _container) {
        var el = this.createEl(tagName);
        if(style) {
            this.setStyle(el, style);
        }
        if (_container) {
            _container.appendChild(el);
        }
        return el;
    },

    removeDomNode:function(node){
        if (!node) {return;}
        if (Z.Browser.ie) {
            var d = Z.DomUtil.createEl('div');
//            d.appendChild(node);
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
        if (!obj || !typeArr) {return this;}
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
                return this;
            }
            //删除注册的handler事件
            var hit = this.hasDomEvent(obj,type,handler);
            if (hit < 0) {
                return this;
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
            return new Z.Point(parseInt(dom.style.left,0),parseInt(dom.style.top,0));
        } else {
            dom['style']['left']= offset['left']+'px';
            dom['style']['top'] = offset['top']+'px';
            return offset;
        }
    },

    offsetDomTranslate:function(dom,offset) {
        var useTranslate = (Z.Browser.translateDom);
        if (!useTranslate) {
            return null;
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
            return new Z.Point(0,0);
        }
        var splitted = transValue.split(',');
        var left = parseInt(splitted[0].split('(')[1],0),
            top = parseInt(splitted[1],0);
        return new Z.Point(left,top);
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
        return new Z.Point(mousePagePos.x-domScreenPos['left'],mousePagePos.y-domScreenPos['top']);
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
        if (!this._eventMap) {
            this._eventMap = {};
        }
        var eventTypes = eventTypeArr.split(' ');
        var eventType;
        if(!context) {context = this;}
        for (var j = 0, jl = eventTypes.length; j <jl; j++) {
            eventType = eventTypes[j];
            var handlerChain = this._eventMap[eventType];
            if (!handlerChain) {
                handlerChain = [];
                this._eventMap[eventType]=handlerChain;
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
        if (!eventTypeArr || !this._eventMap || !handler) {return this;}
        var eventTypes = eventTypeArr.split(' ');
        var eventType;
        if(!context) {context = this;}
        for (var j = 0, jl = eventTypes.length; j <jl; j++) {
            eventType = eventTypes[j];
            var handlerChain =  this._eventMap[eventType];
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

    _clearListeners:function(eventType) {
        if (!this._eventMap) {return;}
        var handlerChain =  this._eventMap[eventType];
        if (!handlerChain) {return;}
        this._eventMap[eventType] = null;
    },

    _clearAllListeners:function() {
        this._eventMap = null;
    },

    hasListeners:function(eventType) {
        if (!this._eventMap) {return false;}
        var handlerChain =  this._eventMap[eventType];
        if (!handlerChain) {return false;}
        return handlerChain && handlerChain.length >0;
    },

    _executeListeners:function(eventType, param) {
        if (!this._eventMap) {return;}
        if (!this.hasListeners(eventType)) {return;}
        var handlerChain = this._eventMap[eventType];
        if (!handlerChain) {return;}
        for (var i=0, len = handlerChain.length;i<len; i++) {
            if (!handlerChain[i]) {continue;}
            var context = handlerChain[i].context;
            //增加一个type参数, 表示事件类型
            param['type'] = eventType;
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
Z.Eventable.fire = Z.Eventable._executeListeners;
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
        /*if (this.options) {
            var classOptions = this.options;
            this.options = {};
            Z.Util.extend(this.options, classOptions);
        }*/
        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        // call all constructor hooks
        if(this._initHooks) {
            this.callInitHooks();
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

    // exception definitions
    if (props.exceptionDefs) {
        var lang = Z.Browser.language;
        if ( lang !== 'zh-CN') {
            lang = 'en-US'; //only support chinese and english now;
        }
        Z.Util.extend(proto, {exceptions:props.exceptionDefs[lang]});
        delete props.exceptionDefs;
    }

    // mix given properties into the prototype
    Z.Util.extend(proto, props);

    proto._initHooks = [];

    // add method for calling all hooks
    proto.callInitHooks = function () {

        if (this._initHooksCalled ) { return; }

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

Z['Coordinate'] = Z.Coordinate = function(x, y) {

    if (Z.Util.isArray(x)) {
        //数组
        this.x = parseFloat(x[0]);
        this.y = parseFloat(x[1]);
    } else if (!Z.Util.isNil(x['x']) && !Z.Util.isNil(x['y'])) {
        //对象
        this.x = x['x'];
        this.y = x['y'];
    } else {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    }
};

//static functions on Coordinate class
Z.Util.extend(Z.Coordinate,{
    equals:function(c1,c2) {
        if (!Z.Util.isCoordinate(c1) || !Z.Util.isCoordinate(c2)) {
            return false;
        }
        return c1.x === c2.x && c1.y === c2.y;
    }
});

Z['Point']=Z.Point=function(left,top) {
     this['left']=left;
     this['top']=top;
};

Z.Point.prototype={
    distanceTo: function(point) {
        var x = point.left - this.left,
            y = point.top - this.top;
        return Math.sqrt(x * x + y * y);
    }
};
Z['Size']=Z.Size=function(width,height) {
    this['width']=width;
    this['height']=height;
};


/**
 * Class for Affine Transformation: transformation between projected coordinates and screen points.
 * Change the matrix for translate / rotate / scale effects.
 * parameter matrix is a 6-number array, for example:[0, 1, 1, 0, 3, 4].
 * the first 4 is the 2*2 2-dimension affine transformation matrix, such as:
 *                0  1
 *                1  0
 * the last 2 is the x, y offset, for example
 *                0  1
 *                1  0
 *                3  4
 * usually it can be regulated to a 3*3 matrix:
 *                0  1  0
 *                1  0  0
 *                3  4  1
 */
Z.Transformation = function(matrix) {
    this.matrix = matrix;
};

Z.Transformation.prototype = {
    //prj coordinate -> point
    transform : function(coordinates, scale) {
        var matrix = this.matrix;
        var x,y;
        if (Z.Util.isArray(coordinates)) {
            x = coordinates[0];
            y = coordinates[1];
        } else {
            x = coordinates.x;
            y = coordinates.y;
        }
        // affine transformation
        var x_ = (x*matrix[0]+matrix[2])/scale;
        var y_ = (y*matrix[1]+matrix[3])/scale;
        return [x_, y_];
    },

    //point -> prj coordinate
    untransform : function(point, scale) {
        var matrix = this.matrix;
        var x,y;
        if (Z.Util.isArray(point)) {
            x = point[0];
            y = point[1];
        } else {
            x = point.x;
            y = point.y;
        }
        //inverse matrix
        var x_ = (x*scale-matrix[2])/matrix[0];
        var y_ = (y*scale-matrix[3])/matrix[1];
        return [x_, y_];
    }
};


Z.Projection={
    getInstance:function(projection) {
        if (!projection) {return this.getDefault();}
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
        return Z.Util.extend(Z.ProjectionInstance.EPSG3857,Z.Projection.Util);
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
Z.ProjectionInstance.GeoMethods.WGS84Geodesic={
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
Z.ProjectionInstance.EPSG3857 = {
    srs: 'EPSG:3857',
    EARCH_RADIUS: 2.003750834E7,

    project: function(lnglat) {
        var lng = lnglat.x, lat = lnglat.y;
        var r = this.EARCH_RADIUS;
        var c = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        return new Z.Coordinate( lng * r / 180, c * r / 180);
    },

    unproject: function(point) {
        var x = point.x,
            y = point.y;
        var r = this.EARCH_RADIUS;
        var c = y / r * 180;
        c = 180 / Math.PI * (2 * Math.atan(Math.exp(c * Math.PI / 180)) - Math.PI / 2);
        return new Z.Coordinate(x / r * 180, c);
    },

    rad: function(a) { return a * Math.PI / 180; }
};

Z.Util.extend(Z.ProjectionInstance.EPSG3857, Z.ProjectionInstance.GeoMethods.WGS84Geodesic);
Z.ProjectionInstance.EPSG4326={
	srs:'EPSG:4326',
	project:function(p){
        return new Z.Coordinate(p.x,p.y);
    },
    unproject:function(p){
        return new Z.Coordinate(p.x,p.y);
    }
};
Z.Util.extend(Z.ProjectionInstance.EPSG4326, Z.ProjectionInstance.GeoMethods.WGS84Geodesic);
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
            'mousePos':new Z.Point(parseInt(event.clientX,0),parseInt(event.clientY,0))
        });
    },

    onMouseMove:function(event) {
        this.fire('dragging',{
            'mousePos': new Z.Point(parseInt(event.clientX,0),parseInt(event.clientY,0))
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
            'mousePos': new Z.Point(parseInt(event.clientX,0),parseInt(event.clientY,0))
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
        //TODO options应该设置到this.options中
        this.map = map;
        if (!this.map) {return;}
        this._tileConfig = map._getTileConfig();
        this.enable();
        return this;
    },

    /**
     * 激活
     * @expose
     */
    enable:function() {
        if (!this.map) {return;}
        this.drawToolLayer = this._getDrawLayer();
        this._clearEvents();
        this._registerEvents();
        return this;
    },

    /**
     * 停止激活
     * @expose
     */
    disable:function() {
        if (!this.map) {
            return;
        }
        this._endDraw();
        this.map.removeLayer(this._getDrawLayer());
        this._clearEvents();
    },

    /**
     * 设置绘图模式
     * @param {Number} [node] [绘图模式]
     * @expose
     */
    setMode:function(mode) {
        if (this.geometry) {
            this.geometry.remove();
            delete this.geometry;
        }
        this['mode'] = mode;
        this._clearEvents();
        this._registerEvents();
    },

    /**
     * 获得drawtool的绘制样式
     * @return {Object} [绘制样式]
     * @expose
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

    _getProjection:function() {
        if (!this._tileConfig) {
            return null;
        }
        return this._tileConfig.getProjectionInstance();
    },

    /**
     * 注册鼠标响应事件
     */
    _registerEvents: function() {
        this._preventEvents();
        var mode = this['mode'];
        if (Z.Util.isNil(mode)) {
            mode = Z.Geometry['TYPE_CIRCLE'];
        }
        if (Z.Geometry['TYPE_POLYGON'] == mode || Z.Geometry['TYPE_POLYLINE'] == mode) {
            this.map.on('click',this._clickForPath, this);
            this.map.on('mousemove',this._mousemoveForPath,this);
            this.map.on('dblclick',this._dblclickForPath,this);
        } else if (Z.Geometry['TYPE_POINT'] == mode) {
            this.map.on('click',this._clickForPoint, this);
        } else {
            this.map.on('mousedown',this._mousedownToDraw, this);
        }
    },

    _preventEvents: function() {
        this.map.disableDrag();
        this.map['doubleClickZoom'] = false;
    },

    _clearEvents: function() {
        this.map.off('click',this._clickForPath, this);
        this.map.off('click',this._clickForPoint, this);
        this.map.off('mousemove',this._mousemoveForPath,this);
        this.map.off('dblclick',this._dblclickForPath,this);
        this.map.off('mousedown',this._mousedownToDraw,this);
        this.map.enableDrag();
        this.map['doubleClickZoom'] = true;
    },

    _clickForPoint: function(event) {
        var screenXY = this._getMouseScreenXY(event);
        var coordinate = this._screenXYToLonlat(screenXY);
        var param = {'coordinate':coordinate, 'pixel':screenXY};
        if(this.afterdraw){
            this.afterdraw(param);
        }
        this._fireEvent('afterdraw', param);
        if(this.afterdrawdisable) {
           this.disable();
        }
    },

    _clickForPath:function(event) {
        var screenXY = this._getMouseScreenXY(event);
        var coordinate = this._screenXYToLonlat(screenXY);
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
            this._fireEvent('startdraw', {'coordinate':coordinate,'pixel':screenXY});
        } else {
            var path = this._getLonlats();
            path.push(coordinate);
            //这一行代码取消注册后, 会造成dblclick无法响应, 可能是存在循环调用,造成浏览器无法正常响应事件
            // this._setLonlats(path);
            if (this.map.hasListeners('drawring')) {
                /**
                 * 端点绘制事件，当为多边形或者多折线绘制了一个新的端点后会触发此事件
                 * @event drawring
                 * @param coordinate {seegoo.maps.MLonLat} 新端点的地理坐标
                 * @param pixel {Pixel} 新端点的像素坐标
                 */
                this._fireEvent('drawring',{'target':this.geometry,'coordinate':coordinate,'pixel':screenXY});
            }
        }
    },

    _mousemoveForPath : function(event) {
        if (!this.geometry) {return;}
        var screenXY = this._getMouseScreenXY(event);
        if (!this._isValidScreenXY(screenXY)) {return;}
        var coordinate = this._screenXYToLonlat(screenXY);
        var drawLayer = this._getDrawLayer();
        var path = this._getLonlats();
        if (path.length === 1) {
            path.push(coordinate);
             drawLayer.addGeometry(this.geometry);
        } else {
            path[path.length-1] = coordinate;
            //path.push(coordinate);
        }
        // this.drawToolLayer.removeGeometry(this.geometry);
        this._setLonlats(path);
        // this.drawToolLayer.addGeometry(this.geometry);
    },

    _dblclickForPath:function(event) {
        if (!this.geometry) {return;}
        var screenXY = this._getMouseScreenXY(event);
        if (!this._isValidScreenXY(screenXY)) {return;}
        var coordinate = this._screenXYToLonlat(screenXY);
        var path = this._getLonlats();
        path.push(coordinate);
        if (path.length < 2) {return;}
        //去除重复的端点
        var nIndexes = [];
        var i, len;
        for (i=1,len=path.length;i<len;i++) {
            if (path[i].x === path[i-1].x && path[i].y === path[i-1].y) {
                nIndexes.push(i);
            }
        }
        for (i=nIndexes.length-1;i>=0;i--) {
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
        this._endDraw(coordinate, screenXY);
    },

    _mousedownToDraw : function(event) {
        var me = this;
        var onMouseUp;
        function genGeometry(coordinate) {
            var symbol = me.getSymbol();
            var geometry = me.geometry;
            var drawLayer = me._getDrawLayer();
            var _map = me.map;
            var center;
            switch (me.mode) {
            case Z.Geometry['TYPE_CIRCLE']:
                if (!geometry) {
                    geometry = new Z.Circle(coordinate,0);
                    geometry.setSymbol(symbol);
                    drawLayer.addGeometry(geometry);
                    break;
                }
                center =geometry.getCenter();
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
                center = geometry.getCenter();
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
            var screenXY = this._getMouseScreenXY(_event);
            if (!this._isValidScreenXY(screenXY)) {return;}
            var coordinate = this._screenXYToLonlat(screenXY);
            genGeometry(coordinate);
            return false;
        }
        onMouseUp = function(_event) {
            if (!this.geometry) {
                return false;
            }
            var screenXY = this._getMouseScreenXY(_event);
            if (!this._isValidScreenXY(screenXY)) {return;}
            var coordinate = this._screenXYToLonlat(screenXY);
            genGeometry(coordinate);
            this.map.off('mousemove',onMouseMove, this);
            this.map.off('mouseup',onMouseUp, this);
            this._endDraw(coordinate, screenXY);
            return false;
        };
        var screenXY = this._getMouseScreenXY(event);
        if (!this._isValidScreenXY(screenXY)) {return;}
        var coordinate = this._screenXYToLonlat(screenXY);
        /**
         * 绘制开始事件
         * @event startdraw
         * @param coordinate {seegoo.maps.MLonLat} 初始坐标
         * @param pixel {Pixel} 初始像素坐标
         */
        this._fireEvent('startdraw',{'coordinate':coordinate,'pixel':screenXY});
        genGeometry(coordinate);
        this.map.on('mousemove',onMouseMove,this);
        this.map.on('mouseup',onMouseUp,this);
        return false;
    },

    _endDraw : function(coordinate, screenXY) {
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
         this._fireEvent('afterdraw', param);
         if(this.afterdrawdisable) {
           this.disable();
         }
    },

    /**
     * 返回多边形或多折线的坐标数组
     * @return {[type]} [description]
     */
    _getLonlats:function() {
        if (this.geometry.getShell) {
            return this.geometry.getShell();
        }
        return this.geometry.getPath();
    },

    _setLonlats:function(lonlats) {
        if (this.geometry instanceof Z.Polygon) {
            this.geometry.setCoordinates([lonlats]);
        } else if (this.geometry instanceof Z.Polyline) {
            this.geometry.setCoordinates(lonlats);
        }
        /*if (this.geometry.setRing) {
            this.geometry.setRing(lonlats);
        } else {
            this.geometry.setPath(lonlats);
        }*/
    },

    /**
     * 获得鼠标事件在地图容器上的屏幕坐标
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    _getMouseScreenXY:function(event) {
        Z.DomUtil.stopPropagation(event);
        var result = Z.DomUtil.getEventDomCoordinate(event,this.map._containerDOM);
        return result;
    },

    /**
     * 事件坐标转化为地图上的经纬度坐标
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    _screenXYToLonlat:function(screenXY) {
        var projection = this._getProjection(),
            map = this.map;

        //projected pLonlat
        var pLonlat = map._untransform(screenXY);
        return projection.unproject(pLonlat);
    },

    _isValidScreenXY:function(screenXY) {
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

    _getDrawLayer:function() {
        var drawLayerId = '____system_layer_drawtool';
        var drawToolLayer = this.map.getLayer(drawLayerId);
        if (!drawToolLayer) {
            drawToolLayer = new Z.VectorLayer(drawLayerId);
            this.map.addLayer(drawToolLayer);
        }
        return drawToolLayer;
    },

    _fireEvent:function(eventName, param) {
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
        //TODO options应该设置到this.options中
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
        if (!this.map) {
            return;
        }
        var drawTool = this.drawTool;
        this.drawLayer = this.map.getLayer(this.layerId);
        if (this.drawLayer !== null && drawTool !== null) {
            drawTool.enable();
            return;
        }
        if (this.drawLayer !== null) {
            this.map.removeLayer(this.layerId);
        }
        // var _canvas = this.map._panels.canvasLayerContainer;

        this.drawLayer = new Z.VectorLayer(this.layerId);

        this.map.addLayer(this.drawLayer);

        drawTool = new Z.DrawTool({
            'mode':Z.Geometry.TYPE_POLYLINE,
            'symbol': {'strokeSymbol':{'stroke':'#ff0000', 'stroke-width':3, 'opacity':0.6}},
            'afterdrawdisable': true
        }).addTo(this.map);

        drawTool.on('startdraw', Z.Util.bind(this._startMeasure, this));
        drawTool.on('drawring', Z.Util.bind(this._measureRing, this));
        drawTool.on('afterdraw', Z.Util.bind(this._afterMeasure, this));

        this.drawTool = drawTool;

        this.counter = 0;
        this.rings = [];
        this.tmpMarkers = [];
    },

    /**
     * 停止测距鼠标工具
     * @expose
     */
    disable:function() {
        if (!this.map) {
            return;
        }
        this.clear();
        var drawTool = this.drawTool;
        var _canvas = this.map.canvasDom;
        if (!_canvas) {
            this._changeCursor('default');
        }
        if (drawTool !== null) {
            drawTool.disable();
        }
    },

    /**
     * 清除测量结果
     * @expose
     */
    clear: function(){
        if (this.drawLayer !== null && this.map !== null) {
            this.drawLayer.clear();
        }
        this.rings = [];
        this.counter = 0;
        this.tmpMarkers = [];
    },

    _startMeasure : function(param) {
        var startDiv = this._outline('起点', 28);
        var coordinate = param['coordinate'];
        this.rings.push(coordinate);

        var point = this._genMeasurePoint(coordinate, this.layerId + '_startp_' + this.counter);
        var marker = new Z.Marker(coordinate, this.layerId + '_start_' + this.counter);
        marker._setIcon({
            'type' : 'html',
            'content' : startDiv
        });
        this.drawLayer.addGeometry([point,marker]);
        this.tmpMarkers.push(point);
        this.tmpMarkers.push(marker);
    },

    _measureRing : function(param) {
        var content = null;
        var coordinate = param['coordinate'];
        this.rings.push(coordinate);
        var lenSum = this._caculateLenSum();
        if (lenSum>1000) {
            content = (lenSum/1000).toFixed(1)+'公里';
        } else {
            content = lenSum + '米';
        }
        var measureDiv = this._outline(content, 50);
        var point = this._genMeasurePoint(coordinate, this.layerId + '_ringp_' + this.rings.length+'_' + this.counter);
        var marker = new Z.Marker(coordinate, this.layerId + '_ring_' + this.rings.length + '_' + this.counter);
        marker._setIcon({
            'type' : 'html',
            'content' : measureDiv
        });
        this.drawLayer.addGeometry([point,marker]);
        this.tmpMarkers.push(point);
        this.tmpMarkers.push(marker);
    },

    _afterMeasure : function(param) {
        var polyline = param.target;
        var coordinate = param['coordinate'];
        this.rings.push(coordinate);
        var divContent = '总长';
        var lenSum = this._caculateLenSum();
        if (lenSum>1000) {
            divContent += (lenSum/1000).toFixed(1)+'公里';
        } else {
            divContent += lenSum.toFixed(1)+'米';
        }
        this._endMeasure(coordinate, divContent, polyline);
        this._changeCursor('default');
        this.counter++;
        this.rings = [];
        /**
         * 距离量算结束事件
         * @event aftermeasure
         * @param result: 总长度
         */
        this.fire('aftermeasure', {'result': lenSum});
    },

    _caculateLenSum : function() {
        var rings = this.rings;
        if (rings.length <= 1) {
            return 0;
        }
        var lenSum = 0;
        var projection = this.map._getProjection();
        for (var i=1,len=rings.length;i<len;i++){
            lenSum += projection.getGeodesicLength(rings[i-1],rings[i]);
        }
        return parseFloat(lenSum);
    },

    _genMeasurePoint: function(coordinate, id) {
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



    _outline: function(content,width,top,left) {
        if (top===null) {
            top=-10;
        }
        if (left===null) {
            left = 10;
        }
        return '<div class="MAP_CONTROL_PointTip" style="top:'+
            top+'px;left:'+left+'px;width:'+width+'px">'+content+'</div>';
    },

    _endMeasure: function(coordinate, divContent, geo) {
        var _geo = geo;
        var counter = this.counter;
        var tmpMarkers = this.tmpMarkers;
        // var map = this.map;
        var point = this._genMeasurePoint(coordinate, this.layerId+'_endp_'+counter);

        var rings;
        if(geo.getPath) {
            rings = geo.getPath();
        } else if(geo.getShell) {
            rings = geo.getShell();
        }
        var offsetX,offsetY;
        //TODO 不清楚map.incre是什么？
//      if (map.incre.x*(rings[rings.length-1].x - rings[rings.length-2].x)>0) {
        if ((rings[rings.length-1].x - rings[rings.length-2].x)>0) {
            offsetX = 15;
        } else {
            offsetX = -20;
        }
//      if (map.incre.y*(rings[rings.length-1].y - rings[rings.length-2].y)>0) {
        if ((rings[rings.length-1].y - rings[rings.length-2].y)>0) {
            offsetY = -30;
        } else {
            offsetY = 10;
        }
        var endDiv = this._outline('<b>'+divContent+'<b>',80,offsetY);
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
                if (strEndWith(this.tmpMarkers[i].getId(),"_"+closeBtn.getAttributes())) {
                    this.tmpMarkers[i].remove();
                }
            }
        });

        //去掉最后一个点的标签
        if(tmpMarkers&&tmpMarkers.length>0) {
            var center = tmpMarkers[tmpMarkers.length-1].getCenter();

            var endIndexes = [tmpMarkers.length-1];
            var i, len;
            for (i=tmpMarkers.length-3;i>0;i-=2) {
                if (tmpMarkers[i].center.x === center.x && tmpMarkers[i].center.y === center.y) {
                    endIndexes.push(i);
                } else {
                    break;
                }
            }
            for (i=0, len=endIndexes.length;i<len;i++) {
                tmpMarkers[endIndexes[i]].remove();
            }
        }

        this.drawLayer.addGeometry([point,closeBtn,marker,_geo]);

        tmpMarkers.push(marker);
        tmpMarkers.push(point);
        tmpMarkers.push(closeBtn);
        function strEndWith(str, end) {
            if (str===null||str===''||str.length===0||end.length>str.length) {
             return false;
            }
            if (str.substring(str.length-end.length)===end) {
             return true;
            } else {
             return false;
            }
            return true;
        }
    },

    _changeCursor:function(cursorStyle) {
       /*if (_canvas.style!=null && !_canvas.style.cursor)
            _canvas.style.cursor = cursorStyle;*/
   }
});
/**
 * 测面积鼠标工具类
 */
Z['ComputeAreaTool'] = Z.ComputeAreaTool = Z.Class.extend({
	includes: [Z.Eventable],

	options:{

	},

	/**
	* 初始化测面积工具
	* options:{aftermeasure: fn}
	*/
	initialize: function(options, map) {
		//TODO options应该设置到this.options中
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
	* @expose
	*/
	enable: function() {
		if (!this.map) {
			return;
		}
		this.drawLayer = this.map.getLayer(this.layerId);
		if (this.drawLayer !== null && this.drawTool !== null) {
			this.drawTool.enable();
			return;
		}
		if (this.drawLayer !== null) {
			this.map.removeLayer(this.layerId);
		}
		// var _canvas = this.map.canvasDom;

		this.drawLayer = new Z.VectorLayer(this.layerId);
		this.map.addLayer(this.drawLayer);

		var drawTool = new Z.DrawTool({
			'mode':Z.Geometry.TYPE_POLYGON,
			'symbol': {
				'strokeSymbol':{'stroke':'#ff0000', 'stroke-width':2, 'opacity':1},
				'fillSymbol':{'fill':'#ff0000', 'fill-opacity':0.2}
			},
			'afterdrawdisable': true
		}).addTo(this.map);

		drawTool.on('startdraw', Z.Util.bind(this._startMeasure, this));
		drawTool.on('drawring', Z.Util.bind(this._measureRing, this));
		drawTool.on('afterdraw', Z.Util.bind(this._afterMeasure, this));

		this.drawTool = drawTool;

		this.counter = 0;
		this.pointCounter = 0;
		this.tmpMarkers = [];
	},

	/**
	* 停止测距鼠标工具
	* @expose
	*/
	disable: function() {
		this.clear();
		if (this.drawTool !== null) {
			this.drawTool.disable();
		}
	},

	/**
	 * 清除测量过程中产生的标注
	 * @expose
	 */
	clear:function(){
		if (!this.map) {
			return;
		}
		if (this.drawLayer !== null) {
			this.drawLayer.clear();
		}
		var _canvas = this.map.canvasDom;
		if (!_canvas) {
			this._changeCursor('default');
		}
		this.rings = [];
	},

	_measureRing: function (param) {
		var coordinate = param['coordinate'];
		this.pointCounter ++;
		var point = this._genMeasurePoint(coordinate,this.layerId + '_ringp_' + this.pointCounter + '_' + this.counter);
		this.drawLayer.addGeometry([point]);
		this.tmpMarkers.push(point);
	},

	_startMeasure: function(param) {
		var coordinate = param['coordinate'];
		var point = this._genMeasurePoint(coordinate,this.layerId + '_ringp_' + this.pointCounter +'_' + this.counter);
		this.drawLayer.addGeometry([point]);
		this.tmpMarkers.push(point);
	},

	_afterMeasure: function(param) {
		var coordinate = param['coordinate'];
		var polygon = param['target'];
		var area = this.map._computeGeodesicArea(polygon);
		var divContent = null;
		if (area > 1000000) {
			divContent = (area/1000000).toFixed(1)+'平方公里';
		} else {
			divContent = area.toFixed(1)+'平方米';
		}

		this._endMeasure(coordinate, divContent, polygon);
		this._changeCursor('default');
		this.counter++;
		/**
		 * 面积量算结束事件
		 * @event aftermeasure
		 * @param result: 总面积
		 */
		this.fire('aftermeasure', {'result' : area});
	},



	_outline: Z.DistanceTool.prototype._outline,
	_genMeasurePoint: Z.DistanceTool.prototype._genMeasurePoint,
	_endMeasure: Z.DistanceTool.prototype._endMeasure,
	_changeCursor: Z.DistanceTool.prototype._changeCursor
});
/**
 * 瓦片系统描述类
 * @param  {Object} scale   x,y轴计算系数
 * @param  {Object} origin 计算原点
 */
Z.TileSystem=function(sx, sy, ox, oy){
    if (Z.Util.isArray(sx)) {
        this.scale =  { x : sx[0] , y : sx[1] };
        this.origin = { x : sx[2] , y : sx[3] };
    } else {
        this.scale =  { x : sx , y : sy };
        this.origin = { x : ox , y : oy };
    }
};

Z.Util.extend(Z.TileSystem, {
    //TMS瓦片系统的参考资料:
    //http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification
    //OSGEO组织的TMS瓦片系统, profile为global-mercator, mbtiles等tms标准瓦片服务采用该标准
    'tms-global-mercator' : new Z.TileSystem(1, 1, -20037508.34, -20037508.34),

    //OSGEO组织的TMS瓦片系统, profile为global-geodetic
    'tms-global-geodetic' : new Z.TileSystem(1, 1, -180, -90),

    //谷歌, 必应,高德, 腾讯等地图服务采用的瓦片系统
    'web-mercator' : new Z.TileSystem(1, -1, -20037508.34, 20037508.34),

    //百度地图采用的瓦片系统
    'baidu' : new Z.TileSystem(1, 1, 0, 0),

    getInstance:function(ts) {
        return Z.TileSystem[ts.toLowerCase()];
    }
});
Z['TileInfo']={
    'web-mercator':{
        'projection':'EPSG:3857', //4326 | 3857 | bd09
        // 'transformation' : [1, 0, 0, -1, 1, 1],
        'tileSystem' : 'web-mercator',
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
        'fullExtent': {
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
    'tms-global-mercator':{
        'projection':'EPSG:3857', // 4326 | 3857 | bd09 | pixel
        'tileSystem':'TMS-GLOBAL-MERCATOR',
        // 'transformation' : [1, 0, 0, 1, -20037508.34, -20037508.34],
        'maxZoomLevel':22,
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
        'fullExtent': {
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
        'tileSystem':'BAIDU',
        // 'transformation' : [0, 1, 1, 0, 0, 0],
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
        'fullExtent':{
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

Z.TileConfig=Z.Class.extend({

        // includes:Z.TileUtil.Common,

        statics : {

        },

        //根据不同的语言定义不同的错误信息
        exceptionDefs:{
            'en-US':{
                'INVALID_TILEINFO':'Invalid TILEINFO',
                'INVALID_TILESYSTEM':'Invalid tileSystem'
            },
            'zh-CN':{
                'INVALID_TILEINFO':'无效的TILEINFO',
                'INVALID_TILESYSTEM':'无效的tileSystem'
            }
        },

        /**
         * 初始化方法
         * @param  {[TileInfo]} tileInfo [图层配置属性,参考TileInfo.js中的例子]
         */
        initialize:function(tileInfo) {
            if (!this.checkTileInfo(tileInfo)) {
                throw new Error(this.exceptions['INVALID_TILEINFO']+':'+tileInfo);
            }
            //tileInfo是预设值的字符串
            var lodName = null;
            //预定义的lodinfo
            if (Z.Util.isString(tileInfo)) {
                lodName = tileInfo;
                tileInfo = Z['TileInfo'][tileInfo.toLowerCase()];
                if (!tileInfo) {
                    throw new Error(this.exceptions['INVALID_TILEINFO']+':'+lodName);
                }
            }
            this.prepareTileInfo(tileInfo);

        },

        prepareTileInfo:function(tileInfo) {
            this.tileInfo = tileInfo;
            Z.Util.extend(this,tileInfo);
            if (!this['padding']) {
                this['padding'] = {
                    'width':0,
                    'height':0
                };
            }
            this.projectionInstance = Z.Projection.getInstance(tileInfo['projection']);

            /*if ('baidu' === tileInfo['projection'].toLowerCase()) {
                Z.Util.extend(this,Z.TileUtil.BD09);
            }  else {
                if (lodName && 'globalmercator' === lodName) {
                    Z.Util.extend(this,Z.TileUtil.GLOALMERCATOR);
                } else {
                    Z.Util.extend(this,Z.TileUtil.Default);
                }

            }*/
            var tileSystem;
            if (!tileInfo['tileSystem']) {
                //默认是WEB-MERCATOR瓦片系统
                tileSystem = Z.TileSystem['web-mercator'];
            } else if (Z.Util.isString(tileInfo['tileSystem'])){
                tileSystem = Z.TileSystem.getInstance(tileInfo['tileSystem']);
            } else {
                var tsPrams = tileInfo['tileSystem'];
                tileSystem = new Z.TileSystem(tsPrams);
            }

            if (!tileSystem) {
                throw new Error(this.exceptions['INVALID_TILESYSTEM']+':'+tileInfo['tileSystem']);
            }
            this.tileSystem = tileSystem;

            //自动计算transformation
            var fullExtent = tileInfo['fullExtent'];
            var a = fullExtent['right']>fullExtent['left']?1:-1,
                b = fullExtent['top']>fullExtent['bottom']?-1:1,
                c = tileSystem['origin']['x'],
                d = tileSystem['origin']['y'];
            this.transformation = new Z.Transformation([a,b,c,d]);
        },

        checkTileInfo:function(tileInfo) {
            if (!tileInfo) {return false;}
            if (Z.Util.isString(tileInfo) && (Z['TileInfo'][tileInfo.toLowerCase()])) {
                return true;
            }
            if (!tileInfo['projection']) {
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
            //TODO maptalks和arcgis图层的初始化
        },

        equals:function(tileConfig, zoomLevel) {
            try {
                return tileConfig['resolutions'][zoomLevel] === this['resolutions'][zoomLevel] &&
                this['projection'] === tileConfig['projection'];
            } catch (error) {
                return false;
            }

        },

        getProjectionInstance:function() {

            return this.projectionInstance;
        },

        getTransformationInstance:function() {
            return this.transformation;
        },

        getResolution:function(z) {
            if (this['resolutions']) {
                return this['resolutions'][z];
            }
            return 0;
        },

        /**
         * 根据中心点投影坐标, 计算中心点对应的瓦片和瓦片内偏移量
         * @param  {[type]} pLonlat   [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getCenterTileIndex:function( pLonlat, zoomLevel) {
            var tileSystem = this.tileSystem;
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            var tileLeft = tileSystem['scale']['x']*tileSize['width']*tileX * resolution+tileSystem['origin']['x'];
            var tileTop = tileSystem['origin']['y'] + tileSystem['scale']['y']*tileY* resolution * tileSize['height'];
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
            var tileSystem = this.tileSystem;
            var tileSize=this['tileSize'];
            // var maxExtent=tileSystem['origin'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.floor((tileSystem['origin']['y'] + tileSystem['scale']['y']*pLonlat.y) / ( resolution* tileSize['height']));
            var tileX = Math.floor((tileSystem['scale']['x']*pLonlat.x - tileSystem['origin']['x']) / (resolution * tileSize['width']));
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
            var tileSystem = this.tileSystem;
            return {'y':(tileY-tileSystem['scale']['y']*offsetY), 'x':(tileX+tileSystem['scale']['x']*offsetX)};
        },
        /**
         * 计算瓦片左上角的经纬度坐标
         * @param  {[type]} tileY     [description]
         * @param  {[type]} tileX     [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getTileProjectedNw:function(tileY,tileX,zoomLevel) {
            var tileSystem = this.tileSystem;
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            // var maxExtent = this['origin'];
            var y = tileSystem['origin']['y'] + tileSystem['scale']['y']*(resolution* tileSize['height']);
            var x = tileSystem['scale']['x']*tileX*resolution*tileSize['width']+tileSystem['origin']['x'];
            return this.getProjectionInstance().unproject({x:x,y:y});
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
				//_this._executeListeners("loadcomplete");
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

Z.Render = {};
Z.Render.Dom = function(layer) {
    this.layer = layer;
    this._visible=true;
};

Z.Render.Dom.prototype= {
    getMap:function() {
        return this.layer.getMap();
    },

    load:function() {
        var map = this.getMap();
        this.layerDom = map._panels.svgContainer;
        map._createSVGPaper();
        this._addTo();
    },

    /**
     * 显示图层
     * @expose
     */
    show:function() {
        if (this._visible) {
            return;
        }
        this.layer._eachGeometry(function(geo) {
            geo.show();
        });
        this._visible=true;
        return this;
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        if (!this._visible) {
            return;
        }
        this.layer._eachGeometry(function(geo) {
            geo.hide();
        });
        this._visible=false;
        return this;
    },

    /**
     * 图层是否显示
     * @return {Boolean} 图层是否显示
     * @expose
     */
    isVisible:function() {
        return this._visible/* && this.layerDom && this.layerDom.style.display !== 'none'*/;
    },

    /**
     * 绘制Geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    _paintGeometries:function(geometries) {
        for (var i=0,len=geometries.length;i<len;i++) {
            var geo = geometries[i];
            if (!geo) {
                continue;
            }
            if (geo._getPainter()) {
                geo._getPainter().paint(this.layerDom,  this.zIndex);
            }
        }
    },



    _addTo:function() {
        this.layer._eachGeometry(function(geo) {
            if (geo._getPainter()) {
                geo._getPainter().paint(this.layerDom,  this.zIndex);
            }
        });
    },




    _setZIndex:function(zIndex) {
        this.zIndex=zIndex;
        this.layer._eachGeometry(function(geo) {
            if (geo._getPainter()) {
                geo._getPainter()._setZIndex(zIndex);
            }
        });
    },

    _onMoveStart:function() {
        //nothing to do
    },

    /**
     * 地图中心点变化时的响应函数
     */
    _onMoving:function() {
        //nothing to do
    },

    _onMoveEnd:function() {
        //nothing to do
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    _onZoomStart:function() {
        //this.hide();
    },

    _onZoomEnd:function() {
        this.layer._eachGeometry(function(geo) {
            geo._onZoomEnd();
        });
    },

    _onResize:function() {
        //nothing to do
    }
};
Z.Render.Canvas = function(layer) {
    this.layer = layer;
    this._visible=true;
};

Z.Render.Canvas.prototype = {

    getMap:function() {
        return this.layer.getMap();
    },

    load:function() {
        this._prepareRenderAndLoad();
    },

    _prepareRenderAndLoad:function() {
        var map = this.getMap();
        var baseRender = this._getBaseRender();
        if (!baseRender) {
            baseRender = new Z.Render.Canvas.Base(map);
            Z.Render.Canvas.Base.registerBaseCanvasRender(map,baseRender);
        }
        if (map.isLoaded()) {
            baseRender.load();
        }
    },

    _getBaseRender:function() {
        var map = this.getMap();
        var baseRender = Z.Render.Canvas.Base.getBaseCanvasRender(map);
        return baseRender;
    },

    /**
     * 显示图层
     * @expose
     */
    show:function() {
        if (this._visible) {
            return;
        }
        this._visible=true;
        this._repaintBaseRender();
        return this;
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        if (!this._visible) {
            return;
        }
        this._visible=false;
        this._repaintBaseRender();
        return this;
    },

    /**
     * 图层是否显示
     * @return {boolean} 图层是否显示
     * @expose
     */
    isVisible:function() {
        return this._visible;
    },

    _setZIndex:function(zindex) {
        this.zindex=zindex;
    },

     /**
     * 绘制geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    _paintGeometries:function(geometries) {
        this._repaintBaseRender();
    },

    _repaintBaseRender:function() {
        var baseRender = this._getBaseRender();
        baseRender.repaint();
    },

    _onMoving:function(param) {
        //nothing to do
    },

    _onMoveEnd:function(param) {
        this._repaintBaseRender();
    },

    _onResize:function(param) {
        this._repaintBaseRender();
    },

    _onZoomStart:function(param) {
        this._getBaseRender()._onZoomStart();
    },

    _onZoomEnd:function(param) {
        this._getBaseRender()._onZoomEnd();
    }
};
Z.Render.Canvas.Base=function(map) {
    this.map = map;
    this.resourceLoader = new Z.ResourceLoader();
};

Z.Util.extend(Z.Render.Canvas.Base, {
    getBaseCanvasRender:function(map) {
        return map._baseCanvasRender;
    },

    registerBaseCanvasRender:function(map, baseCanvasRender) {
        map._baseCanvasRender = baseCanvasRender;
    }
});

    //load,_onMoving, _onMoveEnd, _onResize, _onZoomStart, _onZoomEnd
Z.Render.Canvas.Base.prototype={

    load:function() {
        if (!this.canvasContainer) {
            var map = this.getMap();
            this.canvasContainer = map._panels.canvasLayerContainer;
            this.createLayerCanvas();
        }
        this.repaint();
    },

    getMap:function() {
        return this.map;
    },

    createLayerCanvas:function() {
        if (!this.layerCanvas) {
            if (!this.canvasContainer) {return;}

            //初始化
            var layerCanvas = Z.DomUtil.createEl('canvas');
            layerCanvas.style.cssText = 'position:absolute;top:0px;left:0px;';
            this.updateCanvasSize(layerCanvas);
            this.canvasContainer.appendChild(layerCanvas);
            this.layerCanvas = layerCanvas;
            this.canvasCtx = this.layerCanvas.getContext("2d");
            this.canvasCtx.translate(0.5, 0.5);
        }
    },

    updateCanvasSize:function(canvas) {
        var mapSize = this.map.getSize();
        //retina屏支持
        var r = Z.Browser.retina ? 2:1;
        canvas.height = r * mapSize['height'];
        canvas.width = r * mapSize['width'];
        canvas.style.width = mapSize['width']+'px';
        canvas.style.height = mapSize['height']+'px';
    },

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
            me.updateCanvasSize(me.layerCanvas);
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
                var ext = geo._computeVisualExtent(geo._getProjection());
                if (!ext || !Z.Extent.isIntersect(ext,extent)) {
                    return;
                }
                geo._getPainter().paint(me.canvasCtx,me.resourceLoader);
            });
        }
    },

    clearCanvas:function(extent) {
        var map = this.getMap(),
            projection = map._getProjection();
        var p1 = projection.project(new Z.Coordinate(extent['xmin'],extent['ymin'])),
            p2 = projection.project(new Z.Coordinate(extent['xmax'],extent['ymax']));
        var px1 = map._transform(p1),
            px2 = map._transform(p2);
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
            var resource = geo._getExternalResource();
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

    _getLayerList:function() {
        return this.getMap()._canvasLayers;
    },

    /**
     * 遍历geometry
     * @param  {Function} fn 回调函数
     */
    eachGeometry:function(fn,obj) {
        var layers = this._getLayerList();
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
            var cache = layers[i]._getGeoCache();
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

    _onZoomStart:function(param) {
        this.hide();
        var mapSize = this.getMap().getSize();
        this.canvasCtx.clearRect(0, 0, mapSize['width'], mapSize['height']);
    },

    _onZoomEnd:function(param) {
        this.repaint();
        this.show();
    },

    getCanvasContainer:function() {
        return this.layerCanvas;
    }

};
/**
 * 所有图层的基类
 * 供Map调用的图层方法有:
 * load,_onMoving, _onMoveEnd, _onResize, _onZoomStart, _onZoomEnd
 * @param  {[type]} map             [description]
 * @param  {[type]} zIndex)         {       if        (!map) {return;}      this.map [description]
 * @param  {[type]} getId:function( [description]
 * @return {[type]}                 [description]
 */
Z['Layer']=Z.Layer=Z.Class.extend({

    includes: Z.Eventable,

    events:{
        LAYER_LOADED:'layerloaded'
    },


    _prepare:function(map,zIndex) {
        if (!map) {return;}
        this.map = map;
        this._setZIndex(zIndex);
        if (Z.Util.isNil(this._visible)) {
            this._visible = true;
        }
    },


    getZIndex:function() {
        return this.zIndex;
    },

    /**
     * 获取图层id
     * @returns
     * @expose
     */
    getId:function() {
        return this.identifier;
    },

    /**
     * 设置图层id
     * @param {String} [id] [图层id]
     * @expose
     */
    setId:function(id) {
        this.identifier = id;
    },

    /**
     * 获取图层所属的地图对象
     * @expose
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
     * @expose
     */
    bringToFront:function() {
        var layers = this._getLayerList();
        var hit=this._getLayerIndexOfList(layers);
        if (hit === layers.length-1) {return;}
        if (hit >= 0) {
            layers.splice(hit,1);
            layers.push(this);
        }
        for (var i=0, len=layers.length;i<len;i++) {
            layers[i]._setZIndex(layers[i].baseZIndex+i);
        }
    },

    /**
     * 将图层置底
     * @expose
     */
    bringToBack:function(){
        var layers = this._getLayerList();
        var hit=this._getLayerIndexOfList(layers);
        if (hit === 0) {
            return;
        }
        if (hit > 0) {
            layers.splice(hit,1);
            layers.push(this);
        }
        for (var i=0, len=layers.length;i<len;i++) {
            layers[i]._setZIndex(layers[i].baseZIndex+i);
        }
    },


    /**
     * 获取图层在图层列表中的index
     * @param layers
     * @returns {Number}
     */
    _getLayerIndexOfList:function(layers) {
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
    _getLayerList:function() {
        if (!this.map) {return null;}
        if (this instanceof Z.VectorLayer) {
            if (this.isCanvasRender()) {
                return this.map._canvasLayers;
            } else {
                return this.map._svgLayers;
            }
        } else if (this instanceof Z.Render.Canvas.Base) {
            return this.map._canvasLayers;
        } else if (this instanceof Z.DynamicLayer) {
            return this.map._dynLayers;
        } else if (this instanceof Z.TileLayer) {
            return this.map._tileLayers;
        } else if (this instanceof Z.HeatLayer) {
            return this.map._heatLayers;
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
        'urlTemplate':Z.host+'/engine/images/blank.png',
        'subdomains':[''],
        //是否检查
        'showOnTileLoadComplete':true,
        'tileInfo':'web-mercator'
    },

    /**
     * <pre>
     * 瓦片图层类构造函数
     * 图层配置如下:
     *     tileInfo: 空间参考系设置,例如ESGP:3857
     *     opacity:图层透明度
     *     urlTemplate:URL模板,例如http://{s}.example.com/{z}/{y}/{x}.png
     *     subdomains:数组,用来轮流替换url模板中的{s}变量
     *     tileSize:{width:256,height:256}
     * tileInfo的值可为字符串类型的预定义配置或属性对象:
     *      预定义配置有:"web-mercator","global-mercator","baidu"
     *      如果是属性对象,则需要指定
     * </pre>
     * @param  {String} id 图层identifier
     * @param  {Object} opts 图层配置
     */
    initialize:function(id,opts) {
        this.setId(id);
        Z.Util.setOptions(this,opts);
    },

    /**
     * * 加载TileConfig
     * @param  {fn} onLoaded 加载完成后的回调函数
     */
    _loadTileConfig:function(onLoaded) {
        //TileLayer只支持预定义的TILEINFO
        this._tileConfig = new Z.TileConfig(this.options['tileInfo']);
        if (onLoaded) {
            onLoaded();
        }
    },

    _getTileConfig:function(){
        if (!this._tileConfig) {
            //如果tilelayer本身没有设定tileconfig,则继承地图基础底图的tileconfig
            if (this.map) {
                return this.map._getTileConfig();
            }
        }
        return this._tileConfig;
    },

    _getTileUrl:function(x,y,z) {
        if (!this.options['urlTemplate']) {
            return this.options['errorTileUrl'];
        }
        var urlTemplate = this.options['urlTemplate'];
        var domain = '';
        if (this.options['subdomains']) {
            var subdomains = this.options['subdomains'];
            if (Z.Util.isArrayHasData(subdomains)) {
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
    _setZIndex:function(zIndex) {
        this.zIndex = zIndex;
        if (this._tileContainer) {
            this._tileContainer.style.zIndex = (this.baseDomZIndex+zIndex);
        }
    },

    /**
     * TileLayer的删除逻辑
     */
    _onRemove:function() {
        this.clear();
        this._clearExecutors();
        if (this._tileContainer) {
            Z.Util.removeDomNode(this._tileContainer);
        }
    },

    /**
     * 地图中心点变化时的响应函数
     */
    _onMoving:function() {
        this._fillTiles(false);
    },

    _onMoveEnd:function() {
        this._fillTiles(false);
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    _onZoomStart:function(donotRemoveTiles) {
        this._clearExecutors();
        if (!donotRemoveTiles && this._tileContainer) {
            this.clear();
        }
    },

    _onZoomEnd:function() {
        //this._fillTiles(true);
        this.load();
    },

    _onResize:function() {
        this._fillTiles(false);
    },

    /**
     * 载入前的准备操作
     */
    _prepareLoad:function() {
        //nothing to do here, just return true
        return true;
    },

    /**
     * load the tile layer, can be overrided by sub-classes
     */
    load:function(){
        this._load();
    },

    _load:function() {
        if (!this.getMap()) {return;}
        if (!this._tileContainer) {
            this._initPanel();
        }
        this.clear();
        if (this._prepareLoad()) {
            this._clearExecutors();
            var me = this;
            this._tileLoadExecutor = setTimeout(function() {
                me._fillTiles(me.options['showOnTileLoadComplete']);
            },20);
        }
    },

    clear:function() {
        this._tileMap = {};
        if (this._tileContainer) {
            this._tileContainer.innerHTML="";
        }
    },

    _getTileSize:function() {
        return this._getTileConfig()['tileSize'];
    },

    getPadding:function() {
        var padding = this._getTileConfig()['padding'];
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
    _clearExecutors:function() {
        if (this._tileLoadExecutor) {
            clearTimeout(this._tileLoadExecutor);
        }
        if (this._fireEventExecutor) {
            clearTimeout(this._fireEventExecutor);
        }
        if (this._completeExecutor) {
            clearTimeout(this._completeExecutor);
        }
    },

    /**
     * 载入瓦片
     * @param  {Boolean} isCheckTileLoad 检查瓦片是否载入完,如果为true,则在瓦片载入完后再显示图层容器元素
     */
    _fillTiles:function(isCheckTileLoad) {
        // isCheckTileLoad = false;
        var map =this.map;
        if (!map) {
            return;
        }
        var tileContainer = this._tileContainer;
        var tileConfig = this._getTileConfig();
        if (!tileContainer || !tileConfig) {return;}
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
                if (me._completeExecutor) {
                    clearTimeout(me._completeExecutor);
                }
                if (me._fireEventExecutor) {
                        clearTimeout(me._fireEventExecutor);
                    }
                me._completeExecutor=setTimeout(function() {
                    tileContainer.appendChild(dSegment);
                    me._fireEventExecutor=setTimeout(function() {
                        me.fire(me.events.LAYER_LOADED,{'target':this});
                    },500);
                },10);
            }
        }
        var tileSize = this._getTileSize(),
            zoomLevel = map.getZoomLevel(),
            mapDomOffset = map.offsetPlatform();
        var holderLeft=mapDomOffset["left"],
            holderTop = mapDomOffset["top"],
            mapWidth = map.width,
            mapHeight = map.height;
            //中心瓦片信息,包括瓦片编号,和中心点在瓦片上相对左上角的位置
        var centerTileIndex =  tileConfig.getCenterTileIndex(map._getPrjCenter(), zoomLevel);

        //计算中心瓦片的top和left偏移值
        var centerOffset={};
        centerOffset.top=Math.round(parseFloat(mapHeight/2-centerTileIndex["offsetTop"]));
        centerOffset.left=Math.round(parseFloat(mapWidth/2-centerTileIndex["offsetLeft"]));
        //中心瓦片上下左右的瓦片数
        var tileTopNum =Math.ceil(Math.abs(centerOffset.top)/tileSize["width"]),
            tileLeftNum=Math.ceil(Math.abs(centerOffset.left)/tileSize["height"]),
            tileBottomNum=Math.ceil(Math.abs(mapHeight-centerOffset.top)/tileSize["height"]),
            tileRightNum=Math.ceil(Math.abs(mapWidth-centerOffset.left)/tileSize["width"]);

    //  只加中心的瓦片，用做调试
    //  var centerTileImg = this._createTileImage(centerOffset.left,centerOffset.top,this.config._getTileUrl(centerTileIndex["topIndex"],centerTileIndex["leftIndex"],zoomLevel),tileSize["height"],tileSize["width"]);
    //  tileContainer.appendChild(centerTileImg);

        var currentTiles = this._tileMap;
        //TODO 瓦片从中心开始加起
        for (var i=-(tileLeftNum);i<tileRightNum;i++){
            for (var j=-(tileTopNum);j<=tileBottomNum;j++){
                    var tileIndex = tileConfig.getNeighorTileIndex(centerTileIndex["y"], centerTileIndex["x"], j,i);
                    var tileId=tileIndex["y"]+","+tileIndex["x"];
                    var tileLeft = centerOffset.left + tileSize["width"]*i-holderLeft;
                    var tileTop = centerOffset.top +tileSize["height"]*j-holderTop;
                    if (!currentTiles[tileId]) {
                        var tileUrl = this._getTileUrl(tileIndex["x"],tileIndex["y"],zoomLevel);
                        var tileImage = this._createTileImage(tileLeft,tileTop, tileUrl,(isCheckTileLoad?checkAndLoad:null));
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

        if (this._removeout_timeout) {
            clearTimeout(this._removeout_timeout);
        }
        this._removeout_timeout = setTimeout(function() {
            me._removeTilesOutOfContainer();
        },500);



    },

    /**
     * 生成瓦片图片
     * @param  {Number} _tileLeft    瓦片的style.left
     * @param  {Number} _tileTop     瓦片的style.top
     * @param  {String} url          瓦片地址
     * @param  {Fn}     loadcallback 额外的瓦片图片onload回调
     * @return {Image}              瓦片图片对象
     */
    _createTileImage:function(_tileLeft, _tileTop, url,  onloadFn) {
        var tileImage = new Image(),
            tileSize = this._getTileSize();
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
    _removeTilesOutOfContainer:function() {
        //var _mapContainer = this.map.mapContainer;
        if (this.map.isBusy) {
            //console.log("blocked");
            return;
        }
        var tileContainer = this._tileContainer;
        if (!tileContainer) {return;}
        var map = this.map;
        var mapHeight = map.height,
            mapWidth = map.width,
            mapDomOffset = map.offsetPlatform(),
            tileConfig = this._getTileConfig();
        var _holderLeft = mapDomOffset["left"],
            _holderTop = mapDomOffset["top"],
            _tileSize = tileConfig["tileSize"],
            padding = this.getPadding();
        var currentTile = null;
        try {
            currentTile = tileContainer.firstChild;
        } catch (err) {

        }

        if (!currentTile) {return;}
        var tilesToRemove = [];
        while (currentTile) {
            if (!this._tileMap[currentTile.id]) {
                currentTile = currentTile.nextSibling;
                continue;
            }
            var tileLeft = this._tileMap[currentTile.id].left+padding["width"]/2+_holderLeft,
                tileTop = this._tileMap[currentTile.id].top+padding["height"]/2+_holderTop;
            if ( tileLeft >=mapWidth ||  tileLeft <= -_tileSize["width"] || tileTop > mapHeight || tileTop <  -_tileSize["height"]) {
                tilesToRemove.push(currentTile);
                delete this._tileMap[currentTile.id];
            }
            currentTile = currentTile.nextSibling;
        }
        var count = tilesToRemove.length;
        if ( count === 0) {return;}
        for (var i=0;i<count;i++) {
            Z.DomUtil.removeDomNode(tilesToRemove[i]);
        }
    },


    _initPanel:function() {
        var mapContainer = this.map._panels.mapContainer;
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
        this._tileContainer = tileContainer;
    }
});
/**
 * [initialize description]
 *
 */
Z['ArcgisTileLayer'] = Z.ArcgisTileLayer = Z.TileLayer.extend({
    //根据不同的语言定义不同的错误信息
    exceptionDefs:{
        'en-US':{
           'INVALID_SERVICE' : 'invalid arcgis rest service'
        },
        'zh-CN':{
            'INVALID_SERVICE' : '无效的Arcgis rest服务'
        }
    },

    options:{
        service:'',
        version:10.2
    },

    initialize:function(id, options) {
        Z.Util.setOptions(this, options);
    },

    /**
     * * 加载TileConfig
     * @param  {fn} onLoaded 加载完成后的回调函数
     */
    _loadTileConfig:function(onLoaded) {
        this._readAndParseServiceInfo(function() {
            if (onLoaded) {
                onLoaded();
            }
        });

    },

    /**
     * 读取ArcGIS Rest服务的LOD信息
     * @param  {fn} onLoadedFn 读取完后的回调
     */
    _readAndParseServiceInfo:function(onLoadedFn) {
        //http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer?f=pjson
        var service = this.options['service'];
        if (Z.Util.isString(service) && service.indexOf('http') >= 0) {
            //网址
            var remoteUrl = service+'?f=pjson';
            var url = Z.host+"/engine/proxy?url="+remoteUrl;
            var me = this;
            var ajax = new Z.Util.Ajax(url,0,null,function(responseText){
                var serviceInfo = Z.Util.parseJson(responseText);
                var tileInfo = me._parseServiceInfo(serviceInfo);
                me._tileConfig = new Z.TileConfig(tileInfo);
                if (onLoadedFn) {
                    onLoadedFn();
                }
            });
            ajax.get();
        } else {
            //service 也可以直接是arcgis的rest服务json
            var tileInfo = this._parseServiceInfo(service);
            this._tileConfig = new Z.TileConfig(tileInfo);
            if (onLoadedFn) {
                onLoadedFn();
            }
        }
    },



    /**
     * 解析ArcGIS Rest服务返回的瓦片服务信息
     * @param  {[type]} serviceInfo [description]
     * @return {[type]}                 [description]
     */
    _parseServiceInfo:function(serviceInfo) {
        if (!serviceInfo) {
            throw new Error(this.exceptions['INVALID_SERVICE']+':'+this.options['service']);
        }
        var extension = '';
        /*var version = serviceInfo['version'];
        this.options['version'] = version;

        if (this.version && this.version < 10.1) {
            extension += "."+serviceInfo['tileInfo']['format'];
        }*/
        this.options['urlTemplate'] = this.options['service']+'/tile/{z}/{y}/{x}'+extension;

        //projection , 目前只支持3857和4326两种,
        //根据投影坐标的单位决定, 如果是degree, 则是4326, 如果是meter则是3857
        var _projection;
        var units = serviceInfo['units'];
        if (units.toLowerCase().indexOf('degree') >= 0) {
            _projection = 'EPSG:4326';
        } else {
            _projection = 'EPSG:3857';
        }

        var lods = serviceInfo['tileInfo']['lods'];
        var size = lods.length;

        var _minZoomLevel = lods[0]['level'];
        var _maxZoomLevel = lods[size-1]['level'];

        var _resolutions = [];
        for (var i=0;i<size;i++) {
            _resolutions.push(lods[i]['resolution']);
        }

        var fullExtent = serviceInfo['fullExtent'];
        var _fullExtent = {
            'top'   : fullExtent['ymax'],
            'left'  : fullExtent['xmin'],
            'bottom': fullExtent['ymin'],
            'right' : fullExtent['xmax']
        };

        var tileInfo = serviceInfo['tileInfo'];
        var _tileSize = {
            'width'  : tileInfo['rows'],
            'height' : tileInfo['cols'],
            'dpi'    : tileInfo['dpi']
        };

        var _tileSystem = [1, -1, tileInfo['origin']['x'],
            tileInfo['origin']['y']];

        var tileInfo = {
            'projection'    : _projection,
            'tileSystem'    : _tileSystem,
            'minZoomLevel'  : _minZoomLevel,
            'maxZoomLevel'  : _maxZoomLevel,
            'resolutions'   : _resolutions,
            'fullExtent'    : _fullExtent,
            'tileSize'      : _tileSize
        };
        return tileInfo;
    }


});
Z['DynamicLayer']=Z.DynamicLayer=Z.TileLayer.extend({
    //瓦片图层的基础ZIndex
    baseDomZIndex:50,

    options:{
        'showOnTileLoadComplete':false,
        'padding' : 0,
        'minZoomLevel' : -1, //-1 means no limit
        'maxZoomLevel' : -1, //-1 means no limit
        'condition' : null,
        'spatialFilter' : null

    },

    initialize:function(id, opts) {
        this.setId(id);
        // this.options={};
        this.guid=this._GUID();
        Z.Util.setOptions(this, opts);
        //reload时n会增加,改变瓦片请求参数,以刷新浏览器缓存
        this.n=0;
    },

    _GUID:function() {
        return new Date().getTime()+""+(((1 + Math.random()) * 0x10000 + new Date().getTime()) | 0).toString(16).substring(1);
    },

    /**
     * 重新载入动态图层，当改变了图层条件时调用
     * @expose
     */
    reload:function() {
        this.n=this.n+1;
        this.load();
    },

    /**
     * 载入前的准备, 由父类中的load方法调用
     */
    _prepareLoad:function() {
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
        var queryString=this._formQueryString( this.getCondition(), param_spatialFilter);
        var ajax = new Z.Util.Ajax(url,0,queryString,function(responseText){
            var result = Z.Util.parseJson(responseText);
            if (result && result["success"]) {
                me._fillTiles(me.options['showOnTileLoadComplete']);
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
        },map._getZoomMillisecs()+80);
        //通知父类先不载入瓦片
        return false;
    },

    _getTileUrl:function(x,y,z) {
        return this._getRequestUrl(y,x,z);
    },

    /**
     * 获得瓦片请求地址
     * @param topIndex
     * @param leftIndex
     * @param zoomLevel
     * @returns
     */
    _getRequestUrl:function(topIndex,leftIndex,zoomLevel){
            var src= Z.host+"/dynamic/tile?";
            src+=this._getRequestUrlParams(topIndex,leftIndex,zoomLevel);
            return src;
    },

    _getRequestUrlParams:function(topIndex,leftIndex,zoomLevel) {
        var map = this.getMap();
        var tileConfig = map._getTileConfig();
        var tileNw = tileConfig.getTileProjectedNw(topIndex,leftIndex,zoomLevel);
        var params="";
        params+="guid="+this.guid;
        params+="&nw="+tileNw.x+","+tileNw.y;
        params+="&z="+map._zoomLevel;
        params+="&c="+this.n;
        return params;
    },

    _formQueryString:function(condition,spatialFilter) {
        var map = this.getMap();
        var tileConfig = map._getTileConfig();
        var padding = this.getPadding();
        var config = {
            'coordinateType':(Z.Util.isNil(this.options['coordinateType'])?null:this.options['coordinateType']),
            'projection':tileConfig['projection'],
            'guid':this.guid,
            'encoding':'utf-8',
            'mapdb':this.options['mapdb'],
            'padding':padding["width"]+","+padding["height"],
            'len':tileConfig["tileSize"]["width"],
            'res':tileConfig['resolutions'][map.getZoomLevel()],
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
        /*var ret = "projection="+tileConfig['projection']+"&guid="+this.guid;
        ret+="&encoding=utf-8";
        ret+="&mapdb="+this.options["mapdb"];
        // ret+="&coordinateType="+map.getCoordinateType();

        ret+="&padding="+padding["width"]+","+padding["height"];
        ret+="&len="+tileConfig["tileSize"]["width"];
        var opacity = this.getOpacity();
        if (!Z.Util.isNil(opacity)) {
            ret += "&opacity="+this.opacity;
        }

        if (map) {
            ret+="&r="+tileConfig['resolutions'][map.getZoomLevel()];
            var nt = (map._getProjection().srs != 'EPSG:4326');
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
     * @expose
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
     * @expose
     */
    setPadding:function(padding) {
        this.options['padding'] = padding;
        return this;
    },

    /**
     * 获取最小显示比例尺级别
     * @expose
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
     * @expose
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
     * @expose
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
     * @expose
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
     * @expose
     */
    setOpacity:function(opacity) {
        this.options['opacity'] = opacity;
        return this;
    },

    /**
     * 返回动态图层的透明度
     * @return {Number} 透明度
     * @expose
     */
    getOpacity:function() {
        return this.options['opacity'];
    },

    /**
     * 设定查询过滤条件
     * @param {String} condition 查询过滤条件
     * @expose
     */
    setCondition:function(condition) {
        this.options['condition'] = condition;
        return this;
    },

    /**
     * 获取查询过滤条件
     * @return {String} 查询过滤条件
     * @expose
     */
    getCondition:function() {
        return this.options['condition'];
    },

    /**
     * 设定空间过滤条件
     * @param {SpatialFilter} spatialFilter 空间过滤条件
     * @expose
     */
    setSpatialFilter:function(spatialFilter) {
        this.options['spatialFilter'] = spatialFilter;
        return this;
    },

    /**
     * 获取空间过滤条件
     * @return {SpatialFilter} 空间过滤条件
     * @expose
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
    exceptionDefs:{
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
     * @expose
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
     * @expose
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
     * @expose
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
            geo._setInternalId(internalId);
            this._geoCache[internalId] = geo;
            geo._prepare(this);
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
            //图形添加到layer
            geo._fireEvent('afterAdd', {'target':geo});
        }
        var map = this.getMap();
        if (map) {
            this._paintGeometries(geometries);
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
    _eachGeometry:function(fn,obj) {
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
     * @expose
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
     * @expose
     */
    clear:function() {
        this._eachGeometry(function(geo) {
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
    _onGeometryRemove:function(geometry) {
        if (!geometry) {return;}
        //考察geometry是否属于该图层
        if (this != geometry.getLayer()) {
            return;
        }
        var internalId = geometry._getInternalId();
        if (Z.Util.isNil(internalId)) {
            return;
        }
        var geoId = geometry.getId();
        if (!Z.Util.isNil(geoId)) {
            delete this._geoMap[geoId];
        }
        delete this._geoCache[internalId];
    },

    _onRemove:function() {
        this.clear();
        delete this.map;
    },

    _getGeoCache:function() {
        return this._geoCache;
    }
});

Z.OverlayLayer.addInitHook(function() {
    this._geoCache={};
    this._geoMap={};
    this._resources={};
});
Z.VectorLayer=Z.OverlayLayer.extend({

    options:{
        'render':'dom' // possible values: dom - svg or vml, canvas
    },

    /**
     * 构造函数
     * @param  {String} id 图层identifier
     */
    initialize:function(id, options) {
        this.setId(id);
        Z.Util.setOptions(this, options);
        //动态加载Render
        if (this.isCanvasRender()) {
            this._render = new Z.Render.Canvas(this);
        } else {
            this._render = new Z.Render.Dom(this);
        }
    },

    /**
     * 是否用Canvas渲染
     * @return {Boolean}
     * @expose
     */
    isCanvasRender:function() {
        //即不支持svg, 也不支持vml
        if (!Z.Browser.svg && !Z.Browser.vml) {
            return true;
        }
        return 'canvas' === this.options['render'].toLowerCase();
    },

    load:function() {
        this._render.load();
        return this;
    },

    /**
     * 显示图层
     * @expose
     */
    show:function() {
        this._render.show();
        return this;
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        this._render.hide();
        return this;
    },

    /**
     * 图层是否显示
     * @return {Boolean} 图层是否显示
     * @expose
     */
    isVisible:function() {
        return this._render.isVisible();
    },

    /**
     * 绘制Geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    _paintGeometries:function(geometries) {
        this._render._paintGeometries(geometries);
        return this;
    },

    _setZIndex:function(zIndex) {
        this._render._setZIndex(zIndex);
        return this;
    },

    _onMoveStart:function() {
        this._render._onMoveStart();
        return this;
    },

    /**
     * 地图中心点变化时的响应函数
     */
    _onMoving:function() {
        this._render._onMoving();
        return this;
    },

    _onMoveEnd:function() {
        this._render._onMoveEnd();
        return this;
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    _onZoomStart:function() {
        this._render._onZoomStart();
        return this;
    },

    _onZoomEnd:function() {
        this._render._onZoomEnd();
        return this;
    },

    _onResize:function() {
       this._render._onResize();
        return this;
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
        this.cfg._container = this._el;
      },

      _onAdd: function (map) {
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

      _onRemove: function (map) {
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
Z.Painter={};
Z['Geometry']=Z.Geometry=Z.Class.extend({
    includes: [Z.Eventable],

    //根据不同的语言定义不同的错误信息
    exceptionDefs:{
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
        'TYPE_POINT' : 'Point',
        'TYPE_LINESTRING' : 'LineString',
        'TYPE_POLYGON' : 'Polygon',
        'TYPE_MULTIPOINT' : 'MultiPoint',
        'TYPE_MULTILINESTRING' : 'MultiLineString',
        'TYPE_MULTIPOLYGON' : 'MultiPolygon',
        'TYPE_GEOMETRYCOLLECTION' : 'GeometryCollection',
        //extented types
        'TYPE_RECT' : 'Rectangle',
        'TYPE_CIRCLE' : 'Circle',
        'TYPE_ELLIPSE' : 'Ellipse',
        'TYPE_SECTOR' : 'Sector'
    },

    options:{
        'draggable':false,
        'editable':true
    },

    //默认标注样式
    defaultIcon: {
        'markerFile' : Z.host + '/engine/images/marker.png',
        'markerHeight' : 30,
        'markerWidth' : 22,
        'dx': 0,
        'dy': 0
    },

    // 默认线样式
    defaultSymbol:{
        'lineColor' : '#ff0000',
        'lineWidth' : 3,
        'lineOpacity' : 1,
        'lineDasharray': null,
        'polygonFill' : '#ffffff',
        'polygonOpacity' : 1
    },

    /**
     * 初始化传入的option参数
     * @param  {Object} opts [option参数]
     */
    initOptions:function(opts) {
        if (!opts) {
            return;
        }
        Z.Util.setOptions(this,opts);
    },

    /**
     * 调用prepare时,layer已经注册到map上
     */
    _prepare:function(layer) {
        this._rootPrepare(layer);
    },

    _rootPrepare:function(layer) {
        //Geometry不允许被重复添加到多个图层上
        if (this.getLayer()) {
            throw new Error(this.exception['DUPLICATE_LAYER']);
        }
        //更新缓存
        this._updateCache();
        this.layer = layer;
        //如果投影发生改变,则清除掉所有的投影坐标属性
        this._clearProjection();
        this.painter = this._assignPainter();
    },

    /**
     * returns Geometry's ID
     * @return {Object} Geometry's id
     * @expose
     */
    getId:function() {
        return this.identifier;
    },

    /**
     * set ID
     * @param {Object} id set Geometry's id
     * @expose
     */
    setId:function(id) {
        var oldId = this.getId();
        this.identifier=id;
        this._fireEvent('_idchanged',{'target':this,'oldId':oldId,'newId':id});
        return this;
    },

    /**
     * 获取Geometry的Layer
     * @return {Layer} Geometry所属的Layer
     * @expose
     */
    getLayer:function() {
        if (!this.layer) {return null;}
        return this.layer;
    },

    /**
     * 获取Geometry所属的地图对象
     * @return {Map} 地图对象
     * @expose
     */
    getMap:function() {
        if (!this.layer) {return null;}
        return this.layer.getMap();
    },

    /**
     * 获取Geometry的类型
     * @return {int} Geometry的类型
     * @expose
     */
    getType:function() {
        return this.type;
    },


    /**
     * 获取Geometry的Symbol
     * @return {Symbol} Geometry的Symbol
     * @expose
     */
    getSymbol:function() {
        return this.options.symbol;
    },

    /**
     * 设置Geometry的symbol
     * @param {Symbol} symbol 新的Symbol
     * @expose
     */
    setSymbol:function(symbol) {
        if (!symbol) {
            this.options.symbol = null;
        } else {
            //属性的变量名转化为驼峰风格
            var camelSymbol = Z.Util.convertFieldNameStyle(symbol,'camel');
            this.options.symbol = camelSymbol;
        }
        this._onSymbolChanged();
        return this;
    },

    /**
     * 计算Geometry的外接矩形范围
     * @return {Extent} [Geometry的外接矩形范围]
     * @expose
     */
    getExtent:function() {
        if (this.extent) {
            return this.extent;
        }
        return this._computeExtent(this._getProjection());
    },

    /**
     * 返回Geometry的像素长宽, 像素长宽只在当前比例尺上有效, 比例尺变化后, 其值也会发生变化
     * @return {Size}     Size.width, Size.height
     * @expose
     */
    getSize: function() {
        var map = this.getMap();
        if (!map) {
            return null;
        }
        var projection = this._getProjection();
        var extent = this._computeVisualExtent(projection);
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
        return result;//{'width': result['width'], 'height': result['height']};
    },

    _getPrjExtent:function() {
        var ext = this.getExtent();
        var p = this._getProjection();
        if (ext) {
            return new Z.Extent(p.project({x:ext['xmin'],y:ext['ymin']}), p.project({x:ext['xmax'],y:ext['ymax']}));
        } else {
            return null;
        }
    },

    /**
     * 计算图形的中心点坐标
     * @return {Coordinate} [中心点坐标]
     * @expose
     */
    getCenter:function() {
        return this._computeCenter(this._getProjection());
    },

    getDefaultSymbol:function() {
        return this.defaultSymbol;
    },

    /**
     * 获取Geometry的Properties
     * @return {Object} 自定义属性
     * @expose
     */
    getProperties:function() {
        if (!this.properties) {return null;}
        return this.properties;
    },

    /**
     * 设置Geometry的Properties
     * @param {Object} properties 自定义属性
     * @expose
     */
    setProperties:function(properties) {
        this.properties = properties;
        return this;
    },

    /**
     * 显示Geometry
     * @expose
     */
    show:function() {
        this._visible = true;
        if (this.painter) {
            this.painter.show();
        }
        return this;
    },

    /**
     * 隐藏Geometry
     * @expose
     */
    hide:function() {
        this._visible = false;
        if (this.painter) {
            this.painter.hide();
        }
        return this;
    },

    /**
     * 是否可见
     * @return {Boolean} true|false
     * @expose
     */
    isVisible:function() {
        if (Z.Util.isNil(this._visible)) {
            return true;
        }
        return this._visible;
    },

    /**
     * 克隆一个不在任何图层上的属性相同的Geometry,但不包含事件注册
     * @return {Geometry} 克隆的Geometry
     * @expose
     */
    copy:function() {
        var json = this.toJson();
        var ret = Z.GeoJson.fromGeoJson(json);
        return ret;
    },


    /**
     * 将自身从图层中移除
     * @return {[type]} [description]
     * @expose
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

        var painter = this._getPainter();
        if (painter) {
            painter.remove();
        }
        delete this.painter;

        layer._onGeometryRemove(this);
        delete this.layer;

        this._fireEvent('remove',{'target':this});

    },

    _getInternalId:function() {
        return this.internalId;
    },

    /**
     * 只能被图层调用
     * @param {String} id [内部id]
     */
    _setInternalId:function(id) {
        this.internalId = id;
    },


    _getProjection:function() {
        var map = this.getMap();
        if (map) {
            return map._getProjection();
        }
        return Z.Projection.getDefault();
        // return null;
    },

    /**
     * 获取geometry样式中依赖的外部图片资源
     * @param  {[type]} geometry [description]
     * @return {[type]}          [description]
     */
    _getExternalResource:function() {
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

    _getPainter:function() {
        return this.painter;
    },

    _removePainter:function() {
        delete this.painter;
    },

    _onZoomEnd:function() {
        if (this.painter) {
            this.painter.refresh();
        }
    },

    _onShapeChanged:function() {
        var painter = this._getPainter();
        if (painter) {
            painter.refresh();
        }
        this.extent = null;
        if (!this.isEditing || !this.isEditing()) {
            this._fireEvent('shapechanged',{'target':this});
        }
    },

    _onPositionChanged:function() {
        var painter = this._getPainter();
        if (painter) {
            painter.refresh();
        }
        this.extent = null;
        if (!this.isEditing || !this.isEditing()) {
            this._fireEvent('positionchanged',{'target':this});
        }
    },

    _onSymbolChanged:function() {
        var painter = this._getPainter();
        if (painter) {
            painter.refreshSymbol();
        }
        this._fireEvent('symbolchanged',{'target':this});
    },

    _fireEvent:function(eventName, param) {
        if (!param) {
            param = {};
        }
        param['target'] = this;
        this.fire(eventName,param);
    },

    _exportGeoJson:function(opts) {
        var points = this.getCoordinates();
        var coordinates = Z.GeoJson.toGeoJsonCoordinates(points);
        return {
            'type':this.getType(),
            'coordinates': coordinates
        };
    },

    /**
     * 按照GeoJson规范生成GeoJson对象
     * @param  {[type]} opts 输出配置
     * @return {Object}      GeoJson对象
     * @expose
     */
    toJson:function(opts) {
        if (!opts) {
            opts = {};
        }
        var feature = {
            'type':'Feature',
            'geometry':null
        };
        if (opts['geometry'] === undefined || opts['geometry']) {
            var geoJson = this._exportGeoJson(opts);
            feature['geometry']=geoJson;
        }
        var id = this.getId();
        if (!Z.Util.isNil(id)) {
            feature['id'] = id;
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
Z.Geometry.include({
    /**
     *  开始编辑Geometry
     * @expose
     */
    startEdit: function(opts) {
        this.endEdit();
        this.editor = new Z.Editor(this,opts);
        this.editor.start();
    },


    /**
     * 结束编辑
     * @expose
     */
    endEdit: function() {
        if (this.editor) {
            this.editor.stop();
        }
    },

    /**
     * Geometry是否处于编辑状态中
     * @return {Boolean} 是否处于编辑状态
     * @expose
     */
    isEditing: function() {
        if (this.editor) {
            return this.editor.isEditing();
        }
        return false;
    },

    /**
     * 开始移动Geometry, 进入移动模式
     * @expose
     */
    startDrag: function() {
        this._map = this.getMap();
        this.hide();
        var symbol = Z.Util.convertFieldNameStyle(this.getSymbol(), 'minus');
        if(this instanceof Z.Marker) {
            this._dragGeometry = new Z.Marker(this.getCoordinates());
        } else { //线与面图形
            symbol['line-color'] = '#ff0000';
            if (this instanceof Z.Polyline) {
                this._dragGeometry = new Z.Polyline(this.getCoordinates());
            } else if (this instanceof Z.Polygon) {
                this._dragGeometry = new Z.Polygon(this.getCoordinates());
            }
        }
        this._dragGeometry.setProperties(this.getProperties());
        this._dragGeometry.setSymbol(symbol);
        var _dragLayer = this._getDragLayer();
        _dragLayer.addGeometry(this._dragGeometry);
        this._map.on('mousemove', this._dragging, this)
                 .on('mouseup', this._endDrag, this);
        this.fire('dragstart', {'target': this});
    },

    _dragging: function(event) {
        this.isDragging = true;
        this.endPosition = Z.DomUtil.getEventDomCoordinate(event, this._map._containerDOM);
        if(!this.startPosition) {
            this.startPosition = this.endPosition;
        }
        var dragOffset = new Z.Point(
                this.endPosition['left'] - this.startPosition['left'],
                this.endPosition['top'] - this.startPosition['top']
            );
        var geometryPixel = this._map.coordinateToScreenPoint(this._dragGeometry.getCenter());
        var mapOffset = this._map.offsetPlatform();
        var newPosition = new Z.Point(
                geometryPixel['left'] + dragOffset['left'] - mapOffset['left'],
                geometryPixel['top'] + dragOffset['top'] - mapOffset['top']
            );
        this.startPosition = newPosition;
        var pcenter = this._map._untransformFromOffset(newPosition);
        this._dragGeometry._setPCenter(pcenter);
        this._dragGeometry._updateCache();
        this._setPCenter(pcenter);
        this._updateCache();
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
     * @expose
     */
    isDragging: function() {
        if (this.isDragging) {
            return this.isDragging;
        }
        return false;
    },

    _getDragLayer: function() {
        var map = this.getMap();
        if(!map) {return;}
        var layerId = '__mt__internal_drag_layer';
        if(!map.getLayer(layerId)) {
            map.addLayer(new Z.VectorLayer(layerId));
        }
        return map.getLayer(layerId);
    }

});
Z.Geometry.include({
    /**
     * 设置Geometry的信息提示框设置
     * @param {Object} tipOption 信息提示框设置
     * @expose
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
     * @expose
     */
    getInfoWindow:function() {
        if (!this.infoWindow) {return null;}
        return this.infoWindow;
    },

    /**
     * 打开geometry的信息提示框
     * @param  {Coordinate} coordinate 提示框位置,可以为空
     * @expose
     */
    openInfoWindow:function(coordinate) {
        this.infoWindow.show(coordinate);
    },

    /**
     * 关闭Geometry的信息提示框
     * @expose
     */
    closeInfoWindow:function() {
        if (this.infoWindow) {
            this.infoWindow.hide();
        }
    }

});
Z.Geometry.include({
    /**
    * 设置Geometry的菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @expose
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
    * @expose
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
    * @expose
    */
    setMenuItem: function(items) {
        this.menu.setItems(items);
        return this;
    },

    /**
    * 关闭geometry菜单
    * @expose
    */
    closeMenu: function() {
        if(this.menu) {
            this.menu.close();
        }
    }
});

Z.Geometry.include({

    _onEvent: function(event) {
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
        var params = this._getEventParams(originalEvent);
        this._fireEvent(eventFired, params);
    },

    /**
     * 生成事件参数
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    _getEventParams: function(event) {
        var map = this.getMap();
        var pixel = Z.DomUtil.getEventDomCoordinate(event, map.containterDom);
        var coordinate = map._untransform(pixel);
        //统一的参数, target是geometry引用, pixel是事件的屏幕坐标, coordinate是事件的经纬度坐标
        return {'target':this, 'pixel':pixel, 'coordinate':coordinate};
    },

    _onMouseOver: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event.originalEvent || event;
        var params = this._getEventParams(originalEvent);
        this._fireEvent('mouseover', params);
    },

    _onMouseOut: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event.originalEvent || event;
        var params = this._getEventParams(originalEvent);
        this._fireEvent('mouseout', params);
    }
});
Z.Geometry.include({
	/*
    * 添加面板
    * @param {Object} options/Z.Panel
    * @expose
    */
    addPanel: function (options) {
        if(this.getMap()) {
            this._addPanel(options);
        } else {
            this.on('afterAdd', function() {
                this._addPanel(options);
            });
        }
    },

    _addPanel: function(options) {
        if(options instanceof Z.Panel) {
            panel = options;
            panel.options['target'] = this;
            panel.addTo(this.getMap());
        } else {
            options['target'] = this;
            var panel = new Z.Panel(options);
            panel.addTo(this.getMap());
        }
        return this;
    },

    /*
    * 删除面板
    * @param {Object} id or Z.Panel
    * @expose
    */
    removePanel: function (obj) {
        panel = this._getPanel(obj);
        panel.removeLable();
        return this;
    },

    /*
    * 删除面板
    * @param {Object} id or Z.Panel
    * @expose
    */
    hidePanel: function(obj) {
        panel = this._getPanel(obj);
        panel.hide();
        return this;
    },

    /*
    * 删除面板
    * @param {Object} id or Z.Panel
    * @expose
    */
    showPanel: function(obj) {
        panel = this._getPanel(obj);
        panel.show();
        return this;
    },

    /*
    * 获取面板
    * @param {String} id
    * @expose
    */
    getPanel: function(id) {
        return Z.Panel.getPanel(id);
    },

    _getPanel: function(obj) {
        if(!obj) return;
        if(obj instanceof Z.Panel) {
            return obj;
        } else {
            return Z.Panel.getPanel(obj);
        }
    }

});
Z.Geometry.include({
	/*
    * 添加label
    * @param {Object} options/Z.Label
    * @expose
    */
    addLabel: function (options) {
        if(this.getMap()) {
            this._addLabel(options);
        } else {
            this.on('afterAdd', function() {
                this._addLabel(options);
            });
        }
    },

    _addLabel: function(options) {
        if(options instanceof Z.Label) {
            label = options;
            label.addTo(this);
        } else {
            var label = new Z.Label(options);
            label.addTo(this);
        }
        return this;
    },

    /*
    * 删除label
    * @param {Object} id or Z.Label
    * @expose
    */
    removeLabel: function (obj) {
        label = this._getLabel(obj);
        label.removeLabel();
        return this;
    },

    /*
    * 删除label
    * @param {Object} id or Z.Label
    * @expose
    */
    hideLabel: function(obj) {
        label = this._getLabel(obj);
        label.hide();
        return this;
    },

    /*
    * 删除label
    * @param {Object} id or Z.Label
    * @expose
    */
    showLabel: function(obj) {
        label = this._getLabel(obj);
        label.show();
        return this;
    },

    /*
    * 获取label
    * @param {String} id
    * @expose
    */
    getLabel: function(id) {
        return Z.Label['getLabel'](id);
    },

    _getLabel: function(obj) {
        if(!obj) return;
        if(obj instanceof Z.Label) {
            return obj;
        } else {
            return Z.Label['getLabel'](obj);
        }
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
            var x, y;

            if (coordinate instanceof Z.Coordinate) {
                x = coordinate.x;
                y = coordinate.y;
            } else if (coordinate instanceof Z.Point) {
                x = coordinate.left;
                y = coordinate.top;
            } else {
                x = coordinate.left;
                y = coordinate.top;
            }
            return (x >= extent.xmin) &&
                (x <= extent.xmax) &&
                (y >= extent.ymin) &&
                (y <= extent.ymax);
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
        if (Z.Util.isNumber(p1) &&
            Z.Util.isNumber(p2) &&
            Z.Util.isNumber(p3) &&
            Z.Util.isNumber(p4)) {
            this['xmin'] = p1;
            this['ymin'] = p2;
            this['xmax'] = p3;
            this['ymax'] = p4;
            return;
        } else {
            //构造方法二: 参数是两个坐标
            if (p1 && p2 &&
                !Z.Util.isNil(p1.x) &&
                !Z.Util.isNil(p2.x) &&
                !Z.Util.isNil(p1.y) &&
                !Z.Util.isNil(p2.y)) {
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
        return Z.Util.isNumber(this['xmin']) &&
                Z.Util.isNumber(this['ymin']) &&
                Z.Util.isNumber(this['xmax']) &&
                Z.Util.isNumber(this['ymax']);
    }
});

Z.Vector = Z.Geometry.extend({
    options:{
        'symbol':{
            'stroke' : '#ff0000',
            'strokeWidth' : 3,
            'strokeOpacity' : 1,
            'strokeDasharray': '-',
            'fill' : '#ffffff',
            'fillOpacity' : 1
        }
    },

    _hitTestTolerance: function() {
        var w = this.options.symbol.strokeWidth || this.options.symbol.lineWidth;
        return w ? w / 2 : 0;
    },

    _computeVisualExtent:function(projection) {
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
        }       */
        var extent = this._getPrjExtent();
        var map = this.getMap();
        var res = map._getTileConfig().getResolution(map.getZoomLevel());
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
    _getCenterDomOffset:function() {
        var pcenter = this._getPCenter();
        if (!pcenter) {return null;}
        var map=this.getMap();
        if (!map) {
            return null;
        }
        return map._transformToOffset(pcenter);
    },

    /**
     * 返回Geometry的坐标
     * @return {Coordinate} 图形坐标
     * @expose
     */
    getCoordinates:function() {
        return this._coordinates;
    },

    /**
     * 设置新的坐标
     * @param {Coordinate} coordinates 新的坐标
     */
    setCoordinates:function(coordinates) {
        var center = new Z.Coordinate(coordinates);
        this._coordinates = center;
        if (!this._coordinates || !this.getMap()) {return;}
        var projection = this._getProjection();
        this._setPCenter(projection.project(this._coordinates));
        return this;
    },

    /**
     * 获取Marker的center
     * @return {Coordinate} Marker的center
     * @expose
     */
    getCenter:function() {
        return this._coordinates;
    },


    _getPCenter:function() {
        var projection = this._getProjection();
        if (!projection) {return null;}
        if (!this._pcenter) {
            if (this._coordinates) {
                this._pcenter = projection.project(this._coordinates);
            }
        }
        return this._pcenter;
    },

    /**
     * 设置投影坐标
     * @param {Coordinate} pcenter 投影坐标
     */
    _setPCenter:function(pcenter) {
        this._pcenter=pcenter;
        this._onPositionChanged();
    },

    /**
     * 修改投影坐标后调用该方法更新经纬度坐标缓存.
     * @return {[type]} [description]
     */
    _updateCache:function() {
        var projection = this._getProjection();
        if (this._pcenter && projection) {
            this._coordinates = projection.unproject(this._pcenter);
        }
    },

    _clearProjection:function() {
        this._pcenter = null;
    },

    _computeCenter:function(projection) {
        return this._coordinates;
    }
};
Z.Geometry.Poly={
    /**
     * 将points中的坐标转化为用于显示的容器坐标
     * @param  {[type]} points [description]
     * @return {[type]}        [description]
     */
    _transformToOffset:function(points) {
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
                    p_r.push(map._transformToOffset(p[j]));
                }
                var simplifiedPoints = Z.Simplify.simplify(p_r, 2, false);
                result.push(simplifiedPoints);
            } else {
                var pp = map._transformToOffset(p);
                result.push(pp);
            }
        }
        if (!is2D) {
            var simpliedResult = Z.Simplify.simplify(result, 2, false);
            return simpliedResult;
        }
        return result;
    },

    _setPrjPoints:function(prjPoints) {
        this.prjPoints = prjPoints;
        this._onShapeChanged();
    },

    _getPrjPoints:function() {
        if (!this.prjPoints) {
            var points = this.points;
            this.prjPoints = this._projectPoints(points);
        }
        return this.prjPoints;
    },

    /**
     * 直接修改Geometry的投影坐标后调用该方法, 更新经纬度坐标缓存
     */
    _updateCache:function() {
        var projection = this._getProjection();
        if (!projection) {
            return;
        }
        this.points = this._unprojectPoints(this._getPrjPoints());
        if (this.holes) {
            this.holes = this._unprojectPoints(this._getPrjHoles());
        }
    },

    _clearProjection:function() {
        this.prjPoints = null;
        if (this.prjHoles) {
            this.prjHoles = null;
        }
    },

    _projectPoints:function(points) {
        var projection = this._getProjection();
        if (projection) {
            return projection.projectPoints(points);
        }
        return null;
    },

    _unprojectPoints:function(prjPoints) {
        var projection = this._getProjection();
        if (projection) {
            return projection.unprojectPoints(prjPoints);
        }
        return null;
    },

    _computeCenter:function(projection) {
        var ring=this.points;
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
        return new Z.Coordinate(sumx/counter, sumy/counter);
    },

    _computeExtent:function(projection) {
        var ring = this.points;
        if (!Z.Util.isArrayHasData(ring)) {
            return null;
        }
        var rings = ring;
        if (this.hasHoles && this.hasHoles()) {
            rings = rings.concat(this.getHoles());
        }
        return this._computePointsExtent(rings,projection);
    },

    /**
     * 计算坐标数组的extent, 数组内的元素可以坐标或者坐标数组,坐标为经纬度坐标,而不是投影坐标
     * @param  {[type]} points     [description]
     * @param  {[type]} projection [description]
     * @return {[type]}            [description]
     */
    _computePointsExtent:function(points, projection) {
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

    type: Z.Geometry['TYPE_POINT'],

    options:{
        'symbol':{
            markerFile : Z.host + '/engine/images/marker.png',
            markerHeight : 30,
            markerWidth : 22,
            dx : 0,
            dy : 0
        }
    },

    initialize:function(coordinates,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.initOptions(opts);
    },

    getDefaultSymbol:function() {
        return {
            'icon': this.defaultIcon
        };
    },

    /**
     * 设置Marker的Icon
     * @param {Icon} icon 新的Icon
     * @expose
     */
    _setIcon: function(icon) {
        return this.setSymbol(icon);
    },

    setText: function(text) {
        this._setIcon(text);
    },

    _containsPoint: function(point) {
        var symbol = this.getSymbol();
        var markerSize = this._getMarkerSize(symbol);
        var width = markerSize.width,
            height = markerSize.height,
            x = symbol.dx,
            y = symbol.dy,
            center = this._getCenterDomOffset();
        var pxMin = new Z.Point(center.left - width/2 + x, center.top - height - y),
            pxMax = new Z.Point(center.left + width/2 + x, center.top - y);

        if (symbol['markerType']) {
            pxMin = new Z.Point(center.left - width/2 + x, center.top - height/2 - y);
            pxMax = new Z.Point(center.left + width/2 + x, center.top + height/2 - y);
        } else if (symbol['shieldType']) {
            var vertical = Z.Util.setDefaultValue(symbol['shieldVerticalAlignment'], 'middle'),
                horizontal = Z.Util.setDefaultValue(symbol['shieldHorizontalAlignment'], 'middle');
            var px = this._getExtent(center, vertical, horizontal, width, height, x, y);
            pxMin = px['min'];
            pxMax = px['max'];
        } else if (symbol['textName']) {
            var vertical = Z.Util.setDefaultValue(symbol['textVerticalAlignment'], 'middle'),
                horizontal = Z.Util.setDefaultValue(symbol['textHorizontalAlignment'], 'middle');
            var px = this._getExtent(center, vertical, horizontal, width, height, x, y);
            pxMin = px['min'];
            pxMax = px['max'];
        }
        var pxExtent = new Z.Extent(pxMin.left, pxMin.top, pxMax.left, pxMax.top);
        return Z.Extent.contains(pxExtent, point);
    },

    _getMarkerSize: function(symbol) {
        var width=0,height=0;
        var fontSize=0,lineSpacing=0,content='';
        if (symbol['markerType']) {
            width = Z.Util.setDefaultValue(symbol['markerWidth'], 0);
            height = Z.Util.setDefaultValue(symbol['markerHeight'], 0);
            if(width > height) {
                height = width;
            } else {
                width = height;
            }
        } else if (symbol['shieldType']) {
            width = Z.Util.setDefaultValue(symbol['shieldWrapWidth'], 0);
            height = Z.Util.setDefaultValue(symbol['shieldSize'], 0) +
                     Z.Util.setDefaultValue(symbol['shieldLineSpacing'], 0);
            fontSize = Z.Util.setDefaultValue(symbol['shieldSize'], 12);
            lineSpacing = Z.Util.setDefaultValue(symbol['shieldLineSpacing'], 12);
            shieldName = Z.Util.setDefaultValue(symbol['shieldName'], '');

        } else if (symbol['textName']) {
                fontSize = Z.Util.setDefaultValue(symbol['textSize'], 12);
                lineSpacing = Z.Util.setDefaultValue(symbol['textLineSpacing'], 12);
                textName = Z.Util.setDefaultValue(symbol['textName'], '');
                var textWidth = Z.Util.setDefaultValue(symbol['textWrapWidth'], 0);
                width = (width>textWidth)?width:textWidth;
                var textHeight = fontSize;
                height = (height>textHeight)?height:textHeight;
        }
        return this._getRealSize(height, width, content, fontSize, lineSpacing);
    },

    _getRealSize: function(height, width, content, fontSize, lineSpacing) {
        if (content&&content.length>0) {
            var fontSize = icon['size'];
            var size = fontSize/2;
            var textWidth = Z.Util.getLength(content)*size;
            var rowNum = 0;
            if(textWidth>width){
                rowNum = Math.ceil(textWidth/width);
            }
            height += rowNum*((fontSize+lineSpacing)/2);
            width += fontSize;
        }
        return {'width': width, 'height': height};
    },

    _getExtent: function(center, vertical, horizontal, width, height, x, y) {
        var left = center.left;
        var top = center.top;
        var min, max;
        if ('left' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left-width+x), 'top': (top-height-y)};
                max = {'left': (left+x), 'top': (top-y)};
            } else if ('middle' === vertical) {
                min = {'left': (left-width+x), 'top': (top-height/2-y)};
                max = {'left': (left+x), 'top': (top+height/2-y)};
            } else if ('bottom' === vertical) {
                min = {'left': (left-width+x), 'top': (top-y)};
                max = {'left': (left+x), 'top': (top+height-y)};
            }
        } else if ('middle' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left-width/2+x), 'top': (top-height-y)};
                max = {'left': (left+width/2+x), 'top': (top-y)};
            } else if ('middle' === vertical) {
                min = {'left': (left-width/2+x), 'top': (top-height/2-y)};
                max = {'left': (left+width/2+x), 'top': (top+height/2-y)};
            } else if ('bottom' === vertical) {
                min = {'left': (left-width/2+x), 'top': (top-y)};
                max = {'left': (left+width/2+x), 'top': (top+height-y)};
            }
        } else if ('right' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left+x), 'top': (top-height-y)};
                max = {'left': (left+width+x),  'top': (top-y)};
            } else if ('middle' === vertical) {
                min = {'left': (left+x), 'top': (top-height/2-y)};
                max = {'left': (left+width+x), 'top': (top+height/2-y)};
            } else if ('bottom' === vertical) {
                min = {'left': (left+x), 'top': (top-y)};
                max = {'left': (left+width+x), 'top': (top+height-y)};
            }
        }
        return {'min': min, 'max': max};
    },

    _computeExtent:function(projection) {
        var coordinates = this.getCenter();
        if (!coordinates) {return null;}
        return new Z.Extent({'x':coordinates.x,'y':coordinates.y},{'x':coordinates.x,'y':coordinates.y});
    },

    _computeVisualExtent:function(projection) {
        var geo = this;
        var map = geo.getMap();
        if (!map) {
            return null;
        }
        if(!projection) {
            projection = map._getProjection();
        }
        var icon=geo.getSymbol();

        var coordinates=geo.getCenter();
        var offset = icon['offset'];
        if (!offset) {
            offset = {
                'x':0,
                'y':0
            };
        }
        if (!coordinates) {return null;}
        var pnw,pse;
        var width, height;
        var iconType = icon['type'];
        height = (icon['height']?parseInt(icon['height'],10):0);
        width = (icon['width']?parseInt(icon['width'],10):0);
        pnw = new Z.Point((width/2-offset['x']), (height+offset['y']));
        pse = new Z.Point((width/2+offset['x']), (-offset['y']));

        var pcenter = projection.project(coordinates);
        return map._computeExtentByPixelSize(pcenter, pnw, pse);
    },

    _computeGeodesicLength:function(projection) {
        return 0;
    },

    _computeGeodesicArea:function(projection) {
        return 0;
    },

    _assignPainter:function() {
        if (!this.layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Marker.Canvas(this);
        } else {
            return new Z.Marker.SVG(this);
        }
        return null;
    }
});

Z['Polygon']=Z.Polygon = Z.Vector.extend({
    includes:[Z.Geometry.Poly],

    type:Z.Geometry['TYPE_POLYGON'],

    /**
     * [多边形构造函数]
     * @param  {坐标数组} coordinates [description]
     * @param  {[type]} opts [description]
     * @return {[type]}      [description]
     */
    initialize:function(coordinates, opts) {
        this.setCoordinates(coordinates);
        this.initOptions(opts);
    },

    /**
     * 设置新的coordinates
     * @param {[坐标数组]} coordinates [description]
     */
    setCoordinates:function(coordinates) {
        var rings = Z.GeoJson.fromGeoJsonCoordinates(coordinates);
        var len = rings.length;
        this.points = rings[0];
        this._checkRing(this.points);
        if (len > 1) {
            var holes = [];
            for (var i=1; i<len;i++) {
                if (!rings[i]) {
                    continue;
                }
                this._checkRing(rings[i]);
                holes.push(rings[i]);
            }
            this.holes = holes;
        }
        this._projectRings();
    },

    /**
     * 返回多边形的坐标数组
     * @return {[Coordinate]} 坐标数组
     */
    getCoordinates:function() {
        if (this.holes) {
            return [this.points].concat(this.holes);
        }
        return [this.points];
    },

    _projectRings:function() {
        if (!this.getMap()) {
            return;
        }
        this.prjPoints = this._projectPoints(this.points);
        this.prjHoles = this._projectPoints(this.holes);
    },

    /**
     * 保证Ring都是闭合的
     */
    _checkRing:function(ring) {
        if (!Z.Util.isArray(ring) || ring.length < 3) {
            return;
        }
        var lastPoint = ring[ring.length-1];
        if (!lastPoint) {
            lastPoint = ring[ring.length-2];
        }
        if (ring[0].x != lastPoint.x || ring[0].y != lastPoint.y ) {
            ring.push({x:ring[0].x,y:ring[0].y});
        }
    },

    /**
     * 获取多边形的外环
     * @return {Array} 多边形坐标数组
     * @expose
     */
    getShell:function() {
       return this.points;
    },


    /**
     * 获取Polygon的空洞的坐标
     * @return {Array} 空洞的坐标二维数组
     * @expose
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
     * @expose
     */
    hasHoles:function() {
        if (Z.Util.isArrayHasData(this.holes)) {
            if (Z.Util.isArrayHasData(this.holes[0])) {
                return true;
            }
        }
        return false;
    },


    _getPrjHoles:function() {
        if (!this.prjHoles) {
            this.prjHoles = this._projectPoints(this.holes);
        }
        return this.prjHoles;
    },

    _computeGeodesicLength:function(projection) {
        return 0;
    },

    _computeGeodesicArea:function(projection) {
        return 0;
    },

    _containsPoint: function(point) {
        var map = this.getMap(),
            t = this._hitTestTolerance(),
            extent = this.getExtent(),
            nw = new Z.Coordinate(extent.xmin, extent.ymax),
            se = new Z.Coordinate(extent.xmax, extent.ymin),
            pxMin = map.coordinateToScreenPoint(nw),
            pxMax = map.coordinateToScreenPoint(se),
            pxExtent = new Z.Extent(pxMin.left - t, pxMin.top - t,
                                    pxMax.left + t, pxMax.top + t);

        point = new Z.Point(point.left, point.top);

        if (!Z.Extent.contains(pxExtent, point)) { return false; }

        // screen points
        var points = this._transformToOffset(this._getPrjPoints());

        var c = Z.GeoUtils.pointInsidePolygon(point, points);
        if (c) {
            return c;
        }

        var i, j, p1, p2,
            len = points.length;

        for (i = 0, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];

            if (Z.GeoUtils.distanceToSegment(point, p1, p2) <= t) {
                return true;
            }
        }

        return false;
    },

    _assignPainter:function() {
        if (!this.layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Polygon.Canvas(this);
        } else {
            return new Z.Polygon.SVG(this);
        }
        return null;
    }
});

Z['Polyline']=Z.Polyline = Z.Vector.extend({
    includes:[Z.Geometry.Poly],

    type:Z.Geometry['TYPE_LINESTRING'],

    initialize:function(coordinates, opts) {

        this.setCoordinates(coordinates);
        this.initOptions(opts);
    },

    /**
     * 设置多折线的坐标值
     * @param {Array} coordinates 坐标数组
     * @expose
     */
    setCoordinates:function(coordinates) {
        this.points = Z.GeoJson.fromGeoJsonCoordinates(coordinates);
        if (this.getMap()) {
            this._setPrjPoints(this._projectPoints(this.points));
        }
        return this;
    },

    /**
     * 获取多折线坐标值
     * @return {Array} 多边形坐标数组
     * @expose
     */
    getCoordinates:function() {
        return this.points;
    },

    _containsPoint: function(point) {
        var map = this.getMap(),
            t = this._hitTestTolerance(),
            extent = this.getExtent(),
            nw = new Z.Coordinate(extent.xmin, extent.ymax),
            se = new Z.Coordinate(extent.xmax, extent.ymin),
            pxMin = map.coordinateToScreenPoint(nw),
            pxMax = map.coordinateToScreenPoint(se),
            pxExtent = new Z.Extent(pxMin.left - t, pxMin.top - t,
                                    pxMax.left + t, pxMax.top + t);

        point = new Z.Point(point.left, point.top);

        if (!Z.Extent.contains(pxExtent, point)) { return false; }

        // screen points
        var points = this._transformToOffset(this._getPrjPoints());

        var i, p1, p2,
            len = points.length;

        for (i = 0, len = points.length; i < len - 1; i++) {
            p1 = points[i];
            p2 = points[i + 1];

            if (Z.GeoUtils.distanceToSegment(point, p1, p2) <= t) {
                return true;
            }
        }

        return false;
    },

    _assignPainter:function() {
        if (!this.layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Polyline.Canvas(this);
        } else {
            return new Z.Polyline.SVG(this);
        }
        return null;
    }

});

Z['Ellipse']=Z.Ellipse = Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    options:{
        'numberOfPoints':60
    },

    type:Z.Geometry['TYPE_ELLIPSE'],

    initialize:function(coordinates,width,height,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.width = width;
        this.height = height;
        this.initOptions(opts);
    },

    /**
     * 返回椭圆的宽度
     * @return {Number} [椭圆宽度]
     * @expose
     */
    getWidth:function() {
        return this.width;
    },

    /**
     * 设置椭圆宽度
     * @param {Number} width [新的半径]
     * @expose
     */
    setWidth:function(width) {
        this.width = width;
        this._onShapeChanged();
        return this;
    },

    /**
     * 返回椭圆的高度
     * @return {Number} [椭圆高度]
     * @expose
     */
    getHeight:function() {
        return this.height;
    },

    /**
     * 设置椭圆高度
     * @param {Number} height [椭圆高度]
     * @expose
     */
    setHeight:function(height) {
        this.height = height;
        this._onShapeChanged();
        return this;
    },

    /**
     * 覆盖Polygon的getShell方法, 将椭圆形转化为多边形的外环坐标数组
     * @return {[Coordinate]} 外环坐标数组
     * @expose
     */
    getShell:function() {
        //var proj = this._getProjection();
        //TODO

    },

    /**
     * 覆盖Polygon的getHoles方法
     * @return {[Coordinate]} 空洞坐标
     * @expose
     */
    getHoles:function() {
        return null;
    },

    _containsPoint: function(point) {
        var map = this.getMap(),
            t = this._hitTestTolerance(),
            pa = map.distanceToPixel(this.width / 2, 0),
            pb = map.distanceToPixel(0, this.height /2),
            a = pa.width,
            b = pb.height,
            c = Math.sqrt(Math.abs(a * a - b * b)),
            xfocus = a >= b;
        var center = this._getCenterDomOffset();
        var f1, f2, d;
        if (xfocus) {
            f1 = new Z.Point(center.left - c, center.top);
            f2 = new Z.Point(center.left + c, center.top);
            d = a * 2;
        } else {
            f1 = new Z.Point(center.left, center.top - c);
            f2 = new Z.Point(center.left, center.top + c);
            d = b * 2;
        }
        point = new Z.Point(point.left, point.top);

        /*
         L1 + L2 = D
         L1 + t >= L1'
         L2 + t >= L2'
         D + 2t >= L1' + L2'
         */
        return point.distanceTo(f1) + point.distanceTo(f2) <= d + 2 * t;
    },

    _computeExtent:function(projection) {
        if (!projection || !this._coordinates || Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return null;
        }
        var width = this.getWidth(),
            height = this.getHeight();
        var p1 = projection.locate(this._coordinates,width/2,height/2);
        var p2 = projection.locate(this._coordinates,-width/2,-height/2);
        return new Z.Extent(p1,p2);
    },

    _computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        //L=2πb+4(a-b)
        //近似值
        var longer = (this.width > this.height?this.width:this.height);
        return 2*Math.PI*longer/2-4*Math.abs(this.width-this.height);
    },

    _computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return Math.PI*this.width*this.height/4;
    },


    _assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return null;}
        if (layer.isCanvasRender()) {
            return new Z.Ellipse.Canvas(this);
        } else {
            return new Z.Ellipse.SVG(this);
        }
        return null;
    },

    _exportGeoJson:function(opts) {
        var center = this.getCenter();
        return {
            'type':'Ellipse',
            'coordinates':[center.x, center.y],
            'width':this.getWidth(),
            'height':this.getHeight()
        };
    }

});

Z['Circle']=Z.Circle=Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    options:{
        'numberOfPoints':60
    },

    type:Z.Geometry['TYPE_CIRCLE'],

    initialize:function(coordinates,radius,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.radius = radius;
        this.initOptions(opts);
        /*this.numberOfPoints = this.options['defaultNumberOfPoints'];
        if (opts && opts['numberOfPoints']) {
            this.numberOfPoints = opts['numberOfPoints'];
        }*/
    },

    /**
     * 返回圆形的半径
     * @return {Number} [圆形半径]
     * @expose
     */
    getRadius:function() {
        return this.radius;
    },

    /**
     * 设置圆形半径
     * @param {Number} radius [新的半径]
     * @expose
     */
    setRadius:function(radius) {
        this.radius = radius;
        this._onShapeChanged();
        return this;
    },

    /**
     * 覆盖Polygon的getShell方法, 将圆形转化为多边形的外环坐标数组
     * @return {[Coordinate]} 外环坐标数组
     * @expose
     */
    getShell:function() {
        //var proj = this._getProjection();
        //TODO

    },

    /**
     * 覆盖Polygon的getHoles方法
     * @return {[Coordinate]} 空洞坐标
     * @expose
     */
    getHoles:function() {
        return null;
    },

    _containsPoint: function(point) {
        var center = this._getCenterDomOffset(),
            size = this.getSize(),
            t = this._hitTestTolerance(),
            pc = new Z.Point(center.left, center.top),
            pp = new Z.Point(point.left, point.top);

        return pp.distanceTo(pc) <= size.width / 2 + t;
    },

    _computeExtent:function(projection) {
        if (!projection || !this._coordinates || Z.Util.isNil(this.radius)) {
            return null;
        }

        var radius = this.radius;
        var p1 = projection.locate(this._coordinates,radius,radius);
        var p2 = projection.locate(this._coordinates,-radius,-radius);
        return new Z.Extent(p1,p2);
    },

    _computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*2*this.radius;
    },

    _computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*Math.pow(this.radius,2);
    },

    _assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return null;}
        if (layer.isCanvasRender()) {
            return new Z.Circle.Canvas(this);
        } else {
            return new Z.Circle.SVG(this);
        }
        return null;
    },

    _exportGeoJson:function(opts) {
        var center = this.getCenter();
        return {
            'type':'Circle',
            'coordinates':[center.x, center.y],
            'radius':this.getRadius()
        };
    }

});

Z['Sector']=Z.Sector=Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    options:{
        'numberOfPoints':60
    },

    type:Z.Geometry['TYPE_SECTOR'],

    initialize:function(coordinates,radius,startAngle,endAngle,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.initOptions(opts);
    },

    /**
     * 返回圆形的半径
     * @return {Number} [圆形半径]
     * @expose
     */
    getRadius:function() {
        return this.radius;
    },

    /**
     * 设置圆形半径
     * @param {Number} radius [新的半径]
     * @expose
     */
    setRadius:function(radius) {
        this.radius = radius;
        this._onShapeChanged();
        return this;
    },

    /**
     * 返回扇形的开始角
     * @return {Number} 开始角
     * @expose
     */
    getStartAngle:function() {
        return this.startAngle;
    },

    /**
     * 设定扇形的开始角
     * @param {Number} startAngle 扇形开始角
     * @expose
     */
    setStartAngle:function(startAngle) {
        this.startAngle = startAngle;
        this._onShapeChanged();
        return this;
    },

    /**
     * 返回扇形的结束角
     * @return {Number} 结束角
     * @expose
     */
    getEndAngle:function() {
        return this.endAngle;
    },

    /**
     * 设定扇形的结束角
     * @param {Number} endAngle 扇形结束角
     * @expose
     */
    setEndAngle:function(endAngle) {
        this.endAngle = endAngle;
        this._onShapeChanged();
        return this;
    },

    /**
     * 将扇形转化为Polygon的外环坐标数组
     * @return {[Coordinate]} 转换后的坐标数组
     * @expose
     */
    getShell:function() {
        //var proj = this._getProjection();
        //TODO

    },

    /**
     * 返回空洞
     * @return {[type]} [description]
     * @expose
     */
    getHoles:function() {
        return null;
    },

    _containsPoint: function(point) {
        var center = this._getCenterDomOffset(),
            t = this._hitTestTolerance(),
            size = this.getSize(),
            pc = new Z.Point(center.left, center.top),
            pp = new Z.Point(point.left, point.top),
            x = pp.left - pc.left,
            y = pc.top - pp.top,
            atan2 = Math.atan2(y, x),
            // [0.0, 360.0)
            angle = atan2 < 0 ? (atan2 + 2 * Math.PI) * 360 / (2 * Math.PI) :
                atan2 * 360 / (2 * Math.PI);
        var sAngle = this.startAngle % 360,
            eAngle = this.endAngle % 360;
        var between = false;
        if (sAngle > eAngle) {
            between = !(angle > eAngle && angle < sAngle);
        } else {
            between = (angle >= sAngle && angle <= eAngle);
        }

        // TODO: tolerance
        return pp.distanceTo(pc) <= size.width / 2 && between;
    },

    _computeExtent:function(projection) {
        if (!projection || !this._coordinates || Z.Util.isNil(this.radius)) {
            return null;
        }

        var radius = this.radius;
        var p1 = projection.locate(this._coordinates,radius,radius);
        var p2 = projection.locate(this._coordinates,-radius,-radius);
        return new Z.Extent(p1,p2);
    },

    _computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*2*this.radius*Math.abs(this.startAngle-this.endAngle)/360+2*this.radius;
    },

    _computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*Math.pow(this.radius,2)*Math.abs(this.startAngle-this.endAngle)/360;
    },

    _assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Sector.Canvas(this);
        } else {
            return new Z.Sector.SVG(this);
        }
        return null;
    },

    _exportGeoJson:function(opts) {
        var center  = this.getCenter();
        return {
            'type':         "Sector",
            'coordinates':  [center.x,center.y],
            'radius':       this.getRadius(),
            'startAngle':   this.getStartAngle(),
            'endAngle':     this.getEndAngle()
        };
    }
});

Z['Rectangle'] = Z.Rectangle = Z.Polygon.extend({

    type:Z.Geometry['TYPE_RECT'],

    initialize:function(coordinates,width,height,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.width = width;
        this.height = height;
        this.initOptions(opts);
    },


    /**
     * 返回矩形左上角坐标
     * @return {Coordinate} [左上角坐标]
     * @expose
     */
    getCoordinates:function() {
        return this._coordinates;
    },

    /**
     * 设置新的矩形左上角坐标
     * @param {Coordinate} center 新的center
     * @expose
     */
    setCoordinates:function(nw){
        this._coordinates = new Z.Coordinate(nw);

        if (!this._coordinates || !this.getMap()) {
            return this;
        }
        var projection = this._getProjection();
        this._setPNw(projection.project(this._coordinates));
        return this;
    },

    _getPNw:function() {
        var projection = this._getProjection();
        if (!projection) {return null;}
        if (!this.pnw) {
            if (this._coordinates) {
                this.pnw = projection.project(this._coordinates);
            }
        }
        return this.pnw;
    },

    /**
     * 设置投影坐标
     * @param {Coordinate} pnw 投影坐标
     */
    _setPNw:function(pnw) {
        this.pnw=pnw;
        this._onPositionChanged();
    },

    /**
     * 返回矩形的宽度
     * @return {Number} [矩形宽度]
     * @expose
     */
    getWidth:function() {
        return this.width;
    },

    /**
     * 设置矩形宽度
     * @param {Number} width [新的半径]
     * @expose
     */
    setWidth:function(width) {
        this.width = width;
        this._onShapeChanged();
        return this;
    },

    /**
     * 返回矩形的高度
     * @return {Number} [矩形高度]
     * @expose
     */
    getHeight:function() {
        return this.height;
    },

    /**
     * 设置矩形高度
     * @param {Number} height [矩形高度]
     * @expose
     */
    setHeight:function(height) {
        this.height = height;
        this._onShapeChanged();
        return this;
    },

    /**
     * 修改投影坐标后调用该方法更新经纬度坐标缓存.
     * @return {[type]} [description]
     */
    _updateCache:function() {
        var projection = this._getProjection();
        if (this.pnw && projection) {
            this._coordinates = projection.unproject(this.pnw);
        }
    },

    _clearProjection:function() {
        this.pnw = null;
    },

    /**
     * 计算中心店
     * @param  {[type]} projection [description]
     * @return {[type]}            [description]
     */
    _computeCenter:function(projection) {

        return projection.locate(this._coordinates,this.width/2,-this.height/2);
    },

    /**
     * 覆盖Polygon的getShell方法, 将矩形转化为多边形的外环坐标数组
     * @return {[Coordinate]} 外环坐标数组
     * @expose
     */
    getShell:function() {
        var projection = this._getProjection();
        var nw =this._coordinates;
        var points = [];
        points.push(nw);
        points.push(projection.locate(nw,this.width,0));
        points.push(projection.locate(nw,this.width,this.height));
        points.push(projection.locate(nw,0,this.height));
        points.push(nw);
        return points;

    },

    /**
     * 覆盖Polygon的getHoles方法
     * @return {[Coordinate]} 空洞坐标
     * @expose
     */
    getHoles:function() {
        return null;
    },


    _containsPoint: function(point) {
        var map = this.getMap(),
            t = this._hitTestTolerance(),
            sp = map.coordinateToScreenPoint(this._coordinates),
            pxSize = map.distanceToPixel(this.width, this.height);

        var pxMin = new Z.Point(sp.left, sp.top),
            pxMax = new Z.Point(sp.left + pxSize.width, sp.top + pxSize.height),
            pxExtent = new Z.Extent(pxMin.left - t, pxMin.top - t,
                                    pxMax.left + t, pxMax.top + t);

        point = new Z.Point(point.left, point.top);

        return Z.Extent.contains(pxExtent, point);
    },

    _computeExtent:function(projection) {
        if (!projection || !this._coordinates || Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return null;
        }
        var width = this.getWidth(),
            height = this.getHeight();
        var p1 = projection.locate(this._coordinates,width,-height);
        return new Z.Extent(p1,this._coordinates);
    },

    _computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return 2*(this.width+this.height);
    },

    _computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return this.width*this.height;
    },


    _assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Rectangle.Canvas(this);
        } else  {
            return new Z.Rectangle.SVG(this);
        }
        return null;
    },

    _exportGeoJson:function(opts) {
        var nw =this.getCoordinates();
        return {
            'type':"Rectangle",
            'coordinates':[nw.x,nw.y],
            'width':this.getWidth(),
            'height':this.getHeight()
        };
    }

});

Z['GeometryCollection'] = Z.GeometryCollection = Z.Geometry.extend({
    type:Z.Geometry['TYPE_GEOMETRYCOLLECTION'],

    initialize:function(geometries, opts) {
        this.setGeometries(geometries);
        this.initOptions(opts);
    },

    /**
     * _prepare this geometry collection
     * @param  {Z.Layer} layer [description]
     * @return {[type]}       [description]
     * @override
     */
    _prepare:function(layer) {
        this._rootPrepare(layer);
        this._prepareGeometries();
    },

    /**
     * _prepare the geometries, 在geometries发生改变时调用
     * @return {[type]} [description]
     */
    _prepareGeometries:function() {
        var layer = this.getLayer();
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            this.geometries[i]._prepare(layer);
        }
    },

    /**
     * 设置
     * @param {[Geometry]} geometries [Geometry数组]
     * @expose
     *
     */
    setGeometries:function(geometries) {
        this._checkGeometries(geometries);
        this.geometries = geometries;
        if (this.getLayer()) {
            this._prepareGeometries();
            this._onShapeChanged();
        }
        return this;
    },

    /**
     * 获取集合中的Geometries
     * @return {[Geometry]} Geometry数组
     * @expose
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
    _checkGeometries:function(geometries) {

    },

    /**
     * 集合是否为空
     * @return {Boolean} [是否为空]
     * @expose
     */
    isEmpty:function() {
        return !Z.Util.isArrayHasData(this.geometries);
    },

    _updateCache:function() {
        for (var i=0, len=this.geometries.length;i<len;i++) {
            if (this.geometries[i] && this.geometries[i]._updateCache) {
                this.geometries[i]._updateCache();
            }
        }
    },

    _computeCenter:function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var sumX=0, sumY=0,counter=0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            if (!this.geometries[i]) {
                continue;
            }
            var center = this.geometries[i]._computeCenter(projection);
            sumX += center.x;
            sumY += center.y;
            counter++;
        }
        return new Z.Coordinate(sumX/counter, sumY/counter);
    },

    _containsPoint: function(point) {
        var i, len, geo;

        for (i = 0, len = this.geometries.length; i < len; i++) {
            geo = this.geometries[i];
            if (geo._containsPoint(point)) {
                return true;
            }
        }

        return false;
    },

    _computeExtent:function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var result = null;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result = Z.Extent.combine(this.geometries[i]._computeExtent(projection),result);
        }
        return result;
    },

    _computeGeodesicLength:function(projection) {
        if (!projection || this.isEmpty()) {
            return 0;
        }
        var result = 0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result += this.geometries[i]._computeGeodesicLength(projection);
        }
        return result;
    },

    _computeGeodesicArea:function(projection) {
        if (!projection || this.isEmpty()) {
            return 0;
        }
        var result = 0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result += this.geometries[i]._computeGeodesicArea(projection);
        }
        return result;
    },


    _assignPainter:function() {
        return new Z.GeometryCollection.Painter(this);
    },

   _exportGeoJson:function(opts) {
        var geoJsons = [];
        var geometries = this.getGeometries();
        if (Z.Util.isArray(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                geoJsons.push(geometries[i]._exportGeoJson(opts));
            }
        }
        return {
            'type':         'GeometryCollection',
            'geometries':   geoJsons
        };
    },

    _clearProjection:function() {
        var geometries = this.getGeometries();
        if (Z.Util.isArrayHasData(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                this.geometries[i]._clearProjection();
            }
        }
    },

//----------覆盖Geometry中的编辑相关方法-----------------

    /**
     * 开始编辑
     * @expose
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
     * @expose
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
     * @expose
     */
    isEditing:function() {
        return this.editing;
    },

    /**
     * 开始拖拽
     * @expose
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
     * @expose
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
     * @expose
     */
    isDragging:function() {
        return this.dragging;
    }
});

Z.MultiPoly = Z.GeometryCollection.extend({

    initialize:function(data, opts) {
        if (Z.Util.isArrayHasData(data)) {
            if (data[0] instanceof this.GeometryType) {
                this.setGeometries(data);
            } else {
                this.setCoordinates(data);
            }
        }
        this.initOptions(opts);
    },

    _checkGeometries:function(geometries) {
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
     * @expose
     */
    getCoordinates:function() {
        var coordinates = [];
        var geometries = this.getGeometries();
        if (!Z.Util.isArray(geometries)) {
            return null;
        }
        for (var i = 0,len=geometries.length;i<len;i++) {
            coordinates.push(geometries[i].getCoordinates());
        }
        return coordinates;
    },

    /**
     * 设置MultiPolygon
     * @param {Coordinate[][][]} MultiPolygon的坐标数组
     * @expose
     */
    setCoordinates:function(coordinates) {
        if (Z.Util.isArrayHasData(coordinates)) {
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
    },

    //override _exportGeoJson in GeometryCollection
    _exportGeoJson:function(opts) {
        var points = this.getCoordinates();
        var coordinates = Z.GeoJson.toGeoJsonCoordinates(points);
        return {
            'type':this.getType(),
            'coordinates': coordinates
        };
    }
});
Z['MultiPoint'] = Z.MultiPoint = Z.MultiPoly.extend({
    GeometryType:Z.Marker,    

    type:Z.Geometry['TYPE_MULTIPOINT']
});
Z['MultiPolyline']=Z.MultiPolyline = Z.MultiPoly.extend({
    GeometryType:Z.Polyline,

    type:Z.Geometry['TYPE_MULTILINESTRING']
});
Z['MultiPolygon'] = Z.MultiPolygon = Z.MultiPoly.extend({
    GeometryType:Z.Polygon,    

    type:Z.Geometry['TYPE_MULTIPOLYGON']
});
Z['GeoJSON']=Z.GeoJson={
        /**
         * 将geoJson字符串或geoJson对象转化为Geometry对象
         * @param  {String | Object | [Object]} json json对象
         * @return {Geometry | [Geometry]}      转化的Geometry对象或数组
         * @expose
         */
        fromGeoJson:function(geoJson) {
            if (Z.Util.isString(geoJson)) {
                geoJson = Z.Util.parseJson(geoJson);
            }
            if (Z.Util.isArray(geoJson)) {
                var result = [];
                for (var i=0,len=geoJson.length;i<len;i++) { 
                    var geo = this._fromGeoJsonInstance(geoJson[i]);
                    result.push(geo);
                }
                return result;
            } else {
                return this._fromGeoJsonInstance(geoJson);
            }

        },

        /**
         * 将Coordinate数组转化为GeoJson坐标数组
         * @param  {[Coordinate]} coordinates Coordinate数组
         * @return {number[]..}               GeoJson数组
         * @expose
         */
        toGeoJsonCoordinates:function(coordinates) {
            if (!Z.Util.isArray(coordinates)) {
                return [coordinates.x, coordinates.y];
            }
            return Z.Util.eachInArray(coordinates, this, function(coord) {
                return [coord.x, coord.y];
            });
        },

        /**
         * 将GeoJson坐标数组转化为Coordinate数组
         * @param  {[type]} coordinates [description]
         * @return {[type]}             [description]
         */
        fromGeoJsonCoordinates:function(coordinates) {
            if (Z.Util.isNumber(coordinates[0]) && Z.Util.isNumber(coordinates[1])) {
                return new Z.Coordinate(coordinates);
            }
            var result = [];
            for (var i=0, len=coordinates.length;i<len;i++) {
                var child = coordinates[i];
                if (Z.Util.isArray(child)) {
                    if (Z.Util.isNumber(child[0])) {
                        result.push(new Z.Coordinate(child));
                    } else {
                        result.push(this.fromGeoJsonCoordinates(child));
                    }
                } else {
                    result.push(child);
                }
            }
            return result;
        },

        /**
         * 解析单个GeoJson对象,输出为Geometry
         * @param  {[type]} geoJsonObj [description]
         * @return {[type]}            [description]
         */
        _fromGeoJsonInstance:function(geoJsonObj) {
            if (!geoJsonObj || Z.Util.isNil(geoJsonObj['type'])) {
                return null;
            }
            var type = geoJsonObj['type'];
            if ('Feature' === type) {
                var geoJsonGeo = geoJsonObj['geometry'];
                var properties = geoJsonObj['properties'];
                var geoId = geoJsonObj['id'];
                if (!Z.Util.isNil(geoId)) {
                    geoId = geoId.toString();
                }
                //TODO symbol和coordinateType的处理
                var geometry = this._fromGeoJsonInstance(geoJsonGeo);
                if (!geometry) {
                    return null;
                }
                geometry.setId(geoId);
                geometry.setProperties(properties);
                return geometry;
            } else if ('FeatureCollection' === type) {
                var features = geoJsonObj['features'];
                if (!features) {
                    return null;
                }
                var result = this.fromGeoJson(features);
                return result;
            } else if ('Point' === type) {
                return new Z.Marker(geoJsonObj['coordinates']);
            } else if ('LineString' === type) {
                return new Z.Polyline(geoJsonObj['coordinates']);
            } else if ('Polygon' === type) {
                return new Z.Polygon(geoJsonObj['coordinates']);
            } else if ('MultiPoint' === type) {
                return new Z.MultiPoint(geoJsonObj['coordinates']);
            } else if ('MultiLineString' === type) {
                return new Z.MultiPolyline(geoJsonObj['coordinates']);
            } else if ('MultiPolygon' === type) {
                return new Z.MultiPolygon(geoJsonObj['coordinates']);
            } else if ('GeometryCollection' === type) {
                var geometries = geoJsonObj['geometries'];
                if (!Z.Util.isArrayHasData(geometries)) {
                    return new Z.GeometryCollection();
                }
                var mGeos = [];
                var size = geometries.length;                
                for (var i = 0; i < size; i++) {
                    mGeos.push(this._fromGeoJsonInstance(geometries[i]));
                }
                return new Z.GeometryCollection(mGeos);
            } else if ('Circle' === type) {
                return new Z.Circle(geoJsonObj['coordinates'], geoJsonObj['radius']);
            } else if ('Ellipse' === type) {
                return new Z.Ellipse(geoJsonObj['coordinates'], geoJsonObj['width'], geoJsonObj['height']);
            } else if ('Rectangle' === type) {
                return new Z.Rectangle(geoJsonObj['coordinates'], geoJsonObj['width'], geoJsonObj['height']);
            } else if ('Sector' === type) {
                return new Z.Sector(geoJsonObj['coordinates'], geoJsonObj['radius'], geoJsonObj['startAngle'], geoJsonObj['endAngle']);
            }
            return null;
        }
};

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

Z.SVG = {
    defaultStrokeSymbol:{
        'stroke':'#000000',
        'strokeWidth': 2
    },

    defaultFillSymbol:{
        'fill': '#ffffff',
        'fillOpacity': 0
    },

    _ISURL: /^url\(['"]?(.+?)['"]?\)$/i,

    createContainer:function() {},

    refreshContainer:function() {},

    refreshVector:function() {},

    refreshTextVector:function() {},

    refreshVectorSymbol:function() {},

    refreshShieldVector:function() {},

    addVector:function(){},

    addTextVector:function(){},

    addShieldVector:function(){},

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

Z.SVG.SVG = {
    createContainer:function() {
        var paper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        paper.style.overflow = '';
        paper.style.position = 'absolute';
        paper.setAttribute('xmlns','http://www.w3.org/2000/svg');
        var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        paper.appendChild(defs);
        paper.defs = defs;
        return paper;
    },

    refreshContainer:function(map, paper) {
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

    refreshTextVector:function(textVector, vectorBean) {
        if (!textVector || !vectorBean) {
            return;
        }
        var text = vectorBean['text'];
        if (!text) {
            return;
        }
        var location = text['location'];
        if(textVector.nodeName === 'text') {
            var newX = location[0];
            var newY = location[1];
            var textX = textVector.getAttribute('x');
            var textY = textVector.getAttribute('y');
            var textChildren = textVector.childNodes;
            if(textChildren) {
                for(var i=0,len=textChildren.length;i<len;i++) {
                    var childNode = textChildren[i];
                    if(childNode.nodeName === 'tspan') {
                        var spanX = childNode.getAttribute('x');
                        var spanY = childNode.getAttribute('y');
                        childNode.setAttribute('x', newX+(spanX-textX));
                        childNode.setAttribute('y', newY+(spanY-textY));
                    }
                }
            }
            textVector.setAttribute('x', newX);
            textVector.setAttribute('y', newY);
        }
    },

    refreshShieldVector:function(vector, vectorBean) {
        if (!vector || !vectorBean) {
            return;
        }
        var path = vectorBean['path'];
        if (!path) {
            return;
        }
        var pathVector = vector.firstChild;
        if(pathVector) {
            pathVector.setAttribute('d', path);
            var textVector = pathVector.nextSibling;
            this.refreshTextVector(textVector, vectorBean);
        }
    },

    refreshVectorSymbol:function(vector, strokeSymbol, fillSymbol, paper) {
        if(!vector) return;
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
                    if (Z.Util.isNil(fillValue)) {
                        continue;
                    }
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
        var vector = this._addVector(vectorBean, strokeSymbol, fillSymbol);
        Z.SVG.refreshVectorSymbol(vector, strokeSymbol, fillSymbol, container);
        if(vector) {
            container.appendChild(vector);
        }
        return vector;
    },


    _addVector:function(vectorBean, strokeSymbol, fillSymbol) {
        var vector;
        if(vectorBean['path']) {
            vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            vector.setAttribute('d', vectorBean['path']);
        }
        return vector;
    },

    addTextVector: function(container, vectorBean, iconSymbol) {
        var textVector = this._addTextVector(vectorBean, iconSymbol);
        if(textVector) {
            container.appendChild(textVector);
        }
        return textVector;
    },

    _addTextVector: function(vectorBean, iconSymbol) {
        var textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        var font = iconSymbol['font'];
        var size = iconSymbol['size'];
        var width = iconSymbol['textWidth'];
        var padding = iconSymbol['padding'];
        var color = iconSymbol['color'];
        var opacity = iconSymbol['textOpacity'];
        var align = iconSymbol['textAlign'];
        var vertical = iconSymbol['vertical'];
        var horizontal = iconSymbol['horizontal'];
        var placement = iconSymbol['placement'];
        var lineSpacing = iconSymbol['lineSpacing'];

        var textStyle = 'font-family:' + font + ';' +
                        'font-size:' + fontSize + ';' +
                        'width:' + width + ';' +
                        'fill:' + color + ';' +
                        'opacity:' + opacity + ';' +
                        'padding:' + padding + ';' +
                        'text-align:' + align + ';';
        var text = vectorBean['text'];
        if(text){
            var location = text['location'];
            var content = text['content'];
            var fontSize = iconSymbol['size'];
            var size = fontSize/2;
            var textWidth = Z.Util.getLength(content)*size;
            textElement.setAttribute('font-family', font);
            textElement.setAttribute('font-size', fontSize);
            textElement.setAttribute('style', textStyle);
            textElement.setAttribute('x', location[0]);
            textElement.setAttribute('y', location[1] + lineSpacing + size);
            //textElement.setAttribute('style', textStyle);
            if(textWidth>width){
                 var contents = Z.Util.splitContent(content, textWidth, size, width);
                 var result = '';
                 for(var i=0,len=contents.length;i<len;i++){
                    var content = contents[i];
                    var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                    tspan.setAttribute('x', location[0]);
                    tspan.setAttribute('y', location[1] + (lineSpacing + size)*(i+1));
                    var textNode = document.createTextNode(content);
                    tspan.appendChild(textNode);
                    textElement.appendChild(tspan);
                 }
            } else {
                var textNode = document.createTextNode(content);
                textElement.appendChild(textNode);
            }
            /**
            *沿线绘制文本
            var startX = location[0],startY = location[1];
            var endX = startX + width + padding, endY = startY;
            var pathStr = 'M'+startX+','+startY+' L'+endX+','+endY+' '+Z.SVG.closeChar;
            var pathId =  'PATH_ID';
            var textLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            textLine.setAttribute('id', pathId);
            textLine.setAttribute('d', pathStr);
            var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
            defs.appendChild(textLine);
            container.appendChild(defs);
            var textPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
            textPathElement.appendChild(textNode);
            */
        }
        return textElement;
    },

    addShieldVector:function(container, vectorBean, strokeSymbol, fillSymbol, shieldSymbol) {
        var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var vector =  this._addVector(vectorBean, strokeSymbol, fillSymbol);
        Z.SVG.refreshVectorSymbol(vector, strokeSymbol, fillSymbol, container);
        var textVector = this._addTextVector(vectorBean, shieldSymbol);
        if(vector&&textVector) {
            group.setAttribute('fill', fillSymbol['fill']);
            group.setAttribute('z-index', 100);
            group.appendChild(vector);
            group.appendChild(textVector);
            container.appendChild(group);
        }
        return group;
    },

    removeVector:function(_container, vector) {
        //如果是模式填充, 需要删除模式定义元素
        if (vector._pattern) {
            Z.Util.removeDomNode(vector._pattern);
        }
        if (_container && vector) {
            _container.removeChild(vector);
        }
    }
};

Z.SVG.VML= {
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

        var stroke = Z.SVG.create('stroke');
        if (strokeSymbol['strokeWidth']) {
            stroke.weight = strokeSymbol['strokeWidth'] + 'px';
        }
        if (strokeSymbol['stroke']) {
            stroke.color = strokeSymbol['stroke'];
        }
        if (strokeSymbol['strokeOpacity']) {
            stroke.opacity = strokeSymbol['strokeOpacity'];
        }
        if (strokeSymbol['strokeDasharray']) {
            stroke.dashStyle = strokeSymbol['strokeDasharray'];
        }
        vmlShape.appendChild(stroke);

        if (fillSymbol) {
            var fill = Z.SVG.create('fill');
            if (fillSymbol['fill']) {
                var isUrl = fillSymbol['fill'].match(Z.SVG._ISURL);
                if (isUrl) {
                    fill.rotate = true;
                    fill.src = isUrl[1];
                    fill.type = 'tile';
                } else {
                    fill.color = fillSymbol['fill'];
                    fill.filled = 't';

                }
            }
            if (!Z.Util.isNil(fillSymbol['fillOpacity'])) {
                fill.opacity = fillSymbol['fillOpacity'];
            }
            vmlShape.appendChild(fill);
        }
    },

    /**
     * 更新矢量图形的图形属性
     * @param  {[type]} vmlShape     [description]
     * @param  {[type]} vectorBean [description]
     * @return {[type]}            [description]
     */
    refreshVector: function(vmlShape, vectorBean) {
        if (!vmlShape || !vectorBean) {
            return;
        }
        var path = vectorBean['path'];
        vmlShape.path['v'] = path;
    },

    refreshTextVector:function(vector, vectorBean) {
        if (!vector || !vectorBean) {
            return;
        }
        var text = vectorBean['text'];
        if (!text&&text.length==0) {
            return;
        }
        var location = text['location'];
        vector.style.top = (location[1])+'px';
        vector.style.left = (location[0])+'px';
    },

    refreshShieldVector: function(vector, vectorBean) {
        if (!vector || !vectorBean) {
            return;
        }
        var path = vectorBean['path'];
        if (!path) {
            return;
        }
        if(vector) {
            vector.path['v'] = path;
            //var textVector = vector.lastChild;
            //this.refreshTextVector(textVector, vectorBean);
        }
    },

    addVector: function(container, vectorBean, strokeSymbol, fillSymbol) {
        var vector = this._addVector(vectorBean, strokeSymbol, fillSymbol);
        if(vector) {
            container.appendChild(vector);
        }
        return vector;
    },

    _addVector: function(vectorBean, strokeSymbol, fillSymbol, shieldSymbol) {
        var vector;
        if (!vectorBean) {
            return null;
        }
        vector = Z.SVG.create('shape');
        //以下三行不设置的话, IE8无法显示vml图形,原因不明
        vector.style.width = '1px';
        vector.style.height = '1px';
        vector['coordsize'] = '1 1';
        vector['coordorigin'] = '0 0';
        var _path = Z.SVG.create('path');
        _path.v = vectorBean['path'];
        vector.appendChild(_path);
        vector.path = _path;
        this.refreshVectorSymbol(vector, strokeSymbol, fillSymbol);
        return vector;
    },

    addTextVector: function(container, vectorBean, iconSymbol) {
        var textVector = this._addTextVector(vectorBean, iconSymbol);
        if(textVector) {
            container.appendChild(textVector);
        }
        return textVector;
    },

    _addTextVector: function(vectorBean, iconSymbol) {
        var textElement;
        var font = iconSymbol['font'];
        var fontSize = iconSymbol['size'];
        var width = iconSymbol['textWidth'];
        var padding = iconSymbol['padding'];
        var color = iconSymbol['color'];
        var opacity = iconSymbol['textOpacity'];
        var align = iconSymbol['textAlign'];
        var vertical = iconSymbol['vertical'];
        var horizontal = iconSymbol['horizontal'];
        var placement = iconSymbol['placement'];
        var lineSpacing = iconSymbol['lineSpacing'];


        var dx = parseInt(iconSymbol['textDx'],0);
        var dy = parseInt(iconSymbol['textDy'],0);
        var text = vectorBean['text'];
        if(text){
            var location = text['location'];
            var content = text['content'];
            var size = fontSize/2;
            var textWidth = Z.Util.getLength(content)*size;
            var resultStr = '';
            if(textWidth>width){
                 var contents = Z.Util.splitContent(content, textWidth, size, width);
                 var result = '';
                 for(var i=0,len=contents.length;i<len;i++){
                    var content = contents[i];
                    resultStr += content+'<br/>';
                 }
            }

            textElement = Z.SVG.create('v:textbox');
            textElement.style.fontSize  = fontSize +'px';
            textElement.style.color  = color;
            textElement.style.width  = textWidth +'px';
            textElement.style.textAlign = align;
            textElement.innerHTML   = resultStr;
            textElement.style.left = (location[0])+'px';
            textElement.style.top = (location[1] + lineSpacing + size)+'px';
        }
        return textElement;
    },

    addShieldVector: function(container, vectorBean, strokeSymbol, fillSymbol, shieldSymbol) {
        var vector =  this._addVector(vectorBean, strokeSymbol, fillSymbol, shieldSymbol);
        var textVector = this._addTextVector(vectorBean, shieldSymbol);
        var shieldType = shieldSymbol['shieldType'];
        var offsetWidth=0,offsetHeight=0;
        if ('tip' === shieldType) {
            var height = shieldSymbol['height'];
            var width = shieldSymbol['width'];
            if(!shieldSymbol['shieldType']) {
                width = Z.Util.setDefaultValue(shieldSymbol['textWidth'],0);
                height = Z.Util.setDefaultValue(shieldSymbol['size'], 12);
            }
            var content = shieldSymbol['content'];
            var fontSize = shieldSymbol['size'];
            var size = fontSize/2;
            var lineSpacing = shieldSymbol['lineSpacing'];
            var textWidth = Z.Util.getLength(content)*size;
            var rowNum = 0;
            if(textWidth>width){
                rowNum = Math.ceil(textWidth/width);
            }
            height += rowNum*((fontSize+lineSpacing)/2);
            width += fontSize;

            var horizontal = shieldSymbol['horizontal'];//水平
            if(!horizontal) horizontal = 'middle';
            var vertical = shieldSymbol['vertical'];//垂直
            if(!vertical) vertical = 'top';
            if ('middle' === horizontal) {
                if ('bottom' === vertical) {
                    offsetHeight = height/2;
                }
            } else if ('right' === horizontal){
                offsetWidth = height/2;
            }
        }
        textVector.style.left = offsetWidth + 'px';
        textVector.style.top = offsetHeight +'px';

        if(vector&&textVector) {
            vector.appendChild(textVector);
            container.appendChild(vector);
        }
        return vector;
    },

    removeVector:function(_container, vector) {
        if (_container && vector) {
             _container.removeChild(vector);
        }
    }
};

Z.SVG.VML.create = (function () {
        if (Z.Browser.vml) {
            var doc = window.document;
            if (doc.styleSheets.length < 31) {
                doc.createStyleSheet().addRule('.zvml', 'behavior:url(#default#VML);display: inline-block;position:absolute;');
            } else {
                // no more room, add to the existing one
                // http://msdn.microsoft.com/en-us/library/ms531194%28VS.85%29.aspx
                doc.styleSheets[0].addRule('.zvml', 'behavior:url(#default#VML);display: inline-block;position:absolute;');
            }
            try {
                !doc.namespaces['zvml'] && doc.namespaces.add('zvml', 'urn:schemas-microsoft-com:vml');
                return function (tagName) {
                    return doc.createElement('<zvml:' + tagName + ' class="zvml">');
                };
            } catch (e) {
                return function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="zvml">');
                };
            }
        }
    })();

if (Z.Browser.vml) {
    Z.Util.extend(Z.SVG, Z.SVG.VML);
} else if (Z.Browser.svg) {
    Z.Util.extend(Z.SVG, Z.SVG.SVG);
} else {
    //vml和svg都不支持
}

/**
 * HiDPI Canvas Polyfill (1.0.9)
 *
 * Author: Jonathan D. Johnson (http://jondavidjohn.com)
 * Homepage: https://github.com/jondavidjohn/hidpi-canvas-polyfill
 * Issue Tracker: https://github.com/jondavidjohn/hidpi-canvas-polyfill/issues
 * License: Apache 2.0
*/
if(!Z.Browser.vml) {
    (function(prototype) {
        var pixelRatio = (function(context) {
                var backingStore = context.backingStorePixelRatio ||
                            context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1;

                return (window.devicePixelRatio || 1) / backingStore;
            })(prototype),

            forEach = function(obj, func) {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        func(obj[p], p);
                    }
                }
            },

            ratioArgs = {
                'fillRect': 'all',
                'clearRect': 'all',
                'strokeRect': 'all',
                'moveTo': 'all',
                'lineTo': 'all',
                'arc': [0,1,2],
                'arcTo': 'all',
                'bezierCurveTo': 'all',
                'isPointinPath': 'all',
                'isPointinStroke': 'all',
                'quadraticCurveTo': 'all',
                'rect': 'all',
                'translate': 'all',
                'createRadialGradient': 'all',
                'createLinearGradient': 'all'
            };

        if (pixelRatio === 1) return;

        forEach(ratioArgs, function(value, key) {
            prototype[key] = (function(_super) {
                return function() {
                    var i, len,
                        args = Array.prototype.slice.call(arguments);

                    if (value === 'all') {
                        args = args.map(function(a) {
                            return a * pixelRatio;
                        });
                    }
                    else if (Array.isArray(value)) {
                        for (i = 0, len = value.length; i < len; i++) {
                            args[value[i]] *= pixelRatio;
                        }
                    }

                    return _super.apply(this, args);
                };
            })(prototype[key]);
        });

         // Stroke lineWidth adjustment
        prototype.stroke = (function(_super) {
            return function() {
                this.lineWidth *= pixelRatio;
                _super.apply(this, arguments);
                this.lineWidth /= pixelRatio;
            };
        })(prototype.stroke);

        // Text
        //
        prototype.fillText = (function(_super) {
            return function() {
                var args = Array.prototype.slice.call(arguments);

                args[1] *= pixelRatio; // x
                args[2] *= pixelRatio; // y

                this.font = this.font.replace(
                    /(\d+)(px|em|rem|pt)/g,
                    function(w, m, u) {
                        return (m * pixelRatio) + u;
                    }
                );

                _super.apply(this, args);

                this.font = this.font.replace(
                    /(\d+)(px|em|rem|pt)/g,
                    function(w, m, u) {
                        return (m / pixelRatio) + u;
                    }
                );
            };
        })(prototype.fillText);

        prototype.strokeText = (function(_super) {
            return function() {
                var args = Array.prototype.slice.call(arguments);

                args[1] *= pixelRatio; // x
                args[2] *= pixelRatio; // y

                this.font = this.font.replace(
                    /(\d+)(px|em|rem|pt)/g,
                    function(w, m, u) {
                        return (m * pixelRatio) + u;
                    }
                );

                _super.apply(this, args);

                this.font = this.font.replace(
                    /(\d+)(px|em|rem|pt)/g,
                    function(w, m, u) {
                        return (m / pixelRatio) + u;
                    }
                );
            };
        })(prototype.strokeText);
    })(CanvasRenderingContext2D.prototype);
    ;(function(prototype) {
        prototype.getContext = (function(_super) {
            return function(type) {
                var backingStore, ratio,
                    context = _super.call(this, type);

                if (type === '2d') {

                    backingStore = context.backingStorePixelRatio ||
                                context.webkitBackingStorePixelRatio ||
                                context.mozBackingStorePixelRatio ||
                                context.msBackingStorePixelRatio ||
                                context.oBackingStorePixelRatio ||
                                context.backingStorePixelRatio || 1;

                    ratio = (window.devicePixelRatio || 1) / backingStore;

                    if (ratio > 1) {
                        this.width *= ratio;
                        this.height *= ratio;
                        this.style.height = this.height + 'px';
                        this.style.width = this.width + 'px';
                    }
                }

                return context;
            };
        })(prototype.getContext);
    })(HTMLCanvasElement.prototype);
}

Z.Painter = Z.Class.extend({
    includes:[Z.Eventable],
    paint:function() {
        if (!this.geometry || !this.geometry.isVisible()) {
            return;
        }
        this._paint.apply(this,arguments);
        this._registerEvents();
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
            var cartoSymbol = map._cartoCSSGeometry(this.geometry);
            if (cartoSymbol) {
                symbol = Z.Util.convertFieldNameStyle(cartoSymbol,'camel');
            }
        }
        this.strokeSymbol = this.prepareStrokeSymbol(symbol);
        this.fillSymbol = this.prepareFillSymbol(symbol);
        this.iconSymbol = this.prepareIconSymbol(symbol);
        this.shieldSymbol = this.prepareShieldSymbol(symbol);
    },

    /**
     * 构造线渲染所需的symbol字段
     */
    prepareStrokeSymbol:function(symbol) {
        var strokeSymbol = {};
        strokeSymbol['stroke'] = Z.Util.setDefaultValue(symbol['lineColor'], '#000000');
        strokeSymbol['strokeWidth'] = Z.Util.setDefaultValue(symbol['lineWidth'], 1);
        strokeSymbol['strokeDasharray'] = symbol['lineDasharray'];
        strokeSymbol['strokeOpacity'] = Z.Util.setDefaultValue(symbol['lineOpacity'], 1);

        if (symbol['markerLineWidth'] || symbol['markerLineColor']) {
            strokeSymbol['stroke'] = Z.Util.setDefaultValue(symbol['markerLineColor'], '#000000');
            strokeSymbol['strokeDasharray'] = symbol['lineDasharray'];
            strokeSymbol['strokeWidth'] = Z.Util.setDefaultValue(symbol['markerLineWidth'], 1);
            //markerOpacity优先级较高
            strokeSymbol['strokeOpacity'] = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerLineOpacity']);
        }
        return strokeSymbol;
    },

    /**
     * 构造填充渲染所需的symbol字段
     */
    prepareFillSymbol:function(symbol) {
        var fillSymbol = {};
        fillSymbol['fill'] = Z.Util.setDefaultValue(symbol['polygonFill'], '#ffffff');
        if (symbol['polygonPatternFile']) {
            fillSymbol['fill'] = symbol['polygonPatternFile'];
        }
        fillSymbol['fillOpacity'] = (!Z.Util.isNil(symbol['polygonOpacity'])?symbol['polygonOpacity']:symbol['polygonPatternOpacity']);

        if (symbol['markerFill'] || symbol['markerFillOpacity']) {
            fillSymbol['fill'] = Z.Util.setDefaultValue(symbol['markerFill'], '#ffffff');
            //markerOpacity优先级较高
            fillSymbol['fillOpacity'] = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerFillOpacity']);
        }
        return fillSymbol;
    },

    prepareIconSymbol: function(symbol) {
        var url = symbol['markerFile'];
        var markerType = symbol['markerType'];
        var textName = symbol['textName'];
        if(!url&&!markerType&&!textName) {
            return null;
        }
        for(var attr in symbol) {
            var url = symbol['markerFile'];
            if (url&&url.length>0) {
               symbol['markerType'] = null;
               symbol['textName'] = null;
               break;
            }
            var markerType = symbol['markerType'];
            if(markerType&&markerType.length>0) {
                symbol['markerFile'] = null;
                symbol['textName'] = null;
                break;
            }
            var textName = symbol['textName'];
            if(textName&&textName.length>0) {
                symbol['markerFile'] = null;
                symbol['markerType'] = null;
                break;
            }
        }

        var icon = {
            ////icon
           'url': symbol['markerFile'],
           'width': Z.Util.setDefaultValue(symbol['markerWidth'], 30),
           'height': Z.Util.setDefaultValue(symbol['markerHeight'], 30),
           'type': symbol['markerType'],
           'opacity': Z.Util.setDefaultValue(symbol['markerOpacity'], 1),
           'fillOpacity': Z.Util.setDefaultValue(symbol['markerFillOpacity'],1 ),
           'fill': Z.Util.setDefaultValue(symbol['markerFill'],'#ffffff'),
           'stroke': Z.Util.setDefaultValue(symbol['markerLineColor'], '#000000'),
           'strokeWidth': Z.Util.setDefaultValue(symbol['markerLineWidth'], 1),
           'strokeDasharray': symbol['markerLineDasharray'],
           'strokeOpacity': Z.Util.setDefaultValue(symbol['markerLineOpacity'], 1),

           /////text
           'content': symbol['textName'],
           'font': Z.Util.setDefaultValue(symbol['textFaceName'], 'arial'),
           'size': Z.Util.setDefaultValue(symbol['textSize'], 12),
           'textWidth': symbol['textWrapWidth'],
           'padding': Z.Util.setDefaultValue(symbol['textSpacing'], 0),
           'color': Z.Util.setDefaultValue( symbol['textFill'], '#000000'),
           'textOpacity': Z.Util.setDefaultValue(symbol['textOpacity'], 1),
           'textAlign': Z.Util.setDefaultValue(symbol['textAlign'], 'center'),
           'vertical': Z.Util.setDefaultValue(symbol['textVerticalAlignment'], 'middle'),
           'horizontal': Z.Util.setDefaultValue(symbol['textHorizontalAlignment'], 'middle'),
           'placement': Z.Util.setDefaultValue(symbol['textPlacement'], 'point'),
           'lineSpacing': Z.Util.setDefaultValue(symbol['textLineSpacing'], 0),
           'dx': Z.Util.setDefaultValue(symbol['dx'], 0),
           'dy' : Z.Util.setDefaultValue(symbol['dy'], 0),
           'textDx': Z.Util.setDefaultValue(symbol['textDx'], 0),
           'textDy' : Z.Util.setDefaultValue(symbol['textDy'], 0)
        };
        return icon;
    },

    prepareShieldSymbol: function(symbol) {
        var shieldSymbol = {
            'shieldType': symbol['shieldType'],//label tip
            'content': symbol['shieldName'],
            'opacity': Z.Util.setDefaultValue(symbol['shieldOpacity'], 1),
            'stroke': Z.Util.setDefaultValue(symbol['shieldLineColor'], '#000000'),
            'strokeWidth': Z.Util.setDefaultValue(symbol['shieldLineWidth'], 1),
            'strokeOpacity': Z.Util.setDefaultValue(symbol['shieldLineOpacity'], 1),
            'strokeDasharray': symbol['shieldLineDasharray'],
            'fill': Z.Util.setDefaultValue(symbol['shieldFill'], '#ffffff'),
            'fillOpacity': Z.Util.setDefaultValue(symbol['shieldFillOpacity'], 1),
            'image': symbol['shieldFile'],
            'unlockImage': Z.Util.setDefaultValue(symbol['shieldUnlockImage'], false),
            'font': Z.Util.setDefaultValue(symbol['textFaceName'], 'arial'),
            'size': Z.Util.setDefaultValue(symbol['shieldSize'], 12),
            'color': Z.Util.setDefaultValue(symbol['shieldTextFill'], '#000000'),
            'textOpacity': Z.Util.setDefaultValue(symbol['shieldTextOpacity'], 1),
            'placement': Z.Util.setDefaultValue(symbol['shieldPlacement'], 'point'),
            'lineSpacing': Z.Util.setDefaultValue(symbol['shieldLineSpacing'], 8),
            'textWidth': symbol['shieldWrapWidth'],
            'width': Z.Util.setDefaultValue(symbol['shieldWrapWidth'],0),
            'height': Z.Util.setDefaultValue(symbol['shieldSize'], 12),
            'wrapbefore': symbol['shieldWrapBefore'],
            'wrapCharacter': symbol['shieldWrapCharacter'],
            'textDx': Z.Util.setDefaultValue(symbol['shieldTextDx'], 0),
            'textDy': Z.Util.setDefaultValue(symbol['shieldTextDy'], 0),
            'dx': Z.Util.setDefaultValue(symbol['shieldDx'], 0),
            'dy': Z.Util.setDefaultValue(symbol['shieldDy'], 0),
            'horizontal': Z.Util.setDefaultValue(symbol['shieldHorizontalAlignment'], 'middle'),//left middle right
            'vertical': Z.Util.setDefaultValue(symbol['shieldVerticalAlignment'], 'middle'),//top middle bottom
            'textAlign': Z.Util.setDefaultValue(symbol['shieldJustifyAlignment'], 'left') //left center right
        };
        return shieldSymbol;
    },

    //需要实现的接口方法
    _setZIndex:function(change) {
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
        Z.DomUtil.on(dom, 'mousedown mouseup click dblclick contextmenu', geometry._onEvent, geometry);
        Z.DomUtil.on(dom, 'mouseover', geometry._onMouseOver, geometry);
        Z.DomUtil.on(dom, 'mouseout', geometry._onMouseOut, geometry);
    }

});
Z.Painter.SVG = Z.Painter.extend({

    /**
     * 绘制矢量Geometry
     * @param layer
     * @param config
     */
    drawVector: function(vectorBean, strokeSymbol, fillSymbol) {
        var vectorPaper = this._getVectorPaper(vectorBean);
        this.vector = Z.SVG.addVector(vectorPaper, vectorBean, strokeSymbol, fillSymbol);
        return this.vector;
    },

    drawTextVector: function(vectorBean, iconSymbol) {
        var vectorPaper = this.getVectorPaper(vectorBean);
        this.vector = Z.SVG.addTextVector(vectorPaper, vectorBean, iconSymbol);
        return this.vector;
    },

    drawShieldVector: function(vectorBean, strokeSymbol, fillSymbol, shieldSymbol) {
        var vectorPaper = this.getVectorPaper(vectorBean);
        this.vector = Z.SVG.addShieldVector(vectorPaper, vectorBean, strokeSymbol, fillSymbol, shieldSymbol);
        return this.vector;
    },

    _getVectorPaper: function(vectorBean) {
        var vectorPaper = this.getVectorPaper();
        if (!vectorBean || !vectorPaper) {return;}
        //样式
        if (this.vector) {
            // TODO: only update?
            Z.SVG.removeVector(vectorPaper, this.vector);
        }
        return vectorPaper;
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

    refreshSymbol: function() {
        if (!this.geometry) {return;}
        if (Z.Geometry['TYPE_POINT'] === this.geometry.getType()) {
            this.refreshMarker();
        } else {
            this.refreshVectorSymbol();
        }
    },

    /**
     * 刷新Graphic的位置,主要用在缩放地图
     */
    refresh:function() {
        if (this.geometry.type === Z.Geometry['TYPE_POINT']) {
            this.refreshMarker();
        }  else {
            this.refreshVectorSymbol();
        }
        this._registerEvents();
    },

    _registerEvents:function(){
        var targetDom = this.vector || this.markerDom;
        targetDom && this.addDomEvents(targetDom);
    },

    _setZIndex:function(change) {
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
            this.vector.style.display = '';
        }
    },

    hide:function() {
        if (this.markerDom) {
            this.markerDom.style.display = 'none';
        }
        if (this.vector) {
            this.vector.style.display = 'none';
        }
    },

    convertPropToCssStyle:function(symbol) {
        if (!symbol) {
            return null;
        }
        var option = {};
        for (var p in symbol) {
            if (symbol.hasOwnProperty(p)) {
                if (p === '') {continue;}
                option[Z.Util.convertCamelToMinus(p)]=symbol[p];
            }
        }
        return option;

    },

    /**
     * 返回实际绘制的矢量dom对象
     * @return {Dom} dom对象
     */
    getVectorDom:function() {
        return this.markerDom || this.vector;
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
        map._createSVGPaper();
        return map.vectorPaper;
    }
});
Z.Painter.Canvas = Z.Painter.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    _paint:function(context, resources, symbol) {
        var geometry = this.geometry;
        if (!geometry || !context || !geometry.getMap() || this.deleting) {
            return;
        }
        this.setSymbol(symbol);

        this.prepareCanvas(context,this.strokeSymbol,this.fillSymbol);
        var platformOffset = this.geometry.getMap().offsetPlatform();
        this.doPaint(context,resources,platformOffset);
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
        var isRealTime = geometry.isEditing();
        var baseCanvasRender = Z.Render.Canvas.Base.getBaseCanvasRender(map);
        baseCanvasRender.repaint(isRealTime);
        this._registerEvents();
    },

    refreshSymbol:function() {
        this.refresh();
    },

    getRgba:function(color, op) {
        if (Z.Util.isNil(op)) {
            op = 1;
        }
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
            var strokeWidth = strokeSymbol['strokeWidth'];
            if (!Z.Util.isNil(strokeWidth)) {context.lineWidth = strokeWidth;}
            var strokeOpacity = strokeSymbol['strokeOpacity'];
            if (strokeWidth === 0) {
                strokeOpacity = 0;
            }
            var strokeColor = strokeSymbol['stroke'];
             if (strokeColor)  {
                 if (Z.Util.isNil(strokeOpacity)) {
                     strokeOpacity = 1;
                 }
                 context.strokeStyle = this.getRgba(strokeColor,strokeOpacity);
             }
             //低版本ie不支持该属性
             if (context.setLineDash) {
                 var strokeDash=(strokeSymbol['strokeDasharray'] || strokeSymbol['strokeDashArray']);
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
             var fill=fillSymbol['fill'];
             if (!fill) {return;}
             if (Z.Util.isNil(fillSymbol['fillOpacity'])) {
                 fillSymbol['fillOpacity'] = 1;
             }
             if (fill.length>7 && 'url' ===fill.substring(0,3)) {
                 var imgUrl = fill.substring(5,fill.length-2);
                 var imageTexture = document.createElement('img');
                 imageTexture.src = imgUrl;
                 var woodfill = context.createPattern(imageTexture, 'repeat');
                 context.fillStyle = woodfill;
             }else {
                 context.fillStyle =this.getRgba(fill);
             }
         }
    },

    fillGeo:function(context, fillSymbol){
        if (fillSymbol) {
             if (!Z.Util.isNil(fillSymbol['fillOpacity'])) {
                 context.globalAlpha = fillSymbol['fillOpacity'];
             }
             context.fill('evenodd');
             context.globalAlpha = 1;
        }
    },

    _registerEvents:function(){

    }

});
Z.Marker.PaintUtils = {

    getMarkerDomOffset: function() {
        var domOffset = this.geometry._getCenterDomOffset();
        if (!domOffset) {return null;}
        var moffset = this.getIconOffset();
        var gCenter = [(domOffset['left'] + moffset['left']), (domOffset['top'] + moffset['top'])];
        return gCenter;
    },

    getIconOffset: function() {
        var icon = this.getGeoIcon();
        var width = icon['width'];
        if (!width) {width = 0;}
        var height = icon['height'];
        if (!height) {height = 0;}
        return new Z.Point(-Math.round(width/2),-height);
    },

    getVectorArray: function(gCenter) {
        var icon = this.getGeoIcon();
        var markerType = icon['type'];
        var width = Z.Util.setDefaultValue(icon['width'],0);
        var height = Z.Util.setDefaultValue(icon['height'],0);
        var iconSize = 0;
        if(width>height){
            iconSize = width;
        } else {
            iconSize = height;
        }
        var size = iconSize/2;
        var dx = Z.Util.setDefaultValue(icon['dx'],0);
        var dy = Z.Util.setDefaultValue(icon['dy'],0);
        var left = gCenter[0] + dx;
        var top = gCenter[1] + dy;
        var radius = Math.PI/180;
        if ('triangle' === markerType) {
            var v0 = [left,top-size];
            var v1 = [Z.Util.roundNumber(left-Math.cos(30*radius)*size),Z.Util.roundNumber(top+Math.sin(30*radius)*size)];
            var v2 = [Z.Util.roundNumber(left+Math.cos(30*radius)*size),Z.Util.roundNumber(top+Math.sin(30*radius)*size)];
            return [v0,v1,v2];
        }  else if ('cross' === markerType) {
            var v0 = [(left-size),top];
            var v1 = [(left+size),top];
            var v2 = [(left),(top-size)];
            var v3 = [(left),(top+size)];
            return [v0,v1,v2,v3];
        } else if ('diamond' === markerType) {
            var v0 = [(left-size),top];
            var v1 = [(left),(top-size)];
            var v2 = [(left+size),top];
            var v3 = [(left),(top+size)];
            return [v0,v1,v2,v3];
        } else if ('square' === markerType) {
            var v0 = [(left-size),(top+size)];
            var v1 = [(left+size),(top+size)];
            var v2 = [(left+size),(top-size)];
            var v3 = [(left-size),(top-size)];
            return [v0,v1,v2,v3];
        } else if ('x' === markerType || 'X' === markerType) {
            var r = Math.round(Math.cos(45*radius)*size);
            var v0 = [left-r,top+r];
            var v1 = [left+r,top-r];
            var v2 = [left+r,top+r];
            var v3 = [left-r,top-r];
            return [v0,v1,v2,v3];
        } else if ('bar' === markerType) {
            var v0 = [(left-width/2),(top-height)];
            var v1 = [(left+width/2),(top-height)];
            var v2 = [(left+width/2),(top)];
            var v3 = [(left-width/2),(top)];
            return [v0,v1,v2,v3];
        }
        return null;
    },

    getLabelVectorArray:function(icon) {
        var labelType = icon['shieldType'];
        if ('label' === labelType) {
            return this._getLabelPoints(icon);
        } else if ('tip' === labelType) {
            return this._getTipPoints(icon);
        }
        return null;
    },

    getTextVectorLocation: function(icon) {
        var points = this._getLabelPoints(icon);
        var labelType = icon['shieldType'];
        if ('label' === labelType) {
            points = this._getLabelPoints(icon);
        } else if ('tip' === labelType) {
            points = this._getTipPoints(icon);
        }
        var leftTopPoint = points[0];

        var padding = icon['padding'];
        var width = icon['width'];
        var height = icon['height'];
        if(!icon['shieldType']) {
            width = Z.Util.setDefaultValue(icon['textWidth'],0);
            height = Z.Util.setDefaultValue(icon['size'], 12);
        }
        if(!padding) padding = 0;
        var align = icon['textAlign'];
        if(!align) align ='left';
        var content = icon['content'];
        var fontSize = icon['size'];
        var size = fontSize/2;
        var textWidth = Z.Util.getLength(content)*size;
        var left= leftTopPoint[0] + padding, top = leftTopPoint[1] + padding;
        if ('center' === align) {
            if(width>=textWidth) {
                left = left - (width-textWidth)/2;
            }
        } else if ('right' === align) {
            if(width>=textWidth) {
                left = left + width-textWidth;
            }
        }
        return [left, top];
    },

    _getLabelPoints: function(icon) {
        var gCenter = this.geometry._getCenterDomOffset();
        if (!gCenter) {return null;}
        var mapOffset = this.geometry.getMap().offsetPlatform();
        var dx = Z.Util.setDefaultValue(icon['dx'],0);
        var dy = Z.Util.setDefaultValue(icon['dy'],0);
        var left = gCenter['left']+mapOffset['left'] + dx;
        var top = gCenter['top']+mapOffset['top'] + dy;

        var height = icon['height'];
        var width = icon['width'];
        if(!icon['shieldType']) {
            width = Z.Util.setDefaultValue(icon['textWidth'],0);
            height = Z.Util.setDefaultValue(icon['size'], 12);
        }
        var content = icon['content'];
        var fontSize = icon['size'];
        var size = fontSize/2;
        var lineSpacing = icon['lineSpacing'];
        var textWidth = Z.Util.getLength(content)*size;
        var rowNum = 0;
        if(textWidth>width){
            rowNum = Math.ceil(textWidth/width);
        }
        height += rowNum*((fontSize+lineSpacing)/2);
        width += fontSize;
        var points = [];
        var point0,point1,point2,point3;
        var horizontal = icon['horizontal'];//水平
        if(!horizontal) horizontal = 'middle';
        var vertical = icon['vertical'];//垂直
        if(!vertical) vertical = 'middle';
        if ('left' === horizontal) {
            if('top' === vertical) {
                point0 = [(left-width),(top-height)];
                point1 = [(left),(top-height)];
                point2 = [left, top];
                point3 = [(left-width),(top)];
            } else if ('middle' === vertical) {
                point0 = [(left-width),(top-height/2)];
                point1 = [(left),(top-height/2)];
                point2 = [(left),(top+height/2)];
                point3 = [(left-width),(top+height/2)];
            } else if ('bottom' === vertical) {
                point0 = [(left-width),(top)];
                point1 = [left, top];
                point2 = [(left),(top+height)];
                point3 = [(left-width),(top+height)];
            }
        } else if ('middle' === horizontal) {
            if('top' === vertical) {
                point0 = [(left-width/2),(top-height)];
                point1 = [(left+width/2),(top-height)];
                point2 = [(left+width/2),(top)];
                point3 = [(left-width/2),(top)];
            } else if ('middle' === vertical) {
                point0 = [(left-width/2),(top-height/2)];
                point1 = [(left+width/2),(top-height/2)];
                point2 = [(left+width/2),(top+height/2)];
                point3 = [(left-width/2),(top+height/2)];
            } else if ('bottom' === vertical) {
                point0 = [(left-width/2),(top)];
                point1 = [(left+width/2),(top)];
                point2 = [(left+width/2),(top+height)];
                point3 = [(left-width/2),(top+height)];
            }
        } else if ('right' === horizontal) {
            if('top' === vertical) {
                point0 = [(left),(top-height)];
                point1 = [(left+width),(top-height)];
                point2 = [(left+width),(top)];
                point3 = [left, top];
            } else if ('middle' === vertical) {
                point0 = [(left),(top-height/2)];
                point1 = [(left+width),(top-height/2)];
                point2 = [(left+width),(top+height/2)];
                point3 = [(left),(top+height/2)];
            } else if ('bottom' === vertical) {
                point0 = [left, top];
                point1 = [(left+width),(top)];
                point2 = [(left+width),(top+height)];
                point3 = [(left),(top+height)];
            }
        }
        points = [point0, point1, point2, point3];
        return points;
    },

     _getTipPoints: function(icon) {
        var gCenter = this.geometry._getCenterDomOffset();
        if (!gCenter) {return null;}
        var mapOffset = this.geometry.getMap().offsetPlatform();
        var dx = Z.Util.setDefaultValue(icon['dx'],0);
        var dy = Z.Util.setDefaultValue(icon['dy'],0);
        var left = gCenter['left']+mapOffset['left'] + dx;
        var top = gCenter['top']+mapOffset['top'] + dy;

        var height = icon['height'];
        var width = icon['width'];
        if(!icon['shieldType']) {
            width = Z.Util.setDefaultValue(icon['textWidth'],0);
            height = Z.Util.setDefaultValue(icon['size'], 12);
        }
        var content = icon['content'];
        var fontSize = icon['size'];
        var size = fontSize/2;
        var lineSpacing = icon['lineSpacing'];
        var textWidth = Z.Util.getLength(content)*size;
        var rowNum = 0;
        if(textWidth>width){
            rowNum = Math.ceil(textWidth/width);
        }
        height += rowNum*((fontSize+lineSpacing)/2);
        width += fontSize;
        var points = [];
        var point0,point1,point2,point3,point4,point5,point6;
        var horizontal = icon['horizontal'];//水平
        if(!horizontal) horizontal = 'middle';
        var vertical = icon['vertical'];//垂直
        if(!vertical) vertical = 'top';
        if ('left' === horizontal) {
            var arrowWidth = arrowHeight = height/2;
            if('top' === vertical) {
                point0 = [(left-width-arrowWidth),(top-height)];
                point1 = [(left-arrowWidth),(top-height)];
                point2 = [(left-arrowWidth),(top-arrowHeight)];
                point3 = [left, top];
                point4 = [left, top];
                point5 = [left, top];
                point6 = [(left-width-arrowWidth),(top)];
            } else if ('middle' === vertical) {
                point0 = [(left-width-arrowWidth),(top-height/2)];
                point1 = [(left-arrowWidth),(top-height/2)];
                point2 = [(left-arrowWidth),(top-arrowHeight/2)];
                point3 = [left, top];
                point4 = [(left-arrowWidth),(top+arrowHeight/2)];
                point5 = [(left-arrowWidth),(top+height/2)];
                point6 = [(left-width-arrowWidth),(top+height/2)];
            } else if ('bottom' === vertical) {
                point0 = [(left-width-arrowWidth),(top)];
                point1 = [left, top];
                point2 = [left, top];
                point3 = [left, top];
                point4 = [(left-arrowWidth),(top+arrowHeight)];
                point5 = [(left-arrowWidth),(top+height)];
                point6 = [(left-width-arrowWidth),(top+height)];
            }
        } else if ('middle' === horizontal) {
            var arrowWidth = Math.round(width/5);
            var arrowHeight = Math.round(height/2);
            if('top' === vertical
            || 'middle' === vertical) {
                point0 = [(left-Math.round(width/2)),(top-height-arrowHeight)];
                point1 = [(left+Math.round(width/2)),(top-height-arrowHeight)];
                point2 = [(left+Math.round(width/2)),(top-arrowHeight)];
                point3 = [(left+Math.round(arrowWidth/2)),(top-arrowHeight)];
                point4 = [left, top];
                point5 = [(left-Math.round(arrowWidth/2)),(top-arrowHeight)];
                point6 = [(left-Math.round(width/2)),(top-arrowHeight)];
            } else if ('bottom' === vertical) {
                point0 = [(left-Math.round(width/2)),(top+arrowHeight)];
                point1 = [(left-Math.round(arrowWidth/2)),(top+arrowHeight)];
                point2 = [left, top];
                point3 = [(left+Math.round(arrowWidth/2)),(top+arrowHeight)];
                point4 = [(left+Math.round(width/2)),(top+arrowHeight)];
                point5 = [(left+Math.round(width/2)),(top+height+arrowHeight)];
                point6 = [(left-Math.round(width/2)),(top+height+arrowHeight)];
            }
        } else if ('right' === horizontal) {
            var arrowWidth = arrowHeight = height/2;
            if('top' === vertical) {
                point0 = [(left+arrowWidth),(top-height)];
                point1 = [(left+width+arrowWidth),(top-height)];
                point2 = [(left+width+arrowWidth),(top)];
                point3 = [(left+arrowWidth), top];
                point4 = [left, top];
                point5 = [left, top];
                point6 = [(left+arrowWidth),(top-arrowHeight)];
            } else if ('middle' === vertical) {
                point0 = [left+arrowWidth, (top-height/2)];
                point1 = [(left+width+arrowWidth),(top-height/2)];
                point2 = [(left+width+arrowWidth),(top+height/2)];
                point3 = [(left+arrowWidth),(top+height/2)];
                point4 = [(left+arrowWidth),(top+arrowHeight/2)];
                point5 = [left, top];
                point6 = [(left+arrowWidth),(top-arrowHeight/2)];
            } else if ('bottom' === vertical) {
                point0 = [left+arrowWidth, top];
                point1 = [(left+width+arrowWidth),(top)];
                point2 = [(left+width+arrowWidth),(top+height)];
                point3 = [(left+arrowWidth),(top+height)];
                point4 = [(left+arrowWidth),(top+arrowHeight)];
                point5 = [left, top];
                point6 = [left, top];
            }
        }
        points = [point0, point1, point2, point3, point4, point5, point6];
        return points;
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
        return new Z.Point(left, top);
    },

    getGeoIcon: function() {
        if (this.iconSymbol)  {
            return this.iconSymbol;
        }
        if (this.shieldSymbol)  {
            return this.shieldSymbol;
        }
        if (this.geometry) {
            return this.geometry.getSymbol();
        }
    }
};
Z.Marker.SVG = Z.Painter.SVG.extend({
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
        var icon = this.iconSymbol;
        if(icon) {
            var url = icon['url'];
            if(url&&url.length>0) {
                var picMarker =  this.createPictureMarker();
                this.paintDomMarker(picMarker, layerContainer);
            }
            var markerType = icon['type'];
            if(markerType&&markerType.length>0) {
                this.paintVectorMarker();
            }
            var textName = icon['content'];
            if(textName&&textName.length>0) {
                this.paintTextMarker();
            }
        } else {
            icon = this.shieldSymbol;
            var shieldType = icon['shieldType'];
            if(shieldType&&shieldType.length>0) {
                this.paintShieldMarker();
            }
        }
        this._setZIndex(zIndex);
    },

    /**
     * 重绘图形，一般在地图放大缩小等需要重新计算图形坐标时调用
     * @param layer
     * @param config
     */
    refreshMarker:function() {
        var icon = this.iconSymbol;
        if(icon) {
            var url = icon['url'];
            if (url&&url.length>0) {
                if (!this.markerDom) {return;}
                var gCenter = this.getMarkerDomOffset();
                if (!gCenter) {return;}
                this.markerDom.style.left = gCenter[0] + "px";
                this.markerDom.style.top = gCenter[1] + "px";
                return;
            }
            var markerType = icon['type'];
            if(markerType&&markerType.length>0) {
                var vectorMarker = this._createVectorObj(icon);
                Z.SVG.refreshVector(this.vector, vectorMarker);
                return;
            }
            var textName = icon['content'];
            if(textName&&textName.length>0) {
                var vectorMarker = this._createTextObj(icon);
                Z.SVG.refreshTextVector(this.vector, vectorMarker);
                return;
            }
        } else {
            icon = this.shieldSymbol;
            var shieldType = icon['shieldType'];
            if(shieldType&&shieldType.length>0) {
               var shieldVector = this._createShieldObj(icon);
               var fontSize = icon['size'];
               var location = shieldVector['text']['location'];
               shieldVector['text']['location'][1] = location[1]+fontSize;
               Z.SVG.refreshShieldVector(this.vector, shieldVector);
            }
        }
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

    paintVectorMarker: function() {
        var icon = this.iconSymbol;
        var strokeSymbol = {
            'stroke': icon['stroke'],
            'strokeWidth': icon['strokeWidth'],
            'strokeDasharray': icon['strokeDasharray'],
            'strokeOpacity': icon['strokeOpacity']
        };
        var fillSymbol = {
            'fill': icon['fill'],
            'fillOpacity': icon['fillOpacity']
        };
        //矢量标注绘制
        var vectorMarker = this._createVectorObj(icon);
        this.drawVector(vectorMarker, strokeSymbol, fillSymbol);
    },

    /**
     * 生成矢量标注
     * @param gCenter
     * @returns
     */
    _createVectorObj: function(icon) {
        var gCenter = this.geometry._getCenterDomOffset();
        if (!gCenter) {return null;}
        //矢量标注
        var markerType = icon['type'];
        var width = icon['width'];
        var height = icon['height'];
        var radius = (width + height)/2;
        var svgBean = null;
        var points = this.getVectorArray([gCenter['left'], gCenter['top']]);
        if ('circle' === markerType) {
            var path = null;
            if (Z.Browser.vml) {
                path ='AL ' + gCenter[0]+','+gCenter[1] + ' ' + radius + ',' + radius + ' 0,' + (65535 * 360) + ' x';
            } else {
                path = 'M'+gCenter[0]+','+gCenter[1]+' a'+radius+','+radius+' 0,1,0,0,-0.9 Z';
            }
            svgBean = {
                'type' : 'path',
                'path' : path
            };
        } else if ('triangle' === markerType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         Z.SVG.closeChar
            };
        }  else if ('cross' === markerType || 'x' === markerType || 'X' === markerType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'M'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]
            };
        } else if ('diamond' === markerType || 'square' === markerType || 'bar' === markerType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]+ ' ' +
                         Z.SVG.closeChar
            };
        } else if ('tip' === markerType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]+ ' ' +
                         'L'+points[4][0]+','+points[4][1]+ ' ' +
                         'L'+points[5][0]+','+points[5][1]+ ' ' +
                         'L'+points[6][0]+','+points[6][1]+ ' ' +
                         Z.SVG.closeChar
            };
        }
        if (Z.Browser.vml && svgBean) {
            svgBean['path'] += ' e';
        }
        return svgBean;
    },

     /**
     * 生成标签矢量对象
     * @param gCenter
     * @returns
     */
    _createLabelVectorObj: function(icon) {
        var svgBean = null;
        var points = this.getLabelVectorArray(icon);
        var labelType = icon['shieldType'];
        if ('label' === labelType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]+ ' ' +
                         Z.SVG.closeChar
            };
        } else if ('tip' === labelType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]+ ' ' +
                         'L'+points[4][0]+','+points[4][1]+ ' ' +
                         'L'+points[5][0]+','+points[5][1]+ ' ' +
                         'L'+points[6][0]+','+points[6][1]+ ' ' +
                         Z.SVG.closeChar
            };
        }
        if (Z.Browser.vml && svgBean) {
            svgBean['path'] += ' e';
        }
        return svgBean;
    },

    paintTextMarker: function() {
        var iconSymbol = this.iconSymbol;
        //文本标注绘制
        iconSymbol['content'] = this._convertContent(iconSymbol);
        var textMarker = this._createTextObj(iconSymbol);
        this.drawTextVector(textMarker, iconSymbol);
    },

    _createTextObj: function(icon) {
        var svgBean = {};
        var location = this.getTextVectorLocation(icon);
        var textPoint = {
            'location': location,
            'content': icon['content']
        };
        svgBean['text'] = textPoint;
        return svgBean;
    },

    _convertContent: function(icon) {
        var geometry = this.geometry;
        var props = geometry.getProperties();
        var content = icon['content'];
        if(content) {
            var regex = /\[.*\]/gi;
            if(regex.test(content)) {
                var arr = content.match(regex);
                if(arr&&arr.length>0) {
                    var key = arr[0].substring(1,arr[0].length-1);
                    if(props) {
                        if(props[key]) {
                            content = content.replace(regex, props[key]);
                        }
                    }
                }
            }
        }
        return content;
    },

    paintShieldMarker: function() {
        var shieldSymbol = this.shieldSymbol;
        var strokeSymbol = {
            'stroke': shieldSymbol['stroke'],
            'strokeWidth': shieldSymbol['strokeWidth'],
            'strokeDasharray': shieldSymbol['strokeDasharray'],
            'strokeOpacity': shieldSymbol['strokeOpacity']
        };
        var fillSymbol = {
            'fill': shieldSymbol['fill'],
            'fillOpacity': shieldSymbol['fillOpacity']
        };

        shieldSymbol['content'] = this._convertContent(shieldSymbol);
        var shieldMarker = this._createShieldObj(shieldSymbol);
        this.drawShieldVector(shieldMarker, strokeSymbol, fillSymbol, shieldSymbol);
    },

    _createShieldObj: function(shieldSymbol) {
        var svgBean = {};
        var vector = this._createLabelVectorObj(shieldSymbol);
        svgBean = this._createTextObj(shieldSymbol);
        svgBean['path'] = vector['path'];
        return svgBean;
    },

    /**
     * 生成图片标注
     * @param gCenter
     * @returns {___anonymous51875_51903}
     */
    createPictureMarker: function() {
        var geometry = this.geometry;
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        var _graphicDom = null;
        var iconSymbol = this.getGeoIcon();
        if (!iconSymbol['url']) {
            iconSymbol['url'] = geometry.defaultIcon['url'];
        }
        _graphicDom = Z.DomUtil.createEl('span');
        _graphicDom.setAttribute('unselectable', 'on');
        //用gCenter的话，会出现标注图片无法显示的问题，原因未知
        _graphicDom.style.cssText = 'top:' + gCenter[1] + 'px;left:'+ gCenter[0]+
                'px;position: absolute; padding: 0px; margin: 0px; border: 0px;'+
                'text-align:center;vertical-align:bottom;-webkit-user-select: none;';

        var markerIcon = Z.DomUtil.createEl('img');
        markerIcon.originCss = 'border:none; position:absolute;top:0px;left:0px;'+
                'cursor:pointer;max-width:none;-webkit-user-select: none;';
        if (iconSymbol['width'] !== null && iconSymbol['width'] !== undefined) {
            markerIcon['width'] = parseInt(iconSymbol['width'],0);
        }
        if (iconSymbol['height'] !== null && iconSymbol['height'] !== undefined) {
            markerIcon['height'] = parseInt(iconSymbol['height'],0);
        }
        markerIcon.style.cssText = markerIcon.originCss;

        markerIcon.setAttribute('unselectable', 'on');

        var _this = geometry;
        markerIcon.onerror = function() {
            this.src = _this.defaultIcon['url'];

        };
        markerIcon.onabort = function() {
            this.src = markerIcon.src;
        };
        markerIcon.src = iconSymbol['url'];
        //相对地址转化成绝对地址
        iconSymbol['url'] = markerIcon.src;

        geometry.markerIcon = markerIcon;
        _graphicDom.appendChild(markerIcon);
        this._setZIndex(geometry,this.zIndex);
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

    _registerEvents:function(){
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
        var offsets = geometry._transformToOffset(geometry._getPrjPoints());
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
        var prjHoles = geometry._getPrjHoles();
        var result = [];
        for (var i=0,len=prjHoles.length;i<len;i++) {
            var holeOffset = geometry._transformToOffset(prjHoles[i]);
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
        var offsets = geometry._transformToOffset(geometry._getPrjPoints());
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
        var domCenter = geometry._getCenterDomOffset();
        var pr = this.getPixelSize();
        var direction = 0;
        var start = (domCenter['left']-pr['width'])+','+domCenter['top'];
        var path = 'M'+start+' a'+pr['width']+','+pr['height']+' 0,1,'+direction+',0,-0.9Z';
        if (Z.Browser.vml) {
            path ='AL ' + start + ' ' + pr['width'] + ',' + pr['height'] + ' 0,' + (65535 * 360) + ' x ';
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
        var domCenter = geometry._getCenterDomOffset();
        var pr = this.getPixelSize();
        var ret = {
            type : "path",
            path : sector_update(domCenter['left'],domCenter['top'],pr['width'],geometry.getStartAngle(),geometry.getEndAngle())
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
        var domNw = map._transformToOffset(geometry._getPNw());
        var pr = this.getPixelSize();
        var start = domNw['left']+','+domNw['top'];
        var path = 'M'+start+' L'+(domNw['left']+pr['width'])+','+domNw['top']+
            ' L'+(domNw['left']+pr['width'])+','+(domNw['top']+pr['height'])+
            ' L'+domNw['left']+','+(domNw['top']+pr['height'])+
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
     * @param  {[type]} context       [Canvas Context]
     * @param  {[type]} resources [图片资源缓存]
     * @return {[type]}           [description]
     */
    doPaint:function(context, resources) {
        var geometry = this.geometry;
        if (!geometry) {
            return;
        }
        var map = geometry.getMap();
        if (!map) {
            return;
        }
        var offset = this.getMarkerDomOffset();
        var mapOffset = map.offsetPlatform();
        var pt = map._domOffsetToScreen(new Z.Point(offset[0], offset[1]));
        var icon = this.getGeoIcon();
        if(icon) {
            var url = icon['url'];
            if(url&&url.length>0) {
                this.paintPictureMarker(context, pt, icon,resources);
                return;
            }
            var markerType = icon['type'];
            if(markerType&&markerType.length>0) {
                pt = geometry._getCenterDomOffset();
                pt = new Z.Point(pt['left']+mapOffset['left'], pt['top']+mapOffset['top']);
                this.paintVectorMarker(context, pt);
                return;
            }
            var shieldType = icon['shieldType'];
            if(shieldType&&shieldType.length>0) {
                this.paintShieldMarker(context, pt);
                return;
            }
            var textName = icon['content'];
            if(textName&&textName.length>0) {
                this.paintTextMarker(context, pt);
                return;
            }
        }
    },

    paintPictureMarker:function(context, pt, icon, resources) {
        var url = icon['url'];
        var img = resources.getImage(url);
        var ratio = Z.Browser.retina ? 2:1;
        var left = pt.left*ratio;
        var top = pt.top*ratio;
        var width = icon['width']*ratio;
        var height = icon['height']*ratio;
        icon['url'] = img['src'];
        if (width && height) {
            context.drawImage(img,left,top,width,height);
         } else {
            context.drawImage(img,left,top);
         }
         return pt;
    },

    paintVectorMarker: function(context, pt) {
        //矢量标注
        var icon = this.getGeoIcon();
        //矢量标注
        var markerType = icon['type'];
        if(!markerType) {
            markerType = 'circle';
        }
        var width = icon['width'];
        var height = icon['height'];
        var radius = (width + height)/2;
        context.beginPath();
        if ('circle' === markerType) {
            context.arc(pt.left,pt.top,radius,0,2*Math.PI);
            context.stroke();
            this.fillGeo(context, this.fillSymbol);
        } else {
            var points = this.getVectorArray([pt.left, pt.top]);
            this._drawVector(context, markerType, points);
            this._fillColor(context, icon);
        }
    },

    _drawVector: function(context, markerType, points) {
        if ('triangle' === markerType
                || 'diamond' === markerType
                || 'square' === markerType
                || 'bar' === markerType
                || 'label' === markerType
                || 'tip' === markerType) {
             context.moveTo(points[0][0],points[0][1]);
             for (var i = 1, len = points.length;i<len;i++) {
                 context.lineTo(points[i][0],points[i][1]);
             }
             context.closePath();
             context.stroke();
        }  else if ('cross' === markerType || 'x' === markerType || 'X' === markerType) {
            context.moveTo(points[0][0],points[0][1]);
            context.lineTo(points[1][0],points[1][1]);
            context.moveTo(points[2][0],points[2][1]);
            context.lineTo(points[3][0],points[3][1]);
            context.stroke();
        }
    },

    _fillColor: function(context, icon) {
        var stroke = (!icon['stroke'])?'#000000':icon['stroke'];
        var strokeWidth = icon['strokeWidth'];
        var strokeOpacity = (!icon['strokeOpacity'])?1:icon['strokeOpacity'];
        var fill = (!icon['fill'])?'#ffffff':icon['fill'];
        var fillOpacity = (!icon['fillOpacity'])?1:icon['fillOpacity'];
        //绘制背景
        if (fill) {
            context.fillStyle =this.getRgba(fill);
            context.fill();
        }
        if (stroke) {
            context.lineWidth = strokeWidth;
            context.strokeStyle = this.getRgba(stroke,1);
            context.stroke();
        }
    },

    paintTextMarker: function(context, pt) {
        var icon = this.getGeoIcon();
        var content = this._convertContent(icon);
        if (Z.Util.isNil(content)) {return null;}
        var fontSize = 12;
        var color = 'rgba(0,0,0,1)';
        var stroke = null;
        var strokewidth = null;

        var cssText = '';
        if (!Z.Util.isNil(icon['size'])) {
            fontSize = icon['size'];
        }
        cssText += ' '+fontSize+'px';
        if (icon['font']) {
            cssText += ' ' + icon['font'];
        } else {
            cssText += ' arial';
        }
        context.font =  cssText;

        var padding = icon['padding'];
        if (Z.Util.isNil(padding)) {padding = 8;}

        var fontSize = (!icon['size'])?12:icon['size'];
        var width = icon['textWidth'];
        var padding = (!icon['padding'])?0:icon['padding'];
        var lineSpacing = (!icon['lineSpacing'])?8:icon['lineSpacing'];
        var size = fontSize/2;
        var realTextWidth = Z.Util.getLength(content)*size;

        var height = icon['height'];
        var width = icon['width'];
        var textWidth = icon['textWidth'];
        if(textWidth>width) {
            width = textWidth;
        }
        var rowNum = 1;
        if(textWidth>width){
            rowNum = Math.ceil(textWidth/width)/2;
        }
        var labelHeight = height + rowNum*(fontSize+lineSpacing);
        var labelWidth = width + fontSize;

        var contents = [];
        if(realTextWidth>width){
             contents = Z.Util.splitContent(content, realTextWidth, size, width);
        } else {
            contents.push(content);
        }

        var shieldType = icon['shieldType'];
        if(shieldType) {
            var points = this.getLabelVectorArray(icon);
            this._drawVector(context, shieldType, points);
            this._fillColor(context, icon);
        }
        if (icon['color']) {
             color = this.getRgba(icon['color'], 1);
        }
        pt = this.getTextVectorLocation(icon);
        for (var i=0,len=contents.length;i<len;i++) {
            //绘制文字
            if (color) {
                context.fillStyle = color;
                context.fillText(contents[i], pt[0], pt[1]+i*(fontSize));
            }
        }
    },

    paintShieldMarker: function(context, pt) {
        this.paintTextMarker(context, pt);
    },

    _convertContent: function(icon) {
        var geometry = this.geometry;
        var props = geometry.getProperties();
        var content = icon['content'];
        if(content) {
            var regex = /\[.*\]/gi;
            if(regex.test(content)) {
                var arr = content.match(regex);
                if(arr&&arr.length>0) {
                    var key = arr[0].substring(1,arr[0].length-1);
                    if(props) {
                        if(props[key]) {
                            content = content.replace(regex, props[key]);
                        }
                    }
                }
            }
        }
        return content;
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
        return this.paintTextMarker(testContext,new Z.Point(0,0),true);
    }
});
Z.Vector.Canvas = Z.Painter.Canvas.extend({
    paintPrjPoints:function(context, prjRings, platformOffset) {
        if (!Z.Util.isArrayHasData(prjRings)) {return;}
        // var map = this.geometry.getMap();
        var offsets = this.geometry._transformToOffset(prjRings);
        for (var i=0, len=offsets.length;i<len;i++) {
            var pt = new Z.Point(
                    Z.Util.canvasNumber(offsets[i]['left']+platformOffset['left']),
                    Z.Util.canvasNumber(offsets[i]['top']+platformOffset['top'])
                );
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
        var points = geometry._getPrjPoints();
        context.beginPath();
        this.paintPrjPoints(context,points,platformOffset);
        context.stroke();
    }
});
Z.Polygon.Canvas = Z.Vector.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var points = geometry._getPrjPoints();
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
        var center = geometry._getCenterDomOffset();
        var pt = new Z.Point(center["left"]+platformOffset['left'],center["top"]+platformOffset['top']);
        var pr = this.getPixelSize();
        var width = pr['width'];
        var height = pr['height'];
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
        var nw = map._transformToOffset(geometry._getPNw());
        var pixelSize = this.getPixelSize();
        var pt = new Z.Point(nw["left"]+platformOffset['left'],nw["top"]+platformOffset['top']);
        context.beginPath();
        context.rect(Z.Util.canvasNumber(pt.left), Z.Util.canvasNumber(pt.top),Z.Util.canvasNumber(pixelSize['width']),Z.Util.canvasNumber(pixelSize['height']));
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
        var center = geometry._getCenterDomOffset();
        var pt = new Z.Point(center["left"]+platformOffset['left'],center["top"]+platformOffset['top']);
        var pr = this.getPixelSize();
        this.sector(context, pt['left'],pt['top'],pr['width'],geometry.getStartAngle(),geometry.getEndAngle());
        context.stroke();
        this.fillGeo(context, this.fillSymbol);

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
            var painter = geometries[i]._getPainter();
            if (painter) {painter.paint.apply(painter,arguments);}
        }
    },

    remove:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter.remove.apply(painter,arguments);}
        }
    },

    _setZIndex:function(change) {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter._setZIndex.apply(painter,arguments);}
        }
    },

    show:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter.show.apply(painter,arguments);}
        }
    },

    hide:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter.hide.apply(painter,arguments);}
        }
    },

    refresh:function(){
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            painter.setSymbol(this.geometry.getSymbol());
            if (painter) {painter.refresh.apply(painter,arguments);}
        }
    },

    refreshSymbol:function(){
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            painter.setSymbol(this.geometry.getSymbol());
            if (painter) {painter.refreshSymbol.apply(painter,arguments);}
        }
    },

    _registerEvents:function() {
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
        if (!map._panels.editorContainer) {
            var editorContainer = Z.DomUtil.createEl("div");
            //editorContainer.id = "editorContainer";
            editorContainer.style.cssText="position:absolute;top:0px;left:0px;z-index:2000;";
            map._panels.mapPlatform.appendChild(editorContainer);
            map._panels.editorContainer = editorContainer;
        }

        this._container = map._panels.editorContainer;
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
        var _containerDOM = this.map._containerDOM;
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
                                var mousePos = Z.DomUtil.getEventDomCoordinate(ev,_containerDOM);
                                var handleDomOffset = editor.map._screenToDomOffset(mousePos);
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
        var pxCenter = map._transformToOffset(geometry._getPCenter());
        //------------------------拖动标注--------------------------
        this.createHandle(pxCenter, {
                        tip:"拖动以移动图形",
                        onDown:function() {
                            if (opts.onDown) {
                                opts.onDown.call(this);
                            }
                        },
                        onMove:function(handleDomOffset) {
                            var pcenter = map._untransformFromOffset(handleDomOffset);
                            geometry._setPCenter(pcenter);
                            geometry._updateCache();
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
                            return map._transformToOffset(geometry._getPCenter());
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
            var pxCenter = map._transformToOffset(geometry._getPCenter());
            var r = geometry.getRadius();
            var p = map.distanceToPixel(r,0);
            var rPx= new Z.Point(pxCenter['left']+p['width'],pxCenter['top']);// {'left':pxCenter['left']+p['width'],'top':pxCenter['top']};
            return rPx;
        }
        var rPx = radiusHandleOffset();
        var radiusHandle = this.createHandle(rPx, {
                                tip:"拖动以调整圆形半径",
                                onMove:function(handleDomOffset) {
                                    var pxCenter = map._transformToOffset(geometry._getPCenter());
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
            var pxCenter = map._transformToOffset(geometry._getPCenter());
            var rx = Math.round(geometry.getWidth()/2);
            var rh = Math.round(geometry.getHeight()/2);
            var p = map.distanceToPixel(rx,rh);
            var rPx={'left':pxCenter['left']+p['width'],'top':pxCenter['top']+p['height']};
            return rPx;
        }
        //this.createCenterEditor();
        var rPx = radiusHandleOffset();
        var rHandle = this.createHandle(rPx, {
                                tip:"拖动以调整椭圆大小",
                                onMove:function(handleDomOffset) {
                                    var pxCenter = map._transformToOffset(geometry._getPCenter());
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
            var pxNw = map._transformToOffset(geometry._getPNw());
            var rw = Math.round(geometry.getWidth());
            var rh = Math.round(geometry.getHeight());
            var p = map.distanceToPixel(rw,rh);
            var rPx= new Z.Point(pxNw['left']+p['width'],pxNw['top']+p['height']);//{'left':pxNw['left']+p['width'],'top':pxNw['top']+p['height']};
            return rPx;
        }

        var rPx = radiusHandleOffset();
        var rHandle = this.createHandle(rPx, {
                                tip:"拖动以调整矩形大小",
                                onMove:function(handleDomOffset) {
                                    var pxNw = map._transformToOffset(geometry._getPNw());
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
        var pxNw = map._transformToOffset(geometry._getPNw());
        //------------------------拖动标注--------------------------
        this.createHandle(pxNw, {
            tip:"拖动以移动图形",
            onDown:function() {
                rHandle.style.display='none';
            },
            onMove:function(handleDomOffset) {
                var pnw = map._untransformFromOffset(handleDomOffset);
                geometry._setPNw(pnw);
                geometry._updateCache();
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
                return map._transformToOffset(geometry._getPNw());
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
            if (geometry instanceof Z.Polygon) {
                return geometry.getPrjShell();
            } else if (geometry instanceof Z.Polyline) {
                return geometry.getPrjPath();
            }
        }
        function createVertexHandle(vertex) {
            //vertex是个引用
            var pxVertex = map._transformToOffset(vertex);
            //------------------------拖动标注--------------------------
            var handle = this.createHandle(pxVertex, {
                            tip:"拖动以调整"+title+"顶点",
                            onMove:function(handleDomOffset) {
                                hideCloseHandle();
                                var nVertex = map._untransformFromOffset(handleDomOffset);
                                vertex.x = nVertex.x;
                                vertex.y = nVertex.y;
                                geometry._updateCache();
                                geometry._onShapeChanged();
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
                                return map._transformToOffset(vertex);
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
                geometry._updateCache();
                geometry._onShapeChanged();
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
            var pcenter = map._getProjection().project(center);
            return map._transformToOffset(pcenter);
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
                                var dragged = new Z.Point(
                                        handleDomOffset['left']+5-pxCenter['left'],
                                        handleDomOffset['top']+5-pxCenter['top']
                                    );
                                //TODO 移动vertex,重新赋值points
                                var lonlats = getLonlats();
                                for (var i=0,len=lonlats.length;i<len;i++) {
                                    var vo = map._transformToOffset(lonlats[i]);
                                    //{'left':vo['left']+dragged['left'], 'top':vo['top']+dragged['top']}
                                    var n = map._untransformFromOffset(new Z.Point(vo['left']+dragged['left'], vo['top']+dragged['top']));
                                    lonlats[i].x = n.x;
                                    lonlats[i].y = n.y;
                                }
                                geometry._updateCache();
                                geometry._onPositionChanged();
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
        tmpHandle = this.createHandleDom(new Z.Point(0,0),{
                            tip:'点击后增加节点',
                            cursor:'pointer'
                        });
        tmpHandle.style.display='none';
        var pxTolerance = 2;
        Z.DomUtil.addDomEvent(tmpHandle,'click',function(event) {
                            //临时编辑按钮的点击
                            var handleDomOffset = Z.DomUtil.offsetDom(tmpHandle);
                            var res = map._getTileConfig()['resolutions'][map.getZoomLevel()];
                            var plonlat = map._untransformFromOffset(new Z.Point(handleDomOffset['left']+5,handleDomOffset['top']+5));
                            var interIndex = Z.GeoUtils._isPointOnPath(plonlat, geometry, pxTolerance*res);
                            if (interIndex >= 0) {
                                vertexHandles.splice(interIndex+1,0,createVertexHandle.call(this,plonlat));
                                lonlats.splice(interIndex+1,0,plonlat);
                                geometry._setPrjPoints(lonlats);
                                geometry._updateCache();
                                this.fireEditEvent('shapechanged');
                            }
                        },this);

        Z.DomUtil.addDomEvent(map._containerDOM,'mousemove',function(event) {
                        var res = map._getTileConfig()['resolutions'][map.getZoomLevel()];
                        var eventOffset = Z.DomUtil.getEventDomCoordinate(event,map._containerDOM);
                        var plonlat = map._untransform(eventOffset);
                        var tolerance = pxTolerance*res;
                        var interIndex = Z.GeoUtils._isPointOnPath(plonlat, geometry,tolerance);
                        var prjPoints = getLonlats();
                        //不与端点重叠,如果重叠则不显示
                        if (interIndex >= 0 && !isPointOverlapped(plonlat,prjPoints[interIndex],tolerance) && !isPointOverlapped(plonlat,prjPoints[interIndex+1],tolerance)) {
                            var domOffset = map._screenToDomOffset(eventOffset);
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
        this._container.style.display="none";
    },

    /**
     * refesh及refresh之后的逻辑
     */
    onRefreshEnd:function() {
        this.refresh();
        this._container.style.display="";
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
        this._container.appendChild(handle);
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
Z['Map']=Z.Map=Z.Class.extend({

    includes: [Z.Eventable],

    options:{
        'enableMapSliding':true,
        'enableZoom':true,
        'enableInfoWindow':true,
        'zoomMode':'pointer',
        'supportCoordinateTypes':['gcj02','bd09ll','wgs94','pixel'],
        'coordinateType':'gcj02'
    },

    events:{
        LOAD_MAP:'loadmap',
        TILECONFIG_CHANGED:'tileconfigchanged',
        RESIZE:'resize'
    },

    //根据不同的语言定义不同的错误信息
    exceptionDefs:{
        'en-US':{
            'NO_BASE_TILE_LAYER':'Map has no baseTileLayer, pls specify a baseTileLayer by setBaseTileLayer method before loading.',
            'INVALID_TILECONFIG':'TileConfig of Map is invalid.',
            'INVALID_OPTION':'Invalid options provided.',
            'INVALID_CENTER':'Invalid Center',
            'INVALID_LAYER_ID':'Invalid id for the layer',
            'DUPLICATE_LAYER_ID':'the id of the layer is duplicate with another layer'
        },
        'zh-CN':{
            'NO_BASE_TILE_LAYER':'地图没有设置基础图层,请在调用Map.Load之前调用setBaseTileLayer设定基础图层',
            'INVALID_TILECONFIG':'LOD配置无效.',
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
    initialize:function(_container, options) {

        if (!options) {
            throw new Error(this.exceptions['INVALID_OPTION']);
        }

        if (!options['center']) {
            throw new Error(this.exceptions['INVALID_CENTER']);
        }

        this._loaded=false;
        this._container = _container;

        if (Z.Util.isString(this._container)) {
            this._containerDOM = document.getElementById(this._container);
        } else {
            this._containerDOM = _container;
        }


        //Layer of Details, always derived from baseTileLayer
        this._tileConfig=null;
        this._panels={};
        //Layers
        this._baseTileLayer=null;
        this._tileLayers=[];
        this._svgLayers=[];

        this._canvasLayers=[];
        this._dynLayers=[];
        //handler
        this._handlers = [];

        this._zoomLevel = options['zoomLevel'];
        delete options['zoomLevel'];
        this._maxZoomLevel = options['maxZoomLevel'];
        delete options['maxZoomLevel'];
        this._minZoomLevel = options['minZoomLevel'];
        delete options['minZoomLevel'];
        this._center = new Z.Coordinate(options['center']);
        delete options['center'];

        this._allowSlideMap = true;

        //坐标类型
        if (!Z.Util.isNil(options['coordinateType']) && Z.Util.searchInArray(options['coordinateType'], this.options['supportCoordinateTypes'])<0) {
            //默认采用GCJ02
            options['coordinateType'] = this.options['coordinateType'];
        }
        options = Z.Util.setOptions(this,options);
        this._initContainer();
    },

    /**
     * Load Map
     * @expose
     */
    /*Load:function(){
        if (this._loaded) {return;}
        if (!this._baseTileLayer || !this._baseTileLayer._getTileConfig) {
            throw new Error(this.exceptions['NO_BASE_TILE_LAYER']);
        }
        var tileConfig = this._baseTileLayer._getTileConfig();
        var _this=this;
        this._setTileConfig(tileConfig,function() {
            _this._Load();
        });
        return this;
    },*/

    isLoaded:function() {
        return this._loaded;
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
     * @expose
     */
    getSize:function() {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return this._getContainerDomSize();
        }
        return {
            'width' : this.width,
            'height' : this.height
        };
    },

    /**
     * 获取地图的Extent
     * @return {Extent} 地图的Extent
     * @expose
     */
    getExtent:function() {
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return null;
        }
        var projection = this._getProjection();
        if (!projection) {
            return null;
        }
        var res = this._tileConfig['resolutions'][this._zoomLevel];
        if (Z.Util.isNil(res)) {
            return null;
        }
        var size = this.getSize();
        var w = size['width']/2,
            h = size['height']/2;
        var prjCenter = this._getPrjCenter();
        var point1 = projection.unproject({x:prjCenter.x - w*res, y:prjCenter.y + h*res});
        var point2 = projection.unproject({x:prjCenter.x + w*res, y:prjCenter.y - h*res});
        return new Z.Extent(point1,point2);
    },

    /**
     * 获取地图的中心点
     * @return {Coordinate} 坐标
     * @expose
     */
    getCenter:function() {
        if (!this._tileConfig || !this._loaded) {return this._center;}
        var projection = this._tileConfig.getProjectionInstance();
        return projection.unproject(this._prjCenter);
    },

    /**
     * 设置地图中心点
     * @param {Coordinate} center [新的中心点坐标]
     * @expose
     */
    setCenter:function(center) {
        if (!this._tileConfig || !this._loaded) {
            this._center = center;
            return this;
        }
        var projection = this._getProjection();
        var _pcenter = projection.project(center);
        var span = this._getPixelDistance(_pcenter);
        this._setPrjCenter(_pcenter);
        this.offsetPlatform(span);
        this._onMoveEnd();
        return this;
    },

    _onMoving:function(param) {
        var map = this;
        function movingLayer(layer) {
            if (layer) {
                layer._onMoving(param);
            }
        }

        //reduce refresh frequency
        if (2*Math.random() > 1) {map._refreshSVGPaper();}
        if (map._baseTileLayer) {map._baseTileLayer._onMoving();}
        map._eachLayer(movingLayer, map._svgLayers);
        map._fireEvent('moving');
    },

    _onMoveEnd:function(param) {
        function endMoveLayer(layer) {
            if (layer) {
                layer._onMoveEnd(param);
            }
        }
        var me=this;
        if (me._baseTileLayer) {me._baseTileLayer._onMoveEnd();}
        me._refreshSVGPaper();
        me._eachLayer(endMoveLayer,me._tileLayers,me._canvasLayers,me._dynLayers);
        me._fireEvent('moveend');
    },

    /**
     * 获取指定的投影坐标与当前的地图中心点的像素距离
     * @param  {Coordinate} _pcenter 像素坐标
     * @return {Point}          像素距离
     */
    _getPixelDistance:function(_pcenter) {
        var _current = this._getPrjCenter();
        var curr_px = this._transform(_current);
        var _pcenter_px = this._transform(_pcenter);
        var span = new Z.Point((_pcenter_px['left']-curr_px['left']),(curr_px['top']-_pcenter_px['top']));
        return span;
    },

    /**
     * 获取地图的缩放级别
     * @return {Number} 地图缩放级别
     * @expose
     */
    getZoomLevel:function() {
        return this._zoomLevel;
    },

    /**
     * 设置地图的缩放级别
     * @param {Number} z 新的缩放级别
     * @expose
     */
    setZoomLevel:function(z) {
        this._zoom(z);
        return this;
    },

    /**
     * 获得地图最大放大级别
     * @return {Number} 最大放大级别
     * @expose
     */
    getMaxZoomLevel:function() {
        return this._maxZoomLevel;
    },

    /**
     * 设置最大放大级别
     * @param {Number} zoomLevel 最大放大级别
     * @expose
     */
    setMaxZoomLevel:function(zoomLevel) {
        var tileConfig = this._getTileConfig();
        if (zoomLevel > tileConfig['maxZoomLevel']) {
            zoomLevel = tileConfig['maxZoomLevel'];
        }
        this._maxZoomLevel = zoomLevel;
        return this;
    },

    /**
     * 获得地图最小放大级别
     * @return {Number} 最小放大级别
     * @expose
     */
    getMinZoomLevel:function() {
        return this._minZoomLevel;
    },

    /**
     * 设置最小放大级别
     * @param {Number} zoomLevel 最小放大级别
     * @expose
     */
    setMinZoomLevel:function(zoomLevel) {
        var tileConfig = this._getTileConfig();
        if (zoomLevel < tileConfig['minZoomLevel']) {
            zoomLevel = tileConfig['minZoomLevel'];
        }
        this._minZoomLevel=zoomLevel;
        return this;
    },

    /**
     * 放大地图
     * @expose
     */
    zoomIn: function() {
        this._zoom(this.getZoomLevel() + 1);
        return this;
    },

    /**
     * 地图缩小
     * @expose
     */
    zoomOut: function() {
        this._zoom(this.getZoomLevel() - 1);
        return this;
    },

    /**
     * 设置中心点并放大缩小
     * @param {Coordinate} center    [新的中心点]
     * @param {Number} zoomLevel [新的缩放级别]
     * @expose
     */
    setCenterAndZoom:function(center,zoomLevel) {
        if (!this._tileConfig || !this._loaded) {
            this._center = center;
            this._zoomLevel = zoomLevel;
            return this;
        }
        if (this._zoomLevel != zoomLevel) {
            this.setCenter(center);
            this._zoom(zoomLevel);
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
     * @expose
     */
    getFitZoomLevel: function(extent) {
        if (!extent && !(extent instanceof Z.Extent)) {
            return this._zoomLevel;
        }
        //点类型
        if (extent['xmin'] == extent['xmax'] && extent['ymin'] == extent['ymax']) {
            return this._maxZoomLevel;
        }
        try {
            var projection = this._getProjection();
            var x = Math.abs(extent["xmin"] - extent["xmax"]);
            var y = Math.abs(extent["ymin"] - extent["ymax"]);
            var projectedExtent = projection.project({x:x, y:y});
            var resolutions = this._getTileConfig()['resolutions'];
            var xz = -1;
            var yz = -1;
            for ( var i = this._minZoomLevel, len = this._maxZoomLevel; i < len; i++) {
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
                return this._maxZoomLevel;
            }
            return ret - 2;
        } catch (exception) {
            return this.getZoomLevel();
        }
    },

    /**
     * 返回基础地图图层
     * @return {TileLayer} [基础地图图层]
     * @expose
     */
    getBaseTileLayer:function() {
        return this._baseTileLayer;
    },

    /**
     * 设定地图的基础瓦片图层
     * @param  {TileLayer} baseTileLayer 瓦片图层
     * @expose
     */
    setBaseTileLayer:function(baseTileLayer) {
        if (!baseTileLayer) {
            //TODO 是否要抛出错误?
            return;
        }
        if (this._baseTileLayer) {
            this._removeBackGroundDOM();
            this._baseTileLayer._onRemove();
        }
        baseTileLayer._prepare(this,-1);
        this._baseTileLayer = baseTileLayer;
        var me = this;
        //删除背景
        this._baseTileLayer.on(baseTileLayer.events.LAYER_LOADED,function() {
            me._removeBackGroundDOM();
        });
        this._baseTileLayer._loadTileConfig(function() {
            var tileConfig = me._baseTileLayer._getTileConfig();
            var changed = me._setTileConfig(tileConfig);
            if (me._loaded) {
                me._baseTileLayer.load();
                if (changed) {
                    me._fireEvent(me.events.TILECONFIG_CHANGED);
                }
            } else {
                me._Load();
            }

        });
        return this;
    },

    /**
     * 获取图层
     * @param  {String} id 图层id
     * @return {Layer}  图层
     * @expose
     */
    getLayer:function(id) {
        if (!id || !this._layerCache || !this._layerCache[id]) {
            return null;
        }
        return this._layerCache[id];
    },

    /**
     * 向地图里添加图层
     * @param  {Layer} layer 图层对象
     * @expose
     */
    addLayer:function(layers){
        if (!layers) {
            return this;
        }
        if (!Z.Util.isArray(layers)) {
            return this.addLayer([layers]);
        }
        if (!this._layerCache) {
            this._layerCache = {};
        }
        for (var i=0,len=layers.length;i<len;i++) {
            var layer = layers[i];
            var id = layer.getId();
            if (Z.Util.isNil(id)) {
                throw new Error(this.exceptions['INVALID_LAYER_ID']+':'+id);
            }
            if (this._layerCache[id]) {
                throw new Error(this.exceptions['DUPLICATE_LAYER_ID']+':'+id);
            }
            this._layerCache[id] = layer;
            //DynamicLayer必须要放在前面, 因为dynamiclayer同时也是tilelayer, tilelayer的代码也同时会执行
            if (layer instanceof Z.DynamicLayer) {
                layer._prepare(this, this._dynLayers.length);
                this._dynLayers.push(layer);
                if (this._loaded) {
                    layer.load();
                }
            } else if (layer instanceof Z.TileLayer) {
                layer._prepare(this, this._tileLayers.length);
                this._tileLayers.push(layer);
                if (this._loaded) {
                    layer.load();
                }
            } else if (layer instanceof Z.VectorLayer) {
                if (layer.isCanvasRender()) {
                    // canvas render
                    layer._prepare(this, this._canvasLayers.length);
                    this._canvasLayers.push(layer);

                } else {
                    // svg render
                    layer._prepare(this,this._svgLayers.length);
                    this._svgLayers.push(layer);

                }
                if (this._loaded) {
                        layer.load();
                    }
            } else {
                continue;
            }

        }
        return this;
    },



    /**
     * 移除图层
     * @param  {Layer | id} layer 图层或图层id
     * @expose
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
        if (layer instanceof Z.VectorLayer) {
            if (layer.isCanvasRender()) {
                this._removeLayer(layer, this._canvasLayers);
            } else {
                this._removeLayer(layer, this._svgLayers);
            }
        } else if (layer instanceof Z.DynamicLayer) {
            this._removeLayer(layer, this._dynLayers);
        } else if (layer instanceof Z.TileLayer) {
            this._removeLayer(layer, this._tileLayers);
        }
        var id = layer.getId();
        delete this._layerCache[id];
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
            if (this._loaded) {
                layer._onRemove();
            }
            for (var j=0, jlen=layerList.length;j<jlen;j++) {
                if (layerList[j]._setZIndex) {
                    layerList[j]._setZIndex(layerList[j].baseZIndex+j);
                }
            }
        }
    },


    /**
     * [addHandler description]
     * @param {[type]} name         [description]
     * @param {[type]} HandlerClass [description]
     * @expose
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
     * @expose
     */
    getCoordinateType:function() {
        return this.options['coordinateType'];
    },

    /**
     * 设置地图的坐标类型
     * @param {String} coordinateType 坐标类型
     */
    setCoordinateType:function(coordinateType) {
        //判断coordinateType是否有效
        if (!coordinateType || Z.Util.searchInArray(coordinateType, this.options['supportCoordinateTypes'] < 0)) {
            return;
        }
        this.options['coordinateType'] = coordinateType;
        this._fireEvent('coordinatetypechanged');
    },


//------------------------------坐标转化函数-----------------------------
    /**
     * 将地理坐标转化为屏幕像素坐标
     * @param {Coordinate} 地理坐标
     * @return {Point}
     * @expose
     */
    coordinateToScreenPoint: function(coordinate) {
        var projection = this._getProjection();
        if (!coordinate || !projection) {return null;}
        var pCoordinate = projection.project(coordinate);
        return this._transformToOffset(pCoordinate);
    },

    /**
     * 将屏幕像素坐标转化为地理坐标
     * @param {screenPoint} 屏幕坐标
     * @return {coordinate} 地理坐标
     * @expose
     */
    screenPointToCoordinate: function(screenPoint) {
        //var domOffset = this._screenToDomOffset(screenPoint);
        var projection = this._getProjection();
        if (!screenPoint || !projection) {return null;}
        var pCoordinate = this._untransform(screenPoint);
        var coordinate = projection.unproject(pCoordinate);
        return coordinate;
    },
//-----------------------------------------------------------------------

    _onResize:function(resizeOffset) {
        this._offsetCenterByPixel(resizeOffset);
        this._refreshSVGPaper();
        function resizeLayer(layer) {
            if (layer) {
                layer._onResize();
            }
        }
        if (this._baseTileLayer) {this._baseTileLayer._onResize();}
        this._eachLayer(resizeLayer,this._getAllLayers());
    },

    _fireEvent:function(eventName, param) {
        if (!param) {
            param = {};
        }
        param['target']=this;
        this.fire(eventName,param);
    },

    _Load:function() {
        this._originZoomLevel = this._zoomLevel;

        this._initContainerWatcher();
        this._registerDomEvents();
        this._loadAllLayers();
        // this.callInitHooks();
        this._loaded = true;
        this._callOnLoadHooks();
        //this.fire('mapready',{'target':this});
    },

    _loadAllLayers:function() {
        function loadLayer(layer) {
            if (layer) {
                layer.load();
            }
        }
        if (this._baseTileLayer) {this._baseTileLayer.load();}
        this._eachLayer(loadLayer,this._getAllLayers());
    },

    _getAllLayers:function() {
        var result = [];
        return result.concat(this._tileLayers)
        .concat(this._canvasLayers)
        .concat(this._svgLayers)
        .concat(this._dynLayers);
    },

    _eachLayer:function(fn) {
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
    _showOverlayLayers:function() {
        this._panels.svgContainer.style.display="";
        this._panels.canvasLayerContainer.style.display="";
    },

    /**
     * 隐藏所有的Overlayer图层
     * @return {[type]} [description]
     */
    _hideOverlayLayers:function() {
        this._panels.svgContainer.style.display="none";
        this._panels.canvasLayerContainer.style.display="none";
        // me._panels.tipContainer.style.display="none";
    },

    _getTileConfig:function() {
        return this._tileConfig;
    },

    _getProjection:function() {
        var tileConfig = this._getTileConfig();
        if (tileConfig) {
            return tileConfig.getProjectionInstance();
        }
        return null;
    },

    /**
     * 设置地图的tileConfig
     * @param {TileConfig} tileConfig  新的tileConfig
     */
    _setTileConfig:function(tileConfig) {
        if (!tileConfig || !tileConfig.load) {
            throw new Error(this.exceptions['INVALID_TILECONFIG']);
        }
        //tileConfig相同,无需改变
        if (this._tileConfig && this._tileConfig.equals(tileConfig, this.getZoomLevel())) {
            // callbackFn(false);
            return false;
        }
        this._tileConfig = tileConfig;
        this._checkMapStatus();
        return true;
        // callbackFn(true);
        // tileConfig.load(function() {
        //     _this._checkMapStatus();
        //     callbackFn(true);
        // });
    },

    /**
     * TileConfig修改后检查当前地图状态是否吻合新的TileConfig规则
     * @return {[type]} [description]
     */
    _checkMapStatus:function(){
        if (!this._maxZoomLevel || this._maxZoomLevel > this._tileConfig['maxZoomLevel']) {
            this._maxZoomLevel = this._tileConfig['maxZoomLevel'];
        }
        if (!this._minZoomLevel || this._minZoomLevel < this._tileConfig['minZoomLevel']) {
            this._minZoomLevel = this._tileConfig['minZoomLevel'];
        }
        if (this._maxZoomLevel < this._minZoomLevel) {
            this._maxZoomLevel = this._minZoomLevel;
        }
        if (!this._zoomLevel || this._zoomLevel > this._maxZoomLevel) {
            this._zoomLevel = this._maxZoomLevel;
        }
        if (this._zoomLevel < this._minZoomLevel) {
            this._zoomLevel = this._minZoomLevel;
        }
        this._center = this.getCenter();
        var projection = this._tileConfig.getProjectionInstance();
        this._prjCenter = projection.project(this._center);
    },



    _getContainerDomSize:function(){
        if (!this._containerDOM) {return null;}
        var _containerDOM = this._containerDOM;
        var mapWidth = parseInt(_containerDOM.offsetWidth,0);
        var mapHeight = parseInt(_containerDOM.offsetHeight,0);
        return {
            width: mapWidth,
            height:mapHeight
        };
    },

    _setMapSize:function(mSize) {
        if (!mSize) {return;}
        this.width = mSize['width'];
        this.height = mSize['height'];
        var panels = this._panels;
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
    _getPrjCenter:function() {
        return this._prjCenter;
    },

    _setPrjCenter:function(pcenter) {
        this._prjCenter=pcenter;
    },

    /**
     * 移除背景Dom对象
     */
    _removeBackGroundDOM:function() {
        if (this._backgroundDOM) {
            this._backgroundDOM.innerHTML='';
            Z.DomUtil.removeDomNode(this._backgroundDOM);
            delete this._backgroundDOM;
        }
    },

    /**
     * 以像素距离移动地图中心点
     * @param  {Object} pixel 像素距离,偏移量的正负值关系如下:
     * -1,1|1,1
     *-1,-1|1,-1
     */
    _offsetCenterByPixel:function(pixel) {
        var posX = this.width/2+pixel['left'],
            posY = this.height/2+pixel['top'];
        var pCenter = this._untransform(new Z.Point(posX, posY));
        this._setPrjCenter(pCenter);
    },


    /**
     * 获取地图容器偏移量或增加容器的偏移量
     * @param  {Pixel} offset 增加的偏移量,如果为null,则直接返回容器的偏移量
     * @return {[type]}        [description]
     * @expose
     */
    offsetPlatform:function(offset) {
        if (!offset) {
            return Z.DomUtil.offsetDom(this._panels.mapPlatform);
        } else {
            var domOffset = Z.DomUtil.offsetDom(this._panels.mapPlatform);
            Z.DomUtil.offsetDom(this._panels.mapPlatform, new Z.Point(
                    domOffset['left']+offset['left'],
                    domOffset['top']+offset['top']
                ));
        }
    },



    /**
     * transform dom position to geodesic projected coordinate
     * @param  {Object} domPos    dom screen xy, eg {left:10, top:10}
     * @param  {Number} zoomLevel current zoomLevel
     * @return {Coordinate}           Coordinate
     */
    _untransform:function(domPos) {
        var transformation =  this._getTileConfig().getTransformationInstance();
        var res = this._tileConfig.getResolution(this.getZoomLevel());//['resolutions'][this._zoomLevel];

        var pcenter = this._getPrjCenter();
        var centerPoint = transformation.transform(pcenter, res);
        //容器的像素坐标方向是固定方向的, 和html标准一致, 即从左到右增大, 从上到下增大
        var point = [centerPoint[0]+ domPos['left'] - this.width / 2, centerPoint[1]+domPos['top'] - this.height / 2];
        var result = transformation.untransform(point, res);
        return new Z.Coordinate(result);
       /* var res = this._tileConfig.getResolution(this.getZoomLevel());//['resolutions'][this._zoomLevel];
        var pcenter = this._getPrjCenter();
        var y = pcenter.y + this.dy*(this.height / 2 - domPos['top'])* res;
        var x = pcenter.x + this.dx*(domPos['left'] - this.width / 2)* res;
        return new Z.Coordinate(x, y);*/
    },

    /**
     * 相对坐标转化为地理投影坐标
     * @param  {[type]} domPos [description]
     * @return {[type]}        [description]
     */
    _untransformFromOffset:function(domPos) {
        return this._untransform(this._domOffsetToScreen(domPos));
    },

    /**
     * transform geodesic projected coordinate to screen xy
     * @param  {[type]} pCoordinate [description]
     * @return {[type]}             [description]
     */
    _transform:function(pCoordinate) {
        var transformation =  this._getTileConfig().getTransformationInstance();
        var res = this._tileConfig.getResolution(this.getZoomLevel());//['resolutions'][this._zoomLevel];

        var pcenter = this._getPrjCenter();
        var centerPoint = transformation.transform(pcenter, res);

        var point = transformation.transform(pCoordinate,res);
        return new Z.Point(
            Math.round(this.width / 2 + point[0] - centerPoint[0]),
            Math.round(this.height / 2 + point[1] - centerPoint[1])
            );

       /* var res = this._tileConfig['resolutions'][this._zoomLevel];
        var pcenter = this._getPrjCenter();
        // var _canvasDom = this.canvasDom;
        var centerTop = this.dy*(pcenter.y - pCoordinate.y) / res;
        var centerLeft = this.dx*(pCoordinate.x - pcenter.x) /res;

        var result = {
            "top" : Math.round(this.height / 2 + centerTop),
            "left" : Math.round(this.width / 2 + centerLeft)
        };
        return result;*/
    },

    /**
     * 投影坐标转化为容器的相对坐标
     * @param  {Coordinate} pCoordinate 投影坐标
     * @return {Object}             容器相对坐标
     */
    _transformToOffset:function(pCoordinate) {
        var screenXY = this._transform(pCoordinate);
        return this._screenToDomOffset(screenXY);
    },

    /**
     * 屏幕坐标到地图容器偏移坐标
     *
     * @param screenXY
     * @returns {domOffset}
     */
    _screenToDomOffset: function(screenXY) {
        if (!screenXY) {return null;}
        var platformOffset = this.offsetPlatform();
        return new Z.Point(
                screenXY['left'] - platformOffset['left'],
                screenXY['top'] - platformOffset['top']
            );
    },

    /**
     * 地图容器偏移坐标到屏幕坐标的转换
     *
     * @param domOffset
     * @returns {screenXY}
     */
    _domOffsetToScreen: function(domOffset) {
        if (!domOffset) {return null;}
        var platformOffset = this.offsetPlatform();
        return new Z.Point(
                domOffset["left"] + platformOffset["left"],
                domOffset["top"] + platformOffset["top"]
            );
    },

    /**
     * 根据中心点投影坐标和像素范围,计算像素范围的Extent
     * @param  {Coordinate} plonlat [中心点坐标]
     * @param  {Object} pnw     [左上角像素距离]
     * @param  {Object} pse     [右下角像素距离]
     * @return {Extent}         [Extent计算结果]
     */
    _computeExtentByPixelSize: function(plonlat, pnw, pse) {
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return null;
        }
        var projection = tileConfig.getProjectionInstance();
        var res = tileConfig['resolutions'][this.getZoomLevel()];
        var nw = projection.unproject({x: plonlat.x - pnw["left"]*res, y: plonlat.y + pnw["top"]*res});
        var se = projection.unproject({x: plonlat.x + pse["left"]*res, y: plonlat.y - pse["top"]*res});
        return new Z.Extent(nw,se);
    },

    /**
     * 在当前比例尺下将距离转换为像素
     * @param  {double} x [description]
     * @param  {double} y [description]
     * @return {[type]}   [description]
     * @expose
     */
    distanceToPixel: function(x,y) {
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return null;
        }
        var projection = tileConfig.getProjectionInstance();
        if (!projection) {
            return null;
        }
        //计算前刷新scales
        var center = this.getCenter(),
            target = projection.locate(center,x,y),
            z = this.getZoomLevel(),
            resolutions = tileConfig['resolutions'];
        var width = !x?0:(projection.project({x:target.x,y:center.y}).x-projection.project(center).x)/resolutions[z];
        var height = !y?0:(projection.project({x:target.x,y:center.y}).y-projection.project(target).y)/resolutions[z];
        return new Z.Size(Math.round(Math.abs(width)), Math.round(Math.abs(height)));
    },

    /**
     * 像素转化为距离
     * @param  {[type]} width [description]
     * @param  {[type]} height [description]
     * @return {[type]}    [description]
     * @expose
     */
    pixelToDistance:function(width, height) {
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return null;
        }
        var projection = tileConfig.getProjectionInstance();
        if (!projection) {
            return null;
        }
        //计算前刷新scales
        var center = this.getCenter(),
            pcenter = this._getPrjCenter(),
            res = tileConfig['resolutions'][this.getZoomLevel()];
        var pTarget = {x:pcenter.x+width*res, y:pcenter.y+height*res};
        var target = projection.unproject(pTarget);
        return projection.getGeodesicLength(target,center);
    },

    /**
     * [createVectorPaper description]
     * @return {[type]} [description]
     */
    _createSVGPaper: function(){
        var map = this;
        if (map.vectorPaper) {return;}
        var svgContainer = this._panels.svgContainer;
        map.vectorPaper = Z.SVG.createContainer();
        this._refreshSVGPaper();
        svgContainer.appendChild(map.vectorPaper);
    },

    _refreshSVGPaper: function() {
        var map = this;
        var paper = map.vectorPaper;
        if (paper) {
            Z.SVG.refreshContainer(map,paper);
        }
    },

    /**
     * initialize _container DOM of panels
     */
    _initContainer:function() {
        var _containerDOM;
        if (Z.Util.isString(this._container)) {
            _containerDOM = document.getElementById(this._container);
            if (!_containerDOM) {
                throw new Error('invalid _container id: \''+this._container+'\'');
            }
        } else {
            if (!this._container || !this._container.appendChild) {
                throw new Error('invalid _container element');
            }
            _containerDOM = this._container;
        }
        this._containerDOM = _containerDOM;
        _containerDOM.innerHTML = '';

        var controlWrapper = Z.DomUtil.createEl('div');

        var _controlsContainer = Z.DomUtil.createEl('div');
        _controlsContainer.style.cssText = 'z-index:3002';
        controlWrapper.appendChild(_controlsContainer);
        //map wrapper定义了全局的背景色, hidden overflow等css属性
        var mapWrapper = Z.DomUtil.createEl('div');
        mapWrapper.style.cssText = 'position:absolute;overflow:hidden;';
        mapWrapper.className='MAP_TILE_BACK';
        _containerDOM.appendChild(mapWrapper);

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
        var panels = this._panels;
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
        this.offsetPlatform(new Z.Point(0,0));
        var mapSize = this._getContainerDomSize();
        this._setMapSize(mapSize);
    },

    /**
    * 获取地图容器
    */
    getPanels: function() {
        return this._panels.mapViewPort;
    },

    /**
     * 设置地图的watcher, 用来监视地图容器的大小变化
     */
    _initContainerWatcher:function() {
        var map = this;
        map._watcher = setInterval(function() {
            var watched = map._getContainerDomSize();
            if (map.width !== watched.width || map.height !== watched.height) {
                var oldHeight = map.height;
                var oldWidth = map.width;
                map._setMapSize(watched);
                map._onResize(new Z.Point((watched.width-oldWidth) / 2,(watched.height-oldHeight) / 2));
                // 触发_onResize事件
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
 * @expose
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

    /**
     * 将地图移动到指定的坐标
     * @param  {Coordinate} coordinate 指定的坐标
     * @expose
     */
    panTo:function(coordinate) {
        if (!Z.Util.isCoordinate(coordinate)) {
            return;
        }
        var projection = this._getProjection();
        var p = projection.project(coordinate);
        var span = this._getPixelDistance(p);
        this.panBy(span);
        return this;
    },

    /**
     * 按指定的像素距离移动地图
     * @param  {Point} point [description]
     * @expose
     */
    panBy:function(offset) {
        this.offsetPlatform(new Z.Point(offset['left'],offset['top']));
        this._offsetCenterByPixel(new Z.Point(-offset['left'],-offset['top']));
        this._fireEvent('moving');
        this._onMoveEnd({'target':this});
        return this;
    },

    _animatePan:function(moveOffset) {
        if (!moveOffset) {moveOffset = new Z.Point(0,0);}
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
            if (!_map._allowSlideMap) {
                _map._allowSlideMap = true;
                _map._onMoveEnd({'target':_map});
                return;
            }
            var ySpan = spanArr[counter].y;
            var xSpan = spanArr[counter].x;
            _map.offsetPlatform(new Z.Point(xSpan, ySpan)); //{'left':xSpan,'top':ySpan}
            _map._offsetCenterByPixel(new Z.Point(-xSpan, -ySpan)); //{'left':-xSpan,'top':-ySpan}
            counter++;
            // 每移动3次draw一次
            if (counter <= counterLimit - 1) {
                if (counter % 3 === 0) {
                    if (!Z.Browser.ie6) {
                       // _map.fire('moving',{'target':_map});
                       _map._onMoving({'target':_map});
                    }
                }
                setTimeout(slideMap, 8 + counter);
            } else {
                // 用setTimeout方式调用解决了地图滑动结束时，如果添加有动态图层，或者canvasLayer上有大量数据时，地图会发生顿卡现象的问题
                _map.dynLayerSlideTimeout = setTimeout(function() {
                    //_map._drawTileLayers();
                     _map._onMoveEnd({'target':_map});
                    _map.isBusy = false;
                },50);

            }

        }
    }

});

Z.Map.include({
    _onZoomStart:function(scale,focusPos,nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer._onZoomStart) {
                layer._onZoomStart();
            }
        }
        var me = this;

        if (me._baseTileLayer) {me._baseTileLayer._onZoomStart(true);}
        me._eachLayer(zoomLayer,me._getAllLayers());
        this._hideOverlayLayers();
        me._animateStart(scale,focusPos);
        me._fireEvent('zoomstart',{'target':this});
    },

    _onZoomEnd:function(nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer._onZoomEnd) {
                layer._onZoomEnd();
            }
        }

        this._insertBackgroundDom();
        if (this._baseTileLayer) {this._baseTileLayer.clear();}
        this._animateEnd();
        this._resetContainer();
        this._originZoomLevel=nextZoomLevel;
        if (this._baseTileLayer) {this._baseTileLayer._onZoomEnd();}
        this._eachLayer(zoomLayer,this._getAllLayers());
        this._showOverlayLayers();
        this._fireEvent('zoomend',{'target':this});
    },

    _resetContainer:function() {
        var position = this.offsetPlatform();
        Z.DomUtil.offsetDom(this._panels.mapPlatform, new Z.Point(0,0)); //{'left':0,'top':0}
        this._refreshSVGPaper();
        if (this._backgroundDOM) {
            //Z.DomUtil.offsetDom(this._backgroundDOM,position);
            this._backgroundDOM.style.left=position["left"]+"px";
            this._backgroundDOM.style.top=position["top"]+"px";
        }
    },

    _insertBackgroundDom:function() {
        this._backgroundDOM = this._panels.mapContainer.cloneNode(true);
        this._panels.mapPlatform.insertBefore(this._backgroundDOM,this._panels.mapViewPort);
    },

    _checkZoomLevel:function(nextZoomLevel) {
        if (nextZoomLevel < this._minZoomLevel){
            nextZoomLevel = this._minZoomLevel;
        }
        if (nextZoomLevel > this._maxZoomLevel) {
            nextZoomLevel = this._maxZoomLevel;
        }
        return nextZoomLevel;
    },

    _zoomOnDblClick:function(param) {
        var me = this;
        if (!me.options['enableZoom'])  {return;}
        function zoomLayer(layer) {
            if (layer) {
                layer._onZoomEnd();
            }
        }
        var mousePos = param['pixel'];
        var nextZoomLevel = me._checkZoomLevel(me._zoomLevel+1);
        if (nextZoomLevel === me._zoomLevel) {
            var move = new Z.Point((me.width/2-mousePos['left'])/2,(mousePos['top']-me.height/2)/2 );
            me._offsetCenterByPixel(move);
            me.offsetPlatform(move);

            if (me._baseTileLayer) {me._baseTileLayer._onZoomEnd();}
            me._eachLayer(zoomLayer,me._getAllLayers());
            return;
        }
        me._zoom(nextZoomLevel, param['pixel']);
    },

    _zoom:function(nextZoomLevel, focusPos) {
        if (!this.options['enableZoom']) {return;}
        this._allowSlideMap=false;
        nextZoomLevel = this._checkZoomLevel(nextZoomLevel);
        if (this._originZoomLevel === nextZoomLevel) {
            return;
        }
        this.zooming = true;
        if (!focusPos) {
            focusPos = new Z.Point(this.width/2, this.height/2);
        }
        this._removeBackGroundDOM();
        var resolutions=this._tileConfig['resolutions'];
        this._zoomLevel=nextZoomLevel;
        var scale = resolutions[this._originZoomLevel]/resolutions[nextZoomLevel];
        var pixelOffset;
        var zScale;
        if (nextZoomLevel<this._originZoomLevel) {
            zScale = resolutions[nextZoomLevel+1]/resolutions[nextZoomLevel];
            pixelOffset = new Z.Point(
                    -(focusPos['left']-this.width/2)*(1-zScale),
                    -(focusPos['top']-this.height/2)*(1-zScale)
                );
        } else {
            zScale = resolutions[nextZoomLevel-1]/resolutions[nextZoomLevel];
            pixelOffset = new Z.Point(
                    (focusPos['left']-this.width/2)*(zScale-1),
                    (focusPos['top']-this.height/2)*(zScale-1)
                );
        }
        this._offsetCenterByPixel(pixelOffset);
        this._onZoomStart(scale,focusPos,nextZoomLevel);
        var me = this;
        if (this.zoom_timeout) {
            clearTimeout(this.zoom_timeout);
        }
        this.zoom_timeout=setTimeout(function() {
            me.zooming = false;
            me._onZoomEnd(nextZoomLevel);
        },this._getZoomMillisecs());
    },

    _animateStart:function(scale,pixelOffset){
        if (Z.Browser.ielt9) {return;}
        var domOffset = this.offsetPlatform();
        var offsetTop = domOffset['top'];
        var offsetLeft = domOffset['left'];
        var mapContainer = this._panels.mapContainer;
        this._panels.mapContainer.className="MAP_ZOOM_ANIMATED";
        var origin = Z.DomUtil.getDomTransformOrigin(mapContainer);
        var originX = Math.round(this.width/2-offsetLeft),
            originY = Math.round(this.height/2-offsetTop);
        if ((origin===null || ""===origin) && pixelOffset) {
            var mouseOffset = new Z.Point(
                    pixelOffset.left-this.width/2,
                    pixelOffset.top-this.height/2
                );
            originX += mouseOffset["left"];
            originY += mouseOffset["top"];
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+"px "+ originY+"px");
        } else if (!pixelOffset) {
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+"px "+ originY+"px");
        }

        Z.DomUtil.setDomTransform(mapContainer," scale("+scale+","+scale+")");
    },


    _animateEnd:function() {
        if (Z.Browser.ielt9) {return;}
        var mapContainer = this._panels.mapContainer;
        mapContainer.className="";
        Z.DomUtil.setDomTransformOrigin(mapContainer,"");
        Z.DomUtil.setDomTransform(mapContainer,"");
        mapContainer.style.top=0+"px";
        mapContainer.style.left=0+"px";
    },

    _getZoomMillisecs:function() {
        return 150;
    }
});


/**
 * Map类的扩展:拓扑计算的相关方法
 */
Z.Map.include({
    /**
     * 计算两坐标间距离，计算结果单位为米，如果返回-1，则说明参数不合法
     *
     * @param lonlat1 {seegoo.maps.MLonLat|Object} 坐标1，例如{x:121,y:19}
     * @param lonlat2 {seegoo.maps.MLonLat|Object} 坐标2，例如{x:122,y:19}
     * @returns {Number}
     * @expose
     */
    computeDistance: function(lonlat1, lonlat2) {
        if (!Z.Util.isCoordinate(lonlat1) || !Z.Util.isCoordinate(lonlat2) || !this._getProjection()) {return null;}
        if (Z.Coordinate.equals(lonlat1,lonlat2)) {return 0;}
        return this._getProjection().getGeodesicLength(lonlat1, lonlat2);
    },

    /**
     * 计算Geometry的地理长度
     * @param  {Geometry} geometry [Geometry]
     * @return {Number}          [地理长度]
     * @expose
     */
    _computeGeodesicLength:function(geometry) {
        return geometry._computeGeodesicLength(this._getProjection());
    },

    /**
     * 计算Geometry的地理面积
     * @param  {Geometry} geometry [Geometry]
     * @return {Number}          [地理面积]
     * @expose
     */
    _computeGeodesicArea:function(geometry) {
        return geometry._computeGeodesicArea(this._getProjection());
    },

    /**
     * 计算Geometry的外缓冲，该功能需要引擎服务器版的支持
     *
     * @expose
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
        if (geometry instanceof Z.Marker) {
            result = new Z.Circle(me._center, distance);
            result.setSymbol(defaultOption);
            callback({
                "success" : true,
                "data" : result
            });
            return;
        } else if (geometry instanceof Z.Circle) {
            var radius = me.radius + distance;
            result = new Z.Circle(me._center, radius);
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
     * @expose
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
     * @param  {opts} opts 查询参数 {point: point, "layers": [], "successFn": fn}
     * @expose
     */
    identify: function(opts) {
        if (!opts) {
            return;
        }
        var layers = opts['layers'];
        if(!layers||layers.length===0) {
            return;
        }
        var point = opts.point;
        var fn = opts['success'];
        var hits = [];
        for (var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var layerId = layer.getId();

            if(!layer || !layer.getMap() || layerId.indexOf('mt__internal_layer') >= 0) {
                continue;
            }

            var allGeos = layers[i].getAllGeometries();
            for (var j=0, length = allGeos.length; j<length; j++) {
                var geo = allGeos[i];
                if (geo&&geo._containsPoint(point)) {
                    hits.push(geo);
                }
            }
        }
        fn.call(this, {success: hits.length > 0, data: hits});
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
            var rings = polygon.getShell();
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
            if(this._circleAndRingsIntersection(circle, paths)) {return true;}
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
            var projection = this._getProjection();
            if (!rect ||!projection) {return false;}
            var extent = rect._computeExtent(projection);
            if(Z.GeoUtils.isPointInRect(center, extent)) {return true;}
            if(this._circleAndRingsIntersection(circle, rect.getShell())) {return true;}
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
        if(this._isPointInCircle(circle.getCenter(), aCircle)) {return true;}
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
         var projection = this._getProjection();
         if (!projection) {
             return null;
         }
         if(!geometry){
             return false;
         }
         //TODO 这个circle是临时构造的，没有添加到任何图层上，但是computeVisualExtent需要map对象，而geometry也没有了
         //TODO setMap方法，所以目前只能使用computeExtent来该临时圆的外接矩形
         var cExtent = circle._computeExtent(projection);
         var geoExtent = geometry._computeVisualExtent(projection);
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
         var projection = this._getProjection();
         if (!projection) {
              return null;
         }
         var circleExtent = circle._computeExtent(projection);
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
        var projection = this._getProjection();
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
        var projection = this._getProjection();
        return projection.locate(vertex, x, y);
   },

   /**
  * 判断点是否在圆内
  * @param {Coordinate} point
  * @param {Circle} 圆
  * @return {Boolean} true：点在园内；false：点不在园内
  */
  _isPointInCircle: function(point, circle) {
       var projection = this._getProjection();
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
        var projection = this._getProjection();
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
       var projection = this._getProjection();
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
        var projection = this._getProjection();
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
        var projection = this._getProjection();
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
});

Z.Map.include({
   /**
    * 设置Map的右键菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @expose
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
        var pixel = Z.DomUtil.getEventDomCoordinate(event, this._containerDOM);
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
    * @expose
    */
    openMenu: function(coordinate) {
        if(!coordinate) {
            coordinate = this.showPostion;
        }
        if (this.menu)  {
            this.menu.showMenu(coordinate);
        }
        return this;
    },

   /**
    * 添加菜单项目
    * @param {Array} 菜单项数组
    * @expose
    */
    setMenuItem: function(items) {
        if (this.menu) {
            this.menu.setItems(items);
        }
        return this;
    },

    /**
    * 关闭右键菜单
    * @expose
    */
    closeMenu: function() {
        if (this.menu) {
            this.menu.close();
        }
    }
});

/**
 * 地图的事件处理
 * @type {Object}
 */
Z.Map.include({
	/**
    * 初始化地图事件
    * @param {Boolean} remove
    */
    _registerDomEvents: function(remove) {
        var events = 'mousedown mouseup ' +
            'mouseover mouseout mousemove click dblclick contextmenu keypress';
        if (remove) {
            Z.DomUtil.removeDomEvent(this._containerDOM, events, this._handleDOMEvent);
        } else {
            Z.DomUtil.addDomEvent(this._containerDOM, events, this._handleDOMEvent, this);
        }

    },

    _handleDOMEvent: function (e) {
        /*if (!this._loaded || Z.DomEvent._skipped(e)) { return; }

        // find the layer the event is propagating from
        var target = this._findEventTarget(e.target || e.srcElement),
            type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;

        // special case for map mouseover/mouseout events so that they're actually mouseenter/mouseleave
        if (!target && (type === 'mouseover' || type === 'mouseout') &&
                !Z.DomEvent._checkMouse(this._containerDOM, e)) { return; }

        // prevents outline when clicking on keyboard-focusable element
        if (type === 'mousedown') {
            Z.DomUtil.preventOutline(e.target || e.srcElement);
        }*/
        var type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;
        this._fireDOMEvent(this, e, type);
    },

    _fireDOMEvent: function (target, e, type) {
    	//TODO DOM事件参数属性应该统一起来
        var data = {
            'originalEvent': e
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

    enableDrag: function() {
        this['dragging'].draggable.enable();
    },

    disableDrag: function() {
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
});
Z.Map.include({
	/**
     * 截图
     * @param  {Object} config 截图设置
     * @expose
     */
    snap:function(config) {
        var callback = config['success'];
        var onErrorFn = config['error'];
        var extent = config['extent'];
        var zoomLevel = config['zoomLevel'];
        var geometries = config['geometries'];
        var resultType = config['resultType'];
        var ignoreBase = config['ignoreBase'];
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return;
        }
        var projection = this._getProjection();
        if (!extent) {
            extent = this.getExtent();
        }
        if (Z.Util.isNil(zoomLevel)) {
            zoomLevel = this.getZoomLevel();
        }
        if (zoomLevel < tileConfig['minZoomLevel']) {
            zoomLevel = tileConfig['minZoomLevel'];
        } else if (zoomLevel > tileConfig['maxZoomLevel']) {
            zoomLevel = tileConfig['maxZoomLevel'];
        }
        var snapSettings = {
            'projection':tileConfig['projection'],
            'res':tileConfig['resolutions'][zoomLevel],
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
        if (this._tileLayers.length >0){
            var tileLayerSettings=[];
            var tileLayers =this._tileLayers;
            for (var i=0,len=tileLayers.length;i<len;i++) {
                tileLayerSettings.push(genLayerInfo(tileLayers[i]).info);
            }
            layerSettings['tilelayers'] = tileLayerSettings;
        }
        if (this._dynLayers.length>0) {
                //动态图层
            var dynLayerSettings = [];
            var dynLayers =this._dynLayers;
            for (var i=0,len=dynLayers.length;i<len;i++) {
                dynLayerSettings.push(genDynlayerInfo(dynLayers[i]));
            }
            layerSettings['dynlayers'] = dynLayerSettings;
        }
        var geoJson = [];
        var markerJson = [];
        if (!geometries || geometries.length === 0) {
            if (this._canvasLayers.length>0) {
                collectLayers(this._canvasLayers);
            }
            if (this._svgLayers.length>0) {
                collectLayers(this._svgLayers);
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
                if (layer instanceof Z.VectorLayer && !layer.isCanvasRender() &&
                    Z.Geometry["TYPE_POINT"] === geos[j].getType()) {
                    var jStr =geos[j].toJson({'properties':false});
                    markerJson.push(jStr);
                } else {
                    var jStr = geos[j].toJson({'properties':false});
                    geoJson.push(jStr);
                }
            }
        }

        function genDynlayerInfo(layer) {
            //var lConfig = layer.config;
             var nwTileIndex = tileConfig.getCenterTileIndex(projection.project({x:extent['xmin'],y:extent['ymax']}), zoomLevel);
             var seTileIndex = tileConfig.getCenterTileIndex(projection.project({x:extent['xmax'],y:extent['ymin']}), zoomLevel);
            var dynLayerSetting = {
                'url':layer._getTileUrl("%s","%s","%s"),
                'session':layer.sessionId,
                'tileSize': {
                    'height':tileConfig["tileSize"]["height"],
                    'width':tileConfig["tileSize"]["width"]
                },
                'padding':{
                    'height':tileConfig["padding"]["height"],
                    'width':tileConfig["padding"]["width"]
                },
                'nw':{
                    'x':nwTileIndex['x'],
                    'y':nwTileIndex['y'],
                    'ox':nwTileIndex['offsetLeft'],
                    'oy':nwTileIndex['offsetTop']
                },
                'se':{
                    'x':seTileIndex['x'],
                    'y':seTileIndex['y'],
                    'ox':seTileIndex['offsetLeft'],
                    'oy':seTileIndex['offsetTop']
                }

            };

            var xFactor = nwTileIndex["x"]<seTileIndex["x"];
            var yFactor = nwTileIndex["y"]<seTileIndex["y"];

            var tileParams = [];
            for (var i=nwTileIndex["x"];(xFactor?i<=seTileIndex["x"]:i>=seTileIndex["x"]);(xFactor?i++:i--)) {
                for (var j=nwTileIndex["y"];(yFactor?j<=seTileIndex["y"]:j>=seTileIndex["y"]);(yFactor?j++:j--)) {
                    tileParams.push("\""+layer._getRequestUrlParams(j,i,zoomLevel)+"\"");

                }
            }
            dynLayerSettings['tiles']=tileParams;
            return dynLayerSettings;
        }

        function genLayerInfo(layer) {
            var nwTileIndex = tileConfig.getCenterTileIndex(projection.project({x:extent['xmin'],y:extent['ymax']}), zoomLevel);
            var seTileIndex = tileConfig.getCenterTileIndex(projection.project({x:extent['xmax'],y:extent['ymin']}), zoomLevel);
            var tileLayerSettings={
                'tileSize':{
                     'height':tileConfig["tileSize"]["height"],
                    'width':tileConfig["tileSize"]["width"]
                },
                'padding':{
                    'height':tileConfig["padding"]["height"],
                    'width':tileConfig["padding"]["width"]
                },
                'zoomLevel':zoomLevel,
                'url':layer._getTileUrl("%s","%s","%s"),
                'nw':{
                    'x':nwTileIndex['x'],
                    'y':nwTileIndex['y'],
                    'ox':nwTileIndex['offsetLeft'],
                    'oy':nwTileIndex['offsetTop']
                },
                'se':{
                    'x':seTileIndex['x'],
                    'y':seTileIndex['y'],
                    'ox':seTileIndex['offsetLeft'],
                    'oy':seTileIndex['offsetTop']
                }

            };

            return {info:tileLayerSettings,num:tileNum};
        }

    }
});
/**
 * CartoCSS解析参考了CartoCSS.js
 * https://github.com/CartoDB/carto
 */

Z.Map.include({
    /**
     * 为地图载入CartoCSS样式
     * @param  {String|URL} css css样式或者mss文件链接
     */
    cartoCSS:function(css) {
        if (!Z.Util.isString(css) || css.length===0) {
            return;
        }
        if (!window['carto']) {
            //载入carto.js
           Z.loadModule('carto',function() {
                this._loadCartoCSS(css);
           },this);
        } else {
            this._loadCartoCSS(css);
        }

    },

    _loadCartoCSS:function(css) {
        var suffix = '.mss';
        var isMss=css.indexOf(suffix, css.length - suffix.length) !== -1;
        if (isMss) {
            Z.Util.Ajax.getResource(css,function(resource) {
                this._rendCartoCSS(resource);
            },this);
        } else {
            this._rendCartoCSS(css);
        }
    },

    _rendCartoCSS:function(cssContent) {
        var shader = new window['carto']['RendererJS']()['render'](cssContent);
        this._cartoCSSShader = shader;
        this._fireEvent('cartocssloaded');
    },

    /**
     * 根据输入的geometry获取cartoCSS中定义的样式
     * @param  {Geometry} geometry Geometry对象
     * @return {Object}          cartoCSS中定义的样式
     */
    _cartoCSSGeometry:function(geometry) {
        if (!this._cartoCSSShader || !geometry || !geometry.getLayer()) {
            return null;
        }
        var layerId = geometry.getLayer().getId();
        if (!layerId) {
            return null;
        }
        var layerShader = this._cartoCSSShader['findLayer']({'name':'#'+layerId});
        var symbol = layerShader['getStyle'](geometry.getProperties(), { 'zoom': this.getZoomLevel() });
        return symbol;
    }
});

Z.Map.mergeOptions({
    'enableCartoCSS' : true
});

Z.Map.include({
    /**
     * 全屏地图
     * @expose
     */
    openFullscreen: function() {
        this._openFullscreen(this._containerDOM);
        var me = this;
        this._onFullscreenStart();
        if (this.fullscreen_timeout) {
            clearTimeout(this.fullscreen_timeout);
        }
        this.fullscreen_timeout = setTimeout(function() {
            me._onFullscreenEnd();
        }, 100);
    },

    /**
     * 全屏地图
     * @expose
     */
    exitFullscreen: function() {
        this._exitFullscreen(this._containerDOM);
    },

    _onFullscreenStart: function() {
        this._fireEvent('fullscreenStart',{'target':this});
    },

    _onFullscreenEnd: function() {
        this._fireEvent('fullscreenEnd',{'target':this});
    },

    _openFullscreen: function(dom) {
        if(dom.requestFullscreen) {
            dom.requestFullscreen();
        } else if(dom.mozRequestFullScreen) {
            dom.mozRequestFullScreen();
        } else if(dom.webkitRequestFullscreen) {
            dom.webkitRequestFullscreen();
        } else if(dom.msRequestFullscreen) {
            dom.msRequestFullscreen();
        }
     },

     _exitFullscreen: function() {
       if(document.exitFullscreen) {
         document.exitFullscreen();
       } else if(document.mozCancelFullScreen) {
         document.mozCancelFullScreen();
       } else if(document.webkitExitFullscreen) {
         document.webkitExitFullscreen();
       }
     }
});
Z.Map.mergeOptions({
	'dragging': true
});

Z.Map.Drag = Z.Handler.extend({
	addHooks: function () {
		if (!this['draggable']) {
            var map = this['map'];
            if (!map) return;
            this.dom = map._containerDOM;
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
        me.map._allowSlideMap=false;
        var map = me.map;
        me.startDragTime = new Date().getTime();
        var domOffset = me.map.offsetPlatform();
        me.startLeft = domOffset['left'];
        me.startTop = domOffset['top'];
        me.preX = param['mousePos']['left'];
        me.preY = param['mousePos']['top'];
        me.startX = me.preX;
        me.startY = me.preY;
        map._fireEvent('movestart');
    },

    _onDragging:function(param) {
        var me = this;
        var map = me.map;
        var mx = param['mousePos']['left'],
            my = param['mousePos']['top'];
        var currentDomLeft = (me.startLeft + mx - me.startX);
        var currentDomTop = (me.startTop + my - me.startY);
        var domOffset = me.map.offsetPlatform();
        me.map.offsetPlatform(new Z.Point(currentDomLeft-domOffset['left'],currentDomTop-domOffset['top']));
        map._offsetCenterByPixel(new Z.Point(-(currentDomLeft-domOffset['left']),-(currentDomTop-domOffset['top'])));
        me.map._onMoving({'target':map});
        map._fireEvent('moving');
    },



    _onDragEnd:function(param) {
        var me = this;
        me.map._allowSlideMap=true;
        var map = me.map;
        var t = new Date().getTime()-me.startDragTime;
        var domOffset = me.map.offsetPlatform();
        var xSpan =  domOffset['left'] - me.startLeft;
        var ySpan =  domOffset['top'] - me.startTop;
        if (t<280 && Math.abs(ySpan) > 5 && Math.abs(xSpan) > 5) {
            map._animatePan(new Z.Point(ySpan*Math.ceil(500/t), xSpan*Math.ceil(500/t)));
        } else {
            map._onMoveEnd({'target':map});
        }
        map._fireEvent('moveend');
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
				zoom = e['originalEvent']['shiftKey'] ? Math.ceil(oldZoom) - 1 : Math.floor(oldZoom) + 1;
			var mouseOffset = Z.DomUtil.getEventDomCoordinate(e, this.map._containerDOM);
			this.map._zoom(zoom, mouseOffset);
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
		var _containerDOM = map._containerDOM;
		// if(document.addEventListener){
			Z.DomUtil.addDomEvent(_containerDOM, 'mousewheel', this._onWheelScroll, this);
		// }
	},

	removeHooks: function () {
		var map = this.map;
		var _containerDOM = map._containerDOM;
		Z.DomUtil.removeDomEvent(_containerDOM, 'mousewheel', this._onWheelScroll);
	},

	_onWheelScroll: function (evt) {
		// var wheelExecutor = null;
        var map = this.map;
		var _containerDOM = map._containerDOM;
		// if (!map.mouseTool) {return;}
		if (map.zooming) {return;}
		// if (!evt) {evt = window.event;}

		var _levelValue = 0;
		_levelValue += (evt.wheelDelta?evt.wheelDelta:evt.detail) > 0 ? 1 : -1;
		if (evt.detail) {
			_levelValue *= -1;
		}
		var mouseOffset = Z.DomUtil.getEventDomCoordinate(evt, _containerDOM);
		if (this.wheelExecutor) {
			clearTimeout(this.wheelExecutor);
		}
		this.wheelExecutor = setTimeout(function () {
			map._zoom(map._zoomLevel + _levelValue, mouseOffset);
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
        var mouseOffset = Z.DomUtil.getEventDomCoordinate(event['originalEvent'], this.map._containerDOM);
        var layers = [];
        //2015-07-09 fuzhen dynamiclayer不需要做identify
        layers = layers.concat(this.map._canvasLayers)/*.concat(this.map._dynLayers)*/;

        this.options = {
            point: mouseOffset,
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
            if(!result['success']){return;};
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
                                oldTarget._onMouseOut(event);
                            }
                        } else {//鼠标新的位置不包含任何geometry，将触发之前target的mouseOut事件
                            oldTarget._onMouseOut(event);
                        }
                    }
                }
                if(!geometries) {return;}
                for(var i=0,len=geometries.length; i<len; i++) {
                    var geometry = geometries[i];
                    geometry._onMouseOver(event);
                }
                me.map.options['mouseoverTarget'] = geometries;
            } else {
                if(!geometries) {return;}
                for(var i=0,len=geometries.length; i<len; i++) {
                    var geometry = geometries[i];
                    geometry._onEvent(event);
                }
            }
        };

    }
});

Z.Map.addInitHook('addHandler', 'eventToGeometry', Z.Map.EventToGeometry);

Z['Control'] = Z.Control = Z.Class.extend({

	/**
	* 异常信息定义
	*/
	exceptionDefs:{
		'en-US':{
			'NEED_ID':'You must set id to Control.'
		},
		'zh-CN':{
			'NEED_ID':'Control必须设置id。'
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
		if(!id) {throw new Error(this.exceptions['NEED_ID']);}
		this.remove();
		this._map = map;
		this._controlContainer = map._panels.controlWrapper;

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
	* @expose
	*/
	setOption: function(options) {
		Z.Util.setOptions(this, options);
		return this;
	},

	/**
	* @expose
	*/
	getOption: function(options) {
		return this.options;
	},

	/**
	* @expose
	*/
	getPosition: function () {
		return this.options['position'];
	},

	/**
	* @expose
	*/
	setPosition: function (position) {
		var map = this._map;
		if (map) {
			map.removeControl(this);
		}
		this.options['position'] = position;
		if (map) {
			map.addControl(this);
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
		if (this._onRemove) {
			this._onRemove(this._map);
		}
		this._map = null;
		return this;
	},

	_afterAdd: function() {

    },

	_getInternalLayer: function(map, layerId, canvas) {
		if(!map) {return;}
        var layer = map.getLayer(layerId);
        if(!layer) {
        	if(canvas) {
                layer = new Z.VectorLayer(layerId,{'render':'canvas'});
            } else {
                layer = new Z.VectorLayer(layerId);
            }
			map.addLayer(layer);
        }
        return layer;
	}

});

Z.Map.include({
	/*
	* 添加control
	* @expose
	*/
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	/*
	* 删除control
	* @expose
	*/
	removeControl: function (control) {
		control.remove();
		return this;
	}

});

Z['InfoWindow'] = Z.InfoWindow = Z.Class.extend({

        /**
        * 异常信息定义
        */
        exceptionDefs:{
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
            this.map._panels.tipContainer.innerHTML = Z.InfoWindow['template'];
            this.tipDom = this.map._panels.tipContainer.childNodes[0];
            this.tipDom["m"] = this;
            this.msgBox = this.tipDom.childNodes[0].childNodes[1];
            //onmousedown事件解决弹出框内容无法选中的问题
            if(!this.msgBox.addEvent) {
                this._removeEvent();
                Z.DomUtil.addDomEvent(this.msgBox,'mousedown', this.stopPropagation);
                Z.DomUtil.addDomEvent(this.msgBox,'dblclick', this.stopPropagation);
                this.map.on('zoomstart', this._onZoomStart, this);
                this.map.on('zoomend', this._onZoomEnd, this);
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
            this.map.off('zoomstart', this._onZoomStart, this);
            this.map.off('zoomend', this._onZoomEnd, this);
        },

        stopPropagation: function(event) {
            Z.DomUtil.stopPropagation(event);
        },

        _onZoomStart:function() {
            this.map._panels.tipContainer.style.display='none';
        },

        _onZoomEnd:function() {
            if (this._visible) {
                //style.display=''必须要在调用 offsetTipDom之前, 要不然tipDom.clientHeight和clientWidth取到的值为0
                this.map._panels.tipContainer.style.display='';
                this.offsetTipDom();
            }
        },

        /**
        * 设置InfoWindow窗口
        * @param {Array} tipOption 项
        * {"items":[], width:240, beforeopen:fn}
        * @expose
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
        * @expose
        */
        hide:function() {
            this._visible = false;
            this.tipDom.style.display="none";
        },

        /**
         * 判断信息框是否打开
         * @expose
         * @returns {Boolean}
         */
        isOpen:function() {
            return this._visible;
        },

        /**
        * 显示信息框
        * @expose
        * @param {Coordinate} 信息框打开坐标
        */
        show:function(coordinate) {
            if (!this.map) {
                return;
            }
            if (!this.map.options['enableInfoWindow']) return;
            this.hide();
            this._visible = true;
            var map = this.map;
            var tipDom = this.tipDom;
            tipDom.style.display='';
            this.map._panels.tipContainer.style.display='';
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
            var absolute = map._domOffsetToScreen(tipCoord);
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
                this.tipSlidingExecutor = map._animatePan({"left":left,"top":top});
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
            var tipCoord = new Z.Point(
                    parseInt(pxCoord.left-parseInt(tipDom.clientWidth)/2+38),
                    parseInt(pxCoord.top-parseInt(tipDom.clientHeight))
                );
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
                var projection = this.map._getProjection();
                if (!center || !projection) {return null;}
                var pcenter = projection.project(center);
                position = this.map._transformToOffset(pcenter);
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
    exceptionDefs:{
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
    * @expose
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
        this.map._panels.popMenuContainer.innerHTML = Z['Menu']['template'];
        this.menuDom = this.map._panels.popMenuContainer.firstChild;
        if(!this.menuDom.addEvent) {
            this.close();
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
    * @expose
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
    * @expose
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
    * @expose
    */
    getOption: function() {
        return this.menuOption;
    },

    /**
     * 关闭Map的右键菜单
     * @return {[type]} [description]
     * @expose
     */
    close:function() {
        return this.hide();
    },

    /**
     * 移除Map的右键菜单设置
     * @expose
     */
    remove:function() {
        this.hide();
        delete this.menuOption;
        return this;
    },

    /**
    * 隐藏菜单
    * @expose
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
                this._executeListeners('closemenu',{"target":this});
            }
        }
    },

    /**
    *  判断菜单是否打开
    *  @expose
    *  @returns {Boolean}
    */
    isOpen:function() {
        return (this.menuDom.style.display!="none");
    },

    /**
    * 显示菜单
    * @expose
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
        var firstChild = this.map._panels.popMenuContainer.firstChild;
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
            var projection = this.map._getProjection();
            if (!center || !projection) {return null;}
            var pcenter = projection.project(center);
            position = this.map._transformToOffset(pcenter);
        }
        return position;
    }

});
Z['Control'] = Z.Control = Z.Class.extend({

	/**
	* 异常信息定义
	*/
	exceptionDefs:{
		'en-US':{
			'NEED_ID':'You must set id to Control.'
		},
		'zh-CN':{
			'NEED_ID':'Control必须设置id。'
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
		if(!id) {throw new Error(this.exceptions['NEED_ID']);}
		this.remove();
		this._map = map;
		this._controlContainer = map._panels.controlWrapper;

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
	* @expose
	*/
	setOption: function(options) {
		Z.Util.setOptions(this, options);
		return this;
	},

	/**
	* @expose
	*/
	getOption: function(options) {
		return this.options;
	},

	/**
	* @expose
	*/
	getPosition: function () {
		return this.options['position'];
	},

	/**
	* @expose
	*/
	setPosition: function (position) {
		var map = this._map;
		if (map) {
			map.removeControl(this);
		}
		this.options['position'] = position;
		if (map) {
			map.addControl(this);
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
		if (this._onRemove) {
			this._onRemove(this._map);
		}
		this._map = null;
		return this;
	},

	_afterAdd: function() {

    },

	_getInternalLayer: function(map, layerId, canvas) {
		if(!map) {return;}
        var layer = map.getLayer(layerId);
        if(!layer) {
        	if(canvas) {
                layer = new Z.VectorLayer(layerId,{'render':'canvas'});
            } else {
                layer = new Z.VectorLayer(layerId);
            }
			map.addLayer(layer);
        }
        return layer;
	}

});

Z.Map.include({
	/*
	* 添加control
	* @expose
	*/
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	/*
	* 删除control
	* @expose
	*/
	removeControl: function (control) {
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

	_onRemove: function (map) {
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
		this._zoomLevelNum['innerHTML'] = this._map._zoomLevel;
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
		var level = this._map._maxZoomLevel - Math.round(offsetY/7.2);
		var top = (this._map._maxZoomLevel-level)*7.2;
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
		var sliderTop = (this._map._maxZoomLevel - this._map._zoomLevel)*7.2;
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
	* @expose
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

/*    _stopPan: function() {
        if (this._panTimeout) {
            clearInterval(this._panTimeout);
        }
    },*/

    _startPan: function(direction, step) {
        var me = this;
        me._step = step;
        me._direction = direction;
        this._panExecutor = setInterval(function() {
            if(me._direction === "left") {
                me._map.panBy(new Z.Point(me._step,0));
            } else if (me._direction === "top") {
                me._map.panBy(new Z.Point(0,me._step));
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

Z['Control']['Scale'] = Z.Control.Scale = Z.Control.extend({

    options:{
        'id': 'CONTROL_SCALE',
        'position' : Z.Control['bottom_left'],
        'maxWidth': 100,
        'metric': true,
        'imperial': true
    },

    statics: {
        'control_scale' : 'border: 2px solid #6490C4;border-top: none;line-height: 1.1;padding: 2px 5px 1px;'+
                          'color: #6490C4;font-size: 11px;text-align:center;white-space: nowrap;overflow: hidden'+
                          ';-moz-box-sizing: content-box;box-sizing: content-box;background: #fff; background: rgba(255, 255, 255, 0.5);'
    },

    buildOn: function (map) {
        this._map = map;
        this._scaleContainer = Z.DomUtil.createEl('div');
        this._addScales();
        map.on('moveend', this._update, this)
           .on('move', this._update, this);
        return this._scaleContainer;
    },

    _onRemove: function (map) {
        map.off('moveend', this._update, this)
           .off('move', this._update, this);
    },

    _addScales: function () {
        if (this.options['metric']) {
            this._mScale = Z.DomUtil.createElOn('div', Z.Control.Scale['control_scale'], this._scaleContainer);
        }
        if (this.options['imperial']) {
            this._iScale = Z.DomUtil.createElOn('div', Z.Control.Scale['control_scale'], this._scaleContainer);
        }
    },

    _update: function () {
        var map = this._map;
        var height = map.getSize().height / 2;
        var projection = map._getProjection();
        var maxMeters = 100;
        this._updateScales(maxMeters);
    },

    _updateScales: function (maxMeters) {
        if (this.options['metric'] && maxMeters) {
            this._updateMetric(maxMeters);
        }
        if (this.options['imperial'] && maxMeters) {
            this._updateImperial(maxMeters);
        }
    },

    _updateMetric: function (maxMeters) {
        var meters = this._getRoundNum(maxMeters),
            label = meters < 1000 ? meters + ' 米' : (meters / 1000) + ' 公里';

        this._updateScale(this._mScale, label, meters / maxMeters);
    },

    _updateImperial: function (maxMeters) {
        var maxFeet = maxMeters * 3.2808399,
            maxMiles, miles, feet;

        if (maxFeet > 5280) {
            maxMiles = maxFeet / 5280;
            miles = this._getRoundNum(maxMiles);
            this._updateScale(this._iScale, miles + ' 米', miles / maxMiles);

        } else {
            feet = this._getRoundNum(maxFeet);
            this._updateScale(this._iScale, feet + ' 英尺', feet / maxFeet);
        }
    },

    _updateScale: function (scale, text, ratio) {
        scale['style']['width'] = Math.round(this.options['maxWidth'] * ratio) + 'px';
        scale['innerHTML'] = text;
    },

    _getRoundNum: function (num) {
        var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
            d = num / pow10;

        d = d >= 10 ? 10 :
            d >= 5 ? 5 :
            d >= 3 ? 3 :
            d >= 2 ? 2 : 1;

        return pow10 * d;
    }
});

Z.Map.mergeOptions({
    'scaleControl' : true,
    'scaleControlOptions' : {
        'id': 'MAP_CONTROL_SCALE',
        'position' : Z.Control['bottom_left'],
        'maxWidth': 100,
        'metric': true,
        'imperial': false
    }
});

Z.Map.addOnLoadHook(function () {
    if (this.options['scaleControl']) {
        var scaleControlOptions = this.options['scaleControlOptions'];
        this.scaleControl = new Z.Control.Scale(scaleControlOptions);
        this.addControl(this.scaleControl);
    }
});

Z['Button'] = Z.Button = Z.Class.extend({

    options:{
        'icon' : '',
        'text' : '左',
        'click' : null,
        'mouseover' : null,
        'mouseout' : null,
        'children' : []
    },

    initialize: function(options) {
        if(options) {
            this._dom = this._createDom(options);
        }
        return null;
    },

    _createDom : function(options) {
        if(options['type'] === 'button') {
            return this._createButtonDom(options);
        } else if(options['type'] === 'html') {
            return this._createHtmlDom(options);
        } else if(options['type'] === 'menu') {
            return this._createMenuDom(options);
        }
    },

     _createButtonDom : function(options) {
        var _buttonDom = Z.DomUtil.createEl('button');
        Z.DomUtil.on(_buttonDom, 'click dblclick contextmenu', Z.DomUtil.stopPropagation);
        Z.DomUtil.addClass(_buttonDom, 'control-button');
        _buttonDom.innerHTML = this._createIconDom(options);
        if(options['click']) {
            Z.DomUtil.on(_buttonDom, 'click', options['click'], this);
        }
        if(options['mouseover']) {
            Z.DomUtil.on(_buttonDom, 'mouseover', options['mouseover'], this);
        } else {
            Z.DomUtil.on(_buttonDom, 'mouseover', function() {
                Z.DomUtil.removeClass(_buttonDom, 'control-button');
                Z.DomUtil.addClass(_buttonDom, 'control-button-hover');
            }, this);
        }
        if(options['mouseout']) {
            Z.DomUtil.on(_buttonDom, 'mouseout', options['mouseout'], this);
        } else {
            Z.DomUtil.on(_buttonDom, 'mouseout', function() {
                Z.DomUtil.removeClass(_buttonDom, 'control-button-hover');
                Z.DomUtil.addClass(_buttonDom, 'control-button');
            }, this);
        }
        return _buttonDom;
    },

    _createHtmlDom : function(options) {
        var _htmlDom = Z.DomUtil.createEl('span');
        Z.DomUtil.on(_htmlDom, 'click dblclick contextmenu', Z.DomUtil.stopPropagation);
        _htmlDom.innerHTML = options['content'];
        return _htmlDom;
    },

    _createMenuDom : function(options, tag) {
        var _menuDom = Z.DomUtil.createEl('span');
        if(tag) {
            _menuDom = Z.DomUtil.createEl(tag);
        }
        Z.DomUtil.on(_menuDom, 'click dblclick contextmenu', Z.DomUtil.stopPropagation);
        Z.DomUtil.addClass(_menuDom, 'control-button');
        _menuDom.innerHTML = this._createIconDom(options);
        if(options['click']) {
            Z.DomUtil.on(_menuDom, 'click', options['click'], this);
        }
        if(options['mouseover']) {
            Z.DomUtil.on(_menuDom, 'mouseover', options['mouseover'], this);
        } else {
            Z.DomUtil.on(_menuDom, 'mouseover', function() {
                Z.DomUtil.removeClass(_menuDom, 'control-button');
                Z.DomUtil.addClass(_menuDom, 'control-button-hover');
            }, this);
        }
        if(options['mouseout']) {
            Z.DomUtil.on(_menuDom, 'mouseout', options['mouseout'], this);
        } else {
            Z.DomUtil.on(_menuDom, 'mouseout', function() {
                Z.DomUtil.removeClass(_menuDom, 'control-button-hover');
                Z.DomUtil.addClass(_menuDom, 'control-button');
            }, this);
        }
        ///////处理下拉菜单
        if(options['children'] && options['children'].length>0) {
            var dropdownMenu = Z.DomUtil.createElOn('ul', 'display: none;');

            var menuClass = this._getMenuClass(options, tag);
            Z.DomUtil.addClass(dropdownMenu, menuClass);

            var trigger = options['trigger'];
            addMenuDropEvent(trigger, tag);
            function addMenuDropEvent(trigger, tag) {
                if(trigger === 'click') {
                    Z.DomUtil.on(_menuDom, 'click', function() {
                        Z.DomUtil.setStyle(dropdownMenu, 'display: inline-block');
                    }, this);
                    Z.DomUtil.on(dropdownMenu, 'mouseover', function() {
                        Z.DomUtil.setStyle(dropdownMenu, 'display: inline-block');
                    }, this);
                } else {
                    Z.DomUtil.on(_menuDom, 'mouseover', function() {
                        Z.DomUtil.setStyle(dropdownMenu, 'display: inline-block');
                    }, this);
                }
                Z.DomUtil.on(dropdownMenu, 'mouseout', function() {
                    Z.DomUtil.setStyle(dropdownMenu, 'display: none');
                }, this);
                if(tag) {
                    Z.DomUtil.on(_menuDom, 'mouseout', function() {
                        Z.DomUtil.setStyle(dropdownMenu, 'display: none');
                    }, this);
                }
            }
            //构造下拉菜单
            var items = options['children'];
            if(items&&items.length>0) {
                for(var i=0,len=items.length;i<len;i++) {
                    var item = items[i];
                    item['vertical'] = options['vertical'];
                    item['position'] = options['position'];
                    dropdownMenu.appendChild(this._createMenuDom(item, 'li'));
                }
            }
            _menuDom.appendChild(dropdownMenu);
        }
        //////////////
        return _menuDom;
    },

    _createIconDom : function(options) {
        var icon = options['icon'];
        var content = options['content'];
        var html = options['html'];
        if(icon) {
            var imgDom = '<img src='+icon+' border=0 />';
            if(text) {
                if(html) {
                    imgDom = '<img src='+icon+' border=0 />&nbsp;'+content;
                } else {
                    imgDom = '<img src='+icon+' border=0 alt='+content+' />&nbsp;'+content;
                }
            }
            return  imgDom;
        } else {
           return content;
        }
    },

    _getMenuClass: function(options, tag) {
        var className = '';
        var vertical = options['vertical'];
        var position = options['position'];
        if (vertical) {//菜单垂直
            className = this._getClassName(position);
            if(position['bottom']) {
                if(position['right']) {
                    className = 'control-menu-right-up';
                } else if (position['left']){
                    className = 'control-menu-left-up';
                }
            }
        } else {
            if (position['bottom']) {
                if(tag) {
                    className = this._getClassName(position);
                    if(position['right']) {
                        className = 'control-menu-right-up';
                    } else if(position['left']) {
                        className = 'control-menu-left-up';
                    }
                } else {
                    className = 'control-menu-up';
                }
            } else {
                if(tag) {
                    className = this._getClassName(position);
                } else {
                    className = 'control-menu-down';
                }
            }
        }
        return className;
    },

    _getClassName : function(position) {
        if (position['left']) {
            return 'control-menu-right';
        } else if (position['right']) {
            return 'control-menu-left';
        } else {
            return 'control-menu-right';
        }
    },


    getDom: function() {
        return this._dom;
    }

});
Z['Toolbar'] = Z.Toolbar = Z.Control.extend({

	options:{
		'position' : {
			'bottom': '0',
			'right': '0'
		},
		'classname': '',
		'vertical' : false,
		'items': [{
			'type' : 'button',
			'icon' : '',
			'text': '左',
			'click' : null,
			'mouseover' : null,
			'mouseout' : null
		}, {
			'type' : 'html',
			'content':''
		}]
	},

	buildOn: function (map) {
		this._map = map;
		this._toolbarContainer = Z.DomUtil.createEl('div');
		if(this.options['className']) {
			Z.DomUtil.addClass(this._toolbarContainer, this.options['className']);
		} else {
			if(this.options['vertical']) {
				Z.DomUtil.addClass(this._toolbarContainer, 'control-toolbar-vertical');
			} else {
				Z.DomUtil.addClass(this._toolbarContainer, 'control-toolbar');
			}
		}
		var items = this.options['items'];
		if(items&&items.length>0) {
			for(var i=0,len=items.length;i<len;i++) {
				var item = items[i];
				item['vertical'] = this.options['vertical'];
				item['position'] = this.options['position'];
				var buttonDom = new Z.Button(item).getDom();
                this._toolbarContainer.appendChild(buttonDom);
			}
		}
		return this._toolbarContainer;
	}
});
Z['Panel'] = Z.Panel = Z.Control.extend({
    includes: [Z.Eventable],

    statics: {
        getPanel: function(id) {
            return Z['Control']['getControl'](id);
        }
    },

    options:{
        'position' : {
            'top': '0',
            'right': '0'
        },
        'style': 'default',
        'draggable': true,
        'title': '',
        'html': true,
        'content': '',
        'target': null,
        'linksymbol': {
            'line-color' : '#474cf8',
            'line-width' : 1,
            'line-dasharray' : null,
            'line-opacity' : 1
        }
    },

    /**
    * 隐藏panel
    * @expose
    */
    hide: function() {
        var parentDom = this._panelContainer['parentNode'];
        Z.DomUtil.setStyle(parentDom, 'display: none');
        if(this.options['target']) {
            this._link.hide();
        }
    },

    /**
    * 显示panel
    * @expose
    */
    show: function() {
        var parentDom = this._panelContainer['parentNode'];
        Z.DomUtil.setStyle(parentDom, 'display: block');
        if(this.options['target']) {
            this._link.show();
        }
    },

    /**
    * 移除panel
    * @expose
    */
    removePanel: function() {
        this.remove();
        if(this.options['target']) {
            this._link.remove();
        }
    },

    /**
    * 根据id获取panel
    * @expose
    */
    getPanel: function(id) {
        return this.getControl();
    },

    buildOn: function (map) {
        if(!map || !this.options || !this.options['content']) return;
        this._map = map;
        this._internalLayer = this._getInternalLayer(map, '__mt__internal_layer_panel_link');
        this._panelContainer = Z.DomUtil.createElOn('div', 'cursor:default;');
        var divCss = 'panel-default';
        var titleCss = 'panel-title-default';
        var contentCss = 'panel-content-default';
        var style = this.options['style'];
        if(style) {
            divCss = 'panel-' + style;
            titleCss = 'panel-title-' + style;
            contentCss = 'panel-content-' + style;
        }
        Z.DomUtil.addClass(this._panelContainer, divCss);
        this._appendTitleDom(titleCss);
        this._appendContentDom(contentCss);
        Z.DomUtil.on(this._panelContainer, 'click dblclick contextmenu mousemove mousedown mouseup', Z.DomUtil.stopPropagation);
        if(this.options['draggable']) {
            Z.DomUtil.on(this._panelContainer, 'mousedown', this._onMouseDown, this)
                     .on(this._panelContainer, 'mouseup', this._disableMove, this);
        }
        return this._panelContainer;
    },

    _appendTitleDom: function(titleCss) {
        if(this.options['title']) {
            var _titleDom = Z.DomUtil.createEl('div');
            Z.DomUtil.addClass(_titleDom, titleCss);
            _titleDom.innerHTML = this.options['title'];
            this._panelContainer.appendChild(_titleDom);
        }
    },

    _appendContentDom: function(contentCss) {
        if(this.options['content']) {
            var _contentDom = Z.DomUtil.createEl('div');
            Z.DomUtil.addClass(_contentDom, contentCss);
            if(this.options['html']) {
                _contentDom.innerHTML = this.options['content'];
            } else {
                _contentDom.innerTEXT = this.options['content'];
            }
            this._panelContainer.appendChild(_contentDom);
        }
    },

    _afterAdd: function() {
        if(this.options['target']) {
            this._linkToTarget();
        }
    },

    _linkToTarget: function() {
        this._target = this.options['target'];
        var center = this._target.getCenter();
        var nearestPoints = this._getNearestPoint(center);
        var path = [center, nearestPoints[0], nearestPoints[1]];
        this._link = new Z.Polyline(path);
        if(this.options['linksymbol']) {
            this._link.setSymbol(this.options['linksymbol']);
        }
        this._internalLayer.addGeometry(this._link);

        this._target.on('positionchanged', this._changeLinkPath, this)
                .on('remove', this.remove, this);
        this.on('dragging', this._changeLinkPath, this);
        this._map.on('zoomend resize moving', this._changeLinkPath, this);
    },

    /**
    *获取距离coordinate最近的panel上的点
    * @param {Coordinate}
    * @return {Coordinate}
    */
    _getNearestPoint: function(coordinate) {
        var points = [];
        var screenPoint = this._topLeftPoint();
        var width = this._panelContainer['clientWidth'],
            height = this._panelContainer['clientHeight'];
        var topLeftPoint = this._map.screenPointToCoordinate(screenPoint);

        var topCenterPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top']
                )
        );
        var topCenterBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] - 20
                )
        );
        var topRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top']
                )
        );
        var bottomLeftPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'],
                screenPoint['top'] + height
                )
        );
        var bottomCenterPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] + height
                )
        );
        var bottomCenterBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] + height + 20
                )
        );
        var bottomRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top'] + height
                )
        );
        var middleLeftPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'],
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleLeftBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] - 20,
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleRightBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width + 20,
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var points = [topCenterPoint,middleRightPoint,bottomCenterPoint,middleLeftPoint];
        var lastDistance = 0;
        var nearestPoint;
        for(var i=0,len=points.length;i<len;i++) {
            var point = points[i];
            var distance = this._map.computeDistance(coordinate, point);
            if(i === 0) {
                nearestPoint = point;
                lastDistance = distance;
            } else {
                if(distance < lastDistance) {
                    nearestPoint = point;
                }
            }
        }
        //连接缓冲点，作用为美化
        var bufferPoint;
        if(Z.Coordinate.equals(nearestPoint, topCenterPoint)) {
            bufferPoint = topCenterBufferPoint;
        } else if(Z.Coordinate.equals(nearestPoint, middleRightPoint)) {
            bufferPoint = middleRightBufferPoint;
        } else if(Z.Coordinate.equals(nearestPoint, bottomCenterPoint)) {
            bufferPoint = bottomCenterBufferPoint;
        } else if(Z.Coordinate.equals(nearestPoint, middleLeftPoint)) {
            bufferPoint = middleLeftBufferPoint;
        }
        var nearestPoints = [bufferPoint, nearestPoint];
        return nearestPoints;
    },

    _topLeftPoint: function() {
        var parentDom = this._panelContainer['parentNode'];
        var domStyle = parentDom['style'];
        var top = Z.DomUtil.getPixelValue(domStyle['top']),
            left = Z.DomUtil.getPixelValue(domStyle['left']),
            bottom = Z.DomUtil.getPixelValue(domStyle['bottom']),
            right = Z.DomUtil.getPixelValue(domStyle['right']);
        var width = this._map._containerDOM.clientWidth,
            height = this._map._containerDOM.clientHeight;
        var panelWidth = this._panelContainer['clientWidth'],
            panelHeight = this._panelContainer['clientHeight'];
        if(left === 0 && right >= 0) {
            left = width - right - panelWidth;
        }
        if(top === 0 && bottom >= 0) {
            top = height - bottom - panelHeight;
        }
        return new Z.Point(left, top);
    },

    _changeLinkPath: function() {
        var geometry = this.options['target'];
        var center = geometry.getCenter();
        var nearestPoints = this._getNearestPoint(center);
        var path = [center, nearestPoints[0], nearestPoints[1]];
        this._link.setCoordinates(path);
    },

    _onMouseDown: function(event) {
        Z.DomUtil.setStyle(this._panelContainer, 'cursor: move');
        this._map.disableDrag();
        Z.DomUtil.on(this._panelContainer, 'mousemove', this._onMouseMove, this);
        this._startOffset = new Z.Point(
            parseInt(event.offsetX,0),
            parseInt(event.offsetY,0)
            );

        this.fire('dragstart', {'target': this, 'position': this._startOffset});
    },

    _onMouseMove: function(event) {
        this._endOffset = new Z.Point(parseInt(event.offsetX, 0),parseInt(event.offsetY, 0));
        var offsetTop = this._endOffset['top'] - this._startOffset['top'];
        var offsetLeft = this._endOffset['left'] - this._startOffset['left'];
        var parentDom = this._panelContainer['parentNode'];
        var domStyle = parentDom['style'];
        var domTop = Z.DomUtil.getPixelValue(domStyle['top']);
        var domLeft = Z.DomUtil.getPixelValue(domStyle['left']);
        var domBottom = Z.DomUtil.getPixelValue(domStyle['bottom']);
        var domRight = Z.DomUtil.getPixelValue(domStyle['right']);

        if(domTop) {
            domTop = domTop + offsetTop;
            if(domTop <= 0) {domTop = 1;}
            Z.DomUtil.setStyle(parentDom, 'top: ' + domTop+'px');
        }
        if(domLeft) {
            domLeft = domLeft + offsetLeft;
            if(domLeft <= 0) {domLeft = 1;}
            Z.DomUtil.setStyle(parentDom, 'left: ' + domLeft+'px');
        }
        if(domBottom) {
            domBottom = domBottom - offsetTop;
            if(domBottom <= 0) {domBottom = 1;}
            Z.DomUtil.setStyle(parentDom, 'bottom: ' + domBottom+'px');
        }
        if(domRight) {
            domRight = domRight - offsetLeft;
            if(domRight <= 0) {domRight = 1;}
            Z.DomUtil.setStyle(parentDom, 'right:' +  domRight+'px');
        }
        this.fire('dragging', {'target': this, 'position': this._endOffset});
    },

    _disableMove: function() {
        Z.DomUtil.setStyle(this._panelContainer, 'cursor: ' +  'default');
        this._map.enableDrag();
        Z.DomUtil.off(this._panelContainer, 'mousemove', this._onMouseMove, this);
        /**if(this.options['target']) {
            this._target.off('positionchanged', this._changeLinkPath, this)
                    .off('remove', this.remove, this);
            this.off('dragging', this._changeLinkPath, this);
            this._map.off('zoomend resize moving', this._changeLinkPath, this);
        }*/
        this.fire('dragend', {'target': this, 'position': this._endOffset});
    }

});
Z['Label'] = Z.Label = Z.Class.extend({
    includes: [Z.Eventable],

    /**
    * 异常信息定义
    */
    'exceptionDefs':{
        'en-US':{
            'NEED_TARGET':'You must set target to Label.'
        },
        'zh-CN':{
            'NEED_TARGET':'你必须设置Label绑定的Geometry目标。'
        }
    },

    options:{
        'symbol': {
            'shield-type': 'label',//label tip
            'shield-name': '',
            'shield-opacity': 1,
            'shield-line-color': '#000000',
            'shield-line-width': 1,
            'shield-line-opacity': 1,
            'shield-fill': '#ffffff',
            'shield-fill-opacity': 1,
            'shield-file': '',
            'shield-face-name': 'Serif',
            'shield-unlock-image' : false,
            'shield-size': 12,
            'shield-text-fill': '#ff0000',
            'shield-placement': 'point', //point line vertex interior
            'shield-spacing': 30,
            'shield-wrap-width': 100,
            'shield-wrap-before': false,
            'shield-wrap-character': '',
            'shield-character-spacing': 0,
            'shield-line-spacing': 8,
            'shield-text-dx': 0,
            'shield-text-dy': 0,
            'shield-dx': 0,
            'shield-dy': 0,
            'shield-text-opacity': 1,
            'shield-horizontal-alignment': 'right',//left middle right
            'shield-vertical-alignment': 'top',//top middle bottom
            'shield-justify-alignment': 'center'//left center right
        },
        'link': true,
        'draggable': true,
        'trigger': 'hover'//click|hover
    },

    /**
    * @expose
    */
    initialize: function (options) {
        this.setOption(options);
        return this;
    },

    /**
    * @expose
    */
    setOption: function(options) {
        Z.Util.setOptions(this, options);
        return this;
    },

    /**
    * 隐藏label
    * @expose
    */
    hide: function() {
        this._label.hide();
        if(this.options['link']) {
            //this._link.hide();
        }
        this.fire('hide', {'target': this});
    },

    /**
    * 显示label
    * @expose
    */
    show: function() {
        this._label.show();
        if(this.options['link']) {
            //this._linkToTarget();
        }
        this.fire('show', {'target': this});
    },

    /**
    * 移除label
    * @expose
    */
    remove: function() {
        this._label.remove();
        if(this.options['link']) {
            //this._link.remove();
        }
        this.fire('remove', {'target': this});
    },

    addTo: function (geometry) {
        if(!geometry || !this.options || !this.options['symbol']) {return;}
        this._map = geometry.getMap();
        this._labelContrainer = this._map._containerDOM;
        this._target = geometry;
        if(!this._target) {throw new Error(this.exceptions['NEED_TARGET']);}

        var layerId = '__mt__layer_label';
        var canvas = false;
        var targetLayer = this._target.getLayer();
        if(targetLayer && targetLayer instanceof Z.VectorLayer && targetLayer.isCanvasRender()) {
            canvas = true;
        }
        this._internalLayer = this._getInternalLayer(this._map, layerId, canvas);
        var targetCenter = this._target.getCenter();
        this._label = new Z.Marker(targetCenter);
        this._label.setProperties(geometry.getProperties());
        this._label['target'] = this._target;
        this._label.setSymbol(this.options['symbol']);
        this._internalLayer.addGeometry(this._label);
        this._label.hide();

        this._target.on('shapechanged positionchanged symbolchanged', Z.Util.bind(this._changeLabelPosition, this), this)
                    .on('remove', this.removeLabel, this);

        this._label.on('click dblclick rightclick', Z.DomUtil.stopPropagation, this);


        var trigger = this.options['trigger'];
        var me = this;
        if(trigger === 'hover') {
            this._target.on('mouseover', function showLabel() {
                         me.show();
                         me._map.disableDrag();
                         me._map.disableDoubleClickZoom();
                     }, this)
                     .on('mouseout', function hideLabel() {
                        setTimeout(function(){
                            me.hide();
                            me._map.enableDrag();
                            me._map.enableDoubleClickZoom();
                        }, 1000);
                     }, this);
        } else if(trigger === 'click') {
            this._target.on('click', function showLabel() {
                         me.show();
                         me._map.disableDrag();
                         me._map.disableDoubleClickZoom();
                     }, this);
        } else {
            this.show();
        }
        if(this.options['draggable']) {
             this._label.on('mousedown', this._onMouseDown, this)
                        .on('dragend', this._endMove, this)
                        .on('mouseout', this._recoverMapEvents, this);
        }
        return null;
    },

    _linkToTarget: function() {
        var center = this._target.getCenter();
        var nearestPoints = this._getNearestPoint(center);
        var path = [center, nearestPoints[0], nearestPoints[1]];
        this._link = new Z.Polyline(path);

        var strokeSymbol = {
            'line-color': this.options['symbol']['shield-line-color'],
            'line-width': this.options['symbol']['shield-line-width']
        };
        this._link.setSymbol(strokeSymbol);

        this._internalLayer.addGeometry(this._link);
        this._target.on('positionchanged', this._changeLinkPath, this)
                .on('remove', this.remove, this);

    },

    /**
    *获取距离coordinate最近的label上的点
    * @param {Coordinate}
    * @return {Coordinate}
    */
    _getNearestPoint: function(coordinate) {
        var points = [];

        var painter = this._label._getPainter();
        var textSize = painter.measureTextMarker();
        var width = 0, //textSize['width'],
            height = 0; //textSize['height'];

        var screenPoint = this._topLeftPoint(width, height);

        var topLeftPoint = this._map.screenPointToCoordinate(screenPoint);

        var topCenterPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top']
                )
        );
        var topCenterBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] - 20
                )
        );
        var topRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top']
                )
        );
        var bottomLeftPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'],
                screenPoint['top'] + height
                )
        );
        var bottomCenterPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] + height
                )
        );
        var bottomCenterBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] + height + 20
                )
        );
        var bottomRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top'] + height
                )
        );
        var middleLeftPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'],
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleLeftBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] - 20,
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleRightBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width + 20,
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var points = [topCenterPoint,middleRightPoint,bottomCenterPoint,middleLeftPoint];
        var lastDistance = 0;
        var nearestPoint;
        for(var i=0,len=points.length;i<len;i++) {
            var point = points[i];
            var distance = this._map.computeDistance(coordinate, point);
            if(i === 0) {
                nearestPoint = point;
                lastDistance = distance;
            } else {
                if(distance < lastDistance) {
                    nearestPoint = point;
                }
            }
        }
        //连接缓冲点，作用为美化
        var bufferPoint;
        if(Z.Coordinate.equals(nearestPoint, topCenterPoint)) {
            bufferPoint = topCenterBufferPoint;
        } else if(Z.Coordinate.equals(nearestPoint, middleRightPoint)) {
            bufferPoint = middleRightBufferPoint;
        } else if(Z.Coordinate.equals(nearestPoint, bottomCenterPoint)) {
            bufferPoint = bottomCenterBufferPoint;
        } else if(Z.Coordinate.equals(nearestPoint, middleLeftPoint)) {
            bufferPoint = middleLeftBufferPoint;
        }
        var nearestPoints = [bufferPoint, nearestPoint];
        return nearestPoints;
    },

    _topLeftPoint: function(width, height) {
        var placement = this.options['symbol']['shield-vertical-alignment'];
        var center = this._label.getCenter();
        var point = this._map.coordinateToScreenPoint(center);
        var mapOffset = this._map.offsetPlatform();
        if (placement === 'left') {
            return new Z.Point(
                    point['left'] - width + mapOffset['left'],
                    point['top'] - Math.round(height/2) + mapOffset['top']
                    );
        } else if (placement === 'top') {
            return new Z.Point(
                    point['left'] - Math.round(width/2) + mapOffset['left'],
                    point['top'] - height + mapOffset['top']
                );
        } else if (placement === 'right') {
            return new Z.Point(
                    point['left'] + mapOffset['left'],
                    point['top'] - Math.round(height/2) + mapOffset['top']
                );
        } else if(placement === 'bottom') {
            return new Z.Point(
                    point['left'] - Math.round(width/2) + mapOffset['left'],
                    point['top'] + mapOffset['top']
                );
        } else {//center
            return new Z.Point(
                    point['left'] - Math.round(width/2) + mapOffset['left'],
                    point['top'] - Math.round(height/2) + mapOffset['top']
                );
        }
    },

    _changeLinkPath: function() {
        var center = this._target.getCenter();
        var nearestPoints = this._getNearestPoint(center);
        var path = [center, nearestPoints[0], nearestPoints[1]];
        var strokeSymbol = {
            'line-color': '#ff0000',
            'line-width': this.options['symbol']['shield-line-width']
        };
        this._link.setSymbol(strokeSymbol);
        this._link.setCoordinates(path);
    },

    _changeLabelPosition: function(event) {
        this._target = event['target'];
        this._label.setCoordinates(this._target.getCenter());
    },

    _onMouseDown: function(event) {
        Z.DomUtil.setStyle(this._labelContrainer, 'cursor: move');
        this._label.startDrag();
        this._map.disableDrag();
        this._map.disableDoubleClickZoom();
        if(this.options['link']) {
            this._map.on('mousemove zoomend resize moving', this._changeLinkPath, this);
        }
        this.fire('dragstart', {'target': this});
    },

    _endMove: function(event) {
        Z.DomUtil.setStyle(this._labelContrainer, 'cursor: default');
        if(this.options['link']) {
            this._map.off('mousemove zoomend resize moving', this._changeLinkPath, this);
            var strokeSymbol = {
                'line-color': this.options['symbol']['shield-line-color'],
                'line-width': this.options['symbol']['shield-line-width']
            };
            if(this._link) {
                this._link.setSymbol(strokeSymbol);
            }
        }
        this.fire('dragend', {'target': this});
    },

    _recoverMapEvents: function() {
        this._map.enableDrag();
        this._map.enableDoubleClickZoom();
    },

    _getInternalLayer: function(map, layerId, canvas) {
        if(!map) {return;}
        var layer = map.getLayer(layerId);
        if(!layer) {
            if(canvas) {
                layer = new Z.VectorLayer(layerId,{'render':'canvas'});
            } else {
                layer = new Z.VectorLayer(layerId);
            }
            map.addLayer(layer);
        }
        return layer;
    }

});
Z['GeoUtils']=Z.GeoUtils={
    distanceToSegment: function(p, p1, p2) {
        var x = p.left,
            y = p.top,
            x1 = p1.left,
            y1 = p1.top,
            x2 = p2.left,
            y2 = p2.top;

        var cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
        if (cross <= 0) {
            // P->P1
            return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
        }
        var d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (cross >= d2) {
            // P->P2
            return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
        }
        var r = cross / d2;
        var px = x1 + (x2 - x1) * r;
        var py = y1 + (y2 - y1) * r;
        // P->P(px,py)
        return Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
    },

    pointInsidePolygon: function(p, points) {
        var i, j, p1, p2,
            len = points.length;
        var c = false;

        for (i = 0, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];

            if (((p1.top > p.top) !== (p2.top > p.top)) &&
                (p.left < (p2.left - p1.left) * (p.top - p1.top) / (p2.top - p1.top) + p1.left)) {
                c = !c;
            }
        }

        return c;
    },

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
            var extent = geo._getPrjExtent();
            extent = Z.Extent.expand(extent,tolerance);
            if(!this.isPointInRect(point, extent)){
                return -1;
            }
            var pts = geo._getPrjPoints();
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
     * @expose
     */
    getGeometry: function() {
        return this.geometry;
    },

    /**
     * 获取SpatialFilter的json
     * @return {String} spatialfilter
     * @expose
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
     * @expose
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
     * @expose
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
     * @expose
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

})();
