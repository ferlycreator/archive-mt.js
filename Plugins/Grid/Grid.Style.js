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
        //文字大小
        var textSizeInputDom = this._createTextSizeInputDom(12);
        var me = this;
        var panel = new maptalks.Toolbar({
            position : viewPoint,
            vertical : false,
            //工具项
            items: [{
                icon: 'images/toolbox/trash.png',
                width: 20,
                height: 20,
                click : function(){
                    if(confirm('您确认要删除该表格！')){
                        me._panel.remove();
                        me._grid.remove();
                    }
                }
            },{
                icon : 'images/toolbox/paint.png',
                width: 20,
                height: 20,
                html: true,
                trigger: 'click',
                item: bgDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(bgDom, 'background-color:'+color);
                    //改变行与列的背景色
                    me._setGridStyle('markerFill',color);
                })
            }, {
               icon: 'images/toolbox/stroke.png',
               width: 20,
               height: 20,
               html: true,
               trigger: 'click',
               item: borderDom,
               children : this._colorItems(function(param){
                   var target = param.target;
                   var color = target.style['background-color'];
                   maptalks.DomUtil.setStyle(borderDom, 'background-color:'+color);
                   //改变行与列的边框色
                   me._setGridStyle('markerLineColor',color);
               })

           }, {
                icon: 'images/toolbox/font.png',
                width: 20,
                height: 20,
                html: true,
                trigger: 'click',
                item: textColorDom,
                children : this._colorItems(function(param){
                    var target = param.target;
                    var color = target.style['background-color'];
                    maptalks.DomUtil.setStyle(textColorDom, 'background-color:'+color);
                    //改变行与列的文字颜色色
                    me._setGridStyle('textFill',color);
                })
            },
            {
                width: 20,
                height: 20,
                item: textSizeInputDom,
                children : this._numberItems(function(param){
                    var target = param.target;
                    var textSize = parseFloat(target.innerText);
                    textSizeInputDom.value=textSize;
                    //改变行与列的背景色
                    me._setGridStyle('textSize',textSize);
                })

            },
            {
                icon: 'images/toolbox/bold.png',
                width: 20,
                height: 20,
                trigger: 'click',
                click : function(){
                    me._setGridStyle('textFont','bolder');
                }
            },
            {
                icon: 'images/toolbox/italic.png',
                width: 20,
                height: 20,
                trigger: 'click',
                click : function(){
                    me._setGridStyle('textFont','italic');
                }
            },
            {
                icon: 'images/toolbox/left.png',
                width: 20,
                height: 20,
                trigger: 'click',
                click : function(){
                    me._setGridStyle('textAlign','left');
                }
            }, {
                icon: 'images/toolbox/center.png',
                width: 20,
                height: 20,
                trigger: 'click',
                click : function(){
                    me._setGridStyle('textAlign','center');
                }
            }, {
               icon: 'images/toolbox/right.png',
               width: 20,
               height: 20,
               trigger: 'click',
                click : function(){
                   me._setGridStyle('textAlign','right');
               }
            }, {
               icon: 'images/toolbox/close.png',
               width: 20,
               height: 20,
               click : function(){
                   me._panel.hide();
               }
            }]
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

    _numberItems : function (callback) {
        var fn = callback;
        var nums =['12','14','16','18','20','30','60'];
        return this._createNumberMenuItems(nums,fn);
     },

     _createNumberMenuItems: function(nums,fn) {
         var items= new Array();
         for(var i=0,len=nums.length;i<len;i++) {
             var num = nums[i];
             var itemObj = {
                 item: this._createTextSizeSelectDom(num),
                 width: 20,
                 height: 20,
                 html: true,
                 click : function(param){
                     fn.call(this, param);
                 }
             };
             items.push(itemObj);
         }
         return items;
     },

    _createTextSizeSelectDom: function(textSize) {
        var textSizeDom = maptalks.DomUtil.createEl('span');
        textSizeDom.style.cssText = 'display:-moz-inline-box;display:inline-block;width:25px;height:20px;line-height:20px;color:#000000;font-weight:bolder;font-size:16px;';
        textSizeDom.innerText = textSize;
        return textSizeDom;
    },

     _createTextSizeInputDom: function(textSize) {
        var textSizeDom = maptalks.DomUtil.createEl('input');
        textSizeDom.type='text';
        textSizeDom.maxLength="2";
        textSizeDom.size=2;
        textSizeDom.style.cssText = 'display:-moz-inline-box;display:inline-block;width:30px;height:20px;line-height:20px;color:#000000;font-weight:bolder;font-size:16px;';
        textSizeDom.value = textSize;
        var me = this;
        maptalks.DomUtil.on(textSizeDom, 'keyup', function(param){
            var target = param.target;
            var newValue = target.value;
            if(!parseInt(newValue)) {
                return;
            }
            var textSize = parseFloat(newValue);
            me._symbol['textSize'] = textSize;
            me._label.setSymbol(me._symbol);
            textSizeDom.value=textSize;
        });
        return textSizeDom;
     },

    _colorItems: function (callback) {
        var fn = callback;
        var colors =['#ffffff','#cc0000','#d56a00','#a29900','#55a455','#3398cc',
        '#663399','#cc0066','#333333',null];
        return this._createColorMenuItems(colors,fn);
    },

    _createColorMenuItems: function(colors,fn) {
        var items= new Array();
        for(var i=0,len=colors.length;i<len;i++) {
            var color = colors[i];
            var itemObj = {
                item: this._createColorSpanDom(color),
                width: 20,
                height: 20,
                html: true,
                click : function(param){
                    fn.call(this, param);
                }
            };
            items.push(itemObj);
        }
        return items;
    },

    _createColorSpanDom: function(color) {
        var spanDom = maptalks.DomUtil.createEl('span');
        if(color) {
            spanDom.style.cssText = 'display:-moz-inline-box;display:inline-block;width:16px;height:16px;border:1px solid #000000;background-color:'+color+';';
            spanDom.innerText = '';
        } else {
            spanDom.style.cssText = 'display:-moz-inline-box;display:inline-block;text-align:center;line-height:20px;color:red;';
            spanDom.innerText = '无';
        }
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
        colorDom.style.cssText = 'width:5px;height:9px;background-color:'+color+';border:1px solid #333';
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
