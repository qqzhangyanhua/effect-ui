# Presets are a docs-page control, not a component prop

A catalog entry can declare presets: named bundles of control values. On the docs page, choosing a preset sets those controls at once. The reader can still change a single control afterwards, and reset returns to the demo start values. The copied JSX is the current control values, same as editing by hand.

Presets stay off the component's public props. A `preset` prop would freeze each bundle into the installed API, so renaming or deleting one would break user code, and every new look would be a permanent interface. The docs page is the only place that needs one-click bundles.

## Considered Options

- A public `preset` prop on the component: one prop would switch a whole look, but each preset name would become a stable API, and the component would have to keep rendering those looks forever.
- Presets stored only in the demo file: the panel and the props table could drift, and the audit could not check that preset values sit inside the control range.
