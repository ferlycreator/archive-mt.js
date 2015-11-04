var symbol = {
    'lineColor':'#000000',
    'lineWidth':1,
    'lineOpacity':0.8,
    'lineDasharray': [],
    'polygonFill': '#ffffff',
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

var rect1 = getRectangle(new maptalks.Coordinate(-215,174.5),169,127);

var rect2 = getRectangle(new maptalks.Coordinate(-215,46.5),168,162);
rect2.setSymbol(symbol);

var rect3 = getRectangle(new maptalks.Coordinate(-47,175.5),124,97);
rect3.setSymbol(symbol);

var rect4 = getRectangle(new maptalks.Coordinate(-47,78.5),124,194);
rect4.setSymbol(symbol);

var rect5 = getRectangle(new maptalks.Coordinate(-215,-114.5),168,66);
rect5.setSymbol(symbol);


function getMarker(coordiante, markerFile) {
    var marker = new maptalks.Marker(coordiante,{'draggable':true});
    //设置图片
    var markerWidth=32,markerHeight=32;
    if(markerFile.indexOf('basin.png')>0) {
        markerWidth=30;
        markerHeight=81;
    }else if(markerFile.indexOf('bed.png')>0) {
        markerWidth=89;
        markerHeight=68;
    }else if(markerFile.indexOf('gas.png')>0) {
        markerWidth=30;
        markerHeight=81;
    }else if(markerFile.indexOf('shower.png')>0) {
        markerWidth=15;
        markerHeight=23;
    }else if(markerFile.indexOf('table.png')>0) {
        markerWidth=23;
        markerHeight=54;
    }else if(markerFile.indexOf('toilet.png')>0) {
        markerWidth=30;
        markerHeight=48;
    }else if(markerFile.indexOf('tv.png')>0) {
        markerWidth=20;
        markerHeight=69;
    }else if(markerFile.indexOf('wardrobe.png')>0) {
        markerWidth=102;
        markerHeight=23;
    }else if(markerFile.indexOf('washing.png')>0) {
        markerWidth=39;
        markerHeight=62;
    }
    var icon = {
        'markerFile': markerFile,
        'markerWidth': markerWidth,
        'markerHeight': markerHeight,
        'markerDx': 0,
        'markerDy': markerHeight/2
    };
    marker.setSymbol(icon);
    //picture属性面板
    var picturePropertyPanel = new PicturePropertyPanel();
    marker.on('click', function(){
        picturePropertyPanel.addTo(marker);
    });
    return marker;
}

var marker1 = getMarker(new maptalks.Coordinate(-169,111.5),'../../business/design/images/icons/bed.png');

var marker2 = getMarker(new maptalks.Coordinate(-57,116.5),'../../business/design/images/icons/tv.png');

var marker3 = getMarker(new maptalks.Coordinate(-27,92.5),'../../business/design/images/icons/shower.png');

var marker4 = getMarker(new maptalks.Coordinate(-30,151.5),'../../business/design/images/icons/toilet.png');

var marker5 = getMarker(new maptalks.Coordinate(60,145.5),'../../business/design/images/icons/washing.png');

var marker6 = getMarker(new maptalks.Coordinate(61,-47.5),'../../business/design/images/icons/gas.png');

var marker7 = getMarker(new maptalks.Coordinate(60,32.5),'../../business/design/images/icons/basin.png');

var marker8 = getMarker(new maptalks.Coordinate(-163,34.5),'../../business/design/images/icons/wardrobe.png');

var marker9 = getMarker(new maptalks.Coordinate(-171,-35.5),'../../business/design/images/icons/bed.png');

var marker10 = getMarker(new maptalks.Coordinate(-60,-84.5),'../../business/design/images/icons/table.png');

var marker11 = getMarker(new maptalks.Coordinate(-65,-147.5),'../../business/design/images/icons/washing.png');

var roomData = [rect1,rect2,rect3,rect4,rect5,
marker1,marker2,marker3,marker4,marker5,marker6,marker7,marker8,marker9,marker10,marker11];
