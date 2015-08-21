Z.Vector.Canvas = Z.Painter.Canvas.extend({
    paintPrjPoints:function(context, prjRings, platformOffset) {
        if (!Z.Util.isArrayHasData(prjRings)) {return;}
        // var map = this.geometry.getMap();
        var offsets = this.geometry._untransformToOffset(prjRings);
        for (var i=0, len=offsets.length;i<len;i++) {
            /*var px = map._untransformToOffset(prjRings[i]);
             var pt = {
                     left:(0.5 +px['left']+platformOffset['left'])<<0,
                     top:(0.5 +px['top']+platformOffset['top'])<<0
            };*/
            var pt = {
                     left:Z.Util.canvasNumber(offsets[i]['left']+platformOffset['left']),
                     top:Z.Util.canvasNumber(offsets[i]['top']+platformOffset['top'])
            };
             if (i === 0) {
                 context.moveTo(pt['left'],pt['top']);
             } else {
                 context.lineTo(pt['left'],pt['top']);
             }
        }
    }
});