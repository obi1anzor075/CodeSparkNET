// editCourse.js - version_JS: 3.1.0 (с редактированием ID)
// Добавлено: редактирование ID модулей и уроков, ввод ID при создании

console.warn('version_JS: 3.1.0 - with ID editing');

// ---------- Utilities ----------
function debounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

function getAntiForgeryToken() {
    const el = document.querySelector('input[name="__RequestVerificationToken"]');
    return el ? el.value : '';
}

async function postUrlEncoded(url, obj) {
    const token = getAntiForgeryToken();
    const params = new URLSearchParams();
    for (const k in obj) {
        if (obj[k] !== undefined && obj[k] !== null) {
            params.append(k, obj[k]);
        }
    }
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'RequestVerificationToken': token,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        },
        body: params.toString()
    });
    try {
        return await resp.json();
    } catch {
        return { success: false, message: 'Invalid server response' };
    }
}

async function getJson(url) {
    try {
        const r = await fetch(url);
        return await r.json();
    } catch (err) {
        console.error('getJson failed for', url, err);
        return { success: false, message: 'Invalid server response' };
    }
}

function decodeHtmlEntitiesIfNeeded(str) {
    if (!str) return '';
    if (str.indexOf('&lt;') === -1 && str.indexOf('&gt;') === -1 && str.indexOf('&amp;') === -1) return str;
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    return doc.documentElement.textContent || '';
}

function prettyPrintHtml(html) {
    if (!html) return '';
    let s = html.replace(/>\s+</g, '><');
    s = s.replace(/></g, '>\n<');
    const lines = s.split('\n');
    let indent = 0;
    const out = [];
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (/^<\//.test(trimmed)) {
            indent = Math.max(indent - 1, 0);
        }
        out.push('  '.repeat(indent) + trimmed);
        if (/^<[^\/!][^>]*[^\/]>$/.test(trimmed) && !/^<[^>]+>.*<\/[^>]+>$/.test(trimmed)) {
            if (!/\/>$/.test(trimmed)) indent++;
        }
    });
    return out.join('\n');
}

function findAncestor(node, tag) {
    while (node && node.nodeType === 1) {
        if (node.tagName && node.tagName.toLowerCase() === tag) return node;
        node = node.parentElement;
    }
    return null;
}

function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isBlockTag(node) {
    if (!node || node.nodeType !== 1) return false;
    const t = node.tagName.toLowerCase();
    return /^(p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|pre|blockquote|section|article|aside|header|footer)$/i.test(t);
}

// ---------- Remove comments ----------
function removeCommentsFromNode(node) {
    if (!node) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_COMMENT, null, false);
    const toRemove = [];
    let n;
    while ((n = walker.nextNode())) toRemove.push(n);
    toRemove.forEach(c => c.parentNode && c.parentNode.removeChild(c));
}

// ---------- Strip font styles ----------
function stripFontStyles(el) {
    if (!el || el.nodeType !== 1) return;
    try {
        if (el.style) {
            el.style.fontSize = '';
            el.style.lineHeight = '';
            el.style.fontFamily = '';
            if (el.getAttribute('style') && el.getAttribute('style').trim() === '') {
                el.removeAttribute('style');
            }
        }
    } catch (e) { }

    Array.from(el.querySelectorAll ? el.querySelectorAll('[style]') : []).forEach(child => {
        try {
            child.style.fontSize = '';
            child.style.lineHeight = '';
            child.style.fontFamily = '';
            if (child.getAttribute('style') && child.getAttribute('style').trim() === '') {
                child.removeAttribute('style');
            }
        } catch (e) { }
    });
}

// ---------- Normalization ----------
function normalizeEditorContent(editorEl) {
    if (!editorEl) return;

    removeCommentsFromNode(editorEl);

    const children = Array.from(editorEl.childNodes);

    if (children.length === 0 || children.every(n => n.nodeType === 3 && !n.textContent.trim())) {
        editorEl.innerHTML = '<div><p><br></p></div>';
        return;
    }

    if (children.length === 1 && children[0].nodeType === 1 && children[0].tagName.toLowerCase() === 'div') {
        const wrapper = children[0];
        normalizeWrapperContent(wrapper);
        stripFontStyles(wrapper);
        return;
    }

    const wrapper = document.createElement('div');
    while (editorEl.firstChild) {
        wrapper.appendChild(editorEl.firstChild);
    }
    editorEl.appendChild(wrapper);
    normalizeWrapperContent(wrapper);
    stripFontStyles(wrapper);
}

