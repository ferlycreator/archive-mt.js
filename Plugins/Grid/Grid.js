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
        this._rowNum = this._data.length;
        this._colNum = this._columns.length;
        this._width = maptalks.Util.getValueOrDefault(this.options['width'],100);
        this._height = maptalks.Util.getValueOrDefault(this.options['height'],100);
        this._cellWidth = this._width/this._colNum;
        this._cellHeight = this._height/(this._rowNum+1);
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

    _addToLayer: function(grid) {
        var me = this;
        for(var i=0,len=grid.length;i<len;i++) {
            var row = grid[i];
            for(var j=0,rowNum=row.length;j<rowNum;j++) {
                var cell = row[j];
                cell._row = i;
                cell._col = j;
                cell.addTo(this._layer);
                cell.on('click',this._addEventToCell,this);
            }
        }
    },

    _addEventToCell: function(event) {
        var cell = event.target;
        var rowNum = cell._row;
        var colNum = cell._col;
        var data = [
               {name:'JS', birth:'1990-1-1', age: 35, marry: true},
               {name:'PT', birth:'1985-5-1', age: 65, marry: true}
        ];
        this.addRow(rowNum, data, true);
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
        if(maptalks.Util.isArray(data)){
            for(var i=0,len=data.length;i<len;i++) {
                var item = data[i];
                newDataset[i] = this._createOneRow(insertRowNum++, item);
            }
        } else {
            newDataset.push(this._createOneRow(insertRowNum++, data));
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
        return this;
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

    addCol: function() {

    },

    _createGrid: function() {
        var dataset = new Array();
        dataset[0] = this._createHeader();
        for(var i=0;i<this._rowNum;i++) {
            var item = this._data[i];
            dataset[i+1] = this._createOneRow(i, item);
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
            headerRow.push(cell);
        }
        return headerRow;
    },

    _createOneRow: function(index, item) {
        var position = this.options['position'];
        var cols = new Array();
        for(var i=0;i<this._colNum;i++) {
            var col = this._columns[i];
            var dataIndex = col['dataIndex'];
            var dataType = col['type'];
            var cellPosition = this._getCellPosition(position,index+1, i);
            var text = item[dataIndex];
            cols[i] = this._createCell(cellPosition, text);
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
                var column = {
                    header: key,
                    dataIndex: key,
                    type: type
                };
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


