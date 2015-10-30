var symbol = {
    'lineColor':'#0f0',
    'lineWidth':3,
    'lineOpacity':1,
    'lineDasharray': [],
    'polygonFill': 'rgb(201, 156, 131)',
    'polygonOpacity': 0.6
};

function getRectangle(coordinate, width, height) {
    var rect = new maptalks.Rectangle(coordinate, width, height);
    rect.setSymbol(symbol);
    //多边形属性面板
    var polygonPropertyPanel = new PolygonPropertyPanel();
    //绑定激活多边形属性面板事件
    rect.on('click', function(){
        polygonPropertyPanel.addTo(rect);
    });
    return rect;
}

var rect1 = getRectangle(new maptalks.Coordinate(-289,207),194,136);

var rect2 = getRectangle(new maptalks.Coordinate(-93,206),186,136);
rect2.setSymbol(symbol);

var rect3 = getRectangle(new maptalks.Coordinate(-96,240),188,33);
rect3.setSymbol(symbol);

var rect4 = getRectangle(new maptalks.Coordinate(-291,-88),98,76);
rect4.setSymbol(symbol);

var rect5 = getRectangle(new maptalks.Coordinate(-190,-88),159,76);
rect5.setSymbol(symbol);

var rect6 = getRectangle(new maptalks.Coordinate(-289,69),259,155);
rect6.setSymbol(symbol);


function getMarker(coordiante, icon) {
    var marker = new maptalks.Marker(coordiante,{'draggable':true});
    var icon = {
        'markerFile': icon,
        'markerWidth': 32,
        'markerHeight': 32,
        'markerDx': 0,
        'markerDy': 16
    };
    marker.setSymbol(icon);
    //picture属性面板
    var picturePropertyPanel = new PicturePropertyPanel();
    marker.on('click', function(){
        picturePropertyPanel.addTo(marker);
    });
    return marker;
}

var marker1 = getMarker(new maptalks.Coordinate(-109,-120),'../../business/design/images/icons/basin.png');

var marker2 = getMarker(new maptalks.Coordinate(-273,-106),'../../business/design/images/icons/closet.png');

var marker3 = getMarker(new maptalks.Coordinate(-209,-141),'../../business/design/images/icons/bathroom.png');

var marker4 = getMarker(new maptalks.Coordinate(-209,137),'../../business/design/images/icons/bed.png');

var marker5 = getMarker(new maptalks.Coordinate(-10,145),'../../business/design/images/icons/bed.png');

var marker6 = getMarker(new maptalks.Coordinate(-77,3),'../../business/design/images/icons/table.png');

var marker7 = getMarker(new maptalks.Coordinate(-268,0),'../../business/design/images/icons/tv.png');

var marker8 = getMarker(new maptalks.Coordinate(-272,93),'../../business/design/images/icons/drawer.png');

var marker9 = getMarker(new maptalks.Coordinate(73,226),'../../business/design/images/icons/pan.png');

var roomData = [rect1,rect2,rect3,rect4,rect5,rect6,
marker1,marker2,marker3,marker4,marker5,marker6,marker7,marker8,marker9];
