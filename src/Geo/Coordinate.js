/**
 * 坐标类
 * @class maptalks.Coordinate
 * @author Maptalks Team
 */
Z['Coordinate'] = Z.Coordinate = function(x, y) {
    if (Z.Util.isNil(x)) {
        return;
    }
    if (Z.Util.isArray(x)) {
        //数组
        this.x = parseFloat(x[0]);
        this.y = parseFloat(x[1]);
    } else if (!Z.Util.isNil(x['x']) && !Z.Util.isNil(x['y'])) {
        //对象
        this.x = x['x'];
        this.y = x['y'];
    } else {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    }
};

Z.Coordinate.prototype={
    add:function(d) {
        return new Z.Coordinate(this.x+d.x, this.y+d.y);
    },
    substract:function(d) {
        return new Z.Coordinate(this.x-d.x, this.y-d.y);
    },
    multi: function(ratio) {
        return new Z.Coordinate(this.x*ratio, this.y*ratio);
    },
    /**
     * 比较两个坐标是否相等
     * @param {maptalks.Coordinate} c1
     * @param {maptalks.Coordinate} c1
     * @return {Boolean} true：坐标相等
     */
    equals:function(c2) {
        if (!Z.Util.isCoordinate(c2)) {
            return false;
        }
        return this.x === c2.x && this.y === c2.y;
    },
    isNaN:function() {
        return isNaN(this.x) || isNaN(this.y);
    }
};
