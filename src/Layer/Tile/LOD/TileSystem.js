/**
 * 瓦片系统描述类
 * @param  {Object} scale   x,y轴计算系数
 * @param  {Object} origin 计算原点
 */
Z.TileSystem=function(sx, sy, ox, oy){
    if (Z.Util.isArray(sx)) {
        this.scale =  { x : sx[0] , y : sx[1] };
        this.origin = { x : sx[2] , y : sx[3] };
    } else {
        this.scale =  { x : sx , y : sy };
        this.origin = { x : ox , y : oy };
    }
};

Z.Util.extend(Z.TileSystem, {
    //TMS瓦片系统的参考资料:
    //http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification
    //OSGEO组织的TMS瓦片系统, profile为global-mercator, mbtiles等tms标准瓦片服务采用该标准
    'TMS-GLOBAL-MERCATOR' : new Z.TileSystem(1, 1, -20037508.34, -20037508.34),

    //OSGEO组织的TMS瓦片系统, profile为global-geodetic
    'TMS-GLOBAL-GEODETIC' : new Z.TileSystem(1, 1, -180, -90),

    //谷歌, 必应,高德, 腾讯等地图服务采用的瓦片系统
    'WEB-MERCATOR' : new Z.TileSystem(1, -1, -20037508.34, 20037508.34),

    //百度地图采用的瓦片系统
    'BAIDU' : new Z.TileSystem(1, 1, 0, 0),

    getInstance:function(ts) {
        return Z.TileSystem[ts.toUpperCase()];
    }
});