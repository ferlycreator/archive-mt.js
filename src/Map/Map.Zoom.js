Z.Map.include({
    onZoomStart:function(scale,focusPos,nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer.onZoomStart) {
                layer.onZoomStart();    
            }
        }
        var me = this;
        
        if (me.baseTileLayer) {me.baseTileLayer.onZoomStart(true);}
        me.eachLayer(zoomLayer,me.getAllLayers());
        this.hideOverlayLayers();
        me.animateStart(scale,focusPos);
        me.fireEvent('zoomstart',{'target':this});
    },

    onZoomEnd:function(nextZoomLevel) {
        function zoomLayer(layer) {
            if (layer&&layer.onZoomEnd) {
                layer.onZoomEnd();
            }
        }
        
        this.insertBackgroundDom();
        if (this.baseTileLayer) {this.baseTileLayer.clear();}
        this.animateEnd();
        this.resetContainer();
        this.originZoomLevel=nextZoomLevel;     
        if (this.baseTileLayer) {this.baseTileLayer.onZoomEnd();}
        this.eachLayer(zoomLayer,this.getAllLayers());
        this.showOverlayLayers();
        this.fireEvent('zoomend',{'target':this});
    },

    resetContainer:function() {
        var position = this.offsetPlatform();
        Z.DomUtil.offsetDom(this.panels.mapPlatform,{'left':0,'top':0});
        this.refreshSVGPaper();
        if (this.backgroundDOM) {
            //Z.DomUtil.offsetDom(this.backgroundDOM,position);
            this.backgroundDOM.style.left=position["left"]+"px";
            this.backgroundDOM.style.top=position["top"]+"px";
        }
    },

    insertBackgroundDom:function() {
        this.backgroundDOM = this.panels.mapContainer.cloneNode(true);
        this.panels.mapPlatform.insertBefore(this.backgroundDOM,this.panels.mapViewPort);
    },

    checkZoomLevel:function(nextZoomLevel) {
        if (nextZoomLevel < this.minZoomLevel){
            nextZoomLevel = this.minZoomLevel;
        }
        if (nextZoomLevel > this.maxZoomLevel) {
            nextZoomLevel = this.maxZoomLevel;
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
        var nextZoomLevel = me.checkZoomLevel(me.zoomLevel+1);
        if (nextZoomLevel === me.zoomLevel) {
            var move = {
                'top':(mousePos['top']-me.height/2)/2,
                'left':(me.width/2-mousePos['left'])/2
                };
            me.offsetCenterByPixel(move);
            me.offsetPlatform(move);
            
            if (me.baseTileLayer) {me.baseTileLayer.onZoomEnd();}
            me.eachLayer(zoomLayer,me.getAllLayers());
            return;
        }
        me.zoom(nextZoomLevel, param['pixel']);
    },

    zoom:function(nextZoomLevel, focusPos) {
        if (!this.options['enableZoom']) {return;}
        this.allowSlideMap=false;
        nextZoomLevel = this.checkZoomLevel(nextZoomLevel);
        if (this.originZoomLevel === nextZoomLevel) {
            return;
        }
        this.zooming = true;
        if (!focusPos) {
            focusPos = {
                'top':this.height/2,
                'left':this.width/2
            };
        }
        this.removeBackGroundDOM();
        var resolutions=this.lodConfig['resolutions'];
        this.zoomLevel=nextZoomLevel;
        var scale = resolutions[this.originZoomLevel]/resolutions[nextZoomLevel];
        var pixelOffset;
        var zScale;
        if (nextZoomLevel<this.originZoomLevel) {               
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
        this.offsetCenterByPixel(pixelOffset);
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
        var domOffset = this.offsetPlatform();
        var offsetTop = domOffset['top'];
        var offsetLeft = domOffset['left']; 
        var mapContainer = this.panels.mapContainer;
        this.panels.mapContainer.className="MAP_ZOOM_ANIMATED";         
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
        var mapContainer = this.panels.mapContainer;
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

