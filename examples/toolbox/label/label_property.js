var LabelPropertyPanel = function(){

};

LabelPropertyPanel.prototype = {
    /**
     * 打开label属性面板
     */
    addTo: function(label) {
        this._label = label;
        this._map = this._label._map;
        this._panel = this._createPanel();
        this._registEvent();
    },

    /**
     *隐藏label属性面板
     */
    hide: function() {
        this._el.style.display='none';
    },

    _registEvent: function() {
        var me = this;
        this._map.on('moving zoomend ', function(){
            var width = 130,height = 38;
            var viewPoint = me._map.coordinateToViewPoint(me._label._center).substract({left:width/2,top:-5});
            me._panel.setPosition(viewPoint);
        });
        this._label.on('positionchanged shapechanged symbolchanged dragstart', function(){
            var width = 130,height = 38;
            var viewPoint = me._map.coordinateToViewPoint(me._label._center).substract({left:width/2,top:-5});
            me._panel.setPosition(viewPoint);
        });
    },

    _createPanel: function() {
        var width = 130,height = 38;
        // var labelHeight = this._label.strokeAndFill['markerHeight'];
        var viewPoint = this._map.coordinateToViewPoint(this._label._center).substract({left:width/2,top:-5});
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
                icon : 'stroke.png',
                html: true,
                content: maptalks.DomUtil.domToString(bgDom),
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.innerText;
                    var dom = target.parentNode.previousElementSibling;
                    maptalks.DomUtil.setStyle(dom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['fill'] = color;
                    me._label.setSymbol(symbol);
                })
            }, {
                type : 'button',
                icon: 'stroke.png',
                html: true,
                content: maptalks.DomUtil.domToString(borderDom),
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.innerText;
                    var dom = target.parentNode.previousElementSibling;
                    maptalks.DomUtil.setStyle(dom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['lineColor'] = color;
                    me._label.setSymbol(symbol);
                })

            }, {
                type : 'button',
                icon: 'font.png',
                html: true,
                content: maptalks.DomUtil.domToString(textColorDom),
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.innerText;
                    var dom = target.parentNode.previousElementSibling;
                    maptalks.DomUtil.setStyle(dom, 'background-color:'+color);
                    var symbol = me._label.getSymbol();
                    symbol['textFill'] = color;
                    me._label.setSymbol(symbol);
                })

            }, {
                type : 'html',
                content: maptalks.DomUtil.domToString(textSizeDom),

            }]
        });
        panel.addTo(this._map);
        return panel;
    },

    _colorItems: function (callback) {
        var fn = callback;
        return [{//子菜单
            content: '#cc0000',
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: '#d56a00',
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: '#a29900',
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: '#55a455',
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: '#3398cc',
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: '#663399',
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: '#cc0066',
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }, {
            content: '#333333',
            vertical : true,
            click : function(param){
                fn.call(this, param);
            }
        }];
    },

    _createBgDom: function() {
        var fillColor = this._label.strokeAndFill['markerFill'];
        return this._createColorDom(fillColor);
    },

    _createBorderDom: function() {
        var borderColor = this._label.strokeAndFill['markerLineColor'];
        return this._createColorDom(borderColor);
    },

    _createTextColorDom: function() {
        var textColor = this._label.textStyle['textFill'];
        return this._createColorDom(textColor);
    },

    _createTextSizeDom: function() {
        var group = maptalks.DomUtil.createEl('span');
        group.style.cssText = 'margin: 0px 5px 5px 0;width:16px;height:20px;';
        var textSizeDom = maptalks.DomUtil.createEl('input');
        textSizeDom.style.cssText = 'border:1px solid #333;font-weight:bold;font-size:16px;width:18px;height:18px;color:#333';
        textSizeDom.type='text';
        textSizeDom.maxLength = 2;
        var textSize = this._label.textStyle['textSize'];
        textSizeDom.value = textSize;
        group.appendChild(textSizeDom);
        return group;
    },

    _createColorDom: function(color) {
        var colorDom = maptalks.DomUtil.createEl('input');
        colorDom.style.cssText = 'width:16px;height:16px;background-color:'+color+';border:1px solid #333';
        colorDom.readOnly = true;
        return colorDom;

    }

};
