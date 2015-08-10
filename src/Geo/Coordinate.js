Z['Coordinate'] = Z.Coordinate = function(x,y) {
    //支持输入数组
    if (Z.Util.isArray(x)) {
        this.x = parseFloat(x[0]);
        this.y = parseFloat(x[1]);
    } else {
        this.x=parseFloat(x);
        this.y=parseFloat(y);   
    }
};
Z.Coordinate.equals=function(c1,c2) {
            if (!Z.Util.isCoordinate(c1) || !Z.Util.isCoordinate(c2)) {
                return false;
            }
            return c1.x === c2.x && c1.y === c2.y;
        };

Z.Coordinate.fromGeoJsonCoordinate=function(coordinates) {
    if (!Z.Util.isArray(coordinates)) {
        return null;
    }
    for (var i=0, len=coordinates.length;i<len;i++) {
        var child = coordinates[i];
        if (Z.Util.isArray(child) && !Z.Util.isArray(child[0])) {

        } else {

        }
    }
};


