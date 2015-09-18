Z.TextMarkerSymbolizer = Z.PointSymbolizer.extend({
    defaultSymbol:{
        "text-face-name"    : "arial",
        "text-size"         : 10,
        "text-fill"         : "#000000",
        "text-opacity"      : 1,
        "text-halo-fill"    : "#ffffff",
        "text-halo-radius"  : 0,

        "text-dx"           : 0,
        "text-dy"           : 0,

        "text-horizontal-alignment" : "middle", //left | middle | right | auto
        "text-vertical-alignment"   : "middle",   // top | middle | bottom | auto
        "text-align"                : "center" //left | right | center | auto
    },

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.renderPoints = this._getRenderPoints();
        this.style = this.translate();
        this.strokeAndFill = this.translateStrokeAndFill(this.style);
        this.textContent = this._convertContent(this.style['text-name']);
        this.textSize = Z.Util.stringLength(this.textContent,this.style['text-face-name'],this.style['text-size']);
    },

    svg:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(vectorcontainer,zIndex);
    },

    canvas:function(ctx, resources) {
        var points = this.renderPoints;
        if (!Z.Util.isArrayHasData(points)) {
            return;
        }
        var map = this.getMap();
        var cookedPoints = Z.Util.eachInArray(points,this,function(point) {
            return map._domOffsetToScreen(point);
        });
        Z.Canvas.setDefaultCanvasSetting(ctx);

        var style = this.style,
            textContent = this.textContent,
            size = this.textSize,
            strokeAndFill = this.strokeAndFill;

        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'], strokeAndFill['fill'], resources);
        Z.Canvas.prepareCanvasFont(ctx,style);

        for (var i = 0, len=cookedPoints.length;i<len;i++) {
            Z.Canvas.text(ctx, textContent, cookedPoints[i], style,size);
        }
    },

    getPlacement:function() {
        return this.symbol['text-placement'];
    },

    getDxDy:function() {
        var s = this.style;
        var dx = s['text-dx'],
            dy = s['text-dy'];
        return new Z.Point(dx, dy);
    },

    getMarkerExtent:function() {
        var dxdy = this.getDxDy(),
            style = this.style,
            size = this.textSize;
        var alignW, alignH;
        if (style['text-horizontal-alignment'] === 'left') {
            alignW = this.textSize['width'];
        } else if (style['text-horizontal-alignment'] === 'middle') {
            alignW = this.textSize['width']/2;
        } else if (style['text-horizontal-alignment'] === 'right') {
            alignW = 0;
        }
        if (style['text-vertical-alignment'] === 'top') {
            alignH = this.textSize['height'];
        } else if (style['text-vertical-alignment'] === 'middle') {
            alignH = this.textSize['height']/2;
        } else if (style['text-vertical-alignment'] === 'bottom') {
            alignH = 0;
        }
        return new Z.Extent(
                    dxdy.add(new Z.Point(alignW, alignH)),
                    dxdy.add(new Z.Point(alignW-size['width'],alignH-size['height']))
                );
    },

    translate:function() {
        var s = this.symbol;
        var d = this.defaultSymbol;
        var result = {};
        for (var p in d) {
            if (d.hasOwnProperty(p)) {
                result[p] = Z.Util.setDefaultValue(s[p],d[p]);
            }
        }
        result['text-name'] = s['text-name'];
        return result;
    },

    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['text-halo-radius']?s['text-halo-fill']:s['text-fill'],
                "stroke-width" : s['text-halo-radius'],
                "stroke-opacity" : s['text-opacity'],
                "stroke-dasharray": null,
                "stroke-linecap" : "butt",
                "stroke-linejoin" : "round"
            },

            "fill" : {
                "fill"          : s["text-fill" ],
                "fill-opacity"  : s["text-opacity"]
            }
        };
        //vml和svg对linecap的定义不同
        if (result['stroke']['stroke-linecap'] === "butt") {
            if (Z.Browser.vml) {
                result['stroke']['stroke-linecap'] = "flat";
            }
        }
        return result;
    },
    /**
     * 生成图片标注
     * @param point
     */
    createMarkerDom: function() {
        var style = this.style,
            textContent = this.textContent,
            size = this.textSize,
            strokeAndFill = this.strokeAndFill;

        var svgText = Z.SVG.text(textContent, style, size);
        Z.SVG.updateTextStyle(svgText, style, size);
        Z.SVG.updateShapeStyle(svgText, strokeAndFill['stroke'], strokeAndFill['fill']);
        return svgText;
    },

    _convertContent:function(content) {
        var regex = /\[.*\]/gi;
        if(regex.test(content)) {
            var arr = content.match(regex);
            if(arr&&arr.length>0) {
                var props = this.geometry.getProperties();
                var key = arr[0].substring(1,arr[0].length-1);
                if(props) {
                    if(props[key]) {
                        return content.replace(regex, props[key]);
                    }
                }
            }
        }
        return content;
    }
});



Z.TextMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (!Z.Util.isNil(symbol['text-name'])) {
        return true;
    }
    return false;
};