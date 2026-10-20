---
status: accepted
---

# Composite Select is built on the Base UI combobox primitive

The repo has three dropdown engines: Radix Select (`select`), Radix Popover plus cmdk (`multi-select`), and Base UI Combobox (`combobox`). The composite Select uses the `combobox` primitive. It already provides chips, a clear control, grouping, an empty state and keyboard navigation, so the composite only maps `options` and `mode` (single, multiple, tags) onto those parts. The Radix Popover plus cmdk version would need hand-written backspace deletion, `maxTagCount` and focus handling.

## Considered Options

- **Radix Popover plus cmdk, as `multi-select` does today.** Rejected: more hand-written behaviour for the same result.
- **Radix Select.** Rejected: single value only and no search.

## Consequences

- The composite Select has a registry dependency on `combobox` and an npm dependency on `@base-ui/react`.
- `multi-select` changes engine when it becomes a wrapper, so its markup and focus behaviour may differ slightly from today.
- Base UI is newer and has less community material than Radix. If it proves unfit, replacing the engine only touches the composite, not the primitives.
- The spike passed. Non-searchable single mode uses a button trigger, and a Base UI popup can be opened and selected under jsdom.
