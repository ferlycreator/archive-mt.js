
/**
 * 地图的事件处理
 * @type {Object}
 */
Z.Map.include({
	/**
    * 初始化地图事件
    * @param {Boolean} remove
    */
    _registerDomEvents: function(remove) {
        var events = 'mousedown mouseup ' +
            'mouseover mouseout mousemove click dblclick contextmenu keypress';
        if (remove) {
            Z.DomUtil.removeDomEvent(this.containerDOM, events, this._handleDOMEvent);
        } else {
            Z.DomUtil.addDomEvent(this.containerDOM, events, this._handleDOMEvent, this);
        }

    },

    _handleDOMEvent: function (e) {
        /*if (!this.loaded || Z.DomEvent._skipped(e)) { return; }

        // find the layer the event is propagating from
        var target = this._findEventTarget(e.target || e.srcElement),
            type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;

        // special case for map mouseover/mouseout events so that they're actually mouseenter/mouseleave
        if (!target && (type === 'mouseover' || type === 'mouseout') &&
                !Z.DomEvent._checkMouse(this.containerDOM, e)) { return; }

        // prevents outline when clicking on keyboard-focusable element
        if (type === 'mousedown') {
            Z.DomUtil.preventOutline(e.target || e.srcElement);
        }*/
        var type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;
        this._fireDOMEvent(this, e, type);
    },

   /* _findEventTarget: function (src) {
        while (src) {
            var target = this._targets[Z.Util.stamp(src)];
            if (target) {
                return target;
            }
            if (src === this.containerDOM) {
                break;
            }
            src = src.parentNode;
        }
        return null;
    },*/

    _fireDOMEvent: function (target, e, type) {
    	//TODO DOM事件参数属性应该统一起来
        var data = {
            'originalEvent': e
        };
        //阻止右键菜单
        if (type === 'contextmenu') {
            Z.DomUtil.preventDefault(e);
        }
        // prevents firing click after you just dragged an object
        /*if (e.type === 'click' && !e._simulated && this._draggableMoved(target)) { return; }
        if (e.type !== 'keypress') {
            data.containerPoint = target instanceof Z.Marker ?
                    this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
            data.layerPoint = this.containerDOMPointToLayerPoint(data.containerPoint);
            data.latlng = this.layerPointToLatLng(data.layerPoint);
        }*/
        target.fire(type, data, true);
    },

    enableDragPropagation: function() {
        this['dragging'].draggable.enable();
    },

    disableDragPropagation: function() {
        this['dragging'].draggable.disable();
    },

    enableDoubleClickZoom: function() {
        this['doubleClickZoom'] = true;
    },

    disableDoubleClickZoom: function() {
        this['doubleClickZoom'] = false;
    }

    /*_draggableMoved: function (obj) {
        obj = obj.options.draggable ? obj : this;
        return (obj.dragging) || (this.boxZoom);
    },*/
});