/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'ssr-mutator-server-only',
      comment:
        'ssr.mutator.ts reads server env vars and injects OAuth tokens. ' +
        'It must never be imported in client components or RQ clients.',
      severity: 'error',
      from: { path: '^(components/|lib/generated/rq/)' },
      to: { path: '^src/lib/api/ssr\\.mutator\\.ts$' },
    },
    {
      name: 'token-manager-server-only',
      comment:
        'token-manager.ts uses in-memory Node.js state. ' +
        'It must not be imported from client components.',
      severity: 'error',
      from: { path: '^components/' },
      to: { path: '^src/lib/auth/token-manager\\.ts$' },
    },
    {
      name: 'proxy-internals-private',
      comment:
        'lib/proxy/ components are internal to app/api/[...proxy]/route.ts. ' +
        'They must not be imported elsewhere.',
      severity: 'error',
      from: { pathNot: '^src/app/api/\\[\\.\\.\\.' + 'proxy\\]/route\\.ts$' },
      to: { path: '^src/lib/proxy/' },
    },
    {
      name: 'rq-uses-client-mutator-only',
      comment:
        'Generated RQ (TanStack Query) clients must route through the BFF proxy ' +
        'via client.mutator.ts.',
      severity: 'error',
      from: { path: '^src/lib/generated/rq/' },
      to: { path: '^src/lib/api/ssr\\.mutator\\.ts$' },
    },
    {
      name: 'ssr-uses-ssr-mutator-only',
      comment:
        'Generated SSR clients must call the backend directly via ssr.mutator.ts.',
      severity: 'error',
      from: { path: '^src/lib/generated/ssr/' },
      to: { path: '^src/lib/api/client\\.mutator\\.ts$' },
    },
    {
      name: 'generated-no-app-imports',
      comment:
        'lib/generated/ is a build artefact. It must not import from app/ or components/.',
      severity: 'error',
      from: { path: '^src/lib/generated/' },
      to: { path: '^(src/app/|components/)' },
    },
    {
      name: 'no-direct-generated-in-pages',
      comment:
        'Prefer importing SSR clients via lib/api/fetch-and-validate.ts.',
      severity: 'warn',
      from: { path: '^src/app/' },
      to: { path: '^src/lib/generated/(ssr|rq)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/[^/]+' },
      archi: { collapsePattern: '^(node_modules|src/lib/generated|components/ui)/[^/]+' },
    },
  },
}
