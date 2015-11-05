Z.Map.include({
    _rendAnimationFrame:function(frame) {
        if (!frame.playing) {
            return;
        }
        var render = this._getRender();
        if (frame.point) {
            this._setPrjCenterAndMove(frame.point);
            render.rend();
        }
        var frameRes = frame.res;
        if (!Z.Util.isNil(frameRes)) {
            var res = this._tileConfig['resolutions'][this._zoomLevel];
            var ratio = frameRes/res;
            render.amplify(ratio);
        }
    }
});
