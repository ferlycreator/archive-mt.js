Z['Rectangle'] = Z.Rectangle = Z.Polygon.extend({    

    initialize:function(nw,width,height,opts) {        
        this.type=Z.Geometry['TYPE_RECT'];        
        this.nw = new Z.Coordinate(nw);
        this.width = width;
        this.height = height;
        this.initOptions(opts);        
    },


    /**
     * 返回矩形左上角坐标
     * @return {Coordinate} [左上角坐标]
     * @expose
     */
    getCoordinates:function() {
        return this.nw;
    },

    /**
     * 设置新的center
     * @param {Coordinate} center 新的center
     * @expose
     */
    setCoordinates:function(nw){
        this.nw = new Z.Coordinate(nw);
        
        if (!this.nw || !this.getMap()) {
            return;
        }
        var projection = this.getProjection();
        this.setPNw(projection.project(this.nw));
        return this;
    },

    getPNw:function() {
        var projection = this.getProjection();
        if (!projection) {return null;}
        if (!this.pnw) {            
            if (this.nw) {
                this.pnw = projection.project(this.nw);
            }
        }
        return this.pnw;
    },

    /**
     * 设置投影坐标
     * @param {Coordinate} pnw 投影坐标
     */
    setPNw:function(pnw) {
        this.pnw=pnw;
        this.onPositionChanged();
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
        this.onShapeChanged();
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
        this.onShapeChanged();
        return this;
    },

    /**
     * 修改投影坐标后调用该方法更新经纬度坐标缓存.
     * @return {[type]} [description]
     */
    updateCache:function() {
        var projection = this.getProjection();
        if (this.pnw && projection) {
            this.nw = projection.unproject(this.pnw);
        }
    },

    clearProjection:function() {
        this.pnw = null;
    },

    /**
     * 计算中心店
     * @param  {[type]} projection [description]
     * @return {[type]}            [description]
     */
    computeCenter:function(projection) {
        
        return projection.locate(this.nw,this.width/2,-this.height/2);
    },

    /**
     * 获取ring
     * @return {Array} ring     
     */
    getPoints:function() {
        var projection = this.getProjection();
        var nw =this.nw;    
        var points = [];
        points.push(nw);
        points.push(projection.locate(nw,this.width,0));
        points.push(projection.locate(nw,this.width,this.height));
        points.push(projection.locate(nw,0,this.height));
        points.push(nw);
        return points;
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
        if (!projection || !this.nw || Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return null;
        }
        var width = this.getWidth(),
            height = this.getHeight();
        var p1 = projection.locate(this.nw,width,-height);        
        return new Z.Extent(p1,this.nw);
    },

    computeGeodesicLength:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return 2*(this.width+this.height);
    },

    computeGeodesicArea:function(projection) {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return 0;
        }
        return this.width*this.height;
    },


    assignPainter:function() {
        var layer = this.getLayer();
        if (!layer) {return;}
        if (layer instanceof Z.SVGLayer) {
            return new Z.Rectangle.SVG(this);
        } else if (layer instanceof Z.CanvasLayer) {
            return new Z.Rectangle.Canvas(this);
        }
    },

    exportGeoJson:function(opts) {
        var nw =this.getNw();
        return {
            'type':"Rectangle",
            'coordinates':[nw.x,nw.y],
            'width':this.getWidth(),
            'height':this.getHeight()
        };
    }

});