-- AlterTable: status de processamento no voo
ALTER TABLE `voos`
    ADD COLUMN `status_processamento` ENUM('pendente', 'em_processamento', 'concluido', 'falhou') NOT NULL DEFAULT 'pendente';

-- AlterTable: status de processamento na analise
ALTER TABLE `analises`
    ADD COLUMN `status` ENUM('pendente', 'em_processamento', 'concluido', 'falhou') NOT NULL DEFAULT 'concluido';

-- CreateTable: imagens_voo
CREATE TABLE `imagens_voo` (
    `id_imagem` CHAR(36) NOT NULL,
    `id_voo` CHAR(36) NOT NULL,
    `nome_original` VARCHAR(255) NOT NULL,
    `nome_armazenado` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `tamanho_bytes` INTEGER NOT NULL,
    `caminho` VARCHAR(500) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `imagens_voo_id_voo_idx`(`id_voo`),
    PRIMARY KEY (`id_imagem`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `imagens_voo` ADD CONSTRAINT `imagens_voo_id_voo_fkey` FOREIGN KEY (`id_voo`) REFERENCES `voos`(`id_voo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: relatorios
CREATE TABLE `relatorios` (
    `id_relatorio` CHAR(36) NOT NULL,
    `id_analise` CHAR(36) NOT NULL,
    `caminho_pdf` VARCHAR(500) NOT NULL,
    `versao_regras` VARCHAR(20) NOT NULL,
    `recomendacao` TEXT NOT NULL,
    `gerado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `relatorios_id_analise_idx`(`id_analise`),
    PRIMARY KEY (`id_relatorio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_id_analise_fkey` FOREIGN KEY (`id_analise`) REFERENCES `analises`(`id_analise`) ON DELETE CASCADE ON UPDATE CASCADE;
