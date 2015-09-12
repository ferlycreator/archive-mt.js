Z.Vector.Canvas = Z.Painter.Canvas.extend({
    paintPrjPoints:function(context, prjRings, platformOffset) {
        if (!Z.Util.isArrayHasData(prjRings)) {return;}
        var offsets = this.geometry._transformToOffset(prjRings);
        var symbol = this.strokeSymbol;
        var dashArray = symbol.strokeDasharray;
        for (var i=0, len=offsets.length; i<len;i++) {
            var startPoint = new Z.Point(
                Z.Util.canvasRound(offsets[i]['left']+platformOffset['left']),
                Z.Util.canvasRound(offsets[i]['top']+platformOffset['top'])
            );
            if (context.setLineDash) {//ie9以上浏览器
                if (i === 0) {
                    context.moveTo(startPoint['left'], startPoint['top']);
                } else {
                    context.lineTo(startPoint['left'],startPoint['top']);
                }
            } else {
                if(i === len-1) break;
                var endPoint = new Z.Point(
                    Z.Util.canvasRound(offsets[i+1]['left']+platformOffset['left']),
                    Z.Util.canvasRound(offsets[i+1]['top']+platformOffset['top'])
                );
                this.drawLine(startPoint, endPoint, dashArray, context);
            }
         }
    },

    /**
    * 出处：http://outofmemory.cn/code-snippet/10602/canvas-carry-arrow--IE8
    */
    drawLine: function(startPoint, endPoint, dashArray, context) {
        var x = startPoint.left,y = startPoint.top,
            x2 = endPoint.left,y2 = endPoint.top;
        if (!dashArray) dashArray = [10, 5];
        var dashCount = dashArray.length;
        context.moveTo(x, y);
        var dx = Math.abs(x2 - x), dy = Math.abs(y2 - y);
        var slope = dy / dx;
        var distRemaining = Math.sqrt(dx * dx + dy * dy);
        var dashIndex = 0, draw = true;
        while (distRemaining >= 0.1 && dashIndex < 10000) {
            var dashLength = dashArray[dashIndex++ % dashCount];
            if (dashLength == 0) dashLength = 0.001; // Hack for Safari
            if (dashLength > distRemaining) dashLength = distRemaining;
            var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
            x += xStep
            y += slope * xStep;
            context[draw ? 'lineTo' : 'moveTo'](x, y);
            distRemaining -= dashLength;
            draw = !draw;
        }
    }
});