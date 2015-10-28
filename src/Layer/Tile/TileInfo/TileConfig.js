Z.TileConfig=Z.Class.extend({

        // includes:Z.TileUtil.Common,

        statics : {

        },

        //根据不同的语言定义不同的错误信息
        exceptionDefs:{
            'en-US':{
                'INVALID_TILEINFO':'Invalid TileInfo',
                'INVALID_TILESYSTEM':'Invalid TileSystem'
            },
            'zh-CN':{
                'INVALID_TILEINFO':'无效的TileInfo',
                'INVALID_TILESYSTEM':'无效的TileSystem'
            }
        },

        /**
         * 初始化方法
         * @param  {[TileInfo]} tileInfo [图层配置属性,参考TileInfo.js中的例子]
         */
        initialize:function(tileInfo) {
            if (!this.checkTileInfo(tileInfo)) {
                throw new Error(this.exceptions['INVALID_TILEINFO']+':'+tileInfo);
            }
            //tileInfo是预设值的字符串
            var lodName = null;
            //预定义的lodinfo
            if (Z.Util.isString(tileInfo)) {
                lodName = tileInfo;
                tileInfo = Z['TileInfo'][tileInfo.toLowerCase()];
                if (!tileInfo) {
                    throw new Error(this.exceptions['INVALID_TILEINFO']+':'+lodName);
                }
            }
            this.prepareTileInfo(tileInfo);

        },

        prepareTileInfo:function(tileInfo) {
            this.tileInfo = tileInfo;
            Z.Util.extend(this,tileInfo);
            if (!this['padding']) {
                this['padding'] = {
                    'width':0,
                    'height':0
                };
            }
            this.projectionInstance = Z.Projection.getInstance(tileInfo['projection']);

            var tileSystem;
            if (!tileInfo['tileSystem']) {
                //默认是WEB-MERCATOR瓦片系统
                tileSystem = Z.TileSystem['web-mercator'];
            } else if (Z.Util.isString(tileInfo['tileSystem'])){
                tileSystem = Z.TileSystem.getInstance(tileInfo['tileSystem']);
            } else {
                var tsPrams = tileInfo['tileSystem'];
                tileSystem = new Z.TileSystem(tsPrams);
            }

            if (!tileSystem) {
                throw new Error(this.exceptions['INVALID_TILESYSTEM']+':'+tileInfo['tileSystem']);
            }
            this.tileSystem = tileSystem;

            //自动计算transformation
            var fullExtent = tileInfo['fullExtent'];
            var a = fullExtent['right']>fullExtent['left']?1:-1,
                b = fullExtent['top']>fullExtent['bottom']?-1:1,
                c = tileSystem['origin']['x'],
                d = tileSystem['origin']['y'];
            this.transformation = new Z.Transformation([a,b,c,d]);
            //计算transform后的以像素为单位的原点
            tileSystem['transOrigin'] = this.transformation.transform(tileSystem['origin'],1);
        },

        checkTileInfo:function(tileInfo) {
            if (!tileInfo) {return false;}
            if (Z.Util.isString(tileInfo) && (Z['TileInfo'][tileInfo.toLowerCase()])) {
                return true;
            }
            if (!tileInfo['projection']) {
                return false;
            }
            return true;
        },

        load:function(afterLoadFn){
            //如果已经有resolutions等属性,则说明无需初始化
            if (this['resolutions']) {
                if (afterLoadFn) {
                    afterLoadFn();
                }
                return;
            }
            //TODO maptalks和arcgis图层的初始化
        },

        equals:function(tileConfig, zoomLevel) {
            try {
                return tileConfig['resolutions'][zoomLevel] === this['resolutions'][zoomLevel] &&
                this['projection'] === tileConfig['projection'];
            } catch (error) {
                return false;
            }

        },

        getProjectionInstance:function() {

            return this.projectionInstance;
        },

        getTransformationInstance:function() {
            return this.transformation;
        },

        getResolution:function(z) {
            if (this['resolutions']) {
                return this['resolutions'][z];
            }
            return 0;
        },
         getTileIndex:function(point, zoomLevel) {
            var tileSystem = this.tileSystem, tileSize=this['tileSize'],
                transOrigin = tileSystem['transOrigin'],
                res = this['resolutions'][zoomLevel];

            var tileX = Math.floor((point['left']-transOrigin['left'])/(tileSize['width']*res));
            var tileY = -Math.floor((point['top']-transOrigin['top'])/(tileSize['height']*res));

            return {'x':tileSystem['scale']['x']*tileX, 'y':tileSystem['scale']['y']*tileY};

            // var resolution = this['resolutions'][zoomLevel];
            // var tileY = Math.floor((tileSystem['origin']['y'] + tileSystem['scale']['y']*pLonlat.y) / ( resolution* tileSize['height']));
            // var tileX = Math.floor((tileSystem['scale']['x']*pLonlat.x - tileSystem['origin']['x']) / (resolution * tileSize['width']));
            // return {'y':tileY,'x':tileX};
        },

        /**
         * 根据中心点投影坐标, 计算中心点对应的瓦片和瓦片内偏移量
         * @param  {[type]} pLonlat   [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getCenterTileIndex:function( pLonlat, zoomLevel) {
            var tileSystem = this.tileSystem,
                resolution = this['resolutions'][zoomLevel],
                tileSize = this['tileSize'];
            var point = this.transformation.transform(pLonlat, 1);
            var tileIndex = this.getTileIndex(point,zoomLevel);

            var tileLeft = tileIndex['x']*tileSize['width'];
            var tileTop = tileIndex['y']*tileSize['height'];

            var offsetLeft = Math.round(point['left']/resolution-tileSystem['scale']['x']*tileLeft);
            var offsetTop = Math.round(point['top']/resolution+tileSystem['scale']['y']*tileTop);

            //如果x方向为左大右小
            if (tileSystem['scale']['x']<0) {
                tileIndex['x'] -= 1;
            }
            //如果y方向上大下小
            if (tileSystem['scale']['y']>0) {
                tileIndex['y'] -= 1;
            }

            //有可能tileIndex超出世界范围
            tileIndex = this.getNeighorTileIndex(tileIndex['y'], tileIndex['x'],0,0,true);

            return {'x':tileIndex['x'], 'y':tileIndex['y'], 'offsetLeft':offsetLeft, 'offsetTop':offsetTop};

            /*var tileSystem = this.tileSystem;
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            //tileX和tileY为什么会+1, -1是因为根据tilesystem的scale不同, 瓦片顶端的编号会有1的差值
            var tileLeft = tileSystem['scale']['x']*tileSize['width']*(tileX+(tileSystem['scale']['x']==1?0:1)) * resolution+tileSystem['origin']['x'];
            var tileTop = tileSystem['origin']['y'] + tileSystem['scale']['y']*(tileY+(tileSystem['scale']['y']==1?1:0))* resolution * tileSize['height'];
            var offsetLeft = Math.abs(Math.round((pLonlat.x-tileLeft)/resolution));
            var offsetTop = Math.abs(Math.round((pLonlat.y-tileTop)/resolution));
            return {'x':tileX, 'y':tileY, 'offsetLeft':offsetLeft, 'offsetTop':offsetTop};*/
        },
        /**
         * 根据投影坐标,计算瓦片编号
         * @param  {[type]} pLonlat   [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        /*getTileIndex:function(pLonlat, zoomLevel) {
            var tileSystem = this.tileSystem;
            var tileSize=this['tileSize'];
            // var maxExtent=tileSystem['origin'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.floor((tileSystem['origin']['y'] + tileSystem['scale']['y']*pLonlat.y) / ( resolution* tileSize['height']));
            var tileX = Math.floor((tileSystem['scale']['x']*pLonlat.x - tileSystem['origin']['x']) / (resolution * tileSize['width']));
            return {'y':tileY,'x':tileX};
        },*/
        /**
         * 根据给定的瓦片编号,和坐标编号偏移量,计算指定的瓦片编号
         * @param  {[type]} tileY   [description]
         * @param  {[type]} tileX   [description]
         * @param  {[type]} offsetY [description]
         * @param  {[type]} offsetX [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}         [description]
         */
        getNeighorTileIndex:function(tileY, tileX, offsetY,offsetX, zoomLevel, isRepeatWorld) {
            var tileSystem = this.tileSystem;
            var x = (tileX+tileSystem['scale']['x']*offsetX);
            var y = (tileY-tileSystem['scale']['y']*offsetY);
            //连续世界瓦片计算
            if (isRepeatWorld) {
                var ext = this._getTileFullExtent(zoomLevel);
                if (x < ext['xmin']) {
                    x = ext['xmax'] - (ext['xmin']-x) % (ext['xmax']-ext['xmin']);
                    if (x === ext['xmax']) {
                        x = ext['xmin'];
                    }
                } else if (x>=ext['xmax']) {
                    x = ext['xmin'] + (x-ext['xmin']) % (ext['xmax']-ext['xmin']);
                }

                if (y >= ext['ymax']) {
                    y = ext['ymin'] + (y-ext['ymin']) % (ext['ymax']-ext['ymin']);
                } else if (y<ext['ymin']) {
                    y = ext['ymax'] - (ext['ymin']-y) % (ext['ymax']-ext['ymin']);
                    if (y === ext['ymax']) {
                        y = ext['ymin'];
                    }
                }
            }
            return {'x':x, 'y':y};
        },

        _getTileFullExtent:function(zoomLevel) {
            var ext = this.fullExtent;
            var transformation = this.transformation;
            var nwIndex = this.getTileIndex(transformation.transform(new Z.Coordinate(ext['left'],ext['top']),1),zoomLevel);
            var seIndex = this.getTileIndex(transformation.transform(new Z.Coordinate(ext['right'],ext['bottom']),1),zoomLevel);
            return new Z.Extent(nwIndex, seIndex);
        },

        /**
         * 计算瓦片左上角的经纬度坐标
         * @param  {[type]} tileY     [description]
         * @param  {[type]} tileX     [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getTileProjectedNw:function(tileY,tileX,zoomLevel) {
            var tileSystem = this.tileSystem;
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            // var maxExtent = this['origin'];
            var y = tileSystem['origin']['y'] + tileSystem['scale']['y']*(tileY+(tileSystem['scale']['y']==1?1:0))*(resolution* tileSize['height']);
            var x = tileSystem['scale']['x']*(tileX+(tileSystem['scale']['x']==1?0:1))*resolution*tileSize['width']+tileSystem['origin']['x'];
            return this.getProjectionInstance().unproject({x:x,y:y});
        }


});

