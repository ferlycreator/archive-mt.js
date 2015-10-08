/**
 * label控件
 * @class maptalks.Label
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z.Label = Z.Class.extend({
    includes: [Z.Eventable],

    /**
     * @cfg {Object} exceptionDefs 异常信息定义
     */
    'exceptionDefs':{
        'en-US':{
            'NEED_geometry':'You must set target to Label.'
        },
        'zh-CN':{
            'NEED_geometry':'你必须设置Label绑定的Geometry目标。'
        }
    },

    /**
     * @cfg {Object} options label属性
     */
    options: {
        'symbol': {
            'labelType': 'box',//box|tip
            'labelLineColor': '#000000',
            'labelLineWidth': 1,
            'labelLineOpacity': 1,
            'labelOpacity': 1,
            'labelFill': '#ffffff',
            'labelHorizontalAlignment': 'middle',//left middle right
            'labelVerticalAlignment': 'middle',//top middle bottom
            'labelDx': 0,
            'labelDy': 0,

            'textFaceName': 'arial',
            'textSize': 12,
            'textFill': '#000000',
            'textOpacity': 1,
//            'textSpacing': 30,
            'textWrapWidth': 100,
//            'textWrapBefore': false,
            'textWrapCharacter': '',
            'textLineSpacing': 8,
            'textAlign': 'center',
            'textDx': 0,
            'textDy': 0
        },
        'draggable': true,
        'content': '',
        'trigger': 'hover'//click|hover
    },

    /**
     * 初始化Label
     * @constructor
     * @param {Object} options
     * @return {maptalks.Label}
     * @expose
     */
    initialize: function (options) {
        this.setOptions(options);
        this.strokeAndFill = this._translateStrokeAndFill();
        return this;
    },

    /**
     * 设置属性
     * @param {Object} options
     * @expose
     */
    setOptions: function(options) {
        Z.Util.setOptions(this, options);
        return this;
    },

    /**
    * 隐藏label
    * @expose
    */
    hide: function() {
        this._label.style.display='none';
        /**
         * 触发label的hide事件
         * @event hide
         * @return {Object} params: {'target': this}
         */
        this.fire('hide', {'target': this});
    },

    /**
    * 显示label
    * @expose
    */
    show: function() {
        this._label.style.display='';
        /**
         * 触发label的show事件
         * @event show
         * @return {Object} params: {'target': this}
         */
        this.fire('show', {'target': this});
    },

    /**
    * 移除label
    * @expose
    */
    remove: function() {
        Z.DomUtil.removeDomNode(this._label);
        /**
         * 触发label的remove事件
         * @event remove
         * @return {Object} params: {'target': this}
         */
        this.fire('remove', {'target': this});
    },

    /**
     * 将Label添加到对象上
     * @param {maptalks.Geometry} geometry
     */
    addTo: function (geometry) {
        if(!geometry || !this.options || !this.options['symbol']) {return;}
        this._map = geometry.getMap();
        this._labelContrainer = this._map._getSvgPaper();
        this._geometry = geometry;
        if(!this._geometry) {throw new Error(this.exceptions['NEED_geometry']);}
        var targetCenter = this._geometry.getCenter();

        this._label = this._createLabelDom();
        this._label['geometry'] = this._geometry;
        this.hide();
        this._labelContrainer.appendChild(this._label);

        this._geometry.on('shapechanged positionchanged symbolchanged', Z.Util.bind(this._changeLabelPosition, this), this)
                    .on('remove', this.removeLabel, this);

        Z.DomUtil.on(this._label, 'click dblclick rightclick', Z.DomUtil.stopPropagation, this);


        var trigger = this.options['trigger'];
        var me = this;
        if(trigger === 'hover') {
            this._geometry.on('mouseover', function showLabel() {
                 me.show();
                 me._map.disableDrag();
                 me._map.disableDoubleClickZoom();
             }, this)
             .on('mouseout', function hideLabel() {
                setTimeout(function(){
                    me.hide();
                    me._map.enableDrag();
                    me._map.enableDoubleClickZoom();
                }, 1000);
             }, this);
        } else if(trigger === 'click') {
            this._geometry.on('click', function showLabel() {
                 me.show();
                 me._map.disableDrag();
                 me._map.disableDoubleClickZoom();
             }, this);
        } else {
            this.show();
        }
        if(this.options['draggable']) {
             Z.DomUtil.on(this._label, 'mousedown', this._onMouseDown, this)
                      .on(this._label, 'dragend', this._endMove, this)
                      .on(this._label, 'mouseout', this._recoverMapEvents, this);
        }
        return null;
    },

    getDxDy:function() {
        var symbol = this.options.symbol;
        var dx = symbol['labelDx'],
            dy = symbol['labelDy'];
        return new Z.Point(dx, dy);
    },

    getLabelExtent:function() {
        var dxdy = this.getDxDy();
    },

    /**
     * 获取label端点数组
     */
    getVertexs: function() {
        var points = [];
        var painter = this._label._getPainter();
        var textSize = painter.measureTextMarker();
        var width = 0,
            height = 0;
        var containerPoint = this._topLeftPoint(width, height);
        var topLeftPoint = this._map.containerPointToCoordinate(containerPoint);
        var topCenterPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + Math.round(width/2),
                containerPoint['top']
            )
        );
        var topCenterBufferPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + Math.round(width/2),
                containerPoint['top'] - 20
            )
        );
        var topRightPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + width,
                containerPoint['top']
            )
        );
        var bottomLeftPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'],
                containerPoint['top'] + height
            )
        );
        var bottomCenterPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + Math.round(width/2),
                containerPoint['top'] + height
            )
        );
        var bottomCenterBufferPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + Math.round(width/2),
                containerPoint['top'] + height + 20
            )
        );
        var bottomRightPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + width,
                containerPoint['top'] + height
            )
        );
        var middleLeftPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'],
                containerPoint['top'] + Math.round(height/2)
            )
        );
        var middleLeftBufferPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] - 20,
                containerPoint['top'] + Math.round(height/2)
            )
        );
        var middleRightPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + width,
                containerPoint['top'] + Math.round(height/2)
            )
        );
        var middleRightBufferPoint = this._map.containerPointToCoordinate(
            new Z.Point(
                containerPoint['left'] + width + 20,
                containerPoint['top'] + Math.round(height/2)
            )
        );
        var vertexs = [topCenterPoint,middleRightPoint,bottomCenterPoint,middleLeftPoint];
        return vertexs;
    },

    _topLeftPoint: function(width, height) {
        var placement = this.options['symbol']['vertical-alignment'];
        var center = this._label.getCenter();
        var point = this._map.coordinateToViewPoint(center);
        var mapOffset = this._map.offsetPlatform();
        if (placement === 'left') {
            return new Z.Point(
                point['left'] - width + mapOffset['left'],
                point['top'] - Math.round(height/2) + mapOffset['top']
            );
        } else if (placement === 'top') {
            return new Z.Point(
                point['left'] - Math.round(width/2) + mapOffset['left'],
                point['top'] - height + mapOffset['top']
            );
        } else if (placement === 'right') {
            return new Z.Point(
                point['left'] + mapOffset['left'],
                point['top'] - Math.round(height/2) + mapOffset['top']
            );
        } else if(placement === 'bottom') {
            return new Z.Point(
                point['left'] - Math.round(width/2) + mapOffset['left'],
                point['top'] + mapOffset['top']
            );
        } else {//center
            return new Z.Point(
                point['left'] - Math.round(width/2) + mapOffset['left'],
                point['top'] - Math.round(height/2) + mapOffset['top']
            );
        }
    },

    _changeLabelPosition: function(event) {
        this._geometry = event['target'];
        this._label.setCoordinates(this._geometry.getCenter());
    },

    _onMouseDown: function(event) {
        Z.DomUtil.setStyle(this._labelContrainer, 'cursor: move');
        this._label.startDrag();
        this._map.disableDrag();
        this._map.disableDoubleClickZoom();
        /**
         * 触发label的dragstart事件
         * @event dragstart
         * @return {Object} params: {'target': this}
         */
        this.fire('dragstart', {'target': this});
    },

    _endMove: function(event) {
        Z.DomUtil.setStyle(this._labelContrainer, 'cursor: default');
        /**
         * 触发label的dragend事件
         * @event dragend
         * @return {Object} params: {'target': this}
         */
        this.fire('dragend', {'target': this});
    },

    _recoverMapEvents: function() {
        this._map.enableDrag();
        this._map.enableDoubleClickZoom();
    },

    _createLabelDom: function() {
        var style = this.options.symbol;
        var textContent = this.options['content'];
        var svgGroup = Z.SVG.group();

        var svgPath = this._getLabelSvgPath();
        var svgDom = Z.SVG.path(svgPath);
        var svgStyle = this.strokeAndFill;
        Z.SVG.updateShapeStyle(svgDom, svgStyle['stroke'], svgStyle['fill']);
        svgGroup.appendChild(svgDom);

        var textSize = new Z.Size(style['textWrapWidth'], style['textSize']);
        style['textHorizontalAlignment'] = style['labelHorizontalAlignment'];
        style['textVerticalAlignment'] = style['labelVerticalAlignment'];
        var point = this._getVectorArray()[0];
        style['textDx'] += point['left'];
        style['textDy'] += point['top']+style['textSize'];
        var svgText = Z.SVG.text(textContent, style, textSize);
        Z.SVG.updateLabelStyle(svgText, style, textSize);
        svgGroup.appendChild(svgText);

        this._offsetLabel(svgGroup);
        return svgGroup;
    },

    _getLabelSvgPath:function() {
        var points = this._getVectorArray();
        var path = '';
        for(var i=0,len=points.length;i<len;i++){
            if(i===0){
                path+='M'
            } else {
                path+='L'
            }
            path+=Math.round(points[i]['left'])+','+Math.round(points[i]['top'])+ ' ';
        }
        path+=Z.SVG.closeChar;
        if (Z.Browser.vml) {
            path+=' e';
        }
        return path;
    },

    _getVectorArray: function() {
        var symbol = this.options.symbol;
        var labelType = symbol['labelType'].toLowerCase();

        var left=0,top=0;
        var lineSpacing = Z.Util.setDefaultValue(symbol['textLineSpacing'],0);
        var wrapWidth = Z.Util.setDefaultValue(symbol['textWrapWidth'],0),
            height = Z.Util.setDefaultValue(symbol['textSize'], 12)+lineSpacing/2;
        var content = this.options['content'];
        var fontSize = symbol['textSize'];
        var size = fontSize/2;
        var font = symbol['textFaceName'];
        var textWidth =  Z.Util.stringLength(content,font,fontSize).width;
        //如果有换行符，需要替换掉换行符以后再计算字符串长度
        var wrapChar = symbol['textWrapCharacter'];
        if(!wrapWidth) wrapWidth = textWidth;
        var rowNum = 0;
        if(wrapChar) {
            rowNum = content.split(wrapChar).length;
            wrapWidth = textWidth/rowNum;
        } else {
            if(textWidth>=wrapWidth){
                rowNum = Math.ceil(textWidth/wrapWidth);
            }
        }
        height += rowNum*(fontSize+lineSpacing/2);
        wrapWidth += fontSize;

        var horizontal = Z.Util.setDefaultValue(symbol['labelHorizontalAlignment'],'middle');//水平
        var vertical = Z.Util.setDefaultValue(symbol['labelVerticalAlignment'],'middle');//垂直

        if ('box' === labelType) {
            return  this._getBoxPoints(left, top, wrapWidth, height, horizontal, vertical);
        } else if ('tip' === labelType) {
            return this._getTipPoints(left, top, wrapWidth, height, horizontal, vertical);
        }
    },

     _getBoxPoints: function(left, top, width, height, horizontal, vertical) {
        var points = [];
        var point0,point1,point2,point3;
        if ('left' === horizontal) {
            if('top' === vertical) {
                point0 = new Z.Point(left-width,top-height);
                point1 = new Z.Point(left,top-height);
                point2 = new Z.Point(left,top);
                point3 = new Z.Point(left-width,top);
            } else if ('middle' === vertical) {
                point0 = new Z.Point(left-width,top-height/2);
                point1 = new Z.Point(left,top-height/2);
                point2 = new Z.Point(left,top+height/2);
                point3 = new Z.Point(left-width,top+height/2);
            } else if ('bottom' === vertical) {
                point0 = new Z.Point(left-width,top);
                point1 = new Z.Point(left,top);
                point2 = new Z.Point(left,top+height);
                point3 = new Z.Point(left-width,top+height);
            }
        } else if ('middle' === horizontal) {
            if('top' === vertical) {
                point0 = new Z.Point(left-width/2,top-height);
                point1 = new Z.Point(left+width/2,top-height);
                point2 = new Z.Point(left+width/2,top);
                point3 = new Z.Point(left-width/2,top);
            } else if ('middle' === vertical) {
                point0 = new Z.Point(left-width/2,top-height/2);
                point1 = new Z.Point(left+width/2,top-height/2);
                point2 = new Z.Point(left+width/2,top+height/2);
                point3 = new Z.Point(left-width/2,top+height/2);
            } else if ('bottom' === vertical) {
                point0 = new Z.Point(left-width/2,top);
                point1 = new Z.Point(left+width/2,top);
                point2 = new Z.Point(left+width/2,top+height);
                point3 = new Z.Point(left-width/2,top+height);
            }
        } else if ('right' === horizontal) {
            if('top' === vertical) {
                point0 = new Z.Point(left,top-height);
                point1 = new Z.Point(left+width,top-height);
                point2 = new Z.Point(left+width,top);
                point3 = new Z.Point(left, top);
            } else if ('middle' === vertical) {
                point0 = new Z.Point(left,top-height/2);
                point1 = new Z.Point(left+width,top-height/2);
                point2 = new Z.Point(left+width,top+height/2);
                point3 = new Z.Point(left,top+height/2);
            } else if ('bottom' === vertical) {
                point0 = new Z.Point(left, top);
                point1 = new Z.Point(left+width,top);
                point2 = new Z.Point(left+width,top+height);
                point3 = new Z.Point(left,top+height);
            }
        }
        points = [point0, point1, point2, point3];
        return points;
     },

     _getTipPoints: function(left, top, width, height, horizontal, vertical) {
        var points = [];
        var point0,point1,point2,point3,point4,point5,point6;
        if ('left' === horizontal) {
            var arrowWidth = arrowHeight = height/2;
            if('top' === vertical) {
                point0 = new Z.Point((left-width-arrowWidth),top-height);
                point1 = new Z.Point((left-arrowWidth),top-height);
                point2 = new Z.Point((left-arrowWidth),(top-arrowHeight));
                point3 = new Z.Point(left, top);
                point4 = new Z.Point(left, top);
                point5 = new Z.Point(left, top);
                point6 = new Z.Point((left-width-arrowWidth),top);
            } else if ('middle' === vertical) {
                point0 = new Z.Point((left-width-arrowWidth),top-height/2);
                point1 = new Z.Point((left-arrowWidth),top-height/2);
                point2 = new Z.Point((left-arrowWidth),(top-arrowHeight/2));
                point3 = new Z.Point(left, top);
                point4 = new Z.Point((left-arrowWidth),(top+arrowHeight/2));
                point5 = new Z.Point((left-arrowWidth),top+height/2);
                point6 = new Z.Point((left-width-arrowWidth),top+height/2);
            } else if ('bottom' === vertical) {
                point0 = new Z.Point((left-width-arrowWidth),top);
                point1 = new Z.Point(left, top);
                point2 = new Z.Point(left, top);
                point3 = new Z.Point(left, top);
                point4 = new Z.Point((left-arrowWidth),(top+arrowHeight));
                point5 = new Z.Point((left-arrowWidth),top+height);
                point6 = new Z.Point((left-width-arrowWidth),top+height);
            }
        } else if ('middle' === horizontal) {
            var arrowWidth = Math.round(width/5);
            var arrowHeight = Math.round(height/2);
            if('top' === vertical
            || 'middle' === vertical) {
                point0 = new Z.Point((left-Math.round(width/2)),(top-height-arrowHeight));
                point1 = new Z.Point((left+Math.round(width/2)),(top-height-arrowHeight));
                point2 = new Z.Point((left+Math.round(width/2)),(top-arrowHeight));
                point3 = new Z.Point((left+Math.round(arrowWidth/2)),(top-arrowHeight));
                point4 = new Z.Point(left, top);
                point5 = new Z.Point((left-Math.round(arrowWidth/2)),(top-arrowHeight));
                point6 = new Z.Point((left-Math.round(width/2)),(top-arrowHeight));
            } else if ('bottom' === vertical) {
                point0 = new Z.Point((left-Math.round(width/2)),(top+arrowHeight));
                point1 = new Z.Point((left-Math.round(arrowWidth/2)),(top+arrowHeight));
                point2 = new Z.Point(left, top);
                point3 = new Z.Point((left+Math.round(arrowWidth/2)),(top+arrowHeight));
                point4 = new Z.Point((left+Math.round(width/2)),(top+arrowHeight));
                point5 = new Z.Point((left+Math.round(width/2)),(top+height+arrowHeight));
                point6 = new Z.Point((left-Math.round(width/2)),(top+height+arrowHeight));
            }
        } else if ('right' === horizontal) {
            var arrowWidth = arrowHeight = height/2;
            if('top' === vertical) {
                point0 = new Z.Point((left+arrowWidth),top-height);
                point1 = new Z.Point((left+width+arrowWidth),top-height);
                point2 = new Z.Point((left+width+arrowWidth),top);
                point3 = new Z.Point((left+arrowWidth), top);
                point4 = new Z.Point(left, top);
                point5 = new Z.Point(left, top);
                point6 = new Z.Point((left+arrowWidth),(top-arrowHeight));
            } else if ('middle' === vertical) {
                point0 = new Z.Point(left+arrowWidth, top-height/2);
                point1 = new Z.Point((left+width+arrowWidth),top-height/2);
                point2 = new Z.Point((left+width+arrowWidth),top+height/2);
                point3 = new Z.Point((left+arrowWidth),top+height/2);
                point4 = new Z.Point((left+arrowWidth),(top+arrowHeight/2));
                point5 = new Z.Point(left, top);
                point6 = new Z.Point((left+arrowWidth),(top-arrowHeight/2));
            } else if ('bottom' === vertical) {
                point0 = new Z.Point(left+arrowWidth, top);
                point1 = new Z.Point((left+width+arrowWidth),top);
                point2 = new Z.Point((left+width+arrowWidth),top+height);
                point3 = new Z.Point((left+arrowWidth),top+height);
                point4 = new Z.Point((left+arrowWidth),(top+arrowHeight));
                point5 = new Z.Point(left, top);
                point6 = new Z.Point(left, top);
            }
        }
        points = [point0, point1, point2, point3, point4, point5, point6];
        return points;
    },

    _translateStrokeAndFill:function() {
        var symbol = this.options.symbol;
        var result = {
            'stroke' : {
                'stroke' : symbol['labelLineColor'],
                'stroke-width' : symbol['labelLineWidth'],
                'stroke-opacity' : symbol['labelLineOpacity'],
                'stroke-dasharray': symbol['labelLineDasharray'],
                'stroke-linecap' : 'butt',
                'stroke-linejoin' : 'round'
            },
            'fill' : {
                'fill'          : symbol['labelFill'],
                'fill-opacity'  : symbol['labelOpacity']
            }
        };
        //vml和svg对linecap的定义不同
        if (result['stroke']['stroke-linecap'] === "butt") {
            if (Z.Browser.vml) {
                result['stroke']['stroke-linecap'] = "flat";
            }
        }
        return result;
     },

     _offsetLabel:function(label) {
         var d = this.getDxDy();
         if(!this._geometry) return;
         var point = this._geometry._getCenterViewPoint().add(d);
         if (label.tagName && label.tagName === 'SPAN') {
             label.style.left = point['left']+'px';
             label.style.top = point['top']+'px';
         } else {
             if (Z.Browser.vml) {
                 //vml
                 label.style.position = 'absolute';
                 label.style.left = point['left'];
                 label.style.top = point['top'];
             } else {
                 if (label.tagName === 'text') {
                     // svg text
                     label.setAttribute('x',point['left']);
                     label.setAttribute('y',point['top']);
                 } else {
                     //svg
                     label.setAttribute('transform', 'translate('+point['left']+' '+point['top']+')');
                 }

             }
         }

     }
});
