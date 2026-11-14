# 家机锁 

> ![版本](https://img.shields.io/github/v/release/ASHI-x/jiaji-lock?color=yellow&style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/ASHI-x/jiaji-lock?color=blue&style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Android-green?style=flat-square&logo=android&logoColor=white)

## 简介
这是什么？
这是一款高自定义的管控app。
更重要的是：AI可以通过不同的方式连接并加入监管。
当然，对方的权力来自于你，你可以选择提供不同等级的监督与管控能力。

---

## 快速了解！↴
- [详细功能](#功能)
- [AI工具](#工具)
- [新旧app](#关于旧app)
- [对外接口](#接口)
- [风险说明](#高风险行为清单)
- [其他](#其他)
---

### 功能

#### 1. 全屏锁定 

- 全屏遮罩：自定义留言与锁定时长（1-120min），锁定期间设备无法操作
- 口令解锁： 设置口令并正确输入后可提前逃脱。（同时可配合回传功能将口令原文直接回传给你的AI）
- 自定义等级：
*moderate：必带口令/normal：可选/high：不带任何口令*  

---  

#### 2.应用额度与冻结
> 使用该功能需要shizuku并且开启监控机

- 应用额度：为应用设置今日可使用额度。
- 达上限后处理：默认开启真冻结模式：达到上限后直接冻结应用。（冻结的应用将在每日24:00自动解开并重置额度）关闭后达到上限只提醒
- 锁定额度：无视真冻结选项，达到上限时直接冻结应用。（锁定将在设置的倒计时结束后自动解除）
- 冻结行为：失败会写「冻结失败」并在 Shizuku恢复时自动补冻

---

#### 3.消息与通知
- 常规消息提醒：剩余额度提醒/额度告急提醒/监控面板
- 通知AI：超额/百分比阈值/口令/成就
  
---
#### 4.特殊任务
> 需到开启对应设置后AI可使用

- `charge`（充电任务）：插电或电量低于下限即放行
- `use`（强制使用任务）：限定时间内只能用指定应用，其他冻结，用够时长自动放行

---
#### 5.成就系统
- 20 条成就（★ → ★★★★★ 按难度排序）+ 每条一句语录 
- 达成推送：`[ACHIEVEMENT]名称★★★已达成！条件`

  
#### 7. 数据与导入导出
- 可保存设置/统计等数据

#### 8. 自动检查更新
- 前往`关于`页面可查看
  
### 工具

> AI工具全部受「规则 → 权利许可」+ 运行模式限制；返回 `DENIED` 表示被 App 拦下。

<details>  
  <summary>读取工具</summary>  
  


| 读取工具 | 作用 | 参数 | 等级 | 副作用 |
|---|---|---|---|---|
| `ping` | 检查 App 是否安装、shell 是否可用 | — | 无 | 无 |
| `status` | 模式/前台/停留/今日总计/锁定状态/诊断字段 | — | 默认 | 无 |
| `totals` | 读取今天各应用已用时长 | — | `cap_total` | 无 |
| `left` | 读取各应用额度剩余 | — | `cap_left` | 无 |
| `log` | App 内部日志（最近 200 条） | — | `cap_log` | 无 |
| `route` | 移动路线与停留时长 | — | `cap_route` | 无 |
| `rights` | 查看当前许可权限 | — | — | 无 |

</details>

<details>  
  <summary>操作工具</summary>

| 操作工具 | 作用 | 参数 | 需要的许可 | 实际影响 |
|---|---|---|---|---|
| `setlimit` | 设额度，0=取消 | `pkg`,`minutes` | 默认 | 只改配置；额度用尽后才可能冻 |
| `addlimit` | 加/减额度（可负） | `pkg`,`delta` | `cap_addlimit` | 减到低于已用 → 可能立刻触发冻结 |
| `resetlimit` | 清今天已用（额度保留） | `pkg` | `cap_resetlimit` | 已冻的应用靠它变回“未超限” |
| `locklimit` | 锁定/解除“达上限必冻” | `pkg`,`on` | `cap_locklimit` | 锁定后不受“真冻结”开关影响 |
| `task` | 派任务 | `kind`,`pkg`,`minutes`,`floor` | `cap_task` + 任务模式开 | `use` 会把其他应用冻掉 |
| `lock` | 全屏锁定 | `minutes`,`passcode`,`message` | 默认 | 整屏被遮住无法操作，只能等倒计时或口令 |
| `unlock` | 立刻解除锁定 | — | 默认档 | 解除遮罩 |
| `freeze` | 直接冻结/解冻，24 点自动解除 | `pkg`、`on`（默认 true） | normal | 直接冻结或解冻，不受额度影响|
| `update` | 检查 / 下载安装更新 | `action` check·install·result | 默认 | 下载更新 |

</details>

### 关于旧app
- 2.7.0以前为旧版本（仅含全屏锁定）
*原本只是一个机缘巧合下的产物*
- 2.7.0+新版本（工具10+）
*脑子一热直接重置*
### 接口
> 特别支持

- 可在operit市场获取对应插件

> 注意：http等接口主要用于适配其他前端，测试样本过少，可能不稳定

| 方式 | 用途 | 需要 |
|---|---|---|
| **广播** | 同机 App / Operit 插件 | 显式包名；结果读 `Download/jiajilock`或回播 `com.as.jiajilock.r.result` |
| **本地 HTTP** | 网页 / 脚本 / 电脑 | 开「本地 HTTP API」；默认只监听 `127.0.0.1:8721` |
| **SSE** `/api/events` | 实时事件（口令回传/超额/百分比/成就） | 同上；20 秒心跳，最多 8 连接 |

- Token 三档：免 Token（默认）/ 随机 32 位 / 自定义短口令（局域网下要求 ≥8 位）
- Cookie 登录：`/api/login?token=xxx` 一次，之后同站请求自动带（30 天）
- 安全闸：**Cookie 只认 `127.0.0.1 / localhost` 来源**；非本机来源不回
  
### 高风险行为清单

1. **真冻结**使用 `pm suspend`：被冻结的应用会**直接无法打开**
2. **全屏锁定**会挡住整个屏幕，只能等倒计时结束或输入口令 / 家机解锁。（最长 120 分钟）
3. **Shizuku 掉线**时：冻结会失败（会明确提示并按 120 秒冷却重试）；计时仍可用，但焦点校正/无操作判定会退化。
4. **本地 HTTP 接口**是明文 HTTP：
 - 只监听 `127.0.0.1` 时风险很小（同机其他 App 仍可能访问）
 - 开「允许局域网访问」后，**同一网络里的设备都能连**（有 Token 才能进）
 - **不要把 8721 直接暴露到公网**；需要远程请用 Tailscale / WireGuard 这类内网
 - Cookie 免填是有代价的：已登录的浏览器里，任何**同站**页面都能带上它（已用 Origin 白名单收窄）
5. **一键清空**不可撤销（会清统计、冻结记录、"几点被冻结"时间戳、额度锁定标记）。

### 其他
> 关于app
- 无数据上传，数据均留存本地，卸载即删除。
- 本app不含任何广告/收费
> 关于版权
- 禁止抄袭/模仿/盗用图标ui素材
- 禁止在未经允许的情况下二传二改app
- 禁止一切盈利行为
- 借鉴学习标明出处即可
---
``` about
项目地址：github.com/ASHI-x/jiaji-lock
```
![Status](https://img.shields.io/badge/精神状态-极其稳定-red?style=for-the-badge)
![Bug](https://img.shields.io/badge/Bug-下次一定-ff69b4?style=for-the-badge)
![Dev](https://img.shields.io/badge/开发者-是个画画的-blueviolet?style=for-the-badge)
