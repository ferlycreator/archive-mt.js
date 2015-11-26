Z.render.map.Canvas = Z.render.map.Render.extend({
    initialize:function(map) {
        this.map = map;
        this._panels = map._panels;
        this._registerEvents();
    },

    _registerEvents:function() {
        this.map.on('_movestart _baselayerchangestart _baselayerchangeend _baselayerload',function() {
           delete this._canvasBackgroundImage;
           this.rend();
        },this);
        this.map.on('_moving', function() {
            this.rend();
        },this);
        this.map.on('_zoomstart',function() {
            delete this._canvasBackgroundImage;
            this._clearCanvas();
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

    getContainerDomSize:function() {
        var map = this.map;
        if (!map._containerDOM) {return null;}
        var containerDOM = map._containerDOM;
        return new Z.Size(containerDOM.width, containerDOM.height);
    },

    updateMapSize:function(mSize) {
        return;
    },

    getPanel: function() {
        return;
    },

    rend:function() {
        this._rend();
    },

    /**
     * 获取地图容器偏移量或更新地图容器偏移量
     * @param  {Point} offset 偏移量
     * @return {this | Point}
     */
    offsetPlatform:function(offset) {
        //there is nothing to do
        return this;
    },

    resetContainer:function() {
        return this;
    },

    showOverlayLayers:function() {
        return this;
    },

    hideOverlayLayers:function() {
        return this;
    },

    /**
     * [createVectorPaper description]
     * @return {[type]} [description]
     */
    getSvgPaper: function(){
        return null;
    },

    initContainer:function() {
        return this;
    },

    _createCanvas:function() {
        this._canvas = this.map._containerDOM;
        this._context = this._canvas.getContext('2d');
        if (Z.Browser.retina) {
            this._context.scale(2, 2);
        }
    }
});
