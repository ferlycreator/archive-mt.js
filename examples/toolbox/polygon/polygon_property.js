var PolygonPropertyPanel = function(){

};

PolygonPropertyPanel.prototype = {
    /**
     * 打开polygon属性面板
     */
    addTo: function(polygon) {
        this._width = 200;
        this._height = 38;
        this._polygon = polygon;
        this._symbol = this._polygon.getSymbol();
        this._map = this._polygon.getMap();
        this._panel = this._getPanelByKey(polygon);
        if(!this._panel) {
            this._panel = this._createPanel();
            this._registEvent();
            this._putPanelInMap(polygon, this._panel);
        }
        this._panel.show();
    },

    /**
     *显示polygon属性面板
     */
    show: function() {
        this._panel.show();
    },

    /**
     *隐藏polygon属性面板
     */
    hide: function() {
        this._panel.hide();
    },

    _registEvent: function() {
        var me = this;
        this._map.on('moving zoomend', this._setPanelPosition, this)
                 .on('movestart', this.hide, this);

        this._polygon.on('positionchanged', this._setPanelPosition, this)
                   .on('dragstart', this.hide, this)
                   .on('dragend', this.show, this);
    },

    _removeEvent: function() {
        var me = this;
        this._map.off('moving zoomend', this._setPanelPosition, this)
                 .off('movestart', this.hide, this);

        this._polygon.off('positionchanged', this._setPanelPosition, this)
                    .off('dragstart', this.hide, this)
                    .off('dragend', this.show, this);
    },

    _setPanelPosition: function() {
        this._panel.setPosition(this._getViewPoint());
    },

    _getViewPoint: function() {
        var mapOffset = this._map.offsetPlatform();
        var viewPoint = this._map.coordinateToViewPoint(this._polygon.getCenter())
                            .substract({left:this._width/2,top:-5})
                            .add(mapOffset);
        return viewPoint;
    },

    _createPanel: function() {
        var viewPoint = this._getViewPoint();
        var isPolyline = false;
        if(this._polygon.getType() === maptalks.Geometry.TYPE_LINESTRING) {
            isPolyline = true;
        }
        //背景颜色设置部分
        var bgDom = this._createBgDom();
        //填充透明度
        var polygonOpacityDom = this._createOpacityDom('polygonOpacity');

        //边框颜色设置部分
        var borderDom = this._createBorderDom();
        //边框透明度
        var lineOpacityDom = this._createOpacityDom('lineOpacity');
        //边框线形
        var lineDasharrayDom = this._createLineDasharrayDom();

        var me = this;

        var panel = new maptalks.Toolbar({
            position : viewPoint,
            vertical : false,
            //工具项
            items: [{
                type : 'button',
                icon: '../../toolbox/polygon/images/trash.png',
                click : function(){
                    if(confirm('您确认要删除该文本标签！')){
                        me._removeEvent();
                        me._polygon.remove();
                        me._panel.remove();
                    }
                }
            }, {
                type : 'button',
                hidden: isPolyline,
                icon : '../../toolbox/polygon/images/paint.png',
                html: true,
                trigger: 'click',
                content: bgDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(bgDom, 'background-color:'+color);
                    var symbol = me._polygon.getSymbol();
                    symbol['polygonFill'] = color;
                    me._polygon.setSymbol(symbol);
                })
            }, {
                type : 'button',
                hidden: isPolyline,
                content: polygonOpacityDom,

            }, {
                type : 'button',
                icon: '../../toolbox/polygon/images/stroke.png',
                html: true,
                trigger: 'click',
                content: borderDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(borderDom, 'background-color:'+color);
                    var symbol = me._polygon.getSymbol();
                    symbol['lineColor'] = color;
                    me._polygon.setSymbol(symbol);
                })

            }, {
                type: 'button',
                content: lineDasharrayDom,
            }, {
                type : 'button',
                content: lineOpacityDom,

            }, {
                type : 'button',
                icon: '../../toolbox/polygon/images/edit.png',
                click : function(){
                    me._polygon.startEdit();
                }
            }, {
                type : 'button',
                icon: '../../toolbox/polygon/images/stop_edit.png',
                click : function(){
                    me._polygon.endEdit();
                }
            }, {
                type : 'button',
                icon: '../../toolbox/polygon/images/close.png',
                click : function(){
                    me._panel.hide();
                }
            }]
        });
        panel.addTo(this._map);
        return panel;
    },

    _colorItems: function (callback) {
        var fn = callback;
        return [{//子菜单
            content: this._createColorSpanDom('#cc0000'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#d56a00'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#a29900'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#55a455'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#3398cc'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#663399'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#cc0066'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: this._createColorSpanDom('#333333'),
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }];
    },

    _createColorSpanDom: function(color) {
        var spanDom = maptalks.DomUtil.createEl('span');
        spanDom.style.cssText = 'width:50px;height:50px;background-color:'+color+';';
        spanDom.innerText = '　　';
        return spanDom;
    },

    _createBgDom: function() {
        var fillColor = this._symbol['polygonFill'];
        return this._createColorDom(fillColor);
    },

    _createBorderDom: function() {
        var borderColor = this._symbol['lineColor'];
        return this._createColorDom(borderColor);
    },

    _createColorDom: function(color) {
        var colorDom = maptalks.DomUtil.createEl('input');
        colorDom.style.cssText = 'width:3px;height:15px;background-color:'+color+';border:1px solid #333';
        colorDom.readOnly = true;
        return colorDom;
    },

    _createOpacityDom: function(attrName) {
        var opacityDom = maptalks.DomUtil.createEl('input');
        opacityDom.style.cssText = 'border:1px solid #333;font-weight:bold;font-size:16px;width:30px;height:18px;color:#333';
        opacityDom.type='text';
        opacityDom.maxLength = 3;
        var opacity = this._symbol[attrName];
        opacityDom.value = opacity;
        var me = this;
        maptalks.DomUtil.on(opacityDom, 'blur', function(param){
            var target = param.target;
            var opacityValue = target.value;
            var symbol = me._polygon.getSymbol();
            symbol[attrName] = parseFloat(opacityValue);
            me._polygon.setSymbol(symbol);
        });
        return opacityDom;
    },

    _createLineDasharrayDom: function() {
        var dasharraySelectDom = maptalks.DomUtil.createEl('select');
        dasharraySelectDom.style.cssText = 'border:1px solid #333;font-weight:bold;font-size:16px;width:30px;height:18px;color:#333';
        var dasharray = this._symbol['lineDasharray'];
        var optionDom = maptalks.DomUtil.createEl('option');
        optionDom.value = [];
        optionDom.text = '实线';
        dasharraySelectDom.appendChild(optionDom);

        var optionDom1 = maptalks.DomUtil.createEl('option');
        optionDom1.value = [20,5,2,5];
        optionDom1.text = '虚线';
        optionDom1.selected = 'selected';
        dasharraySelectDom.appendChild(optionDom1);
        var me = this;
        maptalks.DomUtil.on(dasharraySelectDom, 'change', function(param){
            var target = param.target;
            var dasharrayValue = target.value;
            var symbol = me._polygon.getSymbol();
            symbol['lineDasharray'] = dasharrayValue;
            me._polygon.setSymbol(symbol);
        });
        return dasharraySelectDom;
    },

    _putPanelInMap: function(key, value) {
        if(!this._panelMap) this._panelMap = {};
        this._panelMap[key] = value;
    },

    _getPanelByKey: function(key) {
        if(this._panelMap) {
            return this._panelMap[key];
        }
        return false;
    }
};
