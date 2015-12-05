Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [draggable="true"] 地图支持拖动
     * @member maptalks.Map
     */
    'draggable': true
});

Z.Map.Drag = Z.Handler.extend({
    addHooks: function () {
        var map = this.target;
        if (!map) {return;}
        this.dom = map._containerDOM;
        this._dragHandler = new Z.Handler.Drag(this.dom);
        map.on("mousedown", this._onMouseDown,this);

        this._dragHandler.on("dragstart", this._onDragStart, this);
        this._dragHandler.on("dragging", this._onDragging, this);
        this._dragHandler.on("dragend", this._onDragEnd, this);

        this._dragHandler.enable();
    },

    removeHooks: function () {
        var map = this.target;
        map.off("mousedown", this._onMouseDown,this);
        this._dragHandler.disable();
        delete this._dragHandler;
    },


    _onMouseDown:function(param) {
        this.target._enablePanAnimation=false;
    },

    _onDragStart:function(param) {
        var map = this.target;
        this.startDragTime = new Date().getTime();
        var domOffset = map.offsetPlatform();
        this.startLeft = domOffset.x;
        this.startTop = domOffset.y;
        this.preX = param['mousePos'].x;
        this.preY = param['mousePos'].y;
        this.startX = this.preX;
        this.startY = this.preY;
        map._isBusy = true;
        map._fireEvent('movestart');
    },

    _onDragging:function(param) {
        var map = this.target;
        var mx = param['mousePos'].x,
            my = param['mousePos'].y;
        var nextLeft = (this.startLeft + mx - this.startX);
        var nextTop = (this.startTop + my - this.startY);
        var currentDomOffset = map.offsetPlatform();
        map.offsetPlatform(new Z.Point(nextLeft,nextTop).substract(currentDomOffset));
        map._offsetCenterByPixel(new Z.Point(-nextLeft,-nextTop).add(currentDomOffset));
        map._onMoving({'target':map});
    },

    _onDragEnd:function(param) {
        var map = this.target;
        var t = new Date().getTime()-this.startDragTime;
        var domOffset = map.offsetPlatform();
        var xSpan =  domOffset.x - this.startLeft;
        var ySpan =  domOffset.y - this.startTop;
        if (t<280 && Math.abs(ySpan) > 5 && Math.abs(xSpan) > 5) {
            map._enablePanAnimation=true;
            map._panAnimation(new Z.Point(xSpan*Math.ceil(500/t),ySpan*Math.ceil(500/t)),t*4);
        } else {
            map._onMoveEnd();
        }
    }
});

Z.Map.addInitHook('addHandler', 'draggable', Z.Map.Drag);
