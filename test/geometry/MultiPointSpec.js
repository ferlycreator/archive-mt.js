describe('MultiPointSpec', function() {

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
            var points = [ [100.0, 0.0], [101.0, 1.0] ];
            var multiPoint = new Z.MultiPoint(points);
            expect(multiPoint.getCoordinates()).to.have.length(points.length);
        });

        it('can be empty.',function() {
            var multiPoint = new Z.MultiPoint();
            expect(multiPoint.getCoordinates()).to.have.length(0);
            expect(multiPoint.isEmpty()).to.be.ok();
        });

    });


});
