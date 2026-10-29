// 正文区：打开的 .md 或 .csv。
import { api, type ApiError } from "./api";

const { useEffect, useRef, useState } = React;
const Memo = window.Memo;

export interface OpenFile {
  projectId: string;
  path: string;
  name: string;
  kind: "md" | "csv";
  downloaded: boolean;
}

/** 由正文区填入：把还没写盘的改动立刻写盘。改名、移到废纸篓之前先调用它。 */
export type FlushRef = { current: (() => Promise<void>) | null };

const SAVE_DELAY = 400;

type Load<T> =
  | { state: "loading" }
  | { state: "error"; message: string }
  | ({ state: "ready" } & T);

function Status(props: { text: string; hint?: string }) {
  return (
    <div className="content-center">
      <div className="memo-empty">
        <p>{props.text}</p>
        {props.hint ? <p className="memo-empty-hint">{props.hint}</p> : null}
      </div>
    </div>
  );
}

function errorText(e: unknown) {
  return (e as ApiError)?.message ?? String(e);
}

/** 外部改动了当前文件时回调。 */
function useFileChanged(file: OpenFile, onChange: () => void) {
  const cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => {
    const unlisten = api.onFsChanged((e) => {
      if (e.projectId === file.projectId && e.paths.includes(file.path)) cb.current();
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, [file.projectId, file.path]);
}

function sameBlocks(a: string, b: string) {
  const raws = (md: string) => Memo.markdown.parseBlocks(md).map((x) => x.raw).join("\u0000");
  return raws(a) === raws(b);
}

function MarkdownFile(props: { file: OpenFile; flushRef: FlushRef }) {
  const { file } = props;
  const [doc, setDoc] = useState<Load<{ text: string; version: number }>>({ state: "loading" });
  const hash = useRef("");
  const saved = useRef(""); // 磁盘上的内容
  const pending = useRef<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  async function read(initial: boolean) {
    try {
      const f = await api.fileRead(file.projectId, file.path);
      if (!initial && f.hash === hash.current) return; // 自己刚写的
      hash.current = f.hash;
      saved.current = f.content;
      setDoc((d) => ({ state: "ready", text: f.content, version: d.state === "ready" ? d.version + 1 : 0 }));
    } catch (e) {
      if (initial) setDoc({ state: "error", message: errorText(e) });
    }
  }

  async function flush() {
    window.clearTimeout(timer.current);
    const text = pending.current;
    if (text === null) return;
    pending.current = null;
    try {
      const meta = await api.fileWrite(file.projectId, file.path, text, hash.current);
      hash.current = meta.hash;
      saved.current = text;
    } catch (e) {
      // 外部同时改了这个文件：以磁盘上的为准重新读取
      if ((e as ApiError)?.code === "conflict") await read(true);
      else setDoc({ state: "error", message: errorText(e) });
    }
  }

  useEffect(() => {
    read(true);
    props.flushRef.current = flush;
    return () => {
      flush();
      if (props.flushRef.current === flush) props.flushRef.current = null;
    };
  }, []);

  useFileChanged(file, () => {
    if (pending.current === null) read(false);
  });

  function onChange(md: string) {
    // 只是点进去又点出来、内容没变时不写盘，免得改动文件原有的排版
    if (sameBlocks(md, saved.current)) {
      pending.current = null;
      window.clearTimeout(timer.current);
      return;
    }
    pending.current = md;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, SAVE_DELAY);
  }

  if (doc.state === "loading") {
    return file.downloaded ? null : <Status text="正在从 iCloud 下载" />;
  }
  if (doc.state === "error") return <Status text="无法打开这个文件" hint={doc.message} />;
  return <Memo.MarkdownView key={doc.version} value={doc.text} fileName={file.name} onChange={onChange} />;
}

/** 后端已解析好的行，转回 CSV 文本交给 CsvTable 显示。 */
function toCsv(rows: string[][]) {
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function CsvFile(props: { file: OpenFile }) {
  const { file } = props;
  const [table, setTable] = useState<Load<{ csv: string }>>({ state: "loading" });

  async function read(initial: boolean) {
    try {
      const d = await api.csvRead(file.projectId, file.path);
      setTable({ state: "ready", csv: toCsv(d.rows) });
    } catch (e) {
      if (initial) setTable({ state: "error", message: errorText(e) });
    }
  }

  useEffect(() => {
    read(true);
  }, []);
  useFileChanged(file, () => read(false));

  if (table.state === "loading") {
    return file.downloaded ? null : <Status text="正在从 iCloud 下载" />;
  }
  if (table.state === "error") return <Status text="无法打开这个文件" hint={table.message} />;
  return <Memo.CsvTable value={table.csv} />;
}

export function Content(props: { file: OpenFile | null; hasProjects: boolean; flushRef: FlushRef; onCreateProject: () => void }) {
  const { file } = props;
  if (!file) {
    return (
      <main className="memo-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Memo.EmptyState kind={props.hasProjects ? "no-file" : "no-projects"} onCreate={props.onCreateProject} />
      </main>
    );
  }
  const key = `${file.projectId}\n${file.path}`;
  return (
    <main className="memo-content">
      <Memo.DocHeader name={file.name} />
      {file.kind === "md" ? (
        <MarkdownFile key={key} file={file} flushRef={props.flushRef} />
      ) : (
        <CsvFile key={key} file={file} />
      )}
    </main>
  );
}
