const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'templates',
        description: 'Mevcut sunucu şablonlarını listeler.',
        options: []
    },
    async execute(interaction) {
        fs.readdir('./templates', (err, files) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'Şablonları okurken bir hata oluştu.', ephemeral: true });
            }

            const templateNames = files.map((file, index) => `${index + 1}. ${file.replace('.json', '')}`).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('Şablonlar')
                .setDescription(templateNames)
                .setColor(0x00AE86);

            interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
};