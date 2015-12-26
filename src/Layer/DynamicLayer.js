Z['DynamicLayer'] = Z.DynamicLayer = Z.TileLayer.extend({
    type: 'dynamic',

    //瓦片图层的基础ZIndex
    baseZIndex: 50,

    options: {
        baseUrl: '',
        format: 'png',
        showOnTileLoadComplete: false
        // mapdb: '',
        // layers: [{name: 'name', condition: '', spatialFilter: {}, cartocss: '', cartocss_version: ''}]
    },

    initialize: function(id, opts) {
        this.setId(id);
        Z.Util.setOptions(this, opts);
        //reload时n会增加,改变瓦片请求参数,以刷新浏览器缓存
        this.n = 0;
    },

    /**
     * 重新载入动态图层，当改变了图层条件时调用
     * @expose
     */
    reload: function() {
        this.n = this.n + 1;
        this.load();
    },

    /**
     * 载入前的准备, 由父类中的load方法调用
     */
    _prepareLoad: function() {
        var map = this.getMap();
        var zoom = map.getZoom();
        var min = this.getMinZoom();
        var max = this.getMaxZoom();
        if (!Z.Util.isNil(min) && min >= 0 && zoom < min) {
            return false;
        }
        if (!Z.Util.isNil(max) && max >= 0 && zoom > max) {
            return false;
        }
        if (!this.options['layers'] || !this.options['mapdb']) {
            return false;
        }
        var me = this;
        var url = this.options.baseUrl;
        var queryString = this._formQueryString();
        var ajax = new Z.Util.Ajax(url, 0, queryString, function(responseText) {
            var result = Z.Util.parseJSON(responseText);
            if (result && result.hasOwnProperty('layergroupid')) {
                me._token = result.layergroupid;
                me._render.render(me.options.showOnTileLoadComplete);
            }
        });
        //保证在高频率load时，dynamicLayer总能在zoom结束时只调用一次
        if (this._loadDynamicTimeout) {
            clearTimeout(this._loadDynamicTimeout);
        }

        this._loadDynamicTimeout = setTimeout(function() {
            ajax.post('application/json');
        }, map._getZoomMillisecs() + 80);
        //通知父类先不载入瓦片
        return false;
    },

    _getTileUrl: function(x, y, z) {
        return this._getRequestUrl(y, x, z);
    },

    /**
     * 获得瓦片请求地址
     * @param topIndex
     * @param leftIndex
     * @param zoomLevel
     * @returns
     */
    _getRequestUrl: function(topIndex, leftIndex, zoom) {
        var map = this.getMap();
        var tileConfig = map._getTileConfig();
        var sw = tileConfig.getTileProjectedSw(topIndex, leftIndex, zoom);
        var parts = [];
        parts.push(this.options.baseUrl);
        parts.push(this._token);
        parts.push(zoom);
        parts.push(tileConfig.getResolution(zoom));
        parts.push(sw[0]); // xmin
        parts.push(sw[1]); // ymin
        var url = parts.join('/');
        url += '.' + this.options.format;
        return url;
    },

    _formQueryString: function() {
        var map = this.getMap();
        var mapConfig = {};
        mapConfig.version = '1.0.0';
        // mapConfig.extent = [];
        mapConfig.minzoom = this.getMinZoom();
        mapConfig.maxzoom = this.getMaxZoom();
        mapConfig.layers = [];
        for(var i = 0, len = this.options.layers.length; i < len; i++) {
            var l = this.options.layers[i];
            var q = {
                condition: l.condition,
                spatialFilter: l.spatialFilter,
                resultCrs: map.getCRS(),
                resultFields: ['*']
            };
            var layer = {
                type: 'maptalks',
                options: {
                    dbname: this.options.mapdb,
                    layer: l.name,
                    filter: JSON.stringify(q),
                    cartocss: l.cartocss,
                    cartocss_version: l.cartocss_version
                }
            };
            mapConfig.layers.push(layer);
        }
        // what does 'application/json' mean?
        return JSON.stringify(mapConfig);
    },

    /**
     * 获取最小显示比例尺级别
     * @expose
     * @returns {Number}
     */
    getMinZoom: function(){
        var map = this.getMap();
        var ret =  this.options['minZoom'];
        if (Z.Util.isNil(ret)) {
            ret = map.getMinZoom();
        }
        return ret;
    },
    /**
     * 获取最大显示比例尺级别
     * @expose
     * @returns {Number}
     */
    getMaxZoom: function(){
         var map = this.getMap();
        var ret =  this.options['maxZoom'];
        if (Z.Util.isNil(ret)) {
            ret = map.getMaxZoom();
        }
        return ret;
    },
    /**
     * 设定动态图层的最小显示比例尺层级
     * @expose
     * @param zoomLevel {Number}
     *
     */
    setMinZoom: function(zoomLevel) {
        if (this.map) {
            var mapmin = this.map.getMinZoom();
            if (zoomLevel < mapmin) {
                zoomLevel = mapmin;
            }
        }
        this.options['minZoom']=zoomLevel;
        return this;
    },
    /**
     * 设定动态图层的最大显示比例尺层级
     * @expose
     * @param zoomLevel {Number}
     */
    setMaxZoom: function(zoomLevel) {
        if (this.map) {
            var mapmax = this.map.getMaxZoom();
            if (zoomLevel > mapmax) {
                zoomLevel = mapmax;
            }
        }
        this.options['maxZoom']=zoomLevel;
        return this;
    },

    /**
     * 设定动态图层的透明度
     * @param opacity
     * @expose
     */
    setOpacity: function(opacity) {
        this.options['opacity'] = opacity;
        return this;
    },

    /**
     * 返回动态图层的透明度
     * @return {Number} 透明度
     * @expose
     */
    getOpacity: function() {
        return this.options['opacity'];
    }

});
