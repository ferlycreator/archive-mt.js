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

    _registerEvents:function() {
        var map = this.getMap();
        map.on('_moveend _resize _zoomend',this.rend,this);
        this._onMapMoving = Z.Util.throttle(this.rend,200,this);
        if (this._layer.options['rendWhenPanning']) {
            map.on('_moving',this._onMapMoving,this);
        }
    },

    remove:function() {
        var map = this.getMap();
        map.off('_moveend _resize _zoomend',this.rend,this);
        if (this._onMapMoving) {
            map.off('_moving',this._onMapMoving,this);
        }
        this._requestMapToRend();
    },

    getMap: function() {
        return this._layer.getMap();
    },

    show:function() {
        this.rend();
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

    rend:function(options) {
        var tileGrid = this._layer._getTiles(/*this.getMap().getSize().multi(2.2)*/);
        if (!tileGrid) {
            return;
        }
        this._rending = true;
        var tiles = tileGrid['tiles'];
        var fullTileExtent = tileGrid['fullExtent'];
        if (!this._canvas) {
            this._createCanvas();
            Z.Canvas.enableImageSmoothing(this._context);
        }
        //canvas大小不做缩小, 只根据需要增大, 直到超过系统允许: testCanvas 结果为false
        var preZ = this._z;
        this._z = this.getMap().getZoom();
        if (this._z !== preZ) {
            this._canvasFullExtent = fullTileExtent;
            this._resizeCanvas(fullTileExtent.getSize());
            // this._drawedTile = {};
        } else {
            var preSize = this._canvasFullExtent.getSize();
            this._canvasFullExtent = fullTileExtent;
            var extentSize = fullTileExtent.getSize();
            if (!preSize.equals(extentSize)) {
                // this._drawedTile = {};
                this._resizeCanvas(this._canvasFullExtent.getSize());
            } else {
                this._clearCanvas();
            }
        }

        var tileCache = this._tileCache;
        var mapViewExtent = this.getMap()._getViewExtent();
        var tileSize = this._layer._getTileSize();
        //遍历瓦片
        this._tileToLoadCounter = 0;
        for (var i = tiles.length - 1; i >= 0; i--) {
            var tile = tiles[i];
            var tileId = tiles[i]['id'];
            /*if (this._drawedTile[tileId]) {
                continue;
            }*/
            //如果缓存中已存有瓦片, 则从不再请求而从缓存中读取.
            var cached = tileCache.get(tileId);
            if (cached) {
                    //画瓦片
                    this._drawTile(tile['viewPoint'], cached);
            } else {
                if (mapViewExtent.isIntersect(new Z.Extent(tile['viewPoint'], tile['viewPoint'].add(new Z.Point(tileSize['width'], tileSize['height']))))) {
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
            this._scheduleLoadTileQueue();
        }

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
            me._drawTileAndRequest(this);

        }
        function onTileError() {
            me._tileCache.remove(tileImage[me.propertyOfTileId], this);
            me._clearTileRectAndRequest(this);
        }

        for (var p in this._tileQueue) {
            if (this._tileQueue.hasOwnProperty(p)) {
                var tileId = p.split('@')[0];
                var tile = this._tileQueue[p];
                delete this._tileQueue[p];
                if (!this._tileCache[tileId]) {
                    var tileImage = new Image();
                    tileImage[this.propertyOfTileId]=tileId;
                    tileImage[this.propertyOfPointOnTile] = tile['viewPoint'];
                    tileImage[this.propertyOfTileZoom] = tile['zoom'];
                    tileImage.onload = onTileLoad;
                    tileImage.onabort = onTileError;
                    tileImage.onerror = onTileError;
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
        if (isFaded) {
            if (opacity <= 0) {
                return;
            }
            this._context.save();
            this._context.globalAlpha = opacity;
        }
        Z.Canvas.image(this._context, point.substract(this._canvasFullExtent.getMin()), tileImage, tileSize['width'],tileSize['height']);
        if (isFaded) {
            this._context.restore();
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
        if (viewExtent.isIntersect(new Z.Extent(point, point.add(new Z.Point(tileSize['width'], tileSize['height']))))) {
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
        /*var tileSize = this._layer._getTileSize();
        Z.Canvas.clearRect(this._context, point['left'], point['top'], tileSize['width'],tileSize['height']);
        this._requestMapToRend();*/
        this._tileToLoadCounter--;
        if (this._tileToLoadCounter === 0) {
             this._fireLoadedEvent();
        }
    },

    _requestMapToRend:function() {
        if (!this.getMap().isBusy()) {
            this._mapRender.rend();
        }
    },

    _fireLoadedEvent:function() {
        this._layer.fire('layerloaded');
    }

});
