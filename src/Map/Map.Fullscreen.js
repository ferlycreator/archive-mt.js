Z.Map.include({
    /**
     * 全屏地图
     * @member maptalks.Map
     * @expose
     */
    openFullscreen: function() {
        this._openFullscreen(this._containerDOM);
        var me = this;
        this._onFullscreenStart();
        if (this.fullscreen_timeout) {
            clearTimeout(this.fullscreen_timeout);
        }
        this.fullscreen_timeout = setTimeout(function() {
            me._onFullscreenEnd();
        }, 100);
    },

    /**
     * 退出全屏地图
     * @member maptalks.Map
     * @expose
     */
    exitFullscreen: function() {
        this._exitFullscreen(this._containerDOM);
    },

    _onFullscreenStart: function() {
        this._fireEvent('fullscreenStart',{'target':this});
    },

    _onFullscreenEnd: function() {
        this._fireEvent('fullscreenEnd',{'target':this});
    },

    _openFullscreen: function(dom) {
        if(dom.requestFullscreen) {
            dom.requestFullscreen();
        } else if(dom.mozRequestFullScreen) {
            dom.mozRequestFullScreen();
        } else if(dom.webkitRequestFullscreen) {
            dom.webkitRequestFullscreen();
        } else if(dom.msRequestFullscreen) {
            dom.msRequestFullscreen();
        }
     },

     _exitFullscreen: function() {
       if(document.exitFullscreen) {
         document.exitFullscreen();
       } else if(document.mozCancelFullScreen) {
         document.mozCancelFullScreen();
       } else if(document.webkitExitFullscreen) {
         document.webkitExitFullscreen();
       }
     }
});