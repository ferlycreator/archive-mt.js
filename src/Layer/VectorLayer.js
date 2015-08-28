Z.VectorLayer=Z.OverlayLayer.extend({

    options:{
        'render':'dom' // possible values: dom - svg or vml, canvas
    },

    /**
     * 构造函数
     * @param  {String} id 图层identifier
     */
    initialize:function(id, options) {
        this.setId(id);
        Z.Util.setOptions(this, options);
        //动态加载Render
        if (this.isCanvasRender()) {
            this._render = new Z.Render.Canvas(this);
        } else {
            this._render = new Z.Render.Dom(this);
        }
    },

    /**
     * 是否用Canvas渲染
     * @return {Boolean}
     * @expose
     */
    isCanvasRender:function() {
        //即不支持svg, 也不支持vml
        if (!Z.Browser.svg && !Z.Browser.vml) {
            return true;
        }
        return 'canvas' === this.options['render'].toLowerCase();
    },

    load:function() {
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

    _setZIndex:function(zIndex) {
        this._render._setZIndex(zIndex);
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