describe("Control.Nav", function() {

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
            zoomLevel: 17,
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

    it("events", function() {
        var nav = new Z.Control.Nav();
        var spy = sinon.spy();
        nav._panToLeft = spy;
        nav._panToRight = spy;
        nav._panToDown = spy;
        nav._panToUp = spy;
        map.addControl(nav);

        spy.reset();
        happen.mousedown(nav._panToLeftButton);
        expect(spy.calledOnce).to.be.ok();

        spy.reset();
        happen.mousedown(nav._panToRightButton);
        expect(spy.calledOnce).to.be.ok();

        spy.reset();
        happen.mousedown(nav._panToDownButton);
        expect(spy.calledOnce).to.be.ok();

        spy.reset();
        happen.mousedown(nav._panToUpButton);
        expect(spy.calledOnce).to.be.ok();
    });

    describe("when buttons clicked", function() {

        var clock;

        beforeEach(function() {
            clock = sinon.useFakeTimers();
        });

        afterEach(function() {
            clock.restore();
        });

        it("can pan left correctly", function() {
            var control = new Z.Control.Nav();
            map.addControl(control);
            var pos = map.offsetPlatform();
            var offset;

            happen.mousedown(control._panToLeftButton);

            clock.tick(15);
            offset = map.offsetPlatform();

            expect(offset.left).to.eql(pos.left + 1);
            expect(offset.top).to.eql(pos.top);
        });

        it("can pan right correctly", function() {
            var control = new Z.Control.Nav();
            map.addControl(control);
            var pos = map.offsetPlatform();
            var offset;

            happen.mousedown(control._panToRightButton);

            clock.tick(15);
            offset = map.offsetPlatform();
            expect(offset.left).to.eql(pos.left - 1);
            expect(offset.top).to.eql(pos.top);
        });

        it("can pan down correctly", function() {
            var control = new Z.Control.Nav();
            map.addControl(control);
            var pos = map.offsetPlatform();
            var offset;

            happen.mousedown(control._panToDownButton);

            clock.tick(15);
            offset = map.offsetPlatform();

            expect(offset.left).to.eql(pos.left);
            expect(offset.top).to.eql(pos.top - 1);
        });

        it("can pan up correctly", function() {
            var control = new Z.Control.Nav();
            map.addControl(control);
            var pos = map.offsetPlatform();
            var offset;

            happen.mousedown(control._panToUpButton);

            clock.tick(15);
            offset = map.offsetPlatform();

            expect(offset.left).to.eql(pos.left);
            expect(offset.top).to.eql(pos.top + 1);
        });

    });

});
