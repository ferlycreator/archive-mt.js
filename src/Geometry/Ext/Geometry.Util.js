
Z.Geometry.include({
    toGeoJsonCoordinates:function(coordinates) {
        if (!Z.Util.isArray(coordinates)) {
            return null;
        }
        var result = [];
        for (var i=0, len=coordinates.length;i<len;i++) {
            var child = coordinates[i];
            if (!Z.Util.isArray(child) && !Z.Util.isNil(child.x) && !Z.Util.isNil(child.y)) {
                result.push([child.x, child.y]);
            } else if (Z.Util.isArray(child)) {
                result.push(this.toGeoJsonCoordinates(child));
            } else {
                result.push(null);
            }
        }
        return result;
    }
});
