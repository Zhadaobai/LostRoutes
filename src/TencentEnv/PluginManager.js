/**
 * Created by cocos on 16/1/4.
 */
var PluginManager = cc.Class.extend({
    anySDKAgent: null,
    userPlugin: null,
    iapPlugin: null,
    socialPlugin: null,
    sharePlugin: null,

    userCallback: null,
    iapCallback: null,
    socialCallback: null,
    shareCallback: null,
    ctor: function () {
        this.initAnySDK();
    },
    initAnySDK: function () {
        if (agent == null) {
            agent = anysdk.AgentManager.getInstance();
            agent.loadALLPlugin();
        }
        this.anySDKAgent = anysdk.AgentManager.getInstance();

        //获取用户插件，用户插件，用于登录，刷洗token等用户相关的操作
        this.userPlugin = this.anySDKAgent.getUserPlugin();

        //获取支付插件，支付插件，用于游戏内支付
        this.iapPlugin = this.anySDKAgent.getIAPPlugin();

        //获取社交插件，社交插件，在腾讯模式下，主要用于获取好友列表
        this.socialPlugin = this.anySDKAgent.getSocialPlugin();

        //获取分享插件，分享插件，主要用于唤起腾讯分享的界面进行分享操作
        this.sharePlugin = this.anySDKAgent.getSharePlugin();

        if (this.userPlugin) {
            this.userPlugin.setActionListener(this.onUserResult, this);
        }
        if (this.sharePlugin)
            this.sharePlugin.setResultListener(this.onShareResult, this);

        if (this.socialPlugin)
            this.socialPlugin.setListener(this.onSocialResult, this);

        for (var key in this.iapPlugin) {
            var iap_plugin = this.iapPlugin[key];
            iap_plugin.setResultListener(this.onPayResult, this);
        }
    },
    /**
     * 设置腾讯浏览器模式下的 token
     * @param tokenObj
     */
    x5_setToken: function (tokenObj) {
        var param = anysdk.PluginParam.create(JSON.stringify(tokenObj));
        this.userPlugin.callFuncWithParam("x5_setToken", param);
        cc.log("x5_setToken" + tokenObj);
    },
    /**
     * 腾讯浏览器模式下获取token
     * @returns {*}
     */
    x5_getToken: function () {
        var ret = null;
        var tokenJsonStr = this.userPlugin.callStringFuncWithParam("x5_getToken");
        if (tokenJsonStr != "") {
            ret = JSON.parse(tokenJsonStr);
        }
        cc.log("x5_getToken: " + ret);
        return ret;
    },
    /**
     * 腾讯浏览器模式下清除token
     * @returns {*}
     */
    x5_cleanToken: function () {
        this.x5_setToken({"qbopenid": "", "refreshToken": ""});
    },
    /**
     * 当Token有效的时候，就直接refreshToken
     * @param param
     * @param callback
     */
    x5_refreshToken: function (param, callback) {
        if (callback) this.userCallback = callback;
        this.userPlugin.callFuncWithParam("x5_refreshToken", anysdk.PluginParam.create(param));
    },
    /**
     * 腾讯浏览器模式下 验证token是否有效
     * @returns {*}
     */
    x5_isTokenValid: function (token) {
        return token && token["qbopenid"] && token["refreshToken"];
    },
    x5_sendToDesktop: function (param, callback) {
        if (callback) this.userCallback = callback;
        this.userPlugin.callFuncWithParam("x5_sendToDesktop", anysdk.PluginParam.create(param));
    },

    /**
     * 获取用户信息
     * @param param
     * @param callback 回调
     */
    getUserInfo: function (callback) {
        if (callback) this.userCallback = callback;
        this.userPlugin.callFuncWithParam("getUserInfo");
    },

    /**
     * 获取支持的登录方式
     * @param param
     * @param callback 回调
     */
    getAvailableLoginType: function (param, callback) {
        if (callback) this.userCallback = callback;
        cc.log("getAvailableLoginType for tencent ...");
        cc.log("before getAvailableLoginType:" + param);
        if (this.userPlugin.isFunctionSupported("getAvailableLoginType")) {
            this.userPlugin.callFuncWithParam("getAvailableLoginType", anysdk.PluginParam.create(param));
        }
        else {
            cc.log("Oops, getAvailableLoginType isn't supported!");
        }
    },

    /**
     * 登录
     * @param param 登录参数
     * @param callback 回调
     */
    login: function (param, callback) {
        if (callback) this.userCallback = callback;
        cc.log("login for tencent ...");
        cc.log("before loginWithParams:" + param);
        if (this.userPlugin.isFunctionSupported("loginWithParams")) {
            this.userPlugin.callFuncWithParam("loginWithParams", anysdk.PluginParam.create(param));
        }
        else {
            cc.log("Oops, loginWithParams isn't supported!");
        }
    },

    /**
     * 注销
     * @param callback 回调
     */
    logout: function(callback) {
        if (callback) this.userCallback = callback;
        cc.log("logout for tencent ...");
        if (this.userPlugin.isFunctionSupported("logout")) {
            this.userPlugin.callFuncWithParam("logout");
        }
    },

    /**
     * 获取用户id
     * @returns {*|string|String}
     */
    getUserID: function () {
        return this.userPlugin.getUserID();
    },
    /**
     * 唤起腾讯分享界面
     * @param param 参数
     * @param cb 回调
     */
    share: function (param, cb) {
        if (cb) this.shareCallback = cb;
        this.sharePlugin.share(param);
    },
    /**
     * 支付
     * @param param 支付参数
     * @param callback 回调
     */
    pay: function (param, callback) {
        this.iapCallback = callback;
        anysdk.ProtocolIAP.resetPayState();
        cc.log("send info is "+JSON.stringify(param));
        for (var p in this.iapPlugin) {
            var iap_plugin = this.iapPlugin[p];
            cc.log("will pay for product");
            iap_plugin.payForProduct(param);
        }
    },
    /**
     * 获取好友信息
     * @param callback 回调
     */
    getFriendsList: function (callback) {
        this.socialCallback = callback;
        this.socialPlugin.callFuncWithParam("getFriendsInfo");
    },
    /**
     * 打开话题圈
     */
    openTopicCircle: function () {
        this.socialPlugin.callFuncWithParam("openTopicCircle");
    },
    /**
     * 登录回调
     * @param ret
     * @param msg
     * @param info
     */
    onUserResult: function (ret, msg, info) {
        cc.log("onUserResult: ret=" + ret + ", msg=" + msg + ", info=" + info);
        if (this.userCallback) {
            this.userCallback(ret, msg, info);
            // this.userCallback = null;
        }
    },
    /**
     * 支付回调
     * @param ret
     * @param msg
     * @param info
     */
    onPayResult: function (ret, msg, info) {
        cc.log("onPayResult: ret=" + ret + ", msg=" + msg + ", info=" + info);
        if (this.iapCallback) {
            this.iapCallback(ret, msg, info);
            this.iapCallback = null;
        }
    },
    /**
     * 分享回调
     * @param ret
     * @param msg
     */
    onShareResult: function (ret, msg) {
        cc.log("onShareResult: ret=" + ret + ", msg=" + msg);
        if (this.shareCallback) {
            this.shareCallback(ret, msg);
            this.shareCallback = null;
        }
    },
    /**
     * 社交回调
     * @param ret
     * @param msg
     */
    onSocialResult: function (ret, msg) {
        cc.log("onSocialResult: ret=" + ret + ", msg=" + msg);
        if (this.socialCallback) {
            this.socialCallback(ret, msg);
            this.socialCallback = null;
        }
    }
});
if (cc.runtime && cc.runtime.config && cc.runtime.config["channel_id"] == "100115") {
    var _pluginManager = null;
    var pluginManager = function () {
        if (_pluginManager == null) {
            _pluginManager = new PluginManager();
        }
        return _pluginManager;
    }();

    //toast遮蔽层
    var _tencentUtils = null;
    var tencentUtils = function () {
        if (_tencentUtils == null) {
            _tencentUtils = new TencentUtils();
        }
        return _tencentUtils;
    }();
}