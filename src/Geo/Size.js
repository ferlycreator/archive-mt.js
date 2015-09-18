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
    //破坏性方
    multi:function(ratio) {
        return new Z.Size(this['width']*ratio, this['height']*ratio);
    }
};