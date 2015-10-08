/**
 * 查询类
 * @class maptalks.FeatureQuery
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z.FeatureQuery=Z.Class.extend({
    /**
     * 查询远程服务器上的数据
     * @param  {Object} opts 查询参数
     * @constructor
     */
    initialize:function(opts) {
        if (!opts) {
            return;
        }
        this.host = opts['host'];
        this.port = opts['port'];
        if (!this.host || !this.port) {
            //默认采用js的服务地址作为查询地址
            var url = new Z.Url(Z.prefix);
            this.host = url.getHost();
            this.port = url.getPort();
        }
        this.mapdb = opts['mapdb'];
    },

    /**
     * 检查查询参数是否正常
     * @return {Boolean} true|false
     */
    check:function() {
        if (!this.mapdb) {
            return false;
        }
        return true;
    },

    /**
     * 获取空间库主机地址
     * @return {String} 空间库主机地址
     */
    getHost:function() {
        return this.host+':'+this.port;
    },

    /**
     * Identify
     * @param  {Object} opts 查询参数
     * @return 查询结果
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
            'condition': opts['condition']
        };
        if (opts['coordinateType']) {
            queryFilter['coordinateType'] = opts['coordinateType'];
        }
        opts['queryFilter']=queryFilter;
        opts['page'] = 0;
        opts['count'] = 1;
        this.query(opts);
    },

    /**
     * query
     * @param  {Object} opts 查询参数
     * @expose
     */
    query:function(opts) {
        if (!opts || !this.check()) {
            throw new Error('invalid options for FeatureQuery\'s query method.');
        }
        if (!opts['layer']) {
            throw new Error('layer is not specified in query options.');
        }
        var layer = opts['layer'];

        if (!layer) {
            throw new Error('layer is not specified in query options.');
        }
        if (!Z.Util.isFunction(opts['success'])) {
            throw new Error('success callback function is not specified in query options.');
        }
        //•/databases/{db}/layers/{id}/data?op=query
        var url='http://'+this.getHost()+"/enginerest/rest/databases/"+this.mapdb+"/layers/"+layer+"/data?op=query";
        var queryFilter = opts['queryFilter'];
        if (!queryFilter) {
            //默认的queryFilter
            queryFilter = {
                'fields':'*'
            };
        }
        var queryString=this.formQueryString(queryFilter);
        if (Z.Util.isNumber(opts['page'])) {
            queryString += "&page="+opts['page'];
        }
        if (Z.Util.isNumber(opts['count'])){
            queryString += "&count="+opts['count'];
        }
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
                        opts['success']([]);
                    } else {
                        if (false === queryFilter['returnGeometry']) {
                            //不返回Geometry,直接返回属性数据
                            opts['success'](datas);
                        } else {
                            var geos = Z.GeoJson.fromGeoJson(datas);
                            opts['success'](geos);
                        }
                    }
                }
            }

            ajax = null;
        });

        ajax.post();
    },

    /**
     * 构造查询url
     * @param  {Object} queryFilter 查询条件
     * @return {String} 查询url
     * @expose
     */
    formQueryString:function(queryFilter) {
        var ret = 'encoding=utf-8';
        //ret+="&method=add";
        ret+='&mapdb='+this.mapdb;
        if (queryFilter['coordinateType']) {
            ret+='&coordinateType='+queryFilter['coordinateType'];
        }
        if (!Z.Util.isNil(queryFilter['returnGeometry'])) {
            ret+='&returnGeometry='+queryFilter['returnGeometry'];
        }
        if (queryFilter['spatialFilter']) {
            var spatialFilter = queryFilter['spatialFilter'];
            if (spatialFilter.getGeometry()) {
                if (queryFilter['coordinateType']) {
                    spatialFilter.getGeometry().setCoordinateType(queryFilter['coordinateType']);
                }
                ret += ('&spatialFilter='+encodeURIComponent(JSON.stringify(queryFilter['spatialFilter'].toJson())));
            }

        }
        if (queryFilter['condition']) {
            ret += ('&condition='+encodeURIComponent(queryFilter['condition']));
        }
        if (queryFilter['resultFields']) {
            var fields = queryFilter['resultFields'];
            if (Z.Util.isArray(fields)) {
                fields = fields.join(',');
            }
            ret += ('&fields='+fields);
        }
        return ret;
    }
});
