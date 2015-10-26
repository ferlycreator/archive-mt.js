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
    startDrag: function(enableMapEvent) {
        this._map = this.getMap();
        Z.DomUtil.setStyle(this._map._containerDOM, 'cursor: move');
        this._enableMapEvent = enableMapEvent;
        if(this._enableMapEvent) {
            this._map.disableDrag();
            this.on('mouseup', this.endDrag, this);
        }
        this._map.on('_mousemove', this._dragging, this);
        /**
         * 触发geometry的dragstart事件
         * @member maptalks.Geometry
         * @event dragstart
         * @return {Object} params: {'target':this}
         */
        this._fireEvent('dragstart');
    },

    _dragging: function(param) {
        this._isDragging = true;
        this.endPosition = param['containerPoint'];
        if(!this.startPosition) {
            this.startPosition = this.endPosition;
        }
        var dragOffset = new Z.Point(
            this.endPosition['left'] - this.startPosition['left'],
            this.endPosition['top'] - this.startPosition['top']
        );
        var center = this.getCenter();
        if(!center||!center.x||!center.y) {return;}
        var geometryPixel = this._map.coordinateToViewPoint(center);
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
            var pcenter = this._map._untransformFromViewPoint(newPosition);
            this._setPCenter(pcenter);
        } else if (this instanceof Z.Rectangle) {
            var coordinate = this.getCoordinates();
            if(!coordinate||!coordinate.x||!coordinate.y) {return;}
            var geometryPixel = this._map.coordinateToViewPoint(coordinate);
            var newPosition = new Z.Point(
                geometryPixel['left'] + dragOffset['left'] - mapOffset['left'],
                geometryPixel['top'] + dragOffset['top'] - mapOffset['top']
            );
            var pCoordinate = this._map._untransformFromViewPoint(newPosition);
            this._setPNw(pCoordinate);
        } else if (this instanceof Z.Polyline) {
            var lonlats = this.getCoordinates();
            for (var i=0,len=lonlats.length;i<len;i++) {
                var plonlat = this._map.coordinateToViewPoint(lonlats[i]);
                var coordinate = this._map._untransformFromViewPoint(new Z.Point(plonlat['left']+dragOffset['left'] - mapOffset['left'],
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
                    var plonlat = this._map.coordinateToViewPoint(coordinates[j]);
                    var coordinate = this._map._untransformFromViewPoint(new Z.Point(
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
         * @return {Object} params: {'target':geometry, 'containerPoint':containerPoint, 'coordinate':coordinate,'domEvent':event};
         */
        this._fireEvent('dragging', param);
    },

    /**
     * 结束移动Geometry, 退出移动模式
     */
    endDrag: function(param) {
        this._isDragging = false;
        if(this._enableMapEvent) {
            this._map.enableDrag();
        }
        this._map.off('_mousemove', this._dragging, this);
        /**
         * 触发geometry的dragend事件
         * @member maptalks.Geometry
         * @event dragend
         * @return {Object} params: {'target':this}
         */
        this._fireEvent('dragend', param);
        Z.DomUtil.setStyle(this._map._containerDOM, 'cursor: default');
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
	if (this.options['draggable']) {
	    var me = this;
	    this.on('mousedown', function(){
            me.startDrag(true);
	    }, this);
	}
});
