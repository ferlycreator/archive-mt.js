Z.render.tilelayer.Canvas = Z.render.Canvas.extend({

    propertyOfPointOnTile   : '--maptalks-tile-point',
    propertyOfTileId        : '--maptalks-tile-id',
    propertyOfTileZoom      : '--maptalks-tile-zoom',

    initialize:function(layer) {
        this._layer = layer;
        this._mapRender = layer.getMap()._getRender();
        this._tileCache = new Z.TileLayer.TileCache();
        this._registerEvents();
        this._tileQueue = {};
    },

    remove:function() {
        var map = this.getMap();
        map.off('_moveend _resize _zoomend',this._onMapEvent,this);
        if (this._onMapMoving) {
            map.off('_moving',this._onMapMoving,this);
        }
        this._requestMapToRend();
    },

    getMap: function() {
        return this._layer.getMap();
    },

    show:function() {
        this.render();
    },

    hide:function() {
        this._requestMapToRend();
    },

    setZIndex:function(zIndex) {
        this._requestMapToRend();
    },

    clear:function() {
        this._clearCanvas();
        this._requestMapToRend();
    },

    clearExecutors:function() {
        clearTimeout(this._loadQueueTimeout);
    },

    initContainer:function() {

    },

    render:function() {
        var tileGrid = this._layer._getTiles();
        if (!tileGrid) {
            return;
        }
        this._rending = true;
        if (!this._canvas) {
            this._gradualLoading = true;
            this._createCanvas();
        }

        if (!this._tileRended) {
            this._tileRended = {};
        }
        this._tileZoom = this.getMap().getZoom();
        var tileRended = this._tileRended;
        this._tileRended = {};

        var tiles = tileGrid['tiles'],
            tileCache = this._tileCache,
            tileSize = this._layer._getTileSize();

        this._canvasFullExtent =  this.getMap()._getViewExtent();
        //遍历瓦片
        this._tileToLoadCounter = 0;
        this._clearCanvas();

        for (var i = tiles.length - 1; i >= 0; i--) {
            var tile = tiles[i];
            var tileId = tiles[i]['id'];
            //如果缓存中已存有瓦片, 则从不再请求而从缓存中读取.
            var cached = tileRended[tileId] || tileCache.get(tileId);
            if (cached) {
                    //画瓦片
                    this._drawTile(tile['viewPoint'], cached);
                    this._tileRended[tileId] = cached;
            } else {
                if (this._canvasFullExtent.intersects(new Z.Extent(tile['viewPoint'], tile['viewPoint'].add(new Z.Point(tileSize['width'], tileSize['height']))))) {
                    this._tileToLoadCounter++;
                    this._tileQueue[tileId+"@"+tile['viewPoint'].toString()] = tile;
                }
            }
        }

        this._rending = false;
        if (this._tileToLoadCounter === 0){
            this._requestMapToRend();
            this._fireLoadedEvent();
        } else {
            this._totalTileToLoad = this._tileToLoadCounter;
            this._scheduleLoadTileQueue();
        }

    },

    getCanvasImage:function() {
        if (!this._canvasFullExtent || this._tileZoom !== this.getMap().getZoom()) {
            return null;
        }
        var gradualOpacity = null;
        if (this._gradualLoading && this._totalTileToLoad && this._layer.options['gradualLoading']) {
            gradualOpacity = ((this._totalTileToLoad - this._tileToLoadCounter) / this._totalTileToLoad) * 2;
            if (gradualOpacity > 1) {
                gradualOpacity = 1;
            }
        }

        var size = this._canvasFullExtent.getSize();
        var point = this._canvasFullExtent.getMin();
        return {'image':this._canvas,'layer':this._layer,'point':this.getMap()._viewPointToContainerPoint(point),'size':size,'opacity':gradualOpacity};
    },

    _scheduleLoadTileQueue:function() {

        if (this._loadQueueTimeout) {
            clearTimeout(this._loadQueueTimeout);
        }

        var me = this;
        this._loadQueueTimeout = setTimeout(function(){me._loadTileQueue();},10);
    },

    _loadTileQueue:function() {
        var me = this;

        function onTileLoad() {
            me._tileCache.add(this[me.propertyOfTileId], this);
            me._tileRended[me.propertyOfTileId] = this;
            me._drawTileAndRequest(this);

        }
        function onTileError() {
            me._tileCache.remove(tileImage[me.propertyOfTileId], this);
            me._clearTileRectAndRequest(this);
        }
        var crossOrigin = this._layer.options['crossOrigin'];
        var tileSize = this._layer._getTileSize();
        for (var p in this._tileQueue) {
            if (this._tileQueue.hasOwnProperty(p)) {
                var tileId = p.split('@')[0];
                var tile = this._tileQueue[p];
                delete this._tileQueue[p];
                if (!this._tileCache[tileId]) {
                    var tileImage = new Image();
                    tileImage.width = tileSize['width'];
                    tileImage.height = tileSize['height'];
                    tileImage[this.propertyOfTileId]=tileId;
                    tileImage[this.propertyOfPointOnTile] = tile['viewPoint'];
                    tileImage[this.propertyOfTileZoom] = tile['zoom'];
                    tileImage.onload = onTileLoad;
                    tileImage.onabort = onTileError;
                    tileImage.onerror = onTileError;
                    if (crossOrigin) {
                        tileImage.crossOrigin = crossOrigin;
                    }
                    Z.Util.loadImage(tileImage, tile['url']);
                } else {
                    this._drawTileAndRequest(this._tileCache[tileId]);
                }

            }
        }

    },



    _drawTile:function(point, tileImage) {
        if (!point) {
            return;
        }
        var tileSize = this._layer._getTileSize();
        var opacity = this._layer.config()['opacity'];
        var isFaded = !Z.Util.isNil(opacity) && opacity < 1;
        var alpha;
        if (isFaded) {
            alpha = this._context.globalAlpha;
            if (opacity <= 0) {
                return;
            }
            this._context.globalAlpha = opacity;
        }
        Z.Canvas.image(this._context, point.substract(this._canvasFullExtent.getMin()), tileImage, tileSize['width'],tileSize['height']);
        if (isFaded) {
            this._context.globalAlpha = alpha;
        }
    },

    /**
     * 绘制瓦片, 并请求地图重绘
     * @param  {Point} point        瓦片左上角坐标
     * @param  {Image} tileImage 瓦片图片对象
     */
    _drawTileAndRequest:function(tileImage) {
        var zoomLevel = this.getMap().getZoom();
        if (zoomLevel !== tileImage[this.propertyOfTileZoom]) {
            return;
        }

        this._tileToLoadCounter--;
        var point = tileImage[this.propertyOfPointOnTile];
        this._drawTile(point, tileImage);

        var tileSize = this._layer._getTileSize();
        var viewExtent = this.getMap()._getViewExtent();
        if (viewExtent.intersects(new Z.Extent(point, point.add(new Z.Point(tileSize['width'], tileSize['height']))))) {
            this._requestMapToRend();
        }
        if (this._tileToLoadCounter === 0) {
             this._fireLoadedEvent();
        }
    },

    /**
     * 清除瓦片区域, 并请求地图重绘
     * @param  {Point} point        瓦片左上角坐标
     */
    _clearTileRectAndRequest:function(point,tileImage) {
        this._tileToLoadCounter--;
        if (this._tileToLoadCounter === 0) {
             this._fireLoadedEvent();
        }
    },

    _requestMapToRend:function() {
        var me = this;
        if (this.getMap() && !this.getMap().isBusy()) {
            if (Z.runningInNode && this._canvas && this._canvas.toBuffer) {
                //node-canvas's buffer may be async
                this._canvas.toBuffer(function(err, buf) {
                    if (err == null) {
                        me._mapRender.render();
                    } else {
                        console.error(err);
                    }
                })
            } else {
                this._mapRender.render();
            }
        }
    },

    _registerEvents:function() {
        var map = this.getMap();
        map.on('_moveend _zoomend _resize',this._onMapEvent,this);
        if (this._layer.options['renderWhenPanning']) {
        var rendSpan = this._layer.options['renderSpanWhenPanning'];
            if (Z.Util.isNumber(rendSpan) && rendSpan >= 0) {
                if (rendSpan > 0) {
                    this._onMapMoving = Z.Util.throttle(function() {
                            this._gradualLoading = false;
                            this.render();
                        },rendSpan,this);
                } else {
                    this._onMapMoving = function() {
                            this._gradualLoading = false;
                            this.render();
                        };
                }
                map.on('_moving',this._onMapMoving,this);
            }
        }

    },

    _onMapEvent:function(param) {
        if (param['type'] === '_moveend' || param['type'] === '_zoomend') {
            if (param['type'] === '_zoomend') {
                this._gradualLoading = true;
            } else {
                this._gradualLoading = false;
            }
            this.render();
        } else if (param['type'] === '_resize') {
            this._resizeCanvas();
            this.render();
        }
    },

    _fireLoadedEvent:function() {
        this._layer.fire('layerloaded');
    }

});
