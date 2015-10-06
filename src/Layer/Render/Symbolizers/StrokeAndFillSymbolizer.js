Z.StrokeAndFillSymbolizer = Z.Symbolizer.extend({

    defaultSymbol:{
        "line-color" : "#474cf8",
        "line-width" : 3,
        "line-opacity" : 1,
        "line-dasharray": [],
        "line-cap" : "butt", //“butt”, “square”, “round”
        "line-join" : "round", //“bevel”, “round”, “miter”
        "polygon-fill": "#ffffff",
        "polygon-opacity": 0
    },

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.style = this.translate();
        this.strokeAndFill = this.translateStrokeAndFill(this.style);
    },

    svg:function(container, vectorContainer , zIndex) {
        var svgPath = this.geometry._getRenderPath();
        if (!this.svgDom) {
            this.svgDom = Z.SVG.path(svgPath);
            //鼠标样式
            this.svgDom.style.cursor = "pointer";
            vectorContainer.appendChild(this.svgDom);
        } else {
            Z.SVG.updatePath(this.svgDom, svgPath);
        }
        var strokeAndFill = this.strokeAndFill;
        if (this.geometry instanceof Z.Polygon) {
            Z.SVG.updateShapeStyle(this.svgDom, strokeAndFill['stroke'], strokeAndFill['fill'], this.getMap()._getSvgPaper());
        } else {
            Z.SVG.updateShapeStyle(this.svgDom, strokeAndFill['stroke'], {"fill": "#ffffff","fill-opacity": 0});
        }
    },

    canvas:function(ctx, resources) {
        var canvasResources = this.geometry._getRenderCanvasResources();
        var strokeAndFill = this.strokeAndFill;
        Z.Canvas.setDefaultCanvasSetting(ctx);
        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'], null);
        canvasResources['fn'].apply(this, [ctx].concat(canvasResources['context']));
        if (this.geometry instanceof Z.Polygon) {
            var fillSymbol = strokeAndFill['fill'];
             var fillOpacity = fillSymbol['fill-opacity'];
             var fill=fillSymbol['fill'];
             var fillStyle;
             // if (this.style['polygon-pattern-file'])
             if (fill.length>7 && 'url' ===fill.substring(0,3)) {
                var imgUrl = fill.substring(5,fill.length-2);
                var imageTexture = resources.getImage(imgUrl);
                fillStyle = ctx.createPattern(imageTexture, 'repeat');
            } else {
                fillStyle = fill;
            }
            Z.Canvas.fillCanvas(ctx, fillStyle, fillOpacity);
        }
    },

    getSvgDom:function() {
        return [this.svgDom];
    },

    getPixelExtent:function() {
        var map = this.getMap();
        var extent = this.geometry.getExtent();
        if (!extent) {
            return null;
        }
        var min = map._getProjection().project(new Z.Coordinate(extent['xmin'],extent['ymin'])),
            max = map._getProjection().project(new Z.Coordinate(extent['xmax'],extent['ymax']));
        return new Z.Extent(
            map._transformToViewPoint(min),
            map._transformToViewPoint(max)
            );
    },
    refresh:function() {
        var layer = this.geometry.getLayer();
        if (!layer.isCanvasRender()) {
            this.symbolize();
        }
    },

    //所有point symbolizer的共同的remove方法
    remove:function() {
        if (this.svgDom) {
            Z.DomUtil.removeDomNode(this.svgDom);
        }
    },

    setZIndex:function(zIndex) {
        if (this.svgDom) {
            this.svgDom.style.zIndex = zIndex;
        }
    },

    show:function(){
        if (this.svgDom) {
            this.svgDom.style.display = "";
        }
    },

    hide:function(){
        if (this.svgDom) {
            this.svgDom.style.display = "none";
        }
    },

    translate:function() {
        var s = this.symbol;
        var d = this.defaultSymbol;
        var result = {};
        Z.Util.extend(result, d, s);
        if (result['polygon-pattern-file']) {
            delete result['polygon-fill'];
        }
        return result;
    },

    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['line-color'],
                "stroke-width" : s['line-width'],
                "stroke-opacity" : s['line-opacity'],
                "stroke-dasharray": s['line-dasharray'],
                "stroke-linecap" : s['line-cap'],
                "stroke-linejoin" : s['line-join']
            },

            "fill" : {
                "fill"          : s['polygon-fill'] || s['polygon-pattern-file'],
                "fill-opacity"  : s["polygon-opacity"]
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
