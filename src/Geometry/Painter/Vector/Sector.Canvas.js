Z.Sector.Canvas = Z.Polygon.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var center = geometry.getCenterDomOffset();
        var pt = {
             left:center["left"]+platformOffset['left'],
             top:center["top"]+platformOffset['top']
        };        
        var pr = this.getPixelSize();
        this.sector(context, pt['left'],pt['top'],pr['px'],geometry.getStartAngle(),geometry.getEndAngle());
        context.stroke();
        this.fillGeo(context, this.fillSymbol);    
        
    },

    sector:function(ctx, x, y, radius, startAngle, endAngle) {
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
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var r = geometry.getRadius();
        var map = geometry.getMap();
        return map.distanceToPixel(r,r);
    }
});