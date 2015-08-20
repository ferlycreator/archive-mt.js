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
        "stroke":"#000000",
        "strokewidth": 2
    },

    defaultFillSymbol:{
        "fillopacity":0
    },

    _ISURL: /^url\(['"]?(.+?)['"]?\)$/i,

    createContainer:function() {},

    refreshContainer:function() {},

    refreshVector:function() {},

    refreshTextVector:function() {},

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

Z.SVG.SVG = {
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

    refreshTextVector:function(vector, vectorBean) {
        if (!vector || !vectorBean) {
            return;
        }
        var texts = vectorBean['texts'];
        if (!texts&&texts.length==0) {
            return;
        }

        for(var i=0,len=texts.length;i<len;i++) {
            var text = texts[i];
            var location = text['location'];
            vector.setAttribute('x', location[0]);
            vector.setAttribute('y', location[1]);
        }
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

    addVector:function(container, vectorBean, strokeSymbol, fillSymbol, iconSymbol) {
        var vector;
        //path
        if(vectorBean['path']) {
            var pathId = Z.Util.GUID() + '_VECTOR_PATH_ID';
            vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            vector.setAttribute('id', pathId);
            vector.setAttribute('d', vectorBean['path']);
            Z.SVG.refreshVectorSymbol(vector, strokeSymbol, fillSymbol, container);
            container.appendChild(vector);
        }
        //text
        var texts = vectorBean['texts'];
        if(texts) {
            vector = this._addTextToVector(container, texts, iconSymbol);
        }
        return vector;
    },

    _addTextToVector: function(container, texts, iconSymbol) {
        var textElement;
        var font = iconSymbol['font'];
        var size = iconSymbol['size'];
        var width = iconSymbol['textwidth'];
        var padding = iconSymbol['padding'];
        var color = iconSymbol['color'];
        var opacity = iconSymbol['textopacity'];
        var align = iconSymbol['align'];
        var vertical = iconSymbol['vertical'];
        var horizontal = iconSymbol['horizontal'];
        var placement = iconSymbol['placement'];
        if(!placement) {
            placement = 'point';
        }

        var textStyle = 'font-family:' + font + ';' +
                        'font-size:' + size + ';' +
                        'width:' + width + ';' +
                        'fill:' + color + ';' +
                        'opacity:' + opacity + ';' +
                        'padding:' + padding + ';' +
                        'text-align:' + align + ';';
        if(texts && texts.length>0){
            for(var i=0,len=texts.length;i<len;i++) {
                var text = texts[i];
                var location = text['location'];
                var content = text['content'];
                var textNode = document.createTextNode(content);
                textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textElement.setAttribute('x', location[0]);
                textElement.setAttribute('y', location[1]);
                textElement.setAttribute('style', textStyle);
                if ('line' === placement) {
                    var textPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
                    textPathElement.setAttribute('xlink:href', pathId);
                    textPathElement.appendChild(textNode);
                    textElement.appendChild(textPathElement);
                } else if ('point' === placement) {
                    textElement.appendChild(textNode);
                }
                container.appendChild(textElement);
            }
        }
        return textElement;
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

        if (vmlShape.stroke) {
            Z.Util.removeDomNode(vmlShape.stroke);
            delete vmlShape.stroke;
        }

        var stroke = Z.SVG.create('stroke');
        if (strokeSymbol['strokewidth']) {
            stroke.weight = strokeSymbol['strokewidth'] + 'px';
        }
        if (strokeSymbol['stroke']) {
            stroke.color = strokeSymbol['stroke'];
        }
        if (strokeSymbol['strokeopacity']) {
            stroke.opacity = strokeSymbol['strokeopacity'];
        }
        if (strokeSymbol['strokedasharray']) {
            stroke.dashStyle = strokeSymbol['strokedasharray'];
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
            if (!Z.Util.isNil(fillSymbol['fillopacity'])) {
                fill.opacity = fillSymbol['fillopacity'];
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
    refreshVector: function(vmlShape, vectorBean) {
        if (!vmlShape || !vectorBean) {
            return;
        }
        var path = vectorBean['path'];
        if (!path) {

            return;
        }
        vmlShape.path['v'] = path;
    },

    refreshTextVector:function(vector, vectorBean) {
        if (!vector || !vectorBean) {
            return;
        }
        var texts = vectorBean['texts'];
        if (!texts&&texts.length==0) {
            return;
        }

        for(var i=0,len=texts.length;i<len;i++) {
            var text = texts[i];
            var location = text['location'];
            vector.style.top = (location[1])+'px';
            vector.style.left = (location[0])+'px';
        }
    },

    addVector: function(container, vectorBean, strokeSymbol, fillSymbol, iconSymbol) {
        var vector;
        if (!container || !vectorBean) {
            return null;
        }
        vector = Z.SVG.create('shape');
        //以下三行不设置的话, IE8无法显示vml图形,原因不明
        vector.style.width='1px';
        vector.style.height='1px';
        vector['coordsize'] = '1 1';
        vector['coordorigin'] = '0 0';

        var _path = Z.SVG.create('path');
        if(_path) {
            _path.v = vectorBean['path'];
            vector.appendChild(_path);
            vector.path = _path;

            this.refreshVectorSymbol(vector, strokeSymbol, fillSymbol);
            container.appendChild(vector);
        }

        //text
        var texts = vectorBean['texts'];
        if(texts&&texts.length>0) {
            vector = this._addTextToVector(container, texts, iconSymbol);
        }
        return vector;
    },

    _addTextToVector: function(container, texts, iconSymbol) {
        var textElement;
        var font = iconSymbol['font'];
        var size = iconSymbol['size'];
        var width = iconSymbol['textwidth'];
        var padding = iconSymbol['padding'];
        var color = iconSymbol['color'];
        var opacity = iconSymbol['textopacity'];
        var align = iconSymbol['align'];
        var vertical = iconSymbol['vertical'];
        var horizontal = iconSymbol['horizontal'];
        var placement = iconSymbol['placement'];
        if(!placement) {
            placement = 'point';
        }
        var dx = parseInt(iconSymbol['dx'],0);
        var dy = parseInt(iconSymbol['dy'],0);
        if(texts && texts.length>0){
            for(var i=0,len=texts.length;i<len;i++) {
                var text = texts[i];
                var location = text['location'];
                var content = text['content'];
                textElement = Z.SVG.create('textbox');
                textElement.style.fontSize  = size +'px';
                textElement.style.color  = color;
                textElement.style.width  = width +'px';
                textElement.style.textAlign = align;
                textElement.style.top = (location[1])+'px';
                textElement.style.left = (location[0])+'px';
                textElement.innerHTML   = content;
                container.appendChild(textElement);
            }
        }
        return textElement;
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
    })();

if (Z.Browser.vml) {
    Z.Util.extend(Z.SVG, Z.SVG.VML);
} else if (Z.Browser.svg) {
    Z.Util.extend(Z.SVG, Z.SVG.SVG);
} else {
    //vml和svg都不支持
}
