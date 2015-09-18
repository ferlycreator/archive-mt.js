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
    _multi:function(ratio) {
        this['width'] *= 2;
        this['height'] *= 2;
    }
};