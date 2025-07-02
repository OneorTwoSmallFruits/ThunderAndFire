import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
/**
 * 原画台词
 */
let origintaici = {
    TAF_zhaoyun:{//神赵云
        TAFjuejing:{
            order: 1,
            content: "龙缚于渊，虽万仞在身，志犹存于八荒！<br>将临死地，必效刑天，舞干戈以征四海！",
        },
        TAFlonghun:{
            order: 2,
            content: "八尺之身，秉义承武，胸腹可栖万丈苍龙！<br>左执青釭，右擎龙胆，此天下，可有挡我者！",
        },
        die:{
            content:"亢龙有悔，恨未除天狼于人间。",
        }
    },
    TAF_pangtong:{//神庞统
        TAFxuanyu:{
            order: 1,
            content: "红鸾锁曈日，三千练实腾空起，此物最相思!<br>玉壶妆梧桐，醴泉映东风，火凤归来耀长安！",
        },
        TAFfenshen:{
            order: 2,
            content: "灯火映阑珊，谁家麒麟入梦，吹落繁星如雨?<br>长空琼宇飞玉屑，千树黄金缕，万里起福灯。",
        },
        TAFyuhuo:{
            order: 3,
            content: "歌一曲，酒一觞，邀君醉琼浆，东风盈暖房。<br>醒又醉，醉复眠，迟日江山如画，何人不流连?",
        },
        die:{
            content:"孔明，好酒，好酒!",
        }
    },
    TAF_jiangtaixu:{//姜太虚
        TAFjingtu:{
            order: 1,
            content: "怡然独向九霄中坐看浮生做梦。<br>阴阳化生清浊自分。",
        },
        TAFjuechen:{
            order: 2,
            content: "醒时恐为梦一场，身世俱望，何处是吾乡？<br>为了这片土地，我需要力量。",
        },
        TAFshenqu:{
            order: 3,
            content: "时间冲淡了，我的记忆，也冲散了他们的轮廓。<br>庭前旧梅泛新香，当时故人如今不在旁。",
        },
        die:{
            content:"不能在这里停下。",
        }
    },
    TAF_tongyu:{//瞳羽
        TAFtianci:{
            order: 1,
            content: "虚妄之伤？天赐的屏障在守护我呢。<br>雷与火交替，像星星眨眼睛呢。",
        },
        TAFxingqi:{
            order: 2,
            content: "呀，这就是上天赐的小小考验吗？<br>嗯，天赐的火焰，也要好好接住呢。",
        },
        TAFxingpan:{
            order: 3,
            content: "星星说可以拿，那就收下啦。<br>哎呀，星星骗人，不过牌还给你哦。<br>星盘，要再陪人家玩一会吗？<br>夜幕降临，要换个颜色啦。",
        },
        die:{
            content:"无。",
        }
    },
    TAF_tongyu_shadow:{//瞳羽
        TAFshuangjiang:{
            order: 1,
            content: "霜降有时，星归有期，此身再无倦意。<br>锦囊藏玄机，可瞒不过天赐的雷火哦。",
        },
        TAFxuewu:{
            order: 2,
            content: "雪舞的规则，偶尔也可以任性哦。<br>黑丝褪作雪，星轨转无声。<br>雪地无边，我的心意，能抵达遥远的彼端吗？<br>霜雪虽冷，却亦想给世间添一丝温情。",
        },
        TAFxingpan_shadow:{
            order: 3,
            content: "这是，只属于我们的回合哦！<br>星光落进手心时，手心的牌，也变成星辰了吗？<br>这张牌，是天地借它来吻我吗？<br>星星不愿离开，那就留在我身边吧。",
        },
        TAFfanzhuan:{
            order: 4,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    /****************************************************************** */
    sun_simayi:{//司马懿
        sunquanmou:{
            order: 1,
            content: "洛水为誓，皇天为证，吾意不在刀兵。<br>以谋代战，攻形不以力，攻心不以勇。<br>鸿门之宴虽歇，会稽之胆尚悬，孤岂姬、项之辈。<br>昔藏青锋于沧海，今潮落，可现兵！",
        },
        sunxiongyi:{
            order: 2,
            content: "烽烟起大荒，戎军远役，问不臣者谁？<br>挥斥千军之贲，长驱万里之远。<br>率土之滨皆为王臣，辽土亦居普天之下。<br>青云远上，寒锋试刃，北雁当寄红翎。",
        },
        sunpingling:{
            order: 3,
            content: "煞星聚顶，你死到临头了！<br>天狼星光大盛，天下易主可期。<br>天命，也由我来定!<br>司马氏乃天命之所加矣。",
        },
        die:{
            content:"以权谋而立者，必失大义于千秋。",
        }
    },
    sun_zhangchunhua:{//张春华
        sunjueqing:{
            order: 1,
            content: "多情不若绝情好。<br>凭君莫话封侯事，一将功成万骨枯。<br>繁星映月满欢喜，悲欢离合总无情。<br>劝君多珍重，此间不相见。",
        },
        sunshangshi:{
            order: 2,
            content: "酒不醉人人自醉，情不伤人人自负。<br>女人，也该对自己狠一点。<br>何处蓝染玫色起，伤尽三千痴缠意。<br>一缕冷香远，逝花落，笑靥消。",
        },
        die:{
            content:"夫妻情分已尽，累了。",
        }
    },
    /****************************************************************** */
    thunder_caocao:{//曹操
        thunderguixin:{
            order: 1,
            content: "大忠似奸，留一世功名，前人赞，今人叹，后人美！<br>乱世称雄，立一方基业，屯万兵，聚百将，拥千城!",
        },
        thunderchiling:{
            order: 2,
            content: "挟天子以令不臣。<br>历史永远由胜利者书写! ",
        },
        thunderfeiying:{
            order: 3,
            content: "将才皆在，保我无忧。<br>我有嘉宾，鼓瑟吹笙。",
        },
        thunderhujia:{
            order: 4,
            content: "兵戈斧钱何须虑，我有虎卫三千人！<br>一将临阵涉险地，三军齐卫夸虎贵!",
        },
        die:{
            content:"假使奉孝在此，不使孤至此……",
        }
    },
    fire_liubei:{//刘备
        firezhaoren:{
            order: 1,
            content: "我将丹心酿烈酒，且取一觞慰风尘。<br>余酒尽倾江海中，与君共宴天下人。",
        },
        firezhaolie:{
            order: 2,
            content: "仁言利博，以微惠众。<br>上德若谷，下布万民。",
        },
        firedilu:{
            order: 3,
            content: "此战，有将军在，方可胜。<br>蜀汉霸业，方需将军出战。",
        },
        firejieying:{
            order: 4,
            content: "虎将护身，天险可破。<br>蜀将一心，社稷千秋。",
        },
        firejieying_jieyi:{
            order: 5,
            content: "卿乃志同之股肱，国贼当前，可欲诛之。<br>请君振炎汉之武运，除篡国之逆贼。",
        },
        die:{
            content: "离心离德，蜀汉恐危。",
        }
    },
    water_sunquan:{//孙权
        wateryuheng:{
            order: 1,
            content: "群雄环伺而地势匡佑，先统江海而后率三军。<br>人心相异而天道有常，经纬之道在御而非攻。",
        },
        wateryuxin:{
            order: 2,
            content: "泰然处之，方能大事可成。<br>多思多谋，筹谋长远。",
        },
        wateryulong:{
            order: 3,
            content: "多谢爱卿了。<br>贤臣良将在，我心安矣。",
        },
        waterquanshu:{
            order: 4,
            content: "父兄三代营江东，人心相向乾坤定。<br>每思赤壁、西陵、逍遥之役，皆感诸君而涕零。",
        },
        waterquanshu_quandao:{
            order: 5,
            content: "得爱卿相救，孤甚感激。<br>东吴俊杰良将在此，岂会败下阵来？",
        },
        die:{
            content: "望孙氏子孙，能护东吴万年基业。",
        }
    },
    /****************************************************************** */
    thunder_guojia:{//郭嘉
        thunderqizuo:{
            order: 1,
            content: "绸缪于未雨，手握胜机，雨落何妨高歌?<br> 此帆济沧海，彼岸日边，任他风雨飘摇！<br> 嘉不受此劫，安能以凡人之躯窥得天机!<br> 九州为觞，风雨为酿，谁与我共饮此杯?",
        },
        thunderlunshi:{
            order: 2,
            content: "曹公济天下大难，必定霸王之业。<br> 智者审于良主，袁公未知用人之机。<br> 公有此十胜，败绍非难事尔。<br> 嘉窃料之，绍有十败，公有十胜。",
        },
        thunderjiding:{
            order: 3,
            content: "执鞭扫南之日，嘉再贺明公于九泉……<br> 天命已成，嘉无负明公之恩！",
        },
        thunderyiji:{
            order: 4,
            content: "潺潺流水声，堪堪难遇卿。<br> 非吾背诺，天不假年。<br> 兰气幽山酌，酒香随水流。<br> 清风山水静，为君起雅韵。",
        },
        die:{
            content:"生如夏花，死亦何憾?",
        }
    },
    stars_zhugeliang:{//诸葛亮
        starszhuanzhen:{
            order: 1,
            content: "无",
        },
        starsliangyi:{
            order: 2,
            content: "情寄三顾之恩，亮必继之以死。<br> 身负六尺之孤，臣当鞠躬尽瘁。<br> 此身抱薪，可付丹鼎，五十四年春秋昭炎汉长明。<br> 南征北伐，誓还旧都，二十四代王业不偏安一隅。",
        },
        starssixiang:{
            order: 3,
            content: "兵者，行霸道之势，彰王道之实。<br> 将为军魂，可因势而袭，其有战无类。<br> 平二川，定三足，恍惚草堂梦里，挥斥千古风流。<br> 战群儒，守空城，今摆乱石八阵，笑谈将军死生。",
        },
        starsbazhen:{
            order: 4,
            content: "轻舟载浊酒，此去，我欲借箭十万。<br> 主公有多大胆略，亮便有多少谋略。<br> 三顾之谊铭心，隆中之言在耳，请托臣讨贼兴复之效。<br> 著大义于四海，揽天下之弼士，诚如是，则汉室可兴。",
        },
        die:{
            content:"天下事，了犹未了，终以不了了之。",
        }
    },
    moon_zhouyu:{//周瑜
        moonyingzi:{
            order: 1,
            content: "火莲绽江矶，炎映三千弱水。<br> 奇志吞樯橹，潮平百万寇贼。<br>江东多锦绣，离火起曹贼毕，九州同忾。<br> 星火乘风，风助火势，其必成燎原之姿。",
        },
        moonyingmou:{
            order: 2,
            content: "行计以险，纵略以奇，敌虽百万亦戏之如犬豕。<br> 若生铸剑为犁之心，须有纵钺止戈之力。<br>既遇知己之明主，当福祸共之，荣辱共之。<br> 将者，贵在知敌虚实，而后避实而击虚。",
        },
        die:{
            content: "人生之艰难，犹如不息之长河。",
        }
    },
    ice_simahui:{//司马徽
        iceshuijing:{
            order: 1,
            content: "好话不言多。<br>美言称好，与君共乐。",
        },
        icejianjie:{
            order: 2,
            content: "荐君良臣，定有所获。<br>你可是人中龙风。",
        },
        iceyinshi:{
            order: 3,
            content: "身在幽静处，大隐山林间。<br>长乐山水中，名留久长远。",
        },
        die:{
            content: "汝等，可不要让我失望啊。",
        }
    },
    /****************************************************************** */
    thunder_caochun:{//曹纯
        thundershanjia: {
            order: 1,
            content:'虎豹骑，皆天下骁锐! <br>缮取治军之道，安抚众军之心。<br>兵法之道，有武且要晓人心。<br> 纲纪督御，不失其理。',
        },
        thundershanjia_gongfa: {
            order: 2,
            content:'百锤锻甲，披之可陷靡阵、断神兵、破坚城！<br>千炼成兵，邀天下群雄引颈，且试我剑利否！',
        },
        thundershanjia_yushou: {
            order: 3,
            content:'激水漂石，鸷鸟毁折，势如曠弩，勇而不乱。<br>破军罢马，丢盔失甲，疲兵残阵，何以御我？',
        },
        die:{
            content:"不胜即亡，唯一死而已!",
        }
    },
    thunder_caopi:{//曹丕
        thunderfangzhu:{
            order: 1,
            content: "爱卿既知朕意，可速赴新任。<br>卿之过虽可免死，贬斥不能得缓。",
        },
        thunderxingshang:{
            order: 2,
            content: "将军为国捐躯，应该贵礼厚葬。<br>斯人已逝，朕自然记挂于心。",
        },
        thundersongwei:{
            order: 3,
            content: "汉禅归魏，天下皆服。<br>魏祚定基，海内匡正。",
        },
        die:{
            content:"仲达，勿要负朕佐魏之托……",
        }
    },
    thunder_wangji:{//王基
        thunderqizhi:{
            order: 1,
            content: "斗奇而争，以妙取胜。<br>用计奇略，制敌服心。",
        },
        thunderjinqu:{
            order: 2,
            content: "拒天诛者意沮，而向王化者益固。<br>志正则众邪不生，心静则众事不躁。",
        },
        die:{
            content: "若子孙不竞，社稷之忧也。",
        }
    },
    thunder_wenyang:{//文鸯
        thunderquedi:{
            order: 1,
            content: "尽屠其精锐，可致元气大伤!<br>我部折损近半，一举拿下，斩草除根!",
        },
        thunderlvli:{
            order: 2,
            content: "彼消我长，细水长流！<br>出入万众，所向皆服。",
        },
        thunderchoujue:{
            order: 3,
            content: "国仇恩怨，就在此战!<br>汝之野心，世人皆知。",
        },
        die:{
            content: "漫漫独行路，凄凉话当年。",
        }
    },
    thunder_zhonghui:{//钟会
        thunderyulei:{
            order: 1,
            content: "风水轮流转，轮到我钟谋问鼎重几何了。<br>汉鹿已失，魏牛犹在，吾欲执其耳。<br>空将宝地赠他人，某怎会心甘情愿？<br>入宝山而空手回，其与匹夫何异？<br>天降大任于斯，不受必遭其殃！<br>我欲行夏禹旧事，为天下任！",
        },
        thunderfulong:{
            order: 2,
            content: "今提三尺剑，开万里疆，九鼎不足为重！<br>经略四州之地，可钓金鲤于渭水。<br>窃钩者诛，窃国者侯，会欲窃九州为狩。<br>今长缨在手，欲问鼎九州！<br>我若束手无策，诸位又有何施为？<br>我有佐国之术，可缚苍龙！",
        },
        thunderyujun:{
            order: 3,
            content: "会不轻易信人，唯不疑伯约。<br>与君相逢恨晚，数语难道天下谊。<br>于天下觉春秋尚早，于伯约恨相见太迟。<br>与君并肩高处，可观众山之小。<br>你我虽异父异母，亦可约为兄弟。<br>我以国士待伯约，伯约定不负我。",
        },
        die:{
            content:"伯约误我……",
        }
    },
    /****************************************************************** */
    fire_baosanniang:{//鲍三娘
        firezhenwu:{
            order: 1,
            content: "红袖爱武妆，不让须眉七尺将，素手可拭刀锋凉。<br>青丝绕青锋，此间巾帼战意浓，烈血尽染女儿红！<br>凤舞天下，炎翎绽红莲，剑斩九州负义人！<br>龙翔八荒，皓鳞濯丹青，刀撰万古春秋义。",
        },
        firezhennan:{
            order: 2,
            content: "南疆有我镇之，定叫蛮夷俯首，再无寇关之意！<br>提刀镇关而守疆者，非男儿之属，巾帼亦可为！<br>青锋荡毒瘴，大江破山流！<br>秋风起，折断岭南十万兵！",
        },
        firefangzong:{
            order: 3,
            content: "情衷此生，愿与君共战于沙场，焉存独活之想！<br>与君为好之心，纵石烂海枯，山河倒悬亦不改。<br>红袖青锋，并肩协战，且看龙飞凤翔。<br>我以此身许忠义，炙炎焚钺锻情丝。",
        },
        die:{
            content:"忘川桥头待君往，三生石上镌三生。",
        }
    },
    fire_guanyinping:{//关银屏
        firexuehen:{
            order: 1,
            content: "久恨难消，此仇必报。<br>就用汝命，为父亲报仇！",
        },
        firehuxiao:{
            order: 2,
            content: "虎啸之威，凤鸣啸引。<br>战场虎女的名号，可不是白叫的。",
        },
        firefengming:{
            order: 3,
            content: "血债累累，你，算得清吗！<br>还没有结束呢！",
        },
        die:{
            content:"这仗已败，是我武艺不精。",
        }
    },
    fire_zhangxingcai:{//张星彩
        fireshenxian:{
            order: 1,
            content: "克娴内则，花柔外刚。<br>能为夫君分忧，臣妾之责。",
        },
        fireqiangwu:{
            order: 2,
            content: "日暮云沙起，花枪英秀扬。<br>柔彩星动，舞耀蜀汉。",
        },
        fireyuzhui:{
            order: 3,
            content: "凭父忠勇，斩尽贼寇!<br>舍我之力，剿魏国刀枪入库，马放南山，永不进犯我大汉!",
        },
        die:{
            content:"战骨黄沙埋，空见归乡魂。",
        }
    },
    fire_zhaoxiang:{//赵襄
        firefengpo:{
            order: 1,
            content: "先魂远守，填西川地陷。<br>英灵助力，扶炎汉天青。",
        },
        /*
        firelonghun:{
            order: 2,
            content: "继续，战斗！<br>为了你们，我会战斗到最后一刻。<br>我是龙魂的继承者！",
        },
        */
        firehunyou:{
            order: 2,
            content: "请借给我，你们的力量！<br>先辈们，赐予我力量吧！",
        },
        "firejueqi": {
            order: 3,
            "content": "逝者如斯，亘古长流，唯英烈之魂悬北斗而长存！<br>赵氏之女，跪祈诸公勿渡黄泉，暂留人间，佑大汉万年！<br>龙凤在侧，五虎在前，天命在汉，既寿永昌！<br>人言为信，日月为明，言日月为证，佑大汉长明！"
        },
        "fireyigong": {
            order: 4,
            "content": "凝傲雪之梅为魄，英魂长存，独耀山河万古明！<br>铸凌霜之寒成剑，青锋出鞘，斩尽天下不臣贼！<br>当年明月凝霜刃，此日送尔渡黄泉！<br>已识万里乾坤大，何虑千山草木青！"
        },
        die:{
            content:"大厦将倾，空余泪两行。",
        }
    },
    fire_jiangwei:{//姜维
        firelinyan:{
            order: 1,
            content: "三尺台上释千古，一曲谱半生，影随光而行。<br>影绎当年蹉跎，戏如人生，几声锣鼓惊春风。<br>炎阳在悬，岂因乌云障日，而弃金光于野？<br>怀麒麟之志，负柱国之托，奔天涯海角！<br>天道昭昭，士如夸父，所逐者忠贞之志尔！<br>炎阳在悬，紫薇居北，士不可以不弘毅！",
        },
        firebazhen:{
            order: 2,
            content: "无",
        },
        fireyujun:{
            order: 3,
            content: "浮生路长，若得遇知己，何其幸哉。<br>你我虽各为其主，然不乏相惜之谊。<br>九州齐喑，我辈燃己长明，君欲同否？<br>英才救世，从者皆众，请君拨乱反正。<br>君才胜司马氏十倍，何故居于人下？<br>国破家亡，君乃最后一线之生机。",
        },
        fireranji:{
            order: 4,
            content: "秉笔客书江湖事，执灯叟照当年人。<br>皮影话峥嵘，千古兴亡事，一杯浊酒中。<br>孤鸿鸣于野，其以身为凤，引春风入汉关。<br>古来圣贤卫道而死，道之存焉何惜深入九渊？<br>舍身入鼎，薪火独耀，此躯可照曰月山河否？<br>天下齐喑，我辈秉身为烛，当照四海九州！",
        },

        die:{
            content:"今日同死，亦无所憾！",
        }
    },
    /****************************************************************** */
    water_lukang:{//陆抗
        waterkegou:{
            order: 1,
            content: "各保分界，无求细利。<br>胸怀千万，彰其德，包其柔。<br>彼专为德，我专为暴，是不战而自服也。<br>一邑一乡，不可以无信义。",
        },
        waterposhi:{
            order: 2,
            content: "破羊枯之策，势在必行。<br>破晋军分进合击之势，牵晋军主力之实。<br>破晋军雄威，断敌心谋略。<br>良谋益策，破敌腹背。",
        },
        die:{
            content: "吾即亡矣，吴又能存几时?",
        }
    },
    water_luxun:{//陆逊
        waterjunlve:{
            order: 1,
            content: "诱敌而入，以待破敌之机。<br>统军之法，不唯以死相拼。",
        },
        watercuike:{
            order: 2,
            content: "摧其壁垒，克其之营。<br> 如此扎寨，牵一发而动全身。",
        },
        waterzhanhuo:{
            order: 3,
            content: "绽火如绽旗，一网打尽！<br> 凭风借势，以火代兵！",
        },
        die:{
            content:"唉...我这算是覆鹿寻蕉之过吗.....",
        }
    },
    water_sunce:{//孙策
        waterjiang:{
            order: 1,
            content: "江东有吾足矣，余者俱听命称臣！<br>今不俯首系颈，明日便尸骨无存！",
        },
        waterhunzi:{
            order: 2,
            content: "力攻平江东，威名扬天下！<br>翻江复倒海，六合定乾坤！",
        },
        wateryinghun:{
            order: 4,
            content: "吾掌中之物，尔等安敢染指！<br>有违吾意者，此子便是下场！",
        },
        die:{
            content:"尔等宵小！穷极龌龊之能事……",
        }
    },
    water_sunshangxiang:{//孙尚香
        waterbeiwu:{
            order: 1,
            content: "风雨如晦，鸡鸣不已，既见君子，云胡不喜？<br>吾至爱君，唯愿执子之手，与子携老。",
        },
        waterxiaoji:{
            order: 2,
            content: "青丝妆白雪，箭射南来之雁，劫青乌之锦书。<br>仗剑行江海，女儿负鼎力，不羡虞姬随霸王。",
        },
        waterliangzhu:{
            order: 3,
            content: "采君之桃李，此物相思，不畏万水千山。<br>受君之琼瑶，无所为报，唯愿此生不离。",
        },
        die:{
            content:"江南流水归海心，我愿随水佑吴盛。",
        }
    },
    water_sunhanhua:{ //孙寒华
        waterhuiling:{
            order: 1,
            content: "静则潜修至道，动则行善累功。<br>阳炁冲三关，斩尸除阴魔。<br>慧剑断情除旧妄，一心向道为苍生。<br>蒲团清静坐，神归了道真。",
        },
        watertaji:{
            order: 2,
            content: "谨以三尺神锋，代天行化，布令宣威。<br>步天罡，踏北斗，有秽皆除，无妖不斩。<br>剑斩魔头，观万灵慑服，群妖束手！<br>一人一剑，往荡平魔窟，再塑人间！",
        },
        waterqinghuang:{
            order: 3,
            content: "执护道之宝器，御万邪之侵袭。<br>刀兵水火，速离身形。<br>定吾三魂七魄，保其不得丧清。<br>体有金光，覆映吾身。",
        },
        die:{
            content:"身腾紫云天门去，随生复感又照明!",
        }
    },
    /****************************************************************** */
    ice_diaochan:{//貂蝉
        icelijian:{
            order: 1,
            content: "好哥哥，是妾身美，还是妾身奏的曲子美?<br>妾身好累，除非将军满饮，不然我便不奏乐了哦。",
        },
        icebiyue:{
            order: 2,
            content: "佳人独舞，瑶光曼丽，今夕谁与共消愁?<br>月上枝头，星满金秋，柔指采蝶妆红袖。",
        },
        die:{
            content:"月下红颜，终随流水去。",
        }
    },
    ice_lvlingqi:{//吕玲绮
        icewushuang:{
            order: 1,
            content: "策马冲阵，铁骑过处尽皆胆寒!<br>挥戟断兵，何人敢挡虓虎之女?",
        },
        iceshenwu:{
            order: 2,
            content: "烽烟遍地，巾帼逞英。<br>巾帼为将，不弱男儿。",
        },
        iceshenwei:{
            order: 3,
            content: "贵勇无惧，奋力先登!<br>披坚执锐，傲气凌人!",
        },
        die:{
            content: "沙场为国死，马革裹尸还。",
        }
    },
    ice_zhangning:{//张宁
        icetianze:{
            order: 1,
            content: "独立而不改，周行而不殆。<br>四时变化，日月更替，天之则也。",
        },
        icedifa:{
            order: 2,
            content: "地之法，土形气形，物因以生。<br>气行乎地中，其行也因地之势。",
        },
        die:{
            content:"天地之变，畏之非也。",
        }
    },
    ice_zhangqiying:{//张琪瑛
        icefalu:{
            order: 1,
            content: "勾陈引麒麟戊日日仁，后土继天雷承运名御。<br>紫微星銮冲九宫之虚，玉清元始化三清之祖。<br>斗虚盈三清之气而冲牛，撷赤虹凌霄，点紫微之绛唇。<br>星守贯太虚之宫而惊鸾，被兜率婧霞，引银河之流星。",
        },
        icedianhua:{
            order: 2,
            content: "虫石草木皆有其灵智，一朝点塞、飞升在即。<br>天上仙人称凡人为顽石，我自有点石成金之妙法。<br>曾乘青鸾过蓬菜，紫鲛捧玉，赤鲤吐珠，一梦登仙途。<br>狐鸣青丘，烛龙千里，共工折柱不周，其仙也，非兽焉。",
        },
        icezhenyi:{
            order: 3,
            content: "彼登西山，采薇而食，非五谷之不膏慕先贤之真璞。<br>春米五斗，散于山泽，邀山鬼之飨宴，惊林间之睡狐。<br>白鸥引醴泉之水，青鹿衔牡野之苹，冯虚御风，可称仙仪。<br>朱雀献首阳之火，玄龟捧息洪之壤，涅槃造化，方成真我。",
        },
        die:{
            content: "韶华不为人间留，恨悠悠，几时休?",
        }
    },
    ice_caoying:{//曹婴
        icelingren:{
            order: 1,
            content: "尔等于我，如着亵衣之黄口于持兵戈之锐士！<br>夫为将者，其行雷厉，其兵骁果，其势凌人！<br>秉凌人之盛气，试青锋于万里！<br>斩宵小于沙场，绝仇雠于疆野！",
        },
        icefujian:{
            order: 2,
            content: "尔军中持戈之护卫，造饭之庖厨，饲马之御者皆为我军耳目！<br>汝营兵将几何，粮草多少，箭矢盈亏，我已了然于胸。<br>紫电耀魍魉之遁形，青霜斩魑魅之神魄。<br>纵汝亡命天涯海角，吾亦逐之负首而还。",
        },
        icelingren_guixin:{
            order: 3,
            content: "太公曾教我一言，宁许我负人不许人负我。<br>大仇在悬，没齿难忘，此日恩怨尽清。",
        },
        icelingren_xingshang:{
            order: 4,
            content: "尔等前往黄泉，此物留于人间，自可为我所用。<br>黄泉路远，袍泽慢行，待我报仇雪恨！",
        },
        die:{
            content:"袍泽捐躯在野，此仇怎可归冢?",
        }
    },
    /****************************************************************** */
    TAF_xuanyuanshenjun:{//轩辕神君
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        TAFjianzhen:{
            order: 2,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_rongchengmoxi:{//容成墨熙
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        TAFsenyu:{
            order: 2,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_rongchengzeqi:{//容成泽漆
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_shentuziye:{//申屠子夜
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        TAFshunshan:{
            order: 2,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_shentuyuanshu:{//申屠元姝
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_wenrenyixuan:{//闻人翊悬
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_wenrenjingxuan:{//闻人镜悬
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        TAFyanyan:{
            order: 2,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_gongyichuren:{//公仪楚人
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_shuiguanzunzhe:{//水冠尊者
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    TAF_suxiaoan:{//苏小安
        TAFwuxing:{
            order: 1,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    /****************************************************************** */
    fire_huangzhong:{//神黄忠
        firelieqiong:{
            order: 1,
            content: "横眉蔑风雨，引弓狩天狼！<br>一箭出，万军毙！",
        },
        firezhanjue:{
            order: 2,
            content: "流不尽的英雄血，斩不尽的逆贼头！<br>长刀渴血，当饲英雄胆！",
        },
        die:{
            content:"箭雨曾蔽日，今夕却成绝响……",
        }
    },
    ice_jiaxu:{//蝶贾诩
        icejiandai:{
            order: 1,
            content: "无",
        },
        icefangcan:{
            order: 2,
            content: "无",
        },
        icejuehun:{
            order: 3,
            content: "无",
        },
        iceluoshu:{
            order: 4,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    yzlh_pot_weiyan:{//势魏延
        potzhongao:{
            order: 1,
            content: "无",
        },
        pothaokua:{
            order: 2,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
    ice_huangfusong:{//武皇甫嵩
        icechaozhen:{
            order: 1,
            content: "九州欲靖，未央待明，今甲光向日之时。<br>身阻狂澜，手扶广厦，老臣此心如铁。",
        },
        icelianjie:{
            order: 2,
            content: "才战凉州罢，挥帜复河湟。<br>犯大汉天威者，虽远必诛!",
        },
        icejiangxian:{
            order: 3,
            content: "将军生白发，兀自横刀，立马啸西风。<br>兴戈止战，愿天下再无烽火。",
        },
        die:{
            content:"心不忘忠，何为不安?",
        }
    },
    ice_nanhualaoxian:{//南华老仙
        iceqingshu:{
            order: 1,
            content: "天赤子青荒，唯记万变其一。<br>天地万法，皆在此书之中。<br>以小篆记大道，则道可道。",
        },
        iceshoushu:{
            order: 2,
            content: "此书载天地至理，望汝珍视如命。<br>天书非凡物，字字皆玄机。<br>我得道成仙，当出世化升人中。",
        },
        icehedao:{
            order: 3,
            content: "不参黄泉，难悟大道。<br>道者，亦置之死地而后生。<br>因果开茅塞，轮回似醍醐。",
        },
        die:{
            content: "尔生异心，必获恶报。",
        }
    },
    water_lvmeng:{//武吕蒙
        waterjuxian:{
            order: 1,
            content: "君子藏器于身，待时而动。<br>枕戈待旦，怒极无为。",
        },
        watershiji:{
            order: 2,
            content: "攻心要害，以取胜券。<br>知其底细，方能百战不殆。<br>勤勉治学，文武兼顾。<br>书卷万学，方知其意。",
        },
        waterzhanxian:{
            order: 3,
            content: "关羽实乃熊虎之将，必当预先谋断!<br>谋而取之，断而破之!",
        },
        die:{
            content: "望主公多思，吾不能再守了。",
        }
    },
    /****************************************************************** */
    TAF_lvbu_three:{//神吕布
        TAF_chiyan:{
            order: 1,
            content: "无",
        },
        TAF_wushuang:{
            order: 2,
            content: "此身此武天下无双。<br>乘赤兔舞画戟斩将破敌，不过举手而为。",
        },
        TAF_zhankai:{
            order: 3,
            content: "兴战之铠，触之必伤！<br>厌伤之胃，眶毗必报！",
        },
        TAF_shenfeng:{
            order: 4,
            content: "神锋出鞘，见血方还！<br>剑锋所指，万军辟易！",
        },
        TAF_liechu:{
            order: 5,
            content: "愤烈杵凿魂，叫尔等肝肠寸断！<br>断轮回六道，囚神佛，共淹黄泉！",
        },
        TAF_fumo:{
            order: 6,
            content: "锦袍失兮怅吾衣，才入魔兮再伏魔！<br>汝皇天威安敢犯？我化修罗伏天魔！",
        },
        TAF_jingang:{
            order: 7,
            content: "金刚怒问竖子，何堪修罗之怒？<br>佛陀悯劝来者，莫渡弱水黄泉？",
        },
        TAF_shenji:{
            order: 8,
            content: "断轮回，笑忘川，召旧部，战黄泉！<br>化修罗，修战予，斩三尸，征九天！",
        },
        die:{
            content:"战神不死，必将再起，其势更烈！！",
        }
    },
    thunder_jiaxu:{//SE贾诩
        thunderweimu:{
            order: 1,
            content: "无",
        },
        thunderwenhe:{
            order: 2,
            content: "无",
        },
        thundermoushen:{
            order: 3,
            content: "无",
        },
        die:{
            content: "无",
        }
    },
    ice_linxi:{//喵林夕
        icexihuo:{
            order: 1,
            content: "无",
        },
        icelingxi:{
            order: 2,
            content: "无",
        },
        icedoumao:{
            order: 3,
            content: "无",
        },
        die:{
            content: "无",
        }
    },
    ice_zhugeliang:{//诸葛亮
        icebuyi:{
            order: 1,
            content: "无",
        },
        icelongdui:{
            order: 2,
            content: "无",
        },
        icechushan:{
            order: 3,
            content: "无",
        },
        die:{
            content: "无",
        }
    },
    ming_xujie:{//明徐阶
        mingxinxue:{
            order: 1,
            content: "无",
        },
        mingyinren:{
            order: 2,
            content: "无",
        },
        die:{
            content: "无",
        }
    },
    /****************************************************************** */
    TAF_lvbu_one:{//神吕布
        TAF_mashu:{
            order: 1,
            content: "无",
        },
        TAF_wushuang:{
            order: 2,
            content: "此身此武天下无双。<br>乘赤兔舞画戟斩将破敌，不过举手而为。",
        },
        TAF_baguan:{
            order: 3,
            content: "凭关镇敌，万夫莫开！<br>雄霸虎牢，一将当关。",
        },
        TAF_zhanjia:{
            order: 4,
            content: "战甲护体，金刚不坏！<br>明光宝甲，护我神躯。",
        },
        TAF_xuli:{
            order: 5,
            content: "力之所待，蓄势而发！<br>利刀缮甲，东山再起。",
        },
        die:{
            content:"战神不死，必将再起，其势更烈！！",
        }
    },
    TAF_lvbu_two:{//神吕布
        TAF_chiyan:{
            order: 1,
            content: "无",
        },
        TAF_wushuang:{
            order: 2,
            content: "此身此武天下无双。<br>乘赤兔舞画戟斩将破敌，不过举手而为。",
        },
        TAF_zhankai:{
            order: 3,
            content: "兴战之铠，触之必伤！<br>厌伤之胃，眶毗必报！",
        },
        TAF_xiuluo:{
            order: 4,
            content: "百战轮回锻神躯，我以修罗彰天魔！<br>六道何须论因果，独霸炼狱斩阎罗！",
        },
        die:{
            content:"战神不死，必将再起，其势更烈！！",
        }
    },
    TAF_shenguigaoda:{//神鬼高达
        TAF_boss_juejing:{
            order: 1,
            content: "置于死地，方能后生！<br>背水一战，不胜便死！",
        },
        TAF_boss_wushuang:{
            order: 2,
            content: "萤烛之火，也敢与日月争辉？<br>鼠辈！螳臂当车！",
        },
        TAF_boss_longhun:{
            order: 3,
            content: "常山赵子龙在此！<br>能屈能伸，才是大丈夫！",
        },
        TAF_boss_jiwu:{
            order: 4,
            content: "我，是不可战胜的！<br>今天，就让你们感受一下真正的绝望！",
        },
        TAF_boss_shenqu:{
            order: 5,
            content: "别心怀侥幸了，你们不可能赢！<br>虎牢关，我一人镇守足矣！",
        },
        TAF_boss_xuanfeng:{
            order: 6,
            content: "千钧之势，力贯苍穹！<br>横扫六合，威震八荒！",
        },
        TAF_boss_wansha:{
            order: 7,
            content: "蝼蚁，怎容偷生？<br>沉沦吧，在这无边的恐惧！",
        },
        TAF_boss_qiangxi:{
            order: 8,
            content: "这么想死，那我就成全你！<br>项上人头，待我来取！",
        },
        TAF_boss_tieji:{
            order: 9,
            content: "哈哈哈，破绽百出！<br>我要让这虎牢关下，血流成河！",
        },
        die:{
            content:"你们的项上人头，我改日再取！龙身虽死，魂魄不灭！",
        }
    },
    TAF_shenguigaoda_shadow:{//神鬼高达
        TAF_boss_juejing:{
            order: 1,
            content: "置于死地，方能后生！<br>背水一战，不胜便死！",
        },
        TAF_boss_wushuang:{
            order: 2,
            content: "萤烛之火，也敢与日月争辉？<br>鼠辈！螳臂当车！",
        },
        TAF_boss_longhun:{
            order: 3,
            content: "常山赵子龙在此！<br>能屈能伸，才是大丈夫！",
        },
        TAF_boss_jiwu:{
            order: 4,
            content: "我，是不可战胜的！<br>今天，就让你们感受一下真正的绝望！",
        },
        TAF_boss_shenqu:{
            order: 5,
            content: "别心怀侥幸了，你们不可能赢！<br>虎牢关，我一人镇守足矣！",
        },
        TAF_boss_xuanfeng:{
            order: 6,
            content: "千钧之势，力贯苍穹！<br>横扫六合，威震八荒！",
        },
        TAF_boss_wansha:{
            order: 7,
            content: "蝼蚁，怎容偷生？<br>沉沦吧，在这无边的恐惧！",
        },
        TAF_boss_qiangxi:{
            order: 8,
            content: "这么想死，那我就成全你！<br>项上人头，待我来取！",
        },
        TAF_boss_tieji:{
            order: 9,
            content: "哈哈哈，破绽百出！<br>我要让这虎牢关下，血流成河！",
        },
        die:{
            content:"你们的项上人头，我改日再取！龙身虽死，魂魄不灭！",
        }
    },
    /****************************************************************** */
    TAFCESHI:{//测试
        iceceshiSkill:{
            order: 1,
            content: "无",
        },
        die:{
            content:"无",
        }
    },
}
const skinschange = lib.config.extension_银竹离火_TAFset_SkillsTips;
if (!skinschange) {
    origintaici.TAF_lvbu_two = {
        TAF_chiyan:{
            order: 1,
            content: "无",
        },
        TAF_wushuang:{
            order: 2,
            content: "此身此武天下无双。<br>乘赤兔舞画戟斩将破敌，不过举手而为。",
        },
        TAF_zhankai:{
            order: 3,
            content: "兴战之铠，触之必伤！<br>厌伤之胃，眶毗必报！",
        },
        TAF_xiuluo:{
            order: 4,
            content: "百战轮回锻神躯，我以修罗彰天魔！<br>六道何须论因果，独霸炼狱斩阎罗！",
        },
        TAF_shenfeng:{
            order: 5,
            content: "神锋出鞘，见血方还！<br>剑锋所指，万军辟易！",
        },
        TAF_liechu:{
            order: 6,
            content: "愤烈杵凿魂，叫尔等肝肠寸断！<br>断轮回六道，囚神佛，共淹黄泉！",
        },
        TAF_fumo:{
            order: 7,
            content: "锦袍失兮怅吾衣，才入魔兮再伏魔！<br>汝皇天威安敢犯？我化修罗伏天魔！",
        },
        TAF_jingang:{
            order: 8,
            content: "金刚怒问竖子，何堪修罗之怒？<br>佛陀悯劝来者，莫渡弱水黄泉？",
        },
        TAF_shenji:{
            order: 9,
            content: "断轮回，笑忘川，召旧部，战黄泉！<br>化修罗，修战予，斩三尸，征九天！",
        },
        die:{
            content:"战神不死，必将再起，其势更烈！！",
        }
    };
}
/**
 * 原画台词
 */
export const taici = origintaici;

/********************************************************************************** */
/**
 * 攻略
 */
let origingonglve = {
    TAF_zhaoyun: {//神赵云
        comment: '暂无',
        score: [3, 5, 4, 3, 4, 2],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    /****************************************************************** */
    sun_simayi: {//司马懿
        comment: '暂无',
        score: [3, 5, 5, 2, 3, 5],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    sun_zhangchunhua: {//张春华
        comment: '暂无',
        score: [4, 3, 3, 1, 1, 1],
    },
    /****************************************************************** */
    thunder_caocao: {//曹操
        comment: '暂无',
        score: [3, 5, 5, 2, 3, 1],
    },
    fire_liubei: {//刘备
        comment: '暂无',
        score: [3, 3, 2, 1, 2, 1],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    water_sunquan: {//孙权
        comment: '暂无',
        score: [4, 2, 3, 2, 1, 5],
    },
    ice_zhangjiao: {//张角
        comment: '暂无',
        score: [3, 3, 3, 5, 4, 3],
    },
    /****************************************************************** */
    thunder_guojia: {//郭嘉
        comment: '暂无',
        score: [1, 3, 4, 3, 5, 5],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    stars_zhugeliang: {//诸葛亮
        comment: '暂无',
        score: [4, 2, 3, 2, 5, 2],
    },
    moon_zhouyu: {//周瑜
        comment: '暂无',
        score: [5, 1, 5, 2, 1, 3],
    },
    ice_simahui: {//司马徽
        comment: '暂无',
        score: [1, 3, 4, 3, 3, 5],
    },
    /****************************************************************** */
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
    /****************************************************************** */
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
    /****************************************************************** */
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
    /****************************************************************** */
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
    /****************************************************************** */
    TAF_xuanyuanshenjun: {//轩辕神君
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    TAF_rongchengmoxi: {//容成墨熙
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_rongchengzeqi: {//容成墨熙
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_shentuziye: {//申屠子夜
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_shentuyuanshu: {//申屠元姝
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wenrenyixuan: {//闻人翊悬
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_wenrenjingxuan: {//闻人镜悬
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_gongyichuren: {//公仪楚人
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_shuiguanzunzhe: {//水冠尊者
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    TAF_suxiaoan: {//苏小安
        comment: '暂无',
        score: [1, 1, 1, 1, 1, 1],
    },
    /****************************************************************** */
    fire_huangzhong: {//神黄忠
        comment: '暂无',
        score: [5, 2, 3, 3, 2, 1],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    ice_jiaxu: {//蝶贾诩
        comment: '暂无',
        score: [3, 2, 3, 3, 2, 5],
    },
    yzlh_pot_weiyan: {//势魏延
        comment: '暂无',
        score: [5, 1, 4, 1, 1, 5],
    },
    ice_huangfusong: {//武皇甫嵩
        comment: '暂无',
        score: [5, 3, 4, 1, 2, 4],
    },
    ice_nanhualaoxian: {//南华老仙
        comment: '暂无',
        score: [2, 3, 3.5, 4.5, 5, 2],
    },
    /****************************************************************** */
    TAF_lvbu_three: {//神吕布
        comment: '暂无',
        score: [5, 5, 5, 5, 3, 0.5],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    thunder_jiaxu: {//SE贾诩
        comment: '暂无',
        score: [3, 3, 3, 5, 5, 4.5],
    },
    ice_linxi: {//喵林夕
        comment: '暂无',
        score: [3, 3, 5, 5, 5, 3],
    },
    ice_zhugeliang: {//诸葛亮
        comment: '暂无',
        score: [3, 5, 2, 4, 5, 4],
    },
    ming_xujie: {//明徐阶
        comment: '暂无',
        score: [3, 2, 3, 3.5, 5, 3.5],
    },
    /****************************************************************** */
    TAF_lvbu_one: {//神吕布
        comment: '暂无',
        score: [3, 5, 5, 2, 2, 0.5],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
    TAF_lvbu_two: {//神吕布
        comment: '暂无',
        score: [5, 5, 5, 5, 3, 0.5],
    },
    /****************************************************************** */
    TAFCESHI: {//测试
        comment: '未知的力量！',
        score: [5, 5, 5, 5, 5, 5],// '输出', '生存', '过牌', '控制', '辅助', '难度' 对应的数字（最大为5）
    },
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
 * 攻略
 */
export const gonglve = origingonglve;

/********************************************************************************** */
/**
 * 皮肤信息，及皮肤台词
 */
let originskininfo = { 
    //神赵云
    TAF_zhaoyun1: {
        level: '限定',
        translation: '龙腾虎跃',
        info: '画师：白',
        order: 1, // 显示顺序
        skill: {
            TAFjuejing:{
                order: 1,
                content: "龙翔九天，曳日月于天地，换旧符于新岁。<br>御风万里，辟邪祟于宇外，映祥瑞于神州。",
            },
            TAFlonghun:{
                order: 2,
                content: "龙诞新岁，普天同庆，魂佑宇内，裔泽炎黄。<br>龙吐息而万物生，今龙临神州，华夏当兴。",
            },
            die:{
                content:"酒足驱年兽，新岁老一人。",
            }
        },
    },
    TAF_zhaoyun2: {
        level: '传说',
        translation: '龙腾虎跃',
        info: '画师：depp',
        order: 2, // 显示顺序
        skill: {
            TAFjuejing:{
                order: 1,
                content: "舍生取义，感主公之恩。<br>舍生忘死，得保幼主。",
            },
            TAFlonghun:{
                order: 2,
                content: "来感受这，降世神龙的力量吧。<br>龙魂在身，凡人不可近。",
            },
            die:{
                content:"此躯虽毁，意志尚存。",
            }
        },
    },
    TAF_zhaoyun3: {
        level: '传说',
        translation: '御龙在天',
        info: '画师：君桓文化',
        order: 3, // 显示顺序
        skill: {
            TAFjuejing:{
                order: 1,
                content: "还不可以认输!<br>绝望中仍存有一线生机!",
            },
            TAFlonghun:{
                order: 2,
                content: "龙战于野，其血玄黄!<br>潜龙勿用，藏锋守拙!",
            },
            die:{
                content:"龙鳞崩损，坠于九天!",
            }
        },
    },
    TAF_zhaoyun4: {
        level: '史诗',
        translation: '孤胆救主',
        info: '画师：秋呆呆',
        order: 4, // 显示顺序
        skill: {
            TAFjuejing:{
                order: 1,
                content: "乐昌笃实，不屈不挠。<br>以身报君，不求偷生。",
            },
            TAFlonghun:{
                order: 2,
                content: "龙魂之力，百战皆克。<br>龙游中原，魂魄不息。",
            },
            die:{
                content:"来生，愿再遇主公。",
            }
        },
    },
    TAF_jiangtaixu1:{//姜太虚
        level: '限定',
        translation: '神王净土',
        info: '画师：佚名',
        order: 1, // 显示顺序
        skill: {
            TAFjingtu:{
                order: 1,
                content: "怡然独向九霄中坐看浮生做梦。<br>阴阳化生清浊自分。",
            },
            TAFjuechen:{
                order: 2,
                content: "醒时恐为梦一场，身世俱望，何处是吾乡？<br>为了这片土地，我需要力量。",
            },
            TAFshenqu:{
                order: 3,
                content: "时间冲淡了，我的记忆，也冲散了他们的轮廓。<br>庭前旧梅泛新香，当时故人如今不在旁。",
            },
            die:{
                content:"不能在这里停下。",
            }
        },
    },
    /****************************************************************** */
    //司马懿
    sun_simayi1: {
        level: '限定',
        translation: '韬谋韫势·阳',
        info: '画师：鬼画府',
        order: 2, // 显示顺序
        skill: {
            sunquanmou:{
                order: 1,
                content: "洛水为誓，皇天为证，吾意不在刀兵。<br>以谋代战，攻形不以力，攻心不以勇。<br>鸿门之宴虽歇，会稽之胆尚悬，孤岂姬、项之辈。<br>昔藏青锋于沧海，今潮落，可现兵！",
            },
            sunxiongyi:{
                order: 2,
                content: "烽烟起大荒，戎军远役，问不臣者谁？<br>挥斥千军之贲，长驱万里之远。<br>率土之滨皆为王臣，辽土亦居普天之下。<br>青云远上，寒锋试刃，北雁当寄红翎。",
            },
            sunpingling:{
                order: 3,
                content: "煞星聚顶，你死到临头了！<br>天狼星光大盛，天下易主可期。<br>天命，也由我来定!<br>司马氏乃天命之所加矣。",
            },
            die:{
                content:"以权谋而立者，必失大义于千秋。",
            }
        },
    },
    sun_simayi2: {
        level: '限定',
        translation: '韬谋韫势·阴',
        info: '画师：鬼画府',
        order: 2, // 显示顺序
        skill: {
            sunquanmou:{
                order: 1,
                content: "洛水为誓，皇天为证，吾意不在刀兵。<br>以谋代战，攻形不以力，攻心不以勇。<br>鸿门之宴虽歇，会稽之胆尚悬，孤岂姬、项之辈。<br>昔藏青锋于沧海，今潮落，可现兵！",
            },
            sunxiongyi:{
                order: 2,
                content: "烽烟起大荒，戎军远役，问不臣者谁？<br>挥斥千军之贲，长驱万里之远。<br>率土之滨皆为王臣，辽土亦居普天之下。<br>青云远上，寒锋试刃，北雁当寄红翎。",
            },
            sunpingling:{
                order: 3,
                content: "煞星聚顶，你死到临头了！<br>天狼星光大盛，天下易主可期。<br>天命，也由我来定!<br>司马氏乃天命之所加矣。",
            },
            die:{
                content:"人立中流，非己力可向，实大势所迫。",
            }
        },
    },
    sun_simayi3: {
        level: '限定',
        translation: '隐龙如晦·阳',
        info: '画师：徐子晖',
        order: 3, // 显示顺序
        skill: {
            sunquanmou:{
                order: 1,
                content: "金杯共君饮，极目江山，天下士在我!<br>受天命永昌，此时身立，此生不再屈!<br>俯首效淮阴，圯下取履，吾不得拜天子?<br>膝下生金，身不屈，以何掘?",
            },
            sunxiongyi:{
                order: 2,
                content: "乾坤得正，手摘十万星辰，不妨高声语!<br>掌中舞干将，再祭红刹三千，将相皆作古!<br>低眉养红莲，此花开时，诸侯尽膝行!<br>袖中藏莫邪，志高位卑，犹思屠犬豕。",
            },
            sunpingling:{
                order: 3,
                content: "煞星聚顶，你死到临头了！<br>天狼星光大盛，天下易主可期。<br>天命，也由我来定!<br>司马氏乃天命之所加矣。",
            },
            die:{
                content:"欲簪冠上缨，何惜刃加身。",
            }
        },
    },
    sun_simayi4: {
        level: '限定',
        translation: '隐龙如晦·阴',
        info: '画师：徐子晖',
        order: 4, // 显示顺序
        skill: {
            sunquanmou:{
                order: 1,
                content: "金杯共君饮，极目江山，天下士在我!<br>受天命永昌，此时身立，此生不再屈!<br>俯首效淮阴，圯下取履，吾不得拜天子?<br>膝下生金，身不屈，以何掘?",
            },
            sunxiongyi:{
                order: 2,
                content: "乾坤得正，手摘十万星辰，不妨高声语!<br>掌中舞干将，再祭红刹三千，将相皆作古!<br>低眉养红莲，此花开时，诸侯尽膝行!<br>袖中藏莫邪，志高位卑，犹思屠犬豕。",
            },
            sunpingling:{
                order: 3,
                content: "煞星聚顶，你死到临头了！<br>天狼星光大盛，天下易主可期。<br>天命，也由我来定!<br>司马氏乃天命之所加矣。",
            },
            die:{
                content:"已至悬崖，不销勒马。",
            }
        },
    },
    //张春华
    sun_zhangchunhua1: {
        level: '限定',
        translation: '无限愁寒·阳',
        info: '画师：depp',
        order: 1, // 显示顺序
        skill: {
            sunjueqing:{
                order: 1,
                content: "多情不若绝情好。<br>凭君莫话封侯事，一将功成万骨枯。<br>繁星映月满欢喜，悲欢离合总无情。<br>劝君多珍重，此间不相见。",
            },
            sunshangshi:{
                order: 2,
                content: "酒不醉人人自醉，情不伤人人自负。<br>女人，也该对自己狠一点。<br>何处蓝染玫色起，伤尽三千痴缠意。<br>一缕冷香远，逝花落，笑靥消。",
            },
            die:{
                content:"夫妻情分已尽，累了。",
            }
        },
    },
    sun_zhangchunhua2: {
        level: '限定',
        translation: '无限愁寒·阴',
        info: '画师：第七个桔子',
        order: 2, // 显示顺序
        skill: {
            sunjueqing:{
                order: 1,
                content: "多情不若绝情好。<br>凭君莫话封侯事，一将功成万骨枯。<br>繁星映月满欢喜，悲欢离合总无情。<br>劝君多珍重，此间不相见。",
            },
            sunshangshi:{
                order: 2,
                content: "酒不醉人人自醉，情不伤人人自负。<br>女人，也该对自己狠一点。<br>何处蓝染玫色起，伤尽三千痴缠意。<br>一缕冷香远，逝花落，笑靥消。",
            },
            die:{
                content:"孤影自怜，无限愁寒。",
            }
        },
    },
    /****************************************************************** */
    //郭嘉
    thunder_guojia1:{
        level: '限定',
        translation: '翼谋奇佐·阳',
        info: '画师：鬼画府',
        order: 1, // 显示顺序
        skill: {
            thunderqizuo:{
                order: 1,
                content: "绸缪于未雨，手握胜机，雨落何妨高歌?<br> 此帆济沧海，彼岸日边，任他风雨飘摇！<br> 嘉不受此劫，安能以凡人之躯窥得天机!<br> 九州为觞，风雨为酿，谁与我共饮此杯?",
            },
            thunderlunshi:{
                order: 2,
                content: "曹公济天下大难，必定霸王之业。<br> 智者审于良主，袁公未知用人之机。<br> 公有此十胜，败绍非难事尔。<br> 嘉窃料之，绍有十败，公有十胜。",
            },
            thunderjiding:{
                order: 3,
                content: "执鞭扫南之日，嘉再贺明公于九泉……<br> 天命已成，嘉无负明公之恩！",
            },
            thunderyiji:{
                order: 4,
                content: "潺潺流水声，堪堪难遇卿。<br> 非吾背诺，天不假年。<br> 兰气幽山酌，酒香随水流。<br> 清风山水静，为君起雅韵。",
            },
            die:{
                content:"生如夏花，死亦何憾?",
            }
        },
    },
    thunder_guojia2:{
        level: '限定',
        translation: '翼谋奇佐·阴',
        info: '画师：鬼画府',
        order: 2, // 显示顺序
        skill: {
            thunderqizuo:{
                order: 1,
                content: "绸缪于未雨，手握胜机，雨落何妨高歌?<br> 此帆济沧海，彼岸日边，任他风雨飘摇！<br> 嘉不受此劫，安能以凡人之躯窥得天机!<br> 九州为觞，风雨为酿，谁与我共饮此杯?",
            },
            thunderlunshi:{
                order: 2,
                content: "曹公济天下大难，必定霸王之业。<br> 智者审于良主，袁公未知用人之机。<br> 公有此十胜，败绍非难事尔。<br> 嘉窃料之，绍有十败，公有十胜。",
            },
            thunderjiding:{
                order: 3,
                content: "执鞭扫南之日，嘉再贺明公于九泉……<br> 天命已成，嘉无负明公之恩！",
            },
            thunderyiji:{
                order: 4,
                content: "潺潺流水声，堪堪难遇卿。<br> 非吾背诺，天不假年。<br> 兰气幽山酌，酒香随水流。<br> 清风山水静，为君起雅韵。",
            },
            die:{
                content:"江湖路远，诸君，某先行一步。",
            }
        },
    },
    //诸葛亮
    stars_zhugeliang1: {
        level: '限定',
        translation: '天意可叹·阳',
        info: '画师：未知',
        order: 1, // 显示顺序
        skill: {
            starszhuanzhen:{
                order: 1,
                content: "无",
            },
            starsliangyi:{
                order: 2,
                content: "情寄三顾之恩，亮必继之以死。<br> 身负六尺之孤，臣当鞠躬尽瘁。<br> 此身抱薪，可付丹鼎，五十四年春秋昭炎汉长明。<br> 南征北伐，誓还旧都，二十四代王业不偏安一隅。",
            },
            starssixiang:{
                order: 3,
                content: "兵者，行霸道之势，彰王道之实。<br> 将为军魂，可因势而袭，其有战无类。<br> 平二川，定三足，恍惚草堂梦里，挥斥千古风流。<br> 战群儒，守空城，今摆乱石八阵，笑谈将军死生。",
            },
            starsbazhen:{
                order: 4,
                content: "轻舟载浊酒，此去，我欲借箭十万。<br> 主公有多大胆略，亮便有多少谋略。<br> 三顾之谊铭心，隆中之言在耳，请托臣讨贼兴复之效。<br> 著大义于四海，揽天下之弼士，诚如是，则汉室可兴。",
            },
            die:{
                content:"天下事，了犹未了，终以不了了之。",
            }
        },
    },
    stars_zhugeliang2: {
        level: '限定',
        translation: '天意可叹·阴',
        info: '画师：未知',
        order: 2, // 显示顺序
        skill: {
            starszhuanzhen:{
                order: 1,
                content: "无",
            },
            starsliangyi:{
                order: 2,
                content: "情寄三顾之恩，亮必继之以死。<br> 身负六尺之孤，臣当鞠躬尽瘁。<br> 此身抱薪，可付丹鼎，五十四年春秋昭炎汉长明。<br> 南征北伐，誓还旧都，二十四代王业不偏安一隅。",
            },
            starssixiang:{
                order: 3,
                content: "兵者，行霸道之势，彰王道之实。<br> 将为军魂，可因势而袭，其有战无类。<br> 平二川，定三足，恍惚草堂梦里，挥斥千古风流。<br> 战群儒，守空城，今摆乱石八阵，笑谈将军死生。",
            },
            starsbazhen:{
                order: 4,
                content: "轻舟载浊酒，此去，我欲借箭十万。<br> 主公有多大胆略，亮便有多少谋略。<br> 三顾之谊铭心，隆中之言在耳，请托臣讨贼兴复之效。<br> 著大义于四海，揽天下之弼士，诚如是，则汉室可兴。",
            },
            die:{
                content:"一别隆中三十载，归来犹唱梁甫吟。",
            }
        },
    },
    //周瑜
    moon_zhouyu1:{
        level: '限定',
        translation: '炽谋英隽·阳',
        info: '画师：鬼画府',
        order: 1, // 显示顺序
        skill: {
            moonyingzi: {
                order: 1,
                content:'火莲绽江矶，炎映三千弱水。<br> 奇志吞樯橹，潮平百万寇贼。<br>江东多锦绣，离火起曹贼毕，九州同忾。<br> 星火乘风，风助火势，其必成燎原之姿。',
            },
            moonyingmou: {
                order: 2,
                content:'行计以险，纵略以奇，敌虽百万亦戏之如犬豕。<br> 若生铸剑为犁之心，须有纵钺止戈之力。<br>既遇知己之明主，当福祸共之，荣辱共之。<br> 将者，贵在知敌虚实，而后避实而击虚。',
            },
            die: {
                content: '人生之艰难，犹如不息之长河。',
            }
        },
    },
    moon_zhouyu2: {
        level: '限定',
        translation: '炽谋英隽·阴',
        info: '画师：鬼画府',
        order: 2, // 显示顺序
        skill: {
            moonyingzi: {
                order: 1,
                content:'火莲绽江矶，炎映三千弱水。<br> 奇志吞樯橹，潮平百万寇贼。<br>江东多锦绣，离火起曹贼毕，九州同忾。<br> 星火乘风，风助火势，其必成燎原之姿。',
            },
            moonyingmou: {
                order: 2,
                content:'行计以险，纵略以奇，敌虽百万亦戏之如犬豕。<br> 若生铸剑为犁之心，须有纵钺止戈之力。<br>既遇知己之明主，当福祸共之，荣辱共之。<br> 将者，贵在知敌虚实，而后避实而击虚。',
            },
            die: {
                content: '大业未成，奈何身赴黄泉。',
            }
        },
    },
    moon_zhouyu3: {
        level: '限定',
        translation: '江山如画·阳',
        info: '画师：小新',
        order: 3, // 显示顺序
        skill: {
            moonyingzi: {
                order: 1,
                content:'烈酒入胸腹，对月啸三分，且炙仇雠八百里。<br> 千帆载丹鼎，万军为薪，一焚可引振翼之金乌。<br>红莲生碧波，水火相融之际、吴钩刈将之时！<br> 青帆载红莲，白浪淘沙，紫帜漫北地。',
            },
            moonyingmou: {
                order: 2,
                content:'良策生胸腹，一瓢锦绣可倾三千弱水。<br> 雄略规经纬，乘帆梦日，天下自可纵横。<br>君子行陌路，振翅破樊笼，何妨天涯万里！<br> 年少立志三千里，会当击水，屈指问东风！',
            },
            die: {
                content: '大江东去终归海，大业未竞恨英雄。',
            }
        },
    },
    moon_zhouyu4: {
        level: '限定',
        translation: '江山如画·阴',
        info: '画师：小新',
        order: 4, // 显示顺序
        skill: {
            moonyingzi: {
                order: 1,
                content:'烈酒入胸腹，对月啸三分，且炙仇雠八百里。<br> 千帆载丹鼎，万军为薪，一焚可引振翼之金乌。<br>红莲生碧波，水火相融之际、吴钩刈将之时！<br> 青帆载红莲，白浪淘沙，紫帜漫北地。',
            },
            moonyingmou: {
                order: 2,
                content:'良策生胸腹，一瓢锦绣可倾三千弱水。<br> 雄略规经纬，乘帆梦日，天下自可纵横。<br>君子行陌路，振翅破樊笼，何妨天涯万里！<br> 年少立志三千里，会当击水，屈指问东风！',
            },
            die: {
                content: '人生不如意事十之八九，如何不恨?',
            }
        },
    },
    //司马徽
    /****************************************************************** */
    //曹纯
    thunder_caochun1: {
        level: '限定',
        translation: '虎啸龙渊·阳',
        info: '画师：凡果_Make',
        order: 1, // 显示顺序
        skill: {
            thundershanjia: {
                order: 1,
                content:'虎豹骑，皆天下骁锐! <br>缮取治军之道，安抚众军之心。<br>兵法之道，有武且要晓人心。<br> 纲纪督御，不失其理。',
            },
            thundershanjia_gongfa: {
                order: 2,
                content:'百锤锻甲，披之可陷靡阵、断神兵、破坚城！<br>千炼成兵，邀天下群雄引颈，且试我剑利否！',
            },
            thundershanjia_yushou: {
                order: 3,
                content:'激水漂石，鸷鸟毁折，势如曠弩，勇而不乱。<br>破军罢马，丢盔失甲，疲兵残阵，何以御我？',
            },
            die:{
                content:"不胜即亡，唯一死而已!",
            }
        },
    },
    thunder_caochun2: {
        level: '限定',
        translation: '虎啸龙渊·阴',
        info: '画师：凡果_Make',
        order: 2, // 显示顺序
        skill: {
            thundershanjia: {
                order: 1,
                content:'虎豹骑，皆天下骁锐! <br>缮取治军之道，安抚众军之心。<br>兵法之道，有武且要晓人心。<br> 纲纪督御，不失其理。',
            },
            thundershanjia_gongfa: {
                order: 2,
                content:'百锤锻甲，披之可陷靡阵、断神兵、破坚城！<br>千炼成兵，邀天下群雄引颈，且试我剑利否！',
            },
            thundershanjia_yushou: {
                order: 3,
                content:'激水漂石，鸷鸟毁折，势如曠弩，勇而不乱。<br>破军罢马，丢盔失甲，疲兵残阵，何以御我？',
            },
            die:{
                content:"我有如此之势，不可能输!",
            }
        },
    },
    //曹丕
    //王基
    //文鸯
    //钟会
    thunder_zhonghui1: {
        level: '限定',
        translation: '潜蛟觊天',
        info: '画师：凡果',
        order: 1, // 显示顺序
        skill: {
            thunderyulei:{
                order: 1,
                content: "风水轮流转，轮到我钟谋问鼎重几何了。<br>汉鹿已失，魏牛犹在，吾欲执其耳。<br>空将宝地赠他人，某怎会心甘情愿？<br>入宝山而空手回，其与匹夫何异？<br>天降大任于斯，不受必遭其殃！<br>我欲行夏禹旧事，为天下任！",
            },
            thunderfulong:{
                order: 2,
                content: "今提三尺剑，开万里疆，九鼎不足为重！<br>经略四州之地，可钓金鲤于渭水。<br>窃钩者诛，窃国者侯，会欲窃九州为狩。<br>今长缨在手，欲问鼎九州！<br>我若束手无策，诸位又有何施为？<br>我有佐国之术，可缚苍龙！",
            },
            thunderyujun:{
                order: 3,
                content: "会不轻易信人，唯不疑伯约。<br>与君相逢恨晚，数语难道天下谊。<br>于天下觉春秋尚早，于伯约恨相见太迟。<br>与君并肩高处，可观众山之小。<br>你我虽异父异母，亦可约为兄弟。<br>我以国士待伯约，伯约定不负我。",
            },
            die:{
                content:"伯约误我……",
            }
        },
    },
    thunder_zhonghui2: {
        level: '限定',
        translation: '潜蛟觊天',
        info: '画师：凡果',
        order: 1, // 显示顺序
        skill: {
            thunderyulei:{
                order: 1,
                content: "风水轮流转，轮到我钟谋问鼎重几何了。<br>汉鹿已失，魏牛犹在，吾欲执其耳。<br>空将宝地赠他人，某怎会心甘情愿？<br>入宝山而空手回，其与匹夫何异？<br>天降大任于斯，不受必遭其殃！<br>我欲行夏禹旧事，为天下任！",
            },
            thunderfulong:{
                order: 2,
                content: "今提三尺剑，开万里疆，九鼎不足为重！<br>经略四州之地，可钓金鲤于渭水。<br>窃钩者诛，窃国者侯，会欲窃九州为狩。<br>今长缨在手，欲问鼎九州！<br>我若束手无策，诸位又有何施为？<br>我有佐国之术，可缚苍龙！",
            },
            thunderyujun:{
                order: 3,
                content: "会不轻易信人，唯不疑伯约。<br>与君相逢恨晚，数语难道天下谊。<br>于天下觉春秋尚早，于伯约恨相见太迟。<br>与君并肩高处，可观众山之小。<br>你我虽异父异母，亦可约为兄弟。<br>我以国士待伯约，伯约定不负我。",
            },
            die:{
                content:"伯约误我……",
            }
        },
    },
    thunder_zhonghui3: {
        level: '传说',
        translation: '金兰共战',
        info: '画师：错落宇宙',
        order: 3, // 显示顺序
        skill: {
            thunderyulei:{
                order: 1,
                content: "风水轮流转，轮到我钟谋问鼎重几何了。<br>汉鹿已失，魏牛犹在，吾欲执其耳。<br>空将宝地赠他人，某怎会心甘情愿？<br>入宝山而空手回，其与匹夫何异？<br>天降大任于斯，不受必遭其殃！<br>我欲行夏禹旧事，为天下任！",
            },
            thunderfulong:{
                order: 2,
                content: "今提三尺剑，开万里疆，九鼎不足为重！<br>经略四州之地，可钓金鲤于渭水。<br>窃钩者诛，窃国者侯，会欲窃九州为狩。<br>今长缨在手，欲问鼎九州！<br>我若束手无策，诸位又有何施为？<br>我有佐国之术，可缚苍龙！",
            },
            thunderyujun:{
                order: 3,
                content: "会不轻易信人，唯不疑伯约。<br>与君相逢恨晚，数语难道天下谊。<br>于天下觉春秋尚早，于伯约恨相见太迟。<br>与君并肩高处，可观众山之小。<br>你我虽异父异母，亦可约为兄弟。<br>我以国士待伯约，伯约定不负我。",
            },
            die:{
                content:"伯约误我……",
            }
        },
    },
    /****************************************************************** */
    //鲍三娘
    fire_baosanniang1: {
        level: '限定',
        translation: '凤舞龙翔·阳',
        info: '画师：木美人',
        order: 1, // 显示顺序
        skill: {
            firezhenwu:{
                order: 1,
                content: "红袖爱武妆，不让须眉七尺将，素手可拭刀锋凉。<br>青丝绕青锋，此间巾帼战意浓，烈血尽染女儿红！<br>凤舞天下，炎翎绽红莲，剑斩九州负义人！<br>龙翔八荒，皓鳞濯丹青，刀撰万古春秋义。",
            },
            firezhennan:{
                order: 2,
                content: "南疆有我镇之，定叫蛮夷俯首，再无寇关之意！<br>提刀镇关而守疆者，非男儿之属，巾帼亦可为！<br>青锋荡毒瘴，大江破山流！<br>秋风起，折断岭南十万兵！",
            },
            firefangzong:{
                order: 3,
                content: "情衷此生，愿与君共战于沙场，焉存独活之想！<br>与君为好之心，纵石烂海枯，山河倒悬亦不改。<br>红袖青锋，并肩协战，且看龙飞凤翔。<br>我以此身许忠义，炙炎焚钺锻情丝。",
            },
            die:{
                content:"忘川桥头待君往，三生石上镌三生。",
            }
        },
    },
    fire_baosanniang2: {
        level: '限定',
        translation: '凤舞龙翔·阴',
        info: '画师：木美人',
        order: 2, // 显示顺序
        skill: {
            firezhenwu:{
                order: 1,
                content: "红袖爱武妆，不让须眉七尺将，素手可拭刀锋凉。<br>青丝绕青锋，此间巾帼战意浓，烈血尽染女儿红！<br>凤舞天下，炎翎绽红莲，剑斩九州负义人！<br>龙翔八荒，皓鳞濯丹青，刀撰万古春秋义。",
            },
            firezhennan:{
                order: 2,
                content: "南疆有我镇之，定叫蛮夷俯首，再无寇关之意！<br>提刀镇关而守疆者，非男儿之属，巾帼亦可为！<br>青锋荡毒瘴，大江破山流！<br>秋风起，折断岭南十万兵！",
            },
            firefangzong:{
                order: 3,
                content: "情衷此生，愿与君共战于沙场，焉存独活之想！<br>与君为好之心，纵石烂海枯，山河倒悬亦不改。<br>红袖青锋，并肩协战，且看龙飞凤翔。<br>我以此身许忠义，炙炎焚钺锻情丝。",
            },
            die:{
                content:"今日虽死，亦不能使敌进半步！",
            }
        },
    },
    //赵襄
    fire_zhaoxiang1: {
        level: '限定',
        translation: '月痕芳影·阳',
        info: '画师：疾速K',
        order: 1, // 显示顺序
        skill: {
            firefengpo:{
                order: 1,
                content: "先魂远守，填西川地陷。<br>英灵助力，扶炎汉天青。",
            },
            /*
            firelonghun:{
                order: 2,
                content: "继续，战斗！<br>为了你们，我会战斗到最后一刻。<br>我是龙魂的继承者！",
            },
            */
            firehunyou:{
                order: 2,
                content: "请借给我，你们的力量！<br>先辈们，赐予我力量吧！",
            },
            "firejueqi": {
                order: 3,
                "content": "逝者如斯，亘古长流，唯英烈之魂悬北斗而长存！<br>赵氏之女，跪祈诸公勿渡黄泉，暂留人间，佑大汉万年！<br>龙凤在侧，五虎在前，天命在汉，既寿永昌！<br>人言为信，日月为明，言日月为证，佑大汉长明！"
            },
            "fireyigong": {
                order: 4,
                "content": "凝傲雪之梅为魄，英魂长存，独耀山河万古明！<br>铸凌霜之寒成剑，青锋出鞘，斩尽天下不臣贼！<br>当年明月凝霜刃，此日送尔渡黄泉！<br>已识万里乾坤大，何虑千山草木青！"
            },
            die:{
                content:"大厦将倾，空余泪两行。",
            }
        },
    },
    fire_zhaoxiang2: {
        level: '限定',
        translation: '月痕芳影·阴',
        info: '画师：疾速K',
        order: 2, // 显示顺序
        skill: {
            firefengpo:{
                order: 1,
                content: "先魂远守，填西川地陷。<br>英灵助力，扶炎汉天青。",
            },
            /*
            firelonghun:{
                order: 2,
                content: "继续，战斗！<br>为了你们，我会战斗到最后一刻。<br>我是龙魂的继承者！",
            },
            */
            firehunyou:{
                order: 2,
                content: "请借给我，你们的力量！<br>先辈们，赐予我力量吧！",
            },
            "firejueqi": {
                order: 3,
                "content": "逝者如斯，亘古长流，唯英烈之魂悬北斗而长存！<br>赵氏之女，跪祈诸公勿渡黄泉，暂留人间，佑大汉万年！<br>龙凤在侧，五虎在前，天命在汉，既寿永昌！<br>人言为信，日月为明，言日月为证，佑大汉长明！"
            },
            "fireyigong": {
                order: 4,
                "content": "凝傲雪之梅为魄，英魂长存，独耀山河万古明！<br>铸凌霜之寒成剑，青锋出鞘，斩尽天下不臣贼！<br>当年明月凝霜刃，此日送尔渡黄泉！<br>已识万里乾坤大，何虑千山草木青！"
            },
            die:{
                content:"大厦将倾，空余泪两行。",
            }
        },
    },
    //姜维
    fire_jiangwei1: {
        level: '限定',
        translation: '星河麒麟',
        info: '<small>画师：匠人绘</small>',
        order: 1, // 显示顺序
        skill: {
            firelinyan:{
                order: 1,
                content: "三尺台上释千古，一曲谱半生，影随光而行。<br>影绎当年蹉跎，戏如人生，几声锣鼓惊春风。<br>炎阳在悬，岂因乌云障日，而弃金光于野？<br>怀麒麟之志，负柱国之托，奔天涯海角！<br>天道昭昭，士如夸父，所逐者忠贞之志尔！<br>炎阳在悬，紫薇居北，士不可以不弘毅！",
            },
            firebazhen:{
                order: 2,
                content: "无",
            },
            fireranji:{
                order: 3,
                content: "秉笔客书江湖事，执灯叟照当年人。<br>皮影话峥嵘，千古兴亡事，一杯浊酒中。<br>孤鸿鸣于野，其以身为凤，引春风入汉关。<br>古来圣贤卫道而死，道之存焉何惜深入九渊？<br>舍身入鼎，薪火独耀，此躯可照曰月山河否？<br>天下齐喑，我辈秉身为烛，当照四海九州！",
            },
            fireyujun:{
                order: 4,
                content: "浮生路长，若得遇知己，何其幸哉。<br>你我虽各为其主，然不乏相惜之谊。<br>九州齐喑，我辈燃己长明，君欲同否？<br>英才救世，从者皆众，请君拨乱反正。<br>君才胜司马氏十倍，何故居于人下？<br>国破家亡，君乃最后一线之生机。",
            },
            die:{
                content:"今日同死，亦无所憾！",
            }
        },
    },
    fire_jiangwei2: {
        level: '限定',
        translation: '炎志灼心',
        info: '<small>画师：西国红云</small>',
        order: 2, // 显示顺序
        skill: {
            firelinyan:{
                order: 1,
                content: "三尺台上释千古，一曲谱半生，影随光而行。<br>影绎当年蹉跎，戏如人生，几声锣鼓惊春风。<br>炎阳在悬，岂因乌云障日，而弃金光于野？<br>怀麒麟之志，负柱国之托，奔天涯海角！<br>天道昭昭，士如夸父，所逐者忠贞之志尔！<br>炎阳在悬，紫薇居北，士不可以不弘毅！",
            },
            firebazhen:{
                order: 2,
                content: "无",
            },
            fireranji:{
                order: 3,
                content: "秉笔客书江湖事，执灯叟照当年人。<br>皮影话峥嵘，千古兴亡事，一杯浊酒中。<br>孤鸿鸣于野，其以身为凤，引春风入汉关。<br>古来圣贤卫道而死，道之存焉何惜深入九渊？<br>舍身入鼎，薪火独耀，此躯可照曰月山河否？<br>天下齐喑，我辈秉身为烛，当照四海九州！",
            },
            fireyujun:{
                order: 4,
                content: "浮生路长，若得遇知己，何其幸哉。<br>你我虽各为其主，然不乏相惜之谊。<br>九州齐喑，我辈燃己长明，君欲同否？<br>英才救世，从者皆众，请君拨乱反正。<br>君才胜司马氏十倍，何故居于人下？<br>国破家亡，君乃最后一线之生机。",
            },
            die:{
                content:"今日同死，亦无所憾！",
            }
        },
    },
    fire_jiangwei3: {
        level: '传说',
        translation: '金兰共战',
        info: '<small>画师：错落宇宙</small>',
        order: 3, // 显示顺序
        skill: {
            firelinyan:{
                order: 1,
                content: "三尺台上释千古，一曲谱半生，影随光而行。<br>影绎当年蹉跎，戏如人生，几声锣鼓惊春风。<br>炎阳在悬，岂因乌云障日，而弃金光于野？<br>怀麒麟之志，负柱国之托，奔天涯海角！<br>天道昭昭，士如夸父，所逐者忠贞之志尔！<br>炎阳在悬，紫薇居北，士不可以不弘毅！",
            },
            firebazhen:{
                order: 2,
                content: "无",
            },
            fireranji:{
                order: 3,
                content: "秉笔客书江湖事，执灯叟照当年人。<br>皮影话峥嵘，千古兴亡事，一杯浊酒中。<br>孤鸿鸣于野，其以身为凤，引春风入汉关。<br>古来圣贤卫道而死，道之存焉何惜深入九渊？<br>舍身入鼎，薪火独耀，此躯可照曰月山河否？<br>天下齐喑，我辈秉身为烛，当照四海九州！",
            },
            fireyujun:{
                order: 4,
                content: "浮生路长，若得遇知己，何其幸哉。<br>你我虽各为其主，然不乏相惜之谊。<br>九州齐喑，我辈燃己长明，君欲同否？<br>英才救世，从者皆众，请君拨乱反正。<br>君才胜司马氏十倍，何故居于人下？<br>国破家亡，君乃最后一线之生机。",
            },
            die:{
                content:"今日同死，亦无所憾！",
            }
        },
    },
    /****************************************************************** */
    //陆抗
    //陆逊
    /*
    water_luxun1: {
        level: '史诗',
        translation: '夷陵破蜀',
        info: '画师：枭瞳',
        order: 1, // 显示顺序
        skill: {
            waterjunlve:{
                order: 1,
                content: "军略绵腹，制敌千里。<br>文韬武略兼备，方可破敌如破竹。",
            },
            watercuike:{
                order: 2,
                content: "克险摧难，军略当先。<br>摧敌心神，克敌计谋。",
            },
            waterzhanhuo:{
                order: 3,
                content: "业火映东水，吴志绽敌营！<br>绽东吴业火，烧敌军数千！",
            },
            die:{
                content:"东吴业火，终究熄灭……",
            }
        },
    },
    */
    //孙策
    //孙尚香
    //孙寒华
    water_sunhanhua1: {
        level: '限定',
        translation: '月满玉京',
        info: '<small>画师：鬼画府</small>',
        order: 1, // 显示顺序
        skill: {
            waterhuiling:{
                order: 1,
                content: "静则潜修至道，动则行善累功。<br>阳炁冲三关，斩尸除阴魔。<br>慧剑断情除旧妄，一心向道为苍生。<br>蒲团清静坐，神归了道真。",
            },
            watertaji:{
                order: 2,
                content: "谨以三尺神锋，代天行化，布令宣威。<br>步天罡，踏北斗，有秽皆除，无妖不斩。<br>剑斩魔头，观万灵慑服，群妖束手！<br>一人一剑，往荡平魔窟，再塑人间！",
            },
            waterqinghuang:{
                order: 3,
                content: "执护道之宝器，御万邪之侵袭。<br>刀兵水火，速离身形。<br>定吾三魂七魄，保其不得丧清。<br>体有金光，覆映吾身。",
            },
            die:{
                content:"身腾紫云天门去，随生复感又照明!",
            }
        },
    },
    water_sunhanhua2: {
        level: '传说',
        translation: '瑶池沐乐',
        info: '<small>画师：DY</small>',
        order: 2, // 显示顺序
        skill: {
            waterhuiling:{
                order: 1,
                content: "静则潜修至道，动则行善累功。<br>阳炁冲三关，斩尸除阴魔。<br>慧剑断情除旧妄，一心向道为苍生。<br>蒲团清静坐，神归了道真。",
            },
            watertaji:{
                order: 2,
                content: "谨以三尺神锋，代天行化，布令宣威。<br>步天罡，踏北斗，有秽皆除，无妖不斩。<br>剑斩魔头，观万灵慑服，群妖束手！<br>一人一剑，往荡平魔窟，再塑人间！",
            },
            waterqinghuang:{
                order: 3,
                content: "执护道之宝器，御万邪之侵袭。<br>刀兵水火，速离身形。<br>定吾三魂七魄，保其不得丧清。<br>体有金光，覆映吾身。",
            },
            die:{
                content:"身腾紫云天门去，随生复感又照明!",
            }
        },
    },
    water_sunhanhua3: {
        level: '传说',
        translation: '莲华熠熠',
        info: '<small>画师：随随</small>',
        order: 3, // 显示顺序
        skill: {
            waterhuiling:{
                order: 1,
                content: "静则潜修至道，动则行善累功。<br>阳炁冲三关，斩尸除阴魔。<br>慧剑断情除旧妄，一心向道为苍生。<br>蒲团清静坐，神归了道真。",
            },
            watertaji:{
                order: 2,
                content: "谨以三尺神锋，代天行化，布令宣威。<br>步天罡，踏北斗，有秽皆除，无妖不斩。<br>剑斩魔头，观万灵慑服，群妖束手！<br>一人一剑，往荡平魔窟，再塑人间！",
            },
            waterqinghuang:{
                order: 3,
                content: "执护道之宝器，御万邪之侵袭。<br>刀兵水火，速离身形。<br>定吾三魂七魄，保其不得丧清。<br>体有金光，覆映吾身。",
            },
            die:{
                content:"身腾紫云天门去，随生复感又照明!",
            }
        },
        water_sunhanhua4: {
            level: '传说',
            translation: '威灵尽显',
            info: '<small>画师：圆子</small>',
            order: 4, // 显示顺序
            skill: {
                waterhuiling:{
                    order: 1,
                    content: "静则潜修至道，动则行善累功。<br>阳炁冲三关，斩尸除阴魔。<br>慧剑断情除旧妄，一心向道为苍生。<br>蒲团清静坐，神归了道真。",
                },
                watertaji:{
                    order: 2,
                    content: "谨以三尺神锋，代天行化，布令宣威。<br>步天罡，踏北斗，有秽皆除，无妖不斩。<br>剑斩魔头，观万灵慑服，群妖束手！<br>一人一剑，往荡平魔窟，再塑人间！",
                },
                waterqinghuang:{
                    order: 3,
                    content: "执护道之宝器，御万邪之侵袭。<br>刀兵水火，速离身形。<br>定吾三魂七魄，保其不得丧清。<br>体有金光，覆映吾身。",
                },
                die:{
                    content:"身腾紫云天门去，随生复感又照明!",
                }
            },
        },
    },
    water_sunhanhua4: {
        level: '传说',
        translation: '威灵尽显',
        info: '<small>画师：圆子</small>',
        order: 4, // 显示顺序
        skill: {
            waterhuiling:{
                order: 1,
                content: "静则潜修至道，动则行善累功。<br>阳炁冲三关，斩尸除阴魔。<br>慧剑断情除旧妄，一心向道为苍生。<br>蒲团清静坐，神归了道真。",
            },
            watertaji:{
                order: 2,
                content: "谨以三尺神锋，代天行化，布令宣威。<br>步天罡，踏北斗，有秽皆除，无妖不斩。<br>剑斩魔头，观万灵慑服，群妖束手！<br>一人一剑，往荡平魔窟，再塑人间！",
            },
            waterqinghuang:{
                order: 3,
                content: "执护道之宝器，御万邪之侵袭。<br>刀兵水火，速离身形。<br>定吾三魂七魄，保其不得丧清。<br>体有金光，覆映吾身。",
            },
            die:{
                content:"身腾紫云天门去，随生复感又照明!",
            }
        },
    },
    /****************************************************************** */
    //貂蝉
    ice_diaochan1: {
        level: '限定',
        translation: '鲛人遗珠',
        info: '画师：西嘛哒',
        order: 1, // 显示顺序
        skill: {
            icelijian:{
                order: 1,
                content: "檀音袅袅，如同山间清泉。<br>玉指拔檀板，曲调可绕梁。",
            },
            icebiyue:{
                order: 2,
                content: "凤飞翱翔兮，四海求凰。<br>无奈佳人兮，不在东墙。",
            },
            die:{
                content:"舞尽繁华梦，命殒乱世中。",
            }
        },
    },
    //吕玲绮
    ice_lvlingqi1: {
        level: '限定',
        translation: '繁华彩鸢',
        info: '画师：匠人绘',
        order: 1, // 显示顺序
        skill: {
            icewushuang:{
                order: 1,
                content: "巾帼破重围，虓怒震天威。<br>杀气寒戈戟，斩敌壮武貔。",
            },
            iceshenwu:{
                order: 2,
                content: "奔驰良骥载千金之躯，百战铁盔遮闭月之貌。<br>鱼鳞玄甲覆七尺之躯，方天霜刃映方寸红妆。",
            },
            iceshenwei:{
                order: 3,
                content: "虓女暴怒发冲冠，画戟刃过惊雷断！<br>纵马执戟冲敌阵，天下谁人敢当锋?",
            },
            die:{
                content: "戟断马亡，此地竟是我的葬身之处吗?",
            }
        },
    },
    /****************************************************************** */
    //ol南华老仙
    ice_nanhualaoxian1: {
        level: '限定',
        translation: '着墨山河',
        info: '画师：未知',
        order: 1, // 显示顺序
        skill: {
            iceqingshu:{
                order: 1,
                content: "天地为卷，众生为墨，此书载风雨雷霆。<br>道法自然，墨绘乾坤，天书成而万物生。<br>道生一，一生二，二生三，三生万物。",
            },
            iceshoushu:{
                order: 2,
                content: "世人皆慕长生，却不见多少仙人，枯老在这白玉京！<br>今授汝天书三卷，望汝救万民于水火。<br>吾观世间，苦海无边，今以天书为舟，渡尔至彼岸。",
            },
            icehedao:{
                order: 3,
                content: "凡蜕将终，始窥大道之门，才知生死不过泡影。<br>大道无形，生天地，行日月，同生老病死。<br>生死一线，道心通明，大道至简，如万物归一。",
            },
            die:{
                content: "本欲解万苦，奈何零落万骨。",
            }
        },
    },
};
function setSKcolors(obj, color = '#FF2400') {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const originalInfo = obj[key].info;
            obj[key].info = `<small><font color="${color}">${originalInfo}</font></small>`;
        }
    }
}
setSKcolors(originskininfo);
/**
 * 皮肤信息，及皮肤台词
 */
export const skininfo = originskininfo;