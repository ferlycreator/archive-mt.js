/**
 * 多边形类
 * @class maptalks.Polygon
 * @extends maptalks.Vector
 * @mixins maptalks.Geometry.Poly
 * @author Maptalks Team
 */
Z['Polygon']=Z.Polygon = Z.Vector.extend({

    includes:[Z.Geometry.Poly],

    /**
     * 图形类型
     * @static
     */
    type:Z.Geometry['TYPE_POLYGON'],

    /**
     * 异常信息
     * @static
     */
    exceptionDefs:{
        'en-US':{
            'INVALID_COORDINATES':'invalid coordinates for polygon.'
        },
        'zh-CN':{
            'INVALID_COORDINATES':'对于多边形无效的坐标.'
        }
    },

    /**
     * @constructor
     * @param {maptalks.Coordinate[]} coordinates
     * @param {Object} opts
     * @returns {maptalks.Polygon}
     */
    initialize:function(coordinates, opts) {
        this.setCoordinates(coordinates);
        this._initOptions(opts);
    },

    /**
     * @method
     * @name setCoordinates
     * 设置新的coordinates
     * @param {Coordinate[]} coordinates 坐标数组
     */
    setCoordinates:function(coordinates) {
        if (!coordinates) {
            this.points = null;
            this.holes = null;
            this._projectRings();
            return;
        }
        var rings = Z.GeoJSON.fromGeoJSONCoordinates(coordinates);
        var len = rings.length;
        this.points = this._trimRing(rings[0]);
        if (len > 1) {
            var holes = [];
            for (var i=1; i<len;i++) {
                if (!rings[i]) {
                    continue;
                }
                holes.push(this._trimRing(rings[i]));
            }
            this.holes = holes;
        }
        this._projectRings();
    },

    /**
     * @method
     * @name setCoordinates
     * 返回多边形的坐标数组
     * @returns {Coordinate[]} 坐标数组
     */
    getCoordinates:function() {
        if (!this.points) {
            return [];
        }
        if (Z.Util.isArrayHasData(this.holes)) {
            var holes = [];
            for (var i = 0; i < this.holes.length; i++) {
                holes.push(this._closeRing(this.holes[i]));
            }
            return [this._closeRing(this.points)].concat(holes);
        }
        return [this._closeRing(this.points)];
    },

    _projectRings:function() {
        if (!this.getMap()) {
            this._onShapeChanged();
            return;
        }
        this.prjPoints = this._projectPoints(this.points);
        this.prjHoles = this._projectPoints(this.holes);
        this._onShapeChanged();
    },

    _cleanRing:function(ring) {
        for (var i = ring.length - 1; i >= 0; i--) {
            if (!ring[i]) {
                ring.splice(i,1);
            }
        }
    },

    /**
     * 检查ring是否合法, 并返回ring是否闭合
     * @param  {[type]} ring [description]
     */
    _checkRing:function(ring) {
        this._cleanRing(ring);
        if (!ring || !Z.Util.isArrayHasData(ring)) {
            return false;
        }
        var lastPoint = ring[ring.length-1];
        var isClose = true;
        var least = 4;
        if (ring[0].x != lastPoint.x || ring[0].y != lastPoint.y ) {
            least = 3;
            isClose = false;
        }
        if (ring.length < least) {
            throw new Error(this.exceptions['INVALID_COORDINATES']+', ring length is only '+ring.length);
        }
        return isClose;
    },

    /**
     * 如果最后一个端点与第一个端点相同, 则去掉最后一个端点
     */
    _trimRing:function(ring) {
        var isClose = this._checkRing(ring);
        if (Z.Util.isArrayHasData(ring) && isClose) {
            return ring.slice(0,ring.length-1);
        } else {
            return ring;
        }
    },

    /**
     * 如果最后一个端点与第一个端点不同, 则在最后增加与第一个端点相同的点
     */
    _closeRing:function(ring) {
        var isClose = this._checkRing(ring);
        if (Z.Util.isArrayHasData(ring) && !isClose) {
            return ring.concat([new Z.Coordinate(ring[0].x,ring[0].y)]);
        } else {
            return ring;
        }
    },

    /**
     * 获取多边形的外环
     * @returns {Array} 多边形坐标数组
     * @expose
     */
    getShell:function() {
       return this.points;
    },


    /**
     * 获取Polygon的空洞的坐标
     * @returns {Array} 空洞的坐标二维数组
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
     * @returns {Boolean} 是否有空洞
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
        var rings = this.getCoordinates();
        if (!Z.Util.isArrayHasData(rings)) {
            return 0;
        }
        var result = 0;
        for (var i=0, len=rings.length;i<len;i++) {
            var ring = rings[i];
            for (var j=0, jlen=ring.length-1;j<jlen;j++) {
                result += projection.getGeodesicLength(ring[j],ring[j+1]);
            }
        }
        return result;
    },

    _computeGeodesicArea:function(projection) {
        var rings = this.getCoordinates();
        if (!Z.Util.isArrayHasData(rings)) {
            return 0;
        }
        var result = projection.getGeodesicArea(rings[0]);
        //holes
        for (var i=1, len=rings.length;i<len;i++) {
            result -= projection.getGeodesicArea(rings[i]);

        }
        return result;
    },

    _containsPoint: function(point) {
        var t = this._hitTestTolerance(),
            pxExtent = this._getPainter().getPixelExtent().expand(t);

        point = new Z.Point(point.x, point.y);

        if (!pxExtent.contains(point)) { return false; }

        // screen points
        var points = this._transformToViewPoint(this._getPrjPoints());

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
    }
});
