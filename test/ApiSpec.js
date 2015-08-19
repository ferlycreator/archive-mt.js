describe('API', function () {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118, 32);

    beforeEach(function () {
        container = document.createElement('div');
        document.body.appendChild(container);
        var option = {
            center: center
            // zoomLevel: 12
        };
        map = new Z.Map(container, option);
        tile = new Z.TileLayer('tile', {
            crs: 'crs3857',
            urlTemplate: 'http://emap{s}.mapabc.com/mapabc/maptile?&x={X}&y={y}&z={z}',
            subdomains: [0,1,2,3],
        });
        map.setBaseTileLayer(tile);
        map.Load();
    });

    afterEach(function () {
        document.body.removeChild(container);
    });

    describe('Map', function () {

        it('Load', function () {
            expect(function () {
                map.Load();
            }).to.not.throwException();
        });

        it('setMouseTip', function () {
            expect(function () {
                map.setMouseTip();
            }).to.not.throwException();
        });

        it('removeMouseTip', function () {
            expect(function () {
                map.removeMouseTip();
            }).to.not.throwException();
        });

        it('getSize', function () {
            var size = map.getSize();

            expect(size).to.have.property('width');
            expect(size).to.have.property('height');
            expect(size.width).to.be.above(0);
            expect(size.height).to.be.above(0);
        });

        it('getExtent', function () {
            var extent = map.getExtent();

            expect(extent).to.not.be(null);
        });

        it('getCenter', function () {
            var center = map.getCenter();

            expect(center).to.not.be(null);
        });

        it('setCenter', function () {
            expect(function () {
                map.setCenter({x: 0, y: 0});
            }).to.not.throwException();
        });

        it('getZoomLevel', function () {
            var zoom = map.getZoomLevel();

            expect(zoom).to.be.above(0);
        });

        it('setZoomLevel', function () {
            var zoom = map.getZoomLevel();
            zoom = Math.ceil(zoom / 2);
            expect(function () {
                map.setZoomLevel(zoom);
            }).to.not.throwException();
        });

        it('getMaxZoomLevel', function () {
            var zoom = map.getMaxZoomLevel();

            expect(zoom).to.be.above(0);
        });

        it('setMaxZoomLevel', function () {
            var zoom = map.getMaxZoomLevel();
            zoom = Math.ceil(zoom / 2);
            expect(function () {
                map.setMaxZoomLevel(zoom);
            }).to.not.throwException();
        });

        it('getMinZoomLevel', function () {
            var zoom = map.getMinZoomLevel();

            expect(zoom).to.be.above(0);
        });

        it('setMinZoomLevel', function () {
            var zoom = map.getMinZoomLevel();
            zoom = Math.ceil(zoom / 2);
            expect(function () {
                map.setMinZoomLevel(zoom);
            }).to.not.throwException();
        });

        it('zoomIn', function () {
            expect(function () {
                map.zoomIn();
            }).to.not.throwException();
        });

        it('zoomOut', function () {
            expect(function () {
                map.zoomOut();
            }).to.not.throwException();
        });

        it('setCenterAndZoom', function () {
            var zoom = map.getZoomLevel();
            zoom = Math.ceil(zoom / 2);

            expect(function () {
                map.setCenterAndZoom({x: 0, y: 0}, zoom);
            }).to.not.throwException();
        });

        it('getFitZoomLevel', function () {
            var extent = map.getExtent();
            var zoom = map.getZoomLevel();
            var fitZoom = map.getFitZoomLevel(extent);

            expect(fitZoom).to.eql(zoom);
        });

        it('getBaseTileLayer', function () {
            expect(map.getBaseTileLayer()).to.equal(tile);
        });

        it('setBaseTileLayer', function () {
            var tile2 = new Z.TileLayer('tile2', {
                crs: 'crs3857',
                urlTemplate: 'http://emap{s}.mapabc.com/mapabc/maptile?&x={X}&y={y}&z={z}',
                subdomains: [0,1,2],
            });
            expect(function () {
                map.setBaseTileLayer(tile2);
            }).to.not.throwException();
        });

        it('getLayer', function () {
        });

        it('addLayer', function () {
        });

        it('getCoordinateType', function () {
            var t = map.getCoordinateType();

            expect(t).to.not.be(null);
        });

        it('coordinateToScreenPoint', function () {
            var point = map.coordinateToScreenPoint({x: 1, y: 1});

            expect(point).to.not.be(null);
        });

        it('screenPointToCoordinate', function () {
            var coord = map.screenPointToCoordinate();

            expect(coord).to.not.be(null);
        });

    });

    describe('Map.Pan', function() {

        it('panTo', function() {
            var coord = {x: 1, y: 1};

            expect(function () {
                map.panTo(coord);
            }).to.not.throwException();
        });

        it('panBy', function() {
            var offset = {left: 20, top: 20};

            expect(function () {
                map.panBy(offset);
            }).to.not.throwException();
        });

        it('animatePan', function() {
            var offset = {left: 20, top: 20};

            expect(function () {
                map.animatePan(offset);
            }).to.not.throwException();
        });

    });

    describe('Map.Zoom', function() {

        it('zoom', function() {
            var zoom = map.getZoomLevel();
            zoom = Math.ceil(zoom / 2);

            expect(function () {
                map.zoom(zoom);
            }).to.not.throwException();
        });

    });

    describe('Map.ContextMenu', function() {

        it('setContextMenu', function() {
            var spy = sinon.spy();

            expect(function () {
                map.setContextMenu({
                    items: []
                });
                map.setContextMenu({
                    items: [
                        {item: 'item1', callback: spy},
                        {item: 'item2', callback: spy}
                    ],
                    width: 250
                });
            }).to.not.throwException();
        });

        it('setMenuItem', function() {
            var spy = sinon.spy();
            var items_1 = [];
            var items_2 = [
                {item: 'item1', callback: spy},
                {item: 'item2', callback: spy}
            ];

            expect(function () {
                map.setMenuItem(items_1);
                map.setMenuItem(items_2);
            }).to.not.throwException();
        });

        it('openMenu', function() {
            var pos = {x: 25, y: 25};

            expect(function () {
                map.openMenu();
                map.openMenu(pos);
            }).to.not.throwException();
        });

        it('closeMenu', function() {
            expect(function () {
                map.closeMenu();
            }).to.not.throwException();
        });

    });

    describe('Map.FullScreen', function() {

        it('openFullScreen', function(done) {
            expect(function () {
                map.openFullscreen();
                done();
            }).to.not.throwException();
        });

        it('exitFullScreen', function(done) {
            expect(function () {
                map.exitFullscreen();
                done();
            }).to.not.throwException();
        });

    });

    describe('Map.Snap', function() {
        it('snap');
    });

    describe('Map.CartoCSS', function() {

        it('CartoCSS');

        it('loadCartoCSS');

        it('rendCartoCSS');

        it('cartoCSSGeometry');

    });

    describe('Map.Topo', function() {

        it('computeDistance', function() {
            var lonlat1 = new Z.Coordinate([0, 0]);
            var lonlat2 = new Z.Coordinate([1, 1]);
            var distance = map.computeDistance(lonlat1, lonlat2);

            expect(distance).to.be.above(0);
        });

        it('computeGeodesicLength', function() {
            var all = genAllTypeGeometries();

            expect(function () {
                for (var i = 0; i < all.length; i++) {
                    var g = all[i];
                    g.computeGeodesicLength(g);
                }
            }).to.not.throwException();
        });

        it('computeGeodesicArea', function() {
            var all = genAllTypeGeometries();

            expect(function () {
                for (var i = 0; i < all.length; i++) {
                    var g = all[i];
                    g.computeGeodesicArea(g);
                }
            }).to.not.throwException();
        });

        it('buffer');

        it('relate');

        it('identify', function() {
            var spy = sinon.spy();
            var layer = new Z.SVGLayer('id');
            var geometries = genAllTypeGeometries();
            layer.addGeometry(geometries);
            map.addLayer(layer);

            expect(function () {
                map.identify({
                    coordinate: center,
                    radius: 50, // m
                    layers: [layer],
                    success: spy
                });
            }).to.not.throwException();

        });

    });

    describe('Map.UI.InfoWindow', function() {

        it('setOption', function() {
            var win = new Z.InfoWindow();
            var options = {
                title: 'title',
                content: 'content'
            };

            expect(function() {
                win.setOption(options);
            }).to.not.throwException();
        });

        it('show/hide/isOpen', function() {
            var win = new Z.InfoWindow();
            var options = {
                title: 'title',
                content: 'content'
            };
            win.setOption(options);
            win.addTo(map);
            var pos = {x: 10, y: 10};

            expect(function () {
                win.show(pos);
                win.isOpen();
                win.hide();
            }).to.not.throwException();
        });

    });

    describe('Map.UI.Menu', function() {

        it('setOption', function() {
            var menu = new Z.Menu();
            var options = {
                items: [
                    {item: 'item1'},
                    {item: 'item2'}
                ],
                width: 0
            };

            expect(function () {
                menu.setOption(options);
            }).to.not.throwException();
        });

        it('getOption', function() {
            var menu = new Z.Menu();
            var options = {
                items: [
                    {item: 'item1'},
                    {item: 'item2'}
                ],
                width: 0
            };
            menu.setOption(options);

            var got = menu.getOption();

            expect(got).to.eql(options);
        });

        it('addTo', function() {
            var menu = new Z.Menu();
            var options = {
                items: [
                    {item: 'item1'},
                    {item: 'item2'}
                ],
                width: 0
            };
            menu.setOption(options);

            expect(function () {
                menu.addTo(map);
            }).to.not.throwException();
        });

        it('setItems', function() {
            var menu = new Z.Menu();
            var items = [
                {item: 'item1'},
                {item: 'item2'}
            ];

            expect(function () {
                menu.setItems(items);
            }).to.not.throwException();
        });

        it('closeMenu/removeMenu', function() {
            var options = {
                items: [
                    {item: 'item1'},
                    {item: 'item2'}
                ],
                width: 0
            };
            var menu = new Z.Menu(options);
            menu.addTo(map);
            var pos = {x: 10, y: 10};
            menu.show(pos);

            expect(function () {
                menu.closeMenu();
                menu.removeMenu();
            }).to.not.throwException();
        });

        it('show/hide/isOpen', function() {
            var options = {
                items: [
                    {item: 'item1'},
                    {item: 'item2'}
                ],
                width: 0
            };
            var menu = new Z.Menu(options);
            menu.addTo(map);
            var pos = {x: 10, y: 10};

            expect(function () {
                menu.show(pos);
                menu.hide();
                menu.isOpen();
            }).to.not.throwException();
        });

    });

    describe('Map.UI.Tip', function() {
        // TODO
    });

    describe('Map.UI.Label', function() {
        // TODO
    });

    describe('Control', function() {

        function buildOn() {
            return Z.DomUtil.createEl('div');
        }

        it('setOption');

        it('getOption');

        it('addTo', function() {
            var control = new Z.Control({id: 'id1'});
            control.buildOn = buildOn;

            expect(function () {
                control.addTo(map);
            }).to.not.throwException();
        });

        it('setPosition', function() {
            var control = new Z.Control({
                id: 'id1',
                position: {'top': '10','left': '10'}
            });
            control.buildOn = buildOn;
            control.addTo(map);
            var pos = {
                top: 20,
                left: 30
            };

            expect(function () {
                control.setPosition(pos);
            }).to.not.throwException();
        });

        it('getPosition', function() {
            var control = new Z.Control({id: 'id1'});
            var undef;

            expect(control.getPosition()).to.not.eql(undef);
        });

    });

    describe('Control.Attribution', function() {

        it('setContent', function() {
            var attribution = new Z.Control.Attribution({
                id: 'id',
                position: {
                    bottom: 10,
                    right: 10
                }
            });
            attribution.addTo(map);

            expect(function () {
                attribution.setContent('new content');
            }).to.not.throwException();
        });

    });

    describe('OverlayLayer', function() {

        function paint(geometries) {}

        it('setId');

        it('getId');

        it('getExtent');

        it('bringToFront');

        it('bringToBack');

        it('addGeometry', function() {
            var layer = new Z.OverlayLayer();
            layer.paintGeometries = paint;
            layer.setId('id');
            // map.addLayer(layer);
            var geometry = new Z.Polygon([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]);

            expect(function () {
                layer.addGeometry(geometry);
                layer.addGeometry(geometry, true);
            }).to.not.throwException();
        });

        it('getAllGeometries', function() {
            var layer = new Z.OverlayLayer();
            layer.paintGeometries = paint;
            layer.setId('id');
            // map.addLayer(layer);
            var geometry = new Z.Polygon([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]);
            var count = 10;
            for (var i = 0; i < count; i++) {
                layer.addGeometry(geometry);
            }
            var geometries = layer.getAllGeometries();

            expect(geometries).to.have.length(count);
        });

        it('getGeometryById', function() {
            var layer = new Z.OverlayLayer();
            layer.paintGeometries = paint;
            layer.setId('id');
            // map.addLayer(layer);
            var geometry = new Z.Polygon([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]);
            geometry.setId('id');
            layer.addGeometry(geometry);

            expect(layer.getGeometryById('id')).to.not.be(null);
            expect(layer.getGeometryById(null)).to.be(null);
            expect(layer.getGeometryById('')).to.be(null);
        });

        it('removeGeometry', function() {
            var layer = new Z.OverlayLayer();
            layer.paintGeometries = paint;
            layer.setId('id');
            // map.addLayer(layer);
            var polygon = new Z.Polygon([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]);
            polygon.setId('polygon');
            var polyline = new Z.Polyline([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222}
            ]);
            polyline.setId('polyline');
            layer.addGeometry(polygon);
            layer.addGeometry(polyline);

            layer.removeGeometry('polyline');
            expect(layer.getGeometryById('polyline')).to.be(null);

            layer.removeGeometry(polygon);
            expect(layer.getGeometryById('polygon')).to.be(null);
        });

        it('clear', function() {
            var layer = new Z.OverlayLayer();
            layer.paintGeometries = paint;
            layer.setId('id');
            // map.addLayer(layer);
            var polygon = new Z.Polygon([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]);
            polygon.setId('polygon');
            var polyline = new Z.Polyline([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222}
            ]);
            polyline.setId('polyline');
            layer.addGeometry(polygon);
            layer.addGeometry(polyline);

            layer.clear();

            var geometries = layer.getAllGeometries();
            expect(geometries).to.be.empty();
        });

    });

    describe('OverLayer.SVGLayer', function() {
        it('show/hide/isVisible', function() {
            var layer = new Z.SVGLayer('svg');
            map.addLayer(layer);
            var geometry = new Z.Polygon([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]);
            layer.addGeometry(geometry);

            expect(function () {
                layer.show();
                layer.hide();
                layer.isVisible();
            }).to.not.throwException();
        });
    });

    describe('OverLayer.CanvasLayer', function() {
        it('show/hide/isVisible', function() {
            var layer = new Z.CanvasLayer('canvas');
            map.addLayer(layer);
            var geometry = new Z.Polygon([
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]);
            layer.addGeometry(geometry);

            expect(function () {
                layer.show();
                layer.hide();
                layer.isVisible();
            }).to.not.throwException();
        });
    });

    describe('TileLayer', function() {
    });

    describe('DynamicLayer', function() {
    });

    describe('DrawTool', function() {

        it('addTo', function() {
            var drawTool = new Z.DrawTool({
                mode: Z.Geometry.TYPE_POLYLINE,
                symbol: {
                    strokeSymbol: {
                        stroke: '#ff0000',
                        'stroke-width': 3,
                        opacity: 0.6
                    }
                }
            });

            expect(function () {
                drawTool.addTo(map);
            }).to.not.throwException();
        });

        it('enable/disable', function() {
            var drawTool = new Z.DrawTool({
                mode: Z.Geometry.TYPE_POLYLINE,
                symbol: {
                    strokeSymbol: {
                        stroke: '#ff0000',
                        'stroke-width': 3,
                        opacity: 0.6
                    }
                }
            });
            drawTool.addTo(map);

            expect(function () {
                 drawTool.disable();
                 drawTool.enable();
             }).to.not.throwException();
        });

        it('setMode', function() {
            var drawTool = new Z.DrawTool({
                mode: Z.Geometry.TYPE_POLYLINE
            });
            drawTool.addTo(map);

            expect(function () {
                drawTool.setMode(Z.Geometry.TYPE_POLYGON);
            }).to.not.throwException();
        });

        it('setSymbol', function() {
            var drawTool = new Z.DrawTool({
                mode: Z.Geometry.TYPE_POLYLINE
            });
            drawTool.addTo(map);
            var symbol = {
                strokeSymbol: {
                    stroke: '#ff0000',
                    'stroke-width': 3,
                    opacity: 0.6
                }
            };

            expect(function () {
                drawTool.setSymbol(symbol);
            }).to.not.throwException();
        });

        it('getSymbol', function() {
            var drawTool = new Z.DrawTool({
                mode: Z.Geometry.TYPE_POLYLINE
            });
            drawTool.addTo(map);

            expect(function () {
                drawTool.getSymbol();
            }).to.not.be(null);
        });

    });

    describe('ComputeAreaTool', function() {
        it('enable/disable', function() {
            var tool = new Z.ComputeAreaTool();

            expect(function () {
                tool.addTo(map);
                tool.enable();
                tool.disable();
            }).to.not.throwException();
        });
    });

    describe('DistanceTool', function() {
        it('enable/disable', function() {
            var tool = new Z.DistanceTool();

            expect(function () {
                tool.addTo(map);
                tool.enable();
                tool.disable();
            }).to.not.throwException();
        });
    });

    describe('Query', function() {
        it('query');
    });

    describe('RemoteQuery', function() {

        it('query');

        it('identify');

    });

    describe('Geometry', function() {

        it('fromJson', function() {
            // TODO
        });

        it('fromGeoJson', function() {
            // TODO
        });

        it('setId/getId', function() {
            var geometry = new Z.Geometry();
            var undef;

            expect(geometry.getId()).to.equal(undef);

            geometry.setId('id');

            expect(geometry.getId()).to.eql('id');
        });

        it('setSymbol/getSymbol', function() {
            var geometry = new Z.Geometry();
            var symbol = {
                strokeSymbol: {
                    stroke: '#ff0000',
                    'stroke-width': 3,
                    opacity: 0.6
                }
            };

            expect(geometry.getSymbol()).to.be(null);

            geometry.setSymbol(symbol);
            var got = geometry.getSymbol();

            expect(got).to.not.be(null);
            var stroke = sym.strokeSymbol;
            expect(stroke).to.only.have.keys([
                'stroke',
                'strokeWidth',
                'opacity'
                ]);
        });

        it('[set|get]Properties');

        it('getLayer');

        it('getMap');

        it('getType');

        it('isVector');

    });

    describe('Geometry.Marker', function() {

        it('setCenter', function() {
        });

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.Circle', function() {

        it('setCenter', function() {
        });

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.Ellipse', function() {

        it('setCenter', function() {
        });

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.Sector', function() {

        it('setCenter', function() {
        });

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.Rectangle', function() {

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.Polyline', function() {

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.Polygon', function() {

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.GeometryCollection', function() {

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.MultiPoint', function() {

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.MultiPolyline', function() {

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.MultiPolygon', function() {

        it('setCenter', function() {
        });

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

    describe('Geometry.Extent', function() {

        it('getCenter', function() {
        });

        it('getExtent', function() {
        });

        it('getSize', function() {
        });

        it('show/hide/isVisible', function() {
        });

        it('remove', function() {
        });

        it('copy');

        it('toJson', function() {
        });

        it('toGeoJson', function() {
        });

    });

});
