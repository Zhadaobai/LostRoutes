/**
 * Created by cocos on 15/12/28.
 */

EFFECT_KEY = "sound_key";
MUSIC_KEY = "music_key";
HIGHSCORE_KEY = "highscore_key"

HomeMenuActionTypes = {
    MenuItemStart : 100,
    MenuItemSetting : 101,
    MenuItemHelp : 102
};

EnemyTypes = {
    Enemy_Stone : 0,
    Enemy_1 : 1,
    Enemy_2 : 2,
    Enemy_Planet : 3
};

EnemyName = {
    Enemy_Stone : "gameplay.stone1.png",
    Enemy_1 : "gameplay.enemy-1.png",
    Enemy_2 : "gameplay.enemy-2.png",
    Enemy_Planet : "gameplay.enemy.planet.png"
};

GameSceneNodeTag = {
    StatusBarFighterNode : 301,
    StatusBarLifeNode : 302,
    StatusBarScore : 303,
    BatchBackground : 800,
    Fighter : 900,
    ExplosionParticleSystem : 901,
    Bullet : 100,
    Enemy : 700,
    BackgroundSprite_1 : 801,
    BackgroundSprite_2 : 802
};

Sprite_Velocity = {
    Enemy_Stone : cc.p(0,-300),
    Enemy_1 : cc.p(0,-80),
    Enemy_2 : cc.p(0,-100),
    Enemy_Planet : cc.p(0,-50),
    Bullet : cc.p(0,300)
};

EnemyScores = {
    Enemy_Stone : 50,
    Enemy_1 : 100,
    Enemy_2 : 150,
    Enemy_Planet : 200
};

Enemy_initialHitPoints = {
    Enemy_Sotne : 3,
    Enemy_1 : 5,
    Enemy_2 : 15,
    Enemy_Planet : 20
};

Fighter_hitPoints = 5;

Collision_Type = {
    Enemy : 1,
    Fighter : 1,
    Bullet : 1
};

BOOL = {
    NO : 0,
    YES : 1
};







