# AR CONSTRUCTION website

Static React, TypeScript and Vite website for AR CONSTRUCTION's civil construction and interior design services in Hyderabad, Telangana. The website has no backend and does not collect or store enquiry details.

## Local development

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

No `.env` file or server credentials are required. To activate WhatsApp actions, set `BUSINESS_WHATSAPP_NUMBER` in `src/site/whatsapp-config.ts` to the verified business number: country code followed by digits only. Do not add a leading plus sign, spaces or hyphens. Until a valid number is configured, WhatsApp actions are visibly inactive.

WhatsApp opens a click-to-chat URL with a page-specific suggested message. Visitors choose whether to continue and send it; the site itself does not capture form data. Messages should not include sensitive personal or financial information.

## Website content

- Public routes: home, about, services/service anchors, local work-image gallery and image details, process, contact and house construction.
- The projects gallery uses the supplied local photo archive. These images are labelled as unconfirmed archive imagery and are not presented as verified completed projects or case studies.
- House construction pricing and the area estimator are frontend-only and indicative. Final scope, specifications, chargeable area, taxes and terms require confirmation in a written quotation.
- No customer testimonials, completed project claims, business phone numbers or credentials are fabricated.
- The house-construction package content is static in `src/site/house-construction-data.ts`; edit it only when the business has approved the content.

## Checks

```sh
npm run lint
npm test
npm run build
```

## Deploy

Build with `npm run build` and publish the `dist/` folder on a static host. The Vite base path is configured for the GitHub Pages repository URL. The included GitHub Actions workflow builds and deploys `dist/` on pushes to `main` once GitHub Pages is configured to use GitHub Actions.

For direct links to nested routes, configure the static host to serve the app entry page for route requests. Do not add backend credentials to frontend source, environment files or GitHub Pages.

## Company photo archive

- Selected local images are organized under `public/images/projects/` by work category, with responsive variants where available.
- Archive images are labelled with neutral categories and unconfirmed project details; they are not verified project case studies.
- Unclear images, composites, renderings and signage-bearing photos remain unextracted. See [docs/project-photo-review.md](./docs/project-photo-review.md) for archive review notes.
