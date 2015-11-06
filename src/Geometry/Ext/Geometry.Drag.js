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
        var map = this.getMap();
        if (!map) {
            return;
        }
        Z.DomUtil.addStyle(map._containerDOM,'cursor', 'move');
        map.disableDrag();
        map.on('mousemove', this._dragging, this);
        map.on('mouseup', this.endDrag, this);
        delete this._dragStartPosition;
        delete this._dragEndPosition;
        /**
         * 触发geometry的dragstart事件
         * @member maptalks.Geometry
         * @event dragstart
         * @return {Object} params: {'target':this}
         */
        this._fireEvent('dragstart');
    },

    _dragging: function(param) {
        var map = this.getMap();
        this._isDragging = true;
        this._dragEndPosition = param['containerPoint'];
        if(!this._dragStartPosition) {
            this._dragStartPosition = this._dragEndPosition;
        }
        var dragOffset = new Z.Point(
            this._dragEndPosition['left'] - this._dragStartPosition['left'],
            this._dragEndPosition['top'] - this._dragStartPosition['top']
        );
        var center = this.getCenter();
        if(!center||!center.x||!center.y) {return;}
        var geometryPixel = map.coordinateToViewPoint(center);
        var mapOffset = map.offsetPlatform();
        var newPosition = new Z.Point(
            geometryPixel['left'] + dragOffset['left'] - mapOffset['left'],
            geometryPixel['top'] + dragOffset['top'] - mapOffset['top']
        );
        this._dragStartPosition = newPosition;
        if (this instanceof Z.Marker
            || this instanceof Z.Circle
            || this instanceof Z.Ellipse
            || this instanceof Z.Sector) {
            var pcenter = map._untransformFromViewPoint(newPosition);
            this._setPCenter(pcenter);
        } else if (this instanceof Z.Rectangle) {
            var coordinate = this.getCoordinates();
            if(!coordinate||!coordinate.x||!coordinate.y) {return;}
            var geometryPixel = map.coordinateToViewPoint(coordinate);
            var newPosition = new Z.Point(
                geometryPixel['left'] + dragOffset['left'] - mapOffset['left'],
                geometryPixel['top'] + dragOffset['top'] - mapOffset['top']
            );
            var pCoordinate = map._untransformFromViewPoint(newPosition);
            this._setPNw(pCoordinate);
        } else if (this instanceof Z.Polyline) {
            var lonlats = this.getCoordinates();
            var prjLonLats = [];
            for (var i=0,len=lonlats.length;i<len;i++) {
                var viewPoint = map.coordinateToViewPoint(lonlats[i]);
                var coordinate = map._untransformFromViewPoint(new Z.Point(viewPoint['left']+dragOffset['left'] - mapOffset['left'],
                        viewPoint['top']+dragOffset['top'] - mapOffset['top']));
                prjLonLats.push(coordinate);
            }
            this._setPrjPoints(prjLonLats);
        } else if (this instanceof Z.Polygon) {
           var newLonlats = [];
           var lonlats = this.getCoordinates();
           for (var i=0,len=lonlats.length;i<len;i++) {
                var coordinates = lonlats[i];
                for (var j=0,clen=coordinates.length;j<clen;j++) {
                    var plonlat = map.coordinateToViewPoint(coordinates[j]);
                    var coordinate = map._untransformFromViewPoint(new Z.Point(
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
        var map = this.getMap();
        this._isDragging = false;

        map.enableDrag();

        map.off('mousemove', this._dragging, this);
        map.off('mouseup', this.endDrag, this);
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
	if (this.options['draggable']) {
	    var me = this;
	    this.on('mousedown', function(){
            me.startDrag();
	    }, this);
	}
});
