Z.Map.include({
    _rendAnimationFrame:function(frame) {
        if (!frame.state['playing']) {
            return;
        }
        if (frame.point) {
            this._setPrjCenterAndMove(frame.point);
            this._fireEvent('moving');
        }
    }
});
