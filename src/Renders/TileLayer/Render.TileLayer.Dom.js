Z.render.tilelayer.Dom = function(layer) {
    this._layer = layer;
    this._mapRender = layer.getMap()._getRender();
    this._tileMap={};
    this._registerEvents();
};

Z.render.tilelayer.Dom.prototype = {

    //瓦片图层的基础ZIndex
    baseZIndex:15,

    _registerEvents:function() {
        var map = this._layer.getMap();
        map.on('_moving _moveend _resize _zoomend _zoomstart',this._onMapEvent,this);
    },

    _onMapEvent:function(param) {
        if (param['type'] === '_moving' || param['type'] === '_moveend' || param['type'] === '_resize') {
            this.rend();
        } else if (param['type'] === '_zoomend') {
            this.clear();
            this.rend(true);
        } else if (param['type'] === '_zoomstart') {
            this.clearExecutors();
        }
    },

    remove:function() {
        var map = this._layer.getMap();
        map.off('_moving _moveend _resize _zoomend _zoomstart',this._onMapEvent,this);
        if (this._tileContainer) {
            Z.DomUtil.removeDomNode(this._tileContainer);
        }
    },

    show:function() {
        this._tileContainer.style.display="";
        this.rend(true);
    },

    hide:function() {
        this._tileContainer.style.display="none";
        this.clear();
    },

    setZIndex:function(zIndex) {
        if (this._tileContainer) {
            this._tileContainer.style.zIndex = (this.baseZIndex+zIndex);
        }
    },

    clear:function() {
        this._tileMap = {};
        if (this._tileContainer) {
            this._tileContainer.innerHTML="";
        }
    },

    /**
     * 渲染瓦片
     * @param  {Object} tiles         {url:?, left:?, top:?}
     * @param  {Boolean} rendWhenReady 是否待瓦片载入完成后再渲染
     * @return {[type]}               [description]
     */
    rend:function(rendWhenReady) {
        var tiles = this._layer._getTiles();
        var tileContainer = this._tileContainer;
        var me = this;
        var tileImages = [];
        var dSegment = document.createDocumentFragment();
        function checkAndLoad() {
            var len = tileImages.length;
            var counter = 0;
            for (var i=0;i<len;i++) {
                if (tileImages[i]["complete"]) {
                    counter ++;
                }
            }

            if (counter >= len*3/4) {
                if (me._completeExecutor) {
                    clearTimeout(me._completeExecutor);
                }
                if (me._fireEventExecutor) {
                        clearTimeout(me._fireEventExecutor);
                    }
                me._completeExecutor=setTimeout(function() {
                    tileContainer.appendChild(dSegment);
                    me._fireEventExecutor=setTimeout(function() {
                        me._layer.fire('layerloaded');
                    },500);
                },10);
            }
        }

        var currentTiles = this._tileMap;

        for (var i = tiles.length - 1; i >= 0; i--) {
            var tileId=tiles[i]['id'],
                tileLeft = tiles[i]['viewPoint']['left'],
                tileTop = tiles[i]['viewPoint']['top'],
                tileUrl = tiles[i]['url'];
            if (!currentTiles[tileId]) {
                var tileImage = this._createTileImage(tileLeft,tileTop, tileUrl,(rendWhenReady?checkAndLoad:null));
                if (!tileImage) {
                    continue;
                }
                tileImage.id = tileId;
                if (rendWhenReady) {
                    tileImages.push(tileImage);
                }
                dSegment.appendChild(tileImage);
                currentTiles[tileId] = {left:tileLeft, top:tileTop, tile:tileImage};
            } else {
                var image = currentTiles[tileId].tile;
                if (tileLeft != currentTiles[tileId].left || tileTop != currentTiles[tileId].top) {
                    image.style.left = (tileLeft)+"px";
                    image.style.top = (tileTop)+"px";
                    currentTiles[tileId].left = tileLeft;
                    currentTiles[tileId].top = tileTop;
                }
            }
        }

        if (rendWhenReady) {
            checkAndLoad();
        } else {
            tileContainer.appendChild(dSegment);
        }

        if (this._removeout_timeout) {
            clearTimeout(this._removeout_timeout);
        }
        this._removeout_timeout = setTimeout(function() {
            me._removeOutsideTiles();
        },500);
    },

    initContainer:function() {
        var mapContainer = this._mapRender.getLayerRenderContainer(this._layer);
        if (!mapContainer) {return;}
        //生成地图瓦片装载div
        var tileContainer = Z.DomUtil.createEl('div');
        tileContainer.className = 'MAP_TILE_CONTAINER';
        tileContainer.style.cssText = 'position:absolute;top:0px;left:0px;z-index:'+(this.baseZIndex+this._layer.getZIndex());
        var currentTileContainers = mapContainer.childNodes;
        if (currentTileContainers && currentTileContainers.length > 0) {
            var firstChild = currentTileContainers[0];
            mapContainer.insertBefore(tileContainer,firstChild);
        } else {
            mapContainer.appendChild(tileContainer);
        }
        if (Z.Browser.ie) {
            tileContainer['onselectstart'] = function(e) {
                return false;
            };
            tileContainer.setAttribute('unselectable', 'on');
            tileContainer['ondragstart'] = function(e) { return false; };
        }
        this._tileContainer = tileContainer;
    },

    _removeOutsideTiles:function() {
        //var _mapContainer = this.map.mapContainer;
        if (this._layer.getMap().isBusy()) {
            //console.log("blocked");
            return;
        }
        var tileContainer = this._tileContainer;
        if (!tileContainer) {return;}
        var map = this._layer.getMap();
        var mapHeight = map.height,
            mapWidth = map.width,
            mapDomOffset = map.offsetPlatform(),
            tileConfig = this._layer._getTileConfig();
        var _holderLeft = mapDomOffset["left"],
            _holderTop = mapDomOffset["top"],
            _tileSize = tileConfig["tileSize"];
        var currentTile = null;
        try {
            currentTile = tileContainer.firstChild;
        } catch (err) {

        }

        if (!currentTile) {return;}
        var tilesToRemove = [];
        while (currentTile) {
            if (!this._tileMap[currentTile.id]) {
                currentTile = currentTile.nextSibling;
                continue;
            }
            var tileLeft = this._tileMap[currentTile.id].left+_holderLeft,
                tileTop = this._tileMap[currentTile.id].top+_holderTop;
            if ( tileLeft >=mapWidth ||  tileLeft <= -_tileSize["width"] || tileTop > mapHeight || tileTop <  -_tileSize["height"]) {
                tilesToRemove.push(currentTile);
                delete this._tileMap[currentTile.id];
            }
            currentTile = currentTile.nextSibling;
        }
        var count = tilesToRemove.length;
        if ( count === 0) {return;}
        for (var i=0;i<count;i++) {
            Z.DomUtil.removeDomNode(tilesToRemove[i]);
        }
    },

    /**
     * 生成瓦片图片
     * @param  {Number} _tileLeft    瓦片的style.left
     * @param  {Number} _tileTop     瓦片的style.top
     * @param  {String} url          瓦片地址
     * @param  {Fn}     loadcallback 额外的瓦片图片onload回调
     * @return {Image}              瓦片图片对象
     */
    _createTileImage:function(_tileLeft, _tileTop, url,  onloadFn) {
        var tileImage = new Image(),
            tileSize = this._layer._getTileSize();
        // var padding = this.getPadding();


        var width = tileSize['width'],
            height = tileSize['height'],
            defaultTileUrl = Z.prefix + 'images/transparent.gif';
        //border:1px green solid;
        //TODO 当前padding设定为整个瓦片增加的宽度和高度, 改为纵向每边增加的高度, 横向每边增加的宽度,即为当前的1/2
        tileImage.style.cssText = 'width:'+width+'px;height:'+height+'px;unselectable:on;position:absolute;left: '+
                                    _tileLeft+'px;top: '+_tileTop+ 'px;max-width:none;-moz-user-select: -moz-none;-webkit-user-select: none;';
        tileImage.className='maptalks-map-fade-anim';
        tileImage["onload"]=function(){
            this.style.cssText+=";opacity:1;";
            Z.Util.fixPNG(this);
            if (onloadFn) {
                onloadFn();
            }
        };
        tileImage["onerror"]=function(){
            this.onload=null;
            this.onerror=null;
            this.onabort=null;
            this.src=defaultTileUrl;
            Z.Util.fixPNG(this);
            if (onloadFn) {
                onloadFn();
            }
        };
        tileImage["onabort"]=function() {
            this.onload=null;
            this.onerror=null;
            this.onabort=null;
            this.src=defaultTileUrl;
            Z.Util.fixPNG(this);
            if (onloadFn) {
                onloadFn();
            }
        };
        var opacity = this._layer.config()['opacity'];
        if (!Z.Util.isNil(opacity) && opacity < 1) {
            Z.DomUtil.setOpacity(tileImage, opacity);
        }
        tileImage.src=url;
        return tileImage;
    },

    clearExecutors:function() {
        if (this._fireEventExecutor) {
            clearTimeout(this._fireEventExecutor);
        }
        if (this._completeExecutor) {
            clearTimeout(this._completeExecutor);
        }
        if (this._removeout_timeout) {
            clearTimeout(this._removeout_timeout);
        }
    }
};
