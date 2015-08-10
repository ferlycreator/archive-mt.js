Z.ProjectionInstance.Pixel={
	srs:'PIXEL',	
	project:function(p){ 
        return new Z.Coordinate(p.x,p.y);
    },
    unproject:function(p){
        return new Z.Coordinate(p.x,p.y);
    }
};
Z.Util.extend(Z.ProjectionInstance.Pixel, Z.ProjectionInstance.GeoMethods.Pixel);