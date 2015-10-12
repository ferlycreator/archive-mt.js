Z.PointSymbolizer=Z.Symbolizer.extend({
    getPixelExtent:function() {
        var extent = new Z.Extent();
        var markerExtent = this.getMarkerExtent();
        var min = markerExtent.getMin(),
            max = markerExtent.getMax();
        for (var i = this.renderPoints.length - 1; i >= 0; i--) {
            var point = this.renderPoints[i];
            extent = Z.Extent.combine(
                extent,
                new Z.Extent(point.add(min), point.add(max))
                );
        }
        return extent;
    },

    getSvgDom:function() {
        return this.markers;
    },

    //所有point symbolizer的共同的refresh方法
    refresh:function() {
        this.renderPoints = this._getRenderPoints();
        var layer = this.geometry.getLayer();
        if (!layer.isCanvasRender()) {
            this.symbolize();
        }
    },


    //所有point symbolizer的共同的remove方法
    remove:function() {
        if (Z.Util.isArrayHasData(this.markers)) {
            for (var i = this.markers.length-1;i>=0;i--) {
                Z.DomUtil.removeDomNode(this.markers[i]);
            }
        }
    },

    setZIndex:function(zIndex) {
        if (Z.Util.isArrayHasData(this.markers)) {
            for (var i = this.markers.length-1;i>=0;i--) {
                this.markers[i].style.zIndex = zIndex;
            }
        }
    },

    show:function(){
        if (Z.Util.isArrayHasData(this.markers)) {
            for (var i = this.markers.length-1;i>=0;i--) {
                this.markers[i].style.display = "";
            }
        }
    },

    hide:function(){
        if (Z.Util.isArrayHasData(this.markers)) {
            for (var i = this.markers.length-1;i>=0;i--) {
                this.markers[i].style.display = "none";
            }
        }
    },

    _svgMarkers:function(container,zIndex) {
        var points = this.renderPoints;
        if (!Z.Util.isArrayHasData(points)) {
            return;
        }
        var i,len, markerDom, markerNode;
        if (Z.Util.isArrayHasData(this.markers)) {
            //更新
            var c_p = points.length,
                c_m = this.markers.length;
            var count = Math.min(c_p, c_m);
            for (i = 0;i<count;i++) {
               this._offsetMarker(this.markers[i], points[i]);
            }
            if (c_p>c_m) {
                //marker数量不够, 增加marker
                markerDom = this.markers[0];
                for (i=c_m;i<c_p;i++) {
                    markerNode = markerDom.cloneNode(true);
                    this._offsetMarker(markerNode, points[i]);
                    this.markers.push(markerNode);
                    container.appendChild(markerNode);
                }
            } else {
                //有多余的marker, 则删除之
                for (i=c_m-1;i>=c_p;i--) {
                    Z.DomUtil.removeDomNode(this.markers[i]);
                    this.markers.splice(i,1);
                }

            }
        } else {
            //第一次渲染,添加markerDom
            markerDom = this.createMarkerDom();
            markerDom.style.cursor = 'pointer';
            if (zIndex) {
                markerDom.style.zIndex = zIndex;
            }
            this.markers = [];
            for (i = 0, len=points.length;i<len;i++) {
                markerNode = markerDom.cloneNode(true);
                this._offsetMarker(markerNode, points[i]);
                this.markers.push(markerNode);
                container.appendChild(markerNode);
            }
        }
    },

    _getRenderPoints:function() {
        return this.geometry._getRenderPoints(this.getPlacement());
    },



    //设置dom/svg/vml类型marker页面位置的方法
    _offsetMarker: function(marker, pt) {
        var d = this.getDxDy();
        var point = pt.add(d);
        if (marker.tagName && marker.tagName === 'SPAN') {
            //dom
            marker.style.left = point['left']+'px';
            marker.style.top = point['top']+'px';
        } else {
            var textOffset = this._getTextOffset(point);
            if (Z.Browser.vml) {
                //vml
                marker.style.position = 'absolute';
                marker.style.left = textOffset['left'];
                marker.style.top = textOffset['top'];
            } else {
                if (marker.tagName === 'text') {
                    // svg text
                    marker.setAttribute('x',textOffset['left']);
                    marker.setAttribute('y',textOffset['top']);
                } else {
                    //svg
                    marker.setAttribute('transform', 'translate('+textOffset['left']+' '+textOffset['top']+')');
                }

            }
        }

    },

    _getTextOffset: function(point) {
        var style = this.geometry.getSymbol();
        var props = this.geometry.getProperties();
        //非文本marker
        if(!style['textName']) return point;
        var text = Z.Util.content(style['textName'], props);
        var textSize = this._getTextSize(text, style);
        var left = point['left'],top = point['top'];
        var hAlign = style['textHorizontalAlignment'];
        if (hAlign === 'left') {
            left -= textSize['width'];
        } else if (hAlign === 'middle') {
            left -= textSize['width']/2;
        }
        var vAlign = style['textVerticalAlignment'];
        if (vAlign === 'top') {
            top -= textSize['height'];
        } else if (vAlign === 'middle') {
            top -= textSize['height']/2;
        }
        return new Z.Point(left,top);
    },

    _getTextSize: function(text, style) {
        var font = style['textFaceName'];
        var fontSize = style['textSize'];
        var dx = style['textDx'],dy = style['textDy'];
        var lineSpacing = style['textLineSpacing'];
        var wrapChar = style['textWrapCharacter'];
        var textWidth = Z.Util.stringLength(text,font,fontSize).width;
        var wrapWidth = style['textWrapWidth'];
        if(!wrapWidth) wrapWidth = textWidth;
        var rowNum = 0;
        if(wrapChar){
            var texts = text.split(wrapChar);
            for(var i=0,len=texts.length;i<len;i++) {
                var t = texts[i];
                var tWidth = Z.Util.stringLength(t,font,fontSize).width;
                if(tWidth>wrapWidth) {
                    var contents = Z.Util.splitContent(t, tWidth, fontSize, wrapWidth);
                    rowNum += contents.length;
                } else {
                    rowNum ++;
                }
            }
        } else {
            if(textWidth>wrapWidth) {
               var contents = Z.Util.splitContent(text, textWidth, fontSize, wrapWidth);
               rowNum = contents.length;
            } else {
                rowNum = 1;
            }
        }
        var rowHeight = fontSize+lineSpacing;
        return new Z.Size(wrapWidth, rowHeight*rowNum);
    }


});