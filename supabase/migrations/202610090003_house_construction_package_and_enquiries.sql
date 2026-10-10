-- Additive house-construction package and private quotation enquiry details.
-- Apply in staging first; do not reset an existing database.

alter table public.site_settings
  add column if not exists house_construction_package jsonb not null default '{}'::jsonb;

alter table public.site_settings
  add constraint site_settings_house_construction_package_object
  check (jsonb_typeof(house_construction_package) = 'object');

alter table public.enquiries
  add column if not exists construction_plot_area numeric(12,2),
  add column if not exists construction_built_up_area numeric(12,2),
  add column if not exists construction_floors smallint,
  add column if not exists construction_stage text;

alter table public.enquiries
  add constraint enquiries_construction_areas_valid check (
    (construction_plot_area is null or construction_plot_area between 1 and 100000)
    and (construction_built_up_area is null or construction_built_up_area between 1 and 100000)
  ),
  add constraint enquiries_construction_floors_valid check (
    construction_floors is null or construction_floors between 1 and 20
  ),
  add constraint enquiries_construction_stage_valid check (
    construction_stage is null or construction_stage in (
      'Exploring options', 'Plot available', 'Design and planning',
      'Approvals in progress', 'Ready to build'
    )
  ),
  add constraint enquiries_house_construction_details_required check (
    project_type <> 'House Construction'
    or (
      construction_plot_area is not null
      and construction_built_up_area is not null
      and construction_floors is not null
      and construction_stage is not null
    )
  );

-- The existing site_settings RLS policy permits administrators to update the
-- package; enquiries remain readable only through the existing admin policy.
