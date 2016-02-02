Z.VectorMarkerSVGSymbolizer = Z.VectorMarkerSymbolizer.extend({
    svg:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(vectorcontainer, zIndex);
    },

    /**
     * 生成图片标注
     * @param point
     */
    createMarkerDom: function() {
        var style = this.style;
        var svgPath = this._getMarkerSvgPath(style);
        var svgDom = Z.SVG.path(svgPath);
        var svgStyle = this.strokeAndFill;
        Z.SVG.updateShapeStyle(svgDom, svgStyle['stroke'], svgStyle['fill']);
        return svgDom;
    },

    _getMarkerSvgPath:function(style) {
        //矢量标注
        var markerType = style['markerType'].toLowerCase();
        var points = this._getVectorArray(style);
        var path;
        if ('triangle' === markerType) {
           path='M'+points[0].x+','+points[0].y+ ' ' +
                'L'+points[1].x+','+points[1].y+ ' ' +
                'L'+points[2].x+','+points[2].y+ ' ' +
                Z.SVG.closeChar;
        }  else if ('cross' === markerType || 'x' === markerType) {
           path='M'+points[0].x+','+points[0].y+ ' ' +
                'L'+points[1].x+','+points[1].y+ ' ' +
                'M'+points[2].x+','+points[2].y+ ' ' +
                'L'+points[3].x+','+points[3].y;
        } else if ('diamond' === markerType || 'square' === markerType || 'bar' === markerType) {
           path='M'+points[0].x+','+points[0].y+ ' ' +
                'L'+points[1].x+','+points[1].y+ ' ' +
                'L'+points[2].x+','+points[2].y+ ' ' +
                'L'+points[3].x+','+points[3].y+ ' ' +
                Z.SVG.closeChar;
        } else if ('pin' === markerType) {
           path='M'+points[0].x+','+points[0].y+ ' ' +
                'C'+points[1].x+','+points[1].y+ ' ' +
                points[2].x+','+points[2].y+ ' ' +
                points[3].x+','+points[3].y+ ' ' +
                Z.SVG.closeChar;
        } else {
            //ellipse
            var width = style['markerWidth'],
                height = style['markerHeight'];
            var point = [-width/2, 0];
            if (Z.Browser.vml) {
                path = 'AL ' + point.join(',') + ' ' + width/2 + ',' + height/2 +
                        ' 0,' + (65535 * 360) + ' x';
            } else {
                path = 'M'+point.join(',')+' a'+width/2 + ',' + height/2+' 0,1,0,0,-0.9Z';
            }
        }
        if (Z.Browser.vml) {
            path += ' e';
        }
        return path;
    }
});
