Z.Geometry.mergeOptions({
    /**
     * @cfg {Boolean} [draggable="false"] geometry能否拖动
     * @member maptalks.Geometry
     */
    'draggable': false
});

Z.Geometry.include({
    /**
     * 开始移动Geometry, 进入移动模式
     * @param {Boolean} enableMapEvent 是否阻止地图拖动事件 true,阻止
     * @member maptalks.Geometry
     */
    startDrag: function() {
        if (!this.options['draggable']) {
            return this;
        }
        return this._forceStartDrag();
    },

    /**
     * 内部使用的强制开始拖动函数
     */
    _forceStartDrag:function() {
        var map = this.getMap();
        if (!map) {
            return this;
        }
        Z.DomUtil.addStyle(map._containerDOM,'cursor', 'move');
        map.disableDrag();
        map.on('mousemove', this._dragging, this);
        map.on('mouseup', this.endDrag, this);
        delete this._preCoordDragged;
        /**
         * 触发geometry的dragstart事件
         * @member maptalks.Geometry
         * @event dragstart
         * @return {Object} params: {'target':this}
         */
        this._fireEvent('dragstart');
        return this;
    },

    _dragging: function(param) {
        this._isDragging = true;
        var currentCoord = param['coordinate'];
        if(!this._preCoordDragged) {
            this._preCoordDragged = currentCoord;
        }
        var dragOffset = currentCoord.substract(this._preCoordDragged);
        this._preCoordDragged = currentCoord;
        this.translate(dragOffset);
        /**
         * 触发geometry的dragging事件
         * @member maptalks.Geometry
         * @event dragging
         * @return {Object} params: {'target':geometry, 'containerPoint':containerPoint, 'coordinate':coordinate,'domEvent':event};
         */
        this._fireEvent('dragging', param);
    },

    /**
     * 结束移动Geometry, 退出移动模式
     */
    endDrag: function(param) {
        var map = this.getMap();
        this._isDragging = false;

        map.enableDrag();

        map.off('mousemove', this._dragging, this);
        map.off('mouseup', this.endDrag, this);
        delete this._preCoordDragged;
        /**
         * 触发geometry的dragend事件
         * @member maptalks.Geometry
         * @event dragend
         * @return {Object} params: {'target':this}
         */
        this._fireEvent('dragend', param);
        Z.DomUtil.addStyle(map._containerDOM,'cursor', 'default');
    },

    /**
     * Geometry是否处于移动模式中
     * @member maptalks.Geometry
     * @reutrn {Boolean} 是否处于移动模式中
     * @expose
     */
    isDragging: function() {
        if (this._isDragging) {
            return this._isDragging;
        }
        return false;
    }
});

Z.Geometry.addInitHook(function () {
        this.on('mousedown', function(){
            this.startDrag();
        }, this);
});
