Z.Vector.Canvas = Z.Painter.Canvas.extend({
    paintPrjPoints:function(context, prjRings, platformOffset) {
        if (!Z.Util.isArrayHasData(prjRings)) {return;}
        // var map = this.geometry.getMap();
        var offsets = this.geometry._transformToOffset(prjRings);
        for (var i=0, len=offsets.length;i<len;i++) {
            var pt = new Z.Point(
                    Z.Util.canvasNumber(offsets[i]['left']+platformOffset['left']),
                    Z.Util.canvasNumber(offsets[i]['top']+platformOffset['top'])
                );
             if (i === 0) {
                 context.moveTo(pt['left'],pt['top']);
             } else {
                 context.lineTo(pt['left'],pt['top']);
             }
        }
    }
});