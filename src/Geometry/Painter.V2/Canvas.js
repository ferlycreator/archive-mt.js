Z.Canvas = {

    setDefaultCanvasSetting:function(context) {
        context.lineWidth = Z.Browser.retina?6:3;
        context.strokeStyle = this.getRgba("#474cf8",1);
        context.fillStyle = this.getRgba("#ffffff",0);
        context.textAlign="start";
        context.textBaseline="hanging";
        var fontSize = Z.Browser.retina?22:11;
        context.font=fontSize+"px arial";
        if (context.setLineDash) {
            context.setLineDash([]);
        }
        context.save();
    },

    prepareCanvasFont:function(ctx, style) {
        var ratio = Z.Browser.retina?2:1;
        ctx.font='bold '+style['text-size']*ratio+'px '+style['text-face-name'];
    },

    prepareCanvas:function(context, strokeSymbol, fillSymbol, resources){
        var ratio = Z.Browser.retina ? 2:1;
        context.restore();
        if (strokeSymbol) {
            var strokeWidth = strokeSymbol['stroke-width'];
            if (!Z.Util.isNil(strokeWidth)) {context.lineWidth = strokeWidth*ratio;}
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
                    if (ratio !== 1) {
                        //dash数组也全都*ratio
                        strokeDash = Z.Util.eachInArray(strokeDash, this, function(dash) {
                            return dash*ratio;
                        });
                    }
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
                 /*var imageTexture = document.createElement('img');
                 imageTexture.src = imgUrl;*/
                 //#23
                 if (resources) {
                    var imageTexture = resources.getImage(imgUrl);
                    var woodfill = context.createPattern(imageTexture, 'repeat');
                    context.fillStyle = woodfill;
                 }
             }else {
                 context.fillStyle =this.getRgba(fill);
             }
         }
    },

    clearRect:function(ctx,x1,y1,x2,y2) {
        var ratio = Z.Browser.retina?2:1;
        ctx.clearRect(x1*ratio, y1*ratio, x2*ratio, y2*ratio);
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

    image:function(ctx, pt, img, width, height) {
        var ratio = Z.Browser.retina ? 2:1;
        pt = pt.multi(ratio);
        var left=pt['left'],top=pt['top'];
        if (Z.Util.isNumber(width) && Z.Util.isNumber(height)) {
            width *= ratio;
            height *= ratio;
            ctx.drawImage(img,left,top,width,height);
        } else {
            ctx.drawImage(img,pt['left'],pt['top']);
        }
    },

    text:function(ctx, text, pt, style, size) {
        //http://stackoverflow.com/questions/14126298/create-text-outline-on-canvas-in-javascript
        var ratio = Z.Browser.retina ? 2:1;
        size = size.multi(ratio);

        //根据text-horizontal-alignment和text-vertical-alignment计算绘制起始点偏移量
        var alignX, alignY;
        var hAlign = style['text-horizontal-alignment'];
        if (hAlign === 'right') {
            alignX = -size['width'];
        } else if (hAlign === 'middle') {
            alignX = -size['width']/2;
        } else {
            alignX = 0;
        }
        var vAlign = style['text-vertical-alignment'];
        if (vAlign === 'top') {
            alignY = size['height']/2;
        } else if (vAlign === 'middle') {
            alignY = 0;
        } else {
            alignY = -size['height']/2;
        }

        var ptAlign = new Z.Point(Z.Util.canvasRound(alignX), Z.Util.canvasRound(alignY));
        pt = pt.add(ptAlign);

        if (style['text-halo-radius']) {
            ctx.miterLimit = 2;
            ctx.lineJoin = 'circle';
            ctx.lineWidth = (style['text-halo-radius']*2-1)*ratio;
            ctx.strokeText(text, pt['left'], pt['top']);
            ctx.lineWidth = 1*ratio;
            ctx.miterLimit = 10; //default
        }


        pt = pt.multi(ratio);
        ctx.fillText(text, pt['left'], pt['top']);
    },

    _path:function(context, points, lineDashArray) {
        var ratio = Z.Browser.retina ? 2:1;
        /**
        * 出处：http://outofmemory.cn/code-snippet/10602/canvas-carry-arrow--IE8
        */
        function drawDashLine(startPoint, endPoint, dashArray) {
            var x = startPoint.left,y = startPoint.top,
                x2 = endPoint.left,y2 = endPoint.top;
            if (ratio !== 1) {
                //dash数组也全都*ratio
                dashArray = Z.Util.eachInArray(dashArray, this, function(dash) {
                    return dash*ratio;
                });
            }
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
                context[draw ? 'lineTo' : 'moveTo'](x*ratio, y*ratio);
                distRemaining -= dashLength;
                draw = !draw;
            }
        }
        if (!Z.Util.isArrayHasData(points)) {return;}

        var isDashed = Z.Util.isArrayHasData(lineDashArray);
        for (var i=0, len=points.length; i<len;i++) {
            var point = new Z.Point(
                Z.Util.canvasRound(points[i]['left']),
                Z.Util.canvasRound(points[i]['top'])
            );
            if (!isDashed || context.setLineDash) {//ie9以上浏览器
                if (i === 0) {
                    context.moveTo(point['left']*ratio, point['top']*ratio);
                } else {
                    context.lineTo(point['left']*ratio,point['top']*ratio);
                }
            } else {
                if (isDashed) {
                    if(i === len-1) {break;}
                    var nextPoint = new Z.Point(
                        Z.Util.canvasRound(points[i+1]['left']),
                        Z.Util.canvasRound(points[i+1]['top'])
                    );
                    drawDashLine(point, nextPoint, lineDashArray);
                }
            }
         }
    },

    path:function(context, points, lineDashArray) {
        context.beginPath();
        Z.Canvas._path(context,points,lineDashArray);
        context.stroke();
    },

    polygon:function(context, points, lineDashArray) {
        context.beginPath();
        Z.Canvas._path(context,points,lineDashArray);
        context.closePath();
        context.stroke();
    },

    bezierCurve:function(context, points, lineDashArray) {

        var ratio = Z.Browser.retina ? 2:1;
        context.beginPath(points);
        context.moveTo(points[0].left*ratio,points[0].top*ratio);
        context.bezierCurveTo(points[1].left*ratio,points[1].top*ratio,points[2].left*ratio,points[2].top*ratio,points[3].left*ratio,points[3].top*ratio);
        context.stroke();
    },

    //各种图形的绘制方法
    ellipse:function (ctx, pt, size) {
        //TODO canvas scale后会产生错误?
        function bezierEllipse( x, y, a, b)
        {
           var k = 0.5522848,
           ox = a * k, // 水平控制点偏移量
           oy = b * k; // 垂直控制点偏移量
           ctx.beginPath();
           //从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
           ctx.moveTo(x - a, y);
           ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
           ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
           ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
           ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
           ctx.closePath();
           ctx.stroke();
        }
        var ratio = Z.Browser.retina?2:1;
        pt = pt.multi(ratio);
        size = size.multi(ratio);
        if (size['width'] === size['height']) {
            //如果高宽相同,则直接绘制圆形, 提高效率
            ctx.beginPath();
            ctx.arc(pt['left'],pt['top'],size['width'],0,2*Math.PI);
            ctx.stroke();
        } else {
            bezierEllipse(pt['left'],pt['top'],size["width"],size["height"]);
        }

    },

    rectangle:function(ctx, pt, size) {
        var ratio = Z.Browser.retina?2:1;
        pt = pt.multi(ratio);
        size = size.multi(ratio);
        ctx.beginPath();
        ctx.rect(Z.Util.canvasRound(pt['left']), Z.Util.canvasRound(pt['top']),
            Z.Util.canvasRound(size['width']),Z.Util.canvasRound(size['height']));
        ctx.stroke();
    },

    sector:function(ctx, pt, size, startAngle, endAngle) {
        function sector(ctx, x, y, radius, startAngle, endAngle) {
            var rad = Math.PI / 180;
            var sDeg = rad*-endAngle;
            var eDeg = rad*-startAngle;
            // 初始保存
            ctx.save();
            // 位移到目标点
            ctx.translate(x, y);
            ctx.beginPath();
            // 画出圆弧
            ctx.arc(0,0,radius,sDeg, eDeg);
            // 再次保存以备旋转
            ctx.save();
            // 旋转至起始角度
            ctx.rotate(eDeg);
            // 移动到终点，准备连接终点与圆心
            //ctx.moveTo(radius,0);
            // 连接到圆心
            ctx.lineTo(0,0);
            // 还原
            ctx.restore();
            // 旋转至起点角度
            ctx.rotate(sDeg);
            // 从圆心连接到起点
            ctx.lineTo(radius,0);
            ctx.closePath();
            ctx.restore();
            ctx.stroke();
        }
        var ratio = Z.Browser.retina?2:1;
        pt = pt.multi(ratio);
        size = size.multi(ratio);
        sector(ctx,pt['left'],pt['top'],size['width'],startAngle,endAngle);
    }
};
