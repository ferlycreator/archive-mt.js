Z['Panel'] = Z.Panel = Z.Control.extend({
    includes: [Z.Eventable],

    options:{
        'position' : {
            'top': '0',
            'right': '0'
        },
        'style': 'default',
        'draggable': true,
        'title': '',
        'html': true,
        'content': '',
        'target': null,
        'linksymbol': {
            'line-color' : '#474cf8',
            'line-width' : 1,
            'line-dasharray' : null,
            'line-opacity' : 1
        }
    },

    /**
    * 隐藏panel
    * @expose
    */
    hide: function() {
        var parentDom = this._panelContainer['parentNode'];
        Z.DomUtil.setStyle(parentDom, 'display: none');
        if(this.options['target']) {
            this._link.hide();
        }
    },

    /**
    * 显示panel
    * @expose
    */
    show: function() {
        var parentDom = this._panelContainer['parentNode'];
        Z.DomUtil.setStyle(parentDom, 'display: block');
        if(this.options['target']) {
            this._link.show();
        }
    },

    /**
    * 移除panel
    * @expose
    */
    removePanel: function() {
        this.remove();
        if(this.options['target']) {
            this._link.remove();
        }
    },

    buildOn: function (map) {
        if(!map || !this.options || !this.options['content']) return;
        this._map = map;
        this._internalLayer = this._getInternalLayer(map, '__mt__internal_layer_panel_link');
        this._panelContainer = Z.DomUtil.createElOn('div', 'cursor:default;');
        var divCss = 'maptalks-panel-default';
        var titleCss = 'maptalks-panel-title-default';
        var contentCss = 'maptalks-panel-content-default';
        var style = this.options['style'];
        if(style) {
            divCss = 'maptalks-panel-' + style;
            titleCss = 'maptalks-panel-title-' + style;
            contentCss = 'maptalks-panel-content-' + style;
        }
        Z.DomUtil.addClass(this._panelContainer, divCss);
        this._appendTitleDom(titleCss);
        this._appendContentDom(contentCss);
        Z.DomUtil.on(this._panelContainer, 'click dblclick contextmenu mousemove mousedown mouseup', Z.DomUtil.stopPropagation);
        if(this.options['draggable']) {
            Z.DomUtil.on(this._panelContainer, 'mousedown', this._onMouseDown, this)
                     .on(this._panelContainer, 'mouseup', this._disableMove, this);
        }
        return this._panelContainer;
    },

    _appendTitleDom: function(titleCss) {
        if(this.options['title']) {
            var _titleDom = Z.DomUtil.createEl('div');
            Z.DomUtil.addClass(_titleDom, titleCss);
            _titleDom.innerHTML = this.options['title'];
            this._panelContainer.appendChild(_titleDom);
        }
    },

    _appendContentDom: function(contentCss) {
        if(this.options['content']) {
            var _contentDom = Z.DomUtil.createEl('div');
            Z.DomUtil.addClass(_contentDom, contentCss);
            if(this.options['html']) {
                _contentDom.innerHTML = this.options['content'];
            } else {
                _contentDom.innerTEXT = this.options['content'];
            }
            this._panelContainer.appendChild(_contentDom);
        }
    },

    _afterAdd: function() {
        if(this.options['target']) {
            this._linkToTarget();
        }
    },

    _linkToTarget: function() {
        this._target = this.options['target'];
        var center = this._target.getCenter();
        var nearestPoints = this._getNearestPoint(center);
        var path = [center, nearestPoints[0], nearestPoints[1]];
        this._link = new Z.Polyline(path);
        if(this.options['linksymbol']) {
            this._link.setSymbol(this.options['linksymbol']);
        }
        this._internalLayer.addGeometry(this._link);

        this._target.on('positionchanged', this._changeLinkPath, this)
                .on('remove', this.remove, this);
        this.on('dragging', this._changeLinkPath, this);
        this._map.on('zoomend resize moving', this._changeLinkPath, this);
    },

    /**
    *获取距离coordinate最近的panel上的点
    * @param {Coordinate}
    * @return {Coordinate}
    */
    _getNearestPoint: function(coordinate) {
        var points = [];
        var screenPoint = this._topLeftPoint();
        var width = this._panelContainer['clientWidth'],
            height = this._panelContainer['clientHeight'];
        var topLeftPoint = this._map.screenPointToCoordinate(screenPoint);

        var topCenterPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top']
                )
        );
        var topCenterBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] - 20
                )
        );
        var topRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top']
                )
        );
        var bottomLeftPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'],
                screenPoint['top'] + height
                )
        );
        var bottomCenterPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] + height
                )
        );
        var bottomCenterBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + Math.round(width/2),
                screenPoint['top'] + height + 20
                )
        );
        var bottomRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top'] + height
                )
        );
        var middleLeftPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'],
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleLeftBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] - 20,
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleRightPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width,
                screenPoint['top'] + Math.round(height/2)
                )
        );
        var middleRightBufferPoint = this._map.screenPointToCoordinate(
            new Z.Point(
                screenPoint['left'] + width + 20,
                screenPoint['top'] + Math.round(height/2)
                )
        );
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

    _topLeftPoint: function() {
        var parentDom = this._panelContainer['parentNode'];
        var domStyle = parentDom['style'];
        var top = Z.DomUtil.getPixelValue(domStyle['top']),
            left = Z.DomUtil.getPixelValue(domStyle['left']),
            bottom = Z.DomUtil.getPixelValue(domStyle['bottom']),
            right = Z.DomUtil.getPixelValue(domStyle['right']);
        var width = this._map._containerDOM.clientWidth,
            height = this._map._containerDOM.clientHeight;
        var panelWidth = this._panelContainer['clientWidth'],
            panelHeight = this._panelContainer['clientHeight'];
        if(left === 0 && right >= 0) {
            left = width - right - panelWidth;
        }
        if(top === 0 && bottom >= 0) {
            top = height - bottom - panelHeight;
        }
        return new Z.Point(left, top);
    },

    _changeLinkPath: function() {
        var geometry = this.options['target'];
        var center = geometry.getCenter();
        var nearestPoints = this._getNearestPoint(center);
        var path = [center, nearestPoints[0], nearestPoints[1]];
        this._link.setCoordinates(path);
    },

    _onMouseDown: function(event) {
        Z.DomUtil.setStyle(this._panelContainer, 'cursor: move');
        this._map.disableDrag();
        Z.DomUtil.on(this._panelContainer, 'mousemove', this._onMouseMove, this);
        this._startOffset = new Z.Point(
            parseInt(event.offsetX,0),
            parseInt(event.offsetY,0)
            );

        this.fire('dragstart', {'target': this, 'position': this._startOffset});
    },

    _onMouseMove: function(event) {
        this._endOffset = new Z.Point(parseInt(event.offsetX, 0),parseInt(event.offsetY, 0));
        var offsetTop = this._endOffset['top'] - this._startOffset['top'];
        var offsetLeft = this._endOffset['left'] - this._startOffset['left'];
        var parentDom = this._panelContainer['parentNode'];
        var domStyle = parentDom['style'];
        var domTop = Z.DomUtil.getPixelValue(domStyle['top']);
        var domLeft = Z.DomUtil.getPixelValue(domStyle['left']);
        var domBottom = Z.DomUtil.getPixelValue(domStyle['bottom']);
        var domRight = Z.DomUtil.getPixelValue(domStyle['right']);

        if(domTop) {
            domTop = domTop + offsetTop;
            if(domTop <= 0) {domTop = 1;}
            Z.DomUtil.setStyle(parentDom, 'top: ' + domTop+'px');
        }
        if(domLeft) {
            domLeft = domLeft + offsetLeft;
            if(domLeft <= 0) {domLeft = 1;}
            Z.DomUtil.setStyle(parentDom, 'left: ' + domLeft+'px');
        }
        if(domBottom) {
            domBottom = domBottom - offsetTop;
            if(domBottom <= 0) {domBottom = 1;}
            Z.DomUtil.setStyle(parentDom, 'bottom: ' + domBottom+'px');
        }
        if(domRight) {
            domRight = domRight - offsetLeft;
            if(domRight <= 0) {domRight = 1;}
            Z.DomUtil.setStyle(parentDom, 'right:' +  domRight+'px');
        }
        this.fire('dragging', {'target': this, 'position': this._endOffset});
    },

    _disableMove: function() {
        Z.DomUtil.setStyle(this._panelContainer, 'cursor: ' +  'default');
        this._map.enableDrag();
        Z.DomUtil.off(this._panelContainer, 'mousemove', this._onMouseMove, this);
        /**if(this.options['target']) {
            this._target.off('positionchanged', this._changeLinkPath, this)
                    .off('remove', this.remove, this);
            this.off('dragging', this._changeLinkPath, this);
            this._map.off('zoomend resize moving', this._changeLinkPath, this);
        }*/
        this.fire('dragend', {'target': this, 'position': this._endOffset});
    },

     _getInternalLayer: function(map, layerId, canvas) {
         if(!map) {return;}
         var layer = map.getLayer(layerId);
         if(!layer) {
             if(canvas) {
                 layer = new Z.VectorLayer(layerId,{'render':'canvas'});
             } else {
                 layer = new Z.VectorLayer(layerId);
             }
             map.addLayer(layer);
         }
         return layer;
     }


});