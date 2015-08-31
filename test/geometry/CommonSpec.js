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

    }
};
