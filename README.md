# MeetupClone

Laravel + MySQL + Nginx + Vite を **Docker Compose** で動かす Meetup 風アプリです。  
Windows / macOS 両対応のローカル開発環境を想定しています。

---

## 技術スタック

- **Backend**: Laravel 12 (PHP 8.3)
- **Frontend**: Vite
- **DB**: MySQL 8
- **Web Server**: Nginx
- **Container**: Docker / Docker Compose

---

## ディレクトリ構成

```text
MeetupClone/
├── backend/              # Laravel アプリ本体
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── storage/
│   └── artisan
├── dockerfiles/
│   └── php.Dockerfile
├── docker-compose.yml
├── nginx.conf
├── start.ps1             # Windows用 初回セットアップスクリプト
└── start.sh              # macOS / Linux / Git Bash用
```

---

## 必要環境

- Docker Desktop
- Docker Compose v2

---

## 初回セットアップ

### Windows

```powershell
.\start.ps1
```

※ 初回のみ、以下を実行してください：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

### macOS / Linux / Git Bash

```bash
chmod +x start.sh
./start.sh
```

---

## アクセス

```text
http://localhost:8080
```

---

## セットアップスクリプトで行われる処理

`start.ps1` / `start.sh` は以下を **自動で実行**します：

- Docker コンテナ起動（build 含む）
- Composer 依存関係インストール
- `.env` の存在確認
- `APP_KEY` 生成
- Laravel キャッシュ完全クリア（sqlite 誤使用防止）
- MySQL が使用されているかの強制チェック
- マイグレーション実行
- Node.js 依存関係インストール
- Vite ビルド
- DB シーディング

---

## 注意事項（開発時の運用について）

- 本プロジェクトでは **ローカルに PHP / Node / MySQL を直接インストールして使用しません**
- 開発時も含め、**すべて Docker コンテナ内で実行**してください

### Artisan コマンド例

```bash
docker compose exec app php artisan migrate
docker compose exec app php artisan tinker
```

### npm / Vite コマンド例

```bash
docker compose run --rm node npm install
docker compose run --rm node npm run build
```

---

## 開発フロー（2回目以降）

初回セットアップ後は、以下のみで開発可能です：

```bash
docker compose up -d
docker compose down
```
