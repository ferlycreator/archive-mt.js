Z.StrokeAndFillSymbolizer = Z.Symbolizer.extend({

    defaultSymbol:{
        "lineColor" : "#474cf8",
        "lineWidth" : 3,
        "lineOpacity" : 1,
        "lineDasharray": [],
        "lineCap" : "butt", //“butt”, “square”, “round”
        "lineJoin" : "round", //“bevel”, “round”, “miter”
        "polygonFill": "#ffffff",
        "polygonOpacity": 0
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
            Z.SVG.updateShapeStyle(this.svgDom, strokeAndFill['stroke'], strokeAndFill['fill'], this.getMap()._getRender().getSvgPaper());
        } else {
            Z.SVG.updateShapeStyle(this.svgDom, strokeAndFill['stroke'], {"fill": "#ffffff","fill-opacity": 0});
        }
    },

    canvas:function(ctx, resources) {
        var canvasResources = this._getRenderResources();
        var strokeAndFill = this.strokeAndFill;
        Z.Canvas.setDefaultCanvasSetting(ctx);
        ctx.save();
        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'], null);
        canvasResources['fn'].apply(this, [ctx].concat(canvasResources['context']));
        if (this.geometry instanceof Z.Polygon) {
            var fillStyle = this._getStyleToFill(ctx, resources);
            Z.Canvas.fillCanvas(ctx, fillStyle[0], fillStyle[1]);
        }
    },

    _getStyleToFill:function(ctx, resources) {
        var strokeAndFill = this.strokeAndFill;
        var fillSymbol = strokeAndFill['fill'];
        var fillOpacity = fillSymbol['fill-opacity'];
        var fill=fillSymbol['fill'];
        var fillStyle;
        // FIXME: rule?
        if (this.style['polygonPatternFile']) {
            var imgUrl = Z.Util.extractCssUrl(fill);
            var imageTexture = resources.getImage(imgUrl);
            fillStyle = ctx.createPattern(imageTexture, 'repeat');
        } else {
            fillStyle = fill;
        }
        return [fillStyle, fillOpacity];
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
        var min = map.coordinateToViewPoint(new Z.Coordinate(extent['xmin'],extent['ymin'])),
            max = map.coordinateToViewPoint(new Z.Coordinate(extent['xmax'],extent['ymax']));
        return new Z.Extent(min,max).expand(this.style['lineWidth']/2);
    },

    _getRenderResources:function() {
        if (!this._rendResources) {
            //render resources geometry returned are based on view points.
            this._rendResources = this.geometry._getRenderCanvasResources();
        }
        var matrix;
        var map = this.getMap();
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            matrix = map._getRender().getTransform();
        }

        var context =this._rendResources['context'];
        var transContext = [];
        //refer to Geometry.Canvas
        var points = context[0];
        var containerPoints;
        //convert view points to container points needed by canvas
        if (Z.Util.isArray(points)) {
            containerPoints = Z.Util.eachInArray(points, this, function(point) {
                var cp = map._viewPointToContainerPoint(point);
                if (matrix) {
                    return matrix.applyToPointInstance(cp);
                }
                return cp;
            });
        } else if (points instanceof Z.Point) {
            containerPoints = map._viewPointToContainerPoint(points);
            if (matrix) {
                containerPoints = matrix.applyToPointInstance(points);
            }
        }
        transContext.push(containerPoints);
        var scale;

        for (var i = 1, len = context.length;i<len;i++) {
            if (matrix) {
                //scale width and height if geometry has
                if (Z.Util.isNumber(context[i]) || (context[i] instanceof Z.Size)) {
                    if (matrix && !scale) {
                        scale = matrix.decompose()['scale'];
                    }
                    if (Z.Util.isNumber(context[i])) {
                        transContext.push(scale.x*context[i]);
                    } else {
                        transContext.push(new Z.Size(context[i].width*scale.x, context[i].height*scale.y));
                    }
                } else {
                    transContext.push(context[i]);
                }
            } else {
                transContext.push(context[i]);
            }

        }

        var resources = Z.Util.extend({}, this._rendResources);
        resources['context'] = transContext;

        return resources;
    },

    refresh:function() {
        var layer = this.geometry.getLayer();
        delete this._rendResources;
        if (!layer.isCanvasRender()) {
            this.symbolize.apply(this,layer._getRender().getPaintContext());
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
        if (result['polygonPatternFile']) {
            delete result['polygonFill'];
        }
        return result;
    },

    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['lineColor'],
                "stroke-width" : s['lineWidth'],
                "stroke-opacity" : s['lineOpacity'],
                "stroke-dasharray": s['lineDasharray'],
                "stroke-linecap" : s['lineCap'],
                "stroke-linejoin" : s['lineJoin']
            },

            "fill" : {
                "fill"          : s['polygonFill'] || s['polygonPatternFile'],
                "fill-opacity"  : s["polygonOpacity"]
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
