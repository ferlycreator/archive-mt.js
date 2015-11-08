Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [draggable="true"] 地图支持拖动
     * @member maptalks.Map
     */
    'draggable': true
});

Z.Map.Drag = Z.Handler.extend({
    addHooks: function () {
        var map = this.map;
        if (!map) {return;}
        this.dom = map._containerDOM;
        if (!Z.Browser.mobile) {
            this._dragHandler = new Z.Handler.Drag(this.dom);
        }
        //TODO 其它触摸屏幕
//            else {
//                this['draggable'] = new Z.Handler.Touch(this.dom);
//            }
        this._dragHandler.on("dragstart", this._onDragStart, this);
        this._dragHandler.on("dragging", this._onDragging, this);
        this._dragHandler.on("dragend", this._onDragEnd, this);

        this._dragHandler.enable();
    },

    removeHooks: function () {
        this._dragHandler.disable();
        delete this._dragHandler;
    },

    _onDragStart:function(param) {
        var me = this;
        me.map._allowSlideMap=false;
        var map = me.map;
        me.startDragTime = new Date().getTime();
        var domOffset = me.map.offsetPlatform();
        me.startLeft = domOffset['left'];
        me.startTop = domOffset['top'];
        me.preX = param['mousePos']['left'];
        me.preY = param['mousePos']['top'];
        me.startX = me.preX;
        me.startY = me.preY;
        me._isBusy = true;
        map._fireEvent('movestart');
    },

    _onDragging:function(param) {
        var me = this;
        var map = me.map;
        var mx = param['mousePos']['left'],
            my = param['mousePos']['top'];
        var nextLeft = (me.startLeft + mx - me.startX);
        var nextTop = (me.startTop + my - me.startY);
        var currentDomOffset = me.map.offsetPlatform();
        me.map.offsetPlatform(new Z.Point(nextLeft-currentDomOffset['left'],nextTop-currentDomOffset['top']));
        map._offsetCenterByPixel(new Z.Point(-(nextLeft-currentDomOffset['left']),-(nextTop-currentDomOffset['top'])));
        me.map._onMoving({'target':map});
    },

    _onDragEnd:function(param) {
        var me = this;
        me._isBusy = false;
        me.map._allowSlideMap=true;
        var map = me.map;
        var t = new Date().getTime()-me.startDragTime;
        var domOffset = me.map.offsetPlatform();
        var xSpan =  domOffset['left'] - me.startLeft;
        var ySpan =  domOffset['top'] - me.startTop;
        if (t<280 && Math.abs(ySpan) > 5 && Math.abs(xSpan) > 5) {
            map._animatePan(new Z.Point(xSpan*Math.ceil(500/t),ySpan*Math.ceil(500/t)));
        } else {
            map._onMoveEnd({'target':map});
        }
    }
});

Z.Map.addInitHook('addHandler', 'draggable', Z.Map.Drag);
