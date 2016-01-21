/**
 * Created by cocos on 16/1/21.
 */
var plugin_channel = null;
var _ads = null;
var _share = null;
var _push = null;
var _social = null;
var _analytics = null;

var LINE_SPACE = 40;
var ITEM_TAG_BASIC = 1000;

var anySDKTestItemNames = [
    {
        itemTitle:"User and IAP System",
        testScene:function () {
            //runPluginChannelTest();
        }
    },
    {
        itemTitle:"Share System",
        testScene:function () {
            //runShareTest();
        }
    },
    {
        itemTitle:"Ads System",
        testScene:function () {
            //runAdsTest();
        }
    },
    {
        itemTitle:"Social System",
        testScene:function () {
            //runSocialTest();
        }
    },
    {
        itemTitle:"Push System",
        testScene:function () {
            //runPushTest();
        }
    },
    {
        itemTitle:"Analytics System",
        testScene:function () {
            //runAnalyticsTest();
        }
    }
];

