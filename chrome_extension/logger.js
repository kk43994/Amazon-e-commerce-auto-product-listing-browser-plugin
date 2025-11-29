/**
 * Chrome扩展日志系统 v3.0.2
 * 提供统一的日志记录、操作追踪和数据上报功能
 */

class ExtensionLogger {
    constructor(moduleName = 'main') {
        this.moduleName = moduleName;
        this.logLevel = 'INFO'; // DEBUG, INFO, WARN, ERROR
        this.logs = [];
        this.operations = new Map();
        this.startTimes = new Map();

        // 初始化存储
        this.initStorage();

        // 设置日志级别
        this.loadLogLevel();
    }

    async initStorage() {
        // 从storage获取历史日志
        const stored = await chrome.storage.local.get(['logs', 'operations']);
        if (stored.logs) {
            this.logs = stored.logs.slice(-1000); // 只保留最近1000条
        }
        if (stored.operations) {
            this.operations = new Map(stored.operations);
        }
    }

    async loadLogLevel() {
        const settings = await chrome.storage.local.get(['logLevel']);
        if (settings.logLevel) {
            this.logLevel = settings.logLevel;
        }
    }

    // 日志级别判断
    shouldLog(level) {
        const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        const currentIndex = levels.indexOf(this.logLevel);
        const targetIndex = levels.indexOf(level);
        return targetIndex >= currentIndex;
    }

    // 格式化时间戳
    getTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').slice(0, -5);
    }

    // 基础日志方法
    log(level, message, data = null) {
        if (!this.shouldLog(level)) return;

        const logEntry = {
            timestamp: this.getTimestamp(),
            level: level,
            module: this.moduleName,
            message: message,
            data: data
        };

        // 添加到日志数组
        this.logs.push(logEntry);

        // 控制台输出
        const consoleMethod = level === 'ERROR' ? 'error' :
                            level === 'WARN' ? 'warn' :
                            level === 'DEBUG' ? 'debug' : 'log';

        const prefix = `[${logEntry.timestamp}] [${level}] [${this.moduleName}]`;
        if (data) {
            console[consoleMethod](prefix, message, data);
        } else {
            console[consoleMethod](prefix, message);
        }

        // 异步保存到storage（限流）
        this.saveLogsThrottled();
    }

    // 便捷方法
    debug(message, data = null) {
        this.log('DEBUG', message, data);
    }

    info(message, data = null) {
        this.log('INFO', message, data);
    }

    warn(message, data = null) {
        this.log('WARN', message, data);
    }

    error(message, data = null) {
        this.log('ERROR', message, data);
    }

    // 操作追踪
    startOperation(operationId, details = {}) {
        this.startTimes.set(operationId, Date.now());

        const operation = {
            id: operationId,
            startTime: this.getTimestamp(),
            status: 'running',
            details: details,
            steps: []
        };

        this.operations.set(operationId, operation);

        this.info(`开始操作: ${operationId}`, details);
    }

    addOperationStep(operationId, step, data = null) {
        const operation = this.operations.get(operationId);
        if (!operation) return;

        operation.steps.push({
            timestamp: this.getTimestamp(),
            step: step,
            data: data
        });

        this.debug(`[${operationId}] ${step}`, data);
    }

    endOperation(operationId, success = true, result = null) {
        const operation = this.operations.get(operationId);
        if (!operation) return;

        const startTime = this.startTimes.get(operationId);
        const duration = startTime ? Date.now() - startTime : 0;

        operation.endTime = this.getTimestamp();
        operation.duration = duration;
        operation.status = success ? 'success' : 'failure';
        operation.result = result;

        this.info(`完成操作: ${operationId} [${duration}ms]`, {
            success: success,
            duration: duration
        });

        // 清理开始时间
        this.startTimes.delete(operationId);

        // 保存操作记录
        this.saveOperations();
    }

    // 批量操作日志
    logBatch(productIndex, total, action, details = {}) {
        this.info(`[${productIndex}/${total}] ${action}`, details);
    }

    // 性能监控
    measurePerformance(name, fn) {
        const start = performance.now();

        try {
            const result = fn();
            const duration = performance.now() - start;

            this.debug(`性能: ${name} 耗时 ${duration.toFixed(2)}ms`);

            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.error(`性能: ${name} 失败 [${duration.toFixed(2)}ms]`, error.message);
            throw error;
        }
    }

    // 异步性能监控
    async measureAsyncPerformance(name, asyncFn) {
        const start = performance.now();

        try {
            const result = await asyncFn();
            const duration = performance.now() - start;

            this.debug(`异步性能: ${name} 耗时 ${duration.toFixed(2)}ms`);

            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.error(`异步性能: ${name} 失败 [${duration.toFixed(2)}ms]`, error.message);
            throw error;
        }
    }

    // 节流保存（避免频繁写入storage）
    saveLogsThrottled = (() => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.saveLogs();
            }, 1000); // 1秒后保存
        };
    })();

    async saveLogs() {
        try {
            // 只保留最近1000条日志
            const logsToSave = this.logs.slice(-1000);
            await chrome.storage.local.set({ logs: logsToSave });
        } catch (error) {
            console.error('保存日志失败:', error);
        }
    }

    async saveOperations() {
        try {
            // 只保留最近100个操作
            const ops = Array.from(this.operations.entries()).slice(-100);
            await chrome.storage.local.set({ operations: ops });
        } catch (error) {
            console.error('保存操作记录失败:', error);
        }
    }

    // 获取统计信息
    getStats() {
        const stats = {
            totalLogs: this.logs.length,
            errors: this.logs.filter(l => l.level === 'ERROR').length,
            warnings: this.logs.filter(l => l.level === 'WARN').length,
            operations: {
                total: this.operations.size,
                running: 0,
                success: 0,
                failure: 0
            }
        };

        for (const op of this.operations.values()) {
            if (op.status === 'running') stats.operations.running++;
            else if (op.status === 'success') stats.operations.success++;
            else if (op.status === 'failure') stats.operations.failure++;
        }

        return stats;
    }

    // 清理日志
    async clearLogs() {
        this.logs = [];
        this.operations.clear();
        this.startTimes.clear();
        await chrome.storage.local.remove(['logs', 'operations']);
        this.info('日志已清理');
    }

    // 导出日志
    exportLogs() {
        const exportData = {
            exportTime: this.getTimestamp(),
            module: this.moduleName,
            logs: this.logs,
            operations: Array.from(this.operations.entries()),
            stats: this.getStats()
        };

        return JSON.stringify(exportData, null, 2);
    }

    // 上报错误到远程服务器（可选）
    async reportError(error, context = {}) {
        const errorReport = {
            timestamp: this.getTimestamp(),
            module: this.moduleName,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.error('错误上报', errorReport);

        // TODO: 如果需要，可以发送到远程服务器
        // await fetch('https://your-error-tracking-server.com/report', {
        //     method: 'POST',
        //     body: JSON.stringify(errorReport)
        // });
    }
}

// 创建全局logger实例
window.ExtensionLogger = ExtensionLogger;

// 便捷方法
window.createLogger = function(moduleName) {
    return new ExtensionLogger(moduleName);
};

// 默认logger
window.logger = new ExtensionLogger('main');