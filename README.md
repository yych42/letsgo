# LETSGO

> Lightweight Editing Tool for Streamlined General Organization

A web app for sifting through a messy dateset, one column at a time.

Planned features arranged by priority:

-   🚧 Import CSV files.
-   🚧 Nondestructive editing.
-   🚧 Rename columns as you go.
-   💪 Preview numerical and string-type columns.
-   💪 Create notes for columns.
-   💪 Convert string-type columns to other types.
-   💭 Get warnings for potentially non-parameteric columns.
-   💭 Point-and-click for common transformations.
-   💭 Export R code.
-   💭 Do it on your phone! ...while you are on the bus ...very sad indeed.

Feature status flags:

-   🚧: Work in progress.
-   💪: Next up.
-   💭: Just an idea.

## Developing

Once you've installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> You may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
