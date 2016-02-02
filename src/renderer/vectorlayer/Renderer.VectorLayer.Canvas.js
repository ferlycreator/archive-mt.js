Z.renderer.vectorlayer.Canvas=Z.renderer.Canvas.extend({

    initialize:function(layer) {
        this._layer = layer;
        this._mapRender = layer.getMap()._getRenderer();
        this._registerEvents();
    },

    getMap: function() {
        return this._layer.getMap();
    },

    remove:function() {
        this.getMap().off('_zoomstart _zoomend _moveend _resize',this._onMapEvent,this);
        this._requestMapToRend();
    },

    /**
     * 实时绘制并请求地图重绘
     */
    renderImmediate:function() {
        if (!this._layer.isVisible()) {
            return;
        }
        this.draw();
        this._requestMapToRend();
    },

    /**
     * render layer
     * @param  {[Geometry]} geometries   geometries to render
     * @param  {boolean} ignorePromise   whether escape step of promise
     */
    render:function(geometries, ignorePromise) {
        this._clearTimeout();
        if (!this.getMap()) {
            return;
        }
        if (!this._layer.isVisible()) {
            return;
        }
        if (Z.Util.isArrayHasData(geometries) && geometries.length === 1) {
            //if geometry is being editted or dragged, draw it ASAP
            if (geometries[0]._isRenderImmediate()) {
                var resources = geometries[0]._getExternalResource();
                //if true, it means geometry's resources are all loaded and ready to draw.
                var isReadyToDraw = true;
                if (Z.Util.isArrayHasData(resources)) {
                    if (!this._resources) {
                        isReadyToDraw = false;
                    } else {
                        for (var i = resources.length - 1; i >= 0; i--) {
                            if (!this._resources.getImage(resources[i])) {
                                isReadyToDraw = false;
                                break;
                            }
                        }
                    }

                }
                if (isReadyToDraw) {
                    this.renderImmediate();
                    return;
                }
            }
        }

        var me = this;
        this._renderTimeout = setTimeout(function() {
            if (ignorePromise) {
                me.renderImmediate();
            } else {
                me._promise();
            }
        },1);

    },

    draw:function() {
        var map = this.getMap();
        if (!map) {
            return;
        }

        //载入资源后再进行绘制
        if (!this._canvas) {
            this._createCanvas();
        }
        var layer = this._layer;
        if (layer.isEmpty() || !layer.isVisible()) {
            return;
        }
        var viewExtent = map._getViewExtent();

        var me = this;
        var counter = 0;
        this._shouldEcoTransform = true;
        if (this._clipped) {
            this._context.restore();
        }
        this._clearCanvas();
        var mask = layer.getMask();
        if (mask) {
            var maskPxExtent = mask._getPainter().getPixelExtent();
            if (!maskPxExtent.intersects(viewExtent)) {
                return;
            }
            this._context.save();
            mask._getPainter().paint();
            this._context.clip();
            this._clipped = true;
            viewExtent = viewExtent.intersection(maskPxExtent);
        }
        var geoViewExt, geoPainter;
        layer._eachGeometry(function(geo) {
            //geo的map可能为null,因为绘制为延时方法
            if (!geo || !geo.isVisible() || !geo.getMap() || !geo.getLayer() || (!geo.getLayer().isCanvasRender())) {
                return;
            }
            geoPainter = geo._getPainter();
            geoViewExt = geoPainter.getPixelExtent();
            if (!geoViewExt || !geoViewExt.intersects(viewExtent)) {
                return;
            }
            counter++;
            if (me._shouldEcoTransform && geoPainter.hasPointSymbolizer()) {
                me._shouldEcoTransform = false;
            }
            if (counter > layer.options['thresholdOfEcoTransform']) {
                me._shouldEcoTransform = true;
            }
            geoPainter.paint();
        });
        this._canvasFullExtent = map._getViewExtent();
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
        return {'image':this._canvas,'layer':this._layer,'point':this.getMap().viewPointToContainerPoint(point),'size':size};
    },

    /**
     * 显示图层
     * @expose
     */
    show: function() {
        this._layer._eachGeometry(function(geo) {
            geo._onZoomEnd();
        });
        var mask = this._layer.getMask();
        if (mask) {
            mask._onZoomEnd();
        }
        this.render();
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide: function() {
        this._requestMapToRend();
    },

    setZIndex: function(zindex) {
        this._requestMapToRend();
    },

    /**
     * 测试point处是否存在Geometry
     * @param  {ViewPoint} point ViewPoint
     * @return {Boolean}       true|false
     */
    hitDetect:function(point) {
        if (!this._context || !this._canvasFullExtent || this._layer.isEmpty()) {
            return false;
        }
        var size = this._canvasFullExtent.getSize();
        var canvasNW = this._canvasFullExtent.getMin();
        var detectPoint = point.substract(canvasNW);
        if (detectPoint.x < 0 || detectPoint.x > size['width'] || detectPoint.y < 0 || detectPoint.y > size['height']) {
            return false;
        }
        try {
            var imgData = this._context.getImageData(detectPoint.x, detectPoint.y, 1, 1).data;
            if (imgData[3] > 0) {
                return true;
            }
        } catch (error) {
            if (!this._errorThrown) {
                console.warn('hit detect failed with tainted canvas, some geometries have external resources in another domain:\n', error);
                this._errorThrown = true;
            }
            //usually a CORS error will be thrown if the canvas uses resources from other domain.
            //this may happen when a geometry is filled with pattern file.
            return false;
        }
        return false;

    },

    //determin whether this layer can be economically transformed, ecoTransform can bring better performance.
    //if all the geometries to render are vectors including polygons and linestrings, ecoTransform won't reduce user experience.
    shouldEcoTransform:function() {
        if (Z.Util.isNil(this._shouldEcoTransform)) {
            return true;
        }
        return this._shouldEcoTransform;
    },

    isResourceLoaded:function(url) {
        if (!this._resources) {
            return false;
        }
        return this._resources.getImage(url);
    },

    _registerEvents:function() {
        this.getMap().on('_zoomend _moveend _resize',this._onMapEvent,this);
    },

    _onMapEvent:function(param) {
        if (param['type'] === '_zoomend') {
            if (this._layer.isVisible()) {
                this._layer._eachGeometry(function(geo) {
                    geo._onZoomEnd();
                });
                var mask = this._layer.getMask();
                if (mask) {
                    mask._onZoomEnd();
                }
            }
            if (!this._resources) {
                this.render();
            } else {
                this.renderImmediate();
            }
        } else if (param['type'] === '_moveend') {
            if (!this._resources) {
                this.render();
            } else {
                this.renderImmediate();
            }
        } else if (param['type'] === '_resize') {
            this._resizeCanvas();
            if (!this._resources) {
                this.render();
            } else {
                this.renderImmediate();
            }
        }
    },

    _clearTimeout:function() {
        if (this._renderTimeout) {
            clearTimeout(this._renderTimeout);
        }
    },

    /**
     * 读取并载入绘制所需的外部资源, 例如markerFile, shieldFile等
     * @return {[Promise]} promise数组
     */
    _promise:function() {
        if (!this.getMap()) {
            return;
        }
        if (this._layer.isEmpty()) {
            this.renderImmediate();
            return;
        }
        var resourceUrls = [];
        this._layer._eachGeometry(function(geo) {
            if (!geo || !geo.isVisible()) {
                return;
            }
            resourceUrls = resourceUrls.concat(geo._getExternalResource());
        });
        this._loadResources(resourceUrls, this.renderImmediate, this);
    },

    /**
     * loadResource from resourceUrls
     * @param  {[String]} resourceUrls Array of urls to load
     * @param  {fn} onComplete          callback after loading complete
     * @param  {object} context      callback's context
     */
    _loadResources:function(resourceUrls, onComplete, context) {
        var me = this;
        var preResources = this._resources;
        this._resources = new Z.renderer.vectorlayer.Canvas.Resources();
        var promises = [];
        var crossOrigin = this._layer.options['crossOrigin'];
        function onPromiseCallback(_url) {
            return function(resolve, reject) {
                        var img = new Image();
                        if (crossOrigin) {
                            img['crossOrigin'] = crossOrigin;
                        }
                        img.onload = function(){
                            me._resources.addResource(_url,this);
                            resolve({});
                        };
                        img.onabort = function(){
                            resolve({});
                        };
                        img.onerror = function(){
                            reject({});
                        };
                        try {
                            Z.Util.loadImage(img,  _url);
                        } catch (err) {
                            reject({});
                        }

                    };
        }
        if (Z.Util.isArrayHasData(resourceUrls)) {
            //重复
            var cache = {};
            for (var i = resourceUrls.length - 1; i >= 0; i--) {
                var url = resourceUrls[i];
                if (cache[url] || !url) {
                    continue;
                }
                cache[url] = 1;
                if (!preResources || !preResources.getImage(url)) {
                    //closure it to preserve url's value
                    var promise = new Z.Promise((onPromiseCallback)(url));
                    promises.push(promise);
                } else {
                    me._resources.addResource(url,preResources.getImage(url));
                }
            }
        }
        if (promises.length > 0) {
            Z.Promise.all(promises).then(function(reources) {
                onComplete.call(context);
            },function() {
                onComplete.call(context);
            });
        } else {
            onComplete.call(context);
        }
    },

    _requestMapToRend:function() {
        if (this.getMap()) {
            this._mapRender.render();
            this._layer.fire('layerload');
        }
    }
});


Z.renderer.vectorlayer.Canvas.Resources=function() {
    this._resources = {};
};

Z.Util.extend(Z.renderer.vectorlayer.Canvas.Resources.prototype,{
    addResource:function(url, img) {
        this._resources[url] = img;
    },

    getImage:function(url) {
        return this._resources[url];
    }
});

Z.VectorLayer.registerRenderer('canvas',Z.renderer.vectorlayer.Canvas);

