Z['Point']=Z.Point=function(left,top) {
     this['left']=left;
     this['top']=top;
};

Z.Point.prototype={
    distanceTo: function(point) {
        var x = point.left - this.left,
            y = point.top - this.top;
        return Math.sqrt(x * x + y * y);
    },

    //破坏性方法
    _add: function(_point) {
        if (!_point) {return;}
        this['left'] += _point['left'];
        this['top'] += _point['top'];
        return this;
    },

    add: function(point) {
        var offx = this.left + point.left,
            offy = this.top  + point.top;
        return new Z.Point(offx, offy);
    },

    substract: function(point) {
        var offx = this.left - point.left,
            offy = this.top  - point.top;
        return new Z.Point(offx, offy);
    },
    //破坏性方法
    _multi: function(ratio) {
        this['left'] *= ratio;
        this['top'] *= ratio;
        return this;
    }
};