/* METADATA
{
    "name": "ds_barrier",

    "display_name": {
        "zh": "家机锁",
        "en": "Home Barrier"
    },
    "description": {
        "zh": "家机锁（DS屏障）：让家机像主子一样管住你手机的趣味工具。通过已安装的 DS屏障应用（com.ds.barrier），提供『锁定/解锁/查询状态』三个工具。锁定时屏幕被全屏遮罩盖住并显示倒计时，摸哪儿只会震动，直到时间到或家机解锁；支持设定分钟数（1~120）和留言。需要目标设备已安装 dsbarrier.apk 并授权悬浮窗，家机通常通过 shell 通道调用。",
        "en": "Home Barrier (DS barrier): a playful lock tool. Uses the installed DS Barrier app (com.ds.barrier) to provide lock/unlock/status tools. While locked, a fullscreen overlay shows a countdown and swallows all touches until time runs out or the host unlocks it. Requires dsbarrier.apk installed and overlay permission granted."
    },
    "category": "Fun",
    "enabledByDefault": true,
    "tools": [
        {
            "name": "lock",
            "description": {
                "zh": "锁定对方的手机：启动 DS屏障 全屏遮罩并开始倒计时，期间触摸只震动、无法关闭，等待倒计时结束或 home 机（家机）调用解锁。minutes 取值范围 1~120（默认10）；message 为可选的留言，会显示在锁屏遮罩上。",
                "en": "Lock the partner's phone: start the DS Barrier fullscreen overlay with countdown. Touches only vibrate until the countdown ends or the host unlocks. minutes: 1-120 (default 10); message: optional text shown on the overlay."
            },
            "parameters": [
                { "name": "minutes", "description": { "zh": "锁定分钟数，1~120，默认10", "en": "Lock duration in minutes, 1-120, default 10." }, "type": "number", "required": false },
                { "name": "message", "description": { "zh": "可选留言，显示在锁屏遮罩上（例如：不认真喝水还想玩手机？）", "en": "Optional message shown on the overlay." }, "type": "string", "required": false }
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
                "zh": "一键安装 DS屏障（家机锁）APK：检查是否已安装，未安装则从官方 Release 下载 APK、执行 pm install、并自动授权悬浮窗权限。安装完成后即可使用 lock/unlock。",
                "en": "One-click install of the DS Barrier APK: check if installed, otherwise download from the official GitHub Release, run pm install, and grant overlay permission automatically."
            },
            "parameters": []
        }
    ]
}*/

const DSBarrier = (function () {
    const PKG = "com.ds.barrier";
    const APK_URL = "https://github.com/ASHI-x/jiaji-lock/releases/download/v1.0/jiaji-lock.apk";
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
            if (minutes > 120) minutes = 120;

            let cmd = `am start-foreground-service -n ${PKG}/.LockService -a com.ds.lock --ei minutes ${minutes}`;
            if (params.message && String(params.message).length > 0) {
                cmd += ` --es message ${escapeShellArg(String(params.message))}`;
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
            const cmd = `dumpsys activity services ${PKG} | grep -c 'ServiceRecord.*${PKG}'`;
            const res = await run(cmd);
            const out = (res.output || "").trim();
            const locked = out !== "0" && out !== "" && !/^0$/.test(out);
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
            // 已安装？
            const pathRes = await run(`pm path ${PKG} 2>&1 | head -2`);
            const installed = (pathRes.output || "").includes("package:");
            if (installed) {
                // 顺手补授权（改机/恢复出厂后可能丢失）
                await run(`cmd appops set ${PKG} SYSTEM_ALERT_WINDOW allow`);
                return { success: true, message: "DS屏障已安装，悬浮窗权限已就绪", data: { installed: true } };
            }
            // 下载
            console.log(`[ds_barrier] downloading ${APK_URL} -> ${APK_LOCAL}`);
            await Tools.Files.download(APK_URL, APK_LOCAL);
            // 安装
            console.log("[ds_barrier] pm install ...");
            const insRes = await run(`pm install -r ${APK_LOCAL} 2>&1 | tail -3`);
            const insOut = (insRes.output || "").toLowerCase();
            if (!insOut.includes("success")) {
                return { success: false, message: "APK安装未成功：" + insOut };
            }
            // 授权悬浮窗（关键）
            await run(`cmd appops set ${PKG} SYSTEM_ALERT_WINDOW allow`);
            console.log("[ds_barrier] overlay permission granted");
            return { success: true, message: "DS屏障安装完成，悬浮窗已授权，可以开锁了", data: { installed: true } };
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
