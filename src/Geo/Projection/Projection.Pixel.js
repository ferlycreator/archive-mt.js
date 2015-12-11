Z.ProjectionInstance.Pixel={
	srs:'PIXEL',
	project:function(p){
        return new Z.Coordinate(p);
    },
    unproject:function(p){
        return new Z.Coordinate(p);
    }
};
Z.Util.extend(Z.ProjectionInstance.Pixel, Z.ProjectionInstance.GeoMethods.Pixel);
