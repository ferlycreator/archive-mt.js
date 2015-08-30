describe('CanvasLayer', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);

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
    });

    afterEach(function() {
        document.body.removeChild(container);
    });

    describe('addGeometry', function() {

        var layer = new Z.VectorLayer('id', {render: 'canvas'});

        beforeEach(function() {
            map.setBaseTileLayer(tile);
            map.addLayer(layer);
        });

        afterEach(function() {
            map.removeLayer(layer);
        });

        it('all type of geometry', function() {
            var w = 1, h = 1, r = 1;
            var geometries = [
                new Z.Marker(center),
                new Z.Circle(center, r),
                new Z.Ellipse(center, w, h),
                new Z.Rectangle(center, w, h),
                new Z.Sector(center, r, 90, 180),
                new Z.Polyline([
                    {x: 121.111, y: 30.111},
                    {x: 121.222, y: 30.222}
                ]),
                new Z.Polygon([
                    {x: 121.111, y: 30.111},
                    {x: 121.222, y: 30.222},
                    {x: 121.333, y: 30.333}
                ]),
                new Z.MultiPolyline([
                    [
                        {x: 121.111, y: 30.111},
                        {x: 121.222, y: 30.222}
                    ],
                    [
                        {x: 121.333, y: 30.333},
                        {x: 121.444, y: 30.444}
                    ]
                ]),
                new Z.MultiPolygon([
                    [
                        {x: 121.111, y: 30.111},
                        {x: 121.222, y: 30.222},
                        {x: 121.333, y: 30.333}
                    ],
                    [
                        {x: 121.444, y: 30.444},
                        {x: 121.555, y: 30.555},
                        {x: 121.666, y: 30.666}
                    ]
                ])
            ];

            expect(function() {
                layer.addGeometry(geometries);
            }).to.not.throwException();
        });
    });

});
