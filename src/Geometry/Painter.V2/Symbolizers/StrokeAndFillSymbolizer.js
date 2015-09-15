Z.StrokeAndFillSymbolizer = Z.Symbolizer.extend({

    defaultSymbol:{
        "stroke" : "#474cf8",
        "stroke-width" : 3,
        "stroke-opacity" : 1,
        "stroke-dasharray": [],
        "stroke-linecap" : "butt", //“butt”, “square”, “round”
        "stroke-linejoin" : "round", //“bevel”, “round”, “miter”
        "fill": "#ffffff",
        "fill-opacity": 0
    },

    initialize:function(strokeAndFillSymbol, geometry) {
        this.strokeAndFillSymbol = strokeAndFillSymbol;
        this.geometry = geometry;
    },

    svg:function(container, vectorContainer, zIndex) {
        var svgPath = this.geometry._getRenderPath();
        if (!this.svgDom) {
            var svgPaper = vectorContainer;//this.getMap()._getSvgPaper();
            this.svgDom = Z.SVG.path(svgPath);
            svgPaper.appendChild(this.svgDom);
        } else {
            Z.SVG.updatePath(this.svgDom, svgPath);
        }
        var style = this.translate();
        if (this.geometry instanceof Z.Polygon) {
            Z.SVG.updateShapeStyle(this.svgDom, style['stroke'], style['fill']);
        } else {
            Z.SVG.updateShapeStyle(this.svgDom, style['stroke'], {"fill": "#ffffff","fill-opacity": 0});
        }

    },

    canvas:function(ctx, resources) {
        var canvasResources = this.geometry._getRenderCanvasResources();
        var style = this.translate();
        Z.Canvas.setDefaultCanvasSetting(ctx);
        if (this.geometry instanceof Z.Polygon) {
            Z.Canvas.prepareCanvas(ctx, style['stroke'], style['fill'], resources);
        } else {
            Z.Canvas.prepareCanvas(ctx, style['stroke'], null);
        }
        canvasResources['fn'].apply(this, [ctx].concat(canvasResources['context']));
        if (this.geometry instanceof Z.Polygon) {
            Z.Canvas.fillCanvas(ctx, style['fill']);
        }
    },

    refresh:function() {
        var layer = this.geometry.getLayer();
        if (!layer.isCanvasRender()) {
            this.symbolize();
        }
    },

    translate:function() {
        var s = this.strokeAndFillSymbol;
        var d = this.defaultSymbol;
        var result = {
            "stroke" :{
                "stroke" : Z.Util.setDefaultValue(s['line-color'], d['stroke']),
                "stroke-width" : Z.Util.setDefaultValue(s['line-width'], d['stroke-width']),
                "stroke-opacity" : Z.Util.setDefaultValue(s['line-opacity'], d['stroke-opacity']),
                "stroke-dasharray": Z.Util.setDefaultValue(s['line-dasharray'], d['stroke-dasharray']),
                "stroke-linecap" : Z.Util.setDefaultValue(s['line-cap'], d['stroke-linecap']),
                "stroke-linejoin" : Z.Util.setDefaultValue(s['line-join'], d['stroke-linejoin'])
            },

            "fill" : {
                "fill": Z.Util.setDefaultValue(s['polygon-fill'] || s['polygon-pattern-file'], d['fill']),
                "fill-opacity": Z.Util.setDefaultValue(s['polygon-opacity'], d['fill-opacity'])
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

Z.StrokeAndFillSymbolizer.test=function(geometry,symbol) {
    if (!geometry) {
        return false;
    }
    if (geometry instanceof Z.Marker) {
        return false;
    }
    return true;
};