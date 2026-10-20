-- CreateTable
CREATE TABLE `sessoes` (
    `id_sessao` CHAR(36) NOT NULL,
    `id_usuario` CHAR(36) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `lembrar` BOOLEAN NOT NULL DEFAULT false,
    `expira_em` DATETIME(3) NOT NULL,
    `revogada_em` DATETIME(3) NULL,
    `substituida_por` CHAR(36) NULL,
    `user_agent` VARCHAR(255) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessoes_token_hash_key`(`token_hash`),
    INDEX `sessoes_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_sessao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessoes` ADD CONSTRAINT `sessoes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
