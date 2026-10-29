// 每台机器各自记住的界面状态（展开了哪些、打开的是哪个文件）。读写失败时当作没有。

export function load<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`mindmap:${name}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(name: string, value: unknown) {
  try {
    localStorage.setItem(`mindmap:${name}`, JSON.stringify(value));
  } catch {
    // 忽略：只是下次打开时不恢复
  }
}
