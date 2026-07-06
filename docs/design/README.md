# System Design

This directory is the entry point for the `bff-pattern` architecture documentation.

Read the documents in order. Each section has a narrow purpose: first understand the boundary, then runtime paths, then components, then delivery, then enforceable rules.

## Reading Order

| Order | Section | Purpose | Documents |
|---:|---|---|---|
| 0 | [Foundation](00-foundation/) | Scope, constraints, and coverage | Discovery Summary, Coverage Plan |
| 1 | [System](01-system/) | C4 L1/L2 system shape | V1 System Context, V2 Container Map |
| 2 | [Flows](02-flows/) | Runtime behavior | V3 SSR vs BFF Data Flow, V4 Auth Flows |
| 3 | [Components](03-components/) | Internal component boundaries | V5 BFF Proxy, V6 Auth Layer, V7 Data Layer |
| 4 | [Delivery](04-delivery/) | Codegen and deployment | V8 Codegen Pipeline, V9 Deployment |
| 5 | [Governance](05-governance/) | Enforced architecture rules | V10 Architecture Rules, Cross-View Review |

## Diagram Policy

- Prefer **Mermaid** when the diagram can be rendered directly by GitHub Markdown.
- Use **Structurizr DSL** when the view needs precise C4 semantics or deployment modelling that Mermaid cannot express cleanly.
- Keep valid explanatory Mermaid diagrams. Do not remove diagrams only because another notation exists.
- Every Structurizr DSL block must be followed by this link: <https://playground.structurizr.com/>.

## Developer Path

For implementation work, read:

1. [V2 — Container Map](v2-container-map.md)
2. [V3 — SSR vs BFF Data Flow](v3-data-flows.md)
3. [V5 — BFF Proxy Component](v5-bff-proxy-component.md)
4. [V7 — Data Layer Component](v7-data-layer-component.md)
5. [V10 — Architecture Rules](v10-architecture-rules.md)

For auth work, add:

- [V4 — Auth Flows](v4-auth-flows.md)
- [V6 — Auth Layer Component](v6-auth-layer-component.md)

For release/deployment work, add:

- [V8 — Codegen Pipeline](v8-codegen-pipeline.md)
- [V9 — Deployment](v9-deployment.md)
