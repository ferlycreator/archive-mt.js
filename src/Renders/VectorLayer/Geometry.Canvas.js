//如果不支持canvas, 则不载入canvas的绘制逻辑
if (Z.Browser.canvas) {

    var ellipseReources = {
        _getRenderCanvasResources:function() {
            var map = this.getMap();
            var pcenter = this._getPCenter();
            var pt = map._transform(pcenter);
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
            var pt = map._transform(this._getPNw());
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
            var pcenter = this._getPCenter();
            var pt = map._transformToViewPoint(pcenter);
            var size = this._getRenderSize();
            return {
                "fn" : Z.Canvas.sector,
                "context" : [pt, size['width'], this.getStartAngle(), this.getEndAngle()]
            };
        }

    });
    //----------------------------------------------------

    Z.Polyline.include({
        _getRenderCanvasResources:function() {
            /*var prjVertexes = this._getPrjPoints();
            var points = this._transformToViewPoint(prjVertexes);
            return {
                "fn" : Z.Canvas.path,
                //TODO dasharray可能不从本身的symbol来
                "context" : [points,this.getSymbol()['lineDasharray']]
            };*/
            //draw a triangle arrow
            function arrow(_ctx, pc, pp, color, opacity) {
                var angle = Math.atan2(pp.x - pc.x, pc.y - pp.y);
                var matrix = new Z.Matrix().translate(pp.x, pp.y).rotate(angle);
                var ptsToDraw = matrix.applyToArray(pts);
                if (_ctx.setLineDash) {
                    //remove line dash effect if any
                    _ctx.setLineDash([]);
                }
                Z.Canvas.polygon(_ctx, ptsToDraw);
                Z.Canvas.fillCanvas(_ctx, color, opacity);
            }

            var prjVertexes = this._getPrjPoints();
            var points = this._transformToViewPoint(prjVertexes);
            var lineWidth = this.getSymbol()['lineWidth'];
            if (!lineWidth) {
                lineWidth = 3;
            }
            var arrowWidth = lineWidth*3,
                arrowHeight = lineWidth*4,
                hh = arrowHeight/2,
                hw = arrowWidth/2;

            var v0 = new Z.Point(0,-hh),
                v1 = new Z.Point(Z.Util.roundNumber(-hw),Z.Util.roundNumber(hh)),
                v2 = new Z.Point(Z.Util.roundNumber(hw),Z.Util.roundNumber(hh));
            var pts = [v0, v1, v2];
            var me = this;
            var fn = function(_ctx, _points, _dasharray) {
                Z.Canvas.path(_ctx, _points, _dasharray);
                if (me.options['arrowStyle'] && _points.length >= 2) {
                    var strokeSymbol = this.strokeAndFill['stroke'];
                    var strokeOpacity = strokeSymbol['stroke-opacity'];
                    var strokeColor = strokeSymbol['stroke'];
                    _ctx.save();
                    var placement = me.options['arrowPlacement'];
                    if (placement === 'vertex-first' || placement === 'vertex-firstlast') {
                        arrow(_ctx, _points[1], _points[0], strokeColor, strokeOpacity);
                    }
                    if (placement === 'vertex-last' || placement === 'vertex-firstlast') {
                        arrow(_ctx, _points[_points.length-2], _points[_points.length-1], strokeColor, strokeOpacity);
                    }
                    if (placement === 'point') {
                        for (var i = 0, len = _points.length-1; i < len; i++) {
                            arrow(_ctx, _points[i], _points[i+1], strokeColor, strokeOpacity);
                        }
                    }
                    _ctx.restore();
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
            var prjVertexes = this._getPrjPoints();
            var points = this._transformToViewPoint(prjVertexes);
            return {
                "fn" : Z.Canvas.polygon,
                "context" : [points,this.getSymbol()['lineDasharray']]
            };
        }
    });
}
