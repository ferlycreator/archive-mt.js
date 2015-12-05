Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [touchZoom="true"] 滚轮放大缩小地图功能
     * @member maptalks.Map
     */
    'touchZoom': true
});

Z.Map.TouchZoom = Z.Handler.extend({
    addHooks: function () {
        Z.DomUtil.addDomEvent(this.target._containerDOM, 'touchstart', this._onTouchStart, this);
    },

    removeHooks: function () {
        Z.DomUtil.removeDomEvent(this.target._containerDOM, 'touchstart', this._onTouchStart);
    },

    _onTouchStart:function(event) {

    }
});


Z.Map.addInitHook('addHandler', 'touchZoom', Z.Map.TouchZoom);
