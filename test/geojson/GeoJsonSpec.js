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
      expect(point.getCenter()).to.eql(new Z.Coordinate(geoJsons[0]['coordinates']));
      expect(point.toGeoJson()['geometry']).to.eql(geoJsons[0]);
    });

    it('evaluate polyline', function() {      
      var polyline = geometries[1];
      expect(polyline).to.an(Z.Polyline);
      expect(polyline.toGeoJson()['geometry']).to.eql(geoJsons[1]);
    });
  });

});
