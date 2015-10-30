
/**
 * GeoJSON CRS
 * @{@link http://geojson.org/geojson-spec.html#coordinate-reference-system-objects}
 * @param {[type]} name       [description]
 * @param {[type]} properties [description]
 */
Z.CRS = function(type, properties) {
    this.type=type;
    this.properties = properties;
};

Z.CRS.WGS84=new Z.CRS("cnCoordinateType",{"name":"wgs84"});
Z.CRS.CGCS2000=new Z.CRS("cnCoordinateType",{"name":"cgcs2000"});
Z.CRS.GCJ02=new Z.CRS("cnCoordinateType",{"name":"gcj02"});
Z.CRS.BD09LL=new Z.CRS("cnCoordinateType",{"name":"bd09ll"});
Z.CRS.PIXEL=new Z.CRS("cnCoordinateType",{"name":"pixel"});
