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
            if (arr[i] === obj) {
                return i;
            }
        }
        return -1;
    },
    //判断a和b是否相同, 浅层判断, 不涉及子属性
    objEqual:function(a, b) {
        return Z.Util._objEqual(a,b);
    },
    //判断a和b是否相同, 深层判断, 子属性也必须相同,du
    objDeepEqual:function(a, b) {
        return Z.Util._objEqual(a,b, true);
    },
    /**
     * 判断两个对象是否类型相同, 值相同,或者属性相同
     * borrowed from expect.js
     * @param  {Object} a
     * @param  {Object} b
     * @param {Boolean} isDeep 是否深度判断
     * @return {Boolean}   true|false
     */
    _objEqual:function(a, b, isDeep) {
        function getKeys (obj) {
            if (Object.keys) {
              return Object.keys(obj);
            }
            var keys = [];
            for (var i in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, i)) {
                keys.push(i);
              }
            }
            return keys;
        }
        if (Z.Util.isNil(a) || Z.Util.isNil(b)) {
          return false;
        }
        // an identical "prototype" property.
        if (a.prototype !== b.prototype) {return false;}
        var ka, kb, key, i;
        try{
            ka = getKeys(a);
            kb = getKeys(b);
        } catch (e) {//happens when one is a string literal and the other isn't
          return false;
        }
        // having the same number of owned properties (keys incorporates hasOwnProperty)
        if (ka.length !== kb.length){
          return false;
        }
        //~~~cheap key test
        for (i = ka.length - 1; i >= 0; i--) {
          if (ka[i] != kb[i]){
            return false;
          }
        }
        //equivalent values for every corresponding key, and
        //~~~possibly expensive deep test
        if (isDeep) {
            for (i = ka.length - 1; i >= 0; i--) {
              key = ka[i];
              if (!Z.Util.objEqual(a[key], b[key])) {
                 return false;
              }
            }
        }
        return true;
    },

    /**
     * canvas坐标值处理
     * @param  {Number} num 坐标值
     * @return {Number}     处理后的坐标值
     */
    canvasRound:function(num) {
        return (0.5 + num) << 0; //结果 + 0.5 据说能变得平滑
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

    _strRuler:null,

    _getStrRuler:function(){
        if (!Z.Util._strRuler) {
            var span = document.createElement("span");
            span.style.cssText="position:absolute;left:-10000px;top:-10000px;";
            document.body.appendChild(span);
            Z.Util._strRuler = span;
        }

        return Z.Util._strRuler;
    },

    stringLength:function(text, font, fontSize) {
        var ruler = Z.Util._getStrRuler();
        ruler.style.fontFamily = font;
        ruler.style.fontSize = fontSize+'px';
        ruler.style.fontWeight = 'bold';
        ruler.innerHTML = text;
        return new Z.Size(ruler.clientWidth+1, ruler.clientHeight+1);
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

    splitContent: function(content, textWidth, size, length) {
        var rowNum = Math.ceil(textWidth/length);
        var fontSize = parseInt(length/size);
        var result = [];
        for(var i=0;i<rowNum;i++) {
            if(i < rowNum -1 ) {
                result.push(content.substring(i*fontSize, (i+1)*fontSize));
            } else {
                result.push(content.substring(i*fontSize));
            }
        }
        return result;
    },

    setDefaultValue: function(value, defaultValue) {
        return (Z.Util.isNil(value))?defaultValue:value;
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
     * 将带减号的名称转化为camel名称, 如foo-class -> fooClass
     * @param  {String} p 带减号名称
     * @return {String}   camel名称
     */
    convertMinusToCamel: function(str) {
        var re = /-([A-Za-z])/g;
        return str.replace(re, function (match, p1, offset, str) {
            return p1.toUpperCase();
        });
    },

    /**
     * 将camel名称转化为带减号的名称, 如fooClass -> foo-class
     * @param  {String} p camel名称
     * @return {String}   带减号名称
     */
    convertCamelToMinus: function(str) {
        var re = /([A-Z])/g;
        return str.replace(re, function (match, p1, offset, str) {
            if (offset > 0) {
                return '-' + p1.toLowerCase();
            }
            return p1.toLowerCase();
        });
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

    //borrowed from jquery, Evaluates a script in a global context
    globalEval: function( code ) {
        var script = document.createElement( "script" );

        script.text = code;
        document.head.appendChild( script ).parentNode.removeChild( script );
    },

    /**
    *获取异常信息
    *@param {String} exceptionStr
    *@param {Array} 参数数组
    *@return {String} 异常字符串
    */
    getExceptionInfo: function(exceptionStr, params) {
        if(!params) return exceptionStr;
        if(this.isString(params)) params = [params];
        if(this.isArray) {
            for(var i=0,len=params.length;i<len;i++) {
                exceptionStr = exceptionStr.replace('%'+(i+1), params[i]);
            }
        }
        return exceptionStr;
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
