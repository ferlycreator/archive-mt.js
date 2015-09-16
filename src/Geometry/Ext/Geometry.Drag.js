Z.Geometry.mergeOptions({
    /**
     * @cfg {Boolean} [draggable="false"] geometry能否拖动
     * @member maptalks.Geometry
     */
	'draggable': false,
	/**
	 * @cfg {String} [dragTrigger="mousedown"] geometry 拖动触发机制
     * @member maptalks.Geometry
     */
	'dragTrigger': 'mousedown'//manual
});

Z.Geometry.include({
    /**
     * 开始移动Geometry, 进入移动模式
     * @member maptalks.Geometry
     */
    startDrag: function() {
        this._map = this.getMap();
        Z.DomUtil.setStyle(this._map._containerDOM, 'cursor: move');
        this._map.disableDrag();
        this._map.on('mousemove', this._dragging, this)
                 .on('mouseup', this._endDrag, this);
        /**
         * 触发geometry的dragstart事件
         * @member maptalks.Geometry
         * @event dragstart
         * @return {Object} params: {'target':this}
         */
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
        var geometryPixel = this._map.coordinateToDomOffset(center);
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
            this._setPCenter(pcenter);
        } else if (this instanceof Z.Rectangle) {
            var coordinate = this._dragGeometry.getCoordinates();
            if(!coordinate||!coordinate.x||!coordinate.y) return;
            var geometryPixel = this._map.coordinateToDomOffset(coordinate);
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
                var plonlat = this._map.coordinateToDomOffset(lonlats[i]);
                var coordinate = this._map._untransformFromOffset(new Z.Point(plonlat['left']+dragOffset['left'] - mapOffset['left'],
                        plonlat['top']+dragOffset['top'] - mapOffset['top']));
                lonlats[i].x = coordinate.x;
                lonlats[i].y = coordinate.y;
            }
            this._setPrjPoints(lonlats);
        } else if (this instanceof Z.Polygon) {
           var newLonlats = [];
           var lonlats = this.getCoordinates();
           for (var i=0,len=lonlats.length;i<len;i++) {
                var coordinates = lonlats[i];
                for (var j=0,clen=coordinates.length;j<clen;j++) {
                    var plonlat = this._map.coordinateToDomOffset(coordinates[j]);
                    var coordinate = this._map._untransformFromOffset(new Z.Point(
                        plonlat['left']+dragOffset['left'] - mapOffset['left'],
                        plonlat['top']+dragOffset['top'] - mapOffset['top']
                    ));
                    newLonlats.push(coordinate);
                }
           }
           this._setPrjPoints(newLonlats);
        }
        this._updateCache();
        /**
         * 触发geometry的dragging事件
         * @member maptalks.Geometry
         * @event dragging
         * @return {Object} params: {'target':this}
         */
        this.fire('dragging', {'target': this});
    },

    /**
     * 结束移动Geometry, 退出移动模式
     */
    _endDrag: function(event) {
        this.isDragging = false;
        this._map.enableDrag();
        this._map.off('mousemove', this._dragging, this)
                 .off('mouseup', this._endDrag, this);
        /**
         * 触发geometry的dragend事件
         * @member maptalks.Geometry
         * @event dragend
         * @return {Object} params: {'target':this}
         */
        this.fire('dragend', {'target': this});
        Z.DomUtil.setStyle(this._map._containerDOM, 'cursor: default');
    },

    /**
     * Geometry是否处于移动模式中
     * @member maptalks.Geometry
     * @reutrn {Boolean} 是否处于移动模式中
     * @expose
     */
    isDragging: function() {
        if (this.isDragging) {
            return this.isDragging;
        }
        return false;
    }
});

Z.Geometry.addInitHook(function () {
	if (this.options['draggable']) {
	    var trigger = this.options['dragTrigger'];
	    if(!('manual' === trigger)) {
            this.on(trigger, function() {
                this.startDrag();
            }, this);
	    }
	}
});