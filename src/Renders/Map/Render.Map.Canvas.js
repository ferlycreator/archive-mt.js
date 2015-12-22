Z.render.map.Canvas = Z.render.map.Render.extend({
    initialize:function(map) {
        this.map = map;
        //container is a <canvas> element
        this._isCanvasContainer = !!map._containerDOM.getContext;
        this._registerEvents();
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

    /**
     * 基于Canvas的渲染方法, layers总定义了要渲染的图层
     */
    render:function() {
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

    onZoomStart:function(startScale, endScale, transOrigin, duration, fn, context, args) {
        var map = this.map;
        if (Z.Browser.ielt9) {
            setTimeout(function() {
                fn.apply(context, args);
            },duration);
            return;
        }

        function getZoomMatrix(scale, origin) {
            var r = Z.Browser.retina?2:1;
            var mapTransOrigin = origin.multi(r);
            //matrix for layers to caculate points.
            var matrix = new Z.Matrix().translate(origin.x, origin.y)
                .scaleU(scale).translate(-origin.x,-origin.y);
            //matrix for this._context to draw layerImage.
            var retinaMatrix = new Z.Matrix().translate(mapTransOrigin.x, mapTransOrigin.y)
                .scaleU(scale).translate(-mapTransOrigin.x,-mapTransOrigin.y).scaleU(r);
            return [matrix, retinaMatrix];
        }

        this._clearCanvas();
        if (map.options['zoomAnimation']) {
            this._context.save();
            var baseTileLayer = map.getBaseTileLayer();
            var baseLayerImage = baseTileLayer._getRender().getCanvasImage();

            var width = this._canvas.width,
                height = this._canvas.height;
            var layersToTransform;
            if (!map.options['layerZoomAnimation']) {
                //zoom animation with better performance, only animate baseTileLayer, ignore other layers.
                this._drawLayerCanvasImage(baseLayerImage, width, height);
                layersToTransform = [baseTileLayer];
            } else {
                //default zoom animation, animate all the layers.
                this.render();
            }
            Z.animation.animate(new Z.animation.zoom({
                'scale1' : startScale,
                'scale2': endScale,
                'duration' : duration
            }), map, function(frame) {
                var matrixes = getZoomMatrix(frame.scale, transOrigin);
                this.transform(matrixes[0], matrixes[1], layersToTransform);
                if (frame.state['end']) {
                    delete this._transMatrix;
                    this._clearCanvas();
                    //only draw basetile layer
                    matrixes[0].applyToContext(this._context);
                    this._drawLayerCanvasImage(baseLayerImage, width, height);
                    this._canvasBackgroundImage = Z.DomUtil.copyCanvas(this._canvas);
                    this._context.restore();
                    fn.apply(context, args);
                }
            }, this);

        } else {
            fn.apply(context, args);
        }

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
        var scale = matrix.decompose()['scale'];
        this._transMatrix._scale = scale;
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

    updateMapSize:function(mSize) {
        if (!mSize || this._isCanvasContainer) {return;}
        var width = mSize['width'],
            height = mSize['height'];
        var panels = this.map._panels;
        panels.mapWrapper.style.width = width + 'px';
        panels.mapWrapper.style.height = height + 'px';
        panels.controlWrapper.style.width = width + 'px';
        panels.controlWrapper.style.height = height + 'px';
    },

    getPanel: function() {
        if (this._isCanvasContainer) {
            return this.map._containerDOM;
        }
        return this.map._panels.mapWrapper;
    },

    /**
     * initialize container DOM of panels
     */
    initContainer:function() {
        var containerDOM = this.map._containerDOM;

        if (this._isCanvasContainer) {
            //container is a <canvas> element.
            return;
        }

        containerDOM.innerHTML = '';

        var controlWrapper = Z.DomUtil.createEl('div');
        controlWrapper.className = 'MAP_CONTROL_WRAPPER';

        var controlsContainer = Z.DomUtil.createEl('div');
        controlsContainer.className = 'MAP_CONTROLS_CONTAINER';
        controlWrapper.appendChild(controlsContainer);
        //map wrapper定义了全局的背景色, hidden overflow等css属性
        var mapWrapper = Z.DomUtil.createEl('div');
        mapWrapper.style.cssText = 'position:absolute;overflow:hidden;';
        mapWrapper.className='MAP_WRAPPER';
        containerDOM.appendChild(mapWrapper);

        // 最外层的div
        var mapPlatform = Z.DomUtil.createEl('div');
        mapPlatform.className = 'MAP_PLATFORM';
        mapPlatform.style.cssText = 'position:absolute;top:0px;left:0px;';
        mapWrapper.appendChild(mapPlatform);
        mapWrapper.appendChild(controlWrapper);

        var mapViewPort = Z.DomUtil.createEl('div');
        mapViewPort.className = 'MAP_VIEWPORT';
        mapViewPort.style.cssText = 'position:absolute;top:0px;left:0px;z-index:10;-moz-user-select:none;-webkit-user-select: none;';


        var tipContainer = Z.DomUtil.createEl('div');
        tipContainer.className = 'MAP_CONTAINER';
        tipContainer.style.cssText = 'position:absolute;top:0px;left:0px;';
        tipContainer.style.border = 'none';
        var popMenuContainer = tipContainer.cloneNode(false);
        var contextCtrlContainer = tipContainer.cloneNode(false);
        var canvasLayerContainer = tipContainer.cloneNode(false);

        tipContainer.className = 'MAP_TIP_CONTAINER';
        popMenuContainer.className = 'MAP_POPMENU_CONTAINER';
        contextCtrlContainer.className = 'MAP_CONTEXTCTRL_CONTAINER';
        canvasLayerContainer.className = 'MAP_CANVAS_CONTAINER';

        canvasLayerContainer.style.zIndex=1;
        mapPlatform.style.zIndex = 2;
        controlWrapper.style.zIndex = 3;

        contextCtrlContainer.appendChild(tipContainer);
        contextCtrlContainer.appendChild(popMenuContainer);
        mapPlatform.appendChild(contextCtrlContainer);
        mapWrapper.appendChild(canvasLayerContainer);

        //解决ie下拖拽矢量图形时，底图div会选中变成蓝色的bug
        if (Z.Browser.ie) {

            controlWrapper['onselectstart'] = function(e) {
                return false;
            };
            controlWrapper['ondragstart'] = function(e) { return false; };
            controlWrapper.setAttribute('unselectable', 'on');

            mapWrapper.setAttribute('unselectable', 'on');
            mapPlatform.setAttribute('unselectable', 'on');
        }


        //store panels
        var panels = this.map._panels;
        panels.controlWrapper = controlWrapper;
        panels.mapWrapper = mapWrapper;
        panels.mapPlatform = mapPlatform;
        panels.tipContainer = tipContainer;
        panels.popMenuContainer = popMenuContainer;
        panels.canvasLayerContainer = canvasLayerContainer;

        //初始化mapPlatform的偏移量, 适用css3 translate时设置初始值
        this.offsetPlatform(new Z.Point(0,0));
        var mapSize = this.map._getContainerDomSize();
        this.updateMapSize(mapSize);
    },

    _registerEvents:function() {
        var map = this.map;
        map.on('_movestart _baselayerchangestart _baselayerchangeend _baselayerload',function() {
           delete this._canvasBackgroundImage;
           this.render();
        },this);
        map.on('_moving', function() {
            this.render();
        },this);
        map.on('_zoomstart',function() {
            delete this._canvasBackgroundImage;
            this._clearCanvas();
        },this);
        if (typeof window !== 'undefined' ) {
            Z.DomUtil.on(window, 'resize', this._onResize, this);
        }
        if (!Z.Browser.mobile && Z.Browser.canvas) {
             this._onMapMouseMove=function(param) {
                var vp = map._containerPointToViewPoint(param['containerPoint']);
                var layers = map.getLayers();
                var hit = false,
                    cursor;
                for (var i = layers.length - 1; i >= 0; i--) {
                    var layer = layers[i];
                    if (layer instanceof Z.VectorLayer && layer.isCanvasRender()) {
                        if (layer.options['cursor'] !== 'default' && layer._getRender().hitDetect(vp)) {
                            cursor = layer.options['cursor'];
                            hit = true;
                            break;
                        }
                    }
                }
                if (hit) {
                    map._trySetCursor(cursor);
                } else {
                    map._trySetCursor('default');
                }
            };
            map.on('_mousemove',this._onMapMouseMove,this);
        }

    },


    _drawLayerCanvasImage:function(layerImage, mwidth, mheight) {
        if (!layerImage || mwidth === 0 || mheight === 0){
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
        if (!this._canvas || this._isCanvasContainer) {
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

    _createCanvas:function() {
        if (this._isCanvasContainer) {
            this._canvas = this.map._containerDOM;
        } else {
            this._canvas = Z.DomUtil.createEl('canvas');
            this._canvas.style.cssText = 'position:absolute;top:0px;left:0px;';
            this._updateCanvasSize();
            this.map._panels.canvasLayerContainer.appendChild(this._canvas);
        }
        this._context = this._canvas.getContext('2d');
        if (Z.Browser.retina) {
            this._context.scale(2, 2);
        }

    },

    /**
     * 设置地图的watcher, 用来监视地图容器的大小变化
     * @ignore
     */
    _onResize:function() {
        this.map.invalidateSize();
    }
});
