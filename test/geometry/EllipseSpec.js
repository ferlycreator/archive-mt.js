var CommonSpec = require('./CommonSpec');
describe('EllipseSpec', function() {

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
            var vector = new Z.Ellipse(center, 1,1);
            CommonSpec.testSVGEvents(vector, map);
        });

        it('canvas events', function() {
            var vector = new Z.Ellipse(center, 1,1);
            CommonSpec.testCanvasEvents(vector, map, vector.getCenter());
        });
    });

     describe('Common geometry tests.', function() {
        CommonSpec.testGeometryMethods.call(this,new Z.Ellipse(center, 1, 1));
    });

    describe('change shape and position',function() {
        it('events',function() {
            var spy = sinon.spy();

            var vector = new Z.Ellipse(center, 1, 1);
            vector.on('shapechanged positionchanged',spy);

            function evaluate() {
                var rnd = Math.random()*0.001;
                var coordinates = new Z.Coordinate(center.x+rnd, center.y+rnd);
                var width = 1000*rnd;
                var height = 500*rnd;

                vector.setCoordinates(coordinates);
                expect(spy.calledOnce).to.be.ok();
                expect(vector.getCoordinates()).to.eql(coordinates);
                spy.reset();
                vector.setWidth(width);
                vector.setHeight(height);
                expect(spy.calledTwice).to.be.ok();
                expect(width).to.be(vector.getWidth());
                expect(height).to.be(vector.getHeight());
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
            var vector = new Z.Ellipse(center,100,50);
            var shell = vector.getShell();
            expect(shell).to.have.length(vector.options['numberOfPoints']);
        });

        it("but doesn't have holes",function() {
            var vector = new Z.Ellipse(center,100,50);
            var holes = vector.getHoles();
            expect(holes).to.not.be.ok();
        });
    });


});
