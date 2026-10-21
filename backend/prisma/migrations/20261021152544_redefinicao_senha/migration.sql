-- CreateTable
CREATE TABLE `redefinicoes_senha` (
    `id_redefinicao` CHAR(36) NOT NULL,
    `id_usuario` CHAR(36) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `expira_em` DATETIME(3) NOT NULL,
    `usada_em` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `redefinicoes_senha_token_hash_key`(`token_hash`),
    INDEX `redefinicoes_senha_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_redefinicao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `redefinicoes_senha` ADD CONSTRAINT `redefinicoes_senha_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
