import { open as openDialog, ask, message } from "@tauri-apps/plugin-dialog";

import { api, type ApiError, type Entry, type PinnedEntry, type Project } from "./api";
import { Content, type FlushRef, type OpenFile } from "./Content";
import * as storage from "./storage";
import { setBeforeRestart, startUpdater } from "./updater";

const { useCallback, useEffect, useRef, useState } = React;
type ReactNode = React.ReactNode;
const Memo = window.Memo;

/** 目录缓存的键：项目 + 项目内相对路径（"" 为项目根）。 */
const dirKey = (projectId: string, path: string) => `${projectId}\n${path}`;

/** 展开状态的键：同一个文件夹在「置顶」区和项目里分别展开。 */
type Scope = "pin" | "tree";
const expandKey = (scope: Scope, projectId: string, path: string) => `${scope}\n${dirKey(projectId, path)}`;

const isWithin = (path: string, ancestor: string) => path === ancestor || path.startsWith(`${ancestor}/`);
const parentOf = (path: string) => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");

type Dialog =
  | { type: "create-project"; folder: { name: string; path: string } | null }
  | { type: "name"; title: string; value?: string; placeholder: string; confirmLabel: string; onConfirm: (name: string) => Promise<void> }
  | { type: "confirm"; title: string; hint: string; confirmLabel: string; onConfirm: () => Promise<void> };

