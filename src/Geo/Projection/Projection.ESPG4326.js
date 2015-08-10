Z.ProjectionInstance.ESPG4326={
	srs:'ESPG:4326',	
	project:function(p){ 
        return new Z.Coordinate(p.x,p.y);
    },
    unproject:function(p){
        return new Z.Coordinate(p.x,p.y);
    }
};
Z.Util.extend(Z.ProjectionInstance.ESPG4326, Z.ProjectionInstance.GeoMethods.Geodesic);