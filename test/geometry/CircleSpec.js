var CommonSpec = require('./CommonSpec');

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

    describe('geometry fires events', function() {
        it('svg events', function() {
            var vector = new Z.Circle(center, 1);
            CommonSpec.testSVGEvents(vector, map);
        });

        it('canvas events', function() {
            var vector = new Z.Circle(center, 1);
            CommonSpec.testCanvasEvents(vector, map, vector.getCenter());
        });
    });



    describe('geometry open methods', function() {
        context('common tests',function() {
            CommonSpec.testGeometryMethods.call(this,new Z.Circle(center, 1));
        });

    });

});
