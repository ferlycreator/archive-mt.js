Z.Marker.SVG=Z.Painter.SVG.extend({
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
        //普通图形标注
        var iconType = icon['type'];
        if (this.geometry.isVectorIcon()) {
            this.paintVectorMarker();
            return;
        }
        var markerGraphic = this.createMarkerDom(icon);
        this.paintDomMarker(markerGraphic,layerContainer);
        this.setZIndex(zIndex);
        if ('text' === iconType) {
            this.fire('_textadded',{});
        }
    },

    /**
     * 重绘图形，一般在地图放大缩小等需要重新计算图形坐标时调用
     * @param layer
     * @param config
     */
    refreshMarker:function() {
        var icon = this.getGeoIcon();//this.geometry.getIcon();
        
        var iconType = icon['type'];
        if ("vector" === iconType) {
            if (!this.vector) {return;}
            var vectorMarker = this.createSVGObj(this.geometry);
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

    createMarkerDom:function(icon) {
        var iconType = icon['type'];
        this.markerDom = null;
        var geometry = this.geometry;
        if ("picture" === iconType) {
            this.markerDom =  this.createPictureMarker(geometry);
        } else if ("html" === iconType) {
            this.markerDom = this.createHtmlMarker(this.getMarkerDomOffset(),icon["content"]);
        } else if ("text" === iconType) {
            this.markerDom = this.createTextMarker(geometry);
        }
        return this.markerDom;
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

    paintVectorMarker:function() {
        var strokeSymbol = this.strokeSymbol,
            fillSymbol = this.fillSymbol;
        //矢量标注绘制        
        var vectorMarker = this.createSVGObj(this.geometry);
        this.drawVector(vectorMarker,strokeSymbol,fillSymbol);
    },


    /**
     * 生成文字标注
     */
    createTextMarker:function() {
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        var iconSymbol = this.getGeoIcon();
        var text = iconSymbol["content"];
        var option = iconSymbol["textStyle"];
        if (Z.Util.isNil(text) || !gCenter) {return null;}
        var cssText = "position:relative;";
        var fontSize = 12;  
        if (option) {
            var cssArr = [];
            if (option["size"] !== null && option['size'] !== undefined) {
                fontSize = option["size"];
            } 
            cssArr.push("font-size:"+fontSize+"px");
            cssArr.push("line-height:"+(fontSize+1)+"px");
            
            if (option["font"]) {
                cssArr.push("font-family:"+option["font"]);
            }
            if (option["fontstyle"]) {
                cssArr.push("font-style:"+option["fontstyle"]);
            }
            if (option["textStrokeWidth"] !== null && option["textStrokeWidth"] !== undefined) {
                cssArr.push("-webkit-text-stroke-width:"+option["textStrokeWidth"]);
            }
            if (option["textStrokeColor"]) {
                cssArr.push("-webkit-text-stroke-color:"+option["textStrokeColor"]);
                if (option["color"]) {
                    cssArr.push("-webkit-text-fill-color:"+option["color"]);
                }
            } else {
                if (option["color"]) {
                    cssArr.push("color:"+option["color"]);
                }
            }
            var p = option["padding"];
            if (p === null || p === undefined) {
                p = 3;
            }
            cssArr.push("padding:"+p+"px");
            var back = option["background"];
            if (back) {         
                cssArr.push("background:"+back);
            }
            var strokeWidth = option["strokewidth"];
            if (strokeWidth) {
                var c = option["stroke"];
                if (!c) {
                    c = "#000000";
                }
                cssArr.push("border:"+strokeWidth+"px solid "+c);
            }
            if (cssArr.length) {
                cssText += cssArr.join(";");
            }
        }
        var custom = Z.DomUtil.createEl("div");
        custom.style.cssText = cssText;
        custom.innerHTML = '<pre style="display:inline;">'+text+'</pre>';
        var me = this;
        function offsetText() {
            var width = custom.offsetWidth;
            var height = custom.offsetHeight;
            var labelOffset = me.computeLabelOffset(width,height,option);
            custom.style.left = labelOffset["x"]+"px";
            custom.style.top = (-labelOffset["y"])+"px";
        }
        this.on('_textadded',function(param) {
            offsetText();
        });
        return this.createHtmlMarker(gCenter, custom);

    },

    /**
     * 生成html标注
     * @param gCenter
     * @returns {___anonymous55461_55471}
     */
    createHtmlMarker:function(gCenter,content) {
        if (!gCenter) {return null;}
        if (content === null || content === undefined) {return null;}
        var _graphicDom = null;
        _graphicDom = Z.DomUtil.createEl("div");
        _graphicDom.setAttribute("unselectable", "on");
        _graphicDom.style.cssText = "top:" + gCenter[1] + "px;left:" + gCenter[0]
            + "px;position: absolute; padding: 0px;-webkit-user-select: none;";
        var custom = content;
        if (Z.Util.isString(custom)) {
            _graphicDom.innerHTML = custom;
        } else {
            _graphicDom.appendChild(custom);
        }
        return _graphicDom;
    },

    /**
     * 生成矢量标注
     * @param gCenter
     * @returns
     */
    createSVGObj:function() {
        // var geometry = this.geometry;
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        // var iconSymbol = geometry.getIcon();
        var iconSymbol = this.getGeoIcon();
        //矢量标注
        var vType = iconSymbol["fontstyle"];
        var radius = iconSymbol["size"];
        if (!radius) {return null;}
        var svgBean = null;
        var v = this.getVectorArray(gCenter);
        if ("circle" === vType) {
            var path = null;
            if (Z.Browser.vml) {
                path ='AL ' + gCenter[0]+','+gCenter[1] + ' ' + radius + ',' + radius + ' 0,' + (65535 * 360) + ' x';
            } else {
                path = 'M'+gCenter[0]+','+gCenter[1]+' a'+radius+','+radius+' 0,1,0,0,-0.9 Z';
            }
            svgBean = {
                    "type" : "path",
                    'path' : path
            };          
        } else if ("triangle" === vType) {          
            svgBean = {
                    "type" : "path",                    
                    "path" : "M"+v[0][0]+","+v[0][1]+" L"+v[1][0]+","+v[1][1]+" L"+v[2][0]+","+v[2][1]+' '+Z.SVG.closeChar
            };
        }  else if ("cross" === vType || "x" === vType || "X" === vType) {
            svgBean = {
                    "type" : "path",                    
                    "path" : "M"+v[0][0]+","+v[0][1]+" L"+v[1][0]+","+v[1][1]+" M"+v[2][0]+","+v[2][1]+" L"+v[3][0]+","+v[3][1]
            };
        } else if ("diamond" === vType || "square" === vType) {
            svgBean = {
                    "type" : "path",                    
                    "path" : "M"+v[0][0]+","+v[0][1]+" L"+v[1][0]+","+v[1][1]+" L"+v[2][0]+","+v[2][1]+" L"+v[3][0]+","+v[3][1]+' '+Z.SVG.closeChar
            };
        } 
        if (Z.Browser.vml && svgBean) {
            svgBean['path'] += ' e';
        }
        return svgBean;
    },
    
    


    /**
     * 生成图片标注
     * @param gCenter
     * @returns {___anonymous51875_51903}
     */
    createPictureMarker:function() {
        var geometry = this.geometry;
        var gCenter = this.getMarkerDomOffset();
        if (!gCenter) {return null;}
        var _graphicDom = null;
        var iconSymbol = this.getGeoIcon();//geometry.getIcon();
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
    
        // //png透明
        /*markerIcon.onload = function() {
            seegoo.maps.Util.fixPNG(this);
        };*/
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
        //_graphicDom.style.zIndex = this.zIndex;
        this.setZIndex(geometry,this.zIndex);
        return _graphicDom;
    }
    
});
