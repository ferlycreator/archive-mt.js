Z.CanvasLayer.Base=Z.OverlayLayer.extend({
    //load,_onMoving, _onMoveEnd, _onResize, _onZoomStart, _onZoomEnd

    //GeometryID的counter
    _stamp:0,

    initialize:function() {
        this.resourceLoader = new Z.ResourceLoader();
    },

    load:function() {
        // this._geoCache = [];
        var map = this.getMap();
        this.layerContainer = map._panels.canvasLayerContainer;
        this._createLayerCanvas();
        // this.refreshCache();
        this._repaint();
    },

    _createLayerCanvas:function() {
        if (!this.layerCanvas) {
            var map = this.getMap();
            if (!this.layerContainer || !map) {return;}

            //初始化
            var layerCanvas = Z.DomUtil.createEl('canvas');
            layerCanvas.style.cssText = 'position:absolute;top:0px;left:0px;';
            this._updateCanvasSize(layerCanvas);
            this.layerContainer.appendChild(layerCanvas);
            this.layerCanvas = layerCanvas;
            this.canvasCtx = this.layerCanvas.getContext("2d");
            this.canvasCtx.translate(0.5, 0.5);
        }
    },

    _updateCanvasSize:function(canvas) {
        var mapSize = this.map.getSize();
        //retina屏支持
        var r = Z.Browser.retina ? 2:1;
        canvas.height = r * mapSize['height'];
        canvas.width = r * mapSize['width'];
        canvas.style.width = mapSize['width']+'px';
        canvas.style.height = mapSize['height']+'px';
    },

    /**
     * 清除缓存
     * @return {[type]} [description]
     */
    /*clearCache:function() {
        this._geoCache = [];
    },*/

    /**
     * 从CanvasLayer中载入所有的geometry
     * @return {[type]} [description]
     */
    /*refreshCache:function() {
        var layers = this._getLayerList();
        this.clearCache();
        if (!Z.Util.isArrayHasData(layers)) {
            return;
        }
        var cache = [];
        for (var i=0, len=layers.length;i<len;i++) {
            if (!layers[i].isVisible()) {
                continue;
            }
            var geos = layers[i].getAllGeometries();
            if (Z.Util.isArrayHasData(geos)) {
                cache = cache.concat(geos);
            }
        }
        this._geoCache=cache;
    },*/

    /**
     * 不载入Geometry并绘制
     * @param  {boolean} isRealTime 是否是实时绘制
     * @return {[type]}        [description]
     */
    _repaint:function(isRealTime) {
        //延迟执行,减少刷新次数
        var me = this;
        if (isRealTime) {
            me._doRepaint();
        } else {
            if (this.repaintTimeout) {
                clearTimeout(this.repaintTimeout);
            }
            this.repaintTimeout = setTimeout(function() {
                me._doRepaint();
            },10);
        }


    },

    _doRepaint:function() {
        this._loadResource(function(){
            var me = this;
            var map = me.getMap();
            var mapSize = map.getSize();
            me.canvasCtx.clearRect(0, 0, mapSize['width'], mapSize['height']);
            var mapExtent = map.getExtent();
            /*me.layerCanvas.width = mapSize.width;
            me.layerCanvas.height = mapSize.height;*/
            me._updateCanvasSize(me.layerCanvas);
            var containerOffset = map._offsetPlatform();
            me.layerCanvas.style.left=(-containerOffset['left'])+"px";
            me.layerCanvas.style.top=(-containerOffset['top'])+"px";
            //载入资源后再进行绘制
            me._repaintInExtent(mapExtent);
        });
    },

    /**
     * 重绘某一个区域的图形
     * @param  {[type]} extent [description]
     * @return {[type]}        [description]
     */
    _repaintInExtent:function(extent) {
        var me = this;
        var map = me.getMap();
        var mapExtent = map.getExtent();
        if (extent && Z.Extent.isIntersect(extent, mapExtent)) {
            this._clearCanvas(extent);
            me._eachGeometry(function(geo) {
                if (!geo || !geo.isVisible()) {
                    return;
                }
                var ext = geo._computeVisualExtent(geo._getProjection());
                if (!ext || !Z.Extent.isIntersect(ext,extent)) {
                    return;
                }
                geo._getPainter().paint(me.canvasCtx,me.resourceLoader);
            });
        }
    },

    _clearCanvas:function(extent) {
        var map = this.getMap(),
            projection = map._getProjection();
        var p1 = projection.project({x:extent['xmin'],y:extent['ymin']}),
            p2 = projection.project({x:extent['xmax'],y:extent['ymax']});
        var px1 = map._untransform(p1),
            px2 = map._untransform(p2);
        this.canvasCtx.clearRect(Math.min(px1['left'],px2['left']), Math.min(px1['top'],px2['top']),
                                    Math.abs(px1['left']-px2['left']), Math.abs(px1['top']-px2['top']));
    },

    _loadResource:function(onComplete) {
        var me = this;
        //20150530 loadResource不加载canvasLayer中的geometry icon资源，故每次绘制canvas都去重新检查并下载资源
        //if (!me.resourceLoaded) {
            var map = me.getMap();
            var mapExtent = map.getExtent();
            me._eachGeometry(function(geo) {
                if (!geo || !geo.isVisible()) {
                    return;
                }
                var ext = geo.getExtent();
                if (!ext || !Z.Extent.isIntersect(ext,mapExtent)) {
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
        //} else {
            //onComplete.call(me);
        //}

    },

    /**
     * 遍历geometry
     * @param  {Function} fn 回调函数
     */
    _eachGeometry:function(fn,obj) {
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

    _onMoving:function(param) {
        //nothing to do
    },

    _onMoveEnd:function(param) {
        this._repaint();
    },

    _onResize:function(param) {
        this._repaint();
    },

    _onZoomStart:function(param) {
        this.hide();
        var mapSize = this.getMap().getSize();
        this.canvasCtx.clearRect(0, 0, mapSize['width'], mapSize['height']);
    },

    _onZoomEnd:function(param) {
        this._repaint();
        this.show();
    },

    _setZIndex:function() {
       //nothing to do
    }
});