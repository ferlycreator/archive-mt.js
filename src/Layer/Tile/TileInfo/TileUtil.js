
Z.TileUtil={
    Common:{
        caculateScales:function(base) {
            var xscales=[];
            var yscales=[];
            var projection = this.projection;
            var resolutions = this['resolutions'];
            if (!base) {base = {"x":121.45634,"y":31.22787};}
            var pBase = projection.project({x:base.x, y:base.y});
            for (var i=0, len=resolutions.length;i<len;i++) {
                var xcac = projection.unproject({x:pBase.x+resolutions[i],y:pBase.y}); //加上resolution后反算真经纬度
                var ycac = projection.unproject(pBase.x,pBase.y+resolutions[i]); //加上resolution后反算真经纬度
                var xscale = projection.getGeodesicLength(base,xcac);
                var yScale = projection.getGeodesicLength(base,ycac);
                xscales.push(xscale);
                yscales.push(yScale);
            }
            this.xscales = xscales;
            this.yscales = yscales;
        }
    },
    Default:{
        /**
         * 根据中心点投影坐标, 计算中心点对应的瓦片和瓦片内偏移量
         * @param  {Coordinate} pLonlat 投影坐标
         * @param  {Number} zoomLevel 地图当前zoom级别
         * @returns {Object}
         */
        getCenterTileIndex:function( pLonlat, zoomLevel) {
            if (!pLonlat || zoomLevel === null || zoomLevel === undefined) {return null;}
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            var tileLeft = tileSize['width']*tileX * resolution+this['origin']['left'];
            var tileTop = this['origin']['top'] - tileY* resolution * tileSize['height'];
            var offsetLeft = Math.abs(Math.round((pLonlat.x-tileLeft)/resolution));
            var offsetTop = Math.abs(Math.round((pLonlat.y-tileTop)/resolution));
            return {'x':tileX, 'y':tileY, 'offsetLeft':offsetLeft, 'offsetTop':offsetTop};
        },
        /**
         * 根据投影坐标,计算瓦片编号
         * @param  {Coordinate} pLonlat 投影坐标
         * @param  {Number} zoomLevel 地图当前zoom级别
         * @returns {Object}
         */
        getTileIndex:function(pLonlat, zoomLevel) {
            var tileSize=this['tileSize'];
            var maxExtent=this['origin'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.ceil((maxExtent['top'] - pLonlat.y) / ( resolution* tileSize['height'])) - 1;
            var tileX = Math.floor((pLonlat.x - maxExtent['left']) / (resolution * tileSize['width']));
            return {'y':tileY,'x':tileX};
        },
        /**
         * 根据给定的瓦片编号,和坐标编号偏移量,计算指定的瓦片编号
         * @param  {Number} tileY
         * @param  {Number} tileX
         * @param  {Number} offsetY
         * @param  {Number} offsetX
         * @returns {Object}
         */
        getNeighorTileIndex:function(tileY, tileX, offsetY,offsetX) {
            return {'y':(tileY+offsetY), 'x':(tileX+offsetX)};
        },
        /**
         * 计算瓦片左上角的经纬度坐标
         * @param  {Number} tileY 瓦片编号
         * @param  {Number} tileX 瓦片编号
         * @param  {Number} zoomLevel 地图当前zoom级别
         * @returns {Coordinate} 瓦片左上角坐标
         */
        getTileProjectedNw:function(tileY,tileX,zoomLevel) {
            var resolution = this['resolutions'][zoomLevel];
            var tileSize = this['tileSize'];
            var maxExtent = this['origin'];
            var y = maxExtent['top'] - tileY*(resolution* tileSize['height']);
            var x = tileX*resolution*tileSize['width']+maxExtent["left"];
            return this.getProjectionInstance().unproject({x:x,y:y});
        }
    },
    GLOALMERCATOR:{
        getCenterTileIndex:function(pLonlat, zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            var tileLeft = tileSize['width']*tileX * resolution+this['origin']['left'];
            var tileTop = (tileY+1)* resolution * tileSize['height']+this['origin']['bottom'];
            var offsetLeft = Math.round((pLonlat.x-tileLeft)/resolution);
            var offsetTop = Math.round((tileTop-pLonlat.y)/resolution);
            return {"y":tileY, "x":tileX, "offsetLeft":offsetLeft, "offsetTop":offsetTop};
        },
        getTileIndex:function( pLonlat, zoomLevel) {
            var maxExtent = this['origin'];
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.floor((pLonlat.y-maxExtent['bottom'])/(resolution* tileSize['height']));
            var tileX = Math.floor((pLonlat.x-maxExtent['left']) / (resolution * tileSize['width']));
            return {'y':tileY,'x':tileX};
        },
        getNeighorTileIndex:function(tileY, tileX, offsetY,offsetX) {
            return {'y':(tileY-offsetY), 'x':(tileX+offsetX)};
        },
        getTileProjectedNw:function(tileY,tileX,zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var y = (tileY+1)*(resolution* tileSize['height'])+this['origin']['bottom'];
            var x = tileX*resolution*tileSize['width']+this['origin']['left'];
            return this.getProjectionInstance().unproject({x:x,y:y});
        }
    },
    BD09:{
        getCenterTileIndex:function(pLonlat, zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var tileIndex = this.getTileIndex(pLonlat, zoomLevel);
            var tileY = tileIndex.y;
            var tileX = tileIndex.x;
            var tileLeft = tileSize['width']*tileX * resolution;
            var tileTop = (tileY+1)* resolution * tileSize['height'];
            var offsetLeft = Math.round((pLonlat.x-tileLeft)/resolution);
            var offsetTop = Math.round((tileTop-pLonlat.y)/resolution);
            return {"y":tileY, "x":tileX, "offsetLeft":offsetLeft, "offsetTop":offsetTop};
        },
        getTileIndex:function( pLonlat, zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var tileY = Math.floor(pLonlat.y/(resolution* tileSize['height']));
            var tileX = Math.floor((pLonlat.x) / (resolution * tileSize['width']));
            return {'y':tileY,'x':tileX};
        },
        getNeighorTileIndex:function(tileY, tileX, offsetY,offsetX) {
            return {'y':(tileY-offsetY), 'x':(tileX+offsetX)};
        },
        getTileProjectedNw:function(tileY,tileX,zoomLevel) {
            var tileSize = this['tileSize'];
            var resolution = this['resolutions'][zoomLevel];
            var y = (tileY+1)*(resolution* tileSize['height']);
            var x = tileX*resolution*tileSize['width'];
            return this.getProjectionInstance().unproject({x:x,y:y});
        }
    }
};