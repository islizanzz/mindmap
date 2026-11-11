/* @ds-bundle: {"format":4,"namespace":"Memo","components":[{"name":"Sidebar"},{"name":"SectionLabel"},{"name":"ProjectItem"},{"name":"FolderItem"},{"name":"FileItem"},{"name":"Menu"},{"name":"DocHeader"},{"name":"MarkdownView"},{"name":"MindMap"},{"name":"MindMapEditor"},{"name":"CsvTable"},{"name":"EmptyState"},{"name":"Button"},{"name":"CreateProjectDialog"},{"name":"NameDialog"},{"name":"ConfirmDialog"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  // ---------- 图标：lucide 的线条（24 × 24，描边 2 px） ----------
  var DOC = [['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }], ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }]];
  var FOLDER = ['path', { d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z' }];
  var ICONS = {
    'box': [['path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }], ['path', { d: 'm3.3 7 8.7 5 8.7-5' }], ['path', { d: 'M12 22V12' }]],
    'folder': [FOLDER],
    'folder-open': [['path', { d: 'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2' }]],
    'folder-plus': [['path', { d: 'M12 10v6' }], ['path', { d: 'M9 13h6' }], FOLDER],
    'file-text': DOC.concat([['path', { d: 'M10 9H8' }], ['path', { d: 'M16 13H8' }], ['path', { d: 'M16 17H8' }]]),
    'file-spreadsheet': DOC.concat([['path', { d: 'M8 13h2' }], ['path', { d: 'M14 13h2' }], ['path', { d: 'M8 17h2' }], ['path', { d: 'M14 17h2' }]]),
    'file-plus': DOC.concat([['path', { d: 'M9 15h6' }], ['path', { d: 'M12 18v-6' }]]),
    'chevron-right': [['path', { d: 'm9 18 6-6-6-6' }]],
    'chevron-down': [['path', { d: 'm6 9 6 6 6-6' }]],
    'plus': [['path', { d: 'M5 12h14' }], ['path', { d: 'M12 5v14' }]],
    'ellipsis': [['circle', { cx: 12, cy: 12, r: 1 }], ['circle', { cx: 19, cy: 12, r: 1 }], ['circle', { cx: 5, cy: 12, r: 1 }]],
    'pencil': [['path', { d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' }], ['path', { d: 'm15 5 4 4' }]],
    'trash-2': [['path', { d: 'M3 6h18' }], ['path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }], ['path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }], ['line', { x1: 10, x2: 10, y1: 11, y2: 17 }], ['line', { x1: 14, x2: 14, y1: 11, y2: 17 }]],
    'pin': [['path', { d: 'M12 17v5' }], ['path', { d: 'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z' }]],
    'pin-off': [['path', { d: 'M12 17v5' }], ['path', { d: 'M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89' }], ['path', { d: 'm2 2 20 20' }], ['path', { d: 'M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11' }]],
    'circle-minus': [['circle', { cx: 12, cy: 12, r: 10 }], ['path', { d: 'M8 12h8' }]],
    'x': [['path', { d: 'M18 6 6 18' }], ['path', { d: 'm6 6 12 12' }]]
  };

  function Icon(name, extraClass) {
    var parts = ICONS[name] || [];
    return h('svg', { className: 'memo-icon' + (extraClass ? ' ' + extraClass : ''), viewBox: '0 0 24 24', 'aria-hidden': true },
      parts.map(function (p, i) { return h(p[0], Object.assign({ key: i }, p[1])); }));
  }

  function omit(obj, keys) {
    var out = {};
    for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) out[k] = obj[k]; }
    return out;
  }
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  // 输入法正在组字（比如拼音还没上屏）时的按键交给输入法。Safari 里上屏用的回车 isComposing 已是 false，但 keyCode 仍是 229。
  function composing(e) { var n = e.nativeEvent || e; return !!n.isComposing || n.keyCode === 229 || e.keyCode === 229; }
  // 粘贴只取纯文字，并把不间断空格（U+00A0）换成普通空格；oneLine 为真时把换行也换成空格
  function pastePlain(oneLine) {
    return function (ev) {
      var cd = ev.clipboardData; if (!cd) return;
      ev.preventDefault();
      var t = (cd.getData('text/plain') || '').replace(/\r\n?/g, '\n').replace(/ /g, ' ');
      if (oneLine) t = t.replace(/^\n+|\n+$/g, '').replace(/[ \t]*\n[ \t]*/g, ' ');
      t.split('\n').forEach(function (line, i) {
        if (i) document.execCommand('insertLineBreak');
        if (line) document.execCommand('insertText', false, line);
      });
    };
  }
  function cssNum(name, fallback) {
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }

  // 整行可点击：回车和空格也能触发
  function rowKeyDown(onActivate) {
    return function (e) {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (onActivate) onActivate(e); }
    };
  }

  // 行内的图标按钮：点击不会冒泡到整行
  function IconButton(props) {
    return h('button', {
      type: 'button',
      className: cx('memo-icon-btn', props.className),
      'aria-label': props.label,
      'aria-haspopup': props.popup ? 'menu' : undefined,
      'aria-expanded': props.expanded === undefined ? undefined : !!props.expanded,
      onClick: function (e) { e.stopPropagation(); if (props.onClick) props.onClick(e); },
      onKeyDown: function (e) { e.stopPropagation(); }
    }, Icon(props.icon));
  }

  // 图标按钮和挂在它下面的菜单
  function MenuButton(key, icon, label, onClick, open, menu) {
    return h('span', { key: key, className: 'memo-menu-anchor' },
      h(IconButton, { icon: icon, label: label, popup: true, expanded: !!open, onClick: onClick }),
      open && menu ? menu : null);
  }

  function Actions(open, children) {
    return h('span', { className: 'memo-row-actions', 'data-menu-open': open ? '' : undefined }, children);
  }

  function depthStyle(depth) { return { '--depth': depth || 0 }; }

  // ---------- 侧栏 ----------

  /** 侧栏容器：固定宽度，内容多时可以滚动，但不显示滚动条。 */
  function Sidebar(props) {
    var rest = omit(props, ['children', 'className']);
    return h('nav', Object.assign({ 'aria-label': '置顶和项目' }, rest, { className: cx('memo-sidebar', props.className) }), props.children);
  }

  /** 分区标题「置顶」「项目」。传了 onMore 时，悬停右侧出现「···」。 */
  function SectionLabel(props) {
    var rest = omit(props, ['label', 'onMore', 'menuOpen', 'menu', 'className']);
    return h('div', Object.assign({}, rest, { className: cx('memo-section-label label', props.onMore ? 'memo-section-label-actionable' : '', props.className) }),
      h('span', { className: 'memo-section-label-text' }, props.label),
      props.onMore ? Actions(props.menuOpen, MenuButton('more', 'ellipsis', '更多操作', props.onMore, props.menuOpen, props.menu)) : null);
  }

  // 可展开的一行（项目、文件夹）：整行点击展开收起，鼠标在行上时行首换成展开箭头
  function Branch(props, icon, openIcon, emptyText) {
    var rest = omit(props, ['name', 'expanded', 'depth', 'onToggle', 'onAdd', 'addMenuOpen', 'addMenu', 'onMore', 'menuOpen', 'menu', 'children', 'className']);
    var expanded = !!props.expanded;
    var depth = props.depth || 0;
    var kids = React.Children.toArray(props.children).map(function (child) {
      return React.isValidElement(child) ? React.cloneElement(child, { depth: depth + 1 }) : child;
    });
    var anyOpen = props.menuOpen || props.addMenuOpen;
    var row = h('div', Object.assign({}, rest, {
      key: 'row',
      className: cx('memo-branch', props.className),
      style: depthStyle(depth),
      role: 'button',
      tabIndex: 0,
      'aria-expanded': expanded,
      onClick: props.onToggle,
      onKeyDown: rowKeyDown(props.onToggle)
    }),
      h('span', { className: 'memo-branch-slot' },
        Icon(expanded && openIcon ? openIcon : icon, 'memo-branch-icon'),
        Icon(expanded ? 'chevron-down' : 'chevron-right', 'memo-branch-chevron')),
      h('span', { className: 'memo-branch-name', title: props.name }, props.name),
      Actions(anyOpen, [
        MenuButton('add', 'plus', '新建', props.onAdd, props.addMenuOpen, props.addMenu),
        MenuButton('more', 'ellipsis', '更多操作', props.onMore, props.menuOpen, props.menu)
      ])
    );
    if (!expanded) return row;
    return h(React.Fragment, null, row,
      kids.length ? kids : h('p', { key: 'empty', className: 'memo-branch-empty', style: depthStyle(depth + 1) }, emptyText));
  }

  /** 侧栏里的一个项目（一个本地文件夹 + 项目名称），用 box 图标。 */
  function ProjectItem(props) { return Branch(props, 'box', null, '没有文件'); }

  /** 侧栏里的一个文件夹，可以无限嵌套；收起时 folder，展开时 folder-open。 */
  function FolderItem(props) { return Branch(props, 'folder', 'folder-open', '没有文件'); }

  /** 侧栏里的一个文件：.md 用 file-text，.csv 用 file-spreadsheet；名称不带后缀。 */
  function FileItem(props) {
    var rest = omit(props, ['name', 'kind', 'current', 'depth', 'onClick', 'onMore', 'menuOpen', 'menu', 'className']);
    return h('div', Object.assign({}, rest, {
      className: cx('memo-item', props.className),
      style: depthStyle(props.depth),
      role: 'button',
      tabIndex: 0,
      'aria-current': props.current ? 'true' : undefined,
      onClick: props.onClick,
      onKeyDown: rowKeyDown(props.onClick)
    }),
      Icon(props.kind === 'csv' ? 'file-spreadsheet' : 'file-text'),
      h('span', { className: 'memo-item-title', title: props.name }, props.name),
      Actions(props.menuOpen, MenuButton('more', 'ellipsis', '更多操作', props.onMore, props.menuOpen, props.menu))
    );
  }

  /** 操作菜单：挂在按钮下方、左对齐；按屏幕位置定位，不会被侧栏截断；点外面、Esc、滚动时关闭。 */
  function Menu(props) {
    var ref = React.useRef(null);
    var p = React.useState(null); var pos = p[0], setPos = p[1];
    var onClose = props.onClose;
    React.useLayoutEffect(function () {
      if (props.inline) return;
      var el = ref.current; if (!el || !el.parentNode) return;
      var a = el.parentNode.getBoundingClientRect();
      var gap = cssNum('--space-1', 4);
      var mh = el.offsetHeight;
      var top = a.bottom + gap;
      if (props.placement === 'top' || (top + mh > window.innerHeight - gap && a.top - gap - mh > gap)) top = a.top - gap - mh;
      setPos({ position: 'fixed', top: top + 'px', left: a.left + 'px', bottom: 'auto' });
    }, [props.inline, props.placement]);
    React.useEffect(function () {
      if (props.inline) return undefined;
      function onDown(e) {
        var el = ref.current; if (!el) return;
        var anchor = el.parentNode;
        if (anchor && anchor.contains(e.target)) return;
        if (onClose) onClose();
      }
      function onKey(e) { if (e.key === 'Escape' && onClose) onClose(); }
      function onScroll(e) { var el = ref.current; if (el && el.contains(e.target)) return; if (onClose) onClose(); }
      document.addEventListener('mousedown', onDown);
      document.addEventListener('keydown', onKey, true);
      window.addEventListener('scroll', onScroll, true);
      return function () {
        document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey, true);
        window.removeEventListener('scroll', onScroll, true);
      };
    }, [onClose, props.inline]);
    return h('div', {
      ref: ref,
      className: cx('memo-menu text', props.className),
      role: 'menu',
      style: props.inline ? undefined : (pos || { visibility: 'hidden' }),
      onClick: function (e) { e.stopPropagation(); }
    }, (props.items || []).map(function (it, i) {
      return h('button', {
        key: i, type: 'button', role: 'menuitem', className: 'memo-menu-item',
        'data-state': it.state,
        onClick: function (e) { if (it.onClick) it.onClick(e); if (onClose) onClose(); }
      }, it.icon ? Icon(it.icon) : null, it.label);
    }));
  }

  // ---------- 正文区 ----------

  /** 正文区顶部的标题区：靠左显示文件名（不带后缀），16 px，没有分割线，固定在顶部。 */
  function DocHeader(props) {
    var rest = omit(props, ['name', 'children', 'className']);
    return h('header', Object.assign({}, rest, { className: cx('memo-doc-header', props.className) }),
      h('h1', { className: 'memo-doc-header-title title', title: props.name }, props.name),
      props.children ? h('span', { className: 'memo-doc-header-actions' }, props.children) : null);
  }

  // Markdown 的行内样式：**加粗**、*斜体*、`代码`、[链接](地址)
  function inline(text) {
    var out = []; var re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g; var last = 0; var m; var k = 0;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index));
      var t = m[0];
      if (t.slice(0, 2) === '**') out.push(h('strong', { key: k++ }, t.slice(2, -2)));
      else if (t[0] === '*') out.push(h('em', { key: k++ }, t.slice(1, -1)));
      else if (t[0] === '`') out.push(h('code', { key: k++ }, t.slice(1, -1)));
      else { var mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t); out.push(h('a', { key: k++, href: mm[2], target: '_blank', rel: 'noreferrer' }, mm[1])); }
      last = m.index + t.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }
  function plain(text) { return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); }

  var LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  var uid = 0; function nid() { uid += 1; return 'n' + uid; }

  // 表格（GFM）：表头行 + 分隔行（| --- | :---: |），后面是数据行
  var TABLE_SEP_RE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
  function isTableStart(lines, i) {
    return lines[i].indexOf('|') >= 0 && i + 1 < lines.length && lines[i + 1].indexOf('|') >= 0 && TABLE_SEP_RE.test(lines[i + 1]);
  }
  function splitRow(line) {
    var s = line.trim(); var cells = []; var cell = '';
    if (s[0] === '|') s = s.slice(1);
    if (s[s.length - 1] === '|' && s[s.length - 2] !== '\\') s = s.slice(0, -1);
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === '\\' && s[i + 1] === '|') { cell += '|'; i++; }
      else if (c === '|') { cells.push(cell.trim()); cell = ''; }
      else cell += c;
    }
    cells.push(cell.trim());
    return cells;
  }
  function parseTable(raw) {
    var lines = raw.split('\n');
    var align = splitRow(lines[1]).map(function (c) {
      var l = c[0] === ':', r = c[c.length - 1] === ':';
      return l && r ? 'center' : r ? 'right' : undefined;
    });
    return { head: splitRow(lines[0]), align: align, rows: lines.slice(2).map(splitRow) };
  }
  // 单元格里的 <br>、<br/>、<br /> 换行
  function cellInline(text) {
    var out = [];
    text.split(/<br\s*\/?>/i).forEach(function (part, i) {
      if (i > 0) out.push(h('br', { key: 'br' + i }));
      out.push(h(React.Fragment, { key: 'p' + i }, inline(part)));
    });
    return out;
  }
  // 编辑单元格时显示的文字：<br> 变成换行；写回时换行再变回 <br>，| 转义
  function cellEditText(text) { return text.replace(/<br\s*\/?>/gi, '\n'); }
  // 把第 r 行（0 是表头，1 起是数据行）第 c 列改成 text，只重写这一行，其他行保持原样；没改动就原样返回
  function withCell(raw, r, c, text) {
    var lines = raw.split('\n'); var li = r === 0 ? 0 : r + 1; if (li >= lines.length) return raw;
    var n = splitRow(lines[0]).length; var cells = splitRow(lines[li]);
    while (cells.length < n) cells.push('');
    if (cellEditText(cells[c]) === text.trim()) return raw;
    cells[c] = text.trim().replace(/\r?\n/g, '<br>');
    lines[li] = '| ' + cells.slice(0, n).map(function (x) { return x.replace(/\|/g, '\\|'); }).join(' | ') + ' |';
    return lines.join('\n');
  }
  // ctx：{ active: {r, c} | null, ref(r, c), open(r, c), blur(), paste }，用来让单元格直接编辑
  function renderTable(raw, ctx) {
    var t = parseTable(raw); var n = t.head.length;
    function cells(row, tag, r) {
      var out = [];
      for (var j = 0; j < n; j++) {
        (function (j) {
          var on = ctx.active && ctx.active.r === r && ctx.active.c === j;
          var props = { key: on ? j + '-e' : j, ref: ctx.ref(r, j), style: t.align[j] ? { textAlign: t.align[j] } : undefined, onClick: function () { ctx.open(r, j); } };
          if (on) { props.contentEditable = true; props.suppressContentEditableWarning = true; props.className = 'memo-md-cell-editing'; props.onBlur = ctx.blur; props.onPaste = ctx.paste; }
          out.push(h(tag, props, on ? cellEditText(row[j] || '') : cellInline(row[j] || '')));
        })(j);
      }
      return out;
    }
    return h('span', { className: 'memo-md-table-scroll' },
      h('table', null,
        h('thead', null, h('tr', null, cells(t.head, 'th', 0))),
        h('tbody', null, t.rows.map(function (r, i) { return h('tr', { key: i }, cells(r, 'td', i + 1)); }))));
  }

  // 把 Markdown 拆成块：标题、段落、列表、代码、表格
  function parseBlocks(md) {
    var lines = (md || '').replace(/\r\n/g, '\n').split('\n'); var blocks = []; var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (!line.trim()) { i++; continue; }
      if (/^```/.test(line)) {
        var buf = [line]; i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        if (i < lines.length) { buf.push(lines[i]); i++; }
        blocks.push({ id: nid(), type: 'code', raw: buf.join('\n') }); continue;
      }
      if (isTableStart(lines, i)) {
        var tb = [line, lines[i + 1]]; i += 2;
        while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') >= 0) { tb.push(lines[i]); i++; }
        blocks.push({ id: nid(), type: 'table', raw: tb.join('\n') }); continue;
      }
      var hm = /^(#{1,6})\s+(.*)$/.exec(line);
      if (hm) { blocks.push({ id: nid(), type: 'heading', level: hm[1].length, raw: line }); i++; continue; }
      if (LIST_RE.test(line)) {
        var items = [];
        while (i < lines.length && lines[i].trim() && LIST_RE.test(lines[i])) { items.push(lines[i]); i++; }
        blocks.push({ id: nid(), type: 'list', raw: items.join('\n') }); continue;
      }
      var para = [];
      while (i < lines.length && lines[i].trim() && !LIST_RE.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !/^```/.test(lines[i]) && !isTableStart(lines, i)) { para.push(lines[i]); i++; }
      blocks.push({ id: nid(), type: 'paragraph', raw: para.join('\n') });
    }
    return blocks;
  }
  function serializeBlocks(blocks) { return blocks.map(function (b) { return b.raw; }).filter(function (r) { return r !== ''; }).join('\n\n') + '\n'; }

  // 列表 ⇄ 树
  function listToTree(raw) {
    var root = { id: nid(), children: [] }; var stack = [{ indent: -1, node: root }];
    raw.split('\n').forEach(function (line) {
      var m = LIST_RE.exec(line); if (!m) return;
      var indent = m[1].replace(/\t/g, '  ').length;
      var node = { id: nid(), text: m[3], ordered: /\d/.test(m[2]), children: [] };
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      stack[stack.length - 1].node.children.push(node);
      stack.push({ indent: indent, node: node });
    });
    return root;
  }
  function treeToList(root) {
    var out = [];
    (function walk(nodes, level) {
      nodes.forEach(function (n, i) {
        out.push(new Array(level + 1).join('  ') + (n.ordered ? (i + 1) + '. ' : '- ') + n.text);
        walk(n.children, level + 1);
      });
    })(root.children, 0);
    return out.join('\n');
  }

  // ---------- 思维导图 ----------
  // 用和主题完全一样的样式测量文字，保证连线和主题位置准确。maxText 为文字区最大宽度，超过就换行。
  var measurer = null;
  function measureText(text, maxText) {
    if (!measurer) {
      measurer = document.createElement('div');
      measurer.className = 'text';
      measurer.setAttribute('aria-hidden', 'true');
      measurer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;width:max-content;white-space:pre-wrap;word-break:break-word;';
      document.body.appendChild(measurer);
    }
    measurer.style.maxWidth = maxText ? maxText + 'px' : 'none';
    measurer.textContent = text || '';
    var r = measurer.getBoundingClientRect();
    return { w: Math.ceil(r.width), h: Math.ceil(r.height) };
  }
  function layoutTree(rootLabel, tree, minLeaf, textOf) {
    var row = cssNum('--mindmap-row', 30), gap = cssNum('--space-1', 4), stem = cssNum('--mindmap-stem', 24),
      pad = cssNum('--space-2', 8), rootPad = cssNum('--space-3', 16), max = cssNum('--mindmap-node-max', 440), bd = 1;
    var nodes = [], links = [];
    function measure(n, isRoot) {
      // 每个主题左右各留 space-2（含 1 px 边框），鼠标移上去时的边框画在这块边距外沿；超过最大宽度就换行，主题变高
      var side = (isRoot ? rootPad : pad) + bd;
      var m = measureText(isRoot ? rootLabel : (textOf ? textOf(n) : plain(n.text)), isRoot ? 0 : max - side * 2);
      n._w = Math.max(m.w, minLeaf && !isRoot ? minLeaf : 0) + side * 2;
      n._nh = Math.max(row, m.h + gap * 2);
      n.children.forEach(function (c) { measure(c, false); });
      var sum = n.children.reduce(function (s, c) { return s + c._h; }, 0) + Math.max(0, n.children.length - 1) * gap;
      n._h = Math.max(n._nh, sum);
    }
    function place(n, x, top, isRoot, parent) {
      var cy = top + n._h / 2;
      nodes.push({ node: n, x: x, y: cy - n._nh / 2, w: n._w, h: n._nh, root: isRoot, parent: parent });
      if (!n.children.length) return;
      var trunkX = x + n._w + stem;
      var childX = trunkX + stem;
      var t = top + (n._h - (n.children.reduce(function (s, c) { return s + c._h; }, 0) + (n.children.length - 1) * gap)) / 2;
      var ys = [];
      n.children.forEach(function (c) { place(c, childX, t, false, n); ys.push(t + c._h / 2); t += c._h + gap; });
      links.push({ from: [x + n._w, cy], trunkX: trunkX, ys: ys, toX: childX });
    }
    measure(tree, true);
    place(tree, 0, 0, true, null);
    var width = nodes.reduce(function (m, n) { return Math.max(m, n.x + n.w); }, 0);
    return { nodes: nodes, links: links, width: width, height: tree._h, row: row };
  }
  function linkPaths(l) {
    var r = cssNum('--mindmap-corner', 8); var x = l.trunkX; var y0 = l.from[1]; var d = [];
    d.push('M' + l.from[0] + ' ' + y0 + 'H' + x);
    if (l.ys.length === 1 && Math.abs(l.ys[0] - y0) < 0.5) { d.push('M' + x + ' ' + y0 + 'H' + l.toX); return d; }
    l.ys.forEach(function (y) {
      if (Math.abs(y - y0) < 0.5) { d.push('M' + x + ' ' + y + 'H' + l.toX); return; }
      var s = y > y0 ? 1 : -1; var rr = Math.min(r, Math.abs(y - y0));
      d.push('M' + x + ' ' + y0 + 'V' + (y - s * rr) + 'Q' + x + ' ' + y + ' ' + (x + rr) + ' ' + y + 'H' + l.toX);
    });
    return d;
  }

  function MapCanvas(props) {
    var L = props.layout || layoutTree(props.rootLabel, props.tree, props.editable ? 32 : 0, props.textOf);
    var stroke = cssNum('--mindmap-stroke', 2);
    var cs = { width: L.width + 'px', height: L.height + 'px' };
    if (props.scale && props.scale < 1) { cs.transform = 'scale(' + props.scale + ')'; cs.transformOrigin = '0 0'; }
    return h('div', { className: 'memo-map-canvas', style: cs },
      h('svg', { className: 'memo-map-links', width: L.width, height: L.height, 'aria-hidden': true },
        L.links.map(function (l, i) {
          return linkPaths(l).map(function (d, j) { return h('path', { key: i + '-' + j, d: d, strokeWidth: stroke }); });
        })),
      L.nodes.map(function (n) {
        var style = { left: n.x + 'px', top: n.y + 'px', width: n.w + 'px', height: n.h + 'px' };
        if (n.root) return h('div', { key: n.node.id, className: 'memo-map-node memo-map-root', style: style }, props.rootLabel);
        return props.renderNode ? props.renderNode(n.node, style) :
          h('div', { key: n.node.id, className: 'memo-map-node', style: style }, inline(n.node.text));
      }));
  }

  /** 思维导图（只读）：从左往右展开，开始主题固定是「/」，连线是圆角折线。比容器宽时整张按比例缩小。文字可以选中复制；鼠标移上去时右上角出现「全屏查看」，点它调用 onOpen。 */
  function MindMap(props) {
    var label = props.rootLabel || '/';
    var L = layoutTree(label, props.tree, 0);
    var ref = React.useRef(null);
    var ws = React.useState(0); var avail = ws[0], setAvail = ws[1];
    React.useLayoutEffect(function () {
      var el = ref.current; if (!el) return;
      function measure() { var cs = getComputedStyle(el); setAvail(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)); }
      measure();
      if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return function () { window.removeEventListener('resize', measure); }; }
      var ro = new ResizeObserver(measure); ro.observe(el); return function () { ro.disconnect(); };
    }, []);
    var scale = avail && L.width > avail ? avail / L.width : 1;
    // 拖动选中：主题是各自浮在画布上的，鼠标落到空白处时浏览器会把选区接到别的主题上。
    // 这里把选区两端固定在主题里：鼠标在某个主题上就停在鼠标处；在空白处就停在最后经过的主题的开头或结尾。
    React.useEffect(function () {
      var root = ref.current; if (!root) return;
      var drag = null, busy = false;
      function nodeAt(x, y) {
        var el = document.elementFromPoint(x, y); el = el && el.closest ? el.closest('.memo-map-node') : null;
        return el && root.contains(el) ? el : null;
      }
      function caret(x, y, el) {
        var r = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
        if (r && el.contains(r.startContainer)) return [r.startContainer, r.startOffset];
        var b = el.getBoundingClientRect();
        return x < b.left + b.width / 2 ? [el, 0] : [el, el.childNodes.length];
      }
      function edge(el, x, y) {
        var b = el.getBoundingClientRect();
        var after = y > b.bottom || (y >= b.top && x > b.left + b.width / 2);
        return after ? [el, el.childNodes.length] : [el, 0];
      }
      function fix() {
        if (!drag || busy) return;
        var over = nodeAt(drag.x, drag.y); if (over) drag.last = over;
        var f = over ? caret(drag.x, drag.y, over) : edge(drag.last, drag.x, drag.y);
        var sel = window.getSelection(); var a = drag.anchor;
        if (sel.anchorNode === a[0] && sel.anchorOffset === a[1] && sel.focusNode === f[0] && sel.focusOffset === f[1]) return;
        busy = true; try { sel.setBaseAndExtent(a[0], a[1], f[0], f[1]); } catch (e) {} busy = false;
      }
      function down(e) {
        if (e.button !== 0 || e.detail > 1) { drag = null; return; }
        var el = e.target.closest ? e.target.closest('.memo-map-node') : null;
        if (!el || !root.contains(el)) { drag = null; return; }
        drag = { anchor: caret(e.clientX, e.clientY, el), last: el, x: e.clientX, y: e.clientY };
      }
      function move(e) { if (!drag) return; if (!(e.buttons & 1)) { drag = null; return; } drag.x = e.clientX; drag.y = e.clientY; requestAnimationFrame(fix); }
      function up() { if (drag) { fix(); drag = null; } }
      function change() { if (drag) requestAnimationFrame(fix); }
      root.addEventListener('mousedown', down);
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
      document.addEventListener('selectionchange', change);
      return function () {
        root.removeEventListener('mousedown', down);
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        document.removeEventListener('selectionchange', change);
      };
    }, []);
    // 复制时每个主题占一行，不会连成一串
    function copyNodes(ev) {
      var sel = window.getSelection(); if (!sel || !sel.rangeCount || sel.isCollapsed) return;
      var r = sel.getRangeAt(0); var lines = [];
      ref.current.querySelectorAll('.memo-map-node').forEach(function (el) {
        if (!r.intersectsNode(el)) return;
        var nr = document.createRange(); nr.selectNodeContents(el);
        if (r.compareBoundaryPoints(Range.START_TO_START, nr) > 0) nr.setStart(r.startContainer, r.startOffset);
        if (r.compareBoundaryPoints(Range.END_TO_END, nr) < 0) nr.setEnd(r.endContainer, r.endOffset);
        var t = nr.toString(); if (t) lines.push(t);
      });
      if (!lines.length) return;
      ev.preventDefault(); ev.clipboardData.setData('text/plain', lines.join('\n'));
    }
    return h('div', {
      ref: ref,
      className: cx('memo-map memo-map-framed', props.className),
      onCopy: copyNodes
    },
      props.onOpen ? h('button', { type: 'button', className: 'memo-map-expand text', onClick: props.onOpen }, '全屏查看') : null,
      h('div', { className: 'memo-map-fit', style: { height: Math.ceil(L.height * scale) + 'px' } },
        h(MapCanvas, { rootLabel: label, tree: props.tree, layout: L, scale: scale })));
  }

  function cloneTree(n) { return { id: n.id, text: n.text, ordered: n.ordered, children: n.children.map(cloneTree) }; }
  function findParent(root, id) {
    var res = null;
    (function walk(p) { p.children.forEach(function (c, i) { if (c.id === id) res = { parent: p, index: i }; else walk(c); }); })(root);
    return res;
  }
  function flatIds(root) { var a = []; (function w(n) { n.children.forEach(function (c) { a.push(c.id); w(c); }); })(root); return a; }

  /** 全屏思维导图编辑：只显示这一张导图，以思维导图的方式编辑。改动通过 onChange(tree) 交给使用方写回 .md。 */
  function MindMapEditor(props) {
    var s = React.useState(function () { return cloneTree(props.tree); }); var tree = s[0], setTree = s[1];
    var f = React.useState(props.focusId || null); var focusId = f[0], setFocusId = f[1];
    var refs = React.useRef({});
    var treeRef = React.useRef(tree); treeRef.current = tree;
    // 正在输入的文字：只用来重新排版（换行、主题变高），不回写到主题里，避免打断输入
    var dr = React.useState({}); var drafts = dr[0], setDrafts = dr[1];
    function textOf(n) { return Object.prototype.hasOwnProperty.call(drafts, n.id) ? drafts[n.id] : plain(n.text); }

    React.useEffect(function () {
      var el = focusId && refs.current[focusId];
      if (el && !props.inline) {
        el.focus();
        var r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      }
    }, [focusId]);
    var focusRef = React.useRef(focusId); focusRef.current = focusId;
    // 关闭前先把正在编辑的节点存下来
    function flushAndClose() {
      var id = focusRef.current;
      if (id && refs.current[id] && findParent(treeRef.current, id)) {
        var r = withText(id); setTree(r.next); if (props.onChange) props.onChange(r.next);
      }
      if (props.onClose) props.onClose();
    }
    React.useEffect(function () {
      if (props.inline) return undefined;
      function onKey(e) { if (e.key === 'Escape' && !composing(e)) { e.preventDefault(); e.stopPropagation(); flushAndClose(); } }
      document.addEventListener('keydown', onKey, true);
      return function () { document.removeEventListener('keydown', onKey, true); };
    }, [props.onClose, props.inline]);

    function commit(next, nextFocus) { setDrafts({}); setTree(next); if (nextFocus !== undefined) setFocusId(nextFocus); if (props.onChange) props.onChange(next); }
    function readText(id) { var el = refs.current[id]; return el ? el.textContent : null; }
    function withText(id) {
      var next = cloneTree(treeRef.current); var t = readText(id);
      var loc = findParent(next, id); if (loc && t !== null) loc.parent.children[loc.index].text = t;
      return { next: next, loc: loc };
    }
    function onKeyDown(n) {
      return function (e) {
        var r;
        if (composing(e)) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); r = withText(n.id);
          var sib = { id: nid(), text: '', ordered: n.ordered, children: [] };
          r.loc.parent.children.splice(r.loc.index + 1, 0, sib); commit(r.next, sib.id);
        } else if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault(); r = withText(n.id);
          var self = r.loc.parent.children[r.loc.index];
          var kid = { id: nid(), text: '', ordered: self.children.length ? self.children[0].ordered : false, children: [] };
          self.children.push(kid); commit(r.next, kid.id);
        } else if ((e.key === 'Backspace' || e.key === 'Delete') && !(readText(n.id) || '').length) {
          e.preventDefault(); r = withText(n.id);
          var ids = flatIds(r.next); var pos = ids.indexOf(n.id);
          r.loc.parent.children.splice(r.loc.index, 1);
          var rest = flatIds(r.next);
          commit(r.next, rest.length ? (ids[pos - 1] && rest.indexOf(ids[pos - 1]) >= 0 ? ids[pos - 1] : rest[0]) : null);
        }
      };
    }
    function onBlur(n) {
      return function () {
        var t = readText(n.id); if (t === null || t === n.text) return;
        var r = withText(n.id); commit(r.next);
      };
    }
    function renderNode(n, style) {
      return h('div', {
        key: n.id, className: 'memo-map-node memo-map-node-edit', style: style,
        contentEditable: !props.inline, suppressContentEditableWarning: true,
        'data-state': props.inline && n.id === props.focusId ? 'editing' : undefined,
        ref: function (el) { refs.current[n.id] = el; },
        onFocus: function () { if (focusId !== n.id) setFocusId(n.id); },
        onKeyDown: onKeyDown(n), onBlur: onBlur(n), onPaste: pastePlain(true),
        onInput: function (ev) { var t = ev.currentTarget.textContent; setDrafts(function (d) { var o = Object.assign({}, d); o[n.id] = t; return o; }); }
      }, n.text);
    }
    function addFirst() {
      var next = cloneTree(treeRef.current); var kid = { id: nid(), text: '', ordered: false, children: [] };
      next.children.push(kid); commit(next, kid.id);
    }
    var box = h('div', { className: cx('memo-map-editor', props.inline ? 'memo-map-editor-inline' : ''), role: 'dialog', 'aria-label': '编辑思维导图' },
      h('div', { className: 'memo-map-editor-close' }, h(IconButton, { icon: 'x', label: '关闭', onClick: flushAndClose })),
      h('div', { className: 'memo-map-editor-body' },
        h('div', { className: 'memo-map' }, h(MapCanvas, { rootLabel: props.rootLabel || '/', tree: tree, editable: true, renderNode: renderNode, textOf: textOf })),
        tree.children.length ? null : h(Button, { variant: 'text', icon: 'plus', onClick: addFirst }, '添加节点')),
      h('p', { className: 'memo-map-editor-hint' }, '回车：添加同级节点　Tab：添加子节点　删空后按删除键：删除节点　Esc：返回'));
    return box;
  }

  // ---------- 正文编辑：光标 ----------
  function focusRange() {
    var sel = window.getSelection(); if (!sel || !sel.rangeCount) return null;
    var r = document.createRange(); r.setStart(sel.focusNode, sel.focusOffset); return r;
  }
  // 光标在屏幕上的位置；空行量不出来时，临时放一个零宽字符来量
  function caretRect() {
    var r = focusRange(); if (!r) return null;
    var rs = r.getClientRects(); if (rs.length) return rs[0];
    var m = document.createElement('span'); m.textContent = '​'; r.insertNode(m);
    var b = m.getBoundingClientRect(); m.parentNode.removeChild(m); return b;
  }
  function caretX() { var c = caretRect(); return c ? c.left : null; }
  // 文字区（去掉内边距）的上下沿和行高
  function lineBox(el) {
    var cs = getComputedStyle(el); var b = el.getBoundingClientRect();
    var lh = parseFloat(cs.lineHeight); if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.5;
    return { top: b.top + parseFloat(cs.paddingTop), bottom: b.bottom - parseFloat(cs.paddingBottom), lh: lh };
  }
  // 按显示出来的行算（长段落自动换行也算）
  function onFirstLine(el) { var c = caretRect(); if (!c) return true; var L = lineBox(el); return c.top < L.top + L.lh / 2; }
  function onLastLine(el) { var c = caretRect(); if (!c) return true; var L = lineBox(el); return c.bottom > L.bottom - L.lh / 2; }
  // 光标前面（after 为真时是后面）的文字
  function textBeside(el, after) {
    var f = focusRange(); if (!f) return '';
    var r = document.createRange(); r.selectNodeContents(el);
    if (after) r.setStart(f.startContainer, f.startOffset); else r.setEnd(f.startContainer, f.startOffset);
    return after ? r.toString().replace(/\n+$/, '') : r.toString();
  }
  // 回车拆段：删掉选中的文字，在光标处临时放一个标记，取出整段文字后按标记切成前后两半
  function splitAtCaret(el) {
    var sel = window.getSelection(); if (!sel || !sel.rangeCount || !el.contains(sel.anchorNode)) return null;
    var r = sel.getRangeAt(0); r.deleteContents();
    var m = document.createTextNode(''); r.insertNode(m);
    var t = el.innerText.replace(/\n$/, ''); m.parentNode.removeChild(m);
    var i = t.indexOf(''); if (i < 0) return null;
    return [t.slice(0, i), t.slice(i + 1)];
  }
  function indexOfId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return i; return -1; }
  function isTyping(el) { return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)); }

  /** Markdown 正文：其他内容正常显示，可以直接点击修改；有序和无序列表都画成思维导图，点击后全屏编辑。
   *  回车在光标处拆段，段首按删除键和上一段合并；方向键在段落之间移动；
   *  拖过几段、⌘A 两次或 Shift+↑↓ 越过段首段尾会选中整块，可以复制、剪切、删除，删除后 ⌘Z 恢复。 */
  function MarkdownView(props) {
    var s = React.useState(function () { return parseBlocks(props.value); }); var blocks = s[0], setBlocks = s[1];
    var e = React.useState(null); var editing = e[0], setEditing = e[1];
    var m = React.useState(null); var mapOpen = m[0], setMapOpen = m[1];
    // 选中的整块：{ anchor, focus } 是块的序号
    var bs = React.useState(null); var bsel = bs[0], setBsel = bs[1];
    var refs = React.useRef({});
    var rootRef = React.useRef(null);
    var blocksRef = React.useRef(blocks); blocksRef.current = blocks;
    var editingRef = React.useRef(editing); editingRef.current = editing;
    var bselRef = React.useRef(bsel); bselRef.current = bsel;
    var mapRef = React.useRef(mapOpen); mapRef.current = mapOpen;
    var caret = React.useRef(null);      // 进入下一块后光标放哪：{ at: 'start' | 'end' | 偏移 }，或 { x, line: 'first' | 'last' }
    var switching = React.useRef(false); // 换块时旧块被换下，不当作失焦再提交一次
    var history = React.useRef([]);      // 删除整块之前的内容，⌘Z 恢复
    var noClick = React.useRef(false);   // 拖选结束时的那次点击不进入编辑
    // 表格：正在编辑的单元格 { id: 块, r: 行（0 是表头）, c: 列 }。表格不整块切成文本，而是直接编辑单元格
    var cs = React.useState(null); var cellPos = cs[0], setCellPos = cs[1];
    var cellPosRef = React.useRef(null);
    var cellRefs = React.useRef({});
    var cellCaret = React.useRef(null);  // 进入下一个单元格后光标放哪，规则同 caret
    function setCell(p) { cellPosRef.current = p; setCellPos(p); }

    // 把光标放进 el：上下移动时尽量保持横向位置
    function focusAt(el, c) {
      el.focus();
      var r = null;
      // 上下移动时尽量保持光标的横向位置
      if (c.x != null && document.caretRangeFromPoint) {
        var L = lineBox(el);
        var p = document.caretRangeFromPoint(c.x, c.line === 'last' ? L.bottom - L.lh / 2 : L.top + L.lh / 2);
        if (p && el.contains(p.startContainer)) r = p;
      }
      if (!r) {
        r = document.createRange(); var t = el.firstChild;
        if (typeof c.at === 'number' && t && t.nodeType === 3) r.setStart(t, Math.min(c.at, t.length));
        else { r.selectNodeContents(el); r.collapse(c.at === 'start'); }
      }
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }

    // 表格里，光标的横向位置落在第几列
    function colAtX(x, n) {
      if (x == null) return 0;
      for (var j = 0; j < n; j++) { var el = cellRefs.current['0-' + j]; if (el && x < el.getBoundingClientRect().right) return j; }
      return n - 1;
    }
    // 从别的块（或点击）进入一个表格时，落在哪个单元格
    function pickCell(b, c) {
      var t = parseTable(b.raw); var rows = t.rows.length + 1; var n = t.head.length;
      if (c.line === 'first' || c.line === 'last') return { id: b.id, r: c.line === 'first' ? 0 : rows - 1, c: colAtX(c.x, n) };
      if (c.at === 'start') return { id: b.id, r: 0, c: 0 };
      return { id: b.id, r: rows - 1, c: n - 1 };
    }

    React.useEffect(function () {
      switching.current = false;
      var c = caret.current || { at: 'end' }; caret.current = null;
      var b = editing ? blocksRef.current[indexOfId(blocksRef.current, editing)] : null;
      if (b && b.type === 'table') {
        // 点击单元格进入时已经选好了单元格；从别的块进入时在这里挑
        if (!cellPosRef.current || cellPosRef.current.id !== editing) { cellCaret.current = c; setCell(pickCell(b, c)); }
        return;
      }
      if (cellPosRef.current) setCell(null);
      var el = editing && refs.current[editing];
      if (!el) return;
      focusAt(el, c);
    }, [editing]);
    React.useEffect(function () {
      if (!cellPos) return;
      switching.current = false;
      var c = cellCaret.current || { at: 'end' }; cellCaret.current = null;
      var el = cellRefs.current[cellPos.r + '-' + cellPos.c];
      if (el && el.isContentEditable) focusAt(el, c);
    }, [cellPos]);

    function save(next, keepHistory) {
      if (!keepHistory && serializeBlocks(next) !== serializeBlocks(blocksRef.current)) history.current = [];
      blocksRef.current = next; setBlocks(next);
      if (props.onChange) props.onChange(serializeBlocks(next));
    }
    function rawOf(id) { var el = refs.current[id]; return el ? el.innerText.replace(/\n$/, '') : null; }
    // 表格块当前的内容：把正在编辑的单元格的文字写回
    function tableRaw(b) {
      var p = cellPosRef.current; if (!p || p.id !== b.id) return b.raw;
      var el = cellRefs.current[p.r + '-' + p.c]; if (!el || !el.isContentEditable) return b.raw;
      return withCell(b.raw, p.r, p.c, el.innerText.replace(/\n$/, ''));
    }
    // 在同一个表格里换到另一个单元格
    function goCell(b, r, c, spec) {
      var cur = blocksRef.current; var i = indexOfId(cur, b.id); var raw = tableRaw(cur[i]);
      cellCaret.current = spec; switching.current = true;
      if (raw !== cur[i].raw) save(cur.map(function (x) { return x.id === b.id ? Object.assign({}, x, { raw: raw }) : x; }));
      setCell({ id: b.id, r: r, c: c });
    }
    // 点击单元格：直接在这个单元格里编辑
    function openCell(b, r, c) {
      if (noClick.current) return;
      var p = cellPosRef.current;
      if (editingRef.current === b.id && p && p.id === b.id) { if (p.r !== r || p.c !== c) goCell(b, r, c, { at: 'end' }); return; }
      cellCaret.current = { at: 'end' }; setCell({ id: b.id, r: r, c: c }); setEditing(b.id);
    }
    function cellBlur(b) {
      if (switching.current || editingRef.current !== b.id) return;
      var next = commitBlock(b.id); setCell(null); setEditing(null); save(next);
    }
    // 表格里的按键：Tab / Shift+Tab 换格，回车到下一行，Shift+回车单元格内换行，方向键到头后换格或离开表格
    function tableKeyDown(b, ev) {
      if (composing(ev)) return;
      var p = cellPosRef.current; if (!p || p.id !== b.id) return;
      var el = cellRefs.current[p.r + '-' + p.c]; if (!el) return;
      var cur = blocksRef.current; var t = parseTable(cur[indexOfId(cur, b.id)].raw);
      var nrows = t.rows.length + 1, ncols = t.head.length; var nb;
      var sel = window.getSelection(); var collapsed = !!sel && sel.isCollapsed;
      var plain = !ev.metaKey && !ev.ctrlKey && !ev.altKey && !ev.shiftKey;
      if (ev.key === 'Escape') { ev.preventDefault(); el.blur(); return; }
      if (ev.key === 'Tab') {
        ev.preventDefault();
        if (ev.shiftKey) { if (p.c > 0) goCell(b, p.r, p.c - 1, { at: 'end' }); else if (p.r > 0) goCell(b, p.r - 1, ncols - 1, { at: 'end' }); }
        else if (p.c + 1 < ncols) goCell(b, p.r, p.c + 1, { at: 'end' });
        else if (p.r + 1 < nrows) goCell(b, p.r + 1, 0, { at: 'end' });
        return;
      }
      if (ev.key === 'Enter' && !ev.metaKey && !ev.ctrlKey) {
        ev.preventDefault();
        if (ev.shiftKey) document.execCommand('insertLineBreak');
        else if (p.r + 1 < nrows) goCell(b, p.r + 1, p.c, { at: 'end' });
        else el.blur();
        return;
      }
      if (!plain || !collapsed) return;
      if (ev.key === 'ArrowUp' && onFirstLine(el)) {
        ev.preventDefault(); var x = caretX();
        if (p.r > 0) goCell(b, p.r - 1, p.c, { x: x, line: 'last' });
        else if ((nb = neighbor(b.id, -1))) moveTo(b.id, nb.id, { x: x, line: 'last' });
      } else if (ev.key === 'ArrowDown' && onLastLine(el)) {
        ev.preventDefault(); var y = caretX();
        if (p.r + 1 < nrows) goCell(b, p.r + 1, p.c, { x: y, line: 'first' });
        else if ((nb = neighbor(b.id, 1))) moveTo(b.id, nb.id, { x: y, line: 'first' });
      } else if (ev.key === 'ArrowLeft' && !textBeside(el, false)) {
        ev.preventDefault();
        if (p.c > 0) goCell(b, p.r, p.c - 1, { at: 'end' });
        else if (p.r > 0) goCell(b, p.r - 1, ncols - 1, { at: 'end' });
        else if ((nb = neighbor(b.id, -1))) moveTo(b.id, nb.id, { at: 'end' });
      } else if (ev.key === 'ArrowRight' && !textBeside(el, true)) {
        ev.preventDefault();
        if (p.c + 1 < ncols) goCell(b, p.r, p.c + 1, { at: 'start' });
        else if (p.r + 1 < nrows) goCell(b, p.r + 1, 0, { at: 'start' });
        else if ((nb = neighbor(b.id, 1))) moveTo(b.id, nb.id, { at: 'start' });
      }
    }
    // 编辑完一段：按 Markdown 重新解析这一段（比如输入「# 」就变成标题，输入「- 」就变成列表）
    function commitBlock(id) {
      var cur = blocksRef.current; var idx = indexOfId(cur, id);
      // 表格：只把正在编辑的那个单元格写回去，不重新解析
      if (idx >= 0 && cur[idx].type === 'table') {
        var tr = tableRaw(cur[idx]);
        return tr === cur[idx].raw ? cur : cur.slice(0, idx).concat([Object.assign({}, cur[idx], { raw: tr })], cur.slice(idx + 1));
      }
      var raw = rawOf(id);
      if (idx < 0 || raw === null) return cur;
      var parsed = raw.trim() ? parseBlocks(raw) : [];
      return cur.slice(0, idx).concat(parsed, cur.slice(idx + 1));
    }
    // 提交当前块，换到另一块编辑
    function moveTo(fromId, toId, spec) {
      var next = commitBlock(fromId); caret.current = spec; switching.current = true; save(next); setEditing(toId);
    }
    function editAt(next, id, spec) { caret.current = spec; switching.current = true; save(next); setEditing(id); }
    // 提交当前块并退出编辑；返回这一块解析后占的序号 [from, to]（删空时 to < from）
    function leave(id) {
      var cur = blocksRef.current; var idx = indexOfId(cur, id); var next = commitBlock(id);
      switching.current = true;
      var a = document.activeElement; if (a && a.blur) a.blur();
      save(next); setEditing(null);
      return { n: next.length, from: idx, to: idx + next.length - cur.length };
    }
    // 上一块 / 下一块可以编辑的块（跳过思维导图）
    function neighbor(id, dir) {
      var cur = blocksRef.current;
      for (var i = indexOfId(cur, id) + dir; i >= 0 && i < cur.length; i += dir) if (cur[i].type !== 'list') return cur[i];
      return null;
    }

    // ---- 选中整块 ----
    function selRange() { var b = bselRef.current; return b ? [Math.min(b.anchor, b.focus), Math.max(b.anchor, b.focus)] : null; }
    function select(b) {
      var n = blocksRef.current.length; if (!n) { setBsel(null); return; }
      var clamp = function (i) { return Math.max(0, Math.min(n - 1, i)); };
      var next = { anchor: clamp(b.anchor), focus: clamp(b.focus) }; var old = bselRef.current;
      if (old && old.anchor === next.anchor && old.focus === next.focus) return;
      bselRef.current = next; setBsel(next);
    }
    // 同时放一个看不见的原生选区，这样「编辑 › 拷贝」也可用
    function paintRange() {
      var r = selRange(); var root = rootRef.current; if (!r || !root) return;
      var a = root.children[r[0]], z = root.children[r[1]]; if (!a || !z) return;
      var rg = document.createRange(); rg.setStartBefore(a); rg.setEndAfter(z);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(rg);
    }
    React.useEffect(function () { if (bsel) paintRange(); }, [bsel, blocks]);
    function clearSel() { bselRef.current = null; setBsel(null); var sel = window.getSelection(); if (sel) sel.removeAllRanges(); }
    function selectedMarkdown() { var r = selRange(); return serializeBlocks(blocksRef.current.slice(r[0], r[1] + 1)); }
    function deleteSel() {
      var r = selRange(); var cur = blocksRef.current;
      history.current.push(cur); if (history.current.length > 50) history.current.shift();
      clearSel(); save(cur.slice(0, r[0]).concat(cur.slice(r[1] + 1)), true);
    }
    function undo() { var prev = history.current.pop(); if (!prev) return; clearSel(); save(prev, true); }

    React.useEffect(function () {
      var drag = null;
      // 点中的是第几块（块是正文区的直接子元素，顺序和 blocks 一致）
      function blockOf(node) {
        var root = rootRef.current; if (!root || !root.contains(node)) return -1;
        while (node && node.parentNode !== root) node = node.parentNode;
        var i = Array.prototype.indexOf.call(root.children, node);
        return i < blocksRef.current.length ? i : -1;
      }
      function blockAtY(y) {
        var root = rootRef.current; var k = 0;
        for (var j = 0; j < blocksRef.current.length; j++) { var c = root.children[j]; if (c && c.getBoundingClientRect().top <= y) k = j; }
        return k;
      }
      function down(ev) {
        noClick.current = false; drag = null;
        if (mapRef.current || ev.button !== 0) return;
        if (bselRef.current) { bselRef.current = null; setBsel(null); }
        var i = blockOf(ev.target);
        // 从思维导图里开始拖时，交给导图自己选文字
        if (i >= 0 && blocksRef.current[i].type !== 'list' && !ev.shiftKey) drag = { start: i, on: false };
      }
      function move(ev) {
        if (!drag) return;
        if (!(ev.buttons & 1)) { drag = null; return; }
        var i = blockAtY(ev.clientY);
        if (!drag.on) {
          if (i === drag.start) return;
          drag.on = true;
          if (editingRef.current) leave(editingRef.current);
        }
        select({ anchor: drag.start, focus: i });
      }
      function up() { if (drag && drag.on) { noClick.current = true; paintRange(); } drag = null; }
      function key(ev) {
        if (ev.defaultPrevented || mapRef.current || composing(ev)) return;
        var meta = ev.metaKey || ev.ctrlKey; var k = ev.key.toLowerCase(); var b = bselRef.current; var n = blocksRef.current.length;
        if (!b) {
          if (editingRef.current || isTyping(document.activeElement)) return;
          if (meta && !ev.shiftKey && k === 'a' && n) { ev.preventDefault(); select({ anchor: 0, focus: n - 1 }); }
          else if (meta && !ev.shiftKey && k === 'z' && history.current.length) { ev.preventDefault(); undo(); }
          return;
        }
        var r = selRange();
        if (k === 'escape') { ev.preventDefault(); clearSel(); }
        else if (k === 'backspace' || k === 'delete') { ev.preventDefault(); deleteSel(); }
        else if (meta && k === 'c') { ev.preventDefault(); document.execCommand('copy'); }
        else if (meta && k === 'x') { ev.preventDefault(); document.execCommand('copy'); deleteSel(); }
        else if (meta && k === 'a') { ev.preventDefault(); select({ anchor: 0, focus: n - 1 }); }
        else if (meta && k === 'z' && !ev.shiftKey) { ev.preventDefault(); undo(); }
        else if (k === 'arrowup' || k === 'arrowdown') {
          ev.preventDefault(); var d = k === 'arrowup' ? -1 : 1;
          if (ev.shiftKey) select({ anchor: b.anchor, focus: b.focus + d });
          else { var f = (d < 0 ? r[0] : r[1]) + d; select({ anchor: f, focus: f }); }
        }
        else if (k === 'enter' && !meta) {
          ev.preventDefault(); var t = blocksRef.current[b.focus]; clearSel();
          if (t.type === 'list') setMapOpen(t.id); else { caret.current = { at: 'end' }; setEditing(t.id); }
        }
      }
      function copy(ev) {
        if (!bselRef.current || mapRef.current) return;
        ev.preventDefault(); ev.clipboardData.setData('text/plain', selectedMarkdown());
      }
      document.addEventListener('mousedown', down, true);
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
      document.addEventListener('keydown', key);
      document.addEventListener('copy', copy);
      return function () {
        document.removeEventListener('mousedown', down, true);
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        document.removeEventListener('keydown', key);
        document.removeEventListener('copy', copy);
      };
    }, []);

    function onKeyDown(b, ev) {
      if (composing(ev)) return;
      var el = ev.currentTarget; var sel = window.getSelection(); var collapsed = !!sel && sel.isCollapsed;
      var meta = ev.metaKey || ev.ctrlKey; var plain = !meta && !ev.altKey && !ev.shiftKey;
      var cur = blocksRef.current; var i = indexOfId(cur, b.id); var t, L;
      if (ev.key === 'Escape') { ev.preventDefault(); el.blur(); return; }
      // 第二次 ⌘A：这一块已经全选，改为选中全部块
      if (meta && !ev.shiftKey && ev.key.toLowerCase() === 'a' && sel && sel.rangeCount) {
        var r0 = sel.getRangeAt(0); var pre = document.createRange(); pre.selectNodeContents(el); pre.setEnd(r0.startContainer, r0.startOffset);
        var post = document.createRange(); post.selectNodeContents(el); post.setStart(r0.endContainer, r0.endOffset);
        if (!pre.toString() && !post.toString().trim()) { ev.preventDefault(); L = leave(b.id); select({ anchor: 0, focus: L.n - 1 }); }
        return;
      }
      // Shift+↑↓ 到了段首 / 段尾：改为选中整块
      if (ev.shiftKey && !meta && !ev.altKey && ev.key === 'ArrowUp' && !textBeside(el, false)) {
        ev.preventDefault(); L = leave(b.id);
        if (L.to >= L.from) select({ anchor: L.to, focus: L.from - 1 }); else select({ anchor: L.from - 1, focus: L.from - 1 });
        return;
      }
      if (ev.shiftKey && !meta && !ev.altKey && ev.key === 'ArrowDown' && !textBeside(el, true)) {
        ev.preventDefault(); L = leave(b.id);
        if (L.to >= L.from) select({ anchor: L.from, focus: L.to + 1 }); else select({ anchor: L.from, focus: L.from });
        return;
      }
      if (plain && collapsed) {
        if (ev.key === 'ArrowUp' && onFirstLine(el) && (t = neighbor(b.id, -1))) { ev.preventDefault(); moveTo(b.id, t.id, { x: caretX(), line: 'last' }); return; }
        if (ev.key === 'ArrowDown' && onLastLine(el) && (t = neighbor(b.id, 1))) { ev.preventDefault(); moveTo(b.id, t.id, { x: caretX(), line: 'first' }); return; }
        if (ev.key === 'ArrowLeft' && !textBeside(el, false) && (t = neighbor(b.id, -1))) { ev.preventDefault(); moveTo(b.id, t.id, { at: 'end' }); return; }
        if (ev.key === 'ArrowRight' && !textBeside(el, true) && (t = neighbor(b.id, 1))) { ev.preventDefault(); moveTo(b.id, t.id, { at: 'start' }); return; }
      }
      // 回车：在光标处拆成两段（代码块和表格里回车是换行）
      if (ev.key === 'Enter' && !ev.shiftKey && b.type !== 'code' && b.type !== 'table') {
        ev.preventDefault();
        var parts = splitAtCaret(el) || [rawOf(b.id) || '', ''];
        var tail = parts[1].trim() ? parseBlocks(parts[1]) : [];
        var target = tail[0] && tail[0].type !== 'list' ? tail[0] : null;
        if (!target) { target = { id: nid(), type: 'paragraph', raw: '' }; tail.unshift(target); }
        // 在段首回车：上面留一个空段
        var head = parts[0].trim() ? parseBlocks(parts[0]) : (parts[1].trim() ? [{ id: nid(), type: 'paragraph', raw: '' }] : []);
        editAt(cur.slice(0, i).concat(head, tail, cur.slice(i + 1)), target.id, { at: 'start' });
        return;
      }
      if (ev.key === 'Backspace' && !(rawOf(b.id) || '').length) {
        ev.preventDefault(); var prev = neighbor(b.id, -1);
        editAt(cur.filter(function (x) { return x.id !== b.id; }), prev ? prev.id : null, { at: 'end' });
        return;
      }
      // 段首按删除键：和上一段合并；段尾按 fn+删除键：和下一段合并。代码块、表格不合并，只移过去；思维导图不动
      var text = b.type === 'paragraph' || b.type === 'heading';
      function joinable(x) { return x.type === 'paragraph' || x.type === 'heading'; }
      function join(first, second, firstRaw, secondRaw) {
        var base = firstRaw.trim() ? first : second;
        return Object.assign({}, base, { id: nid(), raw: firstRaw + secondRaw });
      }
      if (ev.key === 'Backspace' && collapsed && !meta && !ev.altKey && !textBeside(el, false)) {
        var p = cur[i - 1]; if (!p || p.type === 'list') return;
        ev.preventDefault();
        if (!text || !joinable(p)) { moveTo(b.id, p.id, { at: 'end' }); return; }
        var mb = join(p, b, p.raw, rawOf(b.id) || '');
        editAt(cur.slice(0, i - 1).concat([mb], cur.slice(i + 1)), mb.id, { at: p.raw.length });
        return;
      }
      if (ev.key === 'Delete' && collapsed && !meta && !ev.altKey && !textBeside(el, true)) {
        var nx = cur[i + 1]; if (!nx || nx.type === 'list' || !text || !joinable(nx)) return;
        ev.preventDefault(); var own = rawOf(b.id) || '';
        var mn = join(b, nx, own, nx.raw);
        editAt(cur.slice(0, i).concat([mn], cur.slice(i + 2)), mn.id, { at: own.length });
      }
    }
    function editable(b, idx) {
      var isEditing = editing === b.id;
      var r = bsel ? selRange() : null; var selected = r && idx >= r[0] && idx <= r[1];
      if (b.type === 'table') {
        var ap = cellPos && isEditing && cellPos.id === b.id ? cellPos : null;
        return h('div', {
          key: b.id, className: cx('memo-md-block memo-md-table', selected ? 'memo-md-selected' : ''),
          ref: function (el) { refs.current[b.id] = el; },
          onKeyDown: function (ev) { tableKeyDown(b, ev); }
        }, renderTable(b.raw, {
          active: ap,
          ref: function (r, c) { return function (el) { cellRefs.current[r + '-' + c] = el; }; },
          open: function (r, c) { openCell(b, r, c); },
          blur: function () { cellBlur(b); },
          paste: pastePlain(true)
        }));
      }
      var tag = b.type === 'heading' ? 'h' + b.level : (b.type === 'code' ? 'pre' : 'p');
      var cls = b.type === 'heading' ? (b.level === 1 ? 'title' : 'heading') : '';
      var content = isEditing ? b.raw : (b.type === 'heading' ? inline(b.raw.replace(/^#{1,6}\s+/, '')) :
        b.type === 'code' ? b.raw.replace(/^```.*\n?/, '').replace(/\n?```$/, '') : inline(b.raw));
      return h(tag, {
        key: b.id + (isEditing ? '-e' : ''),
        className: cx('memo-md-block', cls, isEditing ? 'memo-md-editing' : '', selected ? 'memo-md-selected' : ''),
        contentEditable: isEditing, suppressContentEditableWarning: true,
        ref: function (el) { refs.current[b.id] = el; },
        onClick: function (ev) { if (noClick.current || ev.target.tagName === 'A') return; if (!isEditing) setEditing(b.id); },
        onBlur: function () { if (switching.current) return; if (editing === b.id) { setEditing(null); save(commitBlock(b.id)); } },
        onKeyDown: function (ev) { onKeyDown(b, ev); }, onPaste: pastePlain(false)
      }, content);
    }
    function addAtEnd() {
      if (noClick.current) return;
      var last = blocks[blocks.length - 1];
      if (last && last.type !== 'list' && !last.raw.trim()) { setEditing(last.id); return; }
      var nb = { id: nid(), type: 'paragraph', raw: '' }; save(blocks.concat([nb])); setEditing(nb.id);
    }
    var open = mapOpen && blocks.filter(function (b) { return b.id === mapOpen; })[0];
    var sr = bsel ? selRange() : null;
    return h('div', { ref: rootRef, className: cx('memo-md text', bsel ? 'memo-md-blocksel' : '', props.className) },
      blocks.map(function (b, idx) {
        if (b.type === 'list') return h(MindMap, { key: b.id, rootLabel: '/', tree: listToTree(b.raw), className: sr && idx >= sr[0] && idx <= sr[1] ? 'memo-md-selected' : '', onOpen: function () { setMapOpen(b.id); } });
        return editable(b, idx);
      }),
      blocks.length ? null : h('p', { className: 'memo-md-block memo-md-placeholder', onClick: addAtEnd }, '开始写点什么'),
      h('div', { className: 'memo-md-tail', onClick: addAtEnd, 'aria-hidden': true }),
      open ? h(MindMapEditor, {
        rootLabel: '/', tree: listToTree(open.raw),
        onChange: function (tree) {
          var raw = treeToList(tree);
          var next = blocksRef.current.map(function (b) { return b.id === open.id ? Object.assign({}, b, { raw: raw }) : b; });
          if (!raw) next = next.filter(function (b) { return b.id !== open.id; });
          save(next);
        },
        onClose: function () { setMapOpen(null); }
      }) : null);
  }

  /** CSV 表格（只读）：第一行是表头。 */
  function parseCsv(text) {
    var rows = [], row = [], cell = '', q = false, i, c;
    text = (text || '').replace(/\r\n/g, '\n');
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  function CsvTable(props) {
    var rows = parseCsv(props.value); var head = rows[0] || []; var body = rows.slice(1);
    return h('div', { className: cx('memo-csv text', props.className) },
      h('div', { className: 'memo-csv-scroll' },
        h('table', null,
          h('thead', null, h('tr', null, head.map(function (c, i) { return h('th', { key: i }, c); }))),
          h('tbody', null, body.map(function (r, i) { return h('tr', { key: i }, head.map(function (_, j) { return h('td', { key: j }, r[j] || ''); })); })))));
  }

  /** 正文区的空状态。kind：'no-projects' 还没有项目；'no-file' 有项目但没打开文件。 */
  function EmptyState(props) {
    var none = props.kind === 'no-projects';
    return h('div', { className: cx('memo-empty', props.className) },
      h('p', null, none ? '还没有项目' : '没有打开的文件'),
      h('p', { className: 'memo-empty-hint' }, none ? '创建一个项目，把电脑上的文件夹加进来。' : '从左侧选择一个文件。'),
      none ? h(Button, { variant: 'primary', onClick: props.onCreate }, '创建项目') : null);
  }

  // ---------- 通用 ----------

  /** 按钮：primary 主要、secondary 次要（线框）、text 文字、soft 浅灰底；可以带一个图标。 */
  function Button(props) {
    var variant = props.variant || 'secondary';
    var rest = omit(props, ['variant', 'icon', 'children', 'className']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('memo-btn', variant !== 'secondary' ? 'memo-btn-' + variant : '', props.icon ? 'memo-btn-with-icon' : '', props.className)
    }), props.icon ? Icon(props.icon) : null, props.children);
  }

  function DialogLayer(inline, box) { return inline ? box : h('div', { className: 'memo-dialog-layer' }, box); }

  /** 创建项目弹窗：项目名称 + 源文件夹（在此电脑上选择）。 */
  function CreateProjectDialog(props) {
    var s = React.useState(props.name || ''); var name = s[0], setName = s[1];
    var folder = props.folder || null;
    var touched = React.useRef(!!props.name);
    var ref = React.useRef(null);
    React.useEffect(function () { if (ref.current && !props.inline) ref.current.focus(); }, []);
    React.useEffect(function () { if (folder && !touched.current && !name) setName(folder.name); }, [folder && folder.path]);
    var ok = name.trim().length > 0 && !!folder;
    function confirm() { if (ok && props.onConfirm) props.onConfirm({ name: name.trim(), folder: folder }); }
    var box = h('div', {
      className: 'memo-dialog memo-dialog-lg', role: 'dialog', 'aria-modal': props.inline ? undefined : 'true', 'aria-label': '创建项目',
      onKeyDown: function (e) { if (composing(e)) return; if (e.key === 'Escape' && props.onCancel) props.onCancel(); if (e.key === 'Enter') { e.preventDefault(); confirm(); } }
    },
      h('div', { className: 'memo-dialog-head' },
        h('h2', { className: 'title memo-dialog-title' }, '创建项目'),
        h(IconButton, { icon: 'x', label: '关闭', onClick: props.onCancel })),
      h('label', { className: 'memo-input-group', 'data-state': props.inline && props.focus ? 'focus' : undefined },
        Icon('box'),
        h('input', { ref: ref, value: name, placeholder: '项目名称', 'aria-label': '项目名称',
          onChange: function (e) { touched.current = true; setName(e.target.value); } })),
      h('p', { className: 'label memo-dialog-label' }, '源文件夹'),
      folder ?
        h('div', { className: 'memo-source memo-source-picked' },
          Icon('folder'),
          h('span', { className: 'memo-source-text' },
            h('span', { className: 'memo-source-name' }, folder.name),
            h('span', { className: 'memo-source-path', title: folder.path }, folder.path)),
          h(Button, { variant: 'text', onClick: props.onChooseFolder }, '更换')) :
        h('div', { className: 'memo-source' },
          h('p', null, '在此电脑上添加文件夹'),
          h(Button, { variant: 'soft', icon: 'folder-plus', onClick: props.onChooseFolder }, '添加')),
      h('div', { className: 'memo-dialog-actions' },
        h(Button, { variant: 'text', onClick: props.onCancel }, '取消'),
        h(Button, { variant: 'primary', disabled: !ok, onClick: confirm }, '创建项目')));
    return DialogLayer(props.inline, box);
  }

  /** 输入名称的弹窗：新建文档、新建文件夹、重命名文件 / 文件夹 / 项目。 */
  function NameDialog(props) {
    var s = React.useState(props.value || ''); var value = s[0], setValue = s[1];
    var ref = React.useRef(null);
    React.useEffect(function () { var el = ref.current; if (el && !props.inline) { el.focus(); el.select(); } }, []);
    var ok = value.trim().length > 0;
    function confirm() { if (ok && props.onConfirm) props.onConfirm(value.trim()); }
    var box = h('div', {
      className: 'memo-dialog', role: 'dialog', 'aria-modal': props.inline ? undefined : 'true', 'aria-label': props.title,
      onKeyDown: function (e) {
        if (composing(e)) return;
        if (e.key === 'Escape' && props.onCancel) props.onCancel();
        if (e.key === 'Enter') { e.preventDefault(); confirm(); }
      }
    },
      h('p', null, props.title),
      h('input', {
        ref: ref, className: 'memo-input', value: value, placeholder: props.placeholder || '名称', 'aria-label': props.placeholder || '名称',
        'data-state': props.inline ? 'focus' : undefined,
        onChange: function (e) { setValue(e.target.value); }
      }),
      h('div', { className: 'memo-dialog-actions' },
        h(Button, { variant: 'text', onClick: props.onCancel }, '取消'),
        h(Button, { variant: 'primary', disabled: !ok, onClick: confirm }, props.confirmLabel || '保存')));
    return DialogLayer(props.inline, box);
  }

  /** 二次确认弹窗：移到废纸篓、从 mindmap 移除项目。 */
  function ConfirmDialog(props) {
    var ref = React.useRef(null);
    React.useEffect(function () { if (ref.current && !props.inline) ref.current.focus(); }, []);
    var box = h('div', {
      className: 'memo-dialog', role: 'alertdialog', 'aria-modal': props.inline ? undefined : 'true', 'aria-label': props.title,
      onKeyDown: function (e) { if (e.key === 'Escape' && props.onCancel) props.onCancel(); }
    },
      h('p', null, props.title),
      props.hint ? h('p', { className: 'memo-dialog-hint' }, props.hint) : null,
      h('div', { className: 'memo-dialog-actions' },
        h('button', { ref: ref, type: 'button', className: 'memo-btn memo-btn-text', onClick: props.onCancel }, '取消'),
        h(Button, { variant: 'primary', onClick: props.onConfirm }, props.confirmLabel || '移到废纸篓')));
    return DialogLayer(props.inline, box);
  }

  window.Memo = {
    Sidebar: Sidebar, SectionLabel: SectionLabel, ProjectItem: ProjectItem, FolderItem: FolderItem, FileItem: FileItem, Menu: Menu,
    DocHeader: DocHeader, MarkdownView: MarkdownView, MindMap: MindMap, MindMapEditor: MindMapEditor, CsvTable: CsvTable, EmptyState: EmptyState,
    Button: Button, CreateProjectDialog: CreateProjectDialog, NameDialog: NameDialog, ConfirmDialog: ConfirmDialog,
    markdown: { parseBlocks: parseBlocks, listToTree: listToTree, treeToList: treeToList }
  };
})();
