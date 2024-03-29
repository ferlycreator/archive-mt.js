maptalks.Table = {};
maptalks.Table.dataindex_geometry = 'maptalks_geometry';

maptalks.Table = maptalks.Class.extend({
    includes: [maptalks.Eventable],

    /**
     * @cfg {Object} exceptionDefs 异常信息定义
     */
    'exceptionDefs':{
        'en-US':{
            'NEED_DATA':'You must set data to Table options.',
            'NEED_COLUMN':'You must set columns to Table options.'
        },
        'zh-CN':{
            'NEED_DATA':'你必须为Table指定data。',
            'NEED_COLUMN':'你必须为Table指定columns。'
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
            'textFaceName': 'monospace',
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
        'editable': true,
        'header': true,
        'order': true,
        'dynamic': false
     }
     * @returns {maptalks.Table}
     */
    initialize: function(options) {
        this.setOptions(options);
        if(!this.options['data']&&this.options['data'].length==0)  {throw new Error(this.exceptions['NEED_DATA']);}
        if(!this.options['columns']&&this.options['columns'].length==0)  {throw new Error(this.exceptions['NEED_COLUMN']);}
        //包含序号列
        if(this.options['order']) {
            var orderCol = {header:'序号', dataIndex: 'maptalks_order', type: 'number'};
            this.options['columns'].unshift(orderCol);

            var dataArray = this.options['data'];
            for(var i=0,len=dataArray.length;i<len;i++) {
                dataArray[i]['maptalks_order'] =i+1;
            }
        }
        this._initalColumns = this.options['columns'];
        this._columns = this._getColumns();
        this._colNum = this._columns.length;
        this._data = this.options['data'];
        this._initalData = this.options['data'];
        this._rowNum = this._data.length;
        //包含表头
        if(this.options['header']) {
            this._rowNum += 1;
        }
        this._width = maptalks.Util.getValueOrDefault(this.options['width'],100);
        this._height = maptalks.Util.getValueOrDefault(this.options['height'],100);
        this._cellWidth = this._width/this._colNum;
        this._cellHeight = this._height/this._rowNum;
        this._currentRow = -1;
        this._currentCol = -1;
        this._rowHeights = new Array();
        this._colWidths = new Array();
        return this;
    },

    toJSON: function(){
        return {
            'options': this.options,
            'colums' : this._columns,
            'colNum': this._colNum,
            'data': this._data,
            'rowNum': this._rowNum,
            'rowHeights': this._rowHeights,
            'colWidths': this._colWidths
        };
    },

    initByJson: function(json) {
        var options = json['options'];
        this._columns = json['colums'];
        this._colNum = json['colNum'];
        this._data = [];
        //处理其中geometry
        var data = json['data'];
        if(options['dynamic']&&data&&data.length>0) {
            for(var i=0,len=data.length;i<len;i++) {
                var item = data[i];
                var geoJson = item[maptalks.Table.dataindex_geometry];
                item[maptalks.Table.dataindex_geometry] = maptalks.Geometry.fromJSON(geoJson);
                this._data.push(item);
            }
        } else {
            this._data = json['data'];
        }
        this._rowNum = json['rowNum'];
        this._rowHeights = json['rowHeights'];
        this._colWidths = json['colWidths'];
        return this;
    },

    /**
     * add table to layer.
     * @param {maptalks.Layer} layer
     */
    addTo: function (layer) {
        if(!layer) {return;}
        this._layer = layer;
        this._map = this._layer.getMap();
        //init row height and col width
        this._initRowHeightAndColWidth();
        this._table = this._createTable();
        this._addToLayer(this._table,true);
        //create adjustment layer
        this._createAdjustLayer(this._map);
        var me=this;
        this._map.on('resize zoomend', function(){
            me._refrestAdjustLayer(me._map);
        });
        this._map.options['doubleClickZoom'] = false;
        return this;
    },

    _addNumberLabelToGeometry: function(coordinate, cell) {
        //设置label属性
        var cellSymbol = cell.getSymbol();
        var options = {
            'symbol': this._convertCellSymbolToNumberSymbol(cellSymbol),
            'draggable': false,
            'boxAutoSize': false,
            'boxMinWidth': 18,
            'boxMinHeight': 18
        };
        //创建label
        var num = cell.getContent();
        var numberLabel = new maptalks.Label(num, coordinate, options);
        this._layer.addGeometry(numberLabel);

        cell.on('hide remove', function(){
            numberLabel.remove();
        }, this);
        var me=this;
        cell.on('symbolchanged', function(){
            var symbol = me._convertCellSymbolToNumberSymbol(cell.getSymbol());
            numberLabel.setSymbol(symbol);
        },this);
        cell.on('contentchange positionchanged', function(){
            var number = cell.getContent();
            numberLabel.setContent(number);
        },this);
    },

    _convertCellSymbolToNumberSymbol: function(cellSymbol){
        var symbol = {
            'markerType' : 'ellipse',
            'markerLineColor': maptalks.Util.getValueOrDefault(cellSymbol['markerLineColor'],'#ffffff'),
            'markerLineWidth': cellSymbol['markerLineWidth'],
            'markerLineOpacity': cellSymbol['markerLineOpacity'],
            'markerFill': maptalks.Util.getValueOrDefault(cellSymbol['markerFill'],'#4e98dd'),
            'markerFillOpacity': cellSymbol['markerFillOpacity'],
            'markerDx': 0,
            'markerDy': 9,
            'markerHeight' : 18,
            'markerWidth': 18,

            'textFaceName': maptalks.Util.getValueOrDefault(cellSymbol['textFaceName'],'monospace'),
            'textSize': cellSymbol['textSize'],
            'textFill': maptalks.Util.getValueOrDefault(cellSymbol['textFill'],'#ff0000'),
            'textOpacity': cellSymbol['textOpacity'],
            'textSpacing': cellSymbol['textSpacing'],
            'textWrapBefore': false,
            'textLineSpacing': cellSymbol['textLineSpacing'],
            'textHorizontalAlignment': cellSymbol['textHorizontalAlignment'],
            'textVerticalAlignment': cellSymbol['textVerticalAlignment'],
            'textDx': 0,
            'textDy': 9
        };
        return symbol;
    },

    _initRowHeightAndColWidth: function() {
        for(var i=0;i<this._rowNum;i++) {
            this._rowHeights[i] = this._cellHeight;
        }
        for(var i=0;i<this._colNum;i++) {
            this._colWidths[i] = this._cellWidth;
        }
    },

    /**
     * set options.
     * @param {Object} options
     * @expose
     */
    setOptions: function(options) {
        maptalks.Util.setOptions(this, options);
        if (!this.options['width']) this.options['width'] = 300;
        if (!this.options['height']) this.options['width'] = 300;
        if (!this.options['header'] && this.options['header']!==false) this.options['header'] = true;
        if (!this.options['order'] && this.options['order']!==false) this.options['order'] = true;
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
                    var row = this._createRow(insertRowNum, item);
                    newDataset[i] = row;
                    this._insertAdjustLineForNewRow(row,insertRowNum);
                    insertRowNum+=1;
                }
            } else {
                var row = this._createRow(insertRowNum, data);
                newDataset.push(row);
                this._insertAdjustLineForNewRow(row,insertRowNum);
            }
        }
        //添加新的数据集
        this._addToLayer(newDataset);
        //调整之前的数据集
        var end = rowNum+1;
        if(!below) end = rowNum;
        var startDataset = this._table.slice(0,end);
        var lastDataset = this._table.slice(end);
        this._adjustDatasetForRow(newDataset.length, lastDataset);
        this._table = startDataset.concat(newDataset).concat(lastDataset);
        this._rowNum +=newDataset.length;
        //延展列调整线
        this._extendColLine();
        return this;
    },

    moveRow: function(sourceRowNum, direction) {
        var targetRowNum = sourceRowNum;
        if(direction==='up') {
            if(sourceRowNum>0) {
                targetRowNum = sourceRowNum-1;
            }
        } else if (direction==='down') {
            if(sourceRowNum<this._rowNum-1) {
                targetRowNum = sourceRowNum+1;
            }
        }
        this._changeRowOrder(sourceRowNum, targetRowNum);
    },

    _changeRowOrder: function(sourceRowNum, targetRowNum) {
        if(sourceRowNum===targetRowNum) {return;}
        var sourceRow = this._table[sourceRowNum];
        var targetRow = this._table[targetRowNum];
        var firstSourceCell = sourceRow[0];
        var sourceRowSymbol = firstSourceCell.getSymbol();
        var sourceCellSize = firstSourceCell.getSize();
        var sourceRowHeight = sourceCellSize['height'];
        var sourceRowDy = sourceRowSymbol['markerDy'];
        var firstTargetCell = targetRow[0];
        var targetRowSymbol = firstTargetCell.getSymbol();
        var targetCellSize = firstTargetCell.getSize();
        var targetRowHeight = targetCellSize['height'];
        var targetRowDy = targetRowSymbol['markerDy'];
        if(sourceRowDy<targetRowDy) {
            sourceRowDy = sourceRowDy+targetRowHeight;
            targetRowDy = targetRowDy-sourceRowHeight;
        } else {
            sourceRowDy = sourceRowDy-targetRowHeight;
            targetRowDy = targetRowDy+sourceRowHeight;
        }
        //调整行位置
        for(var i=0,len=sourceRow.length;i<len;i++) {
            var symbol=sourceRow[i].getSymbol();
            symbol['markerDy']=sourceRowDy;
            symbol['textDy']=sourceRowDy;
            sourceRow[i].setSymbol(symbol);
            sourceRow[i]._row=targetRowNum;
            if(this.options['order']&&this._columns[i]['dataIndex']==='maptalks_order'){
                sourceRow[i].setContent(targetRowNum);
                sourceRow[i].fire('positionchanged',{target:sourceRow[i]});
            }
        }
        this._table[targetRowNum]=sourceRow;
        for(var i=0,len=targetRow.length;i<len;i++) {
            var symbol=targetRow[i].getSymbol();
            symbol['markerDy']=targetRowDy;
            symbol['textDy']=targetRowDy;
            targetRow[i].setSymbol(symbol);
            targetRow[i]._row=sourceRowNum;
            if(this.options['order']&&this._columns[i]['dataIndex']==='maptalks_order'){
                targetRow[i].setContent(sourceRowNum);
                targetRow[i].fire('positionchanged',{target:targetRow[i]});
            }
        }
        this._table[sourceRowNum]=targetRow;
    },

    moveCol: function(sourceColNum, direction) {
        var targetColNum = sourceColNum;
        if(direction==='left') {
            if(sourceColNum>0) {
                targetColNum = sourceColNum-1;
            }
        } else if (direction==='right') {
            if(sourceColNum<this._colNum-1) {
                targetColNum = sourceColNum+1;
            }
        }
        this._changeColOrder(sourceColNum, targetColNum);
    },

    _changeColOrder: function(sourceColNum, targetColNum) {
        if(sourceColNum===targetColNum) {return;}
        var firstRow = this._table[0];
        var firstSourceCell = firstRow[sourceColNum];
        var firstTargetCell = firstRow[targetColNum];
        var sourceSymbol = firstSourceCell.getSymbol();
        var sourceCellSize = firstSourceCell.getSize();
        var sourceColWidth = sourceCellSize['width'];
        var sourceColDx = sourceSymbol['markerDx'];

        var targetSymbol = firstTargetCell.getSymbol();
        var targetCellSize = firstTargetCell.getSize();
        var targetColWidth = targetCellSize['width'];
        var targetColDx = targetSymbol['markerDx'];
        if(sourceColDx<targetColDx) {
            sourceColDx = sourceColDx+targetColWidth;
            targetColDx = targetColDx-sourceColWidth;
        } else {
            sourceColDx = sourceColDx-targetColWidth;
            targetColDx = targetColDx+sourceColWidth;
        }
        //调整列位置
        for(var i=0,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
            var sourceCellSymbol = row[sourceColNum].getSymbol();
            sourceCellSymbol['markerDx']=sourceColDx;
            sourceCellSymbol['textDx']=sourceColDx;
            row[sourceColNum].setSymbol(sourceCellSymbol);
            row[sourceColNum]._col=targetColNum;

            var targetCellSymbol = row[targetColNum].getSymbol();
            targetCellSymbol['markerDx']=targetColDx;
            targetCellSymbol['textDx']=targetColDx;
            row[targetColNum].setSymbol(targetCellSymbol);
            row[targetColNum]._col=sourceColNum;
            var temp = row[sourceColNum];
            row[sourceColNum] = row[targetColNum];
            row[targetColNum] = temp;
        }
    },

    _insertAdjustLineForNewRow: function(row,insertRowNum) {
        var cell = row[0];
        var map = this._adjustLayer.getMap();
        //添加行底部拉伸线
        var line = this._createAdjustLineForRow(map,cell);
        var cellHeight = cell.options['boxMinHeight'];
        this._height += cellHeight;
        var distance = map.pixelToDistance(0,cellHeight);
        var offset = map.locate(new maptalks.Coordinate(0,0),0,-distance);
        //调整插入行之后的调整线的位置
        for(var i=insertRowNum,len=this._adjustRows.length;i<len;i++) {
            var rowLine = this._adjustRows[i];
            rowLine.translate(offset);
        }
        this._adjustRows.splice(insertRowNum, 0, line);
        this._adjustLayer.addGeometry(line);
        this._rowHeights.splice(insertRowNum, 0, cellHeight);
    },

    _removeAdjustLineForRow: function(cell) {
        var map = this._adjustLayer.getMap();
        var rowNum = cell._row;
        var line = this._adjustRows[rowNum];
        line.remove();
        //调整rowNum之后的调整线
        var cellHeight = cell.options['boxMinHeight'];
        this._height -= cellHeight;
        var distance = map.pixelToDistance(0,cellHeight);
        var offset = map.locate(new maptalks.Coordinate(0,0),0,distance);
        for(var i=rowNum+1;i<this._adjustRows.length;i++) {
            var rowLine = this._adjustRows[i];
            rowLine.translate(offset);
        }
        this._adjustRows.splice(rowNum,1);
        this._rowHeights.splice(rowNum,1);
    },

    _insertAdjustLineForNewCol: function(cell, insertColNum) {
        var map = this._adjustLayer.getMap();
        //添加行底部拉伸线
        var line = this._createAdjustLineForCol(map,cell);
        var cellWidth = cell.options['boxMinWidth'];
        if(!cellWidth) cellWidth = this._cellWidth;
        this._width += cellWidth;
        var distance = map.pixelToDistance(cellWidth,0);
        var offset = map.locate(new maptalks.Coordinate(0,0),distance,0);
        this._adjustCols.splice(insertColNum, 0, line);
        this._adjustLayer.addGeometry(line);
        this._colWidths.splice(insertColNum, 0, cellWidth);
    },

    _removeAdjustLineForCol: function(cell) {
        var map = this._adjustLayer.getMap();
        var colNum = cell._col;
        var line = this._adjustCols[colNum];
        line.remove();
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
        //延展行调整线
        this._extendRowLine();
        return this;
    },

    /**
     * 删除行
     * @param {Number} rowNum 行号
     */
    removeRow: function(rowNum) {
        var removeRow = this._table[rowNum];
        var firstCell = removeRow[0];
        var size = firstCell.getSize();
        for(var i=rowNum,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
            if(i===rowNum) {
                this._removeAdjustLineForRow(row[0]);
            }
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                var cell = row[j];
                if(i>rowNum) {
                    var cellOffset = this._getCellOffset(i, 0);
                    cell._row -= 1;
                    if(this.options['order']&&this._columns[j]['dataIndex']==='maptalks_order'){
                        cell.setContent(cell._row);
                    }
                    this._translateDy(cell,-size['height']);
                } else {
                    cell.remove();
                }
            }
        }
        //移除行数据
        this._table.splice(rowNum,1);
        //总行数减少
        this._rowNum-=1;
        //延展列调整线
        this._extendColLine();
    },

    /**
     * 删除列
     * @param {Number} colNum 列号
     */
    removeCol: function(colNum) {
        var firstRow = this._table[0];
        var removeCell = firstRow[colNum];
        var removeSize = removeCell.getSize();
        var startPoint = this.options['position'];
        var map = this._adjustLayer.getMap();
        for(var i=0,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
            for(var j=colNum,rowLength=row.length;j<rowLength;j++) {
                var cell = row[j];
                var width = 0;
                if(i==0&&j==colNum) {
                    this._removeAdjustLineForCol(cell);
                    //表格宽度缩短
                    this._width -= removeSize['width'];
                }
                if(j>colNum) {
                    this._translateDx(cell,-removeSize['width']);
                    if(i==0) {
                        var colLine = this._adjustCols[cell._col];
                        var size = cell.getSize();
                        var symbol = cell.getSymbol(),
                            dx = symbol['textDx'];
                        var upPoint = map.locate(startPoint,map.pixelToDistance(size['width']/2+dx,0),map.pixelToDistance(0,size['height']/2));
                        var downPoint = map.locate(upPoint,0,-map.pixelToDistance(0,this._height));
                        colLine.setCoordinates([upPoint,downPoint]);
                    }
                    cell._col-=1;
                } else {
                    cell.remove();
                }
            }
            //删除列数据
            this._table[i].splice(colNum,1);
        }
        this._colWidths.splice(colNum,1);
        this._adjustCols.splice(colNum,1);
        //移除列数据
        this._colNum-=1;
        //延展行调整线
        this._extendRowLine();
    },

    hide: function(){
        for(var i=0,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                row[j].hide();
            }
        }
        this._tableHandler.hide();
        //删除行交互线
        for(var i=0,len=this._adjustRows.length;i<len;i++) {
            var line = this._adjustRows[i];
            line.hide();
        }
        //删除列交互线
        for(var i=0,len=this._adjustCols.length;i<len;i++) {
            var line =this._adjustCols[i];
            line.hide();
        }
    },

    show: function(){
        for(var i=0,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                row[j].show();
            }
        }
        this._tableHandler.show();
        //删除行交互线
        for(var i=0,len=this._adjustRows.length;i<len;i++) {
            var line = this._adjustRows[i];
            line.show();
        }
        //删除列交互线
        for(var i=0,len=this._adjustCols.length;i<len;i++) {
            var line =this._adjustCols[i];
            line.show();
        }
    },

    remove: function(){
        for(var i=0,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                row[j].remove();
            }
        }
        this._tableHandler.remove();
        this._table = [];
        delete this._table;
        //删除行交互线
        for(var i=0,len=this._adjustRows.length;i<len;i++) {
            var line = this._adjustRows[i];
            line.remove();
        }
        this._adjustRows=[];
        delete this._adjustRows;
        //删除列交互线
        for(var i=0,len=this._adjustCols.length;i<len;i++) {
            var line =this._adjustCols[i];
            line.remove();
        }
        this._adjustCols=[];
        delete this._adjustCols;
        //抛出事件
        this.fire('remove',this);
    },

    _addToLayer: function(table, init) {
        var me = this;
        for(var i=0,len=table.length;i<len;i++) {
            var row = table[i];
            if(!row) return;
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
                    {'item': '在前面添加列', 'click': function() {
                        me.addCol(colNum, '空', false);
                    }},
                    {'item': '在后面添加列', 'click': function() {
                        me.addCol(colNum, '空', true);
                    }},
                    {'item': '左移', 'click': function() {
                        me.moveCol(colNum, 'left');
                    }},
                    {'item': '右移', 'click': function() {
                        me.moveCol(colNum, 'right');
                    }},
                    {'item': '设置列样式', 'click': function() {
                        me._currentCol = colNum;
                        me._currentRow = -1;
                        me._setStyleForTable();
                    }},
                    {'item': '删除列', 'click': function() {
                        me.removeCol(colNum);
                    }}
                ]
            };
        } else if(colNum==0) {
            var items = [];
            if(!this.options['dynamic']){
                items = items.concat([
                    {'item': '在上面添加行', 'click': function() {
                        me.addRow(rowNum, '空', false);
                    }},
                    {'item': '在下面添加行', 'click': function() {
                        me.addRow(rowNum, '空', true);
                    }}
                ]);
            }
            items = items.concat([
                    {'item': '上移', 'click': function() {
                        me.moveRow(rowNum, 'up');
                    }},
                    {'item': '下移', 'click': function() {
                        me.moveRow(rowNum, 'down');
                    }},
                    {'item': '设置行样式', 'click': function() {
                        me._currentRow = rowNum;
                        me._currentCol = -1;
                        me._setStyleForTable();
                    }},
                    {'item': '删除行', 'click': function() {
                        me.removeRow(rowNum);
                    }}
            ]);
            menuOptions = {
                'width': 100,
                'style': 'grey',
                'items' : items
            };
        }
        var coordinate = event['coordinate'];
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
        marker.on('dragging',this._dragTable,this);
        this._tableHandler = marker;
    },

    _setStyleForTable: function() {
        var styleEditor = new maptalks.TableStyle();
        styleEditor.addTo(this);
    },

    _hideAdjustLayer: function(event) {
        this._adjustLayer.hide();
    },

    _showAdjustLayer: function(event) {
        this._adjustLayer.show();
    },

    _dragTable: function(event) {
        var dragOffset = event['dragOffset'];
        for(var i=0,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
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
        for(var i=1,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
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
                if(this.options['order']&&this._columns[j]['dataIndex']==='maptalks_order'){
                    row[j].setContent(row[j]._row);
                }
                this._translateDy(row[j],this._cellHeight);
            }
        }
        return this;
    },

    _createCol: function(insertColNum, data) {
        var startCol = insertColNum;//调整起始列
        if(!data||data.length==0) data = '空';
        //将列插入table
        var cells = new Array();
        var insertColLength = 1;
        for(var i=0;i<this._rowNum;i++) {
            if(maptalks.Util.isArray(data)){
                insertColLength = data.length;
                var colCell = new Array();
                for(var j=0,len=data.length;j<len;j++) {
                    var item = data[j];
                    var cellOffset = this._getCellOffset(i,insertColNum+j);
                    var cellWidth = this._colWidths[insertColNum+j];
                    if(!cellWidth) cellWidth = this._cellWidth;
                    var size = new maptalks.Size(cellWidth, this._rowHeights[i]);
                    var cell  = this._createCell(item,cellOffset,size);
                    cell._row = i;
                    cell._col = insertColNum+j;
                    cell.on('dblclick',this._addEditEventToCell,this)
                        .on('contextmenu',this._addContextmenuToCell,this);
                    cell.addTo(this._layer);
                    colCell.push(cell);
                    if(i==0){
                        //添加列调整线
                        this._insertAdjustLineForNewCol(cell,insertColNum+j);
                    }
                }
                cells.push(colCell);
            } else {
                var cellOffset = this._getCellOffset(i,insertColNum);
                var cellWidth = this._colWidths[insertColNum];
                if(!cellWidth) cellWidth = this._cellWidth;
                var size = new maptalks.Size(cellWidth, this._rowHeights[i]);
                var cell = this._createCell(data,cellOffset,size);
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
                if(i==0){
                    //添加列调整线
                    this._insertAdjustLineForNewCol(cell, insertColNum);
                }
            }
        }
        for(var i=0,len=this._table.length;i<len;i++) {
            var dataLength = data.length;
            if(dataLength>0) {
                for(var j=0;j<dataLength;j++){
                    this._table[i].splice(insertColNum+j,0,cells[i]);
                }
            } else {
                this._table[i].splice(insertColNum,0,cells[i]);
            }
        }
        this._colNum+=insertColLength;
        //调整之后的列
        this._adjustDatasetForCol(startCol,insertColLength);
    },

    _adjustDatasetForCol: function(start,insertColLength) {
        var startPoint = this.options['position'];
        var map = this._adjustLayer.getMap();
        for(var i=0,len=this._table.length;i<len;i++) {
            var rowData = this._table[i];
            if(!rowData) return;
            for(var j=start+1,rowLength=rowData.length;j<rowLength;j++) {
                var cell = rowData[j];
                cell._col += insertColLength;
                this._translateDx(cell,this._cellWidth);
                //调整交互列
                if(i==0){
                    var colLine = this._adjustCols[j];
                    var size = cell.getSize();
                    var symbol = cell.getSymbol(),
                        dx = symbol['textDx'];
                    var upPoint = map.locate(startPoint,map.pixelToDistance(size['width']/2+dx,0),map.pixelToDistance(0,size['height']/2));
                    var downPoint = map.locate(upPoint,0,-map.pixelToDistance(0,this._height));
                    colLine.setCoordinates([upPoint,downPoint]);
                }
            }
        }
    },

    _createTable: function() {
        var dataset = new Array();
        for(var i=0;i<this._rowNum;i++) {
            if(i==0&&this.options['header']) {
                dataset.push(this._createHeader());
            } else {
                var item = this._data[i];
                if(this.options['header']) {
                    item = this._data[i-1];
                }
                dataset.push(this._createRow(i, item));
            }
        }
        return dataset;
    },

    _createHeader: function() {
        var headerRow = new Array();
        for(var i=0,len=this._columns.length;i<len;i++) {
            var cellOffset = this._getCellOffset(0, i);
            var col = this._columns[i];
            var text = col['header'];
            var size = new maptalks.Size(this._colWidths[i], this._rowHeights[0]);
            var cell = this._createCell(text,cellOffset,size);
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
            var text = '空';
            if(item&&item[dataIndex]) {
                text = item[dataIndex];
            }
            if(this.options['order']&&dataIndex==='maptalks_order'){
                text = index;
            }
            var cellOffset = this._getCellOffset(index, i);
            var rowHeight = this._rowHeights[index];
            if (!rowHeight) rowHeight = this._cellHeight;
            var size = new maptalks.Size(this._colWidths[i], rowHeight);
            var cell = this._createCell(text,cellOffset,size);
            cell._row = index;
            cell._col = i;
            cols[i] = cell;
            if(this.options['dynamic']&&this.options['order']&&dataIndex==='maptalks_order') {
                var rowData = this._data[index];
                if(this.options['header']) {
                    rowData = this._data[index-1];
                }
                var geometry = rowData[maptalks.Table.dataindex_geometry];
                var coordinate = geometry.getCenter();
                this._addNumberLabelToGeometry(coordinate, cell);
            }
        }
        return cols;
    },

    _getCellOffset: function(row, col) {
        var dx=0,dy=0;
        if(this._table) {
            for(var i=0;i<row;i++){
                dy+=this._rowHeights[i];
            }
            for(var i=0;i<col;i++){
                dx+=this._colWidths[i];
            }
            if(col==0){
                dx = (this._colWidths[0]-this._cellWidth)/2;
            }
        } else {
            dx=this._cellWidth*col;
            dy=this._cellHeight*row;
        }
        return  {'dx':dx,'dy':dy};
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

    _createCell: function(text, cellOffset, size) {
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

                   'textFaceName': maptalks.Util.getValueOrDefault(symbol['textFaceName'],'monospace'),
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
               'boxMinWidth': size['width'],//this._cellWidth,
               'boxMinHeight': size['height']//this._cellHeight
        };
        var coordinate = this.options['position'];
        var label = new maptalks.Label(text,coordinate,labelOptions);
        return label;
    },

    _refrestAdjustLayer: function(map) {
        if(this._adjustRows) {
            for(var i=0,len=this._adjustRows.length;i<len;i++) {
                var line = this._adjustRows[i];
                line.remove();
            }
        }
        if(this._adjustCols) {
            for(var i=0,len=this._adjustCols.length;i<len;i++) {
                var line = this._adjustCols[i];
                line.remove();
            }
        }
        this._createAdjustLayer(map);

    },

    _createAdjustLayer: function(map) {
        var adjustLayerId = 'table_adjustment_layer';
        this._adjustLayer = map.getLayer(adjustLayerId);
        if(!this._adjustLayer) {
            this._adjustLayer = new maptalks.VectorLayer(adjustLayerId);
            map.addLayer(this._adjustLayer);
            this._adjustLayer.bringToBack();
        }
        this._adjustRows = new Array();
        this._adjustCols = new Array();
        //add row adjust line
        if(this._table) {
            for(var i=0,len=this._table.length;i<len;i++) {
                var row = this._table[i];
                if(!row) return;
                var cell = row[0];
                var rowLine = this._createAdjustLineForRow(map,cell);
                this._adjustRows.push(rowLine);
            }
            this._adjustLayer.addGeometry(this._adjustRows);
            //add col adjust line
            var firstRow = this._table[0];
            for(var i=0;i<this._colNum;i++) {
                var cell = firstRow[i];
                var colLine = this._createAdjustLineForCol(map,cell);
                this._adjustCols.push(colLine);
            }
            this._adjustLayer.addGeometry(this._adjustCols);
        }
    },

    _createAdjustLineForRow: function(map,cell) {
        var startPoint = this.options['position'];
        var symbol = cell.getSymbol(),
            dx = symbol['textDx'],
            dy = symbol['textDy'],
            width = cell.options['boxMinWidth'],
            height = cell.options['boxMinHeight'];
        var leftPoint = map.locate(startPoint,
                        -map.pixelToDistance(width/2,0),
                        -map.pixelToDistance(0,height/2+dy));
        var rightPoint = map.locate(leftPoint,map.pixelToDistance(this._width,0),0);
        var line = new maptalks.LineString([leftPoint,rightPoint],{draggable:true, cursor:'s-resize'});
        var symbol = {
            'lineColor' : '#e2dfed',
            'lineWidth' : 3,
            'lineDasharray' : null,//线形
            'lineOpacity' : 0.8
        };
        line.setSymbol(symbol);
        this._addEventToRowLine(map,cell,line);
        return line;
    },

    _addEventToRowLine: function(map,cell,rowLine) {
        var me = this;
        rowLine.on('dragging',function(event){
            var dragOffset = event['dragOffset'];
            var dx = dragOffset.x,dy=dragOffset.y;
            var sign=-1;
            if(dy<0){
                sign=1;
            }
            var distance = map.computeDistance(new maptalks.Coordinate(0,0), new maptalks.Coordinate(0,dy));
            var pixel = map.distanceToPixel(0, distance);
            me._height +=pixel['height']*sign;
            var offset = new maptalks.Coordinate(-dx, 0);
            rowLine.translate(offset);
            me._resizeRow(cell, dragOffset);
            me._translateRowLine(cell, new maptalks.Coordinate(0,dy));
            //add dy to table width
            me._extendColLine();
        });
    },

    _translateRowLine: function(cell, dragOffset) {
        var rowNum = cell._row;
        for(var i=rowNum+1,len=this._adjustRows.length;i<len;i++) {
            var line = this._adjustRows[i];
            line.translate(dragOffset);
        }
    },

    _extendColLine: function() {
        var map = this._adjustLayer.getMap();
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
        var distance = this._map.computeDistance(new maptalks.Coordinate(0,0), new maptalks.Coordinate(0,dy));
        var pixel = this._map.distanceToPixel(0,distance);
        var height = pixel['height']*sign;
        for(var i=rowNum;i<this._rowNum;i++) {
            var row = this._table[i];
            for(var j=0;j<this._colNum;j++){
                var cell = row[j];
                var symbol = cell.getSymbol();
                if(i===rowNum) {
                    cell.options['boxMinHeight']+=height;
                    if(cell.options['boxMinHeight']<symbol['markerHeight']) {
                        symbol['markerHeight'] = cell.options['boxMinHeight'];
                    }
                    symbol['markerDy']+=height/2;
                    symbol['textDy']+=height/2;
                    this._rowHeights[rowNum] = cell.options['boxMinHeight'];
                } else {
                    symbol['markerDy']+=height;
                    symbol['textDy']+=height;
                }
                cell.setSymbol(symbol);
            }
        }
    },

    _createAdjustLineForCol: function(map,cell) {
        var startPoint = this.options['position'];
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
        this._addEventToColLine(map,line,cell);
        return line;
    },

    _addEventToColLine: function(map,colLine,cell) {
        var me=this;
        colLine.on('dragging',function(event){
            var symbol=cell.getSymbol();
            var cellDx=symbol['markerDx'];
            var cellSize=cell.getSize();
            var cellWidth=cellSize['width'];

            var startPoint=map.coordinateToContainerPoint(me.options['position']);
            var endPoint=event['containerPoint'];
            var pixel=endPoint.substract(startPoint);
            var width=pixel['x']-(cellDx+cellWidth/2);
            me._width+=width;
            me._resizeCol(cell,width);
            //add dy to table width
            me._extendRowLine();

            var dragOffset=event['dragOffset'];
            var offset=new maptalks.Coordinate(0,-dragOffset.y);
            colLine.translate(offset);
            me._translateColLine(cell,new maptalks.Coordinate(dragOffset.x,0));
        });
    },

    _resizeCol: function(cell,width) {
        var colNum = cell._col;
        for(var i=0,len=this._table.length;i<len;i++) {
            var row = this._table[i];
            if(!row) return;
            for(var j=colNum,rowLength=row.length;j<rowLength;j++) {
                var cell = row[j];
                var symbol = cell.getSymbol();
                if(j==colNum) {
                    cell.options['boxMinWidth']+=width;
                    symbol['markerWidth'] = cell.options['boxMinWidth'];
                    symbol['markerDx']+=width/2;
                    symbol['textDx']+=width/2;
                    this._colWidths[colNum] = cell.options['boxMinWidth'];
                } else {
                    symbol['markerDx']+=width;
                    symbol['textDx']+=width;
                }
                cell.setSymbol(symbol);
            }
        }
    },

    _translateColLine: function(cell, dragOffset) {
        var colNum = cell._col;
        for(var i=colNum+1,len=this._adjustCols.length;i<len;i++) {
            var line = this._adjustCols[i];
            line.translate(dragOffset);
        }
    },

    _extendRowLine: function() {
        var map = this._adjustLayer.getMap();
        for(var i=0,len=this._adjustRows.length;i<len;i++) {
            var line = this._adjustRows[i];
            var coordinates = line.getCoordinates();
            var leftPoint = coordinates[0];
            var rightPoint = map.locate(leftPoint,map.pixelToDistance(this._width,0),0);
            line.setCoordinates([leftPoint,rightPoint]);
        }
    },

    //TODO 临时方法,提供label的dx/dy调整,待geometry提供类似方法
    _translateDx: function(cell,width){
        var symbol = cell.getSymbol();
        symbol['markerDx'] += width;
        symbol['textDx'] += width;
        cell.setSymbol(symbol);
    },

    _translateDy: function(cell,height){
        var symbol = cell.getSymbol();
        symbol['markerDy'] += height;
        symbol['textDy'] += height;
        cell.setSymbol(symbol);
    }

});
