const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'yardım',
        description: 'Botun mevcut komutlarını listeler.',
        options: []
    },
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setTitle('Yardım Komutları')
            .setDescription('Aşağıda botun mevcut komutlarını bulabilirsiniz:')
            .addFields(
                { name: '/sunucu-kur <şamblon_adi>', value: 'Belirtilen şablona göre sunucu kurar.' },
                { name: '/templates', value: 'Mevcut sunucu şablonlarını listeler.' },
                { name: '/yardım', value: 'Botun mevcut komutlarını listeler.' }
            )
            .setImage('https://media.discordapp.net/attachments/1087824262322212975/1115390850248229014/standard_12.gif?ex=666eaf6d&is=666d5ded&hm=cd0250f60bc9f8d25fcedb6be88d77bba367e5b17cecda8040e52e55f3fc48bb&')
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }
};