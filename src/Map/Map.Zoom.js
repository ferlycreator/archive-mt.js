Z.Map.include({
    _onZoomStart:function(scale,focusPos,nextZoomLevel) {
        var me = this;
        this._hideOverlayLayers();
        /**
         * 触发map的zoomstart事件
         * @member maptalks.Map
         * @event zoomstart
         * @return {Object} params: {'target':this}
         */
        me._fireEvent('zoomstart');
        this._getRender().onZoomStart(scale,focusPos, this._onZoomEnd, this, [nextZoomLevel]);
    },

    _onZoomEnd:function(nextZoomLevel) {

        this._originZoomLevel=nextZoomLevel;
        this._getRender().onZoomEnd();
        this._showOverlayLayers();
        this._zooming = false;
        /**
         * 触发map的zoomend事件
         * @member maptalks.Map
         * @event zoomend
         * @return {Object} params: {'target':this}
         */
        this._fireEvent('zoomend');
    },


    _checkZoomLevel:function(nextZoomLevel) {
        if (nextZoomLevel < this._minZoomLevel){
            nextZoomLevel = this._minZoomLevel;
        }
        if (nextZoomLevel > this._maxZoomLevel) {
            nextZoomLevel = this._maxZoomLevel;
        }
        return nextZoomLevel;
    },

    _zoomOnDblClick:function(param) {
        var me = this;
        if (!me.options['enableZoom'])  {return;}
        function zoomLayer(layer) {
            if (layer) {
                layer._onZoomEnd();
            }
        }
        var mousePos = param['pixel'];
        var nextZoomLevel = me._checkZoomLevel(me._zoomLevel+1);
        if (nextZoomLevel === me._zoomLevel) {
            var move = new Z.Point((me.width/2-mousePos['left'])/2,(mousePos['top']-me.height/2)/2 );
            me._offsetCenterByPixel(move);
            me.offsetPlatform(move);

            if (me._baseTileLayer) {me._baseTileLayer._onZoomEnd();}
            me._eachLayer(zoomLayer,me.getAllLayers());
            return;
        }
        me._zoom(nextZoomLevel, param['pixel']);
    },

    _zoom:function(nextZoomLevel, focusPos) {
        if (!this.options['enableZoom'] || this.isBusy()) {return;}
        this._allowSlideMap=false;
        nextZoomLevel = this._checkZoomLevel(nextZoomLevel);
        if (this._originZoomLevel === nextZoomLevel) {
            return;
        }
        this._zooming = true;
        if (!focusPos) {
            focusPos = new Z.Point(this.width/2, this.height/2);
        }
        // this._getRender().removeBackGroundDOM();
        var resolutions=this._tileConfig['resolutions'];
        this._zoomLevel=nextZoomLevel;
        var scale = resolutions[this._originZoomLevel]/resolutions[nextZoomLevel];
        var pixelOffset;
        var zScale;
        if (nextZoomLevel<this._originZoomLevel) {
            zScale = resolutions[nextZoomLevel+1]/resolutions[nextZoomLevel];
            pixelOffset = new Z.Point(
                    -(focusPos['left']-this.width/2)*(1-zScale),
                    -(focusPos['top']-this.height/2)*(1-zScale)
                );
        } else {
            zScale = resolutions[nextZoomLevel-1]/resolutions[nextZoomLevel];
            pixelOffset = new Z.Point(
                    (focusPos['left']-this.width/2)*(zScale-1),
                    (focusPos['top']-this.height/2)*(zScale-1)
                );
        }
        this._offsetCenterByPixel(pixelOffset);
        this._onZoomStart(scale,focusPos,nextZoomLevel);
        /*var me = this;
        if (this._zoom_timeout) {
            clearTimeout(this._zoom_timeout);
        }
        this._zoom_timeout=setTimeout(function() {
            me._zooming = false;
            me._onZoomEnd(nextZoomLevel);
        },this._getZoomMillisecs());*/
    },

    _getZoomMillisecs:function() {
        return 150;
    }
});
