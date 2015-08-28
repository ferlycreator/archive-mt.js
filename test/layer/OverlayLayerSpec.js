describe('OverlayLayer', function() {

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

    describe('visibility', function() {
        it('should be false if not add to map', function() {
            var layer = new Z.VectorLayer('id');

            expect(layer.isVisible()).to.not.be.ok();
        });

        it('should be false if map not loaded', function() {
            var layer = new Z.VectorLayer('id');
            map.addLayer(layer);

            expect(layer.isVisible()).to.not.be.ok();
        });

        it('should be true if map loaded', function() {
            var layer = new Z.VectorLayer('id');
            map.addLayer(layer);
            map.setBaseTileLayer(tile);

            expect(layer.isVisible()).to.be.ok();
        });

        it('should be false after hide', function() {
            var layer = new Z.VectorLayer('id');
            map.addLayer(layer);
            map.setBaseTileLayer(tile);
            layer.hide();

            expect(layer.isVisible()).to.not.be.ok();
        });

        it('should be true after hide then show', function() {
            var layer = new Z.VectorLayer('id');
            map.addLayer(layer);
            map.setBaseTileLayer(tile);
            layer.hide();
            layer.show();

            expect(layer.isVisible()).to.be.ok();
        });
    });

    describe('addGeometry', function() {
        it('can be called on layer not on map', function() {
            var layer = new Z.VectorLayer('id');
            var gid = 'g1';
            var geo1 = new Z.Marker(center);
            geo1.setId(gid);
            layer.addGeometry(geo1, true);

            expect(layer.getGeometryById(gid)).to.equal(geo1);
        });

        it('can be called on layer on map that not loaded', function() {
            var layer = new Z.VectorLayer('id');
            var gid = 'g1';
            var geo1 = new Z.Marker(center);
            geo1.setId(gid);
            layer.addGeometry(geo1, true);
            map.addLayer(layer);

            expect(layer.getGeometryById(gid)).to.equal(geo1);
        });

        it('shold throw error if geometry to be added has same id', function() {
            var layer = new Z.VectorLayer('id');
            var gid = 'g1';
            var geo1 = new Z.Marker(center);
            geo1.setId(gid);
            layer.addGeometry(geo1);
            var geo2 = new Z.Marker(center);
            geo2.setId(gid);

            expect(layer.addGeometry).withArgs(geo2).to.throwException();
            expect(function() {
                layer.addGeometry(geo2);
            }).to.throwException(function(e) {
                expect(e).to.be.a(Error);
            });
        });
    });

    describe('getGeometry', function() {
        it('return null if called with non-existed id', function() {
            var layer = new Z.VectorLayer('id');

            expect(layer.getGeometryById('non-existed')).to.equal(null);
        });

        it('return value is empty after call clear', function() {
            var layer = new Z.VectorLayer('id');
            var gid = 'g1';
            var geo1 = new Z.Marker(center, {id: gid});
            layer.addGeometry(geo1);

            expect(layer.clear().getAllGeometries()).to.be.empty();
        });
    });

});
