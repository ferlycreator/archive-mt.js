/**
 * 测面积鼠标工具类
 */
Z['ComputeAreaTool'] = Z.ComputeAreaTool = Z.Class.extend({
	includes: [Z.Eventable],
	/**
	* 初始化测面积工具
	* options:{aftermeasure: fn}
	*/
	initialize: function(options, map) {
		Z.Util.extend(this, options);
		if(map) {
			this.addTo(map);
		}
		return this;
	},

	addTo: function(map) {
		this.map = map;
		if (!this.map) {return;}
		if (!this.mode) {
			this.mode = Z.Geometry.TYPE_POLYGON;
		}
		this.layerId = '____system_layer_computeareatool';
		this.drawLayer = null;
		this.drawTool = null;
		this.rings = [];
		this.enable();
		return this;
	},
	/**
	* 激活测距鼠标工具
	* @expose
	*/
	enable: function() {
		if (!this.map) return;
		this.drawLayer = this.map.getLayer(this.layerId);
		if (this.drawLayer != null && this.drawTool != null) {
			this.drawTool.enable();
			return;
		}
		if (this.drawLayer != null) {
			this.map.removeLayer(this.layerId);
		}
		var _canvas = this.map.canvasDom;

		this.drawLayer = new Z.SVGLayer(this.layerId);
		this.map.addLayer(this.drawLayer);

		drawTool = new Z.DrawTool({
			'mode':Z.Geometry.TYPE_POLYGON,
			'symbol': {
				'strokeSymbol':{'stroke':'#ff0000', 'stroke-width':2, 'opacity':1},
				'fillSymbol':{'fill':'#ff0000', 'fill-opacity':0.2}
			},
			'afterdrawdisable': true
		}).addTo(this.map);

		drawTool.on('startdraw', Z.Util.bind(this.startMeasure, this));
		drawTool.on('drawring', Z.Util.bind(this.measureRing, this));
		drawTool.on('afterdraw', Z.Util.bind(this.afterMeasure, this));

		this.counter = 0;
		this.pointCounter = 0;
		this.tmpMarkers = [];
	},

	/**
	* 停止测距鼠标工具
	* @expose
	*/
	disable: function() {
		this.clear();
		if (this.drawTool != null) {
			this.drawTool.disable();
		}
	},

	measureRing: function (param) {
		var coordinate = param['coordinate'];
		this.pointCounter ++;
		var point = this.genMesurePoint(coordinate,this.layerId + '_ringp_' + this.pointCounter + '_' + this.counter);
		this.drawLayer.addGeometry([point]);
		this.tmpMarkers.push(point);
	},

	startMeasure: function(param) {
		var coordinate = param['coordinate'];
		var point = this.genMesurePoint(coordinate,this.layerId + '_ringp_' + this.pointCounter +'_' + this.counter);
		this.drawLayer.addGeometry([point]);
		this.tmpMarkers.push(point);
	},

	afterMeasure: function(param) {
		var coordinate = param['coordinate'];
		var polygon = param['target'];
		var area = this.map.computeGeodesicArea(polygon);
		var divContent = null;
		if (area > 1000000) {
			divContent = (area/1000000).toFixed(1)+'平方公里';
		} else {
			divContent = area.toFixed(1)+'平方米';
		}

		this.endMeasure(coordinate, divContent, polygon);
		this.changeCursor('default');
		this.counter++;
		/**
		 * 面积量算结束事件
		 * @event aftermeasure
		 * @param result: 总面积
		 */
		this.fire('aftermeasure', {'result' : area});
	},

	/**
	 * 清除测量过程中产生的标注
	 * @expose
	 */
	clear:function(){
		if (!this.map) return;
		if (this.drawLayer != null) {
			this.drawLayer.clear();
		}
		var _canvas = this.map.canvasDom;
		if (!_canvas)
			this.changeCursor('default');
		this.rings = [];
	},

	outline: Z.DistanceTool.prototype.outline,
	genMesurePoint: Z.DistanceTool.prototype.genMesurePoint,
	endMeasure: Z.DistanceTool.prototype.endMeasure,
	changeCursor: Z.DistanceTool.prototype.changeCursor
});