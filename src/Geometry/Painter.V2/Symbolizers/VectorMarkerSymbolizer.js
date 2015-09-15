Z.VectorMarkerSymbolizer = Z.PointSymbolizer.extend({

    defaultSymbol:{
        "marker-type": "ellipse", //<----- ellipse | arrow | triangle | square | bar等,默认ellipse

        "marker-fill": "#0000ff", //blue as cartoCSS
        "marker-fill-opacity": 1,
        "marker-line-color": "#000000", //black
        "marker-line-width": 1,
        "marker-line-opacity": 1,
        "marker-width": 10,
        "marker-height": 10,

        "marker-dx": 0,
        "marker-dy": 0
    },

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.renderPoints = this._getRenderPoints();
    },

    svg:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(vectorcontainer, zIndex);
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
        var style = this.translate();
        var vectorArray = this._getVectorArray(style);
        var markerType = style['marker-type'].toLowerCase();
        var strokeAndFill = this.translateStrokeAndFill(style);
        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'],strokeAndFill['fill'], null);
        var j;
        for (var i = cookedPoints.length - 1; i >= 0; i--) {
            var point = cookedPoints[i];
            if (markerType  === 'ellipse') {
                Z.Canvas.ellipse(ctx, point, new Z.Size(style['marker-width'],style['marker-height']));
                Z.Canvas.fillCanvas(ctx, strokeAndFill['fill']);
            } else if (markerType === 'cross' || markerType === 'x'){
                for (j = vectorArray.length - 1; j >= 0; j--) {
                    vectorArray[j]._add(point);
                }
                //线类型
                Z.Canvas.path(ctx,vectorArray,null);
            } else {
                for (j = vectorArray.length - 1; j >= 0; j--) {
                    vectorArray[j]._add(point);
                }
                //面类型
                Z.Canvas.polygon(ctx,vectorArray,null);
                Z.Canvas.fillCanvas(ctx, strokeAndFill['fill']);
            }
        }

    },

    getPlacement:function() {
        return this.symbol['marker-placement'];
    },

    getDxDy:function() {
        var s = this.symbol;
        var dx = s['marker-dx'] || 0,
            dy = s['marker-dy'] || 0;
        return new Z.Point(dx, dy);
    },

    translate:function() {
        var s = this.symbol;
        var d = this.defaultSymbol;

        var result = {
            "marker-type"       : s["marker-type"],
            "marker-width"      : Z.Util.setDefaultValue(s["marker-width"], d["marker-width"]),
            "marker-height"     : Z.Util.setDefaultValue(s["marker-height"], d["marker-height"]),
            "marker-dx"         : Z.Util.setDefaultValue(s["marker-dx"], d["marker-height"]),
            "marker-dy"         : Z.Util.setDefaultValue(s["marker-dy"], d["marker-height"]),

            "marker-fill"       : Z.Util.setDefaultValue(s["marker-fill"], d["marker-fill"]),
            "marker-fill-opacity": Z.Util.setDefaultValue(s["marker-fill-opacity"], d["marker-fill-opacity"]),
            "marker-line-color" : Z.Util.setDefaultValue(s["marker-line-color"], d["marker-line-color"]),
            "marker-line-width" : Z.Util.setDefaultValue(s["marker-line-width"], d["marker-line-width"]),
            "marker-line-opacity": Z.Util.setDefaultValue(s["marker-line-opacity"], d["marker-line-opacity"])
        };
        //marker-opacity覆盖fill-opacity和line-opacity
        if (Z.Util.isNumber(s["marker-opacity"])) {
            result["marker-fill-opacity"] = result["marker-line-opacity"] = s["marker-opacity"];
        }
        return result;
    },

    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['marker-line-color'],
                "stroke-width" : s['marker-line-width'],
                "stroke-opacity" : s['marker-line-opacity'],
                "stroke-dasharray": null,
                "stroke-linecap" : "butt",
                "stroke-linejoin" : "round"
            },

            "fill" : {
                "fill"          : s["marker-fill" ],
                "fill-opacity"  : s["marker-fill-opacity"]
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
        var svgPath = this._getMarkerSvgPath(style);
        var svgDom = Z.SVG.path(svgPath);
        var svgStyle = this.translateStrokeAndFill(style);
        Z.SVG.updateShapeStyle(svgDom, svgStyle['stroke'], svgStyle['fill']);
        return svgDom;
    },

    _getMarkerSvgPath:function(style) {
        //矢量标注
        var markerType = style['marker-type'].toLowerCase();
        var points = this._getVectorArray(style);
        var path;
        if ('ellipse' === markerType) {
            var width = style['marker-width'],
                height = style['marker-height'];
            var point = [0,0];
            if (Z.Browser.vml) {
                path = 'AL ' + point.join(',') + ' ' + width/2 + ',' + height/2 +
                        ' 0,' + (65535 * 360) + ' x';
            } else {
                path = 'M'+point.join(',')+' a'+width/2 + ',' + height/2+' 0,1,0,0,-0.9Z';
            }
        } else if ('triangle' === markerType) {
            path = 'M'+points[0]['left']+','+points[0]['top']+ ' ' +
                     'L'+points[1]['left']+','+points[1]['top']+ ' ' +
                     'L'+points[2]['left']+','+points[2]['top']+ ' ' +
                     Z.SVG.closeChar;
        }  else if ('cross' === markerType || 'x' === markerType) {
            path ='M'+points[0]['left']+','+points[0]['top']+ ' ' +
                         'L'+points[1]['left']+','+points[1]['top']+ ' ' +
                         'M'+points[2]['left']+','+points[2]['top']+ ' ' +
                         'L'+points[3]['left']+','+points[3][1];
        } else if ('diamond' === markerType || 'square' === markerType || 'bar' === markerType) {
           path = 'M'+points[0]['left']+','+points[0]['top']+ ' ' +
                         'L'+points[1]['left']+','+points[1]['top']+ ' ' +
                         'L'+points[2]['left']+','+points[2]['top']+ ' ' +
                         'L'+points[3]['left']+','+points[3]['top']+ ' ' +
                         Z.SVG.closeChar;
        } /*else if ('tip' === markerType) {
            path = 'M'+points[0]['left']+','+points[0]['top']+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]+ ' ' +
                         'L'+points[4][0]+','+points[4][1]+ ' ' +
                         'L'+points[5][0]+','+points[5][1]+ ' ' +
                         'L'+points[6][0]+','+points[6][1]+ ' ' +
                         Z.SVG.closeChar;
        }*/
        if (Z.Browser.vml) {
            path += ' e';
        }
        return path;
    },

    _getVectorArray: function(style) {
        //ignore case
        var markerType = style['marker-type'].toLowerCase();
        var width = style['marker-width'],
            height = style['marker-height'];
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
        }
        return null;
    }
});


Z.VectorMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (Z.Util.isNil(symbol['marker-file']) && !Z.Util.isNil(symbol['marker-type'])) {
        return true;
    }
    return false;
};