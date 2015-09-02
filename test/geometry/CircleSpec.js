// var CommonSpec = require('./CommonSpec');

describe('CircleSpec', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;

    beforeEach(function() {
        var setups = commonSetupMap(center);
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
            GeoEventsTester.testSVGEvents(vector, map);
        });

        it('canvas events', function() {
            var vector = new Z.Circle(center, 1);
            GeoEventsTester.testCanvasEvents(vector, map, vector.getCenter());
        });
    });

    describe('change shape and position',function() {
        it('events',function() {
            var spy = sinon.spy();

            var vector = new Z.Circle(center, 1);
            vector.on('shapechanged positionchanged',spy);

            function evaluate() {
                var rnd = Math.random()*0.001;
                var coordinates = new Z.Coordinate(center.x+rnd, center.y+rnd);
                var radius = 1000*rnd;

                vector.setCoordinates(coordinates);
                expect(spy.calledOnce).to.be.ok();
                expect(vector.getCoordinates()).to.eql(coordinates);
                spy.reset();
                vector.setRadius(radius);
                expect(spy.calledOnce).to.be.ok();
                expect(radius).to.be(vector.getRadius());
                spy.reset();
            }

            evaluate();

            //svg
            layer = new Z.VectorLayer('id');
            map.addLayer(layer);
            layer.addGeometry(vector);
            evaluate();
            vector.remove();
            //canvas
            layer = new Z.VectorLayer('canvas',{render:'canvas'});
            layer.addGeometry(vector);
            map.addLayer(layer);
            evaluate();
        });
    });

    describe('can be treated as a polygon',function() {
        it('has shell',function() {
            var vector = new Z.Circle(center,100);
            var shell = vector.getShell();
            expect(shell).to.have.length(vector.options['numberOfPoints']);
        });

        it("but doesn't have holes",function() {
            var vector = new Z.Circle(center,100);
            var holes = vector.getHoles();
            expect(holes).to.not.be.ok();
        });
    });

    describe('compute length and area',function() {
        it('length',function() {
            var vector = new Z.Circle(center,100);
            var result = Math.PI*2*100;
            var length = vector.getLength();
            expect(length).to.be(result);
        });

        it('area',function() {
            var vector = new Z.Circle(center,100);
            var result = Math.PI*100*100;
            var length = vector.getArea();
            expect(length).to.be(result);
        });
    });

});
