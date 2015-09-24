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
        this._fireEvent('fullscreenStart');
    },

    _onFullscreenEnd: function() {
        this._fireEvent('fullscreenEnd');
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
        } else {
            var features = 'fullscreen=1,status=no,resizable=yes,top=0,left=0,scrollbars=no,'+
                'titlebar=no,menubar=no,location=no,toolbar=no,z-look=yes,'+
                'width='+(screen.availWidth-8)+',height='+(screen.availHeight-45);
            var newWin = window.open(location.href,'_blank',features);
            if(newWin != null){
                window.opener = null;
                //关闭父窗口
                window.close();
            }
        }
     },

     _exitFullscreen: function() {
       if(document.exitFullscreen) {
         document.exitFullscreen();
       } else if(document.mozCancelFullScreen) {
         document.mozCancelFullScreen();
       } else if(document.webkitExitFullscreen) {
         document.webkitExitFullscreen();
       } else {
            var features = 'fullscreen=no,status=yes,resizable=yes,scrollbars=no,'+
                'titlebar=no,menubar=yes,location=yes,toolbar=yes,z-look=yes';
            var newWin = window.open(location.href,'_blank',features);
            if(newWin != null){
                window.opener = null;
                //关闭父窗口
                window.close();
            }
        }
     }
});