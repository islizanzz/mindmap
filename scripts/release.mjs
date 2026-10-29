// 发布新版本：pnpm release 0.2.0
// 改好三处版本号，提交并打标签 v0.2.0，推送后由 GitHub Actions 打包并发布到 Releases，
// 已安装的 mindmap 会在下次启动或「检查更新…」时看到它。
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
  console.error("用法：pnpm release 0.2.0");
  process.exit(1);
}
const run = (cmd, cwd) => execSync(cmd, { stdio: "inherit", cwd });
const out = (cmd) => execSync(cmd, { encoding: "utf8" }).trim();

if (out("git status --porcelain")) {
  console.error("还有没提交的改动，请先提交。");
  process.exit(1);
}

const json = (path, edit) => {
  const data = JSON.parse(readFileSync(path, "utf8"));
  edit(data);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
};
json("package.json", (d) => (d.version = version));
json("src-tauri/tauri.conf.json", (d) => (d.version = version));
const cargo = readFileSync("src-tauri/Cargo.toml", "utf8");
writeFileSync("src-tauri/Cargo.toml", cargo.replace(/^version = ".*"$/m, `version = "${version}"`));
run("cargo update -p mindmap --offline", "src-tauri");

run(`git commit -am "Release v${version}"`);
run(`git tag -a v${version} -m "v${version}"`);
run("git push --follow-tags");
console.log(`\n已推送 v${version}，GitHub Actions 打包完成后就能更新。`);
