//TODO render的程序结构不是很好, 需要重构
Z.VectorLayer=Z.OverlayLayer.extend({

    //瓦片图层的基础ZIndex
    baseZIndex:200,

    options:{
        'render':'dom', // possible values: dom - svg or vml, canvas
        'enableSimplify':true
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
        if (Z.Browser.canvas &&
            ((!Z.Browser.svg && !Z.Browser.vml) || 'canvas' === this.options['render'].toLowerCase())) {
            return true;
        }
        return false;
    },

    _initRender:function() {
        //地图为canvas渲染方式时, VectorLayer只支持canvas渲染
        /*if (this.getMap() && this.getMap().isCanvasRender()) {
            this._render = new Z.render.vectorlayer.Canvas(this,{
                'visible':this.options['visible']
            });
            return;
        }
        //动态加载Render
        if (Z.Browser.canvas &&
            ((!Z.Browser.svg && !Z.Browser.vml) || 'canvas' === this.options['render'].toLowerCase())) {
            this._render = new Z.render.vectorlayer.Canvas(this,{
                'visible':this.options['visible']
            });
        } else {
            this._render = new Z.render.vectorlayer.Dom(this,{
                'visible':this.options['visible']
            });
        }*/
        if (this.isCanvasRender()) {
            this._render = new Z.render.vectorlayer.Canvas(this,{
                'visible':this.options['visible']
            });
        } else {
            this._render = new Z.render.vectorlayer.Dom(this,{
                'visible':this.options['visible']
            });
        }
    },

    getRender: function() {
        return this._render;
    },

    load:function() {
        if (!this._render) {
            this._initRender();
            this._render.setZIndex(this._zIndex);
        }
        this._render.load();
        return this;
    },

    /**
     * 显示图层
     * @expose
     */
    show:function() {
        this._render.show();
        return this;
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        this._render.hide();
        return this;
    },

    /**
     * 图层是否显示
     * @return {Boolean} 图层是否显示
     * @expose
     */
    isVisible:function() {
        return this._render.isVisible();
    },

    /**
     * 绘制Geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    _paintGeometries:function(geometries) {
        this._render._paintGeometries(geometries);
        return this;
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
        if (this.isCanvasRender()) {
            this._render.repaint();
        }

    },

    _setZIndex:function(zIndex) {
        if (this._render) {
            this._render.setZIndex(zIndex);
        }
        this._zIndex = zIndex;
        return this;
    },

    _onMoveStart:function() {
        this._render._onMoveStart();
        return this;
    },

    /**
     * 地图中心点变化时的响应函数
     */
    _onMoving:function() {
        this._render._onMoving();
        return this;
    },

    _onMoveEnd:function() {
        this._render._onMoveEnd();
        return this;
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    _onZoomStart:function() {
        this._render._onZoomStart();
        return this;
    },

    _onZoomEnd:function() {
        this._render._onZoomEnd();
        return this;
    },

    _onResize:function() {
       this._render._onResize();
        return this;
    }


});
