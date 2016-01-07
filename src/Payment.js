/**
 * Created by cocos on 16/1/5.
 */
var Payment = cc.Layer.extend({
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

        var btnPay = this.createButton("吃土",this.payMoney);
        var btnBack = this.createButton("滚回去",this.backToMenu);

        var menu = cc.Menu.create(btnPay,btnBack);
        menu.alignItemsVerticallyWithPadding(10);
        menu.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
        this.colorLayer.addChild(menu);
    },

    createButton:function(tips,callback){
        var btn = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, callback, this);
        var tipsLabel = cc.LabelTTF.create(tips,"Arial",25);
        tipsLabel.setPosition(cc.p(btn.getContentSize().width / 2, btn.getContentSize().height / 2));
        btn.addChild(tipsLabel);
        return btn;
    },

    payMoney:function(){
        tencentUtils.showLoading("请求支付ing...");

        var productId = this.getOrderId();
        var userId = pluginManager.getUserID();
        var ext = this.getOrderId() + "_" + userId;
        var info = {
            Product_Price: "1" + "",
            Product_Id: productId + "",
            Product_Name: "火球术卷轴(包教包会童叟无欺)",
            Server_Id: "13",
            Product_Count: "10001",
            Rold_Id: userId + "",
            Role_Name: "魔法学徒路人甲",
            EXT: ext
        };

        pluginManager.pay(info, function (ret, msg, info) {
            tencentUtils.hideLoading();

            if (ret === PayResultCode.kPaySuccess) {
                Utils.showToast("支付成功");
                cc.log("支付成功");
            } else if (ret === PayResultCode.kPayFail) {
                Utils.showToast("支付失败");
                cc.log("支付失败");
                var msgObj = JSON.parse(msg);
                var result = msgObj["result"];

                if (result == -3) { // -3 表示需要重新登录
                    cc.log("支付返回-3错误码，需要重新登录");
                    this.login();
                } else if (result == -4) { // -4 表示需要重新刷新token
                    cc.log("支付返回-4错误码，需要重新刷新Token");
                    this.checkToken();
                }
            } else if (ret === PayResultCode.kPayCancel) {
                Utils.showToast("支付被取消");
                cc.log("支付取消");
            } else if (ret === PayResultCode.kPayNeedLoginAgain) {
                Utils.showToast("需要重新登陆");
                cc.log("需要重新登陆");
                this.login();
            }
        }.bind(this));
    },

    login: function() {
        // 获取token
        var token = pluginManager.x5_getToken();
        // 判断token是否有效
        if (pluginManager.x5_isTokenValid(token)) {
            var loginType = token["loginType"];
            var prompt = loginType == "qq" ? "QQ" : "微信";
            tencentUtils.showLoading(prompt + "登录请求ing");
            var param = x5_getLoginParam(loginType);
            pluginManager.login(param, this.loginCallback.bind(this));
        } else {
            // 无效token，返回登录界面，重新选择QQ或者WX登陆
            cc.director.popScene();
        }
    },

    checkToken: function () {
        tencentUtils.showLoading("刷新Token ...");
        //获取token
        var token = pluginManager.x5_getToken();
        //判断token是否有效
        if (pluginManager.x5_isTokenValid(token)) {
            //token有效，调用refreshToken的方法，不需要用户进行授权登录
            var param = x5_getRefreshTokenParam(token);
            this.refreshTencentToken(param);
        } else {
            tencentUtils.hideLoading();
            //token无效，返回游戏登录界面
            cc.director.popScene();
        }
    },

    refreshTencentToken: function (param) {
        pluginManager.x5_refreshToken(param, this.loginCallback.bind(this));
    },

    loginCallback: function (plugin, code, msg) {
        tencentUtils.hideLoading();
        cc.log("on user result action.");
        cc.log("msg:" + msg);
        cc.log("code:" + code);

        if (code === UserActionResultCode.kLoginSuccess) {
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

            this.payMoney();
        } else if (code === UserActionResultCode.kLoginFail) {
            Utils.showToast("登录失败");
            // 清除qbopenkey的过期信息
            x5_clearExpireInfo();
        } else if (code === UserActionResultCode.kLoginCancel) {
            Utils.showToast("登录被取消");
            // 清除qbopenkey的过期信息
            x5_clearExpireInfo();
        } else if (code === UserActionResultCode.kRefreshTokenSuccess) {
            Utils.showToast("刷新token成功");
            // 保存qbopenkey的过期信息
            x5_saveExpireInfo(msg);
            // 刷新成功, 进行支付操作
            this.payMoney();
        } else if (code === UserActionResultCode.kRefreshTokenFail) {
            Utils.showToast("刷新token失败");
            pluginManager.x5_cleanToken();

            // 清除qbopenkey的过期信息
            x5_clearExpireInfo();

            // 刷新token失败，返回游戏登录界面
            cc.director.popScene();
        } else {
            Utils.showToast("未知返回码:" + code);
        }
    },

    backToMenu:function(){
        cc.director.popScene();
    },

    getOrderId: function () {
        //todo please connect your game server to create an orderId
        return Date.now();
    },

    getUserId:function(){

    },
});

var PayScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new Payment();
        this.addChild(layer);
    },
});