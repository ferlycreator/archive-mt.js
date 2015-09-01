describe('GeoJson', function() {
    //examples are from geoJson.org
    var geoJsons = [

        { "type": "Point", "coordinates": [100.0, 0.0] },
        {
            "type": "LineString",
            "coordinates": [ [100.0, 0.0], [101.0, 1.0] ]
        },
        //Polygon without Holes
        {
            "type": "Polygon",
            "coordinates": [
                [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
            ]
        },
        //Polygon with Holes
        {
            "type": "Polygon",
            "coordinates": [
                [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ],
                [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2] ]
            ]
        },
        {
            "type": "MultiPoint",
            "coordinates": [ [100.0, 0.0], [101.0, 1.0] ]
        },
        {
            "type": "MultiLineString",
            "coordinates": [
                [ [100.0, 0.0], [101.0, 1.0] ],
                [ [102.0, 2.0], [103.0, 3.0] ]
            ]
        },
        {
            "type": "MultiPolygon",
            "coordinates": [
                [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
                [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                 [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
            ]
        },
        {
            "type": "GeometryCollection",
            "geometries": [
                { "type": "Point",
                  "coordinates": [100.0, 0.0]
                },
                { "type": "LineString",
                  "coordinates": [ [101.0, 0.0], [102.0, 1.0] ]
                }
            ]
        },
        {
            "type":"Circle",
            "coordinates":[100.0,0.0],
            "radius":100
        },
        {
            "type":"Ellipse",
            "coordinates":[100.0,0.0],
            "width":100,
            "height":50
        },
        {
            "type":"Rectangle",
            "coordinates":[100.0,0.0],
            "width":100,
            "height":50
        },
        {
            "type":"Sector",
            "coordinates":[100.0,0.0],
            "radius":1000,
            "startAngle":50,
            "endAngle":120
        }
    ];

    var featureCollectionGeoJson = {
        "type": "FeatureCollection",
        "features": [
            { "type": "Feature",
              "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
              "properties": {"prop0": "value0"}
            },
            { "type": "Feature",
              "geometry": {
                  "type": "LineString",
                  "coordinates": [
                      [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                  ]
              },
              "properties": {
                  "prop0": "value0",
                  "prop1": 0.0
              }
            },
            { "type": "Feature",
              "geometry": {
                  "type": "Polygon",
                  "coordinates": [
                      [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                        [100.0, 1.0], [100.0, 0.0] ]
                  ]
              },
              "properties": {
                  "prop0": "value0",
                  "prop1": {"this": "that"}
              }
            }
        ]
    };

    beforeEach(function() {

    });

    afterEach(function() {

    });

    describe('geojson to coordinate',function(){
        var geoJsonCoords = [
            [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
        ];
        var result = Z.GeoJson.fromGeoJsonCoordinates(geoJsonCoords);
        expect(result).to.have.length(geoJsonCoords.length);
        expect(result[0]).to.eql(new Z.Coordinate(geoJsonCoords[0]));
        var reverse = Z.GeoJson.toGeoJsonCoordinates(result);
        expect(reverse).to.eql(geoJsonCoords);
    });

    describe('parse FeatureCollection',function(){
        var fJsons = featureCollectionGeoJson['features'];
        var features = Z.GeoJson.fromGeoJson(featureCollectionGeoJson);
        it('parse FeatureCollection', function() {
            expect(features).to.have.length(3);
            expect(features[0]).to.an(Z.Marker);
            expect(features[0].toJson()).to.eql(fJsons[0]);
            expect(features[0].getProperties()).to.eql(featureCollectionGeoJson['features'][0]['properties']);
            expect(features[1]).to.an(Z.Polyline);
            expect(features[1].toJson()).to.eql(fJsons[1]);
            expect(features[2]).to.an(Z.Polygon);
            expect(features[2].toJson()).to.eql(fJsons[2]);
        });



    });

    describe('parse GeoJson Objects', function() {
        var geometries = Z.GeoJson.fromGeoJson(geoJsons);
        beforeEach(function() {
        });

        afterEach(function() {
        });

        it('parse GeoJson Objects', function() {
            expect(geometries).to.have.length(geoJsons.length);
        });

        it('evaluate point', function() {
            var point = geometries[0];
            expect(point).to.an(Z.Marker);
            expect(point.getType()).to.eql(geoJsons[0].type);
            expect(point.getCenter()).to.eql(new Z.Coordinate(geoJsons[0]['coordinates']));
            expect(point.toJson()['geometry']).to.eql(geoJsons[0]);
        });

        it('evaluate polyline', function() {
            var polyline = geometries[1];
            expect(polyline).to.an(Z.Polyline);
            expect(polyline.getType()).to.eql(geoJsons[1].type);
            expect(polyline.toJson()['geometry']).to.eql(geoJsons[1]);
        });

        it('evaluate polygon', function() {
            var polygon = geometries[2];
            expect(polygon).to.an(Z.Polygon);
            expect(polygon.getType()).to.eql(geoJsons[2].type);
            expect(polygon.toJson()['geometry']).to.eql(geoJsons[2]);
        });

        it('evaluate polygon with holes', function() {
            var polygon = geometries[3];
            expect(polygon).to.an(Z.Polygon);
            expect(polygon.toJson()['geometry']).to.eql(geoJsons[3]);
            var holes = polygon.getHoles();
            expect(holes).to.have.length(1);
        });

        it('evaluate multipoint', function() {
            var multipoint = geometries[4];
            expect(multipoint).to.an(Z.MultiPoint);
            expect(multipoint.getType()).to.eql(geoJsons[4].type);
            expect(multipoint.toJson()['geometry']).to.eql(geoJsons[4]);
        });

        it('evaluate MultiLineString', function() {
            var multiPolyline = geometries[5];
            expect(multiPolyline).to.an(Z.MultiPolyline);
            expect(multiPolyline.getType()).to.eql(geoJsons[5].type);
            expect(multiPolyline.toJson()['geometry']).to.eql(geoJsons[5]);
        });

        it('evaluate MultiPolygon', function() {
            var multiPolygon = geometries[6];
            expect(multiPolygon).to.an(Z.MultiPolygon);
            expect(multiPolygon.getType()).to.eql(geoJsons[6].type);
            expect(multiPolygon.toJson()['geometry']).to.eql(geoJsons[6]);
        });

        it('evaluate GeometryCollection', function() {
            var geometryCollection = geometries[7];
            expect(geometryCollection).to.an(Z.GeometryCollection);
            expect(geometryCollection.getType()).to.eql(geoJsons[7].type);
            expect(geometryCollection.toJson()['geometry']).to.eql(geoJsons[7]);
        });

        it('evaluate Circle', function() {
            var circle = geometries[8];
            expect(circle).to.an(Z.Circle);
            expect(circle.getType()).to.eql(geoJsons[8].type);
            expect(circle.toJson()['geometry']).to.eql(geoJsons[8]);
        });

        it('evaluate Ellipse', function() {
            var ellipse = geometries[9];
            expect(ellipse).to.an(Z.Ellipse);
            expect(ellipse.getType()).to.eql(geoJsons[9].type);
            expect(ellipse.toJson()['geometry']).to.eql(geoJsons[9]);
        });

        it('evaluate Rectangle', function() {
            var rect = geometries[10];
            expect(rect).to.an(Z.Rectangle);
            expect(rect.getType()).to.eql(geoJsons[10].type);
            expect(rect.toJson()['geometry']).to.eql(geoJsons[10]);
        });

        it('evaluate Sector', function() {
            var sector = geometries[11];
            expect(sector).to.an(Z.Sector);
            expect(sector.getType()).to.eql(geoJsons[11].type);
            expect(sector.toJson()['geometry']).to.eql(geoJsons[11]);
        });

    });

});
