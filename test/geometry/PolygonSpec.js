describe('PolygonSpec', function() {

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

    describe('getCenter', function() {
        it('should返回笛卡尔坐标系上的点集合的中心点', function() {
            var polygon = new Z.Polygon([
                {x: 0, y: 0},
                {x: 0, y: 10},
                {x: 10, y: 10},
                {x: 10, y: 0}
            ]);
            layer.addGeometry(polygon);

            expect(polygon.getCenter()).to.eql({x:5, y: 5});
        });
    });

    it('getExtent', function() {
        var polygon = new Z.Polygon([
            {x: 0, y: 0},
            {x: 0, y: 10},
            {x: 10, y: 10},
            {x: 10, y: 0}
        ]);
        layer.addGeometry(polygon);

        expect(polygon.getExtent()).to.eql(new Z.Extent(0, 0, 10, 10));
    });

});
