Z['GeometryCollection'] = Z.GeometryCollection = Z.Geometry.extend({
    type:Z.Geometry['TYPE_GEOMETRYCOLLECTION'],

    //根据不同的语言定义不同的错误信息
    exceptionDefs:{
        'en-US':{
            'INVALID_GEOMETRY':'invalid geometry for collection.'
        },
        'zh-CN':{
            'INVALID_GEOMETRY':'无效的Geometry被加入到collection中.'
        }
    },

    initialize:function(geometries, opts) {
        this.setGeometries(geometries);
        this._initOptions(opts);
    },

    /**
     * 设置
     * @param {[Geometry]} geometries [Geometry数组]
     * @expose
     *
     */
    setGeometries:function(_geometries) {
        var geometries = this._checkGeometries(_geometries);
        this._geometries = geometries;
        if (this.getLayer()) {
            this._prepareGeometries();
            this._onShapeChanged();
        }
        return this;
    },

    /**
     * 获取集合中的Geometries
     * @return {[Geometry]} Geometry数组
     * @expose
     */
    getGeometries:function() {
        if (!this._geometries) {
            return [];
        }
        return this._geometries;
    },


    /**
     * 集合是否为空
     * @return {Boolean} [是否为空]
     * @expose
     */
    isEmpty:function() {
        return !Z.Util.isArrayHasData(this.getGeometries());
    },

    remove:function() {
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            this._geometries[i]._rootRemove(false);
        }
        this._rootRemove(true);
    },

    /**
     * _prepare this geometry collection
     * @param  {Z.Layer} layer [description]
     * @return {[type]}       [description]
     * @override
     */
    _prepare:function(layer) {
        this._rootPrepare(layer);
        this._prepareGeometries();
    },

    /**
     * _prepare the geometries, 在geometries发生改变时调用
     * @return {[type]} [description]
     */
    _prepareGeometries:function() {
        var layer = this.getLayer();
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            this._geometries[i]._prepare(layer);
        }
    },

    /**
     * 供GeometryCollection的子类调用, 检查geometries是否符合规则
     * @param  {Geometry[]} geometries [供检查的Geometry]
     */
    _checkGeometries:function(geometries) {
        if (geometries && !Z.Util.isArray(geometries)) {
            if (geometries instanceof Z.Geometry) {
                return [geometries];
            } else {
                throw new Error(this.exceptions['INVALID_GEOMETRY']);
            }
        } else if (Z.Util.isArray(geometries)) {
            for (var i=0, len=geometries.length;i<len;i++) {
                if (    geometries instanceof Z.Geometry) {
                   throw new Error(this.exceptions['INVALID_GEOMETRY']);
                }
            }
            return geometries;
        }
        return null;
    },



    _updateCache:function() {
        delete this._extent;
        if (this.isEmpty()) {
            return;
        }
        for (var i=0, len=this._geometries.length;i<len;i++) {
            if (this._geometries[i] && this._geometries[i]._updateCache) {
                this._geometries[i]._updateCache();
            }
        }
    },

    _computeCenter:function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var sumX=0, sumY=0,counter=0;
        var geometries = this.getGeometries();
        for (var i=0, len=geometries.length;i<len;i++) {
            if (!geometries[i]) {
                continue;
            }
            var center = geometries[i]._computeCenter(projection);
            sumX += center.x;
            sumY += center.y;
            counter++;
        }
        return new Z.Coordinate(sumX/counter, sumY/counter);
    },

    _containsPoint: function(point) {
        if (this.isEmpty()) {
            return false;
        }
        var i, len, geo;
        var geometries = this.getGeometries();
        for (i = 0, len = geometries.length; i < len; i++) {
            geo = geometries[i];
            if (geo._containsPoint(point)) {
                return true;
            }
        }

        return false;
    },

    _computeExtent:function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var geometries = this.getGeometries();
        var result = null;
        for (var i=0, len=geometries.length;i<len;i++) {
            result = Z.Extent.combine(geometries[i]._computeExtent(projection),result);
        }
        return result;
    },



    _computeGeodesicLength:function(projection) {
        if (!projection || this.isEmpty()) {
            return 0;
        }
        var geometries = this.getGeometries();
        var result = 0;
        for (var i=0, len=geometries.length;i<len;i++) {
            result += geometries[i]._computeGeodesicLength(projection);
        }
        return result;
    },

    _computeGeodesicArea:function(projection) {
        if (!projection || this.isEmpty()) {
            return 0;
        }
        var geometries = this.getGeometries();
        var result = 0;
        for (var i=0, len=geometries.length;i<len;i++) {
            result += geometries[i]._computeGeodesicArea(projection);
        }
        return result;
    },


    _assignPainter:function() {
        return new Z.GeometryCollection.Painter(this);
    },

   _exportGeoJson:function(opts) {
        var geoJsons = [];
        if (!this.isEmpty()) {
            var geometries = this.getGeometries();
            for (var i=0,len=geometries.length;i<len;i++) {
                geoJsons.push(geometries[i]._exportGeoJson(opts));
            }
        }
        return {
            'type':         'GeometryCollection',
            'geometries':   geoJsons
        };
    },

    _clearProjection:function() {
        if (this.isEmpty()) {
            return;
        }
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            this._geometries[i]._clearProjection();
        }

    },

//----------覆盖Geometry中的编辑相关方法-----------------

    /**
     * 开始编辑
     * @expose
     */
    startEdit:function(opts) {
        if (this.isEmpty()) {
            return;
        }
        if (opts['symbol']) {
            this.originalSymbol = this.getSymbol();
            this.setSymbol(opts['symbol']);
        }
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].startEdit(opts);
        }
        this._editing = true;
        return this;
    },

    /**
     * 停止编辑
     * @expose
     */
    endEdit:function() {
        if (this.isEmpty()) {
            return;
        }
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].endEdit();
        }
        if (this.originalSymbol) {
            this.setSymbol(this.originalSymbol);
            delete this.originalSymbol;
        }
        this._editing = false;
        return this;
    },

    /**
     * 是否处于编辑状态
     * @return {Boolean} [是否处于编辑状态]
     * @expose
     */
    isEditing:function() {
        return this._editing;
    },

    /**
     * 开始拖拽
     * @expose
     */
    startDrag:function() {
        if (this.isEmpty()) {
            return;
        }
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].startDrag();
        }
        this.dragging = true;
        return this;
    },

    /**
     * 停止拖拽
     * @expose
     */
    endDrag:function() {
        if (this.isEmpty()) {
            return;
        }
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].endDrag();
        }
        this.dragging = false;
        return this;
    },

    /**
     * 是否处于拖拽状态
     * @return {Boolean} [是否处于拖拽状态]
     * @expose
     */
    isDragging:function() {
        return this.dragging;
    }
});
