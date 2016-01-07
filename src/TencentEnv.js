/**
 * Created by cocos on 16/1/4.
 */
var TencentUtils = cc.Class.extend({
    toast: null,
    toastText: null,
    toastListener: null,
    ctor:function(){
        this.initToastUI();
    },

    initToastUI:function(){
        this.toast = new cc.LayerColor();
        this.toast.setColor(cc.color(100,100,100));
        this.toast.setOpacity(100);
        this.toast.retain();

        this.toastText = cc.LabelTTF.create("", "Arial", 20);
        this.toastText.setPosition(cc.visibleRect.center);
        this.toast.addChild(this.toastText);
    },

    showLoading:function(msg){
        this._addToastToScene();
        this.toastText.setString(msg);
        this.toggleToastTouch(true);
    },

    _addToastToScene:function(){
        cc.director.getRunningScene().addChild(this.toast, 1000000);
        cc.log("add toast to scene");
    },

    hideLoading:function(){
        this.toast.removeFromParent();
        this.toggleToastTouch(false);
    },

    toggleToastTouch:function(status){
        var self = this;
        if(status){
            if(this.toastListener == null){
                cc.log("addlistener");
                self.toastListener = cc.EventListener.create({
                        event: cc.EventListener.TOUCH_ONE_BY_ONE,
                        swallowTouches: true,
                        onTouchBegan: function(touch,event){
                            var action = cc.callFunc(function(){
                                },this);
                            self.toast.runAction();
                            return true;
                        }
                });

                cc.eventManager.addListener(self.toastListener, self.toast);
            }
        }else{
            if(self.toastListener){
                cc.eventManager.removeListener(self.toastListener);
                self.toastListener = null;
            }
        }
    },
});

if(cc.runtime && cc.runtime.config && cc.runtime.config["channel_id"] == "100115"){
    var _tencentUtils = null;
    var tencentUtils = function(){
        if(_tencentUtils == null){
            _tencentUtils = new TencentUtils();
        }
        return _tencentUtils;
    }();
}