# AR CONSTRUCTION website

Premium public website and Supabase-backed admin dashboard for AR CONSTRUCTION. The project started from an empty folder.

## Local development

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
copy .env.example .env.local
npm run dev
```

With no Supabase variables, the marketing site runs in portfolio setup mode. Public company project cards and the contact submission service remain empty/unavailable until Supabase is configured; the site never reports a fake success or presents editorial photos as company work.

## Supabase setup

1. Create a Supabase project and keep development and production projects separate.
2. In Authentication settings, disable public sign-ups. Configure the allowed redirect URLs for local and production origins.
3. Apply migrations in order with Supabase CLI (`supabase link --project-ref ...`, then `supabase db push`) or the SQL editor: `202610090001_initial_schema.sql`, `202610090002_secure_enquiries_private_media_and_settings.sql`, then `202610090003_house_construction_package_and_enquiries.sql`. The second and third migrations are additive. The second disables direct public enquiry inserts, adds idempotency and rate-limit storage, extends public settings, and makes project media private. The third adds administrator-managed house construction package settings and private structured quotation-enquiry fields. Do not reset a live database.
4. Copy the Project URL and publishable/anon key into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Add the Cloudflare Turnstile **site key** as `VITE_TURNSTILE_SITE_KEY`. Leave `VITE_ENQUIRY_ENABLED=false` until staging validation succeeds and function secrets are configured. These browser-visible values are public; never put service-role or CAPTCHA secret keys in a `VITE_` variable.
5. Create an administrator identity through the Supabase dashboard or CLI while public sign-up is disabled. Then use the SQL editor with the exact auth UUID:

   ```sql
   insert into public.profiles (id, display_name, role)
   values ('AUTH_USER_UUID', 'Administrator', 'admin');
   ```

   Admin authorization is checked by PostgreSQL RLS against `profiles.role`, not by browser metadata. Password recovery links require Auth email delivery and a configured redirect URL. The login page has no registration flow.
6. Deploy the `submit-enquiry` Edge Function with `supabase functions deploy submit-enquiry`. Configure secrets on the Supabase project (never in Vite or committed files):

   ```sh
   supabase secrets set SITE_ORIGIN=https://your-domain.example
   supabase secrets set TURNSTILE_SECRET_KEY=your-server-side-turnstile-secret
   supabase secrets set TURNSTILE_EXPECTED_HOSTNAME=your-domain.example
   supabase secrets set ENQUIRY_RATE_LIMIT_SALT=<random-32-byte-or-longer-secret>
   ```

   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed functions. Do not print or copy the service-role value into this app. Configure the Turnstile widget for the exact production host and set its public site key in the production Vite environment. The endpoint rejects requests until all required server settings exist. Rate limiting is five successful CAPTCHA-verified submissions per IP hash per UTC hour; only a keyed hash is retained for at most two days.
7. Start the app, sign in at `/admin`, add confirmed project information, and use **Manage gallery** to preview, upload, order and describe images. Private Storage URLs are signed for published projects. Settings may contain only information approved for publication.

### House construction page

- The public page is `/house-construction`. Its ₹1,750/sq. ft. starting rate is indicative; the estimator is not a binding quotation and does not infer taxes, chargeable area, inclusions or exclusions.
- Scope candidates, separate-quote candidates, material notes, payment milestones, terms and FAQs are structured in `src/site/house-construction-data.ts`. All package items start as `to_confirm`; they are not advertised as included or excluded until an administrator approves and saves the package.
- After applying migration `202610090003_house_construction_package_and_enquiries.sql` in staging, an authorized administrator can edit the public package JSON from **Admin → Website settings → Rate, scope, FAQs & terms**. Edits are public and should be saved only after commercial approval. Service photographs are not managed by this package editor; the page uses an explicitly labelled architectural reference image, not a claimed company project.
- House construction quotation requests use the existing CAPTCHA-protected `submit-enquiry` Edge Function and rate limiter. The additive migration stores plot/built-up areas, floor count and project stage as structured fields; existing admin-only enquiry access also protects these details. Online submission remains disabled until the staging flow, migration, and function secrets are verified.

### Company photo archive

- The three supplied archives contained 10, 12 and 8 JPEG images respectively. Seven re-encoded, metadata-stripped copies were selected for site use; exact duplicate hashes were not found. The original ZIP files were left unchanged.
- Public assets are organized under `public/images/projects/civil/`, `aluminium/`, `interiors/` and `woodwork/`. Responsive 480 px and 960 px variants are generated where the source image is large enough.
- Archive photographs are labelled with neutral work categories and unconfirmed project details. They are not turned into project case studies or represented as completed AR CONSTRUCTION jobs.
- Unclear images, composites, renderings and signage-bearing photos remain unextracted; see [docs/project-photo-review.md](./docs/project-photo-review.md) for archive entry numbers and follow-up confirmation needed.

### Apply and test safely

- Use a separate Supabase **staging** project and staging Turnstile hostname before production.
- `npm run test:security` requires `TEST_ENVIRONMENT=staging`, `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY`, and the email/password for pre-provisioned admin and non-admin test users. It creates a uniquely named temporary project, checks anonymous/admin/viewer and media policies, then removes its project and test image. Never set `TEST_ENVIRONMENT=staging` for production.
- The script deliberately does not exercise CAPTCHA or rate limits against real Cloudflare without disposable staging credentials/widget configuration. Verify the deployed Edge Function with Cloudflare's non-production test keys and staging database before launch.
- Confirm both migrations are applied, staging security tests pass, and Edge Function secrets are configured before setting `VITE_ENQUIRY_ENABLED=true` and building the public contact form. The client disables submissions unless the feature flag, Supabase client, and public widget key are all present; the server returns unavailable if its secret configuration is incomplete.

### Important production hardening

Do not advertise the contact form until the Edge Function has been deployed and verified in staging. The server endpoint checks the exact allowed Origin, body size, field lengths and values, Turnstile result/hostname/action, an atomic database-backed IP-hash rate limit, and an idempotency UUID. It inserts only the accepted enquiry fields. Public database insert/select/update/delete access to enquiries is revoked; internal notes are accessible only through admin RLS.

Project media uses a private bucket. Anonymous signed reads are authorized only when a path is referenced by a published project cover or gallery record; writes/deletes require an admin role. Removed gallery files are unlinked and deleted only after references are checked. Project deletion similarly checks shared references before storage cleanup.

## Deploy

1. Run `npm run build` and deploy `dist/` to Vercel (or another static host). The included `public/_redirects` is for Netlify; for Vercel, add an SPA rewrite if the host does not fall back to `index.html`.
2. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` in the production environment, then redeploy. These values are compiled into the public bundle except the domain value; RLS is the access boundary.
3. Connect a custom domain and verify HTTPS, Auth redirect URLs, recovery email delivery, the public portfolio, admin login, and enquiry flow.
4. Keep automated Supabase backups enabled and periodically export migrations and project data. Test restoration in a separate project.

