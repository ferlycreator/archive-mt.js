/**
 * 地图类
 * @class maptalks.Map
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z['Map']=Z.Map=Z.Class.extend({

    includes: [Z.Eventable],

    options:{
        'enableMapSliding':true,
        'enableZoom':true,
        'enableInfoWindow':true,
        'zoomMode':'pointer',
        'supportCoordinateTypes':['gcj02','bd09ll','wgs94','pixel'],
        'coordinateType':'gcj02'
    },

    events:{
        LOAD_MAP:'loadmap',
        TILECONFIG_CHANGED:'tileconfigchanged',
        RESIZE:'resize'
    },

    //根据不同的语言定义不同的错误信息
    exceptionDefs:{
        'en-US':{
            'NO_BASE_TILE_LAYER':'Map has no baseTileLayer, pls specify a baseTileLayer by setBaseTileLayer method before loading.',
            'INVALID_TILECONFIG':'TileConfig of Map is invalid.',
            'INVALID_OPTION':'Invalid options provided.',
            'INVALID_CENTER':'Invalid Center',
            'INVALID_LAYER_ID':'Invalid id for the layer',
            'DUPLICATE_LAYER_ID':'the id of the layer is duplicate with another layer'
        },
        'zh-CN':{
            'NO_BASE_TILE_LAYER':'地图没有设置基础图层,请在调用Map.Load之前调用setBaseTileLayer设定基础图层',
            'INVALID_TILECONFIG':'LOD配置无效.',
            'INVALID_OPTION':'无效的option.',
            'INVALID_CENTER':'无效的中心点',
            'INVALID_LAYER_ID':'图层的id无效',
            'DUPLICATE_LAYER_ID':'重复的图层id'
        }
    },

    /**
     * @constructor
     * @param  {String} containerId
     * @param  {Object} options
     */
    initialize:function(_container, options) {

        if (!options) {
            throw new Error(this.exceptions['INVALID_OPTION']);
        }

        if (!options['center']) {
            throw new Error(this.exceptions['INVALID_CENTER']);
        }

        this._loaded=false;
        this._container = _container;

        if (Z.Util.isString(this._container)) {
            this._containerDOM = document.getElementById(this._container);
        } else {
            this._containerDOM = _container;
        }


        //Layer of Details, always derived from baseTileLayer
        this._tileConfig=null;
        this._panels={};
        //Layers
        this._baseTileLayer=null;
        this._tileLayers=[];
        this._svgLayers=[];

        this._canvasLayers=[];
        this._dynLayers=[];
        //handler
        this._handlers = [];

        this._zoomLevel = options['zoomLevel'];
        delete options['zoomLevel'];
        this._maxZoomLevel = options['maxZoomLevel'];
        delete options['maxZoomLevel'];
        this._minZoomLevel = options['minZoomLevel'];
        delete options['minZoomLevel'];
        this._center = new Z.Coordinate(options['center']);
        delete options['center'];

        this._allowSlideMap = true;

        //坐标类型
        if (!Z.Util.isNil(options['coordinateType']) && Z.Util.searchInArray(options['coordinateType'], this.options['supportCoordinateTypes'])<0) {
            //默认采用GCJ02
            options['coordinateType'] = this.options['coordinateType'];
        }
        options = Z.Util.setOptions(this,options);
        this._initContainer();
    },

    /**
     * 判断地图是否加载完毕
     * @return {Boolean} true：加载完毕
     */
    isLoaded:function() {
        return this._loaded;
    },

    /**
     * 设定地图鼠标跟随提示框内容，设定的提示框会一直跟随鼠标显示
     * @param {Dom} tipElement 鼠标提示框内容
     */
    setMouseTip:function(tipElement) {

    },

    /**
     * 移除鼠标提示框
     * @return {[type]} [description]
     */
    removeMouseTip:function() {

    },

    /**
     * 获取地图容器的宽度和高度
     * @return {{'width':?, 'height':?}}} 地图容器大小,单位像素
     * @expose
     */
    getSize:function() {
        if (Z.Util.isNil(this.width) || Z.Util.isNil(this.height)) {
            return this._getContainerDomSize();
        }
        return {
            'width' : this.width,
            'height' : this.height
        };
    },

    /**
     * 获取地图的Extent
     * @return {Extent} 地图的Extent
     * @expose
     */
    getExtent:function() {
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return null;
        }
        var projection = this._getProjection();
        if (!projection) {
            return null;
        }
        var res = this._tileConfig['resolutions'][this._zoomLevel];
        if (Z.Util.isNil(res)) {
            return null;
        }
        var size = this.getSize();
        var w = size['width']/2,
            h = size['height']/2;
        var prjCenter = this._getPrjCenter();
        var point1 = projection.unproject({x:prjCenter.x - w*res, y:prjCenter.y + h*res});
        var point2 = projection.unproject({x:prjCenter.x + w*res, y:prjCenter.y - h*res});
        return new Z.Extent(point1,point2);
    },

    /**
     * 获取地图的中心点
     * @return {Coordinate} 坐标
     * @expose
     */
    getCenter:function() {
        if (!this._tileConfig || !this._loaded) {return this._center;}
        var projection = this._tileConfig.getProjectionInstance();
        return projection.unproject(this._prjCenter);
    },

    /**
     * 设置地图中心点
     * @param {Coordinate} center [新的中心点坐标]
     * @expose
     */
    setCenter:function(center) {
        if (!this._tileConfig || !this._loaded) {
            this._center = center;
            return this;
        }
        var projection = this._getProjection();
        var _pcenter = projection.project(center);
        var offset = this._getPixelDistance(_pcenter);
        // FIXME: call panBy() ?
        if (offset.left || offset.top) {
            this._fireEvent('movestart');
            this._setPrjCenter(_pcenter);
            this.offsetPlatform(offset);
        }
        // XXX: fire 'moveend' or not?
        this._onMoveEnd();
        return this;
    },

    _onMoving:function(param) {
        var map = this;
        function movingLayer(layer) {
            if (layer) {
                layer._onMoving(param);
            }
        }

        //reduce refresh frequency
        if (2*Math.random() > 1) {map._refreshSVGPaper();}
        if (map._baseTileLayer) {map._baseTileLayer._onMoving();}
        map._eachLayer(movingLayer, map._svgLayers);
        map._fireEvent('moving');
    },

    _onMoveEnd:function(param) {
        function endMoveLayer(layer) {
            if (layer) {
                layer._onMoveEnd(param);
            }
        }
        var me=this;
        if (me._baseTileLayer) {me._baseTileLayer._onMoveEnd();}
        me._refreshSVGPaper();
        me._eachLayer(endMoveLayer,me._tileLayers,me._canvasLayers,me._dynLayers);
        me._fireEvent('moveend');
    },

    /**
     * 获取指定的投影坐标与当前的地图中心点的像素距离
     * @param  {Coordinate} _pcenter 像素坐标
     * @return {Point}          像素距离
     */
    _getPixelDistance:function(_pcenter) {
        var _current = this._getPrjCenter();
        var curr_px = this._transform(_current);
        var _pcenter_px = this._transform(_pcenter);
        var span = new Z.Point((_pcenter_px['left']-curr_px['left']),(curr_px['top']-_pcenter_px['top']));
        return span;
    },

    /**
     * 获取地图的缩放级别
     * @return {Number} 地图缩放级别
     * @expose
     */
    getZoomLevel:function() {
        return this._zoomLevel;
    },

    /**
     * 设置地图的缩放级别
     * @param {Number} z 新的缩放级别
     * @expose
     */
    setZoomLevel:function(z) {
        this._zoom(z);
        return this;
    },

    /**
     * 获得地图最大放大级别
     * @return {Number} 最大放大级别
     * @expose
     */
    getMaxZoomLevel:function() {
        return this._maxZoomLevel;
    },

    /**
     * 设置最大放大级别
     * @param {Number} zoomLevel 最大放大级别
     * @expose
     */
    setMaxZoomLevel:function(zoomLevel) {
        var tileConfig = this._getTileConfig();
        if (zoomLevel > tileConfig['maxZoomLevel']) {
            zoomLevel = tileConfig['maxZoomLevel'];
        }
        if (zoomLevel < this._zoomLevel) {
            this.setZoomLevel(zoomLevel);
        }
        this._maxZoomLevel = zoomLevel;
        return this;
    },

    /**
     * 获得地图最小放大级别
     * @return {Number} 最小放大级别
     * @expose
     */
    getMinZoomLevel:function() {
        return this._minZoomLevel;
    },

    /**
     * 设置最小放大级别
     * @param {Number} zoomLevel 最小放大级别
     * @expose
     */
    setMinZoomLevel:function(zoomLevel) {
        var tileConfig = this._getTileConfig();
        if (zoomLevel < tileConfig['minZoomLevel']) {
            zoomLevel = tileConfig['minZoomLevel'];
        }
        this._minZoomLevel=zoomLevel;
        return this;
    },

    /**
     * 放大地图
     * @expose
     */
    zoomIn: function() {
        this._zoom(this.getZoomLevel() + 1);
        return this;
    },

    /**
     * 地图缩小
     * @expose
     */
    zoomOut: function() {
        this._zoom(this.getZoomLevel() - 1);
        return this;
    },

    /**
     * 设置中心点并放大缩小
     * @param {Coordinate} center    [新的中心点]
     * @param {Number} zoomLevel [新的缩放级别]
     * @expose
     */
    setCenterAndZoom:function(center,zoomLevel) {
        if (!this._tileConfig || !this._loaded) {
            this._center = center;
            this._zoomLevel = zoomLevel;
            return this;
        }
        if (this._zoomLevel != zoomLevel) {
            this.setCenter(center);
            this._zoom(zoomLevel);
        } else {
            this.setCenter(center);
        }
        return this;
    },

    /**
     * 根据地图的extent取得最合适的zoomlevel
     *
     * @category 工具方法
     * @param extent {Extent} Extent对象
     * @returns
     * @expose
     */
    getFitZoomLevel: function(extent) {
        if (!extent && !(extent instanceof Z.Extent)) {
            return this._zoomLevel;
        }
        //点类型
        if (extent['xmin'] == extent['xmax'] && extent['ymin'] == extent['ymax']) {
            return this._maxZoomLevel;
        }
        try {
            var projection = this._getProjection();
            var x = Math.abs(extent["xmin"] - extent["xmax"]);
            var y = Math.abs(extent["ymin"] - extent["ymax"]);
            var projectedExtent = projection.project({x:x, y:y});
            var resolutions = this._getTileConfig()['resolutions'];
            var xz = -1;
            var yz = -1;
            for ( var i = this._minZoomLevel, len = this._maxZoomLevel; i < len; i++) {
                if (projectedExtent.x / resolutions[i] >= this.width) {
                    if (xz == -1) {
                        xz = i;
                    }
                }
                if (projectedExtent.y / resolutions[i] >= this.height) {
                    if (yz == -1) {
                        yz = i;
                    }
                }
                if (xz > -1 && yz > -1) {
                    break;
                }
            }
            var ret = xz < yz ? xz : yz;
            if (ret === -1) {
                ret = xz < yz ? yz : xz;
            }
            if (ret === -1) {
                return this._maxZoomLevel;
            }
            // return ret - 2;
            return ret;
        } catch (exception) {
            return this.getZoomLevel();
        }
    },

    /**
     * 返回基础地图图层
     * @return {TileLayer} [基础地图图层]
     * @expose
     */
    getBaseTileLayer:function() {
        return this._baseTileLayer;
    },

    /**
     * 设定地图的基础瓦片图层
     * @param  {TileLayer} baseTileLayer 瓦片图层
     * @expose
     */
    setBaseTileLayer:function(baseTileLayer) {
        if (this._baseTileLayer) {
            this._removeBackGroundDOM();
            this._baseTileLayer._onRemove();
        }
        baseTileLayer._prepare(this,-1);
        this._baseTileLayer = baseTileLayer;
        var me = this;
        //删除背景
        this._baseTileLayer.on(baseTileLayer.events.LAYER_LOADED,function() {
            me._removeBackGroundDOM();
        });
        this._baseTileLayer._loadTileConfig(function() {
            var tileConfig = me._baseTileLayer._getTileConfig();
            var changed = me._setTileConfig(tileConfig);
            if (me._loaded) {
                me._baseTileLayer.load();
                if (changed) {
                    me._fireEvent(me.events.TILECONFIG_CHANGED);
                }
            } else {
                me._Load();
            }

        });
        return this;
    },

    /**
     * 获取图层
     * @param  {String} id 图层id
     * @return {Layer}  图层
     * @expose
     */
    getLayer:function(id) {
        if (!id || !this._layerCache || !this._layerCache[id]) {
            return null;
        }
        return this._layerCache[id];
    },

    /**
     * 向地图里添加图层
     * @param  {Layer} layer 图层对象
     * @expose
     */
    addLayer:function(layers){
        if (!layers) {
            return this;
        }
        if (!Z.Util.isArray(layers)) {
            return this.addLayer([layers]);
        }
        if (!this._layerCache) {
            this._layerCache = {};
        }
        for (var i=0,len=layers.length;i<len;i++) {
            var layer = layers[i];
            var id = layer.getId();
            if (Z.Util.isNil(id)) {
                throw new Error(this.exceptions['INVALID_LAYER_ID']+':'+id);
            }
            if (this._layerCache[id]) {
                throw new Error(this.exceptions['DUPLICATE_LAYER_ID']+':'+id);
            }
            this._layerCache[id] = layer;
            //DynamicLayer必须要放在前面, 因为dynamiclayer同时也是tilelayer, tilelayer的代码也同时会执行
            if (layer instanceof Z.DynamicLayer) {
                layer._prepare(this, this._dynLayers.length);
                this._dynLayers.push(layer);
                if (this._loaded) {
                    layer.load();
                }
            } else if (layer instanceof Z.TileLayer) {
                layer._prepare(this, this._tileLayers.length);
                this._tileLayers.push(layer);
                if (this._loaded) {
                    layer.load();
                }
            } else if (layer instanceof Z.VectorLayer) {
                if (layer.isCanvasRender()) {
                    // canvas render
                    layer._prepare(this, this._canvasLayers.length);
                    this._canvasLayers.push(layer);

                } else {
                    // svg render
                    layer._prepare(this,this._svgLayers.length);
                    this._svgLayers.push(layer);

                }
                if (this._loaded) {
                        layer.load();
                    }
            } else {
                continue;
            }

        }
        return this;
    },



    /**
     * 移除图层
     * @param  {Layer | id} layer 图层或图层id
     * @expose
     */
    removeLayer: function(layer) {
        if (!(layer instanceof Z.Layer)) {
            layer = this.getLayer(layer);
        }
        if (!layer) {
            return this;
        }
        var map = layer.getMap();
        if (!map || map != this) {
            return this;
        }
        if (layer instanceof Z.VectorLayer) {
            if (layer.isCanvasRender()) {
                this._removeLayer(layer, this._canvasLayers);
            } else {
                this._removeLayer(layer, this._svgLayers);
            }
        } else if (layer instanceof Z.DynamicLayer) {
            this._removeLayer(layer, this._dynLayers);
        } else if (layer instanceof Z.TileLayer) {
            this._removeLayer(layer, this._tileLayers);
        }
        var id = layer.getId();
        delete this._layerCache[id];
        return this;
    },

    /**
     * 从layerList中删除某个图层
     */
    _removeLayer:function(layer,layerList) {
        if (!layer || !layerList) {return;}
        var index = Z.Util.searchInArray(layer,layerList);
        if (index > -1) {
            layerList.splice(index, 1);
            if (this._loaded) {
                layer._onRemove();
            }
            for (var j=0, jlen=layerList.length;j<jlen;j++) {
                if (layerList[j]._setZIndex) {
                    layerList[j]._setZIndex(layerList[j].baseZIndex+j);
                }
            }
        }
    },


    /**
     * [addHandler description]
     * @param {[type]} name         [description]
     * @param {[type]} HandlerClass [description]
     * @expose
     */
    addHandler: function (name, HandlerClass) {
        if (!HandlerClass) { return this; }

        var handler = this[name] = new HandlerClass(this);

        this._handlers.push(handler);

        if (this.options[name]) {
            handler.enable();
        }
        return this;
    },

    _clearHandlers: function () {
        for (var i = 0, len = this._handlers.length; i < len; i++) {
            this._handlers[i].disable();
        }
    },

    /**
     * 获取地图的坐标类型
     * @return {String} 坐标类型
     * @expose
     */
    getCoordinateType:function() {
        return this.options['coordinateType'];
    },

    /**
     * 设置地图的坐标类型
     * @param {String} coordinateType 坐标类型
     */
    setCoordinateType:function(coordinateType) {
        //判断coordinateType是否有效
        if (!coordinateType || Z.Util.searchInArray(coordinateType, this.options['supportCoordinateTypes'] < 0)) {
            return;
        }
        this.options['coordinateType'] = coordinateType;
        this._fireEvent('coordinatetypechanged');
    },


