import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   《股票作手回忆录》互动导读
   Reminiscences of a Stock Operator — Jesse Livermore
   (彼得·林奇点评版 · 中国青年出版社 2012)
   ============================================================ */

const ACTS = [
  { n: 1, key: "I",   title: "启蒙 · 行情会说话",       sub: "从报价板小子，到北太平洋的一记重击", color: "var(--gold)" },
  { n: 2, key: "II",  title: "立法 · 大势、时机与坐功",   sub: "老火鸡的智慧，与「最小阻力」的诞生",   color: "var(--bull)" },
  { n: 3, key: "III", title: "巅峰与崩塌",               sub: "当一天的国王，又被棉花打回原形",       color: "var(--bear)" },
  { n: 4, key: "IV",  title: "破产、重生与人性",         sub: "解放心智，王者归来，看清人情的价码", color: "var(--brass)" },
  { n: 5, key: "V",   title: "棋局与真相",               sub: "揭开炒作的机关，与内线的心理博弈",     color: "var(--ink)" },
];

const TICKER = [
  "华尔街没有新鲜事", "你知道的，现在可是牛市啊", "赚大钱靠坐功，不靠聪明",
  "顺着最小阻力的方向走", "股价永远不会高到不能买进", "犯错的是人，不是市场",
  "截断亏损，让利润奔跑", "知道什么不该做，同样重要", "最大的敌人是你自己",
  "走过去，别冲过去", "牛市做多，熊市做空，但不效忠任何一方", "先做对，钱只是结果",
];

