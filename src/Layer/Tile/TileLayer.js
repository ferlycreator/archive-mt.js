/**
 * [initialize description]
 * 
 */
Z['TileLayer'] = Z.TileLayer = Z.Layer.extend({

    //瓦片图层的基础ZIndex
    baseDomZIndex:15,

    options: {
        'opacity':1,      
        'errorTileUrl':Z.host+'/engine/images/error.png',
        //是否检查
        'showOnTileLoadComplete':true
    },
    
    /**
     * <pre>
     * 瓦片图层类构造函数
     * 图层配置如下:
     *     crs: 空间参考系设置,例如ESGP:3857
     *     opacity:图层透明度
     *     urlTemplate:URL模板,例如http://{s}.example.com/{z}/{y}/{x}.png
     *     subdomains:数组,用来轮流替换url模板中的{s}变量
     *     tileSize:{width:256,height:256}
     * crs的值可为字符串类型的预定义配置或属性对象:
     *      预定义配置有:"crs3857","crs4326","baidu"
     *      如果是属性对象,则需要指定
     * </pre>     
     * @param  {String} id 图层identifier
     * @param  {Object} opts 图层配置
     */
    initialize:function(id,opts) {
        this.setId(id);
        if (!opts['crs']) {
            this.lodConfig = new Z.LodConfig(Z.LodConfig['defaultCRS']);
        } else {
            this.lodConfig = new Z.LodConfig(opts['crs']);    
        }
        delete opts['crs'];
        //将其他设置存入this.options中
        Z.Util.setOptions(this,opts);
        //替换url模板中的大写变量为小写
        if (this.options['urlTemplate']) {
            this.options['urlTemplate'] = this.options['urlTemplate'].replace(/{X}/g,'{x}').replace(/{Y}/g,'{y}').replace(/{Z}/g,'{z}').replace(/{S}/g,'{s}');
        }
        // this.extent = lodInfo['fullExtent'];
    },

    getLodConfig:function(){
        if (!this.lodConfig) {
            //如果tilelayer本身没有设定lodconfig,则继承地图基础底图的lodconfig
            if (this.map) {
                return this.map.getLodConfig();
            }
        }
        return this.lodConfig;
    },

    getTileUrl:function(x,y,z) {
        if (!this.options['urlTemplate']) {
            return this.options['errorTileUrl'];
        }
        var urlTemplate = this.options['urlTemplate'];
        var domain = '';
        if (this.options['subdomains']) {
            var subdomains = this.options['subdomains'];
            if (Z.Util.isArray(subdomains) && subdomains.length>0) {
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
    setZIndex:function(zIndex) {    
        this.zIndex = zIndex;
        if (this.tileContainer) {
            this.tileContainer.style.zIndex = (this.baseDomZIndex+zIndex);
        }
    },

    
    /**
     * 地图中心点变化时的响应函数
     */
    onMoving:function() {
        this.fillTiles(false);
    },

    onMoveEnd:function() {
        this.fillTiles(false);
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    onZoomStart:function(donotRemoveTiles) {
        this.clearExecutors();
        if (!donotRemoveTiles && this.tileContainer) {
            this.clear();
        }
    },

    onZoomEnd:function() {
        //this.fillTiles(true);
        this.load();
    },

    onResize:function() {
        this.fillTiles(false);
    },

    /**
     * 载入前的准备操作     
     */
    prepareLoad:function() {
        //nothing to do here, just return true
        return true;
    },

    /**
     * 载入地图
     */
    load:function(){
        if (!this.getMap()) {return;}
        if (!this.tileContainer) {
            this.initPanel();    
        }
        this.clear();
        if (this.prepareLoad()) {
            this.clearExecutors();
            var me = this;
            this.tileLoadExecutor = setTimeout(function() {                
                me.fillTiles(me.options['showOnTileLoadComplete']);
            },20);
        }
    },

    clear:function() {
        this.tileMap = {};
        this.tileContainer.innerHTML="";
    },

    getTileSize:function() {
        return this.getLodConfig()['tileSize'];
    },

    getPadding:function() {
        var padding = this.getLodConfig()['padding'];
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
    clearExecutors:function() {
        if (this.tileLoadExecutor) {
            clearTimeout(this.tileLoadExecutor);
        }
        if (this.fireEventExecutor) {
            clearTimeout(this.fireEventExecutor);
        }
        if (this.completeExecutor) {
            clearTimeout(this.completeExecutor);
        }
    },

    /**
     * 载入瓦片
     * @param  {Boolean} isCheckTileLoad 检查瓦片是否载入完,如果为true,则在瓦片载入完后再显示图层容器元素
     */
    fillTiles:function(isCheckTileLoad) {
        // isCheckTileLoad = false;
        var map =this.map;
        if (!map) {
            return;
        }        
        var tileContainer = this.tileContainer;
        var lodConfig = this.getLodConfig();        
        if (!tileContainer || !lodConfig) {return;}
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
                if (me.completeExecutor) {
                    clearTimeout(me.completeExecutor);
                }
                if (me.fireEventExecutor) {
                        clearTimeout(me.fireEventExecutor);
                    }
                me.completeExecutor=setTimeout(function() {
                    tileContainer.appendChild(dSegment);
                    me.fireEventExecutor=setTimeout(function() {
                        // me.executeListeners("layerloaded");
                        me.fire(me.events.LAYER_LOADED,{'target':this});
                    },500);
                },10);
                /*if (counter == len) {
                    if (me.fireEventExecutor) {
                        clearTimeout(me.fireEventExecutor);
                    }
                    me.fireEventExecutor=setTimeout(function() {
                        // me.executeListeners("layerloaded");
                        me.fire(this.events.LAYER_LOADED,{'target':this});
                    },500);                
                }   */
            }
        }        
        var tileSize = this.getTileSize(),
            zoomLevel = map.getZoomLevel(),         
            mapDomOffset = map.offsetPlatform();
        var holderLeft=mapDomOffset["left"],
            holderTop = mapDomOffset["top"],
            mapWidth = map.width,
            mapHeight = map.height;
            //中心瓦片信息,包括瓦片编号,和中心点在瓦片上相对左上角的位置
        var centerTileInfo =  lodConfig.getCenterTileInfo(map.getPCenter(), zoomLevel);

        //计算中心瓦片的top和left偏移值    
        var centerOffset={};    
        centerOffset.top=Math.round(parseFloat(mapHeight/2-centerTileInfo["offsetTop"]));
        centerOffset.left=Math.round(parseFloat(mapWidth/2-centerTileInfo["offsetLeft"]));
        //中心瓦片上下左右的瓦片数
        var tileTopNum =Math.ceil(Math.abs(centerOffset.top)/tileSize["width"]),
            tileLeftNum=Math.ceil(Math.abs(centerOffset.left)/tileSize["height"]),
            tileBottomNum=Math.ceil(Math.abs(mapHeight-centerOffset.top)/tileSize["height"]),
            tileRightNum=Math.ceil(Math.abs(mapWidth-centerOffset.left)/tileSize["width"]);
        
    //  只加中心的瓦片，用做调试
    //  var centerTileImg = this._createTileImage(centerOffset.left,centerOffset.top,this.config.getTileUrl(centerTileInfo["topIndex"],centerTileInfo["leftIndex"],zoomLevel),tileSize["height"],tileSize["width"]);
    //  tileContainer.appendChild(centerTileImg);   
        
        var currentTiles = this.tileMap;        
        //TODO 瓦片从中心开始加起
        for (var i=-(tileLeftNum);i<tileRightNum;i++){
            for (var j=-(tileTopNum);j<=tileBottomNum;j++){                 
                    var tileIndex = lodConfig.getNeighorTileIndex(centerTileInfo["y"], centerTileInfo["x"], j,i);               
                    var tileId=tileIndex["y"]+","+tileIndex["x"];
                    var tileLeft = centerOffset.left + tileSize["width"]*i-holderLeft;
                    var tileTop = centerOffset.top +tileSize["height"]*j-holderTop;
                    if (!currentTiles[tileId]) {
                        var tileUrl = this.getTileUrl(tileIndex["x"],tileIndex["y"],zoomLevel);
                        var tileImage = this.createTileImage(tileLeft,tileTop, tileUrl,(isCheckTileLoad?checkAndLoad:null));
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
        
        if (this.removeout_timeout) {
            clearTimeout(this.removeout_timeout);
        }
        this.removeout_timeout = setTimeout(function() {
            me.removeTilesOutOfHolder();
        },500);
        
        
        
    },

    /*fillTiles:function() {
        var tileContainer = this.tileContainer;
        var lodConfig = this.lodConfig;
        var map =this.map;
        if (!map || !tileContainer || !this.lodConfig) {return;}
        var _this = this;
        var dSegment = document.createDocumentFragment(); 
        
        var tileSize = lodConfig["tileSize"],
            zoomLevel = map.getZoomLevel(),         
            mapDomOffset = map.offsetPlatform();
        var holderLeft=mapDomOffset["left"],
            holderTop = mapDomOffset["top"],
            mapWidth = map.width,
            mapHeight = map.height;
        var centerTileInfo =  lodConfig.getCenterTileInfo(map.getPCenter(), zoomLevel);
        //计算中心瓦片的top和left偏移值    
        var centerOffset={};    
        centerOffset.top=Math.round(parseFloat(mapHeight/2-centerTileInfo["offsetTop"]));
        centerOffset.left=Math.round(parseFloat(mapWidth/2-centerTileInfo["offsetLeft"]));
        //中心瓦片上下左右的瓦片数
        var tileTopNum =Math.ceil(Math.abs(centerOffset.top)/tileSize["width"]),
            tileLeftNum=Math.ceil(Math.abs(centerOffset.left)/tileSize["height"]),
            tileBottomNum=Math.ceil(Math.abs(mapHeight-centerOffset.top)/tileSize["height"]),
            tileRightNum=Math.ceil(Math.abs(mapWidth-centerOffset.left)/tileSize["width"]);
        
    //  只加中心的瓦片，用做调试
    //  var centerTileImg = this._createTileImage(centerOffset.left,centerOffset.top,this.config.getTileUrl(centerTileInfo["topIndex"],centerTileInfo["leftIndex"],zoomLevel),tileSize["height"],tileSize["width"]);
    //  tileContainer.appendChild(centerTileImg);   
        var padding = this.lodConfig["padding"];
        if (!padding) {
            padding = {
                'width':0,
                'height':0
            };
        }
        var currentTiles = this.tileMap;        
        var tileIndexes = [];


        //TODO 瓦片从中心开始加起
        for (var i=-(tileLeftNum);i<tileRightNum;i++){
            for (var j=-(tileTopNum);j<=tileBottomNum;j++){
                    var tileIndex = lodConfig.getNeighorTileIndex(centerTileInfo["y"], centerTileInfo["x"], j,i);                                   
                    var tileLeft = centerOffset.left + tileSize["width"]*i-holderLeft;
                    var tileTop = centerOffset.top +tileSize["height"]*j-holderTop;
                    var tileId=tileIndex["x"]+","+tileIndex["y"];
                    if (currentTiles[tileId]) {
                        var image = currentTiles[tileId].tile;
                        if (tileLeft != currentTiles[tileId].left || tileTop != currentTiles[tileId].top) {
                            image.style.left = (tileLeft)+"px";
                            image.style.top = (tileTop)+"px";
                        }
                    } else {
                        tileIndexes.push({index:tileIndex, l:tileLeft,t:tileTop});
                    }
            }
        }

        function genTile(tileIndex,tileLeft,tileTop) {
            var tileId=tileIndex["x"]+","+tileIndex["y"];
            var tileUrl = lodConfig["getTileUrl"](tileIndex["x"],tileIndex["y"],zoomLevel);
            var tileImage = this.createTileImage(tileLeft,tileTop,tileUrl);
            if (!tileImage) {
                return;
            }
            tileImage.id = tileId;
            dSegment.appendChild(tileImage);                        
            currentTiles[tileId] = {left:tileLeft, top:tileTop, tile:tileImage};
        }
        //sort tiles to append from center
        tileIndexes.sort(function(a,b) {
            return (Math.abs((a.index.x-centerTileInfo['x'])*(a.index.y-centerTileInfo['y']))-Math.abs((b.index.x-centerTileInfo['x'])*(b.index.y-centerTileInfo['y'])));
        });

        for (var n =0, len=tileIndexes.length;n<len;n++) {
            genTile.call(this,tileIndexes[n].index, tileIndexes[n].l, tileIndexes[n].t);
        }


        tileContainer.appendChild(dSegment);
        
        this.fire(this.events.LAYER_LOADED,{'target':this});
        
        if (this.removeout_timeout) {
            clearTimeout(this.removeout_timeout);
        }
        this.removeout_timeout = setTimeout(function() {
            _this.removeTilesOutOfHolder();
        },1000);
        
        
    },*/

    /**
     * 生成瓦片图片
     * @param  {Number} _tileLeft    瓦片的style.left
     * @param  {Number} _tileTop     瓦片的style.top
     * @param  {String} url          瓦片地址
     * @param  {Fn}     loadcallback 额外的瓦片图片onload回调
     * @return {Image}              瓦片图片对象
     */
    createTileImage:function(_tileLeft, _tileTop, url,  onloadFn) {        
        var tileImage = new Image(),
            tileSize = this.getTileSize();
        var padding = this.getPadding();
        

        var width = tileSize['width']+padding['width'],
            height = tileSize['height']+padding['height'],
            defaultTileUrl = Z.host + '/engine/images/transparent.gif';
        //border:1px green solid;
        //TODO 当前padding设定为整个瓦片增加的宽度和高度, 改为纵向每边增加的高度, 横向每边增加的宽度,即为当前的1/2
        tileImage.style.cssText = 'width:'+width+'px;height:'+height+'px;unselectable:on;position:absolute;left: '+
                                    (_tileLeft-padding['width']/2)+'px;top: '+(_tileTop-padding['height']/2)+ 'px;max-width:none;-moz-user-select: -moz-none;-webkit-user-select: none;';
        tileImage.className="MAP_FADE_ANIM";
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
    removeTilesOutOfHolder:function() {
        //var _mapContainer = this.map.mapContainer;
        if (this.map.isBusy) {
            //console.log("blocked");
            return;
        }       
        var tileContainer = this.tileContainer;
        if (!tileContainer) {return;}
        var map = this.map;
        var mapHeight = map.height,
            mapWidth = map.width,
            mapDomOffset = map.offsetPlatform(),
            lodConfig = this.getLodConfig();
        var _holderLeft = mapDomOffset["left"],
            _holderTop = mapDomOffset["top"],
            _tileSize = lodConfig["tileSize"],
            padding = this.getPadding();
        var currentTile = null;
        try {
            currentTile = tileContainer.firstChild;
        } catch (err) {
            
        }
        
        if (!currentTile) {return;}
        var tilesToRemove = [];
        while (currentTile) {
            if (!this.tileMap[currentTile.id]) {
                currentTile = currentTile.nextSibling;
                continue;
            }
            var tileLeft = this.tileMap[currentTile.id].left+padding["width"]/2+_holderLeft,
                tileTop = this.tileMap[currentTile.id].top+padding["height"]/2+_holderTop;
            if ( tileLeft >=mapWidth ||  tileLeft <= -_tileSize["width"] || tileTop > mapHeight || tileTop <  -_tileSize["height"]) {
                tilesToRemove.push(currentTile);            
                delete this.tileMap[currentTile.id];
            } 
            currentTile = currentTile.nextSibling;
        }
        var count = tilesToRemove.length;
        if ( count === 0) {return;}
        for (var i=0;i<count;i++) {     
            Z.DomUtil.removeDomNode(tilesToRemove[i]);
        }
    },


    initPanel:function() {
        var mapContainer = this.map.panels.mapContainer;
        if (!mapContainer) {return;}
        //生成地图瓦片装载div       
        var tileContainer = Z.DomUtil.createEl('div');     
        tileContainer.style.cssText = 'position:absolute;top:0px;left:0px;z-index:'+(this.baseDomZIndex+this.getZIndex());
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
        this.tileContainer = tileContainer;     
    }
});