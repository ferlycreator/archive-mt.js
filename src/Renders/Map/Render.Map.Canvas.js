Z.render.map.Canvas = Z.render.map.Render.extend({
    initialize:function(map) {
        this.map = map;
        this._panels = map._panels;
        this._registerEvents();
    },

    _registerEvents:function() {
        this.map.on('_moveend _zoomend _resize',function() {
            this.render();
        },this);
        this.map.on('_baselayerload',function() {
            this.render();
        },this);
    },

    /**
     * 获取图层渲染容器
     * @param  {Layer} layer 图层
     * @return {Dom}       容器Dom对象
     */
    getLayerRenderContainer:function(layer) {
        if (!this._canvas) {
            this._createCanvas();
        }
        return this._canvas;
    },

    render:function() {
        this.resetContainer();
        var map = this.map;
        var layers = map._getLayers();
        for (var i = 0, len=layers.length; i < len; i++) {
            var render = layers[i]._getRender();
            render.rendLayer();
        }
    },

    /**
     * 获取地图容器偏移量或更新地图容器偏移量
     * @param  {Point} offset 偏移量
     * @return {this | Point}
     */
    offsetPlatform:function(offset) {
        if (!offset) {
            return Z.DomUtil.offsetDom(this._panels.mapPlatform);
        } else {
            var domOffset = Z.DomUtil.offsetDom(this._panels.mapPlatform);
            Z.DomUtil.offsetDom(this._panels.mapPlatform, domOffset.add(offset));
            return this;
        }
    },

    resetContainer:function() {
        var containerOffset = this.map.offsetPlatform();
        this._canvas.style.left=(-containerOffset['left'])+"px";
        this._canvas.style.top=(-containerOffset['top'])+"px";
    },

    insertBackground:function() {

    },

    /**
     * 移除背景Dom对象
     */
    removeBackGroundDOM:function() {
    },

    showOverlayLayers:function() {
        this.render();
    },

    hideOverlayLayers:function() {
        this.render();
    }
});
