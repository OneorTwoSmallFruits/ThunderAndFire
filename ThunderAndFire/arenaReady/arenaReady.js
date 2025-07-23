import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import characters from "../characters/character.js";
import {
    隐忍天弓, 鼎足三分, 星河皓月, 惊世银竹, 
    期期离火, 欲雨临泽, 惊鸿玉蝶, 神话再临, 
    雾山五行, 爆料体验, 其他武将, 异构Boss, 
    将灵专属, 测试专属
} from "../characters/character.js";
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function randoms银竹离火() {//第一关
	const Characters = [
		...Object.keys(隐忍天弓),
		...Object.keys(星河皓月),
		...Object.keys(惊世银竹),
		...Object.keys(期期离火),
		...Object.keys(欲雨临泽).filter(x => x!= "water_lukang"),
		...Object.keys(惊鸿玉蝶),
	];
	return shuffle(Characters);
}
const randoms = randoms银竹离火();
function randoms神话再临(numone = 5, numtwo = 7) {//后两关
	const 神话再临 = ["TAF_shen_jiangtaixu","TAF_shen_pangtong","TAF_shen_tongyu","TAF_shen_zhaoyun"];
	const 神话再临randoms = shuffle(神话再临);
	const names = 神话再临randoms.slice(0, 2);
	const playerone = { name: names[0], name2: "none", identity: "zhong", position: 4, hp: numone, maxHp: numtwo, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] };
	const playertwo = { name: names[1], name2: "none", identity: "zhong", position: 6, hp: numone, maxHp: numtwo, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] };
	return [playerone, playertwo];
}
const 神话再临two = randoms神话再临();
const 神话再临three = randoms神话再临(9,13);
export async function arenaReady() {
    if (lib.config.mode == 'brawl') {
		if (!lib.storage.stage) lib.storage.stage = {};
		lib.storage.stage["银竹离火"] = {
			name: '银竹离火',
			mode: "identity",
			intro: ["身份模式，除自选外均为本扩展武将，建议佩戴将灵闯关。","扩展额外的连续闯关项目：", "第一关，作为主公与两位忠臣，对阵五位反贼。", "第二关，与两名同阵营武将协力对阵，异构Boss神鬼高达 + 两位神话再临武将。", "第三关，与两名同阵营武将协力对阵，异构Boss神吕布 + 两位神话再临武将。"],
			scenes: [
				{
					name: "第一关",
					intro: "扩展内斗！",
					players: [
						{ name: "random", name2: "none", identity: "zhu", position: 1, hp: null, maxHp: null, linked: false, turnedover: false, playercontrol: true, handcards: [], equips: [], judges: [] },
						{ name: randoms[0], name2: "none", identity: "zhong", position: 2, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						{ name: randoms[1], name2: "none", identity: "fan", position: 3, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						{ name: randoms[2], name2: "none", identity: "fan", position: 4, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						{ name: randoms[3], name2: "none", identity: "fan", position: 5, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						{ name: randoms[4], name2: "none", identity: "fan", position: 6, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						{ name: randoms[5], name2: "none", identity: "fan", position: 7, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						{ name: randoms[6], name2: "none", identity: "zhong", position: 8, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
					],
					cardPileTop: [],
					cardPileBottom: [],
					discardPile: [],
					gameDraw: true
				},
				{
					name: "第二关",
					intro: "对阵神鬼高达",
					players: [
						{ name: "random", name2: "none", identity: "fan", position: 1, hp: null, maxHp: null, linked: false, turnedover: false, playercontrol: true, handcards: [], equips: [], judges: [] },
						{ name: randoms[0], name2: "none", identity: "fan", position: 2, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						{ name: randoms[1], name2: "none", identity: "fan", position: 3, hp: 5, maxHp: 7, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						神话再临two[0],
						{ name: "TAF_boss_shenguigaoda", name2: "none", identity: "zhu", position: 5, hp: null, maxHp: null, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						神话再临two[1],
					],
					cardPileTop: [],
					cardPileBottom: [],
					discardPile: [],
					gameDraw: true
				},
				{
					name: "第三关",
					intro: "征战虎牢神吕布！",
					players: [
						{ name: "random", name2: "none", identity: "fan", position: 1, hp: null, maxHp: null, linked: false, turnedover: false, playercontrol: true, handcards: [], equips: [], judges: [] },
						{ name: randoms[0], name2: "none", identity: "fan", position: 2, hp: 7, maxHp: 9, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						{ name: randoms[1], name2: "none", identity: "fan", position: 3, hp: 7, maxHp: 9, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						神话再临three[0],
						{ name: "TAF_boss_shenlvbu1", name2: "none", identity: "zhu", position: 5, hp: null, maxHp: null, linked: false, turnedover: false, playercontrol: false, handcards: [], equips: [], judges: [] },
						神话再临three[1],
					],
					cardPileTop: [],
					cardPileBottom: [],
					discardPile: [],
					gameDraw: true
				}
			],
			mode: "sequal",
			level: 0
		};
		_status.extensionstage = true;
		if (!_status.extensionmade) _status.extensionmade = [];
		_status.extensionmade.push("银竹离火");
    }
};