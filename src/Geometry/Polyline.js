/**
 * 多折线类
 * @class maptalks.LineString
 * @extends maptalks.Vector
 * @mixins maptalks.Geometry.Poly
 * @author Maptalks Team
 */
Z.LineString = Z.Polyline = Z.Vector.extend({
    includes:[Z.Geometry.Poly],

    type:Z.Geometry['TYPE_LINESTRING'],

    initialize:function(coordinates, opts) {

        this.setCoordinates(coordinates);
        this._initOptions(opts);
    },

    /**
     * 设置多折线的坐标值
     * @param {Array} coordinates 坐标数组
     * @expose
     */
    setCoordinates:function(coordinates) {
        if (!coordinates) {
            this.points = null;
            this._setPrjPoints(null);
            return;
        }
        this.points = Z.GeoJSON.fromGeoJSONCoordinates(coordinates);
        if (this.getMap()) {
            this._setPrjPoints(this._projectPoints(this.points));
        } else {
            this._onShapeChanged();
        }
        return this;
    },

    /**
     * 获取多折线坐标值
     * @return {Array} 多边形坐标数组
     * @expose
     */
    getCoordinates:function() {
        if (!this.points) {
            return [];
        }
        return this.points;
    },

    _computeGeodesicLength:function(projection) {
        var coordinates = this.getCoordinates();
        var result = 0;
        for (var i=0, len=coordinates.length;i<len-1;i++) {
            result += projection.getGeodesicLength(coordinates[i],coordinates[i+1]);
        }
        return result;
    },

    _computeGeodesicArea:function(projection) {
        return 0;
    },

    _containsPoint: function(point) {
        var map = this.getMap(),
            t = this._hitTestTolerance(),
            extent = this.getExtent(),
            nw = new Z.Coordinate(extent.xmin, extent.ymax),
            se = new Z.Coordinate(extent.xmax, extent.ymin),
            pxMin = map.coordinateToViewPoint(nw),
            pxMax = map.coordinateToViewPoint(se),
            pxExtent = new Z.Extent(pxMin.x - t, pxMin.y - t,
                                    pxMax.x + t, pxMax.y + t);

        point = new Z.Point(point.x, point.y);

        if (!pxExtent.contains(point)) { return false; }

        // screen points
        var points = this._transformToViewPoint(this._getPrjPoints());

        var i, p1, p2,
            len = points.length;

        for (i = 0, len = points.length; i < len - 1; i++) {
            p1 = points[i];
            p2 = points[i + 1];

            if (Z.GeoUtils.distanceToSegment(point, p1, p2) <= t) {
                return true;
            }
        }

        return false;
    }

});
