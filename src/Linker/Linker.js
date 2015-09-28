/**
 * 连接器类
 * @class maptalks.Linker
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z.Linker = Z.Class.extend({
    /**
     * @constructor
     * @param {Object} options 连接配置及其它设置
        options: {
            linkSource:source,
            linkTarget:target,
            symbol:symbol,
            trigger:'manual'//'moving','click','hover'
        }
     * @returns {maptalks.Linker}
     */
    initialize: function (options) {
        if(!options) return;
        this.setOptions(options);
        this._linkSource = options['linkSource'];
        this._linkTarget = options['linkTarget'];
        return this;
    },

    /**
     * 将连接线添加到指定的map上
     * @param {maptalks.Map} map对象
     * @returns {maptalks.Linker}
     * @expose
     */
    addTo: function (map) {
        this.remove();
        this._map = map;
        this._internalLayer = this._getInternalLayer(map, Z.internalLayerPrefix+'linker');
        var linkPoints = this._computeLinkPoint();
        this._linker  = new Z.Polyline(linkPoints);
        var symbol = this.options['symbol'];
        if(symbol) {
            this._linker.setSymbol(symbol);
        }
        this._internalLayer.addGeometry(this._linker);
        this._registEvents();
        return this;
    },

    /**
     * 设置连接器配置项
     * @param {Object} options
     * @expose
     */
    setOptions: function(options) {
        Z.Util.setOptions(this, options);
        return this;
    },

    /**
     * 获取连接器配置项
     * @return {Object} options
     * @expose
     */
    getOptions: function() {
        return this.options;
    },

    /**
     * 显示连接线
     * @expose
     */
    show: function() {
        this._linker.show();
    },

    /**
     * 隐藏连接线
     * @expose
     */
    hide: function() {
        this._linker.hide();
    },

    /**
     * 删除连接线
     * @expose
     */
    remove: function () {
        if (!this._map) {
            return this;
        }
        if(!this._linker) {
            this._linker.remove();
        }
        this._map.off('zoomend resize moving', this._changeLinkPath, this);
        this._linkSource.off('positionchanged', this._changeLinkPath, this)
                        .off('remove', this.remove, this);
        this._linkTarget.off('positionchanged', this._changeLinkPath, this)
                        .off('remove', this.remove, this);
        delete this;
    },

    _registEvents: function() {
        var me = this;
        this._map.on('zoomend resize moving', this._changeLinkPath, this);
        this._linkSource.on('positionchanged', this._changeLinkPath, this)
                        .on('remove', this.remove, this);
        this._linkTarget.on('positionchanged', this._changeLinkPath, this)
                        .on('remove', this.remove, this);
        var trigger = this.options['trigger'];
        me._linker.hide();
        if ('moving' === trigger) {
            this._linkSource.on('dragstart', function(){
                me._linker.show();
            }).on('dragend', function(){
                me._linker.hide();
            });
            this._linkTarget.on('dragstart', function(){
                me._linker.show();
            }).on('dragend', function(){
                me._linker.hide();
            });
        } else if ('click' === trigger) {
            this._linkSource.on('mousedown', function(){
                me._linker.show();
            }).on('mouseup', function(){
                me._linker.hide();
            });
            this._linkTarget.on('mousedown', function(){
                me._linker.show();
            }).on('mouseup', function(){
                me._linker.hide();
            });
        } else if ('hover' === trigger) {
            this._linkSource.on('mouseover', function(){
                me._linker.show();
            }).on('mouseout', function(){
                me._linker.hide();
            });
            this._linkTarget.on('mouseover', function(){
                me._linker.show();
            }).on('mouseout', function(){
                me._linker.hide();
            });
        } else {
            me._linker.show();
        }
    },

    _changeLinkPath: function() {
        var linkPoints = this._computeLinkPoint();
        this._linker.setCoordinates(linkPoints);
    },

    _computeLinkPoint: function() {
        var sourceVertexs = this._linkSource.getVertexs();
        var targetVertexs = this._linkTarget.getVertexs();
        var lastDistance = 0;
        var nearestSourcePoint,nearestTargetPoint;
        for(var i=0,len=sourceVertexs.length;i<len;i++) {
            var sourceVertex = sourceVertexs[i];
            for(var j=0,length=targetVertexs.length;j<length;j++) {
                var targetVertex = targetVertexs[j];
                var distance = this._map.computeDistance(sourceVertex, targetVertex);
                if(i===0&&j===0) {
                    nearestSourcePoint = sourceVertex;
                    nearestTargetPoint = targetVertex;
                    lastDistance = distance;
                } else {
                    if(distance < lastDistance) {
                        nearestSourcePoint = sourceVertex;
                        nearestTargetPoint = targetVertex;
                    }
                }
            }
        }
        return [nearestSourcePoint,nearestTargetPoint];
    },

    _getInternalLayer: function(map, layerId, canvas) {
         if(!map) {return;}
         var layer = map.getLayer(layerId);
         if(!layer) {
             if(canvas) {
                 layer = new Z.VectorLayer(layerId,{'render':'canvas'});
             } else {
                 layer = new Z.VectorLayer(layerId);
             }
             map.addLayer(layer);
         }
         return layer;
     }
});