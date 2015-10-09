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
    _ISURL: /^url\(['"]?(.+?)['"]?\)$/i,

    //Path中的闭合指令, svg中是Z, vml中是x, 默认为Z
    closeChar: (function() {
        if (Z.Browser.vml) {
            return 'x';
        } else {
            return 'Z';
        }
    })()
};

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

    path:function(path) {
        var svgShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgShape.setAttribute('d', path);
        return svgShape;
    },

    updatePath:function(svgShape, path) {
        if (!svgShape || !path) {
            return;
        }
        svgShape.setAttribute('d', path);
    },

    text:function(text, style, size) {
        //TODO 改为textpath
        var font = style['textFaceName'];
        var fontSize = style['textSize'];
        var svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        var textStyle = 'font-family:' + font + ';' +
                        'font-size:' + fontSize + ';' +
                        'fill:' + style['textFill'] + ';' +
                        'opacity:' + style['textOpacity'] + ';' +
                        'text-align:' + style['textAlign'] + ';';
        svgText.setAttribute('style', textStyle);

        var dx = style['textDx'],dy = style['textDy'];
        var lineSpacing = style['textLineSpacing'];
        var wrapChar = style['textWrapCharacter'];
        var textWidth = Z.Util.stringLength(text,font,fontSize).width;
        var wrapWidth = style['textWrapWidth'];
        if(!wrapWidth) wrapWidth = textWidth;
        if(wrapChar){
            var texts = text.split(wrapChar);
            for(var i=0,len=texts.length;i<len;i++) {
                var t = texts[i];
                var tWidth = Z.Util.stringLength(t,font,fontSize).width;
                if(tWidth>wrapWidth) {
                    svgText = this._splitTextToTSpan(svgText, text, textWidth, fontSize, wrapWidth, dx, dy, lineSpacing);
                } else {
                    var textNode = this._createtspan(t, dx, dy);
                    if(i===0) {
                        textNode = this._createtspan(t, 0, 0);
                    }
                    svgText.appendChild(textNode);
                }
                dy += fontSize+lineSpacing;
            }
        } else {
            if(textWidth>wrapWidth) {
               svgText = this._splitTextToTSpan(svgText, text, textWidth, fontSize, wrapWidth, dx, dy, lineSpacing);
            } else {
                var textNode = document.createTextNode(text);
                svgText.appendChild(textNode);
            }
        }
        return svgText;
    },

    _splitTextToTSpan:function(svgText, text, textWidth, fontSize, wrapWidth, x, y,lineSpacing) {
        var contents = Z.Util.splitContent(text, textWidth, fontSize, wrapWidth);
        for(var i=0,len=contents.length;i<len;i++){
            var content = contents[i];
            var tspan = this._createtspan(content,x,y);
            if(i===0) {
                tspan = this._createtspan(content, 0, 0);
            }
            svgText.appendChild(tspan);
            y += fontSize+lineSpacing;
        }
        return svgText;
    },

    _createtspan: function(content, x, y) {
        var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', x);
        tspan.setAttribute('y', y);
        var textNode = document.createTextNode(content);
        tspan.appendChild(textNode);
        return tspan;
    },

    updateLabelStyle:function(svgText, style, size) {
        svgText.setAttribute('dx', style['textDx']);
        svgText.setAttribute('dy', style['textDy']);
    },

    updateTextStyle:function(svgText, style, size) {
        svgText.setAttribute('font-size', style['textSize']);
        svgText.setAttribute('font-family', style['textFaceName']);
        var textAnchor = style['textHorizontalAlignment'];
        if (textAnchor === 'left') {
            textAnchor = 'start';
        } else if (textAnchor === 'right') {
            textAnchor = 'end';
        }
        svgText.setAttribute('font-weight','bold');
        svgText.setAttribute('text-anchor', textAnchor);
        svgText.setAttribute('text-align', style['textAlign']);

        svgText.setAttribute('dx',0);
        var hAlign = style['textVerticalAlignment'];
        if (hAlign === 'bottom') {
            svgText.setAttribute('dy',size['height']);
        } else if (hAlign === 'middle') {
            svgText.setAttribute('dy',size['height']/2);
        } else {
            svgText.setAttribute('dy',-size['height']);
        }
    },

    image:function(url, width, height) {
        var svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        var xlink = "http://www.w3.org/1999/xlink";
        svgImage.setAttributeNS(xlink, 'href', url);
        if (!Z.Util.isNil(width)) {
            svgImage.setAttribute('width', width);
        }
        if (!Z.Util.isNil(height)) {
            svgImage.setAttribute('height', height);
        }
        return svgImage;
    },

    group:function() {
        var svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        return svgGroup;
    },

    updateShapeStyle:function(svgShape, strokeSymbol, fillSymbol, paper) {
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
                        var pattern = Z.SVG.SVG.fillWithPattern(isUrl, svgShape, paper);
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
        function create(_el) {
            var el = document.createElementNS("http://www.w3.org/2000/svg", _el);
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
        var imgSrc = isUrl[1];
        var pattern;
        if (!paper['_maptalks_patterns']) {
            paper['_maptalks_patterns']={};
        } else {
            pattern = paper['_maptalks_patterns'][imgSrc];
        }
        if (!pattern) {
            //不重复定义pattern.
            var uid = Z.Util.GUID();
            pattern = create('pattern');
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
                "xlink:href": imgSrc
            });

            pattern.appendChild(image);

            // svgShape._pattern = pattern;

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
            paper['_maptalks_patterns'][imgSrc] = pattern;
        }

        return "url(#" + pattern.id + ")";

    },

    removeVector:function(_container, svgShape) {
        //如果是模式填充, 需要删除模式定义元素
        /*if (svgShape._pattern) {
            Z.DomUtil.removeDomNode(svgShape._pattern);
        }*/
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

    path: function(path) {
        var vmlShape = Z.SVG.create('shape');
        //以下三行不设置的话, IE8无法显示vml图形,原因不明
        vmlShape.style.width = '1px';
        vmlShape.style.height = '1px';
        vmlShape['coordsize'] = '1 1';
        vmlShape['coordorigin'] = '0 0';
        var pathDom = Z.SVG.create('path');
        pathDom.v = path+'';
        vmlShape.appendChild(pathDom);
        vmlShape.path = pathDom;
        return vmlShape;
    },

     /**
     * 更新矢量图形的图形属性
     */
    updatePath: function(vmlShape, path) {
        vmlShape.path['v'] = path;
    },

    text:function(text, style, size) {
        var font = style['textFaceName'];
        var fontSize = style['textSize'];

        var dx = style['textDx'],dy = style['textDy'];
        var lineSpacing = style['textLineSpacing'];
        var wrapChar = style['textWrapCharacter'];
        var textWidth = Z.Util.stringLength(text,font,fontSize).width;
        var wrapWidth = style['textWrapWidth'];
        if(!wrapWidth) wrapWidth = textWidth;
        var vmlText;
        if(wrapChar) {
            var content = Z.Util.replaceAll(text, wrapChar, '<br/>');
            vmlText = this._createTextbox(content, style);
        } else {
            if(textWidth>wrapWidth) {
               var contents = Z.Util.splitContent(text, textWidth, fontSize, wrapWidth);
               var contentStr = '';
               for(var i=0,len=contents;i<len;i++) {
                    contentStr +=contents[i]+'<br/>';
               }
               vmlText = this._createTextbox(contentStr, style);
            } else {
                vmlText = this._createTextPath(style);
            }
        }
        return vmlText;
    },

    _createTextbox: function(content, style) {
        var font = style['textFaceName'];
        var fontSize = style['textSize'];
        var color = style['textFill'];
        var textWidth = style['textWrapWidth'];
        var align = style['textAlign'];
        textbox = Z.SVG.create('v:textbox');
        textbox.style.fontSize  = fontSize +'px';
        textbox.style.color  = color;
        textbox.style.width  = textWidth +'px';
        textbox.style.textAlign = align;
        textbox.innerHTML   = content;
        return textbox;

    },

    _createTextPath: function(style) {
        var vmlShape = Z.SVG.create('shape');
        vmlShape.style.width = '1px';
        vmlShape.style.height = '1px';
        vmlShape['coordsize'] = '1 1';
        vmlShape['coordorigin'] = '0 0';

        var vmlPath = Z.SVG.create('path');
        var vmlText = Z.SVG.create('textpath');
        vmlShape.appendChild(vmlPath);
        vmlShape.appendChild(vmlText);

        var startx, starty;
        var hAlign = style['textHorizontalAlignment'];
        if (hAlign === 'right') {
            startx = -size['width'];
        } else if (hAlign === 'middle') {
            startx = -size['width']/2;
        } else {
            startx = 0;
        }
        var vAlign = style['textVerticalAlignment'];
        if (vAlign === 'top') {
            starty = size['height']/2;
        } else if (vAlign === 'middle') {
            starty = 0;
        } else {
            starty = -size['height']/2;
        }

        vmlShape.path = 'm '+Math.round(startx)+','+Math.round(starty)+' l '+Math.round(startx+size['width'])+','+Math.round(starty)+' e';
        vmlPath.textpathok=true;
        vmlText.on=true;
        vmlText.fitpath = true;
        vmlText.string=text;
        vmlShape.textNode = vmlText;
        return vmlShape;
    },

    updateLabelStyle:function(vmlShape, style, size) {
//        this.updateTextStyle(vmlShape, style, size);
    },

    updateTextStyle:function(vmlShape, style, size) {
        var svgText = vmlShape.textNode;
        svgText.style.fontWeight = 'bold';
        svgText.style.fontSize=style['textSize'];
        svgText.style.fontFamily=style['textFaceName'];
        svgText.style['v-text-align'] = style['textAlign'];
    },

    image:function(url, width, height) {
        var svgImage = Z.SVG.create('image');
        svgImage.src = url;
        if (!Z.Util.isNil(width) && !Z.Util.isNil(height)) {
            svgImage.style.cssText = 'width:'+width+'px;height:'+height+'px';
        }
        return svgImage;
    },

    group:function() {
        var vmlGroup = Z.SVG.create('group');
        vmlGroup.style.width = '1px';
        vmlGroup.style.height = '1px';
        vmlGroup['coordsize'] = '1 1';
        vmlGroup['coordorigin'] = '0 0';
        return vmlGroup;
    },

    //更新矢量图形样式
    updateShapeStyle:function(vmlShape, strokeSymbol, fillSymbol) {
        var stroke = vmlShape.strokeNode || Z.SVG.create('stroke');
        stroke.weight = strokeSymbol['stroke-width'] + 'px';
        stroke.color = strokeSymbol['stroke'];
        stroke.opacity = strokeSymbol['stroke-opacity'];
        if (Z.Util.isArrayHasData(strokeSymbol['stroke-dasharray'])) {
            stroke.dashstyle = strokeSymbol['stroke-dasharray'];
        }
        stroke.joinstyle = strokeSymbol['stroke-linejoin'];
        stroke.endcap = strokeSymbol['stroke-linecap'];
        if (strokeSymbol['stroke-pattern']) {
            stroke.src=strokeSymbol['stroke-pattern'];
        }
        if (!vmlShape.strokeNode) {
            vmlShape.appendChild(stroke);
        }
        vmlShape.strokeNode = stroke;

        if (fillSymbol) {
            var fill = vmlShape.fillNode || Z.SVG.create('fill');
            fill.on = true;
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
            if (!vmlShape.fillNode) {
                vmlShape.appendChild(fill);
            }
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

