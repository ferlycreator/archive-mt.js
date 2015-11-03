Z.render.tilelayer.Canvas = Z.render.Canvas.extend({

    initialize:function(layer) {
        this.layer = layer;
        this._mapRender = layer.getMap()._getRender();
        this._tileMap={};
        this._tileCache = new Z.TileLayer.TileCache();
        this._registerEvents();
    },

    _registerEvents:function() {
        var map = this.getMap();
        map.on('_moveend _resize _zoomend',this.rend,this);
        map.on('_moving',Z.Util.throttle(this.rend,200,this),this);
    },

    remove:function() {
        var map = this.getMap();
        map.off('_moveend _resize _zoomend',this.rend,this);
        this._requestMapToRend();
    },

    getMap: function() {
        return this.layer.getMap();
    },

    show:function() {
        this._requestMapToRend();
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

    rend:function() {
        if (!this._canvas) {
            this._createCanvas();
        }

        var tileGrid = this.layer._getTiles();
        var tiles = tileGrid['tiles'];
        var fullTileExtent = tileGrid['fullExtent'];
        var me=this;
        var propertyOfPointOnTile = '--maptalks-tile-point';

        function onTileLoad() {
            me._drawTileAndRequest(this[propertyOfPointOnTile], this);

        }
        function onTileError() {
            me._clearTileRectAndRequest(this[propertyOfPointOnTile]);
        }
        // var preTileCache = this._tileCache;
        // this._tileCache = {};
        //计算fullTileExtent
        var tileCache = this._tileCache;
        var preFullTileExtent = this._fullTileExtent;
        this._fullTileExtent = fullTileExtent;
        if (!preFullTileExtent || !preFullTileExtent.equals(fullTileExtent)) {
            this._resizeCanvas(this._fullTileExtent.getWidth(), this._fullTileExtent.getHeight());
        } else {
            //相同
            return;
        }
        //遍历瓦片
        var counter = 0;
        for (var i = tiles.length - 1; i >= 0; i--) {
            var tile = tiles[i];
            var tileId = tiles[i]['id'];
            //如果缓存中已存有瓦片, 则从不再请求而从缓存中读取.
            var cached = tileCache.get(tileId);
            if (cached) {
                if (cached['complete']) {
                    //画瓦片
                    this._drawTile(tile['viewPoint'], cached);
                }
            } else {
                var tileImage = new Image();
                tileImage[propertyOfPointOnTile] = tile['viewPoint'];
                tileImage.onload = onTileLoad;
                tileImage.onabort = onTileError;
                tileImage.onerror = onTileError;
                tileCache.add(tileId, tileImage);
                counter++;
                tileImage.src = tiles[i]['url'];
            }
        }
        if (counter === 0){
            this._requestMapToRend();
        }
    },

    _drawTile:function(point, tileImage) {
        var tileSize = this.layer._getTileSize();
        Z.Canvas.image(this._context, point.substract(this._fullTileExtent.getMin()), tileImage, tileSize['width'],tileSize['height']);
    },

    /**
     * 绘制瓦片, 并请求地图重绘
     * @param  {Point} point        瓦片左上角坐标
     * @param  {Image} tileImage 瓦片图片对象
     */
    _drawTileAndRequest:function(point, tileImage) {
        var tileSize = this.layer._getTileSize();
        this._drawTile(point, tileImage);
        var viewExtent = this.getMap()._getViewExtent();
        if (viewExtent.isIntersect(new Z.Extent(point, point.add(new Z.Point(tileSize['width'], tileSize['height']))))) {
            this._requestMapToRend();
        }/* else {
            console.log('out of box');
        }*/
    },

    /**
     * 清除瓦片区域, 并请求地图重绘
     * @param  {Point} point        瓦片左上角坐标
     */
    _clearTileRectAndRequest:function(point) {
        /*var tileSize = this.layer._getTileSize();
        Z.Canvas.clearRect(this._context, point['left'], point['top'], tileSize['width'],tileSize['height']);
        this._requestMapToRend();*/
    },

    _requestMapToRend:function() {
        // this._mapRender.rend();
        if (this._askMapToRendTimeout) {
            clearTimeout(this._askMapToRendTimeout);
        }
        var me = this;
        this._askMapToRendTimeout=setTimeout(function() {
            me._mapRender.rend();
        },50);

    },

    getCanvasImage:function() {
        if (!this._fullTileExtent) {
            return null;
        }
        var point = this._fullTileExtent.getMin();
        return {'canvas':this._canvas,'point':this.getMap()._viewPointToContainerPoint(point)};
    },

    clearExecutors:function() {
        //nothing to do
    },

    initContainer:function() {

    }

});
