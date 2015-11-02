/*
 sinon(spy): http://sinonjs.org/docs/
 --- chai(assert): http://chaijs.com/api/bdd/
 expect.js: https://github.com/Automattic/expect.js
 */

describe('#Map', function () {

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
            urlTemplate: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            subdomains: [1, 2, 3]
        });
    });

    afterEach(function() {
        document.body.removeChild(container);
    });

    describe('#getCenter', function() {
        it('getCenter返回结果与初始化时指定center相等(Load之前)', function() {

            expect(map.getCenter()).to.nearCoord(center);
        });

        it('getCenter返回结果与初始化时指定center相等(Load之后)', function() {
            map.setBaseTileLayer(tile);

            expect(map.getCenter()).to.nearCoord(center);
        });

        it('getCenter返回结果与初始化时指定center相等(setZoomLevel之后)', function() {
            map.setBaseTileLayer(tile);
            map.setZoomLevel(13);

            expect(map.getCenter()).to.nearCoord(center);
        });
    });

    describe('#setCenter', function() {
        it('setCenter后, getCenter返回结果与指定center相等(Load之前)', function() {
            var nc = new Z.Coordinate(119, 32);
            map.setCenter(nc);

            expect(map.getCenter()).to.eql(nc);
        });

        it('setCenter后, getCenter返回结果与指定center相等(Load之后)', function() {
            map.setBaseTileLayer(tile);

            var nc = new Z.Coordinate(122, 32);
            map.setCenter(nc);

            expect(map.getCenter()).to.nearCoord(nc);
        });

        it('setCenter设定中心点为当前地图中心点, 不应该触发movestart', function() {
            map.setBaseTileLayer(tile);

            var spy = sinon.spy();
            map.on('movestart', spy);
            map.setCenter(center);

            expect(spy.called).to.not.be.ok();
        });

        it('setCenter设定中心点为当前地图中心点, 应该触发moveend', function() {
            map.setBaseTileLayer(tile);

            var spy = sinon.spy();
            map.on('moveend', spy);
            map.setCenter(center);

            expect(spy.called).to.be.ok();
        });

        it('setCenter设定中心点不同于当前地图中心点, 应该触发movestart', function() {
            map.setBaseTileLayer(tile);

            var spy = sinon.spy();
            map.on('movestart', spy);
            var nc = new Z.Coordinate(119, 32);
            map.setCenter(nc);

            expect(spy.called).to.be.ok();
        });

        it('setCenter设定中心点不同于当前地图中心点, 应该触发moveend', function() {
            map.setBaseTileLayer(tile);

            var spy = sinon.spy();
            map.on('moveend', spy);
            var nc = new Z.Coordinate(119, 32);
            map.setCenter(nc);

            expect(spy.called).to.be.ok();
        });
    });

    describe('#Zoom Level', function() {
        it('get (min/max/current)zoom level', function() {
            map.setBaseTileLayer(tile);

            expect(map.getZoomLevel()).to.eql(17);
            expect(map.getMinZoomLevel()).to.be.a('number');
            expect(map.getMaxZoomLevel()).to.be.a('number');
        });

        it('set (min/max/current)zoom level', function() {
            map.setBaseTileLayer(tile);

            var min = 3, max = 14, cur = max + 1;
            map.setMinZoomLevel(min);
            map.setMaxZoomLevel(max);
            map.setZoomLevel(cur);

            expect(map.getZoomLevel()).to.equal(max);
            expect(map.getMinZoomLevel()).to.equal(min);
            expect(map.getMaxZoomLevel()).to.equal(max);
        });

        it('set max zoom level to less than current zoom level', function() {
            map.setBaseTileLayer(tile);

            var max = 14, cur = max + 1;
            map.setZoomLevel(cur);
            map.setMaxZoomLevel(max);

            expect(map.getZoomLevel()).to.equal(max);
            expect(map.getMaxZoomLevel()).to.equal(max);
        });

        it('zoom in/out', function() {
            map.setBaseTileLayer(tile);

            var min = 3, max = 14, cur = 8;
            map.setMinZoomLevel(min);
            map.setMaxZoomLevel(max);
            map.setZoomLevel(cur);

            expect(map.zoomIn().getZoomLevel()).to.equal(cur + 1);
            expect(map.zoomOut().getZoomLevel()).to.equal(cur);
        });
    });

    describe('#setBaseTileLayer', function() {
        it('set base tile');
    });

    describe('#addLayer', function() {
        it('图层加入地图时触发add事件', function() {
            // var spy = sinon.spy();
            // var layer = new Z.VectorLayer('id');
            // layer.on('add', spy);
            // map.addLayer(layer);
            // expect(spy.called).to.be.ok();
        });

        it('图层加入已载入地图时立即触发loaded事件', function() {
            // map.setBaseTileLayer(tile);

            // var spy = sinon.spy();
            // var layer = new Z.VectorLayer('id');
            // layer.on('loaded', spy);
            // map.addLayer(layer);
            // expect(spy.called).to.be.ok();
        });

        it('当地图载入完成时, 如果加入的图层已被删除, 不触发loaded事件', function() {
            // var spy = sinon.spy();
            // var layer = new Z.VectorLayer('id');
            // layer.on('loaded', spy);
            // map.addLayer(layer);
            // map.removeLayer(layer);
            // map.setBaseTileLayer(tile);

            // expect(spy.called).to.not.be.ok();
        });

        it('当地图载入完成时触发已加入图层的loaded事件', function() {
            // var spy = sinon.spy();
            // var layer = new Z.VectorLayer('id');
            // layer.on('loaded', spy);
            // map.addLayer(layer);
            // expect(spy.called).to.not.be.ok();
            // map.setBaseTileLayer(tile);

            // expect(spy.called).to.be.ok();
        });
    });

    describe('#removeLayer', function() {
        it('删除图层后getLayer返回null(地图未载入)', function() {
            var layer = new Z.VectorLayer('id');
            map.addLayer(layer);
            map.removeLayer(layer);

            expect(map.getLayer(layer)).to.equal(null);
        });

        it('删除图层后getLayer返回null(地图已载入)', function() {
            map.setBaseTileLayer(tile);

            var layer = new Z.VectorLayer('id');
            map.addLayer(layer);
            map.removeLayer(layer);

            expect(map.getLayer(layer)).to.equal(null);
        });

        it('删除图层时触发图层的removed事件', function() {
            // var spy = sinon.spy();
            // var layer = new Z.VectorLayer('id');
            // layer.on('removed', spy);
            // map.addLayer(layer);
            // map.removeLayer(layer);

            // expect(spy.called).to.be.ok();
        });
    });

    describe('events', function() {

        it('double click', function() {
            map.setBaseTileLayer(tile);

            var spy = sinon.spy();
            map.on('dblclick', spy);

            happen.dblclick(container);

            expect(spy.called).to.be.ok();
        });

        it("mousedown following mouseup on map should not trigger move events", function() {
            map.setBaseTileLayer(tile);

            var spy = sinon.spy();
            map.on('movestart moving moveend', spy);

            happen.mousedown(container);
            happen.mouseup(container);

            expect(spy.called).to.not.be.ok();
        });

    });

});
