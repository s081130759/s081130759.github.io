# Personal Activity Site

活動記録を掲載する、HTML/CSS/JavaScriptだけの個人ホームページです。ビルド作業や外部ライブラリは不要です。

## ローカル表示

```bash
cd /Users/sho/Documents/Codex/personal-activity-site
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## 内容を変更する

- 名前や紹介文: `index.html`
- 色、余白、レイアウト: `styles.css` 冒頭のCSS変数
- 活動記録: `index.html` の `<article class="log-card">` を複製
- 絞り込みやテーマ切替: `script.js`
- ブラウザゲーム: `games/invader/`
- ゲームの制作記録: `games/invader/DEVLOG.md`

## GitHub Pagesで公開する

1. GitHubで公開リポジトリを作成します。
2. このフォルダ内のファイルをリポジトリへ追加します。
3. GitHubの `Settings > Pages` を開きます。
4. `Deploy from a branch`、`main`、`/(root)` を選択します。
5. 表示された `https://ユーザー名.github.io/リポジトリ名/` を開きます。

独自ドメインはPages設定の `Custom domain` に入力し、ドメイン会社側のDNSを案内どおり設定します。

## レンタルサーバーで公開する

ロリポップ！、エックスサーバー、ConoHa WING、さくら等では、FTPソフトまたは各社のファイルマネージャーを使用します。通常は公開フォルダへ `index.html`、`styles.css`、`script.js` を同じ構成でアップロードします。

契約先により公開フォルダ名が異なるため、契約後のマニュアルを確認してください。
