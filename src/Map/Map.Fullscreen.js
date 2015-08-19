Z.Map.include({
    /**
     * 全屏地图
     * @expose
     */
    openFullscreen: function() {
        this._openFullscreen(this.containerDOM);
        var me = this;
        this.onFullscreenStart();
        if (this.fullscreen_timeout) {
            clearTimeout(this.fullscreen_timeout);
        }
        this.fullscreen_timeout = setTimeout(function() {
            me.onFullscreenEnd();
        }, 100);
    },

    /**
     * 全屏地图
     * @expose
     */
    exitFullscreen: function() {
        this._exitFullscreen(this.containerDOM);
    },

    onFullscreenStart: function() {
        this.fireEvent('fullscreenStart',{'target':this});
    },

    onFullscreenEnd: function() {
        this.fireEvent('fullscreenEnd',{'target':this});
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