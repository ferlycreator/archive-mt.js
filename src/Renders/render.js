Z.render={};

Z.render.Canvas=Z.Class.extend({
    _createCanvas:function() {
        if (this._canvas) {
            return;
        }
        this._canvas = Z.DomUtil.createEl('canvas');
        this._resizeCanvas();
        this._context = this._canvas.getContext('2d');
        if (Z.Browser.retina) {
            this._context.scale(2, 2);
        }
    },

    _resizeCanvas:function(width, height) {
        if (!this._canvas) {
            return;
        }
        var size;
        if (!width || !height) {
            var map = this.getMap();
            size = map.getSize();
        } else {
            size = new Z.Size(width,height);
        }

        var canvas = this._canvas;
        //retina屏支持
        var r = Z.Browser.retina ? 2:1;
        canvas.height = r * size['height'];
        canvas.width = r * size['width'];
        canvas.style.width = size['width']+'px';
        canvas.style.height = size['height']+'px';
    },

    _clearCanvas:function() {
        if (!this._canvas) {
            return;
        }
        Z.Canvas.clearRect(this._context, 0, 0, this._canvas.width, this._canvas.height);
    }
});
