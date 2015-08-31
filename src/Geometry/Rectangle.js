Z['Rectangle'] = Z.Rectangle = Z.Polygon.extend({

    type:Z.Geometry['TYPE_RECT'],

    initialize:function(coordinates,width,height,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.width = width;
        this.height = height;
        this._initOptions(opts);
    },


    /**
     * 返回矩形左上角坐标
     * @return {Coordinate} [左上角坐标]
     * @expose
     */
    getCoordinates:function() {
        return this._coordinates;
    },

    /**
     * 设置新的矩形左上角坐标
     * @param {Coordinate} center 新的center
     * @expose
     */
    setCoordinates:function(nw){
        this._coordinates = new Z.Coordinate(nw);

        if (!this._coordinates || !this.getMap()) {
            return this;
        }
        var projection = this._getProjection();
        this._setPNw(projection.project(this._coordinates));
        return this;
    },

    _getPNw:function() {
        var projection = this._getProjection();
        if (!projection) {return null;}
        if (!this.pnw) {
            if (this._coordinates) {
                this.pnw = projection.project(this._coordinates);
            }
        }
        return this.pnw;
    },

    /**
     * 设置投影坐标
     * @param {Coordinate} pnw 投影坐标
     */
    _setPNw:function(pnw) {
        this.pnw=pnw;
        this._onPositionChanged();
    },

    /**
     * 返回矩形的宽度
     * @return {Number} [矩形宽度]
     * @expose
     */
    getWidth:function() {
        return this.width;
    },

    /**
     * 设置矩形宽度
     * @param {Number} width [新的半径]
     * @expose
     */
    setWidth:function(width) {
        this.width = width;
        this._onShapeChanged();
        return this;
    },

    /**
     * 返回矩形的高度
     * @return {Number} [矩形高度]
     * @expose
     */
    getHeight:function() {
        return this.height;
    },

    /**
     * 设置矩形高度
     * @param {Number} height [矩形高度]
     * @expose
     */
    setHeight:function(height) {
        this.height = height;
        this._onShapeChanged();
        return this;
    },

    /**
     * 修改投影坐标后调用该方法更新经纬度坐标缓存.
     * @return {[type]} [description]
     */
    _updateCache:function() {
        var projection = this._getProjection();
        if (this.pnw && projection) {
            this._coordinates = projection.unproject(this.pnw);
        }
    },

    _clearProjection:function() {
        this.pnw = null;
    },

    /**
     * 计算中心店
     * @param  {[type]} projection [description]
     * @return {[type]}            [description]
     */
    _computeCenter:function(projection) {

        return projection.locate(this._coordinates,this.width/2,-this.height/2);
    },

    /**
     * 覆盖Polygon的getShell方法, 将矩形转化为多边形的外环坐标数组
     * @return {[Coordinate]} 外环坐标数组
     * @expose
     */
    getShell:function() {
        var projection = this._getProjection();
        var nw =this._coordinates;
        var points = [];
        points.push(nw);
        points.push(projection.locate(nw,this.width,0));
        points.push(projection.locate(nw,this.width,this.height));
        points.push(projection.locate(nw,0,this.height));
        points.push(nw);
        return points;

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
        var map = this.getMap(),
            t = this._hitTestTolerance(),
            sp = map.coordinateToScreenPoint(this._coordinates),
            pxSize = map.distanceToPixel(this.width, this.height);

        var pxMin = new Z.Point(sp.left, sp.top),
            pxMax = new Z.Point(sp.left + pxSize.width, sp.top + pxSize.height),
            pxExtent = new Z.Extent(pxMin.left - t, pxMin.top - t,
                                    pxMax.left + t, pxMax.top + t);

        point = new Z.Point(point.left, point.top);

        return pxExtent.contains(point);
    },

    _computeExtent:function(projection) {
        if (!projection || !this._coordinates || Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return null;
        }
        var width = this.getWidth(),
            height = this.getHeight();
        var p1 = projection.locate(this._coordinates,width,-height);
        return new Z.Extent(p1,this._coordinates);
    },

    _computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return 2*(this.width+this.height);
    },

    _computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return this.width*this.height;
    },


    _assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Rectangle.Canvas(this);
        } else  {
            return new Z.Rectangle.SVG(this);
        }
        return null;
    },

    _exportGeoJson:function(opts) {
        var nw =this.getCoordinates();
        return {
            'type':"Rectangle",
            'coordinates':[nw.x,nw.y],
            'width':this.getWidth(),
            'height':this.getHeight()
        };
    }

});
