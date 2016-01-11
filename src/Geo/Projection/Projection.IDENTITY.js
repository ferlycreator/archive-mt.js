Z.Projection.IDENTITY = Z.Util.extend({}, Z.Projection.Common, {
    name : "IDENTITY",
    project:function(p){
        return new Z.Coordinate(p.x,p.y);
    },
    unproject:function(p){
        return new Z.Coordinate(p.x,p.y);
    }
}, Z.measurer.Euclidean);
