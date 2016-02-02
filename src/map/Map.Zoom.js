Z.Map.include({
    _zoomAnimation:function(nextZoomLevel, origin, startScale) {
        if (!this.options['enableZoom']) {return;}
        if (Z.Util.isNil(startScale)) {
            startScale = 1;
        }
        if (Z.Util.isNil(this._originZoomLevel)) {
            this._originZoomLevel = this.getZoom();
        }
        nextZoomLevel = this._checkZoomLevel(nextZoomLevel);
        if (this._originZoomLevel === nextZoomLevel) {
            return;
        }
        this._enablePanAnimation = false;
        this._zooming = true;
        this._fireEvent('zoomstart', {"from" : this._originZoomLevel, "to": nextZoomLevel});
        if (!origin) {
            origin = new Z.Point(this.width/2, this.height/2);
        }
        this._onZoomStart(startScale, origin, nextZoomLevel);
    },

    _onZoomStart:function(startScale, transOrigin, nextZoomLevel) {
        var me = this;
        var resolutions=this._getResolutions();
        var endScale = resolutions[this._originZoomLevel]/resolutions[nextZoomLevel];
        var zoomOffset = this._getZoomCenterOffset(nextZoomLevel, transOrigin, startScale);
        if (zoomOffset.x === 0 && zoomOffset.y === 0) {
            //center is out of maxExtent
            transOrigin = new Z.Point(this.width/2,this.height/2);
        }
        /**
         * 触发map的zoomstart事件
         * @member maptalks.Map
         * @event zoomstart
         * @return {Object} params: {'target':this}
         */
        var zoomDuration = this.options['zoomAnimationDuration']*Math.abs(endScale - startScale)/Math.abs(endScale-1);
        this._getRenderer().onZoomStart(startScale, endScale, transOrigin, zoomDuration, function(){
            me._onZoomEnd(nextZoomLevel, zoomOffset);
        });
    },

    _onZoomEnd:function(nextZoomLevel, zoomOffset) {
        this._zoomLevel=nextZoomLevel;
        if (zoomOffset) {
            this._offsetCenterByPixel(zoomOffset);
        }
        var _originZoomLevel = this._originZoomLevel;
        this._originZoomLevel=nextZoomLevel;
        this._getRenderer().onZoomEnd();
        this._zooming = false;
        this._enablePanAnimation=true;
        /**
         * 触发map的zoomend事件
         * @member maptalks.Map
         * @event zoomend
         * @return {Object} params: {'target':this}
         */
        this._fireEvent('zoomend',{"from" : _originZoomLevel, "to": nextZoomLevel});
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
        nextZoomLevel = this._checkZoomLevel(nextZoomLevel);
        this._fireEvent('zoomstart');
        var zoomOffset;
        if (origin) {
            origin = new Z.Point(this.width/2, this.height/2);
            zoomOffset = this._getZoomCenterOffset(nextZoomLevel, origin, startScale);
        }
        this._onZoomEnd(nextZoomLevel, zoomOffset);
    },



    _getZoomCenterOffset:function(nextZoomLevel, origin, startScale) {
        if (Z.Util.isNil(startScale)) {
            startScale = 1;
        }
        var resolutions=this._getResolutions();
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

        var newCenter = this.containerPointToCoordinate(new Z.Point(this.width/2+zoomOffset.x, this.height/2+zoomOffset.y));
        if (!this._verifyExtent(newCenter)) {
            return new Z.Point(0,0);
        }

        return zoomOffset;
    },

    _getZoomMillisecs:function() {
        return 600;
    }
});
