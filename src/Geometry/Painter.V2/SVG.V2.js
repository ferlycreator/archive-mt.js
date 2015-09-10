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
        'strokeWidth': 2,
        'strokeDasharray': ''//'', '-', '.', '-.', '-..', '. ', '- ', '--', '- .', '--.', '--..'
    },

    defaultFillSymbol:{
        'fill': '#ffffff',
        'fillOpacity': 0
    },

    _ISURL: /^url\(['"]?(.+?)['"]?\)$/i
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

    createShapeDom:function(path) {
        var svgShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgShape.setAttribute('d', path);
        return svgShape;
    },

    updateShapeDom:function(svgShape, path) {
        if (!svgShape || !path) {
            return;
        }
        svgShape.setAttribute('d', path);
    },

    updateShapeStyle:function(svgShape, strokeSymbol, fillSymbol) {
        var key;

        if(Z.Util.isArrayHasData(strokeSymbol['stroke-dasharray'])) {
            strokeSymbol['stroke-dasharray'] = strokeSymbol['stroke-dasharray'].join(',');
        }

        for (key in strokeSymbol) {
            if (strokeSymbol.hasOwnProperty(key)) {
                svgShape.setAttribute(key, strokeSymbol[key]);
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
                        var pattern = Z.SVG.SVG.fillWithPattern(isUrl, svgShape, svgShape.parentNode);
                        svgShape.setAttribute(key, pattern);
                        continue;
                    }
                }
                svgShape.setAttribute(key, fillSymbol[key]);
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
    fillWithPattern:function(isUrl,svgShape,paper) {
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

        svgShape._pattern = pattern;

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

    removeVector:function(_container, svgShape) {
        //如果是模式填充, 需要删除模式定义元素
        if (svgShape._pattern) {
            Z.DomUtil.removeDomNode(svgShape._pattern);
        }
        if (_container && svgShape) {
            _container.removeChild(svgShape);
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

    createShapeDom: function(path) {
        var vmlShape;
        vmlShape = Z.SVG.create('shape');
        //以下三行不设置的话, IE8无法显示vml图形,原因不明
        vmlShape.style.width = '1px';
        vmlShape.style.height = '1px';
        vmlShape['coordsize'] = '1 1';
        vmlShape['coordorigin'] = '0 0';
        var path = Z.SVG.create('path');
        path.v = path;
        vmlShape.appendChild(path);
        vmlShape.path = path;
        return vmlShape;
    },

     /**
     * 更新矢量图形的图形属性
     */
    updateShapeDom: function(vmlShape, path) {
        vmlShape.path['v'] = path;
    },

    //更新矢量图形样式
    updateShapeStyle:function(vmlShape, strokeSymbol, fillSymbol) {
        var stroke = Z.SVG.create('stroke');
        stroke.weight = strokeSymbol['stroke-width'] + 'px';
        stroke.color = strokeSymbol['stroke'];
        stroke.opacity = strokeSymbol['stroke-opacity'];
        if (Z.Util.isArrayHasData(strokeSymbol['stroke-dasharray'])) {
            stroke.dashstyle = strokeSymbol['stroke-dasharray'];
        }
        stroke.joinstyle = strokeSymbol['stroke-linejoin'];
        stroke.endcap = strokeSymbol['stroke-linecap'];

        if (vmlShape.stroke) {
            Z.Util.removeDomNode(vmlShape.stroke);
        }
        vmlShape.appendChild(stroke);
        vmlShape.stroke = stroke;

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
            if (!Z.Util.isNil(fillSymbol['fill-opacity'])) {
                fill.opacity = fillSymbol['fill-opacity'];
            }

            if (vmlShape.fill) {
                Z.Util.removeDomNode(vmlShape.fill);
            }
            vmlShape.appendChild(fill);
            vmlShape.fill = fill;
        }
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

(function () {
    if (Z.Browser.vml) {
        Z.Util.extend(Z.SVG, Z.SVG.VML);
    } else if (Z.Browser.svg) {
        Z.Util.extend(Z.SVG, Z.SVG.SVG);
    }
})();

