# openIMIS Frontend — TASAF Common

Shared building blocks used across the custom TASAF/CoreMIS openIMIS frontend modules:

- **`ModuleCalendar`** — prop-driven month/week calendar
- **Branded PDF core** — masthead, logos, watermark, footer, metadata boxes and print-only
  encryption, behind the household and training PDF exports
- **`calendar-dates`** — date arithmetic used by the calendar

`react`, `react-dom` and `@material-ui/*` are peer dependencies, and `.npmignore` excludes
`node_modules`: `file:` installs copy the directory, and a nested React breaks hooks silently.
Do not remove either.

## Build

```bash
npm install
npm run build
```
