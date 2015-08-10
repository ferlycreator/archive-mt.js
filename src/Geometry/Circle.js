Z['Circle']=Z.Circle=Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    defaultNumberOfPoints:60,

    initialize:function(center,radius,opts) {
        this.type=Z.Geometry['TYPE_CIRCLE'];
        this.center = center;
        this.radius = radius;
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
        return Math.PI*2*this.radius;
    },

    computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.radius)) {
            return 0;
        }
        return Math.PI*Math.pow(this.radius,2);
    },

    assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Circle.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Circle.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type':Z.Geometry['TYPE_CIRCLE'],
            'center':this.getCenter(),
            'radius':this.getRadius()
        };
    }

});