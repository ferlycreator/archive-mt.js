Z.Map.include({
    _registerDomEvents: function(remove) {
        var events = /**
                      * 触发mousedown事件
                      * @member maptalks.Map
                      * @event mousedown
                      */
                     'mousedown '+
                     /**
                      * 触发mouseup事件
                      * @member maptalks.Map
                      * @event mouseup
                      */
                     'mouseup '+
                     /**
                      * 触发mouseover事件
                      * @member maptalks.Map
                      * @event mouseover
                      */
                     'mouseover '+
                     /**
                      * 触发mouseout事件
                      * @member maptalks.Map
                      * @event mouseout
                      */
                     'mouseout '+
                     /**
                      * 触发mousemove事件
                      * @member maptalks.Map
                      * @event mousemove
                      */
                     'mousemove '+
                     /**
                      * 触发click事件
                      * @member maptalks.Map
                      * @event click
                      */
                     'click '+
                     /**
                      * 触发dblclick事件
                      * @member maptalks.Map
                      * @event dblclick
                      */
                     'dblclick '+
                     /**
                      * 触发contextmenu事件
                      * @member maptalks.Map
                      * @event contextmenu
                      */
                     'contextmenu '+
                     /**
                      * 触发keypress事件
                      * @member maptalks.Map
                      * @event keypress
                      */
                     'keypress ';
        if (remove) {
            Z.DomUtil.removeDomEvent(this._containerDOM, events, this._handleDOMEvent);
        } else {
            Z.DomUtil.addDomEvent(this._containerDOM, events, this._handleDOMEvent, this);
        }

    },

    _handleDOMEvent: function (e) {
        var type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;
        this._fireDOMEvent(this, e, type);
    },

    _fireDOMEvent: function (target, e, type) {
        var containerPoint = Z.DomUtil.getEventContainerPoint(e, this._containerDOM);
        var eventParam = {
            'coordinate': this.containerPointToCoordinate(containerPoint),
            'containerPoint':containerPoint,
            /*'viewPoint':this._containerPointToViewPoint(containerPoint),*/
            'domEvent': e
        };
        //阻止右键菜单
        if (type === 'contextmenu') {
            Z.DomUtil.preventDefault(e);
        }
        if (type === 'mousedown' || type === 'click') {
            var button = e.button;
            if (button === 2) {
                type = 'contextmenu';
            }
        }
        this._fireEvent(type, eventParam);
    }
});
