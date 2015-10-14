Z.render.tilelayer.Dom = function(layer) {
    this.layer = layer;
    this.mapRender = layer.getMap()._getRender();
};

Z.render.tilelayer.Dom.prototype = {
    show:function() {

    },

    hide:function() {

    },

    setZIndex:function() {

    },

    /**
     * 渲染瓦片
     * @param  {Object} tiles         {url:?, left:?, top:?}
     * @param  {Boolean} rendWhenReady 是否待瓦片载入完成后再渲染
     * @return {[type]}               [description]
     */
    render:function(tiles, rendWhenReady) {

    },

    removeOutsideTiles:function() {

    },

    initContainer:function() {
        var mapContainer = this.mapRender.getLayerRenderContainer(this);
        if (!mapContainer) {return;}
        //生成地图瓦片装载div
        var tileContainer = Z.DomUtil.createEl('div');
        tileContainer.className = 'MAP_TILE_CONTAINER';
        tileContainer.style.cssText = 'position:absolute;top:0px;left:0px;z-index:'+(this.baseZIndex+this.getZIndex());
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
    }
};
