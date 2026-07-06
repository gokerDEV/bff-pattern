/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'ssr-mutator-server-only',
      comment:
        'ssr.mutator.ts is server-only. It must not be imported by client components or generated RQ clients.',
      severity: 'error',
      from: { path: '^((src/)?components/|(src/)?lib/generated/rq/)' },
      to: { path: '^(src/)?lib/api/ssr\\.mutator\\.ts$' },
    },
    {
      name: 'token-manager-server-only',
      comment:
        'token-manager.ts is server-only. It must not be imported by client components.',
      severity: 'error',
      from: { path: '^(src/)?components/' },
      to: { path: '^(src/)?lib/auth/token-manager\\.ts$' },
    },
    {
      name: 'proxy-internals-private',
      comment:
        'lib/proxy/ modules are private to app/api/[...proxy]/route.ts.',
      severity: 'error',
      from: { pathNot: '^(src/)?app/api/\\[\\.\\.\\.proxy\\]/route\\.ts$' },
      to: { path: '^(src/)?lib/proxy/' },
    },
    {
      name: 'rq-uses-client-mutator-only',
      comment:
        'Generated RQ clients must not import ssr.mutator.ts.',
      severity: 'error',
      from: { path: '^(src/)?lib/generated/rq/' },
      to: { path: '^(src/)?lib/api/ssr\\.mutator\\.ts$' },
    },
    {
      name: 'ssr-uses-ssr-mutator-only',
      comment:
        'Generated SSR clients must not import client.mutator.ts.',
      severity: 'error',
      from: { path: '^(src/)?lib/generated/ssr/' },
      to: { path: '^(src/)?lib/api/client\\.mutator\\.ts$' },
    },
    {
      name: 'generated-no-app-imports',
      comment:
        'lib/generated/ is generated output. It must not import from app/ or components/.',
      severity: 'error',
      from: { path: '^(src/)?lib/generated/' },
      to: { path: '^((src/)?app/|(src/)?components/)' },
    },
    {
      name: 'client-components-no-server-only-imports',
      comment:
        'Client components must not import server-only auth or SSR transport modules.',
      severity: 'error',
      from: { path: '^(src/)?components/' },
      to: {
        path: '^((src/)?lib/api/ssr\\.mutator\\.ts$|(src/)?lib/auth/token-manager\\.ts$|auth\\.ts$|proxy\\.ts$)',
      },
    },
    {
      name: 'no-direct-generated-in-pages',
      comment:
        'Prefer importing SSR clients through lib/api/fetch-and-validate.ts or a thin lib/api facade.',
      severity: 'warn',
      from: { path: '^(src/)?app/' },
      to: { path: '^(src/)?lib/generated/(ssr|rq)/' },
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
      archi: { collapsePattern: '^(node_modules|src/lib/generated|src/components/ui|components/ui)/[^/]+' },
    },
  },
}
