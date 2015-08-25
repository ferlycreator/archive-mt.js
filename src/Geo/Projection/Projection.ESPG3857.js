Z.ProjectionInstance.ESPG3857={
    srs:'ESPG:3857',
    EARCH_RADIUS: 2.003750834E7,

    project: function(lnglat) {
        var lng = lnglat.x, lat = lnglat.y;
        var r = this.EARCH_RADIUS;
        var c = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        return new Z.Coordinate( lng * r / 180, c * r / 180);
    },

    unproject: function(point) {
        var x = point.x,
            y = point.y;
        var r = this.EARCH_RADIUS;
        var c = y / r * 180;
        c = 180 / Math.PI * (2 * Math.atan(Math.exp(c * Math.PI / 180)) - Math.PI / 2);
        return new Z.Coordinate(x / r * 180, c);
    },

    rad: function(a) { return a * Math.PI / 180; }
};

Z.Util.extend(Z.ProjectionInstance.ESPG3857, Z.ProjectionInstance.GeoMethods.Geodesic);
