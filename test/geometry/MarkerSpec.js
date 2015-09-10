describe('Marker', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);

    beforeEach(function() {
        var setups = commonSetupMap(center);
        container = setups.container;
        map = setups.map;
    });

    afterEach(function() {
        document.body.removeChild(container);
    });

    describe("symbol", function() {

        var layer;

        beforeEach(function() {
            layer = new Z.VectorLayer('id');
            map.addLayer(layer);
        });

        afterEach(function() {
            map.removeLayer(layer);
        });

        it("can be icon", function() {
            var marker = new Z.Marker(center, {
                symbol: {
                    markerFile: '/images/marker.png',
                    markerWidth: 30,
                    markerHeight: 22
                }
            });

            expect(function () {
                layer.addGeometry(marker);
            }).to.not.throwException();
        });

        it("can be text", function() {
            var marker = new Z.Marker(center, {
                symbol: {
                    textName: 'texxxxxt',
                    font: 'monospace'
                }
            });

            expect(function () {
                layer.addGeometry(marker);
            }).to.not.throwException();
        });


        it("can be vector", function() {
            var types = ['circle', 'triangle', 'cross', 'diamond', 'square', 'x', 'bar'];

            expect(function () {
                for(var i = 0; i < types.length; i++) {
                    var marker = new Z.Marker(center, {
                        symbol: {
                            markerType: types[i],
                            markerLineDasharray: [20, 10, 5, 5, 5, 10]
                        }
                    });
                    layer.addGeometry(marker);
                }
            }).to.not.throwException();
        });

        it("can be shield", function() {
            var types = ['label', 'tip'];

            expect(function () {
                for(var i = 0; i < types.length; i++) {
                    var marker = new Z.Marker(center, {
                        symbol: {
                            shieldType: types[i],
                            shieldName: types[i] + 'Shield'
                        }
                    });
                    layer.addGeometry(marker);
                }
            }).to.not.throwException();
        });

    });

    describe('#setSymbol', function() {

        it('fires symbolchanged event', function() {
            var spy = sinon.spy();
            var marker = new Z.Marker(center);
            marker.on('symbolchanged', spy);
            marker.setSymbol({
                'markerType' : 'circle',
                'markerLineColor': '#ff0000',
                'markerFill': '#ffffff',
                'markerFillOpacity': 0.6,
                'markerHeight' : 8,
                'markerWidth' : 8
            });

            expect(spy.called).to.be.ok();
        });

    });

    describe('events', function() {
        it('svg events', function() {
            var vector = new Z.Marker(center);
            GeoEventsTester.testSVGEvents(vector, map);
        });

        it('canvas events', function() {
            var vector = new Z.Marker(center);
            GeoEventsTester.testCanvasEvents(vector, map, vector.getCenter());
        });
    });

});
