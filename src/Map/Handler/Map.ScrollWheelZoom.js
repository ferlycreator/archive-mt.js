
Z.Map.mergeOptions({
	'scrollWheelZoom': true,
	'wheelDebounceTime': 40
});

Z.Map.ScrollWheelZoom = Z.Handler.extend({
	addHooks: function () {
        var map = this.map;
		var _containerDOM = map._containerDOM;
		// if(document.addEventListener){
			Z.DomUtil.addDomEvent(_containerDOM, 'mousewheel', this._onWheelScroll, this);
		// }
	},

	removeHooks: function () {
		var map = this.map;
		var _containerDOM = map._containerDOM;
		Z.DomUtil.removeDomEvent(_containerDOM, 'mousewheel', this._onWheelScroll);
	},

	_onWheelScroll: function (evt) {
		// var wheelExecutor = null;
        var map = this.map;
		var _containerDOM = map._containerDOM;
		// if (!map.mouseTool) {return;}
		if (map.zooming) {return;}
		// if (!evt) {evt = window.event;}

		var _levelValue = 0;
		_levelValue += (evt.wheelDelta?evt.wheelDelta:evt.detail) > 0 ? 1 : -1;
		if (evt.detail) {
			_levelValue *= -1;
		}
		var mouseOffset = Z.DomUtil.getEventDomCoordinate(evt, _containerDOM);
		if (this.wheelExecutor) {
			clearTimeout(this.wheelExecutor);
		}
		this.wheelExecutor = setTimeout(function () {
			map._zoom(map._zoomLevel + _levelValue, mouseOffset);
		},40);

		return false;
	}
});

Z.Map.addInitHook('addHandler', 'scrollWheelZoom', Z.Map.ScrollWheelZoom);
