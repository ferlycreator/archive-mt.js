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

});
