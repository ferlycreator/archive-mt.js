describe('GeometrySpec', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;

    beforeEach(function() {
        var setups = CommonSpec.mapSetup(center);
        container = setups.container;
        map = setups.map;
        layer = new Z.VectorLayer('canvas', {render: 'canvas'});
        map.addLayer(layer);
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    it("Marker._containsPoint", function() {
        var geometry = new Z.Marker(center, {
            symbol: {
                markerFile : Z.host + '/engine/images/marker.png',
                markerHeight : 30,
                markerWidth : 22,
                dx : 0,
                dy : 0
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);
        //TODO 因为marker的width和height为0, 所以无法击中
        happen.click(map._containerDOM, {
            clientX: 400 + 8,
            clientY: 300 + 8
        });

        expect(spy.called).to.be.ok();
    });

    it("Circle._containsPoint", function() {
        var geometry = new Z.Circle(center, 10, {
            symbol: {
                lineWidth: 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(map._containerDOM, {
            clientX: 400 + 8 + 10 + 4,
            clientY: 300 + 8
        });
        expect(spy.called).to.not.be.ok();

        happen.click(map._containerDOM, {
            clientX: 400 + 8 + 10 + 3,
            clientY: 300 + 8
        });
        expect(spy.called).to.be.ok();
    });

    it("Ellipse._containsPoint", function() {
        var geometry = new Z.Ellipse(center, 20, 10, {
            symbol: {
                lineWidth: 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(map._containerDOM, {
            clientX: 400 + 8 + 10 + 4,
            clientY: 300 + 8
        });
        expect(spy.called).to.not.be.ok();

        happen.click(map._containerDOM, {
            clientX: 400 + 8 + 10 + 3,
            clientY: 300 + 8
        });
        expect(spy.called).to.be.ok();
    });

    it("Sector._containsPoint", function() {
        var geometry = new Z.Sector(center, 10, 90, 405, {
            symbol: {
                lineWidth: 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(map._containerDOM, {
            clientX: 400 + 8 + (10 - 3),
            clientY: 300 + 8 - (10 - 2)
        });
        expect(spy.called).to.not.be.ok();

        happen.click(map._containerDOM, {
            clientX: 400 + 8,
            clientY: 300 + 8 - 10
        });
        expect(spy.called).to.be.ok();
    });

    it("Rectangle._containsPoint", function() {
        var geometry = new Z.Rectangle(center, 20, 10, {
            symbol: {
                lineWidth: 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(map._containerDOM, {
            clientX: 400 + 8,
            clientY: 300 + 8 - 4
        });
        expect(spy.called).to.not.be.ok();

        happen.click(map._containerDOM, {
            clientX: 400 + 8,
            clientY: 300 + 8 - 3
        });
        expect(spy.called).to.be.ok();
    });

    it("Polyline._containsPoint", function() {
        var geometry = new Z.Polyline([
            new Z.Coordinate([center.x, center.y + 0.001]),
            new Z.Coordinate([center.x, center.y]),
            new Z.Coordinate([center.x + 0.002, center.y])
        ], {
            symbol: {
                lineWidth: 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(map._containerDOM, {
            clientX: 400 + 8 + 4,
            clientY: 300 + 8 - 4
        });
        expect(spy.called).to.not.be.ok();

        happen.click(map._containerDOM, {
            clientX: 400 + 8 + 3,
            clientY: 300 + 8 - 3
        });
        expect(spy.called).to.be.ok();
    });

    it("Polygon._containsPoint", function() {
        var geometry = new Z.Polygon([[
            new Z.Coordinate([center.x, center.y + 0.001]),
            new Z.Coordinate([center.x, center.y]),
            new Z.Coordinate([center.x + 0.002, center.y])
        ]], {
            symbol: {
                lineWidth: 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(map._containerDOM, {
            clientX: 400 + 8 - 4,
            clientY: 300 + 8
        });
        expect(spy.called).to.not.be.ok();

        happen.click(map._containerDOM, {
            clientX: 400 + 8 - 3,
            clientY: 300 + 8
        });
        expect(spy.called).to.be.ok();
    });

});
