Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [eventToGeometry="true"] geometry事件监控
     * @member maptalks.Map
     */
    'eventToGeometry': true
});

Z.Map.EventToGeometry = Z.Handler.extend({
    addHooks: function() {
        var map = this.target;
        // return;
        var canvasContainer;
        if (Z.Browser.ie9) {
            canvasContainer = map._panels.canvasLayerContainer;
        } else {
            canvasContainer = map._panels.mapWrapper;
        }
        if(canvasContainer) {
            Z.DomUtil.on(canvasContainer,'mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);
        }
        //之所以取消在map上的监听, 是因为map事件在geometry事件之前发生, 会导致一些互动上的问题
        // map.on('_mousedown _mouseup _mousemove _click _dblclick _contextmenu', this._queryGeometries, this);

    },

    removeHooks: function() {
        var map = this.target;
        /**
        map.off('mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);*/
        var canvasContainer;
        if (Z.Browser.ie9) {
            canvasContainer = map._panels.canvasLayerContainer;
        } else {
            canvasContainer = map._panels.mapPlatform;
        }
        if(canvasContainer) {
            Z.DomUtil.off(canvasContainer,'mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);
        }
        // map.off('_mousedown _mouseup _mousemove _click _dblclick _contextmenu', this._queryGeometries, this);
    },

    _queryGeometries: function(event) {
        var map = this.target;
        if (map.isBusy() || !map._canvasLayers || map._canvasLayers.length === 0) {
            return;
        }
        var domEvent = event;//param['domEvent'];
        var eventType = domEvent.type;
        var containerPoint = Z.DomUtil.getEventContainerPoint(domEvent, map._containerDOM);
        var coordinate = map.containerPointToCoordinate(containerPoint);
        this.options = {
            'includeInternals' : true,
            'coordinate' : coordinate,
            'layers': map._canvasLayers,
            'success': Z.Util.bind(fireGeometryEvent, this)
        };
        var me = this;
        if (this._queryIdentifyTimeout) {
                clearTimeout(this._queryIdentifyTimeout);
            }
        if ('mousemove' === eventType) {
            this._queryIdentifyTimeout = setTimeout(function() {
                map.identify(me.options);
            }, 10);
        } else {
            map.identify(me.options);
        }

        function fireGeometryEvent(geometries) {
            var i,len;
            if(eventType === 'mousemove') {
                var geoMap = {};
                if (Z.Util.isArrayHasData(geometries)) {
                    for (i = geometries.length - 1; i >= 0; i--) {
                        geoMap[geometries[i]._getInternalId()] = geometries[i];
                        if (geometries[i].options['cursor']) {
                            map.setCursor(geometries[i].options['cursor']);
                        }
                        geometries[i]._onMouseOver(domEvent);
                    }
                } else {
                    map.setCursor(null);
                }
                var oldTargets = me._prevMouseOverTargets;
                me._prevMouseOverTargets = geometries;
                if (Z.Util.isArrayHasData(oldTargets)) {
                    for(i=0,len=oldTargets.length; i<len; i++) {
                        var oldTarget = oldTargets[i];
                        var oldTargetId = oldTargets[i]._getInternalId();
                        if(geometries && geometries.length>0) {
                            var mouseout = true;
                            /**
                            * 鼠标经过的新位置中不包含老的目标geometry
                            */
                            if (geoMap[oldTargetId]) {
                                mouseout = false;
                            }
                            if(mouseout) {
                                oldTarget._onMouseOut(domEvent);
                            }
                        } else {//鼠标新的位置不包含任何geometry，将触发之前target的mouseOut事件
                            oldTarget._onMouseOut(domEvent);
                        }
                    }
                }

            } else {
                if(!geometries) {return;}
                for(i=0,len=geometries.length; i<len; i++) {
                    geometries[i]._onEvent(domEvent);
                }
            }
        }

    }
});

Z.Map.addInitHook('addHandler', 'eventToGeometry', Z.Map.EventToGeometry);
