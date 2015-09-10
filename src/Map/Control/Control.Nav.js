Z['Control']['Nav'] = Z.Control.Nav = Z.Control.extend({

    /**
    * 异常信息定义
    */
    exceptionDefs: {
        'en-US':{
            'NEED_ID':'You must set id to Nav Control.',
            'DUPLICATE_ID':'This Control id:[%1] already exists.'
        },
        'zh-CN':{
            'NEED_ID':'您需要为Nav控件设置id。',
            'DUPLICATE_ID':'该控件id:[%1]已存在!'
        }
    },

    options:{
        'id': 'CONTROL_NAV',
        'position' : Z.Control['bottom_right']
    },

    buildOn: function (map) {
        this._map = map;
        this._navControlContainer = Z.DomUtil.createEl('div');
        this._panToLeftButton  = this._createButton('control_nav_button control_nav_left', this._panToLeft);
        this._panToUpButton  = this._createButton('control_nav_button control_nav_up', this._panToUp);
        this._panToRightButton  = this._createButton('control_nav_button control_nav_right', this._panToRight);
        this._panToDownButton  = this._createButton('control_nav_button control_nav_down', this._panToDown);
        this._navBar = Z.DomUtil.createElOn('div', '', this._navControlContainer);
        Z.DomUtil.addClass(this._navBar, 'control_nav_bar control_nav_bg');
        Z.DomUtil.on(this._navControlContainer, 'mouseup', this._stopPan, this);
        return this._navControlContainer;
    },

    _createButton: function (className, fn) {
        var buttonDiv = Z.DomUtil.createElOn('div', '', this._navControlContainer);
        Z.DomUtil.addClass(buttonDiv, className);
        Z.DomUtil.on(buttonDiv, 'mousedown mousemove click dblclick contextmenu', Z.DomUtil.stopPropagation)
                 .on(buttonDiv, 'mousedown', fn, this);
        return buttonDiv;
    },

    _panToLeft: function() {
        Z.DomUtil.setStyle(this._navBar, 'background-position:  -52px 0!important');
        this._startPan('left', 1);
    },

    _panToUp: function() {
        Z.DomUtil.setStyle(this._navBar, 'background-position: -104px 0!important');
        this._startPan('top', 1);
    },

    _panToRight: function() {
        Z.DomUtil.setStyle(this._navBar, 'background-position: -156px 0!important');
        this._startPan('left', -1);
    },

    _panToDown: function() {
        Z.DomUtil.setStyle(this._navBar, 'background-position: -208px 0!important');
        this._startPan('top', -1);
    },

/*    _stopPan: function() {
        if (this._panTimeout) {
            clearInterval(this._panTimeout);
        }
    },*/

    _startPan: function(direction, step) {
        var me = this;
        me._step = step;
        me._direction = direction;
        this._panExecutor = setInterval(function() {
            if(me._direction === "left") {
                me._map.panBy(new Z.Point(me._step,0));
            } else if (me._direction === "top") {
                me._map.panBy(new Z.Point(0,me._step));
            }
        },10);
    },

    _stopPan: function() {
        Z.DomUtil.setStyle(this._navBar, 'background-position:');
        clearInterval(this._panExecutor);
    }

});

Z.Map.mergeOptions({
    'navControl' : false,
    'navControlOptions' : {
        'id': 'MAP_CONTROL_NAV',
        'position' : Z.Control['bottom_right']
    }
});

Z.Map.addOnLoadHook(function () {
    if (this.options['navControl']) {
        var navControlOptions = this['options']['navControlOptions'];
        if(!navControlOptions['id']) {
            navControlOptions['id'] = 'MAP_CONTROL_NAV';
        }
        if(!navControlOptions['position']) {
            navControlOptions['position'] = Z.Control['bottom_right'];
        }
        this.navControl = new Z.Control.Nav(navControlOptions);
        this['addControl'](this.navControl);
    }
});
