export const devtoolContent = {
  title: "在终端里看组件落地",
  lines: ["pnpm add effect-ui", "npx shadcn add hero-shader", "ready · registry 231 items"],
  before: "export function price() {\n  return 29\n}",
  after: "export function price(yearly: boolean) {\n  return yearly ? 19 : 29\n}",
  changelog: [
    { year: "2026.08", title: "着色器背景" },
    { year: "2026.09", title: "落地页区块" },
    { year: "2026.10", title: "整页模板" },
  ],
}
