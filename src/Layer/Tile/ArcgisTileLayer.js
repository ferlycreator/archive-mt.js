/**
 * arcgis 瓦片图层
 * @class maptalks.ArcgisTileLayer
 * @extends maptalks.TileLayer
 * @author Maptalks Team
 */
Z['ArcgisTileLayer'] = Z.ArcgisTileLayer = Z.TileLayer.extend({
    //根据不同的语言定义不同的错误信息
    exceptionDefs:{
        'en-US':{
           'INVALID_SERVICE' : 'invalid arcgis rest service'
        },
        'zh-CN':{
            'INVALID_SERVICE' : '无效的Arcgis rest服务'
        }
    },

    options:{
        service:'',
        version:10.2
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
     * 读取ArcGIS Rest服务的LOD信息
     * @param  {fn} onLoadedFn 读取完后的回调
     */
    _readAndParseServiceInfo:function(onLoadedFn) {
        //http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer?f=pjson
        var service = this.options['service'];
        if (Z.Util.isString(service) && service.indexOf('http') >= 0) {
            //网址
            var remoteUrl = service+'?f=pjson';
            var url = Z.host+"/maptalks/proxy?url="+remoteUrl;
            var me = this;
            var ajax = new Z.Util.Ajax(url,0,null,function(responseText){
                var serviceInfo = Z.Util.parseJSON(responseText);
                var tileInfo = me._parseServiceInfo(serviceInfo);
                me._tileConfig = new Z.TileConfig(tileInfo);
                if (onLoadedFn) {
                    onLoadedFn();
                }
            });
            ajax.get();
        } else {
            //service 也可以直接是arcgis的rest服务json
            var tileInfo = this._parseServiceInfo(service);
            this._tileConfig = new Z.TileConfig(tileInfo);
            if (onLoadedFn) {
                onLoadedFn();
            }
        }
    },



    /**
     * 解析ArcGIS Rest服务返回的瓦片服务信息
     * @param  {[type]} serviceInfo [description]
     * @return {[type]}                 [description]
     */
    _parseServiceInfo:function(serviceInfo) {
        if (!serviceInfo) {
            throw new Error(this.exceptions['INVALID_SERVICE']+':'+this.options['service']);
        }
        var extension = '';
        /*var version = serviceInfo['version'];
        this.options['version'] = version;

        if (this.version && this.version < 10.1) {
            extension += "."+serviceInfo['tileInfo']['format'];
        }*/
        this.options['urlTemplate'] = this.options['service']+'/tile/{z}/{y}/{x}'+extension;

        //projection , 目前只支持3857和4326两种,
        //根据投影坐标的单位决定, 如果是degree, 则是4326, 如果是meter则是3857
        var _projection;
        var units = serviceInfo['units'];
        if (units.toLowerCase().indexOf('degree') >= 0) {
            _projection = 'EPSG:4326';
        } else {
            _projection = 'EPSG:3857';
        }

        var lods = serviceInfo['tileInfo']['lods'];
        var size = lods.length;

        var _minZoom = lods[0]['level'];
        var _maxZoom = lods[size-1]['level'];

        var _resolutions = [];
        for (var i=0;i<size;i++) {
            _resolutions.push(lods[i]['resolution']);
        }

        var fullExtent = serviceInfo['fullExtent'];
        var _fullExtent = {
            'top'   : fullExtent['ymax'],
            'left'  : fullExtent['xmin'],
            'bottom': fullExtent['ymin'],
            'right' : fullExtent['xmax']
        };

        var tileInfo = serviceInfo['tileInfo'];
        var _tileSize = {
            'width'  : tileInfo['rows'],
            'height' : tileInfo['cols'],
            'dpi'    : tileInfo['dpi']
        };

        var _tileSystem = [1, -1, tileInfo['origin']['x'],
            tileInfo['origin']['y']];

        var tileInfo = {
            'projection'    : _projection,
            'tileSystem'    : _tileSystem,
            'minZoom'  : _minZoom,
            'maxZoom'  : _maxZoom,
            'resolutions'   : _resolutions,
            'fullExtent'    : _fullExtent,
            'tileSize'      : _tileSize
        };
        return tileInfo;
    }


});
