//TODO render的程序结构不是很好, 需要重构
Z.VectorLayer=Z.OverlayLayer.extend({
    type : 'vector',

    options:{
        'enableSimplify'            : true,
        'cursor'                    : 'pointer',
        'geometryEvents'            : true,
        'thresholdOfEcoTransform'   : 50
    },

    /**
     * 构造函数
     * @param  {String} id 图层identifier
     */
    initialize:function(id, options) {
        this.setId(id);
        Z.Util.setOptions(this, options);

    },

    /**
     * 是否用Canvas渲染
     * @return {Boolean}
     * @expose
     */
    isCanvasRender:function() {
        if (this.getMap() && this.getMap().isCanvasRender()) {
            return true;
        }
        if (Z.Browser.canvas) {
            return true;
        }
        return false;
    },


    load:function() {
        if (!this._render) {
            this._initRender();
            this._render.setZIndex(this.getZIndex());
        }
        this._render.render();
        return this;
    },

    _initRender:function() {
        if (this.isCanvasRender()) {
            this._render = new Z.render.vectorlayer.Canvas(this,{
                'visible':this.isVisible()
            });
        } else {
            this._render = new Z.render.vectorlayer.Dom(this,{
                'visible':this.isVisible()
            });
        }
    },


    /**
     * 当geometry被移除时触发
     * @param  {[type]} geometry [description]
     * @return {[type]}          [description]
     */
    _onGeometryRemove:function(geometry) {
        if (!geometry) {return;}
        //考察geometry是否属于该图层
        if (this != geometry.getLayer()) {
            return;
        }
        var internalId = geometry._getInternalId();
        if (Z.Util.isNil(internalId)) {
            return;
        }
        var geoId = geometry.getId();
        if (!Z.Util.isNil(geoId)) {
            delete this._geoMap[geoId];
        }
        delete this._geoCache[internalId];
        this._counter--;
        if (this.isCanvasRender() && this._render) {
            this._render.render();
        }
    }
});
