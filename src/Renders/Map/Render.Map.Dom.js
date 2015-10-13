Z.render.map.Dom = function() {

};

Z.render.map.Dom.prototype = {
    offsetPlatform:function(offset) {

    },

    showOverlayLayers:function() {

    },

    hideOverlayLayers:function() {

    },

    updateMapSize:function() {

    },

    zoomAnimationStart:function(scale,pixelOffset) {

    },

    zoomAnimationEnd:function() {

    },

    insertZoomingBackground:function() {

    },

    /**
     * initialize container DOM of panels
     */
    initContainer:function() {
        var _containerDOM;
        if (Z.Util.isString(this._container)) {
            _containerDOM = document.getElementById(this._container);
            if (!_containerDOM) {
                throw new Error('invalid _container id: \''+this._container+'\'');
            }
        } else {
            if (!this._container || !this._container.appendChild) {
                throw new Error('invalid _container element');
            }
            _containerDOM = this._container;
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
        var mapWrapper = Z.DomUtil.createEl('div');
        mapWrapper.style.cssText = 'position:absolute;overflow:hidden;';
        mapWrapper.className='MAP_WRAPPER';
        _containerDOM.appendChild(mapWrapper);

        // 最外层的div
        var _mapPlatform = Z.DomUtil.createEl('div');
        // _mapPlatform.id='_mapPlatform';
        _mapPlatform.className = 'MAP_PLATFORM';
        _mapPlatform.style.cssText = 'position:absolute;top:0px;left:0px;';
        mapWrapper.appendChild(_mapPlatform);
        mapWrapper.appendChild(controlWrapper);

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
        _canvasLayerContainer.style.zIndex=100;
        _svgContainer.style.zIndex = 200;
        _popMenuContainer.style.zIndex = 3000;
        _contextCtrlContainer.style.zIndex = 3000;
        _tipContainer.style.zIndex = 3001;

        _mapViewPort.appendChild(_mapContainer);

        _contextCtrlContainer.appendChild(_tipContainer);
        _contextCtrlContainer.appendChild(_popMenuContainer);
        _mapPlatform.appendChild(_contextCtrlContainer);
        _mapViewPort.appendChild(_canvasLayerContainer);
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

            mapWrapper.setAttribute('unselectable', 'on');
            _mapPlatform.setAttribute('unselectable', 'on');
        }


        //store panels
        var panels = this._panels;
        panels.controlWrapper = controlWrapper;
        panels.mapWrapper = mapWrapper;
        panels.mapViewPort = _mapViewPort;
        panels.mapPlatform = _mapPlatform;
        panels.mapContainer = _mapContainer;
        panels.tipContainer = _tipContainer;
        panels.popMenuContainer = _popMenuContainer;
        panels.svgContainer = _svgContainer;
        panels.canvasLayerContainer = _canvasLayerContainer;
//
//
        //初始化mapPlatform的偏移量, 适用css3 translate时设置初始值
        this.offsetPlatform(new Z.Point(0,0));
        var mapSize = this._getContainerDomSize();
        this._updateMapSize(mapSize);
    },
};
