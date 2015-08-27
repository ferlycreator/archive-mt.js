Z.Rectangle.Canvas = Z.Polygon.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var map = geometry.getMap();
        var nw = map._transformToOffset(geometry._getPNw());
        var pixelSize = this.getPixelSize();
        var pt = new Z.Point(nw["left"]+platformOffset['left'],nw["top"]+platformOffset['top']);
        context.beginPath();
        context.rect(Z.Util.canvasNumber(pt.left), Z.Util.canvasNumber(pt.top),Z.Util.canvasNumber(pixelSize['width']),Z.Util.canvasNumber(pixelSize['height']));
        // this.drawHoles(context,tileNw,geometry);
        context.stroke();
        this.fillGeo(context, this.fillSymbol);
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var w = geometry.getWidth(),
            h = geometry.getHeight();
        var map = geometry.getMap();
        return map.distanceToPixel(w,h);
    }
});