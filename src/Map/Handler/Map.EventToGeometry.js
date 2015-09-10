Z.Map.mergeOptions({
    'eventToGeometry': true,
    'mouseoverTarget': []
});

Z.Map.EventToGeometry = Z.Handler.extend({
    addHooks: function() {
        /**
        this.map.on('mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this)
                .on('moving', this._stopQueryGeometries, this)
                .on('moveend', this._startQueryGeometries, this);
        */
        /**
        * TODO Z.Render.Canvas.Base.getBaseCanvasRender(map) 在该扩展功能注册时为undefined
        * 故采用了之前的方式获取canvas容器。
        */
        var canvasContainer = this.map._panels.canvasLayerContainer;
        if(canvasContainer) {
            Z.DomUtil.on(canvasContainer,'mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);
        }
    },

    removeHooks: function() {
        /**
        this.map.off('mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);*/
        var canvasContainer = this.map._panels.canvasLayerContainer;
        if(canvasContainer) {
            Z.DomUtil.off(canvasContainer,'mousedown mouseup mousemove click dblclick contextmenu', this._queryGeometries, this);
        }
    },

    _queryGeometries: function(event) {
        var eventType = event.type;
        var mouseOffset = Z.DomUtil.getEventDomCoordinate(event, this.map._containerDOM);
        var mouseDomOffset = this.map._screenToDomOffset(mouseOffset);
        var layers = [];
        //2015-07-09 fuzhen dynamiclayer不需要做identify
        layers = layers.concat(this.map._canvasLayers)/*.concat(this.map._dynLayers)*/;

        this.options = {
            point: mouseDomOffset,
            'layers': layers,
            'success': Z.Util.bind(fireGeometryEvent, this)
        };

        if ('mousemove' === eventType) {
            //mousemove才需要做15ms的判断
            var throttle = 15;//15毫秒
            if (this.identifyTimeout) {
                clearTimeout(this.identifyTimeout);
            }
            var me = this;
            this.identifyTimeout = setTimeout(function() {
                me.map.identify(me.options);
            },throttle);
        } else {
            //如果不是mousemove,则立即执行, 不然点击时, 只会响应mousedown, 后续的mouseup和click等都会被timeout屏蔽掉
            this.map.identify(this.options);
        }

        function fireGeometryEvent(result) {
            if(!result['success']){return;};
            var geometries = result['data'];
            var mouseoutTargets = [];
            if(eventType === 'mousemove') {
                var oldTargets = me.map.options['mouseoverTarget'];
                if (Z.Util.isArrayHasData(oldTargets)) {
                    for(var i=0,len=oldTargets.length; i<len; i++) {
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
                                oldTarget._onMouseOut(event);
                            }
                        } else {//鼠标新的位置不包含任何geometry，将触发之前target的mouseOut事件
                            oldTarget._onMouseOut(event);
                        }
                    }
                }
                if(!geometries) {return;}
                for(var i=0,len=geometries.length; i<len; i++) {
                    var geometry = geometries[i];
                    geometry._onMouseOver(event);
                }
                me.map.options['mouseoverTarget'] = geometries;
            } else {
                if(!geometries) {return;}
                for(var i=0,len=geometries.length; i<len; i++) {
                    var geometry = geometries[i];
                    geometry._onEvent(event);
                }
            }
        };

    }
});

Z.Map.addInitHook('addHandler', 'eventToGeometry', Z.Map.EventToGeometry);
