# MCGS Translate

> MCGS 昆仑通态触摸屏多语言翻译工具 — 上传 XML 或粘贴文本，自动翻译中→英，下载即可导回 MCGS。

## 为什么做

MCGS 触摸屏的多语言翻译目前靠工程师在 MCGS 里逐条手填，一个项目 2000+ 条。这个工具自动化翻译流程，**不上传服务器，不依赖 AI API**（DeepL 可选），纯浏览器本地运行。

## 安装和运行

### 1. 安装 Node.js

先去 [nodejs.org](https://nodejs.org) 下载安装（选 LTS 版本，一路点下一步就行）。

装完后打开终端（CMD 或 PowerShell），确认装好了：

```
node --version    # 应该显示 v18 或更高
npm --version     # 应该显示 v9 或更高
```

### 2. 下载代码

```
git clone https://github.com/zjr0601/mcgs-translate.git
cd mcgs-translate
```

或者直接下载 ZIP 解压进去。

### 3. 安装依赖（只需一次）

```
npm install
```

### 4. 启动

```
npm run dev
```

打开浏览器访问 **http://localhost:3000** 就能用了。

### 5. 停止

终端按 `Ctrl + C`。

## 怎么用

```
粘贴文本/上传 XML → 自动翻译 → 表格编辑 → 下载 XML → 导回 MCGS
```

### 三种导入方式

| 方式 | 说明 |
|------|------|
| 上传 XML | 拖拽 `工程多语言信息.xml` |
| 从文本创建 | 粘贴连续文本，换行或分号分隔，自动生成 XML |
| 从文本追加 | 在已有 XML 基础上批量追加新条目 |

### 翻译引擎

三层递进，36001 项目实测命中率 ~94%：

1. 内置固定短语 130 条 → 精确匹配
2. 拼接规则 15 条 → 正则 + Token 组合
3. 原子 Token 120 个 → 最长前缀匹配拼接
4. DeepL（可选填 Key 兜底）

术语库来自 8 个 PLC 项目命名规范，不是从已有翻译扒词。覆盖伺服/气缸/电机/IO 传感器/警报/UI 标签。

### 学习 & 管理

- 上传已翻译 XML 自动学习术语
- 手动改翻译自动记忆到本地
- 术语库管理面板：搜索 / 编辑 / 删除 / 清空

### 编辑功能

- 表格内编辑翻译
- 新建行 / 修改 ID / 删除行
- 搜索过滤
- 分页浏览

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js 16 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| 部署 | Vercel 一键 |
| 存储 | localStorage（零服务端成本） |

## 目录结构

```
src/
├── data/
│   ├── tokens.ts           # 120 个原子 Token（设备前缀/伺服/气缸/电机/IO传感器）
│   ├── rules.ts            # 15 条拼接规则
│   └── fixed-phrases.ts    # 130 条固定短语
├── lib/
│   ├── translator.ts       # 三层翻译引擎
│   ├── tokenizer.ts        # 中文最长前缀匹配分词
│   ├── parser.ts           # XML 解析
│   ├── generate.ts         # XML 生成
│   ├── glossary.ts         # 用户术语库 (localStorage)
│   └── deepl.ts            # DeepL API
├── app/
│   ├── page.tsx            # 主页面
│   └── api/                # API routes
└── components/
    ├── FileDrop.tsx         # 拖拽上传
    ├── EditorTable.tsx      # 双语编辑器
    ├── StatsBar.tsx         # 翻译统计
    └── GlossaryPanel.tsx    # 术语库管理
```

## Vercel 部署

```bash
# 1. 推 GitHub → 2. Vercel 导入 → 3. Deploy
# 可选环境变量: DEEPL_API_KEY
```

## License

MIT
