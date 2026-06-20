# 八字 x 姓名合參

八字命盤與姓名五格合參工具。排盤、五格、歷史紀錄與基礎分析在瀏覽器本地完成；可選擇啟用進階解讀，依命盤摘要產生更完整的文字說明。

## 功能

- **西曆自動排盤** — 依節氣資料庫（1900–2100）計算四柱八字
- **手動輸入四柱** — 直接選擇天干地支
- **上傳命盤圖** — 本地儲存圖片並手動確認四柱
- **五行 / 十神 / 強弱 / 刑沖合害 / 大運 / 流年流月**
- **神煞分析** — 27 種神煞規則
- **姓名五格** — 支援複姓，含 81 數理吉凶 + 125 三才配置
- **姓名字義 / 五行** — 9500+ 字筆劃、五行、字義
- **納音五行** — 60 甲子完整資料
- **歷史紀錄** — IndexedDB 本地儲存推演結果
- **進階解讀（選用）** — 依命盤摘要產生白話文字說明
- **PDF 匯出** — 圖文命盤總結與白話分析

## 資料庫架構

### 靜態 JSON（`public/data/`）

| 檔案 | 內容 |
|------|------|
| `strokes.json` | ~9575 字康熙筆劃（cnchar-data） |
| `wuge-luck.json` | 五格 1–81 數理吉凶 |
| `sancai.json` | 125 種三才配置 |
| `nayin.json` | 60 甲子納音 |
| `jiazi.json` | 60 甲子完整（納音、旬空、生肖） |
| `solar-terms.json` | 1800–2200 節氣（401 年 × 24 節） |
| `compound-surnames.json` | 53 組複姓 |
| `char-wuxing.json` | ~9582 字五行 |
| `name-meanings.json` | 11000+ 姓名字義（cnchar 釋義 + 全字庫補齊） |
| `shensha.json` | 27 種神煞規則 |
| `relations.json` | 六沖、六合、六害、三刑、三合 |
| `tengods.json` | 十神完整說明 |
| `patterns.json` | 17 種八字格局 |
| `wuxing.json` | 五行生克、臟腑、旺衰 |
| `stems-branches.json` | 十天干、十二地支特性 |
| `zodiac.json` | 12 生肖 |
| `daymaster.json` | 十天干日主特性 |

### IndexedDB（瀏覽器本地）

| Store | 用途 |
|-------|------|
| `records` | 命盤推演歷史紀錄 |
| `customStrokes` | 使用者自訂筆劃 |
| `chartImages` | 上傳的命盤圖片 |
| `settings` | 應用設定與解讀設定 |

## 啟動

```bash
npm install
npm run generate-data
npm run dev
```

開啟 http://localhost:5173

## 建置

```bash
npm run build
```

建置前會自動執行 `npm run generate-data` 產生 JSON 資料庫。

所有查詢均有內建 fallback（`src/lib/builtinData.ts`）：納音、五格 81 數、三才 125 組、格局、日主、生肖等，即使 JSON 尚未載入也不會出現「待查」或空白結果。

## 資料庫管理

點擊頁首「資料庫管理」可：
- 查看各資料庫條目統計
- 新增自訂筆劃（未收錄的姓名用字）

## 技術棧

- React + TypeScript + Vite + Tailwind CSS
- IndexedDB（idb）
- cnchar-data（筆劃資料來源）
- jsPDF + html2canvas（PDF 匯出）
