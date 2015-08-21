Z.Geometry.include({

    onEvent: function(event) {
        //还没加载到地图上时, 不处理事件
        if (!this.getMap()) {
            return;
        }
        //map抛过来的事件中有originEvent, 而dom直接抛的没有
        var originalEvent = event.originalEvent || event;
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
        var params = this.getEventParams(originalEvent);
        this._fireEvent(eventFired, params);
    },

    /**
     * 生成事件参数
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    getEventParams: function(event) {
        var map = this.getMap();
        var pixel = Z.DomUtil.getEventDomCoordinate(event, map.containterDom);
        var coordinate = map._transform(pixel);
        //统一的参数, target是geometry引用, pixel是事件的屏幕坐标, coordinate是事件的经纬度坐标
        return {'target':this, 'pixel':pixel, 'coordinate':coordinate};
    },

    onMouseOver: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event.originalEvent || event;
        var params = this.getEventParams(originalEvent);
        this._fireEvent('mouseover', params);
    },

    onMouseOut: function(event) {
        if (!this.getMap()) {
            return;
        }
        var originalEvent = event.originalEvent || event;
        var params = this.getEventParams(originalEvent);
        this._fireEvent('mouseout', params);
    }
});