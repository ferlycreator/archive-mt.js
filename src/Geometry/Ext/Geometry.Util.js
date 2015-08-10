Z.GeometryExt={};
Z.GeometryExt.Util={
	toGeoJsonCoordinates:function(coordinates) {
		if (!Z.Util.isArray(coordinates)) {
			return null;
		}
		var result = [];
		for (var i=0, len=coordinates.length;i<len;i++) {
			result.push([coordinates[i].x, coordinates[i].y]);
		}
		return result;
	}
};
