Z.Geometry.Poly={
    /**
     * 将points中的坐标转化为用于显示的容器坐标
     * @param  {[type]} points [description]
     * @return {[type]}        [description]
     */
    _untransformToOffset:function(points) {
        var map = this.getMap();
        if (!map || !Z.Util.isArrayHasData(points)) {
            return null;
        }
        var result = [];
        var is2D = false;
        for (var i=0,len=points.length;i<len;i++) {
            var p = points[i];
            if (Z.Util.isNil(p)) {
                continue;
            }
            if (Z.Util.isArray(p)) {
                is2D = true;
                //二维数组
                var p_r = [];
                for (var j=0,jlen=p.length;j<jlen;j++) {
                    if (Z.Util.isNil(p[j])) {
                        continue;
                    }
                    p_r.push(map._untransformToOffset(p[j]));
                }
                var simplifiedPoints = Z.Simplify.simplify(p_r, 2, false);
                result.push(simplifiedPoints);
            } else {
                var pp = map._untransformToOffset(p);
                result.push(pp);
            }
        }
        if (!is2D) {
            var simpliedResult = Z.Simplify.simplify(result, 2, false);
            return simpliedResult;
        }
        return result;
    },

    setPrjPoints:function(prjPoints) {
        this.prjPoints = prjPoints;
        this.onShapeChanged();
    },

    getPrjPoints:function() {
        if (!this.prjPoints) {
            var points = this.points;
            this.prjPoints = this.projectPoints(points);
        }
        return this.prjPoints;
    },

    /**
     * 直接修改Geometry的投影坐标后调用该方法, 更新经纬度坐标缓存
     */
    updateCache:function() {
        var projection = this._getProjection();
        if (!projection) {
            return;
        }
        this.points = this.unprojectPoints(this.getPrjPoints());
        if (this.holes) {
            this.holes = this.unprojectPoints(this._getPrjHoles());
        }
    },

    clearProjection:function() {
        this.prjPoints = null;
        if (this.prjHoles) {
            this.prjHoles = null;
        }
    },

    projectPoints:function(points) {
        var projection = this._getProjection();
        if (projection) {
            return projection.projectPoints(points);
        }
        return null;
    },

    unprojectPoints:function(prjPoints) {
        var projection = this._getProjection();
        if (projection) {
            return projection.unprojectPoints(prjPoints);
        }
        return null;
    },

    computeCenter:function(projection) {
        var ring=this.points;
        if (!Z.Util.isArrayHasData(ring)) {
            return null;
        }
        var sumx=0,sumy=0;
        var counter = 0;
        for (var i=0,len=ring.length;i<len;i++) {
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

    computeExtent:function(projection) {
        var ring = this.points;
        if (!Z.Util.isArrayHasData(ring)) {
            return null;
        }
        var rings = ring;
        if (this.hasHoles && this.hasHoles()) {
            rings = rings.concat(this.getHoles());
        }
        return this.computePointsExtent(rings,projection);
    },

    /**
     * 计算坐标数组的extent, 数组内的元素可以坐标或者坐标数组,坐标为经纬度坐标,而不是投影坐标
     * @param  {[type]} points     [description]
     * @param  {[type]} projection [description]
     * @return {[type]}            [description]
     */
    computePointsExtent:function(points, projection) {
        var result=null;
        var ext;
        for ( var i = 0, len = points.length; i < len; i++) {
            if (Z.Util.isArray(points[i])) {
                for ( var j = 0, jlen = points[i].length; j < jlen; j++) {
                    ext = new Z.Extent(points[i][j]);
                    result = Z.Extent.combine(result, ext);
                }
            } else {
                ext = new Z.Extent(points[i],points[i]);
                result = Z.Extent.combine(result, ext);
            }
        }
        return result;
    }
};