## Business details still needed

- Verified business phone, email and WhatsApp number.
- Legal business address, only if it should be published.
- Verified service areas beyond Hyderabad, Telangana.
- Company overview, vision, mission, team, credentials and confirmed experience.
- Genuine testimonials with permission to publish.
- Project titles, categories, accurate descriptions/scope, dates/locations where publication is authorized, and licensed company photographs.
- Production domain for canonical URLs, sitemap replacement and Search Console setup.
- Preferred confirmed service list and proposal/quotation workflow.

## SEO and accessibility

Semantic landmarks, route-specific document titles/descriptions, and responsive navigation are included. `public/sitemap.xml` contains a clearly marked example domain and must be replaced. No LocalBusiness structured data is emitted until address and phone have been verified. Motion respects `prefers-reduced-motion`; navigation and form fields have labels and keyboard focus.

## Implementation status

- Public pages: home, about, services/service anchors, project collection/detail, process and contact.
- Dashboard: Supabase password login/recovery, role-gated view, database-derived counts, project draft/publish, image upload progress/preview/gallery ordering/alt text/cover selection/removal, public website settings, and enquiry search/status/private notes.
- House construction: premium public service page, non-binding starting-rate estimator, draft scope/specification/terms/FAQ content, admin-editable structured package settings, and a secure structured quotation enquiry visible only in the admin dashboard.
- Company photo archive: selected civil, aluminium-framed storage, kitchen installation and woodwork photos are used in service imagery, house-construction context, related-service cards, and the fallback portfolio imagery. Unconfirmed scope/location/status is identified in the UI.
- Enquiries are accepted only through the configured server-side Edge Function. The security integration script is present but requires a separate staging project and two test accounts; live RLS, Turnstile, rate-limit, password recovery and browser end-to-end checks have not been run in this workspace.
- Project and enquiry admin list requests are bounded to the newest 100 records; the dashboard does not yet offer next-page controls for larger datasets.
- Editorial architectural images are Unsplash references. They are labelled as such; no AR CONSTRUCTION project, review, client or credential is fabricated.

## Checks

Run `npm run lint`, `npm test`, and `npm run build`. After configuring a **staging** backend and test accounts, run `npm run test:security`. Live Edge Function, database, Auth, visual-browser and responsive end-to-end validation cannot be claimed without that staging configuration and an available browser.
