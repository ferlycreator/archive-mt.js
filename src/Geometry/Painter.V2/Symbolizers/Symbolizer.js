/**
 * Symbolizer共同的父类,需要实现的接口有
 *
 * refresh: 刷新逻辑, 例如地图放大缩小时需要刷新像素坐标时
 * svg:     在svg/vml上的绘制逻辑
 * canvas:  在canvas上的绘制逻辑
 * show:    显示
 * hide:    隐藏
 * setZIndex:设置ZIndex
 * remove:  删除逻辑
 *
 * test: 定义在类上, 测试传入的geometry和symbol是否应由该Symbolizer渲染
 * @constructor
 */
Z.Symbolizer = Z.Class.extend({

    symbolize:function() {
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            this.canvas.apply(this, arguments);
        } else {
            this.svg.apply(this, arguments);
        }
    },

    getMap:function() {
        return this.geometry.getMap();
    }
});
