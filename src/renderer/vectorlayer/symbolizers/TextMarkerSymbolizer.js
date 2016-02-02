Z.symbolizer.TextMarkerSymbolizer = Z.symbolizer.PointSymbolizer.extend({
    defaultSymbol:{
        "textFaceName"      : "arial",
        "textSize"          : 10,
        "textFont"          : null,
        "textFill"          : "#000000",
        "textOpacity"       : 1,
        "textHaloFill"      : "#ffffff",
        "textHaloRadius"    : 0,
        "textWrapWidth"     : null,
        "textWrapCharacter" : "",
        "textLineSpacing"   : 0,

        "textDx"            : 0,
        "textDy"            : 0,

        "textHorizontalAlignment" : "middle", //left | middle | right | auto
        "textVerticalAlignment"   : "middle",   // top | middle | bottom | auto
        "textAlign"               : "center" //left | right | center | auto
    },

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.style = this.translate();
        this.strokeAndFill = this.translateStrokeAndFill(this.style);
        var props = this.geometry.getProperties();
        this.textContent = Z.StringUtil.content(this.style['textName'], props);
        this.textDesc = Z.StringUtil.splitTextToRow(this.textContent, this.style);
    },

    symbolize:function(ctx, resources) {
        var cookedPoints = this._getRenderContainerPoints();
        if (!Z.Util.isArrayHasData(cookedPoints)) {
            return;
        }
        var style = this.style,
            textContent = this.textContent,
            strokeAndFill = this.strokeAndFill;
        this._prepareContext(ctx);
        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'], strokeAndFill['fill'], resources);
        Z.Canvas.prepareCanvasFont(ctx,style);

        for (var i = 0, len=cookedPoints.length;i<len;i++) {
            Z.Canvas.text(ctx, textContent, cookedPoints[i], style, this.textDesc);
        }
    },

    getPlacement:function() {
        return this.symbol['textPlacement'];
    },

    getDxDy:function() {
        var s = this.style;
        var dx = s['textDx'],
            dy = s['textDy'];
        return new Z.Point(dx, dy);
    },

    getMarkerExtent:function() {
        var dxdy = this.getDxDy(),
            style = this.style,
            size = this.textDesc['size'];
        var alignPoint = Z.StringUtil.getAlignPoint(size, style['textHorizontalAlignment'], style['textVerticalAlignment']);
        var alignW = alignPoint.x, alignH = alignPoint.y;
        return new Z.Extent(
            dxdy.add(new Z.Point(alignW, alignH)),
            dxdy.add(new Z.Point(alignW+size['width'],alignH+size['height']))
        );
    },

    translate:function() {
        var s = this.symbol;
        var d = this.defaultSymbol;
        var result = {};
        for (var p in d) {
            if (d.hasOwnProperty(p)) {
                result[p] = Z.Util.getValueOrDefault(s[p],d[p]);
            }
        }
        result['textName'] = s['textName'];
        return result;
    },

    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['textHaloRadius']?s['textHaloFill']:s['textFill'],
                "stroke-width" : s['textHaloRadius'],
                "stroke-opacity" : s['textOpacity'],
                "stroke-dasharray": null,
                "stroke-linecap" : "butt",
                "stroke-linejoin" : "round"
            },

            "fill" : {
                "fill"          : s["textFill" ],
                "fill-opacity"  : s["textOpacity"]
            }
        };
        //vml和svg对linecap的定义不同
        if (result['stroke']['stroke-linecap'] === "butt") {
            if (Z.Browser.vml) {
                result['stroke']['stroke-linecap'] = "flat";
            }
        }
        return result;
    }
});



Z.symbolizer.TextMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    var layer = geometry.getLayer();
    if (!layer || !layer.isCanvasRender()) {
        return false;
    }
    if (!Z.Util.isNil(symbol['textName'])) {
        return true;
    }
    return false;
};

Z.symbolizer.TextMarkerSymbolizer.getFont=function(style) {
    if (style['textFont']) {
        return style['textFont'];
    } else {
        return style['textSize']+'px '+style['textFaceName'];
    }
};
