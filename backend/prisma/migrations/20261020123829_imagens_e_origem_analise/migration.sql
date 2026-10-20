-- AlterTable
ALTER TABLE `analises` ADD COLUMN `detalhes` JSON NULL,
    ADD COLUMN `origem` ENUM('automatica', 'manual') NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE `imagens_voo` (
    `id_imagem` CHAR(36) NOT NULL,
    `id_voo` CHAR(36) NOT NULL,
    `nome_original` VARCHAR(255) NOT NULL,
    `nome_arquivo` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `tamanho_bytes` INTEGER NOT NULL,
    `largura` INTEGER NULL,
    `altura` INTEGER NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `imagens_voo_id_voo_idx`(`id_voo`),
    PRIMARY KEY (`id_imagem`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `imagens_voo` ADD CONSTRAINT `imagens_voo_id_voo_fkey` FOREIGN KEY (`id_voo`) REFERENCES `voos`(`id_voo`) ON DELETE RESTRICT ON UPDATE CASCADE;
