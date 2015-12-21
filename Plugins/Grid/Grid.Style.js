maptalks.GridStyle = maptalks.Class.extend({
    /**
     * 打开grid样式设置面板
     */
    addTo: function(grid) {
        this._width = 200;
        this._height = 38;
        this._grid = grid;
        this._gridData = grid._grid;
        this._map = grid._map;
        this._panel = this._getPanelByKey(grid);
        if(!this._panel) {
            this._panel = this._createPanel();
            this._registEvent();
            this._putPanelInMap(grid, this._panel);
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

        this._grid.on('dragging positionchanged', this._setPanelPosition, this)
                   .on('dragstart', this.hide, this)
                   .on('dragend', this.show, this);
    },

    _removeEvent: function() {
        var me = this;
        this._map.off('moving zoomend', this._setPanelPosition, this)
                 .off('movestart', this.hide, this);

        this._grid.off('dragging positionchanged', this._setPanelPosition, this)
                    .off('dragstart', this.hide, this)
                    .off('dragend', this.show, this);
    },

    _setPanelPosition: function() {
        this._panel.setPosition(this._getViewPoint());
    },

    _getViewPoint: function() {
        var mapOffset = this._map.offsetPlatform();
        var coordinate = this._grid.options['position'];
        var position = this._map.coordinateToViewPoint(coordinate)
                            .substract({x:30, y:50})
                            .add(mapOffset);
        var viewPoint = {top:position['y'], left:position['x']};
        return viewPoint;
    },

    _createPanel: function() {
        var viewPoint = this._getViewPoint();
        //背景颜色设置部分
        var bgDom = this._createBgDom();
        //文字颜色
        var textColorDom = this._createTextColorDom();
        //边框颜色设置部分
        var borderDom = this._createBorderDom();
        var me = this;
        var panel = new maptalks.Toolbar({
            position : viewPoint,
            vertical : false,
            //工具项
            items: [{
                type : 'button',
                icon: 'images/toolbox/trash.png',
                click : function(){
                    if(confirm('您确认要删除该表格！')){
                        me._panel.remove();
                        me._grid.remove();
                    }
                }
            },{
                type : 'button',
                icon : 'images/toolbox/paint.png',
                html: true,
                trigger: 'click',
                content: bgDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(bgDom, 'background-color:'+color);
                    //改变行与列的背景色
                    me._setGridStyle('markerFill',color);
                })
            }, {
               type : 'button',
               icon: 'images/toolbox/stroke.png',
               html: true,
               trigger: 'click',
               content: borderDom,
               children : this._colorItems(function(param){
                   var target = param.target;
                   var color = target.style['background-color'];
                   maptalks.DomUtil.setStyle(borderDom, 'background-color:'+color);
                   //改变行与列的边框色
                   me._setGridStyle('markerLineColor',color);
               })

           }, {
                type : 'button',
                icon: 'images/toolbox/font.png',
                html: true,
                trigger: 'click',
                content: textColorDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(textColorDom, 'background-color:'+color);
                    //改变行与列的文字颜色色
                    me._setGridStyle('textFill',color);
                })
            },
             {
                 type : 'button',
                 icon: 'images/toolbox/bold.png',
                 trigger: 'click',
                 click : function(){
                     me._setGridStyle('textFont','bolder');
                 }
            },
            {
                 type : 'button',
                 icon: 'images/toolbox/italic.png',
                 trigger: 'click',
                 click : function(){
                     me._setGridStyle('textFont','italic');
                 }
            },
            {
                type : 'button',
                icon: 'images/toolbox/left.png',
                trigger: 'click',
                click : function(){
                    me._setGridStyle('textAlign','left');
                }
            }, {
               type : 'button',
               icon: 'images/toolbox/center.png',
               trigger: 'click',
                click : function(){
                   me._setGridStyle('textAlign','center');
               }
            }, {
               type : 'button',
               icon: 'images/toolbox/right.png',
               trigger: 'click',
                click : function(){
                   me._setGridStyle('textAlign','right');
               }
            }
            ]
        });
        panel.addTo(this._map);
        return panel;
    },

    _setGridStyle: function(attr,value) {
        var rowNum = this._grid._currentRow;
        var colNum = this._grid._currentCol;
        if(rowNum>-1) {
            this._setRowStyle(rowNum, attr, value);
        }
        if(colNum>-1) {
            this._setColStyle(colNum, attr, value);
        }
    },

    _setRowStyle: function(rowNum, attr, value) {
        var row = this._gridData[rowNum];
        for(var j=0,rowLength=row.length;j<rowLength;j++) {
            var cell = row[j];
            var symbol = cell.getSymbol();
            var style = value;
            if(attr=='textFont') {
                style = value +' '+symbol['textSize'] +'px '+ symbol['textFaceName'];
            }
            this._setStyleToCell(cell,attr,style);
        }
    },

    _setColStyle: function(colNum, attr, value) {
        for(var i=0,len=this._gridData.length;i<len;i++) {
            var row = this._gridData[i];
            var cell = row[colNum];
            var symbol = cell.getSymbol();
            var style = value;
            if(attr=='textFont') {
                style = value +' '+symbol['textSize'] +'px '+ symbol['textFaceName'];
            }
            this._setStyleToCell(cell,attr,style);
        }
    },

    _setStyleToCell: function(cell, attr, value) {
        var symbol = cell.getSymbol();
        if(attr==='textAlign') {
            cell.setTextAlign(value);
        } else {
            var symbol = cell.getSymbol();
            symbol[attr] = value;
            cell.setSymbol(symbol);
        }
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
        return this._createColorDom('4e98dd');
    },

    _createTextColorDom: function() {
        return this._createColorDom('#ff0000');
    },

    _createBorderDom: function() {
        return this._createColorDom('#ffffff');
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
});
