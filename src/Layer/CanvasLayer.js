Z['CanvasLayer']=Z.CanvasLayer=Z.OverlayLayer.extend({
    /**
     * 构造函数
     * @param  {string} identifier 图层identifier
     * @param  {lodconfig} lodconfig 图层的lodconfig
     */
    initialize:function(identifier) {
        this.identifier = identifier;
    },

    /**
     * 显示图层
     * @expose
     */
    show:function() {
        if (this.visible) {
            return;
        }
        this.visible=true;
        this.paintGeometries();
        return this;
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        if (!this.visible) {
            return;
        }
        this.visible=false;
        this.paintGeometries();
        return this;
    },

    /**
     * 图层是否显示
     * @return {boolean} 图层是否显示
     * @expose
     */
    isVisible:function() {
        return this.visible;
    },

    setZIndex:function(zindex) {
        this.zindex=zindex;
    },

     /**
     * 绘制geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    paintGeometries:function(geometries) {
        var map = this.getMap();
        map.repaintBaseCanvasLayer();
    }
});