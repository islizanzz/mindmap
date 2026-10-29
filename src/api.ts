// 后端命令的类型化封装。路径均为项目内相对路径（"/" 分隔，"" 为项目根）。
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export type Kind = "folder" | "md" | "csv";

export interface Project {
  id: string;
  name: string;
  path: string;
  available: boolean;
}

export interface Entry {
  name: string; // 显示名，文件不带后缀
  fileName: string;
  path: string;
  kind: Kind;
  pinned: boolean;
  downloaded: boolean; // false = iCloud 未下载
  modifiedMs: number | null;
}

// 侧栏顶部「置顶」区的条目，跨所有项目
export interface PinnedEntry extends Entry {
  projectId: string;
}

export interface Pin {
  projectId: string;
  path: string;
}

export interface FileMeta {
  hash: string;
  modifiedMs: number | null;
}

export interface TextFile extends FileMeta {
  content: string;
  encoding: string;
}

export interface CsvData {
  rows: string[][];
  encoding: string;
  delimiter: string;
}

export type ErrorCode =
  | "projectNotFound"
  | "projectUnavailable"
  | "projectExists"
  | "invalidPath"
  | "invalidName"
  | "unsupportedKind"
  | "alreadyExists"
  | "notFound"
  | "conflict"
  | "icloudTimeout"
  | "trashFailed"
  | "io"
  | "other";

export interface ApiError {
  code: ErrorCode;
  message: string;
}

export const api = {
  projectList: () => invoke<Project[]>("project_list"),
  projectAdd: (path: string, name?: string) => invoke<Project>("project_add", { path, name }),
  projectRename: (id: string, name: string) => invoke<void>("project_rename", { id, name }),
  projectRemove: (id: string) => invoke<void>("project_remove", { id }),
  projectReorder: (ids: string[]) => invoke<void>("project_reorder", { ids }),

  treeList: (projectId: string, dir = "") => invoke<Entry[]>("tree_list", { projectId, dir }),
  pinList: () => invoke<PinnedEntry[]>("pin_list"),
  pinSet: (projectId: string, path: string, pinned: boolean) =>
    invoke<void>("pin_set", { projectId, path, pinned }),
  pinReorder: (pins: Pin[]) => invoke<void>("pin_reorder", { pins }),

  entryCreate: (projectId: string, parent: string, name: string, kind: Kind) =>
    invoke<Entry>("entry_create", { projectId, parent, name, kind }),
  entryRename: (projectId: string, path: string, name: string) =>
    invoke<Entry>("entry_rename", { projectId, path, name }),
  entryTrash: (projectId: string, path: string) => invoke<void>("entry_trash", { projectId, path }),
  entryDeletePermanently: (projectId: string, path: string) =>
    invoke<void>("entry_delete_permanently", { projectId, path }),

  fileRead: (projectId: string, path: string) => invoke<TextFile>("file_read", { projectId, path }),
  fileWrite: (projectId: string, path: string, content: string, baseHash?: string) =>
    invoke<FileMeta>("file_write", { projectId, path, content, baseHash }),
  csvRead: (projectId: string, path: string) => invoke<CsvData>("csv_read", { projectId, path }),

  onFsChanged: (cb: (e: { projectId: string; paths: string[] }) => void) =>
    listen<{ projectId: string; paths: string[] }>("fs-changed", (e) => cb(e.payload)),
};
