/**
 * Maptalks瓦片图层
 * @class maptalks.MaptalksTileLayer
 * @extends maptalks.TileLayer
 * @author Maptalks Team
 */
Z['MaptalksTileLayer'] = Z.MaptalksTileLayer = Z.TileLayer.extend({
    //根据不同的语言定义不同的错误信息
    exceptionDefs:{
        'en-US':{
           'INVALID_SERVICE' : 'invalid maptalks tile service'
        },
        'zh-CN':{
            'INVALID_SERVICE' : '无效的maptalks瓦片服务'
        }
    },

    options:{
        'host':null,
        'service':''
    },

    initialize:function(id, options) {
        Z.Util.setOptions(this, options);
    },

    /**
     * * 加载TileConfig
     * @param  {fn} onLoaded 加载完成后的回调函数
     */
    _loadTileConfig:function(onLoaded) {
        this._readAndParseServiceInfo(function() {
            if (onLoaded) {
                onLoaded();
            }
        });

    },

    /**
     * 读取MapTalks瓦片服务的LOD信息
     * @param  {fn} onLoadedFn 读取完后的回调
     */
    _readAndParseServiceInfo:function(onLoadedFn) {
        var remoteHost = (this.options['host']?this.options['host']:Z.host);
        var url = remoteHost + '/tileservice/tileinfo?n=' + this.options['service'];
        var me = this;
        var ajax = new Z.Util.Ajax(url,0,null,function(responseText){
            var tileInfo = Z.Util.parseJson(responseText);
            me._tileConfig = new Z.TileConfig(tileInfo);
            if (onLoadedFn) {
                onLoadedFn();
            }
        });
        ajax.get();
    }
});