Z.Polygon.Canvas = Z.Vector.Canvas.extend({
    doPaint:function(context,resources,platformOffset) {
        var geometry = this.geometry;
        var points = geometry.getPrjPoints();
        context.beginPath();  
        this.paintPrjPoints(context,points,platformOffset);
        context.closePath();
        context.stroke();
        this.fillGeo(context, this.fillSymbol);        
    }
});