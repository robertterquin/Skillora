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
