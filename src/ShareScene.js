/**
 * Created by cocos on 16/1/6.
 */
var ShareLayer = cc.Layer.extend({
    colorLayer: null,

    ctor:function(){
        this._super();
        this.init();
    },

    init:function(){
        this.colorLayer = new cc.LayerColor();
        this.colorLayer.setColor(cc.color(100,100,100));
        this.colorLayer.setOpacity(100);
        this.colorLayer.retain();
        this.addChild(this.colorLayer);

        this.shareGame();

        var btnShare = cc.MenuItemImage.create(res.btn_normal_png,res.btn_press_png,this.shareGame,this);
        var shareLabel = cc.LabelTTF.create("再次分享", "Arial", 25);
        shareLabel.setPosition(cc.p(btnShare.getContentSize().width / 2, btnShare.getContentSize().height / 2));
        btnShare.addChild(shareLabel);

        var btnBack = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, this.backToMenu, this);
        var backLabel = cc.LabelTTF.create("返回菜单", "Arial", 25);
        backLabel.setPosition(cc.p( btnBack.getContentSize().width / 2, btnBack.getContentSize().height / 2));
        btnBack.addChild(backLabel);

        var menu = cc.Menu.create(btnShare,btnBack);
        menu.alignItemsHorizontallyWithPadding(10);
        menu.x = winSize.width / 2;
        menu.y = winSize.height / 2 - 300;
        this.addChild(menu);

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function (keyCode, event) {
                if (keyCode == cc.KEY.back) {
                    cc.log("return button clicked, keyCode = " + keyCode);

                    cc.director.popScene();
                }
            }
        }, this);
    },

    shareGame:function(){
        if (pluginManager.sharePlugin) {
            var info = {
                title: "分享desu",
                titleUrl: "http://tencent.cocosruntime.com/tencent/unittest/gameshare.html",
                site: "噫",
                siteUrl: "http://tencent.cocosruntime.com/tencent/unittest/gameshare.html",
                text: "天地玄黄宇宙洪荒",
                comment: "无",
                description: "从前有座山",
                imageTitle: "山上没有庙",
                imageUrl: "http://tencent.cocosruntime.com/tencent/unittest/icon.png"
            };
            cc.log("share info:" + info + ", " + info["site"]);
            pluginManager.share(info, function (ret, msg) {
                cc.log("share result, resultcode:" + ret + ", msg: " + msg);
                switch (ret) {
                    case ShareResultCode.kShareSuccess:
                        Utils.showToast("分享成功");
                        break;
                    case ShareResultCode.kShareFail:
                        Utils.showToast("分享失败");
                        break;
                    case ShareResultCode.kShareCancel:
                        Utils.showToast("分享取消");
                        break;
                    case ShareResultCode.kShareNetworkError:
                        Utils.showToast("分享网络错误");
                        break;
                    default:
                        Utils.showToast("未知返回码:" + ret);
                        break;
                }
            }.bind(this));
        }
    },

    backToMenu:function(){
        cc.director.popScene();
    },
});

var ShareScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new ShareLayer();
        this.addChild(layer);
    },
});