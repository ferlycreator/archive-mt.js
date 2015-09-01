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
    doPaint: function(context, resources) {
        var geometry = this.geometry;
        if (!geometry) {
            return;
        }
        var map = geometry.getMap();
        if (!map) {
            return;
        }
        var offset = this.getMarkerDomOffset();
        var mapOffset = map.offsetPlatform();
        var pt = map._domOffsetToScreen(new Z.Point(offset[0], offset[1]));
        var icon = this.getGeoIcon();
        if(icon) {
            var url = icon['url'];
            if(url&&url.length>0) {
                this.paintPictureMarker(context, pt, icon,resources);
                return;
            }
            var markerType = icon['type'];
            if(markerType&&markerType.length>0) {
                pt = geometry._getCenterDomOffset();
                pt = new Z.Point(pt['left']+mapOffset['left'], pt['top']+mapOffset['top']);
                this.paintVectorMarker(context, pt);
                return;
            }
            var shieldType = icon['shieldType'];
            if(shieldType&&shieldType.length>0) {
                this.paintShieldMarker(context, pt);
                return;
            }
            var textName = icon['content'];
            if(textName&&textName.length>0) {
                this.paintTextMarker(context, pt);
                return;
            }
        }
    },

    paintPictureMarker:function(context, pt, icon, resources) {
        var url = icon['url'];
        var img = resources.getImage(url);
        var ratio = Z.Browser.retina ? 2:1;
        var left = pt.left*ratio;
        var top = pt.top*ratio;
        var width = icon['width']*ratio;
        var height = icon['height']*ratio;
        icon['url'] = img['src'];
        if (width && height) {
            context.drawImage(img,left,top,width,height);
         } else {
            context.drawImage(img,left,top);
         }
         return pt;
    },

    paintVectorMarker: function(context, pt) {
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
        context.beginPath();
        var points = this.getVectorArray([pt.left, pt.top]);
        //TODO ellipse的支持
        //TODO fillGeo和fillColor方法的作用相同, 应统一
        if ('circle' === markerType) {
            var center = points[0];
            context.arc(center[0],center[1],radius,0,2*Math.PI);
            context.stroke();
            this.fillGeo(context, this.fillSymbol);
        } else {
            this._drawVector(context, markerType, points);
            this._fillColor(context, icon);
        }
    },

    _drawVector: function(context, markerType, points) {
        if ('triangle' === markerType
                || 'diamond' === markerType
                || 'square' === markerType
                || 'bar' === markerType
                || 'label' === markerType
                || 'tip' === markerType) {
             context.moveTo(points[0][0],points[0][1]);
             for (var i = 1, len = points.length;i<len;i++) {
                 context.lineTo(points[i][0],points[i][1]);
             }
             context.closePath();
             context.stroke();
        }  else if ('cross' === markerType || 'x' === markerType || 'X' === markerType) {
            context.moveTo(points[0][0],points[0][1]);
            context.lineTo(points[1][0],points[1][1]);
            context.moveTo(points[2][0],points[2][1]);
            context.lineTo(points[3][0],points[3][1]);
            context.stroke();
        }
    },

    _fillColor: function(context, icon) {
        var stroke = (!icon['stroke'])?'#000000':icon['stroke'];
        var strokeWidth = icon['strokeWidth'];
        var strokeOpacity = (!icon['strokeOpacity'])?1:icon['strokeOpacity'];
        var fill = (!icon['fill'])?'#ffffff':icon['fill'];
        var fillOpacity = (!icon['fillOpacity'])?1:icon['fillOpacity'];
        //绘制背景
        if (fill) {
            context.fillStyle =this.getRgba(fill);
            context.fill();
        }
        if (stroke) {
            context.lineWidth = strokeWidth;
            context.strokeStyle = this.getRgba(stroke,1);
            context.stroke();
        }
    },

    paintTextMarker: function(context, pt) {
        var icon = this.getGeoIcon();
        var content = this._convertContent(icon);
        if (Z.Util.isNil(content)) {return null;}
        var fontSize = 12;
        var color = 'rgba(0,0,0,1)';
        var stroke = null;
        var strokewidth = null;

        var cssText = '';
        if (!Z.Util.isNil(icon['size'])) {
            fontSize = icon['size'];
        }
        cssText += ' '+fontSize+'px';
        if (icon['font']) {
            cssText += ' ' + icon['font'];
        } else {
            cssText += ' arial';
        }
        context.font =  cssText;

        var padding = icon['padding'];
        if (Z.Util.isNil(padding)) {padding = 8;}

        var fontSize = (!icon['size'])?12:icon['size'];
        var width = icon['textWidth'];
        var padding = (!icon['padding'])?0:icon['padding'];
        var lineSpacing = (!icon['lineSpacing'])?8:icon['lineSpacing'];
        var size = fontSize/2;
        var realTextWidth = Z.Util.getLength(content)*size;

        var height = icon['height'];
        var width = icon['width'];
        var textWidth = icon['textWidth'];
        if(textWidth>width) {
            width = textWidth;
        }
        var rowNum = 1;
        if(textWidth>width){
            rowNum = Math.ceil(textWidth/width)/2;
        }
        var labelHeight = height + rowNum*(fontSize+lineSpacing);
        var labelWidth = width + fontSize;

        var contents = [];
        if(realTextWidth>width){
             contents = Z.Util.splitContent(content, realTextWidth, size, width);
        } else {
            contents.push(content);
        }

        var shieldType = icon['shieldType'];
        if(shieldType) {
            var points = this.getLabelVectorArray(icon);
            this._drawVector(context, shieldType, points);
            this._fillColor(context, icon);
        }
        if (icon['color']) {
             color = this.getRgba(icon['color'], 1);
        }
        pt = this.getTextVectorLocation(icon);
        for (var i=0,len=contents.length;i<len;i++) {
            //绘制文字
            if (color) {
                context.fillStyle = color;
                context.fillText(contents[i], pt[0], pt[1]+i*(fontSize));
            }
        }
    },

    paintShieldMarker: function(context, pt) {
        this.paintTextMarker(context, pt);
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
                }
            }
        }
        return content;
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
        return this.paintTextMarker(testContext,new Z.Point(0,0),true);
    }
});