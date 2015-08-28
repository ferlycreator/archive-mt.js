Z.Render.Canvas = {

    load:function() {
        this._prepareRenderAndLoad();
    },

    _prepareRenderAndLoad:function() {
        var map = this.getMap();
        var baseRender = this._getBaseRender();
        if (!baseRender) {
            baseRender = new Z.Render.Canvas.Base(map);
            Z.Render.Canvas.Base.setBaseCanvasRender(map,baseRender);
        }
        if (map.isLoaded()) {
            baseRender.load();
        }
    },

    _getBaseRender:function() {
        var map = this.getMap();
        var baseRender = Z.Render.Canvas.Base.getBaseCanvasRender(map);
        return baseRender;
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
        this._repaintBaseRender();
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
        this._repaintBaseRender();
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
        this._repaintBaseRender();
    },

    _repaintBaseRender:function() {
        var baseRender = this._getBaseRender();
        baseRender.repaint();
    },

    _onMoving:function(param) {
        //nothing to do
    },

    _onMoveEnd:function(param) {
        this._repaintBaseRender();
    },

    _onResize:function(param) {
        this._repaintBaseRender();
    },

    _onZoomStart:function(param) {
        this._getBaseRender()._onZoomStart();
    },

    _onZoomEnd:function(param) {
        this._getBaseRender()._onZoomEnd();
    }
};