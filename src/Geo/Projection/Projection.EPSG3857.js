Z.ProjectionInstance.EPSG3857={
    srs:'EPSG:3857',
    EARCH_RADIUS:2.003750834E7,
    project:function(p){
        if (!p) {
            var i=1;
        }
        var x = p.x,y=p.y;
        if (!x || !y) {return null;}
        var lon = x,
            lat = y;
        var EARCH_RADIUS = this.EARCH_RADIUS;
        var c=Math.log(Math.tan((90+lat)*Math.PI/360))/(Math.PI/180);
        return new Z.Coordinate(lon*EARCH_RADIUS/180,c*EARCH_RADIUS/180);
    },
    unproject:function(p){
        // if (!Z.Util.isCoordinate(p)) {return null;}
        var x = p.x,y=p.y;
        if (!x || !y) {return null;}
        var lon = x,
            lat = y;
        var EARCH_RADIUS = this.EARCH_RADIUS;
        var c=lat/EARCH_RADIUS*180;
        c=180/Math.PI*(2*Math.atan(Math.exp(c*Math.PI/180))-Math.PI/2);
        return new Z.Coordinate(lon/EARCH_RADIUS*180,c);
    },

    rad:function(a){return a*Math.PI/180;}
};

Z.Util.extend(Z.ProjectionInstance.EPSG3857, Z.ProjectionInstance.GeoMethods.Geodesic);