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
        if (this.map) {
            var layerList = this._getLayerList();
            this.map._sortLayersZ(layerList);
        }
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
        return this._id;
    },

    /**
     * 设置图层id
     * @param {String} [id] [图层id]
     * @expose
     */
    setId:function(id) {
        //TODO 设置id可能造成map无法找到layer
        this._id = id;
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
        if (!layers) {
            return this;
        }
        var topLayer = layers[layers.length-1];
        if (layers.length === 1 || topLayer === this) {
            return this;
        }
        var max = topLayer.getZIndex();
        this.setZIndex(max+1);
        return this;
    },

    /**
     * 将图层置底
     * @expose
     */
    bringToBack:function(){
        var layers = this._getLayerList();
        if (!layers) {
            return this;
        }
        var bottomLayer = layers[0];
        if (layers.length === 1 || bottomLayer === this) {
            return this;
        }
        var min = bottomLayer.getZIndex();
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

     _prepare:function(map,zIndex) {
        if (!map) {return;}
        this.map = map;
        this.setZIndex(zIndex);
    },

    _getRender:function() {
        return this._render;
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
        } else if (this instanceof Z.HeatmapLayer) {
            return this.map._heatLayers;
        }
        return null;
    }
});
