-- AlterTable: senha opcional para contas exclusivamente Google + campos de provedor social
ALTER TABLE `usuarios`
    MODIFY `senha_hash` VARCHAR(255) NULL,
    ADD COLUMN `provedor_auth` ENUM('local', 'google') NOT NULL DEFAULT 'local',
    ADD COLUMN `google_sub` VARCHAR(255) NULL,
    ADD COLUMN `email_verificado` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `usuarios_google_sub_key` ON `usuarios`(`google_sub`);

-- CreateTable: sessoes (refresh tokens revogaveis)
CREATE TABLE `sessoes` (
    `id_sessao` CHAR(36) NOT NULL,
    `id_usuario` CHAR(36) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `user_agent` VARCHAR(255) NULL,
    `ip` VARCHAR(64) NULL,
    `expira_em` DATETIME(3) NOT NULL,
    `revogado_em` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessoes_token_hash_key`(`token_hash`),
    INDEX `sessoes_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_sessao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessoes` ADD CONSTRAINT `sessoes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
