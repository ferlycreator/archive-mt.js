maptalks.Grid = maptalks.Class.extend({
    includes: [maptalks.Eventable],

    /**
     * @cfg {Object} exceptionDefs 异常信息定义
     */
    'exceptionDefs':{
        'en-US':{
            'NEED_DATA':'You must set data to Gird options.'
        },
        'zh-CN':{
            'NEED_DATA':'你必须为Grid指定data。'
        }
    },

    /**
     * 表格构造函数
     * @constructor
     * @param {Object} options 设置
     {
        'title': 'title',
        'columns': [
            {header:'Name', dataIndex: 'name', type: 'string'},
            {header:'Birth', dataIndex: 'birth', type: 'data'},
            {header:'Age', dataIndex: 'age', type: 'number'},
            {header:'Marry', dataIndex: 'marry', type: 'boolean', trueText:'Yes', falseText: 'No'}
        ],
        'data': [
            {name:'Tom', birth:'1990-1-1', age: 25, marry: 'true'},
            {name:'Peter', birth:'1985-5-1', age: 30, marry: 'true'},
            {name:'Mary', birth:'2000-6-1', age: 15, marry: 'false'}
        ],
        'symbol': {
            'lineColor': '#ffffff',
            'fill': '#4e98dd',
            'textFaceName': 'arial',
            'textSize': 12,
            'textFill': '#ebf2f9',
            'textWrapWidth': 100
        },
        'position': {
            'x': 121.489935,
            'y': 31.24432
        },
        'width': 300,
        'height': 300,
        'draggable': true,
        'editable' : true,
        'dynamic': false
     }
     * @returns {maptalks.Table}
     */
    initialize: function(options) {
        this.setOptions(options);
        this._data = this.options['data'];
        this._initalData = this.options['data'];
        if(!this._data&&this._data.length==0)  {throw new Error(this.exceptions['NEED_DATA']);}
        this._initalColumns = this.options['columns'];
        this._columns = this._getColumns();
        this._rowNum = this._data.length+1;//包含表头
        this._colNum = this._columns.length;
        this._width = maptalks.Util.getValueOrDefault(this.options['width'],100);
        this._height = maptalks.Util.getValueOrDefault(this.options['height'],100);
        this._cellWidth = this._width/this._colNum;
        this._cellHeight = this._height/(this._rowNum);
        this._currentRow = -1;
        this._currentCol = -1;
        return this;
    },

    /**
     * add grid to layer.
     * @param {maptalks.Layer} layer
     */
    addTo: function (layer) {
        if(!layer) {return;}
        this._layer = layer;
        this._map = this._layer.getMap();
        this._grid = this._createGrid();
        this._addToLayer(this._grid,true);
        //create adjustment layer
        this._createAdjustLayer(this._map);
        return this;
    },

    /**
     * set options.
     * @param {Object} options
     * @expose
     */
    setOptions: function(options) {
        maptalks.Util.setOptions(this, options);
        return this;
    },

    /**
     * 添加一行
     * @param {Number} rowNum 添加新行的位置
     * @param {Object} data 行数据
     * @param {Boolean} below : true,下方;false,上方
     */
    addRow: function(rowNum, data, below) {
        var insertRowNum = rowNum+1;
        if(!below) {
            insertRowNum = rowNum;
        }
        //构造新加入的行
        var newDataset = new Array();
        if(!data||data.length==0) {//添加空行
            newDataset.push(this._createRow(insertRowNum, data));
        } else {
            if(maptalks.Util.isArray(data)){
                for(var i=0,len=data.length;i<len;i++) {
                    var item = data[i];
                    newDataset[i] = this._createRow(insertRowNum++, item);
                }
            } else {
                newDataset.push(this._createRow(insertRowNum, data));
            }
        }
        //添加新的数据集
        this._addToLayer(newDataset);
        //调整之前的数据集
        var end = rowNum+1;
        if(!below) end = rowNum;
        var startDataset = this._grid.slice(0,end);
        var lastDataset = this._grid.slice(end);
        this._adjustDatasetForRow(newDataset.length, lastDataset);
        this._grid = startDataset.concat(newDataset).concat(lastDataset);
        this._rowNum +=newDataset.length;
        //添加行底部拉伸线
        return this;
    },

    /**
     * 添加一列
     * @param {Number} colNum 添加新列的位置
     * @param {Object} data 添加的列数据
     * @param {Boolean} right :true,右侧;false,左侧
     */
    addCol: function(colNum, data, right) {
        var insertColNum = colNum+1;
        if(!right) {
            insertColNum = colNum;
        }
        this._createCol(insertColNum, data);
        return this;
    },

    /**
     * 删除行
     * @param {Number} rowNum 行号
     */
    removeRow: function(rowNum) {
        for(var i=rowNum,len=this._grid.length;i<len;i++) {
            var row = this._grid[i];
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                var cell = row[j];
                if(i>rowNum) {
                    var cellOffset = this._getCellOffset(i, 0);
                    cell._row -= 1;
                    this._translateDy(cell,cellOffset);
                } else {
                    cell.remove();
                }
            }
        }
        //移除行数据
        this._grid.splice(rowNum, 1);
        //总行数减少
        this._rowNum -=1;
    },

    /**
     * 删除列
     * @param {Number} colNum 列号
     */
    removeCol: function(colNum) {
        for(var i=0,len=this._grid.length;i<len;i++) {
            var row = this._grid[i];
            for(var j=colNum,rowLength=row.length;j<rowLength;j++) {
                var cell = row[j];
                if(j>colNum) {
                    cell._col -= 1;
                    this._translateDx(cell);
                } else {
                    cell.remove();
                }
            }
            //删除列数据
            this._grid[i].splice(colNum, 1);
        }
        //移除列数据
        this._colNum -=1;
    },

    remove: function(){
        for(var i=0,len=this._grid.length;i<len;i++) {
            var row = this._grid[i];
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                row[j].remove();
            }
        }
        this._gridHandler.remove();
        this._grid = [];
        delete this._grid;
    },

    _addToLayer: function(grid, init) {
        var me = this;
        for(var i=0,len=grid.length;i<len;i++) {
            var row = grid[i];
            for(var j=0,rowNum=row.length;j<rowNum;j++) {
                var cell = row[j];
                if(init) {
                    cell._row = i;
                    cell._col = j;
                }
                cell.addTo(this._layer);
                cell.on('mouseover',this._addMouseoverEventToCell,this)
                    .on('mouseout',this._addMouseoutEventToCell,this)
                    .on('dblclick',this._addEditEventToCell,this)
                    .on('contextmenu',this._addContextmenuToCell,this);
                //添加拖动焦点
                if(i==0&&j==0&&init) {
                    this._addDragHandler(cell);
                }
            }
        }
    },

    _addContextmenuToCell: function(event) {
        var cell = event.target;
        var colNum = cell._col;
        var rowNum = cell._row;
        var menuOptions = {};
        var me = this;
        if((rowNum==0&&colNum==0)||rowNum==0) {
            //设置菜单
            menuOptions = {
                'width': 100,
                'style': 'grey',
                'items' : [
                    {'item': '在前面添加列', 'callback': function() {
                        me.addCol(colNum, '空', false);
                    }},
                    {'item': '在后面添加列', 'callback': function() {
                        me.addCol(colNum, '空', true);
                    }},
                    {'item': '设置列样式', 'callback': function() {
                        me._currentCol = colNum;
                        me._currentRow = -1;
                        me._setStyleForGrid();
                    }},
                    {'item': '删除列', 'callback': function() {
                        me.removeCol(colNum);
                    }}
                ]
            };
        } else if(colNum==0) {
            menuOptions = {
                'width': 100,
                'style': 'grey',
                'items' : [
                    {'item': '在上面添加行', 'callback': function() {
                        me.addRow(rowNum, '空', false);
                    }},
                    {'item': '在下面添加行', 'callback': function() {
                        me.addRow(rowNum, '空', true);
                    }},
                    {'item': '设置行样式', 'callback': function() {
                        me._currentRow = rowNum;
                        me._currentCol = -1;
                        me._setStyleForGrid();
                    }},
                    {'item': '删除行', 'callback': function() {
                        me.removeRow(rowNum);
                    }}
                ]
            };
        }
        var coordinate = event['containerPoint'];
        cell.setMenu(menuOptions);
        cell.openMenu(coordinate);
    },


    _addDragHandler: function(cell) {
        var cellSize = cell.getSize(),
            height = cellSize['height'],
            width = cellSize['width'];
        var icon = {
            'markerType': 'ellipse',
            'markerFillOpacity': 0.6,
            'markerLineColor': '#4e98dd',
            'markerLineWidth': 1,
            'markerLineOpacity': 1,
            'markerWidth': height/2,
            'markerHeight': height/2,
            'markerFill': '#ffffff',
            'markerDx': -(width/2+height/4),
            'markerDy': -3*height/4
        };
        var marker = new maptalks.Marker(cell.getCenter(),{draggable:true});
        marker.setSymbol(icon);
        this._layer.addGeometry(marker);
        marker.on('dragstart', this._hideAdjustLayer,this);
        marker.on('dragend', this._showAdjustLayer,this);
        marker.on('dragging',this._dragGrid,this);
        this._gridHandler = marker;
    },

    _setStyleForGrid: function() {
        var styleEditor = new maptalks.GridStyle();
        styleEditor.addTo(this);
    },

    _hideAdjustLayer: function(event) {
        this._adjustLayer.hide();
    },

    _showAdjustLayer: function(event) {
        this._adjustLayer.show();
    },

    _dragGrid: function(event) {
        var dragOffset = event['dragOffset'];
        for(var i=0,len=this._grid.length;i<len;i++) {
            var row = this._grid[i];
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                var cell = row[j];
                cell.translate(dragOffset);
                if(i==0&&j==0) {
                    this.options['position'] = cell.getCenter();
                }
            }
        }
        for(var i=0,len=this._adjustRows.length;i<len;i++) {
            var line = this._adjustRows[i];
            line.translate(dragOffset);
        }
        for(var i=0,len=this._adjustCols.length;i<len;i++) {
            var line = this._adjustCols[i];
            line.translate(dragOffset);
        }
        this.fire('dragging',this);
    },

    _addMouseoverEventToCell: function(event) {
        this.fire('mouseover', event);
    },

    _addMouseoutEventToCell: function(event) {
        this.fire('mouseout', event);
    },

    _addEditEventToCell: function(event) {
        var cell = event.target;
        var row = cell._row;
        var cellDataIndex = cell['dataIndex'];
        if(this.options['dynamic']&&row==0) {//动态表格第一行
            var selectDom = this._createInputDom(cell);
            var map = cell.getMap();
            var viewPoint = cell._computeViewPoint();
            cell._container = maptalks.DomUtil.createEl('div');
            cell._container.style.cssText='position:absolute;top:'+viewPoint['y']
                                        +'px;left:'+viewPoint['x']+'px;z-index:5000;';
            map._panels.mapPlatform.appendChild(cell._container);
            cell._container.appendChild(selectDom);
        } else {
            cell.startEditText();
            var textEditor = cell._textEditor;
            textEditor.focus();
            var value = textEditor.value;
            textEditor.value = '';
            if(value!='空') {
                textEditor.value = value;
            }
        }
    },

    _createInputDom: function(cell) {
        var labelSize = cell.getSize();
        var symbol = cell.getSymbol();
        var width = labelSize['width'];
        var height = labelSize['height'];
        var textColor = symbol['textFill'];
        var textSize = symbol['textSize'];
        var fill = symbol['markerFill'];
        var lineColor = symbol['markerLineColor'];
        var spacing = maptalks.Util.getValueOrDefault(symbol['textLineSpacing'],0);
        var selectDom = maptalks.DomUtil.createEl('select');
        selectDom.style.cssText ='background:'+fill+';'+
            'border:1px solid '+lineColor+';'+
            'color:'+textColor+';'+
            'font-size:'+textSize+'px;'+
            'width:'+(width-spacing)+'px;'+
            'height:'+(height-spacing)+'px;';
        var cellDataIndex = cell['dataIndex'];
        for(var i=0,len=this._initalColumns.length;i<len;i++){
            var col = this._initalColumns[i];
            var optionDom = maptalks.DomUtil.createEl('option');
            optionDom.value = col['dataIndex'];
            optionDom.innerHTML = col['header'];
            if(cellDataIndex==col['dataIndex']) {
                optionDom.selected = true;
            }
            selectDom.appendChild(optionDom);
        }
        var me = this;
        me.cell = cell;
        maptalks.DomUtil.on(selectDom, 'change', function(param){
            var selectOption = param.target.selectedOptions[0];
            me.cell['dataIndex'] = selectOption.value;
            me.cell['header'] = selectOption.text;
            maptalks.DomUtil.removeDomNode(me.cell._container);
            delete me.cell._container;
            delete selectDom;
            me.cell.setContent(selectOption.text);
            //将数据填充到列
            me._setColData(me.cell);
        });
        maptalks.DomUtil.on(selectDom, 'mouseout', function(param){
            maptalks.DomUtil.removeDomNode(me.cell._container);
            delete me.cell._container;
            delete selectDom;
        });
        return selectDom;
    },

    _setColData: function(cell) {
        var dataIndex = cell['dataIndex'];
        var colNum = cell._col;
        var newValues = [];
        for(var i=0,len=this._initalData.length;i<len;i++) {
            var item = this._initalData[i];
            newValues[i+1] = item[dataIndex];
        }
        for(var i=1,len=this._grid.length;i<len;i++) {
            var row = this._grid[i];
            var cell = row[colNum];
            cell.setContent(newValues[i]);
        }
    },

    /**
     * 调整插入行之后的cell位置
     * @param {Number} insertRowLength 插入行的数量
     * @param {Array} lastDataset 插入行之后的cell数组
     */
    _adjustDatasetForRow: function(insertRowLength, lastDataset) {
        for(var i=0,len=lastDataset.length;i<len;i++) {
            var row = lastDataset[i];
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                row[j]._row += insertRowLength;
                this._translateDy(row[j]);
            }
        }
        return this;
    },

    _createCol: function(insertColNum, data) {
        var startCol = insertColNum;//调整起始列
        if(!data||data.length==0) data = '空';
        //将列插入grid
        var cells = new Array();
        var insertColLength = 1;
        for(var i=0;i<this._rowNum;i++) {
            if(maptalks.Util.isArray(data)){
                insertColLength = data.length;
                var colCell = new Array();
                for(var j=0,len=data.length;j<len;j++) {
                    var item = data[j];
                    var cellOffset = this._getCellOffset(i,insertColNum+j);
                    var cell  = this._createCell(item,cellOffset);
                    cell._row = i;
                    cell._col = insertColNum+j;
                    cell.on('dblclick',this._addEditEventToCell,this)
                        .on('contextmenu',this._addContextmenuToCell,this);
                    cell.addTo(this._layer);
                    colCell.push(cell);
                }
                cells.push(colCell);
            } else {
                var cellOffset = this._getCellOffset(i,insertColNum);
                var cell  = this._createCell(data,cellOffset);
                if(i==0) {
                    cell['header'] = 'new';
                    cell['dataIndex'] = 'new';
                    cell['type'] = 'string';
                    this._columns.splice(insertColNum+j, 0, cell);

                }
                cell._row = i;
                cell._col = insertColNum;
                cell.on('dblclick',this._addEditEventToCell,this)
                    .on('contextmenu',this._addContextmenuToCell,this);
                cell.addTo(this._layer);
                cells.push(cell);
            }
        }
        //调整之前的列
        this._adjustDatasetForCol(startCol,insertColLength);
        for(var i=0,len=this._grid.length;i<len;i++) {
            var dataLength = data.length;
            if(dataLength>0) {
                for(var j=0;j<dataLength;j++){
                    this._grid[i].splice(insertColNum+j, 0, cells[i]);
                }
            } else {
                this._grid[i].splice(insertColNum, 0, cells[i]);
            }
        }
        this._colNum+=insertColLength;
    },

    _adjustDatasetForCol: function(start, insertColLength) {
        for(var i=0,len=this._grid.length;i<len;i++) {
            var rowData = this._grid[i];
            for(var j=start,rowLength=rowData.length;j<rowLength;j++) {
                var cell = rowData[j];
                cell._col += insertColLength;
                this._translateDx(cell);
            }
        }
    },

    _createGrid: function() {
        var dataset = new Array();
        dataset[0] = this._createHeader();
        for(var i=0;i<this._rowNum-1;i++) {
            var item = this._data[i];
            dataset[i+1] = this._createRow(i+1, item);
        }
        return dataset;
    },

    _createHeader: function() {
        var headerRow = new Array();
        for(var i=0,len=this._columns.length;i<len;i++) {
            var cellOffset = this._getCellOffset(0, i);
            var col = this._columns[i];
            var text = col['header'];
            var cell = this._createCell(text,cellOffset);
            cell._row = 0;
            cell._col = i;
            headerRow.push(cell);
        }
        return headerRow;
    },

    _createRow: function(index, item) {
        var cols = new Array();
        for(var i=0;i<this._colNum;i++) {
            var col = this._columns[i];
            var dataIndex = col['dataIndex'];
            var dataType = col['type'];
            var cellOffset = this._getCellOffset(index, i);
            var text = '空';
            if(item&&item[dataIndex]) {
                text = item[dataIndex];
            }
            var cell = this._createCell(text,cellOffset);
            cell._row = index;
            cell._col = i;
            cols[i] = cell;
        }
        return cols;
    },

    _getCellOffset: function(row, col) {
        return  {'dx':col*this._cellWidth, 'dy':row*this._cellHeight};
    },

    _getColumns: function() {
        var columns = this.options['columns'];
        if(!columns) {
            columns = [];
            var firstRow = this.options['data'];
            for(var key in firstRow) {
                var type = this._getDataType(firstRow[key]);
                var column = {header: key,dataIndex: key,type: type};
                columns.push(column);
            }
        }
        return columns;
    },

    _getDataType: function(value) {
        var type = 'string';
        if(maptalks.isNumber(value)) {
            type = 'number';
        }
        return type;
    },

    _createCell: function(text, cellOffset) {
        var symbol = this.options.symbol;
        var textSize = maptalks.Util.getValueOrDefault(symbol['textSize'],12);
        var textLineSpacing = maptalks.Util.getValueOrDefault(symbol['textLineSpacing'],8);
        var labelOptions = {
               'symbol': {
                   'markerLineColor': maptalks.Util.getValueOrDefault(symbol['lineColor'],'#ffffff'),
                   'markerLineWidth': 1,
                   'markerLineOpacity': 0.9,
                   'markerLineDasharray': null,
                   'markerFill': maptalks.Util.getValueOrDefault(symbol['fill'],'#4e98dd'),
                   'markerFillOpacity': 0.9,
                   'markerDx': cellOffset['dx'],
                   'markerDy': cellOffset['dy'],

                   'textFaceName': maptalks.Util.getValueOrDefault(symbol['textFaceName'],'arial'),
                   'textSize': textSize,
                   'textFill': maptalks.Util.getValueOrDefault(symbol['textFill'],'#ff0000'),
                   'textOpacity': 1,
                   'textSpacing': 30,
                   'textWrapWidth': this._cellWidth,
                   'textWrapBefore': false,
                   'textLineSpacing': textLineSpacing,
                   'textHorizontalAlignment': 'middle',
                   'textVerticalAlignment': 'middle',
                   'textDx': cellOffset['dx'],
                   'textDy': cellOffset['dy']
               },
               'draggable': false,
               'boxAutoSize': false,
               'boxMinWidth': this._cellWidth,
               'boxMinHeight': this._cellHeight
        };
        var coordinate = this.options['position'];
        var label = new maptalks.Label(text,coordinate,labelOptions);
        return label;
    },

    _createAdjustLayer: function(map) {
        var adjustLayerId = 'grid_adjustment_layer';
        this._adjustLayer = map.getLayer(adjustLayerId);
        if(!this._adjustLayer) {
            this._adjustLayer = new maptalks.VectorLayer(adjustLayerId);
            map.addLayer(this._adjustLayer);
//            this._adjustLayer.bringToBack();
        }
        this._adjustRows = new Array();
        this._adjustCols = new Array();
        var startPoint = this.options['position'];
        //add row adjust line
        for(var i=0,len=this._grid.length;i<len;i++) {
            var row = this._grid[i];
            var cell = row[0];
            var rowLine = this._createAdjustLineForRow(map,cell,startPoint);
            this._addEventToRowLine(map, rowLine, cell);
            this._adjustRows.push(rowLine);
        }
        this._adjustLayer.addGeometry(this._adjustRows);

        //add col adjust line
        var firstRow = this._grid[0];
        for(var i=0;i<this._colNum;i++) {
            var cell = firstRow[i];
            var colLine = this._createAdjustLineForCol(map,cell,startPoint);
            this._addEventToColLine(map,colLine, cell);
            this._adjustCols.push(colLine);
        }
        this._adjustLayer.addGeometry(this._adjustCols);
    },

    _createAdjustLineForRow(map,cell,startPoint) {
        var size = cell.getSize();
        var symbol = cell.getSymbol(),
            dx = symbol['textDx'],
            dy = symbol['textDy'];
        var leftPoint = map.locate(startPoint,
                        -map.pixelToDistance(size['width']/2,0),
                        -map.pixelToDistance(0,size['height']/2+dy));
        var rightPoint = map.locate(startPoint,
                        map.pixelToDistance(this._width-size['width']/2,0),
                        -map.pixelToDistance(0,size['height']/2+dy));
        var line = new maptalks.LineString([leftPoint,rightPoint],{draggable:true, cursor:'s-resize'});
        var symbol = {
            'lineColor' : '#e2dfed',
            'lineWidth' : 3,
            'lineDasharray' : null,//线形
            'lineOpacity' : 0.8
        };
        line.setSymbol(symbol);
        return line;
    },

    _addEventToRowLine: function(map, rowLine, cell) {
        var me = this;
        rowLine.on('dragging',function(event){
            var dragOffset = event['dragOffset'];
            var dx = dragOffset.x,dy=dragOffset.y;
            var sign=1;
            if(dx<0){
                sign=-1;
            }
            var distance = map.computeDistance(new maptalks.Coordinate(0,0), dragOffset);
            var pixel = map.distanceToPixel(0, distance);
            me._height +=pixel['height']*sign;
            var offset = new maptalks.Coordinate(-dx, 0);
            rowLine.translate(offset);
            me._resizeRow(cell, dragOffset);

            me._translateRowLine(cell, new maptalks.Coordinate(0,dy));
            //add dy to grid width
            me._extendColLine(map);
        });
    },

    _translateRowLine: function(cell, dragOffset) {
        var rowNum = cell._row;
        for(var i=rowNum+1,len=this._adjustRows.length;i<len;i++) {
            var line = this._adjustRows[i];
            line.translate(dragOffset);
        }
    },

    _extendColLine: function(map) {
        for(var i=0,len=this._adjustCols.length;i<len;i++) {
            var line = this._adjustCols[i];
            var coordinates = line.getCoordinates();
            var upPoint = coordinates[0];
            var downPoint = map.locate(upPoint,0,-map.pixelToDistance(0,this._height));
            line.setCoordinates([upPoint,downPoint]);
        }
    },

    _resizeRow: function(cell, dragOffset) {
        var rowNum = cell._row;
        var dy = dragOffset.y;
        var sign = -1;
        if(dy<0) {
            sign = 1;
        }
        var distance = this._map.computeDistance(new maptalks.Coordinate(0,0), dragOffset);
        var pixel = this._map.distanceToPixel(0,distance);
        var height = pixel['height']*sign;
        for(var i=rowNum;i<this._rowNum;i++) {
            var row = this._grid[i];
            for(var j=0;j<this._colNum;j++){
                var cell = row[j];
                if(i===rowNum) {
                    cell.options['boxMinHeight']+=height;
                }
                var symbol = cell.getSymbol();
                if(cell.options['boxMinHeight']<symbol['markerHeight']) {
                    symbol['markerHeight'] = cell.options['boxMinHeight'];
                }
                var cellSize = cell.getSize();
                symbol['markerDy']+=height/2;
                symbol['textDy']+=height/2;
                cell.setSymbol(symbol);
            }
        }
    },

    _createAdjustLineForCol(map,cell,startPoint) {
        var size = cell.getSize();
        var symbol = cell.getSymbol(),
            dx = symbol['textDx'],
            dy = symbol['textDy'];
        var upPoint = map.locate(startPoint,map.pixelToDistance(size['width']/2+dx,0),map.pixelToDistance(0,size['height']/2));
        var downPoint = map.locate(upPoint,0,-map.pixelToDistance(0,this._height));
        var line = new maptalks.LineString([upPoint,downPoint],{draggable:true, cursor:'e-resize'});
        var symbol = {
            'lineColor' : '#e2dfed',
            'lineWidth' : 3,
            'lineDasharray' : null,//线形
            'lineOpacity' : 0.8
        };
        line.setSymbol(symbol);
        return line;
    },

    _addEventToColLine: function(map, colLine, cell) {
        var me = this;
        colLine.on('dragging',function(event){
            var dragOffset = event['dragOffset'];
            var dx=dragOffset.x,dy=dragOffset.y;
            var sign=1;
            if(dy<0) {
                sign=-1;
            }
            var distance = map.computeDistance(new maptalks.Coordinate(0,0), dragOffset);
            var pixel = map.distanceToPixel(distance, 0);
            me._width +=pixel['width']*sign;
            var offset = new maptalks.Coordinate(0, -dy);
            colLine.translate(offset);
            me._resizeCol(cell, dragOffset);
            me._translateColLine(cell, new maptalks.Coordinate(dx, 0));
            //add dy to grid width
            me._extendRowLine(map);
        });
    },

    _translateColLine: function(cell, dragOffset) {
        var colNum = cell._col;
        for(var i=colNum+1,len=this._adjustCols.length;i<len;i++) {
            var line = this._adjustCols[i];
            line.translate(dragOffset);
        }
    },

    _extendRowLine: function(map) {
        for(var i=0,len=this._adjustRows.length;i<len;i++) {
            var line = this._adjustRows[i];
            var coordinates = line.getCoordinates();
            var leftPoint = coordinates[0];
            var rightPoint = map.locate(leftPoint,map.pixelToDistance(this._width,0),0);
            line.setCoordinates([leftPoint,rightPoint]);
        }
    },

    _resizeCol: function(cell, dragOffset) {
        var colNum = cell._col;
        var dx = dragOffset.x;
        var sign = 1;
        if(dx<0) {
            sign = -1;
        }
        var distance = this._map.computeDistance(new maptalks.Coordinate(0,0), dragOffset);
        var pixel = this._map.distanceToPixel(distance, 0);
        var width = pixel['width']*sign;
        for(var i=0,len=this._grid.length;i<len;i++) {
            var row = this._grid[i];
            for(var j=colNum,rowLength=row.length;j<rowLength;j++) {
                var cell = row[j];
                if(j===colNum) {
                    cell.options['boxMinWidth']+=width;
                }
                var symbol = cell.getSymbol();
                if(cell.options['boxMinWidth']<symbol['markerWidth']) {
                    symbol['markerWidth'] = cell.options['boxMinWidth'];
                }
                var cellSize = cell.getSize();
                symbol['markerDx']+=width/2;
                symbol['textDx']+=width/2;
                cell.setSymbol(symbol);
            }
        }
    },

    //TODO 临时方法,提供label的dx/dy调整,待geometry提供类似方法
    _translateDx: function(cell){
        var cellOffset = this._getCellOffsetTemp(cell._row, cell._col);
        var symbol = cell.getSymbol();
        symbol['markerDx'] = cellOffset['dx'];
        symbol['textDx'] = cellOffset['dx'];
        cell.setSymbol(symbol);
    },

    _translateDy: function(cell){
        var cellOffset = this._getCellOffsetTemp(cell._row, cell._col);
        var symbol = cell.getSymbol();
        symbol['markerDy'] = cellOffset['dy'];
        symbol['textDy'] = cellOffset['dy'];
        cell.setSymbol(symbol);
    },

    _getCellOffsetTemp: function(row, col) {
        return  {'dx':col*this._cellWidth, 'dy':row*this._cellHeight};
    }

});