Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [doubleClickZoom="true"] 双击放大地图
     * @member maptalks.Map
     */
	'doubleClickZoom': true
});

Z.Map.DoubleClickZoom = Z.Handler.extend({
	addHooks: function () {
		this.map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this.map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		if(this.map['doubleClickZoom']) {
			var oldZoom = this.map.getZoomLevel(),
				zoom = e['originalEvent']['shiftKey'] ? Math.ceil(oldZoom) - 1 : Math.floor(oldZoom) + 1;
			var mouseOffset = Z.DomUtil.getEventDomCoordinate(e, this.map._containerDOM);
			this.map._zoom(zoom, mouseOffset);
		}
	}
});

Z.Map.addInitHook('addHandler', 'doubleClickZoom', Z.Map.DoubleClickZoom);