const CHAPTERS = [
  {
    id: "序", act: 1,
    title: "如何学习在股市里赚钱的方法",
    one: "全书的钥匙——赚大钱靠的不是聪明，而是「坐得住」。",
    scene: [
      "点评者讲了两个学生的故事：「花」长期持有，账户从十几万一路滚到近亿、买下二十多套房；「神」迷恋短线、一度暴赚两百万，最终又折腾回起点。",
      "两人天赋相当，结局却天壤之别——差别只在一件事：能不能拿得住。",
    ],
    reading: [
      "这篇序把全书最核心、也最难学的道理摆在最前面：能看对方向的人很多，能看对方向又「坚持不动」的人才真正赚到钱。大牛市天天「超买」却照涨，大熊市天天「超卖」却照跌；真正的功夫，是在牛市拿住好股、在熊市拿住现金，不被短期波动晃下车。",
      "它也点出了利弗莫尔反复强调的那句话——华尔街没有新鲜事，因为投机像群山一样古老。今天发生的事，过去发生过，将来还会再发生。这正是为什么读这本一百年前的回忆录，仍然像在读今天。",
    ],
    takeaways: [
      "看对方向只是入场券，「拿得住」才是赚大钱的真功夫",
      "财不入急门：想自创「赚快钱」的捷径，往往是亏钱的开始",
      "前人用真金白银换来的教训，是最便宜的学费",
    ],
    echo: "这恰是巴菲特与林奇的共同信条：用便宜的时间换昂贵的复利，而不是用昂贵的频繁交易换一时的刺激。",
  },
  {
    id: "1", act: 1,
    title: "不要问为什么，原因总比机会晚来很久",
    one: "行情会说话——先对「变化」本身着迷，别急着追问原因。",
    scene: [
      "十四岁的他在交易所做报价员，对数字过目不忘。他买了个小本子，专门记录股价上涨或下跌前的「习惯」，再用第二天的行情验证自己的预测，胜率约七成。",
      "平生第一笔交易是替同事跟买伯灵顿，两天赚了 3.12 美元。很快，他成了空壳证券公司人见人怕的「抢钱小子」，被一家家赶出门、被迫用假名交易。",
    ],
    reading: [
      "这一章奠定了利弗莫尔方法论的起点——「读盘」(tape reading)。他不关心新闻、不关心「为什么涨」，只关心价格在重复什么模式。因为原因往往姗姗来迟：你先看到某只股票莫名其妙地比别人多跌三个点（结果），一周后才在报上读到它停止分红（原因）。",
      "所以他的结论是：你需要现在就行动，而不是等明天弄清原因。原因可以以后再找，机会却稍纵即逝。",
    ],
    takeaways: [
      "价格的「变化」本身就是信息，原因常常迟到",
      "相同的形态会一再重复，这给了预测的依据",
      "当下行动，而不是等真相大白——否则只剩追悔",
    ],
    echo: "林奇说，做成功的投资者不需要数学天才，会小学五年级的算术就够了——利弗莫尔靠的也正是观察与心算，而非高深公式。",
  },
  {
    id: "2", act: 1,
    title: "犯错的是人不是市场，不要抱怨市场",
    one: "市场永远是对的；该检讨的永远是自己。",
    scene: [
      "空壳证券公司里，保证金一旦耗尽就自动平仓——这反而成了一种「强制止损」的好处。",
      "但 1900 年大选前夜，胜负已成定局、稳赚不赔，全国的空壳公司却集体歇业拒绝接单：庄家从不让客户占便宜。",
    ],
    reading: [
      "利弗莫尔逐渐意识到，空壳公司那套「盯几个点波动」的玩法，和真正的股票投机是两回事。但更重要的心法在这里成形：行情不会犯错，犯错的是解读行情的人。",
      "对市场发火，就像得了肺炎却怪自己的肺一样可笑。把亏损归咎于「市场不讲理」，等于关上了进步的门。",
    ],
    takeaways: [
      "市场不会错，错的永远是人的判断与情绪",
      "自动平仓的「强制止损」，恰恰是纪律的雏形",
      "抱怨市场，等于放弃从错误中学习",
    ],
    echo: "林奇的态度如出一辙：出错时必须认错、然后卖掉；妄图百分之百正确，注定亏损。",
  },
  {
    id: "3", act: 1,
    title: "股市上只有赢家和输家，除此之外再无其他",
    one: "没有牛方熊方，只有「对的一方」；空壳公司的成功差点害死他。",
    scene: [
      "初到纽约，他在哈丁兄弟把空壳公司那套「抢帽子」照搬过来，第一天就净亏 1100 美元。",
      "1901 年北太平洋逼空大战，他看对了方向、账面一度大赚，却因行情收录器严重滞后——报价显示一百多点时，实际成交已跌破八十——一日之间，五万美元化为乌有。",
    ],
    reading: [
      "这一章的痛苦教训是：在空壳公司「赢」得太容易，反而让他养成了致命的坏习惯。真实市场里，委托执行、流动性、滞后都会要命，「看对」和「用对方法赚到钱」完全是两件事。",
      "他还领悟到：股市不分牛熊两面，只分「正确的一面」。证明自己唯一的方式，是用真金白银——就像那个决斗的比喻：你能在二十步外射中酒杯的细颈，可当酒杯端着上膛的手枪瞄准你心脏时，你还打得中吗？",
    ],
    takeaways: [
      "只有「正确的一面」，不必效忠多头或空头",
      "在容易的游戏里赢，会喂养出在真实市场里致命的坏习惯",
      "看对方向 ≠ 赚到钱；执行、滞后、流动性都能让你功亏一篑",
    ],
    echo: "索罗斯一针见血：对错本身不重要，重要的是对的时候赚多少、错的时候亏多少。",
  },
  {
    id: "4", act: 2,
    title: "知道什么不该做，和知道什么该做同样重要",
    one: "在「半空壳」公司里翻本，他学会了交易的另一半——禁忌清单。",
    scene: [
      "回到家乡筹本金，他在几家「变相空壳公司」间游走，甚至设计了一套精巧的连环单：在五家公司同时挂买单，再让一家正规公司在交易所抛出、买回少量同一只冷门股，制造行情收录器上的价差，稳稳套利六百到八百美元。",
    ],
    reading: [
      "这些「歪招」本身不重要，重要的是它们逼他把交易拆解成「该做」与「不该做」两张清单。一个成熟交易者的功力，一半在于知道何时出手，另一半在于知道何时绝不能出手。",
      "利弗莫尔一生反复回到这个主题：避免错误的操作，比抓住每一次机会更能决定长期成败。",
    ],
    takeaways: [
      "交易能力的一半，是「知道什么不该做」",
      "少犯错，胜过多抓机会",
      "规则是用一次次亏损换来的，要珍惜这份「禁忌清单」",
    ],
    echo: "这与巴菲特的「两条规则——不要亏钱；记住第一条」内核一致：先求不败，再求胜。",
  },
  {
    id: "5", act: 2,
    title: "赌博和投机的根本区别：赌涨跌与预测涨跌",
    one: "全书的灵魂——老火鸡那句「你知道的，现在可是牛市啊」。",
    scene: [
      "富乐顿公司里有位人称「老火鸡」的帕特里奇先生。无论别人拿什么内幕来问他该不该卖，他总是偏着头、慈祥地回一句：「你知道的，现在可是牛市啊。」",
      "有人劝他高抛低吸，他痛苦地摇头：「我不能卖，卖了就会失去我的仓位——失去仓位，是谁都承受不起的。」",
    ],
    reading: [
      "年轻的利弗莫尔起初不以为意，直到他想明白「为什么自己总能看对大势、却赚不到该赚的钱」，才读懂老火鸡的智慧：赚大钱靠的不是个股的短期起伏，而是抓住并坐稳整个大波动。",
      "这就是投机与赌博的分野：赌博是押注下一个涨跌，投机是预测并跟随大趋势。很多绝顶聪明的人在华尔街赔钱，败的不是市场，而是自己——他们聪明，却不够淡定。",
    ],
    takeaways: [
      "赚大钱靠「坐功」——抓住大波动并坚持不动",
      "失去好仓位的代价，往往比一时的回调更昂贵",
      "投机=预测趋势并跟随；赌博=押注下一次波动",
    ],
    echo: "这正是巴菲特「我们最喜欢的持有期是永远」的一百年前原型——耐心，是最被低估的能力。",
  },
  {
    id: "6", act: 2,
    title: "数字会说谎，大势是唯一可靠的盟友",
    one: "个股、内幕、零碎数字都会骗人；只有大势始终可靠。",
    scene: [
      "萨拉托加的一次经历让他醒悟：他本凭读盘判断联合太平洋会突破新高、应当做多，却听了证券商「内线在抛」的话而动摇。事后股息提高、股价暴涨三十点——大势早已写明，他却差点被一句小道消息带偏。",
    ],
    reading: [
      "利弗莫尔由此把目光从「个股每天的涨跌」抬高到「整个市场的方向」。零碎的数字、董事会怎么想、谁在买谁在卖，这些他无从知晓也不必知晓；真正可靠的盟友，是顺应经济与大盘的大趋势。",
      "一旦研究大盘，他的交易就不再被一两只股票绑住，可以通盘进退，格局豁然开朗。",
    ],
    takeaways: [
      "抬高视角：从「个股波动」到「大盘方向」",
      "大势是最可靠的盟友，零碎数字与内幕常常骗人",
      "看懂大势，才能通盘进退，不被单一个股绑架",
    ],
    echo: "索罗斯说得透彻：控制市场的不是数学，而是心理——尤其是群众的本能。",
  },
  {
    id: "7", act: 2,
    title: "试水：股价永远不会高到不能买进",
    one: "用「试探」代替豪赌，用「加码」代替梭哈。",
    scene: [
      "老作手迪肯·怀特收到「哈弗梅耶在买美国制糖」的密报。他没有照单全收，而是先卖一万股试盘：第一笔轻松脱手不足为凭，第二笔成交后股价仍在涨——说明确有大资金吃货，他这才反手做多。用市场本身来验证传闻。",
    ],
    reading: [
      "这一章给出利弗莫尔最实用的两条操作纪律：一是「股价永远不会高到不能买进，也永远不会低到不能抛出」——别因为创新高就不敢买；二是先用小仓位「试水」，错了立刻收手，对了再金字塔式加码。",
      "他说：假如你能买五百股，就别一次买进；先买一百股试探，亏了说明（至少暂时）错了，根本不必再加。而那些只想「赌一把」的人，永远别赌。",
    ],
    takeaways: [
      "股价永远不会高到不能买、低到不能卖",
      "先试探：用小仓位让市场替你验证判断",
      "只在盈利时加码，亏损立即停手——别一次梭哈",
    ],
    echo: "巴菲特说：就算格林斯潘私下告诉我未来两年的货币政策，我也不会改变任何一个动作——真正的依据是事实与价值，不是消息。",
  },
  {
    id: "8", act: 2,
    title: "舍弃先入为主，把偏见留在场外",
    one: "看对大势还不够——他两次「太早做空」而破产，痛悟「时机」二字。",
    scene: [
      "1906–1907，他预见资金枯竭、大祸将至，于是猛力做空——却一次次被反弹打爆，连续破产。",
      "他形容自己像看见一大堆金币、车身印着自己名字的卡车就停在旁边，于是不顾一切冲过去，结果逆风把他掀翻在地，铲子丢了、卡车也没了。直到银行家集体登报发新股、分期认购的「自白书」出现，才是真正的入场暗号。",
    ],
    reading: [
      "这一章是「时机」的血泪课：他的立场（看空）完全正确，操作（太早）却大错。看对方向只是必要条件，在正确的时间动手才是充分条件。",
      "他还学会把偏见留在场外——不让「我觉得该跌」凌驾于行情之上。门上不止一把锁，他握着「知识」这把钥匙，却忘了还有「时机」那把锁。应该走过去，而不是冲过去。",
    ],
    takeaways: [
      "看对方向 + 看准时机，缺一不可",
      "太早，本质上也是一种错——并且代价高昂",
      "把成见留在门外：别让「应该」压过「正在发生」",
    ],
    echo: "林奇提醒：别以为股票只会上涨，不要等狠跌把你摇醒——方向与时机，市场都会无情地检验。",
  },
  {
    id: "9", act: 3,
    title: "先学会做对的事情，赚钱只是结果",
    one: "1907 年 10 月 24 日，他在恐慌中一日入账百万，「当了一天的国王」。",
    scene: [
      "安纳康达突破 300 点，他依「整数关口」理论试单做多八千股，发现走势变假立刻清仓反手做空。资金池里利率飙到一百多，证券商像玻璃罩里缺氧的老鼠。最危急时，是 J.P. 摩根一句「钱在银行里——用储备金！」力挽狂澜。",
      "一位银行家托人请他「看在爱国的份上」今天别再做空了。他本已转为买进——既怕利润无法兑现，也不愿亲手把恐慌推向深渊，于是答应了。",
    ],
    reading: [
      "这一天，他第一次精心计划的战役大获全胜；多年的疑问——「为什么十五岁能在空壳公司赢、如今在纽交所却不行」——终于有了答案：他不仅有「做对」的意愿，更有了确保做对的知识，而知识就是力量。",
      "章名点题：先学会做对的事，钱只是随之而来的结果。把注意力放在「正确」上，而非「赚钱」上，钱反而来了。",
    ],
    takeaways: [
      "先求「做对」，盈利是水到渠成的结果",
      "知识带来力量，力量带来从容",
      "危机是最好的提款机——但前提是你早有准备、看对了大势",
    ],
    echo: "巴菲特名言的影子在此浮现：别人贪婪时恐惧，别人恐惧时贪婪——1907 年的利弗莫尔正是如此。",
  },
  {
    id: "10", act: 3,
    title: "最大的敌人是你自己，致命的希望与恐惧",
    one: "棉花惨案登场——他开始被「聪明的朋友」一步步带离自我。",
    scene: [
      "他遇见了魅力非凡、能言善辩的「棉花大王」珀西·托马斯。两人本在棉花上看法相反，托马斯却用海量「事实与数据」反复灌输，直到利弗莫尔对自己从行情中得来的判断不再笃定——他失去了独立思考的能力，变成了「一个托马斯化了的人」。",
    ],
    reading: [
      "这一章把投机者最深的敌人剖开给你看：不是市场，而是自己心里的希望与恐惧。希望让你死扛亏损，恐惧让你过早离场——方向恰恰反了。",
      "更危险的是，这种自乱往往由「外力」触发：一个比你更自信、更会说话的人，能让你怀疑自己亲眼看到的东西。从笃定到犹豫，正是灾难的开端。",
    ],
    takeaways: [
      "最大的敌人是你自己——尤其是希望与恐惧",
      "希望让你死扛亏损，恐惧让你过早止盈，方向全反",
      "一旦你开始怀疑亲眼所见，灾难就已经上路",
    ],
    echo: "巴菲特说：从别人的预言里，你了解的是预言者本人，而非未来——托马斯的滔滔雄辩，正是这样一面镜子。",
  },
  {
    id: "11", act: 3,
    title: "态度不同是专业和业余之间唯一的区别",
    one: "专业与业余之差，不在聪明，而在面对波动与亏损的态度。",
    scene: [
      "被托马斯说服后，利弗莫尔做出了一生最蠢的操作：在毫无看涨理由时买进棉花，又不按经验逐步试探，而是一把买到平常的仓位。市场不如所愿，他不但不止损，反而拼命补仓「护盘」——彻底背离了自己的天性与原则。",
    ],
    reading: [
      "同样一套行情摆在面前，专业者与业余者的差别只在态度：专业者承认错误、果断离场、绝不和亏损较劲；业余者抱着希望补仓，把小错拖成大祸。",
      "利弗莫尔痛陈：投机里很少有比「不断补仓摊平亏损」更致命的错误。卖出亏损、保留盈利，本是常识，他却偏偏反着来——因为他已经不是在用自己的头脑交易。",
    ],
    takeaways: [
      "专业与业余的唯一分野，是面对亏损的态度",
      "不断补仓摊平亏损，是投机中最致命的错误之一",
      "当你违背自己的原则时，往往是别人在替你做交易",
    ],
    echo: "林奇的比喻最传神：卖掉盈利股、死守亏损股，就像拔掉花园里的鲜花，去浇灌野草。",
  },
  {
    id: "12", act: 3,
    title: "人是容易被左右的动物，坚持独立思考",
    one: "一年百万富翁，九成身家付诸东流——独立思考的代价有多贵。",
    scene: [
      "他做多棉花，又抛掉了正在盈利的小麦（小麦随后大涨，本可再赚八百万），还一路向下补仓，最后竟持有四十四万包棉花。等他幡然醒悟、全部清仓时，几百万资产只剩几十万。",
      "他还讲了「皮大衣」的故事：公司里一个个想让股市替自己赚件皮大衣，结果没人穿得上——市场从不替任何人付账。",
    ],
    reading: [
      "这一章的教训用钱堆出来：一个人犯错不需要理由；而交易者最危险的敌人，是「聪明朋友」那份热切的规劝与人格魅力。",
      "还有一条铁律：不要指望股市替你支付任何心血来潮的开销。一旦你抱着「赚一笔买某样东西」的心态，你就是在赌，而赌徒注定要付账。",
    ],
    takeaways: [
      "人极易被左右——再聪明，也要守住独立判断",
      "别让股市替你的欲望买单，那只会让你变成赌徒",
      "卖出盈利、死扛亏损，是与一切原则背道而驰的自毁",
    ],
    echo: "索罗斯说：操作过量时人会「输不起」——一旦输不起，再正确的判断也会被情绪击垮。",
  },
  {
    id: "13", act: 4,
    title: "最致命的是自乱阵脚，最费钱的是人情羁绊",
    one: "救命的两万五，竟成了套住他多年的「金手铐」。",
    scene: [
      "再次破产、负债累累、连小单都不敢做。神秘电报把他召回纽约：威廉森拿出支票簿，当场开了一张两万五的支票给他，唯一条件是在他公司交易——原来是想借他「大空头」的名声，掩护小舅子的巨额操作。",
      "三周内，他用这两万五赚了十一万二。可当他要还钱时，威廉森却笑着推辞。",
    ],
    reading: [
      "利弗莫尔说，这是他交易生涯中最后悔的一个大错：他没坚持把钱还掉。欠下的人情，不像欠钱可以用钱还清——它会让你在关键时刻不好意思套现、不好意思违逆，悄悄锁住你的手脚。",
      "最致命的是自乱阵脚（情绪失控），最费钱的是人情羁绊（独立性被收买）。后来威廉森果然「替他」平掉了一笔本该大赚的空头，亲手掐断了他的反弹。",
    ],
    takeaways: [
      "天上掉下的「好处」，往往标着看不见的价码",
      "人情债比金钱债更贵，因为它会绑住你的判断",
      "保住独立性，比一次性的资金援助重要得多",
    ],
    echo: "与巴菲特「远离让你无法独立思考的关系」暗合：能用钱解决的，就别用人情去欠。",
  },
  {
    id: "14", act: 4,
    title: "涨势总有尽头，就像跌势不可能永远持续下去",
    one: "主动宣告破产以解放心智，再用一只伯利恒钢铁王者归来。",
    scene: [
      "四年熊市颗粒无收，负债逾百万，被一个只欠八百块的债主死死纠缠。他做了最痛苦也最理性的决定——宣告破产，让心智重获自由。大债主们慷慨签字免债。",
      "随后他蛰伏六周，只有五百股的额度，死死盯着伯利恒钢铁：依「突破 100 点必续涨」的经验，在 98 点出手，次日冲到 145 点——本钱回来了。1915–16 战时大牛市，他赚回约三百万，一次性还清所有债务，还为妻儿各划出一笔动不了的年金。",
    ],
    reading: [
      "这一章是「重生」：解开债务的心结，判断力立刻回来了；没有了骚扰与资金焦虑，他重新变得「轻松自在、正确无误」。",
      "他也悟到一条市场规律——涨势终有尽头，跌势也不会永远；与其在最高点逃顶，不如在回档的第一时间离场。更重要的是给自己留后路：把一部分钱放进谁也动不了的地方。",
    ],
    takeaways: [
      "先解放心智，判断力才能回归——焦虑会废掉好手",
      "走对第一步至关重要：宁可多等，也要让首战必胜",
      "给自己留一笔「谁也动不了」的钱，永不裸奔",
    ],
    echo: "索罗斯的风控箴言在此回响：操作过量者输不起；先确保活下来，才有翻盘的机会。",
  },
  {
    id: "15", act: 4,
    title: "商战不是人与人的争斗，而是眼光与眼光的较量",
    one: "离开威廉森后他才看清：市场较量的是眼光，而非交情。",
    scene: [
      "回望那段「金手铐」岁月，他终于明白：自己当年没赚到大钱，不是因为得罪了谁或亏欠了谁，而是被人情与限制束缚了眼光。在四十二街以北被赞许的「厚道」，在华尔街却变成荒唐而昂贵的代价。",
    ],
    reading: [
      "这一章把投机还原成它的本质：它不是和某个人的恩怨斗争，而是你的判断与市场之间、你的眼光与无数对手眼光之间的较量。",
      "谁对你好、谁让你为难，都不该进入交易决策。能左右盈亏的，只有谁看得更远、更准。把「人情」从交易里剔除出去，眼光才能锋利。",
    ],
    takeaways: [
      "市场比拼的是眼光与判断，不是交情与恩怨",
      "把「人情」踢出交易决策，判断才能保持锋利",
      "别人对你好坏，与这笔交易该不该做无关",
    ],
    echo: "与林奇「自己做足功课，没人能替你完成」一致——最终为你负责的，只有你自己的眼光。",
  },
  {
    id: "16", act: 4,
    title: "如果有唯一的内幕，那也只能是老板的行事风格",
    one: "一位老投资家凭「总裁怎么用信纸」，就决定了买卖。",
    scene: [
      "那位德裔宾州投资家去见艾奇逊铁路总裁，对方用昂贵的浮雕亚麻信纸写下几个数字，随手揉成一团扔进废纸篓——他当即回纽约清空了全部艾奇逊持股。",
      "几天后他在拉克万纳铁路看到总裁把空信封拆开、用背面当便签，于是尽全力买进。多年后，前者破产清算，后者让他的股本翻了又翻。",
    ],
    reading: [
      "这一章给「内幕消息」下了最聪明的注脚：唯一值得相信的「内幕」，是管理层的品行与习惯。一个连信纸都铺张浪费的总裁，公司里不会有节俭的部门；一个亲手拆信封省纸的总裁，整家公司都会精打细算。",
      "与其听各路真假难辨的消息，不如去观察「开这家公司的是什么样的人」。",
    ],
    takeaways: [
      "唯一可信的「内幕」，是管理层的品行与作风",
      "细节见人品，人品定公司——省纸的总裁背后是节俭的公司",
      "与其追逐消息，不如研究「是什么人在经营这家公司」",
    ],
    echo: "这与格雷厄姆、林奇「每只股票背后都是一家公司，先搞清企业本身」完全同频。",
  },
  {
    id: "17", act: 4,
    title: "理由不一定说得出，说不出的理由总是最充分的理由",
    one: "沉淀在潜意识里的经验，有时比任何「理由」都准。",
    scene: [
      "在温泉城，他因看错棉花已亏掉一百万、果断平仓。第二天午餐还没上菜，他却突然从桌边跳起冲向证券公司——他「感觉」到做空棉花的时机到了，连抛两个一万包。事后这笔交易不仅补回亏损，还大赚一笔。",
    ],
    reading: [
      "这一章谈的是「老手的直觉」：它不是玄学，而是无数次实战沉淀下来、说不清道不明的经验。当最小阻力的方向悄悄从上转下，老手会先「感觉」到，再慢慢说出理由。",
      "它也提醒：当你确信某事却讲不出完整理由时，未必是冲动，可能正是你最宝贵的经验在发声——前提是，这份直觉建立在长年累月的真实交易之上。",
    ],
    takeaways: [
      "老手的直觉 = 沉淀在潜意识里的实战经验，并非玄学",
      "当最小阻力方向转向，往往先「感觉」到、后说得清",
      "说不出口的理由，有时恰恰最充分——但它必须由真实经验喂养",
    ],
    echo: "格雷厄姆说：对待价格波动的正确心态，是一切成功投资的试金石——直觉的底色，正是这份久经磨炼的心态。",
  },
  {
    id: "18", act: 5,
    title: "投机者的勇气，就是有信心按照自己的决定进行交易",
    one: "顶着内线轧空与满天利好谣言，他靠「知识」稳坐三万股空单。",
    scene: [
      "热带商业被内线集团一路拉抬，他认定逆大势硬撑必败，从 153 点一路做空到三万股。内线两度拉高轧空、散布「百年一遇大轧空」的传闻，他纹丝不动；并用抛售关联股「赤道商业」的办法，戳穿那些利好谎言。最终大势压垮内线，他几乎在最低点回补。",
    ],
    reading: [
      "这一章把「投机者的勇气」讲透了——引用狄克森·瓦茨的话：勇气，就是有信心按照自己的决定去交易。他不怕犯错，因为「除非赔钱，否则我从不认为自己错了」；决定他对错的，不是某一时刻的涨跌，而是涨势或跌势的特征。",
      "知识就是力量，力量不必害怕谎言——哪怕谎言印在行情收录器上，也终将被事实揭穿。但他也坦承一个教训：别去揣测内线「应该」怎么做，你的任务只是交易眼前的事实。",
    ],
    takeaways: [
      "勇气 = 有信心按自己的决定交易，并坐得住",
      "决定对错的是趋势的「特征」，而非一时涨跌",
      "别揣测对手「应该」怎么做——只交易眼前的事实",
    ],
    echo: "林奇说：股市要求坚定的信心，没有信心的人会毁了自己——但信心必须建立在知识之上，否则只是固执。",
  },
  {
    id: "19", act: 5,
    title: "人性不变，陷阱不变，现在犯的都是前人犯过的错误",
    one: "武器在变，战术不变；因为人性一百年都没变。",
    scene: [
      "他回顾老一代作手——德鲁、利特尔、古尔德、范德比尔特、基恩——的操纵往事：「对敲」「冲销」「锁住资金」等手法多已过时违法。但他发现，让六七十年代的高手们上当的原因，和今天一模一样：贪婪、轻信、虚荣。",
    ],
    reading: [
      "这一章是全书的「历史观」：交易规则、税收、手法都在变，唯独人性始终不变。所以伍德洛克那句话才是投机成功的根基——人类会在将来重复过去犯过的错误。",
      "正因如此，「研究人性」比研究任何过时的操纵术都更有价值：人为什么轻信自己愿意相信的东西？为什么放任贪婪与懒惰？看懂这些，你就握住了不变的东西。",
    ],
    takeaways: [
      "手法会过时，人性不会——这是投机不变的底层",
      "人类总会重复前人犯过的错误，这正是机会与陷阱的来源",
      "研究人性，比研究任何「操纵术」都更长久有效",
    ],
    echo: "索罗斯说得直白：数学控制不了金融市场，掌握群众的本能才能控制市场。",
  },
  {
    id: "20", act: 5,
    title: "让一只股票看起来活跃的最好方式，就是让它真的活跃",
    one: "揭开「炒作」的机关——派发，是在下跌途中完成的。",
    scene: [
      "史上最强作手詹姆斯·基恩，1901 年替摩根在公开市场抛出七十五万股美国钢铁，又替罗杰斯、洛克菲勒出清二十二万股联合铜矿，事后退回二十万美元支票，附言「我不是廉价操盘手」。",
      "他的手法：先把股票真正做活，让场内交易商和散户一路跟买，自己在涨势中积累「空头库存」，再随股价下跌大量派发。",
    ],
    reading: [
      "这一章是「庄家视角」的教科书：行情收录器就是最有力的广告，而最好的广告，是让这只股票真的活跃、真的强劲。炒作不是骗术，而是「用真实的活跃来传播意图」。",
      "最反直觉、也最关键的一条规则：把股价尽量炒到最高，然后在「下跌途中」把货派给散户——因为只有下跌中，市场才接得住巨量抛售。牵马到河边容易，逼马喝水难——抬高股价没用，得让散户心甘情愿地接。",
    ],
    takeaways: [
      "行情收录器 = 最有效的广告；让股票「真的活跃」才能传播意图",
      "派发在下跌途中完成——只有跌势能消化巨量抛售",
      "抬高股价不难，难的是让散户心甘情愿地接盘",
    ],
    echo: "索罗斯说：金融市场不属于道德范畴，它有自己的规则——炒作与投机本身并不「不道德」，关键在有无恶意误导。",
  },
  {
    id: "21", act: 5,
    title: "止损和止赢同样重要，在能够脱身时尽快脱身",
    one: "不活跃的「滞销股」是陷阱——它会把你变成被迫的长期持有者。",
    scene: [
      "帝国钢铁上市后无人问津，价格不跌也不涨。他只用七千股就把它拉抬了三十点，为内线打开了出货的销路。他也点出散户的陷阱：买进这种股权高度集中、交易清淡的股票，你会身不由己地被套在原地，望着横盘发呆。",
    ],
    reading: [
      "这一章把「出场」摆到和「进场」同等重要的位置：止损要快，止盈也要果断，能脱身时就尽快脱身。",
      "尤其要警惕缺乏流动性的滞销股——一旦买进，你就成了「另一个人」：不是你选择长期持有，而是你被迫长期持有。被这样的股票拖上一两年，机会成本与实际损失都会很大。",
    ],
    takeaways: [
      "出场和进场同样重要：止损要快，止盈也要果断",
      "远离流动性差的滞销股——它会把你「困」成长期持有者",
      "能脱身时尽快脱身，别等到无路可退",
    ],
    echo: "与林奇「行情确定时别再死缠烂打、奢望起死回生」一致——会卖，才是真功夫。",
  },
  {
    id: "22", act: 5,
    title: "没有永恒的朋友，利益共同体只在有限范围内有效",
    one: "联手坐庄的「同盟」，只在利益重合的那一段路上有效。",
    scene: [
      "在内线集团、承销团的合纵连横里，背信弃义是常态：基恩与惠特尼·瑞恩集团的宿怨，便由互相指责演绎而来。作手要让「同伴」误解并不难，因为同伴并不像他那样清楚市场真正需要什么。",
    ],
    reading: [
      "这一章讲市场里的「人际真相」：没有永恒的朋友，只有阶段性的共同利益。利益共同体只在彼此目标一致的有限范围内才靠得住，一旦出货节奏、仓位轻重出现分歧，同盟随时翻脸。",
      "对普通投资者的启示是：别把任何「联盟」「抱团」「一致行动」当成可以托付的保障——当利益不再重合，最先被牺牲的往往是你。",
    ],
    takeaways: [
      "没有永恒的朋友，只有阶段性的共同利益",
      "利益共同体只在目标一致的有限范围内有效",
      "别把「抱团」当成保障——利益一散，先被牺牲的是你",
    ],
    echo: "这与巴菲特「潮水退去才知道谁在裸泳」异曲同工：真正能依靠的，永远是自己的判断与底线。",
  },
  {
    id: "23", act: 5,
    title: "内线和股民的心理博弈中，刻意误导舆论总会笑到最后",
    one: "「空头掼压」是百年谎言——长期下跌，从来是内线在悄悄出货。",
    scene: [
      "纽黑文铁路从 255 美元一路崩到 12 美元，是最经典的例子。内线最先看清大祸、率先抛售，股价下跌；每当有人追问原因，「重要内线人士」便统一口径：一切正常，只是空头恶意打压。",
      "新英格兰的股民信以为真，把投机股当稳健投资死扛，损失惨重。英特维尔石油下跌时，内线甚至把锅甩给「拉里·利文斯顿在打压股市」。",
    ],
    reading: [
      "这一章揭穿股市最常见的舆论骗局：业绩好转时，内线在「沉默中」低调吸筹；出货时，则用满天飞的匿名利好「解释」上涨；一旦股价下跌，再抛出「空头掼压」的说辞，骗散户继续持有、甚至加买。",
      "利弗莫尔的铁律：股价长期低迷，原因绝不是空头打压，而是公司或大势出了问题。看到一只股票持续下跌，先假定「有人比你更早知道坏消息」。",
    ],
    takeaways: [
      "长期下跌 ≠ 空头掼压，而是内线在悄悄出货",
      "利好沉默吸筹，出货时却满天飞匿名利好——警惕这套循环",
      "股票持续下跌，先假定「有人比你更早知道坏消息」",
    ],
    echo: "林奇说：华尔街专家的意见带不给散户任何优势；你的利器，是投资自己真正了解的产业与公司。",
  },
  {
    id: "24", act: 5,
    title: "有些人有时候能打败某些股票，但没有人能永远打败整个股市",
    one: "全书的封顶之语——回到那条最朴素、也最难守的基本原则。",
    scene: [
      "收尾处，他拆穿散户必输的结构性原因：证券商靠佣金谋生、立场天然倾斜；市场领先现状六到九个月；以及分期售股、拆股换「颜色」、匿名利好等种种合法却误导的把戏——散布利空谎言会被法律惩罚，散布利多谎言却无人追究。",
    ],
    reading: [
      "章名就是结论：有些人有时候能打败某些股票，但没有人能永远打败整个股市。所以唯一的活路，是死守那条最朴素的基本原则——股价上涨别问为什么，顺势跟进；当长涨之后开始转跌、最小阻力方向由上转下，就果断离场。",
      "而真正知情的，永远是极少数人，他们绝不会告诉你真相。把这一点刻在心里，你才不会成为匿名利好与「空头掼压」谎言的猎物。",
    ],
    takeaways: [
      "没有人能永远打败整个股市——保持谦卑",
      "死守基本原则：顺势跟进，方向转下就果断离场",
      "知情者永远是少数，且绝不会告诉你真相",
    ],
    echo: "巴菲特与林奇殊途同归：把钱集中在少数你真正看得懂的公司上——这是普通人对抗「庄家信息优势」最现实的武器。",
  },
];

