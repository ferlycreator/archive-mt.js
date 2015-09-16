Z.ImageMarkerSymbolizer = Z.PointSymbolizer.extend({

    defaultIcon: Z.prefix+'images/marker.png',

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.renderPoints = this._getRenderPoints();
        this.style = this.translate();
    },

    svg:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(container,zIndex);
    },

    canvas:function(ctx, resources) {
        var points = this.renderPoints;
        if (!Z.Util.isArrayHasData(points)) {
            return;
        }
        var map = this.getMap();
        var cookedPoints = Z.Util.eachInArray(points,this,function(point) {
            return map._domOffsetToScreen(point);
        });
        var style = this.style;
        var url = style['marker-file'];
        var img = resources.getImage(url);
        if (!img) {
            return;
        }
        //将完整图片地址写回到symbol中, 截图等模块需要
        if (img['src']) {
            this.symbol['marker-file'] = img['src'];
        }
        var dxdy = this.getDxDy();
        var ratio = Z.Browser.retina ? 2:1;
        var width = style['marker-width']*ratio;
        var height = style['marker-height']*ratio;
        if (!Z.Util.isNumber(width) || !Z.Util.isNumber(height)) {
            width = img.width;
            height = img.height;
        }
        for (var i = 0, len=cookedPoints.length;i<len;i++) {
            var pt = cookedPoints[i]._multi(ratio);
            pt._add(dxdy._multi(ratio));
            ctx.drawImage(img,pt['left'],pt['top'],width,height);
        }
    },

    getPlacement:function() {
        return this.symbol['marker-placement'];
    },

    getDxDy:function() {
        var s = this.style;
        var dx = s['marker-dx'],
            dy = s['marker-dy'];
        return new Z.Point(dx, dy);
    },

    getMarkerExtent:function() {
        var width = this.style['marker-width'],
            height = this.style['marker-height'];
        var dxdy = this.getDxDy();
        var extent = new Z.Extent(dxdy.add(new Z.Point(-width/2,0)),dxdy.add(new Z.Point(width/2,-height)));
        return extent;
    },

    translate:function() {
        var s = this.symbol;
        return {
            "marker-file" : s["marker-file"],
            "marker-width" : Z.Util.setDefaultValue(s["marker-width"], 0),
            "marker-height" : Z.Util.setDefaultValue(s["marker-height"], 0),
            "marker-opacity" : Z.Util.setDefaultValue(s["marker-opacity"], null),
            "marker-dx" : Z.Util.setDefaultValue(s["marker-dx"], 0),
            "marker-dy" : Z.Util.setDefaultValue(s["marker-dy"], 0)
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
        if (!Z.Util.isNil(symbol['marker-width'])) {
            width = parseInt(symbol['marker-width'],0);
        }
        if (!Z.Util.isNil(symbol['marker-height'])) {
            height = parseInt(symbol['marker-height'],0);
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
                me.symbol['marker-file'] = this.src;
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

        if (!Z.Util.isNil(symbol['marker-opacity'])) {
            Z.DomUtil.setOpacity(markerIcon, symbol['marker-opacity']);
        }
        markerIcon.src = symbol['marker-file'];
        markerDom.appendChild(markerIcon);
        return markerDom;
    }
});


Z.ImageMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (!Z.Util.isNil(symbol['marker-file'])) {
        return true;
    }
    return false;
};