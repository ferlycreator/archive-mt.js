Z['RemoteQuery']=Z.RemoteQuery=Z.Class.extend({
    /**
     * 查询远程服务器上的数据
     * @param  {[type]} opts [description]
     * @constructor 
     */
    initialize:function(opts) {
        if (!opts) {
            return;
        }
        this.host = opts['host'];
        this.port = opts['port'];
        this.mapdb = opts['mapdb'];
    },

    check:function() {
        if (!this.mapdb) {
            return false;
        }
        return true;
    },

    getHost:function() {
        if (this.host && this.port) {
            return this.host+':'+this.port;
        }
        return Z.host;
    },

    /**
     * Identify
     * @param  {Object} opts 查询参数
     * @expose
     */
    identify:function(opts) {
        if (!opts) {
            return;
        }
        var coordinate = opts['coordinate'];
        var radius = opts["radius"];
        var spatialFilter = new Z.SpatialFilter(new Z.Circle(coordinate, radius), Z.SpatialFilter.RELATION_INTERSECT);
        var queryFilter = {
            'spatialFilter': spatialFilter,
            'condition': opts['condition'],
            'symbol': true,
            'page': 0,
            'count': 10000
        };
        if (opts['fromCoordinateType']) {
            queryFilter['fromCoordinateType'] = opts['fromCoordinateType'];
        }
        if (opts['toCoordinateType']) {
            queryFilter['toCoordinateType'] = opts['toCoordinateType'];
        }
        opts['queryFilter']=queryFilter;
        this.query(opts);
    },

    /**
     * query
     * @param  {Object} opts 查询参数
     * @expose
     */
    query:function(opts) {
        if (!opts || !this.check()) {
            throw new Error('invalid options for RemoteQuery\'s query method.');
        }
        if (!opts['layers']) {
            throw new Error('layers is not specified in query options.');
        }
        var layers = opts['layers'];
        //如果是数组,则变成字符串
        if (Z.Util.isArrayHasData(layers)) {
            layers = layers.join(',');
        }
        if (layers.length === 0) {
            throw new Error('layers is not specified in query options.');
        }
        if (!Z.Util.isFunction(opts['success'])) {
            throw new Error('success callback function is not specified in query options.');
        }
        //•/databases/{db}/layers/{id}/data?op=query
        var url='http://'+this.getHost()+"/enginerest/rest/databases/"+this.mapdb+"/layers/"+layers+"/data?op=query";
        var queryFilter = opts['queryFilter'];
        if (!queryFilter) {
            //默认的queryFilter
            queryFilter = {
                'symbol':true,
                'fields':'*',
                'page':0,
                'count':10
            };
        }
        var queryString=this.formQueryString(queryFilter);
        //var beginTime=new Date().getTime();
        var ajax = new Z.Util.Ajax(url,0,queryString,function(response){
            if (!response) {
                //20000是未知错误的错误代码
                if (Z.Util.isFunction(opts['error'])) {
                    opts['error']({"success":false,"errCode":Z.Constant.ERROR_CODE_UNKNOWN,"error":""});
                }
                return;
            } else {
                var result = Z.Util.parseJson(response);
                if (!result) {
                    //20000是未知错误的错误代码
                    if (Z.Util.isFunction(opts['error'])) {
                        opts['error']({"success":false,"errCode":Z.Constant.ERROR_CODE_UNKNOWN,"error":""});
                    }
                } else if (!result["success"]) {
                    if (Z.Util.isFunction(opts['error'])) {
                        opts['error'](result);
                    }
                } else {
                    var datas=result["data"];
                    if (!Z.Util.isArrayHasData(datas)) {
                        opts['success']({"success":true,"data":[]});
                    } else {
                        var geos = Z.Geometry.fromJson(datas);                         
                        opts['success']({"success":true,"data":geos});
                    }
                }                           
            }
            
            ajax = null;
        }); 
        
        ajax.post();
    },

    formQueryString:function(queryFilter) {
        var ret = "encoding=utf-8";        
        //ret+="&method=add";
        ret+="&mapdb="+this.mapdb;
        if (queryFilter['toCoordinateType']) {
            ret+="&coordinateType="+this.getCoordinateType();
        }
        if (queryFilter['symbol']) {
            ret+="&needsymbol=true";
        }
        if (queryFilter['layers']) {
            ret += ("&layer="+queryFilter['layers']);
        }
        if (Z.Util.isNumber(queryFilter['page'])) {
            ret += "&page="+queryFilter['page'];
        }
        if (Z.Util.isNumber(queryFilter['count'])) {
            ret += "&count="+queryFilter['count'];
        }
        if (queryFilter['spatialFilter']) {
            var spatialFilter = queryFilter['spatialFilter'];
            if (spatialFilter.getGeometry()) {
                if (queryFilter['toCoordinateType']) {
                    spatialFilter.getGeometry().setCoordinateType(queryFilter['toCoordinateType']);
                }
                ret += ("&spatialFilter="+encodeURIComponent(JSON.stringify(queryFilter['spatialFilter'].toJson())));
            }
            
        }
        if (queryFilter['condition']) {
            ret += ("&attributeCond="+encodeURIComponent(queryFilter['condition']));
        }
        if (queryFilter['fields']) {
            ret += ("&fields="+queryFilter['fields']);
        }
        // if (fieldFilter != null) {
        //     ret += ("&cond="+encodeURIComponent(fieldFilter));
        // }
        return ret;
    }
});