// 净值过山车：八个里程碑（yFrac: 0=谷底, 1=顶峰）
const TIMELINE = [
  { year: 1891, yFrac: 0.05, label: "起步 · 报价板小子",      val: "$0",        chap: "1" },
  { year: 1896, yFrac: 0.30, label: "抢钱小子",               val: "≈ $1 万",   chap: "1" },
  { year: 1901, yFrac: 0.06, label: "北太平洋 · 一日赔光",     val: "→ $0",      chap: "3" },
  { year: 1906, yFrac: 0.20, label: "太早做空，又破产",        val: "≈ $0",      chap: "8" },
  { year: 1907, yFrac: 0.93, label: "国王一天",               val: "≈ $300 万", chap: "9" },
  { year: 1908, yFrac: 0.42, label: "棉花惨败 · 珀西·托马斯",  val: "剩 $30 万", chap: "10" },
  { year: 1914, yFrac: 0.04, label: "宣告破产",               val: "$0",        chap: "14" },
  { year: 1916, yFrac: 0.90, label: "战时牛市 · 还清债务",     val: "≈ $300 万", chap: "14" },
];

const LAWS = [
  { k: "01", t: "顺势而为", d: "做「大势」的朋友，沿最小阻力方向交易。个股逆势，先怀疑个股；不与行情争辩。" },
  { k: "02", t: "坐得住", d: "看对方向只是开始。赚大钱靠「坚持不动」抓住大波动，而非频繁进出。——老火鸡" },
  { k: "03", t: "时机为王", d: "看对 ≠ 赚钱，早一步也是错。要「走过去」，不要「冲过去」。耐心等待入场暗号。" },
  { k: "04", t: "试探加码", d: "用约 1/5 仓位试水；只在盈利时金字塔式加码，一旦亏损立即停手，绝不一次梭哈。" },
  { k: "05", t: "截断亏损", d: "错了立刻认错出场；绝不向下摊平亏损。卖掉赚钱的、留住赔钱的，是慢性自杀。" },
  { k: "06", t: "独立思考", d: "不信内幕，不被「聪明的朋友」说服。唯一可信的「内幕」，是管理层的品行。" },
  { k: "07", t: "战胜自己", d: "希望与恐惧是致命大患。像研究行情一样研究自己，认清并防范人性的弱点。" },
  { k: "08", t: "市场是对的", d: "行情不会错，错的是人。长期下跌从不是「空头掼压」，而是有人比你更早知道真相。" },
];

