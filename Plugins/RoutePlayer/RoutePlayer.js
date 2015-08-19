/**
 * <pre>
 * 轨迹播放类
 * 播放设置参数说明:
 * { 		
 * 		timeSpan: 	400, 		//播放时间片，单位毫秒，即隔多少秒播放一次，默认为400
 * 		unitTime: 	5,			//单位时间，即每个timeSpan下流逝的实际时间，以毫秒为单位，历史播放模式下默认为5秒	
 * 		enableDrawRoute:	true|false	//是否绘制轨迹
 * }
 * 轨迹对象说明:
 * {
 * 		getIdentifiers: functin(){},
 * 		start: function(identifier) {},
 * 		getMarkerSymbol:function(identifier) {},
 * 		getRouteSymbol:function(identifier) {},
 * 		next: function(identifier, time){}
 * }
 * </pre>
 * @param map {seegoo.map.Map} 地图对象
 * @param config {Object} 播放设置
 * @param routes {Object} 轨迹对象
 * @constructor
 */
Z.RoutePlayer = function(map, config, routes) {
	this.guid=seegoo.maps.Util.Guid();
	this.map=map;
	this.routes = routes;
	this.config = config;	
	this.timeSpan=null;
	this.unitTime=null;
	this.enableDrawRoute=null;
	if (config) {
		this.timeSpan=config["timeSpan"];
		this.unitTime=config["unitTime"];
		this.enableDrawRoute=config["enableDrawRoute"];
		//this.graphicMode = config["mode"];
	}
	this.graphicMode="canvas";
	if (!seegoo.maps.config.browser.canvas) {
		this.graphicMode="graphic";
	}
	if (!this.timeSpan) {
		this.timeSpan = 400;
	}
	if (!this.unitTime) {
		this.unitTime = 5;
	}
	if (this.enableDrawRoute==null) {
		this.enableDrawRoute=true;
	}
	this.looper=null;
	this.focusId = null;
	this.markerLayer=null;
	this.routeLayer=null;
};

