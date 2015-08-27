Z['Point']=Z.Point=function(left,top) {
     this['left']=left;
        this['top']=top;
};

Z.Point.prototype={
    distanceTo: function(point) {
        var x = point.left - this.left,
            y = point.top - this.top;

        return Math.sqrt(x * x + y * y);
    }
};