/**
 * 拓扑查询类
 * @class maptalks.TopoQuery
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z.TopoQuery=function(opts) {
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
};

Z.TopoQuery.prototype={
    /**
     * 计算Geometry的外缓冲，该功能需要引擎服务器版的支持
     * @member maptalks.Map
     * @param {maptalks.Geometry} [geometry] [做缓冲的geometry]
     * @param {Number} distance 缓冲距离，单位为米
     * @param {Function} callback 计算完成后的回调函数，参数为返回的图形对象
     * @expose
     */
    buffer:function(geometry, distance, callback) {
        var defaultOption = {
                'linecolor' : '#800040',
                'linewidth' : 2,
                'lineOpacity' : 1,
                'lineDasharray' :[20,10,5,5,5,10],
                'polygonOpacity': 0
        };
        var me = geometry;
        var result = null;
        function formQueryString() {
            var ret = "distance=" + distance;
            ret += "&encoding=utf-8";
            ret += "&data=" + encodeURIComponent(JSON.stringify(me.toJson()));
            return ret;
        }
        // 点和圆形的buffer直接进行计算
        if (geometry instanceof Z.Marker) {
            result = new Z.Circle(me.getCenter(), distance);
            result.setSymbol(defaultOption);
            callback({
                "success" : true,
                "data" : result
            });
            return;
        } else if (geometry instanceof Z.Circle) {
            var radius = me.radius + distance;
            result = new Z.Circle(me.getCenter(), radius);
            result.setSymbol(defaultOption);
            callback({
                "success" : true,
                "data" : result
            });
            return;
        } else {
            var url =Z.host + "/enginerest/geometry/buffer";
            var queryString = formQueryString();
            var ajax = new Z.Util.Ajax(url, 0, queryString, function(
                    resultText) {
                var result = Z.Util.parseJson(resultText);
                if (!result["success"]) {
                    callback(result);
                }
                var resultGeo = Z.Geometry.fromJson(result["data"]);
                if (!resultGeo) {
                    callback({
                        "success" : false,
                        "data" : null
                    });
                    return;
                }
                resultGeo.setSymbol(defaultOption);
                callback({
                    "success" : true,
                    "data" : resultGeo
                });
            });
            ajax.post();
        }

    },

    /**
     * 判断Geometry和参数中的Geometry数组的空间关系，该功能需要引擎服务器版的支持
     * @member maptalks.Map
     * @param {maptalks.Geometry} [geometry] [被relate的Geometry]
     * @param {maptalks.Geometry[]} geometries 输入Geometry数组
     * @param {Number} relation  空间关系，参考seegoo.maps.constant内的常量定义
     * @param {Function} callback 回调函数，参数为布尔类型数组，数组长度与geometries参数数组相同，每一位代表相应的判断结果
     * @expose
     */
    relate:function(geometry, geometries, relation, callback) {
        if (!geometries || !geometries["length"] || relation < 0 || relation > 7) {
            return;
        }
        var _geometry = geometry;
        function formQueryString() {
            var geoJsons = [];
            for (var i=0, len=geometries.length;i<len;i++) {
                geoJsons.push(JSON.stringify(geometries[i].toJson()));
            }
            var ret = "geo1=" + JSON.stringify(_geometry.toJson());
            ret += "&geos=[" + geoJsons.join(",")+"]";
            ret += "&relation=" + relation;
            return ret;
        }
        var url = Z.host + "/enginerest/geometry/relation";
        var queryString = formQueryString();
        var ajax = new Z.Util.Ajax(url, 0, queryString, function(
                resultText) {
            var result = eval("(" + resultText + ")");
            callback(result);
        });
        ajax.post();
    },
};
