Z.render={};

Z.render.Canvas=Z.Class.extend({
    getCanvasImage:function() {
        if (!this._canvasFullExtent) {
            return null;
        }
        var size = this._canvasFullExtent.getSize();
        var point = this._canvasFullExtent.getMin();
        return {'image':this._canvas,'layer':this._layer,'point':this.getMap()._viewPointToContainerPoint(point),'size':size};
    },

    _createCanvas:function() {
        if (this._canvas) {
            return;
        }
        if (Z.runningInNode) {
            var size = this.getMap().getSize();
            var Canvas = require(global.maptalks_node_canvas_path);
            this._canvas = new Canvas(size['width'],size['height']);
            this._context = this._canvas.getContext('2d');
        } else {
            this._canvas = Z.DomUtil.createEl('canvas');
            this._context = this._canvas.getContext('2d');
            /*if (Z.Browser.retina) {
                this._context.scale(2, 2);
            }*/
            this._resizeCanvas();
        }
    },

    _resizeCanvas:function(canvasSize) {
        if (!this._canvas) {
            return;
        }
        var size;
        if (!canvasSize) {
            var map = this.getMap();
            size = map.getSize();
        } else {
            size = canvasSize;
        }
        if (this._context) {
            Z.Canvas.resetContextState(this._context);
        }
        var canvas = this._canvas;
        //retina屏支持
        var r = 1;
        canvas.height = r * size['height'];
        canvas.width = r * size['width'];
        if (canvas.style) {
            canvas.style.width = size['width']+'px';
            canvas.style.height = size['height']+'px';
        }
    },

    _clearCanvas:function() {
        if (!this._canvas) {
            return;
        }
        Z.Canvas.clearRect(this._context, 0, 0, this._canvas.width, this._canvas.height);
    }
});
