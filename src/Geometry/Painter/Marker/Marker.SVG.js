Z.Marker.SVG = Z.Painter.SVG.extend({
    includes: Z.Marker.PaintUtils,

    initialize:function(geometry) {
        this.geometry = geometry;
    },

    /**
     * 绘制
     * @param  {[type]} layerContainer [description]
     * @param  {[type]} zIndex         [description]
     */
    _paint:function(layerContainer, zIndex, symbol) {        
        if (!this.geometry) {return;}
        this.layerContainer = layerContainer;
        this.setSymbol(symbol);
        var icon = this.getGeoIcon();
        var type = icon['type'];
        if(type) {
            this.paintVectorMarker();
        } else {
            var picMarker =  this.createPictureMarker();
            this.paintDomMarker(picMarker, layerContainer);
        }
        this.setZIndex(zIndex);
    },

    /**
     * 重绘图形，一般在地图放大缩小等需要重新计算图形坐标时调用
     * @param layer
     * @param config
     */
    refreshMarker:function() {
        var icon = this.getGeoIcon();
        var iconType = icon['type'];
        if (iconType) {
            if (!this.vector) {return;}
            var vectorMarker = this.createSVGObj();
            Z.SVG.refreshVector(this.vector, vectorMarker);
        } else {
            if (!this.markerDom) {return;}
            var gCenter = this.getMarkerDomOffset();
            if (!gCenter) {return;}
            this.markerDom.style.left = gCenter[0] + "px";
            this.markerDom.style.top =gCenter[1] + "px";
        }
    },

    refreshMarkerSymbol:function() {
        this._paint(this.layerContainer, this.markerDom.style.zIndex, this.geometry.getSymbol());
    },

    paintDomMarker:function(markerGraphic,layerContainer) {
        if (this.markerDom) {
            Z.DomUtil.removeDomNode(this.markerDom);
            delete this.markerDom;
        }       
        if (!layerContainer || !markerGraphic) {return;}
        this.markerDom = markerGraphic;
        layerContainer.appendChild(this.markerDom);
        this.visualSize = {
            'width':this.markerDom.clientWidth,
            'height':this.markerDom.clientHeight
        };
    },

    measureTextMarker:function() {
        return this.visualSize;
    },

    /**
       'url': symbol['markerFile'],
       'width': symbol['markerWidth'],
       'height': symbol['markerHeight'],
       'type': symbol['markerType'],
       'opacity': symbol['markerOpacity'],
       'fillOpacity': symbol['markerFillOpacity'],
       'fill': symbol['markerFill'],
       'lineColor': symbol['markerLineColor'],
       'lineOpacity': symbol['markerLineOpacity'],
       'lineWidth': symbol['markerLineWidth']
    */
    paintVectorMarker: function() {
        var icon = this.getGeoIcon();
        var strokeSymbol = {
            'stroke': icon['lineColor'],
            'strokeOpacity': icon['lineOpacity'],
            'strokeWidth': icon['lineWidth']
        };
        var fillSymbol = {
            'fill': icon['fill'],
            'fillOpacity': icon['fillOpacity']
        };
        //矢量标注绘制
        var vectorMarker = this.createSVGObj();
        this.drawVector(vectorMarker, strokeSymbol, fillSymbol, icon);
    },

    /**
     * 生成矢量标注
     * @param gCenter
     * @returns
     */
    createSVGObj: function() {
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        var icon = this.getGeoIcon();
        //矢量标注
        var markerType = icon['type'];
        var width = icon['width'];
        var height = icon['height'];
        var radius = (width + height)/2;
        var svgBean = null;
        var points = this.getVectorArray(gCenter);
        if ('circle' === markerType) {
            var path = null;
            if (Z.Browser.vml) {
                path ='AL ' + gCenter[0]+','+gCenter[1] + ' ' + radius + ',' + radius + ' 0,' + (65535 * 360) + ' x';
            } else {
                path = 'M'+gCenter[0]+','+gCenter[1]+' a'+radius+','+radius+' 0,1,0,0,-0.9 Z';
            }
            svgBean = {
                'type' : 'path',
                'path' : path
            };          
        } else if ('triangle' === markerType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         Z.SVG.closeChar
            };
        }  else if ('cross' === markerType || 'x' === markerType || 'X' === markerType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'M'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]
            };
        } else if ('diamond' === markerType || 'square' === markerType || 'rectangle' === markerType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]+ ' ' +
                         Z.SVG.closeChar
            };
        } else if ('tip' === markerType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]+ ' ' +
                         'L'+points[4][0]+','+points[4][1]+ ' ' +
                         'L'+points[5][0]+','+points[5][1]+ ' ' +
                         'L'+points[6][0]+','+points[6][1]+ ' ' +
                         Z.SVG.closeChar
            };
        }
        if (Z.Browser.vml && svgBean) {
            svgBean['path'] += ' e';
        }
        svgBean = this.createText(svgBean);
        return svgBean;
    },

    createText: function(svgBean) {
        var icon = this.getGeoIcon();
        var geometry = this.geometry;
        var content = icon['content'];
        if(content) {
            var regex = /\[.*\]/gi;
            if(regex.test(content)) {
                var arr = content.match(regex);
                console.log(arr);
            }
        }
        var gCenter = this.getMarkerDomOffset();
        var textPoint = {
            'location': gCenter,
            'content': content
        };
        var texts = [];
        texts.push(textPoint);
        svgBean['texts'] = texts;
        return svgBean;
    },

    /**
     * 生成图片标注
     * @param gCenter
     * @returns {___anonymous51875_51903}
     */
    createPictureMarker: function() {
        var geometry = this.geometry;
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        var _graphicDom = null;
        var iconSymbol = this.getGeoIcon();
        if (!iconSymbol["url"]) {
            iconSymbol["url"] = geometry.defaultIcon["url"];
        }
        _graphicDom = Z.DomUtil.createEl("span");
        //_graphicDom.geometry = this;
        _graphicDom.setAttribute("unselectable", "on");
        //用gCenter的话，会出现标注图片无法显示的问题，原因未知
        _graphicDom.style.cssText = "top:" + gCenter[1] + "px;left:"+ gCenter[0]+ "px;position: absolute; padding: 0px; margin: 0px; border: 0px; text-align:center;vertical-align:bottom;-webkit-user-select: none;";

        var markerIcon = Z.DomUtil.createEl("img");
        markerIcon.originCss = "border:none; position:absolute;top:0px;left:0px;cursor:pointer;max-width:none;-webkit-user-select: none;";
        if (iconSymbol["width"] !== null && iconSymbol["width"] !== undefined) {
            markerIcon["width"] = parseInt(iconSymbol["width"],0); 
        }
        if (iconSymbol["height"] !== null && iconSymbol["height"] !== undefined) {
            markerIcon["height"] = parseInt(iconSymbol["height"],0); 
        }
        markerIcon.style.cssText = markerIcon.originCss;
        
        markerIcon.setAttribute("unselectable", "on");

        var _this = geometry;
        markerIcon.onerror = function() {
            this.src = _this.defaultIcon["url"];
            
        };
        markerIcon.onabort = function() {
            this.src = markerIcon.src;
        };
        markerIcon.src = iconSymbol["url"];
        //相对地址转化成绝对地址
        iconSymbol["url"] = markerIcon.src;
        
        geometry.markerIcon = markerIcon;
        _graphicDom.appendChild(markerIcon);
        this.setZIndex(geometry,this.zIndex);
        return _graphicDom;
    }
    
});
