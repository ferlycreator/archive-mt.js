Z.Ellipse.Canvas = Z.Polygon.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var center = geometry._getCenterDomOffset();
        var pt = new Z.Point(center["left"]+platformOffset['left'],center["top"]+platformOffset['top']);
        var pr = this.getPixelSize();
        var width = pr['width'];
        var height = pr['height'];
        this.BezierEllipse(context,pt['left'],pt['top'],width,height);
        // this.drawHoles(context,tileNw,geometry);

        this.fillGeo(context, this.fillSymbol);
    },

    BezierEllipse:function(ctx, x, y, a, b)
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

    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var w = geometry.getWidth(),
            h = geometry.getHeight();
        var map = geometry.getMap();
        return map.distanceToPixel(w/2,h/2);
    }
});