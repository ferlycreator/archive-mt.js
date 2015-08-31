var geometry_events = 'click mousedown mousemove mouseup dblclick';

function testGeometryEvents(dom,spy,options) {
    var events = geometry_events.split(' ');

    for (var i=0, len=events.length;i<len;i++) {
        if (options) {
            happen[events[i]](dom,options);
        } else {
            happen[events[i]](dom);
        }

        expect(spy.called).to.be.ok();
    }

}

describe('CircleSpec', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;

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
        map.setBaseTileLayer(tile);

    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    /*describe('svg events', function() {
        it('fires geometry events and listened', function() {
            layer = new Z.VectorLayer('id');
            map.addLayer(layer);
            var spy = sinon.spy();
            var vector = new Z.Circle(center, 1);
            vector.on(geometry_events, spy);
            layer.addGeometry(vector);
            var dom = vector._getPainter().getVectorDom();
            testGeometryEvents(dom,spy);
        });
    });*/

    describe('canvas events', function() {
        it('fires geometry events and listened', function() {
            layer = new Z.VectorLayer('id',{'render':'canvas'});
            map.addLayer(layer);
            var spy = sinon.spy();
            var vector = new Z.Circle(center, 100);
            vector.on(geometry_events, spy);
            layer.addGeometry(vector);
            var point = map.coordinateToScreenPoint(vector.getCenter());
            var dom = Z.Render.Canvas.Base.getBaseCanvasRender(map).getCanvasContainer();

            testGeometryEvents(dom,spy,{'screenX':point.left, 'screenY':point.top, 'clientX':point.left, 'clientY':point.top});
        });
    });

});
