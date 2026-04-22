# FP3級合格アプリ 開発記録

## 概要

**目的：** 1か月でFP3級に合格するためのスマホ対応学習Webアプリを作成する  
**期間：** 2026年4月21日（1セッションで完成）  
**公開URL：** https://oc4201124-cloud.github.io/fp3-study-app/  
**リポジトリ：** https://github.com/oc4201124-cloud/fp3-study-app

---

## 使用した教材データ

### 1. PFキャンプ YouTube字幕（41本）
- **取得方法：** `yt-dlp` で日本語自動字幕（.vtt形式）を一括ダウンロード
- **プレイリスト：** https://www.youtube.com/playlist?list=PLQQS8fV84KTMr5pQ_-bGdPIfdJzY8OV3B
- **総文字数：** 約31万文字
- **内容：** FP3級の6分野を網羅した爆速講義シリーズ

| 動画番号 | 分野 |
|---------|------|
| #1〜#9 | ライフプランニングと資金計画 |
| #10〜#13 | リスク管理（保険） |
| #14〜#21 | 金融資産運用 |
| #22〜#28 | タックスプランニング |
| #29〜#35 | 不動産 |
| #36〜#41 | 相続・事業承継 |

### 2. FP協会 公式過去問（3回分）
- **出典：** https://www.jafp.or.jp/exam/mohan/
- **内容：**
  - 学科試験：2024年1月・2024年5月・2025年5月
  - 実技試験：2024年1月・2024年5月・2025年5月
- **形式：** テキスト抽出可能なPDF（PyMuPDF で抽出）

### 3. 有料教材PDF（画像スキャン形式）
- Premium A〜F（模擬試験 6セット）
- FP3級学科一問一答（78ページ）
- ※今回は画像PDFのため主要処理から除外（将来的にOCR対応予定）

---

## 問題データ処理フロー

```
①VTT字幕取得（yt-dlp）
    ↓
②テキストクリーニング（scripts/process_vtt.py）
    ↓ 重複除去・タイムスタンプ除去
③Claude APIで○×問題を自動生成（scripts/generate_questions.py）
    ↓ claude-haiku-4-5 / 1動画8問
④過去問PDFからテキスト抽出（scripts/extract_kakomon.py）
    ↓ PyMuPDF / 全角→半角正規化 / 正解マーキング
⑤全データを統合（scripts/merge_data.py）
    ↓
⑥questions.json として webapp/public/data/ に配置
```

---

## 生成された問題数

| データソース | 問題数 | 形式 |
|------------|--------|------|
| 過去問・学科（4回分：202305・202401・202405・202505） | 182問 | ○×・三答択一 |
| 過去問・実技（5回分：202305〜202505） | 100問 | 実技記述 |
| AI生成（VTT字幕41本から） | 328問 | ○× |
| **合計** | **610問** | |

---

## アプリ構成

### 技術スタック
- **フレームワーク：** Next.js 16 (App Router / Static Export)
- **スタイリング：** Tailwind CSS v4
- **言語：** TypeScript
- **データ保存：** localStorage（進捗管理）
- **ホスティング：** GitHub Pages（gh-pagesブランチ）

### ファイル構成
```
webapp/
├── src/
│   ├── app/
│   │   ├── page.tsx          # ホーム画面
│   │   ├── quiz/page.tsx     # クイズ画面
│   │   ├── calendar/page.tsx # 30日カレンダー
│   │   ├── review/page.tsx   # 苦手問題
│   │   └── progress/page.tsx # 進捗確認
│   ├── components/
│   │   └── BottomNav.tsx     # 下部ナビゲーション
│   └── lib/
│       ├── types.ts          # 型定義
│       ├── storage.ts        # localStorage操作
│       ├── questions.ts      # 問題データ読み込み
│       └── basepath.ts       # GitHub Pages用パス補完
├── public/
│   └── data/
│       ├── questions.json    # 全610問
│       └── curriculum.json  # 30日カリキュラム
└── next.config.ts            # basePath設定
```

### 画面一覧

| 画面 | URL | 機能 |
|------|-----|------|
| ホーム | `/` | 残り日数・今日の学習・分野別クイズ |
| クイズ | `/quiz` | ○×・三答択一・10問1セット・解説 |
| 30日カレンダー | `/calendar` | 全30日のカリキュラムと進捗 |
| 苦手問題 | `/review` | 間違えた問題の一覧・まとめ復習 |
| 進捗 | `/progress` | 正答率グラフ・統計・リセット |

---

## 30日間カリキュラム

| 日程 | 分野 | テーマ |
|------|------|--------|
| Day 1〜2 | ライフプランニング | FPの役割・6つの係数 |
| Day 3 | ライフプランニング | 医療保険制度 |
| Day 4 | ライフプランニング | 労災・雇用保険 |
| Day 5〜6 | ライフプランニング | 公的年金①② |
| Day 7〜8 | リスク管理 | 生命保険・損害保険 |
| Day 9 | リスク管理 | 第三分野保険 |
| Day 10 | 金融資産運用 | 金融経済の基礎 |
| Day 11 | 金融資産運用 | 株式投資 |
| Day 12〜13 | 金融資産運用 | 債券・投資信託・ポートフォリオ |
| Day 14〜17 | タックスプランニング | 所得税・各種控除・住宅ローン控除 |
| Day 18〜21 | 不動産 | 登記・借地借家法・建築基準法・税金 |
| Day 22〜25 | 相続・事業承継 | 相続税・贈与税・各種特例 |
| Day 26〜28 | 総復習 | 学科過去問演習（分野別） |
| Day 29 | 総復習 | 実技過去問演習 |
| Day 30 | 総復習 | 最終確認・模擬試験 |

---

## デプロイ手順（再デプロイ時）

```bash
cd E:/2026/fp3app/webapp

# 1. 問題データを最新化（必要時）
cd ../
python3 scripts/merge_data.py

# 2. ビルド
cd webapp
npm run build

# 3. .nojekyll を追加（GitHub Pages のJekyll対応）
touch out/.nojekyll

# 4. デプロイ
npx gh-pages -d out -b gh-pages --dotfiles
```

---

## 今後の改善候補

- [ ] 教材PDF（Premium A〜F）のOCR処理による問題追加
- [ ] 問題解説の充実（AI生成問題に詳細解説を付与）
- [ ] PWA対応（オフライン利用・ホーム画面アイコン）
- [ ] 試験日設定機能（カウントダウン）
- [ ] 問題の難易度タグ付け

---

## トラブルシューティング記録

| 問題 | 原因 | 解決策 |
|------|------|--------|
| スマホで開けない | devサーバーがlocalhost限定 | GitHub Pagesに公開 |
| CSSが読み込まれない | `_next`フォルダをJekyllが除外 | `.nojekyll`ファイルを追加 |
| 「読み込み中」が続く | `fetch`にbasePath未付与 | `dataUrl()`ヘルパー関数で補完 |
| 復習ボタンが押せない | Reactステートの非同期更新バグ | `useRef`で最終結果を確実保持 |
| ○×ボタンが見えにくい | ボタンが小さく色が薄い | 2列グリッド・`text-5xl`・色を濃く |
