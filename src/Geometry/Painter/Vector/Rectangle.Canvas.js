Z.Rectangle.Canvas = Z.Polygon.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var map = geometry.getMap();
        var nw = map.untransformToOffset(geometry.getPNw());
        var pixelSize = this.getPixelSize();

        var pt = {
             left:nw["left"]+platformOffset['left'],
             top:nw["top"]+platformOffset['top']
        };
        context.beginPath();  
        context.rect(Z.Util.canvasNumber(pt.left), Z.Util.canvasNumber(pt.top),Z.Util.canvasNumber(pixelSize['px']),Z.Util.canvasNumber(pixelSize['py']));
        // this.drawHoles(context,tileNw,geometry);        
        context.stroke();
        this.fillGeo(context, this.fillSymbol);        
    },

    getPixelSize:function() {
        var geometry = this.geometry;
        var w = geometry.getWidth(),
            h = geometry.getHeight();
        var map = geometry.getMap();
        return map.distanceToPixel(w,h);
    }
});