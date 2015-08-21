Z['GeometryCollection'] = Z.GeometryCollection = Z.Geometry.extend({
    type:Z.Geometry['TYPE_GEOMETRYCOLLECTION'],

    initialize:function(geometries, opts) {       
        this.setGeometries(geometries);
        this.initOptions(opts);
    },

    /**
     * prepare this geometry collection
     * @param  {Z.Layer} layer [description]
     * @return {[type]}       [description]
     * @override
     */
    prepare:function(layer) {
        this.rootPrepare(layer);
        this._prepareGeometries();
    },

    /**
     * prepare the geometries, 在geometries发生改变时调用
     * @return {[type]} [description]
     */
    _prepareGeometries:function() {
        var layer = this.getLayer();
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            this.geometries[i].prepare(layer);
        }
    },

    /**
     * 设置
     * @param {[Geometry]} geometries [Geometry数组]
     * @expose
     *
     */
    setGeometries:function(geometries) {
        this.checkGeometries(geometries);
        this.geometries = geometries;
        if (!this.getLayer()) {
            return;
        }
        this._prepareGeometries();
        this.onShapeChanged();
        return this;
    },

    /**
     * 获取集合中的Geometries
     * @return {[Geometry]} Geometry数组
     * @expose
     */
    getGeometries:function() {
        if (!this.geometries && !Z.Util.isArray(this.geometries)) {
            return [];
        }
        return this.geometries;
    },

    /**
     * 供GeometryCollection的子类调用, 检查geometries是否符合规则
     * @param  {Geometry[]} geometries [供检查的Geometry]
     */
    checkGeometries:function(geometries) {

    },

    /**
     * 集合是否为空
     * @return {Boolean} [是否为空]
     * @expose
     */
    isEmpty:function() {
        return !Z.Util.isArrayHasData(this.geometries);
    },

    updateCache:function() {
        for (var i=0, len=this.geometries.length;i<len;i++) {
            if (this.geometries[i] && this.geometries[i].updateCache) {
                this.geometries[i].updateCache();
            }
        }
    },

    computeCenter:function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var sumX=0, sumY=0,counter=0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            if (!this.geometries[i]) {
                continue;
            }
            var center = this.geometries[i].computeCenter(projection);
            sumX += center.x;
            sumY += center.y;
            counter++;
        }
        return new Z.Coordinate(sumX/counter, sumY/counter);
    },

    computeExtent:function(projection) {
        if (!projection || this.isEmpty()) {
            return null;
        }
        var result = null;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result = Z.Extent.combine(this.geometries[i].computeExtent(projection),result);
        }
        return result;
    },

    computeGeodesicLength:function(projection) {
        if (!projection || this.isEmpty()) {
            return 0;
        }
        var result = 0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result += this.geometries[i].computeGeodesicLength(projection);
        }
        return result;
    },

    computeGeodesicArea:function(projection) {
        if (!projection || this.isEmpty()) {
            return 0;
        }
        var result = 0;
        for (var i=0, len=this.geometries.length;i<len;i++) {
            result += this.geometries[i].computeGeodesicArea(projection);
        }
        return result;
    },


    assignPainter:function() {
        return new Z.GeometryCollection.Painter(this);
    },

   exportGeoJson:function(opts) {
        var geoJsons = [];
        var geometries = this.getGeometries();
        if (Z.Util.isArray(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                geoJsons.push(geometries[i].exportGeoJson(opts));
            }
        }
        return {
            'type':         'GeometryCollection',
            'geometries':   geoJsons
        };
    },

    clearProjection:function() {
        var geometries = this.getGeometries();
        if (Z.Util.isArrayHasData(geometries)) {
            for (var i=0,len=geometries.length;i<len;i++) {
                this.geometries[i].clearProjection();
            }
        }
    },

//----------覆盖Geometry中的编辑相关方法-----------------

    /**
     * 开始编辑
     * @expose
     */
    startEdit:function(opts) {
        if (opts['symbol']) {
            this.originalSymbol = this.getSymbol();
            this.setSymbol(opts['symbol']);
        }
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].startEdit(opts);
        }
        this.editing = true;
        return this;
    },

    /**
     * 停止编辑
     * @expose
     */
    endEdit:function() {
        var geometries = this.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            geometries[i].endEdit();
        }
        if (this.originalSymbol !== undefined) {
            this.setSymbol(this.originalSymbol);
            delete this.originalSymbol;
        }
        this.editing = false;
        return this;
    },

    /**
     * 是否处于编辑状态
     * @return {Boolean} [是否处于编辑状态]
     * @expose
     */
    isEditing:function() {
        return this.editing;
    },

    /**
     * 开始拖拽
     * @expose
     */
    startDrag:function() {
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