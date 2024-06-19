const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'preview',
        description: 'Belirtilen şablonun içeriğini gösterir.',
        options: [
            {
                name: 'template',
                type: 3, // STRING type
                description: 'Şablonun adı',
                required: true,
            }
        ]
    },
    async execute(interaction) {
        const templateName = interaction.options.getString('template');
        const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.json`);

        if (!fs.existsSync(templatePath)) {
            return interaction.reply({ content: `Şablon bulunamadı: ${templateName}`, ephemeral: true });
        }

        const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

        const channels = templateData.channels || [];
        const roles = templateData.roles || [];

        let categoryDescription = '**Kategoriler ve Kanallar:**\n';
        channels.forEach(category => {
            categoryDescription += `\n**${category.name}**\n`;
            category.channels.forEach(channel => {
                categoryDescription += `- ${channel.name}\n`;
            });
        });

        let roleDescription = '\n**Roller:**\n';
        roles.forEach(role => {
            roleDescription += `- ${role.name}\n`;
        });

        const categoryEmbed = new EmbedBuilder()
            .setTitle(`Şablon: ${templateName} - Kategoriler ve Kanallar`)
            .setDescription(categoryDescription)
            .setColor(0x00AE86);

        const roleEmbed = new EmbedBuilder()
            .setTitle(`Şablon: ${templateName} - Roller`)
            .setDescription(roleDescription)
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [categoryEmbed], ephemeral: true });
        await interaction.followUp({ embeds: [roleEmbed], ephemeral: true });
    }
};