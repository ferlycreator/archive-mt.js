/**
 * 抽象类, 允许叠加Geometry的图层的共同父类
 * @type {Z.OverlayLayer}
 */
Z.OverlayLayer=Z.Layer.extend({
    //根据不同的语言定义不同的错误信息
    'exceptionDefs':{
        'en-US':{
            'DUPLICATE_GEOMETRY_ID':'Duplicate ID for the geometry'
        },
        'zh-CN':{
            'DUPLICATE_GEOMETRY_ID':'重复的Geometry ID'
        }
    },

    /**
     * 通过geometry的id取得Geometry
     * @param  {[String|Integer]} id [Geometry的id]
     * @return {[Geometry]}    [Geometry]
     * @export
     */
    getGeometryById:function(id) {
        if (Z.Util.isNil(id) || id === '') {
            return null;
        }
        if (!this._geoMap[id]) {
            //避免出现undefined
            return null;
        }
        return this._geoMap[id];
    },

    /**
     * 返回图层上所有的Geometry
     * @return {Array} [Geometry数组]
     * @export
     */
    getAllGeometries:function() {
        var cache = this._geoCache;
        var result = [];
        for (var p in cache) {
            if (cache.hasOwnProperty(p)) {
                result.push(cache[p]);
            }
        }
        return result;
    },

    /**
     * 向图层中添加geometry
     * @param {Geometry|[Geometry]} geometries 添加的geometry
     * @param {[type]} fitView    添加后是否聚焦到geometry上
     * @export
     */
    addGeometry:function(geometries,fitView) {
        if (!geometries) {return;}
        if (!Z.Util.isArray(geometries)) {
            this.addGeometry([geometries],fitView);
            return;
        }
        var fitCounter = 0;
        var centerSum = {x:0,y:0};
        var extent = null;
        for (var i=0, len=geometries.length;i<len;i++) {
            var geo = geometries[i];
            if (!geo) {continue;}
            
            var geoId = geo.getId();
            if (geoId) {
                if (!Z.Util.isNil(this._geoMap[geoId])) {
                    throw new Error(this.exceptions['DUPLICATE_GEOMETRY_ID']+':'+geoId);
                }
                this._geoMap[geoId] = geo;
            }
            var internalId = Z.Util.GUID();
            //内部全局唯一的id
            geo.setInternalId(internalId);
            this._geoCache[internalId] = geo;
            geo.prepare(this);
            if (fitView) {
                var geoCenter = geo.getCenter();
                var geoExtent = geo.getExtent();
                if (geoCenter && geoExtent) {                    
                    centerSum.x += geoCenter.x;
                    centerSum.y += geoCenter.y;
                    extent = Z.Extent.combine(extent,geoExtent);
                    fitCounter++;
                }
            }
        }
        var map = this.getMap();
        if (map) {
            this.paintGeometries(geometries);
            if (fitView) {
                var z = map.getFitZoomLevel(extent);
                var center = {x:centerSum.x/fitCounter, y:centerSum.y/fitCounter};
                map.setCenterAndZoom(center,z);
            }
        }
        return this;
    },

    /**
     * 遍历geometry
     * @param  {Function} fn 回调函数
     */
    eachGeometry:function(fn,obj) {
        var cache = this._geoCache;
        if (!obj) {
            obj=this;
        }
        for (var g in cache) {
            if (cache.hasOwnProperty(g)) {
                fn.call(obj,cache[g]);
            }
        }
    },

    /**
     * 从图层上移除Geometry
     * @param  {Geometry} geometry 要移除的Geometry
     * @export
     */
    removeGeometry:function(geometry) {
        if (!(geometry instanceof Z.Geometry)) {
            geometry = this.getGeometryById(geometry);
        }
        if (!geometry) {return;}
        if (this != geometry.getLayer()) {
            return;
        }
        geometry.remove();
        return this;
    },

    /**
     * clear all geometries in this layer
     * @export
     */
    clear:function() {
        this.eachGeometry(function(geo) {
            geo.remove();
        });
        this._geoMap={};
        this._geoCache={};
        return this;
    },

    /**
     * 当geometry被移除时触发
     * @param  {[type]} geometry [description]
     * @return {[type]}          [description]
     */
    onGeometryRemove:function(geometry) {
        if (!geometry) {return;}
        //考察geometry是否属于该图层
        if (this != geometry.getLayer()) {
            return;
        }
        var internalId = geometry.getInternalId();
        if (Z.Util.isNil(internalId)) {
            return;
        }
        var geoId = geometry.getId();
        if (!Z.Util.isNil(geoId)) {
            delete this._geoMap[geoId];
        }
        delete this._geoCache[internalId];
    }, 

    onRemove:function() {
        this.clear();       
        delete this.map;
    },

    getGeoCache:function() {
        return this._geoCache;
    }
});

Z.OverlayLayer.addInitHook(function() {
    this._geoCache={};
    this._geoMap={};
    this._resources={};
});