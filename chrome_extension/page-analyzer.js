// 页面元素分析器 - 自动检测当前页面的所有表单元素
console.log('[页面分析器] 已加载');

// 分析当前页面的所有表单元素
function analyzePage() {
    const results = {
        inputs: [],
        textareas: [],
        selects: [],
        fileInputs: [],
        buttons: [],
        labels: [],
        suggestions: {}
    };

    // 1. 查找所有input
    document.querySelectorAll('input').forEach((input, index) => {
        if (input.type === 'hidden') return;

        const info = {
            index: index + 1,
            type: input.type,
            id: input.id,
            name: input.name,
            placeholder: input.placeholder,
            value: input.value,
            className: input.className,
            label: findLabelForInput(input),
            xpath: getXPath(input),
            selector: generateSelector(input)
        };

        if (input.type === 'file') {
            results.fileInputs.push(info);
        } else {
            results.inputs.push(info);
        }
    });

    // 2. 查找所有textarea
    document.querySelectorAll('textarea').forEach((textarea, index) => {
        results.textareas.push({
            index: index + 1,
            id: textarea.id,
            name: textarea.name,
            placeholder: textarea.placeholder,
            value: textarea.value,
            className: textarea.className,
            label: findLabelForInput(textarea),
            rows: textarea.rows,
            xpath: getXPath(textarea),
            selector: generateSelector(textarea)
        });
    });

    // 3. 查找所有select
    document.querySelectorAll('select').forEach((select, index) => {
        const options = Array.from(select.options).map(opt => ({
            value: opt.value,
            text: opt.text
        }));

        results.selects.push({
            index: index + 1,
            id: select.id,
            name: select.name,
            className: select.className,
            label: findLabelForInput(select),
            options: options,
            xpath: getXPath(select),
            selector: generateSelector(select)
        });
    });

    // 4. 查找所有按钮
    document.querySelectorAll('button, input[type="submit"], input[type="button"]').forEach((btn, index) => {
        results.buttons.push({
            index: index + 1,
            type: btn.type,
            text: btn.textContent || btn.value,
            id: btn.id,
            name: btn.name,
            className: btn.className,
            xpath: getXPath(btn),
            selector: generateSelector(btn)
        });
    });

    // 5. 查找所有label
    document.querySelectorAll('label').forEach((label, index) => {
        results.labels.push({
            index: index + 1,
            text: label.textContent.trim(),
            for: label.htmlFor,
            id: label.id
        });
    });

    // 6. 智能建议字段匹配
    results.suggestions = suggestFieldMappings(results);

    return results;
}

// 查找input对应的label
function findLabelForInput(input) {
    // 方式1: 通过for属性
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.textContent.trim();
    }

    // 方式2: input在label内部
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();

    // 方式3: label是input的前一个兄弟元素
    let prev = input.previousElementSibling;
    while (prev) {
        if (prev.tagName === 'LABEL') {
            return prev.textContent.trim();
        }
        prev = prev.previousElementSibling;
    }

    // 方式4: 查找附近的文本
    const parent = input.parentElement;
    if (parent) {
        const text = parent.textContent.trim();
        if (text.length < 100) return text;
    }

    return '';
}

// 生成XPath
function getXPath(element) {
    if (element.id) {
        return `//*[@id="${element.id}"]`;
    }

    const paths = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
        let index = 0;
        let sibling = current.previousSibling;

        while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
                index++;
            }
            sibling = sibling.previousSibling;
        }

        const tagName = current.nodeName.toLowerCase();
        const pathIndex = index ? `[${index + 1}]` : '';
        paths.unshift(`${tagName}${pathIndex}`);

        current = current.parentNode;
    }

    return paths.length ? '/' + paths.join('/') : '';
}

// 生成CSS选择器
function generateSelector(element) {
    // 优先使用ID
    if (element.id) {
        return `#${element.id}`;
    }

    // 使用name属性
    if (element.name) {
        return `${element.tagName.toLowerCase()}[name="${element.name}"]`;
    }

    // 使用class
    if (element.className && typeof element.className === 'string') {
        const classes = element.className.trim().split(/\s+/).join('.');
        if (classes) {
            return `${element.tagName.toLowerCase()}.${classes}`;
        }
    }

    // 使用类型
    if (element.type) {
        return `${element.tagName.toLowerCase()}[type="${element.type}"]`;
    }

    return element.tagName.toLowerCase();
}

