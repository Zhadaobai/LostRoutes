/**
 * Created by cocos on 15/12/28.
 */
var musicStatus;

var effectStatus;

var winSize;

var agent = null;

var HomeMenuLayer;
HomeMenuLayer = cc.Layer.extend({
    keyBoardListener: null,
    buttonLayer: null,
    buttonLayerListener: null,
    //agent: null,

    ctor: function () {
        this._super();
        this.init();
    },

    init: function () {
        winSize = cc.director.getWinSize();

        ///////////////////////////////////////////////////////////////
        //AnySDK
        var appKey = "839576F1-1FC9-1C67-C687-C85A3FE71BE5";
        var appSecret = "a2ff8473c71a9bbaa9085279ebc62869";
        var privateKey = "3AF5441990AF5C2DF9F50122B01D2712";
        //var oauthLoginServer = "http://oauth.anysdk.com/api/OauthLoginDemo/Login.php";
        //var oauthLoginServer = "http://callback-play.cocos.com/api/User/LoginOauth/";
        var oauthLoginServer = "http://127.0.0.1:8888";
        agent = anysdk.agentManager;

        agent.init(appKey, appSecret, privateKey, oauthLoginServer);

        agent.loadAllPlugins(function (code, msg) {
            if (code == 0) {
                cc.log("yeah");

                var user_plugin = agent.getUserPlugin();    //用户系统
                var iap_plugins = agent.getIAPPlugin();    //支付系统
                var share_plugin = agent.getSharePlugin();    //分享系统
                var ads_plugin = agent.getAdsPlugin();    //广告系统
                var social_plugin = agent.getSocialPlugin();    //社交系统
                var push_plugin = agent.getPushPlugin();    //推送系统
                var analytics_plugin = agent.getAnalyticsPlugin();    //统计系统
            }
        },this);

        ///////////////////////////////////////////////////////////////

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
            cc.audioEngine.playEffect(res_platform.effectBlip);
        }

        var tsc = null;

        switch (sender.tag) {
            case HomeMenuActionTypes.MenuItemStart:
                cc.log("start");

                //tsc = new cc.TransitionFade(1.0, new GamePlayScene());

                var user_plugin = agent.getUserPlugin();
                if(user_plugin){
                    user_plugin.setActionListener(this.onUserLogin, this);
                }else{
                    cc.log("cannot get userplugin")
                }

                break;

            case HomeMenuActionTypes.MenuItemSetting:
                cc.log("setting-实际上是支付啦");

                tsc = new cc.TransitionFade(1.0, new PayScene());

                break;

            case HomeMenuActionTypes.MenuItemHelp:
                cc.log("help");

                this.buttonLayer = new cc.LayerColor();
                this.buttonLayer.setColor(cc.color(100,100,100));
                this.buttonLayer.setOpacity(100);

                this.buttonLayerListener = cc.EventListener.create({
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: true,
                    onTouchBegan:function(touch,event){
                        cc.log("[[[[[救命啊我被摸了]]]]]");
                        return true;
                    }
                });
                cc.eventManager.addListener(this.buttonLayerListener, this.buttonLayer);

                this.addChild(this.buttonLayer);

                this.setLoginInfo();

                break;
        }

        if (tsc) {
            cc.director.pushScene(tsc);
        }
    },

    onUserLogin:function(plugin, code, msg){
        cc.log("on user result action.");
        cc.log("msg:" + msg);
        cc.log("code:" + code);

        if (code === UserActionResultCode.kInitSuccess) {
            Utils.showToast("登录初始化成功");

            var user_plugin = agent.getUserPlugin();
            user_plugin.login();

        } else if (code === UserActionResultCode.kInitFail) {
            Utils.showToast("登录初始化失败");
        } else if (code === UserActionResultCode.kLoginSuccess) {
            Utils.showToast("登录成功");

            var trans = new cc.TransitionFade(1, new HomeScene());
            cc.director.pushScene(trans);

        } else if (code === UserActionResultCode.kLoginFail) {
            Utils.showToast("登录失败");
        } else if (code === UserActionResultCode.kLoginCancel) {
            Utils.showToast("登录被取消");
        } else if (code === UserActionResultCode.kLogoutSuccess) {
            Utils.showToast("退出成功");
        } else if (code === UserActionResultCode.kLogoutFail) {
            Utils.showToast("退出失败");
        } else {
            Utils.showToast("未知返回码:" + code);
        }
    },

    createLoginButton: function () {
        var layer = new cc.Layer();

        var allTypes = null;

        if (loginTypes != null) {
            allTypes = loginTypes;
        } else {
            allTypes = DEFAULT_LOGIN_TYPES;
        }

        var menu = cc.Menu.create();
        menu.setAnchorPoint(cc.p(0, 0));
        menu.setPosition(cc.p(0, 0));

        for (var i = 0; i < allTypes.length; i++) {
            var loginType = allTypes[i];

            if (loginType.loginType === "qq") {
                var accInfo = loginType.accInfo;

                var text = "QQ登录";
                if (accInfo) {
                    text = "QQ一键登录";
                }

                var QQLoginBtn = this.createButton(text, this.QQLogin);
                QQLoginBtn.setPosition(cc.p(QQLoginBtn.getContentSize().width / 2 + 30, 80));
                menu.addChild(QQLoginBtn);

                if (accInfo) {
                    var avatarUrl = accInfo.avatarUrl;
                    cc.loader.loadImg(avatarUrl, {width: 100, height: 100}, function (error, img) {
                        if (!error) {
                            cc.log("load image success");
                            var spr = cc.Sprite.createWithTexture(img);
                            spr.setPosition(cc.p(QQLoginBtn.getPosition().x, QQLoginBtn.getPosition().y + spr.getContentSize().height));
                            layer.addChild(spr);
                        } else {
                            cc.log("load image fail please check~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        }
                    });
                }
            }

            if (loginType.loginType === "wx") {
                var accInfo = loginType.accInfo;

                var text = "微信登录";
                if (accInfo) {
                    text = "微信一键登录";
                }

                var WetChatLoginBtn = this.createButton(text, this.weChatLogin);
                WetChatLoginBtn.setPosition(cc.p(winSize.width - WetChatLoginBtn.getContentSize().width / 2 - 30, 80));
                menu.addChild(WetChatLoginBtn);

                if (accInfo) {
                    var avatarUrl = accInfo.avatarUrl;
                    cc.loader.loadImg(avatarUrl, {width: 100, height: 100}, function (error, img) {
                        if (!error) {
                            cc.log("load image success");
                            var spr = cc.Sprite.createWithTexture(img);
                            spr.setPosition(cc.p(WetChatLoginBtn.getPosition().x, WetChatLoginBtn.getPosition().y + spr.getContentSize().height));
                            layer.addChild(spr);
                        } else {
                            cc.log("load image fail please check~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        }
                    });
                }
            }
        }

        var closeBtn = this.createButton("返回",this.closeButtonLayer);
        closeBtn.setPosition(cc.p(winSize.width / 2, winSize.height * 0.4));
        menu.addChild(closeBtn);

        cc.log("createLoginButton success");
        layer.addChild(menu);
        return layer;
    },
    createGameBeginButton: function () {
        var LogoutBtn = this.createButton("注销", this.cleanLoginInfo);
        var StartGameBtn = this.createButton("开始游戏", this.enterGame);
        var closeBtn = this.createButton("返回", this.closeButtonLayer);
        LogoutBtn.setPosition(cc.p(LogoutBtn.getContentSize().width / 2 + 30, 80));
        StartGameBtn.setPosition(cc.p(winSize.width - StartGameBtn.getContentSize().width / 2 - 30, 80));
        closeBtn.setPosition(cc.p(winSize.width / 2, winSize.height * 0.4));
        var menu = cc.Menu.create(StartGameBtn, LogoutBtn, closeBtn);
        menu.setAnchorPoint(cc.p(0, 0));
        menu.setPosition(cc.p(0, 0));
        return menu;
    },
    createButton: function (tips, callback) {
        var btn = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, callback, this);
        var tipsLabel = cc.LabelTTF.create(tips, "Arial", 25);
        tipsLabel.setPosition(cc.p(btn.getContentSize().width / 2, btn.getContentSize().height / 2));
        btn.addChild(tipsLabel);
        return btn;
    },

    closeButtonLayer:function(){
        this.buttonLayer.removeAllChildren();
        cc.eventManager.removeListener(this.buttonLayerListener);
        this.buttonLayer.removeFromParent();
        this.buttonLayer = null;
    },

    //登陆第一步
    //在自己的服务器上获取　 appid, appsig, appsigdate    三个信息
    setLoginInfo:function(){
        tencentUtils.showLoading("获取配置信息ing");
        var self = this;

        x5_fetchSigInfo(function(sigInfo){
            if(sigInfo){
                self.checkToken();
            }else{
                tencentUtils.hideLoading();
                Utils.showToast("获取appsig等信息失败，请重试");
            }
        });

    },

    //第二步，获取 token 信息并且判断 token 是否有效
    checkToken:function(){
        //获取 token
        var token = pluginManager.x5_getToken();
        //判断 token 是否有效
        if(pluginManager.x5_isTokenValid(token)){
            // token 有效，则直接调用 refreshToken
            var param = x5_getRefreshTokenParam(token);
            this.refreshTencentToken(param);
        }else{
            tencentUtils.hideLoading();
            // token 无效，显示登陆按钮，让用户授权登陆
            this.showLoginButton();
        }
    },

    refreshTencentToken: function (param) {
        pluginManager.x5_refreshToken(param, this.loginCallback.bind(this));
    },

    showLoginButton: function () {
        this.buttonLayer.removeAllChildren();

        loginTypes = null;
        var param = x5_getAvailableLoginTypeParam();
        pluginManager.getAvailableLoginType(param, this.loginCallback.bind(this));
    },

    showEnterGameButton: function () {
        this.buttonLayer.removeAllChildren();
        this.buttonLayer.addChild(this.createGameBeginButton());
    },

    QQLogin: function () {
        tencentUtils.showLoading("QQ登录请求ing");
        var param = x5_getLoginParam("qq");
        pluginManager.login(param, this.loginCallback.bind(this));
    },

    weChatLogin: function () {
        tencentUtils.showLoading("微信登录请求ing");
        var param = x5_getLoginParam("wx");
        pluginManager.login(param, this.loginCallback.bind(this));
    },

    cleanLoginInfo: function () {
        tencentUtils.showLoading("注销中，请稍后...");
        pluginManager.logout(this.loginCallback.bind(this));
    },

    enterGame: function () {
        var tsc = new cc.TransitionFade(1.0, new GamePlayScene());
        cc.director.pushScene(tsc);
    },

    loginCallback: function (plugin, code, msg) {
        tencentUtils.hideLoading();
        cc.log("on user result action.");
        cc.log("msg:" + msg);
        cc.log("code:" + code);

        if (code === UserActionResultCode.kInitSuccess) {
            Utils.showToast("登录初始化成功");
        } else if (code === UserActionResultCode.kInitFail) {
            Utils.showToast("登录初始化失败");
        } else if (code === UserActionResultCode.kLoginSuccess) {
            Utils.showToast("登录成功");
            var msgObj = JSON.parse(msg);
            pluginManager.x5_setToken({
                "qbopenid": msgObj["qbopenid"],
                "refreshToken": msgObj["refreshToken"],
                "loginType": msgObj["loginType"],
                "nickName": msgObj["nickName"]
            });

            var token = pluginManager.x5_getToken();
            cc.log("登录后保存的token为：" + JSON.stringify(token));

            //todo: 由于腾讯只有在登录的时候会返回用户信息，在refreshtoken的时候是不会返回用户信息的，所以登录完成的时候需要保存用户信息
            cc.sys.localStorage.setItem("userInfo", msg);

            // 保存qbopenkey的过期信息
            x5_saveExpireInfo(msg);
            this.showEnterGameButton();
        } else if (code === UserActionResultCode.kLoginFail) {
            Utils.showToast("登录失败");
            // 清除qbopenkey的过期信息
            x5_clearExpireInfo();
        } else if (code === UserActionResultCode.kLoginCancel) {
            Utils.showToast("登录被取消");
            // 清除qbopenkey的过期信息
            x5_clearExpireInfo();
        } else if (code === UserActionResultCode.kLogoutSuccess) {
            Utils.showToast("注销成功");
            pluginManager.x5_cleanToken();
            this.showLoginButton();
        } else if (code === UserActionResultCode.kLogoutFail) {
            Utils.showToast("注销失败");
            pluginManager.x5_cleanToken();
            this.showLoginButton();
        } else if (code === UserActionResultCode.kRefreshTokenSuccess) {
            Utils.showToast("刷新token成功");
            this.showEnterGameButton();
            // 保存qbopenkey的过期信息
            x5_saveExpireInfo(msg);
        } else if (code === UserActionResultCode.kRefreshTokenFail) {
            Utils.showToast("刷新token失败");
            pluginManager.x5_cleanToken();
            this.showLoginButton();
            // 清除qbopenkey的过期信息
            x5_clearExpireInfo();
        } else if (code === UserActionResultCode.kSendToDesktopSuccess) {
            Utils.showToast("发送桌面快捷方式成功");
        } else if (code === UserActionResultCode.kSendToDesktopFail) {
            Utils.showToast("发送桌面快捷方式失败");
        } else if (code === UserActionResultCode.kGetAvailableLoginTypeSuccess) {
            // 获取登录方式成功
            var msgObj = JSON.parse(msg);
            loginTypes = msgObj["loginTypes"];
            this.buttonLayer.addChild(this.createLoginButton());
        } else if (code === UserActionResultCode.kGetAvailableLoginTypeFail) {
            // 获取登录方式失败
            this.buttonLayer.addChild(this.createLoginButton());
        } else {
            Utils.showToast("未知返回码:" + code);
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


//--------------------- 授权过期相关函数 -----------------------------------------//

var x5_expireObj = {
    expireInterval: 0, // 单位为秒
    loginTime: 0 // 单位为秒
};

// 获取当前秒级时间
// @note 此Demo使用本地时间，建议游戏去获取自己服务端时间比较好，防止本地时间被篡改
function x5_getCurrentTimeInSeconds() {
    return new Date().getTime() / 1000;
}

// 保存授权过期信息
// @param msg loginCallback的msg参数，为JSON字符串类型，此函数内部去解析此参数
function x5_saveExpireInfo(msg) {
    cc.log("x5_saveExpireInfo: " + msg);
    var msgObj = JSON.parse(msg);
    x5_expireObj.loginTime = x5_getCurrentTimeInSeconds();
    x5_expireObj.expireInterval = msgObj["expire"] || msgObj["expireIn"] || 0;
}

// 判断是否授权过期，需要在支付前调用判断一下
// @return true or false
function x5_isAuthorizationExpired() {
    var ret = false;
    if (x5_expireObj.expireInterval > 0 && x5_expireObj.loginTime > 0) {
        var curTime = x5_getCurrentTimeInSeconds();
        var interval = curTime - x5_expireObj.loginTime;
        ret = (interval - x5_expireObj.expireInterval) > 0;
        cc.log("[UserTencent] isAuthorizationExpired: " + ret);
        cc.log("[UserTencent] interval: " + interval + ", expireIn: " + x5_expireObj.expireInterval + ", loginTime: " + x5_expireObj.loginTime);
    } else {
        cc.log("[UserTencent] isAuthorizationExpired: invalid expire obj: interval=" + x5_expireObj.interval + ", loginTime=" + x5_expireObj.loginTime);
    }
    return ret;
}

// 清空授权过期信息
function x5_clearExpireInfo() {
    cc.log("x5_clearExpireInfo");
    x5_expireObj.expireInterval = 0;
    x5_expireObj.loginTime = 0;
}

var x5_sigInfo = null;

// 去游戏服务端获取登录参数信息，通过回调参数通知，参数类型如下
// @param cb callback function of fetch sig information, function(sigInfo) {}
function x5_fetchSigInfo(cb){
    cc.log("x5_fetchSigInfo...");

    if(!cb){
        cc.log("ERROR:x5_fetchSigInfo callback is null!");
        return ;
    }

    // 如果之前有获取过app信息，则直接返回
    if (x5_sigInfo) {
        cb(x5_sigInfo);
        return;
    }

    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open("GET","http://tencent.cocosruntime.com:5555/x5/get_login_info");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)){
            var httpStatus = xhr.statusText;
            var response = xhr.responseText;
            cc.log("getLoginInfo success : response:" + response);
            x5_sigInfo = JSON.parse(response);
            cb(x5_sigInfo);
        }else{
            cc.log("getLoginInfo failure, status: " + xhr.status);
            cb(null);
        }
    };

    xhr.send();
}

function x5_getAvailableLoginTypeParam() {
    if (!x5_sigInfo) {
        cc.log("[UserTencent] ERROR: Invalid sigInfo, please call x5_fetchSigInfo!");
        return null;
    }

    var param = {
        "appid": x5_sigInfo["appid"],
    };

    return param;
}

function x5_getLoginParam(type) {
    if (!x5_sigInfo) {
        cc.log("[UserTencent] ERROR: Invalid sigInfo, please call x5_fetchSigInfo!");
        return null;
    }

    if (type != "qq" && type != "wx") {
        cc.log("[UserTencent] Invalid type: " + type);
        return null;
    }

    var param = {
        "appid": x5_sigInfo["appid"],
        "appsig": x5_sigInfo["appsig"],
        "loginType": type,
        "appsigData": x5_sigInfo["appsigdata"]
    };

    return param;
}

// 获取刷新Token的参数
function x5_getRefreshTokenParam(token) {
    var param = {
        "appid": x5_sigInfo["appid"],
        "appsig": x5_sigInfo["appsig"],
        "qbopenid": token["qbopenid"],
        "refreshToken": token["refreshToken"]
    };

    return param;
}

//--------------------------------------------------------------------------//
var loginTypes = null

var DEFAULT_LOGIN_TYPES = [
    {
        "loginType" : "wx"
    },
    {
        "loginType" : "qq"
    }
]

//--------------------------------------------------------------------------//