Z['Extent']=Z.Extent=Z.Geometry.extend({
    statics:{
        equals:function(ext1,ext2) {
            if (!ext1 || !ext2 || !(ext1 instanceof Z.Extent) || !(ext2 instanceof Z.Extent)) {
                return false;
            }
            return (ext1['xmin'] == ext2['xmin'] && ext1['xmax'] == ext2['xmax'] && ext1['ymin'] == ext2['ymin'] && ext1['ymax'] == ext2['ymax']);
        },
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
         * 两个Extent是否相交
         * @param  {[type]}  ext1 [description]
         * @param  {[type]}  ext2 [description]
         * @return {Boolean}      [description]
         */
        isIntersect:function(ext1, ext2) {
            if (!ext1 || !ext2) {return false;}
            if (!(ext1 instanceof Z.Extent) || !(ext2 instanceof Z.Extent)) {
                return false;
            }
            if (!ext1.isValid() || !ext2.isValid()) {
                return false;
            }
            var rxmin = Math.max(ext1['xmin'], ext2['xmin']);
            var rymin = Math.max(ext1['ymin'], ext2['ymin']);
            var rxmax = Math.min(ext1['xmax'], ext2['xmax']);
            var rymax = Math.min(ext1['ymax'], ext2['ymax']);
            var intersects = !((rxmin > rxmax) || (rymin > rymax));
            return intersects;
        },
        /**
        * 判断点是否在矩形中
        *
        *
        */
        contains: function(extent, coordinate) {

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
    },

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
            this['xmin'] = p1;
            this['ymin'] = p2;
            this['xmax'] = p3;
            this['ymax'] = p4;
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
    }
});
