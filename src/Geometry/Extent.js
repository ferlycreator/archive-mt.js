Z['Extent']=Z.Extent=Z.Geometry.extend({

    initialize:function(p1,p2,p3,p4) {
        this['xmin'] = null;
        this['xmax'] = null;
        this['ymin'] = null;
        this['ymax'] = null;
        //构造方法一: 参数都是数字
        if (Z.Util.isNumber(p1) &&
            Z.Util.isNumber(p2) &&
            Z.Util.isNumber(p3) &&
            Z.Util.isNumber(p4)) {
            this['xmin'] = Math.min(p1,p3);
            this['ymin'] = Math.min(p2,p4);
            this['xmax'] = Math.max(p1,p3);
            this['ymax'] = Math.max(p2,p4);
            return;
        } else {
            //构造方法二: 参数是两个坐标
            if (p1 && p2 &&
                !Z.Util.isNil(p1.x) &&
                !Z.Util.isNil(p2.x) &&
                !Z.Util.isNil(p1.y) &&
                !Z.Util.isNil(p2.y)) {
                if (p1.x>p2.x) {
                    this['xmin'] = p2.x;
                    this['xmax'] = p1.x;
                } else {
                    this['xmin'] = p1.x;
                    this['xmax'] = p2.x;
                }
                if (p1.y>p2.y) {
                    this['ymin'] = p2.y;
                    this['ymax'] = p1.y;
                } else {
                    this['ymin'] = p1.y;
                    this['ymax'] = p2.y;
                }
            }
        }

    },

    toJson:function() {
        return {
            'xmin':this['xmin'],
            'ymin':this['ymin'],
            'xmax':this['xmax'],
            'ymax':this['ymax']
        };
    },

    isValid:function() {
        return Z.Util.isNumber(this['xmin']) &&
                Z.Util.isNumber(this['ymin']) &&
                Z.Util.isNumber(this['xmax']) &&
                Z.Util.isNumber(this['ymax']);
    },

    equals:function(ext2) {
        if (!ext2  || !(ext2 instanceof Z.Extent)) {
            return false;
        }
        return (this['xmin'] == ext2['xmin'] &&
            this['xmax'] == ext2['xmax'] &&
            this['ymin'] == ext2['ymin'] &&
            this['ymax'] == ext2['ymax']);
    },
});


//static methods on Extent
Z.Util.extend(Z.Extent, {


        /**
         * 合并两个extent
         */
        combine:function(ext1,ext2) {
            if (!ext1 || !ext2) {
                if (ext1) {
                    return ext1;
                } else if (ext2) {
                    return ext2;
                }
                return null;
            }
            if (!(ext1 instanceof Z.Extent) || !(ext2 instanceof Z.Extent)) {
                return false;
            }
            var xmin = ext1['xmin'];
            if (!Z.Util.isNumber(xmin)) {
                xmin = ext2['xmin'];
            } else if (Z.Util.isNumber(ext2['xmin'])) {
                if (xmin>ext2['xmin']) {
                    xmin = ext2['xmin'];
                }
            }

            var xmax = ext1['xmax'];
            if (!Z.Util.isNumber(xmax)) {
                xmax = ext2['xmax'];
            } else if (Z.Util.isNumber(ext2['xmax'])) {
                if (xmax<ext2['xmax']) {
                    xmax = ext2['xmax'];
                }
            }

            var ymin = ext1['ymin'];
            if (!Z.Util.isNumber(ymin)) {
                ymin = ext2['ymin'];
            } else if (Z.Util.isNumber(ext2['ymin'])) {
                if (ymin>ext2['ymin']) {
                    ymin = ext2['ymin'];
                }
            }

            var ymax = ext1['ymax'];
            if (!Z.Util.isNumber(ymax)) {
                ymax = ext2['ymax'];
            } else if (Z.Util.isNumber(ext2['ymax'])) {
                if (ymax<ext2['ymax']) {
                    ymax = ext2['ymax'];
                }
            }

            return new Z.Extent(xmin,ymin,xmax,ymax);
        },



        /**
        * 判断点是否在矩形中
        *
        *
        */
        contains: function(extent, coordinate) {
            var x, y;

            if (coordinate instanceof Z.Coordinate) {
                x = coordinate.x;
                y = coordinate.y;
            } else if (coordinate instanceof Z.Point) {
                x = coordinate.left;
                y = coordinate.top;
            } else {
                x = coordinate.left;
                y = coordinate.top;
            }
            return (x >= extent.xmin) &&
                (x <= extent.xmax) &&
                (y >= extent.ymin) &&
                (y <= extent.ymax);
        },

        /**
         * 扩大Extent
         * @param  {[type]} ext      [description]
         * @param  {[type]} distance [description]
         * @return {[type]}          [description]
         */
        expand:function(ext, distance) {
            if (!ext) {
                return null;
            }
            if (!(ext instanceof Z.Extent)) {
                return null;
            }
            return new Z.Extent(ext['xmin']-distance, ext['ymin']-distance,ext['xmax']+distance,ext['ymax']+distance);
        }
    });