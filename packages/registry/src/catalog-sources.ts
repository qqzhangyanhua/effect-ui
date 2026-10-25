/**
 * 署名和源文件地址，按来源集中。
 * 条目保留原来的 batch 编号，从这里引用对应文案。
 */

/** React Bits */
export const reactBitsCredit = "灵感来自 React Bits，原创实现。"

/** Magic UI */
export const magic = "移植自 Magic UI，MIT，Copyright (c) Magic UI。"

/** Motion Primitives */
export const motionLib = "移植自 Motion Primitives，MIT，Copyright (c) 2024 ibelick（Julien Thibeaut）。"

/** Animata */
export const animata = "移植自 Animata，MIT，Copyright (c) Animata。"

/** Cult UI */
export const cult = "移植自 Cult UI，MIT，Copyright (c) 2023 Jordan-Gilliam。"
export const cultFile = (file: string) => `https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/${file}`

/** kokonutUI */
export const kokonut = "移植自 kokonutUI，MIT，Copyright (c) 2025 kokonutUI。"
export const kokonutuiFile = (name: string) =>
  `https://github.com/kokonut-labs/kokonutui/blob/main/components/kokonutui/${name}.tsx`

/** SmoothUI */
export const smooth = "移植自 SmoothUI，MIT，Copyright (c) 2024 Eduardo Calvo。"
export const smoothuiFile = (name: string) =>
  `https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/${name}/index.tsx`

/** Eldora UI */
export const eldora = "移植自 Eldora UI，MIT，Copyright Mudunuri Bhaskara Karthikeya Varma。"

/** UI Layouts */
export const layouts = "移植自 UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT。"
export const layoutsFile = (file: string) => `https://github.com/ui-layouts/uilayouts/blob/main/${file}`

/** Fancy Components */
export const fancy = "移植自 Fancy Components，MIT，Copyright (c) 2024 Daniel Petho。"
export const fancyHook = (name: string) => `https://github.com/danielpetho/fancy/blob/main/src/hooks/${name}.ts`
export const fancyFile = (path: string) => `https://github.com/danielpetho/fancy/blob/main/src/fancy/components/${path}`

/** shadcn-ui-expansions */
export const expansions = "移植自 shadcn-ui-expansions，MIT，Copyright (c) 2024 shadcnui-expansions。"
export const expansionFile = (name: string) =>
  `https://github.com/hsuanyi-chou/shadcn-ui-expansions/blob/main/components/ui/${name}.tsx`

/** Kibo UI */
export const kibo = "移植自 Kibo UI，MIT，Copyright (c) 2023 — Present shadcnblocks。"
export const kiboFile = (name: string) => `https://github.com/shadcnblocks/kibo/blob/main/packages/${name}/index.tsx`

/** SyntaxUI */
export const syntax = "移植自 SyntaxUI，MIT，Copyright (c) 2024 SyntaxUI。"
export const syntaxFile = (path: string) => `https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/${path}`

/** ReUI */
export const reui = "移植自 ReUI，MIT，Copyright (c) 2025 Keenthemes Inc。"
export const reuiFile = (name: string) => `https://github.com/keenthemes/reui/blob/main/registry/bases/radix/ui/${name}.tsx`

/** Tremor Raw */
export const tremor = "移植自 Tremor Raw，Apache-2.0，Copyright 2025 Tremor。本文件已修改。"
export const tremorFile = (path: string) => `https://github.com/tremorlabs/tremor/blob/main/src/components/${path}`

/** Uiverse galaxy */
export const galaxy = "移植自 Uiverse galaxy，MIT，Copyright (c) 2023 Uiverse.io。"
export const galaxyGalaxyfile = (path: string) => `https://github.com/uiverse-io/galaxy/blob/main/${path}`
export const galaxyGalaxyfile2 = (file: string) => `https://github.com/uiverse-io/galaxy/blob/main/${file}`

/** Spectrum UI */
export const spectrumUiSpectrum = "移植自 Spectrum UI，Apache-2.0，Made by Arihant。"
export const spectrumUiFile = (path: string) => `https://github.com/arihantcodes/spectrum-ui/blob/main/${path}`
export const spectrumUiSpectrum2 = "移植自 Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes。"

/** prompt-kit */
export const prompt = "移植自 prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut。"
export const promptFile = (file: string) => `https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/${file}`

/** shadcn-chat */
export const chat = "移植自 shadcn-chat，MIT，Copyright (c) 2024 Jakob Hoeg Mørk。"
export const chatFile = (file: string) => `https://github.com/jakobhoeg/shadcn-chat/blob/main/${file}`

/** HyperUI */
export const hyper = "移植自 HyperUI，MIT，Copyright (c) Mark Mead。"
export const hyperFile = (file: string) => `https://github.com/markmead/hyperui/blob/main/public/examples/${file}`

/** Meraki UI */
export const meraki = "移植自 Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa。"
export const merakiFile = (file: string) => `https://github.com/merakiuilabs/merakiui/blob/main/components/${file}`

