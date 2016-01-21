/**
 * Created by cocos on 15/12/28.
 */
var musicStatus;

var effectStatus;

var winSize;

var HomeMenuLayer;
HomeMenuLayer = cc.Layer.extend({
    keyBoardListener: null,
    buttonLayer: null,
    buttonLayerListener: null,

    ctor: function () {
        this._super();
        this.init();
    },

    init: function () {
        winSize = cc.director.getWinSize();

        cc.spriteFrameCache.addSpriteFrames(res_platform.texture_plist, res_platform.texture_res);
        musicStatus = cc.sys.localStorage.getItem(MUSIC_KEY);
        effectStatus = cc.sys.localStorage.getItem(EFFECT_KEY);

        var bg = new cc.TMXTiledMap(res.red_bg_tmx);
        this.addChild(bg);

        var top = new cc.Sprite("#home-top.png");
        top.x = winSize.width / 2;
        top.y = winSize.height - top.getContentSize().height / 2;
        this.addChild(top);

        var end = new cc.Sprite("#home-end.png");
        end.x = winSize.width / 2;
        end.y = end.getContentSize().height / 2;
        this.addChild(end);

        var startSpriteNormal = new cc.Sprite("#button.start.png");
        var startSpriteSelected = new cc.Sprite("#button.start-on.png");
        var startMenuItem = new cc.MenuItemSprite(startSpriteNormal, startSpriteSelected, this.menuItemCallback, this);
        startMenuItem.setTag(HomeMenuActionTypes.MenuItemStart);

        var settingSpriteNormal = new cc.Sprite("#button.setting.png");
        var settingSpriteSelected = new cc.Sprite("#button.setting-on.png");
        var settingMenuItem = new cc.MenuItemSprite(settingSpriteNormal, settingSpriteSelected, this.menuItemCallback, this);
        settingMenuItem.setTag(HomeMenuActionTypes.MenuItemSetting);

        var helpSpriteNormal = new cc.Sprite("#button.help.png");
        var helpSpriteSelected = new cc.Sprite("#button.help-on.png");
        var helpMenuItem = new cc.MenuItemSprite(helpSpriteNormal, helpSpriteSelected, this.menuItemCallback, this);
        helpMenuItem.setTag(HomeMenuActionTypes.MenuItemHelp);

        var mu = new cc.Menu(startMenuItem, settingMenuItem, helpMenuItem);
        mu.x = winSize.width / 2;
        mu.y = winSize.height / 2;
        mu.alignItemsVerticallyWithPadding(10);

        this.addChild(mu);

        var btnShare = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, this.shareGame, this);
        var shareTips = cc.LabelTTF.create("分享", "Arial", 25);
        shareTips.setPosition(cc.p(btnShare.getContentSize().width / 2, btnShare.getContentSize().height / 2));
        btnShare.addChild(shareTips);

        var btnFriends = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, this.friendsList, this);
        var friendsTips = cc.LabelTTF.create("朋友列表", "Arial", 25);
        friendsTips.setPosition(cc.p(btnFriends.getContentSize().width / 2, btnFriends.getContentSize().height / 2));
        btnFriends.addChild(friendsTips);

        var btnDesktop = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, this.sendDesktop, this);
        var desktopTips = cc.LabelTTF.create("快捷方式", "Arial", 25);
        desktopTips.setPosition(cc.p(btnDesktop.getContentSize().width / 2, btnDesktop.getContentSize().height / 2));
        btnDesktop.addChild(desktopTips);

        var buttomMenu = cc.Menu.create(btnShare,btnFriends,btnDesktop);
        buttomMenu.x = winSize.width / 2;
        buttomMenu.y = 200;
        buttomMenu.alignItemsVerticallyWithPadding(10);
        this.addChild(buttomMenu);

        var btnUserInfo = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, this.printUserInfo, this);
        var userInfoTips = cc.LabelTTF.create("后台打印登陆信息", "Arial", 25);
        userInfoTips.setPosition(cc.p(btnUserInfo.getContentSize().width / 2, btnUserInfo.getContentSize().height * 0.4));
        btnUserInfo.addChild(userInfoTips);
        var userMenu = cc.Menu.create(btnUserInfo);
        userMenu.x = winSize.width / 2;
        userMenu.y =  winSize.height - btnUserInfo.getContentSize().height / 2;
        this.addChild(userMenu);

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function (keyCode, event) {
                if (keyCode == cc.KEY.back) {
                    cc.log("return button clicked, keyCode = " + keyCode);

                    agent.unloadAllPlugins();

                    cc.log("unload all anySDK plugins finish~~~~~~~~~~");

                    cc.director.end();
                }
            }
        }, this);

        return true;
    },

    printUserInfo:function(){
        pluginManager.getUserInfo(function(ret, msg, info){

            cc.log("getUserInfo info : " + info);



            var str111 = JSON.parse(info);
            cc.log("URL=======" + str111["avatarUrl"]);

            if(loginTypes){
                //从token那里获取的用户信息来获取头像
                for(var i = 0; i < loginTypes.length; i++){
                    var loginType = loginTypes[i];

                    if(loginType.loginType == "qq"){
                        var accInfo = loginType.accInfo;

                        if (accInfo) {
                            var avatarUrl = accInfo.avatarUrl;
                            cc.loader.loadImg(avatarUrl, {width: 100, height: 100}, function (error, img) {
                                if (!error) {
                                    cc.log("load image success");
                                    cc.log("imgPath ===== " + avatarUrl);
                                } else {
                                    cc.log("load image fail please check~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                                }
                            });
                        };
                    }else if(loginType.loginType == "wx"){
                        var accInfo = loginType.accInfo;

                        if (accInfo) {
                            var avatarUrl = accInfo.avatarUrl;
                            cc.loader.loadImg(avatarUrl, {width: 100, height: 100}, function (error, img) {
                                if (!error) {
                                    cc.log("load image success");
                                    cc.log("imgPath ===== " + avatarUrl);
                                } else {
                                    cc.log("load image fail please check~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                                }
                            });
                        }
                    };
                };
            };



        });
    },

    menuItemCallback: function (sender) {
        if (effectStatus == BOOL.YES) {
            cc.audioEngine.playEffect(res_platform.effectBlip,false);
        }

        var tsc = null;

        switch (sender.tag) {
            case HomeMenuActionTypes.MenuItemStart:
                cc.log("start");

                tsc = new cc.TransitionFade(1.0, new GamePlayScene());

                //var user_plugin = agent.getUserPlugin();
                //if(user_plugin){
                //    user_plugin.setActionListener(this.onUserLogin, this);
                //}else{
                //    cc.log("cannot get userplugin")
                //}

                break;

            case HomeMenuActionTypes.MenuItemSetting:
                cc.log("setting-实际上是支付啦");

                tsc = new cc.TransitionFade(1.0, new PayScene());

                break;

            case HomeMenuActionTypes.MenuItemHelp:
                cc.log("help------实际上是登陆");

                //转入登录逻辑
                if (cc.runtime && cc.runtime.config) {
                    if (cc.runtime.config["channel_id"] == "100115") {
                        // QQ浏览器逻辑
                        var layer = new TencentLayer();
                        cc.director.getRunningScene().addChild(layer);

                    }else if (cc.runtime.config["channel_id"] == "100117") {
                        // 百度浏览器逻辑
                        g_env = CocosRuntimeEnv.BAIDU;

                    } else if (cc.runtime.config["channel_id"] == "100206") {
                        // QQ空间玩吧逻辑
                        g_env = CocosRuntimeEnv.WANBA;

                    } else if (cc.runtime.config["channel_id"] == "100125" ) {
                        // 猎豹浏览器逻辑
                        g_env = CocosRuntimeEnv.LIEBAO;

                    } else {
                        // 游戏大厅、萝卜玩等 AnySDK 客户端+服务端模式支持的渠道
                        g_env = cc.runtime.config["channel_id"];
                    }

                    cc.log("Channel id =======" + g_env);
                }

                break;
        }

        if (tsc) {
            cc.director.pushScene(tsc);
        }
    },

    shareToWeChat:function(){
        var info = {
            title : "哎呀妈呀",
            titleUrl : "http://sharesdk.cn/",
            site : "诶嘿嘿",
            siteUrl: "http://sharesdk.cn/",
            imagePath : "",
            url : "http://sharesdk.cn/",
            imageUrl : "http://www.baidu.com/img/bdlogo.png?tn=63090008_1_hao_pg",
            text : "AnySDK SharePlugin test",
            comment : "啥都没哦"

        };

        agent.getSharePlugin().share(info);

        agent.getSharePlugin().setResultListener(this.onShareResult,this);
    },

    onShareResult:function(code,msg){
        cc.log("share result, resultcode:"+code+", msg: "+msg);
        switch ( code ) {
            case anysdk.ShareResultCode.kShareSuccess:
                //do something
                var tsc = null;
                tsc = new cc.TransitionFade(1.0, new GamePlayScene());
                if(tsc){
                    cc.director.pushScene(tsc);
                };

                break;
            case anysdk.ShareResultCode.kShareFail:
                //do something
                break;
            case anysdk.ShareResultCode.kShareCancel:
                //do something
                break;
            case anysdk.ShareResultCode.kShareNetworkError:
                //do something
                break;
        }
    },

    shareGame:function(){
        cc.log("分享");

        var trans = new cc.TransitionFade(1,new ShareScene());
        cc.director.pushScene(trans);
    },

    friendsList:function(){
        cc.log("好友列表");

        var trans = new cc.TransitionFade(1, new FriendsScene());
        cc.director.pushScene(trans);
    },

    sendDesktop:function(){
        cc.log("发送桌面快捷方式");

        var param = {
            "ext": ""
        };
        pluginManager.x5_sendToDesktop(param, function (plugin, code, msg) {
            if (code === UserActionResultCode.kSendToDesktopSuccess) {
                Utils.showToast("发送桌面快捷方式成功");
            } else if (code === UserActionResultCode.kSendToDesktopFail) {
                Utils.showToast("发送桌面快捷方式失败");
            }
        }.bind(this));
    },

});

var HomeScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new HomeMenuLayer();
        this.addChild(layer);
    }
});



var getNativeKeyName = function (keyCode) {
    var allCode = Object.getOwnPropertyNames(cc.KEY);
    var keyName = "";
    for (var x in allCode) {
        if (cc.KEY[allCode[x]] == keyCode) {
            keyName = allCode[x];
            break;
        }
    }
    return keyName;
};

var __Utils = cc.Class.extend({
    showToast:function(msg){
        this.removeLoginTip(0);
        var winSize = cc.director.getWinSize();
        var scheduler = cc.director.getScheduler();
        var loginSuccessLabel = cc.LabelTTF.create(msg,"Arial",38);
        loginSuccessLabel.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
        scheduler.scheduleCallbackForTarget(this, this.removeLoginTip, 2, 0, 0, false);
        cc.director.getRunningScene().addChild(loginSuccessLabel,99999,109);
        cc.log("showToast:" + msg);
    },

    removeLoginTip:function(dt){
        var scheduler = cc.director.getScheduler();
        scheduler.unscheduleAllCallbacksForTarget(this);
        cc.director.getRunningScene().removeChildByTag(109);
    },
});

var Utils = null;
if(Utils == null){
    Utils = new __Utils();
}
