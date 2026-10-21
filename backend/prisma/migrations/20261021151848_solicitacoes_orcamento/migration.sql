-- CreateTable
CREATE TABLE `solicitacoes_orcamento` (
    `id_solicitacao` CHAR(36) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `cidade` VARCHAR(150) NOT NULL,
    `cultura` VARCHAR(100) NOT NULL,
    `area_hectares` DECIMAL(12, 2) NOT NULL,
    `servico` VARCHAR(100) NOT NULL,
    `mensagem` TEXT NULL,
    `status` ENUM('novo', 'em_contato', 'concluido', 'cancelado') NOT NULL DEFAULT 'novo',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `solicitacoes_orcamento_status_idx`(`status`),
    INDEX `solicitacoes_orcamento_criado_em_idx`(`criado_em`),
    PRIMARY KEY (`id_solicitacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
