Z.TextMarkerSymbolizer = Z.PointSymbolizer.extend({
    defaultSymbol:{
        "textFaceName"    : "arial",
        "textSize"         : 10,
        "textFill"         : "#000000",
        "textOpacity"      : 1,
        "textHaloFill"    : "#ffffff",
        "textHaloRadius"  : 0,
        "textWrapWidth"   : null,
        "textWrapCharacter": "",
        "textLineSpacing": 0,

        "textDx"           : 0,
        "textDy"           : 0,

        "textHorizontalAlignment" : "middle", //left | middle | right | auto
        "textVerticalAlignment"   : "middle",   // top | middle | bottom | auto
        "textAlign"                : "center" //left | right | center | auto
    },

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.renderPoints = this._getRenderPoints();
        this.style = this.translate();
        this.strokeAndFill = this.translateStrokeAndFill(this.style);
        var props = this.geometry.getProperties();
        this.textContent = Z.StringUtil.content(this.style['textName'], props);
        this.textSize = Z.StringUtil.stringLength(this.textContent,this.style['textFaceName'],this.style['textSize']);
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
            return map._viewPointToContainerPoint(point);
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
            size = this.textSize;
        var alignW, alignH;
        if (style['textHorizontalAlignment'] === 'left') {
            alignW = this.textSize['width'];
        } else if (style['textHorizontalAlignment'] === 'middle') {
            alignW = this.textSize['width']/2;
        } else if (style['textHorizontalAlignment'] === 'right') {
            alignW = 0;
        }
        if (style['textVerticalAlignment'] === 'top') {
            alignH = this.textSize['height'];
        } else if (style['textVerticalAlignment'] === 'middle') {
            alignH = this.textSize['height']/2;
        } else if (style['textVerticalAlignment'] === 'bottom') {
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
    },
    /**
     * 生成文字标注
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
    }
});



Z.TextMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (!Z.Util.isNil(symbol['textName'])) {
        return true;
    }
    return false;
};
