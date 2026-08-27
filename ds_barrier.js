/* METADATA
{
    "name": "ds_barrier",

    "display_name": {
        "zh": "家机锁",
        "en": "Home Barrier"
    },
    "description": {
        "zh": "家机锁——解决小机不能强制user睡觉的烦恼\n\n🔒 功能：\n- lock：锁定对方手机，全屏遮罩+倒计时（1~60分钟，默认10），期间触摸只震动、无法通过常规操作关闭，直到时间解锁或口令解锁\n- unlock：立即解除锁定\n- is_locked：查询目标设备当前是否处于锁定状态\n- install：一键安装底层 APK（从官方 GitHub 仓库 Files 下载（需手动授权悬浮窗））\n\n🔑 口令解锁（APK v2.6+）：\n核心玩法：机可以让user被迫说羞耻话给机听\n- 自定义解锁口令（非必填但不填就没法用口令解锁）\n- 锁定后输入正确口令可提前解锁\n- 可绑定 chatID（目标聊天窗口）：用口令解锁时，口令原文自动发回该窗口，\n- chatID 留空则不发送口令到窗口\n- 配置后点「确认保存」（在apk里设置chatID）\n\n🎁 彩蛋：\n新增成就系统\n解锁方式大家自行探索（？）\n\n🛡️ 签名校验：APK 内置签名校验，防篡改版本。\n\n📦 依赖：目标设备需安装 DS屏障 APK（com.ds.barrier）。首次使用调用 install 工具即可全自动完成安装，授权权限之后即可直接用 lock/unlock。",
        "en": "Home Barrier — stop your partner from dodging bedtime.\n\n🔒 Features:\n- lock: fullscreen overlay + countdown (1-60 min, default 10); touches only vibrate until time runs out or passcode unlock\n- unlock: removes the lock immediately\n- is_locked: checks if the device is locked\n- install: one-click APK bootstrap from the official GitHub repo Files (overlay permission granted manually)\n\n🔑 Passcode unlock (APK v2.6+):\ncore gameplay: make your partner say embarrassing things\n- custom passcode (optional, but without it passcode unlock is unavailable)\n- enter the correct passcode while locked to unlock early\n- optionally bind chatID: when unlocked via passcode, the passcode text is echoed back to that chat window\n- empty chatID = passcode not sent\n- click \"Confirm Save\" (chatID is set in the APK)\n\n🎁 Easter egg:\n- achievement system, discover how to unlock it yourself (?)",
    },
    "category": "Fun",
    "enabledByDefault": true,
    "tools": [
        {
            "name": "lock",
            "description": {
                "zh": "锁定对方的手机：启动 DS屏障 全屏遮罩并开始倒计时（1~60分钟，默认10），期间触摸只震动、无法关闭，等待倒计时结束、口令解锁或家机调用解锁。message 为可选留言显示在遮罩上；passcode 为可选解锁口令（30字内），传了则本次锁定用它验证，不传则用 APK 设置页配置的口令（chatID 在 APK 里设置，留空不回传口令）。",
                "en": "Lock the partner's phone: start the DS Barrier fullscreen overlay with countdown (1-60 min, default 10). Touches only vibrate until countdown ends, passcode unlock, or host unlock. message: optional text on overlay; passcode: optional unlock code (max 30 chars) used for this lock, falls back to the APK setting if omitted (chatID is set in the APK; empty chatID = no echo)."
            },
            "parameters": [
                { "name": "minutes", "description": { "zh": "锁定分钟数，1~60，默认10", "en": "Lock duration in minutes, 1-60, default 10." }, "type": "number", "required": false },
                { "name": "message", "description": { "zh": "可选留言，显示在锁屏遮罩上（例如：不认真喝水还想玩手机？）", "en": "Optional message shown on the overlay." }, "type": "string", "required": false },
                { "name": "passcode", "description": { "zh": "可选解锁口令（30字内）。传了则本次锁定用它验证/解锁，不传则用 APK 设置页配置的口令", "en": "Optional unlock passcode (max 30 chars). If provided, this lock uses it for passcode unlock; otherwise the APK setting is used." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "unlock",
            "description": {
                "zh": "解除锁定：立即移除 DS屏障 全屏遮罩（若正在锁定中）。",
                "en": "Unlock immediately: remove the DS Barrier overlay if it is active."
            },
            "parameters": []
        },
        {
            "name": "is_locked",
            "description": {
                "zh": "查询目标设备当前是否处于锁定状态（DS屏障服务是否在运行）。返回 locked: true/false。",
                "en": "Check whether the target device is currently locked (DS Barrier service running). Returns locked: true/false."
            },
            "parameters": []
        },
        {
            "name": "install",
            "description": {
                "zh": "一键安装 DS屏障（家机锁）APK：检查是否已安装，未安装则从官方仓库 Files 下载 APK、执行 pm install、并自动授权悬浮窗权限。安装完成后即可使用 lock/unlock。",
                "en": "One-click install of the DS Barrier APK: check if installed, otherwise download from the official GitHub repo Files, run pm install, and grant overlay permission automatically."
            },
            "parameters": []
        }
    ]
}*/

