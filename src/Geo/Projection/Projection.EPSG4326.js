Z.Projection.EPSG4326 = Z.Util.extend({}, Z.Projection.Common, {
    name : "EPSG:4326",
    project:function(p){
        return new Z.Coordinate(p.x,p.y);
    },
    unproject:function(p){
        return new Z.Coordinate(p.x,p.y);
    }
};
Z.Util.extend(Z.ProjectionInstance.EPSG4326, Z.measurer.WGS84Sphere);
