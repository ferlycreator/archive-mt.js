/**
 * Symbolizer共同的父类,需要实现的接口有
 * @class maptalks.Symbolizer
 * @extends maptalks.Class
 * refresh: 刷新逻辑, 例如地图放大缩小时需要刷新像素坐标时
 * svg:     在svg/vml上的绘制逻辑
 * canvas:  在canvas上的绘制逻辑
 * show:    显示
 * hide:    隐藏
 * setZIndex:设置ZIndex
 * remove:  删除逻辑
 * test: 定义在类上, 测试传入的geometry和symbol是否应由该Symbolizer渲染
 */
Z.Symbolizer = Z.Class.extend({
    _prepareContext:function(ctx) {
        var symbol = this.symbol;
        // ctx.restore();
        Z.Canvas.setDefaultCanvasSetting(ctx);
        var layer = this.geometry.getLayer(),
            layerOpacity = layer.options['opacity'];
        if (Z.Util.isNumber(symbol['opacity'])) {
            ctx.globalAlpha = symbol['opacity']*layerOpacity;
        } else {
            ctx.globalAlpha = layerOpacity;
        }
        var shadowBlur = this.geometry.options['shadowBlur'];
        if (Z.Util.isNumber(shadowBlur) && shadowBlur > 0) {
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = this.geometry.options['shadowColor'];
        }
    },

    getMap:function() {
        return this.geometry.getMap();
    }
});

Z.Symbolizer.colorProperties = [
        "lineColor", "polygonFill", "markerFill", "markerLineColor", "textFill", "shieldFill", "shieldHaloFill"
    ];

/**
 * test if the prop is a property of color
 * @param  {String} prop property to test
 * @return {Boolean}      true/false
 */
Z.Symbolizer.testColor = function(prop) {
    if (!prop || !Z.Util.isString(prop)) {return false;}
    if (Z.Util.searchInArray(prop, colorProperties) >= 0) {
        return true;
    }
    return false;
}
