describe('PolygonSpec', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;

    beforeEach(function() {
       var setups = commonSetupMap(center);
        container = setups.container;
        map = setups.map;
        layer = new Z.VectorLayer('id');
        map.addLayer(layer);
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    describe('constructor', function() {

        it('normal constructor', function() {
            var points = [
                [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ],
                [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2] ]
            ];
            var polygon = new Z.Polygon(points);
            var coordinates = polygon.getCoordinates();
            expect(coordinates).to.have.length(points.length);
            var geojsonCoordinates = Z.GeoJson.toGeoJsonCoordinates(coordinates);
            expect(geojsonCoordinates).to.eql(points);
        });

        it('can be empty.',function() {
            var polygon = new Z.Polygon();
            expect(polygon.getCoordinates()).to.have.length(0);
        });

    });

    describe('getCenter', function() {
        it('should返回笛卡尔坐标系上的点集合的中心点', function() {
            var polygon = new Z.Polygon([[
                {x: 0, y: 0},
                {x: 0, y: 10},
                {x: 10, y: 10},
                {x: 10, y: 0}
            ]]);
            layer.addGeometry(polygon);

            expect(polygon.getCenter()).to.nearCoord({x:5, y: 5});
        });
    });

    it('getExtent', function() {
        var polygon = new Z.Polygon([[
            {x: 0, y: 0},
            {x: 0, y: 10},
            {x: 10, y: 10},
            {x: 10, y: 0}
        ]]);
        layer.addGeometry(polygon);

        expect(polygon.getExtent()).to.eql(new Z.Extent(0, 0, 10, 10));
    });

});
