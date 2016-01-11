//aka sphericalMercator
Z.ProjectionInstance.EPSG3857 = {
    srs: 'EPSG:3857',
    rad : Math.PI / 180,
    metersPerDegree : 2.003750834E7/180,

    project: function(lnglat) {
        var rad = this.rad,
            metersPerDegree = this.metersPerDegree;
        var lng = lnglat.x, lat = lnglat.y;
        var c = Math.log(Math.tan((90 + lat) * rad / 2)) / rad;
        return new Z.Coordinate( lng * metersPerDegree, c * metersPerDegree);
    },

    unproject: function(point) {
        var x = point.x,
            y = point.y;
        var rad = this.rad,
            metersPerDegree = this.metersPerDegree;
        var c = y / metersPerDegree;
        c = (2 * Math.atan(Math.exp(c * rad)) - Math.PI / 2)/rad;
        return new Z.Coordinate(x / metersPerDegree, c);
    }
};

Z.Util.extend(Z.ProjectionInstance.EPSG3857, Z.measurer.WGS84Sphere);
