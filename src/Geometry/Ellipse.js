Z['Ellipse']=Z.Ellipse = Z.Polygon.extend({
    includes:[Z.Geometry.Center],

    defaultNumberOfPoints:60,

    initialize:function(center,width,height,opts) {        
        this.type=Z.Geometry['TYPE_ELLIPSE'];
        this.center = center;
        this.width = width;
        this.height = height;
        this.initOptions(opts);
        this.numberOfPoints = this.defaultNumberOfPoints;
        if (opts && opts['numberOfPoints']) {
            this.numberOfPoints = opts['numberOfPoints'];
        }
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
        this.onShapeChanged();
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
        this.onShapeChanged();
        return this;
    },

    getPoints:function() {
        //var proj = this.getProjection();
        //TODO 获取ellipse的ring
    },

    /**
     * do nothing for Ellipse
     * @param {Array} ring [ring for polygon]
     * @expose
     */
    setRing:function(ring) {
        //do nothing for Ellipse as a polygon.
        return this;
    },

    computeExtent:function(projection) {
        if (!projection || !this.center || Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return null;
        }
        var width = this.getWidth(),
            height = this.getHeight();
        var p1 = projection.locate(this.center,width/2,height/2);
        var p2 = projection.locate(this.center,-width/2,-height/2);
        return new Z.Extent(p1,p2);
    },

    computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        //L=2πb+4(a-b)
        //近似值
        var longer = (this.width > this.height?this.width:this.height);
        return 2*Math.PI*longer/2-4*Math.abs(this.width-this.height);
    },

    computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return Math.PI*this.width*this.height/4;
    },


    assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Ellipse.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Ellipse.Canvas(this);
        }
    },

    exportJson:function(opts) {
        return {
            'type':Z.Geometry['TYPE_ELLIPSE'],
            'center':this.getCenter(),
            'width':this.getWidth(),
            'height':this.getHeight()
        };
    }

});