Z.Geometry.include({
    /**
     * 生成事件参数
     * @param  {Event} event 事件对象
     */
    _onEvent: function(event) {
        //还没加载到地图上时, 不处理事件
        if (!this.getMap()) {
            return;
        }
        //map抛过来的事件中有originEvent, 而dom直接抛的没有
        var originalEvent = event;
        var eventType = originalEvent.type;
        var eventFired = eventType;
        //TODO 未来需要加入touch事件
        /*if (eventFired !== 'mousedown' && eventFired !== 'mouseup' || e) {
            //只有mousedown和mouseup事件允许继续传递, 以让map能够拖动
            Z.DomUtil.stopPropagation(originalEvent);
        }*/
        //事件改名
        if ('click' === eventFired || 'mousedown' === eventFired) {
            var button = originalEvent.button;
            if (button === 2) {
                eventFired = 'contextmenu';
            }
        }
        if ('contextmenu' === eventFired && this.hasListeners('contextmenu')) {
            Z.DomUtil.stopPropagation(originalEvent);
            Z.DomUtil.preventDefault(originalEvent);
        }
        var params = this._getEventParams(originalEvent, eventFired);
        this._fireEvent(eventFired, params);
    },

    /**
     * 生成事件参数
     * @param  {Event} event 事件对象
     * @return {Object} 事件返回参数
     */
    _getEventParams: function(e,type) {
        var map = this.getMap();
        var eventParam = {
            'domEvent':e
        };
        var actual = e.touches ? e.touches[0] : e;
        if (actual) {
            var containerPoint = Z.DomUtil.getEventContainerPoint(actual, map._containerDOM);
            eventParam['coordinate'] = map.containerPointToCoordinate(containerPoint);
            eventParam['containerPoint'] = containerPoint;
            /*'viewPoint':this._containerPointToViewPoint(containerPoint),*/
        }

        //统一的参数, target是geometry引用, pixel是事件的屏幕坐标, coordinate是事件的经纬度坐标
        return eventParam;
    },

    _onMouseOver: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event;
        var params = this._getEventParams(originalEvent,event.type);
        /**
         * 触发geometry的mouseover事件
         * @member maptalks.Geometry
         * @event mouseover
         * @return {Object} params: {'target':this, 'pixel':pixel, 'coordinate':coordinate}
         */
        this._fireEvent(event.type, params);
    },

    _onMouseOut: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event;
        var params = this._getEventParams(originalEvent,event.type);
        /**
         * 触发geometry的mouseout事件
         * @member maptalks.Geometry
         * @event mouseout
         * @return {Object} params: {'target':this, 'pixel':pixel, 'coordinate':coordinate}
         */
        this._fireEvent(event.type, params);
    }
});
