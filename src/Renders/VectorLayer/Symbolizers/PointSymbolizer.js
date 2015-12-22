Z.PointSymbolizer=Z.Symbolizer.extend({
    getPixelExtent:function() {
        var extent = new Z.Extent();
        var markerExtent = this.getMarkerExtent();
        var min = markerExtent.getMin(),
            max = markerExtent.getMax();
        var renderPoints = this._getRenderPoints();
        for (var i = renderPoints.length - 1; i >= 0; i--) {
            var point = renderPoints[i];
            extent = extent.combine(new Z.Extent(point.add(min), point.add(max)));
        }
        return extent;
    },

    getSvgDom:function() {
        return this.markers;
    },

    //所有point symbolizer的共同的refresh方法
    refresh:function() {
        this.renderPoints = this.geometry._getRenderPoints(this.getPlacement());
        var layer = this.geometry.getLayer();
        if (!layer.isCanvasRender()) {
            this.symbolize.apply(this,layer._getRender().getPaintContext());
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
        var points = this._getRenderPoints();
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
        if (!this.renderPoints) {
            this.renderPoints = this.geometry._getRenderPoints(this.getPlacement());
        }
        return this.renderPoints;
    },

    /**
     * Get container points to draw on Canvas
     * @return {[type]} [description]
     */
    _getRenderContainerPoints:function() {
        var points = this._getRenderPoints();
        var map = this.getMap();
        var matrix = map._getRender().getTransform();
        var dxdy = this.getDxDy();
        if (matrix) {
            var scale = matrix._scale;
            dxdy = new Z.Point(dxdy.x/scale.x, dxdy.y/scale.y);
        }

        var containerPoints = Z.Util.eachInArray(points,this,function(point) {
            return map._viewPointToContainerPoint(point)._add(dxdy);
        });
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            if (matrix) {
                var p = matrix.applyToArray(containerPoints);
                return p;
            }
        }
        return containerPoints;
    },

    //设置dom/svg/vml类型marker页面位置的方法
    _offsetMarker: function(marker, pt) {
        var d = this.getDxDy();
        var point = pt.add(d);
        if (marker.tagName && marker.tagName === 'SPAN') {
            //dom
            marker.style.left = point.x+'px';
            marker.style.top = point.y+'px';
        } else {
            if (Z.Browser.vml) {
                //vml
                marker.style.position = 'absolute';
                marker.style.left = point.x;
                marker.style.top = point.y;
            } else {
                if (marker.tagName === 'text') {
                    // svg text
                    marker.setAttribute('x',point.x);
                    marker.setAttribute('y',point.y);
                } else {
                    //svg
                    marker.setAttribute('transform', 'translate('+point.x+' '+point.y+')');
                }

            }
        }

    }
});
