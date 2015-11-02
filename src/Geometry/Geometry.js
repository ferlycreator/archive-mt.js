Z.Painter={};
/**
 * 图形类
 * @class maptalks.Geometry
 * @abstract
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z['Geometry']=Z.Geometry=Z.Class.extend({
    includes: [Z.Eventable],

    exceptionDefs:{
        'en-US':{
            'DUPLICATE_LAYER':'Geometry cannot be added to two or more layers at the same time.',
            'INVALID_GEOMETRY_IN_COLLECTION':'Geometry is not valid for collection,index:'
        },
        'zh-CN':{
            'DUPLICATE_LAYER':'Geometry不能被重复添加到多个图层上.',
            'INVALID_GEOMETRY_IN_COLLECTION':'添加到集合中的Geometry是不合法的, index:'
        }
    },

    statics:{
         //--TYPES of geometry
        'TYPE_POINT' : 'Point',
        'TYPE_LINESTRING' : 'LineString',
        'TYPE_POLYGON' : 'Polygon',
        'TYPE_MULTIPOINT' : 'MultiPoint',
        'TYPE_MULTILINESTRING' : 'MultiLineString',
        'TYPE_MULTIPOLYGON' : 'MultiPolygon',
        'TYPE_GEOMETRYCOLLECTION' : 'GeometryCollection',
        //extented types
        'TYPE_RECT' : 'Rectangle',
        'TYPE_CIRCLE' : 'Circle',
        'TYPE_ELLIPSE' : 'Ellipse',
        'TYPE_SECTOR' : 'Sector'
    },

    options:{
        'visible':true,
        'editable':true
    },

    //初始化传入的option参数
    _initOptions:function(opts) {
        if (!opts) {
            opts = {};
        }
        var symbol = opts['symbol'];
        delete opts['symbol'];
        var id = opts['id'];
        delete opts['id'];
        Z.Util.setOptions(this,opts);
        if (symbol) {
            this.setSymbol(symbol);
        }
        if (!Z.Util.isNil(id)) {
            this.setId(id);
        }
    },

    //调用prepare时,layer已经注册到map上
    _prepare:function(layer) {
        this._rootPrepare(layer);
    },

    _rootPrepare:function(layer) {
        //Geometry不允许被重复添加到多个图层上
        if (this.getLayer()) {
            throw new Error(this.exceptions['DUPLICATE_LAYER']);
        }
        //更新缓存
        this._updateCache();
        this._layer = layer;
        //如果投影发生改变,则清除掉所有的投影坐标属性
        this._clearProjection();
        this.callInitHooks();

    },

    /**
     * 将Geometry加到图层上
     * @param {Layer} layer   图层
     * @param {Boolean} fitview 是否将地图自动聚焦到该Geometry上
     */
    addTo:function(layer, fitview) {
        layer.addGeometry(this, fitview);
        return this;
    },

    /**
     * 获取id
     * @returns {String} geometry的id
     * @expose
     */
    getId:function() {
        return this.id;
    },

    /**
     * 设置id
     * @param {String} id 设置geometry的id
     * @expose
     */
    setId:function(id) {
        var oldId = this.getId();
        this.id = id;
        //FIXME _idchanged没有被图层监听, layer.getGeometryById会出现bug
        this._fireEvent('_idchanged',{'oldId':oldId,'newId':id});
        return this;
    },

    /**
     * 获取Geometry的Layer
     * @returns {Layer} Geometry所属的Layer
     * @expose
     */
    getLayer:function() {
        if (!this._layer) {return null;}
        return this._layer;
    },

    /**
     * 获取Geometry所属的地图对象
     * @returns {Map} 地图对象
     * @expose
     */
    getMap:function() {
        if (!this._layer) {return null;}
        return this._layer.getMap();
    },

    /**
     * 获取Geometry的类型
     * @returns {Number} Geometry的类型
     * @expose
     */
    getType:function() {
        return this.type;
    },


    /**
     * 获取Geometry的Symbol
     * @returns {Symbol} Geometry的Symbol
     * @expose
     */
    getSymbol:function() {
        return this.options['symbol'];
    },

    /**
     * 设置Geometry的symbol
     * @param {Symbol} symbol 新的Symbol
     * @expose
     */
    setSymbol:function(symbol) {
        if (!symbol) {
            this.options['symbol'] = null;
        } else {
            //属性的变量名转化为驼峰风格
           var camelSymbol = Z.Util.convertFieldNameStyle(symbol,'camel');
           this._convertResourceUrl(camelSymbol);
           this.options['symbol'] = camelSymbol;
        }
        this._onSymbolChanged();
        return this;
    },

    /**
     * 资源url从相对路径转为绝对路径
     * @param  {[type]} symbol [description]
     * @return {[type]}        [description]
     */
    _convertResourceUrl:function(symbol) {
        function isRel(url) {
            if (url.indexOf('http://') >= 0 || url.indexOf('https://') >= 0 || url.indexOf('blob:') >= 0) {
                return false;
            }
            return true;
        }
        function absolute(base, relative) {
            //FIXME 需要处理relative以'/'开头的情况
            var stack = base.split("/"),
                parts = relative.split("/");
            stack.pop(); // remove current file name (or empty string)
                         // (omit if "base" is the current folder without trailing slash)
            for (var i=0; i<parts.length; i++) {
                if (parts[i] == ".")
                    continue;
                if (parts[i] == "..")
                    stack.pop();
                else
                    stack.push(parts[i]);
            }
            return stack.join("/");
        }

        var icon = symbol['markerFile'];
        if (icon && isRel(icon)) {
            symbol['markerFile'] = absolute(location.href,icon);
        }
        icon = symbol['shieldFile'];
        if (icon && isRel(icon)) {
            symbol['shieldFile'] = absolute(location.href,icon);
        }
        var fill = symbol['polygonPatternFile'];
        if (fill) {
            icon = Z.Util.extractCssUrl(fill);
            if (isRel(icon)) {
                symbol['polygonPatternFile'] = 'url("'+absolute(location.href,icon)+'")';
            }
        }
    },

    /**
     * 计算Geometry的外接矩形范围
     * @returns {Extent} Geometry的外接矩形范围
     * @expose
     */
    getExtent:function() {
        if (!this._extent) {
            this._extent = this._computeExtent(this._getProjection());
        }
        return this._extent;
    },

    /**
     * 返回Geometry的像素长宽, 像素长宽只在当前比例尺上有效, 比例尺变化后, 其值也会发生变化
     * @returns {Size}     Size.width, Size.height
     * @expose
     */
    getSize: function() {
        var map = this.getMap();
        if (!map) {
            return null;
        }
        var pxExtent = this._getPainter().getPixelExtent();
        return new Z.Size(Math.abs(pxExtent['xmax']-pxExtent['xmin']), Math.abs(pxExtent['ymax'] - pxExtent['ymin']));
    },

    _getPrjExtent:function() {
        var ext = this.getExtent();
        var p = this._getProjection();
        if (ext) {
            return new Z.Extent(p.project({x:ext['xmin'],y:ext['ymin']}), p.project({x:ext['xmax'],y:ext['ymax']}));
        } else {
            return null;
        }
    },

    /**
     * 计算图形的中心点坐标
     * @returns {Coordinate} 中心点坐标
     * @expose
     */
    getCenter:function() {
        return this._computeCenter(this._getProjection());
    },

    /**
     * 获取Geometry的Properties
     * @returns {Object} 自定义属性
     * @expose
     */
    getProperties:function() {
        if (!this.properties) {return null;}
        return this.properties;
    },

    /**
     * 设置Geometry的Properties
     * @param {Object} properties 自定义属性
     * @expose
     */
    setProperties:function(properties) {
        this.properties = properties;
        //TODO 抛事件
        return this;
    },

    /**
     * 显示Geometry
     * @expose
     */
    show:function() {
        this.options['visible'] = true;
        if (this.getMap()) {
            this._getPainter().show();
        }
        return this;
    },

    /**
     * 隐藏Geometry
     * @expose
     */
    hide:function() {
        this.options['visible'] = false;
        if (this.getMap()) {
            this._getPainter().hide();
        }
        return this;
    },

    /**
     * 闪烁Geometry
     *
     * @param interval {Number} 闪烁间隔时间，以毫秒为单位
     * @param count {Number} 闪烁次数
     */
    flash: function(interval, count) {
        if (!interval) {
            interval = 100;
        }
        if (!count) {
            count = 4;
        }
        var me = this;
        count = count * 2;
        if (this._flashTimeout) {
            clearTimeout(this._flashTimeout);
        }
        function flashGeo() {
            if (count === 0) {
                me.show();
                return;
            }

            if (count % 2 === 0) {
                me.hide();
            } else {
                me.show();
            }
            count--;
            me._flashTimeout = setTimeout(flashGeo, interval);
        }
        this._flashTimeout = setTimeout(flashGeo, interval);
    },

    /**
     * 是否可见
     * @returns {Boolean} true|false
     * @expose
     */
    isVisible:function() {

        return this.options['visible'];
    },

    /**
     * 克隆一个不在任何图层上的属性相同的Geometry,但不包含事件注册
     * @returns {Geometry} 克隆的Geometry
     * @expose
     */
    copy:function() {
        var json = this.toJson();
        //FIXME symbol信息没有被拷贝过来
        var ret = Z.GeoJson.fromGeoJson(json);
        return ret;
    },


    /**
     * 将自身从图层中移除
     * @expose
     */
    remove:function() {
        this._rootRemove(true);
    },

    _rootRemove:function(isFireEvent) {
        var layer = this.getLayer();
        if (!layer) {
            return;
        }
        //label
        //contextmenu
        this._unbindMenu();
        //infowindow
        this._unbindInfoWindow();

        this._removePainter();
        layer._onGeometryRemove(this);
        delete this._layer;
        if (isFireEvent) {
            this._fireEvent('remove');
        }
    },

    _getInternalId:function() {
        return this._internalId;
    },

    //只能被图层调用
    _setInternalId:function(id) {
        this._internalId = id;
    },


    _getProjection:function() {
        var map = this.getMap();
        if (map) {
            return map._getProjection();
        }
        return Z.Projection.getDefault();
        // return null;
    },

    //获取geometry样式中依赖的外部图片资源
    _getExternalResource:function() {
        var geometry = this;
        var symbol = geometry.getSymbol();
        if (!symbol) {
            return null;
        }
        var resources = [];
        var icon = symbol['markerFile'];
        if (icon) {
            resources.push(icon);
        }
        icon = symbol['shieldFile'];
        if (icon) {
            resources.push(icon);
        }
        var fill = symbol['polygonPatternFile'];
        if (fill) {
            resources.push(Z.Util.extractCssUrl(fill));
        }
        return resources;
    },

    _getPainter:function() {
        if (this.getMap() && !this._painter) {
            if (this instanceof Z.GeometryCollection) {
                this._painter = new Z.CollectionPainter(this);
            } else {
                this._painter = new Z.Painter(this);
            }
        }
        return this._painter;
    },

    _removePainter:function() {
        if (this._painter) {
            this._painter.remove();
        }
        delete this._painter;
    },

    _onZoomEnd:function() {
        if (this._painter) {
            this._painter.refresh();
        }
    },

    _onShapeChanged:function() {
        var painter = this._getPainter();
        if (painter) {
            painter.refresh();
        }
        this._extent = null;
        if (!this.isEditing || !this.isEditing()) {
            this._fireEvent('shapechanged');
        }
    },

    _onPositionChanged:function() {
        var painter = this._getPainter();
        if (painter) {
            painter.refresh();
        }
        this._extent = null;
        if (!this.isEditing || !this.isEditing()) {
            this._fireEvent('positionchanged');
        }
    },

    _onSymbolChanged:function() {
        var painter = this._getPainter();
        if (painter) {
            painter.refreshSymbol();
        }
        this._fireEvent('symbolchanged');
    },
    /**
     * 设置Geometry的父Geometry, 父Geometry为包含该geometry的Collection类型Geometry
     * @param {GeometryCollection} geometry 父Geometry
     */
    _setParent:function(geometry) {
        if (geometry) {
            this._parent = geometry;
        }
    },

    _getParent:function() {
        return this._parent;
    },

    _fireEvent:function(eventName, param) {
        this.fire(eventName,param);
        if (this._getParent()) {
            if (param) {
                param['target'] = this._getParent();
            }
            this._getParent().fire(eventName,param);
        }
    },

    toGeometryJson:function(opts) {
        var gJson = this._exportGeoJson();
        if (!opts || opts['crs']) {
            var crs = this.getCRS();
            if (crs) {
                gJson['crs'] = crs;
            }
        }
        return gJson;
    },

    _exportGeoJson:function() {
        var points = this.getCoordinates();
        var coordinates = Z.GeoJson.toGeoJsonCoordinates(points);
        return {
            'type':this.getType(),
            'coordinates': coordinates
        };
    },

    /**
     * 按照GeoJson规范生成GeoJson对象
     * @param  {[Object} opts 输出配置
     * @returns {Object}      GeoJson对象
     * @expose
     */
    toJson:function(opts) {
        if (!opts) {
            opts = {};
        }
        var feature = {
            'type':'Feature',
            'geometry':null
        };
        if (opts['geometry'] === undefined || opts['geometry']) {
            var geoJson = this._exportGeoJson(opts);
            feature['geometry']=geoJson;
        }
        var id = this.getId();
        if (!Z.Util.isNil(id)) {
            feature['id'] = id;
        }
        var properties = {};
        //opts没有设定symbol或者设定的symbol值为true,则导出symbol
        if (opts['symbol'] === undefined || opts['symbol']) {
            var symbol = this.getSymbol();
            if (symbol) {
                feature['symbol'] = symbol;
            }
        }
        var crs = this.getCRS();
        if (crs) {
            feature['crs'] = crs;
        }
        //opts没有设定properties或者设定的properties值为true,则导出properties
        if (opts['properties'] === undefined || opts['properties']) {
            var geoProperties = this.getProperties();
            if (geoProperties) {
                for (var p in geoProperties) {
                    if (geoProperties.hasOwnProperty(p)) {
                        properties[p] = geoProperties[p];
                    }
                }
            }
        }
        feature['properties'] = properties;
        return feature;
    },

    /**
     * 计算Geometry的地理长度,单位为米或像素(依据坐标类型)
     * @returns {Number} 地理长度
     * @expose
     */
    getLength:function() {
        return this._computeGeodesicLength(this._getProjection());
    },

    /**
     * 计算Geometry的地理面积, 单位为平方米或平方像素(依据坐标类型)
     * @returns {Number} 地理面积
     * @expose
     */
    getArea:function() {
        return this._computeGeodesicArea(this._getProjection());
    },

    /**
     * 获取图形顶点坐标数组
     */
    getLinkAnchors: function() {
        return [this.getCenter()];
    },

    /**
     * 返回Geometry的CRS
     * @return {CRS} CRS
     */
    getCRS:function() {
        //如果有map,则map的坐标类型优先级更高
        var map = this.getMap();
        if (map) {
            return map.getCRS();
        }
        return this.options['crs'];
    },

    /**
     * 设置Geometry的CRS
     * @param {CRS} crs CRS
     */
    setCRS:function(crs) {
        this.options['crs'] = crs;
        return this;
    }

});
