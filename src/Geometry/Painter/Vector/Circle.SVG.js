Z.Circle.SVG=Z.Ellipse.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var radius = geometry.getRadius();
        var map = geometry.getMap();
        return map.distanceToPixel(radius,radius);
    }
});