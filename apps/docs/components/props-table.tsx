import type { PropDoc } from "@effect-ui/registry/catalog"

function PropsTable({ props }: { props: PropDoc[] }) {
  if (props.length === 0) {
    return <p className="text-sm text-muted-foreground">此组件没有额外 props。</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">类型</th>
            <th className="px-4 py-2 font-medium">默认值</th>
            <th className="px-4 py-2 font-medium">说明</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-t">
              <td className="px-4 py-2 font-mono text-xs">{prop.name}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {prop.type}
              </td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {prop.defaultValue ?? "—"}
              </td>
              <td className="px-4 py-2">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { PropsTable }
