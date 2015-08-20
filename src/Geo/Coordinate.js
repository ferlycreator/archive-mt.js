Z['Coordinate'] = Z.Coordinate = function(x,y) {
    
    if (Z.Util.isArray(x)) {
        //数组
        this.x = parseFloat(x[0]);
        this.y = parseFloat(x[1]);
    } else if (!Z.Util.isNil(x['x']) && !Z.Util.isNil(x['y'])) {
        //对象
        this.x = x['x'];
        this.y = x['y'];
    } else {
        this.x=parseFloat(x);
        this.y=parseFloat(y);   
    }
};

//static functions on Coordinate class
Z.Util.extend(Z.Coordinate,{
    equals:function(c1,c2) {
        if (!Z.Util.isCoordinate(c1) || !Z.Util.isCoordinate(c2)) {
            return false;
        }
        return c1.x === c2.x && c1.y === c2.y;
    }
});



