import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 隐忍天弓 = {
    sun_simayi: ["male", "wei", 3, ["sunquanmou", "sunxiongyi", "sunpingling"], ["doublegroup:wei:jin"]],
    sun_zhangchunhua: ["female", "wei", 3, ["sunjueqing", "sunshangshi"], ["doublegroup:wei:jin"]],
};
export const 鼎足三分 = {
    TAF_sf_caocao: ["male", "wei", "3/4", ["thunderguixin", "thunderchiling", "thunderfeiying", "thunderhujia"], ["zhu"]],
    TAF_sf_liubei: ["male", "shu", "3/4", ["firezhaoren", "firezhaolie", "firedilu", "firejieying"], ["zhu"]],
    TAF_sf_sunquan: ["male", "wu", "3/4", ["wateryuheng", "wateryuxin", "wateryulong", "waterquanshu"], ["zhu"]],
    TAF_sf_zhangjiao: ["male", "qun", 3, [], ["zhu"]],
};
export const 星河皓月 = {
    moon_guojia: ["male", "wei", 3, ["thunderqizuo","thunderlunshi","thunderjiding"], []],
    moon_zhugeliang: ["male", "shu", 3, [ "starszhuanzhen", "starsliangyi", "starssixiang", "starsbazhen" ], []],
    moon_zhouyu: ["male", "wu", 3, ["moonyingzi", "moonyingmou"], []],
    moon_simahui: ["male", "qun", 3, ["iceshuijing","icejianjie","iceyinshi"], []],
};
export const 惊世银竹 = {
    thunder_caochun: ["male", "wei", "3/4", ["thundershanjia"], []],
    thunder_caopi: ["male", "wei", 3, ["thunderfangzhu", "thunderxingshang", "thundersongwei"], ["zhu"]],
    thunder_wangji: ["male", "wei", "3/4", ["thunderqizhi", "thunderjinqu"], []],
    thunder_wenyang: ["male", "wei", "3/4", ["thunderquedi", "thunderlvli", "thunderchoujue"], []],
    thunder_zhonghui: ["male", "wei", "3/4", ["thunderyulei", "thunderfulong","thunderyujun"], []],
};
export const 期期离火 = {
    fire_baosanniang: ["female", "shu", 3, ["firezhenwu","firezhennan","firefangzong"], []],
    fire_guanyinping: ["female", "shu", 3, ["firexuehen", "firehuxiao", "firefengming"], []],
    fire_zhangxingcai: ["female", "shu", "3/4", ["fireshenxian", "fireqiangwu", "fireyuzhui"], []],
    fire_zhaoxiang: ["female", "shu", 2, ["firefengpo","firehunyou"], []],
    fire_jiangwei: ["male", "shu", "3/4", ["firelinyan","firebazhen","fireyujun"], ["doublegroup:shu:qun"]],
};
export const 欲雨临泽 = {
    water_lukang: ["male", "wu", "3/4", ["waterkegou","waterposhi"], []],
    water_luxun: ["male", "wu", "2/4", ["waterjunlve", "watercuike", "waterzhanhuo"], []],
    water_sunce: ["male", "wu", "3/4", ["waterjiang", "waterhunzi", "wateryinghun"], []],
    water_sunshangxiang: ["female", "wu", 3, ["waterbeiwu", "waterxiaoji", "waterliangzhu"], []],
    water_sunhanhua: ["female", "wu", 3, ["waterhuiling", "watertaji", "waterqinghuang"], ["doublegroup:wu:shen"]],
};
export const 惊鸿玉蝶 = {
    ice_diaochan: ["female", "qun", 3, ["icelijian", "icebiyue"], []],
    ice_lvlingqi: ["female", "qun", 3, ["icewushuang", "iceshenwu", "iceshenwei"], []],
    ice_zhangning: ["female", "qun", 3, ["icetianze", "icedifa"], []],
    ice_zhangqiying: ["female", "qun", 3, ["icefalu","icedianhua","icezhenyi"], []],
    ice_caoying: ["female", "qun", "3/4", ["icelingren", "icefujian"], ["doublegroup:qun:wei"]],
};
export const 神话再临 = {
    TAF_shen_jiangtaixu: ["female", "shen", 4, ["TAFjingtu","TAFjuechen","TAFshenqu"], []],
    TAF_shen_pangtong: ["male", "shen", 2, ["TAFxuanyu","TAFfenshen","TAFyuhuo"], []],
    TAF_shen_tongyu: ["female", "shen", 4, ["TAFtianci","TAFxingqi","TAFxingpan"], []],
    TAF_shen_tongyu_shadow: ["female", "shen", 3, ["TAFshuangjiang","TAFxuewu","TAFxingpan_shadow","TAFfanzhuan",], ["unseen"]],
    TAF_shen_zhaoyun: ["male", "shen", 2, ["TAFjuejing","TAFlonghun"], []],
};
export const 雾山五行 = {
    TAF_wx_xuanyuan_shenjun: ["male", "qun", 4, ["TAFwuxing","TAFjianzhen"], []],
    TAF_wx_rongcheng_moxi: ["female", "qun", 3, ["TAFwuxing","TAFsenyu"], []],
    TAF_wx_rongcheng_zeqi: ["female", "qun", 3, ["TAFwuxing"], []],
    TAF_wx_shentu_ziye: ["male", "qun", 3, ["TAFwuxing","TAFshunshan"], []],
    TAF_wx_shentu_yuanshu: ["female", "qun", 3, ["TAFwuxing"], []],
    TAF_wx_wenren_yixuan: ["male", "qun", 4, ["TAFwuxing"], []],
    TAF_wx_wenren_jingxuan: ["male", "qun", 4, ["TAFwuxing","TAFyanyan"], []],
    TAF_wx_gongyi_churen: ["female", "qun", 4, ["TAFwuxing"], []],
    TAF_wx_shuiguanzunzhe: ["male", "qun", 3, [], []],
    TAF_wx_suxiaoan: ["female", "qun", 3, [], []],
};
export const 爆料体验 = {
    TAF_bl_shenhuangzhong: ["male", "shen", 4, ["firelieqiong","firezhanjue"], []],
    TAF_bl_shenjiaxu: ["male", "shen", 4, ["icejiandai", "icefangcan", "icejuehun", "iceluoshu"], []],
	TAF_bl_Wulvmeng: ["male", "wu", 4, ["waterjuxian","watershiji","waterzhanxian"], []],
    TAF_bl_Wuhuangfusong: ["male", "qun", '1/4', ["icechaozhen","icelianjie","icejiangxian"], []],
	TAF_bl_OLnanhualaoxian: ["male", "qun", 4, ["iceqingshu","iceshoushu","icehedao"], []],
};
export const 其他武将 = {
    TAF_qt_SEjiaxu: ["male", "qun", 4, ["thunderweimu","thunderwenhe","thundermoushen"], []],
    TAF_qt_SElinxi: ["female", "qun", "3/4", ["icexihuo","icelingxi","icedoumao"], []],
    TAF_qt_xujie: ["male", "qun", 4, ["mingxinxue","mingyinren"], []],
    TAF_qt_zhoushuren: ["male", "qun", 4, ["icexueyi","icejiuguo","icejiuguo_shezhanqunru"], []],
    TAF_qt_SEzhugeliang: ["male", "qun", 5, ["icebuyi","icelongdui","icechushan",], []],
    TAF_qt_SEsunluban: ["female", "wu", 3, ["waterjiaoman"], []],
};
const BossKey = lib.config.extension_银竹离火_TAFset_TAF_boss;
if (BossKey) {
    其他武将["TAF_qt_shenlvbu"] = ["male", "shen", 5, ["TAF_mashu_shadow","TAF_kuangbao_shadow","TAF_wushuang","TAF_xiuluo_shadow"], []];
    其他武将["TAF_qt_shenguigaoda"] = ["male", "shen", "1/2", ["TAF_boss_juejing", "TAF_boss_wushuang","TAF_boss_longhun", "TAF_boss_jiwu", "TAF_boss_shenqu"], []];
}
export const 异构Boss = {// 🌩️·异构Boss(乱斗挑战专属)
    TAF_boss_shenlvbu1: ["male", "shen", 60, ["TAF_mashu","TAF_wushuang","TAF_baguan","TAF_zhanjia","TAF_xuli"], ["boss"]],
    TAF_boss_shenlvbu2: ["male", "shen", 30, ["TAF_chiyan","TAF_wushuang","TAF_zhankai","TAF_xiuluo","TAF_shenwu_equips"], ["hiddenboss",]],//"unseen"
    TAF_boss_shenguigaoda: ["male", "shen", "1/2", ["TAF_boss_juejing", "TAF_boss_wushuang","TAF_boss_longhun", "TAF_boss_jiwu", "TAF_boss_shenqu"], ["boss"]],
};
export const 将灵专属 = {// 🌀·将灵专属(全模式禁用)
    sznjl_shenzhaoyun: ["male", "shen", 3, ['sznjl_juejing','sznjl_longhun'], []],
    sznjl_caochun: ["male", "wei", 3, ['sznjl_shanjia','sznjl_xiaorui'], []],
    sznjl_caoying: ["female", "wei", 3, ['sznjl_lingren','sznjl_fujian'], []],
    sznjl_guansuo: ["male", "shu", 3, ['sznjl_xiefang','sznjl_zhengnan'], []],
    sznjl_zhaoxiang: ["female", "shu", 3, ['sznjl_fanghun','sznjl_fuhan'], []],
    sznjl_nianshou: ["male", "qun", 3, ['sznjl_fange','sznjl_xunlie'], []],
    sznjl_lingju: ["female", "qun", 3, ['sznjl_jieyuan','sznjl_fenxin'], []],
    sznjl_simayiyi: ["female", "qun", 3, ['sznjl_yizuo','sznjl_zhengwei'], []],
    sznjl_xiaosha: ["female", "qun", 3, ['sznjl_guisha','sznjl_shuli'], []],
    sznjl_xiaoshan: ["female", "qun", 3, ['sznjl_shanpo','sznjl_tanhua'], []],
};
export const 测试专属 = {// 🌌·测试专属(全模式禁用)
    //"TAF_cs_ceshi": ["female", "shen", 3, ['sznjl_fanghun','sznjl_fuhan'], []],
    "TAF_cs_ceshi": ["male", "shen", 3, ["iceceshiSkill",'watertaji'], []],
};
const characters = { 
    ...隐忍天弓, ...鼎足三分, ...星河皓月, ...惊世银竹, 
    ...期期离火, ...欲雨临泽, ...惊鸿玉蝶, ...神话再临, 
    ...雾山五行, ...爆料体验, ...其他武将, ...异构Boss, 
    ...将灵专属, ...测试专属, 
};
export default characters;
