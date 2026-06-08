---
name: Dashboard interactivity feedback
description: User feedback on interactive feature quality in the React dashboard
type: feedback
---

Remove author search feature entirely — concept is good but implementation was too rough. Do not re-add without a proper design.

Remove click-venue-card-to-filter feature — not needed.

Two separate range inputs for year range is poor UX. Use a proper dual-handle slider (single track, two thumbs). Industry standard: @radix-ui/react-slider or rc-slider.

**Why:** Separate sliders are confusing and don't communicate "range" visually.
**How to apply:** Use a proper range slider library for any dual-handle sliders in this project.
