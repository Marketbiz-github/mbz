-- Hapus batasan status yang lama
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Tambahkan batasan baru yang mengizinkan status 'archived'
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled', 'archived'));
