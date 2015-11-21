Z.Geometry.mergeOptions({
    /**
     * @cfg {Boolean} [draggable="false"] geometry能否拖动
     * @member maptalks.Geometry
     */
    'draggable': false
});

Z.Geometry.Drag = Z.Handler.extend({
    addHooks: function () {
        this.target.on('mousedown', this._startDrag, this);
    },
    removeHooks: function () {
        this.target.off('mousedown', this._startDrag, this);
    },
    /**
     * 开始移动Geometry, 进入移动模式
     * @param {Boolean} enableMapEvent 是否阻止地图拖动事件 true,阻止
     * @member maptalks.Geometry
     */
    _startDrag: function() {
        var map = this.target.getMap();
        if (!map) {
            return this;
        }
        var parent = this.target._getParent();
        if (parent) {
            return this;
        }
        Z.DomUtil.addStyle(map._containerDOM,'cursor', 'move');
        if (map['draggable']) {
            map['draggable'].disable();
        }
        map.on('mousemove', this._dragging, this);
        map.on('mouseup', this._endDrag, this);
        delete this._preCoordDragged;
        this._isDragging = true;
        /**
         * 触发geometry的dragstart事件
         * @member maptalks.Geometry
         * @event dragstart
         * @return {Object} params: {'target':this}
         */
        this.target._fireEvent('dragstart');
        return this;
    },

    _dragging: function(param) {
        var currentCoord = param['coordinate'];
        if(!this._preCoordDragged) {
            this._preCoordDragged = currentCoord;
        }
        var dragOffset = currentCoord.substract(this._preCoordDragged);
        this._preCoordDragged = currentCoord;
        this.target.translate(dragOffset);
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
        map.off('mousemove', this._dragging, this);
        map.off('mouseup', this._endDrag, this);
        if (map['draggable']) {
            map['draggable'].enable();
        }
        delete this._preCoordDragged;
        this._isDragging = false;
        /**
         * 触发geometry的dragend事件
         * @member maptalks.Geometry
         * @event dragend
         * @return {Object} params: {'target':this}
         */
        this.target._fireEvent('dragend', param);
        Z.DomUtil.addStyle(map._containerDOM,'cursor', 'default');
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
