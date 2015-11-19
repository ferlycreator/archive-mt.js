CanvasData = {
    addTo: function(layer) {
        this.layer = layer;
        this/*._addLabel()*/
            ._addPictureMarker()
            ._addVectorMarker()
//            ._addShieldMarker()
            ._addPolyline()
            ._addPolygon()
            ._addMultiPoint()
            ._addMultiPolyline()
            ._addMultiPolygon();
    },
    _addLabel: function() {
       var coordinate = new maptalks.Coordinate(121.49765976196257,31.25440949809333);
       var option = {
           'symbol': {
               'lineColor': '#ffffff',
               'lineWidth': 1,
               'lineOpacity': 0.9,
               'lineDasharray': null,
               'fill': '#4e98dd',
               'fillOpacity': 0.9,
               'textFaceName': 'arial',
               'textSize': 16,
               'textFill': '#00ff00',
               'textWrapWidth': 250
           },
           'target': coordinate,
           'draggable': true,
           'content': '#########CANVAS##########'
       };
       //创建label
       var label = new maptalks.Label(option).addTo(this.layer);
       return this;
    },
    _addPictureMarker: function() {
         var coordinate = new maptalks.Coordinate(121.49645813232394,31.251841364503086);
        //设置图片
        var icon = {
            'markerFile': '../../images/marker.png',
            'markerWidth': 22,
            'markerHeight': 30,
            'markerDx': 0,
            'markerDy' :0
        };
        //创建点对象
        var marker = new maptalks.Marker(coordinate,{'draggable':true});
        //设置点样式
        marker.setSymbol(icon);
        //将点添加到Layer
        this.layer.addGeometry(marker);
        return this;
    },
    _addVectorMarker: function() {
        //创建点的坐标对象
        var coordinate = new maptalks.Coordinate(121.49654396301244,31.249640051539124);
        //设置矢量配置
        var icon = {
            'markerType': 'pin',
            'markerOpacity': 0.5,
            'markerFillOpacity': 1,
            'markerLineColor': '#0000ff',
            'markerLineWidth': 5,
            'markerLineOpacity': 1,
            'markerPlacement': 'point',
            'markerWidth': 30,
            'markerHeight': 30,
            'markerFill': '#ff0000',
            'markerDx': 0,
            'markerDy': 0
        };
        /**
        * marker-type 说明：
        * ellipse ：圆形；triangle ：三角形； cross ：十字； diamond ：菱形； square ：正方形；x/X：X形；bar：柱状图
        */
        //创建点对象
        var marker = new maptalks.Marker(coordinate, {symbol:icon,draggable:true});
        //设置点样式
        // marker.setSymbol(icon);
        //将点添加到Layer
        this.layer.addGeometry(marker);
        return this;
    },
    _addShieldMarker: function() {
        //创建点的坐标对象
        var coordinate = new maptalks.Coordinate(121.4924670053099,31.246851648109903);
        //设置盾标配置
        var icon = {

            "polygonFill": "#ff0000",
            "polygonOpacity": 0.5,
            "shieldPlacement"  : "vertex",

            "shieldFile"      :  "/images/marker.png",
            "shieldOpacity"    :  1,
            "shieldDx"         :  0,
            "shieldDy"         :  0,

            "shieldName"       : "[name]-[addr]",
            "shieldFaceName"  : "arial",
            "shieldSize"       :  10,
            "shieldFill"       : "#ff0000",
            "shieldTextOpacity": 1,

            "shieldTextDx"    :  0,
            "shieldTextDy"    :  0,

            "shieldHorizontalAlignment"   : "middle", //left | middle | right | auto
            "shieldVerticalAlignment"     : "middle",   // top | middle | bottom | auto
            "shieldJustifyAlignment"      : "left"
        };
        //创建点对象
        var marker = new maptalks.Marker(coordinate,{'draggable':true});
        marker.setProperties({
            'name':'上海大厦',
            'addr': '北苏州路20号'
        });
        //设置点样式
        marker.setSymbol(icon);
        var polygon = new maptalks.Polygon([[
                                            [121.49250992065416,31.2438063239855],
                                            [121.49435528045635,31.244650218819675],
                                            [121.49693020111052,31.24586101127991]
                                                ]], {'symbol':icon,'draggable':true});
        polygon.setProperties({
            'name':'黄浦江',
            'addr': '码头'
        });
        //将点添加到Layer
        this.layer.addGeometry([marker,polygon]);
        return this;
    },
    _addPolyline: function() {
        //创建线对象
        var polyline = new maptalks.Polyline(
            //线端点坐标数组
            [new maptalks.Coordinate(121.49285324340805,31.241384670857062),
            new maptalks.Coordinate(121.49607189422579,31.241458055197487),
            new maptalks.Coordinate(121.4977026773068,31.238449250489257),
            new maptalks.Coordinate(121.49976261383017,31.23914642108648)],{draggable: true});
        //设置线样式
        var polylineSymbol = {
            'lineColor' : '#ff00ff',
            'lineWidth' : 5,
            'lineDasharray' : [20,10,5,5,5,10],//线形
            'lineOpacity' : 1
        };
        polyline.setSymbol(polylineSymbol);
        //将线添加到Layer
        this.layer.addGeometry(polyline);
        return this;
    },
    _addPolygon: function() {
        //创建面对象
        var polygon = new maptalks.Polygon(
            //面端点坐标数组
            [[new maptalks.Coordinate(121.49499901061989,31.23610084851633),
            new maptalks.Coordinate(121.49409778839093,31.23404594890147),
            new maptalks.Coordinate(121.49971969848593,31.23419272892759),
            new maptalks.Coordinate(121.50032051330524,31.235954071454643),
            new maptalks.Coordinate(121.49765976196257,31.23654117833312)]
            ],{draggable: true});
        //设置面样式
        var polygonSymbol = {
            'lineColor' : '#0000ff',
            'lineWidth' : 2,
            'lineDasharray' : [20,10,5,5,5,10],//线形
            'lineOpacity' : 1,
            // 'polygon-fill' : '#ff00ff',
            'polygonFill' : 'rgb(255, 0, 255)',
            'polygonOpacity' : 0.8
        };
        polygon.setSymbol(polygonSymbol);
        //将面添加到Layer
        this.layer.addGeometry(polygon);
        return this;
    },
    _addMultiPoint: function() {
        //创建点的坐标对象
        var coordinate1 = new maptalks.Coordinate(121.50538452392516,31.250850780020492);
        //创建点对象
        var marker1 = new maptalks.Marker(coordinate1);
        //创建点的坐标对象
        var coordinate2 = new maptalks.Coordinate(121.5101910424796,31.250850780020492);
        //创建点对象
        var marker2 = new maptalks.Marker(coordinate1);
        //创建点的坐标对象
        var coordinate3 = new maptalks.Coordinate(121.50731571441578,31.248172481050972);
        var marker3 = new maptalks.Marker(coordinate1);
        var markers = [marker1,marker2,marker3];
        //设置矢量配置
        var icon = {
            'markerType': 'pin',
            'markerOpacity': 0.5,
            'markerFillOpacity': 1,
            // 'marker-line-color': '#0000ff',
            'markerLineWidth': 5,
            'markerLineOpacity': 1,
            'markerPlacement': 'point',
            'markerWidth': 50,
            'markerHeight': 40,
            // 'marker-fill': '#ff0000',
            'markerDx': 0,
            'markerDy': 0
        };
        var multiPoint = new maptalks.MultiPoint(markers,{symbol:icon,draggable:true});
        this.layer.addGeometry(multiPoint);
        return this;
    },
    _addMultiPolyline: function() {
        var polyline1 = new maptalks.Polyline([new maptalks.Coordinate(121.50512703185969,31.249016336868696),
                        new maptalks.Coordinate(121.50491245513852,31.243402719442674)]);
        var polyline2 = new maptalks.Polyline([new maptalks.Coordinate(121.50795944457934,31.24923647192869),
                        new maptalks.Coordinate(121.5081740213005,31.243586176266874)]);
        var polyline3 = new maptalks.Polyline([new maptalks.Coordinate(121.51079185729893,31.249750118406244),
                    new maptalks.Coordinate(121.51079185729893,31.24432)]);
        var polylines = [polyline1,polyline2,polyline3];
         //设置线样式
        var polylineSymbol = {
            'lineColor' : '#ff00ff',
            'lineWidth' : 5,
            'lineDasharray' : [20,10,5,5,5,10],//线形
            'lineOpacity' : 1
        };
        var multiPolyline = new maptalks.MultiPolyline(polylines,{symbol:polylineSymbol,draggable:true});
        this.layer.addGeometry(multiPolyline);
        return this;
    },
    _addMultiPolygon: function() {
        var polygon1 = new maptalks.Polygon([[new maptalks.Coordinate(121.50435455566344,31.239073034950138),
                        new maptalks.Coordinate(121.5037108254999,31.23712828156291),
                        new maptalks.Coordinate(121.50658615356373,31.23621093116292),
                        new maptalks.Coordinate(121.50843151336592,31.23657787239187),
                        new maptalks.Coordinate(121.50628574615406,31.240283898909293)]]);

        var polygon2 = new maptalks.Polygon([[new maptalks.Coordinate(121.51053436523351,31.23811900998942),
                        new maptalks.Coordinate(121.51349552398584,31.23984358653828),
                        new maptalks.Coordinate(121.51066311126625,31.239733508124807),
                        new maptalks.Coordinate(121.51040561920084,31.238962955638705)]]);
        var polygons = [polygon1,polygon2];
         //设置面样式
        var polygonSymbol = {
            'lineColor' : '#0000ff',
            'lineWidth' : 2,
            'lineDasharray' : null,//线形
            'lineOpacity' : 1,
            'polygon-fill' : '#ff00ff',
            'polygonFill' : 'rgb(255, 0, 255)',
            'polygonOpacity' : 0.8
        };
        var multiPolygon = new maptalks.MultiPolygon(polygons,{symbol:polygonSymbol,draggable:true});
        this.layer.addGeometry(multiPolygon);
        return this;
    }

};