function normalizeWrapperContent(wrapper) {
    const children = Array.from(wrapper.childNodes);

    for (let node of children) {
        if (node.nodeType === Node.COMMENT_NODE) {
            wrapper.removeChild(node);
            continue;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim()) {
                const p = document.createElement('p');
                p.textContent = node.textContent;
                wrapper.replaceChild(p, node);
            } else {
                wrapper.removeChild(node);
            }
            continue;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();

            if (tag === 'div') {
                const hasBlockChild = Array.from(node.childNodes).some(ch =>
                    ch.nodeType === 1 && isBlockTag(ch)
                );

                if (!hasBlockChild) {
                    const p = document.createElement('p');
                    p.innerHTML = node.innerHTML;
                    Array.from(node.attributes).forEach(attr => {
                        if (attr.name !== 'style') {
                            p.setAttribute(attr.name, attr.value);
                        }
                    });
                    wrapper.replaceChild(p, node);
                } else {
                    stripFontStyles(node);
                }
            } else {
                stripFontStyles(node);
            }
        }
    }

    Array.from(wrapper.querySelectorAll('p p')).forEach(nested => {
        const parent = nested.parentElement;
        while (nested.firstChild) {
            parent.insertBefore(nested.firstChild, nested);
        }
        parent.removeChild(nested);
    });
}

// ---------- Insert HTML ----------
function insertHtmlAtCursor(html) {
    const editor = document.getElementById('modalLessonVisual');
    if (!editor) return;

    editor.focus();

    html = String(html || '');
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');

    if (!window.getSelection) {
        editor.innerHTML += html;
        normalizeEditorContent(editor);
        syncFromVisual();
        pushHistory();
        return;
    }

    const sel = window.getSelection();
    if (!sel.getRangeAt || !sel.rangeCount) {
        editor.innerHTML += html;
        normalizeEditorContent(editor);
        syncFromVisual();
        pushHistory();
        return;
    }

    const range = sel.getRangeAt(0);

    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    removeCommentsFromNode(tmp);
    stripFontStyles(tmp);

    const frag = document.createDocumentFragment();
    Array.from(tmp.childNodes).forEach(node => {
        frag.appendChild(node.cloneNode(true));
    });

    range.deleteContents();
    range.insertNode(frag);

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStartAfter(range.endContainer);
    newRange.collapse(true);
    sel.addRange(newRange);

    normalizeEditorContent(editor);
    syncFromVisual();
    pushHistory();
}

function insertOrReplacePre(type, lang) {
    const editor = document.getElementById('modalLessonVisual');
    if (!editor) return;

    editor.focus();
    const sel = window.getSelection();
    const ancestor = sel && sel.anchorNode ? findAncestor(sel.anchorNode, 'pre') : null;

    if (ancestor) {
        ancestor.setAttribute('data-editor', type === 'code' ? 'code' : type);
        if (type === 'code' && lang) {
            ancestor.setAttribute('data-ln', lang);
        }
        syncFromVisual();
        pushHistory();
        return;
    }

    const content = (type === 'code')
        ? `<pre data-editor="code" data-ln="${lang}"><code>// code sample</code></pre>`
        : `<pre data-editor="${type}">Output</pre>`;

    insertHtmlAtCursor(content);
}

// ---------- History ----------
let editHistory = [];
let historyIndex = -1;

function pushHistory() {
    const el = document.getElementById('modalLessonVisual');
    if (!el) return;

    const v = el.innerHTML;
    if (historyIndex < editHistory.length - 1) {
        editHistory = editHistory.slice(0, historyIndex + 1);
    }

    editHistory.push(v);
    historyIndex = editHistory.length - 1;

    if (editHistory.length > 200) {
        editHistory.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const v = editHistory[historyIndex];
        document.getElementById('modalLessonVisual').innerHTML = v;
        syncFromVisual();
    }
}

