Z.render.map={};

/**
 * 地图渲染类的父类, 不可实例化, 定义了地图渲染类中共用方法
 */
Z.render.map.Render = Z.Class.extend({

    onZoomStart:function(startScale, endScale, transOrigin, duration, fn, context, args) {
        var map = this.map;
        if (Z.Browser.ielt9) {
            setTimeout(function() {
                fn.apply(context, args);
            },duration);
            return;
        }


        this._clearCanvas();
        if (map.options['zoomAnimation']) {
            this._context.save();
            var baseTileLayer = map.getBaseTileLayer();
            var baseLayerImage;
            if (baseTileLayer.isCanvasRender()) {
                // duration = zoomDuration || map.options['zoomAnimationDuration'],
                baseLayerImage = baseTileLayer._getRender().getCanvasImage();
            }

            var width = this._canvas.width,
                height = this._canvas.height;
            var layersToTransform;
            if (!map.options['layerZoomAnimation']) {
                if (baseLayerImage) {
                    //zoom animation with better performance, only animate baseTileLayer, ignore other layers.
                    this._drawLayerCanvasImage(baseLayerImage, width, height);
                    layersToTransform = [baseTileLayer];
                } else {
                    layersToTransform = [];
                }
            } else {
                //default zoom animation, animate all the layers.
                this._rend();
            }
            Z.animation.animate(new Z.animation.zoom({
                'scale1' : startScale,
                'scale2': endScale,
                'duration' : duration
            }), map, function(frame) {
                var matrixes = this._getZoomMatrix(frame.scale, transOrigin);
                this.transform(matrixes[0], matrixes[1], layersToTransform);
                if (frame.state['end']) {
                    delete this._transMatrix;
                    this._clearCanvas();
                    //only draw basetile layer
                    matrixes[0].applyToContext(this._context);
                    if (baseLayerImage) {
                        this._drawLayerCanvasImage(baseLayerImage, width, height);
                        this._canvasBackgroundImage = Z.DomUtil.copyCanvas(this._canvas);
                    } else {
                        delete this._canvasBackgroundImage;
                    }
                    this._context.restore();
                    fn.apply(context, args);
                }
            }, this);

        } else {
            fn.apply(context, args);
        }

    },

    /**
     * get Transform Matrix for zooming
     * @param  {Number} scale  scale
     * @param  {Point} origin Transform Origin
     */
    _getZoomMatrix:function(scale, origin) {
        var r = Z.Browser.retina?2:1;
        var mapTransOrigin = origin.multi(r);
        //matrix for layers to caculate points.
        var matrix = new Z.Matrix().translate(origin.x, origin.y)
            .scaleU(scale).translate(-origin.x,-origin.y);
        //matrix for this._context to draw layerImage.
        var retinaMatrix = new Z.Matrix().translate(mapTransOrigin.x, mapTransOrigin.y)
            .scaleU(scale).translate(-mapTransOrigin.x,-mapTransOrigin.y).scaleU(r);
        return [matrix, retinaMatrix];
    },

    /**
     * 对图层进行仿射变换
     * @param  {Matrix} matrix 变换矩阵
     * @param  {Matrix} retinaMatrix retina屏时,用来绘制图层canvas的变换矩阵
     * @param  {[Layer]} layersToTransform 参与变换和绘制的图层
     */
    transform:function(matrix, retinaMatrix, layersToTransform) {
        var mwidth = this._canvas.width,
            mheight = this._canvas.height;
        var layers = layersToTransform || this._getAllLayerToCanvas();
        this._transMatrix = matrix;
        if (!retinaMatrix) {
            retinaMatrix = matrix;
        }
        //automatically enable ecoTransform with mobile browsers.
        var ecoTransform = Z.Browser.mobile || this.map.options['ecoTransform'];
        this._clearCanvas();
        if (ecoTransform) {
            this._context.save();
            retinaMatrix.applyToContext(this._context);
        }

        for (var i = 0, len=layers.length; i < len; i++) {
            if (!layers[i].isVisible()) {
                continue;
            }
            var render = layers[i]._getRender();
            if (render) {
                if (!ecoTransform) {
                    this._context.save();
                    if (layers[i] instanceof Z.TileLayer || render.shouldEcoTransform()) {
                        retinaMatrix.applyToContext(this._context);
                    } else {
                        //redraw all the geometries with transform matrix
                        //this may bring low performance if number of geometries is large.
                        render.rendRealTime();
                    }
                }

                var layerImage = render.getCanvasImage();
                if (layerImage && layerImage['image']) {
                    this._drawLayerCanvasImage(layerImage, mwidth, mheight);
                }
                 if (!ecoTransform) {
                    this._context.restore();
                }
            }
        }
        if (ecoTransform) {
            this._context.restore();
        }
    },

    /**
     * 获取底图当前的仿射矩阵
     * @return {Matrix} 仿射矩阵
     */
    getTransform:function() {
        return this._transMatrix;
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
                duration = t*(Math.abs(moveOffset.x)+Math.abs(moveOffset.y))/600;
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
            this.offsetPlatform(moveOffset);
            this._offsetCenterByPixel(new Z.Point(-moveOffset.x,-moveOffset.y));
            map._onMoveEnd();
        }


    },


    /**
     * 基于Canvas的渲染方法, layers总定义了要渲染的图层
     */
    _rend:function() {
        if (!Z.Browser.canvas) {
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
        if (mwidth === 0 || mheight === 0){
            return;
        }
        var point = layerImage['point'];
        var size = layerImage['size'];
        var canvasImage = layerImage['image'];
        if (Z.runningInNode) {
            if (canvasImage.toBuffer) {
                //node-canvas
                canvasImage = new Image();
                var buffer = layerImage['image'].toBuffer();
                canvasImage.src = buffer;
            } else {
                //canvas2svg
                canvasImage = canvasImage.getContext('2d');
            }
            //CanvasMock并不一定实现了drawImage(img, sx, sy, w, h, dx, dy, w, h)
            this._context.drawImage(canvasImage, point.x, point.y);
        } else {
            var sx, sy, w, h, dx, dy;
            if (point.x <= 0) {
                sx = -point.x;
                dx = 0;
                w = Math.min(size['width']-sx,mwidth);
            } else {
                sx = 0;
                dx = point.x;
                w = mwidth-point.x;
            }
            if (point.y <= 0) {
                sy = -point.y;
                dy = 0;
                h = Math.min(size['height']-sy,mheight);
            } else {
                sy = 0;
                dy = point.y;
                h = mheight-point.y;
            }
            if (dx < 0 || dy < 0 || w <=0 || h <= 0) {
                return;
            }
            this._context.drawImage(canvasImage, sx, sy, w, h, dx, dy, w, h);
        }
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
        if (canvas.style) {
            canvas.style.width = mapSize['width']+'px';
            canvas.style.height = mapSize['height']+'px';
        }
        if (this._context) {
            Z.Canvas.resetContextState(this._context);
        }
        return true;
    },



    _zoomAnimationEnd:function() {
        if (Z.Browser.ielt9 || !this._panels || !this._panels.tileContainer) {return;}
        //恢复底图的css3 transform
        var tileContainer = this._panels.tileContainer;
        tileContainer.style.top=0+"px";
        tileContainer.style.left=0+"px";
    },
});