// 智能建议字段匹配
function suggestFieldMappings(results) {
    const suggestions = {
        title: null,
        brand: null,
        price: null,
        description: null,
        quantity: null,
        sku: null,
        category: null,
        bulletPoints: []
    };

    const allInputs = [...results.inputs, ...results.textareas];

    // 关键词匹配规则
    const rules = {
        title: ['title', '标题', 'name', '名称', 'product name'],
        brand: ['brand', '品牌', 'manufacturer'],
        price: ['price', '价格', 'amount'],
        description: ['description', '描述', 'detail', 'content'],
        quantity: ['quantity', '数量', 'stock', '库存', 'inventory'],
        sku: ['sku', 'seller sku', '卖家sku'],
        category: ['category', '分类', 'type', '类别'],
        bulletPoints: ['bullet', 'feature', '要点', 'key point']
    };

    // 对每个字段进行匹配
    for (const [field, keywords] of Object.entries(rules)) {
        for (const input of allInputs) {
            const searchText = [
                input.id || '',
                input.name || '',
                input.placeholder || '',
                input.label || ''
            ].join(' ').toLowerCase();

            for (const keyword of keywords) {
                if (searchText.includes(keyword.toLowerCase())) {
                    if (field === 'bulletPoints') {
                        suggestions[field].push({
                            confidence: calculateConfidence(searchText, keyword),
                            element: input
                        });
                    } else {
                        if (!suggestions[field] ||
                            calculateConfidence(searchText, keyword) > suggestions[field].confidence) {
                            suggestions[field] = {
                                confidence: calculateConfidence(searchText, keyword),
                                element: input
                            };
                        }
                    }
                    break;
                }
            }
        }
    }

    return suggestions;
}

// 计算匹配置信度
function calculateConfidence(text, keyword) {
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // 完全匹配
    if (lowerText === lowerKeyword) return 100;

    // 精确包含
    if (lowerText.includes(lowerKeyword)) {
        const position = lowerText.indexOf(lowerKeyword);
        const lengthRatio = lowerKeyword.length / lowerText.length;
        return 50 + (50 * lengthRatio) - (position * 0.1);
    }

    // 部分匹配
    let matches = 0;
    for (const char of lowerKeyword) {
        if (lowerText.includes(char)) matches++;
    }

    return (matches / lowerKeyword.length) * 30;
}

// 高亮显示元素 (支持传入HTMLElement或CSS选择器字符串)
function highlightElement(selectorOrElement, duration = 2000) {
    let element;

    // 判断传入的是元素还是选择器字符串
    if (typeof selectorOrElement === 'string') {
        try {
            element = document.querySelector(selectorOrElement);
        } catch (e) {
            console.warn('[高亮] 无效的选择器:', selectorOrElement);
            return;
        }
    } else if (selectorOrElement instanceof HTMLElement || selectorOrElement instanceof Element) {
        element = selectorOrElement;
    } else {
        console.warn('[高亮] 无效的参数类型:', typeof selectorOrElement);
        return;
    }

    if (!element) return;

    const original = {
        outline: element.style.outline,
        background: element.style.background
    };

    element.style.outline = '3px solid #ff9800';
    element.style.background = '#fff3e0';

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
        element.style.outline = original.outline;
        element.style.background = original.background;
    }, duration);
}

// 导出分析结果
function exportAnalysisResults() {
    const results = analyzePage();

    console.group('📊 页面分析结果');
    console.log('输入框:', results.inputs.length);
    console.log('文本域:', results.textareas.length);
    console.log('下拉框:', results.selects.length);
    console.log('文件输入:', results.fileInputs.length);
    console.log('按钮:', results.buttons.length);
    console.log('标签:', results.labels.length);
    console.groupEnd();

    console.group('🎯 智能匹配建议');
    for (const [field, suggestion] of Object.entries(results.suggestions)) {
        if (suggestion && suggestion.element) {
            console.log(`${field}:`, suggestion.element.selector, `(置信度: ${suggestion.confidence.toFixed(1)}%)`);
        }
    }
    console.groupEnd();

    return results;
}

// 添加到window对象，方便控制台调用
window.pageAnalyzer = {
    analyze: analyzePage,
    export: exportAnalysisResults,
    highlight: highlightElement
};

// 监听分析请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzePage') {
        const results = analyzePage();
        sendResponse({ success: true, data: results });
        return true;
    }

    if (request.action === 'highlightElement') {
        highlightElement(request.selector, request.duration);
        sendResponse({ success: true });
        return true;
    }
});

console.log('[页面分析器] 使用方法:');
console.log('  window.pageAnalyzer.analyze()  - 分析当前页面');
console.log('  window.pageAnalyzer.export()   - 导出分析结果');
console.log('  window.pageAnalyzer.highlight(selector) - 高亮元素');
