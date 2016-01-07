Z.ProjectionInstance.EPSG3857 = {
    srs: 'EPSG:3857',
    radUnit : Math.PI / 180,
    r180 : 2.003750834E7/180,

    project: function(lnglat) {
        var radUnit = this.radUnit,
            r180 = this.r180;
        var lng = lnglat.x, lat = lnglat.y;
        var c = Math.log(Math.tan((90 + lat) * radUnit / 2)) / radUnit;
        return new Z.Coordinate( lng * r180, c * r180);
    },

    unproject: function(point) {
        var x = point.x,
            y = point.y;
        var radUnit = this.radUnit,
            r180 = this.r180;
        var c = y / r180;
        c = (2 * Math.atan(Math.exp(c * radUnit)) - Math.PI / 2)/radUnit;
        return new Z.Coordinate(x / r180, c);
    }
};

Z.Util.extend(Z.ProjectionInstance.EPSG3857, Z.measurer.Sphere.NORMAL);
