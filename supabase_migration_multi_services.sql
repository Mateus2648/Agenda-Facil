-- 1. Adicionar a coluna 'services_snapshot' (JSONB) para armazenar múltiplos serviços
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS services_snapshot jsonb DEFAULT '[]'::jsonb;

-- 2. Migrar os dados existentes (copiar o serviço atual para o array JSONB)
UPDATE appointments a
SET services_snapshot = jsonb_build_array(
  jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'price', s.price,
    'duration_minutes', s.duration_minutes
  )
)
FROM services s
WHERE a.service_id = s.id AND jsonb_array_length(a.services_snapshot) = 0;

-- 3. Tornar a coluna antiga 'service_id' opcional
ALTER TABLE appointments ALTER COLUMN service_id DROP NOT NULL;
