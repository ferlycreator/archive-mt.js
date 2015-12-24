Z.Map.include({
    _onZoomStart:function(startScale, endScale, focusPos, nextZoomLevel) {
        var me = this;
        /**
         * 触发map的zoomstart事件
         * @member maptalks.Map
         * @event zoomstart
         * @return {Object} params: {'target':this}
         */
        me._fireEvent('zoomstart');
        var zoomDuration = this.options['zoomAnimationDuration']*Math.abs(endScale - startScale)/Math.abs(endScale-1);
        this._getRender().onZoomStart(startScale, endScale, focusPos, zoomDuration, this._onZoomEnd, this, [nextZoomLevel]);
    },

    _onZoomEnd:function(nextZoomLevel) {

        this._originZoomLevel=nextZoomLevel;
        this._getRender().onZoomEnd();
        this._zooming = false;
        this._enablePanAnimation=true;
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

    _zoom:function(nextZoomLevel, focusPos, startScale) {
        if (!this.options['enableZoom']) {return;}
        if (Z.Util.isNil(startScale)) {
            startScale = 1;
        }
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
                    -(focusPos.x-this.width/2)*(1-zScale),
                    -(focusPos.y-this.height/2)*(1-zScale)
                );
        } else {
            zScale = resolutions[nextZoomLevel-1]/resolutions[nextZoomLevel];
            pixelOffset = new Z.Point(
                    (focusPos.x-this.width/2)*(zScale-1),
                    (focusPos.y-this.height/2)*(zScale-1)
                );
        }
        this._offsetCenterByPixel(pixelOffset);
        this._onZoomStart(startScale, scale, focusPos, nextZoomLevel);
    },

    _getZoomMillisecs:function() {
        return 150;
    }
});