/** daisyUI */
export const daisy = "移植自 daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi。"
export const daisyFile = (file: string) => `https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/${file}`

/** Flowbite */
export const flowbite = "移植自 Flowbite，MIT，Copyright (c) 2023 Bergside Inc.。"
export const flowbiteFile = (file: string) => `https://github.com/themesberg/flowbite/blob/main/content/${file}`

/** Velora UI */
export const velora = "移植自 Velora UI，MIT，Copyright (c) 2026 Aigars Silkalns。"
export const veloraFile = (file: string) => `https://github.com/ColorlibHQ/velora-ui/blob/main/src/components/velora/${file}`

/** Neobrutalism components */
export const neo = "移植自 Neobrutalism components，MIT，Copyright (c) 2023 Samuel Breznjak。"

/** Arc Library */
export const arc = "移植自 Arc Library，MIT，Copyright (c) 2026 Elia Kuratli。"
export const arcLibraryFile = (folder: string, name = `${folder}.tsx`) =>
  `https://github.com/kuratlielia/arc-library/blob/main/registry/components/${folder}/${name}`

/** ns-ui */
export const ns = "移植自 ns-ui，MIT，Copyright (c) 2026 Nikolas Sapalidis。"
export const nsUiFile = (folder: "core" | "loud", name: string) =>
  `https://github.com/nikolas-sapa/ns-ui/blob/main/registry/${folder}/${name}/component.tsx`

/** AI Canvas */
export const canvas = "移植自 AI Canvas，MIT，Copyright (c) 2026 AI Canvas。"
export const aicanvasFile = (name: string) =>
  `https://github.com/uiNerd16/aicanvas/blob/main/components-workspace/${name}/index.tsx`

/** interior */
export const interior = "移植自 interior，MIT，Copyright (c) 2026 ozzy。"
export const interiorFile = (name: string) => `https://github.com/ddoemonn/interior/blob/main/components/interior/${name}.tsx`

/** beUI */
export const beui = "移植自 beUI，MIT，Copyright (c) 2026 Saurabh Chauhan。"
export const beFile = (name: string) => `https://github.com/starc007/ui-components/blob/main/components/motion/${name}.tsx`

/** uselayouts */
export const uselayoutsCredit = "移植自 uselayouts，MIT，Copyright (c) 2025 Urvish Mali。"
export const uselayoutsFile = (name: string) => `https://github.com/iurvish/uselayouts/blob/main/registry/default/example/${name}.tsx`

/** Spell UI */
export const spell = "移植自 Spell UI，MIT，Copyright (c) 2025 Spell UI。"
export const spellFile = (name: string) => `https://github.com/xxtomm/spell-ui/blob/main/registry/spell-ui/${name}.tsx`

/** Sera UI */
export const sera = "移植自 Sera UI，MIT，Copyright (c) 2025 Sera UI。"
export const seraFile = (dir: string, name: string) => `https://github.com/seraui/seraui/blob/main/src/app/docs/${dir}/${name}.tsx`

/** HextaUI */
export const hexta = "移植自 HextaUI，MIT，Copyright (c) 2026 Preet Suthar。"
export const hextaHook = (name: string) => `https://github.com/preetsuthar17/HextaUI/blob/main/hooks/${name}.ts`

/** Motiq */
export const motiq = "移植自 Motiq，MIT，Copyright (c) 2026 Mahammad Rustamov。"
export const motiqFile = (dir: string, name: string) => `https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/${dir}/${name}.tsx`

/** Framekit UI */
export const framekit = "移植自 Framekit UI，MIT，Copyright (c) 2026 Framekit UI contributors。"
export const framekitUiFile = (name: string) => `https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/${name}.tsx`

/** GodUI */
export const godui = "移植自 GodUI，MIT，Copyright (c) 2026 Lucas Bassetti。"
export const goduiFile = (name: string) => `https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/${name}/${name}.tsx`

/** Watermelon UI */
export const watermelonUiCredit = "移植自 Watermelon UI，MIT，Copyright (c) 2025-present Watermelon Contributors。"
export const watermellonRegistryFile = (name: string) => `https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/${name}`

/** MosaicUI */
export const mosaic = "移植自 MosaicUI，MIT，Copyright (c) 2026 Darshan Sunil Rajadhyaksha。"
export const mosaicFile = (path: string) => `https://github.com/darshan-rajadhyaksha/mosaicui/blob/2baca92/${path}`

/** MicroKit */
export const micro = "移植自 MicroKit，MIT，Copyright (c) 2026 Henrique Barone。"
export const microFile = (name: string) => `https://github.com/henriquegpb/microkit/blob/fd993e8/registry/microkit/${name}`

/** Keyframery */
export const keyframery = "移植自 Keyframery，MIT，Copyright (c) 2026 Briyan Hingrajiya。"
export const kf = (file: string) => `https://github.com/keyframery/keyframery/blob/9ab2430/registry/components/keyframery/${file}`

/** Amicro */
export const amicro = "移植自 Amicro，MIT，Copyright (c) 2026 SYED SUBHAN UDDIN。"

