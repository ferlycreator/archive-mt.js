/**
 * Map类的扩展:拓扑计算的相关方法
 */
Z.Map.include({
    /**
     * 计算两坐标间距离，计算结果单位为米，如果返回-1，则说明参数不合法
     * @member maptalks.Map
     * @param {maptalks.Coordinate} lonlat1 坐标1，例如{x:121,y:19}
     * @param {maptalks.Coordinate} lonlat2 坐标2，例如{x:122,y:19}
     * @return {Number} 距离
     * @expose
     */
    computeDistance: function(lonlat1, lonlat2) {
        if (!Z.Util.isCoordinate(lonlat1) || !Z.Util.isCoordinate(lonlat2) || !this._getProjection()) {return null;}
        if (Z.Coordinate.equals(lonlat1,lonlat2)) {return 0;}
        return this._getProjection().getGeodesicLength(lonlat1, lonlat2);
    },

    /**
     * 计算Geometry的地理长度
     * @member maptalks.Map
     * @param {maptalks.Geometry} geometry 图形
     * @return {Number} 长度
     * @expose
     */
    computeGeodesicLength:function(geometry) {
        return geometry._computeGeodesicLength(this._getProjection());
    },

    /**
     * 计算Geometry的地理面积
     * @member maptalks.Map
     * @param  {maptalks.Geometry} geometry
     * @return {Number}          地理面积
     * @expose
     */
    computeGeodesicArea:function(geometry) {
        return geometry._computeGeodesicArea(this._getProjection());
    },

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
                "fillSymbol":{
                    "fillOpacity" : 0
                },
                "strokeSymbol":{
                    "stroke" : "#800040",
                    "strokeWidth" : 2,
                    "strokeOpacity" : 1,
                    "strokeDasharray" : "--"
                }
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
            result = new Z.Circle(me._center, distance);
            result.setSymbol(defaultOption);
            callback({
                "success" : true,
                "data" : result
            });
            return;
        } else if (geometry instanceof Z.Circle) {
            var radius = me.radius + distance;
            result = new Z.Circle(me._center, radius);
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

    /**
     * Identify
     * @member maptalks.Map
     * @param  {opts} opts 查询参数 {point: point, "layers": [], "success": fn}
     * @expose
     */
    identify: function(opts) {
        if (!opts) {
            return;
        }
        var layers = opts['layers'];
        if(!Z.Util.isArrayHasData(layers)) {
            return;
        }
        var point = opts.point;
        var fn = opts['success'];
        var hits = [];
        for (var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var layerId = layer.getId();

            if(!layer || !layer.getMap() || layerId.indexOf('mt__internal_layer') >= 0) {
                continue;
            }

            var allGeos = layers[i].getAllGeometries();
            for (var j=0, length = allGeos.length; j<length; j++) {
                var geo = allGeos[i];
                if (geo&&geo._containsPoint(point)) {
                    hits.push(geo);
                }
            }
        }
        fn.call(this, {success: hits.length > 0, data: hits});
    }

});
