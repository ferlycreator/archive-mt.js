Z.render.vectorlayer.Canvas = function(layer, options) {
    this.layer = layer;
    this._mapRender = layer.getMap()._getRender();
    this._registerEvents();
    this._hasResourceToLoad = true;
    // this.resourceLoader = new Z.ResourceLoader();
};

//load,_onMoving, _onMoveEnd, _onResize, _onZoomStart, _onZoomEnd
Z.render.vectorlayer.Canvas.prototype = {

    _registerEvents:function() {
        this.getMap().on('_resize',this._createOrUpdateLayerCanvas, this);
    },

    getMap: function() {
        return this.layer.getMap();
    },

    /**
     * 绘制geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    rend: function(geometries) {
        if (!this._canvas) {
            this._createOrUpdateLayerCanvas();
        }
        delete this._resources;
        this._requestMapToRend();
    },


    _createOrUpdateLayerCanvas: function() {
        if (!this._mapCanvas) {
            this._mapCanvas = this.getMap()._getRender().getLayerRenderContainer(this.layer);
        }
        var mapCanvas = this._mapCanvas;
        if (!this._canvas) {
            this._canvas = Z.DomUtil.createEl('canvas');
        }
        this._canvas.width = mapCanvas.width;
        this._canvas.height = mapCanvas.height;
        this._canvas.style.width = mapCanvas.style.width;
        this._canvas.style.height = mapCanvas.style.height;
        if (!this._context) {
            this._context = this._canvas.getContext('2d');
            if (Z.Browser.retina) {
                this._context.scale(2,2);
            }
        }
    },

    promise:function() {
        var me = this;
        //如果resource已经存在, 则不再重复载入资源
        if (!this._resources) {
            return [new Z.Promise(function(resolve, reject) {resolve(me._resources);})];
        }
        //20150530 loadResource不加载canvasLayer中的geometry icon资源，故每次绘制canvas都去重新检查并下载资源
        var map = this.getMap();
        var mapExtent = map.getExtent();
        var promises = [];
        this._resources = new Z.render.vectorlayer.Canvas.Resources();
        this.layer._eachGeometry(function(geo) {
            if (!geo || !geo.isVisible()) {
                return;
            }
            var ext = geo.getExtent();
            if (!ext || !ext.isIntersect(mapExtent)) {
                return;
            }
            var resourceUrls = geo._getExternalResource();
            if (Z.Util.isArrayHasData(resourceUrls)) {
                for (var i = resourceUrls.length - 1; i >= 0; i--) {
                    var imgUrl = resourceUrls[i];
                    var promise = new Z.Promise(function(resolve, reject) {
                        var img = new Image();
                        img.onload = function(){
                            me._resouces.addResource(imgUrl,img);
                            resolve({'url':imgUrl,'image':img});
                        };
                        img.onabort = function(){
                            me._resouces.addResource(imgUrl,img);
                            resolve({'url':imgUrl,'image':img});
                        };
                        img.onerror = function(){
                            reject({'url':imgUrl,'image':img});
                        };
                        img.src = resourceUrls[i];
                    });
                    promises.push(promise);
                }
            }
        });
        return promises;
    },


    draw:function() {
        Z.Canvas.clearRect(this._context, 0, 0, this._mapCanvas.width, this._mapCanvas.height);
        //载入资源后再进行绘制
        var me = this;
        var map = this.getMap();
        var projection = map._getProjection();
        var extent = map.getExtent();
        var pxExtent =  new Z.Extent(
            map._transformToViewPoint(projection.project(new Z.Coordinate(extent['xmin'],extent['ymin']))),
            map._transformToViewPoint(projection.project(new Z.Coordinate(extent['xmax'],extent['ymax'])))
            );
        this.layer._eachGeometry(function(geo) {
            //geo的map可能为null,因为绘制为延时方法
            if (!me._context || !geo || !geo.isVisible() || !geo.getMap() || !geo.getLayer() || (!geo.getLayer().isCanvasRender())) {
                return;
            }
            var ext = geo._getPainter().getPixelExtent();
            if (!ext || !ext.isIntersect(pxExtent)) {
                return;
            }
            geo._getPainter().paint(me._context, me._resouces);
        });
        return me._context;
    },

    /**
     * 显示图层
     * @expose
     */
    show: function() {
        this._requestMapToRend();
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

    _requestMapToRend:function() {
        this._mapRender.rend();
    }

};

Z.render.vectorlayer.Canvas.Resources=function() {
    this._resouces = {};
};

Z.render.vectorlayer.Canvas.Resources.prototype={
    addResource:function(url, img) {
        this._resouces[url] = img;
    },

    getImage:function(url) {
        return this._resouces[url];
    }
};
