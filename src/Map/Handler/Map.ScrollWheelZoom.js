Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [scrollWheelZoom="true"] 滚轮放大缩小地图功能
     * @member maptalks.Map
     */
    'scrollWheelZoom': true
});

Z.Map.ScrollWheelZoom = Z.Handler.extend({
    addHooks: function () {
        var map = this.target;
        var _containerDOM = map._containerDOM;
        Z.DomUtil.addDomEvent(_containerDOM, 'mousewheel', this._onWheelScroll, this);
    },

    removeHooks: function () {
        var map = this.target;
        var _containerDOM = map._containerDOM;
        Z.DomUtil.removeDomEvent(_containerDOM, 'mousewheel', this._onWheelScroll);
    },

    _onWheelScroll: function (evt) {
        var map = this.target;
        var _containerDOM = map._containerDOM;
        if (map._zooming) {return;}
        Z.DomUtil.preventDefault(evt);
        Z.DomUtil.stopPropagation(evt);
        var _levelValue = 0;
        _levelValue += (evt.wheelDelta?evt.wheelDelta:evt.detail) > 0 ? 1 : -1;
        if (evt.detail) {
            _levelValue *= -1;
        }
        var mouseOffset = Z.DomUtil.getEventContainerPoint(evt, _containerDOM);
        if (this.wheelExecutor) {
            clearTimeout(this.wheelExecutor);
        }
        this.wheelExecutor = setTimeout(function () {
            map._zoom(map.getZoom() + _levelValue, mouseOffset);
        },40);

        return false;
    }
});

Z.Map.addInitHook('addHandler', 'scrollWheelZoom', Z.Map.ScrollWheelZoom);
