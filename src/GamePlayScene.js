/**
 * Created by cocos on 15/12/29.
 */
var GamePlayLayer = cc.Layer.extend({
    fighter : null,
    space : null,
    score : 0,
    scorePlaceHolder : 0,
    menu : null,
    touchFighterlistener : null,

    as1 : null,
    as2 : null,


    ctor:function(){
        this._super();

        this.initPhysics();
        this.initBG();
        this.scheduleUpdate();

        return true;
    },

    initPhysics:function(){
        this.space = new cp.Space();

        this.space.gravity = cp.v(0,0);
        this.space.addCollisionHandler(Collision_Type.Bullet,Collision_Type.Enemy,this.collisionBegin.bind(this),null,null,null);
    },

    initBG:function(){
        var bg = new cc.TMXTiledMap(res.blue_bg_tmx);
        this.addChild(bg, 0, GameSceneNodeTag.BatchBackground);

        var ps = new cc.ParticleSystem(res.light_plist);
        ps.x = winSize.width / 2;
        ps.y = winSize.height / 2;
        this.addChild(ps, 0, GameSceneNodeTag.BatchBackground);

        var sprite1 = new cc.Sprite("#gameplay.bg.sprite-1.png");
        sprite1.setPosition(cc.p(-50, -50));
        this.addChild(sprite1, 0, GameSceneNodeTag.BackgroundSprite_1);

        var ac1 = cc.moveBy(20, cc.p(500, 600));
        var ac2 = ac1.reverse();
        var se1 = cc.sequence(ac1, ac2);
        as1 = cc.repeatForever(new cc.EaseSineInOut(se1));
        sprite1.runAction(as1);

        var sprite2 = new cc.Sprite("#gameplay.bg.sprite-2.png");
        sprite2.setPosition(cc.p(winSize.width, 0));
        this.addChild(sprite2, 0, GameSceneNodeTag.BackgroundSprite_2);

        var ac3 = cc.moveBy(10, cc.p(-500, 600));
        var ac4 = ac3.reverse();
        var se2 = cc.sequence(ac3, ac4);
        as2 = cc.repeatForever(new cc.EaseExponentialInOut(se2));
        sprite2.runAction(as2);

        var pauseMenuItem = new cc.MenuItemImage(
            "#button.pause.png", "#button.pause.png",
            this.menuPauseCallback, this
        );
        var pauseMenu = new cc.Menu(pauseMenuItem);
        pauseMenu.setPosition(cc.p(40, winSize.height - 40));
        this.addChild(pauseMenu, 200, 999);

        var stone1 = new Enemy(EnemyTypes.Enemy_Stone, this.space);
        this.addChild(stone1, 10, GameSceneNodeTag.BatchBackground);

        var planet = new Enemy(EnemyTypes.Enemy_Planet,this.space);
        this.addChild(planet, 10, GameSceneNodeTag.Enemy);

        var enemyFighter1 = new Enemy(EnemyTypes.Enemy_1, this.space);
        this.addChild(enemyFighter1, 10, GameSceneNodeTag.Enemy);

        var enemyFighter2 = new Enemy(EnemyTypes.Enemy_2, this.space);
        this.addChild(enemyFighter2, 10, GameSceneNodeTag.Enemy);

        this.fighter = new Fighter("#gameplay.fighter.png", this.space);
        this.fighter.body.setPos(cc.p(winSize.width / 2, 70));
        this.fighter.hitPoints = Fighter_hitPoints;
        this.addChild(this.fighter, 10, GameSceneNodeTag.Fighter);

        this.touchFighterlistener = cc.EventListener.create({
            event : cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches : true,
            onTouchBegan : function(touch,event){
                return true;
            },
            onTouchMoved : function(touch,event){
                var target = event.getCurrentTarget();
                var delta = touch.getDelta();

                var pos_x = target.body.getPos().x + delta.x;
                var pos_y = target.body.getPos().y + delta.y;
                target.body.setPos(cc.p(pos_x, pos_y));
            }
        });

        cc.eventManager.addListener(this.touchFighterlistener,this.fighter);
        this.touchFighterlistener.retain();

        this.schedule(this.shootBullet, 0.2);

        this.score = 0;
        this.updateStatusBarFighter();
        this.updateStatusBarScore();

    },

    menuPauseCallback:function(sender){
        if(effectStatus == BOOL.YES){
            cc.audioEngine.playEffect(res_platform.effectBlip);
        }

        var nodes = this.getChildren();
        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i];
            node.unscheduleUpdate();
            this.unschedule(this.shootBullet);

            if(node.tag == GameSceneNodeTag.BackgroundSprite_1){
                //node.stopAction(as1);
                cc.director.getActionManager().pauseTarget(node);
            }
            if(node.tag == GameSceneNodeTag.BackgroundSprite_2){
                //node.stopAction(as2);
                cc.director.getActionManager().pauseTarget(node);
            }
        }

        cc.eventManager.pauseTarget(this.fighter);

        var backNormal = new cc.Sprite("#button.back.png");
        var backSelected = new cc.Sprite("#button.back-on.png");
        var backMenuItem = new cc.MenuItemSprite(backNormal, backSelected,
            function (sender){
                if(effectStatus == BOOL.YES){
                    cc.audioEngine.playEffect(res_platform.effectBlip);
                }

                cc.director.popScene();
        }, this);

        var resumeNormal = new cc.Sprite("#button.resume.png");
        var resumeSelected = new cc.Sprite("#button.resume-on.png");
        var resumeMenuItem = new cc.MenuItemSprite(resumeNormal, resumeSelected,
            function (sender) {
                if (effectStatus == BOOL.YES) {
                    cc.audioEngine.playEffect(res_platform.effectBlip);
                }

                var nodes = this.getChildren();
                for(var i = 0; i < nodes.length; i++){
                    var node = nodes[i];
                    node.scheduleUpdate();
                    this.schedule(this.shootBullet, 0.2);

                    if(node.tag == GameSceneNodeTag.BackgroundSprite_1){
                        //node.runAction(as1);
                        cc.director.getActionManager().resumeTarget(node);
                    }
                    if(node.tag == GameSceneNodeTag.BackgroundSprite_2){
                        //node.runAction(as2);
                        cc.director.getActionManager().resumeTarget(node);
                    }
                }

                cc.eventManager.resumeTarget(this.fighter);
                this.removeChild(this.menu);
            }, this);

        this.menu = new cc.Menu(backMenuItem,resumeMenuItem);
        this.menu.alignItemsVertically();
        this.menu.x = winSize.width / 2;
        this.menu.y = winSize.height / 2;

        this.addChild(this.menu,20,1000);
    },

    update:function(dt){
        var timeStep = 0.03;
        this.space.step(timeStep);
    },

    collisionBegin:function(arbiter,space){
        var shapes = arbiter.getShapes();

        var bodyA = shapes[0].getBody();
        var bodyB = shapes[1].getBody();
        var spriteA = bodyA.data;
        var spriteB = bodyB.data;

        if(spriteA instanceof Bullet && spriteB instanceof Enemy && spriteB.isVisible()){
            spriteA.setVisible(false);
            this.handleBulletCollidingWithEnemy(spriteB);
            return false;
        }
        if(spriteA instanceof Enemy && spriteA.isVisible() && spriteB instanceof Bullet){
            spriteB.setVisible(false);
            this.handleBulletCollidingWithEnemy(spriteA);
            return false;
        }

        if(spriteA instanceof Fighter && spriteB.isVisible() && spriteB instanceof Enemy){
            this.handleFighterCollidingWithEnemy(spriteB);
            return false;
        }
        if(spriteA instanceof Enemy && spriteA.isVisible() && spriteB instanceof Fighter){
            this.handleFighterCollidingWithEnemy(spriteA);
            //return false;
        }

        return false;
    },

    handleBulletCollidingWithEnemy:function(enemy){
        enemy.hitPoints--;

        if(enemy.hitPoints <= 0){
            var node = this.getChildByTag(GameSceneNodeTag.ExplosionParticleSystem);
            if(node){
                this.removeChild(node);
            }

            var explosion = new cc.ParticleSystem(res.explosion_plist);
            explosion.x = enemy.x;
            explosion.y = enemy.y;
            this.addChild(explosion, 2, GameSceneNodeTag.ExplosionParticleSystem);

            if(effectStatus == BOOL.YES){
                cc.audioEngine.playEffect(res_platform.effectExplosion);
            }

            switch(enemy.enemyType){
                case EnemyTypes.Enemy_Stone:
                    this.score += EnemyScores.Enemy_Stone;
                    this.scorePlaceHolder += EnemyScores.Enemy_Stone;
                    break;

                case EnemyTypes.Enemy_Planet:
                    this.score += EnemyScores.Enemy_Planet;
                    this.scorePlaceHolder += EnemyScores.Enemy_Planet;
                    break;

                case EnemyTypes.Enemy_1:
                    this.score += EnemyScores.Enemy_1;
                    this.scorePlaceHolder += EnemyScores.Enemy_1;
                    break;

                case EnemyTypes.Enemy_2:
                    this.score += EnemyScores.Enemy_2;
                    this.scorePlaceHolder += EnemyScores.Enemy_2;
            }

            if(this.scorePlaceHolder >= 1000){
                this.fighter.hitPoints++;
                this.updateStatusBarFighter();
                this.scorePlaceHolder -= 1000;
            }

            this.updateStatusBarScore();

            enemy.setVisible(false);
            enemy.spawn();
        }


    },

    handleFighterCollidingWithEnemy:function(enemy){
        var node = this.getChildByTag(GameSceneNodeTag.ExplosionParticleSystem);
        if(node){
            this.removeChild(node);
        }

        var explosion = new cc.ParticleSystem(res.explosion_plist);
        explosion.x = this.fighter.x;
        explosion.y = this.fighter.y;
        this.addChild(explosion, 2, GameSceneNodeTag.ExplosionParticleSystem);

        if(effectStatus == BOOL.YES){
            cc.audioEngine.playEffect(res_platform.effectExplosion);
        }

        enemy.setVisible(false);
        enemy.spawn();

        this.fighter.hitPoints--;
        this.updateStatusBarFighter();

        if(this.fighter.hitPoints <= 0){
            cc.log("gameover");

            var scene = new GameOverScene();
            var layer = new GameOverLayer(this.score);
            scene.addChild(layer);
            cc.director.pushScene(new cc.TransitionFade(1,scene));
        }else{
            this.fighter.body.setPos(cc.p(winSize.width / 2, 70));
            var ac1 = cc.show();
            var ac2 = cc.fadeIn(3,0);
            var seq = cc.sequence(ac1,ac2);
            this.fighter.runAction(seq);
        }
    },

    shootBullet:function(){
        if(this.fighter && this.fighter.isVisible()){
            var bullet = Bullet.create("#gameplay.bullet.png", this.space);
            bullet.velocity = Sprite_Velocity.Bullet;

            if(bullet.getParent() == null){
                this.addChild(bullet, 0, GameSceneNodeTag.Bullet);
                cc.pool.putInPool(bullet);
            }

            bullet.shootBulletFromFighter(cc.p(this.fighter.x, this.fighter.y + this.fighter.getContentSize().height / 2));
        }
    },

    updateStatusBarScore:function(){
        var n = this.getChildByTag(GameSceneNodeTag.StatusBarScore);
        if(n){
            this.removeChild(n);
        }

        var scoreLabel = new cc.LabelBMFont(this.score, res.BMFont_fnt);
        scoreLabel.setScale(0.8);
        scoreLabel.x = winSize.width / 2;
        scoreLabel.y = winSize.height - 28;

        this.addChild(scoreLabel, 20, GameSceneNodeTag.StatusBarScore);
    },

    updateStatusBarFighter:function(){
        var n = this.getChildByTag(GameSceneNodeTag.StatusBarFighterNode);
        if(n){
            this.removeChild(n);
        }

        var fg = new cc.Sprite("#gameplay.life.png");
        fg.x = winSize.width - 80;
        fg.y = winSize.height - 28;
        this.addChild(fg, 20, GameSceneNodeTag.StatusBarFighterNode);

        var n2 = this.getChildByTag(GameSceneNodeTag.StatusBarLifeNode);
        if(n2){
            this.removeChild(n2);
        }
        if(this.fighter.hitPoints < 0){
            this.fighter.hitPoints = 0;
        }

        var lifeLabel = new cc.LabelBMFont("X" + this.fighter.hitPoints, res.BMFont_fnt);
        lifeLabel.setScale(0.5);
        lifeLabel.x = fg.x + 40;
        lifeLabel.y = fg.y;

        this.addChild(lifeLabel, 20, GameSceneNodeTag.StatusBarLifeNode);
    },

    onEnter:function(){
        this._super();
        cc.log("GamePlayLayer onEnter");
    },
    onEnterTransitionDidFinish:function(){
        this._super();

        cc.log("GamePlayLayer onEnterTransitionDidFinish");

        if(musicStatus == BOOL.YES){
            cc.audioEngine.playMusic(res_platform.musicGame,true);
        }
    },
    onExit:function(){
        cc.log("GamePlayLayer onExit");

        this.unscheduleUpdate();
        this.unschedule(this.shootBullet);

        if(this.touchFighterlistener != null){
            cc.eventManager.removeListener(this.touchFighterlistener);
            this.touchFighterlistener.release();
            this.touchFighterlistener = null;
        }

        this.removeAllChildren(true);
        cc.pool.drainAllPools();
        this._super();
    },
    onExitTransitionDidStart:function(){
        this._super();
        cc.log("GamePlayLayer onExitTransitionDidStart");
        cc.audioEngine.stopMusic(res_platform.musicGame);
    },
});

var GamePlayScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new GamePlayLayer();
        this.addChild(layer);
    }
});