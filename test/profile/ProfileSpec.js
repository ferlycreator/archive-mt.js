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
            map.setBaseLayer(tile);
            var profile = map.toJSON();
            expect(profile).to.be.ok();
            var config = map.config();
            config.center = map.getCenter();
            config.zoom = map.getZoom();
            expect(profile.options).to.be.eql(config);
            expect(profile.baseLayer).to.be.ok();

            profile = map.toJSON({
                "baseLayer" : false,
                "layers" : false
            });
            expect(profile.baseLayer).to.be.ok();
            expect(profile.baseLayer.options.visible).not.to.be.ok();
            expect(profile.layers).to.be.ok();
            expect(profile.layers).to.have.length(0);
        });

        it('get map from a simple profile',function() {
            map.setBaseLayer(tile);
            var profile = map.toJSON();
            var container2 = document.createElement('div');
            container2.style.width = '800px';
            container2.style.height = '600px';
            document.body.appendChild(container2);
            var profileMap = Z.Map.fromJSON(container2, profile);

            expect(profileMap).to.be.ok();
            expect(profileMap.getBaseLayer()).to.be.ok();
        });

        it("get profile with various layers",function() {
            map.setBaseLayer(tile);
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
            map.setBaseLayer(tile);
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
            map.setBaseLayer(tile);
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
            expect(profileMap.getBaseLayer()).to.be.ok();
            var layers = profileMap.getLayers();
            expect(layers).to.have.length(3);
            expect(layers[0].toJSON()).to.be.eql(tile2.toJSON());
            expect(layers[1].toJSON()).to.be.eql(vectorLayer.toJSON());
            expect(layers[2].toJSON()).to.be.eql(vectorLayer2.toJSON());
        });


    });

    describe('profile basic geometries',function() {
        it('profile all types of basic geometries',function() {
            var all = genAllTypeGeometries();
            for (var i = 0; i < all.length; i++) {
                var g = all[i];
                var json = g.toJSON();
                var deser = Z.Geometry.fromJSON(json);
                var deserJSON = deser.toJSON();
                expect(json).not.to.be.empty();
                expect(json).to.be.eql(deserJSON);
            }

        })
    });

    describe('profile CurveLine and Label',function() {
        it('profile CurveLine',function() {
            var curve = new maptalks.CurveLine(
                //线端点坐标数组
                [[121.48416288620015,31.24488412311837],[121.48394830947899,31.242664302121515],[121.48595460182202,31.242535881128543],[121.48695238357557,31.244838259576046],[121.48944147354125,31.24487495041167],[121.49018176322932,31.242664302121515],[121.49290688758839,31.242765204207824],[121.49358280426011,31.245040058995645],[121.49601825004554,31.245159303904526],[121.49715550666777,31.242921143583686]],
                //bezierCurveDegree指贝塞尔曲线的度, 取值为2或者3即二阶贝塞尔曲线或三阶贝塞尔曲线
                {draggable: true, curveType:1, arcDegree:120});
            curve.setProperties({
                'foo' : 1
            });
            curve.setSymbol({
                'lineWidth' : 2,
                'lineColor' : '#ff0000'
            });
            var json = curve.toJSON();
            var deser = maptalks.Geometry.fromJSON(json);
            expect(deser instanceof maptalks.CurveLine).to.be.ok();
            var options = deser.config();
            expect(options.draggable).to.be.ok();
            expect(options.curveType).to.be.eql(1);
            expect(options.arcDegree).to.be.eql(120);
            expect(deser.getCoordinates()).to.be.eql(curve.getCoordinates());
            expect(deser.getProperties()).to.be.eql(curve.getProperties());
            expect(deser.getSymbol()).to.be.eql(curve.getSymbol());
        });

        it('profile Label',function() {
            var options = {
                'symbol': {
                    'markerLineColor': '#ff0000',
                    'markerLineWidth': 1,
                    'markerLineOpacity': 0.9,
                    'markerLineDasharray': null,
                    'markerFill': '#4e98dd',
                    'markerFillOpacity': 0.9,

                    'textFaceName': 'arial',
                    'textSize': 12,
                    'textFill': '#ff0000',
                    'textOpacity': 1,
                    'textSpacing': 30,
                    'textWrapWidth': null,//auto
                    'textWrapBefore': false,
                    //'textWrapCharacter': '\n',
                    'textLineSpacing': 8,
                    'textHorizontalAlignment': 'middle',//left middle right
                    'textVerticalAlignment': 'bottom',//top middle bottom
                },
               'draggable': false,
               'boxAutoSize': false,
               'boxMinWidth': 500,
               'boxMinHeight': 100
            };
            //创建label
            var label = new maptalks.Label('文本标签', [100,0], options);
            label.setProperties({
                'foo' : 1
            });
            label.setSymbol({
                'lineWidth' : 2,
                'lineColor' : '#ff0000'
            });
            var json = label.toJSON();
            var deser = maptalks.Geometry.fromJSON(json);
            expect(deser instanceof maptalks.Label).to.be.ok();
            var options = deser.config();
            expect(options.draggable).not.to.be.ok();
            expect(options.boxAutoSize).not.to.be.ok();
            expect(options.boxMinWidth).to.be.eql(500);
            expect(options.boxMinHeight).to.be.eql(100);
            expect(deser.getContent()).to.be.eql(label.getContent());
            expect(deser.getCoordinates()).to.be.eql(label.getCoordinates());
            expect(deser.getProperties()).to.be.eql(label.getProperties());
            expect(deser.getSymbol()).to.be.eql(label.getSymbol());
        });
    });
});
