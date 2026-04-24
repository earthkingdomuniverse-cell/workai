# Open Source Model

WorkAI open-source model outlines how the platform can be adopted as an open ecosystem.

- Core engine and APIs are permissively licensed (MIT-style).
- Community contributions are welcomed via PRs and issues.
- Open Core pattern: core features are free to use; advanced features can be commercialized via add-ons or hosted services.
- Governance: contribution guidelines, Code of Conduct, security disclosure, and review process are published in CONTRIBUTING.md and SECURITY.md.
- Plugins: a pluggable architecture allows external contributors to implement plugins that extend the platform (eg. packaging, AI workflows, etc).

## How to contribute

- Read CONTRIBUTING.md for contribution process and coding standards.
- Add OSS plugins under plugins/ with a clear interface (see src/open_source/index.ts).
- Submit pull requests with small, well-scoped changes.

## OSS Plugin Registry

- You can query the available OSS plugins via API: GET /open-source/plugins
- This endpoint returns id, name, version and whether an init hook exists.
- Contributors can implement new plugins under plugins/ and expose an init(server) hook.

## Licensing

- The project adopts an open-source license to promote collaboration while enabling commercial opportunities via hosted services.

## Roadmap (Open Source)

- Establish a plugin registry and discovery service.
- Add automated docs generation for plugin APIs.
- Build a community governance model.

(End of document)
