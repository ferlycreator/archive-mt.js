Z['Polygon']=Z.Polygon = Z.Vector.extend({
    includes:[Z.Geometry.Poly],


    /**
     * [多边形构造函数]
     * @param  {坐标数组} coordinates [description]
     * @param  {[type]} opts [description]
     * @return {[type]}      [description]
     */
    initialize:function(coordinates, opts) {
        this.setCoordinates(coordinates);
        this.initOptions(opts);
        if (opts) {
            if (opts['holes']) {
                this.setHoles(opts['holes']);
            }
        }
    },    

    /**
     * 设置新的coordinates 
     * @param {[坐标数组]} coordinates [description]
     */
    setCoordinates:function(coordinates) {
        var _coord = Z.GeoJson.fromGeoJsonCoordinates(coordinates);

    },

    getCoordinates:function() {

    },

    getPoints:function() {
        return this.points;
    },

    /**
     * 设置多边形的坐标值
     * @param {Array} ring 坐标数组
     * @expose
     */
    setRing:function(ring) {
        this.points = ring;
        this.checkRing();
        if (!this.getMap()) {
            return this;
        }
        this.setPrjPoints(this.projectPoints(this.points));        
        return this;
    },

    checkRing:function() {
        if (!Z.Util.isArray(this.points) || this.points.length < 3) {
            return;
        }
        var lastPoint = this.points[this.points.length-1];
        if (!lastPoint) {
            lastPoint = this.points[this.points.length-2];
        }
        if (this.points[0].x != lastPoint.x || this.points[0].y != lastPoint.y ) {
            this.points.push({x:this.points[0].x,y:this.points[0].y});
        }
    },

    /**
     * 获取多边形坐标值
     * @return {Array} 多边形坐标数组
     * @expose
     */
    getRing:function() {
       return this.getPoints();
    },
    
    /**
     * 设置多边形内部的空洞
     * @param {Array} holes 空洞的坐标二维数组
     */
    setHoles:function(holes) {
        this.holes = holes;
        if (!this.getMap()) {
            return this;
        }
        this.setPrjHoles(this.projectPoints(this.holes));
        return this;
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

    setPrjHoles:function(prjHoles) {
        this.prjHoles = prjHoles;
        this.onShapeChanged();
    },

    getPrjHoles:function() {
        if (!this.prjHoles) {
            this.prjHoles = this.projectPoints(this.holes);
        }
        return this.prjHoles;
    },

    computeGeodesicLength:function(projection) {
        return 0;
    },

    computeGeodesicArea:function(projection) {
        return 0;
    },

    assignPainter:function() {
        if (!this.layer) {return;}
        if (this.layer instanceof Z.SVGLayer) {
            return new Z.Polygon.SVG(this);
        } else if (this.layer instanceof Z.CanvasLayer) {
            return new Z.Polygon.Canvas(this);
        }
    },

    exportGeoJson:function(opts) {
        var points = this.getPoints();
        return {
            'type':'Polygon',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }
});