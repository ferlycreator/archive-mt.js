/**
 * 多图形类
 * @class maptalks.MultiPoly
 * @extends maptalks.GeometryCollection
 * @author Maptalks Team
 */
Z.MultiPoly = Z.GeometryCollection.extend({

    initialize:function(data, opts) {
        if (Z.Util.isArrayHasData(data)) {
            if (data[0] instanceof this.GeometryType) {
                this.setGeometries(data);
            } else {
                this.setCoordinates(data);
            }
        }
        this._initOptions(opts);
    },

    _checkGeometries:function(geometries) {
        if (Z.Util.isArray(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                if (geometries[i] && !(geometries[i] instanceof this.GeometryType)) {
                    throw new Error(this.exceptions['INVALID_GEOMETRY_IN_COLLECTION']+i);
                }
            }
        }
        return geometries;
    },

    /**
     * 获取MultiPolygon的坐标数组
     * @return {Coordinate[][][]} MultiPolygon的坐标数组
     * @expose
     */
    getCoordinates:function() {
        var coordinates = [];
        var geometries = this.getGeometries();
        if (!Z.Util.isArray(geometries)) {
            return null;
        }
        for (var i = 0,len=geometries.length;i<len;i++) {
            coordinates.push(geometries[i].getCoordinates());
        }
        return coordinates;
    },

    /**
     * 设置MultiPolygon
     * @param {Coordinate[][][]} MultiPolygon的坐标数组
     * @expose
     */
    setCoordinates:function(coordinates) {
        if (Z.Util.isArrayHasData(coordinates)) {
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
    },

    //override _exportGeoJson in GeometryCollection
    _exportGeoJson:function(opts) {
        var points = this.getCoordinates();
        var coordinates = Z.GeoJson.toGeoJsonCoordinates(points);
        return {
            'type':this.getType(),
            'coordinates': coordinates
        };
    }
});