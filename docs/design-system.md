# Visual Design System: The Print Planet B2B Catalogue

## 1. Design Philosophy & Aesthetic Stance

The Print Planet design system is built to convey **industrial authority, engineering precision, and tactile craftsmanship**. Designed to represent a high-capacity manufacturer and supplier of ID card identification systems, the interface eliminates generic "AI SaaS" templates (no neon purple gradients, no floating glassmorphism, no fake stats).

Instead, it employs:
- **Crisp architectural grids** with clear visual hierarchy.
- **Spec-first product communication**: Direct presentation of technical tolerances, materials, widths, and compatibility.
- **High-contrast, legible typography** optimized for technical buyers and procurement officers.
- **Purposeful micro-interactions**: Tactile spring states, physical-feeling buttons, and clear interactive feedback.

---

## 2. Color Palette & Semantic Tokens

### Core Brand Colors
| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `navy-primary` | `#17365D` | Main navigation bar, primary brand accents, prominent headlines, footer backdrop |
| `navy-deep` | `#102742` | Hero sections, high-impact CTA banners, deep contrast surfaces, active states |
| `orange-accent` | `#E87832` | Request Quote CTAs, high-priority conversion buttons, badges, key pricing accents |
| `bg-main` | `#FFFFFF` | Primary content cards, product details canvas, table backgrounds |
| `bg-alt` | `#F5F7FA` | Alternate section backdrops, subtle card fills, input backgrounds |
| `text-main` | `#263445` | Primary body text, high-legibility product names, spec keys |
| `text-secondary`| `#687586` | Secondary descriptions, breadcrumbs, helper notes, metadata |
| `border-subtle` | `#DCE3EB` | Card dividers, tabular borders, input boundaries |
| `status-success`| `#217A4B` | Verified badges, stock indicators, successful submission states |
| `status-error`  | `#C0392B` | Form validation errors, destructive confirmation triggers |

---

## 3. Typography & Type Scale

Using **Inter** with optional tabular figures (`font-mono`) for precision measurements and model numbers.

| Level | Size / Line Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `Display H1` | 36px–48px / 1.15 | Bold (700) | `-0.03em` | Homepage hero headlines |
| `Section H2` | 28px–34px / 1.25 | SemiBold (600) | `-0.02em` | Category & major section titles |
| `Card H3` | 18px–22px / 1.30 | SemiBold (600) | `-0.01em` | Product card titles, modal headings |
| `Subheading` | 14px–16px / 1.40 | Medium (500) | `normal` | Sub-titles, table headers |
| `Body` | 14px–15px / 1.60 | Regular (400) | `normal` | General descriptions, spec content |
| `Caption / Badge`| 11px–12px / 1.40 | SemiBold (600) | `0.05em` | SKU badges, MOQ tags, status pills |
| `Technical Mono`| 13px–14px / 1.50 | Medium (500) | `normal` | Model codes (e.g. `VS-T`, `DCT4500`, `CR-80`) |

---

## 4. Component Standards

### A. Industrial Product Cards
- **Surface**: Pure white (`#FFFFFF`) with a 1px border in `#DCE3EB`.
- **Top Image Viewport**: Crisp 1:1 square ratio with neutral background `#F8FAFC`, subtle inner highlight, and centered product photography.
- **Specification Strip**: Compact pills showing Key Width (e.g., `20mm`), Material (`PVC`), and Model Code.
- **Action Strip**: "Request Quote" button in `#17365D` or `#E87832` with direct WhatsApp enquiry icon.

### B. Mobile Navigation Drawer
- Full-height slide-over drawer triggered by accessible hamburger toggle on mobile screens (`< 1024px`).
- Collapsible accordion for Product Categories, direct phone call button, and owner portal quick-link.

### C. Technical Specification Tables
- Dual-column alternating row zebra striping: `#FFFFFF` and `#F8FAFC`.
- Left column (Attribute): `#687586`, 40% width.
- Right column (Value): `#263445` bolded, 60% width.
- 1px border dividing cells in `#DCE3EB`.

### D. Owner Admin Portal Components
- Dark navy sidebar (`#102742`) with high-contrast active item indicators (`#E87832` border accent).
- Responsive data tables with batch action support, filter bars, and quick preview drawer.
- Drag-and-drop Cloudinary image uploader with preview thumbnails and primary image selectors.
- Bulk CSV/JSON import interface with pre-validation table and error report downloader.

---

## 5. Responsive Breakpoint Matrix

| Device / Viewport | Width | Layout Rules |
| :--- | :--- | :--- |
| **Mobile Compact** | `360px` | Single column grid, 100% width buttons, sticky mobile contact bar, 16px gutters |
| **Mobile Standard**| `390px` – `430px`| Single column cards, compact badges, swipeable chips |
| **Tablet** | `768px` | 2-column product grid, 2-column form rows, header contact strip visible |
| **Laptop** | `1024px` | 3-column product grid, mega menu enabled, sticky filter sidebar |
| **Desktop High-Res**| `1440px+` | 4-column product grid, maximum container width `1360px`, rich hover states |
