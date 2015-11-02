describe("Control.Attribution", function() {

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

    it("contains specified content", function() {
        var control = new Z.Control.Attribution({
            content: 'content'
        });
        map.addControl(control);

        expect(control._attributionContainer.innerHTML).to.eql('content');
    });

    it("setContent correctly", function() {
        var control = new Z.Control.Attribution({
            content: 'content'
        });
        map.addControl(control);
        control.setContent('new content');

        expect(control._attributionContainer.innerHTML).to.eql('new content');
    });

});
