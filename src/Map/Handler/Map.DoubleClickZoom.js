Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [doubleClickZoom="true"] 双击放大地图
     * @member maptalks.Map
     */
    'doubleClickZoom': true
});

Z.Map.DoubleClickZoom = Z.Handler.extend({
    addHooks: function () {
        this.map.on('_dblclick', this._onDoubleClick, this);
    },

    removeHooks: function () {
        this.map.off('_dblclick', this._onDoubleClick, this);
    },

    _onDoubleClick: function (param) {

        if(this.map['doubleClickZoom']) {
            var oldZoom = this.map.getZoomLevel(),
                zoom = param['domEvent']['shiftKey'] ? Math.ceil(oldZoom) - 1 : Math.floor(oldZoom) + 1;
            this.map._zoom(zoom, param['containerPoint']);
        }
    }
});

Z.Map.addInitHook('addHandler', 'doubleClickZoom', Z.Map.DoubleClickZoom);
