Z['Sector']=Z.Sector=Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    defaultNumberOfPoints:60,

    initialize:function(center,radius,startAngle,endAngle,opts) {        
        this.type=Z.Geometry['TYPE_SECTOR'];
        this.center = center;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.initOptions(opts);
        this.numberOfPoints = this.defaultNumberOfPoints;
        if (opts && opts['numberOfPoints']) {
            this.numberOfPoints = opts['numberOfPoints'];
        }
    },

    /**
     * 返回圆形的半径
     * @return {Number} [圆形半径]
     * @export
     */
    getRadius:function() {
        return this.radius;
    },

    /**
     * 设置圆形半径
     * @param {Number} radius [新的半径]
     * @export
     */
    setRadius:function(radius) {
        this.radius = radius;
        this.onShapeChanged();
        return this;
    },

    /**
     * 返回扇形的开始角
     * @return {Number} 开始角
     * @export
     */
    getStartAngle:function() {
        return this.startAngle;
    },

    /**
     * 设定扇形的开始角
     * @param {Number} startAngle 扇形开始角
     * @export
     */
    setStartAngle:function(startAngle) {
        this.startAngle = startAngle;
        this.onShapeChanged();
        return this;  
    },

    /**
     * 返回扇形的结束角
     * @return {Number} 结束角
     * @export
     */
    getEndAngle:function() {
        return this.endAngle;
    },

    /**
     * 设定扇形的结束角
     * @param {Number} endAngle 扇形结束角
     * @export
     */
    setEndAngle:function(endAngle) {
        this.endAngle = endAngle;
        this.onShapeChanged();
        return this;  
    },

    /**
     * 获取点
     * @return {Array} ring
     */
    getPoints:function() {
        //var proj = this.getProjection();
        //TODO
        
    },

    /**
     * do nothing for circle
     * @param {Array} ring [ring for polygon]
     * @export
     */
    setRing:function(ring) {
        //do nothing for circle as a polygon.
        return this;
    },

    computeExtent:function(projection) {
        if (!projection || !this.center || Z.Util.isNil(this.radius)) {
            return null;
        }

        var radius = this.radius;
        var p1 = projection.locate(this.center,radius,radius);
        var p2 = projection.locate(this.center,-radius,-radius);
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

    exportJson:function(opts) {
        return {
            'type':         Z.Geometry['TYPE_SECTOR'],
            'center':       this.getCenter(),
            'radius':       this.getRadius(),
            'startAngle':   this.getStartAngle(),
            'endAngle':     this.getEndAngle()
        };
    }
});