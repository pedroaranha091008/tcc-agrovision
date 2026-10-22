-- AlterTable
ALTER TABLE `analises` ADD COLUMN `detalhes` JSON NULL,
    ADD COLUMN `origem` ENUM('manual', 'automatica') NOT NULL DEFAULT 'manual';
