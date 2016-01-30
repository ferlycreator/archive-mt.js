


describe('#MapDrag', function () {
    var container,mapPlatform;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);

    function dragMap() {
        var center = map.getCenter();
        var spy = sinon.spy();
        map.on('mousedown', spy);

        var domPosition = Z.DomUtil.getPageCoordinate(container);
        var point = map.coordinateToContainerPoint(center).add(domPosition);
        var requestAnimFn = Z.Util.requestAnimFrame;
        //replace original requestAnimFrame to immediate execution.
            Z.Util.requestAnimFrame=function(fn) {
                fn();
        };
        happen.mousedown(mapPlatform,{
                'clientX':point.x,
                'clientY':point.y
                });
        expect(spy.called).to.be.ok();
        for (var i = 0; i < 10; i++) {
            happen.mousemove(document,{
                'clientX':point.x+i,
                'clientY':point.y+i
                });
        };
        happen.mouseup(document);
        Z.Util.requestAnimFrame = requestAnimFn;
    }

    beforeEach(function() {
        var setups = commonSetupMap(center);
        container = setups.container;
        map = setups.map;
        mapPlatform = map._panels.mapPlatform;
    });

    afterEach(function() {
        document.body.removeChild(container);
    });
    describe('drag the map', function() {
        it('can be dragged', function() {
            map.setZoom(7);
            dragMap();
            expect(map.getCenter()).not.to.be.eql(center);
        });
    });

    describe('drag can be disable', function() {
        it('disables dragging', function() {
            map.config('draggable',false);
            dragMap();
            expect(map.getCenter()).to.be.nearCoord(center);
        });
    });

});
