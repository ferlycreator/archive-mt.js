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
            var pt = map._transform(pcenter);
            var size = this._getRenderSize();
            return {
                "fn" : Z.Canvas.sector,
                "context" : [pt, size, this.getStartAngle(), this.getEndAngle()]
            };
        }

    });
    //----------------------------------------------------

    Z.Polyline.include({
        _getRenderCanvasResources:function() {
            var prjVertexes = this._getPrjPoints();
            var points = this._transformToScreenPoints(prjVertexes);
            var map = this.getMap();
            return {
                "fn" : Z.Canvas.path,
                //TODO dasharray可能不从本身的symbol来
                "context" : [points,this.getSymbol()['lineDasharray']]
            };
        }
    });

    Z.Polygon.include({
        _getRenderCanvasResources:function() {
            var prjVertexes = this._getPrjPoints();
            var points = this._transformToScreenPoints(prjVertexes);
            var map = this.getMap();
            return {
                "fn" : Z.Canvas.polygon,
                "context" : [points,this.getSymbol()['lineDasharray']]
            };
        }
    });
}
