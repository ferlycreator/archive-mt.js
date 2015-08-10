/*
  sinon(spy): http://sinonjs.org/docs/
  --- chai(assert): http://chaijs.com/api/bdd/
  expect.js: https://github.com/Automattic/expect.js
 */

describe('Map', function () {

  var container;
  var map;
  var tile;
  var center = new Z.Coordinate(118, 32);

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
    var option = {
      center: center
      // zoomLevel: 12
    };
    map = new Z.Map(container, option);
    tile = new Z.TileLayer('tile', {
      crs: 'crs3857',
      urlTemplate: 'http://emap{s}.mapabc.com/mapabc/maptile?&x={X}&y={y}&z={z}',
      subdomains: [0,1,2,3],
    });
  });

  afterEach(function() {
    document.body.removeChild(container);
  });

  describe('#Load', function() {
    //mapready已经被弃用
    /*it('fire mapready after map was loaded', function() {
      map.setBaseTileLayer(tile);
      var spy = sinon.spy();
      map.addEventListener('mapready', spy);
      map.Load();

      expect(spy.called).to.be.ok();
    });*/

    it('throw exception if base tile layer has not been set', function() {
      expect(function() {
        map.Load();
      }).to.throwException(function(e) {
        expect(e).to.be.a(Error);
      });
    });
    //mapready已经被弃用
    /*it('多次调用Load, 只触发一次mapready事件', function() {
      map.setBaseTileLayer(tile);
      var spy = sinon.spy();
      map.addEventListener('mapready', spy);
      map.Load();
      map.Load();

      expect(spy.calledOnce).to.be.ok();
    });*/
  });

  describe('#getCenter', function() {
    it('getCenter返回结果与初始化时指定center相等(Load之前)', function() {
      // map.setBaseTileLayer(tile);

      expect(map.getCenter().x).to.equal(center.x);
      expect(map.getCenter().y).to.equal(center.y);
    });

    it('getCenter返回结果与初始化时指定center相等(Load之后)', function() {
      map.setBaseTileLayer(tile);
      map.Load();

      expect(map.getCenter().x).to.equal(center.x);
      expect(map.getCenter().y).to.equal(center.y);
    });

    it('getCenter返回结果与初始化时指定center相等(setZoomLevel之后)', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      map.setZoomLevel(13);

      expect(map.getCenter().x).to.equal(center.x);
      expect(map.getCenter().y).to.equal(center.y);
    });
  });

  describe('#setCenter', function() {
    it('setCenter后, getCenter返回结果与指定center相等(Load之前)', function() {
      var nc = new Z.Coordinate(119, 32);
      map.setCenter(nc);

      expect(map.getCenter().x).to.equal(nc.x);
      expect(map.getCenter().y).to.equal(nc.y);
    });

    it('setCenter后, getCenter返回结果与指定center相等(Load之后)', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      var nc = new Z.Coordinate(119, 32);
      map.setCenter(nc);

      expect(map.getCenter().x).to.equal(nc.x);
      expect(map.getCenter().y).to.equal(nc.y);
    });

    it('setCenter指定与初始相同值, 不应该触发movestart', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      var spy = sinon.spy();
      map.addEventListener('movestart', spy);
      map.setCenter(center);

      expect(spy.called).to.not.be.ok();
    });

    it('setCenter指定与初始相同值, 不应该触发moveend', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      var spy = sinon.spy();
      map.addEventListener('moveend', spy);
      map.setCenter(center);

      expect(spy.called).to.not.be.ok();
    });

    it('setCenter后, 应该触发movestart', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      var spy = sinon.spy();
      map.addEventListener('movestart', spy);
      var nc = new Z.Coordinate(119, 32);
      map.setCenter(nc);

      expect(spy.called).to.be.ok();
    });

    it('setCenter后, 应该触发moveend', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      var spy = sinon.spy();
      map.addEventListener('moveend', spy);
      var nc = new Z.Coordinate(119, 32);
      map.setCenter(nc);

      expect(spy.called).to.be.ok();
    });
  });

  describe('#Zoom Level', function() {
    it('get (min/max/current)zoom level', function() {
      map.setBaseTileLayer(tile);
      map.Load();

      expect(map.getZoomLevel()).to.be.a('number');
      expect(map.getMinZoomLevel()).to.be.a('number');
      expect(map.getMaxZoomLevel()).to.be.a('number');
    });

    it('set (min/max/current)zoom level', function() {
      map.setBaseTileLayer(tile);
      map.Load();
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
      map.Load();
      var min = 3, max = 14, cur = max + 1;
      map.setMinZoomLevel(min);
      map.setZoomLevel(cur);
      map.setMaxZoomLevel(max);

      expect(map.getZoomLevel()).to.equal(max);
      expect(map.getMinZoomLevel()).to.equal(min);
      expect(map.getMaxZoomLevel()).to.equal(max);
    });

    it('zoom in/out', function() {
      map.setBaseTileLayer(tile);
      map.Load();
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
      var spy = sinon.spy();
      var layer = new Z.SVGLayer('id');
      layer.bind('add', spy);
      map.addLayer(layer);
      expect(spy.called).to.be.ok();
    });

    it('图层加入已载入地图时立即触发loaded事件', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      var spy = sinon.spy();
      var layer = new Z.SVGLayer('id');
      layer.bind('loaded', spy);
      map.addLayer(layer);
      expect(spy.called).to.be.ok();
    });

    it('当地图载入完成时, 如果加入的图层已被删除, 不触发loaded事件', function() {
      var spy = sinon.spy();
      var layer = new Z.SVGLayer('id');
      layer.bind('loaded', spy);
      map.addLayer(layer);
      map.removeLayer(layer);
      map.setBaseTileLayer(tile);
      map.Load();
      expect(spy.called).to.not.be.ok();
    });

    it('当地图载入完成时触发已加入图层的loaded事件', function() {
      var spy = sinon.spy();
      var layer = new Z.SVGLayer('id');
      layer.bind('loaded', spy);
      map.addLayer(layer);
      expect(spy.called).to.not.be.ok();
      map.setBaseTileLayer(tile);
      map.Load();
      expect(spy.called).to.be.ok();
    });
  });

  describe('#removeLayer', function() {
    it('删除图层后getLayer返回null(地图未载入)', function() {
      var layer = new Z.SVGLayer('id');
      map.addLayer(layer);
      map.removeLayer(layer);
      expect(map.getLayer(layer)).to.equal(null);
    });

    it('删除图层后getLayer返回null(地图已载入)', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      var layer = new Z.SVGLayer('id');
      map.addLayer(layer);
      map.removeLayer(layer);
      expect(map.getLayer(layer)).to.equal(null);
    });

    it('删除图层时触发图层的removed事件', function() {
      var spy = sinon.spy();
      var layer = new Z.SVGLayer('id');
      layer.bind('removed', spy);
      map.addLayer(layer);
      map.removeLayer(layer);
      expect(spy.called).to.be.ok();
    });
  });

  describe('#map events', function() {
    it('double click', function() {
      map.setBaseTileLayer(tile);
      map.Load();
      var spy = sinon.spy();
      map.addEventListener('dblclick', spy);
      var mapEventcontainer = container.firstChild.firstChild.nextSibling;
      // $(map.panels.mapPlatform).dblclick();
      // effroi.mouse.dblclick(map.panels.mapPlatform);
      happen.dblclick(mapEventcontainer);
      expect(spy.called).to.be.ok();
    });
  });

});
