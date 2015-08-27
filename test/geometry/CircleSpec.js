describe('CircleSpec', function() {

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
        layer = new Z.SVGLayer('id');
        map.addLayer(layer);
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    describe('events', function() {
        it('fires click event when clicked', function() {
            var spy = sinon.spy();
            var vector = new Z.Circle(center, 1);
            vector.on('click', spy);
            layer.addGeometry(vector);
            var painter = vector.getPainter();
            var paper = painter.getVectorPaper();
            paper.forEach(function(el) {
                happen.click(el);
            });

            expect(spy.called).to.be.ok();
        });
    });

});
