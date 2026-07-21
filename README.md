# MT WYCKOFF · Professional Trading Textbook

面向 Cloudflare Pages 的 Wyckoff 专业交易课程网站。课程包含六个阶段、二十四章，并保留原始教材中的全部章节正文、33 张课程图表、19 张研究表格、搜索索引与章节锚点。

## 本地开发

```bash
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

## 构建与校验

```bash
npm run build
npm run audit
npm run validate
```

静态成品输出到 `dist/`。构建前会自动清理旧的哈希资源；`audit` 会检查全部章节、内容、图像、搜索锚点、站内链接、重复 ID 与登录表单安全边界。

## 视觉回归

```bash
npm run preview -- --host 127.0.0.1
npm run visual
```

视觉回归覆盖 1440、1280、1024、768、390 与 320 像素视口，以及课程、阶段、章节、抽屉和图表状态；截图输出到 `review/screenshots/`。

## Cloudflare Pages

- Build command：`npm run build`
- Build output directory：`dist`
- Node.js：22

项目也包含 `wrangler.toml`，可使用 Wrangler 部署静态构建。

## 登录边界

当前 `/login/` 是视觉和路由原型，没有连接后端，也不构成内容保护。正式上线前，应在 Cloudflare Workers 或其他身份服务中实现服务端会话与授权，并将 `/course/`、`/phase/*`、`/chapter/*` 放在认证边界之后。

## 课程进度

现阶段阅读进度保存在浏览器 `localStorage` 中。接入账户系统后，可以保持相同数据结构并迁移到用户账户。

## 字体

项目自托管 Noto Serif SC、Noto Sans SC、IBM Plex Sans 与 IBM Plex Mono 的实际字重。字体许可文件位于 `licenses/`。
