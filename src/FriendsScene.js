/**
 * Created by cocos on 16/1/6.
 */
var FriendsLayer = cc.Layer.extend({
    infoLayer: null,

    picList: [
        "http://q4.qlogo.cn/g?b=qq&k=beJtiatHJSrdicPfohyBaB0w&s=640&t=1424414987",
        "http://pic1.ooopic.com/uploadfilepic/sheji/2009-08-09/OOOPIC_SHIJUNHONG_20090809ad6104071d324dda.jpg",
        "http://wenwen.sogou.com/p/20090901/20090901120429-209308118.jpg",
        "http://d.hiphotos.baidu.com/zhidao/pic/item/562c11dfa9ec8a13e028c4c0f603918fa0ecc0e4.jpg",
        "http://img2.ooopic.com/13/44/96/45bOOOPICa0_202.jpg",
        "http://img2.ooopic.com/13/43/00/21bOOOPICf7_202.jpg",
        "http://img2.ooopic.com/13/38/06/13bOOOPIC62_202.jpg",
        "http://img2.ooopic.com/13/43/32/50bOOOPICc6_202.jpg",
        "http://img2.ooopic.com/13/44/52/49bOOOPIC72_202.jpg",
        "http://img2.ooopic.com/13/44/52/46bOOOPICd3_202.jpg"
    ],

    ctor:function(){
        this._super();
        this.init();
    },

    init:function(){
        var colorLayer = new cc.LayerColor();
        colorLayer.setColor(cc.color(100,100,100));
        colorLayer.setOpacity(100);
        this.addChild(colorLayer);

        this.infoLayer = new cc.Layer();
        this.addChild(this.infoLayer);

        this.getFriendsList();

        var btnBack = cc.MenuItemImage.create(res.btn_normal_png, res.btn_press_png, this.backToMenu, this);
        var backLabel = cc.LabelTTF.create("返回菜单", "Arial", 25);
        backLabel.setPosition(cc.p( btnBack.getContentSize().width / 2, btnBack.getContentSize().height / 2));
        btnBack.addChild(backLabel);

        var menu = cc.Menu.create(btnBack);
        menu.x = winSize.width / 2;
        menu.y = 30;
        this.addChild(menu);
    },

    getFriendsList:function(){
        tencentUtils.showLoading("获取好友列表ing...");
        pluginManager.getFriendsList(function (ret, msg) {
            if (ret === SocialRetCode.kSocialGetFriendsInfoSuccess) {

                var obj = JSON.parse(msg);
                var friendList = obj.friends;
                if (friendList) {
                    //todo:由于没有服务端，所以只能使用模拟数据进行加载，真实接入的时候，请在用户登录游戏的时候，保存qbopenid和iconURL到服务端，获取好友的时候，进行id匹配查询
                    var friendsInfo = [];
                    for (var i = 0; i < friendList.length; i++) {
                        var item = {iconUrl: this.picList[i % 10], nickName: "CososRuntime" + i};
                        friendsInfo.push(item);
                    }
                    var friendItemList = new TencentItemList("friends", friendsInfo);
                    this.infoLayer.removeAllChildren();
                    this.infoLayer.addChild(friendItemList);
                    tencentUtils.hideLoading();
                }
            } else if (ret === SocialRetCode.kSocialGetFriendsInfoFail) {
                Utils.showToast("获取好友信息失败");
            } else if (ret === SocialRetCode.kSocialGetFriendsInfoCancel) {
                Utils.showToast("获取好友信息被取消");
            } else if (ret === SocialRetCode.kSocialGetFriendsInfoNeedLoginAgain) {
                Utils.showToast("需要重新登录");
            } else {
                Utils.showToast("未知返回码");
            }
        }.bind(this));
    },

    backToMenu:function(){
        cc.director.popScene();
    },
});

var TencentItemList = cc.Layer.extend({
    infoList: null,
    type: null,
    ctor: function (type, list) {
        this._super();
        this.type = type;
        this.infoList = list;
    },
    onEnter: function () {
        this._super();
        this.createTableView();
    },
    createTableView: function () {
        var bg = new cc.Scale9Sprite(res.list_bg, cc.rect(0, 0, 96, 100), cc.rect(30, 30, 36, 40));
        bg.setContentSize(cc.size(400, 450));
        this.addChild(bg);
        bg.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, -30)));
        var closeButton = new cc.MenuItemImage(res.close_normal, res.close_pressed, function () {
            this.removeFromParent();
        }, this);
        closeButton.setScale(0.8);
        var menu = new cc.Menu(closeButton);
        menu.setAnchorPoint(cc.p(0, 0)), menu.setPosition(cc.p(0, 0));
        closeButton.setPosition(400, 450);
        bg.addChild(menu);
        var tableView = new cc.TableView(this, cc.size(340, 390));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setPosition(cc.p(30, 30));
        tableView.setAnchorPoint(cc.p(0, 0));
        tableView.setDelegate(this);
        bg.addChild(tableView);
        tableView.reloadData();
    },
    tableCellAtIndex: function (table, idx) {
        var strValue = idx.toFixed(0);
        var cell = table.dequeueCell();
        if (!cell) {
            if (this.type == "friends") {
                cell = new TencentFriendItem(this.getInfo(strValue));
            } //else {
            //    cell = new TencentPayItem(this.getInfo(strValue));
            //}
        }
        return cell;
    },
    getInfo: function (index) {
        return this.infoList[index];
    },
    numberOfCellsInTableView: function (table) {
        return this.infoList.length;
    },
    tableCellTouched: function (table, cell) {
        cc.log("cell touched at index: " + cell.getIdx());
    },
    tableCellSizeForIndex: function (table, idx) {
        return cc.size(340, 85);
    }
});

var TencentFriendItem = cc.TableViewCell.extend({
    info: null,
    ctor: function (info) {
        this._super();
        this.info = info;
    },
    onEnter: function () {
        this._super();
        this.setContentSize(cc.size(340, 80));
        this.init(this.info.iconUrl, this.info.nickName);
    },
    init: function (iconUrl, nickName) {
        var layer = new cc.LayerColor();
        layer.setColor(cc.color(77, 255, 250));
        layer.setContentSize(340, 80);
        var name = new cc.LabelTTF(nickName, "Arial", 20);
        name.setColor(cc.color(0, 0, 0));
        layer.addChild(name);
        layer.setPosition(cc.p(0, 0));
        layer.setAnchorPoint(cc.p(0, 0));
        this.addChild(layer);
        name.setPosition(cc.p(150, 40));
        var icon = new cc.Sprite(res.default_photo);
        icon.setAnchorPoint(cc.p(0, 0));
        layer.addChild(icon);
        icon.setPosition(cc.p(10, 10));
        cc.loader.loadImg(iconUrl, {width: 60, height: 60}, function (error, texture) {
            if (!error) {
                icon.initWithTexture(texture);
                icon.setAnchorPoint(cc.p(0, 0));
            }
        });
    }
});

var FriendsScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new FriendsLayer();
        this.addChild(layer);
    },
});