Z.VectorMarkerSymbolizer = Z.PointSymbolizer.extend({

    defaultSymbol:{
        "markerType": "ellipse", //<----- ellipse | cross | x | triangle | diamond | square | bar | pin等,默认ellipse

        "markerFill": "#0000ff", //blue as cartoCSS
        "markerFillOpacity": 1,
        "markerLineColor": "#000000", //black
        "markerLineWidth": 1,
        "markerLineOpacity": 1,
        "markerLineDasharray":[],
        "markerWidth": 10,
        "markerHeight": 10,

        "markerDx": 0,
        "markerDy": 0
    },

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.style = this.translate();
        this.strokeAndFill = this.translateStrokeAndFill(this.style);
    },

    svg:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(vectorcontainer, zIndex);
    },

    canvas:function(ctx, resources) {

        var points = this._getRenderPoints();
        if (!Z.Util.isArrayHasData(points)) {
            return;
        }
        var map = this.getMap();
        var cookedPoints = Z.Util.eachInArray(points,this,function(point) {
            return map._viewPointToContainerPoint(point);
        });
        var style = this.style;
        var vectorArray = this._getVectorArray(style);
        var markerType = style['markerType'].toLowerCase();
        var strokeAndFill = this.strokeAndFill;
        var dxdy = this.getDxDy();
        Z.Canvas.setDefaultCanvasSetting(ctx);
        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'],strokeAndFill['fill'], null);
        var j;

        var width = style['markerWidth'],
            height = style['markerHeight'];

        for (var i = cookedPoints.length - 1; i >= 0; i--) {
            var point = cookedPoints[i];
            point = point.add(dxdy);
            if (markerType === 'cross' || markerType === 'x'){
                for (j = vectorArray.length - 1; j >= 0; j--) {
                    vectorArray[j]._add(point);
                }
                //线类型
                Z.Canvas.path(ctx,vectorArray.slice(0,2),null);
                Z.Canvas.path(ctx,vectorArray.slice(2,4),null);
            } else if (markerType === 'diamond' || markerType === 'bar' || markerType === 'square' || markerType === 'triangle'){
                for (j = vectorArray.length - 1; j >= 0; j--) {
                    vectorArray[j]._add(point);
                }
                //面类型
                Z.Canvas.polygon(ctx,vectorArray,null);
                Z.Canvas.fillCanvas(ctx, strokeAndFill['fill']['fill'],strokeAndFill['fill']['fill-opacity']);
            } else if (markerType === 'pin') {
                for (j = vectorArray.length - 1; j >= 0; j--) {
                    vectorArray[j]._add(point);
                }
                Z.Canvas.bezierCurve(ctx,vectorArray,null);
                Z.Canvas.fillCanvas(ctx, strokeAndFill['fill']['fill'],strokeAndFill['fill']['fill-opacity']);
            } else if (markerType === 'pie') {
                var angle = Math.atan(width/2/height)*180/Math.PI;
                Z.Canvas.sector(ctx, point, height, 90-angle, 90+angle);
                Z.Canvas.fillCanvas(ctx, strokeAndFill['fill']['fill'],strokeAndFill['fill']['fill-opacity']);
            } else {
                //ellipse default
                Z.Canvas.ellipse(ctx, point, new Z.Size(width/2,height/2));
                Z.Canvas.fillCanvas(ctx, strokeAndFill['fill']['fill'],strokeAndFill['fill']['fill-opacity']);
            }
        }

    },

    getPlacement:function() {
        return this.symbol['markerPlacement'];
    },

    getDxDy:function() {
        var s = this.style;
        var dx = s['markerDx'],
            dy = s['markerDy'];
        return new Z.Point(dx, dy);
    },

    getMarkerExtent:function() {
        var dxdy = this.getDxDy(),
            style = this.style;
        var markerType = style['markerType'].toLowerCase();
        var width = style['markerWidth'],
            height = style['markerHeight'];
        if (markerType  === 'bar' || markerType  === 'pie' || markerType  === 'pin') {
            return new Z.Extent(dxdy.add(new Z.Point(-width/2,-height)), dxdy.add(new Z.Point(width/2,0)));
        } else {
            return new Z.Extent(dxdy.add(new Z.Point(-width/2,-height/2)), dxdy.add(new Z.Point(width/2,height/2)));
        }
    },


    translate:function() {
        var s = this.symbol;
        var d = this.defaultSymbol;

        var result = {
            "markerType"       : s["markerType"],
            "markerWidth"      : Z.Util.getValueOrDefault(s["markerWidth"], d["markerWidth"]),
            "markerHeight"     : Z.Util.getValueOrDefault(s["markerHeight"], d["markerHeight"]),
            "markerDx"         : Z.Util.getValueOrDefault(s["markerDx"], d["markerDx"]),
            "markerDy"         : Z.Util.getValueOrDefault(s["markerDy"], d["markerDy"]),

            "markerFill"       : Z.Util.getValueOrDefault(s["markerFill"], d["markerFill"]),
            "markerFillOpacity": Z.Util.getValueOrDefault(s["markerFillOpacity"], d["markerFillOpacity"]),
            "markerLineColor" : Z.Util.getValueOrDefault(s["markerLineColor"], d["markerLineColor"]),
            "markerLineWidth" : Z.Util.getValueOrDefault(s["markerLineWidth"], d["markerLineWidth"]),
            "markerLineDasharray": Z.Util.getValueOrDefault(s["markerLineDasharray"], d["markerLineDasharray"]),
            "markerLineOpacity": Z.Util.getValueOrDefault(s["markerLineOpacity"], d["markerLineOpacity"])
        };
        //marker-opacity覆盖fill-opacity和line-opacity
        if (Z.Util.isNumber(s["markerOpacity"])) {
            result["markerFillOpacity"] *= s["markerOpacity"];
            result["markerLineOpacity"] *= s["markerOpacity"];
        }
        return result;
    },

    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['markerLineColor'],
                "stroke-width" : s['markerLineWidth'],
                "stroke-opacity" : s['markerLineOpacity'],
                "stroke-dasharray": null,
                "stroke-linecap" : "butt",
                "stroke-linejoin" : "round"
            },

            "fill" : {
                "fill"          : s["markerFill" ],
                "fill-opacity"  : s["markerFillOpacity"]
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
        var style = this.style;
        var svgPath = this._getMarkerSvgPath(style);
        var svgDom = Z.SVG.path(svgPath);
        var svgStyle = this.strokeAndFill;
        Z.SVG.updateShapeStyle(svgDom, svgStyle['stroke'], svgStyle['fill']);
        return svgDom;
    },

    _getMarkerSvgPath:function(style) {
        //矢量标注
        var markerType = style['markerType'].toLowerCase();
        var points = this._getVectorArray(style);
        var path;
        if ('triangle' === markerType) {
           path='M'+points[0]['left']+','+points[0]['top']+ ' ' +
                'L'+points[1]['left']+','+points[1]['top']+ ' ' +
                'L'+points[2]['left']+','+points[2]['top']+ ' ' +
                Z.SVG.closeChar;
        }  else if ('cross' === markerType || 'x' === markerType) {
           path='M'+points[0]['left']+','+points[0]['top']+ ' ' +
                'L'+points[1]['left']+','+points[1]['top']+ ' ' +
                'M'+points[2]['left']+','+points[2]['top']+ ' ' +
                'L'+points[3]['left']+','+points[3]['top'];
        } else if ('diamond' === markerType || 'square' === markerType || 'bar' === markerType) {
           path='M'+points[0]['left']+','+points[0]['top']+ ' ' +
                'L'+points[1]['left']+','+points[1]['top']+ ' ' +
                'L'+points[2]['left']+','+points[2]['top']+ ' ' +
                'L'+points[3]['left']+','+points[3]['top']+ ' ' +
                Z.SVG.closeChar;
        } else if ('pin' === markerType) {
           path='M'+points[0]['left']+','+points[0]['top']+ ' ' +
                'C'+points[1]['left']+','+points[1]['top']+ ' ' +
                points[2]['left']+','+points[2]['top']+ ' ' +
                points[3]['left']+','+points[3]['top']+ ' ' +
                Z.SVG.closeChar;
        } else {
            //ellipse
            var width = style['markerWidth'],
                height = style['markerHeight'];
            var point = [-width/2, 0];
            if (Z.Browser.vml) {
                path = 'AL ' + point.join(',') + ' ' + width/2 + ',' + height/2 +
                        ' 0,' + (65535 * 360) + ' x';
            } else {
                path = 'M'+point.join(',')+' a'+width/2 + ',' + height/2+' 0,1,0,0,-0.9Z';
            }
        }
        if (Z.Browser.vml) {
            path += ' e';
        }
        return path;
    },

    _getVectorArray: function(style) {
        //ignore case
        var markerType = style['markerType'].toLowerCase();
        var width = style['markerWidth'],
            height = style['markerHeight'];
        //half height and half width
        var hh = Math.round(height/2),
            hw = Math.round(width/2);
        var left = 0, top = 0;
        var v0,v1,v2,v3;
        if ('triangle' === markerType) {
            v0 = new Z.Point(left,top-hh);
            v1 = new Z.Point(Z.Util.roundNumber(left-hw),Z.Util.roundNumber(top+hh));
            v2 = new Z.Point(Z.Util.roundNumber(left+hw),Z.Util.roundNumber(top+hh));
            return [v0,v1,v2];
        } else if ('cross' === markerType) {
            v0 = new Z.Point((left-hw),top);
            v1 = new Z.Point((left+hw),top);
            v2 = new Z.Point((left),(top-hh));
            v3 = new Z.Point((left),(top+hh));
            return [v0,v1,v2,v3];
        } else if ('diamond' === markerType) {
            v0 = new Z.Point((left-hw),top);
            v1 = new Z.Point(left,(top-hh));
            v2 = new Z.Point((left+hw),top);
            v3 = new Z.Point((left),(top+hh));
            return [v0,v1,v2,v3];
        } else if ('square' === markerType) {
            v0 = new Z.Point((left-hw),(top+hh));
            v1 = new Z.Point((left+hw),(top+hh));
            v2 = new Z.Point((left+hw),(top-hh));
            v3 = new Z.Point((left-hw),(top-hh));
            return [v0,v1,v2,v3];
        } else if ('x' === markerType) {
             v0 = new Z.Point(left-hw,top+hh);
             v1 = new Z.Point(left+hw,top-hh);
             v2 = new Z.Point(left+hw,top+hh);
             v3 = new Z.Point(left-hw,top-hh);
             return [v0,v1,v2,v3];
        } else if ('bar' === markerType) {
             v0 = new Z.Point((left-hw),(top-height));
             v1 = new Z.Point((left+hw),(top-height));
             v2 = new Z.Point((left+hw),top);
             v3 = new Z.Point((left-hw),top);
             return [v0,v1,v2,v3];
        } else if ('pin' === markerType) {
              var extWidth = height*Math.atan(hw/hh);
              v0 = new Z.Point(left,top);
              v1 = new Z.Point(Math.round(left-extWidth),Math.round(top-height));
              v2 = new Z.Point(Math.round(left+extWidth),Math.round(top-height));
              v3 = new Z.Point(left,top);
              return [v0,v1,v2,v3];
        }
        return null;
    }
});


Z.VectorMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (Z.Util.isNil(symbol['markerFile']) && !Z.Util.isNil(symbol['markerType'])) {
        return true;
    }
    return false;
};
