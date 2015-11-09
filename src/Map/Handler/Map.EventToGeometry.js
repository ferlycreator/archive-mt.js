Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [eventToGeometry="true"] geometry事件监控
     * @member maptalks.Map
     */
    'eventToGeometry': true
});

Z.Map.EventToGeometry = Z.Handler.extend({
    addHooks: function() {
        // return;
        var canvasContainer;
        if (Z.Browser.ie9) {
            canvasContainer = this.map._panels.canvasLayerContainer;
        } else {
            canvasContainer = this.map._panels.mapPlatform;
        }
        if(canvasContainer) {
            Z.DomUtil.on(canvasContainer,'mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);
        }
        //之所以取消在map上的监听, 是因为map事件在geometry事件之前发生, 会导致一些互动上的问题
        // this.map.on('_mousedown _mouseup _mousemove _click _dblclick _contextmenu', this._queryGeometries, this);

    },

    removeHooks: function() {
        /**
        this.map.off('mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);*/
        var canvasContainer;
        if (Z.Browser.ie9) {
            canvasContainer = this.map._panels.canvasLayerContainer;
        } else {
            canvasContainer = this.map._panels.mapPlatform;
        }
        if(canvasContainer) {
            Z.DomUtil.off(canvasContainer,'mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);
        }
        // this.map.off('_mousedown _mouseup _mousemove _click _dblclick _contextmenu', this._queryGeometries, this);
    },

    _queryGeometries: function(event) {
        if (this.map.isBusy() || !this.map._canvasLayers || this.map._canvasLayers.length === 0) {
            return;
        }
        // console.log('_queryGeometries');
        var domEvent = event;//param['domEvent'];
        var eventType = domEvent.type;
        // var mouseOffset = param['containerPoint'];//Z.DomUtil.getEventContainerPoint(domEvent, this.map._containerDOM);
        var containerPoint = Z.DomUtil.getEventContainerPoint(domEvent, this.map._containerDOM);
        var coordinate = this.map.containerPointToCoordinate(containerPoint);
        this.options = {
            'coordinate' : coordinate,
            'layers': this.map._canvasLayers,
            'success': Z.Util.bind(fireGeometryEvent, this)
        };
        var me = this;
        if (this._queryIdentifyTimeout) {
                clearTimeout(this._queryIdentifyTimeout);
            }
        if ('mousemove' === eventType) {
            //mousemove才需要做15ms的判断
            var throttle = 100;//15毫秒
            this._queryIdentifyTimeout = setTimeout(function() {
                me.map.identify(me.options);
            },throttle);
        } else {
            //如果不是mousemove,则立即执行, 不然点击时, 只会响应mousedown, 后续的mouseup和click等都会被timeout屏蔽掉
            // this._queryIdentifyTimeout = setTimeout(function() {
               me.map.identify(me.options);
            // },10);
        }

        function fireGeometryEvent(result) {
            var i,len;
            var geometries = result;
            if(eventType === 'mousemove') {
                var oldTargets = me.prevMouseOverTargets;
                if (Z.Util.isArrayHasData(oldTargets)) {
                    for(i=0,len=oldTargets.length; i<len; i++) {
                        var oldTarget = oldTargets[i];
                        if(geometries && geometries.length>0) {
                            var mouseout = true;
                            /**
                            * 鼠标经过的新位置中不包含老的目标geometry
                            */
                            for(var j=0,size=geometries.length; j<size; j++) {
                                var geometry = geometries[j];
                                if(oldTarget === geometry) {
                                    mouseout = false;
                                    break;
                                }
                            }
                            if(mouseout) {
                                oldTarget._onMouseOut(domEvent);
                            }
                        } else {//鼠标新的位置不包含任何geometry，将触发之前target的mouseOut事件
                            oldTarget._onMouseOut(domEvent);
                        }
                    }
                }
                if(!geometries) {return;}
                for(i=0,len=geometries.length; i<len; i++) {
                    geometries[i]._onMouseOver(domEvent);
                }
                me.prevMouseOverTargets = geometries;
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
