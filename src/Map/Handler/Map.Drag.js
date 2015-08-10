Z.Map.mergeOptions({
	'dragging': true
});

Z.Map.Drag = Z.Handler.extend({
	addHooks: function () {
		if (!this['draggable']) {
            var map = this['map'];
            if (!map) return;
            this.dom = map.containerDOM;
            if (!Z.Browser.mobile) {
                this['draggable'] = new Z.Handler.Drag(this.dom);
            }
            //TODO 其它触摸屏幕
            /*else {
                this['draggable'] = new Z.Handler.Touch(this.dom);
            }*/

            this['draggable'].on("dragstart", this._onDragStart, this);
            this['draggable'].on("dragging", this._onDragging, this);
            this['draggable'].on("dragend", this._onDragEnd, this);
		}
		this['draggable'].enable();
	},

	removeHooks: function () {
		this['draggable'].disable();
	},

	_onDragStart:function(param) {
        var me = this;
        me.map.allowSlideMap=false;
        var map = me.map;
        me.startDragTime = new Date().getTime();
        var domOffset = me.map.offsetPlatform();
        me.startLeft = domOffset['left'];
        me.startTop = domOffset['top'];
        me.preX = param['mousePos']['left'];
        me.preY = param['mousePos']['top'];
        me.startX = me.preX;
        me.startY = me.preY;
        map.fireEvent('movestart');
    },

    _onDragging:function(param) {
        var me = this;
        var map = me.map;
        var mx = param['mousePos']['left'],
            my = param['mousePos']['top'];
        var currentDomLeft = (me.startLeft + mx - me.startX);
        var currentDomTop = (me.startTop + my - me.startY);
        var domOffset = me.map.offsetPlatform();
        me.map.offsetPlatform({
            'left':currentDomLeft-domOffset['left'],
            'top':currentDomTop-domOffset['top']
        });
        map.offsetCenterByPixel({"left":-(currentDomLeft-domOffset['left']),"top":-(currentDomTop-domOffset['top'])});
        me.map.onMoving({'target':map});
        map.fireEvent('moving');
    },

    

    _onDragEnd:function(param) {
        var me = this;
        me.map.allowSlideMap=true;
        var map = me.map;
        var t = new Date().getTime()-me.startDragTime;
        var domOffset = me.map.offsetPlatform();
        var xSpan =  domOffset['left'] - me.startLeft;
        var ySpan =  domOffset['top'] - me.startTop;
        if (t<280 && Math.abs(ySpan) > 5 && Math.abs(xSpan) > 5) {
            map.animatePan({"top":ySpan*Math.ceil(500/t), "left":xSpan*Math.ceil(500/t)});
        } else {
            map.onMoveEnd({'target':map});
        }
        map.fireEvent('moveend');
    }
});

Z.Map.addInitHook('addHandler', 'dragging', Z.Map.Drag);