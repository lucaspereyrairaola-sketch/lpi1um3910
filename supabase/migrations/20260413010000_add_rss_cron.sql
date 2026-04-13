-- ─── pg_cron: ejecutar fetch-rss-pipeline cada 30 minutos ────────────────────
-- NOTA: pg_cron y pg_net requieren plan Supabase Pro o superior.
-- En plan gratuito, usar el GitHub Actions workflow en .github/workflows/rss-pipeline.yml

-- Habilitar extensiones (ignorar si ya existen)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Eliminar job anterior si existe (para poder re-ejecutar la migración)
SELECT cron.unschedule('midia-rss-pipeline') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'midia-rss-pipeline'
);

-- Programar cada 30 minutos
-- Usa pg_net para llamar a la edge function vía HTTP
-- REEMPLAZAR los valores de url y Bearer con los reales antes de ejecutar
SELECT cron.schedule(
  'midia-rss-pipeline',
  '7,37 * * * *',
  $cron$
    SELECT net.http_post(
      url     := 'https://TU_PROYECTO.supabase.co/functions/v1/fetch-rss-pipeline',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
      body    := '{"maxPerSource":3}'::jsonb
    ) AS request_id;
  $cron$
);

-- Verificar que quedó programado
-- SELECT * FROM cron.job WHERE jobname = 'midia-rss-pipeline';
