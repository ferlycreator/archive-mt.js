/**
 * 所有图层的基类
 * 供Map调用的图层方法有:
 * load,onMoving, onMoveEnd, onResize, onZoomStart, onZoomEnd
 * @param  {[type]} map             [description]
 * @param  {[type]} zIndex)         {		if        (!map) {return;}		this.map [description]
 * @param  {[type]} getId:function( [description]
 * @return {[type]}                 [description]
 */
Z['Layer']=Z.Layer=Z.Class.extend({
	
	includes: Z.Eventable,

	events:{
		LAYER_LOADED:'layerloaded'
	},


	prepare:function(map,zIndex) {
		if (!map) {return;}
		this.map = map;
		this.setZIndex(zIndex);
		if (Z.Util.isNil(this.visible)) {
			this.visible = true;
		}
	},


	getZIndex:function() {
		return this.zIndex;
	},
	
	/**
	 * 获取图层id
	 * @returns
	 * @expose
	 */
	getId:function() {
		return this.identifier;
	},

	/**
	 * 设置图层id
	 * @param {String} [id] [图层id]
	 * @expose
	 */
	setId:function(id) {
		this.identifier = id;
	},

	/**
	 * 获取图层所属的地图对象
	 * @expose
	 * @returns {seegoo.maps.Map}
	 */
	getMap:function() {
		if (this.map) {
			return this.map;
		}
		return null;
	},


	/**
	 * 获取图层的Extent
	 * @return {Extent} 图层的Extent
	 */
	getExtent:function() {
		if (!this.extent) {return null;}
		return this.extent;
	},

	/**
	 * 将图层置顶
	 * @expose
	 */
	bringToFront:function() {
		var layers = this.getLayerList();
		var hit=this.getLayerIndexOfList(layers);
		if (hit === layers.length-1) {return;}
		if (hit >= 0) {
			layers.splice(hit,1);
			layers.push(this);
		}
		for (var i=0, len=layers.length;i<len;i++) {
			layers[i].setZIndex(layers[i].baseZIndex+i);
		}
	},
	
	/**
	 * 将图层置底
	 * @expose
	 */
	bringToBack:function(){
		var layers = this.getLayerList();
		var hit=this.getLayerIndexOfList(layers);
		if (hit === 0) {
			return;
		}
		if (hit > 0) {
			layers.splice(hit,1);
			layers.push(this);
		}
		for (var i=0, len=layers.length;i<len;i++) {
			layers[i].setZIndex(layers[i].baseZIndex+i);
		}
	},
	
	/**
	 * 获取图层在图层列表中的index
	 * @param layers
	 * @returns {Number}
	 */
	getLayerIndexOfList:function(layers) {
		if (!layers) {return -1;}
		var hit = -1;
		for (var i =0, len=layers.length;i<len;i++) {
			if (layers[i] == this) {
				hit = i;
				break;
			}
		}
		return hit;
	},
	
	/**
	 * 获取该图层所属的list
	 */
	getLayerList:function() {
		if (!this.map) {return null;}
		if (this instanceof Z.SVGLayer) {
			return this.map.svgLayers;
		} else if (this instanceof Z.CanvasLayer) {
			return this.map.canvasLayers;
		} else if (this instanceof Z.CanvasLayer.Base) {
			return this.map.canvasLayers;
		} else if (this instanceof Z.DynamicLayer) {
			return this.dynLayers;
		} else if (this instanceof Z.TileLayer) {
			return this.overlapLayers;
		} else if (this instanceof Z.HeatLayer) {
			return this.map.heatLayers;
		}
		return null;
	}
});
