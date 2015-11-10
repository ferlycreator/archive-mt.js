var LabelPropertyPanel = function(){

};

LabelPropertyPanel.prototype = {
    /**
     * 打开label属性面板
     */
    addTo: function(label) {
        this._width = 200;
        this._height = 38;
        this._label = label;
        this._map = this._label._map;
        this._panel = this._getPanelByKey(label);
        if(!this._panel) {
            this._panel = this._createPanel();
            this._registEvent();
            this._putPanelInMap(label, this._panel);
        }
        this._panel.show();
    },

    /**
     *显示label属性面板
     */
    show: function() {
        this._panel.show();
    },

    /**
     *隐藏label属性面板
     */
    hide: function() {
        this._panel.hide();
    },

    _registEvent: function() {
        var me = this;
        this._map.on('moving zoomend', this._setPanelPosition, this)
                 .on('movestart', this.hide, this);

        this._label.on('positionchanged', this._setPanelPosition, this)
                   .on('dragstart', this.hide, this)
                   .on('dragend', this.show, this);
    },

    _removeEvent: function() {
        var me = this;
        this._map.off('moving zoomend', this._setPanelPosition, this)
                 .off('movestart', this.hide, this);

        this._label.off('positionchanged', this._setPanelPosition, this)
                    .off('dragstart', this.hide, this)
                    .off('dragend', this.show, this);
    },

    _setPanelPosition: function() {
        this._panel.setPosition(this._getViewPoint());
    },

    _getViewPoint: function() {
        var mapOffset = this._map.offsetPlatform();
        var viewPoint = this._map.coordinateToViewPoint(this._label._center)
                            .substract({left:this._width/2,top:-5})
                            .add(mapOffset);
        return viewPoint;
    },

    _createPanel: function() {
        var viewPoint = this._getViewPoint();
        //背景颜色设置部分
        var bgDom = this._createBgDom();
        //边框颜色设置部分
        var borderDom = this._createBorderDom();
        //文字大小
        var textSizeDom = this._createTextSizeDom();
        //文字颜色
        var textColorDom = this._createTextColorDom();
        var me = this;

        var panel = new maptalks.Toolbar({
            position : viewPoint,
            vertical : false,
            //工具项
            items: [{
                type : 'button',
                icon: '../../toolbox/label/images/trash.png',
                click : function(){
                    if(confirm('您确认要删除该文本标签！')){
                        me._removeEvent();
                        me._label.remove();
                        me._panel.remove();
                    }
                }
            }, {
                type : 'button',
                icon : '../../toolbox/label/images/paint.png',
                html: true,
                trigger: 'click',
                content: bgDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(bgDom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['fill'] = color;
                    me._label.setSymbol(symbol);
                })
            }, {
                type : 'button',
                icon: '../../toolbox/label/images/stroke.png',
                html: true,
                trigger: 'click',
                content: borderDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(borderDom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['lineColor'] = color;
                    me._label.setSymbol(symbol);
                })

            }, {
                type : 'button',
                icon: '../../toolbox/label/images/font.png',
                html: true,
                trigger: 'click',
                content: textColorDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(textColorDom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['textFill'] = color;
                    me._label.setSymbol(symbol);
                })

            }, {
                type : 'button',
                content: textSizeDom,

            }, {
                type : 'button',
                icon: '../../toolbox/label/images/edit.png',
                click : function(){
                    me._label.startEdit();
                    var textEditor = me._label._textEditor;
                    textEditor.focus();
                    var value = textEditor.value;
                    textEditor.value = '';
                    textEditor.value = value;
                    maptalks.DomUtil.on(textEditor, 'click', me.show, me);
                }
            }, {
                type : 'button',
                icon: '../../toolbox/label/images/stop_edit.png',
                click : function(){
                    me._label.endEdit();
                    var textEditor = me._label._textEditor;
                    maptalks.DomUtil.off(textEditor, 'click', me.show, me);
                }
            }, {
                type : 'button',
                icon: '../../toolbox/label/images/close.png',
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
        var fillColor = this._label._strokeAndFill['markerFill'];
        return this._createColorDom(fillColor);
    },

    _createBorderDom: function() {
        var borderColor = this._label._strokeAndFill['markerLineColor'];
        return this._createColorDom(borderColor);
    },

    _createTextColorDom: function() {
        var textColor = this._label._textStyle['textFill'];
        return this._createColorDom(textColor);
    },

    _createTextSizeDom: function() {
        var textSizeDom = maptalks.DomUtil.createEl('input');
        textSizeDom.style.cssText = 'border:1px solid #333;font-weight:bold;font-size:16px;width:20px;height:18px;color:#333';
        textSizeDom.type='text';
        textSizeDom.maxLength = 2;
        var textSize = this._label._textStyle['textSize'];
        textSizeDom.value = textSize;
        var me = this;
        maptalks.DomUtil.on(textSizeDom, 'blur', function(param){
            var target = param.target;
            var newSize = target.value;

            var symbol = me._label.getSymbol();
            symbol['textSize'] = parseInt(newSize);
            me._label.setSymbol(symbol);
        });
        return textSizeDom;
    },

    _createColorDom: function(color) {
        var colorDom = maptalks.DomUtil.createEl('input');
        colorDom.style.cssText = 'width:3px;height:15px;background-color:'+color+';border:1px solid #333';
        colorDom.readOnly = true;
        return colorDom;
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
