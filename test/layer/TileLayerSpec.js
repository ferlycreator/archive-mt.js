describe('#TileLayer', function() {

    var container;
    var map;
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
    });

    afterEach(function () {
        document.body.removeChild(container);
    });

    describe("#WebMercator", function() {
        it("", function() {
            var tile = new Z.TileLayer('tile', {
                tileInfo: 'web-mercator',
                urlTemplate: 'http://emap{s}.mapabc.com/mapabc/maptile?&x={x}&y={y}&z={z}',
                subdomains: [0, 1, 2, 3]
            });
            map.setBaseTileLayer(tile);
        });
    });

    describe("#GlobalMercator", function() {
    });

});
