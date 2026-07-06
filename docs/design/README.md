# System Design

This directory is the entry point for the `bff-pattern` architecture documentation.

Read the documents in order. The files stay flat under `docs/design/`; the hierarchy below is a reading guide, not a physical folder structure.

## Reading Order

| Order | Section | Purpose | Documents |
|---:|---|---|---|
| 0 | Foundation | Scope, constraints, and coverage | [Discovery Summary](v01-discovery-summary.md), [Coverage Plan](v02-coverage-plan.md) |
| 1 | System Shape | C4 L1/L2 system boundary | [V03 — System Context](v03-system-context.md), [V04 — Container Map](v04-container-map.md) |
| 2 | Runtime Flows | Request and auth behavior | [V05 — Data Flows](v05-data-flows.md), [V06 — Auth Flows](v06-auth-flows.md) |
| 3 | Component Boundaries | Internal module responsibilities | [V07 — BFF Proxy Component](v07-bff-proxy-component.md), [V08 — Auth Layer Component](v08-auth-layer-component.md), [V09 — Data Layer Component](v09-data-layer-component.md) |
| 4 | Delivery | Codegen and deployment | [V10 — Codegen Pipeline](v10-codegen-pipeline.md), [V11 — Deployment](v11-deployment.md) |
| 5 | Governance | Enforced architecture rules | [V12 — Architecture Rules](v12-architecture-rules.md), [Cross-View Review](v13-cross-view-review.md) |

## Diagram Policy

- Prefer **Mermaid** when the diagram can be rendered directly by GitHub Markdown.
- Use **Structurizr DSL** when the view needs precise C4 semantics or deployment modelling that Mermaid cannot express cleanly.
- Keep valid explanatory Mermaid diagrams. Do not remove diagrams only because another notation exists.
- Every Structurizr DSL block should be followed by: <https://playground.structurizr.com/>.

## Developer Path

For implementation work, read:

1. [V04 — Container Map](v04-container-map.md)
2. [V05 — Data Flows](v05-data-flows.md)
3. [V07 — BFF Proxy Component](v07-bff-proxy-component.md)
4. [V09 — Data Layer Component](v09-data-layer-component.md)
5. [V12 — Architecture Rules](v12-architecture-rules.md)

For auth work, add:

- [V06 — Auth Flows](v06-auth-flows.md)
- [V08 — Auth Layer Component](v08-auth-layer-component.md)

For release/deployment work, add:

- [V10 — Codegen Pipeline](v10-codegen-pipeline.md)
- [V11 — Deployment](v11-deployment.md)
