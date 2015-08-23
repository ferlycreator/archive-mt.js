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
        var symbol = Z.Util.convertFieldNameStyle(this.getSymbol(), 'minus');
        if(this instanceof Z.Marker) {
            this._dragGeometry = new Z.Marker(this.getCoordinates());
        } else { //线与面图形
            symbol['line-color'] = '#ff0000';
            if (this instanceof Z.Polyline) {
                this._dragGeometry = new Z.Polyline(this.getCoordinates());
            } else if (this instanceof Z.Polygon) {
                this._dragGeometry = new Z.Polygon(this.getCoordinates());
            }
        }
        this._dragGeometry.setProperties(this.getProperties());
        this._dragGeometry.setSymbol(symbol);
        var _dragLayer = this._getDragLayer();
        _dragLayer.addGeometry(this._dragGeometry);
        this._map.on('mousemove', this._dragging, this)
                 .on('mouseup', this._endDrag, this);
        this.fire('dragstart', {'target': this});
    },

    _dragging: function(event) {
		this.isDragging = true;
		this.endPosition = Z.DomUtil.getEventDomCoordinate(event, this._map._containerDOM);
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
        this._dragGeometry._setPCenter(pcenter);
        this._dragGeometry._updateCache();
        this._setPCenter(pcenter);
        this._updateCache();
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