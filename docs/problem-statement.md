# Problem Statement

## Background

Electric utilities operate thousands of aging grid assets — power transformers, circuit breakers, transmission lines, and distribution switches — under increasing stress. Climate change is intensifying weather events, while load demand continues to grow, and equipment installed decades ago has accumulated years of thermal cycling and wear. The result is a widening gap between asset health and the operational conditions those assets face.

## The Problem

Grid reliability teams responsible for transmission and distribution operations lack a unified, real-time view that correlates **three critical risk dimensions simultaneously**: equipment sensor health, active weather conditions, and historical failure patterns. Today, a maintenance planner may check a SCADA system for load readings, consult a separate weather portal, and manually search maintenance logs — three disconnected systems — before deciding whether to dispatch a crew. This fragmented process typically takes **45–90 minutes per asset** and is prone to human judgment errors under time pressure.

The consequence: maintenance crews are dispatched reactively, after failure, rather than proactively before it. The average unplanned transformer outage in a dense urban area affects **15,000–80,000 customers** and takes **6–18 hours to restore** — far longer than a pre-positioned, proactive maintenance action.

## Who is Affected

**Primary users:** Grid reliability engineers, transmission operations supervisors, and maintenance planning leads at electric utilities managing transmission and sub-transmission assets in urban and suburban service territories.

**Secondary users:** Emergency response coordinators who need early warning of high-risk conditions to pre-position crews and equipment before a weather event makes field access difficult or dangerous.

**Affected public:** Hundreds of thousands of customers whose power reliability depends on whether at-risk equipment is identified and acted upon before it fails — including hospitals, water treatment plants, and critical commercial infrastructure.

## Why It Matters

- A single transformer failure serving 50,000 customers costs an average of **$2–5M** in customer impact, emergency response, and equipment replacement.
- The U.S. power grid loses approximately **$150B per year** to outage-related economic damage, much of it from aging infrastructure.
- Equipment installed in the 1990s–2000s is now at or beyond its expected service life, making the detection window for preventive intervention narrowing each year.
- Pre-positioning a maintenance crew costs roughly **$8,000–15,000**. The avoided cost of a single major outage justifies dozens of pre-emptive crew deployments.
- Safety: field crews responding reactively to failures during severe weather face significantly higher injury risk than crews dispatched proactively before the weather event.

## Why Existing Solutions Fall Short

Current SCADA and asset management systems (e.g., GE APM, ABB Ability, OSIsoft PI) provide excellent individual data streams but:
- **Require manual correlation** across multiple systems — SCADA, weather feeds, and CMMS are rarely integrated into a single risk view.
- **Do not rank assets by combined failure risk and grid impact** — they alert per threshold, not by prioritized consequence.
- **Lack natural-language explanations** — an alert that a transformer is at 88°C provides no immediate guidance on whether to dispatch a crew, order an oil test, or defer action.
- **Do not incorporate weather forecast risk** as a multiplier on already-stressed equipment — they treat each data dimension independently.

GridGuard AI addresses exactly these gaps by combining all three risk dimensions into a single, explainable, action-oriented interface.
