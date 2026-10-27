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
A group of catalog entries planned, implemented, and credited together, with one shared provenance record. A batch says where entries came from, not how they are organised.
_Avoid_: wave, release, drop

**Layer**:
What kind of thing a catalog entry is: Primitive, Composite component, Widget, Effect, Section, Template, Hook, or Lib. Every catalog entry has exactly one layer, and the layer decides which checks the entry must pass.
_Avoid_: category (that is the second level inside the Effect layer), type, tier

### Components

**Primitive**:
A shadcn-style building block that is assembled from parts by the caller, such as `Select` with `SelectTrigger` and `SelectItem`. It stays close to its upstream shape and is never given features beyond it.
_Avoid_: base component, raw component

**Effect**:
A component in the Effect layer, whose main value is its motion or visual treatment. The test: with every animation removed, an Effect either becomes an existing primitive or has nothing left; a component that still does a complete job is a Widget or a Composite component instead. Besides its visual props, an Effect can take typography props, behavior switches, and pointer interaction.
_Avoid_: animation, special effect

**Effect category**:
The second-level grouping inside the Effect layer, naming what kind of effect it is: text, backgrounds, cursor, decor, cards, buttons, micro, loaders, scroll, showcase, page, or navigation. Only Effects have one.
_Avoid_: layer, form

**Purpose group**:
The second-level grouping shared by Primitives, Composite components and Widgets, naming what the component is for: form, overlay, navigation, data, layout, or feedback. Sections, Templates, Hooks and Libs have no second level.
_Avoid_: subgroup, use case

**Composite component**:
A props-driven component built on one or more primitives that covers a common scenario in a single call, such as a select with search, multiple values and a clear button. It extends one primitive family, so the user can pick either the primitive or the composite. It is a separate catalog entry that depends on its primitives. A catalog entry that was already a composite component is upgraded in place instead of getting a second entry.
_Avoid_: aggregate component, wrapper, enhanced component

**Widget**:
A props-driven component that does one concrete task end to end, such as viewing a diff, capturing a signature, or managing API keys. It is built around the task, not around a primitive family, even when it uses primitives inside. Its value is the function, not the motion.
_Avoid_: utility, block (that is a page or section), business component, 功能件

### Docs site

**Family**:
The members of one control across layers, such as every checkbox: the primitive, its composite, and checkbox Effects. A family has one docs page that renders every member, and each member's own page sends the reader there.
_Avoid_: group, collection

**Topic**:
A docs index of catalog entries that serve one domain across layers, such as AI. Unlike a family, its members keep their own docs pages; the topic only lists them.
_Avoid_: category, tag, family

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
