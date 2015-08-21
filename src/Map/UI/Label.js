Z['Label'] = Z.Label = Z.Class.extend({
	includes: [Z.Eventable],

	/**
	* 异常信息定义
	*/
	'exceptionDefs':{
        'en-US':{
            'NEED_TARGET':'You must set target to Label.'
        },
        'zh-CN':{
            'NEED_TARGET':'你必须设置Label绑定的Geometry目标。'
        }
	},

	options:{
		'symbol': {
            'shield-type': 'tip',//rectangle tip
            'shield-name': '测试标签:[a-name]',
            'shield-opacity': 1,
            'shield-line-color': '#000000',
            'shield-line-width': 1,
            'shield-line-opacity': 1,
            'shield-fill': '#ff0000',
            'shield-fill-opacity': 1,
            'shield-file': '',
            'shield-face-name': 'Serif',
            'shield-unlock-image' : false,
            'shield-size': 10,
            'shield-text-fill': '#ff0000',
            'shield-placement': 'point', //point line vertex interior
            'shield-spacing': 30,
            'shield-wrap-width': 100,
            'shield-wrap-before': false,
            'shield-wrap-character': '',
            'shield-character-spacing': 0,
            'shield-line-spacing': 0,
            'shield-text-dx': 0,
            'shield-text-dy': 0,
            'shield-dx': 0,
            'shield-dy': 0,
            'shield-text-opacity': 1,
            'shield-horizontal-alignment': 'auto',//left middle right auto
            'shield-vertical-alignment': 'top',//top middle bottom auto
            'shield-justify-alignment': 'auto'//left center right auto
		},
		'type': 'rectangle',//tip
		'link': true,
		'draggable': true,
		'trigger': 'hover'//click|hover
	},

    /**
    * @expose
    */
	initialize: function (options) {
		this.setOption(options);
		return this;
	},

	/**
    * @expose
    */
    setOption: function(options) {
        Z.Util.setOptions(this, options);
        return this;
    },

	/**
	* 隐藏label
	* @expose
	*/
	hideLabel: function() {
		this._label.hide();
		if(this.options['link']) {
			this._link.hide();
		}
        this.fire('hide', {'target': this});
	},

	/**
	* 显示label
	* @expose
	*/
	showLabel: function() {
		this._label.show();
		if(this.options['link']) {
	        this._linkToTarget();
		}
        this.fire('show', {'target': this});
	},

	/**
	* 移除label
	* @expose
	*/
	removeLabel: function() {
		this._label.remove();
		if(this.options['link']) {
			this._link.remove();
		}
        this.fire('remove', {'target': this});
	},

	addTo: function (geometry) {
        if(!geometry || !this.options || !this.options['symbol']) return;
        this._map = geometry.getMap();
        this._labelContrainer = this._map.containerDOM;
        this._target = geometry;
        if(!this._target) throw new Error(this.exceptions['NEED_TARGET']);

        var layerId = '__mt__layer_label';
        var canvas = false;
        var targetLayer = this._target.getLayer();
        if(targetLayer && targetLayer instanceof Z.CanvasLayer) {
            canvas = true;
        }
        this._internalLayer = this._getInternalLayer(this._map, layerId, canvas);
        var targetCenter = this._target.getCenter();
        this._label = new Z.Marker(targetCenter);
        this._label['target'] = this._target;
        this._label.setIcon(this._getShieldSymbol());
        this._internalLayer.addGeometry(this._label);
        this._label.hide();

        var targetOffset = this._map.coordinateToScreenPoint(targetCenter);
        var labelOffset = this._computeLabelOffset();
        targetCenter = this._map.screenPointToCoordinate({
            'top' : targetOffset['top'] - labelOffset['top'],
            'left' : targetOffset['left'] + labelOffset['left']
        });
        this._label.setCoordinates(targetCenter);
        this._target.on('shapechanged positionchanged symbolchanged', Z.Util.bind(this._changeLabelPosition, this), this)
                    .on('remove', this.removeLabel, this);
        this._label.on('click dblclick rightclick', Z.DomUtil.stopPropagation, this);

        var trigger = this.options['trigger'];
        var me = this;
        if(trigger === 'hover') {
            this._target.on('mouseover', function showLabel() {
                         me.showLabel();
                         map.disableDragPropagation();
                         map.disableDoubleClickZoom();
                     }, this)
                     .on('mouseout', function hideLabel() {
                        setTimeout(function(){
                            me.hideLabel();
                            map.enableDragPropagation();
                            map.enableDoubleClickZoom();
                        }, 1000);
                     }, this);
        } else if(trigger === 'click') {
            this._target.on('click', function showLabel() {
                         me.showLabel();
                         map.disableDragPropagation();
                         map.disableDoubleClickZoom();
                     }, this);
        } else {
            me.showLabel();
        }
        if(this.options['draggable']) {
             this._label.on('mousedown', this._onMouseDown, this)
                      .on('dragend', this._endMove, this)
                      .on('mouseout', this._recoverMapEvents, this);
        }
        return null;
	},

    /**
    'shield-type': 'tip',//rectangle tip
    'shield-name': '测试标签:[a-name]',
    'shield-opacity': 1,
    'shield-line-color': '#000000',
    'shield-line-width': 1,
    'shield-line-opacity': 1,
    'shield-fill': '#ff0000',
    'shield-fill-opacity': 1,
    'shield-file': '',
    */
	_getShieldSymbol: function() {
        var symbol = this.options['symbol'];
        var shieldSymbol = {};
        for(var attr in symbol) {
            if('shield-type' === attr) {
                shieldSymbol['marker-type'] = symbol[attr];
            }
            if('shield-opacity' === attr) {
                shieldSymbol['marker-opacity'] = symbol[attr];
            }
            if('shield-line-color' === attr) {
                shieldSymbol['marker-line-color'] = symbol[attr];
            }
            if('shield-line-width' === attr) {
                shieldSymbol['marker-line-width'] = symbol[attr];
            }
            if('shield-line-opacity' === attr) {
                shieldSymbol['marker-line-opacity'] = symbol[attr];
            }
            if('shield-fill' === attr) {
                shieldSymbol['marker-fill'] = symbol[attr];
            }
            if('shield-fill-opacity' === attr) {
                shieldSymbol['marker-fill-opacity'] = symbol[attr];
            }
        }
        return shieldSymbol;
	},

	_computeLabelOffset: function() {
		var painter = this._label.getPainter();
		var textSize = painter.measureTextMarker();
		var width =  0; //textSize['width'],
			height = 0; //textSize['height'];
		var geoSide = this._target.getSize();
		var sideWidth = geoSide['width'];
		var sideHeight = geoSide['height'];
		if (this.options) {
			var placement = this.options['symbol']['shield-vertical-alignment'];
			var left = 0, top = 0;
			if('left' === placement) {
				left = -sideWidth/2;
				top = sideHeight/2;
			} else if('right' === placement) {
				left = sideWidth/2;
				top = sideHeight/2;
			} else if('top' === placement) {
				left = 0;
				top = height + sideHeight/2;
			} else if('bottom' === placement) {
				left = 0;
				top = 0;
			} else {//center
				left = 0;
				top = sideHeight/2;
			}
		}
		return {'left':left, 'top':top};
	},

	_linkToTarget: function() {
		var center = this._target.getCenter();
		var nearestPoints = this._getNearestPoint(center);
		var path = [center, nearestPoints[0], nearestPoints[1]];
		this._link = new Z.Polyline(path);
		var strokeSymbol = {
			'stroke': this.options['style']['stroke'],
			'stroke-width': this.options['style']['strokewidth']
		};
		this._link.setStrokeSymbol(strokeSymbol);
		this._internalLayer.addGeometry(this._link);
		geometry.on('positionchanged', this._changeLinkPath, this)
				.on('remove', this.remove, this);

	},

	/**
	*获取距离coordinate最近的label上的点
	* @param {Coordinate}
	* @return {Coordinate}
	*/
	_getNearestPoint: function(coordinate) {
		var points = [];

		var painter = this._label.getPainter();
		var textSize = painter.measureTextMarker();
		var width = 0; //textSize['width'],
			height = 0; //textSize['height'];

		var screenPoint = this._topLeftPoint(width, height);

		var topLeftPoint = this._map.screenPointToCoordinate(screenPoint);

		var topCenterPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'],
			'left' : screenPoint['left'] + Math.round(width/2)
		});
		var topCenterBufferPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] - 20,
			'left' : screenPoint['left'] + Math.round(width/2)
		});
		var topRightPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'],
			'left' : screenPoint['left'] + width
		});
		var bottomLeftPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] + height,
			'left' : screenPoint['left']
		});
		var bottomCenterPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] + height,
			'left' : screenPoint['left'] + Math.round(width/2)
		});
		var bottomCenterBufferPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] + height + 20,
			'left' : screenPoint['left'] + Math.round(width/2)
		});
		var bottomRightPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] + height,
			'left' : screenPoint['left'] + width
		});
		var middleLeftPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] + Math.round(height/2),
			'left' : screenPoint['left']
		});
		var middleLeftBufferPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] + Math.round(height/2),
			'left' : screenPoint['left'] - 20
		});
		var middleRightPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] + Math.round(height/2),
			'left' : screenPoint['left'] + width
		});
		var middleRightBufferPoint = this._map.screenPointToCoordinate({
			'top' : screenPoint['top'] + Math.round(height/2),
			'left' : screenPoint['left'] + width + 20
		});
		var points = [topCenterPoint,middleRightPoint,bottomCenterPoint,middleLeftPoint];
		var lastDistance = 0;
		var nearestPoint;
		for(var i=0,len=points.length;i<len;i++) {
			var point = points[i];
			var distance = this._map.computeDistance(coordinate, point);
			if(i === 0) {
				nearestPoint = point;
				lastDistance = distance;
			} else {
				if(distance < lastDistance) {
					nearestPoint = point;
				}
			}
		}
		//连接缓冲点，作用为美化
		var bufferPoint;
		if(Z.Coordinate.equals(nearestPoint, topCenterPoint)) {
			bufferPoint = topCenterBufferPoint;
		} else if(Z.Coordinate.equals(nearestPoint, middleRightPoint)) {
			bufferPoint = middleRightBufferPoint;
		} else if(Z.Coordinate.equals(nearestPoint, bottomCenterPoint)) {
			bufferPoint = bottomCenterBufferPoint;
		} else if(Z.Coordinate.equals(nearestPoint, middleLeftPoint)) {
			bufferPoint = middleLeftBufferPoint;
		}
		var nearestPoints = [bufferPoint, nearestPoint];
		return nearestPoints;
	},

	_topLeftPoint: function(width, height) {
		var placement = this.options['symbol']['shield-vertical-alignment'];
		var center = this._label.getCenter();
		var point = this._map.coordinateToScreenPoint(center);
		var mapOffset = this._map.offsetPlatform();
		if (placement === 'left') {
			return {
				'left': point['left'] - width + mapOffset['left'],
				'top': point['top'] - Math.round(height/2) + mapOffset['top']
			};
		} else if (placement === 'top') {
			return {
				'left': point['left'] - Math.round(width/2) + mapOffset['left'],
				'top': point['top'] - height + mapOffset['top']
			};
		} else if (placement === 'right') {
			return {
				'left': point['left'] + mapOffset['left'],
				'top': point['top'] - Math.round(height/2) + mapOffset['top']
			};
		} else if(placement === 'bottom') {
			return {
				'left': point['left'] - Math.round(width/2) + mapOffset['left'],
				'top': point['top'] + mapOffset['top']
			};
		} else {//center
			return {
				'left': point['left'] - Math.round(width/2) + mapOffset['left'],
				'top': point['top'] - Math.round(height/2) + mapOffset['top']
			};
		}
	},

	_changeLinkPath: function() {
		var center = this._target.getCenter();
		var nearestPoints = this._getNearestPoint(center);
		var path = [center, nearestPoints[0], nearestPoints[1]];
		var strokeSymbol = this._link.getStrokeSymbol();
		strokeSymbol['stroke'] = '#ff0000';
		this._link.setStrokeSymbol(strokeSymbol);
		this._link.setPath(path);
	},

	_changeLabelPosition: function(event) {
		this._target = event['target'];
		this._label.setCoordinates(this._target.getCenter());
	},

	_onMouseDown: function(event) {
		Z.DomUtil.setStyle(this._labelContrainer, 'cursor: move');
		this._label.startDrag();
		this._map.disableDragPropagation();
		this._map.disableDoubleClickZoom();
		if(this.options['link']) {
			this._map.on('mousemove zoomend resize moving', this._changeLinkPath, this);
		}
        this.fire('dragstart', {'target': this});
	},

	_endMove: function(event) {
		Z.DomUtil.setStyle(this._labelContrainer, 'cursor: default');
		if(this.options['link']) {
			this._map.off('mousemove zoomend resize moving', this._changeLinkPath, this);
			var strokeSymbol = {
				'stroke': this.options['style']['stroke'],
				'stroke-width': this.options['style']['strokewidth']
			};
			if(this._link) {
				this._link.setStrokeSymbol(strokeSymbol);
			}
		}
		this.fire('dragend', {'target': this});
	},

	_recoverMapEvents: function() {
		this._map.enableDragPropagation();
		this._map.enableDoubleClickZoom();
	},

    _getInternalLayer: function(map, layerId, canvas) {
        if(!map) return;
        var layer = map.getLayer(layerId);
        if(!layer) {
            if(canvas) {
                layer = new Z.CanvasLayer(layerId);
            } else {
                layer = new Z.SVGLayer(layerId);
            }
            map.addLayer(layer);
        }
        return layer;
    }

});