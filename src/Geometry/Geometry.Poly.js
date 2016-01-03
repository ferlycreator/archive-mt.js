/**
 * 多折线/多边形工具类
 * @class maptalks.Geometry.Poly
 * @author Maptalks Team
 */
Z.Geometry.Poly={
    /**
     * 将points中的坐标转化为用于显示的容器坐标
     * @param  {Point[]} points  points数组
     * @returns {Point[]} 容器坐标数组
     * @ignore
     */
    _transformToViewPoint:function(points) {
        var result = [];
        if (!Z.Util.isArrayHasData(points)) {
            return result;
        }
        var map = this.getMap();
        var is2dArray = Z.Util.isArray(points[0]),
            isSimplify = this.getLayer() && this.getLayer().options['enableSimplify'];
        var tolerance;
        if (isSimplify) {
            var pxTolerance = 2;
            tolerance = map._getResolution()*pxTolerance;
        }
        if (!is2dArray && isSimplify) {
            points = Z.Simplify.simplify(points, tolerance, false);
        }
        for (var i=0,len=points.length;i<len;i++) {
            var p = points[i];
            if (Z.Util.isNil(p)) {
                continue;
            }
            if (is2dArray) {
                if (!Z.Util.isArrayHasData(p)) {
                    result.push([]);
                    continue;
                }
                if (isSimplify) {
                    p = Z.Simplify.simplify(p, tolerance, false);
                }
                var p_r = [];
                for (var j=0,jlen=p.length;j<jlen;j++) {
                    if (Z.Util.isNil(p[j])) {
                        continue;
                    }
                    p_r.push(map._transformToViewPoint(p[j]));
                }
                result.push(p_r);
            } else {
                var pp = map._transformToViewPoint(p);
                result.push(pp);
            }
        }
        return result;
    },

    _setPrjCoordinates:function(prjPoints) {
        this._prjPoints = prjPoints;
        this._onShapeChanged();
    },

    _getPrjCoordinates:function() {
        if (!this._prjPoints) {
            var points = this._points;
            this._prjPoints = this._projectPoints(points);
        }
        return this._prjPoints;
    },

    /**
     * 直接修改Geometry的投影坐标后调用该方法, 更新经纬度坐标缓存
     */
    _updateCache:function() {
        delete this._extent;
        var projection = this._getProjection();
        if (!projection) {
            return;
        }
        if (this._prjPoints) {
            this._points = this._unprojectPoints(this._getPrjCoordinates());
        }
        if (this._prjHoles) {
            this.holes = this._unprojectPoints(this._getPrjHoles());
        }
    },

    _clearProjection:function() {
        this._prjPoints = null;
        if (this._prjHoles) {
            this._prjHoles = null;
        }
    },

    _projectPoints:function(points) {
        var projection = this._getProjection();
        if (projection) {
            return projection.projectPoints(points);
        }
        return null;
    },

    _unprojectPoints:function(prjPoints) {
        var projection = this._getProjection();
        if (projection) {
            return projection.unprojectPoints(prjPoints);
        }
        return null;
    },

    _computeCenter:function(projection) {
        var ring=this._points;
        if (!Z.Util.isArrayHasData(ring)) {
            return null;
        }
        var sumx=0,sumy=0;
        var counter = 0;
        var size = ring.length;
        for (var i=0;i<size;i++) {
            if (ring[i]) {
                if (Z.Util.isNumber(ring[i].x) && Z.Util.isNumber(ring[i].y)) {
                        sumx += ring[i].x;
                        sumy += ring[i].y;
                        counter++;
                }
            }
        }
        return new Z.Coordinate(sumx/counter, sumy/counter);
    },

    _computeExtent:function(projection) {
        var ring = this._points;
        if (!Z.Util.isArrayHasData(ring)) {
            return null;
        }
        var rings = ring;
        if (this.hasHoles && this.hasHoles()) {
            rings = rings.concat(this.getHoles());
        }
        return this._computePointsExtent(rings,projection);
    },

     /**
      * 计算坐标数组的extent, 数组内的元素可以坐标或者坐标数组,坐标为经纬度坐标,而不是投影坐标
      * @param  {Point[]} points  points数组
      * @param  {Projection[]} projection  projection对象
      * @returns {Extent} {@link maptalks.Extent}
      */
    _computePointsExtent: function(points, projection) {
        var result=null;
        var ext;
        for ( var i = 0, len = points.length; i < len; i++) {
            if (Z.Util.isArray(points[i])) {
                for ( var j = 0, jlen = points[i].length; j < jlen; j++) {
                    ext = new Z.Extent(points[i][j],points[i][j]);
                    result = ext.combine(result);
                }
            } else {
                ext = new Z.Extent(points[i],points[i]);
                result = ext.combine(result);
            }
        }
        return result;
    }
};
