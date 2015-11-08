/**
 * 图形范围类
 * @class maptalks.Extent
 * @author Maptalks Team
 */
Z['Extent']= Z.Extent =
 /**
  * @constructor
  * @param {maptalks.Coordinate} p1 坐标
  * @param {maptalks.Coordinate} p2 坐标
  * @param {maptalks.Coordinate} p3 坐标
  * @param {maptalks.Coordinate} p4 坐标
  * @returns {maptalks.Extent} extent对象
  */
 function(p1,p2,p3,p4) {
    this['xmin'] = null;
    this['xmax'] = null;
    this['ymin'] = null;
    this['ymax'] = null;
    if (Z.Util.isNil(p1) || Z.Util.isNil(p2)) {
        return;
    }
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
        var fieldX = (Z.Util.isNumber(p1['left'])?'left':'x');
        var fieldY = (Z.Util.isNumber(p1['top'])?'top':'y');
        if (Z.Util.isNumber(p1[fieldX]) &&
            Z.Util.isNumber(p2[fieldX]) &&
            Z.Util.isNumber(p1[fieldY]) &&
            Z.Util.isNumber(p2[fieldY])) {
            if (p1[fieldX]>p2[fieldX]) {
                this['xmin'] = p2[fieldX];
                this['xmax'] = p1[fieldX];
            } else {
                this['xmin'] = p1[fieldX];
                this['xmax'] = p2[fieldX];
            }
            if (p1[fieldY]>p2[fieldY]) {
                this['ymin'] = p2[fieldY];
                this['ymax'] = p1[fieldY];
            } else {
                this['ymin'] = p1[fieldY];
                this['ymax'] = p2[fieldY];
            }
        }
    }
};

Z.Extent.prototype={
    getSize:function() {
        return new Z.Size(this.getWidth(), this.getHeight());
    },
    getWidth:function() {
        return this['xmax'] - this['xmin'];
    },

    getHeight:function() {
        return this['ymax'] - this['ymin'];
    },

    getMin:function() {
        return new Z.Point(this['xmin'],this['ymin']);
    },

    getMax:function() {
        return new Z.Point(this['xmax'],this['ymax']);
    },

    /**
     * 将extent对象转化为json对象
     * @return {Object} jsonObject
     */
    toJson:function() {
        return {
            'xmin':this['xmin'],
            'ymin':this['ymin'],
            'xmax':this['xmax'],
            'ymax':this['ymax']
        };
    },


    /**
     * 判断extent是否有效
     * @return {Boolean} true：表明有效
     */
    isValid:function() {
        return Z.Util.isNumber(this['xmin']) &&
                Z.Util.isNumber(this['ymin']) &&
                Z.Util.isNumber(this['xmax']) &&
                Z.Util.isNumber(this['ymax']);
    },


    /**
     * 比较两个Extent是否相等
     * @param  {maptalks.Extent}  ext2 比较的extent
     * @return {Boolean} true：表明两个extent相等
     */
    equals:function(ext2) {
        return (this['xmin'] === ext2['xmin'] &&
            this['xmax'] === ext2['xmax'] &&
            this['ymin'] === ext2['ymin'] &&
            this['ymax'] === ext2['ymax']);
    },

    /**
     * 两个Extent是否相交
     * @param  {maptalks.Extent}  ext2 比较的extent
     * @return {Boolean} true：表明两个extent相交
     */
    isIntersect:function(ext2) {
        var rxmin = Math.max(this['xmin'], ext2['xmin']);
        var rymin = Math.max(this['ymin'], ext2['ymin']);
        var rxmax = Math.min(this['xmax'], ext2['xmax']);
        var rymax = Math.min(this['ymax'], ext2['ymax']);
        var intersects = !((rxmin > rxmax) || (rymin > rymax));
        return intersects;
    },

    /**
    *
    */
    /**
     * 判断坐标是否在extent中
     * @param  {maptalks.Coordinate} coordinate
     * @returns {Boolean} true：坐标在extent中
     */
    contains: function(coordinate) {
        var x, y;
        if (!Z.Util.isNil(coordinate.x)) {
            x = coordinate.x;
            y = coordinate.y;
        } else if (!Z.Util.isNil(coordinate['left'])) {
            x = coordinate['left'];
            y = coordinate['top'];
        }
        return (x >= this.xmin) &&
            (x <= this.xmax) &&
            (y >= this.ymin) &&
            (y <= this.ymax);
    },

    /**
     * 合并两个extent
     * @param  {maptalks.Extent} ext1
     * @param  {maptalks.Extent} ext2
     * @returns {maptalks.Extent} 合并后的extent
     */
    combine:function(extent) {
        if (!extent) {
            return this;
        }
        var xmin = this['xmin'];
        if (!Z.Util.isNumber(xmin)) {
            xmin = extent['xmin'];
        } else if (Z.Util.isNumber(extent['xmin'])) {
            if (xmin>extent['xmin']) {
                xmin = extent['xmin'];
            }
        }

        var xmax = this['xmax'];
        if (!Z.Util.isNumber(xmax)) {
            xmax = extent['xmax'];
        } else if (Z.Util.isNumber(extent['xmax'])) {
            if (xmax<extent['xmax']) {
                xmax = extent['xmax'];
            }
        }

        var ymin = this['ymin'];
        if (!Z.Util.isNumber(ymin)) {
            ymin = extent['ymin'];
        } else if (Z.Util.isNumber(extent['ymin'])) {
            if (ymin>extent['ymin']) {
                ymin = extent['ymin'];
            }
        }

        var ymax = this['ymax'];
        if (!Z.Util.isNumber(ymax)) {
            ymax = extent['ymax'];
        } else if (Z.Util.isNumber(extent['ymax'])) {
            if (ymax<extent['ymax']) {
                ymax = extent['ymax'];
            }
        }

        return new Z.Extent(xmin,ymin,xmax,ymax);
    },

    /**
     * 扩大Extent
     * @param  {maptalks.Extent} ext 初始extent
     * @param  {maptalks.Extent} distance  像素距离
     * @returns {maptalks.Extent} 扩大后的extent
     */
    expand:function(distance) {
        if (distance instanceof Z.Size) {
            return new Z.Extent(this['xmin']-distance['width'], this['ymin']-distance['height'],this['xmax']+distance['width'],this['ymax']+distance['height']);
        } else {
            return new Z.Extent(this['xmin']-distance, this['ymin']-distance,this['xmax']+distance,this['ymax']+distance);
        }

    }
};
