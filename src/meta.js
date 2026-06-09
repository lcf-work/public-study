// ============================================================================
// 内容元数据 / Content metadata
// ----------------------------------------------------------------------------
// 这里是唯一需要手动维护的地方，而且都是「可选的」。
// This is the only place you edit by hand — and every field is OPTIONAL.
//
// 新增一篇研习：把 .jsx 丢进 content/<分类>/，它会被自动发现并上线。
//   想要漂亮的中文标题/简介，就在下面 STUDIES 里加一条（键 = "分类/文件名"）。
//   不加也没关系：标题会自动从文件名推导。
//
// 新增一个分类：直接在 content/ 下建一个新文件夹即可。
//   想要漂亮的分类名，就在下面 CATEGORIES 里加一条；不加则显示文件夹名。
// ============================================================================

// 分类的展示名与排序 / Display label + ordering for each category.
// key 必须等于 content/ 下的文件夹名。order 越小越靠前。
export const CATEGORIES = {
  invest: { label: "投资", en: "Investing", desc: "价值投资与市场认知", order: 1 },
  history: { label: "历史", en: "History", desc: "人物与典籍", order: 2 },
};

// 每篇研习的元数据 / Per-study metadata.
// key = "<分类文件夹>/<文件名不含扩展名>"
export const STUDIES = {
  "invest/intelligent-investor": {
    title: "聪明的投资者",
    subtitle: "The Intelligent Investor · Benjamin Graham",
    description:
      "价值投资圣经：市场先生、安全边际、防御型 vs 进取型投资者，配互动自测与买点演示。",
    date: "2026-06-01",
    tags: ["价值投资", "格雷厄姆", "安全边际", "互动"],
  },
  "invest/intelligent-investor-zweig": {
    title: "聪明的投资者 · 评注版",
    subtitle: "The Intelligent Investor (Revised) · Jason Zweig 评注",
    description:
      "茨威格用 2000 年互联网泡沫逐章印证格雷厄姆，并补上格雷厄姆没讲透的一课——行为金融学与你的大脑。",
    date: "2026-06-02",
    tags: ["价值投资", "茨威格", "行为金融", "评注"],
  },
  "invest/random-walk-wallstreet": {
    title: "漫步华尔街",
    subtitle: "A Random Walk Down Wall Street · Burton Malkiel",
    description:
      "随机漫步、磐石 vs 空中楼阁、有效市场，以及最坚定的建议——低成本宽基指数基金。含费率复利滑块。",
    date: "2026-06-03",
    tags: ["指数基金", "有效市场", "马尔基尔", "互动"],
  },
  "invest/five-rules-dorsey": {
    title: "股市真规则",
    subtitle: "The Five Rules for Successful Stock Investing · Pat Dorsey",
    description:
      "多尔西的选股框架：经济护城河、盯自由现金流而非会计利润、按行业看门道、用安全边际估值。含 DCF 演示。",
    date: "2026-06-04",
    tags: ["护城河", "财报分析", "估值", "晨星"],
  },
  "invest/most-important-thing-marks": {
    title: "投资最重要的事",
    subtitle: "The Most Important Thing · Howard Marks",
    description:
      "霍华德·马克斯的投资备忘录精粹：第二层思维、价值与价格、风险控制、周期钟摆、逆向投资与防御取胜。",
    date: "2026-06-05",
    tags: ["霍华德·马克斯", "第二层思维", "风险控制", "周期"],
  },
  "invest/poor-charlie-munger": {
    title: "穷查理宝典",
    subtitle: "Poor Charlie's Almanack · Charlie Munger",
    description:
      "查理·芒格的多学科思维格栅：逆向思考、误判心理、能力圈、耐心、好生意，以及如何持续避免愚蠢。",
    date: "2026-06-05",
    tags: ["芒格", "多学科思维", "误判心理", "能力圈"],
  },
  "invest/AH_premium_analysis": {
    title: "A/H 溢价反转：中芯 vs 澜起",
    subtitle: "SMIC vs Montage · 数据截至 2026 年 6 月",
    description:
      "对比中芯国际与澜起科技的 A/H 股同股不同价：一个 A 股显著溢价，一个 H 股反向溢价，拆解定价权变化。",
    date: "2026-06-05",
    tags: ["A/H股", "中芯国际", "澜起科技", "硬科技"],
  },
  "invest/AH_premium_4way": {
    title: "A/H 溢价光谱：四只 AI 硬件股",
    subtitle: "中芯国际 · 长飞光纤 · 胜宏科技 · 澜起科技",
    description:
      "把四只 AI 硬件 A+H 股排成溢价光谱，观察 A 股溢价、H 股倒挂、流动性、制裁约束与盈利质量的分化。",
    date: "2026-06-05",
    tags: ["A/H股", "AI硬件", "溢价光谱", "港股"],
  },
  "invest/stock-operator-guide": {
    title: "股票作手回忆录 · 互动导读",
    subtitle: "Reminiscences of a Stock Operator · Edwin Lefèvre",
    description:
      "以杰西·利弗莫尔为原型的投机经典导读：读盘、坐功、大势、时机、顺势加仓、止损，以及投机者与人性的永恒博弈。",
    date: "2026-06-06",
    tags: ["利弗莫尔", "投机", "趋势交易", "读盘"],
  },
  "invest/股票作手回忆录_互动导读_点评版": {
    title: "股票作手回忆录 · 点评版导读",
    subtitle: "彼得·林奇点评版 · Jesse Livermore",
    description:
      "基于彼得·林奇点评版梳理全书五幕结构：行情会说话、大势与坐功、希望和恐惧、独立思考、操纵真相与交易法则。",
    date: "2026-06-06",
    tags: ["利弗莫尔", "彼得·林奇", "交易心理", "坐功"],
  },
  "invest/lidaxiao-investment-strategy-guide": {
    title: "李大霄投资战略 · 互动导读",
    subtitle: "《李大霄投资战略》第三版 · 余钱投资与核心资产",
    description:
      "围绕余钱投资、价值投资、远离杠杆、核心资产、股债跷跷板与 2007–2024 市场喊话，整理成八卷互动导读。",
    date: "2026-06-08",
    tags: ["李大霄", "价值投资", "A股", "核心资产", "风险控制"],
  },
  "history/zhougong": {
    title: "周公辅政",
    subtitle: "武王克殷 · 摄政平叛 · 还政成王",
    description:
      "以《史记·周本纪/鲁周公世家》与《尚书》为据的人物谱：周王室核心、三监之乱与殷商遗族。",
    date: "2026-05-20",
    tags: ["先秦", "周公", "史记", "尚书"],
  },
};
