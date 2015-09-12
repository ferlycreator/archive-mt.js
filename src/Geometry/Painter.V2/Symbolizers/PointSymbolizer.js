Z.PointSymbolizer=Z.Symbolizer.extend({
    _svg:function(container, zIndex) {
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
               this.offsetMarker(this.markers[i], points[i]);
            }
            if (c_p>c_m) {
                //marker数量不够, 增加marker
                markerDom = this.markers[0];
                for (i=c_m;i<c_p;i++) {
                    markerNode = markerDom.cloneNode(true);
                    this.offsetMarker(markerNode, points[i]);
                    this.markers.push(markerNode);
                    container.appendChild(markerNode);
                }
            } else {
                //有多余的marker, 则删除之
                for (i=c_m-1;i>=c_p;i--) {
                    Z.Util.removeDomNode(this.markers[i]);
                    this.markers.splice(i,1);
                }

            }
        } else {
            //第一次渲染,添加markerDom
            var style = this._translate();
            markerDom = this._createMarkerDom(style);
            if (zIndex) {
                markerDom.style.zIndex = zIndex;
            }
            this.markers = [];
            for (i = 0, len=points.length;i<len;i++) {
                markerNode = markerDom.cloneNode(true);
                this.offsetMarker(markerNode, points[i]);
                this.markers.push(markerNode);
                container.appendChild(markerNode);
            }
        }
    },

    offsetMarker:function(marker, point) {
        if (marker.tagName && marker.tagName === 'SPAN') {
            //dom
            marker.style.left = point['left']+'px';
            marker.style.top = point['top']+'px';
        } else {
            if (Z.Browser.vml) {
                //vml
                marker.style.left = point['left'];
                marker.style.top = point['top'];
            } else {
                //svg
                //marker.transform.baseVal.getItem(0).setTranslate(point['left'],point['top']);
                marker.setAttribute('transform', 'translate('+point['left']+' '+point['top']+')');
            }
        }

    }
});