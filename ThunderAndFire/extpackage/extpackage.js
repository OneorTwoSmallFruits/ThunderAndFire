import {lib, game, ui, get, ai, _status} from '../../../../noname.js'
function setstyle(string, tip = 'all'){
    if(!string  || typeof string !== "string") return;
    if(tip === 'all'){
        string = `<small><font color= #00FFFF>${string}</font></small>`;
    } else if(tip === 'tip'){
        string = `<small><font color= #EE9A00>${string}</font></small>`;
    } else if(tip === 'red'){
        string = `<small><font color= #FF2400>${string}</font></small>`;
    }
    return string;
}
export const extpackage = {
    author: setstyle('一两只小果子(同B站ID)丨QQ：80361302', 'tip'),
    intro: 
        setstyle('一　扩展概况：', 'tip') + '<br>' +
        setstyle('1.1　更新地址：<a href="https://pan.quark.cn/s/6c63955ed038" target="_blank">点击前往《银竹离火》夸克网盘</a>') + '<br>' +
        setstyle('1.2　AI托管展示：：<a href="https://www.bilibili.com/video/BV1LVpuevEBA/?share_source=copy_web&vd_source=a71b2167303fcf065aee5d80b0c2a0db" target="_blank">点击前往B站观看《银竹离火- 武将扩展预览短片》</a>') + '<br>' +
        setstyle('1.3　这是一个简单的、可以给你带来更好的“') + setstyle('线下单机陪玩', 'red') + setstyle('”体验的武将扩展包！')+'<br>' +
        setstyle('1.4　感谢名单：') + setstyle('❀非时之梦，常世灶食℘-Q群及群主和各位管理员；眯咪狗《奇妙工具》；真里亞《武将背景特效》；“绘声03”小伙伴提供的武将皮肤和语音资源；银竹离火编写初期，এ钟士季ꦿ℘゜的鼎力支持', 'red') + '<br>' +
        setstyle('1.5　命名由来：') + 
        setstyle('<li>本武将扩展是从姜维、钟会两位武将开始做起来的：银竹可指闪电契合魏国，每位武将都是那么的出众（惊世）；而火焰契合蜀国，同时期期离火的期期，暗指有所期待，却不可期的蜀汉命运，姜维姜维终将何为？于是就以《银竹离火》的名命名本武将扩展包了。') + 
        setstyle('<li>隐忍天弓：司马氏三分归晋，历史迎来了至暗时刻，司马懿也设计了三技能高平陵之乱！同时赋予吴势力标签及受到随机属性伤害的debuff，也表达了我个人的一些情绪在里面（暗指天谴），无奈：成王败寇，历史是胜利者书写的！') + 
        setstyle('<li>星河皓月：主要以奠定三分的吴国周瑜及蜀国诸葛亮为核心的武将分栏，寓意如星河般璀璨，如皓月般清明。') + 
        setstyle('<li>欲雨临泽：谕指的是多雨之地的东吴水郡，覆国之雨终将到来，成就司马氏的三分归晋。') + 
        setstyle('<li>惊鸿玉蝶:玉蝶同时也谕指雨雪，象征乱世中的一兵一卒一将的故事都是历史长河中惊鸿一瞥，在寒冷刺骨的时代背景下，每一位人物的经历都令人感慨万千。') + '<br>' +
        setstyle('1.6　扩展版本：V1.31.4　更新日期：2025年06月28日 - 移除不必要的全局功能，张琪瑛两版AI测完毕，三技能filter函数修复，之前将转化牌也包含进去了！') + '<br>' +
        '',
    diskURL: '',
    forumURL: '',
    version: '1.31.4',
}
