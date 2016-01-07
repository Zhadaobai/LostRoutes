/**
 * Created by cocos on 15/12/29.
 */
var GameOverLayer = cc.Layer.extend({
    score : 0,
    touchListener : null,

    ctor:function(score){
        cc.log("GameOverLayer ctor");

        this._super();
        this.score = score;

        var bg = new cc.TMXTiledMap(res.blue_bg_tmx);
        this.addChild(bg);

        var ps = new cc.ParticleSystem(res.light_plist);
        ps.x = winSize.width / 2;
        ps.y = winSize.height - 100;
        this.addChild(ps);

        var page = new cc.Sprite("#gameover.page.png");
        page.x = winSize.width / 2;
        page.y = winSize.height -300;
        this.addChild(page);

        var scoreLabel = new cc.LabelBMFont(this.score,res.BMFont_fnt);
        scoreLabel.x = winSize.width / 2;
        scoreLabel.y = winSize.height - 600;
        this.addChild(scoreLabel);

        var highScore = cc.sys.localStorage.getItem(HIGHSCORE_KEY);
        highScore = highScore == null ? 0 : highScore;
        if(highScore < this.score){
            highScore = this.score;
            cc.sys.localStorage.setItem(HIGHSCORE_KEY, highScore);
        }

        var hscore = new cc.Sprite("#Score.png");
        hscore.x = 223;
        hscore.y = winSize.height - 700;
        this.addChild(hscore);

        var highScoreLabel = new cc.LabelBMFont(highScore, res.BMFont_fnt);
        highScoreLabel.x = hscore.x + hscore.getContentSize().width;
        highScoreLabel.y = hscore.y;
        this.addChild(highScoreLabel);

        var tap = new cc.Sprite("#Tap.png");
        tap.x = winSize.width / 2;
        tap.y = winSize.height - 860;
        this.addChild(tap);

        this.touchListener = cc.EventListener.create({
            event : cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches : true,
            onTouchBegan:function(touch,event){
                if(effectStatus == BOOL.YES){
                    cc.audioEngine.playEffect(res_platform.effectBlip);
                }
                cc.director.popScene();

                return false;
            }
        });

        cc.eventManager.addListener(this.touchListener, this);
        this.touchListener.retain();
        return true;
    },

    onEnter:function(){
        this._super();
        cc.log("GameOverLayer onEnter");
    },

    onEnterTransitionDidFinish:function(){
        this._super();
        cc.log("GameOverLayer onEnterTransitionDidFinish");

        if(musicStatus == BOOL.YES){
            cc.audioEngine.playMusic(res_platform.musicGame, this);
        }
    },

    onExit:function(){
        this._super();
        cc.log("GameOverLayer onExit");

        if(this.touchListener != null){
            cc.eventManager.removeListener(this.touchListener);
            this.touchListener.release();
            this.touchListener == null;
        }
    },

    onExitTransitionDidStart:function() {
        this._super();
        cc.log("GameOverLayer onExitTransitionDidStart");

        cc.audioEngine.stopMusic(res_platform.musicGame);
    },
});

var GameOverScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
    }
});