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
        'editable' : true
     }
     * @returns {maptalks.Table}
     */
    initialize: function(options) {
        this.setOptions(options);
        this._data = this.options['data'];
        if(!this._data&&this._data.length==0)  {throw new Error(this.exceptions['NEED_DATA']);}
        this._columns = this._getColumns();
        this._rowNum = this._data.length+1;//包含表头
        this._colNum = this._columns.length;
        this._width = maptalks.Util.getValueOrDefault(this.options['width'],100);
        this._height = maptalks.Util.getValueOrDefault(this.options['height'],100);
        this._cellWidth = this._width/this._colNum;
        this._cellHeight = this._height/(this._rowNum);
        return this;
    },

    /**
     * 将grid添加到对象上
     * @param {maptalks.Layer} layer
     */
    addTo: function (layer) {
        if(!layer) {return;}
        this._layer = layer;
        this._map = this._layer.getMap();
        this._grid = this._createGrid();
        this._addToLayer(this._grid);
        return this;
    },

    /**
     * 设置属性
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
        var insertRowNum = rowNum;
        if(!below) {
            insertRowNum = rowNum-1;
        }
        //构造新加入的行
        var newDataset = new Array();
        if(!data||data.length==0) {//添加空行
            newDataset.push(this._createRow(insertRowNum++, data));
        } else {
            if(maptalks.Util.isArray(data)){
                for(var i=0,len=data.length;i<len;i++) {
                    var item = data[i];
                    newDataset[i] = this._createRow(insertRowNum++, item);
                }
            } else {
                newDataset.push(this._createRow(insertRowNum++, data));
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
                    var position = cell.getPosition();
                    position = this._map.locate(position, 0, this._cellHeight);
                    cell._row -= 1;
                    cell.setPosition(position);
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
                    var position = cell.getPosition();
                    position = this._map.locate(position, -this._cellWidth, 0);
                    cell._col -= 1;
                    cell.setPosition(position);
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

    _addToLayer: function(grid) {
        var me = this;
        for(var i=0,len=grid.length;i<len;i++) {
            var row = grid[i];
            for(var j=0,rowNum=row.length;j<rowNum;j++) {
                var cell = row[j];
                cell._row = i;
                cell._col = j;
                cell.addTo(this._layer);
                cell.on('click',this._addEventToCell,this)
                    .on('dblclick',this._addEditEventToCell,this);
                //添加拖动焦点
                if(i==0&&j==0) {
                    this._addDragHandler(cell);
                }
            }
        }
    },

    _addDragHandler: function(cell) {
        var position = cell.getPosition();
        var height = this._cellHeight-8;
        var icon = {
            'markerType': 'ellipse',
            'markerFillOpacity': 0.6,
            'markerLineColor': '#4e98dd',
            'markerLineWidth': 1,
            'markerLineOpacity': 1,
            'markerWidth': height,
            'markerHeight': height,
            'markerFill': '#ffffff',
        };
        var center = this._map.locate(position, -this._cellHeight/2, -this._cellHeight/2);
        var marker = new maptalks.Marker(center,{draggable:true});
        marker.setSymbol(icon);
        this._layer.addGeometry(marker);
        marker.on('dragging',this._dragGrid,this);
    },

    _dragGrid: function(event) {
        console.log(event);
        var dragOffset = event['dragOffset'];
        for(var i=0,len=this._grid.length;i<len;i++) {
            var row = this._grid[i];
            for(var j=0,rowLength=row.length;j<rowLength;j++) {
                var cell = row[j];
                cell._box.translate(dragOffset);
                cell._textMarker.translate(dragOffset);
            }
        }
    },

    _addEventToCell: function(event) {
        var cell = event.target;
        var rowNum = cell._row;
        var colNum = cell._col;
        var data = [1,2];
//        this.addCol(colNum, data, true);
//        this.removeCol(colNum);
    },

    _addEditEventToCell: function(event) {
        var cell = event.target;
        cell.startEdit();
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
                var position = row[j].getPosition();
                position = this._map.locate(position, 0, -this._cellHeight*insertRowLength);
                row[j]._row += insertRowLength;
                row[j].setPosition(position);
            }
        }
        return this;
    },

    _createCol: function(insertColNum, data) {
        var startCol = insertColNum;//调整起始列
        if(!data||data.length==0) data = '';
        //将列插入grid
        var position = this.options['position'];
        var cells = new Array();
        var insertColLength = 1;
        for(var i=0;i<this._rowNum;i++) {
            if(maptalks.Util.isArray(data)){
                insertColLength = data.length;
                var colCell = new Array();
                for(var j=0,len=data.length;j<len;j++) {
                    var item = data[j];
                    var cellPosition = this._getCellPosition(position,i,insertColNum+j);
                    var cell  = this._createCell(cellPosition, item);
                    cell._row = i;
                    cell._col = insertColNum+j;
                    cell.addTo(this._layer);
                    colCell.push(cell);
                }
                cells.push(colCell);
            } else {
                var cellPosition = this._getCellPosition(position,i,insertColNum);
                var cell  = this._createCell(cellPosition, data);
                cell._row = i;
                cell._col = insertColNum;
                cell.addTo(this._layer);
                cells.push(cell);
            }
        }
        //将新增的列加入grid
        for(var i=0,len=this._grid.length;i<len;i++) {
            this._adjustDatasetForCol(this._grid[i],startCol,insertColLength);
            for(var j=0,dataLen=data.length;j<dataLen;j++) {
                this._grid[i].splice(insertColNum+j, 0, cells[j]);
            }
        }
        this._colNum+=insertColLength;
    },

    _adjustDatasetForCol: function(rowData, start, insertColLength) {
        for(var i=start,len=rowData.length;i<len;i++) {
            var cell = rowData[i];
            var position = cell.getPosition();
            position = this._map.locate(position,this._cellWidth*insertColLength,0);
            cell._col += insertColLength;
            cell.setPosition(position);
        }
    },

    _createGrid: function() {
        var dataset = new Array();
        dataset[0] = this._createHeader();
        for(var i=0;i<this._rowNum-1;i++) {
            var item = this._data[i];
            dataset[i+1] = this._createRow(i, item);
        }
        return dataset;
    },

    _createHeader: function() {
        var headerRow = new Array();
        var position = this.options['position'];
        for(var i=0,len=this._columns.length;i<len;i++) {
            var cellPosition = this._getCellPosition(position, 0, i);
            var col = this._columns[i];
            var text = col['header'];
            var cell = this._createCell(cellPosition, text);
            cell._row = 0;
            cell._col = i;
            headerRow.push(cell);
        }
        return headerRow;
    },

    _createRow: function(index, item) {
        var position = this.options['position'];
        var cols = new Array();
        for(var i=0;i<this._colNum;i++) {
            var col = this._columns[i];
            var dataIndex = col['dataIndex'];
            var dataType = col['type'];
            var cellPosition = this._getCellPosition(position,index+1, i);
            var text = '';
            if(item) {
                text = item[dataIndex];
            }
            var cell = this._createCell(cellPosition, text);
            cell._row = index;
            cell._col = i;
            cols[i] = cell;
        }
        return cols;
    },

    _getCellPosition: function(position, row, col) {
        return this._map.locate(position, col*this._cellWidth, -row*this._cellHeight);
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

    _createCell: function(position, text) {
        var symbol = this.options.symbol;
        symbol['textWrapWidth'] = this._cellWidth;
        //设置label属性
        var labelOptions = {
            'target' : position,
            'symbol': symbol,
            'draggable': this.options['draggable'],
            'content': text,
            'horizontalAlignment': 'right',
            'verticalAlignment': 'bottom',
            'textLineSpacing': 8,
            'dx': 0,
            'dy': 0
        };
        var label = new maptalks.Label(labelOptions);
        return label;
    }
});


