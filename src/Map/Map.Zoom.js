Z.Map.include({
    onZoomStart:function(scale,focusPos,nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer.onZoomStart) {
                layer.onZoomStart();
            }
        }
        var me = this;

        if (me._baseTileLayer) {me._baseTileLayer.onZoomStart(true);}
        me._eachLayer(zoomLayer,me._getAllLayers());
        this._hideOverlayLayers();
        me.animateStart(scale,focusPos);
        me._fireEvent('zoomstart',{'target':this});
    },

    onZoomEnd:function(nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer.onZoomEnd) {
                layer.onZoomEnd();
            }
        }

        this.insertBackgroundDom();
        if (this._baseTileLayer) {this._baseTileLayer.clear();}
        this.animateEnd();
        this.resetContainer();
        this._originZoomLevel=nextZoomLevel;
        if (this._baseTileLayer) {this._baseTileLayer.onZoomEnd();}
        this._eachLayer(zoomLayer,this._getAllLayers());
        this._showOverlayLayers();
        this._fireEvent('zoomend',{'target':this});
    },

    resetContainer:function() {
        var position = this._offsetPlatform();
        Z.DomUtil.offsetDom(this._panels.mapPlatform,{'left':0,'top':0});
        this._refreshSVGPaper();
        if (this.backgroundDOM) {
            //Z.DomUtil.offsetDom(this.backgroundDOM,position);
            this.backgroundDOM.style.left=position["left"]+"px";
            this.backgroundDOM.style.top=position["top"]+"px";
        }
    },

    insertBackgroundDom:function() {
        this.backgroundDOM = this._panels.mapContainer.cloneNode(true);
        this._panels.mapPlatform.insertBefore(this.backgroundDOM,this._panels.mapViewPort);
    },

    checkZoomLevel:function(nextZoomLevel) {
        if (nextZoomLevel < this._minZoomLevel){
            nextZoomLevel = this._minZoomLevel;
        }
        if (nextZoomLevel > this._maxZoomLevel) {
            nextZoomLevel = this._maxZoomLevel;
        }
        return nextZoomLevel;
    },

    zoomOnDblClick:function(param) {
        var me = this;
        if (!me.options['enableZoom'])  {return;}
        function zoomLayer(layer) {
            if (layer) {
                layer.onZoomEnd();
            }
        }
        var mousePos = param['pixel'];
        var nextZoomLevel = me.checkZoomLevel(me._zoomLevel+1);
        if (nextZoomLevel === me._zoomLevel) {
            var move = {
                'top':(mousePos['top']-me.height/2)/2,
                'left':(me.width/2-mousePos['left'])/2
                };
            me._offsetCenterByPixel(move);
            me._offsetPlatform(move);

            if (me._baseTileLayer) {me._baseTileLayer.onZoomEnd();}
            me._eachLayer(zoomLayer,me._getAllLayers());
            return;
        }
        me.zoom(nextZoomLevel, param['pixel']);
    },

    zoom:function(nextZoomLevel, focusPos) {
        if (!this.options['enableZoom']) {return;}
        this._allowSlideMap=false;
        nextZoomLevel = this.checkZoomLevel(nextZoomLevel);
        if (this._originZoomLevel === nextZoomLevel) {
            return;
        }
        this.zooming = true;
        if (!focusPos) {
            focusPos = {
                'top':this.height/2,
                'left':this.width/2
            };
        }
        this._removeBackGroundDOM();
        var resolutions=this._lodConfig['resolutions'];
        this._zoomLevel=nextZoomLevel;
        var scale = resolutions[this._originZoomLevel]/resolutions[nextZoomLevel];
        var pixelOffset;
        var zScale;
        if (nextZoomLevel<this._originZoomLevel) {
            zScale = resolutions[nextZoomLevel+1]/resolutions[nextZoomLevel];
            pixelOffset = {
                "top":-(focusPos['top']-this.height/2)*(1-zScale),
                "left":-(focusPos['left']-this.width/2)*(1-zScale)
                };
        } else {
            zScale = resolutions[nextZoomLevel-1]/resolutions[nextZoomLevel];
            pixelOffset = {
                "top":(focusPos['top']-this.height/2)*(zScale-1),
                "left":(focusPos['left']-this.width/2)*(zScale-1)
                };
        }
        this._offsetCenterByPixel(pixelOffset);
        this.onZoomStart(scale,focusPos,nextZoomLevel);
        var me = this;
        if (this.zoom_timeout) {
            clearTimeout(this.zoom_timeout);
        }
        this.zoom_timeout=setTimeout(function() {
            me.zooming = false;
            me.onZoomEnd(nextZoomLevel);
        },this.getZoomMillisecs());
    },

    animateStart:function(scale,pixelOffset){
        if (Z.Browser.ielt9) {return;}
        var domOffset = this._offsetPlatform();
        var offsetTop = domOffset['top'];
        var offsetLeft = domOffset['left'];
        var mapContainer = this._panels.mapContainer;
        this._panels.mapContainer.className="MAP_ZOOM_ANIMATED";
        var origin = Z.DomUtil.getDomTransformOrigin(mapContainer);
        var originX = Math.round(this.width/2-offsetLeft),
            originY = Math.round(this.height/2-offsetTop);
        if ((origin===null || ""===origin) && pixelOffset) {
            var mouseOffset= {
                    "top":(pixelOffset.top-this.height/2),
                    "left":(pixelOffset.left-this.width/2)
                    };
            originX += mouseOffset["left"];
            originY += mouseOffset["top"];
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+"px "+ originY+"px");
        } else if (!pixelOffset) {
            Z.DomUtil.setDomTransformOrigin(mapContainer, originX+"px "+ originY+"px");
        }

        Z.DomUtil.setDomTransform(mapContainer," scale("+scale+","+scale+")");
    },


    animateEnd:function() {
        if (Z.Browser.ielt9) {return;}
        var mapContainer = this._panels.mapContainer;
        mapContainer.className="";
        Z.DomUtil.setDomTransformOrigin(mapContainer,"");
        Z.DomUtil.setDomTransform(mapContainer,"");
        mapContainer.style.top=0+"px";
        mapContainer.style.left=0+"px";
    },

    getZoomMillisecs:function() {
        return 150;
    }
});

