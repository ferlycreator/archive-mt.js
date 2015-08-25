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
