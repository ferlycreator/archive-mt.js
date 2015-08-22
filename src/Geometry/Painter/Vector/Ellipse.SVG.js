Z.Ellipse.SVG=Z.Polygon.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }

        //'M0 0' : 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360))
        var geometry = this.geometry;
        var domCenter = geometry._getCenterDomOffset();
        var pr = this.getPixelSize();
        var direction = 0;
        var start = (domCenter['left']-pr['px'])+','+domCenter['top'];
        var path = 'M'+start+' a'+pr['px']+','+pr['py']+' 0,1,'+direction+',0,-0.9Z';
        if (Z.Browser.vml) {
            path ='AL ' + start + ' ' + pr['px'] + ',' + pr['py'] + ' 0,' + (65535 * 360) + ' x ';
        }
        var holePathes = this.getHolePathes();
        if (Z.Util.isArrayHasData(holePathes)) {
            path = path + ' ' + holePathes.join(' ');
        }
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            path = path +' e';
        }
        return {
            'type' : 'path',
            'path' : path
        };
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var w = geometry.getWidth(),
            h = geometry.getHeight();
        var map = geometry.getMap();
        return map.distanceToPixel(w/2,h/2);
    }
});