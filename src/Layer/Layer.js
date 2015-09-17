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

    events:{
        LAYER_LOADED:'layerloaded'
    },


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
        this._setZIndex(zIndex+this.baseZIndex);
/*        if (Z.Util.isNil(this._visible)) {
            this._visible = true;
        }*/
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
        var hit=this._getLayerIndexOfList(layers);
        if (hit === layers.length-1) {return;}
        if (hit >= 0) {
            layers.splice(hit,1);
            layers.push(this);
        }
        for (var i=0, len=layers.length;i<len;i++) {
            layers[i]._setZIndex(layers[i].baseZIndex+i);
        }
    },

    /**
     * 将图层置底
     * @expose
     */
    bringToBack:function(){
        var layers = this._getLayerList();
        var hit=this._getLayerIndexOfList(layers);
        if (hit === 0) {
            return;
        }
        if (hit > 0) {
            layers.splice(hit,1);
            layers.push(this);
        }
        for (var i=0, len=layers.length;i<len;i++) {
            layers[i]._setZIndex(layers[i].baseZIndex+i);
        }
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
        } else if (this instanceof Z.Render.Canvas.Base) {
            return this.map._canvasLayers;
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
