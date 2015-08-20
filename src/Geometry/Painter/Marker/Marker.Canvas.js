Z.Marker.Canvas = Z.Painter.Canvas.extend({
    includes:Z.Marker.PaintUtils,

    initialize:function(geometry) {
        this.geometry = geometry;
    },    

    /**
     * 绘制图形
     * @param  {[type]} context       [Canvas Context]
     * @param  {[type]} resources [图片资源缓存]
     * @return {[type]}           [description]
     */
    doPaint:function(context, resources) {
        var geometry = this.geometry;
        if (!geometry) {
            return;
        }
        var map = geometry.getMap();
        if (!map) {
            return;
        }
        var offset = this.getMarkerDomOffset();
        var pt = map.domOffsetToScreen({'left':offset[0],top:offset[1]});
        var icon = this.getGeoIcon();
        var url = icon['url'];
        if (url&&url.length>0) {
            this.paintPictureMarker(context, pt, icon,resources);
        } else {
            var markerType = icon['type'];
            if(!markerType) {
                this.iconSymbol['type'] = 'circle';
            }
            this.paintVectorMarker(context, pt, geometry);
        }
    },

    paintPictureMarker:function(context, pt, icon, resources) {
        var width = icon['width'];
        var height = icon['height'];
        var url = icon['url'];
        var img = resources.getImage(url);
        icon['url'] = img['src'];
        if (width && height) {
            context.drawImage(img,pt.left,pt.top,width,height); 
         } else {
            context.drawImage(img,pt.left,pt.top);
         }
         return pt;
    },

    paintVectorMarker:function(context, pt) {
        //矢量标注
        var icon = this.getGeoIcon();
        //矢量标注
        var markerType = icon['type'];
        if(!markerType) {
            markerType = 'circle';
        }
        var width = icon['width'];
        var height = icon['height'];
        var radius = (width + height)/2;
        var points = this.getVectorArray([pt.left,pt.top]);
        context.beginPath();
        if ('circle' === markerType) {
            context.arc(pt.left,pt.top,radius,0,2*Math.PI);
            context.stroke();
            this.fillGeo(context, this.fillSymbol);
        }  else if ('triangle' === markerType
                || 'diamond' === markerType
                || 'square' === markerType
                || 'tip' === markerType) {
             context.moveTo(points[0][0],points[0][1]);
             for (var i = 1, len = points.length;i<len;i++) {
                 context.lineTo(points[i][0],points[i][1]);
             }
             context.closePath();
             context.stroke();
             this.fillGeo(context, this.fillSymbol);
        }  else if ('cross' === markerType || 'x' === markerType || 'X' === markerType) {
            context.moveTo(points[0][0],points[0][1]);
            context.lineTo(points[1][0],points[1][1]);
            context.moveTo(points[2][0],points[2][1]);
            context.lineTo(points[3][0],points[3][1]);
            context.stroke();
        }
    },

    paintTextMarker:function(context, pt, isTest) {
        var icon = this.getGeoIcon();
        var geoLabel = icon["content"];
        if (Z.Util.isNil(geoLabel)) {return null;}
         var option = icon["textStyle"];
         var fontSize = 12;
         var cssText = "";  
         var color = "rgba(0,0,0,1)";
         var stroke = null;
         var strokewidth = null;
        if (!option) {
            option = {};
        }
        if (option["fontstyle"]) {
            cssText += option["fontstyle"];
        } else {
            cssText += "normal";
        }
        if (!Z.Util.isNil(option["size"])) {
            fontSize = option["size"];
        }
        cssText += " "+fontSize+"px";
        if (option["font"]) {
            cssText += " "+option["font"];
        } else {
            cssText += " SIMHEI";
        }
        if (option["strokewidth"]) {
            strokewidth = option["strokewidth"];
        }
        if (option["stroke"]) {
            stroke = this.getRgba(option["stroke"],1);
        }
        if (option["color"]) {
             color = this.getRgba(option["color"], 1);
        }
        context.font=cssText;   
        var p = option["padding"];
        if (Z.Util.isNil(p)) {p = 3;}
        var geoLabelLines = geoLabel.split("\n");
        var labelWidth = 0;
        var labelHeight = 0;
        for (var i=0, len=geoLabelLines.length;i<len;i++) {
            var lineHeight = context.measureText(geoLabelLines[i])["width"];
            if (lineHeight > labelWidth) {
                labelWidth = lineHeight;
            }
            labelHeight += (fontSize);
            if (i !== 0) {
                labelHeight += 2;
            }
        }
        //计算偏移量
        var offset = this.computeLabelOffset(labelWidth+2*p,labelHeight+2*p,option);
        if (!isTest) {
            pt = {
                    left: pt.left+offset["x"],
                    top:pt.top-offset["y"]
            };
            context.beginPath();
            context.rect(pt.left, pt.top,labelWidth+2*p,labelHeight+2*p);
            //绘制背景
            var background = option["background"];
            if (background) {
                context.fillStyle =this.getRgba(background);
                context.fill();                 
            }
            var bStrokeWidth = option["strokewidth"];
            if (bStrokeWidth) {
                var bStroke = option["stroke"];
                if (!bStroke) {bStroke = "#000000";}
                context.lineWidth = bStrokeWidth;
                context.strokeStyle = this.getRgba(bStroke,1);
                context.stroke();
            }
            for (var i=0, len=geoLabelLines.length;i<len;i++) {
                //绘制文字
                if (color) {
                    context.fillStyle = color;
                    context.fillText(geoLabelLines[i],pt.left+p,pt.top+p+i*(fontSize+2));
                }
            }
            
        } else {
            var moffset = this.getIconOffset();
            return {
                "width":labelWidth,
                "height":labelHeight,
                "offset": {
                    x:offset.x+moffset["left"],
                    y:offset.y-moffset["top"]
                }
            };
        }        
    },

    measureTextMarker:function() {
        var geometry = this.geometry;
        if (!geometry) {
            return null;
        }
        var map = geometry.getMap();
        if (!map) {
            return null;
        }
        var testContext = map.testContext;
        if (!testContext) {
            var testCanvas=Z.DomUtil.createEl("canvas");
            testCanvas.width=10;
            testCanvas.height=10;
            testContext=testCanvas.getContext("2d");
            map.testContext=testContext;          
        }        
        return this.paintTextMarker(testContext,{'left':0,'top':0},true);
    }
});