async function showError(e: unknown) {
  await message((e as ApiError)?.message ?? String(e), { title: "mindmap", kind: "error" });
}

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pins, setPins] = useState<PinnedEntry[]>([]);
  const [dirs, setDirs] = useState<Record<string, Entry[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(storage.load<string[]>("expanded", [])));
  const [current, setCurrent] = useState<OpenFile | null>(() => storage.load<OpenFile | null>("current", null));
  const [menu, setMenu] = useState<string | null>(null);
  const [dialog, setDialog] = useState<(Dialog & { id: number }) | null>(null);
  const dialogId = useRef(0);
  const flushRef: FlushRef = useRef(null);
  const dirsRef = useRef(dirs);
  dirsRef.current = dirs;

  useEffect(() => storage.save("expanded", [...expanded]), [expanded]);
  useEffect(() => storage.save("current", current), [current]);

  const closeMenu = useCallback(() => setMenu(null), []);
  const toggleMenu = (id: string) => setMenu((m) => (m === id ? null : id));
  const show = (d: Dialog) => {
    setMenu(null);
    setDialog({ ...d, id: ++dialogId.current });
  };

  // ---------- 读取 ----------

  async function refreshProjects() {
    setProjects(await api.projectList());
  }

  async function refreshPins() {
    setPins(await api.pinList());
  }

  async function loadDir(projectId: string, path: string) {
    let entries: Entry[] = [];
    try {
      entries = await api.treeList(projectId, path);
    } catch {
      // 文件夹已不存在或项目不可用：显示为空
    }
    setDirs((d) => ({ ...d, [dirKey(projectId, path)]: entries }));
  }

  /** 重新读取某个项目里已经加载过的所有文件夹。 */
  async function refreshProject(projectId: string) {
    const loaded = Object.keys(dirsRef.current)
      .filter((k) => k.startsWith(`${projectId}\n`))
      .map((k) => k.slice(projectId.length + 1));
    await Promise.all([...loaded.map((p) => loadDir(projectId, p)), refreshPins()]);
  }

  useEffect(() => {
    setBeforeRestart(async () => {
      await flushRef.current?.();
    });
    startUpdater();

    (async () => {
      const list = await api.projectList();
      setProjects(list);
      await refreshPins();
      // 恢复上次展开的文件夹
      const toLoad = new Set<string>();
      for (const k of expanded) {
        const [, projectId, path] = k.split("\n");
        if (list.some((p) => p.id === projectId)) toLoad.add(dirKey(projectId, path));
      }
      await Promise.all([...toLoad].map((k) => loadDir(...(k.split("\n") as [string, string]))));
    })().catch(showError);

    let timer: number | undefined;
    const changed = new Set<string>();
    const unlisten = api.onFsChanged((e) => {
      changed.add(e.projectId);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        changed.forEach((id) => refreshProject(id));
        changed.clear();
      }, 100);
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  // ---------- 展开与打开 ----------

  async function setOpen(scope: Scope, projectId: string, path: string, open: boolean) {
    const k = expandKey(scope, projectId, path);
    if (open) await loadDir(projectId, path);
    setExpanded((s) => {
      const next = new Set(s);
      open ? next.add(k) : next.delete(k);
      return next;
    });
  }

  function toggle(scope: Scope, projectId: string, path: string) {
    setOpen(scope, projectId, path, !expanded.has(expandKey(scope, projectId, path)));
  }

  function openFile(projectId: string, e: Entry) {
    if (e.kind === "folder") return;
    if (current?.projectId === projectId && current.path === e.path) return;
    setCurrent({ projectId, path: e.path, name: e.name, kind: e.kind, downloaded: e.downloaded });
  }

  // ---------- 操作 ----------

  function createProject() {
    show({ type: "create-project", folder: null });
  }

  async function chooseFolder() {
    const path = await openDialog({ directory: true, multiple: false, title: "选择项目文件夹" });
    if (typeof path !== "string") return;
    const name = path.split("/").filter(Boolean).pop() ?? path;
    setDialog((d) => (d && d.type === "create-project" ? { ...d, folder: { name, path } } : d));
  }

  async function confirmCreateProject(name: string, folder: { path: string }) {
    try {
      const p = await api.projectAdd(folder.path, name);
      await refreshProjects();
      await setOpen("tree", p.id, "", true);
      setDialog(null);
    } catch (e) {
      showError(e);
    }
  }

  function newEntry(projectId: string, parent: string, kind: "md" | "folder") {
    show({
      type: "name",
      title: kind === "md" ? "新建文档" : "新建文件夹",
      placeholder: kind === "md" ? "文档名称" : "文件夹名称",
      confirmLabel: "创建",
      onConfirm: async (name) => {
        const e = await api.entryCreate(projectId, parent, name, kind);
        await setOpen("tree", projectId, parent, true);
        if (e.kind === "md") openFile(projectId, e);
      },
    });
  }

  function renameEntry(projectId: string, e: Entry) {
    show({
      type: "name",
      title: e.kind === "folder" ? "重命名文件夹" : "重命名文件",
      value: e.name,
      placeholder: e.kind === "folder" ? "文件夹名称" : "文档名称",
      confirmLabel: "保存",
      onConfirm: async (name) => {
        if (name === e.name) return;
        await flushRef.current?.();
        const renamed = await api.entryRename(projectId, e.path, name);
        if (current?.projectId === projectId && isWithin(current.path, e.path)) {
          const path = renamed.path + current.path.slice(e.path.length);
          setCurrent({ ...current, path, name: path === renamed.path ? renamed.name : current.name });
        }
        setExpanded((s) => {
          const next = new Set<string>();
          for (const k of s) {
            const [scope, pid, p] = k.split("\n");
            next.add(pid === projectId && isWithin(p, e.path) ? expandKey(scope as Scope, pid, renamed.path + p.slice(e.path.length)) : k);
          }
          return next;
        });
        await refreshProject(projectId);
        await loadDir(projectId, parentOf(e.path));
      },
    });
  }

  function trashEntry(projectId: string, e: Entry) {
    show({
      type: "confirm",
      title: `将「${e.name}」移到废纸篓？`,
      hint: "可以在废纸篓里恢复。",
      confirmLabel: "移到废纸篓",
      onConfirm: async () => {
        await flushRef.current?.();
        try {
          await api.entryTrash(projectId, e.path);
        } catch (err) {
          if ((err as ApiError)?.code !== "trashFailed") throw err;
          const ok = await ask(`这个位置没有废纸篓，无法移到废纸篓。要直接删除「${e.name}」吗？删除后不能恢复。`, {
            title: "mindmap",
            kind: "warning",
            okLabel: "删除",
            cancelLabel: "取消",
          });
          if (!ok) return;
          await api.entryDeletePermanently(projectId, e.path);
        }
        if (current?.projectId === projectId && isWithin(current.path, e.path)) setCurrent(null);
        await loadDir(projectId, parentOf(e.path));
        await refreshPins();
      },
    });
  }

  async function setPinned(projectId: string, e: Entry, pinned: boolean) {
    try {
      await api.pinSet(projectId, e.path, pinned);
      await refreshPins();
    } catch (err) {
      showError(err);
    }
  }

  function renameProject(p: Project) {
    show({
      type: "name",
      title: "重命名项目",
      value: p.name,
      placeholder: "项目名称",
      confirmLabel: "保存",
      onConfirm: async (name) => {
        await api.projectRename(p.id, name);
        await refreshProjects();
      },
    });
  }

  function removeProject(p: Project) {
    show({
      type: "confirm",
      title: `从 mindmap 移除项目「${p.name}」？`,
      hint: "只是不在这里显示，电脑上的文件夹和文件都不会动。",
      confirmLabel: "从 mindmap 移除",
      onConfirm: async () => {
        await flushRef.current?.();
        await api.projectRemove(p.id);
        if (current?.projectId === p.id) setCurrent(null);
        setExpanded((s) => new Set([...s].filter((k) => k.split("\n")[1] !== p.id)));
        await refreshProjects();
        await refreshPins();
      },
    });
  }

  // ---------- 侧栏 ----------

  const isPinned = (projectId: string, path: string) => pins.some((p) => p.projectId === projectId && p.path === path);

  function addMenu(id: string, projectId: string, parent: string) {
    return (
      <Memo.Menu
        onClose={closeMenu}
        items={[
          { icon: "file-plus", label: "新建文档", onClick: () => newEntry(projectId, parent, "md") },
          { icon: "folder-plus", label: "新建文件夹", onClick: () => newEntry(projectId, parent, "folder") },
        ]}
        key={id}
      />
    );
  }

  function entryMenu(projectId: string, e: Entry) {
    const pinned = isPinned(projectId, e.path);
    return (
      <Memo.Menu
        onClose={closeMenu}
        items={[
          pinned
            ? { icon: "pin-off", label: "取消置顶", onClick: () => setPinned(projectId, e, false) }
            : { icon: "pin", label: "置顶", onClick: () => setPinned(projectId, e, true) },
          { icon: "pencil", label: "重命名", onClick: () => renameEntry(projectId, e) },
          { icon: "trash-2", label: "移到废纸篓", onClick: () => trashEntry(projectId, e) },
        ]}
      />
    );
  }

  function renderEntry(scope: Scope, projectId: string, e: Entry): ReactNode {
    const id = expandKey(scope, projectId, e.path);
    if (e.kind === "folder") {
      const open = expanded.has(id);
      return (
        <Memo.FolderItem
          key={id}
          name={e.name}
          expanded={open}
          onToggle={() => toggle(scope, projectId, e.path)}
          onAdd={() => toggleMenu(`add\n${id}`)}
          addMenuOpen={menu === `add\n${id}`}
          addMenu={addMenu(id, projectId, e.path)}
          onMore={() => toggleMenu(`more\n${id}`)}
          menuOpen={menu === `more\n${id}`}
          menu={entryMenu(projectId, e)}
        >
          {open ? renderDir(scope, projectId, e.path) : null}
        </Memo.FolderItem>
      );
    }
    return (
      <Memo.FileItem
        key={id}
        name={e.name}
        kind={e.kind}
        current={current?.projectId === projectId && current.path === e.path}
        onClick={() => openFile(projectId, e)}
        onMore={() => toggleMenu(`more\n${id}`)}
        menuOpen={menu === `more\n${id}`}
        menu={entryMenu(projectId, e)}
      />
    );
  }

  function renderDir(scope: Scope, projectId: string, path: string): ReactNode[] {
    return (dirs[dirKey(projectId, path)] ?? []).map((e) => renderEntry(scope, projectId, e));
  }

  function renderProject(p: Project) {
    const id = expandKey("tree", p.id, "");
    const open = expanded.has(id);
    return (
      <Memo.ProjectItem
        key={p.id}
        name={p.name}
        expanded={open}
        onToggle={() => toggle("tree", p.id, "")}
        onAdd={() => toggleMenu(`add\n${id}`)}
        addMenuOpen={menu === `add\n${id}`}
        addMenu={addMenu(id, p.id, "")}
        onMore={() => toggleMenu(`more\n${id}`)}
        menuOpen={menu === `more\n${id}`}
        menu={
          <Memo.Menu
            onClose={closeMenu}
            items={[
              { icon: "pencil", label: "重命名", onClick: () => renameProject(p) },
              { icon: "circle-minus", label: "从 mindmap 移除", onClick: () => removeProject(p) },
            ]}
          />
        }
      >
        {open ? renderDir("tree", p.id, "") : null}
      </Memo.ProjectItem>
    );
  }

  // ---------- 弹窗 ----------

  function renderDialog() {
    if (!dialog) return null;
    const close = () => setDialog(null);
    const run = (f: () => Promise<void>) => async () => {
      try {
        await f();
        close();
      } catch (e) {
        showError(e);
      }
    };
    switch (dialog.type) {
      case "create-project":
        return (
          <Memo.CreateProjectDialog
            key={dialog.id}
            folder={dialog.folder}
            onChooseFolder={chooseFolder}
            onConfirm={({ name, folder }) => confirmCreateProject(name, folder)}
            onCancel={close}
          />
        );
      case "name":
        return (
          <Memo.NameDialog
            key={dialog.id}
            title={dialog.title}
            value={dialog.value}
            placeholder={dialog.placeholder}
            confirmLabel={dialog.confirmLabel}
            onConfirm={(name) => run(() => dialog.onConfirm(name))()}
            onCancel={close}
          />
        );
      case "confirm":
        return (
          <Memo.ConfirmDialog
            key={dialog.id}
            title={dialog.title}
            hint={dialog.hint}
            confirmLabel={dialog.confirmLabel}
            onConfirm={run(dialog.onConfirm)}
            onCancel={close}
          />
        );
    }
  }

  return (
    <div className="app">
      <div className="drag-strip" data-tauri-drag-region />
      <Memo.Sidebar>
        <div className="sidebar-top" />
        {pins.length > 0 ? (
          <>
            <Memo.SectionLabel label="置顶" />
            {pins.map((p) => renderEntry("pin", p.projectId, p))}
          </>
        ) : null}
        <Memo.SectionLabel
          label="项目"
          onMore={() => toggleMenu("projects")}
          menuOpen={menu === "projects"}
          menu={<Memo.Menu onClose={closeMenu} items={[{ icon: "plus", label: "创建项目", onClick: createProject }]} />}
        />
        {projects.map(renderProject)}
      </Memo.Sidebar>
      <Content file={current} hasProjects={projects.length > 0} flushRef={flushRef} onCreateProject={createProject} />
      {renderDialog()}
    </div>
  );
}
