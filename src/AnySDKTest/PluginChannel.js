/**
 * Created by cocos on 16/1/21.
 */
var agent = null;
var user_plugin = null;
var iap_pluginMap = null;

//注意：这里appKey, appSecret, privateKey，要替换成自己打包工具里面的值(登录打包工具，游戏管理界面上显示的那三个参数)。

// cocosplay-demo的参数
//AnySDK
var appKey = "839576F1-1FC9-1C67-C687-C85A3FE71BE5";
var appSecret = "a2ff8473c71a9bbaa9085279ebc62869";
var privateKey = "3AF5441990AF5C2DF9F50122B01D2712";
//var oauthLoginServer = "http://oauth.anysdk.com/api/OauthLoginDemo/Login.php";
//var oauthLoginServer = "http://callback-play.cocos.com/api/User/LoginOauth/";
//var oauthLoginServer = "http://127.0.0.1:8888";

var oauthLoginServer = "http://182.254.241.97:56999/coco_login";

var PluginChannel = cc.Class.extend({
    loadPlugins: function () {
        if(agent == null){
            agent = anysdk.AgentManager.getInstance();
            cc.log("appKey is " + appKey + ",appSecret is " + appSecret + ",privateKey is " + privateKey);
            agent.init(appKey,appSecret,privateKey,oauthLoginServer);
            agent.loadALLPlugin();
        }
        // get plugins
        user_plugin = agent.getUserPlugin();
        iap_pluginMap = agent.getIAPPlugin();

        if (user_plugin) {
            user_plugin.setActionListener(this.onUserLogin, this);
        }

        for (var key in iap_pluginMap) {
            var iap_plugin = iap_pluginMap[key];
            iap_plugin.setResultListener(this.onPayResult, this);
        }

        this.funcOfAgent();
    },
    onUserLogin: function (plugin, code, msg) {
        cc.log("on user result action.");
        cc.log("msg:" + msg);
        cc.log("code:" + code);

        if (code === UserActionResultCode.kInitSuccess) {
            Utils.showToast("登录初始化成功");
        } else if (code === UserActionResultCode.kInitFail) {
            Utils.showToast("登录初始化失败");
        } else if (code === UserActionResultCode.kLoginSuccess) {
            Utils.showToast("登录成功");
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

    funcOfAgent: function () {
        var customParam = agent.getCustomParam();
        cc.log("customParam:" + customParam);
    },

    login: function () {
        user_plugin.login();
    },
    logout: function () {
        if (user_plugin.isFunctionSupported("logout")) {
            user_plugin.callFuncWithParam("logout");
        }
    },
    enterPlatform: function () {
        if (user_plugin.isFunctionSupported("enterPlatform"))
            user_plugin.callFuncWithParam("enterPlatform");
    },
    showToolbar: function (pos) {
        if (user_plugin.isFunctionSupported("showToolBar")) {
            var param1 = anysdk.PluginParam.create(pos);
            user_plugin.callFuncWithParam("showToolBar", param1);
        }
    },
    hideToolbar: function () {
        if (user_plugin.isFunctionSupported("hideToolBar"))
            user_plugin.callFuncWithParam("hideToolBar");
    },
    accountSwitch: function () {
        if (user_plugin.isFunctionSupported("accountSwitch"))
            user_plugin.callFuncWithParam("accountSwitch");
    },
    realNameRegister: function () {
        if (user_plugin.isFunctionSupported("realNameRegister"))
            user_plugin.callFuncWithParam("realNameRegister");
    },
    antiAddictionQuery: function () {
        if (user_plugin.isFunctionSupported("antiAddictionQuery"))
            user_plugin.callFuncWithParam("antiAddictionQuery");
    },
    antiAddictionQuery: function () {
        if (user_plugin.isFunctionSupported("submitLoginGameRole")) {
            var data = anysdk.PluginParam.create({
                roleId: "123456",
                roleName: "test",
                roleLevel: "10",
                zoneId: "123",
                zoneName: "test",
                dataType: "1",
                ext: "login"
            });
            user_plugin.callFuncWithParam("submitLoginGameRole", data);
        }
    },
    pay: function () {
        var userId = user_plugin.getUserID();
        if (userId) {
            anysdk.ProtocolIAP.resetPayState();
            var productId = new Date().getTime();
            var ext = this.getOrderId() + "_" + userId;
            var info = {
                Product_Price: "1",
                Product_Id: productId + "",
                Product_Name: "gold",
                Server_Id: "13",
                Product_Count: "11",
                Role_Id: userId + "",
                Role_Name: "encal",
                EXT:ext
            };

            cc.log("send info is "+JSON.stringify(info));
            for (var p in iap_pluginMap) {
                var iap_plugin = iap_pluginMap[p];
                cc.log("will pay for product");
                iap_plugin.payForProduct(info);
            }

        } else {
            cc.log("user id is null please login first");
        }
    },
    getOrderId: function () {
        //todo please connect your game server to create an orderId
        return Date.now();
    },
    onPayResult: function (ret, msg, info) {
        cc.log("pay result, resultcode:" + ret + ", msg: " + msg + ", info:" + info);
        if (ret === PayResultCode.kPaySuccess) {
            Utils.showToast("支付成功");
        } else if (ret === PayResultCode.kPayFail) {
            Utils.showToast("支付失败");
        } else if (ret === PayResultCode.kPayCancel) {
            Utils.showToast("支付被取消");
        }
    },

    createDesktopIcon: function() {
        cc.log("createDesktopIcon ...");
        if (cc.runtime && cc.runtime.config) {
            var param = {
                "ext":""
            };
            var desktopFuncName = "sendToDesktop";
            if (user_plugin.isFunctionSupported(desktopFuncName)) {
                user_plugin.callFuncWithParam(desktopFuncName,anysdk.PluginParam.create(param));
            } else {
                cc.log("Oops, " + desktopFuncName + " isn't supported!");
            }
        } else {
            cc.log("cc.runtime or  cc.runtime.config is null");
        }
    }

});

var PluginChannelTestLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init: function () {

        var winSize = cc.director.getWinSize();

        var MARGIN = 40;
        var SPACE = 35;

        var label = new cc.LabelTTF("PluginChannel Test", "Arial", 28);
        label.setPosition(cc.p(winSize.width / 2, winSize.height - MARGIN));
        this.addChild(label, 0);

        var menuRequest = new cc.Menu();
        menuRequest.setPosition(cc.p(0, 0));
        this.addChild(menuRequest);

        // Test start sesstion
        var labelLogin = new cc.LabelTTF("login", "Arial", 22);
        labelLogin.setAnchorPoint(cc.p(0,0));
        var itemLogin = new cc.MenuItemLabel(labelLogin, this.onMenuLoginClicked, this);
        itemLogin.setPosition(cc.p(labelLogin.getContentSize().width / 2 + MARGIN, winSize.height - MARGIN - SPACE));
        menuRequest.addChild(itemLogin);

        // Test stop sesstion
        var labellogout = new cc.LabelTTF("logout", "Arial", 22);
        labellogout.setAnchorPoint(cc.p(0,0));
        var itemlogout = new cc.MenuItemLabel(labellogout, this.onMenuLogoutClicked, this);
        itemlogout.setPosition(cc.p(winSize.width - (labellogout.getContentSize().width / 2 + MARGIN), winSize.height - MARGIN - SPACE));
        menuRequest.addChild(itemlogout);

        // Test log error
        var labelEnterPlatform = new cc.LabelTTF("enterPlatform", "Arial", 22);
        labelEnterPlatform.setAnchorPoint(cc.p(0,0));
        var itemEnterPlatform = new cc.MenuItemLabel(labelEnterPlatform, this.onMenuEnterPlatformClicked, this);
        itemEnterPlatform.setPosition(cc.p(labelEnterPlatform.getContentSize().width / 2 + MARGIN, winSize.height - MARGIN - 2 * SPACE));
        menuRequest.addChild(itemEnterPlatform);

        // Test log event
        var labelShowToolbar = new cc.LabelTTF("showToolBar", "Arial", 22);
        labelShowToolbar.setAnchorPoint(cc.p(0,0));
        var itemShowToolbar = new cc.MenuItemLabel(labelShowToolbar, this.onMenuShowToolbarClicked, this);
        itemShowToolbar.setPosition(cc.p(winSize.width - (labelShowToolbar.getContentSize().width / 2 + MARGIN), winSize.height - MARGIN - 2 * SPACE));
        menuRequest.addChild(itemShowToolbar);

        // Test log error
        var labelhideToolBar = new cc.LabelTTF("hideToolBar", "Arial", 22);
        labelhideToolBar.setAnchorPoint(cc.p(0,0));
        var itemhideToolBar = new cc.MenuItemLabel(labelhideToolBar, this.onMenuhideToolBarClicked, this);
        itemhideToolBar.setPosition(cc.p(labelhideToolBar.getContentSize().width / 2 + MARGIN, winSize.height - MARGIN - 3 * SPACE));
        menuRequest.addChild(itemhideToolBar);

        // Test log event
        var labelAccountSwitch = new cc.LabelTTF("accountSwitch", "Arial", 22);
        labelAccountSwitch.setAnchorPoint(cc.p(0,0));
        var itemAccountSwitch = new cc.MenuItemLabel(labelAccountSwitch, this.onMenuAccountSwitchClicked, this);
        itemAccountSwitch.setPosition(cc.p(winSize.width - (labelAccountSwitch.getContentSize().width / 2 + MARGIN), winSize.height - MARGIN - 3 * SPACE));
        menuRequest.addChild(itemAccountSwitch);

        // Test log error
        var labelRealNameRegister = new cc.LabelTTF("realNameRegister", "Arial", 22);
        labelRealNameRegister.setAnchorPoint(cc.p(0,0));
        var itemRealNameRegister = new cc.MenuItemLabel(labelRealNameRegister, this.onMenuRealNameRegisterClicked, this);
        itemRealNameRegister.setPosition(cc.p(labelRealNameRegister.getContentSize().width / 2 + MARGIN, winSize.height - MARGIN - 4 * SPACE));
        menuRequest.addChild(itemRealNameRegister);

        // Test log event
        var labelAntiAddictionQuery = new cc.LabelTTF("antiAddictionQuery", "Arial", 22);
        labelAntiAddictionQuery.setAnchorPoint(cc.p(0,0));
        var itemAntiAddictionQuery = new cc.MenuItemLabel(labelAntiAddictionQuery, this.onMenuAntiAddictionQueryClicked, this);
        itemAntiAddictionQuery.setPosition(cc.p(winSize.width - (labelAntiAddictionQuery.getContentSize().width / 2 + MARGIN), winSize.height - MARGIN - 4 * SPACE));
        menuRequest.addChild(itemAntiAddictionQuery);

        // Test log error
        var labelSubmitLoginGameRole = new cc.LabelTTF("submitLoginGameRole", "Arial", 22);
        labelSubmitLoginGameRole.setAnchorPoint(cc.p(0,0));
        var itemSubmitLoginGameRole = new cc.MenuItemLabel(labelSubmitLoginGameRole, this.onMenuSubmitLoginGameRoleClicked, this);
        itemSubmitLoginGameRole.setPosition(cc.p(labelSubmitLoginGameRole.getContentSize().width / 2 + MARGIN, winSize.height - MARGIN - 5 * SPACE));
        menuRequest.addChild(itemSubmitLoginGameRole);

        // Test log event
        var labelPay = new cc.LabelTTF("pay", "Arial", 22);
        labelPay.setAnchorPoint(cc.p(0,0));
        var itemPay = new cc.MenuItemLabel(labelPay, this.onMenuPayClicked, this);
        itemPay.setPosition(cc.p(winSize.width - (labelPay.getContentSize().width / 2 + MARGIN), winSize.height - MARGIN - 5 * SPACE));
        menuRequest.addChild(itemPay);

        // Send to desktop
        var labelCreateDesktopIcon = new cc.LabelTTF("Send to desktop", "Arial", 22);
        labelCreateDesktopIcon.setAnchorPoint(cc.p(0,0));
        var itemCreateDesktopIcon = new cc.MenuItemLabel(labelCreateDesktopIcon, this.onMenuCreateDesktopIconClicked, this);
        itemCreateDesktopIcon.setPosition(cc.p(labelCreateDesktopIcon.getContentSize().width / 2 + MARGIN, winSize.height - MARGIN - 6 * SPACE));
        menuRequest.addChild(itemCreateDesktopIcon);

        // Back Menu
        var itemBack = new cc.MenuItemFont("Back", this.toAnySDKMainLayer, this);
        itemBack.setPosition(cc.p(winSize.width - 50, 25));
        var menuBack = new cc.Menu(itemBack);
        menuBack.setPosition(cc.p(0, 0));
        this.addChild(menuBack);

        return true;
    },

    // Menu Callbacks
    onMenuLoginClicked: function(sender) {
        plugin_channel.login();
    },

    onMenuLogoutClicked: function(sender) {
        plugin_channel.logout();
    },

    onMenuEnterPlatformClicked: function(sender) {
        plugin_channel.enterPlatform();
    },

    onMenuShowToolbarClicked: function(sender) {
        plugin_channel.showToolbar(ToolBarPlace.kToolBarTopLeft);
    },

    onMenuhideToolBarClicked: function(sender) {
        plugin_channel.hideToolbar();
    },

    onMenuAccountSwitchClicked: function(sender) {
        plugin_channel.accountSwitch();
    },

    onMenuRealNameRegisterClicked: function(sender) {
        plugin_channel.realNameRegister();
    },

    onMenuAntiAddictionQueryClicked: function(sender) {
        plugin_channel.antiAddictionQuery();
    },

    onMenuSubmitLoginGameRoleClicked: function(sender) {
        plugin_channel.submitLoginGameRole();
    },

    onMenuPayClicked: function(sender) {
        plugin_channel.pay();
    },

    onMenuCreateDesktopIconClicked: function(sender) {
        plugin_channel.createDesktopIcon();
    },

    toAnySDKMainLayer: function (sender) {
        //var scene = new AnySDKTestScene();
        //scene.runThisTest();
    }
});

if (cc.runtime && cc.runtime.config) {
    if (cc.runtime.config["channel_id"] == "100115") {
        // QQ浏览器逻辑
        g_env = CocosRuntimeEnv.TENCENT;

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