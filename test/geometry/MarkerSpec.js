describe('Marker', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;
    var icon1, icon2;

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
        var icon = new Z.Geometry().defaultIcon;
        icon1 = Z.Util.extend({}, icon, {url: icon.url + '?1'});
        icon2 = Z.Util.extend({}, icon, {url: icon.url + '?2'});
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    describe('#setIcon', function() {
        it('does not overwrite given icon', function() {
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
        });

        it('fires symbolchanged event', function() {
            var spy = sinon.spy();
            var marker = new Z.Marker(center);
            marker.bind('symbolchanged', spy);
            marker.setIcon(icon1);

            expect(spy.called).to.be.ok();
        });
    });

    describe('events', function() {
        it('fires click event when clicked', function() {
            var spy = sinon.spy();
            var marker = new Z.Marker(center);
            marker.bind('click', spy);
            marker.setIcon(icon1);
            layer.addGeometry(marker);
            var painter = marker.getPainter();
            happen.click(painter.markerDom);

            expect(spy.called).to.be.ok();
        });
    });

});
