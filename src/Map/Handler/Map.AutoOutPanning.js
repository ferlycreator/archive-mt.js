Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [AutoOutPanning="false"] 鼠标移到地图外时自动移图
     * @member maptalks.Map
     */
    'autoOutPanning': false
});

Z.Map.AutoOutPanning = Z.Handler.extend({
    addHooks: function () {
        this._dom = this.target._containerDOM;
        Z.DomUtil.on(this._dom, 'mousemove', this._onMouseMove, this);
        Z.DomUtil.on(this._dom, 'mouseout', this._onMouseOut, this);
    },

    removeHooks: function () {
        this._cancelPan();
        Z.DomUtil.off(this._dom, 'mousemove', this._onMouseMove, this);
        Z.DomUtil.off(this._dom, 'mouseout', this._onMouseOut, this);
    },

    _onMouseMove: function(event) {
        if (Z.Browser.ie) {
            var eventParam = this.target._parseEvent(event);
            this._mousePosition = eventParam['containerPoint']
        }
        //stop panning
        this._cancelPan();
    },

    _onMouseOut: function(event) {
        var size = this.target.getSize();
        var step = 6;
        var offset = new Z.Point(0,0);
        var tests;
        if (Z.Browser.ie) {
            var lastMousePos = this._mousePosition;
            if (!lastMousePos) {
                return;
            }
            tests = [lastMousePos.x, size['width'] - lastMousePos.x,
                    lastMousePos.y, size['height'] - lastMousePos.y];

        } else {
            var eventParam = this.target._parseEvent(event);

            var containerPoint = eventParam['containerPoint'];
            var domEvent = eventParam['domEvent'];

            tests = [containerPoint.x, size['width'] - containerPoint.x,
                    containerPoint.y, size['height'] - containerPoint.y]
        }
        var min = Math.min.apply(Math, tests);
        if (tests[0] === min) {
            offset.x = step;
        } else if (tests[1] === min) {
            offset.x = -step;
        }
        if (tests[2] === min) {
            offset.y = step;
        } else if (tests[3] === min) {
            offset.y = -step;
        }
        this._offset = offset;
        this._animationId = Z.Util.requestAnimFrame(Z.Util.bind(this._pan,this));
    },

    _cancelPan:function() {
        if (this._animationId) {
            Z.Util.cancelAnimFrame(this._animationId);
            delete this._animationId;
            delete this._offset;
        }
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
