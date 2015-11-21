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

    symbolize:function() {
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            if (!Z.Util.isNil(arguments) && arguments.length > 0) {
                this.canvas.apply(this, arguments);
            }
        } else {
            this.svg.apply(this, arguments);
        }
        //ugly codes.
        //因为shieldMarker svg需要等待图片加载完成后才生成 svg dom
        //所以需要把registerevents传递到ShieldMarkerSymbolizer中回调调用
        if (layer.isCanvasRender() || !(this instanceof Z.ShieldMarkerSymbolizer )) {
            //结束后的回调函数
            if (Z.Util.isFunction(arguments[arguments.length-2])) {
                var fn = arguments[arguments.length-2];
                fn.call(arguments[arguments.length-1]);
            }
        }
    },

    getMap:function() {
        return this.geometry.getMap();
    }
});
