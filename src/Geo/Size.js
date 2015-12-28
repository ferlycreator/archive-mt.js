/**
 * 尺寸
 * @class maptalks.Size
 * @author Maptalks Team
 */
Z.Size=function(width,height) {
    this['width']=width;
    this['height']=height;
};

Z.Size.prototype={
    copy:function() {
        return new Z.Size(this['width'], this['height']);
    },

    add:function(size) {
        return new Z.Size(this['width']+size['width'], this['height']+size['height']);
    },
    equals:function(size) {
        return this['width'] === size['width'] && this['height'] === size['height'];
    },
    //破坏性方
    multi:function(ratio) {
        return new Z.Size(this['width']*ratio, this['height']*ratio);
    }
};
