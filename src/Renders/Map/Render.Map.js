Z.render.map={};

/**
 * 地图渲染类的父类, 不可实例化, 定义了地图渲染类中共用方法
 */
Z.render.map.Render = Z.Class.extend({

    onZoomStart:function(scale, focusPos, fn, context, args) {
        if (Z.Browser.ielt9) {
            setTimeout(function() {
                fn.apply(context, args);
            },800);
            return;
        }
        var map = this.map;
        this._clearCanvas();
        if (map.options['zoomAnimation']) {
            var baseLayerImage = map.getBaseTileLayer()._getRender().getCanvasImage();
            var width = this._canvas.width, height = this._canvas.height;

            this._drawLayerCanvasImage(baseLayerImage, width, height);
            this._context.save();
            Z.animation.animate(new Z.animation.zoom({
                'scale1' : 1,
                'scale2': scale,
                'duration' : map.options['zoomAnimationDuration']
            }), map, function(frame) {
                this._context.save();
                this._clearCanvas();
                this._context.translate(focusPos['left'],focusPos['top']);
                this._context.scale(frame.scale, frame.scale);
                this._context.translate(-focusPos['left'],-focusPos['top']);
                this._drawLayerCanvasImage(baseLayerImage, width, height);
                this._context.restore();
                if (frame.state['end']) {
                    this._canvasBackgroundImage = Z.DomUtil.copyCanvas(this._canvas);
                    fn.apply(context, args);
                }
            }, this);
        } else {
            fn.apply(context, args);
        }

    },


    onZoomEnd:function() {
        // this.insertBackground();
        this._zoomAnimationEnd();
        this.resetContainer();
    },

    panAnimation:function(moveOffset, t) {
        moveOffset = new Z.Point(moveOffset);
        var map = this.map;
        if (map.options['panAnimation']) {
            var duration;
            if (!t) {
                duration = map.options['panAnimationDuration'];
            } else {
                duration = t;
            }
            var panMoveOffset = moveOffset.multi(0.5);
            Z.animation.animate(new Z.animation.pan({
                'distance': panMoveOffset,
                'duration' : duration
            }), map, function(frame) {
                if (!map._enablePanAnimation) {
                    map._onMoveEnd();
                    return true;
                }
                if (frame.state['end']) {
                    map._onMoveEnd();
                    return true;
                }
            }, this);
        } else {
            this.offsetPlatform(new Z.Point(moveOffset['left'],moveOffset['top']));
            this._offsetCenterByPixel(new Z.Point(-moveOffset['left'],-moveOffset['top']));
            map._onMoveEnd();
        }


    },

    /**
     * 基于Canvas的渲染方法, layers总定义了要渲染的图层
     */
    _rend:function() {
        if (!Z.Browser.Canvas) {
            return;
        }
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
        var layer = layerImage['layer'];
        var enableImageSmoothing = (!(layer instanceof Z.DynamicLayer) && (layer instanceof Z.TileLayer));
        if (enableImageSmoothing) {
            Z.Canvas.enableImageSmoothing(this._context);
        } else {
            Z.Canvas.disableImageSmoothing(this._context);
        }
        // console.log(layerImage['image'], sx, sy, w, h, dx, dy, w, h, mwidth,mheight);
        this._context.drawImage(layerImage['image'], sx, sy, w, h, dx, dy, w, h);
    },

    _askBaseTileLayerToRend:function() {
        this.map.getBaseTileLayer()._getRender().rend();
    },

    _getAllLayerToCanvas:function() {
        var layers = this.map._getLayers(function(layer) {
            if (layer.isCanvasRender()) {
                return true;
            }
            return false;
        });
        return layers;
    },

    _clearCanvas:function() {
        if (!this._canvas) {
            return;
        }
        Z.Canvas.clearRect(this._context, 0, 0, this._canvas.width, this._canvas.height);
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



    _zoomAnimationEnd:function() {
        if (Z.Browser.ielt9 || !this._panels || !this._panels.mapContainer) {return;}
        //恢复底图的css3 transform
        var mapContainer = this._panels.mapContainer;
        // mapContainer.className="MAP_CONTAINER";
        // Z.DomUtil.setDomTransformOrigin(mapContainer,"");
        // Z.DomUtil.setDomTransform(mapContainer,"");
        mapContainer.style.top=0+"px";
        mapContainer.style.left=0+"px";
    },
});
