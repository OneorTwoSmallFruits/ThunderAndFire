import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 隐忍天弓 = {
    sun_simayi: "隐忍天弓",
    sun_zhangchunhua: "宣穆皇后",
};
const 鼎足三分 = {
    TAF_sf_caocao: "扫清六合·席卷八荒",
    TAF_sf_liubei: "炎汉百载",
    TAF_sf_sunquan: "制衡天下",
    TAF_sf_zhangjiao: "末世的起首",
};
const 星河皓月 = {
    moon_zhouyu: "奠定三分",
    moon_zhugeliang: "鞠躬尽瘁",
    moon_guojia: "以身证道",
    moon_simahui: "水镜先生、by_绘声03",
};
const 惊世银竹 = {
    thunder_caopi: "霸业的继承者",
    thunder_wenyang: "万将披靡",
    thunder_caochun: "虎豹骁骑",
    thunder_wangji: "奇兵胜敌",
    thunder_zhonghui: "约据蜀地",
};
const 期期离火 = {
    fire_jiangwei: "钟姜何为",
    fire_zhaoxiang: "凤魄龙魂",
    fire_guanyinping: "虎啸凤鸣",
    fire_zhangxingcai: "敬哀皇后",
    fire_baosanniang: "平南之巾帼",
};
const 欲雨临泽 = {
    water_sunce: "魂牵江东",
    water_luxun: "绽火连营",
    water_lukang: "社稷之瑰宝&&克构者",
    water_sunshangxiang: "情断吴江",
    water_sunhanhua: "挣绽的青莲",
};
const 惊鸿玉蝶 = {
    ice_zhangqiying: "禳祷西东、by_想去远方",
    ice_lvlingqi: "无双虓姬",
    ice_diaochan: "绝世的舞姬",
    ice_zhangning: "大贤后人",
    ice_caoying: "凤鸣都督",
};
const 神话再临 = {
    TAF_shen_zhaoyun: "神威如龙",
    TAF_shen_pangtong: "丹血浴火、by_白露为霜",
    TAF_shen_jiangtaixu: "by_白露为霜",
    TAF_shen_tongyu: "天启星魂、by_想去远方",
    TAF_shen_tongyu_shadow: "天启星魂、by_想去远方",
};
const 雾山五行 = { 
    TAF_wx_wenren_yixuan: "阴阳双子",
    TAF_wx_shentu_ziye: "水无常形",
    TAF_wx_shuiguanzunzhe: "春江水暖鸭先知",
};
const 爆料体验 = { 
    TAF_bl_shenhuangzhong: "挽弓射月",
    TAF_bl_shenjiaxu: "晦谋独善",
    TAF_bl_Wuhuangfusong: "志定雪霜",
    TAF_bl_OLnanhualaoxian: "仙人指路",
    TAF_bl_Wulvmeng: "士别三日当刮目相待",
};
const 其他武将 = { 
    TAF_qt_SEzhugeliang: "躬耕南阳、by_落梦萧萧",
    TAF_qt_SEjiaxu: "晦谋独善、by_夜啼林夕",
    TAF_qt_SElinxi: "我负责逗喵，那你呢？、by_夜啼林夕",
    TAF_qt_xujie: "太师文贞、by_数学家",
    TAF_qt_shenlvbu: "修罗之怒",
    TAF_qt_shenguigaoda: "远古传说",
    TAF_qt_zhoushuren: "二十世纪东亚文化地图上占最大领土的作家",
    TAF_qt_SEsunluban: "嗷呜呜_by_迭",
};
const 异构Boss = { 
    TAF_boss_shenlvbu1: "虎牢霸主",
    TAF_boss_shenlvbu2: "修罗之怒",
    TAF_boss_shenguigaoda: "远古传说",
};
const 将灵专属 = {
    sznjl_shenzhaoyun: "将灵专属",
    sznjl_caochun: "将灵专属",
    sznjl_caoying: "将灵专属",
    sznjl_guansuo: "将灵专属",
    sznjl_zhaoxiang: "将灵专属",
    sznjl_nianshou: "将灵专属",
    sznjl_lingju: "将灵专属",
    sznjl_simayiyi: "将灵专属",
    sznjl_xiaosha: "将灵专属",
    sznjl_xiaoshan: "将灵专属",
};
const 测试专属 = {
    TAF_cs_ceshi: "测试专属",
};
function setTitle(object){
    if(object && typeof object === "object"){
        const keys = Object.keys(object);
        for (let key of keys) {
            const string = object[key];
            if(string && typeof string === "string") {
                object[key] = `<font color= #EE9A00>${string}</font>`;
            }
        }
    }
    return object;
}
const characterTitles = {
    ...隐忍天弓, ...鼎足三分, ...星河皓月, ...惊世银竹, 
    ...期期离火, ...欲雨临泽, ...惊鸿玉蝶, ...神话再临, 
    ...雾山五行, ...爆料体验, ...其他武将, ...异构Boss, 
    ...将灵专属, ...测试专属, 
};
setTitle(characterTitles);
export default characterTitles;