function redo() {
    if (historyIndex < editHistory.length - 1) {
        historyIndex++;
        const v = editHistory[historyIndex];
        document.getElementById('modalLessonVisual').innerHTML = v;
        syncFromVisual();
    }
}

// ---------- Sync ----------
function syncFromVisual() {
    const visual = document.getElementById('modalLessonVisual');
    const hidden = document.getElementById('modalLessonHtml');
    const code = document.getElementById('lessonCodeView');

    if (!visual || !hidden || !code) return;

    const html = visual.innerHTML;
    hidden.value = html;
    code.textContent = prettyPrintHtml(html);
}

// ---------- Dropdown helpers ----------
function showDropdown(dropdownId, btn) {
    hideAllDropdowns();
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown || !btn) return;

    const rect = btn.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 8) + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.classList.add('active');

    setTimeout(() => {
        const dropRect = dropdown.getBoundingClientRect();
        if (dropRect.bottom > window.innerHeight) {
            dropdown.style.top = (rect.top - dropRect.height - 8) + 'px';
        }
        if (dropRect.right > window.innerWidth) {
            dropdown.style.left = (window.innerWidth - dropRect.width - 10) + 'px';
        }
    }, 10);
}

function hideAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('active'));
}

// ---------- Clear styles ----------
function clearStylesForSelection() {
    const editor = document.getElementById('modalLessonVisual');
    if (!editor) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);

    if (range.collapsed) {
        let block = findAncestor(range.startContainer, 'p') ||
            findAncestor(range.startContainer, 'h3') ||
            findAncestor(range.startContainer, 'h4') ||
            findAncestor(range.startContainer, 'div');

        if (block) {
            if (block.hasAttribute('style')) {
                block.removeAttribute('style');
            }

            Array.from(block.querySelectorAll('[style]')).forEach(el => {
                el.removeAttribute('style');
            });

            if (block.tagName.toLowerCase() === 'div') {
                const p = document.createElement('p');
                p.innerHTML = block.innerHTML;
                block.parentNode.replaceChild(p, block);
            }
        }

        normalizeEditorContent(editor);
        syncFromVisual();
        pushHistory();
        return;
    }

    const container = range.commonAncestorContainer;
    const parent = container.nodeType === 3 ? container.parentElement : container;

    if (parent && parent.hasAttribute && parent.hasAttribute('style')) {
        parent.removeAttribute('style');
    }

    if (parent && parent.querySelectorAll) {
        Array.from(parent.querySelectorAll('[style]')).forEach(el => {
            el.removeAttribute('style');
        });
    }

    normalizeEditorContent(editor);
    syncFromVisual();
    pushHistory();
}

// ---------- Toolbar ----------
const toolbar = document.querySelector('.editor-toolbar');
if (toolbar) {
    toolbar.addEventListener('click', function (e) {
        const btn = e.target.closest('.toolbar-btn');
        if (!btn) return;

        const format = btn.dataset.format;

        switch (format) {
            case 'undo':
                undo();
                break;
            case 'redo':
                redo();
                break;
            case 'bold':
            case 'strong':
                document.execCommand('bold');
                syncFromVisual();
                pushHistory();
                break;
            case 'italic':
                document.execCommand('italic');
                syncFromVisual();
                pushHistory();
                break;
            case 'h3':
                document.execCommand('formatBlock', false, 'h3');
                syncFromVisual();
                pushHistory();
                break;
            case 'h4':
                document.execCommand('formatBlock', false, 'h4');
                syncFromVisual();
                pushHistory();
                break;
            case 'list':
                showDropdown('listDropdown', btn);
                break;
            case 'code':
                showDropdown('codeDropdown', btn);
                break;
            case 'image':
                const url = prompt('Enter image URL:');
                if (url) {
                    insertHtmlAtCursor(`<img src="${url}" alt="Image" />`);
                }
                break;
            case 'table':
                showDropdown('tableDropdown', btn);
                break;
            case 'clear':
                clearStylesForSelection();
                break;
        }
    });
}

