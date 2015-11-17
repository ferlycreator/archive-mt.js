/**
 * 瓦片图层
 * @class maptalks.TileLayer
 * @extends maptalks.Layer
 * @author Maptalks Team
 */
Z['TileLayer'] = Z.TileLayer = Z.Layer.extend({
    type: 'tile',

    options: {
        'opacity':1,
        'errorTileUrl':Z.prefix+'images/error.png',
        'urlTemplate':Z.prefix+'images/blank.png',
        'subdomains':[''],
        //是否检查
        'showOnTileLoadComplete':true,
        'tileInfo':'web-mercator',
        'repeatWorld' : true
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
     * load the tile layer, can't be overrided by sub-classes
     */
    load:function(){
        if (!this._render) {
            this._initRender();
            this._render.initContainer();
            var zIndex = this.getZIndex();
            if (!Z.Util.isNil(zIndex)) {
                this._render.setZIndex(zIndex);
            }
        }
        this._load();
    },

    _initRender:function() {
        var size = this.getMap().getSize();
        //支持Canvas且地图容器大小没有超过canvas最大大小
        if (this.isCanvasRender() && Z.DomUtil.testCanvasSize(size)) {
            this._render = new Z.render.tilelayer.Canvas(this);
        } else {
            this._render = new Z.render.tilelayer.Dom(this);
        }
    },

    isCanvasRender:function() {
        if (Z.Browser.canvas/*this.map._getRender() instanceof Z.render.map.Canvas*/) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * 载入前的准备操作
     */
    _prepareLoad:function() {
        //nothing to do here, just return true
        return true;
    },

    _load:function() {
        if (!this.getMap()) {return;}
        this.clear();
        if (this._prepareLoad()) {
            this._render.rend(true);
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

    _getTiles:function(canvasSize) {
        // rendWhenReady = false;
        var map =this.map;
        if (!map) {
            return null;
        }
        if (!this.isVisible()) {
            return null;
        }

        var tileConfig = this._getTileConfig();
        if (!tileConfig) {return null;}

        var tileSize = this._getTileSize(),
            zoomLevel = map.getZoomLevel(),
            mapDomOffset = map.offsetPlatform();
        // console.log(mapDomOffset);
        var holderLeft=mapDomOffset["left"],
            holderTop = mapDomOffset["top"],
            mapWidth = map.width,
            mapHeight = map.height;
            //中心瓦片信息,包括瓦片编号,和中心点在瓦片上相对左上角的位置
        var centerTileIndex =  tileConfig.getCenterTileIndex(map._getPrjCenter(), zoomLevel);
        //计算中心瓦片的top和left偏移值
        var centerTileViewPoint=new Z.Point(Math.round(parseFloat(mapWidth/2-centerTileIndex["offsetLeft"])),
                                                Math.round(parseFloat(mapHeight/2-centerTileIndex["offsetTop"])));
        if (!canvasSize || !(canvasSize instanceof Z.Size)) {
            canvasSize = new Z.Size(mapWidth, mapHeight);
        }
        //中心瓦片上下左右的瓦片数
        var tileTopNum =Math.ceil(Math.abs((canvasSize['height'] - mapHeight)/2 + centerTileViewPoint.top)/tileSize["height"]),
            tileLeftNum=Math.ceil(Math.abs((canvasSize['width']- mapWidth)/2 + centerTileViewPoint.left)/tileSize["width"]),
            tileBottomNum=Math.ceil(Math.abs((canvasSize['height'] - mapHeight)/2 + mapHeight-centerTileViewPoint.top)/tileSize["height"]),
            tileRightNum=Math.ceil(Math.abs((canvasSize['width'] - mapWidth)/2 + mapWidth-centerTileViewPoint.left)/tileSize["width"]);

    //  只加中心的瓦片，用做调试
    //  var centerTileImg = this._createTileImage(centerTileViewPoint.left,centerTileViewPoint.top,this.config._getTileUrl(centerTileIndex["topIndex"],centerTileIndex["leftIndex"],zoomLevel),tileSize["height"],tileSize["width"]);
    //  tileContainer.appendChild(centerTileImg);

        var tiles = [];
        var fullExtent = new Z.Extent();
        //TODO 瓦片从中心开始加起
        for (var i=-(tileLeftNum);i<tileRightNum;i++){
            for (var j=-(tileTopNum);j<=tileBottomNum;j++){
                    var tileIndex = tileConfig.getNeighorTileIndex(centerTileIndex["y"], centerTileIndex["x"], j,i, zoomLevel, this.options['repeatWorld']);
                    var tileLeft = centerTileViewPoint.left + tileSize["width"]*i-holderLeft;
                    var tileTop = centerTileViewPoint.top +tileSize["height"]*j-holderTop;
                    var tileUrl = this._getTileUrl(tileIndex["x"],tileIndex["y"],zoomLevel);
                    var tileId=[tileIndex["y"], tileIndex["x"], zoomLevel].join('__');
                    var tileDesc = {
                        'url' : tileUrl,
                        'viewPoint': new Z.Point(tileLeft, tileTop),
                        'id'  : tileId
                    };
                    tiles.push(tileDesc);
                    fullExtent = fullExtent.combine(new Z.Extent(tileDesc['viewPoint'], tileDesc['viewPoint'].add(new Z.Point(tileSize['width'],tileSize['height']))));
            }
        }
        //瓦片排序, 地图中心的瓦片排在末尾, 末尾的瓦片先载入
        tiles.sort(function (a, b) {
            return b['viewPoint'].distanceTo(centerTileViewPoint)-a['viewPoint'].distanceTo(centerTileViewPoint);
        });
        return {
            'tiles' : tiles,
            'fullExtent' : fullExtent
        };
    },

    _getTileUrl:function(x,y,z) {
        if (!this.options['urlTemplate']) {
            return this.options['errorTileUrl'];
        }
        var urlTemplate = this.options['urlTemplate'];
        if (Z.Util.isFunction(urlTemplate)) {
            return urlTemplate(x,y,z);
        }
        var domain = '';
        if (this.options['subdomains']) {
            var subdomains = this.options['subdomains'];
            if (Z.Util.isArrayHasData(subdomains)) {
                var length = subdomains.length;
                var s = (x+y) % length;
                if (s<0) {
                    s=0;
                }
                domain = subdomains[s];
            }
        }
        var data = {
            'x' : x,
            'y' : y,
            'z' : z,
            's' : domain
        };
        return urlTemplate.replace(/\{ *([\w_]+) *\}/g,function (str, key) {
            var value = data[key];

            if (value === undefined) {
                throw new Error('No value provided for variable ' + str);

            } else if (typeof value === 'function') {
                value = value(data);
            }
            return value;
        });
        //return urlTemplate.replace(/{x}/g,x+'').replace(/{y}/g,y+'').replace(/{z}/g,z+'').replace(/{s}/g,domain+'');
    },

    /**
     * TileLayer的删除逻辑
     */
    _onRemove:function() {
        this.clear();
        // this._clearExecutors();
        this._render.remove();
    },

    clear:function() {
        this._render.clear();
    },

    _getTileSize:function() {
        return this._getTileConfig()['tileSize'];
    }
});
