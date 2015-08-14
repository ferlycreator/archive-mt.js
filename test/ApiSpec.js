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

});
