Z.CurveLine = Z.LineString.extend({
    options:{
        'curveType'   : 1,
        'arcDegree'     : 90
    },

    toJSON:function(options) {
        if (!options) {
            options = {};
        }
        var json = {
            "feature" : this.toGeoJSON(options),
            "subType" : "CurveLine"
        };
        var other = this._exportGraphicOptions(options);
        Z.Util.extend(json,other);
        return json;
    },

    _getRenderCanvasResources:function() {
        //draw a triangle arrow
        var prjVertexes = this._getPrjCoordinates();
        var points = this._transformToViewPoint(prjVertexes);
        var arcDegree = this.options['arcDegree'],
            curveType = this.options['curveType'];
        var me = this;
        var fn = function(_ctx, _points, _dasharray, _lineOpacity) {

            var curveFn, degree;
            switch (curveType) {
                case 0 : curveFn = Z.Canvas._lineTo; degree = 1; break;
                case 1 : curveFn = Z.Canvas._arcBetween; degree = 1; break;
                case 2 : curveFn = Z.Canvas._quadraticCurveTo; degree = 2; break;
                case 3 : curveFn = Z.Canvas._bezierCurveTo; degree = 3; break;
            }
            var len = _points.length;
            _ctx.beginPath();
            for (var i = 0; i < len; i+=degree) {
                var p = _points[i].round();
                if (i === 0) {
                    _ctx.moveTo(p.x, p.y);
                }
                var left = len - i;
                if (left <= degree) {
                    if (left === 2) {
                        p = _points[len-1];
                        _ctx.lineTo(p.x, p.y)
                    } else if (left === 3) {
                        Z.Canvas._quadraticCurveTo(_ctx, _points[len-2],_points[len-1]);
                    }
                } else {
                    var points = [];
                    for (var ii = 0; ii < degree; ii++) {
                        points.push(_points[i+ii+1]);
                    }
                    var args = [_ctx].concat(points);
                    if (curveFn == Z.Canvas._arcBetween) {
                        //arc start point
                        args.splice(1,0,p);
                        args = args.concat([arcDegree]);
                    }
                    curveFn.apply(Z.Canvas,args);
                    Z.Canvas._stroke(_ctx, this.strokeAndFill['stroke']['stroke-opacity']);
                }
            };
            Z.Canvas._stroke(_ctx, this.strokeAndFill['stroke']['stroke-opacity']);
            if (_ctx.setLineDash) {
                //remove line dash effect if any
                _ctx.setLineDash([]);
            }
            if (me.options['arrowStyle'] && _points.length >= 2) {
                var placement = me.options['arrowPlacement'];
                if (placement === 'vertex-first' || placement === 'vertex-firstlast') {
                    me._arrow(_ctx, _points[1], _points[0], _lineOpacity);
                }
                if (placement === 'vertex-last' || placement === 'vertex-firstlast') {
                    me._arrow(_ctx, _points[_points.length-2], _points[_points.length-1], _lineOpacity);
                }
                //besizerCurves doesn't have point arrows
                if ((curveType === 0 || curveType === 1) && placement === 'point') {
                    for (var i = 0, len = _points.length-1; i < len; i++) {
                        me._arrow(_ctx, _points[i], _points[i+1], _lineOpacity);
                    }
                }
            }

        };
        return {
            "fn" : fn,
            "context" : [points,this.getSymbol()['lineDasharray'], this.getSymbol()['lineOpacity']]
        };
    }
});

Z.CurveLine._fromJSON=function(json) {
    var feature = json['feature'];
    var curveLine = new Z.CurveLine(feature['geometry']['coordinates'], json['options']);
    curveLine.setProperties(feature['properties']);
    return curveLine;
}
