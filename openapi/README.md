# HBS HOME API contract snapshot

`hbs-home-api.v1.json` is synchronized from the API repository and is the input for the generated frontend types.

Commands:

```bash
bun run api:types
bun run api:types:check
```

The snapshot must be updated from the exact API contract version validated for a release. UI components must consume the generated types through `src/api/client.ts`, not duplicate transport DTOs.
