Z.MultiPoly = Z.GeometryCollection.extend({

    initialize:function(data, opts) {
        this.type=Z.Geometry['TYPE_MULTIPOLYGON'];
        if (Z.Util.isArrayHasData(data)) {
            if (data[0] instanceof this.GeometryType) {
                this.setGeometries(data);
            } else {
                this.setCoordinates(data);
            }
        }
        this.initOptions(opts);
    },

    checkGeometries:function(geometries) {
        if (Z.Util.isArray(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                if (geometries[i] && !(geometries[i] instanceof this.GeometryType)) {
                    throw new Error(this.exception['INVALID_GEOMETRY_IN_COLLECTION']+i);
                }
            }
        }
    }, 

    /**
     * 获取MultiPolygon的坐标数组
     * @return {Coordinate[][][]} MultiPolygon的坐标数组
     * @export
     */
    getCoordinates:function() {
        var coordinates = [];
        var geometries = this.getGeometries();
        if (!Z.Util.isArray(geometries)) {
            return null;
        }
        for (var i = 0,len=geometries.length;i<len;i++) {
            coordinates.push(geometries.getCoordinates());
        }
        return coordinates;
    },

    /**
     * 设置MultiPolygon
     * @param {Coordinate[][][]} MultiPolygon的坐标数组
     * @export
     */
    setCoordinates:function(coordinates) {
        if (!Z.Util.isArrayHasData(coordinates)) {
            var geometries = [];            
            for (var i=0, len=coordinates.length;i<len;i++) {
                var p = new this.GeometryType(coordinates[i]);
                geometries.push(p);
            }
            this.setGeometries(geometries);
        } else {
            this.setGeometries([]);
        }
        return this;
    }
});