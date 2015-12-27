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
        "zoomAnimation" : true,
        "zoomAnimationDuration" : 300,
        //controls whether other layers than base tilelayer will show during zoom animation.
        "layerZoomAnimation" : true,

        //economically transform, whether point symbolizers transforms during transformation (eg. zoom animation)
        //set to true can prevent drastic low performance when number of point symbolizers is large.
        "ecoTransform" : false,

        "panAnimation":true,
        //default pan animation duration
        "panAnimationDuration" : 600,

        'enableZoom':true,
        'enableInfoWindow':true,
        'crs':Z.CRS.GCJ02,

        'maxZoom' : null,
        'minZoom' : null
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
            if (!this._containerDOM) {
                throw new Error('invalid container: \''+_container+'\'');
            }
        } else {
            this._containerDOM = _container;
            if (Z.runningInNode) {
                //node环境中map的containerDOM即为模拟Canvas容器, 例如node-canvas
                //获取模拟Canvas类的类型, 用以在各图层的渲染器中构造Canvas
                this.CanvasClass = this._containerDOM.constructor;
            }
        }


        //Layer of Details, always derived from baseTileLayer
        this._tileConfig=null;
        this._panels={};

        //Layers
        this._baseTileLayer=null;
        this._layers = [];

        //shallow copy options
        var opts = Z.Util.extend({}, options);

        this._zoomLevel = opts['zoom'];
        delete opts['zoom'];
        this._center = new Z.Coordinate(opts['center']);
        delete opts['center'];

        //内部变量, 控制当前地图是否允许panAnimation
        this._enablePanAnimation = true;

        //坐标类型
        Z.Util.setOptions(this,opts);

        this._mapViewPoint=new Z.Point(0,0);

        this._initRender();
        this._getRender().initContainer();
        this._updateMapSize(this._getContainerDomSize());
    },

    /**
     * 地图是否采用Canvas渲染
     * @return {Boolean}
     */
    isCanvasRender:function() {
        return this._render && this._render instanceof Z.render.map.Canvas;
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
     * 设置地图的鼠标样式
     * @param {cursor} cursor 鼠标样式, 同css cursor
     */
    setCursor:function(cursor) {
        delete this._cursor;
        this._trySetCursor(cursor);
        this._cursor = cursor;
        return this;
    },

    /**
     * try to change cursor when map is not setCursored
     * @param  {String} cursor css cursor
     */
    _trySetCursor:function(cursor) {
        if (!this._cursor && !this._priorityCursor) {
            if (!cursor) {
                cursor = 'default';
            }
            var panel = this.getPanel();
            if (panel && panel.style) {
                panel.style.cursor = cursor;
            }
        }
        return this;
    },

    _setPriorityCursor:function(cursor) {
        if (!cursor) {
            var hasCursor = false;
            if (this._priorityCursor) {
                hasCursor = true;
            }
            delete this._priorityCursor;
            if (hasCursor) {
                this.setCursor(this._cursor);
            }
        } else {
            this._priorityCursor = cursor;
            var panel = this.getPanel();
            if (panel && panel.style) {
                panel.style.cursor = cursor;
            }
        }
        return this;
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
        center = new Z.Coordinate(center);
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
        /**
         * 触发map的moving事件
         * @member maptalks.Map
         * @event moving
         */
        this._fireEvent('moving');
    },

    _onMoveEnd:function(param) {
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
        var span = new Z.Point((-pcenter_px.x+curr_px.x),(curr_px.y-pcenter_px.y));
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
    getZoom:function() {
        return this._zoomLevel;
    },

    /**
     * 获取与scale最接近的缩放级别
     * @param  {Number} scale    [description]
     * @param  {[type]} fromZoom [description]
     * @return {[type]}          [description]
     */
    getZoomForScale:function(scale, fromZoom) {
        if (Z.Util.isNil(fromZoom)) {
            fromZoom = this.getZoom();
        }
        var res = this._getResolution(fromZoom),
            resolutions = this._getTileConfig()['resolutions'],
            min = Number.MAX_VALUE,
            hit = -1;
        for (var i = resolutions.length - 1; i >= 0; i--) {
            var test = Math.abs(res/resolutions[i]-scale);
            if (test < min) {
                min = test;
                hit = i;
            }
        }
        return hit;
    },

    /**
     * 设置地图的缩放级别
     * @param {Number} z 新的缩放级别
     * @expose
     */
    setZoom:function(z) {
        this._zoomAnimation(z);
        return this;
    },

    /**
     * 获得地图最大放大级别
     * @return {Number} 最大放大级别
     * @expose
     */
    getMaxZoom:function() {
        return this.options['maxZoom'];
    },

    /**
     * 设置最大放大级别
     * @param {Number} zoomLevel 最大放大级别
     * @expose
     */
    setMaxZoom:function(zoomLevel) {
        var tileConfig = this._getTileConfig();
        if (zoomLevel > tileConfig['maxZoom']) {
            zoomLevel = tileConfig['maxZoom'];
        }
        if (zoomLevel < this._zoomLevel) {
            this.setZoom(zoomLevel);
        }
        this.options['maxZoom'] = zoomLevel;
        return this;
    },

    /**
     * 获得地图最小放大级别
     * @return {Number} 最小放大级别
     * @expose
     */
    getMinZoom:function() {
        return this.options['minZoom'];
    },

    /**
     * 设置最小放大级别
     * @param {Number} zoomLevel 最小放大级别
     * @expose
     */
    setMinZoom:function(zoomLevel) {
        var tileConfig = this._getTileConfig();
        if (zoomLevel < tileConfig['minZoom']) {
            zoomLevel = tileConfig['minZoom'];
        }
        this.options['minZoom']=zoomLevel;
        return this;
    },

    /**
     * 放大地图
     * @expose
     */
    zoomIn: function() {
        this._zoomAnimation(this.getZoom() + 1);
        return this;
    },

    /**
     * 地图缩小
     * @expose
     */
    zoomOut: function() {
        this._zoomAnimation(this.getZoom() - 1);
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
            this._zoomAnimation(zoomLevel);
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
    getFitZoom: function(extent) {
        if (!extent || !(extent instanceof Z.Extent)) {
            return this._zoomLevel;
        }
        //点类型
        if (extent['xmin'] == extent['xmax'] && extent['ymin'] == extent['ymax']) {
            return this.getMaxZoom();
        }
        try {
            var projection = this._getProjection();
            var x = Math.abs(extent["xmin"] - extent["xmax"]);
            var y = Math.abs(extent["ymin"] - extent["ymax"]);
            var projectedExtent = projection.project({x:x, y:y});
            var resolutions = this._getTileConfig()['resolutions'];
            var xz = -1;
            var yz = -1;
            for ( var i = this.getMinZoom(), len = this.getMaxZoom(); i < len; i++) {
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
                return this.getMaxZoom();
            }
            // return ret - 2;
            return ret;
        } catch (exception) {
            return this.getZoom();
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
        baseTileLayer.config({
            'rendWhenPanning':true
        });
        baseTileLayer._prepare(this,-1);
        this._baseTileLayer = baseTileLayer;
        var me = this;
        //删除背景
        function onBaseTileLayerLoaded() {
            this._fireEvent('baselayerload');
            if (isChange) {
                this._fireEvent('baselayerchangeend');
            }
        }
        this._baseTileLayer.onOnce('layerloaded',onBaseTileLayerLoaded,this);
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
            layer._prepare(this, this._layers.length);
            this._layers.push(layer);
            if (this._loaded) {
                layer.load();
            }
        }
        return this;
    },

    _sortLayersByZIndex:function(layerList) {
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
        var minZ = Number.MAX_VALUE;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (Z.Util.isString(layers[i])) {
                layer = this.getLayer(layer);
            }
            if (!(layer instanceof Z.Layer) || !layer.getMap() || layer.getMap() !== this) {
                throw new Error('It must be a layer added to this map to order.');
            }
            if (layer.getZIndex() < minZ) {
                minZ = layer.getZIndex();
            }
            layersToOrder.push(layer);
        }
        for (var ii = 0; ii < layersToOrder.length; ii++) {
            layersToOrder[ii].setZIndex(minZ+ii);
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
        this._removeLayer(layer, this._layers);
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
        var p = this._untransformFromViewPoint(viewPoint);
        var c = projection.unproject(p);
        return c;
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
    /**
     * Checks if the map container size changed
     */
    invalidateSize:function() {
        if (this._resizeTimeout) {
            clearTimeout(this._resizeTimeout);
        }
        var me = this;
        this._resizeTimeout = setTimeout(function() {
            var watched = me._getContainerDomSize();
            if (me.width !== watched.width || me.height !== watched.height) {
                var oldHeight = me.height;
                var oldWidth = me.width;
                me._updateMapSize(watched);
                var resizeOffset = new Z.Point((watched.width-oldWidth) / 2,(watched.height-oldHeight) / 2);
                me._offsetCenterByPixel(resizeOffset);
                /**
                 * 触发map的resize事件
                 * @member maptalks.Map
                 * @event resize
                 */
                me._fireEvent('resize');
            }
        }, 100);

        return this;
    },

    _fireEvent:function(eventName, param) {
        //fire internal events at first
        this.fire('_'+eventName,param);
        this.fire(eventName,param);
    },

    _Load:function() {
        this._registerDomEvents();
        this._loadAllLayers();
        this._loaded = true;
        this._callOnLoadHooks();
        //this.fire('mapready');
    },

    _initRender:function() {
        if (Z.Browser.canvas) {
            this._render = new Z.render.map.Canvas(this);
        } else {
            this._render = new Z.render.map.Dom(this);
        }
    },

    _getRender:function() {
        return this._render;
    },

    _loadAllLayers:function() {
        function loadLayer(layer) {
            if (layer) {
                layer.load();
            }
        }
        if (this._baseTileLayer) {this._baseTileLayer.load();}
        this._eachLayer(loadLayer,this.getLayers());
    },

    /**
     * 获取所有图层
     * @return {[type]} [description]
     */
    getLayers:function() {
        return this._getLayers(function(layer) {
            if (layer === this._baseTileLayer || layer.getId().indexOf(Z.internalLayerPrefix) >= 0) {
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
    _getLayers:function(filter) {
        var layers = [this._baseTileLayer].concat(this._layers);
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
        if (layerLists && !Z.Util.isArray(layerLists)) {
            layerLists = [layerLists];
        }
        var layers = [];
        for (var i=0, len=layerLists.length;i<len;i++) {
            layers = layers.concat(layerLists[i]);
        }
        for (var j=0, jlen = layers.length;j<jlen;j++) {
            fn.call(fn,layers[j]);
        }
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
        if (this._tileConfig && this._tileConfig.equals(tileConfig, this.getZoom())) {
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
        var maxZoom = this.getMaxZoom(),
            minZoom = this.getMinZoom();
        if (!maxZoom || maxZoom > this._tileConfig['maxZoom']) {
            this.setMaxZoom(this._tileConfig['maxZoom']);
        }
        if (!minZoom || minZoom < this._tileConfig['minZoom']) {
            this.setMinZoom(this._tileConfig['minZoom']);
        }
        if (maxZoom < minZoom) {
            this.setMaxZoom(minZoom);
        }
        maxZoom = this.getMaxZoom(),
        minZoom = this.getMinZoom();
        if (!this._zoomLevel || this._zoomLevel > maxZoom) {
            this._zoomLevel = maxZoom;
        }
        if (this._zoomLevel < minZoom) {
            this._zoomLevel = minZoom;
        }
        this._center = this.getCenter();
        var projection = this._tileConfig.getProjectionInstance();
        this._prjCenter = projection.project(this._center);
    },

    _getContainerDomSize:function(){
        if (!this._containerDOM) {return null;}
        var containerDOM = this._containerDOM,
            width,height;
        if (!Z.Util.isNil(containerDOM.offsetWidth) && !Z.Util.isNil(containerDOM.offsetWidth)) {
            width = parseInt(containerDOM.offsetWidth,0);
            height = parseInt(containerDOM.offsetHeight,0);
        } else if (!Z.Util.isNil(containerDOM.width) && !Z.Util.isNil(containerDOM.height)) {
            width = containerDOM.width;
            height = containerDOM.height;
        } else {
            throw new Error('can not get size of container');
        }
        return new Z.Size(width, height);
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
        var posX = this.width/2+pixel.x,
            posY = this.height/2+pixel.y;
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
        if (!offset) {
            return this._mapViewPoint;
        } else {
            this._mapViewPoint = this._mapViewPoint.add(offset);
            this._getRender().offsetPlatform(offset);
            return this;
        }
    },

    _resetMapViewPoint:function() {
        this._mapViewPoint = new Z.Point(0,0);
    },

    /**
     * 获取当前缩放级别的投影坐标分辨率
     * @return {Number} resolution
     */
    _getResolution:function(zoom) {
        if (Z.Util.isNil(zoom)) {
            zoom = this.getZoom();
        }
        return this._tileConfig.getResolution(zoom);
    },

    /**
     * transform dom position to geodesic projected coordinate
     * @param  {Object} domPos    dom screen xy, eg {left:10, top:10}
     * @param  {Number} zoomLevel current zoomLevel
     * @return {Coordinate}           Coordinate
     */
    _untransform:function(domPos) {
        var transformation =  this._getTileConfig().getTransformationInstance();
        var res = this._getResolution();

        var pcenter = this._getPrjCenter();
        var centerPoint = transformation.transform(pcenter, res);
        //容器的像素坐标方向是固定方向的, 和html标准一致, 即从左到右增大, 从上到下增大
        var point = new Z.Point(centerPoint.x+ domPos.x - this.width / 2, centerPoint.y+domPos.y - this.height / 2);
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
        var res = this._getResolution();//_tileConfig.getResolution(this.getZoom());//['resolutions'][this._zoomLevel];

        var pcenter = this._getPrjCenter();
        var centerPoint = transformation.transform(pcenter, res);

        var point = transformation.transform(pCoordinate,res);
        return new Z.Point(
            this.width / 2 + point.x - centerPoint.x,
            this.height / 2 + point.y - centerPoint.y
            );
    },

    /**
     * 投影坐标转化为容器的相对坐标
     * @param  {Coordinate} pCoordinate 投影坐标
     * @return {Point}             容器相对坐标
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
        var res = this._getResolution();//tileConfig['resolutions'][this.getZoom()];
        var nw = projection.unproject({x: plonlat.x - pnw.x*res, y: plonlat.y + pnw.x*res});
        var se = projection.unproject({x: plonlat.x + pse.y*res, y: plonlat.y - pse.y*res});
        return new Z.Extent(nw,se);
    },

    /**
     * 在当前比例尺下将距离转换为像素长度
     * @param  {Number} xDist x轴上的距离
     * @param  {Number} yDist y轴上的距离
     * @return {Size}   结果属性上的width为x轴上的像素长度, height为y轴上的像素长度
     * @expose
     */
    distanceToPixel: function(xDist,yDist) {
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
            target = projection.locate(center,xDist,yDist),
            res = this._getResolution();

        var width = !xDist?0:(projection.project(new Z.Coordinate(target.x, center.y)).x-projection.project(center).x)/res;
        var height = !yDist?0:(projection.project(new Z.Coordinate(target.x, center.y)).y-projection.project(target).y)/res;
        return new Z.Size(Math.round(Math.abs(width)), Math.round(Math.abs(height)));
    },

    /**
     * 像素转化为距离
     * @param  {Number} width 横轴像素长度
     * @param  {Number} height 纵轴像素长度
     * @return {Number}    distance
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
            res = this._getResolution();
        var pTarget = new Z.Coordinate(pcenter.x+width*res, pcenter.y+height*res);
        var target = projection.unproject(pTarget);
        return projection.getGeodesicLength(target,center);
    },

    /**
     * 返回距离coordinate坐标距离为dx, dy的坐标
     * @param  {Coordinate} coordinate 坐标
     * @param  {Number} dx         x轴上的距离, 地图CRS为经纬度时,单位为米, 地图CRS为像素时, 单位为像素
     * @param  {Number} dy         y轴上的距离, 地图CRS为经纬度时,单位为米, 地图CRS为像素时, 单位为像素
     * @return {Coordinate}            新的坐标
     */
    locate:function(coordinate, dx, dy) {
        return this._getProjection().locate(coordinate,dx,dy);
    },

    /**
    * 获取地图容器
    */
    getPanel: function() {
        return this._getRender().getPanel();
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


