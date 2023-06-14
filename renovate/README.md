# Renovate configurations

This directory contains common configurations for [Mend Renovate](https://www.mend.io/renovate/). Some configurations are written in JSONC (JSON with Comments) and therefore require a build process before use:

```bash
pnpm run build
```

Built artifacts are put in `dist` directory, and should be pushed to the `renovate/<CURRENT_BRANCH_NAME>` (e.g. `renovate/main`) branch.

For user-faced documentation, refer to [`src/README.md`](src/README.md).
