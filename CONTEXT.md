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
