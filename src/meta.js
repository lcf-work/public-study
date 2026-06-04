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
      "晨星的选股框架：经济护城河、盯自由现金流而非会计利润、按行业看门道、用安全边际估值。含 DCF 演示。",
    date: "2026-06-04",
    tags: ["护城河", "财报分析", "估值", "晨星"],
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
