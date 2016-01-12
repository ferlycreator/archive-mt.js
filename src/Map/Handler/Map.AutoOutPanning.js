Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [AutoOutPanning="false"] 鼠标移到地图外时自动移图
     * @member maptalks.Map
     */
    'autoOutPanning': false
});

Z.Map.AutoOutPanning = Z.Handler.extend({
    addHooks: function () {
        this.target.on('mousemove', this._onMouseMove, this);
        this.target.on('mouseout', this._onMouseOut, this);
    },

    removeHooks: function () {
        this.target.off('mousemove', this._onMouseMove, this);
        this.target.off('mouseout', this._onMouseOut, this);
    },

    _onMouseMove: function(param) {
        //stop panning
        if (this._animationId) {
            Z.Util.cancelAnimFrame(this._animationId);
            delete this._animationId;
            delete this._offset;
        }
    },

    _onMouseOut: function(param) {
        var size = this.target.getSize();
        var offset = new Z.Point(0,0);
        var containerPoint = param['containerPoint'];
        if (containerPoint.x <= 0) {
            offset.x = 2;
        } else if (containerPoint.x >= size['width']) {
            offset.x = -2;
        }
        if (containerPoint.y <= 0) {
            offset.y = 2;
        } else if (containerPoint.y >= size['height']) {
            offset.y = -2;
        }
        this._offset = offset;
        this._animationId = Z.Util.requestAnimFrame(Z.Util.bind(this._pan,this));
    },

    _pan:function() {
        if (this._offset) {
            this.target.panBy(this._offset, {
                'animation':false
            });
            this._animationId = Z.Util.requestAnimFrame(Z.Util.bind(this._pan,this));
        }
    }
});

Z.Map.addInitHook('addHandler', 'autoOutPanning', Z.Map.AutoOutPanning);
