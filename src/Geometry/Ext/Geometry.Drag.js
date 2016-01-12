Z.Geometry.mergeOptions({
    /**
     * @cfg {Boolean} [draggable="false"] geometry能否拖动
     * @member maptalks.Geometry
     */
    'draggable': false,
    /**
     * @cfg {String} [draggableAixs=null] fixed geometry dragging on particular axis: x or y
     * @member maptalks.Geometry
     */
    'draggableAxis' : null
});

Z.Geometry.Drag = Z.Handler.extend({
    dragStageLayerId : Z.internalLayerPrefix+'_drag_stage',

    START: Z.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
    END: {
        mousedown: 'mouseup',
        touchstart: 'touchend',
        pointerdown: 'touchend',
        MSPointerDown: 'touchend'
    },
    MOVE: {
        mousedown: 'mousemove',
        touchstart: 'touchmove',
        pointerdown: 'touchmove',
        MSPointerDown: 'touchmove'
    },

    addHooks: function () {
        this.target.on(this.START.join(' '), this._startDrag, this);
    },
    removeHooks: function () {
        this.target.off(this.START.join(' '), this._startDrag, this);
    },
    /**
     * 开始移动Geometry, 进入移动模式
     * @param {Boolean} enableMapEvent 是否阻止地图拖动事件 true,阻止
     * @member maptalks.Geometry
     */
    _startDrag: function(param) {
        var map = this.target.getMap();
        if (!map) {
            return this;
        }
        var parent = this.target._getParent();
        if (parent) {
            return this;
        }
        if (this.isDragging()) {
            return this;
        }
        var domEvent = param['domEvent'];
        if ( domEvent.touches && domEvent.touches.length > 1) {
            return;
        }
        map._trySetCursor('move');
        if (map['draggable']) {
            map['draggable'].disable();
        }
        map.on(this.MOVE[param.type], this._dragging, this);
        map.on(this.END[param.type], this._endDrag, this);
        delete this._preCoordDragged;
        this._isDragging = true;

        this._prepareDragStageLayer();
        if (this._shadow) {
            this._shadow.remove();
        }
        this._shadow = this.target.copy();
        this._shadow.setId(null);
        this._shadow.isDragging=function() {
            return true;
        };
        //copy connectors
        var shadowConnectors = [];
        if (Z.ConnectorLine._hasConnectors(this.target)) {
            var connectors = Z.ConnectorLine._getConnectors(this.target);

            for (var i = 0; i < connectors.length; i++) {
                var targetConn = connectors[i];
                var connOptions = targetConn.config(),
                    connSymbol = targetConn.getSymbol();
                    connOptions['symbol'] = connSymbol;
                var conn;
                if (targetConn.getConnectSource() == this.target) {
                     conn = new maptalks.ConnectorLine(this._shadow, targetConn.getConnectTarget(),connOptions);
                } else {
                     conn = new maptalks.ConnectorLine(targetConn.getConnectSource(), this._shadow, connOptions);
                }
                shadowConnectors.push(conn);
            }
        }
        this._dragStageLayer.addGeometry(this._shadow);
        this._dragStageLayer.addGeometry(shadowConnectors);
        this.target.on('symbolchanged', this._onTargetUpdated, this);
        this.target.hide();
        this._shadow._fireEvent('dragstart');
        /**
         * 触发geometry的dragstart事件
         * @member maptalks.Geometry
         * @event dragstart
         * @return {Object} params: {'target':this}
         */
        this.target._fireEvent('dragstart');
        return this;
    },

    _onTargetUpdated:function() {
        if (this._shadow) {
            this._shadow.setSymbol(this.target.getSymbol());
        }
    },

     _prepareDragStageLayer:function() {
        var map=this.target.getMap();
        this._dragStageLayer = map.getLayer(this.dragStageLayerId);
        if (!this._dragStageLayer) {
            this._dragStageLayer = new Z.VectorLayer(this.dragStageLayerId);
            map.addLayer(this._dragStageLayer);
        }
    },

    _dragging: function(param) {
        var domEvent = param['domEvent'];
        if ( domEvent.touches && domEvent.touches.length > 1) {
            return;
        }
        var axis = this._shadow.options['draggableAxis'];
        var currentCoord = param['coordinate'];
        if(!this._preCoordDragged) {
            this._preCoordDragged = currentCoord;
        }
        var dragOffset = currentCoord.substract(this._preCoordDragged);
        if ('x' === axis) {
            dragOffset.y = 0;
        } else if ('y' === axis) {
            dragOffset.x = 0;
        }
        this._preCoordDragged = currentCoord;
        this._shadow.translate(dragOffset);
        this.target.translate(dragOffset);
        param['dragOffset'] = dragOffset;
        this._shadow._fireEvent('dragging');
        /**
         * 触发geometry的dragging事件
         * @member maptalks.Geometry
         * @event dragging
         * @return {Object} params: {'target':geometry, 'containerPoint':containerPoint, 'coordinate':coordinate,'domEvent':event};
         */
        this.target._fireEvent('dragging', param);
    },

    /**
     * 结束移动Geometry, 退出移动模式
     */
    _endDrag: function(param) {
        var map = this.target.getMap();
        map._trySetCursor('default');
        for (var i in this.MOVE) {
             map.off(this.MOVE[i], this._dragging, this);
             map.off(this.END[i], this._endDrag, this);
        }
        // map.off('mousemove', this._dragging, this);
        // map.off('mouseup', this._endDrag, this);
        this.target.off('symbolchanged', this._onTargetUpdated, this);
        if (map['draggable']) {
            map['draggable'].enable();
        }
        this._shadow._fireEvent('dragend', param);
        this._shadow.remove();
        delete this._shadow;
        this.target.show();
        delete this._preCoordDragged;
        this._isDragging = false;
        /**
         * 触发geometry的dragend事件
         * @member maptalks.Geometry
         * @event dragend
         * @return {Object} params: {'target':this}
         */
        this.target._fireEvent('dragend', param);

    },

    isDragging:function() {
        return this._isDragging;
    }


});

Z.Geometry.addInitHook('addHandler', 'draggable', Z.Geometry.Drag);

Z.Geometry.include({
    /**
     * Geometry是否处于移动模式中
     * @member maptalks.Geometry
     * @reutrn {Boolean} 是否处于移动模式中
     * @expose
     */
    isDragging: function() {
        if (this._getParent()) {
            return this._getParent().isDragging();
        }
        if (this['draggable']) {
            return this['draggable'].isDragging();
        }
        return false;
    }
});
