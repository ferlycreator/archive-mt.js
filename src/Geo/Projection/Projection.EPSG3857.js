Z.ProjectionInstance.EPSG3857 = {
    srs: 'EPSG:3857',
    // EARCH_RADIUS: 2.003750834E7,
    rad : Math.PI / 180,
    r180 : 2.003750834E7/180,

    project: function(lnglat) {
        var rad = this.rad,
            r180 = this.r180;
        var lng = lnglat.x, lat = lnglat.y;
        // var r = this.EARCH_RADIUS;
        var c = Math.log(Math.tan((90 + lat) * rad / 2)) / rad;
        return new Z.Coordinate( lng * r180, c * r180);
    },

    unproject: function(point) {
        var x = point.x,
            y = point.y;
        // var r = this.EARCH_RADIUS;
        var rad = this.rad,
            r180 = this.r180;
        var c = y / r180;
        c = (2 * Math.atan(Math.exp(c * rad)) - Math.PI / 2)/rad;
        return new Z.Coordinate(x / r180, c);
    }
};

Z.Util.extend(Z.ProjectionInstance.EPSG3857, Z.ProjectionInstance.GeoMethods.WGS84Geodesic);
