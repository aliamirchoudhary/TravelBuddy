```markdown
# Design System Document: The Cinematic Explorer

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Auteur"**

This design system is built to move beyond the utilitarian "booking app" aesthetic. It is an editorial-first framework designed to frame high-definition travel content as fine art. We reject the "boxed-in" web; instead, we embrace **Organic Immersive Layering**. 

The goal is to create a feeling of looking through a high-end camera lens. We achieve this through:
*   **Intentional Asymmetry:** Breaking the expected grid to create a sense of discovery and movement.
*   **Atmospheric Depth:** Using glassmorphism and tonal shifts rather than lines to define space.
*   **Cinematic Scale:** Utilizing extreme typographic contrasts—pairing massive display headers with delicate, high-legibility labels.

---

## 2. Colors: Tonal Depth & Radiant Accents
The palette is rooted in the "Deep Charcoal" ecosystem to ensure that user-generated vlogs and photography are the brightest elements on the screen.

### The Palette (Material Design Tokens)
*   **Background (`#0c0e11`):** The absolute foundation. All immersive experiences begin here.
*   **Primary ("Electric Azure" - `#81ecff`):** Use for high-action triggers and active states.
*   **Secondary ("Sunset Orange" - `#ff7353`):** Use for "Momentum" moments—liking, sharing, or highlighting "Live" statuses.
*   **Surface Containers:** Ranging from `surface-container-lowest` (`#000000`) to `surface-bright` (`#292c31`).

### The "No-Line" Rule
**Strict Mandate:** Standard 1px solid borders are prohibited for sectioning or containment. 
*   **The Method:** Define boundaries through background shifts. A `surface-container-low` card sitting on a `background` provides all the separation the eye needs.
*   **The Transition:** Use the `outline-variant` token at 10-15% opacity only when an edge needs to catch the "light" in a dark environment.

### The "Glass & Gradient" Rule
To elevate the UI from "flat" to "premium," floating elements (modals, navigation bars, hover cards) must use **Glassmorphism**:
*   **Fill:** `surface-container` at 60-80% opacity.
*   **Effect:** `backdrop-blur` (minimum 16px).
*   **Stroke:** A "Ghost Border" using `outline-variant` at 20% opacity to mimic the edge of a lens.

---

## 3. Typography: The Editorial Voice
Our typography creates a hierarchy of "The Story" (Headings) vs. "The Data" (UI).

*   **Display & Headline (Epilogue):** Bold, wide, and authoritative. Use `display-lg` (3.5rem) for hero titles. This font represents the "Vlogger's Voice."
*   **Title & Body (Manrope):** A versatile, modern sans-serif. Manrope provides the "clean" feel requested, ensuring long-form travelogues remain readable.
*   **Labels (Plus Jakarta Sans):** Used for metadata (lat/long coordinates, timestamps). It adds a technical, "instrument-panel" aesthetic to the social features.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is "baked in," not added on.

*   **The Layering Principle:** Instead of shadows, use the surface scale. 
    *   *Base:* `background` (`#0c0e11`)
    *   *Section:* `surface-container-low` (`#111417`)
    *   *Component:* `surface-container` (`#171a1d`)
*   **Ambient Shadows:** Use only for high-priority floating elements (e.g., a "Create Vlog" FAB). Use a 40px blur, 0% spread, and a color derived from `surface-container-lowest` at 40% opacity. It should feel like a soft glow-in-reverse, not a drop shadow.
*   **Interaction Depth:** Upon hover, a card shouldn't just grow; it should transition from `surface-container` to `surface-bright`, effectively "lighting up" as the user engages.

---

## 5. Components

### Buttons: The Action Triggers
*   **Primary:** Fill with a gradient from `primary` (`#81ecff`) to `primary-dim` (`#00d4ec`). 0.5rem (md) corner radius. Use `on-primary-fixed` for text.
*   **Secondary:** Glass-style. `surface-container-high` at 40% opacity with a `backdrop-blur`.
*   **Tertiary:** Text-only using `primary` color, reserved for low-emphasis utility actions.

### Cards & Media Containers
*   **Forbid Dividers:** Never use a horizontal line to separate card content. Use `spacing-6` (2rem) of negative space.
*   **The "Cinematic" Card:** Full-bleed imagery with a `surface-container-lowest` to transparent gradient overlay at the bottom to house `title-md` text.

### Inputs & Search
*   **State:** Default state is `surface-container-highest` with no border. 
*   **Active State:** The bottom edge glows with a 2px `primary` ("Electric Azure") underline.

### Specialized Component: The "Vlog Scrubber"
*   A custom timeline component for video playback using `secondary` (`#ff7353`) for the progress bar to provide high contrast against the dark UI and blue primary accents.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use extreme negative space. If a layout feels "full," increase padding to `spacing-12` or `spacing-16`.
*   **Do** overlap elements. Let a `display-lg` heading partially overlap a cinematic image to create 3D depth.
*   **Do** use `primary` and `secondary` accents sparingly. They are "light sources" in a dark room; too many will blind the user.

### Don't:
*   **Don't** use pure white (`#ffffff`) for text. Use `on-surface` (`#f9f9fd`) or `on-surface-variant` (`#aaabaf`) to reduce eye strain in dark mode.
*   **Don't** use standard "Material" 4px rounded corners. Use the `lg` (1rem) or `xl` (1.5rem) tokens for a softer, more premium feel.
*   **Don't** use "Card-in-Card" layouts with borders. Distinguish nested content through a 2% shift in surface brightness.

---

## 7. Spacing Scale: The Breath of the UI
Spacing must be generous to support scroll animations. 
*   **Section Gaps:** Always use `spacing-20` (7rem) or `spacing-24` (8.5rem). 
*   **Content Grouping:** Use `spacing-4` (1.4rem) for related items.
*   **The "Auteur" Offset:** Frequently offset content by `spacing-10` from the center-line to break symmetry and guide the eye dynamically.```