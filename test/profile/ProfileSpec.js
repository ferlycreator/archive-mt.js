describe('#Map Profile', function () {

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
            zoom: 17,
            center: center
        };
        map = new Z.Map(container, option);
        tile = new Z.TileLayer('tile', {
            tileInfo: 'web-mercator',
            urlTemplate:"http://t{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}",
            subdomains: [1, 2, 3]
        });
    });

    afterEach(function() {
        document.body.removeChild(container);
    });

    describe('Layer can profile', function() {
        it('get tileLayer\'s profile',function() {
            var json = tile.toJSON();
            expect(json).to.be.ok();
            expect(json.options).to.eql(tile.config());
            expect(json.id).to.eql(tile.getId());

        });

        it('get tilelayer from a profile json',function() {
            var tileLayer = Z.Layer.fromJSON(null);
            expect(tileLayer).not.to.be.ok();
            var json = tile.toJSON();
            tileLayer = Z.Layer.fromJSON(json);
            expect(tileLayer).to.be.ok();
            expect(tileLayer.config()).to.eql(tile.config());
            expect(tileLayer.getId()).to.eql(tile.getId());
        });

        it('get vectorLayer\'s profile',function() {
            var vectorLayer = new Z.VectorLayer("vector");
            var geometries = genAllTypeGeometries();
            vectorLayer.addGeometry(geometries);
            var json = vectorLayer.toJSON();
            expect(json).to.be.ok();
            expect(json.options).to.eql(vectorLayer.config());
            expect(json.id).to.eql(vectorLayer.getId());
            expect(json.geometries).to.be.ok();
            expect(json.geometries).to.have.length(geometries.length);

            for (var i = 0; i < geometries.length; i++) {
                expect(geometries[i].toJSON()).to.be.eql(json.geometries[i]);
            }

            json = vectorLayer.toJSON({
                geometries:false
            });
            expect(json.geometries).not.to.be.ok();
        });

        it('get vectorlayer from a profile json',function() {
            var vectorLayer = new Z.VectorLayer("vector",{"render":"canvas"});
            var geometries = genAllTypeGeometries();
            vectorLayer.addGeometry(geometries);
            var json = vectorLayer.toJSON();
            var layer = Z.Layer.fromJSON(json);
            expect(layer).to.be.ok();
            expect(layer.config()).to.eql(vectorLayer.config());
            expect(layer.getId()).to.eql(vectorLayer.getId());
            expect(layer.getGeometries()).to.have.length(geometries.length);
            var layerGeos = layer.getGeometries();
            for (var i = 0; i < geometries.length; i++) {
                expect(geometries[i].toJSON()).to.be.eql(layerGeos[i].toJSON());
            }
        });
    });

    describe('Map can profile',function() {
        it('get simple Profile',function() {
            map.setBaseTileLayer(tile);
            var profile = map.toJSON();
            expect(profile).to.be.ok();
            var config = map.config();
            config.center = map.getCenter();
            config.zoom = map.getZoom();
            expect(profile.options).to.be.eql(config);
            expect(profile.baseTileLayer).to.be.ok();

            profile = map.toJSON({
                "baseTileLayer" : false,
                "layers" : false
            });
            expect(profile.baseTileLayer).to.be.ok();
            expect(profile.baseTileLayer.options.visible).not.to.be.ok();
            expect(profile.layers).not.to.be.ok();
        });

        it('get map from a simple profile',function() {
            map.setBaseTileLayer(tile);
            var profile = map.toJSON();
            var container2 = document.createElement('div');
            container2.style.width = '800px';
            container2.style.height = '600px';
            document.body.appendChild(container2);
            var profileMap = Z.Map.fromJSON(container2, profile);

            expect(profileMap).to.be.ok();
            expect(profileMap.getBaseTileLayer()).to.be.ok();
        });

        it("get profile with various layers",function() {
            map.setBaseTileLayer(tile);
            var tile2 = new maptalks.TileLayer('road',{
                urlTemplate:"http://t{s}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}",
                subdomains:['1','2','3','4','5'],
                opacity:0.6
            });
            map.addLayer(tile2);
            var vectorLayer = new Z.VectorLayer("vector-canvas",{"render":"canvas"});
            var geometries = genAllTypeGeometries();
            vectorLayer.addGeometry(geometries);
            var vectorLayer2 = new Z.VectorLayer("vector");
            vectorLayer2.addGeometry(genAllTypeGeometries());
            map.addLayer([vectorLayer, vectorLayer2]);

            var profile = map.toJSON();
            expect(profile.layers).to.have.length(3);
            expect(profile.layers[0]).to.be.eql(tile2.toJSON());
            expect(profile.layers[1]).to.be.eql(vectorLayer.toJSON());
            expect(profile.layers[2]).to.be.eql(vectorLayer2.toJSON());
        });

        it("get profile of selected layers",function() {
            map.setBaseTileLayer(tile);
            var tile2 = new maptalks.TileLayer('road',{
                urlTemplate:"http://t{s}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}",
                subdomains:['1','2','3','4','5'],
                opacity:0.6
            });
            map.addLayer(tile2);
            var vectorLayer = new Z.VectorLayer("vector-canvas",{"render":"canvas"});
            var geometries = genAllTypeGeometries();
            vectorLayer.addGeometry(geometries);
            var vectorLayer2 = new Z.VectorLayer("vector");
            vectorLayer2.addGeometry(genAllTypeGeometries());
            map.addLayer([vectorLayer, vectorLayer2]);

            var profile = map.toJSON({
                "layers" : [
                    {
                        "id" : "road"
                    },
                    {
                        "id" : "vector"
                    }
                ]
            });
            expect(profile.layers).to.have.length(2);
            expect(profile.layers[0]).to.be.eql(tile2.toJSON());
            expect(profile.layers[1]).to.be.eql(vectorLayer2.toJSON());
        });

        it('get map from various profile',function() {
            map.setBaseTileLayer(tile);
            var tile2 = new maptalks.TileLayer('road',{
                urlTemplate:"http://t{s}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}",
                subdomains:['1','2','3','4','5'],
                opacity:0.6
            });
            map.addLayer(tile2);
            var vectorLayer = new Z.VectorLayer("vector-canvas",{"render":"canvas"});
            var geometries = genAllTypeGeometries();
            vectorLayer.addGeometry(geometries);
            var vectorLayer2 = new Z.VectorLayer("vector");
            vectorLayer2.addGeometry(genAllTypeGeometries());
            map.addLayer([vectorLayer, vectorLayer2]);

            var profile = map.toJSON();
            var container2 = document.createElement('div');
            container2.style.width = '800px';
            container2.style.height = '600px';
            document.body.appendChild(container2);
            var profileMap = Z.Map.fromJSON(container2, profile);

            expect(profileMap).to.be.ok();
            expect(profileMap.getBaseTileLayer()).to.be.ok();
            var layers = profileMap.getLayers();
            expect(layers).to.have.length(3);
            expect(layers[0].toJSON()).to.be.eql(tile2.toJSON());
            expect(layers[1].toJSON()).to.be.eql(vectorLayer.toJSON());
            expect(layers[2].toJSON()).to.be.eql(vectorLayer2.toJSON());
        });


    });
});