/* ---------------- 视觉组件 ---------------- */

function TickerTape() {
  const row = (
    <span className="ticker-row">
      {TICKER.map((t, i) => (
        <span className="ticker-item" key={i}>
          <span className="ticker-glyph">{i % 2 ? "▾" : "▴"}</span>
          {t}
          <span className="ticker-dot">＊</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="ticker">
      <div className="ticker-track">
        {row}
        {row}
      </div>
    </div>
  );
}

function NetWorthChart({ onJump }) {
  const W = 980, H = 460;
  const padL = 46, padR = 46, padT = 56, padB = 92;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const y0 = TIMELINE[0].year, y1 = TIMELINE[TIMELINE.length - 1].year;
  const xFor = (yr) => padL + ((yr - y0) / (y1 - y0)) * plotW;
  const yFor = (f) => padT + (1 - f) * plotH;
  const baseY = yFor(0);
  const pts = TIMELINE.map((d) => ({ ...d, x: xFor(d.year), y: yFor(d.yFrac) }));
  const [hover, setHover] = useState(null);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label="利弗莫尔净值过山车">
        {[0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={padL} x2={W - padR} y1={yFor(g)} y2={yFor(g)} className="grid" />
        ))}
        <line x1={padL} x2={W - padR} y1={baseY} y2={baseY} className="axis" />
        {pts.slice(0, -1).map((p, i) => {
          const q = pts[i + 1];
          const up = q.y <= p.y;
          return (
            <g key={i}>
              <polygon points={`${p.x},${p.y} ${q.x},${q.y} ${q.x},${baseY} ${p.x},${baseY}`}
                className={up ? "seg-fill-up" : "seg-fill-dn"} />
              <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={up ? "seg-up" : "seg-dn"} />
            </g>
          );
        })}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H - padB + 26} className="yr">{p.year}</text>
        ))}
        {pts.map((p, i) => {
          const above = p.yFrac >= 0.5;
          const ly = above ? p.y - 18 : p.y + 28;
          const isHover = hover === i;
          return (
            <g key={i} className="dot-g"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              onClick={() => onJump(p.chap)}>
              <circle cx={p.x} cy={p.y} r={isHover ? 9 : 6} className="dot" />
              <circle cx={p.x} cy={p.y} r={isHover ? 16 : 12} className="dot-ring" />
              <text x={p.x} y={ly} className={"dot-label" + (above ? " up" : " dn")}>{p.label}</text>
              <text x={p.x} y={above ? ly - 16 : ly + 16} className="dot-val">{p.val}</text>
            </g>
          );
        })}
      </svg>
      <div className="chart-cap">▴ 绿色 = 财富上行　▾ 红色 = 崩塌　·　点击任一里程碑，跳到对应章节</div>
    </div>
  );
}

