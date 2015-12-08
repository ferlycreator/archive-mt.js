/**
 * 点
 * @class maptalks.Point
 * @author Maptalks Team
 */
Z.Point=function(x,y) {
    if (Z.Util.isArrayHasData(x)) {
        this.x = x[0];
        this.y = x[1];
     } else if (!Z.Util.isNil(x.x) && !Z.Util.isNil(x.y)) {
        //对象
        this.x = x.x;
        this.y = x.y;
    }else {
        this.y = y;
        this.x = x;
     }
     if (this.isNaN()) {
        throw new Error('point is NaN');
     }
};

Z.Point.prototype={
    copy:function() {
        return new Z.Point(this.x, this.y);
    },

    round:function() {
        return new Z.Point(Z.Util.round(this.x),Z.Util.round(this.y));
    },
    equals:function(p) {
        return this.x === p.x && this.y === p.y;
    },

    distanceTo: function(point) {
        var x = point.x - this.x,
            y = point.y - this.y;
        return Math.sqrt(x * x + y * y);
    },

    //破坏性方法
    _add: function(_point) {
        // if (!_point) {return;}
        this.x += _point.x;
        this.y += _point.y;
        return this;
    },

    add: function(point) {
        var offx = this.x + point.x,
            offy = this.y  + point.y;
        return new Z.Point(offx, offy);
    },

    substract: function(point) {
        var offx = this.x - point.x,
            offy = this.y  - point.y;
        return new Z.Point(offx, offy);
    },
    //破坏性方法
    _multi: function(ratio) {
        this.x *= ratio;
        this.y *= ratio;
        return this;
    },
    multi: function(ratio) {
        return new Z.Point(this.x*ratio, this.y*ratio);
    },
    isNaN:function() {
        return isNaN(this.x) || isNaN(this.y);
    },
    toString:function() {
        return [this.x,this.y].join(',');
    }
};
