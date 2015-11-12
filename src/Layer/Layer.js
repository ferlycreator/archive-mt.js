/**
 * 所有图层的基类
 * 供Map调用的图层方法有:
 * @class maptalks.Layer
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z['Layer']=Z.Layer=Z.Class.extend({

    includes: Z.Eventable,


    options:{
        //最大最小可视范围, -1表示不受限制
        'minZoomLevel':-1,
        'maxZoomLevel':-1,
        //图层是否可见
        'visible':true
    },


    _prepare:function(map,zIndex) {
        if (!map) {return;}
        this.map = map;
        this.setZIndex(zIndex);
    },

    /**
     * 将图层加到地图上
     * @param {Map} map 地图
     */
    addTo:function(map) {
        map.addLayer(this);
        return this;
    },

    /**
     * 设置图层z-index叠加顺序
     * @param {Number} zIndex 叠加顺序
     */
    setZIndex:function(zIndex) {
        this._zIndex = zIndex;
        var layerList = this._getLayerList();
        layerList.sort(function(a,b) {
            return a.getZIndex()-b.getZIndex();
        });
        if (this._render) {
            this._render.setZIndex(zIndex);
        }
        return this;
    },

    getZIndex:function() {
        return this._zIndex;
    },

    /**
     * 获取图层id
     * @returns
     * @expose
     */
    getId:function() {
        return this._identifier;
    },

    /**
     * 设置图层id
     * @param {String} [id] [图层id]
     * @expose
     */
    setId:function(id) {
        this._identifier = id;
    },

    /**
     * 获取图层所属的地图对象
     * @expose
     * @returns {seegoo.maps.Map}
     */
    getMap:function() {
        if (this.map) {
            return this.map;
        }
        return null;
    },


    /**
     * 获取图层的Extent
     * @return {Extent} 图层的Extent
     */
    getExtent:function() {
        if (!this.extent) {return null;}
        return this.extent;
    },

    /**
     * 将图层置顶
     * @expose
     */
    bringToFront:function() {
        var layers = this._getLayerList();
        var max = layers[0].getZIndex();
        for (var i=1, len=layers.length;i<len;i++) {
            var z = layers[i].getZIndex();
            if (z > max) {
                max = z;
            }
        }
        this.setZIndex(max+1);
    },

    /**
     * 将图层置底
     * @expose
     */
    bringToBack:function(){
        var layers = this._getLayerList();
        var min = layers[0].getZIndex();
        for (var i=1, len=layers.length;i<len;i++) {
            var z = layers[i].getZIndex();
            if (z < min) {
                min = z;
            }
        }
        this.setZIndex(min-1);
    },

    /**
     * 显示图层
     */
    show:function() {
        if (!this.options['visible']) {
            if (this._getRender()) {
                this._getRender().show();
            }
            this.options['visible'] = true;
        }
        return this;
    },

    /**
     * 隐藏图层
     */
    hide:function() {
        if (this.options['visible']) {
            if (this._getRender()) {
                this._getRender().hide();
            }
            this.options['visible'] = false;
        }
        return this;
    },

    /**
     * 瓦片图层是否可见
     * @return {Boolean} true/false
     */
    isVisible:function() {
        return this.options['visible'];
    },

    remove:function() {
        if (this._getRender()) {
            this._getRender().remove();
        }
        delete this._render;
    },

    _getRender:function() {
        return this._render;
    },

    /**
     * 获取图层在图层列表中的index
     * @param layers
     * @returns {Number}
     */
    _getLayerIndexOfList:function(layers) {
        if (!layers) {return -1;}
        var hit = -1;
        for (var i =0, len=layers.length;i<len;i++) {
            if (layers[i] == this) {
                hit = i;
                break;
            }
        }
        return hit;
    },

    /**
     * 获取该图层所属的list
     */
    _getLayerList:function() {
        if (!this.map) {return null;}
        if (this instanceof Z.VectorLayer) {
            if (this.isCanvasRender()) {
                return this.map._canvasLayers;
            } else {
                return this.map._svgLayers;
            }
        } else if (this instanceof Z.DynamicLayer) {
            return this.map._dynLayers;
        } else if (this instanceof Z.TileLayer) {
            return this.map._tileLayers;
        } else if (this instanceof Z.HeatLayer) {
            return this.map._heatLayers;
        }
        return null;
    }
});
