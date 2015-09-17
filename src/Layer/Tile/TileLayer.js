/**
 * 瓦片图层
 * @class maptalks.TileLayer
 * @extends maptalks.Layer
 * @author Maptalks Team
 */
Z['TileLayer'] = Z.TileLayer = Z.Layer.extend({

    //瓦片图层的基础ZIndex
    baseZIndex:15,

    options: {
        'opacity':1,
        'errorTileUrl':Z.prefix+'images/error.png',
        'urlTemplate':Z.prefix+'images/blank.png',
        'subdomains':[''],
        //是否检查
        'showOnTileLoadComplete':true,
        'tileInfo':'web-mercator'
    },

    /**
     * <pre>
     * 瓦片图层类构造函数
     * 图层配置如下:
     *     tileInfo: 空间参考系设置,例如ESGP:3857
     *     opacity:图层透明度
     *     urlTemplate:URL模板,例如http://{s}.example.com/{z}/{y}/{x}.png
     *     subdomains:数组,用来轮流替换url模板中的{s}变量
     *     tileSize:{width:256,height:256}
     *     tileInfo的值可为字符串类型的预定义配置或属性对象:
     *     预定义配置有:"web-mercator","global-mercator","baidu"
     *     如果是属性对象,则需要指定
     * </pre>
     * @param  {String} id 图层identifier
     * @param  {Object} opts 图层配置
     */
    initialize:function(id,opts) {
        this.setId(id);
        Z.Util.setOptions(this,opts);
    },

    /**
     * load the tile layer, can be overrided by sub-classes
     */
    load:function(){
        this._load();
    },

    /**
     * 显示图层
     */
    show:function() {
        if (!this.options['visible']) {
            this._tileContainer.style.display="";
            this._fillTiles(true);
            this.options['visible'] = true;
        }
        return this;
    },

    /**
     * 隐藏图层
     */
    hide:function() {
        if (this.options['visible']) {
            this._tileContainer.style.display="none";
            this.clear();
            this.options['visible'] = false;
        }
        return this;
    },

    /**
     * 瓦片图层是否可见
     * @return {Boolean} true/false
     */
    isVisible:function() {
        return this.options['visible'];
    },

    _load:function() {
        if (!this.getMap()) {return;}
        if (!this._tileContainer) {
            this._initPanel();
        }
        this.clear();
        if (this._prepareLoad()) {
            this._clearExecutors();
            var me = this;
            this._tileLoadExecutor = setTimeout(function() {
                me._fillTiles(me.options['showOnTileLoadComplete']);
            },20);
        }
    },

    /**
     * * 加载TileConfig
     * @param  {fn} onLoaded 加载完成后的回调函数
     */
    _loadTileConfig:function(onLoaded) {
        //TileLayer只支持预定义的TILEINFO
        this._tileConfig = new Z.TileConfig(this.options['tileInfo']);
        if (onLoaded) {
            onLoaded();
        }
    },

    _getTileConfig:function(){
        if (!this._tileConfig) {
            //如果tilelayer本身没有设定tileconfig,则继承地图基础底图的tileconfig
            if (this.map) {
                return this.map._getTileConfig();
            }
        }
        return this._tileConfig;
    },

    _getTileUrl:function(x,y,z) {
        if (!this.options['urlTemplate']) {
            return this.options['errorTileUrl'];
        }
        var urlTemplate = this.options['urlTemplate'];
        var domain = '';
        if (this.options['subdomains']) {
            var subdomains = this.options['subdomains'];
            if (Z.Util.isArrayHasData(subdomains)) {
                var rand = Math.round(Math.random()*(subdomains.length-1));
                domain = subdomains[rand];
            }
        }
        return urlTemplate.replace(/{x}/g,x).replace(/{y}/g,y).replace(/{z}/g,z).replace(/{s}/g,domain);
    },

    /**
     * 设置图层的层级
     * @param zIndex
     */
    _setZIndex:function(zIndex) {
        this.zIndex = zIndex;
        if (this._tileContainer) {
            this._tileContainer.style.zIndex = (this.baseZIndex+zIndex);
        }
    },

    /**
     * TileLayer的删除逻辑
     */
    _onRemove:function() {
        this.clear();
        this._clearExecutors();
        if (this._tileContainer) {
            Z.DomUtil.removeDomNode(this._tileContainer);
        }
    },

    /**
     * 地图中心点变化时的响应函数
     */
    _onMoving:function() {
        this._fillTiles(false);
    },

    _onMoveEnd:function() {
        this._fillTiles(false);
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    _onZoomStart:function(donotRemoveTiles) {
        this._clearExecutors();
        if (!donotRemoveTiles && this._tileContainer) {
            this.clear();
        }
    },

    _onZoomEnd:function() {
        //this._fillTiles(true);
        this.load();
    },

    _onResize:function() {
        this._fillTiles(false);
    },

    /**
     * 载入前的准备操作
     */
    _prepareLoad:function() {
        //nothing to do here, just return true
        return true;
    },





    clear:function() {
        this._tileMap = {};
        if (this._tileContainer) {
            this._tileContainer.innerHTML="";
        }
    },

    _getTileSize:function() {
        return this._getTileConfig()['tileSize'];
    },

    getPadding:function() {
        var padding = this._getTileConfig()['padding'];
        if (!padding) {
            padding = {
                'width':0,
                'height':0
            };
        }
        return padding;
    },

    /**
     * 清除瓦片加载的执行器
     * @return {[type]} [description]
     */
    _clearExecutors:function() {
        if (this._tileLoadExecutor) {
            clearTimeout(this._tileLoadExecutor);
        }
        if (this._fireEventExecutor) {
            clearTimeout(this._fireEventExecutor);
        }
        if (this._completeExecutor) {
            clearTimeout(this._completeExecutor);
        }
    },

    /**
     * 载入瓦片
     * @param  {Boolean} isCheckTileLoad 检查瓦片是否载入完,如果为true,则在瓦片载入完后再显示图层容器元素
     */
    _fillTiles:function(isCheckTileLoad) {
        // isCheckTileLoad = false;
        var map =this.map;
        if (!map) {
            return;
        }
        if (!this.isVisible()) {
            return;
        }
        var tileContainer = this._tileContainer;
        var tileConfig = this._getTileConfig();
        if (!tileContainer || !tileConfig) {return;}
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

            if (counter > len*2/3) {
                if (me._completeExecutor) {
                    clearTimeout(me._completeExecutor);
                }
                if (me._fireEventExecutor) {
                        clearTimeout(me._fireEventExecutor);
                    }
                me._completeExecutor=setTimeout(function() {
                    tileContainer.appendChild(dSegment);
                    me._fireEventExecutor=setTimeout(function() {
                        me.fire(me.events.LAYER_LOADED,{'target':this});
                    },500);
                },10);
            }
        }
        var tileSize = this._getTileSize(),
            zoomLevel = map.getZoomLevel(),
            mapDomOffset = map.offsetPlatform();
        var holderLeft=mapDomOffset["left"],
            holderTop = mapDomOffset["top"],
            mapWidth = map.width,
            mapHeight = map.height;
            //中心瓦片信息,包括瓦片编号,和中心点在瓦片上相对左上角的位置
        var centerTileIndex =  tileConfig.getCenterTileIndex(map._getPrjCenter(), zoomLevel);

        //计算中心瓦片的top和left偏移值
        var centerOffset={};
        centerOffset.top=Math.round(parseFloat(mapHeight/2-centerTileIndex["offsetTop"]));
        centerOffset.left=Math.round(parseFloat(mapWidth/2-centerTileIndex["offsetLeft"]));
        //中心瓦片上下左右的瓦片数
        var tileTopNum =Math.ceil(Math.abs(centerOffset.top)/tileSize["width"]),
            tileLeftNum=Math.ceil(Math.abs(centerOffset.left)/tileSize["height"]),
            tileBottomNum=Math.ceil(Math.abs(mapHeight-centerOffset.top)/tileSize["height"]),
            tileRightNum=Math.ceil(Math.abs(mapWidth-centerOffset.left)/tileSize["width"]);

    //  只加中心的瓦片，用做调试
    //  var centerTileImg = this._createTileImage(centerOffset.left,centerOffset.top,this.config._getTileUrl(centerTileIndex["topIndex"],centerTileIndex["leftIndex"],zoomLevel),tileSize["height"],tileSize["width"]);
    //  tileContainer.appendChild(centerTileImg);

        var currentTiles = this._tileMap;
        //TODO 瓦片从中心开始加起
        for (var i=-(tileLeftNum);i<tileRightNum;i++){
            for (var j=-(tileTopNum);j<=tileBottomNum;j++){
                    var tileIndex = tileConfig.getNeighorTileIndex(centerTileIndex["y"], centerTileIndex["x"], j,i);
                    var tileId=tileIndex["y"]+","+tileIndex["x"];
                    var tileLeft = centerOffset.left + tileSize["width"]*i-holderLeft;
                    var tileTop = centerOffset.top +tileSize["height"]*j-holderTop;
                    if (!currentTiles[tileId]) {
                        var tileUrl = this._getTileUrl(tileIndex["x"],tileIndex["y"],zoomLevel);
                        var tileImage = this._createTileImage(tileLeft,tileTop, tileUrl,(isCheckTileLoad?checkAndLoad:null));
                        if (!tileImage) {
                            continue;
                        }
                        tileImage.id = tileId;
                        if (isCheckTileLoad) {
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
        }
        if (isCheckTileLoad) {
            checkAndLoad();
        } else {
            tileContainer.appendChild(dSegment);
        }

        if (this._removeout_timeout) {
            clearTimeout(this._removeout_timeout);
        }
        this._removeout_timeout = setTimeout(function() {
            me._removeTilesOutOfContainer();
        },500);



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
            tileSize = this._getTileSize();
        var padding = this.getPadding();


        var width = tileSize['width']+padding['width'],
            height = tileSize['height']+padding['height'],
            defaultTileUrl = Z.prefix + 'images/transparent.gif';
        //border:1px green solid;
        //TODO 当前padding设定为整个瓦片增加的宽度和高度, 改为纵向每边增加的高度, 横向每边增加的宽度,即为当前的1/2
        tileImage.style.cssText = 'width:'+width+'px;height:'+height+'px;unselectable:on;position:absolute;left: '+
                                    (_tileLeft-padding['width']/2)+'px;top: '+(_tileTop-padding['height']/2)+ 'px;max-width:none;-moz-user-select: -moz-none;-webkit-user-select: none;';
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
        tileImage.src=url;
        return tileImage;
    },

    /**
     * 移除tileContainer之外的瓦片
     */
    _removeTilesOutOfContainer:function() {
        //var _mapContainer = this.map.mapContainer;
        if (this.map.isBusy) {
            //console.log("blocked");
            return;
        }
        var tileContainer = this._tileContainer;
        if (!tileContainer) {return;}
        var map = this.map;
        var mapHeight = map.height,
            mapWidth = map.width,
            mapDomOffset = map.offsetPlatform(),
            tileConfig = this._getTileConfig();
        var _holderLeft = mapDomOffset["left"],
            _holderTop = mapDomOffset["top"],
            _tileSize = tileConfig["tileSize"],
            padding = this.getPadding();
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
            var tileLeft = this._tileMap[currentTile.id].left+padding["width"]/2+_holderLeft,
                tileTop = this._tileMap[currentTile.id].top+padding["height"]/2+_holderTop;
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


    _initPanel:function() {
        var mapContainer = this.map._panels.mapContainer;
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
});
