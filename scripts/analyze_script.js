(function () {
    console.clear();
    console.log("%c=== AMAZON PAGE ANALYZER (DEEP SHADOW DOM) ===", "color: lime; font-size: 16px; font-weight: bold;");

    const formElements = [];

    function traverse(root) {
        if (!root) return;

        // 查找所有可能的表单元素
        const elements = root.querySelectorAll('input, textarea, select, kat-input, kat-textarea, kat-select, kat-combobox, kat-autocomplete, kat-date-picker, kat-checkbox, kat-radio');

        elements.forEach(el => {
            // 排除隐藏元素
            if (el.type === 'hidden' || el.style.display === 'none') return;

            // 尝试找 Label
            let label = '';

            // 1. 查找 aria-label
            if (el.getAttribute('aria-label')) label = el.getAttribute('aria-label');

            // 2. 查找关联的 kat-label 或普通的 label
            if (!label) {
                // 向上找几层
                let parent = el.parentElement;
                for (let i = 0; i < 5 && parent; i++) {
                    const prev = parent.previousElementSibling;
                    if (prev && (prev.tagName === 'KAT-LABEL' || prev.tagName === 'LABEL' || prev.classList.contains('label'))) {
                        label = prev.textContent.trim();
                        break;
                    }
                    if (parent.tagName === 'KAT-LABEL' || parent.tagName === 'LABEL') {
                        label = parent.textContent.trim();
                        break;
                    }
                    // 有时候 label 在更外层的 container 的前面
                    const labelInContainer = parent.querySelector('kat-label, label, span.label');
                    if (labelInContainer && labelInContainer !== el) {
                        label = labelInContainer.textContent.trim();
                        break; // 简单的假设
                    }
                    parent = parent.parentElement;
                }
            }

            // 获取关键属性
            const info = {
                tagName: el.tagName.toLowerCase(),
                id: el.id || el.getAttribute('id '), 'uid': el.getAttribute('uid') || el.getAttribute('data-uid'),
                name: el.name || el.getAttribute('name'),
                type: el.type || el.getAttribute('type'),
                label: label.substring(0, 50).replace(/\n/g, ' '),
                placeholder: el.placeholder || el.getAttribute('placeholder')
            };

            // 过滤掉没用的
            if (!info.name && !info.id && !info.label) return;

            formElements.push(info);
        });

        // 递归 Shadow DOM
        const all = root.querySelectorAll('*');
        all.forEach(el => {
            if (el.shadowRoot) {
                traverse(el.shadowRoot);
            }
        });
    }

    traverse(document.body);

    console.table(formElements);
    console.log(`Found ${formElements.length} elements.`);

    // 导出为JSON字符串方便复制
    console.log("%c⬇️ COPY BELOW JSON FOR DEBUGGING ⬇️", "color: yellow; font-size: 14px;");
    console.log(JSON.stringify(formElements, null, 2));

})();