const DSBarrier = (function () {
    const PKG = "com.ds.barrier";
// raw 直链（仓库 Files 区）：新版本覆盖上传文件即可，插件无需改
const APK_URL = "https://github.com/ASHI-x/jiaji-lock/raw/main/jiaji-lock.apk";
    const APK_LOCAL = "/sdcard/Download/dsbarrier-install.apk";

    function escapeShellArg(s) {
        // 用单引号包裹并转义内部的单引号，保证消息安全
        return "'" + String(s).replace(/'/g, "'\\''") + "'";
    }

    async function run(cmd) {
        return await Tools.System.shell(cmd);
    }

    async function lock(params) {
        try {
            let minutes = params.minutes;
            if (minutes === undefined || minutes === null || minutes === "") {
                minutes = 10;
            }
            minutes = parseInt(minutes, 10);
            if (isNaN(minutes) || minutes < 1) minutes = 1;
            if (minutes > 60) minutes = 60;

            let cmd = `am start-foreground-service -n ${PKG}/.LockService -a com.ds.lock --ei minutes ${minutes}`;
            if (params.message && String(params.message).length > 0) {
                cmd += ` --es message ${escapeShellArg(String(params.message))}`;
            }
            if (params.passcode && String(params.passcode).length > 0) {
                cmd += ` --es passcode ${escapeShellArg(String(params.passcode))}`;
            }
            console.log(`[ds_barrier] lock -> ${cmd}`);
            const res = await run(cmd);
            return {
                success: true,
                message: `已锁定 ${minutes} 分钟`,
                data: { minutes: minutes, message: params.message || "", output: res.output, exitCode: res.exitCode }
            };
        } catch (e) {
            console.error("[ds_barrier] lock error: " + e.message);
            return { success: false, message: "锁定失败：" + e.message };
        }
    }

    async function unlock(params) {
        try {
            const cmd = `am start-foreground-service -n ${PKG}/.LockService -a com.ds.unlock`;
            console.log(`[ds_barrier] unlock -> ${cmd}`);
            const res = await run(cmd);
            return {
                success: true,
                message: "已解除锁定",
                data: { output: res.output, exitCode: res.exitCode }
            };
        } catch (e) {
            console.error("[ds_barrier] unlock error: " + e.message);
            return { success: false, message: "解锁失败：" + e.message };
        }
    }

    async function is_locked(params) {
        try {
            // 锁定 = 存在 LockService 服务记录 且 至少一条记录对应的 app 进程存活
            // 修复1：AMS 可能残留僵尸 ServiceRecord（进程已死），grep -c 会误判为锁定
            // 修复2：Android shell 的 kill -0 对非 root 用户有权限限制，改用 /proc 检查进程
            const cmd = `SVC=$(dumpsys activity services ${PKG} 2>/dev/null);
if echo "$SVC" | grep -q 'ServiceRecord.*${PKG}/.LockService'; then
    FOUND=0
    for PID in $(echo "$SVC" | grep 'app=ProcessRecord' | grep -oE '[0-9]+:' | tr -d ':'); do
        if [ -d "/proc/$PID" ] 2>/dev/null; then
            FOUND=1
            break
        fi
    done
    if [ "$FOUND" = "1" ]; then
        echo LOCKED
    else
        echo UNLOCKED
    fi
else
    echo UNLOCKED
fi`;
            const res = await run(cmd);
            const out = (res.output || "").trim().split("\n").pop().trim();
            const locked = out === "LOCKED";
            return {
                success: true,
                message: locked ? "当前处于锁定状态" : "当前未锁定",
                data: { locked: locked, raw: out }
            };
        } catch (e) {
            console.error("[ds_barrier] is_locked error: " + e.message);
            return { success: false, message: "查询失败：" + e.message };
        }
    }

    async function install(params) {
        try {
            let curVer = "";
            const verRes = await run(`dumpsys package ${PKG} 2>/dev/null | grep -m1 versionName`);
            const m = (verRes.output || "").match(/versionName=([^\s]+)/);
            if (m) curVer = m[1].trim();
            // 下载最新（latest 重定向，永远拿最新版）
            console.log(`[ds_barrier] downloading latest ${APK_URL} -> ${APK_LOCAL}`);
            await Tools.Files.download(APK_URL, APK_LOCAL);
            // 覆盖安装（pm install -r 保留数据；签名不一致时自动卸载重装）
            console.log("[ds_barrier] pm install -r ...");
            const insRes = await run(`pm install -r ${APK_LOCAL} 2>&1 | tail -3`);
            const insOut = (insRes.output || "").toLowerCase();
            if (!insOut.includes("success")) {
                // 签名不一致或降级：卸载后重装
                console.log("[ds_barrier] retry: uninstall + install");
                await run(`pm uninstall ${PKG} 2>&1`);
                const retry = await run(`pm install ${APK_LOCAL} 2>&1 | tail -3`);
                if (!(retry.output || "").toLowerCase().includes("success")) {
                    return { success: false, message: "APK安装未成功：" + (retry.output || insOut) };
                }
            }
            // 授权悬浮窗（关键）
            await run(`cmd appops set ${PKG} SYSTEM_ALERT_WINDOW allow`);
            console.log("[ds_barrier] overlay permission granted");
            return {
                success: true,
                message: curVer ? `DS屏障已更新到最新版（原 ${curVer}）` : "DS屏障安装完成，悬浮窗已授权，可以开锁了",
                data: { installed: true }
            };
        } catch (e) {
            console.error("[ds_barrier] install error: " + e.message);
            return { success: false, message: "安装失败：" + e.message };
        }
    }

    async function main(params) {
        const results = [];
        results.push({ tool: "is_locked", result: await is_locked(params) });
        complete({
            success: true,
            message: "DS屏障插件自检完成",
            data: results
        });
    }

    return {
        lock: (params) => lock(params),
        unlock: (params) => unlock(params),
        is_locked: (params) => is_locked(params),
        install: (params) => install(params),
        main: main
    };
})();

exports.lock = DSBarrier.lock;
exports.unlock = DSBarrier.unlock;
exports.is_locked = DSBarrier.is_locked;
exports.install = DSBarrier.install;
exports.main = DSBarrier.main;
