//如果不支持canvas, 则不载入canvas的绘制逻辑
if (Z.Browser.canvas) {

    var ellipseReources = {
        _getRenderCanvasResources:function() {
            var map = this.getMap();
            var pcenter = this._getPrjCoordinates();
            var pt = map._transformToViewPoint(pcenter);
            var size = this._getRenderSize();
            return {
                "fn" : Z.Canvas.ellipse,
                "context" : [pt, size]
            };
        }
    };

    Z.Ellipse.include(ellipseReources);

    Z.Circle.include(ellipseReources);
    //----------------------------------------------------
    Z.Rectangle.include({
        _getRenderCanvasResources:function() {
            var map = this.getMap();
            var pt = map._transformToViewPoint(this._getPrjCoordinates());
            var size = this._getRenderSize();
            return {
                "fn" : Z.Canvas.rectangle,
                "context" : [pt, size]
            };
        }
    });
    //----------------------------------------------------
    Z.Sector.include({
        _getRenderCanvasResources:function() {
            var map = this.getMap();
            var pcenter = this._getPrjCoordinates();
            var pt = map._transformToViewPoint(pcenter);
            var size = this._getRenderSize();
            return {
                "fn" : Z.Canvas.sector,
                "context" : [pt, size['width'], [this.getStartAngle(), this.getEndAngle()]]
            };
        }

    });
    //----------------------------------------------------

    Z.Polyline.include({
        _arrow: function(ctx, prePoint, point, opacity) {
                var lineWidth = this.getSymbol()['lineWidth'];
                if (!lineWidth) {
                    lineWidth = 3;
                }
                //TODO 箭头与线宽度的比率相差近四倍,导致不太协调
                lineWidth = lineWidth/2;
                var arrowWidth = lineWidth*3,
                    arrowHeight = lineWidth*4,
                    hh = arrowHeight/2,
                    hw = arrowWidth/2;

                var v0 = new Z.Point(0,-hh),
                    v1 = new Z.Point(Z.Util.round(-hw),Z.Util.round(hh)),
                    v2 = new Z.Point(Z.Util.round(hw),Z.Util.round(hh));
                var pts = [v0, v1, v2];
                var angle = Math.atan2(point.x - prePoint.x, prePoint.y - point.y);
                var matrix = new Z.Matrix().translate(point.x, point.y).rotate(angle);
                var ptsToDraw = matrix.applyToArray(pts);
                Z.Canvas.polygon(ctx, ptsToDraw, null, opacity, opacity);
        },

        _getRenderCanvasResources:function() {
            //draw a triangle arrow

            var prjVertexes = this._getPrjCoordinates();
            var points = this._transformToViewPoint(prjVertexes);

            var me = this;
            var fn = function(_ctx, _points, _dasharray, _lineOpacity) {
                Z.Canvas.path(_ctx, _points, _dasharray, _lineOpacity);
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
                    if (placement === 'point') {
                        for (var i = 0, len = _points.length-1; i < len; i++) {
                            me._arrow(_ctx, _points[i], _points[i+1], _lineOpacity);
                        }
                    }
                }
            };
            return {
                "fn" : fn,
                //TODO dasharray可能不从本身的symbol来
                "context" : [points,this.getSymbol()['lineDasharray']]
            };
        }
    });

    Z.Polygon.include({
        _getRenderCanvasResources:function() {
            var prjVertexes = this._getPrjCoordinates(),
                points = this._transformToViewPoint(prjVertexes);
            var prjHoles = this._getPrjHoles();
            var holePoints = [];
            if (Z.Util.isArrayHasData(prjHoles)) {
                for (var i = 0; i < prjHoles.length; i++) {
                    var holPoints = this._transformToViewPoint(prjHoles[i]);
                    holePoints.push(holPoints);
                }
            }
           var resource =  {
                "fn" : Z.Canvas.polygon,
                "context" : [[points].concat(holePoints),this.getSymbol()['lineDasharray']]
            };
            return resource;
        }
    });
}
