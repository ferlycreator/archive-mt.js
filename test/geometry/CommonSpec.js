var CommonSpec = {
    eventsToTest : 'click mousedown mouseup dblclick',



    mapSetup:function(center) {
        var container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        var option = {
            zoomLevel: 17,
            center: center
        };
        var map = new Z.Map(container, option);
        var tile = new Z.TileLayer('tile', {
            tileInfo: 'web-mercator',
            urlTemplate: 'http://emap{s}.mapabc.com/mapabc/maptile?&x={x}&y={y}&z={z}',
            subdomains: [0, 1, 2, 3]
        });
        map.setBaseTileLayer(tile);
        return {
            "container":container,
            "map":map,
            "base":tile
        };
    },

    mapTeardown:function(map) {

    },

    testSVGEvents:function(geometry, map) {
        var layer = new Z.VectorLayer('id');
        map.addLayer(layer);
        if (!this.spy) {
            this.spy = sinon.spy(this,'eventCallBack');
        }
        var vector = geometry;
        vector.on(this.eventsToTest, this.eventCallBack);
        layer.addGeometry(vector);
        var dom = vector._getPainter().getVectorDom();
        this.testGeometryEvents(dom);
    },

    eventCallBack:function(param) {
        expect(param).to.be.ok();
        expect(param.type).to.be.ok();
        expect(param.target).to.be.ok();
        expect(param.pixel).to.be.ok();
        expect(param.coordinate).to.be.ok();
    },

    testCanvasEvents:function(vector, map, testPoint) {
        var layer = new Z.VectorLayer('id',{'render':'canvas'});
        map.addLayer(layer);
        if (!this.spy) {
            this.spy = sinon.spy(this,'eventCallBack');
        }
        vector.on(this.eventsToTest, this.eventCallBack );
        layer.addGeometry(vector);
        var point = map.coordinateToScreenPoint(testPoint);
        var dom = Z.Render.Canvas.Base.getBaseCanvasRender(map).
                    getCanvasContainer();
        var domPosition = Z.DomUtil.getPageCoordinate(dom);
        point.add(domPosition);
        this.testGeometryEvents(dom,
            {
            'screenX':point.left,
            'screenY':point.top,
            'clientX':point.left,
            'clientY':point.top
            });
    },

    testGeometryEvents:function(dom,options) {
        var events = this.eventsToTest.split(' ');

        for (var i=0, len=events.length;i<len;i++) {
            if (options) {
                happen[events[i]](dom,options);
            } else {
                happen[events[i]](dom);
            }
        }
        var spy = this.spy;
        expect(spy.callCount).to.be(events.length);
        spy.reset();

    },

    //测试Geometry的公开方法
    testGeometryMethods:function(geometry) {
        var setups;
        var map,layer;
        function setupGeometry() {
            setups = CommonSpec.mapSetup(geometry.getCenter());
            map = setups.map;
            layer = new Z.VectorLayer('id');
            layer.addGeometry(geometry);
            map.addLayer(layer);
        }

        function teardownGeometry() {
            geometry.remove();
            Z.DomUtil.removeDomNode(setups.container);
        }



        context('getter and setters.',function() {
            it('id', function() {
                geometry.setId('id');
                var id = geometry.getId();
                expect(id).to.be('id');
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
                var symbol = geometry.getSymbol();
                expect(symbol).to.be.ok();
                expect(symbol).to.not.be.empty();
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

        context('can be measured.',function() {
            it('it has geodesic length',function() {
                var length = geometry.getLength();
                expect(length).to.be.ok();
            });

            it('it has geodesic area',function() {
                var area = geometry.getArea();
                expect(area).to.be.ok();
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

        context('can show and hide.',function() {
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

        context('copy',function() {
            it ('copy',function() {
                var json = geometry.toJson();

                var cloned = geometry.copy();

                var clonedJson = cloned.toJson();

                expect(clonedJson).to.eql(json);
            });
        });

        context('remove',function() {
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

                var canvasLayer = new Z.VectorLayer('canvas',{'render':'canvas'});
                canvasLayer.addGeometry(geometry);
                map.addLayer(canvasLayer);

                expect(geometry.getLayer()).to.be.ok();
                expect(geometry.getMap()).to.be.ok();
                geometry.remove();
                expect(geometry.getLayer()).to.not.be.ok();

                teardownGeometry();
            });
        });

        context('some internal methods should be tested.',function() {
            it('painter',function() {
                setupGeometry();

                var painter = geometry._getPainter();
                expect(painter).to.be.ok();
                geometry.remove();

                var canvasLayer = new Z.VectorLayer('canvas',{'render':'canvas'});
                canvasLayer.addGeometry(geometry);
                map.addLayer(canvasLayer);

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
                    expect(resource).to.be(symbol['marker-file']);
                } else {
                    var symbol = {
                        'polygon-fill':'url(\'http://foo.com/foo.png\')'
                    };
                    geometry.setSymbol(symbol);
                    var resource = geometry._getExternalResource();
                    expect(resource).to.be('http://foo.com/foo.png');
                }
            });

            it('getProjection',function() {
                var projection = geometry._getProjection();
                expect(projection).to.be.ok();

                setupGeometry();

                var projection = geometry._getProjection();
                expect(projection.srs).to.be(map._getProjection().srs);

                teardownGeometry();
            });
        });


        context('map events listeners',function() {
            it ('onZoomEnd',function() {
                setupGeometry();
                var spy = sinon.spy(geometry,'_onZoomEnd');
                map.on('zoomend',function() {
                    expect(spy.called).to.be.ok();
                    teardownGeometry();
                });
                map.zoomOut();

            });
        });
    }
};

exports = module.exports = CommonSpec;