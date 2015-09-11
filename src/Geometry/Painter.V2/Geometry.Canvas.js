//如果不支持canvas, 则不载入canvas的绘制逻辑
if (Z.Browser.canvas) {

    Symboling.Ellipse.Canvas={
        _paintOnCanvas:function(ctx, resources) {
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
            var map = this.geoMap();
            var pcenter = this._getPCenter();
            var pt = map._transform(pcenter);
            var size = this._getSvgSize();
            var width = size['width'];
            var height = size['height'];
            bezierEllipse(pt['left'],pt['top'],width,height);
        }
    };

    Z.Ellipse.include(Symboling.Ellipse.Canvas);

    Z.Circle.include(Symboling.Ellipse.Canvas);
    //----------------------------------------------------
    Z.Rectangle.include({
        _paintOnCanvas:function(ctx,resources) {
            var map = this.getMap();
            var pt = map._transform(this._getPNw());
            var size = this._getSvgSize();
            ctx.beginPath();
            ctx.rect(Z.Util.canvasNumber(pt.left), Z.Util.canvasNumber(pt.top),
                Z.Util.canvasNumber(size['width']),Z.Util.canvasNumber(size['height']));
            ctx.stroke();
        }
    });
    //----------------------------------------------------
    Z.Sector.include({
        _paintOnCanvas:function(ctx,resources) {
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
            var map = this.getMap();
            var pcenter = this._getPCenter();
            var pt = map._transform(pcenter);
            var size = this._getSvgSize();
            sector(pt['left'],pt['top'],size['width'],this.getStartAngle(),this.getEndAngle());
        }

    });
    //----------------------------------------------------

    Z.Polyline.include({
        _paintOnCanvas:function(context,resources) {
            var prjVertexes = this._getPrjPoints();
            var points = this._transformToScreenPoints(prjVertexes);
            context.beginPath();
            Z.Canvas.paintPoints(context,points,this.getSymbol()['line-dasharray']);
            context.stroke();
        }
    });

    Z.Polygon.include({
        _paintOnCanvas:function(context,resources) {
            var prjVertexes = this._getPrjPoints();
            context.beginPath();
            var points = this._transformToScreenPoints(prjVertexes);
            Z.Canvas.paintPoints(context,points,this.getSymbol()['line-dasharray']);
            context.closePath();
            context.stroke();
        }
    });
}