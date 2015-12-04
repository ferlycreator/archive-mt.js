Z.Canvas = {
    createCanvas:function(width, height, canvasClass) {
        var canvas;
        if (!Z.runningInNode) {
            canvas = Z.DomUtil.createEl('canvas');
            canvas.width = width;
            canvas.height = height;
        } else {
            //can be node-canvas or any other canvas mock
            canvas = new canvasClass(width, height);
        }
        return canvas;
    },

    setDefaultCanvasSetting:function(context) {
        context.lineWidth = 3;
        context.strokeStyle = this.getRgba('#474cf8',1);
        context.fillStyle = this.getRgba('#ffffff',0);
        context.textAlign='start';
        context.textBaseline='hanging';
        var fontSize = 11;
        context.font=fontSize+'px arial';
        if (context.setLineDash) {
            context.setLineDash([]);
        }
        context.globalAlpha = 1;
        context.save();
    },

    prepareCanvasFont:function(ctx, style) {
        ctx.font='bold '+style['textSize']+'px '+style['textFaceName'];
        var fill=style['textFill'];
        if (!fill) {return;}
        var fillOpacity = style['textOpacity'];
        ctx.fillStyle =this.getRgba(fill, fillOpacity);
    },

    // TODO: no prepare, set style just before stroke/fill
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
             var fillOpacity = fillSymbol['fill-opacity'];
             // 2
             // will override 1 above if fillSymbol was set
             // context.globalAlpha = fillOpacity;
             // context.fillStyle = fill;
             context.fillStyle =this.getRgba(fill, fillOpacity);
         }
    },

    clearRect:function(ctx,x1,y1,x2,y2) {
        ctx.clearRect(x1, y1, x2, y2);
    },

    fillCanvas:function(context, fillStyle, fillOpacity){
        if (fillStyle) {
            if (!Z.Util.isString(fillStyle)/*fillStyle instanceof CanvasPattern*/) {
                context.globalAlpha = fillOpacity;
                context.fillStyle = fillStyle;
            } else if (Z.Util.isString(fillStyle)) {
                if (!Z.Canvas.hexColorRe.test(fillStyle)) {
                    context.globalAlpha = fillOpacity;
                }
                context.fillStyle = this.getRgba(fillStyle, fillOpacity);
            }
            context.fill('evenodd');
            context.globalAlpha = 1; // restore here?
        }
    },

    hexColorRe: /^#([0-9a-f]{6}|[0-9a-f]{3})$/i,

    // support #RRGGBB/#RGB now.
    // if color was like [red, orange...]/rgb(a)/hsl(a), op will not combined to result
    getRgba:function(color, op) {
        if (Z.Util.isNil(op)) {
            op = 1;
        }
        if (!Z.Canvas.hexColorRe.test(color)) {
            return color;
        }
        var r, g, b;
        if (color.length === 7) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else {
            r = parseInt(color.slice(1, 2), 16) * 17;
            g = parseInt(color.slice(2, 3), 16) * 17;
            b = parseInt(color.slice(3, 4), 16) * 17;
        }
        return "rgba("+r+","+g+","+b+","+op+")";
    },

    resetContextState:function(ctx) {
        ctx['maptalks-img-smoothing-disabled'] = false;
    },

    disableImageSmoothing:function(ctx) {

        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
    },

    enableImageSmoothing:function(ctx) {
        ctx.mozImageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx.msImageSmoothingEnabled = true;
        ctx.imageSmoothingEnabled = true;
    },

    image:function(ctx, pt, img, width, height) {
        var x=pt.x,y=pt.y;
        if (Z.Util.isNumber(width) && Z.Util.isNumber(height)) {
            ctx.drawImage(img,x,y,width,height);
        } else {
            ctx.drawImage(img,pt.x,pt.y);
        }
    },

    text:function(ctx, text, pt, style, textDesc) {
        // pt = pt.add(new Z.Point(style['textDx'], style['textDy']));
        this._textOnMultiRow(ctx, textDesc['rows'], style, pt, textDesc['size'], textDesc['rawSize']);
    },

    _textOnMultiRow: function(ctx, texts, style, point, splitTextSize, textSize) {
        var ptAlign = Z.StringUtil.getAlignPoint(splitTextSize,style['textHorizontalAlignment'],style['textVerticalAlignment']);
        var lineHeight = textSize['height']+style['textLineSpacing'];
        var basePoint = point.add(new Z.Point(0, ptAlign.y));
        for(var i=0,len=texts.length;i<len;i++) {
            var text = texts[i]['text'];
            var rowAlign = Z.StringUtil.getAlignPoint(texts[i]['size'],style['textHorizontalAlignment'],style['textVerticalAlignment']);
            Z.Canvas._textOnLine(ctx, text, basePoint.add(new Z.Point(rowAlign.x, i*lineHeight)), style['textHaloRadius'], style['textHaloFill']);
        }
    },

    _textOnLine: function(ctx, text, pt, textHaloRadius, textHaloFill) {
        //http://stackoverflow.com/questions/14126298/create-text-outline-on-canvas-in-javascript
        //根据text-horizontal-alignment和text-vertical-alignment计算绘制起始点偏移量
        pt = pt.add(new Z.Point(0,3));
        if (textHaloRadius) {
            ctx.miterLimit = 2;
            ctx.lineJoin = 'circle';
            var lineWidth=(textHaloRadius*2-1);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle =Z.Canvas.getRgba(textHaloFill, 1);
            ctx.strokeText(text, pt.x, pt.y);
            ctx.lineWidth = 1;
            ctx.miterLimit = 10; //default
        }
        ctx.fillText(text, pt.x, pt.y);
    },


    shield: function (ctx, point, img, text, textDesc, style) {
        var width = img.width,
            height = img.height,
            imgPos = point.substract(new Z.Point(width/2, height/2));
        Z.Canvas.image(ctx, imgPos, img, width, height);
        Z.Canvas.text(ctx, text, point, style, textDesc);
    },

    _path:function(context, points, lineDashArray) {

        function drawDashLine(startPoint, endPoint, dashArray) {
          //https://davidowens.wordpress.com/2010/09/07/html-5-canvas-and-dashed-lines/
          //
          // Our growth rate for our line can be one of the following:
          //   (+,+), (+,-), (-,+), (-,-)
          // Because of this, our algorithm needs to understand if the x-coord and
          // y-coord should be getting smaller or larger and properly cap the values
          // based on (x,y).
              var fromX = startPoint.x,fromY = startPoint.y,
                toX = endPoint.x,toY = endPoint.y;
              var pattern = dashArray;
              var lt = function (a, b) { return a <= b; };
              var gt = function (a, b) { return a >= b; };
              var capmin = function (a, b) { return Math.min(a, b); };
              var capmax = function (a, b) { return Math.max(a, b); };

              var checkX = { thereYet: gt, cap: capmin };
              var checkY = { thereYet: gt, cap: capmin };

              if (fromY - toY > 0) {
                checkY.thereYet = lt;
                checkY.cap = capmax;
              }
              if (fromX - toX > 0) {
                checkX.thereYet = lt;
                checkX.cap = capmax;
              }

              context.moveTo(fromX, fromY);
              var offsetX = fromX;
              var offsetY = fromY;
              var idx = 0, dash = true;
              while (!(checkX.thereYet(offsetX, toX) && checkY.thereYet(offsetY, toY))) {
                var ang = Math.atan2(toY - fromY, toX - fromX);
                var len = pattern[idx];

                offsetX = checkX.cap(toX, offsetX + (Math.cos(ang) * len));
                offsetY = checkY.cap(toY, offsetY + (Math.sin(ang) * len));

                if (dash) {context.lineTo(offsetX, offsetY);}
                else {context.moveTo(offsetX, offsetY);}

                idx = (idx + 1) % pattern.length;
                dash = !dash;
              }
        }
        if (!Z.Util.isArrayHasData(points)) {return;}

        var isDashed = Z.Util.isArrayHasData(lineDashArray);
        for (var i=0, len=points.length; i<len;i++) {
            var point = new Z.Point(
                Z.Util.canvasRound(points[i].x),
                Z.Util.canvasRound(points[i].y)
            );
            if (!isDashed || context.setLineDash) {//ie9以上浏览器
                if (i === 0) {
                    context.moveTo(point.x, point.y);
                } else {
                    context.lineTo(point.x,point.y);
                }
            } else {
                if (isDashed) {
                    if(i === len-1) {
                        break;
                    }
                    var nextPoint = new Z.Point(
                        Z.Util.canvasRound(points[i+1].x),
                        Z.Util.canvasRound(points[i+1].y)
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
        //因为canvas只填充moveto,lineto,lineto的空间, 而dashline的moveto不再构成封闭空间, 所以重新绘制图形轮廓用于填充
        if (Z.Util.isArrayHasData(lineDashArray) && !context.setLineDash) {
            context.save();
            context.beginPath();
            context.strokeStyle = Z.Canvas.getRgba("#ffffff",0);
            for (var j = points.length - 1; j >= 0; j--) {
                var outline = points[j];
                if (j === points.length - 1) {
                    context.moveTo(Z.Util.canvasRound(outline.x), Z.Util.canvasRound(outline.y));
                } else {
                    context.lineTo(Z.Util.canvasRound(outline.x),Z.Util.canvasRound(outline.y));
                }
            }
            context.closePath();
            context.stroke();
            context.restore();
        }


    },

    bezierCurve:function(context, points, lineDashArray) {
        context.beginPath(points);
        context.moveTo(points[0].x,points[0].y);
        context.bezierCurveTo(points[1].x,points[1].y,points[2].x,points[2].y,points[3].x,points[3].y);
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
        if (size['width'] === size['height']) {
            //如果高宽相同,则直接绘制圆形, 提高效率
            ctx.beginPath();
            ctx.arc(pt.x,pt.y,size['width'],0,2*Math.PI);
            ctx.stroke();
        } else {
            bezierEllipse(pt.x,pt.y,size["width"],size["height"]);
        }

    },

    rectangle:function(ctx, pt, size) {
        ctx.beginPath();
        ctx.rect(Z.Util.canvasRound(pt.x), Z.Util.canvasRound(pt.y),
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
        sector(ctx,pt.x,pt.y,size,startAngle,endAngle);
    }
};
