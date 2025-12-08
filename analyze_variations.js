(function () {
    console.clear();
    console.log("=== 变种页结构分析器 ===");

    var report = {
        themes: [],
        creationInputs: [],
        matrixRows: []
    };

    // 1. 分析主题
    var potentialThemes = document.querySelectorAll('kat-checkbox, input[type="checkbox"]');
    potentialThemes.forEach(function (el) {
        var label = (el.getAttribute('label') || el.innerText || el.parentElement.innerText || '').trim();
        if (label && /Size|Color|Style|Material|Package|Variation|Map/i.test(label)) {
            report.themes.push({
                label: label,
                checked: el.checked,
                tagName: el.tagName
            });
        }
    });

    // 2. 分析 Add 按钮及旁边的输入框
    var allBtns = Array.from(document.querySelectorAll('button, kat-button'));
    var addBtns = allBtns.filter(function (b) {
        var t = (b.textContent || b.getAttribute('label') || '').toLowerCase();
        return t.indexOf('add') !== -1 || t.indexOf('添加') !== -1;
    });

    addBtns.forEach(function (btn, idx) {
        var input = btn.previousElementSibling;
        if (!input || (input.tagName !== 'INPUT' && input.tagName !== 'KAT-INPUT')) {
            if (btn.parentElement) {
                input = btn.parentElement.querySelector('input, kat-input');
            }
        }

        if (input) {
            report.creationInputs.push({
                index: idx,
                relatedButton: btn.textContent.trim(),
                inputName: input.name || input.getAttribute('name'),
                inputId: input.id || input.getAttribute('uid'),
                tagName: input.tagName
            });
        }
    });

    // 3. 分析矩阵行
    var possibleRows = document.querySelectorAll('tr, div[role="row"], kat-table-row');
    possibleRows.forEach(function (row, idx) {
        var inputs = row.querySelectorAll('input, kat-input, select, kat-select');
        var inputInfos = [];
        var isMatrixRow = false;

        inputs.forEach(function (inp) {
            var name = inp.name || inp.getAttribute('name') || '';
            var type = inp.type || inp.getAttribute('type') || '';
            if (name) {
                if (/price|sku|quantity|condition/i.test(name)) {
                    isMatrixRow = true;
                }
                inputInfos.push({ name: name, type: type });
            }
        });

        if (isMatrixRow) {
            var rowText = row.textContent.replace(/\s+/g, ' ').substring(0, 50);
            report.matrixRows.push({
                rowIndex: idx,
                textSample: rowText,
                fields: inputInfos
            });
        }
    });

    console.log("[1] Themes:", report.themes);
    console.log("[2] Creation Inputs:", report.creationInputs);
    console.log("[3] Matrix Rows:", report.matrixRows);
    console.log("JSON Output:");
    console.log(JSON.stringify(report, null, 2));
})();
