Z.render.map.Dom = Z.render.map.Render.extend({
    initialize:function(map) {
        this.map = map;
        this._panels = map._panels;
        this._registerEvents();
    },

    _registerEvents:function() {
        var map = this.map;
        map.on('_movestart _baselayerchangestart _baselayerchangeend _baselayerload',function() {
           delete this._canvasBackgroundImage;
           this.rend();
        },this);
        map.on('_moveend _resize',function() {
            //this.rend();
            this._refreshSVGPaper();
        },this);
        map.on('_moving', function() {
            this.rend();
        },this);
        map.on('_zoomstart',function() {
            delete this._canvasBackgroundImage;
            this._clearCanvas();
        },this);
        map.on('_zoomend',function() {
            // this.rend();
            this._refreshSVGPaper();
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
            return this._panels.tileContainer;
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
        Z.DomUtil.offsetDom(this._panels.mapPlatform, new Z.Point(0,0)); //{'left':0,'top':0}
        this.map._resetMapViewPoint();
    },

    getContainerDomSize:function() {
        var map = this.map;
        if (!map._containerDOM) {return null;}
        var containerDOM = map._containerDOM;
        var mapWidth = parseInt(containerDOM.offsetWidth,0);
        var mapHeight = parseInt(containerDOM.offsetHeight,0);
        return new Z.Size(mapWidth, mapHeight);
    },

    showOverlayLayers:function() {
        this._panels.svgContainer.style.display="";
    },

    hideOverlayLayers:function() {
        this._panels.svgContainer.style.display="none";
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

    /**
     * 设置地图的watcher, 用来监视地图容器的大小变化
     * @ignore
     */
    _onResize:function() {
        this.map.invalidateSize();
    },

    /**
     * initialize container DOM of panels
     */
    initContainer:function() {
        var container = this.map._container;
        var containerDOM;

        if (Z.Util.isString(container)) {
            containerDOM = document.getElementById(container);
            if (!containerDOM) {
                throw new Error('invalid _container id: \''+container+'\'');
            }
        } else {
            if (!container || !container.appendChild) {
                throw new Error('invalid _container element');
            }
            containerDOM = container;
        }
        this._containerDOM = containerDOM;
        containerDOM.innerHTML = '';
        containerDOM.className = 'MAP_CONTAINER_TOP';

        var controlWrapper = Z.DomUtil.createEl('div');
        controlWrapper.className = 'MAP_CONTROL_WRAPPER';

        var controlsContainer = Z.DomUtil.createEl('div');
        controlsContainer.className = 'MAP_CONTROLS_CONTAINER';
        controlsContainer.style.cssText = 'z-index:3002';
        controlWrapper.appendChild(controlsContainer);
        //map wrapper定义了全局的背景色, hidden overflow等css属性
        var mapWrapper = Z.DomUtil.createEl('div');
        mapWrapper.style.cssText = 'position:absolute;overflow:hidden;';
        mapWrapper.className='MAP_WRAPPER';
        containerDOM.appendChild(mapWrapper);

        // 最外层的div
        var mapPlatform = Z.DomUtil.createEl('div');
        mapPlatform.className = 'MAP_PLATFORM';
        mapPlatform.style.cssText = 'position:absolute;top:0px;left:0px;z-index:10;';
        mapWrapper.appendChild(mapPlatform);
        mapWrapper.appendChild(controlWrapper);

        var mapViewPort = Z.DomUtil.createEl('div');
        mapViewPort.className = 'MAP_VIEWPORT';
        mapViewPort.style.cssText = 'position:absolute;top:0px;left:0px;z-index:10;-moz-user-select:none;-webkit-user-select: none;';
        mapPlatform.appendChild(mapViewPort);

        var tileContainer = Z.DomUtil.createEl('div');
        tileContainer.className = 'MAP_CONTAINER';

        tileContainer.style.cssText = 'position:absolute;top:0px;left:0px;';
        tileContainer.style.border = 'none';
        var tipContainer = tileContainer.cloneNode(false);
        var popMenuContainer = tileContainer.cloneNode(false);
        var contextCtrlContainer = tileContainer.cloneNode(false);
        var svgContainer = tileContainer.cloneNode(false);
        var canvasLayerContainer = tileContainer.cloneNode(false);

        tipContainer.className = 'MAP_TIP_CONTAINER';
        popMenuContainer.className = 'MAP_POPMENU_CONTAINER';
        contextCtrlContainer.className = 'MAP_CONTEXTCTRL_CONTAINER';
        svgContainer.className = 'MAP_SVG_CONTAINER';
        canvasLayerContainer.className = 'MAP_CANVAS_CONTAINER';

        tileContainer.style.zIndex = 10;
        canvasLayerContainer.style.zIndex=100;
        svgContainer.style.zIndex = 200;
        popMenuContainer.style.zIndex = 3000;
        contextCtrlContainer.style.zIndex = 3000;
        tipContainer.style.zIndex = 3001;

        mapViewPort.appendChild(tileContainer);

        contextCtrlContainer.appendChild(tipContainer);
        contextCtrlContainer.appendChild(popMenuContainer);
        mapPlatform.appendChild(contextCtrlContainer);
        mapWrapper.appendChild(canvasLayerContainer);
        mapViewPort.appendChild(svgContainer);

        //解决ie下拖拽矢量图形时，底图div会选中变成蓝色的bug
        if (Z.Browser.ie) {
            mapViewPort['onselectstart'] = function(e) {
                return false;
            };
            mapViewPort['ondragstart'] = function(e) { return false; };
            mapViewPort.setAttribute('unselectable', 'on');

            tileContainer['onselectstart'] = function(e) {
                return false;
            };
            tileContainer['ondragstart'] = function(e) { return false; };
            tileContainer.setAttribute('unselectable', 'on');


            controlWrapper['onselectstart'] = function(e) {
                return false;
            };
            controlWrapper['ondragstart'] = function(e) { return false; };
            controlWrapper.setAttribute('unselectable', 'on');

            mapWrapper.setAttribute('unselectable', 'on');
            mapPlatform.setAttribute('unselectable', 'on');
        }


        //store panels
        var panels = this._panels;
        panels.controlWrapper = controlWrapper;
        panels.mapWrapper = mapWrapper;
        panels.mapViewPort = mapViewPort;
        panels.mapPlatform = mapPlatform;
        panels.tileContainer = tileContainer;
        panels.tipContainer = tipContainer;
        panels.popMenuContainer = popMenuContainer;
        panels.svgContainer = svgContainer;
        panels.canvasLayerContainer = canvasLayerContainer;

        //初始化mapPlatform的偏移量, 适用css3 translate时设置初始值
        this.offsetPlatform(new Z.Point(0,0));
        var mapSize = this.map._getContainerDomSize();
        this.updateMapSize(mapSize);
    }
});
