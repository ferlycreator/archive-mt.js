describe('CircleSpec', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;

    beforeEach(function() {
        var setups = CommonSpec.mapSetup(center);
        container = setups.container;
        map = setups.map;
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    describe('svg events', function() {
        it('fires geometry events and listened', function() {
            var vector = new Z.Circle(center, 1);
            CommonSpec.testSVGEvents(vector, map);
        });
    });

    describe('canvas events', function() {
        it('fires geometry events and listened', function() {
            var vector = new Z.Circle(center, 1);
            CommonSpec.testCanvasEvents(vector, map, vector.getCenter());
        });
    });

});
