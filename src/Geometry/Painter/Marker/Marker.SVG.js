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
        var icon = this.iconSymbol;
        if(icon) {
            var url = icon['url'];
            if(url&&url.length>0) {
                var picMarker =  this.createPictureMarker();
                this.paintDomMarker(picMarker, layerContainer);
            }
            var markerType = icon['type'];
            if(markerType&&markerType.length>0) {
                this.paintVectorMarker();
            }
            var textName = icon['content'];
            if(textName&&textName.length>0) {
                this.paintTextMarker();
            }
        } else {
            icon = this.shieldSymbol;
            var shieldType = icon['shieldType'];
            if(shieldType&&shieldType.length>0) {
                this.paintShieldMarker();
            }
        }
        this._setZIndex(zIndex);
    },

    /**
     * 重绘图形，一般在地图放大缩小等需要重新计算图形坐标时调用
     * @param layer
     * @param config
     */
    refreshMarker:function() {
        var icon = this.iconSymbol;
        if(icon) {
            var url = icon['url'];
            if (url&&url.length>0) {
                if (!this.markerDom) {return;}
                var gCenter = this.getMarkerDomOffset();
                if (!gCenter) {return;}
                this.markerDom.style.left = gCenter[0] + "px";
                this.markerDom.style.top =gCenter[1] + "px";
            }

            var markerType = icon['type'];
            if(markerType&&markerType.length>0) {
                var vectorMarker = this._createVectorObj(icon);
                Z.SVG.refreshVector(this.vector, vectorMarker);
            }
            var textName = icon['content'];
            if(textName&&textName.length>0) {
                var vectorMarker = this._createTextObj(icon);
                Z.SVG.refreshTextVector(this.vector, vectorMarker);
            }
        } else {
            icon = this.shieldSymbol;
            var shieldType = icon['shieldType'];
            if(shieldType&&shieldType.length>0) {
               var shieldVector = this._createShieldObj(icon);
                var fontSize = icon['size'];
                var location = shieldVector['text']['location'];
                shieldVector['text']['location'][1] = location[1]+fontSize;
               Z.SVG.refreshShieldVector(this.vector, shieldVector);
            }
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

    paintVectorMarker: function() {
        var icon = this.iconSymbol;
        var strokeSymbol = {
            'stroke': icon['stroke'],
            'strokewidth': icon['strokewidth'],
            'strokedasharray': icon['strokedasharray'],
            'strokeopacity': icon['strokeopacity']
        };
        var fillSymbol = {
            'fill': icon['fill'],
            'fillopacity': icon['fillopacity']
        };
        //矢量标注绘制
        var vectorMarker = this._createVectorObj(icon);
        this.drawVector(vectorMarker, strokeSymbol, fillSymbol);
    },

    /**
     * 生成矢量标注
     * @param gCenter
     * @returns
     */
    _createVectorObj: function(icon) {
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
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
        return svgBean;
    },

     /**
     * 生成标签矢量对象
     * @param gCenter
     * @returns
     */
    _createLabelVectorObj: function(icon) {
        var svgBean = null;
        var points = this.getLabelVectorArray(icon);
        var labelType = icon['shieldType'];
        if ('label' === labelType) {
            svgBean = {
                'type' : 'path',
                'path' : 'M'+points[0][0]+','+points[0][1]+ ' ' +
                         'L'+points[1][0]+','+points[1][1]+ ' ' +
                         'L'+points[2][0]+','+points[2][1]+ ' ' +
                         'L'+points[3][0]+','+points[3][1]+ ' ' +
                         Z.SVG.closeChar
            };
        } else if ('tip' === labelType) {
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
        return svgBean;
    },

    paintTextMarker: function() {
        var iconSymbol = this.iconSymbol;
        //文本标注绘制
        iconSymbol['content'] = this._convertContent(iconSymbol);
        var textMarker = this._createTextObj(iconSymbol);
        this.drawTextVector(textMarker, iconSymbol);
    },

    _createTextObj: function(icon) {
        var svgBean = {};
        var location = this.getTextVectorLocation(icon);
        var textPoint = {
            'location': location,
            'content': icon['content']
        };
        svgBean['text'] = textPoint;
        return svgBean;
    },

    _convertContent: function(icon) {
        var geometry = this.geometry;
        var props = geometry.getProperties();
        var content = icon['content'];
        if(content) {
            var regex = /\[.*\]/gi;
            if(regex.test(content)) {
                var arr = content.match(regex);
                if(arr&&arr.length>0) {
                    var key = arr[0].substring(1,arr[0].length-1);
                    if(props) {
                        if(props[key]) {
                            content = content.replace(regex, props[key]);
                        }
                    }
                    content = content.replace(regex, '');
                }
            }
        }
        return content;
    },

    paintShieldMarker: function() {
        var shieldSymbol = this.shieldSymbol;
        var strokeSymbol = {
            'stroke': shieldSymbol['stroke'],
            'strokeWidth': shieldSymbol['strokeWidth'],
            'strokeDasharray': shieldSymbol['strokeDasharray'],
            'strokeOpacity': shieldSymbol['strokeOpacity']
        };
        var fillSymbol = {
            'fill': shieldSymbol['fill'],
            'fillOpacity': shieldSymbol['fillOpacity']
        };

        shieldSymbol['content'] = this._convertContent(shieldSymbol);
        var shieldMarker = this._createShieldObj(shieldSymbol);
        this.drawShieldVector(shieldMarker, strokeSymbol, fillSymbol, shieldSymbol);
    },

    _createShieldObj: function(shieldSymbol) {
        var svgBean = {};
        var vector = this._createLabelVectorObj(shieldSymbol);
        svgBean = this._createTextObj(shieldSymbol);
        svgBean['path'] = vector['path'];
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
        if (!iconSymbol['url']) {
            iconSymbol['url'] = geometry.defaultIcon['url'];
        }
        _graphicDom = Z.DomUtil.createEl('span');
        _graphicDom.setAttribute('unselectable', 'on');
        //用gCenter的话，会出现标注图片无法显示的问题，原因未知
        _graphicDom.style.cssText = 'top:' + gCenter[1] + 'px;left:'+ gCenter[0]+
                'px;position: absolute; padding: 0px; margin: 0px; border: 0px;'+
                'text-align:center;vertical-align:bottom;-webkit-user-select: none;';

        var markerIcon = Z.DomUtil.createEl('img');
        markerIcon.originCss = 'border:none; position:absolute;top:0px;left:0px;'+
                'cursor:pointer;max-width:none;-webkit-user-select: none;';
        if (iconSymbol['width'] !== null && iconSymbol['width'] !== undefined) {
            markerIcon['width'] = parseInt(iconSymbol['width'],0);
        }
        if (iconSymbol['height'] !== null && iconSymbol['height'] !== undefined) {
            markerIcon['height'] = parseInt(iconSymbol['height'],0);
        }
        markerIcon.style.cssText = markerIcon.originCss;

        markerIcon.setAttribute('unselectable', 'on');

        var _this = geometry;
        markerIcon.onerror = function() {
            this.src = _this.defaultIcon['url'];

        };
        markerIcon.onabort = function() {
            this.src = markerIcon.src;
        };
        markerIcon.src = iconSymbol['url'];
        //相对地址转化成绝对地址
        iconSymbol['url'] = markerIcon.src;

        geometry.markerIcon = markerIcon;
        _graphicDom.appendChild(markerIcon);
        this._setZIndex(geometry,this.zIndex);
        return _graphicDom;
    }

});
