Z.render.tilelayer.Canvas = Z.render.Canvas.extend({

    initialize:function(layer) {
        this._layer = layer;
        this._mapRender = layer.getMap()._getRender();
        this._tileMap={};
        this._tileCache = new Z.TileLayer.TileCache();
        this._registerEvents();
        this._tileQueue = {};
    },

    _registerEvents:function() {
        var map = this.getMap();
        map.on('_moveend _resize _zoomend',this.rend,this);

        // map.on('_moving',this.rend,this);
    },

    remove:function() {
        var map = this.getMap();
        map.off('_moveend _resize _zoomend',this.rend,this);
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
        this._tileMap = {};
        // this._clearContext();
        this._requestMapToRend();
    },

    rend:function(options) {
        this._rending = true;
        var tileGrid = this._layer._getTiles(this.getMap().getSize().multi(2.2));
        var tiles = tileGrid['tiles'];
        var fullTileExtent = tileGrid['fullExtent'];
        if (!this._canvas) {
            this._createCanvas();
            Z.Canvas.enableImageSmoothing(this._context);
        }
        //canvas大小不做缩小, 只根据需要增大, 直到超过系统允许: testCanvas 结果为false
        var preZ = this._z;
        this._z = this.getMap().getZoomLevel();
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
                    console.log('draw cached tile');
                    //画瓦片
                    this._drawTile(tile['viewPoint'], cached);
            } else {
                if (mapViewExtent.isIntersect(new Z.Extent(tile['viewPoint'], tile['viewPoint'].add(new Z.Point(tileSize['width'], tileSize['height']))))) {
                    this._tileToLoadCounter++;
                    this._tileQueue[tileId] = tile;
                }
            }
        }
        this._requestMapToRend();
        this._rending = false;
        if (this._tileToLoadCounter === 0){
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
        var propertyOfPointOnTile = '--maptalks-tile-point',
            propertyOfTileId = '--maptalks-tile-id';
        function onTileLoad() {
            me._tileCache.add(this[propertyOfTileId], this);
            me._drawTileAndRequest(this[propertyOfPointOnTile], this);

        }
        function onTileError() {
            me._tileCache.remove(tileImage[propertyOfTileId], this);
            me._clearTileRectAndRequest(this[propertyOfPointOnTile],this);
        }

        for (var p in this._tileQueue) {
            if (this._tileQueue.hasOwnProperty(p) && !this._tileCache[p]) {
                var tile = this._tileQueue[p];
                delete this._tileQueue[p];
                var tileImage = new Image();
                tileImage[propertyOfTileId]=p;
                tileImage[propertyOfPointOnTile] = tile['viewPoint'];
                tileImage.onload = onTileLoad;
                tileImage.onabort = onTileError;
                tileImage.onerror = onTileError;
                //
                tileImage.src = tile['url'];
            }
        }

    },



    _drawTile:function(point, tileImage) {
        var tileSize = this._layer._getTileSize();
        Z.Canvas.image(this._context, point.substract(this._canvasFullExtent.getMin()), tileImage, tileSize['width'],tileSize['height']);
    },

    /**
     * 绘制瓦片, 并请求地图重绘
     * @param  {Point} point        瓦片左上角坐标
     * @param  {Image} tileImage 瓦片图片对象
     */
    _drawTileAndRequest:function(point, tileImage) {
        this._tileToLoadCounter--;


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
    },

    _requestMapToRend:function() {
        if (!this.getMap().isBusy()) {
            this._mapRender.rend();
        }
    },

    _fireLoadedEvent:function() {
        this._layer.fire('layerloaded');
    },

    clearExecutors:function() {
        //nothing to do
    },

    initContainer:function() {

    }

});
