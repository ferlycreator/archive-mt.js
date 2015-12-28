Z.ImageMarkerSymbolizer = Z.PointSymbolizer.extend({

    defaultIcon: Z.prefix+'images/resource/marker.png',

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.style = this.translate();
    },

    svg:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(container,zIndex);
    },

    canvas:function(ctx, resources) {
        var cookedPoints = this._getRenderContainerPoints();
        if (!Z.Util.isArrayHasData(cookedPoints)) {
            return;
        }
        var style = this.style;
        var url = style['markerFile'];
        var img = !resources?null:resources.getImage(url);
        if (!img) {
            // console.error('img missed');
            return;
        }
        this._prepareContext(ctx);
        var width = style['markerWidth'];
        var height = style['markerHeight'];
        if (!Z.Util.isNumber(width) || !Z.Util.isNumber(height)) {
            width = img.width;
            height = img.height;
        }
        for (var i = 0, len=cookedPoints.length;i<len;i++) {
            //图片定位到中心底部
            var pt = cookedPoints[i].add(new Z.Point(-width/2,-height));
            Z.Canvas.image(ctx, pt, img, width, height);
        }
    },

    getPlacement:function() {
        return this.symbol['markerPlacement'];
    },

    getDxDy:function() {
        var s = this.style;
        var dx = s['markerDx'],
            dy = s['markerDy'];
        return new Z.Point(dx, dy);
    },

    getMarkerExtent:function() {
        var width = this.style['markerWidth'],
            height = this.style['markerHeight'];
        var dxdy = this.getDxDy();
        var extent = new Z.Extent(dxdy.add(new Z.Point(-width/2,0)),dxdy.add(new Z.Point(width/2,-height)));
        return extent;
    },

    translate:function() {
        var s = this.symbol;
        return {
            "markerFile" : s["markerFile"],
            "markerWidth" : Z.Util.getValueOrDefault(s["markerWidth"], null),
            "markerHeight" : Z.Util.getValueOrDefault(s["markerHeight"], null),
            "markerOpacity" : Z.Util.getValueOrDefault(s["markerOpacity"], null),
            "markerDx" : Z.Util.getValueOrDefault(s["markerDx"], 0),
            "markerDy" : Z.Util.getValueOrDefault(s["markerDy"], 0)
        };
    },

    /**
     * 生成图片标注
     * @param point
     */
    createMarkerDom: function() {
        var symbol = this.style;
        var markerDom = Z.DomUtil.createEl('span');
        markerDom.setAttribute('unselectable', 'on');
        //用gCenter的话，会出现标注图片无法显示的问题，原因未知
        markerDom.style.cssText = 'position: absolute; padding: 0px; margin: 0px; border: 0px;'+
                'text-align:center;vertical-align:bottom;-webkit-user-select: none;';

        var markerIcon = Z.DomUtil.createEl('img');
        markerIcon.style.cssText = 'border:none; position:absolute;'+
                'max-width:none;-webkit-user-select: none;';
        var width, height;
        if (!Z.Util.isNil(symbol['markerWidth'])) {
            width = parseInt(symbol['markerWidth'],0);
        }
        if (!Z.Util.isNil(symbol['markerHeight'])) {
            height = parseInt(symbol['markerHeight'],0);
        }
        if (width && height) {
            markerIcon['width'] = width;
            markerIcon['height'] = height;
            markerIcon.style.left = (-width/2)+'px';
            markerIcon.style.top = (-height)+'px';
        } else {
            markerIcon.style.left = '0px';
            markerIcon.style.top = '0px';
        }
        markerIcon.setAttribute('unselectable', 'on');
        var me = this;
        markerIcon.onload = function() {
            if (this.src) {
                //相对地址转化成绝对地址
                me.symbol['markerFile'] = this.src;
            }
        };

        //发生错误
        markerIcon.onerror = function() {
            //默认样式
            this.src = me.defaultIcon;
        };
        //浏览器停止键
        markerIcon.onabort = function() {
            this.src = markerIcon.src;
        };

        if (!Z.Util.isNil(symbol['markerOpacity'])) {
            Z.DomUtil.setOpacity(markerIcon, symbol['markerOpacity']);
        }
        markerIcon.src = symbol['markerFile'];
        markerDom.appendChild(markerIcon);
        return markerDom;
    }
});


Z.ImageMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (!Z.Util.isNil(symbol['markerFile'])) {
        return true;
    }
    return false;
};
