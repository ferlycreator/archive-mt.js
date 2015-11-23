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
        var maxZoom = this.getMaxZoom(),
            minZoom = this.getMinZoom();
        if (nextZoomLevel < minZoom){
            nextZoomLevel = minZoom;
        }
        if (nextZoomLevel > maxZoom) {
            nextZoomLevel = maxZoom;
        }
        return nextZoomLevel;
    },

    _zoom:function(nextZoomLevel, focusPos) {
        if (!this.options['enableZoom']) {return;}
        this._enablePanAnimation=false;
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
