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
        var domOffset = map._offsetPlatform();
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
        /**var key;
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
        }*/
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
//        Z.SVG.refreshVectorSymbol(vector, strokeSymbol, fillSymbol, container);
        if(vector) {
            container.appendChild(vector);
        }
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
        if(!padding) {
            padding = 0;
        }
        if(!lineSpacing) {
            lineSpacing = 8;
        }
        var textStyle = 'font-family:' + font + ';' +
                        'font-size:' + size + ';' +
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

            textElement.setAttribute('x', location[0]);
            textElement.setAttribute('y', location[1] + lineSpacing + size);
            textElement.setAttribute('style', textStyle);
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
       /** if (!vmlShape) {
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
        }*/
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
        var text = vectorBean['text'];
        if (!text&&text.length==0) {
            return;
        }
        var location = text['location'];
        vector.style.top = (location[1])+'px';
        vector.style.left = (location[0])+'px';
    },

    refreshShieldVector: function(vector, vectorBean) {
        this.refreshTextVector(vector, vectorBean);
    },

    addVector: function(container, vectorBean, strokeSymbol, fillSymbol) {
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
            //this.refreshVectorSymbol(vector, strokeSymbol, fillSymbol);
            container.appendChild(vector);
        }
        return vector;
    },


    addTextVector: function(container, vectorBean, iconSymbol) {
        var rectElement;
        var font = iconSymbol['font'];
        var fontSize = (!iconSymbol['size'])?12:iconSymbol['size'];
        var width = iconSymbol['textWidth'];
        var padding = (!iconSymbol['padding'])?0:iconSymbol['padding'];
        var color = iconSymbol['color'];
        var opacity = iconSymbol['textOpacity'];
        var align = iconSymbol['textAlign'];
        var vertical = iconSymbol['vertical'];
        var horizontal = iconSymbol['horizontal'];
        var placement = (!iconSymbol['placement'])?'point':iconSymbol['placement'];
        var lineSpacing = (!iconSymbol['lineSpacing'])?8:iconSymbol['lineSpacing'];

        var stroke = (!iconSymbol['stroke'])?'#000000':iconSymbol['stroke'];
        var strokeWidth = iconSymbol['strokeWidth'];
        var strokeOpacity = (!iconSymbol['strokeOpacity'])?1:iconSymbol['strokeOpacity'];
        var fill = (!iconSymbol['fill'])?'#ffffff':iconSymbol['fill'];
        var fillOpacity = (!iconSymbol['fillOpacity'])?1:iconSymbol['fillOpacity'];

        var dx = parseInt(iconSymbol['dx'],0);
        var dy = parseInt(iconSymbol['dy'],0);
        var text = vectorBean['text'];
        if(text){
            var location = text['location'];
            var content = text['content'];
            var size = fontSize/2;
            var textWidth = Z.Util.getLength(content)*size;

            var textElement = Z.SVG.create('textbox');
            textElement.style.fontSize  = fontSize +'px';
            textElement.style.color  = color;
            textElement.style.width  = textWidth +'px';
            textElement.style.textAlign = align;
            var resultStr = content;
            if(textWidth>width){
                 var contents = Z.Util.splitContent(content, textWidth, size, width);
                 var result = '';
                 for(var i=0,len=contents.length;i<len;i++){
                    var content = contents[i];
                    resultStr += content+'<br/>';
                 }
            }
            textElement.innerHTML   = resultStr;
            if(stroke || fill) {
                rectElement = Z.SVG.create('rect');
                rectElement.style.fillColor  = fill;
                rectElement.style.strokeColor  = stroke;
                rectElement.style.strokeWeight  = strokeWidth +'px';
                rectElement.style.left = (location[0])+'px';
                rectElement.style.top = (location[1] + lineSpacing + size)+'px';
                rectElement.appendChild(textElement);
            } else {
                textElement.style.left = (location[0])+'px';
                textElement.style.top = (location[1] + lineSpacing + size)+'px';
                rectElement = textElement;
            }
            container.appendChild(rectElement);
        }
        return rectElement;
    },

    addShieldVector: function(container, vectorBean, strokeSymbol, fillSymbol, shieldSymbol) {
        return this.addTextVector(container, vectorBean, shieldSymbol);
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
