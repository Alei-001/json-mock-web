# Design

## Theme

Light. A developer at a clean workstation, natural light, focused on building. The tool should feel like a precision instrument: reliable, unobtrusive, always ready.

## Color Palette

OKLCH throughout. Restrained strategy: tinted neutrals + one accent.

### Tokens

| Token | OKLCH | Role |
|-------|-------|------|
| `--primary` | oklch(0.450 0.150 20.0) | Primary actions, key UI, selection |
| `--bg` | oklch(1.000 0.000 0) | Page background, pure white |
| `--surface` | oklch(0.975 0.003 20.0) | Cards, panels, elevated areas |
| `--surface-raised` | oklch(0.955 0.005 20.0) | Hover state, active panels |
| `--ink` | oklch(0.150 0.010 20.0) | Body text, headings |
| `--ink-secondary` | oklch(0.420 0.012 20.0) | Labels, descriptions |
| `--muted` | oklch(0.550 0.010 20.0) | Placeholder, disabled text |
| `--border` | oklch(0.900 0.005 20.0) | Dividers, card borders |
| `--border-focus` | oklch(0.450 0.150 20.0) | Focus rings, active borders |
| `--accent` | oklch(0.520 0.110 185.0) | Links, data indicators, status |
| `--success` | oklch(0.550 0.140 145.0) | Success states |
| `--warning` | oklch(0.700 0.140 75.0) | Warning states |
| `--error` | oklch(0.500 0.170 25.0) | Error states |

### Semantic mapping

- **Primary button**: `--primary` bg, white text (Helmholtz-Kohlrausch: saturated mid-luminance needs white)
- **Secondary button**: transparent bg, `--primary` text, `--border` outline
- **Focus ring**: 2px solid `--border-focus`, 2px offset
- **Selection**: `--primary` at 10% opacity as bg tint
- **Hover**: surface raised one step
- **Disabled**: `--muted` text, `--surface` bg

## Typography

One family: Inter (system font stack fallback).

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `--text-display` | 24px | 600 | 1.3 | Page titles |
| `--text-heading` | 18px | 600 | 1.4 | Section headings |
| `--text-subheading` | 15px | 600 | 1.4 | Card titles, field labels |
| `--text-body` | 14px | 400 | 1.6 | Body text, descriptions |
| `--text-caption` | 12px | 400 | 1.5 | Hints, timestamps |
| `--text-mono` | 13px | 400 | 1.5 | Code, JSON, technical values |

Scale ratio: 1.125 (tight, product-appropriate).

Font stack: `'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`.

Mono stack: `'JetBrains Mono', 'Fira Code', ui-monospace, 'Cascadia Code', Consolas, monospace`.

## Spacing

4px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Inline gaps, icon margins |
| `--space-2` | 8px | Compact gaps, form field padding |
| `--space-3` | 12px | Card internal padding (compact) |
| `--space-4` | 16px | Standard gaps, card padding |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Panel padding |
| `--space-8` | 32px | Large section separation |
| `--space-10` | 40px | Page section margins |
| `--space-12` | 48px | Page top/bottom padding |

## Layout

- **Main layout**: Left-right split, 50/50 default, resizable
- **Top bar**: 56px height, sticky
- **Panels**: Rounded corners 8px, 1px border, subtle shadow
- **Cards**: `--surface` bg, 8px radius, 1px `--border`
- **Z-index scale**: dropdown(100) → sticky(200) → modal-backdrop(300) → modal(400) → toast(500) → tooltip(600)

## Motion

150-250ms transitions. State conveyance, not decoration.

| Property | Duration | Easing |
|----------|----------|--------|
| Color/bg change | 150ms | ease-out |
| Transform (scale, translate) | 200ms | ease-out-quart |
| Opacity fade | 200ms | ease-out |
| Modal/drawer enter | 250ms | ease-out-quint |

Reduced motion: all transitions become instant (0ms).

## Components

### Buttons

- **Primary**: 8px radius, `--primary` bg, white text, 40px height
- **Secondary**: 8px radius, transparent bg, `--primary` text, `--border` outline
- **Ghost**: No bg/border, `--primary` text, hover: `--surface` bg
- **Icon button**: 36px square, ghost style, centered icon

### Inputs

- **Text input**: 8px radius, `--border` border, `--bg` bg, 40px height
- **Focus**: 2px `--border-focus` ring
- **Error**: `--error` border, error message below

### Cards

- **Surface**: `--surface` bg, 8px radius, 1px `--border`
- **Hover**: subtle shadow lift
- **Selected**: `--primary` 10% bg tint, `--primary` left border (1px only, not a stripe)

### Panels

- **Sidebar**: `--surface` bg, 240px default width
- **Main content**: `--bg` bg
- **Preview panel**: `--surface` bg

### Code editor

- **Background**: oklch(0.980 0.002 20.0) (very slight warm tint)
- **Gutter**: `--muted` text
- **Syntax**: Monokai-inspired but muted (not neon)

## Iconography

Lucide icons. 16px for inline, 20px for buttons, 24px for navigation. Stroke width 1.5px.

## Shadows

Subtle, layered. No heavy drop shadows.

| Token | Value |
|-------|-------|
| `--shadow-sm` | 0 1px 2px oklch(0.000 0 0 / 0.05) |
| `--shadow-md` | 0 2px 8px oklch(0.000 0 0 / 0.08) |
| `--shadow-lg` | 0 4px 16px oklch(0.000 0 0 / 0.10) |
