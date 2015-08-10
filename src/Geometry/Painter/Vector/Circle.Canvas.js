Z.Circle.Canvas = Z.Ellipse.Canvas.extend({

    getPixelSize:function() {
        var geometry = this.geometry;
        var radius = geometry.getRadius();
        var map = geometry.getMap();
        return map.distanceToPixel(radius,radius);
    }
});