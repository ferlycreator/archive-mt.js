Z.render.map.Dom = Z.render.map.Render.extend({
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
        this.map.on('_moveend _resize',function() {
            //this.rend();
            this._refreshSVGPaper();
        },this);
        this.map.on('_moving', function() {
            this.rend();
        },this);
        this.map.on('_zoomstart',function() {
            delete this._canvasBackgroundImage;
            this._clearCanvas();
        },this);
        this.map.on('_zoomend',function() {
            // this.rend();
            this._refreshSVGPaper();
        },this);
    },

    /**
     * 获取图层渲染容器
     * @param  {Layer} layer 图层
     * @return {Dom}       容器Dom对象
     */
    getLayerRenderContainer:function(layer) {
        if (layer.isCanvasRender()) {
            if (!this._canvas) {
                    this._createCanvas();
            }
            return this._canvas;
        }
        if (layer instanceof Z.TileLayer) {
            return this._panels.mapContainer;
        } else if (layer instanceof Z.VectorLayer) {
            return this._panels.svgContainer;
        }
    },

    /**
     * 绘制所有图层
     */
    rend:function() {
        this._rend();
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
        var position = this.offsetPlatform();
        Z.DomUtil.offsetDom(this._panels.mapPlatform, new Z.Point(0,0)); //{'left':0,'top':0}
        this.map._resetMapViewPoint();

    },



    showOverlayLayers:function() {
        this._panels.svgContainer.style.display="";
        // this._panels.canvasLayerContainer.style.display="";
    },

    hideOverlayLayers:function() {
        this._panels.svgContainer.style.display="none";
        // this._panels.canvasLayerContainer.style.display="none";
        // this._panels.tipContainer.style.display="none";
    },

    /**
     * [createVectorPaper description]
     * @return {[type]} [description]
     */
    getSvgPaper: function(){
        if (!this._vectorPaper) {
            var svgContainer = this._panels.svgContainer;
            this._vectorPaper = Z.SVG.createContainer();
            this._refreshSVGPaper();
            svgContainer.appendChild(this._vectorPaper);
        }
        return this._vectorPaper;
    },

    _refreshSVGPaper: function() {
        if (!this._vectorPaper) {
            return;
        }
        Z.SVG.refreshContainer(this.map,this._vectorPaper);
    },

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

    _zoomAnimationEnd:function() {
        if (Z.Browser.ielt9) {return;}

        //恢复底图的css3 transform
        var mapContainer = this._panels.mapContainer;
        // mapContainer.className="MAP_CONTAINER";
        // Z.DomUtil.setDomTransformOrigin(mapContainer,"");
        // Z.DomUtil.setDomTransform(mapContainer,"");
        mapContainer.style.top=0+"px";
        mapContainer.style.left=0+"px";
    },

    panAnimation:function(moveOffset, t) {
        moveOffset = new Z.Point(moveOffset);
        var map = this.map;
        if (map.options['panAnimation']) {
            var duration;
            if (!t) {
                duration = map.options['panAnimationDuration'];
            } else {
                duration = t*2;
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
     * initialize container DOM of panels
     */
    initContainer:function() {
        var container = this.map._container;
        var _containerDOM;

        if (Z.Util.isString(container)) {
            _containerDOM = document.getElementById(container);
            if (!_containerDOM) {
                throw new Error('invalid _container id: \''+container+'\'');
            }
        } else {
            if (!container || !container.appendChild) {
                throw new Error('invalid _container element');
            }
            _containerDOM = container;
        }
        this._containerDOM = _containerDOM;
        _containerDOM.innerHTML = '';
        _containerDOM.className = 'MAP_CONTAINER_TOP';

        var controlWrapper = Z.DomUtil.createEl('div');
        controlWrapper.className = 'MAP_CONTROL_WRAPPER';

        var _controlsContainer = Z.DomUtil.createEl('div');
        _controlsContainer.className = 'MAP_CONTROLS_CONTAINER';
        _controlsContainer.style.cssText = 'z-index:3002';
        controlWrapper.appendChild(_controlsContainer);
        //map wrapper定义了全局的背景色, hidden overflow等css属性
        var _mapWrapper = Z.DomUtil.createEl('div');
        _mapWrapper.style.cssText = 'position:absolute;overflow:hidden;';
        _mapWrapper.className='MAP_WRAPPER';
        _containerDOM.appendChild(_mapWrapper);

        // 最外层的div
        var _mapPlatform = Z.DomUtil.createEl('div');
        // _mapPlatform.id='_mapPlatform';
        _mapPlatform.className = 'MAP_PLATFORM';
        _mapPlatform.style.cssText = 'position:absolute;top:0px;left:0px;z-index:10;';
        _mapWrapper.appendChild(_mapPlatform);
        _mapWrapper.appendChild(controlWrapper);

        var _mapViewPort = Z.DomUtil.createEl('div');
        // _mapViewPort.id='_mapViewPort';
        _mapViewPort.className = 'MAP_VIEWPORT';
        _mapViewPort.style.cssText = 'position:absolute;top:0px;left:0px;z-index:10;-moz-user-select:none;-webkit-user-select: none;';
        _mapPlatform.appendChild(_mapViewPort);

        var _mapContainer = Z.DomUtil.createEl('div');
        _mapContainer.className = 'MAP_CONTAINER';

        _mapContainer.style.cssText = 'position:absolute;top:0px;left:0px;';
        _mapContainer.style.border = 'none';
        //var _backContainer = _mapContainer.cloneNode(false);
        var _tipContainer = _mapContainer.cloneNode(false);
        var _popMenuContainer = _mapContainer.cloneNode(false);
        var _contextCtrlContainer = _mapContainer.cloneNode(false);
        var _svgContainer = _mapContainer.cloneNode(false);
        var _canvasLayerContainer = _mapContainer.cloneNode(false);

        _tipContainer.className = 'MAP_TIP_CONTAINER';
        _popMenuContainer.className = 'MAP_POPMENU_CONTAINER';
        _contextCtrlContainer.className = 'MAP_CONTEXTCTRL_CONTAINER';
        _svgContainer.className = 'MAP_SVG_CONTAINER';
        _canvasLayerContainer.className = 'MAP_CANVAS_CONTAINER';

        _mapContainer.style.zIndex = 10;
        // _mapContainer.id='mapContainer';
        _canvasLayerContainer.style.zIndex=1;
        _svgContainer.style.zIndex = 200;
        _popMenuContainer.style.zIndex = 3000;
        _contextCtrlContainer.style.zIndex = 3000;
        _tipContainer.style.zIndex = 3001;

        _mapViewPort.appendChild(_mapContainer);

        _contextCtrlContainer.appendChild(_tipContainer);
        _contextCtrlContainer.appendChild(_popMenuContainer);
        _mapPlatform.appendChild(_contextCtrlContainer);
        _mapWrapper.appendChild(_canvasLayerContainer);
        _mapViewPort.appendChild(_svgContainer);

        //解决ie下拖拽矢量图形时，底图div会选中变成蓝色的bug
        if (Z.Browser.ie) {
            _mapViewPort['onselectstart'] = function(e) {
                return false;
            };
            _mapViewPort['ondragstart'] = function(e) { return false; };
            _mapViewPort.setAttribute('unselectable', 'on');

            _mapContainer['onselectstart'] = function(e) {
                return false;
            };
            _mapContainer['ondragstart'] = function(e) { return false; };
            _mapContainer.setAttribute('unselectable', 'on');


            controlWrapper['onselectstart'] = function(e) {
                return false;
            };
            controlWrapper['ondragstart'] = function(e) { return false; };
            controlWrapper.setAttribute('unselectable', 'on');

            _mapWrapper.setAttribute('unselectable', 'on');
            _mapPlatform.setAttribute('unselectable', 'on');
        }


        //store panels
        var panels = this._panels;
        panels.controlWrapper = controlWrapper;
        panels.mapWrapper = _mapWrapper;
        panels.mapViewPort = _mapViewPort;
        panels.mapPlatform = _mapPlatform;
        panels.mapContainer = _mapContainer;
        panels.tipContainer = _tipContainer;
        panels.popMenuContainer = _popMenuContainer;
        panels.svgContainer = _svgContainer;
        panels.canvasLayerContainer = _canvasLayerContainer;
//
//
        // this.panels = panels;
        //初始化mapPlatform的偏移量, 适用css3 translate时设置初始值
        this.offsetPlatform(new Z.Point(0,0));
        var mapSize = this.map._getContainerDomSize();
        this.updateMapSize(mapSize);
    }
});
