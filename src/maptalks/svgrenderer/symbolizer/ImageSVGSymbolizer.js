Z.ImageMarkerSVGSymbolizer = Z.ImageMarkerSymbolizer.extend({
    symbolize:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(container,zIndex);
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
})

