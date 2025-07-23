import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 隐忍天弓 = {
    sun_simayi: {//司马懿
        comment: '暂无',
        score: [3, 5, 5, 2, 3, 5],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    sun_zhangchunhua: {//张春华
        comment: '暂无',
        score: [4, 3, 3, 1, 1, 1],
    },
};
export const 鼎足三分 = {
    TAF_sf_caocao: {//曹操
        comment: '暂无',
        score: [3, 5, 5, 2, 3, 1],
    },
    TAF_sf_liubei: {//刘备
        comment: '暂无',
        score: [3, 3, 2, 1, 2, 1],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    TAF_sf_sunquan: {//孙权
        comment: '暂无',
        score: [4, 2, 3, 2, 1, 5],
    },
    TAF_sf_hangjiao: {//张角
        comment: '暂无',
        score: [3, 3, 3, 5, 4, 3],
    },
};
export const 星河皓月 = {
    moon_guojia: {//郭嘉
        comment: '暂无',
        score: [1, 3, 4, 3, 5, 5],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    moon_zhugeliang: {//诸葛亮
        comment: '暂无',
        score: [4, 2, 3, 2, 5, 2],
    },
    moon_zhouyu: {//周瑜
        comment: '暂无',
        score: [5, 1, 5, 2, 1, 3],
    },
    moon_simahui: {//司马徽
        comment: '暂无',
        score: [1, 3, 4, 3, 3, 5],
    },
};
export const 惊世银竹 = {
    thunder_caochun: {//曹纯
        comment: '暂无',
        score: [5, 3, 2, 2, 1, 3],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    thunder_caopi: {//曹丕
        comment: '暂无',
        score: [1, 1, 2, 5, 5, 5],
    },
    thunder_wangji: {//王基
        comment: '暂无',
        score: [4, 2, 4, 5, 4, 2],
    },
    thunder_wenyang: {//文鸯
        comment: '暂无',
        score: [5, 3, 2, 2, 1, 4],
    },
    thunder_zhonghui: {//钟会
        comment: '暂无',
        score: [3, 5, 5, 2, 4, 3],
    },
};
export const 期期离火 = {
    fire_baosanniang: {//鲍三娘
        comment: '暂无',
        score: [4, 3, 4, 2, 2, 1],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    fire_guanyinping: {//关银屏
        comment: '暂无',
        score: [5, 5, 2, 1, 1, 1],
    },
    fire_zhangxingcai: {//张星彩
        comment: '暂无',
        score: [5, 3, 2, 3, 1, 2],
    },
    fire_zhaoxiang: {//赵襄
        comment: '暂无',
        score: [3, 5, 1, 3, 2, 4],
    },
    fire_jiangwei: {//姜维
        comment: '暂无',
        score: [1, 3, 4, 3, 5, 5],
    },
};
export const 欲雨临泽 = {
    water_lukang: {//陆抗
        comment: '暂无',
        score: [3, 5, 3, 3, 3, 2],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    water_luxun: {//陆逊
        comment: '暂无',
        score: [5, 3, 5, 3, 1, 3],
    },
    water_sunce: {//孙策
        comment: '暂无',
        score: [4, 5, 4, 5, 4, 3],
    },
    water_sunshangxiang: {//孙尚香
        comment: '暂无',
        score: [3, 5, 3, 4, 5, 3],
    },
    water_sunhanhua: {//孙寒华
        comment: '暂无',
        score: [5, 3, 5, 3, 3, 4],
    },
};
export const 惊鸿玉蝶 = {
    ice_diaochan: {//貂蝉
        comment: '你越强，奴家就越喜欢嘛，真是的……嘿嘿o(￣▽￣)ｄ good job！',
        score: [1, 2, 2.5, 5, 5, 5],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    ice_lvlingqi: {//吕玲绮
        comment: '暂无',
        score: [5, 2, 2, 1, 1, 3],
    },
    ice_zhangning: {//张宁
        comment: '暂无',
        score: [3, 5, 5, 3, 2, 3],
    },
    ice_zhangqiying: {//张琪瑛
        comment: '暂无',
        score: [3, 2, 4, 3, 4, 5],
    },
    ice_caoying: {//曹婴
        comment: '暂无',
        score: [3, 3, 3, 3, 3, 3],
    },
};
export const 神话再临 = {
    TAF_shen_zhaoyun: {//神赵云
        comment: '暂无',
        score: [3, 5, 4, 3, 4, 2],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
};
export const 雾山五行 = {
    TAF_wx_xuanyuan_shenjun: {//轩辕神君
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    TAF_wx_rongcheng_moxi: {//容成墨熙
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wx_rongcheng_zeqi: {//容成墨熙
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wx_shentu_ziye: {//申屠子夜
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wx_shentu_yuanshu: {//申屠元姝
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wx_wenren_yixuan: {//闻人翊悬
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wx_wenren_jingxuan: {//闻人镜悬
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wx_gongyi_churen: {//公仪楚人
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wx_shuiguanzunzhe: {//水冠尊者
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wx_suxiaoan: {//苏小安
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
};
export const 爆料体验 = {
    TAF_bl_shenhuangzhong: {//神黄忠
        comment: '暂无',
        score: [5, 2, 3, 3, 2, 1],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    TAF_bl_shenjiaxu: {//蝶贾诩
        comment: '暂无',
        score: [3, 2, 3, 3, 2, 5],
    },
    yzlh_pot_weiyan: {//势魏延
        comment: '暂无',
        score: [5, 1, 4, 1, 1, 5],
    },
    TAF_bl_Wuhuangfusong: {//武皇甫嵩
        comment: '暂无',
        score: [5, 3, 4, 1, 2, 4],
    },
    TAF_bl_OLnanhualaoxian: {//南华老仙
        comment: '暂无',
        score: [2, 3, 3.5, 4.5, 5, 2],
    },
};
export const 其他武将 = {

};
export const 异构Boss = {// 🌩️·异构Boss(乱斗挑战专属)

};
export const 将灵专属 = {// 🌀·将灵专属(全模式禁用)

};
export const 测试专属 = {// 🌌·测试专属(全模式禁用)

};
let origingonglve = {
    ...隐忍天弓, ...鼎足三分, ...星河皓月, ...惊世银竹, 
    ...期期离火, ...欲雨临泽, ...惊鸿玉蝶, ...神话再临, 
    ...雾山五行, ...爆料体验, ...其他武将, ...异构Boss, 
    ...将灵专属, ...测试专属, 
};
function setGLcolors(obj, color = '#FF2400') {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const originalComment = obj[key].comment;
            obj[key].comment = `<font color="${color}">【武将解读】：</font><br><small>${originalComment}</small>`;
        }
    }
}
setGLcolors(origingonglve);
/**
 * 原画台词
 */
export const gonglve = origingonglve;