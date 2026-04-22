# Design System Documentation: The Kinetic Instrument

## 1. Overview & Creative North Star
This design system is engineered for high-velocity Machine Learning workflows. Our Creative North Star is **"The Kinetic Instrument."** 

Unlike consumer software that prioritizes "friendliness" through soft curves and airy layouts, this system treats the screen as a professional-grade hardware console—think of a precision surgical monitor or a high-end synthesizer. We embrace density, technical clarity, and rigid geometry. We move beyond the "template" look by utilizing intentional asymmetry; the UI should feel like a custom-built cockpit where the most critical data streams (video frames and coordinate metadata) command the largest visual real-estate, while controls are tucked into dense, hyper-functional sidebars.

## 2. Colors & Surface Logic
The palette is rooted in deep graphites and slates to minimize eye strain during long annotation sessions. The accent color, a high-frequency cyan, is used sparingly but with absolute authority to indicate active states and "ground truth" data.

### The "No-Line" Rule
Standard UI relies on heavy borders to separate zones. We prohibit 1px solid borders for primary sectioning. Instead, boundaries must be defined through **Background Color Shifts**.
- A `surface_container_low` section sitting against a `surface` background creates a clean, architectural break without the visual noise of a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define importance:
- **Level 0 (Base):** `surface` (#131313) for the main application background.
- **Level 1 (Workspaces):** `surface_container_low` (#1c1b1b) for large side panels.
- **Level 2 (Interactive Elements):** `surface_container_high` (#2a2a2a) for nested cards or tool settings.

### The "Glass & Gradient" Rule
To elevate the tool from "utilitarian" to "bespoke," use **Glassmorphism** for floating HUDs (Heads-Up Displays) that overlay the video feed. Use a semi-transparent `surface_container` with a `backdrop-blur` of 12px-20px. 
For primary action states, apply a subtle linear gradient from `primary` (#c3f5ff) to `primary_container` (#00e5ff) to provide a "soul" to the technical interface.

## 3. Typography: The Dual-Engine Scale
We utilize two distinct typographic engines to separate human-readable UI from machine-generated data.

- **UI Labels (Sans-Serif): Inter.** This is for navigation, button labels, and settings. It is designed for maximum legibility at small sizes.
- **Technical Metadata (Monospace): JetBrains Mono.** Every frame number, timestamp, bounding box coordinate, and confidence score must use JetBrains Mono. This ensures that columns of numbers align perfectly, allowing the eye to scan for anomalies in the data stream.

**Hierarchy Note:** 
- **Display/Headline:** Used only for high-level dashboard metrics.
- **Label-SM/MD:** The workhorse of the system. In a dense environment, `label-sm` (11px) is our primary tool for metadata tags to maximize screen real estate.

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are prohibited. In a precision workstation, soft shadows feel "muddy." Instead, we use **Tonal Layering** and **Ghost Borders**.

- **The Layering Principle:** Stack `surface_container_lowest` cards on top of `surface_container_low` sections. The difference in hex values provides all the "lift" required.
- **The "Ghost Border" Fallback:** In high-density areas where color shifts aren't enough (e.g., a toolbar with 20+ icons), use a Ghost Border. This is a 1px stroke using the `outline_variant` token at **15% opacity**. It provides a "hint" of a boundary without cluttering the user's peripheral vision.
- **No Rounded Corners:** All components—buttons, cards, inputs—must use a `0px` border radius. Sharp corners imply precision and technical rigor.

## 5. Components

### Buttons
- **Primary:** High-contrast `primary_container` (#00e5ff) with `on_primary_fixed` text. 0px radius. Use for "Submit Annotations" or "Train Model."
- **Secondary:** `surface_container_high` background with a `Ghost Border`. For secondary tools.
- **Active State:** When a tool is selected (e.g., Bounding Box tool), the button background should shift to `primary` with a 2px left-side accent "pip" in `primary_fixed`.

### Input Fields
- **Design:** No background. Only a bottom border (1px) using `outline_variant`. 
- **Focus State:** The bottom border transforms into a full 1px box in `primary_container`.
- **Text:** Technical values (coordinates) must use JetBrains Mono.

### Cards & Lists
- **Rule:** Never use divider lines between list items. Use 4px or 8px of vertical whitespace or a subtle background hover shift (`surface_bright`) to indicate individual items.
- **Nesting:** Annotations within a frame should be grouped in a `surface_container_highest` card to pop against the darker sidebar.

### Video Timeline & Playback
- **The Playhead:** A 2px wide vertical line in `primary_container` (#00e5ff). 
- **Keyframes:** Use sharp diamonds or squares (0px radius). Never circles.

### Tooltips
- **Style:** `surface_container_highest` background, sharp corners, `label-sm` typography. 200ms delay to prevent flickering during rapid mouse movement.

## 6. Do's and Don'ts

### Do
- **Maximize Density:** If you can fit more data without sacrificing legibility, do it. This tool is for power users.
- **Use Monospace for Numbers:** Always. Precision is the priority.
- **Layer via Color:** Use the tiered surface colors to create "depth" instead of shadows.
- **Align to a 4px Grid:** Every component should snap to a 4px increment to maintain technical alignment.

### Don't
- **Don't use Rounded Corners:** No exceptions. The workstation must feel architectural.
- **Don't use Standard Shadows:** Shadows imply an organic, consumer environment. This is a digital instrument.
- **Don't use 100% Opaque Borders:** They create "visual traps" that distract from the video content. Use the Ghost Border rule.
- **Don't use Color for Decoration:** Use the Cyan accent only for meaningful interaction or status (Active, Selected, Success).