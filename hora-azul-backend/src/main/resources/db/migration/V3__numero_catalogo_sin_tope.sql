-- El catálogo puede crecer desde el panel: el número ya no está limitado a 33
ALTER TABLE tarjeta DROP CONSTRAINT chk_catalog_number_range;
ALTER TABLE tarjeta ADD CONSTRAINT chk_catalog_number_positive CHECK (catalog_number >= 1);
