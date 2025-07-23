import {lib, game, ui, get, ai, _status} from '../../../../noname.js'
import characters from "../characters/character.js";
import {
    隐忍天弓, 鼎足三分, 星河皓月, 惊世银竹, 
    期期离火, 欲雨临泽, 惊鸿玉蝶, 神话再临, 
    雾山五行, 爆料体验, 其他武将, 异构Boss, 
    将灵专属, 测试专属
} from "../characters/character.js";
import cards from "../cards/cards.js";
import { 基本牌, 锦囊牌, 装备牌 } from "../cards/cards.js";
import translates from "../characters/translate.js";
import skills from "../cards/skills.js";
const filterlists = ["TAF_qt_shenguigaoda","TAF_shen_tongyu_shadow"].concat(Object.keys(雾山五行), Object.keys(将灵专属), Object.keys(测试专属));
const setChars = {
    sum: Object.keys(characters).filter(name => !filterlists.includes(name)).length,
    num1: Object.keys(隐忍天弓).length,
    num2: Object.keys(鼎足三分).length,
    num3: Object.keys(星河皓月).length,
    num4: Object.keys(惊世银竹).length,
    num5: Object.keys(期期离火).length,
    num6: Object.keys(欲雨临泽).length,
    num7: Object.keys(惊鸿玉蝶).length,
    num8: Object.keys(神话再临).filter(name => !filterlists.includes(name)).length,
}
setChars.other = setChars.sum - setChars.num1 - setChars.num2 - setChars.num3 - setChars.num4 - setChars.num5 - setChars.num6 - setChars.num7 - setChars.num8
const setCards = {
    sum: Object.keys(cards).filter(card => !cards[card]?.notCards).length,
    basic: Object.keys(基本牌).filter(card => !cards[card]?.notCards).length,
    trick: Object.keys(锦囊牌).filter(card => !cards[card]?.notCards).length,
    equip: Object.keys(装备牌).filter(card => !cards[card]?.notCards).length,
}
const 武将skills = Object.keys(translates).filter(info => info.endsWith("_info")).length - 1;//不含测试专属
const 卡牌skills = Object.keys(skills).length;
const sumskills = 武将skills + 卡牌skills;
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
        setstyle('一　扩展概况：', 'tip') + setstyle('一个简单的、可以给你带来更好的“') + setstyle('线下单机陪玩体验', 'red') + setstyle('”的武将扩展包！') +'<br>' +
        setstyle('1.1　更新地址：<a href="https://pan.quark.cn/s/1a9cfe722bfd" target="_blank" style="color: #00FFFF;">点击前往《银竹离火》夸克网盘</a>') + '<br>' +
        setstyle('1.2　AI托管展示：：<a href="https://www.bilibili.com/video/BV1LVpuevEBA/?share_source=copy_web&vd_source=a71b2167303fcf065aee5d80b0c2a0db" target="_blank" style="color: #00FFFF;">点击前往B站观看《银竹离火- 武将扩展预览短片》</a>')+ '<br>' +
        setstyle('1.3　感谢名单：') + setstyle('❀非时之梦，常世灶食℘-Q群及群主和各位管理员；眯咪狗《奇妙工具·自娱自乐》；真里亞《武将背景特效》；“绘声03”小伙伴提供的武将皮肤和语音资源；银竹离火编写初期，এ钟士季ꦿ℘゜的鼎力支持', 'red') + '<br>' +
        setstyle('1.4　武将统计：') + setstyle('共计'+ setChars.sum +'位武将(不含雾山五行、将灵专属、测试专属)。','tip') +
        setstyle('<li>隐忍天弓：'+ setChars.num1 + '位；鼎足三分：'+ setChars.num2 + '位；星河皓月：'+ setChars.num3 + '位；惊世银竹：'+ setChars.num4 + '位；','tip') + 
        setstyle('<li>期期离火：'+ setChars.num5 + '位；欲雨临泽：'+ setChars.num6 + '位；惊鸿玉蝶：'+ setChars.num7 + '位；神话再临：'+ setChars.num8 + '位；','tip') + 
        setstyle('<li>剩余其他武将共计：'+ setChars.other + '位。','tip') +'<br>' +
        setstyle('1.5　卡牌统计：') + setstyle('共计'+ setCards.sum +'张：①基本牌：'+ setCards.basic + '张；②锦囊牌：'+ setCards.trick + '张；③装备牌：'+ setCards.equip + '张。','tip') +'<br>' +
        setstyle('1.6　技能统计：') + setstyle('共计'+ sumskills +'个：①武将：'+ 武将skills +'个；②卡牌：' + 卡牌skills +'个','tip') +'<br>' +
        setstyle('1.7　命名由来：') + setstyle('本武将扩展是从姜维、钟会两位武将开始的：银竹可指闪电契合魏国，每位武将都是那么的出众惊世；离火契合蜀国，同时期期离火的期期，暗指有所期待，却不可期的蜀汉命运，姜维姜维终将何为？并由此命名。隐忍天弓：司马氏三分归晋，历史迎来了至暗时刻，司马懿也设计了三技能高平陵之乱，技能自带负面效果(暗指天谴)，无奈：成王败寇，历史是胜利者书写的。星河皓月：主要以奠定三分的吴国周瑜及蜀国诸葛亮为核心的武将分栏，寓意如星河般璀璨，如皓月般清明。欲雨临泽：谕指的是多雨之地的东吴水郡，覆国之雨终将到来，成就司马氏的三分归晋。惊鸿玉蝶:玉蝶谕指雨雪，象征乱世中的一兵一卒一将的故事都是历史长河中惊鸿一瞥，在寒冷刺骨的时代背景下，每一位人物的经历都令人惊叹！','tip') +'<br>' +
        setstyle('1.8　扩展版本：V1.31.4　更新日期：2025年07月23日') + '<br>' +
        setstyle('<li>①扩展卡牌调整：雷闪黑色牌点数♠3/♣5/♠7，共计3张，轮回之钥♠6一张，倒转乾坤♠K一张，默认加入牌堆；放心单机呆逼知道这些卡牌如何使用！你关不关都一样！对应卡牌音效更新，很好听哦。') + '<br>' +
        setstyle('<li>②鲁迅未完成，但能用;③细化基本牌雷闪设定：抵消一张「未被抵消的」伤害牌并横置目标获得此伤害牌，然后可选择场上一名有因〖封印〗类技能而产生失效技能的角色，解除其至多一个正在被封印的技能直到该〖封印〗技能消失。') + '<br>' +
        setstyle('<li>③新增武将SE孙鲁班——by:迭，详见武将详情；钟会和姜维两位核心武将技能调整，总结两字：用着非常顺手！(#^.^#)') + '<br>' +
        setstyle('<li>④本扩展乱斗模式，已禁用可使用转化牌的陆抗，防止大家体验不好。') + '<br>' +
        '',
    diskURL: '',
    forumURL: '',
    version: '1.31.4',
}