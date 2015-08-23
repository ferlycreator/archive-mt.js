Z['Circle']=Z.Circle=Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    options:{
        'numberOfPoints':60
    },

    type:Z.Geometry['TYPE_CIRCLE'],

    initialize:function(coordinates,radius,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.radius = radius;
        this.initOptions(opts);
        /*this.numberOfPoints = this.options['defaultNumberOfPoints'];
        if (opts && opts['numberOfPoints']) {
            this.numberOfPoints = opts['numberOfPoints'];
        }*/
    },

    /**
     * 返回圆形的半径
     * @return {Number} [圆形半径]
     * @expose
     */
    getRadius:function() {
        return this.radius;
    },

    /**
     * 设置圆形半径
     * @param {Number} radius [新的半径]
     * @expose
     */
    setRadius:function(radius) {
        this.radius = radius;
        this._onShapeChanged();
        return this;
    },

    /**
     * 覆盖Polygon的getShell方法, 将圆形转化为多边形的外环坐标数组
     * @return {[Coordinate]} 外环坐标数组
     * @expose
     */
    getShell:function() {
        //var proj = this._getProjection();
        //TODO

    },

    /**
     * 覆盖Polygon的getHoles方法
     * @return {[Coordinate]} 空洞坐标
     * @expose
     */
    getHoles:function() {
        return null;
    },

    _containsPoint: function(point) {
        var center = this._getCenterDomOffset(),
            size = this.getSize(),
            pc = new Z.Point(center.left, center.top),
            pp = new Z.Point(point.left, point.top);

        // TODO: tolerance
        return pp.distanceTo(pc) <= size.width;
    },

    _computeExtent:function(projection) {
        if (!projection || !this._coordinates || Z.Util.isNil(this.radius)) {
            return null;
        }

        var radius = this.radius;
        var p1 = projection.locate(this._coordinates,radius,radius);
        var p2 = projection.locate(this._coordinates,-radius,-radius);
        return new Z.Extent(p1,p2);
    },

    _computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*2*this.radius;
    },

    _computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*Math.pow(this.radius,2);
    },

    _assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return null;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Circle.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Circle.Canvas(this);
        }
        return null;
    },

    _exportGeoJson:function(opts) {
        var center = this.getCenter();
        return {
            'type':'Circle',
            'coordinates':[center.x, center.y],
            'radius':this.getRadius()
        };
    }

});
