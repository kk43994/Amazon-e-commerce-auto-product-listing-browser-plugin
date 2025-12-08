/**
 * 页面分析工具 - 注入脚本
 * 这个文件会被注入到页面的真实 window 对象中
 */

class AmazonPageAnalyzer {
    constructor() {
        this.fieldMappings = {};
        this.shadowDOMElements = [];
    }

    analyzePage() {
        console.log('========== 开始分析页面 ==========');
        this.fieldMappings = {};
        this.shadowDOMElements = [];

        const labels = this.findAllLabels();
        console.log(`找到 ${labels.length} 个 Label 元素`);

        labels.forEach((label, index) => {
            const mapping = this.analyzeLabel(label, index);
            if (mapping) {
                const key = this.generateFieldKey(mapping.labelText);
                this.fieldMappings[key] = mapping;
            }
        });

        console.log('========== 分析完成 ==========');
        console.log(`共找到 ${Object.keys(this.fieldMappings).length} 个字段映射`);

        return this.fieldMappings;
    }

    findAllLabels() {
        const labels = [];
        const standardLabels = document.querySelectorAll('label, kat-label, [role="label"]');
        labels.push(...Array.from(standardLabels));
        const shadowLabels = this.findLabelsInShadowDOM(document);
        labels.push(...shadowLabels);
        return labels;
    }

    findLabelsInShadowDOM(root) {
        const labels = [];
        const allElements = root.querySelectorAll('*');

        for (const el of allElements) {
            if (el.shadowRoot) {
                const shadowLabels = el.shadowRoot.querySelectorAll('label, kat-label, [role="label"]');
                labels.push(...Array.from(shadowLabels));
                const deeperLabels = this.findLabelsInShadowDOM(el.shadowRoot);
                labels.push(...deeperLabels);
            }
        }
        return labels;
    }

    analyzeLabel(labelElement, index) {
        let labelText = '';
        if (labelElement.tagName === 'KAT-LABEL' && labelElement.hasAttribute('text')) {
            labelText = labelElement.getAttribute('text');
        } else {
            labelText = labelElement.textContent.trim();
        }

        labelText = labelText.replace(/报告问题|Report a problem|問題を報告/g, '').trim();

        if (!labelText || labelText.length < 2) {
            return null;
        }

        const input = this.findAssociatedInput(labelElement);

        if (!input) {
            console.log(`[分析] Label "${labelText}" 未找到关联输入框`);
            return null;
        }

        const inputInfo = this.extractInputInfo(input);

        const mapping = {
            labelText: labelText,
            labelElement: labelElement.tagName,
            inputType: inputInfo.type,
            inputTag: inputInfo.tag,
            inputName: inputInfo.name,
            inputId: inputInfo.id,
            inputUID: inputInfo.uid,
            inputPlaceholder: inputInfo.placeholder,
            isInShadowDOM: this.isInShadowDOM(input),
            selector: this.generateSelector(input, labelElement)
        };

        console.log(`[分析] ✓ ${labelText}:`, mapping);
        return mapping;
    }

    findAssociatedInput(labelElement) {
        const forId = labelElement.getAttribute('for');
        if (forId) {
            const input = document.getElementById(forId);
            if (input) return input;
        }

        const innerInput = labelElement.querySelector('input, textarea, select, kat-input, kat-textarea, kat-select, kat-combobox');
        if (innerInput) return innerInput;

        const shadowRoot = labelElement.getRootNode();
        if (shadowRoot instanceof ShadowRoot) {
            const host = shadowRoot.host;
            const hostInput = host.querySelector('input, textarea, select, kat-input, kat-textarea, kat-select');
            if (hostInput) return hostInput;
        }

        let parent = labelElement.parentElement;
        let depth = 0;
        while (parent && depth < 5) {
            const inputs = parent.querySelectorAll('input:not([type="hidden"]), textarea, select, kat-input, kat-textarea, kat-select, kat-combobox');

            for (const input of inputs) {
                if (input.compareDocumentPosition(labelElement) & Node.DOCUMENT_POSITION_PRECEDING) {
                    return input;
                }
            }

            parent = parent.parentElement;
            depth++;
        }

        return null;
    }

    extractInputInfo(input) {
        const info = {
            tag: input.tagName.toLowerCase(),
            type: input.type || 'text',
            name: input.name || '',
            id: input.id || '',
            uid: input.getAttribute('uid') || input.getAttribute('data-uid') || '',
            placeholder: input.placeholder || ''
        };

        if (info.tag.startsWith('kat-')) {
            if (input.shadowRoot) {
                const realInput = input.shadowRoot.querySelector('input, textarea, select');
                if (realInput) {
                    info.realType = realInput.type;
                    info.realTag = realInput.tagName.toLowerCase();
                }
            }
        }

        return info;
    }

