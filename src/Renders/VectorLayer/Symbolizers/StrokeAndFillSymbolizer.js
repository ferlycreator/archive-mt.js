Z.StrokeAndFillSymbolizer = Z.Symbolizer.extend({

    defaultSymbol:{
        "lineColor" : "#474cf8",
        "lineWidth" : 3,
        "lineOpacity" : 1,
        "lineDasharray": [],
        "lineCap" : "butt", //“butt”, “square”, “round”
        "lineJoin" : "round", //“bevel”, “round”, “miter”
        "polygonFill": null,
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
        this._prepareContext(ctx);
        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'], strokeAndFill['fill'], resources);
        canvasResources['fn'].apply(this, [ctx].concat(canvasResources['context']).concat([strokeAndFill['stroke']['stroke-opacity'], strokeAndFill['fill']['fill-opacity']]));
        // if (this.geometry instanceof Z.Polygon) {
        //     Z.Canvas.fillCanvas(ctx, strokeAndFill['fill']['fill-opacity']);
        // }
    },

    getSvgDom:function() {
        return [this.svgDom];
    },

    getPixelExtent:function() {
        var map = this.getMap();
        var extent = this.geometry._getPrjExtent();
        if (!extent) {
            return null;
        }
        // var min = map._transformToViewPoint(new Z.Coordinate(extent['xmin'],extent['ymin'])),
        //     max = map._transformToViewPoint(new Z.Coordinate(extent['xmax'],extent['ymax']));
        // return new Z.Extent(min,max).expand(this.style['lineWidth']/2);
        //
        // this ugly implementation is to improve perf as we can
        // it tries to avoid creating instances to save cpu consumption.
        if (!this._extMin || !this._extMax) {
            this._extMin = new Z.Coordinate(0,0);
            this._extMax = new Z.Coordinate(0,0);
        }
        this._extMin.x = extent['xmin'];
        this._extMin.y = extent['ymin'];
        this._extMax.x = extent['xmax'];
        this._extMax.y = extent['ymax'];
        var min = map._transformToViewPoint(this._extMin),
            max = map._transformToViewPoint(this._extMax);
        if (!this._pxExtent) {
            this._pxExtent = new Z.Extent(min, max);
        } else {
            if (min.x < max.x) {
                this._pxExtent['xmin'] = min.x;
                this._pxExtent['xmax'] = max.x;
            } else {
                this._pxExtent['xmax'] = min.x;
                this._pxExtent['xmin'] = max.x;
            }
            if (min.y < max.y) {
                this._pxExtent['ymin'] = min.y;
                this._pxExtent['ymax'] = max.y;
            } else {
                this._pxExtent['ymax'] = min.y;
                this._pxExtent['ymin'] = max.y;
            }
        }
        return this._pxExtent._expand(this.style['lineWidth']/2);
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
                containerPoints = matrix.applyToPointInstance(containerPoints);
            }
        }
        transContext.push(containerPoints);
        var scale;

        //scale width ,height or radius if geometry has
        for (var i = 1, len = context.length;i<len;i++) {
            if (matrix) {

                if (Z.Util.isNumber(context[i]) || (context[i] instanceof Z.Size)) {
                    if (matrix && !scale) {
                        scale = matrix._scale;
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

        var resources = {
            'fn' : this._rendResources['fn'],
            'context' : transContext
        };

        return resources;
    },

    refresh:function() {
        var layer = this.geometry.getLayer();
        delete this._rendResources;
        if (!layer.isCanvasRender()) {
            this.svg.apply(this,layer._getRender().getPaintContext());
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
        if (result['linePatternFile']) {
            delete result['lineColor'];
        }
        return result;
    },

    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['lineColor'] || s['linePatternFile'],
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
        //if linestring has arrow, needs to fill arrow with same color of line-color
        if (this.geometry instanceof Z.LineString) {
             result['fill'] = {
                "fill"          : result["stroke"]["stroke"],
                "fill-opacity"  : result["stroke"]["stroke-opacity"]
             };
        }
        //vml和svg对linecap的定义不同
        if (result['stroke']['stroke-linecap'] === "butt") {
            if (Z.Browser.vml) {
                result['stroke']['stroke-linecap'] = "flat";
            }
        }
        //it has no use to set stroke-width to 0 in canvas, so set stroke-opacity to make it disapear.
        if (result['stroke']['stroke-width'] === 0) {
            result['stroke']['stroke-opacity'] = 0;
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
