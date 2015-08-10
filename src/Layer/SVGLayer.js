Z['SVGLayer']=Z.SVGLayer=Z.OverlayLayer.extend({

    //瓦片图层的基础ZIndex
    baseDomZIndex:200,
    /**
     * 构造函数
     * @param  {String} id 图层identifier
     */
    initialize:function(id) {
        this.identifier = id;
    },  

    /**
     * 显示图层
     * @export
     */
    show:function() {
        if (this.visible) {
            return;
        }
        this.eachGeometry(function(geo) {
            geo.show();
        });
        this.visible=true;
        return this;
    },

    /**
     * 隐藏图层
     * @export
     */
    hide:function() {
        if (!this.visible) {
            return;
        }
        this.eachGeometry(function(geo) {
            geo.hide();
        });
        this.visible=false;
        return this;
    },

    /**
     * 图层是否显示
     * @return {Boolean} 图层是否显示
     * @export
     */
    isVisible:function() {
        return this.visible && this.layerDom && this.layerDom.style.display !== 'none';
    },    

    /**
     * 绘制Geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    paintGeometries:function(geometries) {
        for (var i=0,len=geometries.length;i<len;i++) {
            var geo = geometries[i];
            if (!geo) {
                continue;
            }
            if (geo.getPainter()) {
                geo.getPainter().paint(this.layerDom,  this.zIndex);    
            }
        }
    },

    

    addTo:function() {        
        this.eachGeometry(function(geo) {
            if (geo.getPainter()) {
                geo.getPainter().paint(this.layerDom,  this.zIndex);
            }
        });
    },


    load:function() {
        var map = this.getMap();
        this.layerDom = map.panels.svgContainer;
        map.createSVGPaper();
        this.addTo();
    },

    setZIndex:function(zIndex) {
        this.zIndex=zIndex;
        this.eachGeometry(function(geo) {
            if (geo.getPainter()) {
                geo.getPainter().setZIndex(zIndex);    
            }
        });
    },

    onMoveStart:function() {
        //nothing to do
    },

    /**
     * 地图中心点变化时的响应函数
     */
    onMoving:function() {
        //nothing to do 
    },

    onMoveEnd:function() {
        //nothing to do
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    onZoomStart:function() {
        //this.hide();
    },

    onZoomEnd:function() {      
        this.eachGeometry(function(geo) {
            geo.onZoomEnd();
        });
        //this.show();
    },

    onResize:function() {
        //nothing to do
    }
    

});