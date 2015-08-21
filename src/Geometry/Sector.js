Z['Sector']=Z.Sector=Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    options:{
        'numberOfPoints':60
    },

    type:Z.Geometry['TYPE_SECTOR'],

    initialize:function(coordinates,radius,startAngle,endAngle,opts) {
        this.coordinates = new Z.Coordinate(coordinates);
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.initOptions(opts);
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
        this.onShapeChanged();
        return this;
    },

    /**
     * 返回扇形的开始角
     * @return {Number} 开始角
     * @expose
     */
    getStartAngle:function() {
        return this.startAngle;
    },

    /**
     * 设定扇形的开始角
     * @param {Number} startAngle 扇形开始角
     * @expose
     */
    setStartAngle:function(startAngle) {
        this.startAngle = startAngle;
        this.onShapeChanged();
        return this;
    },

    /**
     * 返回扇形的结束角
     * @return {Number} 结束角
     * @expose
     */
    getEndAngle:function() {
        return this.endAngle;
    },

    /**
     * 设定扇形的结束角
     * @param {Number} endAngle 扇形结束角
     * @expose
     */
    setEndAngle:function(endAngle) {
        this.endAngle = endAngle;
        this.onShapeChanged();
        return this;
    },

    /**
     * 将扇形转化为Polygon的外环坐标数组
     * @return {[Coordinate]} 转换后的坐标数组
     * @expose
     */
    getShell:function() {
        //var proj = this._getProjection();
        //TODO

    },

    /**
     * 返回空洞
     * @return {[type]} [description]
     * @expose
     */
    getHoles:function() {
        return null;
    },

    computeExtent:function(projection) {
        if (!projection || !this.coordinates || Z.Util.isNil(this.radius)) {
            return null;
        }

        var radius = this.radius;
        var p1 = projection.locate(this.coordinates,radius,radius);
        var p2 = projection.locate(this.coordinates,-radius,-radius);
        return new Z.Extent(p1,p2);
    },

    computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*2*this.radius*Math.abs(this.startAngle-this.endAngle)/360+2*this.radius;
    },

    computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*Math.pow(this.radius,2)*Math.abs(this.startAngle-this.endAngle)/360;
    },

    assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Sector.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Sector.Canvas(this);
        }
    },

    exportGeoJson:function(opts) {
        var center  = this.getCenter();
        return {
            'type':         "Sector",
            'coordinates':  [center.x,center.y],
            'radius':       this.getRadius(),
            'startAngle':   this.getStartAngle(),
            'endAngle':     this.getEndAngle()
        };
    }
});