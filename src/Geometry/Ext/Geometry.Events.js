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
        //事件改名
        if (eventFired === 'contextmenu') {
            eventFired = 'rightclick';
        } else if (eventFired === 'click') {
            var button = originalEvent.button;
            if (button === 2) {
                eventFired = 'rightclick';
            }
        }
        var params = this._getEventParams(originalEvent, eventFired);
        this._fireEvent(eventFired, params);
    },

    /**
     * 生成事件参数
     * @param  {Event} event 事件对象
     * @return {Object} 事件返回参数
     */
    _getEventParams: function(event,type) {
        var map = this.getMap();
        var containerPoint = Z.DomUtil.getEventContainerPoint(event, map._containerDOM);
        var coordinate = map._untransform(containerPoint);
        //统一的参数, target是geometry引用, pixel是事件的屏幕坐标, coordinate是事件的经纬度坐标
        return { 'containerPoint':containerPoint, 'coordinate':coordinate,'domEvent':event};
    },

    _onMouseOver: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event;
        var params = this._getEventParams(originalEvent,'mouseover');
        /**
         * 触发geometry的mouseover事件
         * @member maptalks.Geometry
         * @event mouseover
         * @return {Object} params: {'target':this, 'pixel':pixel, 'coordinate':coordinate}
         */
        this._fireEvent('mouseover', params);
    },

    _onMouseOut: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event;
        var params = this._getEventParams(originalEvent,'mouseout');
        /**
         * 触发geometry的mouseout事件
         * @member maptalks.Geometry
         * @event mouseout
         * @return {Object} params: {'target':this, 'pixel':pixel, 'coordinate':coordinate}
         */
        this._fireEvent('mouseout', params);
    }
});
