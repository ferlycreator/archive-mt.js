Z.Painter={};
Z['Geometry']=Z.Geometry=Z.Class.extend({
    includes: [Z.Eventable],

    //根据不同的语言定义不同的错误信息
    'exceptionDefs':{
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


    },

    //默认标注样式
    defaultIcon:{
        "type":"picture",
        "url" : Z.host + "/engine/images/marker.png",
        "height" : 30,
        "width" : 20,
        "offset" : {
            "x" : 0,
            "y" : 0
        }
    },

    // 默认线样式
    defaultSymbol:{
        "lineColor" : "#474cf8",
        "lineWidth" : 3,
        "lineOpacity" : 1
    },

    initialize:function() {
        //this.identifier = Z.Util.GUID();

    },

    /**
     * 初始化传入的option参数
     * @param  {Object} opts [option参数]
     */
    initOptions:function(opts) {
        if (!opts) {
            return;
        }
        this.opts = opts;
        if (opts['symbol']) {
            this.setSymbol(opts['symbol']);
        }
        if (!Z.Util.isNil(opts['id'])) {
            this.setId(opts['id']);
        }
        if (opts['infoWindow']) {
            this.setInfoWindow(opts['infoWindow']);
        }
        if (opts['label']) {
            this.setLabel(opts['label']);
        }
        if (opts['properties']) {
            this.setProperties(opts['properties']);
        }
        if (opts['crs']) {
            //设置CRS
            //不需设置crs
        }
    },

    /**
     * 调用prepare时,layer已经注册到map上
     */
    prepare:function(layer) {
        this.rootPrepare(layer);
    },

    rootPrepare:function(layer) {
        //Geometry不允许被重复添加到多个图层上
        if (this.getLayer()) {
            throw new Error(this.exception['DUPLICATE_LAYER']);
        }
        //更新缓存
        this.updateCache();
        this.layer = layer;
        //如果投影发生改变,则清除掉所有的投影坐标属性
        this.clearProjection();
        this.painter = this.assignPainter();
    },

    /**
     * returns Geometry's ID
     * @return {Object} Geometry's id
     * @expose
     */
    getId:function() {
        return this.identifier;
    },

    /**
     * set ID
     * @param {Object} id set Geometry's id
     * @expose
     */
    setId:function(id) {
        var oldId = this.getId();
        this.identifier=id;
        this.fireEvent('_idchanged',{'target':this,'oldId':oldId,'newId':id});
        return this;
    },

    /**
     * 获取Geometry的Layer
     * @return {Layer} Geometry所属的Layer
     * @expose
     */
    getLayer:function() {
        if (!this.layer) {return null;}
        return this.layer;
    },

    /**
     * 获取Geometry所属的地图对象
     * @return {Map} 地图对象
     * @expose
     */
    getMap:function() {
        if (!this.layer) {return null;}
        return this.layer.getMap();
    },

    /**
     * 获取Geometry的类型
     * @return {int} Geometry的类型
     * @expose
     */
    getType:function() {
        return this.type;
    },

    /**
     * 是否是矢量图形
     * @return {Boolean} true|false
     * @expose
     */
    isVector:function() {
        return (Z.Geometry['TYPE_POINT'] !== this.type);
    },

    /**
     * 获取Geometry的Symbol
     * @return {Symbol} Geometry的Symbol
     * @expose
     */
    getSymbol:function() {
        if (!this.symbol) {
            return null;
        }
        return this.symbol;
    },

    /**
     * 设置Geometry的symbol
     * @param {Symbol} symbol 新的Symbol
     * @expose
     */
    setSymbol:function(symbol) {
        if (!symbol) {
            this.symbol = null;
        } else {
            //属性的变量名转化为驼峰风格
            var camelSymbol = Z.Util.convertFieldNameStyle(symbol,'camel');
            this.symbol = camelSymbol;
        }
        this.onSymbolChanged();
        return this;
    },

    /**
     * 计算Geometry的外接矩形范围
     * @return {Extent} [Geometry的外接矩形范围]
     * @expose
     */
    getExtent:function() {
        if (this.extent) {
            return this.extent;
        }
        return this.computeExtent(this.getProjection());
    },

    /**
     * 返回Geometry的像素长宽, 像素长宽只在当前比例尺上有效, 比例尺变化后, 其值也会发生变化
     * @return {Size}     Size.width, Size.height
     * @expose
     */
    getSize: function() {
        var map = this.getMap();
        if (!map) {
            return null;
        }
        var projection = this.getProjection();
        var extent = this.computeVisualExtent(projection);
        var xmin = extent['xmin'];
        var xmax = extent['xmax'];
        var ymin = extent['ymin'];
        var ymax = extent['ymax'];
        var topLeftPoint = new Z.Coordinate(xmin, ymax);
        var topRightPoint = new Z.Coordinate(xmax, ymax);
        var bottomLeftPoint = new Z.Coordinate(xmin, ymin);
        var width = map.computeDistance(topLeftPoint, topRightPoint);
        var height = map.computeDistance(topLeftPoint, bottomLeftPoint);
        var result = map.distanceToPixel(width, height);
        return {'width': result['px'], 'height': result['py']};
    },

    getPrjExtent:function() {
        var ext = this.getExtent();
        var p = this.getProjection();
        if (ext) {
            return new Z.Extent(p.project({x:ext['xmin'],y:ext['ymin']}), p.project({x:ext['xmax'],y:ext['ymax']}));
        } else {
            return null;
        }
    },

    /**
     * 计算图形的中心点坐标
     * @return {Coordinate} [中心点坐标]
     * @expose
     */
    getCenter:function() {
        return this.computeCenter(this.getProjection());
    },

    getDefaultSymbol:function() {
        return this.defaultSymbol;
    },

    /**
     * 获取Geometry的Properties
     * @return {Object} 自定义属性
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
        return this;
    },

    /**
     * 显示Geometry
     * @expose
     */
    show:function() {
        this.visible = true;
        if (this.painter) {
            this.painter.show();
        }
        return this;
    },

    /**
     * 隐藏Geometry
     * @expose
     */
    hide:function() {
        this.visible = false;
        if (this.painter) {
            this.painter.hide();
        }
        return this;
    },

    /**
     * 是否可见
     * @return {Boolean} true|false
     * @expose
     */
    isVisible:function() {
        if (Z.Util.isNil(this.visible)) {
            return true;
        }
        return this.visible;
    },

    /**
     * 克隆一个不在任何图层上的属性相同的Geometry,但不包含事件注册
     * @return {Geometry} 克隆的Geometry
     * @expose
     */
    copy:function() {
        var json = this.toJson();
        var ret = Z.Geometry.fromJson(json);
        return ret;
    },

    /**
     * 将自身从图层中移除
     * @return {[type]} [description]
     * @expose
     */
    remove:function() {
        var layer = this.getLayer();
        if (!layer) {
            return;
        }
        //label
        //contextmenu
        this.closeMenu();
        //infowindow
        this.closeInfoWindow();

        var painter = this.getPainter();
        if (painter) {
            painter.remove();
        }
        delete this.painter;

        layer.onGeometryRemove(this);
        delete this.layer;

        this.fireEvent('remove',{'target':this});

    },

    getInternalId:function() {
        return this.internalId;
    },

    /**
     * 只能被图层调用
     * @param {String} id [内部id]
     */
    setInternalId:function(id) {
        this.internalId = id;
    },


    getProjection:function() {
        var map = this.getMap();
        if (map) {
            return map.getProjection();
        }
        return Z.Projection.getDefault();
        // return null;
    },

    /**
     * 获取geometry样式中依赖的外部图片资源
     * @param  {[type]} geometry [description]
     * @return {[type]}          [description]
     */
    getExternalResource:function() {
        var geometry = this;
        var symbol = geometry.getSymbol();
        if (!symbol) {
            return null;
        }
        var icon = symbol['icon'];
        if (icon) {
            if (icon['type'] === 'picture') {
                return icon['url'];
            }
        }
        var fillSymbol = symbol['fillSymbol'];
        if (fillSymbol) {
            var fill = fillSymbol['fill'];
            if (fill && fill.length>7 && "url" ===fill.substring(0,3)) {
                return fill.substring(5,fill.length-2);
            }
        }
        return null;
    },

    getPainter:function() {
        return this.painter;
    },

    removePainter:function() {
        delete this.painter;
    },

    onZoomEnd:function() {
        if (this.painter) {
            this.painter.refresh();
        }
    },

    onShapeChanged:function() {
        var painter = this.getPainter();
        if (painter) {
            painter.refresh();
        }
        this.extent = null;
        if (!this.isEditing || !this.isEditing()) {
            this.fireEvent('shapechanged',{'target':this});
        }
    },

    onPositionChanged:function() {
        var painter = this.getPainter();
        if (painter) {
            painter.refresh();
        }
        this.extent = null;
        if (!this.isEditing || !this.isEditing()) {
            this.fireEvent('positionchanged',{'target':this});
        }
    },

    onSymbolChanged:function() {
        var painter = this.getPainter();
        if (painter) {
            painter.refreshSymbol();
        }
        this.fireEvent('symbolchanged',{'target':this});
    },

    fireEvent:function(eventName, param) {
        if (!param) {
            param = {};
        }
        param['target'] = this;
        this.fire(eventName,param);
    },

    //----------JSON相关方法-----------------
    /**
     * 生成JSON对象
     * @param  {Object} opts 输出配置
     * @return {Object}      JSON对象
     * @expose
     */
    toJson:function(opts) {
        if (!opts) {
            opts = {};
        }
        var jsonObject = {};
        if (opts['geometry'] === undefined || opts['geometry']) {
            jsonObject = this.exportJson(opts);
        }
        if (!jsonObject) {
            jsonObject = {};
        }
        //opts没有设定symbol或者设定的symbol值为true,则导出symbol
        if (opts['symbol'] === undefined || opts['symbol']) {
            var symbol = this.getSymbol();
            if (symbol) {
                jsonObject['symbol']=symbol;
            }
        }
        //opts没有设定properties或者设定的properties值为true,则导出properties
        if (opts['properties'] === undefined || opts['properties']) {
            var properties = this.getProperties();
            if (properties) {
                jsonObject['properties'] = properties;
            }
        }
        //TODO 临时代码待服务端relate接口不再需要空间坐标系后移除
        //jsonObject['spatialReference'] = {"coordinateType":"gcj02"};
        return jsonObject;
    },

    /**
     * 按照GeoJson规范生成GeoJson对象
     * @param  {[type]} opts 输出配置
     * @return {Object}      GeoJson对象
     */
    toGeoJson:function(opts) {
        if (!opts) {
            opts = {};
        }
        var feature = {
            'type':'Feature',
            'geometry':null
        };
        if (opts['geometry'] === undefined || opts['geometry']) {
            var geoJson = this.exportGeoJson(opts);
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
                properties['symbol']=symbol;
            }
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
    }

});