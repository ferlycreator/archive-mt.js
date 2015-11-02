describe("Control.Zoom", function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        var option = {
            zoomLevel: 15,
            center: center
        };
        map = new Z.Map(container, option);
        tile = new Z.TileLayer('tile', {
            tileInfo: 'web-mercator',
            urlTemplate: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            subdomains: [1, 2, 3]
        });
        map.setBaseTileLayer(tile);
    });

    afterEach(function () {
        document.body.removeChild(container);
    });

    describe("Zoom button", function() {

        it("when enabled, can trigger correct events", function() {
            var control = new Z.Control.Zoom();
            var spy = sinon.spy();
            control._zoomIn = spy;
            control._zoomOut = spy;
            map.addControl(control);
            control.enable();

            spy.reset();
            happen.click(control._zoomInButton);
            expect(spy.calledOnce).to.be.ok();

            spy.reset();
            happen.click(control._zoomOutButton);
            expect(spy.calledOnce).to.be.ok();
        });

        it("when zoom in button clicked, change zoom correctly", function() {
            var control = new Z.Control.Zoom();
            map.addControl(control);
            var zoom = map.getZoomLevel();

            happen.click(control._zoomInButton);
            expect(map.getZoomLevel()).to.be(zoom + 1);
        });

        it("when zoom out button clicked, change zoom correctly", function() {
            var control = new Z.Control.Zoom();
            map.addControl(control);
            var zoom = map.getZoomLevel();

            happen.click(control._zoomOutButton);
            expect(map.getZoomLevel()).to.be(zoom - 1);
        });

        it("when disabled, don't update zoom of map", function() {
            var control = new Z.Control.Zoom();
            map.addControl(control);
            var zoom = map.getZoomLevel();
            control.disable();

            happen.click(control._zoomInButton);
            expect(map.getZoomLevel()).to.be(zoom);

            happen.click(control._zoomOutButton);
            expect(map.getZoomLevel()).to.be(zoom);
        });

    });

});
