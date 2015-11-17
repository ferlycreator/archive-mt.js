/**
 * GeoJSON转化工具类
 * @class maptalks.GeoJSON
 * @author Maptalks Team
 */
Z.GeoJson={

        /**
         * 将geoJson字符串或geoJson对象转化为Geometry对象
         * @param  {String | Object | [Object]} json json对象
         * @return {Geometry | [Geometry]}      转化的Geometry对象或数组
         * @expose
         */
        fromGeoJson:function(geoJson, crs) {
            if (Z.Util.isString(geoJson)) {
                geoJson = Z.Util.parseJson(geoJson);
            }
            if (Z.Util.isArray(geoJson)) {
                var resultGeos = [];
                for (var i=0,len=geoJson.length;i<len;i++) {
                    var geo = this._fromGeoJsonInstance(geoJson[i]);
                    if (crs) {
                        geo.setCRS(crs);
                    }
                    resultGeos.push(geo);
                }
                return resultGeos;
            } else {
                var resultGeo = this._fromGeoJsonInstance(geoJson);
                if (crs) {
                    resultGeo.setCRS(crs);
                }
                return resultGeo;
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
            var crs = geoJsonObj['crs'];

            var type = geoJsonObj['type'];
            if ('Feature' === type) {
                var geoJsonGeo = geoJsonObj['geometry'];
                var geometry = this._fromGeoJsonInstance(geoJsonGeo);
                if (!geometry) {
                    return null;
                }
                geometry.setId(geoJsonObj['id']);
                /*if (geoJsonObj['symbol']) {
                    geometry.setSymbol(geoJsonObj['symbol']);
                }*/
                geometry.setProperties(geoJsonObj['properties']);
                geometry.setCRS(crs);
                return geometry;
            } else if ('FeatureCollection' === type) {
                var features = geoJsonObj['features'];
                if (!features) {
                    return null;
                }
                //返回geometry数组
                var result = this.fromGeoJson(features, crs);
                return result;
            } else if ('Point' === type) {
                return new Z.Marker(geoJsonObj['coordinates'],{'crs':crs});
            } else if ('LineString' === type) {
                return new Z.Polyline(geoJsonObj['coordinates'],{'crs':crs});
            } else if ('Polygon' === type) {
                return new Z.Polygon(geoJsonObj['coordinates'],{'crs':crs});
            } else if ('MultiPoint' === type) {
                return new Z.MultiPoint(geoJsonObj['coordinates'],{'crs':crs});
            } else if ('MultiLineString' === type) {
                return new Z.MultiPolyline(geoJsonObj['coordinates'],{'crs':crs});
            } else if ('MultiPolygon' === type) {
                return new Z.MultiPolygon(geoJsonObj['coordinates'],{'crs':crs});
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
                return new Z.GeometryCollection(mGeos,{'crs':crs});
            } else if ('Circle' === type) {
                return new Z.Circle(geoJsonObj['coordinates'], geoJsonObj['radius'],{'crs':crs});
            } else if ('Ellipse' === type) {
                return new Z.Ellipse(geoJsonObj['coordinates'], geoJsonObj['width'], geoJsonObj['height'],{'crs':crs});
            } else if ('Rectangle' === type) {
                return new Z.Rectangle(geoJsonObj['coordinates'], geoJsonObj['width'], geoJsonObj['height'],{'crs':crs});
            } else if ('Sector' === type) {
                return new Z.Sector(geoJsonObj['coordinates'], geoJsonObj['radius'], geoJsonObj['startAngle'], geoJsonObj['endAngle'],{'crs':crs});
            }
            return null;
        }
};
