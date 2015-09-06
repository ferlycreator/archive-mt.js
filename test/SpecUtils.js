function genAllTypeGeometries() {
    var center = new Z.Coordinate(118.846825, 32.046534);
    var w = 200, h = 200, r = 200;
    var geometries = [
        new Z.Marker(center),
        new Z.Circle(center, r),
        new Z.Ellipse(center, w, h),
        new Z.Rectangle(center, w, h),
        new Z.Sector(center, r, 90, 180),
        new Z.Polyline([
            {x: 121.111, y: 30.111},
            {x: 121.222, y: 30.222}
        ]),
        new Z.Polygon([
            [
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]
        ]),
        new Z.MultiPolyline([
            [
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222}
            ],
            [
                {x: 121.333, y: 30.333},
                {x: 121.444, y: 30.444}
            ]
        ]),
        new Z.MultiPolygon([
            [
                [
                    {x: 121.111, y: 30.111},
                    {x: 121.222, y: 30.222},
                    {x: 121.333, y: 30.333}
                ]
            ],
            [
                [
                    {x: 121.444, y: 30.444},
                    {x: 121.555, y: 30.555},
                    {x: 121.666, y: 30.666}
                ]
            ]
        ])
    ];
    return geometries;
}

/*exports = module.exports = {
    genAllTypeGeometries: genAllTypeGeometries
};*/

expect.Assertion.prototype.nearCoord = function(expected, delta) {
    delta = delta || 1e-6;
    expect(this.obj.x).to.be.within(expected.x - delta, expected.x + delta);
    expect(this.obj.y).to.be.within(expected.y - delta, expected.y + delta);
};

/**
 * 共同的地图初始化方法
 * @param  {Coordinate} center 中心点坐标
 * @return {Object}        初始化后的容器坐标
 */
function commonSetupMap(center) {
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
}

/**
 * 共同的地图销毁方法
 */
function commonTearDownMap() {

}

/**
 * geometry事件测试类
 * testSVGEvents测试SVG类图层上的事件响应
 * testCanvasEvents测试Canvas类图层上的事件响应
 * @type {Object}
 */
var GeoEventsTester = {
    //happen 支持的事件种类
    eventsToTest : 'click mousedown mouseup dblclick', //mousemove

    testSVGEvents:function(geometry, map) {
        var layer = new Z.VectorLayer('event_test_layer_svg');
        map.addLayer(layer);
        if (!this.spy) {
            this.spy = sinon.spy(this,'_eventCallBack');
        }
        var vector = geometry;
        vector.on(this.eventsToTest, this._eventCallBack);
        layer.addGeometry(vector);
        var dom = vector._getPainter().getVectorDom();
        this._verifyGeometryEvents(dom);
    },

    testCanvasEvents:function(vector, map, testPoint) {
        var layer = new Z.VectorLayer('event_test_layer_canvas',{'render':'canvas'});
        map.addLayer(layer);
        if (!this.spy) {
            this.spy = sinon.spy(this,'_eventCallBack');
        }
        vector.on(this.eventsToTest, this._eventCallBack );
        layer.addGeometry(vector);
        var point = map.coordinateToScreenPoint(testPoint);
        var dom = Z.Render.Canvas.Base.getBaseCanvasRender(map).
                    getCanvasContainer();
        var domPosition = Z.DomUtil.getPageCoordinate(dom);
        point.add(domPosition);
        this._verifyGeometryEvents(dom,
            {
            'screenX':point.left,
            'screenY':point.top,
            'clientX':point.left,
            'clientY':point.top
            });
    },

    _eventCallBack:function(param) {
        expect(param).to.be.ok();
        expect(param.type).to.be.ok();
        expect(param.target).to.be.ok();
        expect(param.pixel).to.be.ok();
        expect(param.coordinate).to.be.ok();
    },

    _verifyGeometryEvents:function(dom,options) {
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
