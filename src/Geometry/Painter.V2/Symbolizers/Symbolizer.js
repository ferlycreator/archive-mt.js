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
