# DeepL 翻译修复与维护

## 原因

旧发布包在 `background.js` 中先调用 `LMT_split_text`，再调用
`LMT_handle_jobs`。2026-11-25 复现时，第二个请求返回 HTTP 200，
但 `result.translations[].beams[].sentences[].text` 是多语言“旧版本”通知。
原解析器将其当作有效译文，因此不会触发 Auto 模式的备用引擎。

## 修改

- 独立可读实现：`extension/dist/js/deepl.js`。
- 经典 MV3 后台通过 `importScripts("deepl.js")` 加载，原 `q()` 转调新适配器。
- 移除该后台中退休的拆句、任务、时间戳和 JSON-RPC 实现。
- POST `https://oneshot-free.www.deepl.com/v1/translate`，发送
  `{ "text": ["待译文本"], "target_lang": "zh-Hans" }`，使用匿名
  `Authorization: None`；英文目标使用 `en-US`。不发送 cookies 或用户凭据。
- 保留原适配器 5000 UTF-16 单元的输入上限；每次请求最多 1500 单元，
  优先按句子或空白拆分，保留分隔符并避免切断代理对，顺序翻译。
- 整次翻译共用 20 秒超时。HTTP 失败、无效响应、空译文、多语言升级通知
  均抛出错误，继续使用现有手动 Error / Auto 备用引擎逻辑；不返回部分结果。
- 弹窗首次等待由 5 秒改为 30 秒，与内联翻译一致，给 DeepL 请求留出完成时间。
  既有的重连重试机制仍存在，未改造为全局请求去重。
- 删除 manifest 中无效的 `background.module` 字段，明确继续使用经典 worker。
  现有 `*://*.deepl.com/` 权限覆盖新端点，无需扩大权限。

这是发布产物维护：仓库未提供原始 Vue/Webpack 构建工程。
不要覆盖整个压缩包；未来同步上游发布包时，应重新检查上述接线。
仓库根目录的原版 ZIP 没有重新打包，修复版应从 `extension/dist` 加载。

## 验证

Node.js 20 或更新版本，无需安装依赖：

```sh
node --test tests/deepl.test.cjs
node --check extension/dist/js/background.js
node --check extension/dist/js/deepl.js
node --check extension/dist/js/content-script.js
```

回归测试读取实际发布后台中的 DeepL 入口和分发器，模拟旧接口 HTTP 200
升级通知、新端点正常结果、异常响应、超时、分段、并发及 Auto 回退。
原实现不能通过升级通知回归用例。

实际网络验证使用公开示例语句，已获得正常中英互译及 1715 字符文本的分段结果。
网络测试不加入默认测试命令，避免自动测试依赖外部服务或不断发送翻译请求。

本次 11 项回归测试全部通过。另在独立临时 Chrome 158 环境加载实际扩展，
确认 popup 正常加载、后台适配器加载、`epCommonPort` 的 `translate` 请求返回
HTTP 200 和中文译文，响应字段保持原契约，观察期间未出现运行时异常。
未逐项人工测试所有 PubMed/PDF 页面按钮。

手工检查：重新加载解压缩扩展并刷新目标网页，在翻译弹窗选择 DeepL，
测试短句、完整摘要和中英两个目标语言；再测试 Auto、标题按钮、划词及 PDF Add text。

## 接口来源和限制

- 实现参考协议形状及迁移说明：
  https://github.com/OwO-Network/DLX/pull/217
- 当前接口行为由上述实际网络测试核验；未复制第三方客户端的应用版本、
  TLS 指纹或设备标识伪装逻辑。
- 此端点属于 DeepL 客户端使用的非公开稳定 API，服务方后续仍可能调整或限流。
  若持续维护困难，应另行接入官方 API 和用户自己的密钥，不能保证匿名端点长期可用。
