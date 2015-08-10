Z.Rectangle.SVG=Z.Polygon.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        var geometry = this.geometry;
        var map = geometry.getMap();         
        var domNw = map.untransformToOffset(geometry.getPNw());
        var pr = this.getPixelSize();        
        var start = domNw['left']+','+domNw['top'];
        var path = 'M'+start+' L'+(domNw['left']+pr['px'])+','+domNw['top']+
            ' L'+(domNw['left']+pr['px'])+','+(domNw['top']+pr['py'])+
            ' L'+domNw['left']+','+(domNw['top']+pr['py'])+
            ' '+Z.SVG.closeChar;        
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
        return map.distanceToPixel(w,h);
    }
});