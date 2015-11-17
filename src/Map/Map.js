/**
 * 地图类
 * @class maptalks.Map
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z['Map']=Z.Map=Z.Class.extend({

    includes: [Z.Eventable,Z.HandlerBus],

    options:{
        'enableMapSliding':true,
        'enableZoom':true,
        'enableInfoWindow':true,
        'zoomMode':'pointer',
        'crs':Z.CRS.GCJ02
    },

    //根据不同的语言定义不同的错误信息
    exceptionDefs:{
        'en-US':{
            'NO_BASE_TILE_LAYER':'Map has no baseTileLayer, pls specify a baseTileLayer by setBaseTileLayer method before loading.',
            'INVALID_TILECONFIG':'TileConfig of Map is invalid.',
            'INVALID_OPTION':'Invalid options provided.',
            'INVALID_CENTER':'Invalid Center',
            'INVALID_LAYER_ID':'Invalid id for the layer',
            'DUPLICATE_LAYER_ID':'the id of the layer is duplicate with another layer',
            'INVALID_CRS' : 'the crs is invalid'
        },
        'zh-CN':{
            'NO_BASE_TILE_LAYER':'地图没有设置基础图层,请在调用Map.Load之前调用setBaseTileLayer设定基础图层',
            'INVALID_TILECONFIG':'LOD配置无效.',
            'INVALID_OPTION':'无效的option.',
            'INVALID_CENTER':'无效的中心点',
            'INVALID_LAYER_ID':'图层的id无效',
            'DUPLICATE_LAYER_ID':'重复的图层id',
            'INVALID_CRS' : '非法的CRS.'
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

        this._enablePanAnimation = true;

        //坐标类型
        options = Z.Util.setOptions(this,options);
        this._initRender();
        this._getRender().initContainer();
        this._updateMapSize(this._getContainerDomSize());
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
        return new Z.Size(this.width, this.height);
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
     * 获得地图可视范围的viewPoint范围
     * @return {Extent} 可视范围的ViewPoint范围
     */
    _getViewExtent:function() {
        var size = this.getSize();
        var offset = this.offsetPlatform();
        var min = new Z.Point(0,0);
        var max = new Z.Point(size['width'],size['height']);
        return new Z.Extent(min.substract(offset), max.substract(offset));
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
        if (!center) {
            return this;
        }
        if (!this._tileConfig || !this._loaded) {
            this._center = center;
            return this;
        }
        if (this._loaded && !this._center.equals(center)) {
            /**
             * 触发map的movestart事件
             * @member maptalks.Map
             * @event movestart
             */
            this._fireEvent('movestart');
        }
        var projection = this._getProjection();
        var _pcenter = projection.project(center);
        this._setPrjCenterAndMove(_pcenter);
        // XXX: fire 'moveend' or not?
        this._onMoveEnd();
        return this;
    },

    _setPrjCenterAndMove:function(pcenter) {
        var offset = this._getPixelDistance(pcenter);
        this._setPrjCenter(pcenter);
        this.offsetPlatform(offset);
    },

    _onMoving:function(param) {
        /*function movingLayer(layer) {
            if (layer) {
                layer._onMoving(param);
            }
        }*/

        /*//reduce refresh frequency
        if (2*Math.random() > 1) {this._refreshSVGPaper();}*/
        /*if (this._baseTileLayer) {this._baseTileLayer._onMoving();}
        this._eachLayer(movingLayer, this._svgLayers, this._canvasLayers);*/
        /**
         * 触发map的moving事件
         * @member maptalks.Map
         * @event moving
         */
        this._fireEvent('moving');
    },

    _onMoveEnd:function(param) {
        /*function endMoveLayer(layer) {
            if (layer) {
                layer._onMoveEnd(param);
            }
        }*/
        // if (this._baseTileLayer) {this._baseTileLayer._onMoveEnd();}
        /*this._refreshSVGPaper();*/
        // this._eachLayer(endMoveLayer,this._tileLayers,this._canvasLayers,this._dynLayers);
        this._enablePanAnimation=true;
        this._isBusy = false;
        /**
         * 触发map的moveend事件
         * @member maptalks.Map
         * @event moveend
         */
        this._fireEvent('moveend');
    },

    /**
     * 获取指定的投影坐标与当前的地图中心点的像素距离
     * @param  {Coordinate} pcenter 像素坐标
     * @return {Point}          像素距离
     */
    _getPixelDistance:function(pcenter) {
        var current = this._getPrjCenter();
        var curr_px = this._transform(current);
        var pcenter_px = this._transform(pcenter);
        var span = new Z.Point((-pcenter_px['left']+curr_px['left']),(curr_px['top']-pcenter_px['top']));
        return span;
    },

    isBusy:function() {
        return this._isBusy || this._zooming;
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
        if (!extent || !(extent instanceof Z.Extent)) {
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
        var isChange = false;
        if (this._baseTileLayer) {
            isChange = true;
            this._fireEvent('baselayerchangestart');
            this._baseTileLayer._onRemove();
        }
        baseTileLayer._prepare(this,-1);
        this._baseTileLayer = baseTileLayer;
        var me = this;
        //删除背景
        this._baseTileLayer.on('layerloaded',function() {
            // me._removeBackGroundDOM();
            this._fireEvent('baselayerload');
            if (isChange) {
                this._fireEvent('baselayerchangeend');
            }
        },this);
        this._baseTileLayer._loadTileConfig(function() {
            var tileConfig = me._baseTileLayer._getTileConfig();
            var changed = me._setTileConfig(tileConfig);
            if (me._loaded) {
                me._baseTileLayer.load();
                if (changed) {
                    /**
                     * 瓦片配置改变事件
                     * @member maptalks.Map
                     * @event tileconfigchange
                     * @return {Object} param: {'target': map}
                     */
                    me._fireEvent('tileconfigchange');
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
                if (this.isCanvasRender() || layer.isCanvasRender()) {
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

    _sortLayersZ:function(layerList) {
        layerList.sort(function(a,b) {
            return a.getZIndex()-b.getZIndex();
        });
    },

    /**
     * 图层排序
     * @param  {String | layers} layerIds 图层id或者图层
     */
    sortLayers:function(layers) {
        if (!layers || !Z.Util.isArray(layers)) {
            return this;
        }
        var layersToOrder = [];
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (Z.Util.isString(layers[i])) {
                layer = this.getLayer(layer);
            }
            if (!(layer instanceof Z.Layer)) {
                throw new Error('It must be a layer to order.');
            }
            layersToOrder.push(layer);
        }

        function getMaxZ(_layerList) {
            return _layerList[_layerList.length-1].getZIndex();
        }

        for (var ii = 0; ii < layersToOrder.length; ii++) {
            var list = layersToOrder[ii]._getLayerList();
            if (list.length === 1 || list[list.length-1] === layersToOrder[i]) {
                continue;
            }
            var max = getMaxZ(list);
            layersToOrder[ii].setZIndex(max+1);
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
        layer.remove();
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
                if (layerList[j].setZIndex) {
                    layerList[j].setZIndex(j);
                }
            }
        }
    },

    /**
     * 获取地图的坐标类型
     * @return {String} 坐标类型
     * @expose
     */
    getCRS:function() {
        return this.options['crs'];
    },

    /**
     * 设置地图的坐标类型
     * @param {String} crs 坐标类型
     */
    setCRS:function(crs) {
        if (!crs || !(crs instanceof Z.CRS)) {
            throw new Error(this.exceptions['INVALID_CRS']);
        }
        //判断coordinateType是否有效
        this.options['crs'] = crs;
        /**
         * 触发map的crschanged事件
         * @member maptalks.Map
         * @event crschanged
         */
        this._fireEvent('crschanged');
    },


//------------------------------坐标转化函数-----------------------------
    /**
     * 将地理坐标转化为容器偏转坐标
     * @param {Coordinate} coordinate 地理坐标
     * @return {Point} 容器偏转坐标
     */
    coordinateToViewPoint: function(coordinate) {
        var projection = this._getProjection();
        if (!coordinate || !projection) {return null;}
        var pCoordinate = projection.project(coordinate);
        return this._transformToViewPoint(pCoordinate).round();
    },

    /**
     * 将容器偏转坐标转化为地理坐标
     * @param {Point} viewPoint 容器坐标
     * @return {Coordinate} 地理坐标
     */
    viewPointToCoordinate: function(viewPoint) {
        var projection = this._getProjection();
        if (!viewPoint || !projection) {return null;}
        return this._untransformFromViewPoint(viewPoint);
    },

    /**
     * 将地理坐标转化为屏幕坐标
     * @param {Coordinate} 地理坐标
     * @return {Point} 屏幕坐标
     */
    coordinateToContainerPoint: function(coordinate) {
        var projection = this._getProjection();
        if (!coordinate || !projection) {return null;}
        var pCoordinate = projection.project(coordinate);
        var offset = this._transform(pCoordinate);
        return offset.round();
    },

    /**
     * 将屏幕像素坐标转化为地理坐标
     * @param {containerPoint} 屏幕坐标
     * @return {coordinate} 地理坐标
     */
    containerPointToCoordinate: function(containerPoint) {
        var projection = this._getProjection();
        if (!containerPoint || !projection) {return null;}
        var pCoordinate = this._untransform(containerPoint);
        var coordinate = projection.unproject(pCoordinate);
        return coordinate;
    },
//-----------------------------------------------------------------------

    _onResize:function(resizeOffset) {
        this._offsetCenterByPixel(resizeOffset);
        /**
         * 触发map的resize事件
         * @member maptalks.Map
         * @event resize
         */
        this._fireEvent('resize');
    },

    _fireEvent:function(eventName, param) {
        //fire internal events at first
        this.fire('_'+eventName,param);
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
        //this.fire('mapready');
    },

    _initRender:function() {
        if (this.options['render'] === 'canvas') {
            this._render = new Z.render.map.Canvas(this);
        } else {
            this._render = new Z.render.map.Dom(this);
        }
    },

    _getRender:function() {
        return this._render;
    },

    /**
     * 地图是否采用Canvas渲染
     * @return {Boolean}
     */
    isCanvasRender:function() {
        return this._render && this._render instanceof Z.render.map.Canvas;
    },

    _loadAllLayers:function() {
        function loadLayer(layer) {
            if (layer) {
                layer.load();
            }
        }
        if (this._baseTileLayer) {this._baseTileLayer.load();}
        this._eachLayer(loadLayer,this.getAllLayers());
    },

    /**
     * 获取所有图层
     * @return {[type]} [description]
     */
    getAllLayers:function() {
        return this._getAllLayers(function(layer) {
            if (layer === this._baseTileLayer || layer.getId().indexOf(Z.internalLayerPrefix) === -1) {
                return false;
            }
            return true;
        });
    },

    /**
     * 获取符合filter过滤条件的图层
     * @param  {fn} filter 过滤函数
     * @return {[Layer]}        符合过滤条件的图层数组
     */
    _getAllLayers:function(filter) {
        //TODO 可视化图层
        var layers = [this._baseTileLayer].concat(this._tileLayers).concat(this._dynLayers)
        .concat(this._canvasLayers)
        .concat(this._svgLayers);
        var result = [];
        for (var i = 0; i < layers.length; i++) {
            if (!filter || filter.call(this,layers[i])) {
                result.push(layers[i]);
            }
        }
        return result;
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
        this._getRender().showOverlayLayers();
        return this;
    },

    /**
     * 隐藏所有的Overlayer图层
     * @return {[type]} [description]
     */
    _hideOverlayLayers:function() {
        this._getRender().hideOverlayLayers();
        return this;
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
            return false;
        }
        this._tileConfig = tileConfig;
        this._checkMapStatus();
        return true;
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

    _updateMapSize:function(mSize) {
        this.width = mSize['width'];
        this.height = mSize['height'];
        this._getRender().updateMapSize(mSize);
        return this;
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
        return pCenter;
    },

    /**
     * 获取地图容器偏移量或增加容器的偏移量
     * @param  {Pixel} offset 增加的偏移量,如果为null,则直接返回容器的偏移量
     * @return {Point | this} 如果offset为null,则直接返回容器的偏移量, 否则则返回map对象
     * @expose
     */
    offsetPlatform:function(offset) {
        if (!this._mapViewPoint) {
            this._mapViewPoint = this._getRender().offsetPlatform();
        }
        if (!offset) {
            return this._mapViewPoint;

        } else {
            var _offset = offset.round();
            this._mapViewPoint = this._mapViewPoint.add(_offset);
            this._getRender().offsetPlatform(_offset);
            return this;
        }
    },

    _resetMapViewPoint:function() {
        if (!this._mapViewPoint) {
            this._mapViewPoint = new Z.Point(0,0);
        } else {
            this._mapViewPoint = new Z.Point(0,0);
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
        var point = new Z.Point(centerPoint['left']+ domPos['left'] - this.width / 2, centerPoint['top']+domPos['top'] - this.height / 2);
        var result = transformation.untransform(point, res);
        return result;
    },

    /**
     * 相对坐标转化为地理投影坐标
     * @param  {[type]} domPos [description]
     * @return {[type]}        [description]
     */
    _untransformFromViewPoint:function(domPos) {
        return this._untransform(this._viewPointToContainerPoint(domPos));
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
            this.width / 2 + point['left'] - centerPoint['left'],
            this.height / 2 + point['top'] - centerPoint['top']
            );
    },

    /**
     * 投影坐标转化为容器的相对坐标
     * @param  {Coordinate} pCoordinate 投影坐标
     * @return {Object}             容器相对坐标
     */
    _transformToViewPoint:function(pCoordinate) {
        var containerPoint = this._transform(pCoordinate);
        return this._containerPointToViewPoint(containerPoint);
    },

    /**
     * 屏幕坐标到地图容器偏移坐标
     *
     * @param containerPoint
     * @returns {viewPoint}
     */
    _containerPointToViewPoint: function(containerPoint) {
        if (!containerPoint) {return null;}
        var platformOffset = this.offsetPlatform();
        return containerPoint.substract(platformOffset);
    },

    /**
     * 地图容器偏移坐标到屏幕坐标的转换
     *
     * @param viewPoint
     * @returns {containerPoint}
     */
    _viewPointToContainerPoint: function(viewPoint) {
        if (!viewPoint) {return null;}
        var platformOffset = this.offsetPlatform();
        return viewPoint.add(platformOffset);
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
     * 返回距离coordinate坐标距离为dx, dy的坐标
     * @param  {Coordinate} coordinate 坐标
     * @param  {Number} dx         x轴上的距离, 坐标为经纬度时,单位为米, 坐标为像素时, 单位为像素
     * @param  {Number} dy         y轴上的距离, 坐标为经纬度时,单位为米, 坐标为像素时, 单位为像素
     * @return {Coordinate}            新的坐标
     */
    locate:function(coordinate, dx, dy) {
        return this._getProjection().locate(coordinate,dx,dy);
    },

    /**
    * 获取地图容器
    */
    getPanel: function() {
        /*return this._panels.mapViewPort;*/
        return this._getRender().getPanel();
    },

    /**
     * 设置地图的watcher, 用来监视地图容器的大小变化
     * @ignore
     */
    _initContainerWatcher:function() {
        var map = this;
        map._watcher = setInterval(function() {
            if (map.isBusy()) {
                return;
            }
            var watched = map._getContainerDomSize();
            if (map.width !== watched.width || map.height !== watched.height) {
                var oldHeight = map.height;
                var oldWidth = map.width;
                map._updateMapSize(watched);
                map._onResize(new Z.Point((watched.width-oldWidth) / 2,(watched.height-oldHeight) / 2));
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


