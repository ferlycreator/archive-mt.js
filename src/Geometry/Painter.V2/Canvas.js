Z.Canvas = {

    setDefaultCanvasSetting:function(context) {
        context.lineWidth = 1;
        context.strokeStyle = this.getRgba("#474cf8",1);
        context.fillStyle = this.getRgba("#ffffff",0);
        context.textAlign="start";
        context.textBaseline="hanging";
        context.font="11px SIMHEI";
        if (context.setLineDash) {
            context.setLineDash([]);
        }
        context.save();
    },

    prepareCanvas:function(context, strokeSymbol, fillSymbol){
        context.restore();
        if (strokeSymbol) {
            var strokeWidth = strokeSymbol['stroke-width'];
            if (!Z.Util.isNil(strokeWidth)) {context.lineWidth = strokeWidth;}
            var strokeOpacity = strokeSymbol['stroke-opacity'];
            if (strokeWidth === 0) {
                strokeOpacity = 0;
            }
            var strokeColor = strokeSymbol['stroke'];
             if (strokeColor)  {
                 if (Z.Util.isNil(strokeOpacity)) {
                     strokeOpacity = 1;
                 }
                 context.strokeStyle = this.getRgba(strokeColor,strokeOpacity);
             }
             //低版本ie不支持该属性
             if (context.setLineDash) {
                 var strokeDash=(strokeSymbol['stroke-dasharray']);
                 if (Z.Util.isArrayHasData(strokeDash)) {
                     context.setLineDash(strokeDash);
                 }
             }
         }
         if (fillSymbol) {
             var fill=fillSymbol['fill'];
             if (!fill) {return;}
             if (Z.Util.isNil(fillSymbol['fill-opacity'])) {
                 fillSymbol['fill-opacity'] = 1;
             }
             if (fill.length>7 && 'url' ===fill.substring(0,3)) {
                 var imgUrl = fill.substring(5,fill.length-2);
                 var imageTexture = document.createElement('img');
                 imageTexture.src = imgUrl;
                 var woodfill = context.createPattern(imageTexture, 'repeat');
                 context.fillStyle = woodfill;
             }else {
                 context.fillStyle =this.getRgba(fill);
             }
         }
    },

    fillCanvas:function(context, fillSymbol){
        if (fillSymbol) {
             if (!Z.Util.isNil(fillSymbol['fill-opacity'])) {
                 context.globalAlpha = fillSymbol['fill-opacity'];
             }
             context.fill('evenodd');
             context.globalAlpha = 1;
        }
    },

    getRgba:function(color, op) {
        if (Z.Util.isNil(op)) {
            op = 1;
        }
        var rgb = {
            r: parseInt(color.slice(1, 3), 16),
            g: parseInt(color.slice(3, 5), 16),
            b: parseInt(color.slice(5, 7), 16)
        };
        return "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+op+")";
    },

    paintPoints:function(context, points, lineDashArray) {
            /**
            * 出处：http://outofmemory.cn/code-snippet/10602/canvas-carry-arrow--IE8
            */
            function drawDashLine(startPoint, endPoint, dashArray) {
                var x = startPoint.left,y = startPoint.top,
                    x2 = endPoint.left,y2 = endPoint.top;
                // if (!dashArray) dashArray = [10, 5];
                var dashCount = dashArray.length;
                context.moveTo(x, y);
                var dx = Math.abs(x2 - x), dy = Math.abs(y2 - y);
                var slope = dy / dx;
                var distRemaining = Math.sqrt(dx * dx + dy * dy);
                var dashIndex = 0, draw = true;
                while (distRemaining >= 0.1 && dashIndex < 10000) {
                    var dashLength = dashArray[dashIndex++ % dashCount];
                    if (dashLength === 0) {dashLength = 0.001;} // Hack for Safari
                    if (dashLength > distRemaining) {dashLength = distRemaining;}
                    var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
                    x += xStep;
                    y += slope * xStep;
                    context[draw ? 'lineTo' : 'moveTo'](x, y);
                    distRemaining -= dashLength;
                    draw = !draw;
                }
            }
            if (!Z.Util.isArrayHasData(points)) {return;}

            var isDashed = Z.Util.isArrayHasData(lineDashArray);
            for (var i=0, len=points.length; i<len;i++) {
                var point = new Z.Point(
                    Z.Util.canvasNumber(points[i]['left']),
                    Z.Util.canvasNumber(points[i]['top'])
                );
                if (!isDashed || context.setLineDash) {//ie9以上浏览器
                    if (i === 0) {
                        context.moveTo(point['left'], point['top']);
                    } else {
                        context.lineTo(point['left'],point['top']);
                    }
                } else {
                    if (isDashed) {
                        if(i === len-1) {break;}
                        var nextPoint = new Z.Point(
                            Z.Util.canvasNumber(points[i+1]['left']),
                            Z.Util.canvasNumber(points[i+1]['top'])
                        );
                        drawDashLine(point, nextPoint, lineDashArray);
                    }
                }
             }
        }
};