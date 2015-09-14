Z.ImageMarkerSymbolizer = Z.PointSymbolizer.extend({

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.renderPoints = this.geometry._getRenderPoints();
    },

    svg:function(container, vectorcontainer, zIndex) {
        this._svg(container,zIndex);
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
        var style = this._translate();
        var url = style['marker-file'];
        var img = resources.getImage(url);
        if (!img) {
            return;
        }
        //将完整图片地址写回到symbol中, 截图等模块需要
        this.symbol['marker-file'] = img['src'];
        var ratio = Z.Browser.retina ? 2:1;
        for (var i = 0, len=cookedPoints.length;i<len;i++) {
            var pt = cookedPoints[i].multi(ratio);
            var width = style['marker-width']*ratio;
            var height = style['marker-height']*ratio;
            if (width && height) {
                ctx.drawImage(img,pt['left'],pt['top'],width,height);
             } else {
                ctx.drawImage(img,pt['left'],pt['top']);
             }
        }
    },



    _translate:function() {
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
    _createMarkerDom: function(style) {
        var symbol = style;
        var markerDom = Z.DomUtil.createEl('span');
        markerDom.setAttribute('unselectable', 'on');
        //用gCenter的话，会出现标注图片无法显示的问题，原因未知
        markerDom.style.cssText = 'position: absolute; padding: 0px; margin: 0px; border: 0px;'+
                'text-align:center;vertical-align:bottom;-webkit-user-select: none;';

        var markerIcon = Z.DomUtil.createEl('img');
        markerIcon.style.cssText = 'border:none; position:absolute;'+
                'cursor:pointer;max-width:none;-webkit-user-select: none;';
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
            markerIcon.style.left = (-width/2+symbol['marker-dx'])+'px';
            markerIcon.style.top = (-height+symbol['marker-dy'])+'px';
        } else {
            markerIcon.style.left = symbol['marker-dx']+'px';
            markerIcon.style.top = symbol['marker-dy']+'px';
        }
        markerIcon.setAttribute('unselectable', 'on');
        markerIcon.onerror = function() {
            //TODO 默认样式
            //this.src = _this.defaultIcon['url'];

        };
        markerIcon.onabort = function() {
            this.src = markerIcon.src;
        };

        if (!Z.Util.isNil(symbol['marker-opacity'])) {
            Z.DomUtil.setOpacity(markerIcon, symbol['marker-opacity']);
        }
        //相对地址转化成绝对地址
        this.symbol['marker-file'] = markerIcon.src;

        // geometry.markerIcon = markerIcon;
        markerDom.appendChild(markerIcon);
        markerIcon.src = symbol['marker-file'];
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