// ---------- List dropdown ----------
const listDropdown = document.getElementById('listDropdown');
if (listDropdown) {
    listDropdown.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-list-type]');
        if (!btn) return;

        const type = btn.dataset.listType;
        if (type === 'ul') {
            insertHtmlAtCursor('<ul><li>List item</li></ul>');
        } else {
            insertHtmlAtCursor('<ol><li>List item</li></ol>');
        }
        hideAllDropdowns();
    });
}

// ---------- Code dropdown ----------
const codeDropdown = document.getElementById('codeDropdown');
if (codeDropdown) {
    codeDropdown.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-code-type]');
        if (!btn) return;

        const type = btn.dataset.codeType;
        if (type === 'code') {
            const lang = prompt('Enter language (e.g., js, python):') || 'js';
            insertOrReplacePre('code', lang);
        } else {
            insertOrReplacePre(type);
        }
        hideAllDropdowns();
    });
}

// ---------- Table picker ----------
const tablePicker = document.getElementById('tablePicker');
if (tablePicker) {
    tablePicker.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'table-cell-picker';
        cell.dataset.row = Math.floor(i / 10) + 1;
        cell.dataset.col = (i % 10) + 1;
        tablePicker.appendChild(cell);
    }

    tablePicker.addEventListener('mouseover', function (e) {
        if (!e.target.classList.contains('table-cell-picker')) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        document.querySelectorAll('.table-cell-picker').forEach(c => {
            const r = parseInt(c.dataset.row);
            const cl = parseInt(c.dataset.col);
            if (r <= row && cl <= col) {
                c.classList.add('selected');
            } else {
                c.classList.remove('selected');
            }
        });

        const sz = document.getElementById('tableSize');
        if (sz) sz.textContent = `${row}x${col}`;
    });

    tablePicker.addEventListener('click', function (e) {
        if (!e.target.classList.contains('table-cell-picker')) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        let table = '<table>';
        for (let r = 0; r < row; r++) {
            table += '<tr>';
            for (let c = 0; c < col; c++) {
                table += '<td>Cell</td>';
            }
            table += '</tr>';
        }
        table += '</table>';

        insertHtmlAtCursor(table);
        hideAllDropdowns();
    });
}

// ---------- Paste handling ----------
const editorEl = document.getElementById('modalLessonVisual');
if (editorEl) {
    editorEl.addEventListener('paste', function (e) {
        e.preventDefault();

        const clipboard = e.clipboardData || window.clipboardData;
        let html = clipboard.getData('text/html');
        const text = clipboard.getData('text/plain');

        if (!html && text) {
            html = text.split('\n')
                .filter(line => line.trim())
                .map(line => `<p>${escapeHtml(line)}</p>`)
                .join('');
        }

        if (!html) return;

        html = html.replace(/<!--[\s\S]*?-->/g, '');
        html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');

        const container = document.createElement('div');
        container.innerHTML = html;

        removeCommentsFromNode(container);
        stripFontStyles(container);

        insertHtmlAtCursor(container.innerHTML);
    });

    editorEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            try {
                document.execCommand('insertParagraph');
            } catch (ex) {
                insertHtmlAtCursor('<p><br></p>');
            }

            setTimeout(() => {
                normalizeEditorContent(editorEl);
                syncFromVisual();
                pushHistory();
            }, 0);
        }
    });

    editorEl.addEventListener('input', debounce(function () {
        normalizeEditorContent(editorEl);
        syncFromVisual();
        pushHistory();
    }, 150));

    editorEl.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                undo();
            } else if (e.key === 'y' || e.key === 'Y') {
                e.preventDefault();
                redo();
            }
        }
    });
}

