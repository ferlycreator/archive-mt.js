Z['Polygon']=Z.Polygon = Z.Vector.extend({
    includes:[Z.Geometry.Poly],

    type:Z.Geometry['TYPE_POLYGON'],

    /**
     * [多边形构造函数]
     * @param  {坐标数组} coordinates [description]
     * @param  {[type]} opts [description]
     * @return {[type]}      [description]
     */
    initialize:function(coordinates, opts) {
        this.setCoordinates(coordinates);
        this.initOptions(opts);
    },

    /**
     * 设置新的coordinates
     * @param {[坐标数组]} coordinates [description]
     */
    setCoordinates:function(coordinates) {
        var rings = Z.GeoJson.fromGeoJsonCoordinates(coordinates);
        var len = rings.length;
        this.points = rings[0];
        this._checkRing(this.points);
        if (len > 1) {
            var holes = [];
            for (var i=1; i<len;i++) {
                if (!rings[i]) {
                    continue;
                }
                this._checkRing(rings[i]);
                holes.push(rings[i]);
            }
            this.holes = holes;
        }
        this._projectRings();
    },

    /**
     * 返回多边形的坐标数组
     * @return {[Coordinate]} 坐标数组
     */
    getCoordinates:function() {
        if (this.holes) {
            return [this.points].concat(this.holes);
        }
        return [this.points];
    },

    _projectRings:function() {
        if (!this.getMap()) {
            return;
        }
        this.prjPoints = this._projectPoints(this.points);
        this.prjHoles = this._projectPoints(this.holes);
    },

    /**
     * 保证Ring都是闭合的
     */
    _checkRing:function(ring) {
        if (!Z.Util.isArray(ring) || ring.length < 3) {
            return;
        }
        var lastPoint = ring[ring.length-1];
        if (!lastPoint) {
            lastPoint = ring[ring.length-2];
        }
        if (ring[0].x != lastPoint.x || ring[0].y != lastPoint.y ) {
            ring.push({x:ring[0].x,y:ring[0].y});
        }
    },

    /**
     * 获取多边形的外环
     * @return {Array} 多边形坐标数组
     * @expose
     */
    getShell:function() {
       return this.points;
    },


    /**
     * 获取Polygon的空洞的坐标
     * @return {Array} 空洞的坐标二维数组
     * @expose
     */
    getHoles:function() {
        if (this.hasHoles()) {
            return this.holes;
        }
        return null;
    },

    /**
     * Polygon是否有空洞
     * @return {Boolean} 是否有空洞
     * @expose
     */
    hasHoles:function() {
        if (Z.Util.isArrayHasData(this.holes)) {
            if (Z.Util.isArrayHasData(this.holes[0])) {
                return true;
            }
        }
        return false;
    },


    _getPrjHoles:function() {
        if (!this.prjHoles) {
            this.prjHoles = this._projectPoints(this.holes);
        }
        return this.prjHoles;
    },

    _computeGeodesicLength:function(projection) {
        return 0;
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
            pxMin = map.coordinateToScreenPoint(nw),
            pxMax = map.coordinateToScreenPoint(se),
            pxExtent = new Z.Extent(pxMin.left - t, pxMin.top - t,
                                    pxMax.left + t, pxMax.top + t);

        point = new Z.Point(point.left, point.top);

        if (!Z.Extent.contains(pxExtent, point)) { return false; }

        // screen points
        var points = this._transformToOffset(this._getPrjPoints());

        var c = Z.GeoUtils.pointInsidePolygon(point, points);
        if (c) {
            return c;
        }

        var i, j, p1, p2,
            len = points.length;

        for (i = 0, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];

            if (Z.GeoUtils.distanceToSegment(point, p1, p2) <= t) {
                return true;
            }
        }

        return false;
    },

    _assignPainter:function() {
        if (!this.layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Polygon.Canvas(this);
        } else {
            return new Z.Polygon.SVG(this);
        }
        return null;
    }
});
