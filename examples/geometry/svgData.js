SvgData = {
    addTo: function(layer) {
        this.layer = layer;
        this
        ._addLabel()
        ._addPictureMarker()
        ._addSVGMarker()
        ._addTextMarker()
        ._addVectorMarker()
        ._addShieldMarker()
        ._addPolyline()
        ._addPolygon()
        ._addMultiPoint()
        ._addMultiPolyline()
        ._addMultiPolygon()
        ._addCircle()
        ._addEllipse()
        ._addRectangle()
        ._addSector();
    },
    _addLabel: function() {
       var coordinate = new maptalks.Coordinate(121.4718247247321,31.254666307610087);
       var option = {
           'symbol': {
               'markerFillOpacity': 0.3,
               'textFaceName': 'Arial monospace',
               'textSize': 16,
               'textFill': '#ff0000'/*,
               'textWrapWidth': 250*/
           },
           'draggable': true
       };
       //创建label
       var label = new maptalks.Label('###########中文SVG############', coordinate, option).addTo(this.layer);
       return this;
    },
    _addPictureMarker: function() {
         var coordinate = new maptalks.Coordinate(121.47195347076484,31.251107599217637);
        //设置图片
        var icon = {
            'markerFile': '../../images/resource/marker.png',
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
    _addSVGMarker: function() {
         var coordinate = new maptalks.Coordinate(121.47395347076484,31.251107599217637);
        //设置图片
        var icon = {
            'markerFile': 'ph.svg',
            'markerWidth': 26,
            'markerHeight': 34,
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
    _addTextMarker: function() {
         var coordinate = new maptalks.Coordinate(121.4718247247321,31.256666307610087);
        //设置图片
        var icon = {
            "text-placement"    : "point", // point | vertex | line | interior

            "text-name"         : "I'm a text marker",
            "text-face-name"    : "arial",
            "text-size"         : "20",
            "text-fill"         : "#550033",
            "text-opacity"      : 1,
            "text-halo-fill"  : "#fff",
            "text-halo-radius": 0,

            "text-dx"           : 0,
            "text-dy"           : 0,

            "text-horizontal-alignment" : "middle", //left | middle | right | auto
            "text-vertical-alignment"   : "middle",   // top | middle | bottom | auto
            "text-align"                : "left" //left | right | center | auto
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
        var coordinate = new maptalks.Coordinate(121.4718247247321,31.249456606475498);
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
        var coordinate = new maptalks.Coordinate(121.47165306335494,31.247438687253478);
        //设置盾标配置
        var icon = {

            "polygonFill": "#ff0000",
            "polygonOpacity": 0.5,
            "shieldPlacement"  : "vertex",

            "shieldFile"      :  "/images/resource/marker.png",
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
                                            [121.47092350250314,31.245420724908662],
                                            [121.47113807922437,31.243439410836015],
                                            [121.47173889404368,31.241091132925334]
                                                ]], {'symbol':icon,'draggable':true});
        polygon.setProperties({
            'name':'地铁线',
            'addr': '02'
        });
        //将点添加到Layer
        this.layer.addGeometry([marker,polygon]);
        return this;
    },
    _addPolyline: function() {
        //创建线对象
        var polyline = new maptalks.Polyline(
            //线端点坐标数组
            [new maptalks.Coordinate(121.46646030670178,31.23918311413328),
            new maptalks.Coordinate(121.47075184112549,31.240210513656688),
            new maptalks.Coordinate(121.47431381469713,31.23665126046662),
            new maptalks.Coordinate(121.47723205810522,31.239403272114743)],{draggable: true});
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
            [[new maptalks.Coordinate(121.46740444427589,31.23378908330701),
            new maptalks.Coordinate(121.46736152893162,31.229899318952306),
            new maptalks.Coordinate(121.47718914276177,31.227550704457773),
            new maptalks.Coordinate(121.48053653961223,31.234266118855157),
            new maptalks.Coordinate(121.47264011627273,31.235220182725687)]
            ],{draggable: true});
        //设置面样式
        var polygonSymbol = {
            'lineColor' : '#0000ff',
            'lineWidth' : 2,
            'lineDasharray' : [20,10,5,5,5,10],//线形
            'lineOpacity' : 1,
            // 'polygon-fill' : '#ff00ff',
            'polygonFill' : 'rgb(0, 0, 255)',
            'polygonOpacity' : 0.8
        };
        polygon.setSymbol(polygonSymbol);
        //将面添加到Layer
        this.layer.addGeometry(polygon);
        return this;
    },
    _addMultiPoint: function() {
        //创建点的坐标对象
        var coordinate1 = new maptalks.Coordinate(121.4775324655156,31.249933562899635);
        //创建点对象
        var marker1 = new maptalks.Marker(coordinate1);
        //创建点的坐标对象
        var coordinate2 = new maptalks.Coordinate(121.48216732269313,31.248612754592397);
        //创建点对象
        var marker2 = new maptalks.Marker(coordinate2);
        //创建点的坐标对象
        var coordinate3 = new maptalks.Coordinate(121.47804744964641,31.2473653075601);
        var marker3 = new maptalks.Marker(coordinate3);
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
        var polyline1 = new maptalks.Polyline([
                        new maptalks.Coordinate(121.47693165069629,31.24758544646915),
                        new maptalks.Coordinate(121.47658832794238,31.244503455042373)]);
        var polyline2 = new maptalks.Polyline([
                        new maptalks.Coordinate(121.47890575653115,31.247475377078782),
                        new maptalks.Coordinate(121.47903450256388,31.24417323570951)]);
        var polyline3 = new maptalks.Polyline([
                        new maptalks.Coordinate(121.48045070892368,31.247475377078782),
                        new maptalks.Coordinate(121.48040779357945,31.244723600622805)]);
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
        var polygon1 = new maptalks.Polygon([[new maptalks.Coordinate(121.4813948464969,31.237898849014773),
                        new maptalks.Coordinate(121.4813948464969,31.235036709652668),
                        new maptalks.Coordinate(121.48414142852805,31.235036709652668),
                        new maptalks.Coordinate(121.48414142852805,31.23723836301229),
                        new maptalks.Coordinate(121.48251064544704,31.237275056800232)]]);

        var polygon2 = new maptalks.Polygon([[
                        new maptalks.Coordinate(121.48495682006853,31.236944812195546),
                        new maptalks.Coordinate(121.48504265075704,31.23599076574145),
                        new maptalks.Coordinate(121.48620136505141,31.236064154272295),
                        new maptalks.Coordinate(121.48607261901867,31.236871424348852)]]);
        var polygons = [polygon1,polygon2];
         //设置面样式
        var polygonSymbol = {
            'lineColor' : '#0000ff',
            'lineWidth' : 2,
            'lineDasharray' : null,//线形
            'lineOpacity' : 1,
            'polygon-fill' : '#ff00ff',
            'polygonFill' : 'rgb(255, 0, 0)',
            'polygonOpacity' : 0.8
        };
        var multiPolygon = new maptalks.MultiPolygon(polygons,{symbol:polygonSymbol,draggable:true});
        this.layer.addGeometry(multiPolygon);
        return this;
    },

    _addCircle:function() {
        var circle = new maptalks.Circle([121.46403558975318, 31.225110285375695], 300,{draggable: true});
        circle.setSymbol({
            'lineColor' : '#000000',
            'lineWidth' : 2,
            'lineDasharray' : null,//线形
            'lineOpacity' : 1,
            'polygon-fill' : '#ff00ff',
            'polygonFill' : 'rgb(255, 255, 0)',
            'polygonOpacity' : 0.8
        });
        this.layer.addGeometry(circle);
        return this;
    },

    _addEllipse:function() {
        var ellipse = new maptalks.Ellipse([121.47180326705995, 31.223532236481937], 300, 500,{draggable: true});
        ellipse.setSymbol({
            'lineColor' : '#000000',
            'lineWidth' : 2,
            'lineDasharray' : null,//线形
            'lineOpacity' : 1,
            'polygon-fill' : '#ff00ff',
            'polygonFill' : 'rgb(255, 255, 0)',
            'polygonOpacity' : 0.8
        });
        this.layer.addGeometry(ellipse);
        return this;
    },

    _addRectangle:function() {
        var rect = new maptalks.Rectangle([121.47708185440119, 31.22191746150361], 300, 500,{draggable: true});
        rect.setSymbol({
            'lineColor' : '#000000',
            'lineWidth' : 2,
            'lineDasharray' : null,//线形
            'lineOpacity' : 1,
            'polygon-fill' : '#ff00ff',
            'polygonFill' : 'rgb(255, 255, 0)',
            'polygonOpacity' : 0.8
        });
        this.layer.addGeometry(rect);
        return this;
    },

    _addSector:function() {
        var sector = new maptalks.Sector([121.48004301315352, 31.224302914814704], 300, 50, 90,{draggable: true});
        sector.setSymbol({
            'lineColor' : '#000000',
            'lineWidth' : 2,
            'lineDasharray' : null,//线形
            'lineOpacity' : 1,
            'polygon-fill' : '#ff00ff',
            'polygonFill' : 'rgb(255, 255, 0)',
            'polygonOpacity' : 0.4
        });
        this.layer.addGeometry(sector);
        return this;
    }

};