//------------------------------坐标转化函数-----------------------------
    /**
     * 将地理坐标转化为容器偏转坐标
     * @param {Coordinate} 地理坐标
     * @return {Point} 容器偏转坐标
     * @expose
     */
    coordinateToDomOffset: function(coordinate) {
        var projection = this._getProjection();
        if (!coordinate || !projection) {return null;}
        var pCoordinate = projection.project(coordinate);
        return this._transformToOffset(pCoordinate);
    },

    /**
     * 将地理坐标转化为屏幕坐标
     * @param {Coordinate} 地理坐标
     * @return {Point} 屏幕坐标
     * @expose
     */
    coordinateToScreenPoint: function(coordinate) {
        var projection = this._getProjection();
        if (!coordinate || !projection) {return null;}
        var pCoordinate = projection.project(coordinate);
        var offset = this._transform(pCoordinate);
        return offset;
    },

    /**
     * 将屏幕像素坐标转化为地理坐标
     * @param {screenPoint} 屏幕坐标
     * @return {coordinate} 地理坐标
     * @expose
     */
    screenPointToCoordinate: function(screenPoint) {
        //var domOffset = this._screenToDomOffset(screenPoint);
        var projection = this._getProjection();
        if (!screenPoint || !projection) {return null;}
        var pCoordinate = this._untransform(screenPoint);
        var coordinate = projection.unproject(pCoordinate);
        return coordinate;
    },
