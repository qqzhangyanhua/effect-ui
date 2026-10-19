import type { AuditException } from "./audit"

/** 与 catalog 一起维护。每条必须写明原因。 */
export const auditExceptions: readonly AuditException[] = [
  {
    name: "use-mobile",
    type: "unregistered-source",
    reason:
      "hooks/use-mobile.ts 尚未登记。依赖检查会把它登记为 registry:hook，此前临时例外。",
  },
]
