Z.render.map={};

/**
 * 地图渲染类的父类, 不可实例化, 定义了地图渲染类中共用方法
 */
Z.render.map.Render = Z.Class.extend({
    /**
     * 基于Canvas的渲染方法, layers总定义了要渲染的图层
     */
    _rend:function(layers) {
        if (!Z.Util.isArrayHasData(layers)) {
            return;
        }
        if (!this._canvas) {
            this._createCanvas();
        } /*else {
            Z.Canvas.clearRect(this._context, 0, 0, this._canvas.width, this._canvas.height);
        }*/
        var me = this;
        var promises = [];
        for (var i = layers.length - 1; i >= 0; i--) {
            promises = promises.concat(layers[i]._getRender().promise());
        }
        Z.Promise.all(promises).then(function(reources) {
            me._draw(layers,reources);
        });
    },

    _draw:function(layers,reources) {

        this._resetCanvasPosition();
        for (var i = layers.length - 1; i >= 0; i--) {
            layers[i]._getRender().draw(this._context,reources);
            //采用putImageData实现会出现crossOrigin错误, 故直接传递_context给图层render
            /*var layerCtx = layers[i]._getRender().draw();*/
            // var layerImg = layerCtx.getImageData(0,0,this._canvas.width,this._canvas.height);
            // this._context.putImageData(layerImg, 0, 0);
        }
    },

    _createCanvas:function() {
        this._canvas = Z.DomUtil.createEl('canvas');
        this._canvas.style.cssText = 'position:absolute;top:0px;left:0px;';
        this._updateCanvasSize();
        this._context = this._canvas.getContext('2d');
        if (Z.Browser.retina) {
            this._context.scale(2, 2);
        }
        this._panels.canvasLayerContainer.appendChild(this._canvas);
    },

    _clearCanvas:function() {
        if (!this._canvas) {
            return;
        }
        Z.Canvas.clearRect(this._context, 0, 0, this._canvas.width, this._canvas.height);
    },

    _resetCanvasPosition:function() {
        if (!this._canvas) {
            return;
        }
        this._clearCanvas();
        var offset = this.offsetPlatform();
        this._canvas.style.left = -offset['left']+'px';
        this._canvas.style.top = -offset['top']+'px';
    },

    _updateCanvasSize: function() {
        if (!this._canvas) {
            return;
        }
        var map = this.map;
        var mapSize = map.getSize();
        var canvas = this._canvas;
        //retina屏支持
        var r = Z.Browser.retina ? 2:1;
        canvas.height = r * mapSize['height'];
        canvas.width = r * mapSize['width'];
        canvas.style.width = mapSize['width']+'px';
        canvas.style.height = mapSize['height']+'px';

    },

    updateMapSize:function(mSize) {
        if (!mSize) {return;}
        var width = mSize['width'],
            height = mSize['height'];
        var panels = this._panels;
        panels.mapWrapper.style.width = width + 'px';
        panels.mapWrapper.style.height = height + 'px';
        panels.mapViewPort.style.width = width + 'px';
        panels.mapViewPort.style.height = height + 'px';
        panels.controlWrapper.style.width = width + 'px';
        panels.controlWrapper.style.height = height + 'px';
        this._updateCanvasSize();
    },

    getPanel: function() {
        return this._panels.mapViewPort;
    }
});