//-----------------------------------------------------------------------

    _onResize:function(resizeOffset) {
        this._offsetCenterByPixel(resizeOffset);
        this._refreshSVGPaper();
        function resizeLayer(layer) {
            if (layer) {
                layer._onResize();
            }
        }
        if (this._baseTileLayer) {this._baseTileLayer._onResize();}
        this._eachLayer(resizeLayer,this._getAllLayers());
    },

    _fireEvent:function(eventName, param) {
        if (!param) {
            param = {};
        }
        param['target']=this;
        this.fire(eventName,param);
    },

    _Load:function() {
        this._originZoomLevel = this._zoomLevel;

        this._initContainerWatcher();
        this._registerDomEvents();
        this._loadAllLayers();
        // this.callInitHooks();
        this._loaded = true;
        this._callOnLoadHooks();
        //this.fire('mapready',{'target':this});
    },

    _loadAllLayers:function() {
        function loadLayer(layer) {
            if (layer) {
                layer.load();
            }
        }
        if (this._baseTileLayer) {this._baseTileLayer.load();}
        this._eachLayer(loadLayer,this._getAllLayers());
    },

    _getAllLayers:function() {
        var result = [];
        return result.concat(this._tileLayers)
        .concat(this._canvasLayers)
        .concat(this._svgLayers)
        .concat(this._dynLayers);
    },

    _eachLayer:function(fn) {
        if (arguments.length < 2) {return;}
        var layerLists = Array.prototype.slice.call(arguments, 1);
        var layers = [];
        for (var i=0, len=layerLists.length;i<len;i++) {
            layers = layers.concat(layerLists[i]);
        }
        for (var j=0, jlen = layers.length;j<jlen;j++) {
            fn.call(fn,layers[j]);
        }
    },

    /**
     * 显示所有的Overlayer图层
     * @return {[type]} [description]
     */
    _showOverlayLayers:function() {
        this._panels.svgContainer.style.display="";
        this._panels.canvasLayerContainer.style.display="";
    },

    /**
     * 隐藏所有的Overlayer图层
     * @return {[type]} [description]
     */
    _hideOverlayLayers:function() {
        this._panels.svgContainer.style.display="none";
        this._panels.canvasLayerContainer.style.display="none";
        // me._panels.tipContainer.style.display="none";
    },

    _getTileConfig:function() {
        return this._tileConfig;
    },

    _getProjection:function() {
        var tileConfig = this._getTileConfig();
        if (tileConfig) {
            return tileConfig.getProjectionInstance();
        }
        return null;
    },

    /**
     * 设置地图的tileConfig
     * @param {TileConfig} tileConfig  新的tileConfig
     */
    _setTileConfig:function(tileConfig) {
        if (!tileConfig || !tileConfig.load) {
            throw new Error(this.exceptions['INVALID_TILECONFIG']);
        }
        //tileConfig相同,无需改变
        if (this._tileConfig && this._tileConfig.equals(tileConfig, this.getZoomLevel())) {
            // callbackFn(false);
            return false;
        }
        this._tileConfig = tileConfig;
        this._checkMapStatus();
        return true;
        // callbackFn(true);
        // tileConfig.load(function() {
        //     _this._checkMapStatus();
        //     callbackFn(true);
        // });
    },

    /**
     * TileConfig修改后检查当前地图状态是否吻合新的TileConfig规则
     * @return {[type]} [description]
     */
    _checkMapStatus:function(){
        if (!this._maxZoomLevel || this._maxZoomLevel > this._tileConfig['maxZoomLevel']) {
            this._maxZoomLevel = this._tileConfig['maxZoomLevel'];
        }
        if (!this._minZoomLevel || this._minZoomLevel < this._tileConfig['minZoomLevel']) {
            this._minZoomLevel = this._tileConfig['minZoomLevel'];
        }
        if (this._maxZoomLevel < this._minZoomLevel) {
            this._maxZoomLevel = this._minZoomLevel;
        }
        if (!this._zoomLevel || this._zoomLevel > this._maxZoomLevel) {
            this._zoomLevel = this._maxZoomLevel;
        }
        if (this._zoomLevel < this._minZoomLevel) {
            this._zoomLevel = this._minZoomLevel;
        }
        this._center = this.getCenter();
        var projection = this._tileConfig.getProjectionInstance();
        this._prjCenter = projection.project(this._center);
    },



    _getContainerDomSize:function(){
        if (!this._containerDOM) {return null;}
        var _containerDOM = this._containerDOM;
        var mapWidth = parseInt(_containerDOM.offsetWidth,0);
        var mapHeight = parseInt(_containerDOM.offsetHeight,0);
        return {
            width: mapWidth,
            height:mapHeight
        };
    },

    _setMapSize:function(mSize) {
        if (!mSize) {return;}
        this.width = mSize['width'];
        this.height = mSize['height'];
        var panels = this._panels;
        panels.mapWrapper.style.width = this.width + 'px';
        panels.mapWrapper.style.height = this.height + 'px';
        panels.mapViewPort.style.width = this.width + 'px';
        panels.mapViewPort.style.height = this.height + 'px';
        panels.controlWrapper.style.width = this.width + 'px';
        panels.controlWrapper.style.height = this.height + 'px';
    },

    /**
     * 获得地图的投影坐标
     * @return {Coordinate} 投影坐标
     */
    _getPrjCenter:function() {
        return this._prjCenter;
    },

    _setPrjCenter:function(pcenter) {
        this._prjCenter=pcenter;
    },

    /**
     * 移除背景Dom对象
     */
    _removeBackGroundDOM:function() {
        if (this._backgroundDOM) {
            this._backgroundDOM.innerHTML='';
            Z.DomUtil.removeDomNode(this._backgroundDOM);
            delete this._backgroundDOM;
        }
    },

    /**
     * 以像素距离移动地图中心点
     * @param  {Object} pixel 像素距离,偏移量的正负值关系如下:
     * -1,1|1,1
     *-1,-1|1,-1
     */
    _offsetCenterByPixel:function(pixel) {
        var posX = this.width/2+pixel['left'],
            posY = this.height/2+pixel['top'];
        var pCenter = this._untransform(new Z.Point(posX, posY));
        this._setPrjCenter(pCenter);
    },

    /**
     * 获取地图容器偏移量或增加容器的偏移量
     * @param  {Pixel} offset 增加的偏移量,如果为null,则直接返回容器的偏移量
     * @return {[type]}        [description]
     * @expose
     */
    offsetPlatform:function(offset) {
        if (!offset) {
            return Z.DomUtil.offsetDom(this._panels.mapPlatform);
        } else {
            var domOffset = Z.DomUtil.offsetDom(this._panels.mapPlatform);
            Z.DomUtil.offsetDom(this._panels.mapPlatform, new Z.Point(
                    domOffset['left']+offset['left'],
                    domOffset['top']+offset['top']
            ));
            return this;
        }
    },

    /**
     * transform dom position to geodesic projected coordinate
     * @param  {Object} domPos    dom screen xy, eg {left:10, top:10}
     * @param  {Number} zoomLevel current zoomLevel
     * @return {Coordinate}           Coordinate
     */
    _untransform:function(domPos) {
        var transformation =  this._getTileConfig().getTransformationInstance();
        var res = this._tileConfig.getResolution(this.getZoomLevel());//['resolutions'][this._zoomLevel];

        var pcenter = this._getPrjCenter();
        var centerPoint = transformation.transform(pcenter, res);
        //容器的像素坐标方向是固定方向的, 和html标准一致, 即从左到右增大, 从上到下增大
        var point = [centerPoint[0]+ domPos['left'] - this.width / 2, centerPoint[1]+domPos['top'] - this.height / 2];
        var result = transformation.untransform(point, res);
        return new Z.Coordinate(result);
       /* var res = this._tileConfig.getResolution(this.getZoomLevel());//['resolutions'][this._zoomLevel];
        var pcenter = this._getPrjCenter();
        var y = pcenter.y + this.dy*(this.height / 2 - domPos['top'])* res;
        var x = pcenter.x + this.dx*(domPos['left'] - this.width / 2)* res;
        return new Z.Coordinate(x, y);*/
    },

    /**
     * 相对坐标转化为地理投影坐标
     * @param  {[type]} domPos [description]
     * @return {[type]}        [description]
     */
    _untransformFromOffset:function(domPos) {
        return this._untransform(this._domOffsetToScreen(domPos));
    },

    /**
     * transform geodesic projected coordinate to screen xy
     * @param  {[type]} pCoordinate [description]
     * @return {[type]}             [description]
     */
    _transform:function(pCoordinate) {
        var transformation =  this._getTileConfig().getTransformationInstance();
        var res = this._tileConfig.getResolution(this.getZoomLevel());//['resolutions'][this._zoomLevel];

        var pcenter = this._getPrjCenter();
        var centerPoint = transformation.transform(pcenter, res);

        var point = transformation.transform(pCoordinate,res);
        return new Z.Point(
            Math.round(this.width / 2 + point[0] - centerPoint[0]),
            Math.round(this.height / 2 + point[1] - centerPoint[1])
            );

       /* var res = this._tileConfig['resolutions'][this._zoomLevel];
        var pcenter = this._getPrjCenter();
        // var _canvasDom = this.canvasDom;
        var centerTop = this.dy*(pcenter.y - pCoordinate.y) / res;
        var centerLeft = this.dx*(pCoordinate.x - pcenter.x) /res;

        var result = {
            "top" : Math.round(this.height / 2 + centerTop),
            "left" : Math.round(this.width / 2 + centerLeft)
        };
        return result;*/
    },

    /**
     * 投影坐标转化为容器的相对坐标
     * @param  {Coordinate} pCoordinate 投影坐标
     * @return {Object}             容器相对坐标
     */
    _transformToOffset:function(pCoordinate) {
        var screenXY = this._transform(pCoordinate);
        return this._screenToDomOffset(screenXY);
    },

    /**
     * 屏幕坐标到地图容器偏移坐标
     *
     * @param screenXY
     * @returns {domOffset}
     */
    _screenToDomOffset: function(screenXY) {
        if (!screenXY) {return null;}
        var platformOffset = this.offsetPlatform();
        return new Z.Point(
            screenXY['left'] - platformOffset['left'],
            screenXY['top'] - platformOffset['top']
        );
    },

    /**
     * 地图容器偏移坐标到屏幕坐标的转换
     *
     * @param domOffset
     * @returns {screenXY}
     */
    _domOffsetToScreen: function(domOffset) {
        if (!domOffset) {return null;}
        var platformOffset = this.offsetPlatform();
        return new Z.Point(
            domOffset["left"] + platformOffset["left"],
            domOffset["top"] + platformOffset["top"]
        );
    },

    /**
     * 根据中心点投影坐标和像素范围,计算像素范围的Extent
     * @param  {Coordinate} plonlat [中心点坐标]
     * @param  {Object} pnw     [左上角像素距离]
     * @param  {Object} pse     [右下角像素距离]
     * @return {Extent}         [Extent计算结果]
     */
    _computeExtentByPixelSize: function(plonlat, pnw, pse) {
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return null;
        }
        var projection = tileConfig.getProjectionInstance();
        var res = tileConfig['resolutions'][this.getZoomLevel()];
        var nw = projection.unproject({x: plonlat.x - pnw["left"]*res, y: plonlat.y + pnw["top"]*res});
        var se = projection.unproject({x: plonlat.x + pse["left"]*res, y: plonlat.y - pse["top"]*res});
        return new Z.Extent(nw,se);
    },

    /**
     * 在当前比例尺下将距离转换为像素
     * @param  {double} x [description]
     * @param  {double} y [description]
     * @return {[type]}   [description]
     * @expose
     */
    distanceToPixel: function(x,y) {
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return null;
        }
        var projection = tileConfig.getProjectionInstance();
        if (!projection) {
            return null;
        }
        //计算前刷新scales
        var center = this.getCenter(),
            target = projection.locate(center,x,y),
            z = this.getZoomLevel(),
            resolutions = tileConfig['resolutions'];
        var width = !x?0:(projection.project({x:target.x,y:center.y}).x-projection.project(center).x)/resolutions[z];
        var height = !y?0:(projection.project({x:target.x,y:center.y}).y-projection.project(target).y)/resolutions[z];
        return new Z.Size(Math.round(Math.abs(width)), Math.round(Math.abs(height)));
    },

    /**
     * 像素转化为距离
     * @param  {[type]} width [description]
     * @param  {[type]} height [description]
     * @return {[type]}    [description]
     * @expose
     */
    pixelToDistance:function(width, height) {
        var tileConfig = this._getTileConfig();
        if (!tileConfig) {
            return null;
        }
        var projection = tileConfig.getProjectionInstance();
        if (!projection) {
            return null;
        }
        //计算前刷新scales
        var center = this.getCenter(),
            pcenter = this._getPrjCenter(),
            res = tileConfig['resolutions'][this.getZoomLevel()];
        var pTarget = new Z.Coordinate(pcenter.x+width*res, pcenter.y+height*res);
        var target = projection.unproject(pTarget);
        return projection.getGeodesicLength(target,center);
    },

    /**
     * [createVectorPaper description]
     * @return {[type]} [description]
     */
    _getSvgPaper: function(){
        var map = this;
        if (!map._vectorPaper) {
            var svgContainer = this._panels.svgContainer;
            map._vectorPaper = Z.SVG.createContainer();
            this._refreshSVGPaper();
            svgContainer.appendChild(map._vectorPaper);
        }
        return map._vectorPaper;
    },

    _refreshSVGPaper: function() {
        var paper = this._getSvgPaper();
        Z.SVG.refreshContainer(this,paper);
    },

    /**
     * initialize _container DOM of panels
     */
    _initContainer:function() {
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
        this._setMapSize(mapSize);
    },

    /**
    * 获取地图容器
    */
    getPanels: function() {
        return this._panels.mapViewPort;
    },

    /**
     * 设置地图的watcher, 用来监视地图容器的大小变化
     */
    _initContainerWatcher:function() {
        var map = this;
        map._watcher = setInterval(function() {
            var watched = map._getContainerDomSize();
            if (map.width !== watched.width || map.height !== watched.height) {
                var oldHeight = map.height;
                var oldWidth = map.width;
                map._setMapSize(watched);
                map._onResize(new Z.Point((watched.width-oldWidth) / 2,(watched.height-oldHeight) / 2));
                // 触发_onResize事件
                /**
                 * 地图容器大小变化事件
                 * @event resize
                 * @param target {seegoo.maps.Map} 触发事件的地图对象
                 */
                map.fire(map.events.RESIZE, {
                    'target' : map
                });
            }
        },800);
    }
});




//--------------地图载入完成后的钩子处理----------------
Z.Map.prototype._callOnLoadHooks=function() {
    var proto = Z.Map.prototype;
    for (var i = 0, len = proto._onLoadHooks.length; i < len; i++) {
        proto._onLoadHooks[i].call(this);
    }
};

/**
 * 添加底图加载完成后的钩子
 * @param {Function} fn 执行回调函数
 * @expose
 */
Z.Map.addOnLoadHook = function (fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var onload = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._onLoadHooks = this.prototype._onLoadHooks || [];
    this.prototype._onLoadHooks.push(onload);
};


