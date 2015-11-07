/**
 * 点
 * @class maptalks.Point
 * @author Maptalks Team
 */
Z['Point']=Z.Point=function(left,top) {
     if (Z.Util.isArrayHasData(left)) {
        this['left'] = left[0];
        this['top'] = left[1];
     } else {
        this['top'] = top;
        this['left'] = left;
     }
};

Z.Point.prototype={
    round:function() {
        return new Z.Point(Math.round(this['left']),Math.round(this['top']));
    },
    equals:function(p) {
        return this['left'] === p['left'] && this['top'] === p['top'];
    },

    distanceTo: function(point) {
        var x = point.left - this.left,
            y = point.top - this.top;
        return Math.sqrt(x * x + y * y);
    },

    //破坏性方法
    _add: function(_point) {
        // if (!_point) {return;}
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
    },
    multi: function(ratio) {
        return new Z.Point(this['left']*ratio, this['top']*ratio);
    },
    isNaN:function() {
        return isNaN(this['left']) || isNaN(this['top']);
    }
};
