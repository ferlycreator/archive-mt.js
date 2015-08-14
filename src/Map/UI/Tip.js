Z['Tip'] = Z.Tip = Z.Control.extend({
	includes: [Z.Eventable],

	/**
	* 异常信息定义
	*/
	'exceptionDefs':{
		'en-US':{
			'NEED_TARGET':'You must set target to Tip.'
		},
		'zh-CN':{
			'NEED_TARGET':'你必须设置Tip绑定的Geometry目标。'
		}
	},

	statics: {
		'getTip': function(id) {
			return Z['Control']['getControl'](id);
		}
	},

	options:{
		/**
		'cartocss' : {
			'marker-file': '',
			'marker-opacity': 1,
			'marker-fill-opacity': 1,
			'marker-line-color': '#000000',
			'marker-line-width': 1,
			'marker-line-opacity': 1,
			'marker-placement': 'point',
			'marker-type': 'ellipse', //arrow ellipse rectangle
			'marker-width': 10,
			'marker-height': 10,
			'marker-fill': '#000000',

			'text-name': [name],
			'text-face-name': '',
			'text-size': 10,
			'text-ratio': 0,
			'text-wrap-width': 1,
			'text-spacing': '',
			'text-fill': '#000000',
			'text-opacity': 1,
			'text-align': 'center',//left,right,center,auto
			'text-vertical-alignment': 'top',//top,middle,bottom,auto
			'text-horizontal-alignment': 'left',//left,middle,right,auto
			'text-placement': 'point' //point line vertex interior
		},
		*/
		'style': {
			'color': '#000000',
			'padding': 1,
			'size': 12,
			'font': '',
			'weight': '',
			'background': '#ffffff',
			'stroke': '#000000',
			'strokewidth': 1,
			'type': 'rectangle', //bubble ellipse rectangle,
			'file': '',
			'placement' : 'top' //top | bottom | left | right | auto.
		},
		'content': '',
		'link': true,
		'draggable': true,
		'target': null,
		'trigger': 'hover'//click|hover
	},

	/**
	* 隐藏tip
	* @expose
	*/
	hideTip: function() {
		this._tip.hide();
		if(this.options['link']) {
			this._link.hide();
		}
        this.fire('hide', {'target': this});
	},

	/**
	* 显示tip
	* @expose
	*/
	showTip: function() {
		this._tip.show();
		if(this.options['link']) {
	        this._linkToTarget();
		}
        this.fire('show', {'target': this});
	},

	/**
	* 移除tip
	* @expose
	*/
	removeTip: function() {
		this._tip.remove();
		if(this.options['link']) {
			this._link.remove();
		}
        this.fire('remove', {'target': this});
	},

	buildOn: function (map) {
		if(!map || !this.options || !this.options['content']) return;
		this._tipContrainer = map.containerDOM;

		this._target = this.options['target'];
		if(!this._target) throw new Error(this.exceptions['NEED_TARGET']);
		var layerId = '__mt__layer_tip';
		var canvas = false;
		var targetLayer = this._target.getLayer();
		if(targetLayer && targetLayer instanceof Z.CanvasLayer) {
			canvas = true;
		}
		this._internalLayer = this._getInternalLayer(map, layerId, canvas);
		this._map = map;
		var targetCenter = this._target.getCenter();
		this._tip = new Z.Marker(targetCenter);
		this._tip['target'] = this._target;
		this._tip.setIcon({
			type: 'text',
			textStyle: this.options['style'],
			content: this.options['content'],
			offset: {x:0, y:0}
		});
		this._internalLayer.addGeometry(this._tip);
		this._tip.hide();

		var targetOffset = this._map.coordinateToScreenPoint(targetCenter);
		var labelOffset = this._computeLabelOffset();
	    targetCenter = this._map.screenPointToCoordinate({
			'top' : targetOffset['top'] - labelOffset['top'],
			'left' : targetOffset['left'] + labelOffset['left']
		});
		this._tip.setCenter(targetCenter);
		this._target.on('shapechanged positionchanged symbolchanged', Z.Util.bind(this._changeTipPosition, this), this)
					.on('remove', this.removeTip, this);
        this._tip.on('click dblclick rightclick', Z.DomUtil.stopPropagation, this);

        var trigger = this.options['trigger'];
        var me = this;
        if(trigger === 'hover') {
			this._target.on('mouseover', function showTip() {
						 me.showTip();
						 map.disableDragPropagation();
						 map.disableDoubleClickZoom();
					 }, this)
					 .on('mouseout', function hideTip() {
					 	setTimeout(function(){
					 		me.hideTip();
							map.enableDragPropagation();
							map.enableDoubleClickZoom();
					 	}, 1000);
					 }, this);
        } else if(trigger === 'click') {
			this._target.on('click', function showTip() {
						 me.showTip();
						 map.disableDragPropagation();
						 map.disableDoubleClickZoom();
					 }, this);
        } else {
        	me.showTip();
        }
        if(this.options['draggable']) {
        	 this._tip.on('mousedown', this._onMouseDown, this)
        		 	  .on('dragend', this._endMove, this)
        		 	  .on('mouseout', this._recoverMapEvents, this);
        }
		return null;
	},

	_afterAdd: function() {

	},

	_computeLabelOffset: function() {
		var painter = this._tip.getPainter();
		var textSize = painter.measureTextMarker();
		var width = textSize['width'],
			height = textSize['height'];
		var geoSize = this._target.getSize();
		var w = geoSize['width'],
			h = geoSize['height'];
		var left = 0, top = 0;
		if (this.options) {
			var placement = this.options['style']['placement'];
			
			if('left' === placement) {
				left = -w/2;
				top = h/2;
			} else if('right' === placement) {
				left = w/2;
				top = h/2;
			} else if('top' === placement) {
				left = 0;
				top = height + h/2;
			} else if('bottom' === placement) {
				left = 0;
				top = 0;
			}
		}
		return {'left':left, 'top':top};
	},

	_linkToTarget: function() {
		var geometry = this.options['target'];
		var center = geometry.getCenter();
		var nearestPoints = this._getNearestPoint(center);
		var path = [center, nearestPoints[0], nearestPoints[1]];
		this._link = new Z.Polyline(path);
		var strokeSymbol = {
			'line-color': this.options['style']['line-color'],
			'line-width': this.options['style']['line-width']
		};
		this._link.setSymbol(strokeSymbol);
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

		var painter = this._tip.getPainter();
		var textSize = painter.measureTextMarker();
		var width = textSize['width'],
			height = textSize['height'];

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
		var placement = this.options['style']['placement'];
		var center = this._tip.getCenter();
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
		}
	},

	_changeLinkPath: function() {
		var geometry = this.options['target'];
		var center = geometry.getCenter();
		var nearestPoints = this._getNearestPoint(center);
		var path = [center, nearestPoints[0], nearestPoints[1]];
		var strokeSymbol = this._link.getSymbol();
		strokeSymbol['line-color'] = '#ff0000';
		this._link.setSymbol(strokeSymbol);
		this._link.setPath(path);
	},

	_changeTipPosition: function(event) {
		this._target = event['target'];
		this._tip.setCenter(this._target.getCenter());
	},

	_onMouseDown: function(event) {
		Z.DomUtil.setStyle(this._tipContrainer, 'cursor: move');
		this._tip.startDrag();
		this._map.disableDragPropagation();
		this._map.disableDoubleClickZoom();
		if(this.options['link']) {
			this._map.on('mousemove zoomend resize moving', this._changeLinkPath, this);
		}
        this.fire('dragstart', {'target': this});
	},

	_endMove: function(event) {
		Z.DomUtil.setStyle(this._tipContrainer, 'cursor: default');
		if(this.options['link']) {
			this._map.off('mousemove zoomend resize moving', this._changeLinkPath, this);
			var strokeSymbol = {
				'line-color': this.options['style']['stroke'],
				'line-width': this.options['style']['strokewidth']
			};
			if(this._link) {
				this._link.setSymbol(strokeSymbol);
			}
		}
		this.fire('dragend', {'target': this});
	},

	_recoverMapEvents: function() {
		this._map.enableDragPropagation();
		this._map.enableDoubleClickZoom();
	}
});