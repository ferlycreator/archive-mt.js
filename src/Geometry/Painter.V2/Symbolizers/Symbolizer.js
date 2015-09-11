Z.Symbolizer = Z.Class.extend({
    //调用接口
    symbolize:function() {
        var layer = this.geometry.getLayer();
        //canvas, svg由各symbolizer实现
        if (layer.isCanvasRender()) {
            this.canvas.apply(this,arguments);
        } else {
            this.svg.apply(this,arguments);
        }
    },

    getMap:function() {
        return this.geometry.getMap();
    }
});
