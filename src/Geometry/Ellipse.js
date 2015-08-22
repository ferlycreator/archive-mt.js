Z['Ellipse']=Z.Ellipse = Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    options:{
        'numberOfPoints':60
    },

    type:Z.Geometry['TYPE_ELLIPSE'],

    initialize:function(coordinates,width,height,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.width = width;
        this.height = height;
        this.initOptions(opts);
    },

    /**
     * 返回椭圆的宽度
     * @return {Number} [椭圆宽度]
     * @expose
     */
    getWidth:function() {
        return this.width;
    },

    /**
     * 设置椭圆宽度
     * @param {Number} width [新的半径]
     * @expose
     */
    setWidth:function(width) {
        this.width = width;
        this._onShapeChanged();
        return this;
    },

    /**
     * 返回椭圆的高度
     * @return {Number} [椭圆高度]
     * @expose
     */
    getHeight:function() {
        return this.height;
    },

    /**
     * 设置椭圆高度
     * @param {Number} height [椭圆高度]
     * @expose
     */
    setHeight:function(height) {
        this.height = height;
        this._onShapeChanged();
        return this;
    },

    /**
     * 覆盖Polygon的getShell方法, 将椭圆形转化为多边形的外环坐标数组
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

    _computeExtent:function(projection) {
        if (!projection || !this._coordinates || Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return null;
        }
        var width = this.getWidth(),
            height = this.getHeight();
        var p1 = projection.locate(this._coordinates,width/2,height/2);
        var p2 = projection.locate(this._coordinates,-width/2,-height/2);
        return new Z.Extent(p1,p2);
    },

    _computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        //L=2πb+4(a-b)
        //近似值
        var longer = (this.width > this.height?this.width:this.height);
        return 2*Math.PI*longer/2-4*Math.abs(this.width-this.height);
    },

    _computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return Math.PI*this.width*this.height/4;
    },


    _assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Ellipse.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Ellipse.Canvas(this);
        }
    },

    _exportGeoJson:function(opts) {
        var center = this.getCenter();
        return {
            'type':'Ellipse',
            'coordinates':[center.x, center.y],
            'width':this.getWidth(),
            'height':this.getHeight()
        };
    }

});