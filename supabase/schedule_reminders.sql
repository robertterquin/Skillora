-- Runs the "reminders" edge function every 15 minutes.
-- Before running this file:
--   1. Enable the pg_cron and pg_net extensions (Database -> Extensions).
--   2. Deploy the function:   supabase functions deploy reminders
--   3. Set its secrets:       supabase secrets set RESEND_API_KEY=... EMAIL_FROM="Skillora <hello@your-domain>" SITE_URL=https://your-site CRON_SECRET=<long random string>
--   4. Replace <project-ref> and <cron-secret> below (use the same CRON_SECRET).

select cron.unschedule('skillora-reminders')
where exists (select 1 from cron.job where jobname = 'skillora-reminders');

select cron.schedule(
  'skillora-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<cron-secret>'),
    body := '{}'::jsonb
  );
  $$
);
