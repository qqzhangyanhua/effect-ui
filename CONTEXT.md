# effect-ui registry

effect-ui ships React UI and effect components as a shadcn-compatible registry: each component is copied into a user's project by `shadcn add`.

## Language

### Catalog

**Catalog**:
The authored list of everything the registry offers, one catalog entry per installable item.
_Avoid_: manifest, component list

**Catalog entry**:
The hand-written record for one item: its name, description, category, and source files. It holds only facts that cannot be read from the source itself.
_Avoid_: component meta, registry entry

**Batch**:
A group of catalog entries planned, implemented, and credited together, with one shared provenance record.
_Avoid_: wave, release, drop

### Components

**Primitive**:
A shadcn-style building block that is assembled from parts by the caller, such as `Select` with `SelectTrigger` and `SelectItem`. It stays close to its upstream shape and is never given features beyond it.
_Avoid_: base component, raw component

**Effect**:
A component in one of nine categories — text, backgrounds, cursor, decor, cards, buttons, micro, loaders, and scroll. Besides its visual props, an Effect can take typography props, behavior switches, and pointer interaction.
_Avoid_: animation, special effect

**Composite component**:
A props-driven component built on one or more primitives that covers a common scenario in a single call, such as a select with search, multiple values and a clear button. It is a separate catalog entry that depends on its primitives, so the user can pick either layer. A catalog entry that was already a composite component is upgraded in place instead of getting a second entry.
_Avoid_: aggregate component, wrapper, enhanced component

### Docs site

**Demo**:
The example rendered on a catalog entry's docs page to show the item in use. Each catalog entry that is a component or block has exactly one.
_Avoid_: example, preview (that is the page region the demo sits in), story

**Control**:
A demo prop that the reader can change live on the docs page. The catalog entry declares which props are controls and how each one is edited; a demo without controls is static.
_Avoid_: knob, playground prop, 属性面板项

**Preset**:
A named set of control values declared on a catalog entry. Choosing it on the docs page sets those controls together. It is not a component prop and is not part of the registry item.
_Avoid_: theme, variant

**Start value**:
The value a control holds when the demo first renders. It is chosen to show the item at its best and may differ from the prop's default, which stays what an installed copy renders when the prop is omitted.
_Avoid_: initial value, demo default

### Provenance

**Port**:
Code copied from a source whose license allows redistribution, then adapted to this registry. Every port records its source and license.
_Avoid_: copy, vendored component

**Original implementation**:
Code written from an item's publicly visible behavior without reading the source it was inspired by. Used when the source's license forbids redistribution; credited as "灵感来自 X，原创实现".
_Avoid_: rewrite, clone, 复刻 (reads as copying)
### Install output

**Registry item**:
The install JSON for one catalog entry that `shadcn add` consumes, including file contents and dependency lists.
_Avoid_: item JSON, component JSON

**Registry index**:
The single JSON document listing every registry item without file contents.
_Avoid_: registry.json (that is a file name, not the concept)

### Dependencies

**Npm dependency**:
An npm package that a registry item's source imports, which the user's package manager must install.
_Avoid_: package dependency (that term means the registry package's own `package.json`)

**Registry dependency**:
Another registry item that a registry item's source imports, which `shadcn add` installs alongside it.
_Avoid_: internal dependency, component dependency

**Extra dependency**:
An npm package installed with a registry item even though its source never imports it, such as a peer that another dependency needs.
_Avoid_: exception, override

**Sibling file**:
A second source file belonging to the same multi-file registry item, imported as `./name`. It is never a registry dependency.
_Avoid_: local import
