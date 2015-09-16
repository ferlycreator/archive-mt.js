/**
 * geoJSON转化工具类
 * @class maptalks.GeoJSON
 * @author Maptalks Team
 */
Z['GeoJSON']=Z.GeoJson={
        /**
         * 将geoJson字符串或geoJson对象转化为Geometry对象
         * @param  {String | Object | [Object]} json json对象
         * @return {Geometry | [Geometry]}      转化的Geometry对象或数组
         * @expose
         */
        fromGeoJson:function(geoJson) {
            if (Z.Util.isString(geoJson)) {
                geoJson = Z.Util.parseJson(geoJson);
            }
            if (Z.Util.isArray(geoJson)) {
                var result = [];
                for (var i=0,len=geoJson.length;i<len;i++) { 
                    var geo = this._fromGeoJsonInstance(geoJson[i]);
                    result.push(geo);
                }
                return result;
            } else {
                return this._fromGeoJsonInstance(geoJson);
            }

        },

        /**
         * 将Coordinate数组转化为GeoJson坐标数组
         * @param  {[Coordinate]} coordinates Coordinate数组
         * @return {number[]..}               GeoJson数组
         * @expose
         */
        toGeoJsonCoordinates:function(coordinates) {
            if (!Z.Util.isArray(coordinates)) {
                return [coordinates.x, coordinates.y];
            }
            return Z.Util.eachInArray(coordinates, this, function(coord) {
                return [coord.x, coord.y];
            });
        },

        /**
         * 将GeoJson坐标数组转化为Coordinate数组
         * @param  {[type]} coordinates [description]
         * @return {[type]}             [description]
         */
        fromGeoJsonCoordinates:function(coordinates) {
            if (Z.Util.isNumber(coordinates[0]) && Z.Util.isNumber(coordinates[1])) {
                return new Z.Coordinate(coordinates);
            }
            var result = [];
            for (var i=0, len=coordinates.length;i<len;i++) {
                var child = coordinates[i];
                if (Z.Util.isArray(child)) {
                    if (Z.Util.isNumber(child[0])) {
                        result.push(new Z.Coordinate(child));
                    } else {
                        result.push(this.fromGeoJsonCoordinates(child));
                    }
                } else {
                    result.push(child);
                }
            }
            return result;
        },

        /**
         * 解析单个GeoJson对象,输出为Geometry
         * @param  {[type]} geoJsonObj [description]
         * @return {[type]}            [description]
         */
        _fromGeoJsonInstance:function(geoJsonObj) {
            if (!geoJsonObj || Z.Util.isNil(geoJsonObj['type'])) {
                return null;
            }
            var type = geoJsonObj['type'];
            if ('Feature' === type) {
                var geoJsonGeo = geoJsonObj['geometry'];
                var properties = geoJsonObj['properties'];
                var geoId = geoJsonObj['id'];
                if (!Z.Util.isNil(geoId)) {
                    geoId = geoId.toString();
                }
                //TODO symbol和coordinateType的处理
                var geometry = this._fromGeoJsonInstance(geoJsonGeo);
                if (!geometry) {
                    return null;
                }
                geometry.setId(geoId);
                geometry.setProperties(properties);
                return geometry;
            } else if ('FeatureCollection' === type) {
                var features = geoJsonObj['features'];
                if (!features) {
                    return null;
                }
                var result = this.fromGeoJson(features);
                return result;
            } else if ('Point' === type) {
                return new Z.Marker(geoJsonObj['coordinates']);
            } else if ('LineString' === type) {
                return new Z.Polyline(geoJsonObj['coordinates']);
            } else if ('Polygon' === type) {
                return new Z.Polygon(geoJsonObj['coordinates']);
            } else if ('MultiPoint' === type) {
                return new Z.MultiPoint(geoJsonObj['coordinates']);
            } else if ('MultiLineString' === type) {
                return new Z.MultiPolyline(geoJsonObj['coordinates']);
            } else if ('MultiPolygon' === type) {
                return new Z.MultiPolygon(geoJsonObj['coordinates']);
            } else if ('GeometryCollection' === type) {
                var geometries = geoJsonObj['geometries'];
                if (!Z.Util.isArrayHasData(geometries)) {
                    return new Z.GeometryCollection();
                }
                var mGeos = [];
                var size = geometries.length;                
                for (var i = 0; i < size; i++) {
                    mGeos.push(this._fromGeoJsonInstance(geometries[i]));
                }
                return new Z.GeometryCollection(mGeos);
            } else if ('Circle' === type) {
                return new Z.Circle(geoJsonObj['coordinates'], geoJsonObj['radius']);
            } else if ('Ellipse' === type) {
                return new Z.Ellipse(geoJsonObj['coordinates'], geoJsonObj['width'], geoJsonObj['height']);
            } else if ('Rectangle' === type) {
                return new Z.Rectangle(geoJsonObj['coordinates'], geoJsonObj['width'], geoJsonObj['height']);
            } else if ('Sector' === type) {
                return new Z.Sector(geoJsonObj['coordinates'], geoJsonObj['radius'], geoJsonObj['startAngle'], geoJsonObj['endAngle']);
            }
            return null;
        }
};
