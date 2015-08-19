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
        "stroke-width": 2
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
        //path
        var pathId = Z.Util.GUID() + '_VECTOR_PATH_ID';
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', pathId);
        path.setAttribute('d', vectorBean['path']);
        Z.SVG.refreshVectorSymbol(path, strokeSymbol, fillSymbol, container);
        container.appendChild(path);
        //text
        var texts = vectorBean['texts'];

        var font = iconSymbol['font'];
        var size = iconSymbol['size'];
        var width = iconSymbol['width'];
        var padding = iconSymbol['padding'];
        var color = iconSymbol['color'];
        var opacity = iconSymbol['opacity'];
        var align = iconSymbol['align'];
        var vertical = iconSymbol['vertical'];
        var horizontal = iconSymbol['horizontal'];
        var placement = iconSymbol['placement'];
        if(!placement) {
            placement = 'point';
        }
        var dx = iconSymbol['dx'];
        var dy = iconSymbol['dy'];

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
                var textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textElement.setAttribute('x', location[0] + dx);
                textElement.setAttribute('y', location[1] + dy);
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
        if (strokeSymbol['lineWidth']) {
            stroke.weight = strokeSymbol['lineWidth'] + 'px';
        }
        if (strokeSymbol['lineColor']) {
            stroke.color = strokeSymbol['lineColor'];
        }
        if (strokeSymbol['lineOpacity']) {
            stroke.opacity = strokeSymbol['lineOpacity'];
        }
        if (strokeSymbol['lineDasharray']) {
            stroke.dashStyle = strokeSymbol['lineDasharray'];
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
            if (!Z.Util.isNil(fillSymbol['fillOpacity'])) {
                fill.opacity = fillSymbol['fillOpacity'];
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

    addVector: function(container, vectorBean, strokeSymbol, fillSymbol) {
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
