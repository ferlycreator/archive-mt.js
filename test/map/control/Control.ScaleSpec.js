describe("Control.Scale", function() {

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
            urlTemplate: 'http://emap{s}.mapabc.com/mapabc/maptile?&x={x}&y={y}&z={z}',
            subdomains: [0, 1, 2, 3]
        });
        map.setBaseTileLayer(tile);
    });

    afterEach(function () {
        document.body.removeChild(container);
    });

    it("widgets contain correct value after initialized", function() {
        var control = new Z.Control.Scale({
            metric: true,
            imperial: true
        });
        map.addControl(control);

        expect(control._mScale.innerHTML).to.not.be.empty();
        expect(control._iScale.innerHTML).to.not.be.empty();
    });

});
