Z.render.vectorlayer.Canvas=Z.render.Canvas.extend({

    initialize:function(layer) {
        this._layer = layer;
        this._mapRender = layer.getMap()._getRender();
        this._registerEvents();
    },

    _registerEvents:function() {
        this.getMap().on('_zoomend',function() {
            this._layer._eachGeometry(function(geo) {
                geo._onZoomEnd();
            });
        },this);
        this.getMap().on('_resize',function() {
            this._resizeCanvas();
        },this);
    },

    getMap: function() {
        return this._layer.getMap();
    },

    /**
     * 是否懒载入? 即连续多次请求时, 只响应最后一次
     * @return {Boolean} true | false
     */
    isLazy:function() {
        return true;
    },

    /**
     * 绘制geometry
     * @param  {[Geometry]} geometries 要绘制的图形
     */
    rend: function(geometries) {
        this._requestMapToRend();
    },

    /**
     * 实时绘制
     */
    rendRealTime:function() {
        this._requestMapToRend(true);
    },

    /**
     * 读取并载入绘制所需的外部资源, 例如markerFile, shieldFile等
     * @return {[Promise]} promise数组
     */
    promise:function() {
        var me = this;
        var preResources = this._resources;
        //如果resource已经存在, 则不再重复载入资源
        /*if (this._resources) {
            return [new Z.Promise(function(resolve, reject) {resolve(me._resources);})];
        }*/
        //20150530 loadResource不加载canvasLayer中的geometry icon资源，故每次绘制canvas都去重新检查并下载资源
        var map = this.getMap();
        var mapExtent = map.getExtent();
        var promises = [];
        this._resources = new Z.render.vectorlayer.Canvas.Resources();
        this._layer._eachGeometry(function(geo) {
            if (!geo || !geo.isVisible()) {
                return;
            }
            var ext = geo.getExtent();
            if (!ext || !ext.isIntersect(mapExtent)) {
                return;
            }
            var resourceUrls = geo._getExternalResource();
            if (Z.Util.isArrayHasData(resourceUrls)) {
                //重复
                var cache = {};
                for (var i = resourceUrls.length - 1; i >= 0; i--) {
                    var url = resourceUrls[i];
                    if (cache[url]) {
                        continue;
                    }
                    var promise = null;
                    cache[url] = 1;
                    if (preResources && preResources.getImage(url)) {
                        promise = new Z.Promise(function(resolve, reject) {
                            var image = preResources.getImage(url);
                            me._resources.addResource(url,image);
                            resolve({'url':url,'image':image});
                        });
                    } else {
                        promise = new Z.Promise(function(resolve, reject) {
                            var img = new Image();
                            img.onload = function(){
                                me._resources.addResource(this.src,this);
                                resolve({'url':this.src,'image':img});
                            };
                            img.onabort = function(){
                                me._resources.addResource(this.src,this);
                                resolve({'url':this.src,'image':img});
                            };
                            img.onerror = function(){
                                resolve({'url':this.src,'image':img});
                            };
                            img.src = resourceUrls[i];
                        });
                    }

                    promises.push(promise);
                }
            }
        });
        var extent = map.getExtent();
        this._fullExtent =  new Z.Extent(
            map.coordinateToViewPoint(new Z.Coordinate(extent['xmin'],extent['ymin'])),
            map.coordinateToViewPoint(new Z.Coordinate(extent['xmax'],extent['ymax']))
            );
        return promises;
    },



    draw:function() {
        //载入资源后再进行绘制
        if (!this._canvas) {
            this._createCanvas();
        }
        this._clearCanvas();
        var pxExtent = this._fullExtent;
        this._layer._eachGeometry(function(geo) {
            //geo的map可能为null,因为绘制为延时方法
            if (!geo || !geo.isVisible() || !geo.getMap() || !geo.getLayer() || (!geo.getLayer().isCanvasRender())) {
                return;
            }
            var ext = geo._getPainter().getPixelExtent();
            if (!ext || !ext.isIntersect(pxExtent)) {
                return;
            }
            geo._getPainter().paint();
        });
    },

    getPaintContext:function() {
        if (!this._context) {
            return null;
        }
        return [this._context, this._resources];
    },

      getCanvasImage:function() {
        var point = this._fullExtent.getMin();
        return {'canvas':this._canvas,'point':this.getMap()._viewPointToContainerPoint(point)};
    },

    /**
     * 显示图层
     * @expose
     */
    show: function() {
        //this._requestMapToRend();
        this._layer._eachGeometry(function(geo) {
            geo.show();
        });
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide: function() {
        //this._requestMapToRend();
        this._layer._eachGeometry(function(geo) {
            geo.hide();
        });
    },

    setZIndex: function(zindex) {
        this._requestMapToRend();
    },

    _requestMapToRend:function(isRealTime) {
        this._mapRender.rendLayer(this._layer ,isRealTime);
    }
});


Z.render.vectorlayer.Canvas.Resources=function() {
    this._resources = {};
};

Z.render.vectorlayer.Canvas.Resources.prototype={
    addResource:function(url, img) {
        this._resources[url] = img;
    },

    getImage:function(url) {
        return this._resources[url];
    }
};
