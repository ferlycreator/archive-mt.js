describe('VectorSpec', function() {

  var container;
  var map;
  var tile;
  var center = new Z.Coordinate(118, 32);
  var layer;

  beforeEach(function() {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
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
    map.setBaseTileLayer(tile);
    map.Load();
    layer = new Z.SVGLayer('id');
    map.addLayer(layer);
  });

  afterEach(function() {
    map.removeLayer(layer);
    document.body.removeChild(container);
  });

  describe('events', function() {
    it('fires click event when clicked', function() {
      var spy = sinon.spy();
      var vector = new Z.Circle(center, 1);
      vector.bind('click', spy);
      layer.addGeometry(vector);
      var painter = vector.getPainter();
      var paper = painter.getVectorPaper();
      paper.forEach(function(el) {
        happen.click(el);
      });

      expect(spy.called).to.be.ok();
    });
  });

});
