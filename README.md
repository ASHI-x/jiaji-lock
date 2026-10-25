# 家机锁 

> ![版本](https://img.shields.io/github/v/release/ASHI-x/jiaji-lock?color=yellow&style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/ASHI-x/jiaji-lock?color=blue&style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Android-green?style=flat-square&logo=android&logoColor=white)
## 简介

给予你的机真正的管控能力  

---
#### *新旧 App 区分*

> 更多的功能请使用完全重置的新app
> 在旧app的基础上重置了全新的app并添加了更多功能，且高度自定义满足更多不同需求

<details>  
  
<summary> 展开对比 </summary> 

  *operit插件包id≠包名*

  | | **旧版** | **新版** |
  |---|---|---|
  | 包名 | `com.ds.barrier` | **`com.as.jiajilock`** |
  | 能力 | 仅全屏锁定遮罩 + 倒计时 + 口令 | 计时、额度、冻结、任务、成就、HTTP/SSE、数据导入导出 |
  | 工具对比 | 工具只有 4 个（`lock/unlock/is_locked/install`） | 工具有 10+ 个（`status/totals/left/log/route/setlimit/addlimit/resetlimit/locklimit/task/lock/unlock`） |

</details>  

---

<details>  
  <summary>小机工具说明</summary>  
  
> 全部受「规则 → 权利许可」+ 运行模式限制；返回 `DENIED` 表示被 App 拦下。

| 低影响工具 | 作用 | 参数 | 需要的许可 | 副作用 |
|---|---|---|---|---|
| `ping` | 检查 App 是否安装、shell 是否可用 | — | 无 | 无 |
| `status` | 模式/前台/停留/今日总计/锁定状态/诊断字段 | — | 默认档 | 无 |
| `totals` | 今天各应用已用时长 | — | `cap_total` | 无 |
| `left` | 各应用额度剩余 | — | `cap_left` | 无 |
| `log` | App 内部日志（最近 60 条） | — | `cap_log` | 无 |
| `route` | 移动路线与停留时长 | — | `cap_route` | 无 |

| 高影响工具 | 作用 | 参数 | 需要的许可 | 实际影响 |
|---|---|---|---|---|
| `setlimit` | 设额度，0=取消 | `pkg`,`minutes` | 默认档 | 只改配置；额度用尽后才可能冻 |
| `addlimit` | 加/减额度（可负） | `pkg`,`delta` | `cap_addlimit` | 减到低于已用 → 可能立刻触发冻结 |
| `resetlimit` | 清今天已用（额度保留） | `pkg` | `cap_resetlimit` | 已冻的应用靠它变回“未超限” |
| `locklimit` | 锁定/解除“达上限必冻” | `pkg`,`on` | `cap_locklimit` | 锁定后不受“真冻结”开关影响 |
| `task` | 派任务 | `kind`,`pkg`,`minutes`,`floor` | `cap_task` + 任务模式开 | `use` 会把其他应用冻掉 |
| `lock` | 全屏锁定 | `minutes`,`passcode`,`message` | 默认档 | **整屏被遮住**，只能等倒计时或口令 |
| `unlock` | 立刻解除锁定 | — | 默认档 | 仅解除遮罩 |

- 如使用operit插件请以插件介绍为主
</details>  

### 详细功能

> 可选择不同模式：

<img width="1072" height="498" alt="mode" src="https://github.com/user-attachments/assets/8a64f030-469c-4a58-9d76-e08b4977f35e" />


barrier only：与旧版功能无大差  
monitoring：全部完整功能  

---  

#### 1. 全屏锁定(旧版本不包含选择)  

- 遮罩 + 倒计时（1–120 分钟）+ 自定义留言
- 可选**解锁口令**；输对口令可提前解锁，并把口令**回传**给机（可配聊天窗口）
- 机可随时远程解锁
  
> 可根据个人需求选择等级
<img width="1079" height="170" alt="level" src="https://github.com/user-attachments/assets/41f835ce-2ef7-428d-a40f-32fedf875beb" />
*对应含义：必带口令/可选/不带任何口令*  

---  

#### 2. 额度与冻结
- 给任意应用设额度（分钟，0=取消）、加/减额度、重置今日已用
- 达上限按策略处理：
- **锁定额度**（`locklimit`）：达上限必冻，直到解除锁定或跨天
- **冻结记账只在真的冻成功后写**；失败会写「冻结失败」并在 Shizuku 恢复时**自动补冻**
- 跨天重置：清统计、解冻自动冻结、清额度锁定
---
#### 3.计时与统计与监控机
> 用于统计时长并计算额度，统计存在一定误差，可自行选择是否使用（使用2必须使用3）
- 数据源：`UsageStatsManager` 前台事件
- 可在`通知`打开实时监控面板
---
#### 4. 任务模式
- 总开关：关掉后任何任务通道一律 `DENIED`
- `charge`（充电任务）：插电或电量低于下限即放行
- `use`（强制使用任务）：限定时间内只能用指定应用，其他冻结，用够时长自动放行
---
#### 5. 成就系统
- 20 条成就（★ → ★★★★★ 按难度排序）+ 每条一句语录 
- 达成推送：`[ACHIEVEMENT]名称★★★已达成！条件`
---
#### 6. 对外接口  

> 注意：如只使用operit且无特殊需求则无需使用http，此接口主要用于适配其他前端，测试样本过少，可能不稳定

| 方式 | 用途 | 需要 |
|---|---|---|
| **广播** | 同机 App / Operit 插件 | 显式包名；结果读 `Android/data/.../files/rights/*.txt`（需 shell 身份）或回播 `com.as.jiajilock.r.result` |
| **本地 HTTP** | 网页 / 脚本 / 电脑 | 开「本地 HTTP API」；默认只监听 `127.0.0.1:8721` |
| **SSE** `/api/events` | 实时事件（口令回传/超额/百分比/成就） | 同上；20 秒心跳，最多 8 连接 |

- Token 三档：免 Token（默认）/ 随机 32 位 / 自定义短口令（局域网下要求 ≥8 位）
- Cookie 登录：`/api/login?token=xxx` 一次，之后同站请求自动带（30 天）
- 安全闸：**Cookie 只认 `127.0.0.1 / localhost` 来源**；非本机来源不回
  
---
#### 7. 数据与导入导出
- 可保存设置/统计等数据
---
#### 8. 自动检查更新
- 前往`关于`页面可查看
  
---
**高风险行为清单**
1. **真冻结**使用 `pm suspend`：被冻结的应用会**直接无法打开**
2. **全屏锁定**会挡住整个屏幕，只能等倒计时结束或输入口令 / 家机解锁。（最长 120 分钟）
3. **Shizuku 掉线**时：冻结会失败（会明确提示并按 120 秒冷却重试）；计时仍可用，但焦点校正/无操作判定会退化。
4. **本地 HTTP 接口**是明文 HTTP：
 - 只监听 `127.0.0.1` 时风险很小（同机其他 App 仍可能访问）
 - 开「允许局域网访问」后，**同一网络里的设备都能连**（有 Token 才能进）
 - **不要把 8721 直接暴露到公网**；需要远程请用 Tailscale / WireGuard 这类内网
 - Cookie 免填是有代价的：已登录的浏览器里，任何**同站**页面都能带上它（已用 Origin 白名单收窄）
5. **一键清空**不可撤销（会清统计、冻结记录、"几点被冻结"时间戳、额度锁定标记）。
6. 本工具**不含广告、不联网上传数据**；所有设置与统计都在本机 `SharedPreferences` 与本地文件里。卸载即删除。
    
---
``` about
项目地址：github.com/ASHI-x/jiaji-lock
SHA-256：0f6c8488e0c7f377f7e8e41eb1c7675bcf5f58f0b83c0b76755550a708c874cd
```
![Status](https://img.shields.io/badge/精神状态-极其稳定-red?style=for-the-badge)
![Bug](https://img.shields.io/badge/Bug-下次一定-ff69b4?style=for-the-badge)
![Dev](https://img.shields.io/badge/开发者-是个画画的-blueviolet?style=for-the-badge)
