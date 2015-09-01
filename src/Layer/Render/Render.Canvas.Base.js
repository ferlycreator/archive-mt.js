Z.Render.Canvas.Base=function(map) {
    this.map = map;
    this.resourceLoader = new Z.ResourceLoader();
};

Z.Util.extend(Z.Render.Canvas.Base, {
    getBaseCanvasRender:function(map) {
        return map._baseCanvasRender;
    },

    registerBaseCanvasRender:function(map, baseCanvasRender) {
        map._baseCanvasRender = baseCanvasRender;
    }
});

    //load,_onMoving, _onMoveEnd, _onResize, _onZoomStart, _onZoomEnd
Z.Render.Canvas.Base.prototype={

    load:function() {
        if (!this.canvasContainer) {
            var map = this.getMap();
            this.canvasContainer = map._panels.canvasLayerContainer;
            this.createLayerCanvas();
        }
        this.repaint();
    },

    getMap:function() {
        return this.map;
    },

    createLayerCanvas:function() {
        if (!this.layerCanvas) {
            if (!this.canvasContainer) {return;}
            //初始化
            var layerCanvas = Z.DomUtil.createEl('canvas');
            layerCanvas.style.cssText = 'position:absolute;top:0px;left:0px;';
            this.updateCanvasSize(layerCanvas);
            this.canvasContainer.appendChild(layerCanvas);
            this.layerCanvas = layerCanvas;
            this.canvasCtx = this.layerCanvas.getContext("2d");
            this.canvasCtx.translate(0.5, 0.5);
        }
    },

    updateCanvasSize:function(canvas) {
        var mapSize = this.map.getSize();
        //retina屏支持
        var r = Z.Browser.retina ? 2:1;
        canvas.height = r * mapSize['height'];
        canvas.width = r * mapSize['width'];
        canvas.style.width = mapSize['width']+'px';
        canvas.style.height = mapSize['height']+'px';
    },

    /**
     * 不载入Geometry并绘制
     * @param  {boolean} isRealTime 是否是实时绘制
     * @return {[type]}        [description]
     */
    repaint: function(isRealTime) {
        //延迟执行,减少刷新次数
        var me = this;
        if (isRealTime) {
            me.doRepaint();
        } else {
            if (this.repaintTimeout) {
                clearTimeout(this.repaintTimeout);
            }
            this.repaintTimeout = setTimeout(function() {
                me.doRepaint();
            },10);
        }
    },

    doRepaint:function() {
        var resourceLoad = this.resourceLoader;
        if(resourceLoad.imgUrls || resourceLoad.defaultIconUrl) {
            this.loadResource(this._doRepaint());
        } else {
            this._doRepaint();
        }
    },

    _doRepaint: function() {
        var me = this;
        var map = me.getMap();
        var mapSize = map.getSize();
        me.canvasCtx.clearRect(0, 0, mapSize['width'], mapSize['height']);
        var mapExtent = map.getExtent();
        me.updateCanvasSize(me.layerCanvas);
        var containerOffset = map.offsetPlatform();
        me.layerCanvas.style.left=(-containerOffset['left'])+"px";
        me.layerCanvas.style.top=(-containerOffset['top'])+"px";
        //载入资源后再进行绘制
        me.repaintInExtent(mapExtent);
    },

    /**
     * 重绘某一个区域的图形
     * @param  {[type]} extent [description]
     * @return {[type]}        [description]
     */
    repaintInExtent:function(extent) {
        var me = this;
        var map = me.getMap();
        var mapExtent = map.getExtent();
        if (extent && extent.isIntersect(mapExtent)) {
            this.clearCanvas(extent);
            me.eachGeometry(function(geo) {
                if (!geo || !geo.isVisible()) {
                    return;
                }
                var ext = geo._computeVisualExtent(geo._getProjection());
                if (!ext || !ext.isIntersect(extent)) {
                    return;
                }
                geo._getPainter().paint(me.canvasCtx,me.resourceLoader);
            });
        }
    },

    clearCanvas:function(extent) {
        var map = this.getMap(),
            projection = map._getProjection();
        var p1 = projection.project(new Z.Coordinate(extent['xmin'],extent['ymin'])),
            p2 = projection.project(new Z.Coordinate(extent['xmax'],extent['ymax']));
        var px1 = map._transform(p1),
            px2 = map._transform(p2);
        this.canvasCtx.clearRect(Math.min(px1['left'],px2['left']), Math.min(px1['top'],px2['top']),
                                    Math.abs(px1['left']-px2['left']), Math.abs(px1['top']-px2['top']));
    },

    loadResource:function(onComplete) {
        var me = this;
        //20150530 loadResource不加载canvasLayer中的geometry icon资源，故每次绘制canvas都去重新检查并下载资源
        //if (!me.resourceLoaded) {
        var map = me.getMap();
        var mapExtent = map.getExtent();
        me.eachGeometry(function(geo) {
            if (!geo || !geo.isVisible()) {
                return;
            }
            var ext = geo.getExtent();
            if (!ext || !ext.isIntersect(mapExtent)) {
                return;
            }
            var resource = geo._getExternalResource();
            if (resource) {
                me.resourceLoader.addResource(resource);
            }
        });
        me.resourceLoader.load(function() {
            me.resourceLoaded = true;
            onComplete.call(me);
        });
    },

    _getLayerList:function() {
        return this.getMap()._canvasLayers;
    },

    /**
     * 遍历geometry
     * @param  {Function} fn 回调函数
     */
    eachGeometry:function(fn,obj) {
        var layers = this._getLayerList();
        if (!Z.Util.isArrayHasData(layers)) {
            return;
        }
        if (!obj) {
            obj=this;
        }
        for (var i=0, len=layers.length;i<len;i++) {
            if (!layers[i] || !layers[i].isVisible()) {
                continue;
            }
            var cache = layers[i]._getGeoCache();
            if (!cache) {
                continue;
            }
            for (var p in cache) {
                if (cache.hasOwnProperty(p)) {
                    fn.call(obj,cache[p]);
                }
            }
        }
    },

    hide:function() {
        if (this.layerCanvas) {
            this.layerCanvas.style.display="none";
        }
    },

    show:function() {
        if (this.layerCanvas) {
            this.layerCanvas.style.display="";
        }
    },

    _onZoomStart:function(param) {
        this.hide();
        var mapSize = this.getMap().getSize();
        this.canvasCtx.clearRect(0, 0, mapSize['width'], mapSize['height']);
    },

    _onZoomEnd:function(param) {
        this.repaint();
        this.show();
    },

    getCanvasContainer:function() {
        return this.layerCanvas;
    }

};