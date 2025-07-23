import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
import { ThunderAndFire, setAI} from'../precontent/functions.js';
import { asyncs } from'../precontent/asyncs.js';
import { oltianshu} from'../precontent/oltianshu.js';
const {
    setColor, delay, diyCardsAudio, getCardSuitNum, getCardNameNum, 
    compareValue, compareOrder, compareUseful, chooseCardsToPile, 
    chooseCardsTodisPile,  setjudgesResult,
} = ThunderAndFire;//银竹离火部分函数
const {
    getAliveNum, getFriends, getEnemies,
} = setAI;//银竹离火AI部分函数
const { tenwintenloseAI } = setAI.wei;
const BossEquip1 = ["TAF_fumojingangchu","TAF_feijiangshenweijian","TAF_wushuangxiuluoji"];
const BossEquip5 = ["TAF_youhuoshepoling","TAF_honglianzijinguan"];
/** @type { importCardConfig['skill'] } */
export const 基本牌 = {
    TAF_leishan: {//雷闪
        audio: false,
        setAudio: true,
        fullskin: true,
        type: "basic",
        notarget: true,
        nodelay: true,
        direct:true,
        image: "ext:银竹离火/image/card/TAF_leishan.png",
        global: ["TAF_leishan_skill","TAF_leishan_remove"],
        defaultYingbianEffect: "draw",
        async content(event, trigger, player) {
            const evt2 = event.getParent(3)._trigger;
            evt2.neutralize();
            const evt = evt2.getParent();
            const next = game.createEvent("TAF_leishan_remove");
            _status.event.next.remove(next);
            evt.after.unshift(next);
            next.player = player;
            next.setContent(async function () {
                const Parent = event.getParent();
                if (Parent && Parent.respondTo) {
                    const target = Parent.respondTo[0];
                    if (target && target.isAlive()) target.link(true);
                    const card = Parent.respondTo[1];
                    if (card && card.cards && card.cards.length > 0) {
                        const gaincards = card.cards;
                        await player.gain(gaincards, "gain2", "log");
                    }
                }
                const targets = game.filterPlayer(o => {
                    return o.isAlive() && o.getDisSkills().length > 0;
                });
                if (targets.length) {
                    //可选择场上一名有因〖封印〗类失效技能的角色，解除其至多一个正在被封印的技能。
                    const prompt = setColor("是否发动【雷闪】：选择场上一名有因〖封印〗类失效技能的角色，解除其至多一个正在被封印的技能？");
                    const result = await player.chooseTarget(prompt, 1, function (card, player, target) {
                        return targets.includes(target);
                    }).set('ai', function (target) {
                        return get.attitude(player, target) > 0;
                    }).forResult();
                    if (result.bool) {
                        const target = result.targets[0];
                        player.line(target, "thunder");
                        diyCardsAudio(event, player, 'effect');
                        const skills = target.getDisSkills();
                        let lists = skills.concat('cancel2');
                        const removeResult = await player.chooseControl(lists).set ("ai", () => {
                            return skills.randomGet();
                        }).set('forced', true).forResult();
                        target.removeDisSkills(removeResult.control);
                    }
                }
            });
        },
        ai: {
            basic: {
                order: function (card, player) {
                    //这个oder和雷闪的卡牌的技能AI作为联动。
                    return compareOrder(player,"shan") + 0.15;
                },
                value: [7.15, 5.25, 2.15],
                useful: function (card, i) {
                    const player = _status.event.player, basic = [7.15, 5.25, 2.15];
                    let setnum = basic[Math.min(2, i)];
                    if (player.hp >= player.getDamagedHp() && player.hasSkillTag("maixie")) {
                        setnum *= 0.57;
                    }
                    if (player.hasSkillTag("freeShan", false, null, true) || player.getEquip("rewrite_renwang")) {
                        setnum *= 0.8;
                    }
                    return setnum;
                },
            },
            result: { 
                player: 1 
            },
        },
    },
};
const damagelists = lib.respondMap?.damage;
if (damagelists) {
    lib.respondMap?.damage.push('TAF_leishan');//本体新增2025年7月9日
}
/** @type { importCardConfig['skill'] } */
export const 锦囊牌 = {
    TAF_lunhuizhiyao: {//轮回之钥
        audio: false,
        setAudio: true,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        selectTarget: 1,
        reverseOrder: true,
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
            const phaseNames = [ 'phaseZhunbei', 'phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard', 'phaseJieshu' ];
            const list = phaseNames.map(name => {
                return game.createCard(`TAF_lunhuizhiyao_${name}`, 'spade', 6);
            });
            game.cardsGotoOrdering(list);
            const prompt = setColor("〖轮回之钥〗");
            const prompt2 = setColor("请调整〖" + get.translation(target) + "〗下一个回合的六大阶段顺序。");
            const result = await player.chooseToMove(prompt,true).set("list", [[prompt2, list]]).set("filterMove", (from, to, moved) => {
                return true;
            }).set('filterOk', (moved) => {
                return moved[0].length === list.length;
            }).set("processAI", (list) => {
                const phaselist = list[0][1];
                const att = get.attitude(player, target);
                if (att) {
                    if (att >= 2) {
                        /**
                         * 准备阶段、结束阶段、摸牌阶段、出牌阶段、判定阶段、弃牌阶段
                         */
                        return [[phaselist[0], phaselist[5], phaselist[2], phaselist[3], phaselist[1], phaselist[4]]];
                    } else if (att < 2) {
                        /**
                         * 判定阶段、摸牌阶段、结束阶段、准备阶段、弃牌阶段、出牌阶段
                         */
                        return [[phaselist[1], phaselist[2], phaselist[5], phaselist[0], phaselist[4], phaselist[3]]];
                    }
                } else {
                    return [[phaselist[1], phaselist[2], phaselist[5], phaselist[0], phaselist[4], phaselist[3]]];
                }
            }).set('forced', true).forResult();
            if (result.bool) {
                const list = result.moved[0];
                const phaseNames = list.map(card => {
                    return card.name.replace("TAF_lunhuizhiyao_", "");
                });
                if (!target.lunhuizhiyao_phaselist) {
                    target.lunhuizhiyao_phaselist = phaseNames;
                } else {
                    target.lunhuizhiyao_phaselist = phaseNames;
                }
                if(!target.hasSkill('TAF_lunhuizhiyao_skill')) {
                    await target.addSkill('TAF_lunhuizhiyao_skill');
                }
                const prompt = phaseNames.map(name => get.translation(name)).join("、");
                game.log(player,'通过', "#g【轮回之钥】", "将", target,'下个回合的六大阶段顺序更改为：', prompt , '。')
            }
        },
        async contentAfter(event, trigger, player) {
            const phaseNames = ['phaseZhunbei', 'phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard', 'phaseJieshu'];
            const findCards = player.getCardsform({ Pile: 'allPile', field: "hesjx" }).filter(card => {
                return phaseNames.some(name => card.name === `TAF_lunhuizhiyao_${name}`);
            });
            if (findCards.length > 0) {
                findCards.forEach(card => {
                    card.fix();
                    card.remove();
                    card.destroyed = true;
                });
            }
            ui.clear();
        },
        ai: {
            basic: {
                order: function (card, player) {
                    const cards = player.getCards("hs");
                    let findCards = [];
                    const targets = game.filterPlayer();
                    for(const card of cards) {
                        const type = get.type2(card);
                        if (type === 'trick' && card.name !== 'TAF_lunhuizhiyao') {
                            for(const target of targets) {
                                const effect = get.effect(target, card, player, player);
                                const canUse = player.canUse(card, target);
                                if (effect && effect > 0 && canUse) {
                                    findCards.push(card);
                                }
                            }
                        }
                    }
                    if (findCards.length === 0) return 5;
                    return 1.5;
                },
                value: function (card, player) {
                    return 9;
                },
                useful: 0,
            },
            result: {
                target: function(player, target){
                    //判定阶段、摸牌阶段、结束阶段、准备阶段、弃牌阶段、出牌阶段
                    const enemiesPhases = ['phaseJudge', 'phaseDraw', 'phaseJieshu', 'phaseZhunbei', 'phaseDiscard', 'phaseUse'];
                    //准备阶段、结束阶段、摸牌阶段、出牌阶段、判定阶段、弃牌阶段
                    const friendsPhases = ['phaseZhunbei', 'phaseJieshu', 'phaseDraw', 'phaseUse', 'phaseJudge', 'phaseDiscard'];
                    const enemies = player.getEnemies_sorted().filter(o => {
                        const key1 = !o.lunhuizhiyao_phaselist;
                        const key2 = o.lunhuizhiyao_phaselist;
                        return key1 || (key2 && !key2.every((v, i) => v === enemiesPhases[i]));
                    });
                    if (enemies && enemies.length > 0) {
                        const reversed = enemies.reverse();
                        const firstTwo = reversed.slice(0, 2);
                        if (firstTwo.includes(target) && target.needsToDiscard() > 0) {
                            return -1;
                        }
                    }
                    const friends = player.getFriends_sorted(false).filter(o => {
                        const key1 = !o.lunhuizhiyao_phaselist;
                        const key2 = o.lunhuizhiyao_phaselist;
                        return key1 || (key2 && !key2.every((v, i) => v === friendsPhases[i]));
                    });
                    if (friends && friends.length > 0) {
                        const reversed = friends.reverse();
                        const firstTwo = reversed.slice(0, 2);
                        if (firstTwo.includes(target) && target.needsToDiscard() > 0) {
                            return 1;
                        }
                    }
                    const targets = game.filterPlayer().sortBySeat(player).filter(o => get.attitude(player, o) < 2);
                    if (targets && targets.length > 0) {
                        const firstTwo = targets.slice(0, 2);
                        if (firstTwo.includes(target)) {
                            return -1;
                        }
                    }
                    return -2;
                },
            },
        },
    },
    TAF_lunhuizhiyao_phaseZhunbei: {//准备阶段
        audio: false,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
        notCards: true,
    },
    TAF_lunhuizhiyao_phaseJudge: {//判定阶段
        audio: false,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
        notCards: true,
    },
    TAF_lunhuizhiyao_phaseDraw: {//摸牌阶段
        audio: false,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
        notCards: true,
    },
    TAF_lunhuizhiyao_phaseUse: {//出牌阶段
        audio: false,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
        notCards: true,
    },
    TAF_lunhuizhiyao_phaseDiscard: {//弃牌阶段
        audio: false,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
        notCards: true,
    },
    TAF_lunhuizhiyao_phaseJieshu: {//结束阶段
        audio: false,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
        notCards: true,
    },
    TAF_daozhuanqiankun: {//倒转乾坤
        audio: false,
        setAudio: true,
        fullskin: true,
        type: "trick",
        image: "ext:银竹离火/image/card/TAF_daozhuanqiankun.png",
        global: ["TAF_daozhuanqiankun_skill"],
        selectTarget: -1,
        reverseOrder: true,
        filterTarget: function(card, player, target) {
            return true;
        },
        async contentBefore(event, trigger, player) {
            const evt = event.getParent();
            if (evt) {
                const card = evt.card;
                if (card && card.name === "TAF_daozhuanqiankun") {
                    const targets = evt.targets;
                    if (targets.length > 0) {
                        evt.targets.sortBySeat(player);
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const target = event.target;
            if (!target.TAF_daozhuanqiankun) target.TAF_daozhuanqiankun = true;
        },
        async contentAfter(event, trigger, player) {
            const targets = game.filterPlayer().sortBySeat(player);
            const sortTargets = targets.filter(target => target.TAF_daozhuanqiankun);
            async function clear() {
                for (const target of targets) {
                    if (target.TAF_daozhuanqiankun) {
                        target.TAF_daozhuanqiankun = false;
                        delete target.TAF_daozhuanqiankun;
                    }
                }
            }
            if (sortTargets.length < 2) {
                await clear();
                return;
            }
            const toSwapList = [];
            const len = sortTargets.length;
            for (let i = 0; i < Math.floor(len / 2); i++) {
                const j = len - 1 - i;
                toSwapList.push([sortTargets[i], sortTargets[j]]);
            }
            game.broadcastAll(toSwapList => {
                for (const list of toSwapList) {
                    game.swapSeat(list[0], list[1], false);
                }
            }, toSwapList);
            await clear();
        },
        setUseCard: function(player) {//AI决策
            const NowPlayer = _status.currentPhase;
            const nextPlayer = NowPlayer.next;
            const nextSeatNum = nextPlayer.seatNum;//核心参数
            const players = game.filterPlayer(o => o.isAlive());
            const friends = players.filter(o => get.attitude(player, o) >= 2);
            const sorted = players.sortBySeat(player);
            const beforeMap = {};//获取排序前的所有座位号映射的对应玩家
            for (const player of sorted) {
                beforeMap[player.seatNum] = player;
            }
            /***
             * 获取排序后的所有座位号映射的对应玩家，人机策略我这边先不考虑场上无懈了
             */
            const swappedPlayers = [...sorted];
            for (let i = 0; i < Math.floor(sorted.length / 2); i++) {
                const j = sorted.length - 1 - i;
                [swappedPlayers[i], swappedPlayers[j]] = [swappedPlayers[j], swappedPlayers[i]];
            }
            const afterMap = {};
            Object.keys(beforeMap).forEach((seatNum, index) => {
                afterMap[seatNum] = swappedPlayers[index];
            });
            const afterPlayer = afterMap[nextSeatNum];//找出模拟排序后座位号为nextSeatNum的玩家
            const index = swappedPlayers.indexOf(afterPlayer);
            /**
             * 以座位号为nextSeatNum的玩家为基准，将swappedPlayers数组进行排序
             * 也就是打出倒转乾坤后，现在的实际打牌顺序！
             */
            const afterMapsorted = index === -1 ? swappedPlayers : [
                ...swappedPlayers.slice(index),
                ...swappedPlayers.slice(0, index)
            ];
            const half = Math.floor(afterMapsorted.length / 2);
            let count = 0;//统计新的出牌顺序，前一半的角色中的友方角色数量！
            for (let i = 0; i < half; i++) {
                const p = afterMapsorted[i];
                if (get.attitude(player, p) >= 2) {
                    count++;
                }
            }
            /**
             * 本锦囊卡，以大局观思路设定的人机决策，是否使用倒转乾坤，即，友方角色有一半的数量，在前一半中，就行！
             * 如果想详细优化：
             * 猜测无懈，能被无懈掉的角色，是否被兵乐，手牌数量（质量和数量），等因素都考虑进去。
             * 这样其实有些本末倒置了，没太多必要。把基本的逻辑理清就行。
             */
            const halfnum = Math.max(1, Math.floor(friends.length / 2));
            if(get.attitude(player, nextPlayer) >= 2) return 0;
            if (count >= halfnum) return 1;
            return 0;
        },
        ai: {
            basic: {
                order: 1,
                value: 7.5,
                useful: function () {
                    const player = _status.event.player;
                    const shan = compareUseful(player,"shan");
                    const tao = compareUseful(player,"tao");
                    const jiu = compareUseful(player,"jiu");
                    const setnum = {
                        one: Math.min(shan, tao, jiu) * 0.95,
                        two: Math.min(shan, tao),
                    }
                    const result = lib.card.TAF_daozhuanqiankun.setUseCard(player);
                    if (result && result > 0) return setnum.two;
                    return setnum.one;
                },
            },
            result: {
                target: function(player, target){
                    return lib.card.TAF_daozhuanqiankun.setUseCard(player);
                },
            },
        },
    },
    thundertenwintenlose: {//十胜十败
        audio: false,
        setAudio: true,
        fullskin: true,
        derivation: "moon_guojia",
        type: "delay",
        image: "ext:银竹离火/image/card/thundertenwintenlose.png",
        modTarget: function(card, player, target) {
            return lib.filter.judge(card, player, target);
        },
        enable: function(card, player) {
            return player.canAddJudge(card);
        },
        filterTarget: function(card, player, target) {
            return lib.filter.judge(card, player, target) && player === target;
        },
        judge: function(card) {
            const suit = get.suit(card);
            const number = get.number(card);
            if (suit === "spade" && number > 0 && number < 11 && number % 2 !== 0) {
                return 1; 
            } else if (suit === "heart" && number > 0 && number < 11 && number % 2 === 0) {
                return 1;
            } else {
                return -2;
            }
        },
        judge2: function(result) {
            if (result.bool == false) return true;
            return false;
        },
        effect: async function(result) {
            const player = result.player;
            const prompt0 = setColor("此〖十胜十败〗牌，判定结果非点数十之内的，奇数且为♠ / 偶数且为♥，判定失败，此牌将移动至下家判定区！");
            const prompt1 = setColor("此〖十胜十败〗牌，判定结果为点数十之内的，奇数且为♠ / 偶数且为♥，判定生效，且有有效目标！");
            const prompt2 = setColor("此〖十胜十败〗牌，判定结果为点数十之内的，奇数且为♠ / 偶数且为♥，判定生效，但无有效目标！此牌将移动至下家判定区！");
            const prompt3 = setColor("请选择一名非郭嘉的其他角色，与其依次比较手牌区、装备区、判定区的牌数：胜第一项，你摸两张牌；胜第二项，你回复一点体力与其均横置；胜第三项，其受到一点无来源的🔥伤害！");
            if (result._result.bool === true) {
                const targets = game.filterPlayer(function (current) {
                    return !lib.translate[current.name].includes("郭嘉") && current.isAlive() && current !== player;
                });
                if (!targets || targets.length === 0) { 
                    game.log(prompt2);
                    player.addJudgeNext(result.card);
                } else {
                    game.log(prompt1);
                    const result = await player.chooseTarget(prompt3, true, function (card, player, target) {
                        return targets.includes(target);
                    }).set('ai', function (target) {
                        return target === tenwintenloseAI(player);
                    }).forResult();
                    if (result.bool) {
                        const num = Math.floor(Math.random() * 2) + 1;
                        game.playAudio('..', 'extension', '银竹离火/audio/card/skills', 'thundertenwintenlose_skill' + num);
                        const target = result.targets[0];
                        player.line(target, 'fire');
                        const phs = player.getCards('h').length;
                        const pes = player.getCards('e').length;
                        const pjs = player.getCards('j').length;
                        const ths = target.getCards('h').length;
                        const tes = target.getCards('e').length;
                        const tjs = target.getCards('j').length;
                        if (phs > ths) {
                            game.log(player,'与',target,'比较手牌区牌数结果为','#g【胜】');
                            await player.draw(2);
                        } else if (phs <= ths) {
                            game.log(player,'与',target,'比较手牌区牌数结果为','#g【负】');
                        }
                        if (pes > tes) {
                            game.log(player,'与',target,'比较装备区牌数结果为','#g【胜】');
                            await player.recover();
                            await player.link(true);
                            await target.link(true);
                        } else if (pes <= tes) {
                            game.log(player,'与',target,'比较装备区牌数结果为','#g【负】');
                        }
                        if (pjs > tjs) {
                            game.log(player,'与',target,'比较判定区牌数结果为','#g【胜】');
                            await target.damage(1, "fire", "nosource");
                        } else if (pjs <= tjs) {
                            game.log(player,'与',target,'比较判定区牌数结果为','#g【负】');
                        }
                    }
                }
            } else {
                game.log(prompt0);
                player.addJudgeNext(result.card);
            }
        },
        cancel: function(card) {
            player.addJudgeNext(card);
        },
        allowMultiple: false,
        ai: {
            basic: {
                order: function (card, player) {
                    const key1 = player.hasSkill("thunderqizuo");
                    const key2 = player.hasSkill("thunderyiji");
                    if (key1 && key2) {
                        const skillOrder = lib.skill.thunderyiji.ai.order("thunderyiji", player);
                        if (player.isHealthy() && player.canAddJudge(card)) {
                            return skillOrder + 3.5;
                        }
                    }
                    return 1.5;
                },
                value: function (card, player) {
                    const key = player.hasSkill("thunderyiji");
                    const cards = player.getCards("hes").filter(card => card.name !== "thundertenwintenlose");
                    if (key) {
                        if (!cards || cards.length === 0) return 9;
                        let valuelist = [];
                        for(let card of cards) {
                            const value = get.value(card);
                            if (value && value > 0) valuelist.push(value);
                        }
                        if (valuelist.length === 0) return 9;
                        const maxValue = Math.max(...valuelist) + 2;
                        return Math.max(9, maxValue);
                    }
                    return 2.5;
                },
                useful: function (card) {
                    let player = _status.event.player;
                    const key = player.hasSkill("thunderyiji");
                    const cards  = player.getCards("hes").filter(card => card.name !== "thundertenwintenlose");
                    if (key) {
                        if (!cards || cards.length === 0) return 2;
                        let usefullist = [];
                        for(let card of cards) {
                            const useful = get.useful(card);
                            if (useful && useful > 0) usefullist.push(useful);
                        }
                        if (usefullist.length === 0) return 2;
                        const maxUseful = Math.max(...usefullist) + 2;
                        return Math.max(2, maxUseful);
                    }
                    return 0;
                },
            },
            result: {
                target: function(player, target) {
                    return tenwintenloseAI(target, "resultAI");
                },
            }
        }
    },
};
/** @type { importCardConfig['skill'] } */
export const 装备牌 = {
    TAF_fumojingangchu: {//金刚伏魔杵
        audio: false,
        fullskin: true,
        type: "equip",
        subtype: "equip1",
        image: "ext:银竹离火/image/card/TAF_fumojingangchu.png",
        skills: ["TAF_fumojingangchu_skill"],
        enable: true,
        distance: {
            attackFrom: -2,
        },
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        shenwu: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip1;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(o => o != player && get.attitude(player, o) < 2);
                    let value = 0;
                    if  (targets.length > 0) {
                        for (let target of targets) {
                            if (target.getEquip(2)) {
                                value ++;
                            }
                        }
                    }
                    return value + 5;
                },
                order: function (card, player) {
                    const list = BossEquip1;
                    const has = player.getCards("e").filter(card => list.includes(get.name(card)));
                    if (has && has.length > 0) {
                        return 0.5;
                    } else {
                        return game.compareOrder(player,"sha") * 1.25;
                    }
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_fumojingangchu");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip1') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
    TAF_feijiangshenweijian: {//飞将神威剑
        audio: false,
        fullskin: true,
        type: "equip",
        subtype: "equip1",
        image: "ext:银竹离火/image/card/TAF_feijiangshenweijian.png",
        skills: ["TAF_feijiangshenweijian_skill"],
        enable: true,
        distance: {
            attackFrom: -1,
        },
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        shenwu: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip1;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(o => o != player && o.hasSkillTag("maixie", false, player) && get.attitude(player, o) < 2);
                    return targets.length * 1.5 + 5;
                },
                order: function (card, player) {
                    const list = BossEquip1;
                    const has = player.getCards("e").filter(card => list.includes(get.name(card)));
                    if (has && has.length > 0) {
                        return 0.5;
                    } else {
                        return game.compareOrder(player,"sha") * 1.25;
                    }
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_feijiangshenweijian");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip1') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
    TAF_wushuangxiuluoji: {//无双修罗戟
        audio: false,
        fullskin: true,
        type: "equip",
        subtype: "equip1",
        image: "ext:银竹离火/image/card/TAF_wushuangxiuluoji.png",
        skills: ["TAF_wushuangxiuluoji_skill"],
        enable: true,
        distance: {
            attackFrom: - 4,
        },
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        shenwu: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip1;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(function(current) {
                        return current != player;
                    });
                    let Value = 5;
                    const getcards = player.getCards("hs").filter(card => card.name == "sha" || card.name == "juedou");
                    if(getcards.length > 0) {
                        let canUselist = [];
                        for (let target of targets) {
                            for (let card of getcards) {
                                if (player.canUse(card, target ,false ,true)) {
                                    const effect = get.effect(target, card, player, player);
                                    if (effect && effect > 0 && !canUselist.includes(card)) {
                                        canUselist.push(card);
                                    }
                                }
                            }
                        }
                        if (canUselist.length > 0) Value += canUselist.length;
                    }
                    return Value;
                },
                order: function (card, player) {
                    const list = BossEquip1;
                    const has = player.getCards("e").filter(card => list.includes(get.name(card)));
                    if (has && has.length > 0) {
                        return 1.5;
                    } else {
                        return Math.max(game.compareOrder(player,"sha"), game.compareOrder(player,"juedou")) * 1.25;;
                    }
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_wushuangxiuluoji");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip1') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
    TAF_honglianzijinguan: {//红莲紫金冠
        audio: false,
        fullskin: true,
	    type: "equip",
	    subtype: "equip5",
        image: "ext:银竹离火/image/card/TAF_honglianzijinguan.png",
        skills: ["TAF_honglianzijinguan_skill"],
        enable: true,
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        shenwu: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip5;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(function(current) {
                        return current != player;
                    });
                    const friends = targets.filter(o => get.attitude(player, o) > 0 && o.getCards("he").length > 0);
                    const enemies = targets.filter(o => get.attitude(player, o) <= 0 && o.getCards("he").length > 0);
                    return (enemies.length - friends.length) * 1.5 + (enemies.length + friends.length) * 0.5;
                },
                order: function (card, player) {
                    return 1.5;
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_honglianzijinguan");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip5') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
    TAF_youhuoshepoling: {//幽火摄魄令
        audio: false,
        fullskin: true,
	    type: "equip",
	    subtype: "equip5",
        image: "ext:银竹离火/image/card/TAF_youhuoshepoling.png",
        skills: ["TAF_youhuoshepoling_skill"],
        enable: true,
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        shenwu: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip5;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(function(current) {
                        return current != player;
                    });
                    const friends = targets.filter(o => get.attitude(player, o) > 0);
                    const enemies = targets.filter(o => get.attitude(player, o) <= 0);
                    const selfSaves = player.getCards('hes').filter(card => player.canSaveCard(card, player));
                    let SaveCards = [];
                    if (friends.length > 0) {
                        for (let f of friends) {
                            const cards = f.getCards('hes').filter(card => f.canSaveCard(card, f));
                            if (cards.length > 0) {
                                for (let c of cards) {
                                    if (!SaveCards.includes(c)) {
                                        SaveCards.push(c);
                                    }
                                }
                            }
                        }
                    }
                    const sum_SaveCards = SaveCards.concat(selfSaves).filter(card => card.name !== 'jiu');
                    const effect = sum_SaveCards.length - friends.filter(o => o.hp === 1).length;
                    return enemies.length - friends.length + player.getDamagedHp() + effect * player.getDamagedHp();
                },
                order: function (card, player) {
                    return 1.5;
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_youhuoshepoling");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip5') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
	icewuqibingfa: {//吴起兵法
        audio: false,
        setAudio: true,
        fullskin: true,
	    image: "ext:银竹离火/image/card/icewuqibingfa.png",
	    type: "equip",
	    subtype: "equip5",
        enable: true,
        derivation: "TAF_bl_shenjiaxu",
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
	    forceDie: true,
        destroy: true,
        toself: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
                const targets = game.filterPlayer(o => o.isAlive());
                if (!targets.length) return;
                const list = player.countSkills();
                const choosenum = Math.min(list.length , targets.length);
                const prompt = setColor("〖吴起兵法〗：请选择至多") + get.cnNumber(choosenum) + "名角色于本回合结束时将一张牌当【杀】使用！";
                const result = await player.chooseTarget(prompt, [1, choosenum], function(card, player, target) {
                    return targets.includes(target);
                }).set('ai', function(target) {
                    const friends = player.getFriends_sorted();
                    const enemies = player.getEnemies_sorted();
                    let findValueF = [];
                    for (const e of enemies) {
                        for (const f of friends) {
                            if(findValueF.includes(f)) continue;
                            const cards = f.getCards('hes');
                            const EnabledCards = cards.filter(card => lib.filter.cardEnabled(card, f, "forceEnable"));
                            const Vcard_sha = { name: "sha", nature: '', isCard: true };
                            const canUseSha = f.canUse(Vcard_sha, e, true, false);
                            const effect = get.effect(e, Vcard_sha, f, f);
                            if (f.inRange(e) && canUseSha && effect && effect > 0 && EnabledCards && EnabledCards.length > 1) {
                                const sortcards = EnabledCards.sort((a,b) => get.value(a, f) - get.value(b, f));
                                const card = sortcards[0];
                                const compareNum = (compareValue(f, "tao") + compareValue(f, "jiu") + compareValue(f, "shan") + compareValue(f, "wuxie")) / 4;
                                if (get.value(card, f) < compareNum && !findValueF.includes(f)) {
                                    findValueF.push(f);
                                }
                            }
                        }
                    }
                    if (findValueF.length === 0) return false;
                    if (findValueF.includes(target)) return 1;
                    else return 0;
                }).forResult();
                if (result.bool) {
                    const targets = result.targets;
                    const num = Math.floor(Math.random() * 2) + 1;
                    game.playAudio('..', 'extension', '银竹离火/audio/card/skills', 'icewuqibingfa_skill' + num);
                    for (let target of targets) {
                        player.line(target, 'ice');
                        game.log(player, "对", target, "使用了", "#g【吴起兵法】", "!");
                        target.addTempSkill("icewuqibingfa_sha");
                        target.markSkill("icewuqibingfa_sha");
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
	    ai: {
            basic: {
                equipValue: 6.5,
                order: function (card, player) {
                    const names = lib.inpile.filter(name => name !== "icewuqibingfa");
                    let orderlist = [];
                    for (let name of names) {
                        const Vcard = { name: name, nature: '', isCard: true };
                        const subtype = get.subtype(Vcard);
                        if (subtype && subtype === "equip5") {
                            const order = get.order(Vcard, player);
                            if (order && order > 0) orderlist.push(order);
                        }
                    }
                    if (orderlist.length === 0) return compareValue(player,"muniu") * 1.5;
                    return Math.max(...orderlist) * 1.5;
                    //不要问我怎么把优先级调的这么高！因为就算有其他宝具牌也会后来者顶上替换！吴起兵法本身没有什么用
                    //需要被顶替或顺拆才能发动技能！
                },
                value: function (card, player) {
                    const names = lib.inpile.filter(name => name !== "icewuqibingfa");
                    let valuelist = [];
                    for (let name of names) {
                        const Vcard = { name: name, nature: '', isCard: true };
                        const subtype = get.subtype(Vcard);
                        if (subtype && subtype === "equip5") {
                            const value = get.value(Vcard, player);
                            if (value && value > 0) valuelist.push(value);
                        }
                    }
                    if (valuelist.length === 0) return compareValue(player,"muniu") * 0.85;
                    return Math.max(...valuelist) * 0.5;
                },
                useful: 0,
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
	    },

	},
};
const cards = { ...基本牌, ...锦囊牌, ...装备牌 };

export default cards;