function LeastResistanceDiagram() {
  return (
    <svg viewBox="0 0 360 200" className="mini-svg">
      <line x1="20" y1="60" x2="240" y2="60" className="dia-dash" />
      <line x1="20" y1="140" x2="240" y2="140" className="dia-dash" />
      <text x="244" y="64" className="dia-t">阻力</text>
      <text x="244" y="144" className="dia-t">支撑</text>
      <polyline points="24,100 50,72 76,128 102,74 128,126 154,80 180,120 206,66 232,62 268,30 300,18 332,12" className="dia-line" />
      <circle cx="232" cy="62" r="4" className="dia-pt" />
      <text x="200" y="50" className="dia-s">突破→加码</text>
      <polygon points="332,12 326,22 338,22" className="dia-arrow" />
      <text x="20" y="188" className="dia-c">箱体内来回；突破上沿、方向明确时才顺势追入</text>
    </svg>
  );
}

function PyramidDiagram() {
  const bars = [
    { x: 44, w: 56, label: "试探 1/5" },
    { x: 110, w: 44, label: "+1/5" },
    { x: 166, w: 34, label: "+1/5" },
    { x: 212, w: 24, label: "+" },
  ];
  return (
    <svg viewBox="0 0 360 200" className="mini-svg">
      <line x1="30" y1="150" x2="340" y2="150" className="axis" />
      {bars.map((b, i) => {
        const h = 26 + i * 22;
        return (
          <g key={i}>
            <rect x={b.x} y={150 - h} width={b.w} height={h} className="bar" />
            <text x={b.x + b.w / 2} y={150 - h - 6} className="dia-s">{b.label}</text>
          </g>
        );
      })}
      <polyline points="60,138 130,110 196,84 250,64" className="dia-line" />
      <polygon points="250,64 244,74 256,74" className="dia-arrow" />
      <text x="258" y="58" className="dia-s">价涨</text>
      <text x="246" y="118" className="dia-c-r">亏损→停止加码</text>
      <text x="30" y="188" className="dia-c">先小仓试水，只在盈利时加码；越涨越买、越买越少</text>
    </svg>
  );
}

function DistributionDiagram() {
  return (
    <svg viewBox="0 0 360 200" className="mini-svg">
      <line x1="20" y1="170" x2="345" y2="170" className="axis" />
      <rect x="24" y="40" width="80" height="130" className="phase a" />
      <rect x="104" y="40" width="108" height="130" className="phase b" />
      <rect x="212" y="40" width="130" height="130" className="phase c" />
      <polyline points="24,150 70,148 96,138 130,96 160,58 188,40 210,34 232,42 262,70 300,110 336,150" className="dia-line" />
      <text x="64" y="190" className="phase-t">①沉默吸筹</text>
      <text x="158" y="190" className="phase-t">②拉抬做活</text>
      <text x="277" y="190" className="phase-t">③下跌中派发</text>
      <text x="232" y="30" className="dia-s">利好满天飞</text>
    </svg>
  );
}

