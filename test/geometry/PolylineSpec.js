describe('PolylineSpec', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;

    beforeEach(function() {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        var option = {
            zoom: 17,
            center: center
        };
        map = new Z.Map(container, option);
        tile = new Z.TileLayer('tile', {
            tileInfo: 'web-mercator',
            urlTemplate:"http://t{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}",
            subdomains: [1, 2, 3]
        });
        map.setBaseTileLayer(tile);
        layer = new Z.VectorLayer('id');
        map.addLayer(layer);
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    describe('constructor', function() {

        it('normal constructor', function() {
            var points = [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ];
            var polyline = new Z.Polyline(points);
            var coordinates = polyline.getCoordinates();
            expect(coordinates).to.have.length(points.length);
            var geojsonCoordinates = Z.GeoJSON.toGeoJSONCoordinates(coordinates);
            expect(geojsonCoordinates).to.eql(points);
        });

        it('can be empty.',function() {
            var polyline = new Z.Polyline();
            expect(polyline.getCoordinates()).to.have.length(0);
        });

    });

    describe('getCenter', function() {
        it('should返回笛卡尔坐标系上的点集合的中心点', function() {
            var polyline = new Z.Polyline([
                {x: 0, y: 0},
                {x: 0, y: 10},
                {x: 0, y: 90}
            ]);
            layer.addGeometry(polyline);

            expect(polyline.getCenter()).to.nearCoord(new Z.Coordinate(0, 100/3));
        });
    });

    it('getExtent', function() {
        var polyline = new Z.Polyline([
            {x: 0, y: 0},
            {x: 0, y: 10},
            {x: 0, y: 90}
        ]);
        layer.addGeometry(polyline);

        expect(polyline.getExtent()).to.eql(new Z.Extent(0, 0, 0, 90));
    });

    describe('geometry fires events', function() {
        it('svg events', function() {
            var points = [
                {x: 0, y: 0},
                {x: 0, y: 10},
                {x: 0, y: 90}
            ];
            var vector = new Z.Polyline(points);
            new GeoEventsTester().testSVGEvents(vector, map);
        });

        it('canvas events', function() {
            var points = [
                {x: 0, y: 0},
                {x: 0, y: 10},
                {x: 0, y: 90}
            ];
            var vector = new Z.Polyline(points);
            new GeoEventsTester().testCanvasEvents(vector, map, vector.getCenter());
        });
    });

    it('can have various symbols',function() {
        var points = [
                {x: 0, y: 0},
                {x: 0, y: 10},
                {x: 0, y: 90}
            ];
            var vector = new Z.Polyline(points);
        GeoSymbolTester.testGeoSymbols(vector, map);
    });
});
