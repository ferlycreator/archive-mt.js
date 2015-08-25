Z['CanvasLayer']=Z.CanvasLayer=Z.OverlayLayer.extend({
    /**
     * 构造函数
     * @param  {string} identifier 图层identifier
     * @param  {tileconfig} tileconfig 图层的tileconfig
     */
    initialize:function(identifier) {
        this.identifier = identifier;
    },

    /**
     * 显示图层
     * @expose
     */
    show:function() {
        if (this._visible) {
            return;
        }
        this._visible=true;
        this._paintGeometries();
        return this;
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        if (!this._visible) {
            return;
        }
        this._visible=false;
        this._paintGeometries();
        return this;
    },

    /**
     * 图层是否显示
     * @return {boolean} 图层是否显示
     * @expose
     */
    isVisible:function() {
        return this._visible;
    },

    _setZIndex:function(zindex) {
        this.zindex=zindex;
    },

     /**
     * 绘制geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    _paintGeometries:function(geometries) {
        var map = this.getMap();
        map._repaintBaseCanvasLayer();
    }
});