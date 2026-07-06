# System Design

This directory is the entry point for the `bff-pattern` architecture documentation.

Read the documents in order. The files stay flat under `docs/design/`; the hierarchy below is a reading guide, not a physical folder structure.

## Reading Order

| Order | Section | Purpose | Documents |
|---:|---|---|---|
| 0 | Foundation | Scope, constraints, and coverage | [Discovery Summary](discovery-summary.md), [Coverage Plan](coverage-plan.md) |
| 1 | System Shape | C4 L1/L2 system boundary | [V1 — System Context](v1-system-context.md), [V2 — Container Map](v2-container-map.md) |
| 2 | Runtime Flows | Request and auth behavior | [V3 — Data Flows](v3-data-flows.md), [V4 — Auth Flows](v4-auth-flows.md) |
| 3 | Component Boundaries | Internal module responsibilities | [V5 — BFF Proxy Component](v5-bff-proxy-component.md), [V6 — Auth Layer Component](v6-auth-layer-component.md), [V7 — Data Layer Component](v7-data-layer-component.md) |
| 4 | Delivery | Codegen and deployment | [V8 — Codegen Pipeline](v8-codegen-pipeline.md), [V9 — Deployment](v9-deployment.md) |
| 5 | Governance | Enforced architecture rules | [V10 — Architecture Rules](v10-architecture-rules.md), [Cross-View Review](cross-view-review.md) |

## Diagram Policy

- Prefer **Mermaid** when the diagram can be rendered directly by GitHub Markdown.
- Use **Structurizr DSL** when the view needs precise C4 semantics or deployment modelling that Mermaid cannot express cleanly.
- Keep valid explanatory Mermaid diagrams. Do not remove diagrams only because another notation exists.
- Every Structurizr DSL block should be followed by: <https://playground.structurizr.com/>.

## Developer Path

For implementation work, read:

1. [V2 — Container Map](v2-container-map.md)
2. [V3 — Data Flows](v3-data-flows.md)
3. [V5 — BFF Proxy Component](v5-bff-proxy-component.md)
4. [V7 — Data Layer Component](v7-data-layer-component.md)
5. [V10 — Architecture Rules](v10-architecture-rules.md)

For auth work, add:

- [V4 — Auth Flows](v4-auth-flows.md)
- [V6 — Auth Layer Component](v6-auth-layer-component.md)

For release/deployment work, add:

- [V8 — Codegen Pipeline](v8-codegen-pipeline.md)
- [V9 — Deployment](v9-deployment.md)
