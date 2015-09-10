Z.Symbolizer = Z.Class.extend({
    //调用接口
    symbolize:function() {
        var layer = this.geometry.getLayer();
        //canvas, svg由各symbolizer实现
        if (layer.isCanvasRender()) {
            this.canvas();
        } else {
            this.svg();
        }
    },

    getMap:function() {
        return this.geometry.getMap();
    }
});
