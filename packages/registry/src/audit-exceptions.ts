import type { AuditException } from "./audit"

/** 与 catalog 一起维护。每条必须写明原因。 */
export const auditExceptions: readonly AuditException[] = [
  {
    name: "rich-text-editor",
    type: "extra-npm-dependency",
    dependency: "@tiptap/pm",
    reason: "@tiptap/pm 是 @tiptap/react 的 peer 依赖，安装组件时保留。",
  },
]
