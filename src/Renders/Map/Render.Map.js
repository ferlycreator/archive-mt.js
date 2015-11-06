Z.render.map={};

/**
 * 地图渲染类的父类, 不可实例化, 定义了地图渲染类中共用方法
 */
Z.render.map.Render = Z.Class.extend({
    /**
     * 基于Canvas的渲染方法, layers总定义了要渲染的图层
     */
    _rend:function() {
        if (!this._canvas) {
            this._createCanvas();
        }
        //更新画布的长宽, 顺便清空画布
        if (!this._updateCanvasSize()) {
            this._clearCanvas();
        }
        var mwidth = this._canvas.width,
            mheight = this._canvas.height;
        if (this._canvasBackgroundImage) {
            Z.Canvas.image(this._context, new Z.Point(0,0), this._canvasBackgroundImage);
        }
        var layers = this._getAllLayerToCanvas();
        for (var i = 0, len=layers.length; i < len; i++) {
            if (!layers[i].isVisible()) {
                continue;
            }
            var render = layers[i]._getRender();
            if (render) {
                var layerImage = render.getCanvasImage();
                if (layerImage && layerImage['image']) {
                    this._drawLayerCanvasImage(layerImage, mwidth, mheight);
                }
            }
        }
    },

    _drawLayerCanvasImage:function(layerImage, mwidth, mheight) {
        // Z.Canvas.image(this._context, layerImage['point'], layerImage['image']);
        if (mwidth === 0 || mheight === 0){
            return;
        }
        var sx, sy, w, h, dx, dy;
        var point = layerImage['point'];
        var size = layerImage['size'];
        if (point['left'] <= 0) {
            sx = -point['left'];
            dx = 0;
            w = Math.min(size['width']-sx,mwidth);
        } else {
            sx = 0;
            dx = point['left'];
            w = mwidth-point['left'];
        }
        if (point['top'] <= 0) {
            sy = -point['top'];
            dy = 0;
            h = Math.min(size['height']-sy,mheight);
        } else {
            sy = 0;
            dy = point['top'];
            h = mheight-point['top'];
        }
        if (dx < 0 || dy < 0 || w <=0 || h <= 0) {
            return;
        }
        Z.Canvas.disableImageSmoothing(this._context);
        // console.log(layerImage['image'], sx, sy, w, h, dx, dy, w, h, mwidth,mheight);
        this._context.drawImage(layerImage['image'], sx, sy, w, h, dx, dy, w, h);
    },

    _askBaseTileLayerToRend:function() {
        this.map.getBaseTileLayer()._getRender().rend();
    },

    _getAllLayerToCanvas:function() {
        var layers = this.map._getAllLayers(function(layer) {
            if (layer.isCanvasRender()) {
                return true;
            }
            return false;
        });
        return layers;
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
        var mapSize = this.map.getSize();
        if (mapSize['width'] !== parseInt(this._canvas.style.width)
            || mapSize['height']!== parseInt(this._canvas.style.height)) {
            this._updateCanvasSize();
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
        var r = Z.Browser.retina ? 2:1;
        if (mapSize['width']*r === canvas.width && mapSize['height']*r === canvas.height) {
            return false;
        }
        //retina屏支持

        canvas.height = r * mapSize['height'];
        canvas.width = r * mapSize['width'];
        canvas.style.width = mapSize['width']+'px';
        canvas.style.height = mapSize['height']+'px';
        if (this._context) {
            Z.Canvas.resetContextState(this._context);
        }
        return true;
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
    },

    getPanel: function() {
        return this._panels.mapViewPort;
    }
});
