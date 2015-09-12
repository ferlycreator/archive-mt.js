Z['DynamicLayer']=Z.DynamicLayer=Z.TileLayer.extend({
    //瓦片图层的基础ZIndex
    baseZIndex:50,

    options:{
        'showOnTileLoadComplete':false,
        'padding' : 0,
        'minZoomLevel' : -1, //-1 means no limit
        'maxZoomLevel' : -1, //-1 means no limit
        'condition' : null,
        'spatialFilter' : null

    },

    initialize:function(id, opts) {
        this.setId(id);
        // this.options={};
        this.guid=this._GUID();
        Z.Util.setOptions(this, opts);
        //reload时n会增加,改变瓦片请求参数,以刷新浏览器缓存
        this.n=0;
    },

    _GUID:function() {
        return new Date().getTime()+""+(((1 + Math.random()) * 0x10000 + new Date().getTime()) | 0).toString(16).substring(1);
    },

    /**
     * 重新载入动态图层，当改变了图层条件时调用
     * @expose
     */
    reload:function() {
        this.n=this.n+1;
        this.load();
    },

    /**
     * 载入前的准备, 由父类中的load方法调用
     */
    _prepareLoad:function() {
        var map = this.getMap();
        var zoomLevel=map.getZoomLevel();
        var min = this.getMinZoomLevel();
        var max = this.getMaxZoomLevel();
        if (!Z.Util.isNil(min) && min>=0 && zoomLevel<min) {
            return false;
        }
        if (!Z.Util.isNil(max) && max>=0 && zoomLevel>max) {
            return false;
        }
        if (!this.options['layers'] || !this.options['mapdb']) {
            return false;
        }
        var me = this;
        var url=Z.host+"/dynamic/index";
        var param_spatialFilter= null;
        var spatialFilter = this.getSpatialFilter();
        if (spatialFilter) {
            param_spatialFilter = JSON.stringify(spatialFilter.toJson());
        }
        var queryString=this._formQueryString( this.getCondition(), param_spatialFilter);
        var ajax = new Z.Util.Ajax(url,0,queryString,function(responseText){
            var result = Z.Util.parseJson(responseText);
            if (result && result["success"]) {
                me._fillTiles(me.options['showOnTileLoadComplete']);
            }
        });
        //保证在高频率load时，dynamicLayer总能在zoom结束时只调用一次
        if (this.loadDynamicTimeout) {
            clearTimeout(this.loadDynamicTimeout);
        }

        this.loadDynamicTimeout = setTimeout(function() {
            ajax.post();
            if (!me.heartBeator) {
                me.heartBeator = new Z.Util.Ajax(Z.host+"/dynamic/heartbeat",0,"guid="+me.guid,function(responseText){
                });
                setInterval(function() {
                    me.heartBeator.get();
                },60*1000);
            }
        },map._getZoomMillisecs()+80);
        //通知父类先不载入瓦片
        return false;
    },

    _getTileUrl:function(x,y,z) {
        return this._getRequestUrl(y,x,z);
    },

    /**
     * 获得瓦片请求地址
     * @param topIndex
     * @param leftIndex
     * @param zoomLevel
     * @returns
     */
    _getRequestUrl:function(topIndex,leftIndex,zoomLevel){
            var src= Z.host+"/dynamic/tile?";
            src+=this._getRequestUrlParams(topIndex,leftIndex,zoomLevel);
            return src;
    },

    _getRequestUrlParams:function(topIndex,leftIndex,zoomLevel) {
        var map = this.getMap();
        var tileConfig = map._getTileConfig();
        var tileNw = tileConfig.getTileProjectedNw(topIndex,leftIndex,zoomLevel);
        var params="";
        params+="guid="+this.guid;
        params+="&nw="+tileNw.x+","+tileNw.y;
        params+="&z="+map._zoomLevel;
        params+="&c="+this.n;
        return params;
    },

    _formQueryString:function(condition,spatialFilter) {
        var map = this.getMap();
        var tileConfig = map._getTileConfig();
        var padding = this.getPadding();
        var config = {
            'coordinateType':(Z.Util.isNil(this.options['coordinateType'])?null:this.options['coordinateType']),
            'projection':tileConfig['projection'],
            'guid':this.guid,
            'encoding':'utf-8',
            'mapdb':this.options['mapdb'],
            'padding':padding["width"]+","+padding["height"],
            'len':tileConfig["tileSize"]["width"],
            'res':tileConfig['resolutions'][map.getZoomLevel()],
            'layers':this.options['layers'],
            'condition':condition,
            'spatialFilter':(Z.Util.isNil(spatialFilter)?null:encodeURIComponent(spatialFilter)),
            'opacity':(Z.Util.isNil(this.getOpacity())?null:this.getOpacity()),
            'symbolConfig':(Z.Util.isNil(this.options['symbolConfig'])?null:encodeURIComponent(JSON.stringify(this.options['symbolConfig'])))
        };
        var params = [];
        for (var p in config) {
            if (config.hasOwnProperty(p) && !Z.Util.isNil(config[p])) {
                params.push(p+'='+config[p]);
            }
        }
        return params.join('&');
        /*var ret = "projection="+tileConfig['projection']+"&guid="+this.guid;
        ret+="&encoding=utf-8";
        ret+="&mapdb="+this.options["mapdb"];
        // ret+="&coordinateType="+map.getCoordinateType();

        ret+="&padding="+padding["width"]+","+padding["height"];
        ret+="&len="+tileConfig["tileSize"]["width"];
        var opacity = this.getOpacity();
        if (!Z.Util.isNil(opacity)) {
            ret += "&opacity="+this.opacity;
        }

        if (map) {
            ret+="&r="+tileConfig['resolutions'][map.getZoomLevel()];
            var nt = (map._getProjection().srs != 'EPSG:4326');
            ret+="&nt="+nt;
        }

        if (this.options['layers']) {
            ret += ("&layer="+this.options['layers']);
        }
        if (!Z.Util.isNil(spatialFilter)) {
            ret += ("&spatialFilter="+encodeURIComponent(spatialFilter));
        }
        if (!Z.Util.isNil(condition)) {
            ret += ("&condition="+encodeURIComponent(condition));
        }*/
        /*if (!Z.Util.isNil(fieldFilter)) {
            ret += ("&cond="+encodeURIComponent(fieldFilter));
        }*/
        // return ret;
    },

    /**
     * 获取图层瓦片的padding设置
     * @return {Object} 图层padding设置
     * @expose
     */
    getPadding:function() {
        var padding = this.options['padding'];
        if (!padding) {
            padding = {'width':0, 'height':0};
        }
        return padding;
    },

    /**
     * 设置图层瓦片的padding
     * @param {Object} padding 图层padding设置
     * @expose
     */
    setPadding:function(padding) {
        this.options['padding'] = padding;
        return this;
    },

    /**
     * 获取最小显示比例尺级别
     * @expose
     * @returns {Number}
     */
    getMinZoomLevel:function(){
        var map = this.getMap();
        var ret =  this.options['minZoomLevel'];
        if (Z.Util.isNil(ret)) {
            ret = map.getMinZoomLevel();
        }
        return ret;
    },
    /**
     * 获取最大显示比例尺级别
     * @expose
     * @returns {Number}
     */
    getMaxZoomLevel:function(){
         var map = this.getMap();
        var ret =  this.options['maxZoomLevel'];
        if (Z.Util.isNil(ret)) {
            ret = map.getMaxZoomLevel();
        }
        return ret;
    },
    /**
     * 设定动态图层的最小显示比例尺层级
     * @expose
     * @param zoomLevel {Number}
     *
     */
    setMinZoomLevel:function(zoomLevel) {
        if (this.map) {
            var mapmin = this.map.getMinZoomLevel();
            if (zoomLevel < mapmin) {
                zoomLevel = mapmin;
            }
        }
        this.options['minZoomLevel']=zoomLevel;
        return this;
    },
    /**
     * 设定动态图层的最大显示比例尺层级
     * @expose
     * @param zoomLevel {Number}
     */
    setMaxZoomLevel:function(zoomLevel) {
        if (this.map) {
            var mapmax = this.map.getMaxZoomLevel();
            if (zoomLevel > mapmax) {
                zoomLevel = mapmax;
            }
        }
        this.options['maxZoomLevel']=zoomLevel;
        return this;
    },

    /**
     * 设定动态图层的透明度
     * @param opacity
     * @expose
     */
    setOpacity:function(opacity) {
        this.options['opacity'] = opacity;
        return this;
    },

    /**
     * 返回动态图层的透明度
     * @return {Number} 透明度
     * @expose
     */
    getOpacity:function() {
        return this.options['opacity'];
    },

    /**
     * 设定查询过滤条件
     * @param {String} condition 查询过滤条件
     * @expose
     */
    setCondition:function(condition) {
        this.options['condition'] = condition;
        return this;
    },

    /**
     * 获取查询过滤条件
     * @return {String} 查询过滤条件
     * @expose
     */
    getCondition:function() {
        return this.options['condition'];
    },

    /**
     * 设定空间过滤条件
     * @param {SpatialFilter} spatialFilter 空间过滤条件
     * @expose
     */
    setSpatialFilter:function(spatialFilter) {
        this.options['spatialFilter'] = spatialFilter;
        return this;
    },

    /**
     * 获取空间过滤条件
     * @return {SpatialFilter} 空间过滤条件
     * @expose
     */
    getSpatialFilter:function() {
        return this.options['spatialFilter'];
    }
});