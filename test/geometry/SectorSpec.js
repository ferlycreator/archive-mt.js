describe('SectorSpec', function() {

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

});
