# Controls are declared in the catalog entry, not in the demo

The docs site lets readers change some demo props live. Those controls (which props, value range, options, demo start value) are declared on the catalog entry's `PropDoc` as an optional `control` field, and the demo only receives the values as ordinary props. We chose this over a controls export next to each demo because the props table and the control panel then read one record and cannot drift, and because a value range is exactly the kind of fact the catalog exists to hold: it cannot be read from the component source. The cost is that a control lives in a different file from the demo that uses it, so adding one means touching both; a demo whose entry declares no controls is static.

## Considered Options

- Controls exported from the demo file: keeps demo and controls together, but duplicates the props table's names, types, and defaults in a second place.
- Controls derived from the component's TypeScript props type: no hand-written data, but cannot produce sensible ranges or demo start values, and ties the docs build to the TypeScript compiler.
