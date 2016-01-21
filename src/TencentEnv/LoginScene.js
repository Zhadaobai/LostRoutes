/**
 * Created by cocos on 16/1/21.
 */

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
function x5_fetchSigInfo(cb) {
    cc.log("x5_fetchSigInfo ...");

    if (!cb) {
        cc.log("ERROR: x5_fetchSigInfo callback is null!");
        return;
    }

    // 如果之前有获取过app信息，则直接返回
    if (x5_sigInfo) {
        cb(x5_sigInfo);
        return;
    }

    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open("GET", "http://tencent.cocosruntime.com:5555/x5/get_login_info");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            var httpStatus = xhr.statusText;
            var response = xhr.responseText;
            cc.log("getLoginInfo success: response:" + response);
            x5_sigInfo = JSON.parse(response);
            cb(x5_sigInfo);
        } else {
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

// 获取登录参数的辅助函数
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

//登录场景
var TencentLayer = cc.Layer.extend({
    toast: null,
    toastText: null,
    toastListener: null,
    buttonLayer: null,

    ctor:function(){
        this._super();
    },

    onEnter: function () {
        this._super();
        this.initUI();
    },

    initUI: function () {
        //bg
        this.buttonLayer = new cc.LayerColor();
        this.buttonLayer.setColor(cc.color(100,100,100));
        this.buttonLayer.setOpacity(100);

        this.toastListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan:function(touch,event){
                cc.log("[[[[[救命啊我被摸了]]]]]");
                return true;
            }
        });
        cc.eventManager.addListener(this.toastListener, this.buttonLayer);

        var btnBack = this.createButton("返回", this.onBack);
        var menu = cc.Menu.create(btnBack);
        menu.setPosition(winSize.width / 2, winSize.height / 2);
        this.buttonLayer.addChild(menu);

        this.addChild(this.buttonLayer);

        this.getSigInfo();

    },

    onBack:function(){
        cc.eventManager.removeListener(this.toastListener);
        this.buttonLayer.removeAllChildren();
        this.buttonLayer = null;
        this.removeFromParent();
    },

    /**
     * 创建登录信息的按钮
     * @returns {WetChatLoginBtn}
     */
    createLoginButton: function () {
        var layer = new cc.Layer();

        var allTypes = null;

        if (loginTypes != null) {
            allTypes = loginTypes;
        } else {
            allTypes = DEFAULT_LOGIN_TYPES;
        }

        var menu = cc.Menu.create();
        menu.setAnchorPoint(cc.p(0, 0)), menu.setPosition(cc.p(0, 0));

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

        var btnBack = this.createButton("返回", this.onBack);
        var menu2 = cc.Menu.create(btnBack);
        menu2.setPosition(winSize.width / 2, winSize.height / 2);
        layer.addChild(menu2);

        cc.log("createLoginButton success");
        layer.addChild(menu);
        return layer;
    },
    createGameBeginButton: function () {
        var LogoutBtn = this.createButton("注销", this.cleanLoginInfo);
        var StartGameBtn = this.createButton("开始游戏", this.enterGame);
        var btnBack = this.createButton("返回", this.onBack);
        LogoutBtn.setPosition(cc.p(LogoutBtn.getContentSize().width / 2 + 30, 80));
        StartGameBtn.setPosition(cc.p(winSize.width - StartGameBtn.getContentSize().width / 2 - 30, 80));
        btnBack.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
        var menu = cc.Menu.create(StartGameBtn, LogoutBtn, btnBack);
        menu.setAnchorPoint(cc.p(0, 0)), menu.setPosition(cc.p(0, 0));
        return menu;
    },
    createButton: function (tips, callback) {
        var btn = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, callback, this);
        var tipsLabel = cc.LabelTTF.create(tips, "Arial", 25);
        tipsLabel.setPosition(cc.p(btn.getContentSize().width / 2, btn.getContentSize().height / 2));
        btn.addChild(tipsLabel);
        return btn;
    },
    /**
     * 登录第一个步,去自己服务器获取appid、appsig、appsigdata三个信息
     * @param cb
     */
    getSigInfo: function () {
        tencentUtils.showLoading("获取配置信息ing");
        var self = this;
        x5_fetchSigInfo(function(sigInfo) {
            if (sigInfo) {
                self.checkToken();
            } else {
                tencentUtils.hideLoading();
                Utils.showToast("获取appsig等信息失败，请重试");
            }
        });
    },
    /**
     * 第二步，获取token信息并判断token是否有效
     */
    checkToken: function () {
        //获取token
        var token = pluginManager.x5_getToken();
        //判断token是否有效
        if (pluginManager.x5_isTokenValid(token)) {
            //token有效，调用refreshToken的方法，不需要用户进行授权登录
            var param = x5_getRefreshTokenParam(token);
            this.refreshTencentToken(param);
        } else {
            tencentUtils.hideLoading();
            //token无效，调用登录接口，让用户授权登录
            this.showLoginButton();
        }

    },
    refreshTencentToken: function (param) {
        pluginManager.x5_refreshToken(param, this.loginCallback.bind(this));
    },
    showLoginButton: function () {
        this.buttonLayer.removeAllChildren();

        loginTypes = null
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
        var trans = new cc.TransitionFade(1, new GamePlayScene());
        cc.director.pushScene(trans);
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
    }

});





















