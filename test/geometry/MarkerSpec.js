describe('Marker', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;
    var icon1, icon2;

    beforeEach(function() {
        var setups = commonSetupMap(center);
        container = setups.container;
        map = setups.map;
        /*layer = new Z.VectorLayer('id');
        map.addLayer(layer);*/
        /*var icon = new Z.Geometry().defaultIcon;
        icon1 = Z.Util.extend({}, icon, {url: icon.url + '?1'});
        icon2 = Z.Util.extend({}, icon, {url: icon.url + '?2'});*/
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    describe('#setIcon', function() {
        //icon tests
        //
        /*it('does not overwrite given icon', function() {
            var marker = new Z.Marker(center);
            var newIcon = Z.Util.extend({}, icon1);
            marker.setIcon(newIcon);
            layer.addGeometry(marker);

            expect(newIcon).to.eql(icon1);
        });

        it('changes icon to another one', function() {
            var marker = new Z.Marker(center);
            marker.setIcon(icon1);
            layer.addGeometry(marker);

            var beforeIcon = marker.getIcon();
            marker.setIcon(icon2);
            var afterIcon = marker.getIcon();

            expect(beforeIcon).to.equal(icon1);
            expect(beforeIcon).to.not.equal(afterIcon);
            expect(afterIcon).to.equal(icon2);
        });*/

        it('fires symbolchanged event', function() {
            var spy = sinon.spy();
            var marker = new Z.Marker(center);
            marker.bind('symbolchanged', spy);
            marker.setSymbol(icon1);

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
