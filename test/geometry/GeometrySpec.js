describe('Geometry', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;
    var context = {
        map:map,
        layer:layer
    };
    var canvasContainer;

    beforeEach(function() {
        var setups = commonSetupMap(center);
        container = setups.container;
        map = setups.map;
        layer = new Z.VectorLayer('canvas',{'render':'canvas'});
        map.addLayer(layer);
        context.map = map;
        context.layer = layer;
        canvasContainer = map._panels.mapPlatform;
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    it("Marker._containsPoint", function() {
        layer.clear();
        var geometry = new Z.Marker(center, {
            symbol: {
                markerFile : Z.prefix + 'images/resource/marker.png',
                markerHeight : 30,
                markerWidth : 22,
                dx : 0,
                dy : 0
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);
        //TODO 因为marker的width和height为0, 所以无法击中
        happen.click(canvasContainer, {
            clientX: 400 + 8,
            clientY: 300 + 8
        });

        //expect(spy.called).to.be.ok();
    });

    it("Circle._containsPoint", function() {
        layer.clear();
        var geometry = new Z.Circle(center, 10, {
            symbol: {
                'lineWidth': 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(canvasContainer, {
            clientX: 400 + 8 + 10 + 4,
            clientY: 300 + 8
        });
        expect(spy.called).to.not.be.ok();

        happen.click(canvasContainer, {
            clientX: 400 + 8 + 10 + 3,
            clientY: 300 + 8
        });
        expect(spy.called).to.be.ok();
    });

    it("Ellipse._containsPoint", function() {
        layer.clear();
        var geometry = new Z.Ellipse(center, 20, 10, {
            symbol: {
                'lineWidth': 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(canvasContainer, {
            clientX: 400 + 8 + 10 + 4,
            clientY: 300 + 8
        });
        expect(spy.called).to.not.be.ok();

        happen.click(canvasContainer, {
            clientX: 400 + 8 + 10 + 3,
            clientY: 300 + 8
        });
        expect(spy.called).to.be.ok();
    });

    it("Sector._containsPoint", function() {
        layer.clear();
        var geometry = new Z.Sector(center, 10, 90, 405, {
            symbol: {
                'lineWidth': 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(canvasContainer, {
            clientX: 400 + 8 + (10 - 3),
            clientY: 300 + 8 - (10 - 2)
        });
        expect(spy.called).to.not.be.ok();

        happen.click(canvasContainer, {
            clientX: 400 + 8,
            clientY: 300 + 8 - 10
        });
        expect(spy.called).to.be.ok();
    });

    it("Rectangle._containsPoint", function() {
        layer.clear();
        var geometry = new Z.Rectangle(center, 20, 10, {
            symbol: {
                'lineWidth': 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(canvasContainer, {
            clientX: 400 + 8,
            clientY: 300 + 8 - 4
        });
        expect(spy.called).to.not.be.ok();

        happen.click(canvasContainer, {
            clientX: 400 + 8,
            clientY: 300 + 8 - 3
        });
        expect(spy.called).to.be.ok();
    });

    it("Polyline._containsPoint", function() {
        layer.clear();
        var geometry = new Z.Polyline([
            new Z.Coordinate([center.x, center.y + 0.001]),
            new Z.Coordinate([center.x, center.y]),
            new Z.Coordinate([center.x + 0.002, center.y])
        ], {
            symbol: {
                'lineWidth': 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(canvasContainer, {
            clientX: 400 + 8 + 4,
            clientY: 300 + 8 - 4
        });
        expect(spy.called).to.not.be.ok();

        happen.click(canvasContainer, {
            clientX: 400 + 8 + 3,
            clientY: 300 + 8 - 3
        });
        expect(spy.called).to.be.ok();
    });

    it("Polygon._containsPoint", function() {
        layer.clear();
        var geometry = new Z.Polygon([[
            new Z.Coordinate([center.x, center.y + 0.001]),
            new Z.Coordinate([center.x, center.y]),
            new Z.Coordinate([center.x + 0.002, center.y])
        ]], {
            symbol: {
                'lineWidth': 6
            }
        });
        layer.addGeometry(geometry);

        var spy = sinon.spy();
        geometry.on('click', spy);

        happen.click(canvasContainer, {
            clientX: 400 + 8 - 4,
            clientY: 300 + 8
        });
        expect(spy.called).to.not.be.ok();

        happen.click(canvasContainer, {
            clientX: 400 + 8 - 3,
            clientY: 300 + 8
        });
        expect(spy.called).to.be.ok();
    });
    // 测试所有类型Geometry的公共方法
    var geometries = genAllTypeGeometries();

    for (var i=0, len = geometries.length;i<len;i++){
        registerGeometryCommonTest.call(this,geometries[i],context);
    }

});
//测试Geometry的公共方法
function registerGeometryCommonTest(geometry,_context) {
    function setupGeometry() {
        // var layer = new Z.VectorLayer('common_test_layer');
        if (geometry.getLayer()) {
            geometry.remove();
        }
        _context.layer.addGeometry(geometry);
        // map.addLayer(layer);
    }

    function teardownGeometry() {
        geometry.remove();
        // map.removeLayer('common_test_layer');
    }

    var type = geometry.getType();

    context(type+':getter and setters.',function() {
        it('id', function() {
            geometry.setId('id');
            var id = geometry.getId();
            expect(id).to.be('id');
            geometry.setId(null);
            expect(geometry.getId()).to.not.be.ok();
        });

        it('Layer',function() {
            expect(geometry.getLayer()).to.not.be.ok();
            var layer = new Z.VectorLayer('id');
            layer.addGeometry(geometry);
            expect(geometry.getLayer()).to.be.ok();
            //delete
            geometry.remove();
            expect(geometry.getLayer()).to.not.be.ok();
        });

        it('Map',function() {
            setupGeometry();

            expect(geometry.getMap()).to.be.ok();

            teardownGeometry();

            expect(geometry.getMap()).to.not.be.ok();
        });

        it('Type',function() {
            var type = geometry.getType();
            expect(type).to.not.be.empty();
        });

        it('Symbol',function() {
           /* var symbol = geometry.getSymbol();
            expect(symbol).to.be.ok();
            expect(symbol).to.not.be.empty();*/
            //setSymbol单独测试
        });

        it('Properties',function() {
            var old_props = geometry.getProperties();

            var props_test = {'foo_num':1, 'foo_str':'str', 'foo_bool':false};
            geometry.setProperties(props_test);

            var props = geometry.getProperties();
            expect(props).to.eql(props_test);

            geometry.setProperties(old_props);
            expect(geometry.getProperties()).to.not.eql(props_test);
        });

    });

    context(type+':can be measured.',function() {
        it('it has geodesic length',function() {
            var length = geometry.getLength();
            if (geometry instanceof Z.Marker) {
                expect(length===0).to.be.ok();
            } else {
                expect(length>0).to.be.ok();
            }

        });

        it('it has geodesic area',function() {
            var types = [Z.Polygon, Z.MultiPolygon];
            var area = geometry.getArea();
            var hit = false;
            for (var i=0, len=types.length;i<len;i++) {
                if (geometry instanceof types[i]) {
                    hit = true;
                    break;
                }
            }
            if (!hit) {
                expect(area===0).to.be.ok();
            } else {
                expect(area>0).to.be.ok();
            }

        });

        it('it has extent',function() {
            setupGeometry();

            var extent = geometry.getExtent();
            expect(extent).to.be.a(Z.Extent);
            expect(extent).to.not.be.empty();

            teardownGeometry();
        });

        it('it has size',function() {
            setupGeometry();

            var size = geometry.getSize();
            expect(size).to.be.a(Z.Size);
            expect(size.width).to.be.above(0);
            expect(size.height).to.be.above(0);

            teardownGeometry();
        });

        it('it has center',function() {
            var center = geometry.getCenter();
            expect(center).to.be.a(Z.Coordinate);
            expect(center.x).to.be.ok();
            expect(center.y).to.be.ok();

            setupGeometry();

            center = geometry.getCenter();
            expect(center).to.be.a(Z.Coordinate);
            expect(center.x).to.be.ok();
            expect(center.y).to.be.ok();

            teardownGeometry();
        });
    });

    context(type+':can show and hide.',function() {
        it('show and hide',function() {
            geometry.show();
            expect(geometry.isVisible()).to.be.ok();
            geometry.hide();
            expect(geometry.isVisible()).to.not.be.ok();

            setupGeometry();

            geometry.show();
            expect(geometry.isVisible()).to.be.ok();
            geometry.hide();
            expect(geometry.isVisible()).to.not.be.ok();

            teardownGeometry();

            geometry.show();
            expect(geometry.isVisible()).to.be.ok();
        });
    });

    context(type+':copy',function() {
        it ('copy',function() {
            var json = geometry.toJSON();

            var cloned = geometry.copy();

            var clonedJson = cloned.toJSON();

            expect(clonedJson).to.eql(json);
        });
    });

    context(type+':has crs',function() {
        it ('can read crs from json',function() {
            var json = geometry.toGeoJSON();
            json.crs = {
                "type" : "cnCoordinateType",
                "properties" : {
                    "name" : "gcj02"
                }
            };
            var parsed = Z.GeoJSON.fromGeoJSON(json);

            expect(parsed.getCRS()).to.eql(json.crs);
        });

        it ('has crs',function() {
            var coordinateType = Z.CRS.GCJ02;
            var json = geometry.setCRS(coordinateType).toGeoJSON();
            expect(json['crs']).to.be.ok();
            expect(json['crs']).to.eql({"type":"cnCoordinateType","properties":{"name":"gcj02"}});
        });
    });

    context(type+':remove',function() {
        it ('remove from layer',function() {
            //layer not on map
            var layer = new Z.VectorLayer('svg');
            layer.addGeometry(geometry);
            expect(geometry.getLayer()).to.be.ok();
            expect(geometry.getMap()).to.not.be.ok();
            geometry.remove();
            expect(geometry.getLayer()).to.not.be.ok();

            setupGeometry();

            expect(geometry.getLayer()).to.be.ok();
            expect(geometry.getMap()).to.be.ok();
            geometry.remove();
            expect(geometry.getLayer()).to.not.be.ok();

            var canvasLayer = new Z.VectorLayer('event_test_canvas',{'render':'canvas'});
            canvasLayer.addGeometry(geometry);
            _context.map.addLayer(canvasLayer);

            expect(geometry.getLayer()).to.be.ok();
            expect(geometry.getMap()).to.be.ok();
            geometry.remove();
            expect(geometry.getLayer()).to.not.be.ok();

            teardownGeometry();
        });
    });

    context(type+':some internal methods should be tested.',function() {
        it('painter',function() {
            setupGeometry();

            var painter = geometry._getPainter();
            expect(painter).to.be.ok();
            geometry.remove();

            var canvasLayer = new Z.VectorLayer('event_test_canvas',{'render':'canvas'});
            canvasLayer.addGeometry(geometry);
            _context.map.addLayer(canvasLayer);

            painter = geometry._getPainter();
            expect(painter).to.be.ok();

            teardownGeometry();
        });

        it('getExternalResource',function() {
            var oldSymbol = geometry.getSymbol();

            var type = geometry.getType();
            if (type === Z.Geometry.TYPE_POINT) {
                var symbol = {
                    'marker-file':'http://foo.com/foo.png'
                };
                geometry.setSymbol(symbol);
                var resource = geometry._getExternalResource();
                expect(resource).to.have.length(1);
                expect(resource[0]).to.be(symbol['marker-file']);
            } else {
                var symbol = {
                    'polygon-pattern-file':'url(\'http://foo.com/foo.png\')'
                };
                geometry.setSymbol(symbol);
                var resource = geometry._getExternalResource();
                expect(resource).to.have.length(1);
                expect(resource[0]).to.be('http://foo.com/foo.png');
            }
        });

        it('getProjection',function() {
            var projection = geometry._getProjection();
            expect(projection).not.to.be.ok();

            setupGeometry();

            var projection = geometry._getProjection();
            expect(projection.srs).to.be(_context.map._getProjection().srs);

            teardownGeometry();
        });

        it('getMeasurer',function() {
            var measurer = geometry._getMeasurer();
            expect(measurer).to.be(Z.measurer.WGS84Sphere);

            geometry.config('measure', 'euclidean');

            measurer = geometry._getMeasurer();
            expect(measurer).to.be(Z.measurer.Euclidean);
        });
    });

    //TODO zoomend的测试存在回调后map已经不存在的问题
    /*context(type+':map events listeners',function() {
        it ('onZoomEnd',function() {
            setupGeometry();
            var spy = sinon.spy(geometry,'_onZoomEnd');
            _context.map.on('zoomend',function() {
                expect(spy.called).to.be.ok();
                teardownGeometry();
            });
            _context.map.zoomOut();

        });
    });*/
}