// ---------- Open lesson modal ----------
function openLessonModalWithData(lesson) {
    document.getElementById('modalLessonId').value = lesson.id || '';
    document.getElementById('modalLessonModuleId').value = lesson.moduleId || '';
    document.getElementById('modalLessonTitle').value = lesson.title || '';
    document.getElementById('modalLessonSlug').value = lesson.slug || '';
    document.getElementById('modalLessonPosition').value = lesson.position || 0;
    document.getElementById('modalLessonPublished').checked = !!lesson.isPublished;
    document.getElementById('modalLessonFree').checked = !!lesson.isFreePreview;

    let body = decodeHtmlEntitiesIfNeeded(lesson.body || '');
    body = body.replace(/[\u200B-\u200D\uFEFF]/g, '');

    if (!body.trim()) {
        body = '<div><p><br></p></div>';
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = body;

    if (tempDiv.children.length !== 1 || tempDiv.firstElementChild.tagName.toLowerCase() !== 'div') {
        body = '<div>' + body + '</div>';
    }

    const visual = document.getElementById('modalLessonVisual');
    const hidden = document.getElementById('modalLessonHtml');

    if (visual) {
        visual.innerHTML = body;
        normalizeEditorContent(visual);
    }

    if (hidden) {
        hidden.value = visual ? visual.innerHTML : body;
    }

    syncFromVisual();

    editHistory = [visual ? visual.innerHTML : body];
    historyIndex = 0;

    showModal('lessonModalOverlay');
}

// ---------- Modal helpers ----------
function showModal(id) {
    const o = document.getElementById(id);
    if (!o) return;
    o.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal(id) {
    const o = document.getElementById(id);
    if (!o) return;
    o.setAttribute('hidden', '');
    hideAllDropdowns();
    document.body.style.overflow = '';
}

// ---------- Global click handlers ----------
document.addEventListener('click', function (e) {
    const closeTarget = e.target.getAttribute && e.target.getAttribute('data-close');
    if (closeTarget) {
        hideModal(closeTarget);
    }
});

document.querySelectorAll('[data-modal-overlay]').forEach(ov => {
    ov.addEventListener('click', function (e) {
        if (e.target === ov) {
            ov.setAttribute('hidden', '');
        }
    });
});

// ---------- ОБНОВЛЕНО: Save lesson (с Id вместо LessonId) ----------
const btnSaveLesson = document.getElementById('btnSaveLesson');
if (btnSaveLesson) {
    btnSaveLesson.addEventListener('click', async function () {
        const lessonId = document.getElementById('modalLessonId').value.trim();
        const moduleId = document.getElementById('modalLessonModuleId').value.trim();
        const title = document.getElementById('modalLessonTitle').value.trim();
        const slug = document.getElementById('modalLessonSlug').value.trim();
        const position = document.getElementById('modalLessonPosition').value || 0;
        const isPublished = document.getElementById('modalLessonPublished').checked;
        const isFree = document.getElementById('modalLessonFree').checked;

        if (!lessonId) {
            alert('Lesson ID is required');
            return;
        }

        if (!moduleId) {
            alert('Module ID is required');
            return;
        }

        if (!title) {
            alert('Title is required');
            return;
        }

        if (!slug) {
            alert('Slug is required');
            return;
        }

        const visual = document.getElementById('modalLessonVisual');
        if (visual) {
            normalizeEditorContent(visual);
            syncFromVisual();
        }

        const body = document.getElementById('modalLessonHtml').value || '';

        console.log('Saving lesson:', { lessonId, moduleId, title, slug, bodyLength: body.length });

        // ИЗМЕНЕНО: Id вместо LessonId, добавлен ModuleId
        const data = {
            Id: lessonId,
            ModuleId: moduleId,
            Title: title,
            Slug: slug,
            Body: body,
            Position: position,
            IsPublished: isPublished,
            IsFreePreview: isFree
        };

        try {
            const res = await postUrlEncoded('/AdminCourse/UpdateLesson', data);

            if (res && res.success) {
                console.log('Lesson saved successfully');
                hideModal('lessonModalOverlay');
                await loadModules();
            } else {
                const errorMsg = res && res.message ? res.message : 'Unable to save lesson';
                console.error('Save failed:', errorMsg);
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert('Error saving lesson: ' + error.message);
        }
    });
}

// ---------- Course basics form ----------
const courseBasicsForm = document.getElementById('courseBasicsForm');
if (courseBasicsForm) {
    courseBasicsForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = {
            Id: document.getElementById('Id')?.value,
            Name: document.getElementById('CourseName')?.value,
            Slug: document.getElementById('CourseSlugInput')?.value,
            ShortDescription: document.getElementById('ShortDescription')?.value,
            FullDescription: document.getElementById('FullDescription')?.value,
            MainImageUrl: document.getElementById('MainImageUrl')?.value
        };

        const res = await postUrlEncoded('/AdminCourse/UpdateCourse', formData);

        if (res && res.success) {
            alert('Course updated successfully');
        } else {
            alert(res && res.message ? res.message : 'Error updating course');
        }
    });
}

// ---------- ОБНОВЛЕНО: Save module (с возможностью редактирования ID) ----------
const btnSaveModule = document.getElementById('btnSaveModule');
if (btnSaveModule) {
    btnSaveModule.addEventListener('click', async function () {
        const id = document.getElementById('modalModuleId').value.trim();
        const slug = document.getElementById('modalModuleSlug').value.trim();
        const title = document.getElementById('modalModuleTitle').value.trim();
        const position = document.getElementById('modalModulePosition').value || 0;

        if (!id) {
            alert('Module ID is required');
            return;
        }

        if (!slug) {
            alert('Module Slug is required');
            return;
        }

        if (!title) {
            alert('Module Title is required');
            return;
        }

        const res = await postUrlEncoded('/AdminCourse/UpdateModule', {
            Id: id,
            Slug: slug,
            Title: title,
            Position: position
        });

        if (res && res.success) {
            hideModal('moduleModalOverlay');
            await loadModules();
        } else {
            alert(res && res.message ? res.message : 'Unable to save module');
        }
    });
}

// ---------- ОБНОВЛЕНО: Add module (с вводом ID) ----------
const btnAddModule = document.getElementById('btnAddModule');
if (btnAddModule) {
    btnAddModule.addEventListener('click', async function () {
        const id = prompt('Module ID (required):');
        if (!id || !id.trim()) {
            alert('Module ID is required');
            return;
        }

        const title = prompt('Module title:');
        if (!title || !title.trim()) {
            alert('Module title is required');
            return;
        }

        const courseSlugEl = document.getElementById('CourseSlug') || document.getElementById('CourseSlugInput');
        const courseSlug = courseSlugEl ? courseSlugEl.value : '';

        if (!courseSlug) {
            alert('Course slug missing');
            return;
        }

        const slug = prompt('Module slug (optional, will use ID if empty):') || id.trim();

        const res = await postUrlEncoded('/AdminCourse/AddModule', {
            Id: id.trim(),
            Slug: slug,
            Title: title.trim(),
            CourseSlug: courseSlug
        });

        if (res && res.success) {
            await loadModules();
        } else {
            alert(res && res.message ? res.message : 'Error adding module');
        }
    });
}

// ---------- Modules rendering ----------
function renderModules(modules) {
    const container = document.getElementById('modulesContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!modules || modules.length === 0) {
        container.innerHTML = '<div>No modules yet</div>';
        return;
    }

    modules.sort((a, b) => (a.position || 0) - (b.position || 0));

    modules.forEach(m => {
        const moduleDiv = document.createElement('div');
        moduleDiv.style.marginBottom = '20px';

        // Module title
        const titleDiv = document.createElement('div');
        titleDiv.textContent = m.title || '';
        titleDiv.dataset.action = 'edit-module';
        titleDiv.dataset.moduleId = m.id || '';
        titleDiv.dataset.moduleSlug = m.slug || '';
        titleDiv.dataset.moduleTitle = m.title || '';
        titleDiv.dataset.modulePosition = m.position || 0;
        titleDiv.style.fontWeight = '600';
        titleDiv.style.cursor = 'pointer';
        titleDiv.style.fontSize = '1.2rem';
        titleDiv.style.marginBottom = '5px';
        moduleDiv.appendChild(titleDiv);

        // Module ID and Position
        const infoDiv = document.createElement('div');
        infoDiv.textContent = `ID: ${m.id || 'N/A'} | Slug: ${m.slug || 'N/A'} | Position: ${m.position || 0}`;
        infoDiv.style.color = 'var(--palette-text-shadow, #999)';
        infoDiv.style.fontSize = '0.9rem';
        infoDiv.style.marginBottom = '8px';
        moduleDiv.appendChild(infoDiv);

        // Controls
        const controlsDiv = document.createElement('div');
        controlsDiv.style.display = 'flex';
        controlsDiv.style.gap = '8px';
        controlsDiv.style.marginBottom = '12px';

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️ Edit';
        editBtn.dataset.action = 'edit-module';
        editBtn.dataset.moduleId = m.id || '';
        editBtn.dataset.moduleSlug = m.slug || '';
        editBtn.dataset.moduleTitle = m.title || '';
        editBtn.dataset.modulePosition = m.position || 0;
        controlsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.dataset.action = 'delete-module';
        deleteBtn.dataset.moduleSlug = m.slug || '';
        controlsDiv.appendChild(deleteBtn);

        const addLessonBtn = document.createElement('button');
        addLessonBtn.textContent = '➕ Lesson';
        addLessonBtn.dataset.action = 'add-lesson';
        addLessonBtn.dataset.moduleId = m.id || '';
        addLessonBtn.dataset.moduleSlug = m.slug || '';
        controlsDiv.appendChild(addLessonBtn);

        moduleDiv.appendChild(controlsDiv);

        // Lessons
        if (m.lessons && m.lessons.length > 0) {
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';

            m.lessons.slice().sort((x, y) => (x.position || 0) - (y.position || 0)).forEach(l => {
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';
                li.style.marginBottom = '8px';
                li.style.padding = '8px';
                li.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                li.style.borderRadius = '4px';

                const left = document.createElement('div');

                const lessonTitle = document.createElement('div');
                lessonTitle.textContent = l.title || '';
                lessonTitle.dataset.action = 'edit-lesson';
                lessonTitle.dataset.lessonId = l.id || '';
                lessonTitle.dataset.moduleId = m.id || '';
                lessonTitle.style.cursor = 'pointer';
                lessonTitle.style.fontWeight = '600';
                left.appendChild(lessonTitle);

                const lessonInfo = document.createElement('div');
                lessonInfo.textContent = `ID: ${l.id || 'N/A'} | Slug: ${l.slug || 'N/A'}`;
                lessonInfo.style.fontSize = '0.85rem';
                lessonInfo.style.color = 'var(--palette-color-tc, #888)';
                left.appendChild(lessonInfo);

                li.appendChild(left);

                const right = document.createElement('div');
                right.style.display = 'flex';
                right.style.gap = '8px';

                const editLessonBtn = document.createElement('button');
                editLessonBtn.textContent = '✏️';
                editLessonBtn.dataset.action = 'edit-lesson';
                editLessonBtn.dataset.lessonId = l.id || '';
                editLessonBtn.dataset.moduleId = m.id || '';
                right.appendChild(editLessonBtn);

                const deleteLessonBtn = document.createElement('button');
                deleteLessonBtn.textContent = '🗑️';
                deleteLessonBtn.dataset.action = 'delete-lesson';
                deleteLessonBtn.dataset.lessonId = l.id || '';
                right.appendChild(deleteLessonBtn);

                li.appendChild(right);
                ul.appendChild(li);
            });

            moduleDiv.appendChild(ul);
        } else {
            const none = document.createElement('div');
            none.textContent = 'No lessons yet';
            none.style.color = 'var(--palette-color-tc, #888)';
            none.style.fontStyle = 'italic';
            moduleDiv.appendChild(none);
        }

        container.appendChild(moduleDiv);

        const hr = document.createElement('hr');
        hr.style.margin = '20px 0';
        hr.style.border = 'none';
        hr.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
        container.appendChild(hr);
    });
}

async function loadModules() {
    const slugEl = document.getElementById('CourseSlug') || document.getElementById('CourseSlugInput');
    const slug = slugEl ? slugEl.value : '';
    const container = document.getElementById('modulesContainer');

    if (!slug) {
        if (container) container.innerHTML = '<div>Course slug missing</div>';
        return;
    }

    const json = await getJson(`/AdminCourse/GetCourseModules?slug=${encodeURIComponent(slug)}`);

    if (json && json.success) {
        renderModules(json.data || []);
    } else {
        if (container) {
            container.innerHTML = 'Unable to load modules: ' + (json?.message || 'unknown');
        }
    }
}

// ---------- ОБНОВЛЕНО: Delegated actions ----------
document.addEventListener('click', async function (e) {
    const actionEl = e.target.closest && e.target.closest('[data-action]');

    if (!actionEl) {
        if (!e.target.closest('.dropdown-menu') && !e.target.closest('.toolbar-btn')) {
            hideAllDropdowns();
        }
        return;
    }

    const action = actionEl.dataset.action;

    try {
        if (action === 'edit-module') {
            document.getElementById('modalModuleId').value = actionEl.dataset.moduleId || '';
            document.getElementById('modalModuleSlug').value = actionEl.dataset.moduleSlug || '';
            document.getElementById('modalModuleTitle').value = actionEl.dataset.moduleTitle || '';
            document.getElementById('modalModulePosition').value = actionEl.dataset.modulePosition || 0;
            showModal('moduleModalOverlay');

        } else if (action === 'delete-module') {
            const slug = actionEl.dataset.moduleSlug;
            if (!slug) {
                alert('Module identifier missing');
                return;
            }
            if (!confirm('Delete module and its lessons?')) return;

            const res = await postUrlEncoded('/AdminCourse/DeleteModule', { moduleSlug: slug });
            if (res && res.success) {
                await loadModules();
            } else {
                alert(res && res.message ? res.message : 'Error deleting module');
            }

        } else if (action === 'add-lesson') {
            const moduleId = actionEl.dataset.moduleId;
            const moduleSlug = actionEl.dataset.moduleSlug;

            if (!moduleId) {
                alert('Module ID missing');
                return;
            }

            const lessonId = prompt('Lesson ID (required):');
            if (!lessonId || !lessonId.trim()) {
                alert('Lesson ID is required');
                return;
            }

            const title = prompt('Lesson title:');
            if (!title || !title.trim()) {
                alert('Lesson title is required');
                return;
            }

            const lessonSlug = prompt('Lesson slug (optional, will use ID if empty):') || lessonId.trim();

            const res = await postUrlEncoded('/AdminCourse/AddLesson', {
                Id: lessonId.trim(),
                ModuleId: moduleId,
                ModuleSlug: moduleSlug,
                Title: title.trim(),
                Body: '<div><p><br></p></div>',
                Slug: lessonSlug
            });

            if (res && res.success) {
                await loadModules();
            } else {
                alert(res && res.message ? res.message : 'Error adding lesson');
            }

        } else if (action === 'edit-lesson') {
            const lessonId = actionEl.dataset.lessonId;
            if (!lessonId) {
                alert('Lesson id missing');
                return;
            }

            const json = await getJson(`/AdminCourse/GetLesson?lessonId=${encodeURIComponent(lessonId)}`);

            if (!json || !json.success) {
                alert('Unable to load lesson for editing');
                return;
            }

            openLessonModalWithData(json.data || {});

        } else if (action === 'delete-lesson') {
            const lessonId = actionEl.dataset.lessonId;
            if (!lessonId) {
                alert('Lesson id missing');
                return;
            }
            if (!confirm('Delete lesson?')) return;

            const res = await postUrlEncoded('/AdminCourse/DeleteLesson', { lessonId });

            if (res && res.success) {
                await loadModules();
            } else {
                alert(res && res.message ? res.message : 'Error deleting lesson');
            }
        }
    } catch (err) {
        console.error('Action handler error', err);
        alert('Unexpected error, see console.');
    }
});

// ---------- Image preview ----------
const mainImgEl = document.getElementById('MainImageUrl');
if (mainImgEl) {
    mainImgEl.addEventListener('input', debounce(function (e) {
        const url = e.target.value.trim();
        const wrap = document.getElementById('imagePreviewWrap');
        const img = document.getElementById('imgPreview');

        if (!wrap || !img) return;

        if (!url) {
            wrap.setAttribute('hidden', '');
            img.src = '';
            return;
        }

        img.src = url;
        wrap.removeAttribute('hidden');
    }, 300));
}

// ---------- Init ----------
(function init() {
    console.log('Editor initialized - version 3.1.0 with ID editing');
    loadModules();
})();