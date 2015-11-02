Z.render.tilelayer.Canvas = Z.render.Canvas.extend({

    initialize:function(layer) {
        this.layer = layer;
        this._mapRender = layer.getMap()._getRender();
        this._tileMap={};
    },

    getMap: function() {
        return this.layer.getMap();
    },

    /**
     * 是否懒载入? 即连续多次请求时, 只响应最后一次
     * @return {Boolean} true | false
     */
    isLazy:function() {
        return false;
    },

    //瓦片图层的基础ZIndex
    // baseZIndex:15,

    remove:function() {
        this._requestMapToRend();
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
        this._requestMapToRend();
    },

    _requestMapToRend:function() {
        this._mapRender.rendLayer(this.layer);
    },

    /**
     * 生成资源载入Promise
     * @return {[Promise]} 资源载入的Promise
     */
    promise:function() {
        var map = this.getMap();
        var me = this;
        //中心点不变时, 不做渲染
        var z=map.getZoomLevel(), preZ = this._preZ,
            c = map.getCenter(), preC = this._preC;
        if (this._drawed === false || (z === preZ && c.equals(preC))) {
            return false;
        }
        this._drawed=false;
        this._preZ = z;
        this._preC = c;
        this._tiles=[];
        var preTileImages = this._tileImages;
        this._tileImages = {};
        function promiseCallback(fn, tile, image) {
            var tile = {'tile' : tile,'image' : image};
            me._tiles.push(tile);
            return function() {
                        fn(tile);
                    };
        }


        var preFullTileExtent = this._fullTileExtent;
        if (z !== preZ) {
            preFullTileExtent = null;
        }

        var promises = [];
        // var canvasExtent = new Z.Extent(0,0,size['width'], size['height']);
        var tiles = this.layer._getTiles();
        var tileSize = this.layer._getTileSize();

        var fullTileExtent = new Z.Extent();

        for (var i = tiles.length - 1; i >= 0; i--) {
            var tileId = tiles[i]['id'];
            var tile = tiles[i];
            var nw = tile['viewPoint'];
            var tileExtent = new Z.Extent(nw, nw.add(new Z.Point(tileSize['width'],tileSize['height'])));
            fullTileExtent = Z.Extent.combine(fullTileExtent,tileExtent);
            if (preTileImages && preTileImages[tileId]) {
                this._tiles.push({'tile':tile,'image' : preTileImages[tileId]});
                this._tileImages[tileId] = preTileImages[tileId];
            } else {
                var promise = new Z.Promise(function(resolve, reject) {
                        var tileImage = new Image();
                        tileImage.onload = promiseCallback(resolve, tile, tileImage);
                        tileImage.onabort = promiseCallback(resolve, tile, tileImage);
                        tileImage.onerror = promiseCallback(reject, tile, tileImage);
                        tileImage.src = tiles[i]['url'];
                        me._tileImages[tileId] =tileImage;
                    });
                promises.push(promise);
            }
        }


        this._fullTileExtent = fullTileExtent;
        return promises;
    },

    /**
     * 渲染瓦片
     * @param  {Object} tiles         {url:?, left:?, top:?}
     * @param  {Boolean} rendWhenReady 是否待瓦片载入完成后再渲染
     * @return {Context}               Canvas Context
     */
    draw:function() {

        if (!this._canvas) {
            this._createCanvas();
        }
        this._drawed=true;
        var tiles = this._tiles;
        var tileSize = this.layer._getTileSize();
        this._resizeCanvas(this._fullTileExtent.getWidth(), this._fullTileExtent.getHeight());
        this._clearCanvas();
        console.log('draw tile');
        for (var i = tiles.length - 1; i >= 0; i--) {
            var tile = tiles[i];
            var point = tile['tile']['viewPoint'].substract(this._fullTileExtent.getMin());
            Z.Canvas.image(this._context, point, tile['image'], tileSize['width'],tileSize['height']);
        }
    },


    getCanvasImage:function() {
        var point = this._fullTileExtent.getMin();
        return {'canvas':this._canvas,'point':this.getMap()._viewPointToContainerPoint(point)};
    },

    clearExecutors:function() {
        //nothing to do
    },

    initContainer:function() {

    }

});
