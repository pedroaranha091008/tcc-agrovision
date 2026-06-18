-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` CHAR(36) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `propriedades` (
    `id_propriedade` CHAR(36) NOT NULL,
    `id_usuario` CHAR(36) NOT NULL,
    `nome_fazenda` VARCHAR(200) NOT NULL,
    `estado` CHAR(2) NOT NULL,
    `cidade` VARCHAR(150) NOT NULL,
    `area_total_hectares` DECIMAL(10, 2) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `propriedades_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_propriedade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `talhoes` (
    `id_talhao` CHAR(36) NOT NULL,
    `id_propriedade` CHAR(36) NOT NULL,
    `nome_talhao` VARCHAR(150) NOT NULL,
    `cultura` VARCHAR(100) NULL,
    `area_hectares` DECIMAL(10, 2) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `geojson` JSON NULL,
    `status` ENUM('ativo', 'inativo', 'em_analise') NOT NULL DEFAULT 'ativo',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `talhoes_id_propriedade_idx`(`id_propriedade`),
    PRIMARY KEY (`id_talhao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voos` (
    `id_voo` CHAR(36) NOT NULL,
    `id_talhao` CHAR(36) NOT NULL,
    `data_voo` DATETIME(3) NOT NULL,
    `altitude_metros` DECIMAL(6, 1) NULL,
    `modelo_drone` VARCHAR(100) NULL,
    `operador` VARCHAR(150) NULL,
    `observacoes` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `voos_id_talhao_idx`(`id_talhao`),
    INDEX `voos_data_voo_idx`(`data_voo`),
    PRIMARY KEY (`id_voo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analises` (
    `id_analise` CHAR(36) NOT NULL,
    `id_voo` CHAR(36) NOT NULL,
    `tipo_analise` ENUM('NDVI', 'RGB', 'termico', 'multispectral', 'outro') NOT NULL,
    `nivel_risco` ENUM('baixo', 'medio', 'alto', 'critico') NULL,
    `percentual_area_afetada` DECIMAL(5, 2) NULL,
    `resultado` TEXT NULL,
    `url_arquivo` VARCHAR(500) NULL,
    `data_analise` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `analises_id_voo_idx`(`id_voo`),
    INDEX `analises_tipo_analise_idx`(`tipo_analise`),
    INDEX `analises_nivel_risco_idx`(`nivel_risco`),
    PRIMARY KEY (`id_analise`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `propriedades` ADD CONSTRAINT `propriedades_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `talhoes` ADD CONSTRAINT `talhoes_id_propriedade_fkey` FOREIGN KEY (`id_propriedade`) REFERENCES `propriedades`(`id_propriedade`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voos` ADD CONSTRAINT `voos_id_talhao_fkey` FOREIGN KEY (`id_talhao`) REFERENCES `talhoes`(`id_talhao`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analises` ADD CONSTRAINT `analises_id_voo_fkey` FOREIGN KEY (`id_voo`) REFERENCES `voos`(`id_voo`) ON DELETE RESTRICT ON UPDATE CASCADE;
