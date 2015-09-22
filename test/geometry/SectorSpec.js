describe('SectorSpec', function() {

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
            zoomLevel: 17,
            center: center
        };
        map = new Z.Map(container, option);
        tile = new Z.TileLayer('tile', {
            tileInfo: 'web-mercator',
            urlTemplate: 'http://emap{s}.mapabc.com/mapabc/maptile?&x={x}&y={y}&z={z}',
            subdomains: [0, 1, 2, 3]
        });
        map.setBaseTileLayer(tile);
        layer = new Z.VectorLayer('id');
        map.addLayer(layer);
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    describe('geometry fires events', function() {
        it('svg events', function() {
            var vector = new Z.Sector(center, 1, 0, 270);
            GeoEventsTester.testSVGEvents(vector, map);
        });

        it('canvas events', function() {
            var vector = new Z.Sector(center, 1, 0, 270);
            GeoEventsTester.testCanvasEvents(vector, map, vector.getCenter());
        });
    });

    describe('change shape and position',function() {
        it('events',function() {
            var spy = sinon.spy();

            var vector = new Z.Sector(center, 1, 0, 270);
            vector.on('shapechanged positionchanged',spy);

            function evaluate() {
                var rnd = Math.random()*0.001;
                var coordinates = new Z.Coordinate(center.x+rnd, center.y+rnd);

                vector.setCoordinates(coordinates);
                expect(spy.calledOnce).to.be.ok();
                expect(vector.getCoordinates()).to.eql(coordinates);
                spy.reset();

                var radius = 1000*rnd;
                vector.setRadius(radius);
                expect(spy.calledOnce).to.be.ok();
                expect(radius).to.be(vector.getRadius());
                spy.reset();

                var sangle = 20;
                vector.setStartAngle(sangle);
                expect(spy.calledOnce).to.be.ok();
                expect(sangle).to.be(vector.getStartAngle());
                spy.reset();

                var eangle = 20;
                vector.setEndAngle(eangle);
                expect(spy.calledOnce).to.be.ok();
                expect(eangle).to.be(vector.getEndAngle());
                spy.reset();
            }

            evaluate();

            //svg
            layer = new Z.VectorLayer('svg');
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
            var vector = new Z.Sector(center, 1, 0, 270);
            var shell = vector.getShell();
            expect(shell).to.have.length(vector.options['numberOfPoints']);
        });

        it("but doesn't have holes",function() {
            var vector = new Z.Sector(center, 1, 0, 270);
            var holes = vector.getHoles();
            expect(holes).to.not.be.ok();
        });
    });

    describe('compute length and area',function() {
        it('length',function() {
            var vector = new Z.Sector(center, 1, 0, 270);
            var length = vector.getLength();
            expect(length).to.be.above(0);
        });

        it('area',function() {
            var vector = new Z.Sector(center, 1, 0, 270);
            var area = vector.getArea();
            expect(area).to.be.above(0);
        });
    });

    it('can have various symbols',function() {
        var vector = new Z.Sector(center, 1, 0, 270);
        GeoSymbolTester.testGeoSymbols(vector, map);
    });
});
