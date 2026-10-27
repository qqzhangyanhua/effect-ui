---
status: accepted
---

# Composite components do not bind to a form library

Composite components forward `ref` and ARIA props (`id`, `aria-invalid`, `aria-describedby`) to the element that takes focus, and accept an explicit `status="error" | "warning"` that maps to `aria-invalid`. They take no `control` or `name` props and import no form library.

## Considered Options

- **Built-in react-hook-form adapter on each composite** (`<Select name="x" control={...} />`). Rejected: it ties every composite to one form library and makes each one heavier to install.

## Consequences

- `form` and `field` were later removed. Composites still do not import a form library.
- A composite that renders its own wrapper must still put the forwarded props on the real control, not on the wrapper.
