Z.StrokeAndFillSymbolizer = Z.Symbolizer.extend({

    defaultSymbol:{
        "stroke" : "#474cf8",
        "stroke-width" : 3,
        "stroke-opacity" : 1,
        "stroke-dasharray": [],
        "stroke-linecap" : (function(){return Z.Browser.vml?"flat":"butt";})(), //“butt”, “square”, “round”
        "stroke-linejoin" : "round", //“bevel”, “round”, “miter”
        "fill": "#ffffff",
        "fill-opacity": 0
    },

    initialize:function(strokeAndFillSymbol, geometry) {
        this.strokeAndFillSymbol = strokeAndFillSymbol;
        this.geometry = geometry;
    },

    svg:function() {
        var svgPath = this.geometry._getSvgPath();
        if (!this.svgDom) {
            var svgPaper = this.getMap()._getSvgPaper();
            this.svgDom = Z.SVG.createShapeDom(svgPath);
            svgPaper.appendChild(this.svgDom);
        } else {
            Z.SVG.updateShapeDom(this.svgDom, svgPath);
        }
        var style = this.translate();
        if (this.geometry instanceof Z.Polygon) {
            Z.SVG.updateShapeStyle(this.svgDom, style['stroke'], style['fill']);
        } else {
            Z.SVG.updateShapeStyle(this.svgDom, style['stroke'], {"fill": "#ffffff","fill-opacity": 0});
        }

    },

    canvas:function() {

    },

    translate:function() {
        var s = this.strokeAndFillSymbol;
        var d = this.defaultSymbol;
        return {
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
    }

});

Z.StrokeAndFillSymbolizer.test=function(geometry) {
    if (!geometry) {
        return false;
    }
    if (geometry instanceof Z.Marker) {
        return false;
    }
    return true;
};