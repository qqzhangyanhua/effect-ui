# Credits

See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for licenses, copyright holders, and the exact component mapping.

Design and implementation notes:

- Distribution follows the [shadcn registry](https://ui.shadcn.com/docs/registry) format (`registry.json` + `/r/{name}.json`).
- Visual language uses CSS variables so light/dark themes stay consistent across primitives and effects.
- The shadcn/ui base set is complete: remaining primitives (alert, calendar, command, drawer, form, sidebar, data-table, etc.) were added from the MIT-licensed shadcn sources.
- Additional text, background, interaction, card, button, navigation, and page-transition effects were ported from Magic UI, Animata, Motion Primitives, Cult UI, Fancy Components, Kibo UI, and Origin UI (all MIT), or written as originals when a similar effect was needed.
- Origin UI was taken only from the MIT `apps/origin/` directory of `cosscom/ui`. The rest of that repository is AGPL and was not used.
- React Bits was reviewed and **not** copied: its MIT + Commons Clause license forbids redistributing or porting the components themselves.
- Aceternity UI was reviewed and **not** copied due to a non-standard license.