/* ---------------- 视图 ---------------- */

function OverviewView({ onJump }) {
  return (
    <div className="view">
      <section className="hero stagger" style={{ "--i": 0 }}>
        <div className="hero-kicker">巴菲特指定的股市教科书 · 彼得·林奇点评版</div>
        <h1 className="hero-title">股票作手回忆录</h1>
        <div className="hero-en">Reminiscences of a Stock Operator</div>
        <div className="hero-meta">［美］杰西·利弗莫尔　著　·　1923</div>
        <p className="hero-lede">
          这是一部用真金白银写成的回忆录。利弗莫尔从十四岁的报价板小子，一路成为华尔街的「投机之王」，
          四度暴富、四度破产。一个世纪过去，他笔下的恐惧、贪婪与人性，依旧是今天市场的镜子——
          <em>「华尔街没有新鲜事，因为投机像群山一样古老。」</em>
        </p>
      </section>

      <section className="block stagger" style={{ "--i": 1 }}>
        <div className="block-head">
          <span className="block-num">图 · 一</span>
          <h2 className="block-title">净值过山车</h2>
          <p className="block-sub">他的财富曲线，就是一部活的风险教科书</p>
        </div>
        <NetWorthChart onJump={onJump} />
      </section>

      <section className="block stagger" style={{ "--i": 2 }}>
        <div className="block-head">
          <span className="block-num">幕 · 五</span>
          <h2 className="block-title">全书的五幕结构</h2>
          <p className="block-sub">24 章 + 序，可以读成一部跌宕起伏的成长史</p>
        </div>
        <div className="acts-grid">
          {ACTS.map((a) => {
            const chs = CHAPTERS.filter((c) => c.act === a.n);
            return (
              <div className="act-card" key={a.n} style={{ "--ac": a.color }}>
                <div className="act-rom">{a.key}</div>
                <h3 className="act-title">{a.title}</h3>
                <p className="act-sub">{a.sub}</p>
                <div className="act-chaps">
                  {chs.map((c) => (
                    <button key={c.id} className="act-chip" onClick={() => onJump(c.id)} title={c.title}>
                      {c.id === "序" ? "序" : c.id}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="thesis stagger" style={{ "--i": 3 }}>
        <div className="thesis-mark">&ldquo;</div>
        <p className="thesis-q">
          能看对波动方向的人很多，<br />
          能看对波动并坚持不动的人，<br />
          才真正厉害。
        </p>
        <div className="thesis-by">—— 全书最难学，也最值钱的一句话</div>
      </section>
    </div>
  );
}

function ChaptersView({ active, setActive }) {
  const ch = CHAPTERS[active];
  const act = ACTS[ch.act - 1];
  const prev = active > 0 ? CHAPTERS[active - 1] : null;
  const next = active < CHAPTERS.length - 1 ? CHAPTERS[active + 1] : null;

  return (
    <div className="reader">
      <aside className="rail">
        {ACTS.map((a) => (
          <div className="rail-act" key={a.n}>
            <div className="rail-act-head" style={{ "--ac": a.color }}>
              <span className="rail-rom">{a.key}</span>{a.title}
            </div>
            {CHAPTERS.map((c, i) =>
              c.act === a.n ? (
                <button key={c.id} className={"rail-item" + (i === active ? " on" : "")} onClick={() => setActive(i)}>
                  <span className="rail-id">{c.id === "序" ? "序" : c.id}</span>
                  <span className="rail-t">{c.title}</span>
                </button>
              ) : null
            )}
          </div>
        ))}
      </aside>

      <article className="page" key={active}>
        <div className="page-act" style={{ "--ac": act.color }}>第 {act.n} 幕 · {act.title}</div>
        <div className="page-id">{ch.id === "序" ? "序" : `第 ${ch.id} 章`}</div>
        <h2 className="page-title">{ch.title}</h2>
        <p className="page-one">{ch.one}</p>

        <div className="sec">
          <div className="sec-tag">关键场景</div>
          {ch.scene.map((p, i) => (
            <p className={"sec-p" + (i === 0 ? " has-cap" : "")} key={i}>{p}</p>
          ))}
        </div>

        <div className="sec">
          <div className="sec-tag">精读 · 这一章到底在讲什么</div>
          {ch.reading.map((p, i) => (<p className="sec-p" key={i}>{p}</p>))}
        </div>

        <div className="sec">
          <div className="sec-tag">带走这三句</div>
          <ul className="take">
            {ch.takeaways.map((t, i) => (
              <li key={i}><span className="take-n">{i + 1}</span>{t}</li>
            ))}
          </ul>
        </div>

        <div className="echo">
          <div className="echo-tag">名家印证</div>
          <p className="echo-p">{ch.echo}</p>
        </div>

        <div className="page-nav">
          {prev ? (
            <button className="pn" onClick={() => setActive(active - 1)}>
              <span className="pn-dir">← 上一章</span>
              <span className="pn-t">{prev.id === "序" ? "序" : `第${prev.id}章`} · {prev.title}</span>
            </button>
          ) : <span />}
          {next ? (
            <button className="pn right" onClick={() => setActive(active + 1)}>
              <span className="pn-dir">下一章 →</span>
              <span className="pn-t">{next.id === "序" ? "序" : `第${next.id}章`} · {next.title}</span>
            </button>
          ) : <span />}
        </div>
      </article>
    </div>
  );
}

function PrinciplesView() {
  return (
    <div className="view">
      <section className="hero compact stagger" style={{ "--i": 0 }}>
        <div className="hero-kicker">把整本书拧成一句话</div>
        <h1 className="hero-title sm">利弗莫尔交易法则</h1>
        <p className="hero-lede center">
          这八条，是利弗莫尔用四次破产、上千万学费换来的。读懂它们，你就拿到了这本书最硬的内核。
        </p>
      </section>

      <section className="block stagger" style={{ "--i": 1 }}>
        <div className="laws-grid">
          {LAWS.map((l) => (
            <div className="law" key={l.k}>
              <div className="law-k">{l.k}</div>
              <h3 className="law-t">{l.t}</h3>
              <p className="law-d">{l.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block stagger" style={{ "--i": 2 }}>
        <div className="block-head">
          <span className="block-num">图 · 二</span>
          <h2 className="block-title">三张图，记住三个机关</h2>
          <p className="block-sub">最小阻力线 · 金字塔加码 · 庄家派发周期</p>
        </div>
        <div className="dia-grid">
          <div className="dia-card">
            <h4 className="dia-title">最小阻力线</h4>
            <LeastResistanceDiagram />
            <p className="dia-note">价格在「支撑—阻力」间来回。利弗莫尔只在<strong>突破</strong>、方向明确后才顺势出手——「股价永远不会高到不能买进」。</p>
          </div>
          <div className="dia-card">
            <h4 className="dia-title">金字塔加码</h4>
            <PyramidDiagram />
            <p className="dia-note">先用小仓<strong>试探</strong>，只在盈利时逐次加码、越买越少；一旦出现亏损，立即停手——这是「试探+加码」的纪律。</p>
          </div>
          <div className="dia-card">
            <h4 className="dia-title">庄家派发周期</h4>
            <DistributionDiagram />
            <p className="dia-note">①利好时<strong>沉默吸筹</strong> → ②把股票<strong>做活</strong>拉抬 → ③在<strong>下跌途中</strong>用满天利好把货派给散户。看懂它，少做接盘侠。</p>
          </div>
        </div>
      </section>

      <section className="thesis stagger" style={{ "--i": 3 }}>
        <div className="thesis-mark">&ldquo;</div>
        <p className="thesis-q sm">
          有些人有时候能打败某些股票，<br />
          但没有人能永远打败整个股市。
        </p>
        <div className="thesis-by">—— 第 24 章，全书的封顶之语</div>
      </section>
    </div>
  );
}

/* ---------------- 主程序 ---------------- */

export default function App() {
  const [view, setView] = useState("overview");
  const [active, setActive] = useState(0);
  const topRef = useRef(null);

  const jumpToChapter = (id) => {
    const idx = CHAPTERS.findIndex((c) => c.id === String(id));
    if (idx >= 0) { setActive(idx); setView("chapters"); }
  };

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [view, active]);

  return (
    <div className="app">
      <style>{CSS}</style>
      <div ref={topRef} />
      <TickerTape />

      <header className="masthead">
        <div className="mast-left">
          <div className="mast-rule" />
          <div className="mast-title">股票作手回忆录 · 互动导读</div>
          <div className="mast-sub">Reminiscences of a Stock Operator — Jesse Livermore</div>
        </div>
        <nav className="tabs">
          <button className={"tab" + (view === "overview" ? " on" : "")} onClick={() => setView("overview")}>导读总览</button>
          <button className={"tab" + (view === "chapters" ? " on" : "")} onClick={() => setView("chapters")}>逐章精读</button>
          <button className={"tab" + (view === "principles" ? " on" : "")} onClick={() => setView("principles")}>交易法则</button>
        </nav>
      </header>

      <main className="main">
        {view === "overview" && <OverviewView onJump={jumpToChapter} />}
        {view === "chapters" && <ChaptersView active={active} setActive={setActive} />}
        {view === "principles" && <PrinciplesView />}
      </main>

      <footer className="foot">
        <div className="foot-rule" />
        <p>
          导读基于《彼得·林奇点评版 · 股票作手回忆录》（中国青年出版社，2012）梳理而成。
          原著为公版书；本导读为独立编写的阅读辅助，所有概括与点评均为转述与提炼，非原文照录。
        </p>
        <p className="foot-q">「先做对的事，赚钱只是结果。」</p>
      </footer>
    </div>
  );
}

/* ---------------- 样式 ---------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400;1,600&family=Spectral:ital,wght@0,400;0,500;1,400&family=Noto+Serif+SC:wght@400;700;900&family=Courier+Prime:wght@400;700&display=swap');

:root{
  --paper:#f3ecdc; --paper-2:#eadfca; --panel:#f8f2e4;
  --ink:#221b12; --ink-soft:#5d5340; --ink-faint:#8a7c63;
  --rule:#c9b994; --rule-soft:#dccdab;
  --bull:#1f6b4f; --bear:#a02d24; --brass:#9a7a2f; --gold:#b08a36;
  --font-display:'Playfair Display','Noto Serif SC','Songti SC',serif;
  --font-cn:'Noto Serif SC','Songti SC','Source Han Serif SC','STSong',serif;
  --font-body:'Spectral','Noto Serif SC','Songti SC',serif;
  --font-mono:'Courier Prime','Courier New',monospace;
}
*{box-sizing:border-box;}
.app{
  background-color:var(--paper);
  background-image:
    radial-gradient(circle at 16% 10%, rgba(255,250,238,.6), transparent 42%),
    radial-gradient(circle at 88% 92%, rgba(176,138,54,.07), transparent 46%),
    repeating-linear-gradient(0deg, rgba(120,100,60,.022) 0 1px, transparent 1px 5px);
  color:var(--ink); font-family:var(--font-cn); line-height:1.85; min-height:100%; letter-spacing:.01em;
}

/* ticker */
.ticker{background:var(--ink);overflow:hidden;border-bottom:2px solid var(--gold);}
.ticker-track{display:flex;width:max-content;animation:marquee 46s linear infinite;}
.ticker-row{display:inline-flex;white-space:nowrap;}
.ticker-item{display:inline-flex;align-items:center;gap:.5em;color:#efe6d2;font-family:var(--font-mono);font-size:13px;letter-spacing:.05em;padding:7px 22px;}
.ticker-glyph{color:var(--gold);}
.ticker-dot{color:#6c5f44;margin-left:.4em;}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* masthead */
.masthead{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;max-width:1120px;margin:0 auto;padding:30px 28px 18px;border-bottom:3px double var(--rule);}
.mast-rule{width:48px;height:5px;background:var(--gold);margin-bottom:12px;}
.mast-title{font-family:var(--font-cn);font-weight:900;font-size:25px;letter-spacing:.06em;}
.mast-sub{font-family:var(--font-display);font-style:italic;color:var(--ink-faint);font-size:13.5px;margin-top:3px;}
.tabs{display:flex;gap:4px;}
.tab{background:none;border:none;color:var(--ink-soft);font-family:var(--font-cn);font-size:15px;font-weight:700;padding:7px 15px;cursor:pointer;letter-spacing:.06em;border-radius:2px;transition:all .18s ease;position:relative;}
.tab:hover{color:var(--ink);background:var(--paper-2);}
.tab.on{color:var(--ink);}
.tab.on:after{content:"";position:absolute;left:14px;right:14px;bottom:1px;height:2px;background:var(--gold);}

.main{max-width:1120px;margin:0 auto;padding:0 28px;}
.view{padding:40px 0 20px;}
.stagger{opacity:0;transform:translateY(14px);animation:fadeUp .7s cubic-bezier(.2,.7,.3,1) forwards;animation-delay:calc(var(--i,0) * .12s + .05s);}
@keyframes fadeUp{to{opacity:1;transform:none;}}

/* hero */
.hero{text-align:center;padding:34px 0 12px;border-bottom:1px solid var(--rule-soft);margin-bottom:40px;}
.hero.compact{padding:18px 0 6px;}
.hero-kicker{font-family:var(--font-cn);font-size:12.5px;letter-spacing:.32em;color:var(--brass);margin-bottom:16px;}
.hero-title{font-family:var(--font-cn);font-weight:900;font-size:clamp(40px,8vw,74px);line-height:1.05;letter-spacing:.05em;margin:0;}
.hero-title.sm{font-size:clamp(32px,6vw,52px);}
.hero-en{font-family:var(--font-display);font-style:italic;font-size:clamp(15px,2.2vw,21px);color:var(--ink-soft);margin-top:10px;}
.hero-meta{font-family:var(--font-mono);font-size:13px;color:var(--ink-faint);margin-top:14px;letter-spacing:.08em;}
.hero-lede{max-width:680px;margin:24px auto 8px;font-family:var(--font-body);font-size:17.5px;color:var(--ink-soft);line-height:1.95;}
.hero-lede.center{text-align:center;}
.hero-lede em{font-style:italic;color:var(--ink);}

/* block */
.block{margin:14px 0 58px;}
.block-head{text-align:center;margin-bottom:30px;}
.block-num{font-family:var(--font-mono);font-size:12px;letter-spacing:.3em;color:var(--brass);}
.block-title{font-family:var(--font-cn);font-weight:900;font-size:clamp(26px,4vw,38px);letter-spacing:.05em;margin:8px 0 4px;}
.block-sub{font-family:var(--font-body);font-style:italic;color:var(--ink-faint);font-size:16px;margin:0;}

/* chart */
.chart-wrap{background:var(--panel);border:1px solid var(--rule);border-radius:3px;padding:14px 12px 10px;box-shadow:0 18px 40px -28px rgba(40,30,10,.5);}
.chart-svg{width:100%;height:auto;display:block;}
.grid{stroke:var(--rule-soft);stroke-width:1;stroke-dasharray:2 6;opacity:.7;}
.axis{stroke:var(--ink-soft);stroke-width:1.4;}
.seg-up{stroke:var(--bull);stroke-width:3;fill:none;stroke-linecap:round;}
.seg-dn{stroke:var(--bear);stroke-width:3;fill:none;stroke-linecap:round;}
.seg-fill-up{fill:rgba(31,107,79,.10);}
.seg-fill-dn{fill:rgba(160,45,36,.10);}
.yr{font-family:var(--font-mono);font-size:12.5px;fill:var(--ink-faint);text-anchor:middle;letter-spacing:.04em;}
.dot-g{cursor:pointer;}
.dot{fill:var(--paper);stroke:var(--ink);stroke-width:2.2;transition:r .15s ease;}
.dot-g:hover .dot{fill:var(--gold);}
.dot-ring{fill:none;stroke:var(--gold);stroke-width:1.2;opacity:.5;transition:r .15s ease;}
.dot-label{font-family:var(--font-cn);font-size:13px;font-weight:700;fill:var(--ink);text-anchor:middle;}
.dot-val{font-family:var(--font-mono);font-size:11.5px;fill:var(--ink-faint);text-anchor:middle;letter-spacing:.03em;}
.chart-cap{text-align:center;font-family:var(--font-mono);font-size:12px;color:var(--ink-faint);padding:10px 6px 2px;letter-spacing:.04em;}

/* acts grid */
.acts-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:16px;}
.act-card{background:var(--panel);border:1px solid var(--rule);border-top:4px solid var(--ac);border-radius:3px;padding:20px 18px 18px;display:flex;flex-direction:column;gap:8px;transition:transform .18s ease,box-shadow .18s ease;}
.act-card:hover{transform:translateY(-3px);box-shadow:0 16px 34px -24px rgba(40,30,10,.55);}
.act-rom{font-family:var(--font-display);font-size:30px;font-weight:800;color:var(--ac);line-height:1;letter-spacing:.04em;}
.act-title{font-family:var(--font-cn);font-weight:900;font-size:18px;margin:2px 0 0;letter-spacing:.03em;}
.act-sub{font-family:var(--font-body);font-size:14px;color:var(--ink-soft);margin:0;line-height:1.7;flex:1;}
.act-chaps{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
.act-chip{width:30px;height:30px;border:1px solid var(--rule);background:var(--paper);color:var(--ink-soft);font-family:var(--font-mono);font-size:13px;border-radius:2px;cursor:pointer;transition:all .15s ease;}
.act-chip:hover{background:var(--ac);color:#fff;border-color:var(--ac);}

/* thesis */
.thesis{position:relative;text-align:center;padding:54px 20px 50px;margin:30px 0 10px;border-top:3px double var(--rule);border-bottom:3px double var(--rule);}
.thesis-mark{font-family:var(--font-display);font-size:90px;color:var(--rule);line-height:.2;height:30px;}
.thesis-q{font-family:var(--font-cn);font-weight:900;font-size:clamp(22px,3.4vw,32px);line-height:1.7;letter-spacing:.04em;margin:8px 0 0;}
.thesis-q.sm{font-size:clamp(20px,3vw,28px);}
.thesis-by{font-family:var(--font-body);font-style:italic;color:var(--ink-faint);font-size:15px;margin-top:18px;}

/* reader */
.reader{display:grid;grid-template-columns:262px 1fr;gap:34px;padding:34px 0 20px;}
.rail{position:sticky;top:14px;align-self:start;max-height:calc(100vh - 40px);overflow-y:auto;padding-right:6px;border-right:1px solid var(--rule-soft);}
.rail-act{margin-bottom:14px;}
.rail-act-head{font-family:var(--font-cn);font-weight:900;font-size:13px;letter-spacing:.04em;color:var(--ink);padding:6px 8px;border-left:3px solid var(--ac);background:var(--paper-2);margin-bottom:4px;}
.rail-rom{font-family:var(--font-display);font-weight:800;color:var(--ac);margin-right:8px;}
.rail-item{display:flex;gap:8px;align-items:flex-start;width:100%;text-align:left;background:none;border:none;cursor:pointer;padding:6px 8px;border-radius:2px;color:var(--ink-soft);font-family:var(--font-cn);font-size:13.5px;line-height:1.5;transition:all .14s ease;}
.rail-item:hover{background:var(--paper-2);color:var(--ink);}
.rail-item.on{background:var(--ink);color:var(--paper);}
.rail-item.on .rail-id{color:var(--gold);}
.rail-id{font-family:var(--font-mono);font-size:12px;min-width:18px;color:var(--ink-faint);padding-top:1px;}
.rail-t{flex:1;}

/* page */
.page{min-width:0;animation:fadeUp .5s ease both;}
.page-act{font-family:var(--font-cn);font-size:13px;font-weight:700;letter-spacing:.1em;color:var(--ac);}
.page-id{font-family:var(--font-mono);font-size:13px;letter-spacing:.2em;color:var(--brass);margin-top:10px;}
.page-title{font-family:var(--font-cn);font-weight:900;font-size:clamp(26px,4vw,40px);line-height:1.25;letter-spacing:.02em;margin:6px 0 14px;}
.page-one{font-family:var(--font-body);font-style:italic;font-size:19px;color:var(--ink);border-left:3px solid var(--gold);padding-left:16px;margin:0 0 30px;line-height:1.7;}

.sec{margin-bottom:30px;}
.sec-tag{display:inline-block;font-family:var(--font-cn);font-weight:700;font-size:13px;letter-spacing:.12em;color:var(--paper);background:var(--ink);padding:4px 12px;border-radius:1px;margin-bottom:14px;}
.sec-p{font-family:var(--font-body);font-size:17px;line-height:2.0;color:#33291c;margin:0 0 14px;}
.sec-p.has-cap::first-letter{font-family:var(--font-cn);font-weight:900;font-size:3.1em;float:left;line-height:.82;padding:.04em .1em 0 0;color:var(--brass);}
.take{list-style:none;padding:0;margin:0;}
.take li{display:flex;gap:12px;align-items:flex-start;font-family:var(--font-cn);font-size:16px;line-height:1.7;color:var(--ink);padding:11px 14px;background:var(--panel);border:1px solid var(--rule-soft);border-left:3px solid var(--bull);border-radius:2px;margin-bottom:8px;}
.take-n{font-family:var(--font-display);font-weight:800;color:var(--bull);font-size:18px;min-width:16px;}

.echo{background:linear-gradient(180deg,var(--paper-2),var(--panel));border:1px solid var(--rule);border-radius:3px;padding:18px 20px;margin-top:6px;}
.echo-tag{font-family:var(--font-cn);font-weight:700;font-size:12.5px;letter-spacing:.16em;color:var(--brass);margin-bottom:8px;}
.echo-p{font-family:var(--font-body);font-size:16px;line-height:1.9;color:var(--ink-soft);margin:0;font-style:italic;}

.page-nav{display:flex;justify-content:space-between;gap:14px;margin-top:42px;padding-top:22px;border-top:1px solid var(--rule-soft);}
.pn{flex:1;max-width:48%;background:none;border:1px solid var(--rule);border-radius:3px;padding:12px 16px;cursor:pointer;text-align:left;transition:all .16s ease;display:flex;flex-direction:column;gap:5px;}
.pn.right{text-align:right;align-items:flex-end;}
.pn:hover{background:var(--paper-2);border-color:var(--gold);}
.pn-dir{font-family:var(--font-mono);font-size:12px;color:var(--brass);letter-spacing:.08em;}
.pn-t{font-family:var(--font-cn);font-size:14px;color:var(--ink);font-weight:700;}

/* laws */
.laws-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;}
.law{position:relative;background:var(--panel);border:1px solid var(--rule);border-radius:3px;padding:22px 20px 20px;overflow:hidden;transition:transform .18s ease,box-shadow .18s ease;}
.law:hover{transform:translateY(-3px);box-shadow:0 16px 34px -24px rgba(40,30,10,.55);}
.law-k{position:absolute;top:6px;right:14px;font-family:var(--font-display);font-weight:800;font-size:54px;color:rgba(176,138,54,.16);line-height:1;}
.law-t{font-family:var(--font-cn);font-weight:900;font-size:21px;margin:0 0 10px;letter-spacing:.04em;position:relative;}
.law-t:after{content:"";display:block;width:30px;height:3px;background:var(--gold);margin-top:8px;}
.law-d{font-family:var(--font-body);font-size:15.5px;line-height:1.85;color:var(--ink-soft);margin:0;position:relative;}

/* diagrams */
.dia-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px;}
.dia-card{background:var(--panel);border:1px solid var(--rule);border-radius:3px;padding:18px 18px 16px;}
.dia-title{font-family:var(--font-cn);font-weight:900;font-size:17px;margin:0 0 6px;letter-spacing:.03em;}
.mini-svg{width:100%;height:auto;display:block;margin:4px 0 6px;}
.dia-note{font-family:var(--font-body);font-size:14px;line-height:1.8;color:var(--ink-soft);margin:6px 0 0;}
.dia-note strong{color:var(--ink);font-weight:600;}
.dia-dash{stroke:var(--ink-faint);stroke-width:1.2;stroke-dasharray:4 5;}
.dia-line{fill:none;stroke:var(--bull);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round;}
.dia-pt{fill:var(--gold);stroke:var(--ink);stroke-width:1.4;}
.dia-arrow{fill:var(--bull);}
.dia-t{font-family:var(--font-cn);font-size:12px;fill:var(--ink-faint);}
.dia-s{font-family:var(--font-cn);font-size:11.5px;fill:var(--ink);text-anchor:middle;font-weight:700;}
.dia-c{font-family:var(--font-cn);font-size:12px;fill:var(--ink-faint);}
.dia-c-r{font-family:var(--font-cn);font-size:11.5px;fill:var(--bear);text-anchor:middle;font-weight:700;}
.bar{fill:var(--bull);opacity:.78;}
.phase{opacity:.5;}
.phase.a{fill:rgba(154,122,47,.10);}
.phase.b{fill:rgba(31,107,79,.10);}
.phase.c{fill:rgba(160,45,36,.12);}
.phase-t{font-family:var(--font-cn);font-size:11.5px;fill:var(--ink);text-anchor:middle;font-weight:700;}

/* foot */
.foot{max-width:1120px;margin:30px auto 0;padding:24px 28px 40px;border-top:3px double var(--rule);}
.foot-rule{width:40px;height:4px;background:var(--gold);margin-bottom:14px;}
.foot p{font-family:var(--font-body);font-size:13.5px;color:var(--ink-faint);line-height:1.8;margin:0 0 8px;max-width:760px;}
.foot-q{font-family:var(--font-cn) !important;font-style:normal;font-size:16px !important;color:var(--ink-soft) !important;font-weight:700;margin-top:14px !important;}

@media (max-width:820px){
  .reader{grid-template-columns:1fr;gap:18px;}
  .rail{position:static;max-height:340px;border-right:none;border-bottom:1px solid var(--rule-soft);padding:0 0 12px;}
  .masthead{align-items:flex-start;}
  .tabs{width:100%;}
  .page-nav{flex-direction:column;}
  .pn,.pn.right{max-width:100%;text-align:left;align-items:flex-start;}
}
`;
