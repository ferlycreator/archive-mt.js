Z.render.map.Dom = Z.render.map.Render.extend({
    initialize:function(map) {
        this.map = map;
        this._panels = map._panels;
        this._registerEvents();
    },

    _registerEvents:function() {

        this.map.on('_moveend _resize',function() {
            this.rend();
            this._refreshSVGPaper();
        },this);
        this.map.on('_moving', function() {
            this.rend();
        },this);
        this.map.on('_zoomstart',function() {
            this._clearCanvas();
        },this);
        this.map.on('_zoomend',function() {
            this.rend();
            this._refreshSVGPaper();
        },this);
        this.map.on('_baselayerchangestart _baselayerchangeend _baselayerload',function() {
            this.removeBackGroundDOM();
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
        //this._refreshSVGPaper();
        if (this._backgroundDOM) {
            //Z.DomUtil.offsetDom(this._backgroundDOM,position);
            this._backgroundDOM.style.left=position["left"]+"px";
            this._backgroundDOM.style.top=position["top"]+"px";
        }
    },

    insertBackground:function() {
        this._backgroundDOM = this._panels.mapContainer.cloneNode(true);
        this._panels.mapPlatform.insertBefore(this._backgroundDOM,this._panels.mapViewPort);
    },

    /**
     * 移除背景Dom对象
     */
    removeBackGroundDOM:function() {
        if (this._backgroundDOM) {
            this._backgroundDOM.innerHTML='';
            Z.DomUtil.removeDomNode(this._backgroundDOM);
            delete this._backgroundDOM;
        }
    },

    showOverlayLayers:function() {
        this._panels.svgContainer.style.display="";
        this._panels.canvasLayerContainer.style.display="";
    },

    hideOverlayLayers:function() {
        this._panels.svgContainer.style.display="none";
        this._panels.canvasLayerContainer.style.display="none";
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

    onZoomStart:function(scale, focusPos) {
        if (Z.Browser.ielt9) {return;}
        //根据放大比例和中心点, 设置css3 transform放大或缩小底图
        var domOffset = this.map.offsetPlatform();
        var offsetTop = domOffset['top'];
        var offsetLeft = domOffset['left'];
        var mapContainer = this._panels.mapContainer;
        var size = this.map.getSize();
        this._panels.mapContainer.className ='maptalks-map-zoom_animated';
        var origin = Z.DomUtil.getDomTransformOrigin(mapContainer);
        var originX = Math.round(size['width']/2-offsetLeft),
            originY = Math.round(size['height']/2-offsetTop);
        if ((origin===null || ''===origin) && focusPos) {
            var mouseOffset = new Z.Point(
                    focusPos.left-size['width']/2,
                    focusPos.top-size['height']/2
                );
            originX += mouseOffset['left'];
            originY += mouseOffset['top'];
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+'px '+ originY+'px');
        } else if (!focusPos) {
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+'px '+ originY+'px');
        }

        Z.DomUtil.setDomTransform(mapContainer," scale("+scale+","+scale+")");
    },


    onZoomEnd:function() {
        this.insertBackground();
        this._zoomAnimationEnd();
        this.resetContainer();
    },

    _zoomAnimationEnd:function() {
        if (Z.Browser.ielt9) {return;}
        //恢复底图的css3 transform
        var mapContainer = this._panels.mapContainer;
        mapContainer.className="MAP_CONTAINER";
        Z.DomUtil.setDomTransformOrigin(mapContainer,"");
        Z.DomUtil.setDomTransform(mapContainer,"");
        mapContainer.style.top=0+"px";
        mapContainer.style.left=0+"px";
    },

    panAnimation:function(moveOffset) {
        if (!moveOffset) {moveOffset = new Z.Point(0,0);}
        if (!moveOffset['left']) {
            moveOffset['left'] = 0;
        }
        if (!moveOffset['top']) {
            moveOffset['top'] = 0;
        }
        var xfactor = moveOffset["left"] >= 0 ? 1 : -1;
        var yfactor = moveOffset["top"] >= 0 ? 1 : -1;
        // 求每次移动距离的等差数列
        var xSum = Math.abs(moveOffset["left"]);
        var ySum = Math.abs(moveOffset["top"]);
        var lastx = Math.ceil(xSum / 10 - 1);
        var lasty = Math.ceil(ySum / 10 - 1);
        var xd = (lastx - 1) / 19;
        if (xd <= 0) {
            xd = 1;
        }
        var yd = (lasty - 1) / 19;
        if (yd <= 0) {
            yd = 1;
        }

        // 移动距离在这个数组里记录下来
        var spanArr = [];
        var currX = 1, currY = 1;
        var spanCounter = 0;
        var spanX=0,spanY=0;
        while (true) {
            // 等差计算移动距离
            currX = lastx - spanCounter * xd;
            currY = lasty - spanCounter * yd;
            if (currX < 0 || spanX>xSum) {
                currX = 0;
            }
            if (currY < 0 || spanY>ySum) {
                currY = 0;
            }
            if (currX <= 0 && currY <= 0) {
                break;
            }
            spanArr.push( {
                x : Math.round(currX) * xfactor,
                y : Math.round(currY) * yfactor
            });
            spanCounter++;
            spanX+=currX;
            spanY+=currY;
        }
        var counterLimit = spanArr.length;
    //  console.log(spanArr);
        var _map = this.map;
        // var pxTop = 0;
        // var pxLeft = 0;
        var counter = 0;
        //var isAnimeSupported = !seegoo.maps.config.browser.mobile && !(seegoo.maps.config.browser.ie && document.documentMode < 9);
        if (_map._dynLayerSlideTimeout) {
            clearTimeout(_map._dynLayerSlideTimeout);
        }
        _map._isBusy = true;
        slideMap();

        function slideMap() {
            if (!Z.Util.isArrayHasData(spanArr)) {
                return;
            }
            if (!_map._allowSlideMap) {
                // XXX: why set '_allowSlideMap' to 'true'?
                _map._allowSlideMap = true;
                _map._onMoveEnd({'target':_map});
                return;
            }
            var ySpan = spanArr[counter].y;
            var xSpan = spanArr[counter].x;
            _map.offsetPlatform(new Z.Point(xSpan, ySpan)); //{'left':xSpan,'top':ySpan}
            _map._offsetCenterByPixel(new Z.Point(-xSpan, -ySpan)); //{'left':-xSpan,'top':-ySpan}
            counter++;
            // 每移动3次draw一次
            if (counter <= counterLimit - 1) {
                if (counter % 3 === 0) {
                    if (!Z.Browser.ie6) {
                       // _map.fire('moving',{'target':_map});
                       _map._onMoving({'target':_map});
                    }
                }
                setTimeout(slideMap, 8 + counter);
            } else {
                // 用setTimeout方式调用解决了地图滑动结束时，如果添加有动态图层，或者canvasLayer上有大量数据时，地图会发生顿卡现象的问题
                _map._dynLayerSlideTimeout = setTimeout(function() {
                    //_map._drawTileLayers();
                     _map._onMoveEnd({'target':_map});
                    _map._isBusy = false;
                },50);

            }

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
