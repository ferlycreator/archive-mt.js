/**
 * Map类的扩展:拓扑计算的相关方法
 */
Z.MapExt.Topo={
    /**
     * 计算两坐标间距离，计算结果单位为米，如果返回-1，则说明参数不合法
     * 
     * @param lonlat1 {seegoo.maps.MLonLat|Object} 坐标1，例如{x:121,y:19}
     * @param lonlat2 {seegoo.maps.MLonLat|Object} 坐标2，例如{x:122,y:19}
     * @returns {Number}
     * @export
     */
    computeDistance: function(lonlat1, lonlat2) {
        if (!Z.Util.isCoordinate(lonlat1) || !Z.Util.isCoordinate(lonlat2) || !this.getProjection()) {return null;}
        if (Z.Coordinate.equals(lonlat1,lonlat2)) {return 0;}
        return this.getProjection().getGeodesicLength(lonlat1, lonlat2);
    },    

    /**
     * 计算Geometry的地理长度
     * @param  {Geometry} geometry [Geometry]
     * @return {Number}          [地理长度]
     * @export
     */
    computeGeodesicLength:function(geometry) {
        return geometry.computeGeodesicLength(this.getProjection());
    },

    /**
     * 计算Geometry的地理面积
     * @param  {Geometry} geometry [Geometry]
     * @return {Number}          [地理面积]
     * @export
     */
    computeGeodesicArea:function(geometry) {
        return geometry.computeGeodesicArea(this.getProjection());
    },

    /**
     * 计算Geometry的外缓冲，该功能需要引擎服务器版的支持
     * 
     * @export
     * @param {Geometry} [geometry] [做缓冲的geometry]
     * @param {Number} distance 缓冲距离，单位为米
     * @param {function} callback 计算完成后的回调函数，参数为返回的图形对象
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
        if (me.type === me['TYPE_POINT']) {
            result = new Z['Circle'](me.center, distance);
            result.setSymbol(defaultOption);
            callback({
                "success" : true,
                "data" : result
            });
            return;
        } else if (me.type === me['TYPE_CIRCLE']) {
            var radius = me.radius + distance;      
            result = new Z["Circle"](me.center, radius);
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
     * 
     * @export
     * @param {Geometry} [geometry] [被relate的Geometry]
     * @param geometries [seegoo.maps.Geometry] 输入Geometry数组
     * @param relation {Integer} 空间关系，参考seegoo.maps.constant内的常量定义
     * @param callback {function} 回调函数，参数为布尔类型数组，数组长度与geometries参数数组相同，每一位代表相应的判断结果
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
     * @param  {opts} opts 查询参数 {"coordinate": coordinate,"radius": r, "layers": [], "successFn": fn}
     * @export
     */
    identify: function(opts) {
        if (!opts) {
            return;
        }
        var layers = opts['layers'];
        if(!layers||layers.length==0) {
            return;
        }
        var coordinate = opts['coordinate'];
        var radius = opts['radius'];
        var fn = opts['success'];
        var circle = new Z.Circle(coordinate, radius);
        var geometries = [];
        for (var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var layerId = layer.getId();

            if(!layer || !layer.getMap() || layerId.indexOf('mt__internal_layer') >= 0) continue;
            var allGeos = layers[i].getAllGeometries();
            for (var j=0, length = allGeos.length; j<length; j++) {
                geometries.push(allGeos[j]);
            }
        }
        var data = this.intersectWithCircle(circle, geometries);
        return fn.call(this, {'success':true,'data':data});
    },

    /**
     * 找到与圆相交的geo
     * @param {Circle} 圆形
     * @param {Array} geo数组
     * @return {Array} 与圆相交的geo数组
     */
    intersectWithCircle: function(circle, geometries) {
        if (!circle instanceof Z.Circle) {
            return;
        }
        if (!geometries || !geometries["length"]) {
            return;
        }
        var result = [];
        for (var i=0, len=geometries.length; i<len; i++) {
            var geometry = geometries[i];
            if(this._circleAndGeometryIntersection(circle, geometry)) {
                result.push(geometry);
            }
        }
        return result;
    },

   /**
    * 判断Geo是否与圆相交
    * @param {Circle} 圆形
    * @param {Geometry} 图形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndGeometryIntersection: function(circle, geometry) {
        var geoType = geometry.getType();
        var result;
        switch(geoType) {
            case Z.Geometry.TYPE_POINT :
                result = this._circleAndMarkerIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_POLYGON :
                result = this._circleAndPolygonIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_POLYLINE :
                result = this._circleAndPolylineIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_RECT :
                result = this._circleAndRectIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_CIRCLE :
                result = this._circleAndCircleIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_ELLIPSE :
                result = this._circleAndEllipseIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_SECTOR :
                result = this._circleAndSectorIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_MULTIPOINT :
                result = this._circleAndMultiPointIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_MULTIPOLYGON :
                result = this._circleAndMultiPolygonIntersection(circle, geometry);
                break;
            case Z.Geometry.TYPE_MULTIPOLYLINE :
                result = this._circleAndMultiPolylineIntersection(circle, geometry);
                break;
            default:
                result = this._visualExtentIntersection(circle, geometry);
                break;

        }
        return result;
    },

   /**
    * 判断marker是否与圆相交
    * @param {Circle} 圆形
    * @param {Marker} 点
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndMarkerIntersection: function(circle, marker) {
        if(this._visualExtentIntersection(circle, marker)){
            //return this._pointInCircle(circle, marker.getCenter());
            //只要可视范围相交即相交
            return true;
        }
        return false;
    },

   /**
    * 点是否在圆中
    * @param {Circle} circle 圆形
    * @param {Coordinate} point 点
    * @return {Boolean} true，相交；false，不相交
    */
    _pointInCircle: function(circle, point) {
        var radius = circle.getRadius();
        var distance = this.computeDistance(circle.getCenter(), point);
        return (radius>=distance);
    },

   /**
    * 判断Polygon是否与圆相交
    * @param {Circle} 圆形
    * @param {Polygon} 多边形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndPolygonIntersection: function(circle, polygon) {
        if(this._visualExtentIntersection(circle, polygon)){
            var center = circle.getCenter();
            if(Z.GeoUtils.isPointInPolygon(center, polygon)) return true;
            var rings = polygon.getRing();
            if(this._circleAndRingsIntersection(circle, rings)) return true;
            return false;
        }
        return false;
    },

   /**
    * 判断Polyline是否与圆相交
    * @param {Circle} circle 圆形
    * @param {Polyline} polyline 多折线
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndPolylineIntersection: function(circle, polyline) {
        if(this._visualExtentIntersection(circle, polyline)){
            var paths = polyline.getPath();
            if(this._circleAndRingsIntersection(circle, paths)) return true;
            return false;
        }
        return false;
    },

   /**
    * 判断Rectangle是否与圆相交
    * @param {Circle} circle 圆形
    * @param {Rectangle} rectangle  矩形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndRectIntersection: function(circle, rect) {
        if(this._visualExtentIntersection(circle, rect)){
            var center = circle.getCenter();
            var projection = this.getProjection();
            if (!rect ||!projection) return false;
            var extent = rect.computeExtent(projection);
            if(Z.GeoUtils.isPointInRect(center, extent)) return true;
            if(this._circleAndRingsIntersection(circle, rect.getPoints())) return true;
            return false;
        }
        return false;
    },

   /**
    * 判断Circle是否与圆相交
    * @param {Circle} circle 圆形
    * @param {Circle} circle 圆形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndCircleIntersection: function(circle, aCircle) {
        if(this._isPointInCircle(circle.getCenter(), aCircle)) return true;
        if(this._visualExtentIntersection(circle, aCircle)){
            var radius = circle.getRadius();
            var aRadius = aCircle.getRadius();
            var distance = this.computeDistance(circle.getCenter(), aCircle.getCenter());
            return ((radius+aRadius)>=distance);
        }
        return false;
    },

   /**
    * 判断Ellipse是否与圆相交
    * @param {Circle} circle 圆形
    * @param {Ellipse} ellipse 椭圆形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndEllipseIntersection: function(circle, ellipse) {
        if(this._visualExtentIntersection(circle, ellipse)){
            var circleCenter = circle.getCenter();
            if(this._isPointInEllipse(circle, ellipse)) return true;
            if(this._isCirclePointInEllipse(circle, ellipse)) return true;
            return false;
        }
        return false;
    },

   /**
    * 判断Sector是否与圆相交
    * @param {Sector} sector 扇形
    * @param {Circle} circle 圆形
    * @return {Boolean} true，相交；false，不相交
    * 思路： 1、判断圆形与扇形的外接矩形是否相交；
    *       2、判断圆形是否与扇形的两条边相交，如果是，直接return；
    *       3、将扇形的两个端点以及扇形中间端点向外延长圆形的直径得到新的坐标；
    *           3.1、求新的坐标的最大最小x，y，判断圆心是否在这个范围内；
    *           3.2、判断圆的圆心到扇形顶点距离是否小于等于圆半径与扇形半径的和
    */
    _circleAndSectorIntersection: function(circle, sector) {
        if(this._visualExtentIntersection(circle, sector)){
            var center = circle.getCenter();
            var radius = circle.getRadius();
            var endpoints = this._getSectorEndpoint(sector, 0);
            var sectorCenter = sector.getCenter();
            var rings = [sectorCenter, endpoints["startPoint"], sectorCenter, endpoints["endPoint"]];
            if(this._circleAndRingsIntersection(circle, rings)) return true;
            var newEndpoints = this._getSectorEndpoint(sector, radius*2);
            var newStartPoint = newEndpoints["startPoint"];
            var newMiddlePoint = newEndpoints["middlePoint"];
            var newEndPoint = newEndpoints["endPoint"];
            //圆形的坐标范围在延长后的扇形弧线范围
            if(this._betweenTwoPoint(newStartPoint, newMiddlePoint, center)
                || this._betweenTwoPoint(newMiddlePoint, newEndPoint, center)){
                //圆心到扇形顶点距离小于半径
                return this._circleAndMarkerIntersection(circle, sectorCenter);
            }
            return false;
        }
        return false;
    },

    /**
    * 判断MultiPoint是否与圆相交
    * @param {Circle} 圆形
    * @param {MultiPoint} 多点
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndMultiPointIntersection: function(circle, multiPoint) {
        var result = false;
        if(this._visualExtentIntersection(circle, multiPoint)){
            var markers = multiPoint.getGeometries();
            if(markers) {
                for(var i=0,len=markers.length;i<len;i++) {
                    var marker = markers[i];
                    if(this.__circleAndMarkerIntersection(circle, marker)) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    },

    /**
    * 判断MultiPolygon是否与圆相交
    * @param {Circle} 圆形
    * @param {MultiPolygon} 多边形
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndMultiPolygonIntersection: function(circle, multiPolygon) {
        var result = false;
        if(this._visualExtentIntersection(circle, multiPolygon)){
            var polygons = multiPolygon.getGeometries();
            if(polygons) {
                for(var i=0,len=polygons.length;i<len;i++) {
                    var polygon = polygons[i];
                    if(this._circleAndPolygonIntersection(circle, polygon)) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    },

    /**
    * 判断MultiPolyline是否与圆相交
    * @param {Circle} circle 圆形
    * @param {MultiPolyline} 多折线
    * @return {Boolean} true，相交；false，不相交
    */
    _circleAndMultiPolylineIntersection: function(circle, multiPolyline) {
        var result = false;
        if(this._visualExtentIntersection(circle, multiPolyline)){
            var polylines = multiPolyline.getGeometries();
            if(polylines) {
                for(var i=0,len=polylines.length;i<len;i++) {
                    var polyline = polylines[i];
                    if(this._circleAndPolylineIntersection(circle, polyline)) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    },

    /**
     * 判断两个图形的可是外接矩形是否相交
     * @param {Circle} 圆形
     * @param {Geometry} 图形
     * @return {Boolean} true，相交；false，不相交
     */
     _visualExtentIntersection: function(circle, geometry) {
         var projection = this.getProjection();
         if (!projection) {
             return null;
         }
         if(!geometry){
             return false;
         }
         //TODO 这个circle是临时构造的，没有添加到任何图层上，但是computeVisualExtent需要map对象，而geometry也没有了
         //TODO setMap方法，所以目前只能使用computeExtent来该临时圆的外接矩形
         var cExtent = circle.computeExtent(projection);
         var geoExtent = geometry.computeVisualExtent(projection);
         return Z.Extent.isIntersect(cExtent, geoExtent);
     },

    /**
     * 圆与rings组成的线段是否相交
     * @param {Circle} circle
     * @param {Array} coordinate array
     * @return {Boolean} true：相交；false：不相交
     */
    _circleAndRingsIntersection: function(circle, rings) {
        var result = false;
        var points = this._filterRingsInCircleScope(circle, rings);
        for(var i=0,len=points.length;i<len;i++) {
            var startPoint = points[i];
            var endPoint = points[i+1];
            if(this._oneOfEndpointInCircle(startPoint, endPoint, circle)) {
                result = true;
                break;
            }
            if(this._circleAndTwoPointLineIntersection(startPoint, endPoint, circle)) {
                result = true;
                break;
            }
        }
        return result;
    },
    
   /**
    * 希望筛选出靠近圆形外接矩形坐标范围内的坐标点
    * @param {Circle} 圆形
    * @param {Array} coordinate array
    * @return {Array} 符合条件的坐标数组
    * 可行思路，以下四种情况可以排除：
    * 1、两个端点的ymin轴大于圆形的ymax坐标范围
    * 2、两个端点的ymax轴小于圆形的ymin坐标范围
    * 3、两个端点的xmin轴大于圆形的xmax坐标范围
    * 4、两个端点的xmax轴小于圆形的xmin坐标范围
    */
    _filterRingsInCircleScope: function(circle, rings) {
         var result = [];
         var projection = this.getProjection();
         if (!projection) {
              return null;
         }
         var circleExtent = circle.computeExtent(projection);
         for(var i=0,len=rings.length;i<len;i++) {
            if(i<len-1) {
                var startPoint = rings[i];
                var endPoint = rings[i+1];
                var xmax = Math.max(startPoint.x, endPoint.x);
                var xmin = Math.min(startPoint.x, endPoint.x);
                var ymax = Math.max(startPoint.y, endPoint.y);
                var ymin = Math.min(startPoint.y, endPoint.y);
                if(!(xmin>circleExtent.xmax
                    || xmax<circleExtent.xmin
                    || ymin>circleExtent.ymax
                    || ymax<circleExtent.ymin)) {
                    result.push(startPoint);
                    result.push(endPoint);
                }
            }
         }
         return result;
    },

   /**
    * 判断线段的端点是否在圆内
    * @param {Coordinate} startPoint 起点
    * @param {Coordinate} endPoint 终点
    * @param {Circle} 圆形
    * @return {Boolean} true，某个端点在园上或内
    * 算法描述：
    * 1.先判线段上两点是否至少有一点在圆内，如有，则线段穿越圆；
    */
    _oneOfEndpointInCircle: function(startPoint, endPoint, circle) {
        return (this._pointInCircle(circle, startPoint)
                   ||this._pointInCircle(circle, endPoint));
    },

   /**
    * 判断圆与两个端点连线是否相交
    * @param {Coordinate} startPoint
    * @param {Coordinate} endPoint
    * @param {Circle} circle
    * @return {Boolean} true：相交；false：不相交
    * 算法描述：
    * 2.从圆心向该线段所在的直线作垂线，判线段的两个端点是否分布在垂足的两侧，
    * 如在两侧，并且垂线距离小于或等于半径，则线段穿越圆；否则，线段在圆外。
    */
    _circleAndTwoPointLineIntersection: function(startPoint, endPoint, circle) {
        var center = circle.getCenter();
        var point = this._pointOnVerticalLine(startPoint, endPoint, center);
        //垂线交点在线段两个端点之间
        if(this._betweenTwoPoint(startPoint, endPoint, point)){
            //圆心到线段垂直线的交点距离小于半径
            var thisMarker = new Z.Marker(point);
            return this._circleAndMarkerIntersection(circle, thisMarker);
        }
        return false;
    },

   /**
    * 计算点到线段垂线与线段的交点坐标
    * @param {Coordinate} startCoordinate 线段端点
    * @param {Coordinate} endPointCoordinate 线段端点
    * @param {Coordinate} pointCoordinate 点
    * @return {Coordinate} 线段垂线经过的点
    */
    _pointOnVerticalLine: function(startCoordinate, endPointCoordinate, pointCoordinate) {
        var projection = this.getProjection();
        if (!startCoordinate || !endPointCoordinate || !pointCoordinate ||!projection) return null;
        var startPoint = projection.project(startCoordinate);
        var endPoint = projection.project(endPointCoordinate);
        var point = projection.project(pointCoordinate);
        var A = (startPoint.y-endPoint.y)/(startPoint.x- endPoint.x);
        var B = (startPoint.y-A*startPoint.x);
        var m = point.x + A*point.y;
        var x = (m-A*B)/(A*A + 1);
        var y = A*x+B;
        var coordinate = new Z.Coordinate(x, y);
        return projection.unproject(coordinate);
    },

   /**
    * 计算某点是否在两点之间
    * @param {Coordinate} startPoint 点1
    * @param {Coordinate} endPoint 点2
    * @param {Coordinate} point 参照点
    * @return {Boolean} true：在之间；false，不在两点之间
    */
    _betweenTwoPoint: function(startPoint, endPoint, point) {
        if(!point) return false;
        var xmax = Math.max(startPoint.x, endPoint.x);
        var xmin = Math.min(startPoint.x, endPoint.x);
        var ymax = Math.max(startPoint.y, endPoint.y);
        var ymin = Math.min(startPoint.y, endPoint.y);
        if(point.x<=xmax && point.y<=ymax && point.x>=xmin && point.y>=ymin) {
            return true;
        } else {
            return false;
        }
    },

   /**
    * 获取扇形圆弧的两个端点
    * @param {Sector} sector
    * @param {Number} extend 延长值
    * @return {Array} 端点坐标
    */
    _getSectorEndpoint: function(sector, extend) {
        var endpoints = {};
        var center = sector.getCenter();
        var radius = sector.getRadius();
        var startAngle = sector.getStartAngle();
        var endAngle = sector.getEndAngle();
        var startPoint = this._computeSectorEndpoint(startAngle, radius, center, extend);
        var middlePoint = this._computeSectorEndpoint(endAngle/2, radius, center, extend);
        var endPoint = this._computeSectorEndpoint(endAngle, radius, center, extend);
        endpoints["startPoint"] = startPoint;
        endpoints["middlePoint"] = middlePoint;
        endpoints["endPoint"] = endPoint;
        return endpoints;
    },

   /**
    * 计算扇形圆弧的两个端点
    * @param {Number} angle 夹角
    * @param {Number} radius 半径
    * @param {Coordinate} vertex 顶点坐标
    * @param {Number} extend 延长距离
    * @return {Coordinate} 端点坐标
    */
    _computeSectorEndpoint: function(angle, radius, vertex, extend) {
        var y = radius*Math.sin(angle) + extend;
        var x = radius*Math.cos(angle) + extend;
        var projection = this.getProjection();
        return projection.locate(vertex, x, y);
   },

   /**
  * 判断点是否在圆内
  * @param {Coordinate} point
  * @param {Circle} 圆
  * @return {Boolean} true：点在园内；false：点不在园内
  */
  _isPointInCircle: function(point, circle) {
       var projection = this.getProjection();
       var distance = projection.getGeodesicLength(point,circle.getCenter())
       return distance<=circle.getRadius();
  },

  /**
   * 判断点是否在椭圆上
   * @param {Coordinate} point
   * @param {Ellipse} 椭圆
   * @return {Boolean} true：点在椭圆上；false：点不在椭圆上
   */
   _isPointInEllipse: function(point, ellipse) {
        var defaultDistance = this._computePointToFocusDistanceOnEllipse(ellipse);
        var focusPoints = this._computeEllipseFocusPoints(ellipse);
        var leftFocus = focusPoints["leftFocus"];
        var rightFocus = focusPoints["rightFocus"];
        var projection = this.getProjection();
        var distance = projection.getGeodesicLength(point,leftFocus) +
                       projection.getGeodesicLength(point, rightFocus);
        return distance<=defaultDistance;
   },

   /**
    * 判断圆上的点是否与椭圆相交
    * @param {Circle} 圆形
    * @param {Ellipse} 椭圆形
    * @return {Boolean} true：相交
    * 思路：
    * (circleX*circleX)/(a+circleRadius)*(a+circleRadius) +
    * (circleY*circleY)/(b+circleRadius)*(b+circleRadius) < 1
    */
   _isCirclePointInEllipse: function(circle, ellipse) {
       var circleCenter = circle.getCenter();
       var circleX = circleCenter.x;
       var circleY = circleCenter.y;
       var radius = circle.getRadius();
       //椭圆上任意一点到椭圆两个焦点的距离的一半
       var a = this._computePointToFocusDistanceOnEllipse(ellipse);
       var focusPoints = this._computeEllipseFocusPoints(ellipse);
       var leftFocus = focusPoints["leftFocus"];
       var rightFocus = focusPoints["rightFocus"];
       var projection = this.getProjection();
       var c = projection.getGeodesicLength(leftFocus, rightFocus)/2;
       var b = Math.sqrt(a*a-c*c);
       var result = (circleX*circleX)/(a+circleRadius)*(a+circleRadius) +
                    (circleY*circleY)/(b+circleRadius)*(b+circleRadius);
       return result < 1;
   },

   /**
    * 计算椭圆上任意一点到椭圆两焦点的距离
    * @param {Ellipse} 椭圆
    * @return {Number} 距离
    */
    _computePointToFocusDistanceOnEllipse: function(ellipse) {
        var center = ellipse.getCenter();
        var width = ellipse.getWidth();
        var height = ellipse.getHeight();
        var radius = width/2;
        var projection = this.getProjection();
        var pointOnEllipse = projection.locate(center, -radius, 0);
        if(width<height) {
            radius = height/2;
            pointOnEllipse = projection.locate(center, 0, radius);
        }
        var focusPoints = this._computeEllipseFocusPoints(ellipse);
        var leftFocus = focusPoints["leftFocus"];
        var rightFocus = focusPoints["rightFocus"];
        var distance = projection.getGeodesicLength(pointOnEllipse,leftFocus) +
                       projection.getGeodesicLength(pointOnEllipse, rightFocus);
        return distance;
   },

   /**
    * 获取椭圆形的左右焦点
    * @param {Ellipse} 椭圆
    * @return {Coordinate} 焦点数组
    */
    _computeEllipseFocusPoints: function(ellipse) {
        var center = ellipse.getCenter();
        var width = ellipse.getWidth();
        var height = ellipse.getHeight();
        var longAxis = width/2;
        var shortAxis = height/2;
        var projection = this.getProjection();
        var focusDistance = Math.sqrt(longAxis*longAxis-shortAxis*shortAxis);
        var leftFocus = projection.locate(center, -focusDistance, 0);
        var rightFocus = projection.locate(center, focusDistance, 0);
        if(width<height) {
            longAxis = height/2;
            shortAxis = width/2;
            focusDistance = Math.sqrt(longAxis*longAxis-shortAxis*shortAxis);
            leftFocus = projection.locate(center, 0, focusDistance);
            rightFocus = projection.locate(center, 0, -focusDistance);
        }
        var focusPoints = {};
        focusPoints["leftFocus"] = leftFocus;
        focusPoints["rightFocus"] = rightFocus;
        return focusPoints;
    }
};