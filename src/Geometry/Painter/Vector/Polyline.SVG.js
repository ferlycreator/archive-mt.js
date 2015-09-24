Z.Polyline.SVG=Z.Vector.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        var geometry = this.geometry;
        var offsets = geometry._transformToViewPoint(geometry._getPrjPoints());
        var pathString = this.viewPointsToSvgPath(offsets,false,false);
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            pathString = pathString +' e';
        }
        return {
            type : "path",
            path : pathString
        };
    }


});
