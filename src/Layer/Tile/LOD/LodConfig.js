Z.LodConfig=Z.Class.extend({

        // includes:Z.LodUtil.Common,

        statics : {
            'defaultCRS':'crs3857'
        },

        //根据不同的语言定义不同的错误信息
        exceptionDefs:{
            'en-US':{
                'INVALID_CRS':'Invalid CRS',
                'INVALID_TILESYSTEM':'Invalid tileSystem'
            },
            'zh-CN':{
                'INVALID_CRS':'无效的CRS',
                'INVALID_TILESYSTEM':'无效的tileSystem'
            }
        },

        /**
         * 初始化方法
         * @param  {[LodInfo]} lodInfo [图层配置属性,参考LodInfo.js中的例子]
         */
        initialize:function(lodInfo) {
            if (!this.checkLodInfo(lodInfo)) {return;}
            //lodInfo是预设值的字符串
            var lodName = null;
            if (Z.Util.isString(lodInfo)) {
                lodName = lodInfo;
                lodInfo = Z['LodInfo'][lodInfo.toLowerCase()];
                if (!lodInfo) {
                    throw new Error(this.exceptions['INVALID_CRS']+':'+lodName);
                }
            }
            this.prepareLodInfo(lodInfo);

        },

        prepareLodInfo:function(lodInfo) {
            this.lodInfo = lodInfo;
            Z.Util.extend(this,lodInfo);
            if (!this['padding']) {
                this['padding'] = {
                    'width':0,
                    'height':0
                };
            }
            this.projectionInstance = Z.Projection.getInstance(lodInfo['projection']);
            /*if ('baidu' === lodInfo['projection'].toLowerCase()) {
                Z.Util.extend(this,Z.LodUtil.BD09);
            }  else {
                if (lodName && 'globalmercator' === lodName) {
                    Z.Util.extend(this,Z.LodUtil.GLOALMERCATOR);
                } else {
                    Z.Util.extend(this,Z.LodUtil.Default);
                }

            }*/
            var tileSystem;
            if (!lodInfo['tileSystem']) {
                //默认是谷歌瓦片系统
                tileSystem = Z.TileSystem['DEFAULT'];
            } else if (Z.Util.isString(lodInfo['tileSystem'])){
                tileSystem = Z.TileSystem.getInstance(lodInfo['tileSystem']);
            } else {
                var tsPrams = lodInfo['tileSystem'];
                tileSystem = new Z.TileSystem(tsPrams);
            }

            if (!tileSystem) {
                throw new Error(this.exceptions['INVALID_TILESYSTEM']+':'+lodInfo['tileSystem']);
            }
            this.tileSystem = tileSystem;

            if (this['origin']) {
                //direction of projected coordinate
                this.dx = (this['origin']['right']>=this['origin']['left'])?1:-1;
                this.dy = (this['origin']['top']>=this['origin']['bottom'])?1:-1;
            }
        },

        checkLodInfo:function(lodInfo) {
            if (!lodInfo) {return false;}
            if (Z.Util.isString(lodInfo) && (Z['LodInfo'][lodInfo.toLowerCase()])) {
                return true;
            }
            if (!lodInfo['projection']) {
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

        equals:function(lodConfig, zoomLevel) {
            try {
                return lodConfig['resolutions'][zoomLevel] === this['resolutions'][zoomLevel] &&
                this['projection'] === lodConfig['projection'];
            } catch (error) {
                return false;
            }

        },

        getProjectionInstance:function() {

            return this.projectionInstance;
        },

        getResolution:function(z) {
            if (this['resolutions']) {
                return this['resolutions'][z];
            }
            return 0;
        },

        /**
         * 根据中心点投影坐标, 计算中心点对应的瓦片和瓦片内偏移量
         * @param  {[type]} pLonlat   [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getCenterTileInfo:function( pLonlat, zoomLevel) {
            var tileSystem = this.tileSystem;
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            var tileLeft = tileSystem['scale']['x']*tileSize['width']*tileX * resolution+tileSystem['origin']['x'];
            // var tileLeft = tileSize['width']*tileX * resolution+this['origin']['left'];
            var tileTop = tileSystem['origin']['y'] + tileSystem['scale']['y']*tileY* resolution * tileSize['height'];
            var offsetLeft = Math.abs(Math.round((pLonlat.x-tileLeft)/resolution));
            var offsetTop = Math.abs(Math.round((pLonlat.y-tileTop)/resolution));
            return {'x':tileX, 'y':tileY, 'offsetLeft':offsetLeft, 'offsetTop':offsetTop};
        },
        /**
         * 根据投影坐标,计算瓦片编号
         * @param  {[type]} pLonlat   [description]
         * @param  {[type]} zoomLevel [description]
         * @return {[type]}           [description]
         */
        getTileIndex:function(pLonlat, zoomLevel) {
            var tileSystem = this.tileSystem;
            var tileSize=this['tileSize'];
            // var maxExtent=tileSystem['origin'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.floor((tileSystem['origin']['y'] + tileSystem['scale']['y']*pLonlat.y) / ( resolution* tileSize['height']));
            var tileX = Math.floor((tileSystem['scale']['x']*pLonlat.x - tileSystem['origin']['x']) / (resolution * tileSize['width']));
            return {'y':tileY,'x':tileX};
        },
        /**
         * 根据给定的瓦片编号,和坐标编号偏移量,计算指定的瓦片编号
         * @param  {[type]} tileY   [description]
         * @param  {[type]} tileX   [description]
         * @param  {[type]} offsetY [description]
         * @param  {[type]} offsetX [description]
         * @return {[type]}         [description]
         */
        getNeighorTileIndex:function(tileY, tileX, offsetY,offsetX) {
            var tileSystem = this.tileSystem;
            return {'y':(tileY-tileSystem['scale']['y']*offsetY), 'x':(tileX+tileSystem['scale']['x']*offsetX)};
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
            var y = tileSystem['origin']['y'] + tileSystem['scale']['y']*(resolution* tileSize['height']);
            var x = tileSystem['scale']['x']*tileX*resolution*tileSize['width']+tileSystem['origin']['x'];
            return this.getProjectionInstance().unproject({x:x,y:y});
        }


});

