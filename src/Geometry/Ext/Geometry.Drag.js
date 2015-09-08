Z.Geometry.mergeOptions({
	'draggable': false,
	'dragTrigger': 'mousedown'//manual
});

Z.Geometry.include({
    /**
     * 开始移动Geometry, 进入移动模式
     */
    startDrag: function() {
        this._map = this.getMap();
        this._map.disableDrag();
        //this._dragGeometry = this.copy();
        //this._dragGeometry.setProperties(this.getProperties());
        //this._dragGeometry.setSymbol(symbol);
        //var _dragLayer = this._getDragLayer();
        //_dragLayer.addGeometry(this._dragGeometry);
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
        var dragOffset = new Z.Point(
            this.endPosition['left'] - this.startPosition['left'],
            this.endPosition['top'] - this.startPosition['top']
        );
        var center = this.getCenter();
        if(!center||!center.x||!center.y) return;
        var geometryPixel = this._map.coordinateToScreenPoint(center);
        var mapOffset = this._map.offsetPlatform();
        var newPosition = new Z.Point(
            geometryPixel['left'] + dragOffset['left'] - mapOffset['left'],
            geometryPixel['top'] + dragOffset['top'] - mapOffset['top']
        );
        this.startPosition = newPosition;
        if (this instanceof Z.Marker
            || this instanceof Z.Circle
            || this instanceof Z.Ellipse
            || this instanceof Z.Sector) {
            var pcenter = this._map._untransformFromOffset(newPosition);
            //this._dragGeometry._setPCenter(pcenter);
            this._setPCenter(pcenter);
        } else if (this instanceof Z.Rectangle) {
            var coordinate = this._dragGeometry.getCoordinates();
            if(!coordinate||!coordinate.x||!coordinate.y) return;
            var geometryPixel = this._map.coordinateToScreenPoint(coordinate);
            var newPosition = new Z.Point(
                geometryPixel['left'] + dragOffset['left'] - mapOffset['left'],
                geometryPixel['top'] + dragOffset['top'] - mapOffset['top']
            );
            var pCoordinate = this._map._untransformFromOffset(newPosition);
            //this._dragGeometry._setPNw(pCoordinate);
            this._setPNw(pCoordinate);
        } else if (this instanceof Z.Polyline) {
            var lonlats = this.getCoordinates();
            for (var i=0,len=lonlats.length;i<len;i++) {
                var plonlat = this._map.coordinateToScreenPoint(lonlats[i]);
                var coordinate = this._map._untransformFromOffset(new Z.Point(plonlat['left']+dragOffset['left'] - mapOffset['left'],
                        plonlat['top']+dragOffset['top'] - mapOffset['top']));
                lonlats[i].x = coordinate.x;
                lonlats[i].y = coordinate.y;
            }
            //this._dragGeometry._setPrjPoints(lonlats);
            this._setPrjPoints(lonlats);
        } else if (this instanceof Z.Polygon) {
           var newLonlats = [];
           var lonlats = this.getCoordinates();
           for (var i=0,len=lonlats.length;i<len;i++) {
                var coordinates = lonlats[i];
                var subArray = [];
                for (var j=0,clen=coordinates.length;j<clen;j++) {
                    var plonlat = this._map.coordinateToScreenPoint(coordinates[j]);
                    var coordinate = this._map._untransformFromOffset(new Z.Point(
                        plonlat['left']+dragOffset['left'] - mapOffset['left'],
                        plonlat['top']+dragOffset['top'] - mapOffset['top']
                    ));
                    newLonlats.push(coordinate);
                }
           }
           //this._dragGeometry._setPrjPoints(newLonlats);
           this._setPrjPoints(newLonlats);
        }
        //this._dragGeometry._updateCache();
        this._updateCache();
        this.fire('dragging', {'target': this});
    },

    /**
     * 结束移动Geometry, 退出移动模式
     */
    _endDrag: function(event) {
        //this._dragGeometry.remove();
        //this._getDragLayer().clear();
        //this.show();
        this.isDragging = false;
        this._map.enableDrag();
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
        if(!map) {return;}
        var layerId = '__mt__internal_drag_layer';
        if(!map.getLayer(layerId)) {
            map.addLayer(new Z.VectorLayer(layerId));
        }
        return map.getLayer(layerId);
    }
});

Z.Geometry.addInitHook(function () {
	if (this.options['draggable']) {
	    var trigger = this.options['dragTrigger'];
	    if(!('manual' === trigger)) {
            this.on(trigger, function() {
                this.startDrag();
            },this);
	    }
	}
});