    isInShadowDOM(element) {
        const root = element.getRootNode();
        return root instanceof ShadowRoot;
    }

    generateFieldKey(labelText) {
        return labelText
            .toLowerCase()
            .replace(/[（）()：:]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^\w\u4e00-\u9fa5_]/g, '')
            .substring(0, 50);
    }

    generateSelector(input, label) {
        const selectors = [];

        const uid = input.getAttribute('uid') || input.getAttribute('data-uid');
        if (uid) {
            selectors.push({ type: 'uid', value: uid });
        }

        if (input.id) {
            selectors.push({ type: 'id', value: input.id });
        }

        if (input.name) {
            selectors.push({ type: 'name', value: input.name });
        }

        const labelText = label.textContent.trim().replace(/报告问题|Report a problem|問題を報告/g, '').trim();
        if (labelText) {
            selectors.push({ type: 'label', value: labelText });
        }

        return selectors;
    }

    exportToJSON() {
        const output = {};

        for (const [key, mapping] of Object.entries(this.fieldMappings)) {
            const fieldConfig = {
                type: this.mapInputTypeToFieldType(mapping.inputType, mapping.inputTag),
                fallback: {
                    labels: [mapping.labelText]
                }
            };

            if (mapping.inputUID) {
                fieldConfig.uid = mapping.inputUID;
            }

            if (mapping.inputName) {
                fieldConfig.fallback.name = mapping.inputName;
            }

            if (mapping.inputPlaceholder) {
                fieldConfig.fallback.placeholder = mapping.inputPlaceholder;
            }

            output[key] = fieldConfig;
        }

        return JSON.stringify(output, null, 2);
    }

    mapInputTypeToFieldType(inputType, inputTag) {
        if (inputTag === 'select' || inputTag === 'kat-select' || inputTag === 'kat-combobox') {
            return 'dropdown';
        }
        if (inputType === 'radio') {
            return 'radio';
        }
        if (inputType === 'checkbox') {
            return 'checkbox';
        }
        if (inputTag === 'textarea' || inputTag === 'kat-textarea') {
            return 'textbox';
        }
        return 'textbox';
    }

    generateReport() {
        let report = '========== Amazon 页面字段分析报告 ==========\n\n';
        report += `分析时间: ${new Date().toLocaleString('zh-CN')}\n`;
        report += `页面URL: ${window.location.href}\n`;
        report += `找到字段数: ${Object.keys(this.fieldMappings).length}\n\n`;
        report += '========== 字段列表 ==========\n\n';

        for (const [key, mapping] of Object.entries(this.fieldMappings)) {
            report += `字段: ${key}\n`;
            report += `  Label: ${mapping.labelText}\n`;
            report += `  类型: ${mapping.inputType} (${mapping.inputTag})\n`;
            if (mapping.inputUID) report += `  UID: ${mapping.inputUID}\n`;
            if (mapping.inputName) report += `  Name: ${mapping.inputName}\n`;
            if (mapping.inputId) report += `  ID: ${mapping.inputId}\n`;
            report += `  Shadow DOM: ${mapping.isInShadowDOM ? '是' : '否'}\n`;
            report += '\n';
        }

        return report;
    }

    downloadJSON() {
        const json = this.exportToJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amazon_fields_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadReport() {
        const report = this.generateReport();
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amazon_analysis_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 暴露到页面的真实 window 对象
window.AmazonPageAnalyzer = AmazonPageAnalyzer;

// 添加快捷命令
window.analyzeAmazonPage = function () {
    const analyzer = new AmazonPageAnalyzer();
    const mappings = analyzer.analyzePage();
    console.log('========== 分析结果 ==========');
    console.log(mappings);
    console.log('\n========== JSON 导出 ==========');
    console.log(analyzer.exportToJSON());
    console.log('\n========== 文本报告 ==========');
    console.log(analyzer.generateReport());
    console.log('\n💡 提示：返回的 analyzer 对象可以调用:');
    console.log('  - analyzer.downloadJSON() 下载 JSON 配置文件');
    console.log('  - analyzer.downloadReport() 下载分析报告');
    return analyzer;
};

console.log('[页面分析工具] ✅ 已加载到页面 window 对象');
console.log('📖 使用方法: analyzeAmazonPage()');