seegoo.maps.Util.extend(seegoo.maps.RoutePlayer, seegoo.maps.Eventable,{
	/**
	 * 初始化
	 */
	_initialize:function() {
		if (this.looper) {
			clearInterval(this.looper);
		}
		this.removeEventListener("playing",focusListener);
		if (!this.map || !this.routes) return;
		this.projection=this.map.config.spatialReference.projections;
		this.routeCache={};
		var routes = this.routes;			
		var currentTime=0;
		var identifiers = routes["getIdentifiers"]();
		this.identifiers = [];
		for (var i=0, len=identifiers.length;i<len;i++) {
			if (!identifiers[i]) continue;
			this.identifiers.push(identifiers[i]);
			this.routeCache[identifiers[i]]={"updated":false,"route":[]};
			//rstart为一个对象:t为播放时间
			var rstart = routes["start"](identifiers[i]);
			if (rstart != null && rstart["t"] != undefined && rstart["t"] != null) {
				var time = rstart["t"];				
				if (currentTime === 0) {
					currentTime=time;					
				} else {
					if (time<currentTime) {
						currentTime=time;
					}
				}
			} else {
				//如果start不存在t，则用当前时间代替
				currentTime=new Date().getTime();
			}
		}
		this.currentTime = currentTime;
		this.startTime = currentTime;
		//准备绘图图层
		var markLayerId = "__seegoo_maps_routeplay_marker_"+this.guid;
		var routeLayerId = "__seegoo_maps_routeplay_routes_"+this.guid;
		var markerLayer = this.map.getGraphicLayer(markLayerId);
		if (!markerLayer) {
			this.markerLayer = new seegoo.maps.GraphicLayer(markLayerId);
			this.map.addGraphicLayer(this.markerLayer);
		} 
		/*if ("canvas" === this.graphicMode && seegoo.maps.config.browser.canvas) {
//			var markerLayer = this.map.getCanvasLayer(markLayerId);
//			if (!markerLayer) {
//				this.markerLayer = new seegoo.maps.CanvasLayer(markLayerId);
//				this.map.addCanvasLayer(this.markerLayer);
//			} 
			
			var routeLayer = this.map.getCanvasLayer(routeLayerId);
			if (!routeLayer) {
				this.routeLayer = new seegoo.maps.CanvasLayer(routeLayerId);
				this.map.addCanvasLayer(this.routeLayer);
			} 
		} else {*/
			
			
			var routeLayer = this.map.getGraphicLayer(routeLayerId);
			if (!routeLayer) {
				this.routeLayer = new seegoo.maps.GraphicLayer(routeLayerId);
				this.map.addGraphicLayer(this.routeLayer);
			} 
//		}
		//this.markerLayer = markerLayer;
		this.markerLayer.clear();
		//this.routeLayer = routeLayer;
		this.routeLayer.clear();
		this.addEventListener("playing",focusListener);
		var _this=this;
		function focusListener(param) {			
				_this._onFocus();
			
		}
		
	},
	/**
	 * 开始播放轨迹
	 */
	start:function() {		
		if (!this.map || !this.routes) return;
		this._initialize();
		this.executeListeners("playstarted",{"target":this});
		var _this=this;
		this.looper = setInterval(function() {
			_this._loop();
		},this.timeSpan);
	},	
	/**
	 * 暂停播放轨迹
	 */
	pause:function() {
		this._clearLooper();
		this.executeListeners("playpaused",{"target":this});
	},
	/**
	 * 清除looper
	 */
	_clearLooper:function(){
		if (this.looper!= null) {
			clearTimeout(this.looper);
		}
		this.looper = null;
	},
	/**
	 * 恢复播放
	 */
	resume:function() {
		var _this=this;
		if (this.looper != null) return;
		this.executeListeners("playresumed",{"target":this});		
		this.looper = setInterval(function() {
			_this._loop();
		},this.timeSpan);
	},
	/**
	 * 停止播放轨迹
	 */
	stop:function() {
		this.currentTime = this.startTime;
		this._clearLooper();
		this.clearOverlays();
		//回到最初状态
		this.executeListeners("playstopped",{"target":this});
	},
	clearOverlays:function() {
		if (this.markerLayer) {
			this.markerLayer.clear();
		}
		if (this.routeLayer) {
			this.routeLayer.clear();
		}
	},
	/**
	 * 循环取数据
	 */
	_loop:function(donotDraw) {
		var _this = this;
		var unitTime = this.unitTime;		
		var routeCache = this.routeCache;
		var routes = this.routes;
		var identifiers = this.identifiers;
		var endRoutesCnt=0;
		for (var i=0, len=identifiers.length;i<len;i++) {
			var routeId = identifiers[i];
			if (routeCache[routeId]["ended"]) {
				endRoutesCnt++;
				continue;
			}
			var hisRoutes = routeCache[routeId]["route"];
			if (!hisRoutes) continue;
			var points = routes["next"](routeId,this.getCurrentTime());
			if (!points) {
				routeCache[routeId]["updated"] = false;
				continue;
			} else if (-1===points) {
				routeCache[routeId]["updated"] = false;
				routeCache[routeId]["ended"] = true;
				this.executeListeners("routeended",{"target":routeId,"t":this.getCurrentTime()});
				continue;
			}
			var prePoint = null;
			if (hisRoutes.length>0) {
				prePoint = hisRoutes[hisRoutes.length-1];
			}
			routeCache[routeId]["updated"] = false;
			for (var j=0, jlen=points.length;j<jlen;j++) {
				var point = points[j];
				if (!prePoint || (prePoint.x != point["x"] || prePoint.y != point["y"])) {
					routeCache[routeId]["updated"] = true;
					//如果新加入的点和上两个点组成直线，则删除上一个点
					if (hisRoutes.length>1 && isLast3InLine(hisRoutes,point)) {
						hisRoutes.splice(hisRoutes.length-1,1);
					}
					hisRoutes.push(new seegoo.maps.MLonLat(point["x"],point["y"]));
					prePoint = point;
				} 
			}			
			
		}
		if (endRoutesCnt === identifiers.length) {
			this._clearLooper();
			this.executeListeners("playended",{"target":this,"t":this.getCurrentTime()});
			return;
		}
		this.currentTime += unitTime*1000;
		if (!donotDraw)
			this._draw();	
		
		/**
		 * point和hisRoutes最后两个点是不是组成一条直线，如果是的话，则从数组中去掉最后一个点，减少线上的点数
		 * @param hisRoutes
		 * @param point
		 * @returns {Boolean}
		 */
		function isLast3InLine(hisRoutes,point) {
			if (!hisRoutes || hisRoutes.length<2 || !point) return false;
			var len=hisRoutes.length;
			var triangle = new seegoo.maps.Polygon("tmp",[point,hisRoutes[len-1],hisRoutes[len-2]]);
			triangle.setMap(_this.map);
			var area = triangle.computeArea();
			if (area != null && area <= seegoo.maps.Polygon.prototype.SIMPLFY_THRESHOLD) {
				return true;
			}
			return false;
		}
	},
	/**
	 * 绘制轨迹
	 */
	_draw:function() {
		var routeObjs= this.routes;
		var identifiers = this.identifiers;
		var markers=[];
		var routeGeos=[];
		var routeCache=this.routeCache;
		for (var i=0, len=identifiers.length;i<len;i++) {
			var routeId = identifiers[i];
			var routePlay = routeCache[routeId];
			if (!routePlay["updated"]) continue;
			var hisRoutes=routePlay["route"];
			if (this.markerLayer) {
				var marker = this.markerLayer.getGeometry(routeId);				
				if (hisRoutes.length>0) {
					var center = hisRoutes[hisRoutes.length-1];										
					if (!marker) {						
						marker = new seegoo.maps.Marker(routeId,center);		
						var symbol = null;
						if (routeObjs["getMarkerSymbol"]) {
							symbol = routeObjs["getMarkerSymbol"](routeId);
						}
						if (symbol)
							marker.setSymbol(symbol);
						markers.push(marker);
						this.executeListeners("routestarted",{"target":routeId,"t":this.getCurrentTime()});
					} else {
						marker.setCenter(center);
					}
				}
				//旋转marker角度
				//
				if (marker && marker.markerIcon && marker.isVisible() && hisRoutes.length >1)  {
					var preDegree = 0.1;
					var degree = this.computeMarkerDegree(hisRoutes[hisRoutes.length-2],hisRoutes[hisRoutes.length-1]);
					if (hisRoutes.length>2) {
						preDegree = this.computeMarkerDegree(hisRoutes[hisRoutes.length-3],hisRoutes[hisRoutes.length-2]);
						preDegree = Math.round(preDegree);
					}
					degree = Math.round(degree);
					if (degree != preDegree) {
						var markerDom = marker.markerIcon;
						var originCss = markerDom.originCss;
//						console.log(degree);
						if (seegoo.maps.config.browser.ie6 || (seegoo.maps.config.browser.ie && document["documentMode"] && document["documentMode"] <= 9)){
							var ieMatrix = {
									"45":"progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865482, M12=0.7071067811865466, M21=-0.7071067811865466, M22=0.7071067811865482, SizingMethod='auto expand')",
									"90":"progid:DXImageTransform.Microsoft.BasicImage(rotation=-1)",
									"135":"progid:DXImageTransform.Microsoft.Matrix(M11=-0.7071067811865479, M12=0.7071067811865471, M21=-0.7071067811865471, M22=-0.7071067811865479, SizingMethod='auto expand')",
									"180":"progid:DXImageTransform.Microsoft.BasicImage(rotation=-2)",
									"225":"progid:DXImageTransform.Microsoft.Matrix(M11=-0.7071067811865471, M12=-0.7071067811865479, M21=0.7071067811865479, M22=-0.7071067811865471, SizingMethod='auto expand')",
									"270":"progid:DXImageTransform.Microsoft.BasicImage(rotation=-3)",
									"315":"progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865478, M12=-0.7071067811865471, M21=0.7071067811865471, M22=0.7071067811865478, SizingMethod='auto expand')",
									"360":"progid:DXImageTransform.Microsoft.BasicImage(rotation=-4)"
							};
							var d = Math.abs(Math.floor(degree/45));
							var filter = ieMatrix[d*45];
//							var filterCss = "";
//							
//							if (document.documentMode >= 8) {
////								filterCss += "-ms-filter:\""+filter+"\";border:none;";
//							} else {
////								filterCss += "filter: "+filter+";border:none;";
//							}
							markerDom.style.filter = filter;
//							markerDom.style.cssText = filterCss+originCss;
						} else {
							markerDom.style.cssText = originCss+";-o-transform: rotate(-"+degree+"deg); -webkit-transform: rotate(-"+degree+"deg);-moz-transform: rotate(-"+degree+"deg);transform: rotate(-"+degree+"deg);";
						}
						
					}
				}
			}
			if (this.enableDrawRoute && this.routeLayer) {	
				var route = this.routeLayer.getGeometry(routeId);
				//var hisRoutes = routeCache[routeId];
				if (hisRoutes && hisRoutes.length>1) {					
					if (!route) {
						route = new seegoo.maps.Polyline(routeId,hisRoutes);
						var symbol = null;
						if (routeObjs["getRouteSymbol"]) {
							symbol = routeObjs["getRouteSymbol"](routeId);
						}	
						if (symbol)
							route.setSymbol(symbol);
						routeGeos.push(route);
					} else {
						route.setRings(hisRoutes);
					}					
				}
			}
			this.executeListeners("routeplaying",{"target":routeId,"t":this.getCurrentTime()});
		};
		this.executeListeners("playing",{"target":this,"t":this.getCurrentTime()});
		if (this.markerLayer)
			this.markerLayer.addGeometry(markers);
		if (this.routeLayer)
			this.routeLayer.addGeometry(routeGeos);
	},
	/**
	 * 根据next与pre相对于横轴的角度
	 * @param pre
	 * @param next
	 * @returns
	 */
	computeMarkerDegree:function(pre, next) {
		if (!pre || !next) return null;
		var pPre = this.map.config.spatialReference.projections.geoForward(pre.x,pre.y);
		var pNext = this.map.config.spatialReference.projections.geoForward(next.x,next.y);		
		var spanX = pNext.x-pPre.x;
		var spanY = pNext.y-pPre.y;
		var degree = Math.atan(Math.abs(spanY/spanX))*180/Math.PI;
		var incre = this.map.incre;
		if (pNext.x*incre.x < pPre.x*incre.x) {
			degree = 180-degree;
		}
		if (pNext.y*incre.y < pPre.y*incre.y) {
			degree = 360-degree;
		}
		return degree;
	},
	/**
	 * 设定新的时间
	 * @param time
	 */
	setTime:function(time) {
		if (time == null) return;
//		var now = new Date().getTime();
		this._initialize();
//		console.log(new Date().getTime()-now);
//		now = new Date().getTime();
//		while (this.getCurrentTime()<=time) {
//			this._loop(false);
//		}	
		for (var i=0,len=this.identifiers.length;i<len;i++) {
			var hisRoutes = this.routes["getRoute"](this.identifiers[i],time);
			this.routeCache[this.identifiers[i]]["route"] = hisRoutes;
			this.routeCache[this.identifiers[i]]["updated"] = true;
		}
		this.currentTime = time;
//		console.log(new Date().getTime()-now);
//		now = new Date().getTime();
		this._draw();
//		console.log(new Date().getTime()-now);
		var _this=this;
		this.looper = setInterval(function() {
			_this._loop();
		},this.timeSpan);
	},
	/**
	 * 聚焦
	 * @param identifier {String} 聚焦的播放物id
	 * @param mode {Number} 聚焦模式
	 */
	focus:function(identifier,mode) {
		this.focusId = identifier;
		this.focusMode=mode;
	},
	unfocus:function() {
		this.focusId = null;
	},
	_onFocus:function() {
		if (this.focusId) {
			var routePlay = this.routeCache[this.focusId];
			if (!routePlay) return;
			var hisRoutes=routePlay["route"];
			if (!hisRoutes || hisRoutes.length===0) return;
			var center = hisRoutes[hisRoutes.length-1];
			if (!this.focusMode) this.focusMode=1;
			if (this.focusMode===1) {
				this.map.setCenter(center);
			} else if (this.focusMode === 2) {
				//超出地图范围后再setCenter
			}
			
		}
	},
	/**
	 * 获得当前播放时间
	 * 
	 */
	getCurrentTime:function() {
		return this.currentTime;
	},
	show:function(identifier) {
		var marker = this.markerLayer.getGeometry(identifier);
		if (marker) {
			marker.show();
		}
		if (this.enableDrawRoute && this.routeLayer) {	
			var route = this.routeLayer.getGeometry(identifier);
			if (route) {
				route.show();
			}
		}
	},
	hide:function(identifier) {
		var marker = this.markerLayer.getGeometry(identifier);
		if (marker) {
			marker.hide();
		}
		if (this.enableDrawRoute && this.routeLayer) {	
			var route = this.routeLayer.getGeometry(identifier);
			if (route) {
				route.hide();
			}
		}
	},
	setTimeSpan:function(timeSpan) {
		if (!timeSpan) return;
		this.timeSpan = timeSpan;
	},
	setUnitTime:function(unitTime) {
		if (!unitTime) return;
		this.unitTime = unitTime;
		
	}
});
