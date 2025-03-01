# .github / Renovate configurations

This branch contains built common configurations for [Mend Renovate](https://www.mend.io/renovate/).

## Config presets

To get started, put the following contents into `.github/renovate.json` in your repository:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>yanghanlin/.github#renovate/main"
  ]
}
```

For more information, refer to [Shareable Config Presets](https://docs.renovatebot.com/config-presets/) in Renovate documentation.
