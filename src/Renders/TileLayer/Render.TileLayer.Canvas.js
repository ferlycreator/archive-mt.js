Z.render.tilelayer.Canvas = function(layer) {
    this.layer = layer;
    this._mapRender = layer.getMap()._getRender();
    this._tileMap={};
};

Z.render.tilelayer.Canvas.prototype = {
    //瓦片图层的基础ZIndex
    // baseZIndex:15,

    remove:function() {
        this._mapRender.rend();
    },

    show:function() {
        this._mapRender.rend();
    },

    hide:function() {
        this._mapRender.rend();
    },

    setZIndex:function(zIndex) {
        this._mapRender.rend();
    },

    clear:function() {
        this._tileMap = {};
        // this._clearContext();
        this._mapRender.rend();
    },

    rend:function() {
        this._mapRender.rend();
    },

    /**
     * 生成资源载入Promise
     * @return {[Promise]} 资源载入的Promise
     */
    promise:function() {
        function promiseCallback(fn, point, image) {
            return function() {
                        fn({
                            'point' : point,
                            'image' : this
                        });
                    };
        }
        var map = this.layer.getMap();
        var size = map.getSize();
        var promises = [];
        var canvasExtent = new Z.Extent(0,0,size['width'], size['height']);
        var tiles = this.layer._getTiles();
        var tileSize = this.layer._getTileSize();
        for (var i = tiles.length - 1; i >= 0; i--) {
            var tile = tiles[i];
            var nw = map._viewPointToContainerPoint(new Z.Point(tile['left'], tile['top']));
            var tileExtent = new Z.Extent(nw, nw.add(new Z.Point(tileSize['width'],tileSize['height'])));
            if (canvasExtent.isIntersect(tileExtent)) {
                var promise = new Z.Promise(function(resolve, reject) {
                    var tileImage = new Image();
                    tileImage.onload = promiseCallback(resolve, nw, tileImage);
                    tileImage.onabort = promiseCallback(resolve, nw, tileImage);
                    tileImage.onerror = promiseCallback(reject, nw, tileImage);
                    tileImage.src = tile['url'];
                });
                promises.push(promise);
            }
        }
        return promises;
    },

    /**
     * 渲染瓦片
     * @param  {Object} tiles         {url:?, left:?, top:?}
     * @param  {Boolean} rendWhenReady 是否待瓦片载入完成后再渲染
     * @return {Context}               Canvas Context
     */
    draw:function(_context, tiles) {
        var map = this.layer.getMap();
        var tileSize = this.layer._getTileSize();
        for (var i = tiles.length - 1; i >= 0; i--) {
            var tile = tiles[i];
            // var nw = map._viewPointToContainerPoint(tile['point']);
            Z.Canvas.image(_context, tile['point'], tile['image'], tileSize['width'],tileSize['height']);
        }
        /*return this._context;*/
    },

    clearExecutors:function() {
        //nothing to do
    },

    initContainer:function() {

    }

};
