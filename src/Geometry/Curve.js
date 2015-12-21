Z.Curve = Z.LineString.extend({
    options:{
        'bezierCurveDegree' : 3
    },

    _getRenderCanvasResources:function() {
        //draw a triangle arrow

        var prjVertexes = this._getPrjPoints();
        var points = this._transformToViewPoint(prjVertexes);

        var me = this;
        var fn = function(_ctx, _points, _dasharray, _lineOpacity) {
            var degree = me.options['bezierCurveDegree'],
                curveFn = (degree === 3?Z.Canvas._bezierCurveTo:Z.Canvas._quadraticCurveTo);
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
                    curveFn.apply(Z.Canvas,[_ctx].concat(points));
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
                // if (placement === 'point') {
                //     for (var i = 0, len = _points.length-1; i < len; i++) {
                //         me._arrow(_ctx, _points[i], _points[i+1], _lineOpacity);
                //     }
                // }
            }

        };
        return {
            "fn" : fn,
            //TODO dasharray可能不从本身的symbol来
            "context" : [points,this.getSymbol()['lineDasharray'], this.getSymbol()['lineOpacity']]
        };
    }
});
