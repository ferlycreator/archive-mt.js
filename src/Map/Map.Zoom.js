Z.Map.include({
    _zoomAnimation:function(nextZoomLevel, origin, startScale) {
        if (!this.options['enableZoom']) {return;}
        if (Z.Util.isNil(startScale)) {
            startScale = 1;
        }
        nextZoomLevel = this._checkZoomLevel(nextZoomLevel);
        if (this._originZoomLevel === nextZoomLevel) {
            return;
        }
        this._enablePanAnimation=false;
        this._zooming = true;

        this._zoomLevel=nextZoomLevel;

        if (!origin) {
            origin = new Z.Point(this.width/2, this.height/2);
        }

        var zoomOffset = this._getZoomCenterOffset(nextZoomLevel, origin, startScale);
        this._offsetCenterByPixel(zoomOffset);
        this._onZoomStart(startScale, origin, nextZoomLevel);
    },

    _onZoomStart:function(startScale, transOrigin, nextZoomLevel) {
        var me = this;
        var resolutions=this._tileConfig['resolutions'];
        var endScale = resolutions[this._originZoomLevel]/resolutions[nextZoomLevel];
        /**
         * 触发map的zoomstart事件
         * @member maptalks.Map
         * @event zoomstart
         * @return {Object} params: {'target':this}
         */
        me._fireEvent('zoomstart');
        var zoomDuration = this.options['zoomAnimationDuration']*Math.abs(endScale - startScale)/Math.abs(endScale-1);
        this._getRender().onZoomStart(startScale, endScale, transOrigin, zoomDuration, function(){
            me._onZoomEnd(nextZoomLevel);
        });
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

    _zoom:function(nextZoomLevel, origin, startScale) {
        this._zooming = true;
        this._fireEvent('zoomstart');
        this._zoomLevel = nextZoomLevel;
        if (!origin) {
            origin = new Z.Point(this.width/2, this.height/2);
        }
        var zoomOffset = this._getZoomCenterOffset(nextZoomLevel, origin, startScale);
        this._offsetCenterByPixel(zoomOffset);
    },



    _getZoomCenterOffset:function(nextZoomLevel, origin, startScale) {
        if (Z.Util.isNil(startScale)) {
            startScale = 1;
        }
        var resolutions=this._tileConfig['resolutions'];
        var zScale;
        var zoomOffset;
        if (nextZoomLevel<this._originZoomLevel) {
            zScale = resolutions[nextZoomLevel+1]/resolutions[nextZoomLevel];
            zoomOffset = new Z.Point(
                    -(origin.x-this.width/2)*(startScale-zScale),
                    -(origin.y-this.height/2)*(startScale-zScale)
                );
        } else {
            zScale = resolutions[nextZoomLevel-1]/resolutions[nextZoomLevel];
            zoomOffset = new Z.Point(
                    (origin.x-this.width/2)*(zScale-startScale),
                    (origin.y-this.height/2)*(zScale-startScale)
                );
        }
        return zoomOffset;
    }
});
