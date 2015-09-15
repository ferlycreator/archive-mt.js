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
    },

    svg:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(vectorcontainer,zIndex);
    },

    getPlacement:function() {
        return this.symbol['text-placement'];
    },

    getDxDy:function() {
        var s = this.symbol;
        var dx = s['text-dx'] || 0,
            dy = s['text-dy'] || 0;
        return new Z.Point(dx, dy);
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
                "stroke" : s['text-halo-fill'],
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
    createMarkerDom: function(style) {
        var textContent = this._convertContent(style['text-name']);
        var svgText = Z.SVG.text(textContent);
        var textStyle = this.translate();
        Z.SVG.updateTextStyle(svgText, textStyle);
        var strokeAndFill = this.translateStrokeAndFill(textStyle);
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