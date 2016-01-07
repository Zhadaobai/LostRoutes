var res = {
    loading_jpg : "res/loading/loading.jpg",

    red_tiles_png : "res/map/redTiles.png",
    bule_tiles_png : "res/map/blueTiles.png",

    explosion_plist : "res/particle/explosion.plist",
    fire_plist : "res/particle/fire.plist",
    light_plist : "res/particle/light.plist",

    blue_bg_tmx : "res/map/blueBg.tmx",
    red_bg_tmx : "res/map/redBg.tmx",
    play_bg_tmx : "res/map/playBg.tmx",

    BMFont_fnt : "res/fonts/BMFont.fnt",
    BMFont_png : "res/fonts/BMFont.png",

    btn_normal_png:"res/btn_normal.png",
    btn_press_png:"res/btn_pressed.png",

    list_bg:"res/listbg.png",
    close_normal:"res/close.png",
    close_pressed:"res/close_sel.png",
    default_photo:"res/photo.png"
};

var res_platform = {};

//ios
var res_NativeiOS = {
    texture_res : 'res/texture/LostRoutes_Texture.pvr.gz',
    texture_plist : 'res/texture/LostRoutes_Texture.plist',

    musicGame : "res/sound/gameBg.aifc",
    musicHome : "res/sound/homeBg.aifc",

    effectExplosion : "res/sound/Explosion.caf",
    effectBlip : "res/sound/Blip.caf"
};

//Android & Web
var res_Other = {
    texture_res : 'res/texture/LostRoutes_Texture.png',
    texture_plist : 'res/texture/LostRoutes_Texture.plist',

    musicGame : "res/sound/gameBg.mp3",
    musicHome : "res/sound/homeBg.mp3",

    effectExplpsion : "res/sound/Explosion.wav",
    effectBlip : "res/sound/Blip.wav"
};

var g_resources = [];

if(cc.sys.os == cc.sys.OS_IOS){
    res_platform = res_NativeiOS;
}else{
    res_platform = res_Other;
}

for (var i in res) {
    g_resources.push(res[i]);
}

for( var i in res_platform) {
    g_resources.push(res_platform[i]);
}
