Z.Polygon.SVG=Z.Vector.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        var geometry = this.geometry;
        var offsets = geometry.untransformToOffset(geometry.getPrjPoints());
        var pathString = this.domOffsetsToSVGPath(offsets,true,false);
        if (!pathString) {
            return null;
        }
        var holePathes = this.getHolePathes();
        if (Z.Util.isArrayHasData(holePathes)) {
            pathString = pathString + ' ' + holePathes.join(' ');
        }
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            pathString = pathString +' e';
        }
        return {
            type : 'path',
            path : pathString
        };
    },

    /**
     * 生成hole的SVG Path
     * @return {Array} [hole的SVG Path 数组]
     */
    getHolePathes:function() {
        if (!this.geometry || !this.geometry.hasHoles()) {
            return null;
        }
        var geometry=this.geometry;
        var prjHoles = geometry.getPrjHoles();
        var result = [];
        for (var i=0,len=prjHoles.length;i<len;i++) {
            var holeOffset = geometry.untransformToOffset(prjHoles[i]);
            result.push(this.domOffsetsToSVGPath(holeOffset,true,true));
        } 
        return result;
    }
});