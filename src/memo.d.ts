// mindmap 组件包的类型说明。组件挂在 window.Memo 下，依赖 window.React（18.3.1）。
import type { ReactNode, ReactElement } from 'react';

type IconName =
  | 'box' | 'folder' | 'folder-open' | 'folder-plus' | 'file-text' | 'file-spreadsheet' | 'file-plus'
  | 'chevron-right' | 'chevron-down' | 'plus' | 'ellipsis' | 'pencil' | 'trash-2'
  | 'pin' | 'pin-off' | 'circle-minus' | 'x';

/** 思维导图的一个节点；ordered 表示这一层来自有序列表。 */
export interface MindNode { id?: string; text: string; ordered?: boolean; children: MindNode[] }

export interface MenuItem { icon: IconName; label: string; onClick?: () => void }

/** 侧栏容器：宽 240 px，背景 surface-sidebar，滚动但不显示滚动条。 */
export function Sidebar(props: { children?: ReactNode }): ReactElement;

/** 分区标题「置顶」「项目」；传 onMore 才有「···」。 */
export function SectionLabel(props: {
  label: string; onMore?: () => void; menuOpen?: boolean; menu?: ReactNode;
}): ReactElement;

interface BranchProps {
  name: string; expanded?: boolean; depth?: number; onToggle?: () => void;
  /** 「+」：新建文档、新建文件夹 */
  onAdd?: () => void; addMenuOpen?: boolean; addMenu?: ReactNode;
  /** 「···」 */
  onMore?: () => void; menuOpen?: boolean; menu?: ReactNode;
  /** 文件夹和文件；层级会自动加一。没有时显示「没有文件」。 */
  children?: ReactNode;
}
/** 一个项目（box 图标）。 */
export function ProjectItem(props: BranchProps): ReactElement;
/** 一个文件夹（folder / folder-open 图标），可以无限嵌套。 */
export function FolderItem(props: BranchProps): ReactElement;

/** 一个 .md 或 .csv 文件，名称不带后缀。 */
export function FileItem(props: {
  name: string; kind: 'md' | 'csv'; current?: boolean; depth?: number;
  onClick?: () => void; onMore?: () => void; menuOpen?: boolean; menu?: ReactNode;
}): ReactElement;

/** 点「+」或「···」弹出的菜单；按按钮在屏幕上的位置定位，放不下时往上展开。 */
export function Menu(props: {
  items: MenuItem[]; onClose?: () => void; placement?: 'top';
}): ReactElement;

/** 正文区顶部标题区，显示文件名；子内容放在右侧。 */
export function DocHeader(props: { name: string; children?: ReactNode }): ReactElement;

/** .md 正文：直接修改；列表画成思维导图，点击全屏编辑。每次改动调用 onChange。 */
export function MarkdownView(props: {
  value: string; fileName: string; onChange?: (markdown: string) => void;
}): ReactElement;

/** 只读思维导图。 */
export function MindMap(props: { rootLabel?: string; tree: MindNode[]; onOpen?: () => void }): ReactElement;

/** 全屏编辑思维导图。回车加同级、Tab 加子节点、删空后按删除键删除、Esc 保存并返回。 */
export function MindMapEditor(props: {
  rootLabel?: string; tree: MindNode[]; onChange?: (tree: MindNode[]) => void; onClose?: () => void;
}): ReactElement;

/** .csv 只读表格。 */
export function CsvTable(props: { value: string }): ReactElement;

/** 正文区空状态。 */
export function EmptyState(props: { kind: 'no-projects' | 'no-file'; onCreate?: () => void }): ReactElement;

export function Button(props: {
  variant?: 'primary' | 'secondary' | 'text' | 'soft'; icon?: IconName; disabled?: boolean;
  onClick?: () => void; children?: ReactNode;
}): ReactElement;

/** 创建项目弹窗：项目名称 + 源文件夹。 */
export function CreateProjectDialog(props: {
  name?: string; folder?: { name: string; path: string } | null;
  onChooseFolder?: () => void;
  onConfirm?: (value: { name: string; folder: { name: string; path: string } }) => void;
  onCancel?: () => void;
}): ReactElement;

/** 输入名称的弹窗：新建文档、新建文件夹、重命名。 */
export function NameDialog(props: {
  title: string; value?: string; placeholder?: string; confirmLabel?: string;
  onConfirm?: (name: string) => void; onCancel?: () => void;
}): ReactElement;

/** 二次确认弹窗：移到废纸篓、从 mindmap 移除。 */
export function ConfirmDialog(props: {
  title: string; hint?: string; confirmLabel?: string; onConfirm?: () => void; onCancel?: () => void;
}): ReactElement;

export const markdown: {
  parseBlocks(md: string): Array<{ id: string; type: 'heading' | 'paragraph' | 'list' | 'code'; raw: string; level?: number }>;
  listToTree(listMarkdown: string): MindNode[];
  treeToList(tree: MindNode[]): string;
};

declare global { interface Window { Memo: typeof import('./memo'); } }
