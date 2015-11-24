Z.render.vectorlayer.Canvas=Z.render.Canvas.extend({

    initialize:function(layer) {
        this._layer = layer;
        this._mapRender = layer.getMap()._getRender();
        this._registerEvents();
    },

    _registerEvents:function() {
        this.getMap().on('_zoomstart _zoomend _moveend _resize',this._onMapEvent,this);
    },

    _onMapEvent:function(param) {
        if (param['type'] === '_zoomend') {
            this._layer._eachGeometry(function(geo) {
                geo._onZoomEnd();
            });
            if (!this._resources) {
                this.rend();
            } else {
                this._draw();
            }
        } else if (param['type'] === '_zoomstart') {
            this._clearCanvas();

        } else if (param['type'] === '_moveend') {
            if (!this._resources) {
                this.rend();
            } else {
                this._draw();
            }
        } else if (param['type'] === '_resize') {
            this._resizeCanvas();
            if (!this._resources) {
                this.rend();
            } else {
                this._draw();
            }
        }
    },

    getMap: function() {
        return this._layer.getMap();
    },

    remove:function() {
        this.getMap().off('_zoomend _moveend _resize',this._onMapEvent,this);
        this._requestMapToRend();
    },

    /**
     * 实时绘制
     */
    rendRealTime:function() {
        this._draw();
    },

    rend:function(ignoreResourceCheck) {
        this._clearTimeout();
        if (!this.getMap() || this.getMap().isBusy()) {
            return;
        }
        var me = this;
        this._rendTimeout = setTimeout(function() {
            if (true===ignoreResourceCheck) {
                me._draw();
            } else {
                me._promise();
            }
        },50);
    },

    _clearTimeout:function() {
        if (this._rendTimeout) {
            clearTimeout(this._rendTimeout);
        }
    },

    /**
     * 读取并载入绘制所需的外部资源, 例如markerFile, shieldFile等
     * @return {[Promise]} promise数组
     */
    _promise:function() {
        if (!this.getMap() || this.getMap().isBusy()) {
            return;
        }
        if (this._layer.isEmpty()) {
            this._requestMapToRend();
            return;
        }
        var me = this;
        var preResources = this._resources;
        //如果resource已经存在, 则不再重复载入资源
        /*if (this._resources) {
            return [new Z.Promise(function(resolve, reject) {resolve(me._resources);})];
        }*/
        //20150530 loadResource不加载canvasLayer中的geometry icon资源，故每次绘制canvas都去重新检查并下载资源
        var promises = [];
        this._resources = new Z.render.vectorlayer.Canvas.Resources();
        this._layer._eachGeometry(function(geo) {
            if (!geo || !geo.isVisible()) {
                return;
            }
            /*if (!ext || !ext.isIntersect(mapExtent)) {
                return;
            }*/
            var resourceUrls = geo._getExternalResource();
            if (Z.Util.isArrayHasData(resourceUrls)) {
                //重复
                var cache = {};
                for (var i = resourceUrls.length - 1; i >= 0; i--) {
                    var url = resourceUrls[i];
                    if (cache[url]) {
                        continue;
                    }
                    cache[url] = 1;
                    if (!preResources || !preResources.getImage(url)) {
                        var promise = new Z.Promise(function(resolve, reject) {
                            var img = new Image();
                            img.onload = function(){
                                me._resources.addResource(this.src,this);
                                resolve({/*'url':this.src,'image':img*/});
                            };
                            img.onabort = function(){
                                me._resources.addResource(this.src,this);
                                resolve({/*'url':this.src,'image':img*/});
                            };
                            img.onerror = function(){
                                resolve({/*'url':this.src,'image':img*/});
                            };
                            Z.Util.loadImage(img,  resourceUrls[i]);
                            // img.src = resourceUrls[i];
                        });
                        promises.push(promise);
                    } else {
                        me._resources.addResource(url,preResources.getImage(url));
                    }
                }
            }
        });
        if (promises.length > 0) {
            Z.Promise.all(promises).then(function(reources) {
                me._draw();
            });
        } else {
            this._draw();
        }
    },

    _draw:function() {
        var map = this.getMap();
        if (!map || map.isBusy()) {
            return;
        }
        if (this._layer.isEmpty()) {
            this._requestMapToRend();
            return;
        }
        //载入资源后再进行绘制
        if (!this._canvas) {
            this._createCanvas();
            Z.Canvas.disableImageSmoothing(this._context);
        }

        var fullExtent = map._getViewExtent()/*.expand(size)*/;
        this._clearCanvas();
        this._layer._eachGeometry(function(geo) {
            //geo的map可能为null,因为绘制为延时方法
            if (!geo || !geo.isVisible() || !geo.getMap() || !geo.getLayer() || (!geo.getLayer().isCanvasRender())) {
                return;
            }
            var ext = geo._getPainter().getPixelExtent();
            if (!ext || !ext.isIntersect(fullExtent)) {
                return;
            }
            geo._getPainter().paint();
        });
        this._canvasFullExtent = fullExtent;
        this._requestMapToRend();
    },

    getPaintContext:function() {
        if (!this._context) {
            return null;
        }
        return [this._context, this._resources];
    },

    getCanvasImage:function() {
        if (!this._canvasFullExtent || this._layer.isEmpty()) {
            return null;
        }
        var size = this._canvasFullExtent.getSize();
        var point = this._canvasFullExtent.getMin();
        return {'image':this._canvas,'layer':this._layer,'point':this.getMap()._viewPointToContainerPoint(point),'size':size};
    },

    /**
     * 显示图层
     * @expose
     */
    show: function() {
        this._layer._eachGeometry(function(geo) {
            geo.show();
        });
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide: function() {
        this._layer._eachGeometry(function(geo) {
            geo.hide();
        });
    },

    setZIndex: function(zindex) {
        this._requestMapToRend();
    },

    _requestMapToRend:function() {
        if (!this.getMap().isBusy()) {
            this._mapRender.rend();
        }

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
