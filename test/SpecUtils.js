function genAllTypeGeometries() {
    var center = new Z.Coordinate(118.846825, 32.046534);
    var w = 200, h = 200, r = 200;
    return [
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
    // return geometries;
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
        enableCartoCSS: false,
        zoomLevel: 17,
        center: center
    };
    var map = new Z.Map(container, option);
    var tile = new Z.TileLayer('tile', {
        tileInfo: 'web-mercator',
        urlTemplate: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        subdomains: [1, 2, 3]
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


var GeoSymbolTester = {
    markerSymbols : [
            {
                "marker-placement":"point", //point | line | interior
                "marker-file"   : "images/marker.png",
                //设定marker-file后, 只有下面的属性起作用
                "marker-width"  : 20,
                "marker-height" : 20,
                "marker-opacity": 1,
                //两个cartocss里没有的扩展属性, 用来标注相对中心点的像素距离
                "marker-dx"     : 0, //<-------
                "marker-dy"     : 0  //<-------
            },
            {
                "marker-placement":"point", //point | line | interior

                //marker-type中定义了若干cartoCSS中没有的属性值
                "marker-type": "ellipse", //<----- ellipse | triangle | square | bar等,默认ellipse
                "marker-opacity": 1,
                "marker-fill": "#ff0000",
                "marker-fill-opacity": 1,
                "marker-line-color": "#0000ff",
                "marker-line-width": 1,
                "marker-line-opacity": 1,
                "marker-width": 30,
                "marker-height": 30,

                "marker-dx": 0,
                "marker-dy": 0
            },
            {
                "text-placement"    : "point", // point | vertex | line | interior

                "text-name"         : "文本标注：[marker_name]",
                "text-face-name"    : "arial",
                "text-size"         : 12,
                "text-fill"         : "#550033",
                "text-opacity"      : 1,
                "text-halo-fill"  : "#fff",
                "text-halo-radius": 0,

                "text-dx"           : 0,
                "text-dy"           : 0,

                "text-horizontal-alignment" : "middle", //left | middle | right | auto
                "text-vertical-alignment"   : "middle",   // top | middle | bottom | auto
                "text-align"                : "left" //left | right | center | auto
            },
            {
                "shield-placement"  : "point", // point | vertex | line | interior

                "shield-file"       : "images/marker.png",

                "shield-name"       : "文本标注：[marker_name]",
                "shield-face-name"  : "arial",
                "shield-size"       :  12,
                "shield-fill"       : "#550033",
                "shield-opacity"    :  1,
                "shield-text-opacity": 1,
                "shield-halo-fill"  : "#fff",
                "shield-halo-radius": 0,

                "shield-dx"         :  0,
                "shield-dy"         :  0,
                "shield-text-dx"    :  0,
                "shield-text-dy"    :  0,

                "shield-horizontal-alignment"   : "middle", //left | middle | right | auto
                "shield-vertical-alignment"     : "middle",   // top | middle | bottom | auto
                "shield-justify-alignment"      : "left" //left | right | center | auto
            }
    ],

    lineAndFill: {
                "line-pattern-file" : "images/marker.png",
                "line-color"        : "#f00",
                "line-width"        : 5,
                "line-opacity"      : 1,
                "line-join"         : "miter", //round bevel
                "line-cap"          : "round", //butt square
                "line-dasharray"    : [20, 5, 20],
                "polygon-pattern-file"  : "images/marker.png",
                "polygon-fill"          : "#f00",
                "polygon-opacity"       : 1
            },

    testGeoSymbols:function(geometry, map) {
        // return;
        geometry.remove();
        var layer = new maptalks.VectorLayer("symboltest_layer_svg");
        map.addLayer(layer);
        layer.addGeometry(geometry);
        var i;
        for (i = this.markerSymbols.length - 1; i >= 0; i--) {
            geometry.setSymbol(this.markerSymbols[i]);
        }
        geometry.setSymbol(this.lineAndFill);
        geometry.remove();
        Z.TESTMODE=true;
        layer = new maptalks.VectorLayer("symboltest_layer_canvas",{"render":"canvas"});
        map.addLayer(layer);
        layer.addGeometry(geometry);
        for (i = this.markerSymbols.length - 1; i >= 0; i--) {
            geometry.setSymbol(this.markerSymbols[i]);
        }
        geometry.setSymbol(this.lineAndFill);
    }
};

/**
 * geometry事件测试类
 * testSVGEvents测试SVG类图层上的事件响应
 * testCanvasEvents测试Canvas类图层上的事件响应
 * @type {Object}
 */
var GeoEventsTester = function() {
};

GeoEventsTester.prototype = {
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
        var dom = vector._getPainter().getSvgDom()[0];
        this._verifyGeometryEvents(dom);
    },

    testCanvasEvents:function(vector, map, testPoint) {
        var layer = new Z.VectorLayer('event_test_layer_canvas',{'render':'canvas'});
        if (!layer.isCanvasRender()) {
            return;
        }
        map.addLayer(layer);
        if (!this.spy) {
            this.spy = sinon.spy(this,'_eventCallBack');
        }
        vector.on(this.eventsToTest, this._eventCallBack );
        layer.addGeometry(vector);
        var point = map.coordinateToContainerPoint(testPoint);
        var dom = map._panels.mapPlatform;
        var domPosition = Z.DomUtil.getPageCoordinate(dom);
        point._add(domPosition);
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
        expect(param.containerPoint).to.be.ok();
        expect(param.coordinate).to.be.ok();
        expect(param.domEvent).to.be.ok();
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
        // spy.reset();
    }

};
