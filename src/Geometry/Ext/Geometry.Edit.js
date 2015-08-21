Z.Geometry.include({
    /**
     *  开始编辑Geometry
     * @expose
     */
    startEdit: function(opts) {
        this.endEdit();
        this.editor = new Z.Editor(this,opts);
        this.editor.start();
    },


    /**
     * 结束编辑
     * @expose
     */
    endEdit: function() {
        if (this.editor) {
            this.editor.stop();
        }
    },

    /**
     * Geometry是否处于编辑状态中
     * @return {Boolean} 是否处于编辑状态
     * @expose
     */
    isEditing: function() {
        if (this.editor) {
            return this.editor.isEditing();
        }
        return false;
    },

    /**
     * 开始移动Geometry, 进入移动模式
     * @expose
     */
    startDrag: function() {
        this._map = this.getMap();
        this.hide();
        // var type = this.getType();
        if(this instanceof Z.Marker) {
            this._dragGeometry = new Z.Marker(this.getCenter());
            var targetIcon = this.getIcon();
            var iconType = (targetIcon?targetIcon['type']:null);
            if ("picture" === iconType) {

            } else if ("text" === iconType) {
                var targetTextStyle = targetIcon['textStyle'];
                var textStyle = {
                    'color': targetTextStyle['color'],
                    'padding': targetTextStyle['padding'],
                    'size': targetTextStyle['size'],
                    'font': targetTextStyle['font'],
                    'weight': targetTextStyle['weight'],
                    'background': targetTextStyle['background'],
                    'stroke': '#ff0000',
                    'strokewidth': targetTextStyle['strokewidth'],
                    'placement': targetTextStyle['placement']
                };
                var icon = {
                    'type': 'text',
                    'textStyle': textStyle,
                    'content': targetIcon['content'],
                    'offset': targetIcon['offset']
                };
                this._dragGeometry.setIcon(icon);
            } else if ("vector" === iconType){

            } else {

            }
        } else {//线与面图形
            var strokeSymbol = this.getSymbol();
            strokeSymbol['line-color'] = '#ff0000';
            this._dragGeometry.setSymbol(strokeSymbol);
        }
        var _dragLayer = this._getDragLayer();
        _dragLayer.addGeometry(this._dragGeometry);
        this._map.on('mousemove', this._dragging, this)
                 .on('mouseup', this._endDrag, this);
        this.fire('dragstart', {'target': this});
    },

    _dragging: function(event) {
		this.isDragging = true;
		this.endPosition = Z.DomUtil.getEventDomCoordinate(event, this._map.containerDOM);
		if(!this.startPosition) {
            this.startPosition = this.endPosition;
		}
		var dragOffset = {
		    'left' : this.endPosition['left'] - this.startPosition['left'],
		    'top'  : this.endPosition['top'] - this.startPosition['top']
		};
		var geometryPixel = this._map.coordinateToScreenPoint(this._dragGeometry.getCenter());
		var mapOffset = this._map._offsetPlatform();
		var newPosition = {
            'left': geometryPixel['left'] + dragOffset['left'] - mapOffset['left'],
            'top' : geometryPixel['top'] + dragOffset['top'] - mapOffset['top']
		};
		this.startPosition = newPosition;
		var pcenter = this._map._transformFromOffset(newPosition);
        this._dragGeometry.setPCenter(pcenter);
        this._dragGeometry.updateCache();
        this.setPCenter(pcenter);
        this.updateCache();
        this.fire('dragging', {'target': this});
    },

    /**
     * 结束移动Geometry, 退出移动模式
     */
    _endDrag: function(event) {
		this._dragGeometry.remove();
		this._getDragLayer().clear();
		this.show();
		this.isDragging = false;
        this._map.off('mousemove', this._dragging, this)
                 .off('mouseup', this._endDrag, this);
		this.fire('dragend', {'target': this});
    },

    /**
     * Geometry是否处于移动模式中
     * @return
      {Boolean} 是否处于移动模式中
     * @expose
     */
    isDragging: function() {
        if (this.isDragging) {
            return this.isDragging;
        }
        return false;
    },

    _getDragLayer: function() {
        var map = this.getMap();
        if(!map) return;
        var layerId = '__mt__internal_drag_layer';
        if(!map.getLayer(layerId)) {
            map.addLayer(new Z.SVGLayer(layerId));
        }
        return map.getLayer(layerId);
    }

});