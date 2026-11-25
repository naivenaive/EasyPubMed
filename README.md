# EasyPubMed · DeepL 修复版

本仓库是 [naivenaive/EasyPubMed](https://github.com/naivenaive/EasyPubMed) 的维护 Fork，基于原版 `0.1.24`，目前主要修复 DeepL 翻译失效的问题。原项目的完整功能介绍请查看[原作者 README](https://github.com/naivenaive/EasyPubMed#readme)。

## 修复了什么

- **修复 DeepL 返回“您正在使用旧版本的 DeepL”**：将已失效的旧请求方式切换到新的翻译端点。
- **支持长摘要分段翻译**：保留原有单次输入上限，较长文本自动分段处理。
- **处理无效翻译结果**：升级提示、空结果和失败响应不再被当成正常译文。
- **延长翻译弹窗等待时间**：从 5 秒调整为 30 秒，减少正常请求尚未完成就被重发的情况。

支持英文与简体中文作为翻译目标，不需要填写 DeepL API Key。修复过程、测试与接口限制见 [DeepL 维护说明](docs/deepl-maintenance.md)。

## 安装修复版

### 1. 获取本仓库

在本仓库页面点击 **Code → Download ZIP**，下载后解压；也可以使用 Git：

```sh
git clone https://github.com/complex4died/EasyPubMed.git
```

**要加载的是本仓库中的 `extension/dist` 文件夹。** 这一层包含 `manifest.json`。
仓库根目录保留的 `EasyPubMedicine_0.1.24.zip` 是原作者的旧发布包，未包含本次修复，请勿用它安装修复版。

### 2. 在 Edge 或 Chrome 中加载

1. 打开扩展管理页面：Edge 地址栏输入 `edge://extensions`，Chrome 输入 `chrome://extensions`。
2. 如果已经安装原版 EasyPubMed，先关闭原版的开关，避免两份扩展同时运行。建议先停用，不必卸载。
3. 打开 **开发人员模式**。
4. 点击 **加载解压缩的扩展**（Load unpacked），选择 `extension/dist`。
5. 加载完成后，刷新已经打开的 PubMed 网页。

原版的收藏与设置通常不会自动迁移到本地修复版；如需移除原版，请先备份文献数据。

## 如何测试和使用

1. 在 PubMed 网页中选中一句英文，按默认快捷键 **D** 打开翻译弹窗。
2. 进入 **Translate**，将 **Service** 设为 **DeepL**，目标语言选择简体中文。
3. 点击 **Translate**，确认返回正常中文译文。
4. 再尝试完整摘要、标题旁的翻译按钮，或选中文字后按默认快捷键 **T** 进行内联翻译。

测试时请明确选择 **DeepL**，以确认修复效果；日常使用也可以选择 **Auto**，按设置的引擎顺序尝试翻译。

## 更新本地版本

使用 Git 下载的用户，可在仓库文件夹内运行：

```sh
git pull --ff-only
```

使用 ZIP 下载的用户，可重新下载并更新本地文件。随后在扩展管理页面点击修复版的 **重新加载**，再刷新 PubMed 网页，无需反复卸载安装。

## 如果仍然显示 Error

- 确认只启用了修复版，并且加载目录是 `extension/dist`。
- 重新加载扩展后，也要刷新正在使用的网页。
- 先用一句短英文、目标语言选简体中文测试。过长文本可拆开后再试；当前输入上限为 5000 个 UTF-16 单元，普通中英文字符通常各占一个单元。
- 网络失败、超时或服务限流也可能显示 `Error`。可稍后重试；持续失败时，请在[本 Fork 的 Issues](https://github.com/complex4died/EasyPubMed/issues) 中提供浏览器版本、复现步骤和不含敏感信息的示例文本。

翻译会将所选文本发送给 DeepL。当前使用的匿名端点不是官方承诺稳定的开发者 API，后续仍可能调整或限流。

## 原项目与贡献

- **原作者**：[naivenaive（田振）](https://github.com/naivenaive)，感谢其开发和开源 EasyPubMed。
- **本 Fork 维护**：[complex4died](https://github.com/complex4died)。
- **AI 辅助开发**：OpenAI Codex 协助代码审阅、DeepL 故障排查与修复、回归测试和浏览器验证。

原项目采用 [MIT License](LICENSE)，本仓库保留原版权声明和许可证。
