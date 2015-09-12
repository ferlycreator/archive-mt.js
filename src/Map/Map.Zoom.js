Z.Map.include({
    _onZoomStart:function(scale,focusPos,nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer._onZoomStart) {
                layer._onZoomStart();
            }
        }
        var me = this;

        if (me._baseTileLayer) {me._baseTileLayer._onZoomStart(true);}
        me._eachLayer(zoomLayer,me._getAllLayers());
        this._hideOverlayLayers();
        me._animateStart(scale,focusPos);
        me._fireEvent('zoomstart',{'target':this});
    },

    _onZoomEnd:function(nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer._onZoomEnd) {
                layer._onZoomEnd();
            }
        }

        this._insertBackgroundDom();
        if (this._baseTileLayer) {this._baseTileLayer.clear();}
        this._animateEnd();
        this._resetContainer();
        this._originZoomLevel=nextZoomLevel;
        if (this._baseTileLayer) {this._baseTileLayer._onZoomEnd();}
        this._eachLayer(zoomLayer,this._getAllLayers());
        this._showOverlayLayers();
        this._fireEvent('zoomend',{'target':this});
    },

    _resetContainer:function() {
        var position = this.offsetPlatform();
        Z.DomUtil.offsetDom(this._panels.mapPlatform, new Z.Point(0,0)); //{'left':0,'top':0}
        this._refreshSVGPaper();
        if (this._backgroundDOM) {
            //Z.DomUtil.offsetDom(this._backgroundDOM,position);
            this._backgroundDOM.style.left=position["left"]+"px";
            this._backgroundDOM.style.top=position["top"]+"px";
        }
    },

    _insertBackgroundDom:function() {
        this._backgroundDOM = this._panels.mapContainer.cloneNode(true);
        this._panels.mapPlatform.insertBefore(this._backgroundDOM,this._panels.mapViewPort);
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
            me._eachLayer(zoomLayer,me._getAllLayers());
            return;
        }
        me._zoom(nextZoomLevel, param['pixel']);
    },

    _zoom:function(nextZoomLevel, focusPos) {
        if (!this.options['enableZoom']) {return;}
        this._allowSlideMap=false;
        nextZoomLevel = this._checkZoomLevel(nextZoomLevel);
        if (this._originZoomLevel === nextZoomLevel) {
            return;
        }
        this.zooming = true;
        if (!focusPos) {
            focusPos = new Z.Point(this.width/2, this.height/2);
        }
        this._removeBackGroundDOM();
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
        var me = this;
        if (this.zoom_timeout) {
            clearTimeout(this.zoom_timeout);
        }
        this.zoom_timeout=setTimeout(function() {
            me.zooming = false;
            me._onZoomEnd(nextZoomLevel);
        },this._getZoomMillisecs());
    },

    _animateStart:function(scale,pixelOffset){
        if (Z.Browser.ielt9) {return;}
        var domOffset = this.offsetPlatform();
        var offsetTop = domOffset['top'];
        var offsetLeft = domOffset['left'];
        var mapContainer = this._panels.mapContainer;
        this._panels.mapContainer.className ='maptalks-map-zoom_animated';
        var origin = Z.DomUtil.getDomTransformOrigin(mapContainer);
        var originX = Math.round(this.width/2-offsetLeft),
            originY = Math.round(this.height/2-offsetTop);
        if ((origin===null || ''===origin) && pixelOffset) {
            var mouseOffset = new Z.Point(
                    pixelOffset.left-this.width/2,
                    pixelOffset.top-this.height/2
                );
            originX += mouseOffset['left'];
            originY += mouseOffset['top'];
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+'px '+ originY+'px');
        } else if (!pixelOffset) {
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+'px '+ originY+'px');
        }

        Z.DomUtil.setDomTransform(mapContainer," scale("+scale+","+scale+")");
    },


    _animateEnd:function() {
        if (Z.Browser.ielt9) {return;}
        var mapContainer = this._panels.mapContainer;
        mapContainer.className="MAP_CONTAINER";
        Z.DomUtil.setDomTransformOrigin(mapContainer,"");
        Z.DomUtil.setDomTransform(mapContainer,"");
        mapContainer.style.top=0+"px";
        mapContainer.style.left=0+"px";
    },

    _getZoomMillisecs:function() {
        return 150;
    }
});
