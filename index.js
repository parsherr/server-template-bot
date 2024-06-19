const { Client, GatewayIntentBits, Partials, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
});

client.commands = new Collection();

// Komutları yükleme
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
    console.log('Bot is online!');

    const commands = client.commands.map(command => command.data.toJSON());
    await client.application.commands.set(commands);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Bu komutu çalıştırırken bir hata oluştu!', ephemeral: true });
    }
});

// `sunucu-kur` komutunun işleyicisi
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'sunucu-kur') {
        const templateName = interaction.options.getString('şamblon_adi');
        const templatePath = `./templates/${templateName}.json`;

        if (!fs.existsSync(templatePath)) {
            return interaction.reply({ content: 'Bu şamblon bulunamadı.', ephemeral: true });
        }

        const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Onayla')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('İptal')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);

        await interaction.reply({
            content: `Sunucu şablonunu uygulamak üzeresiniz: ${templateName}. Emin misiniz?`,
            components: [row],
            ephemeral: true
        });

        const filter = i => i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                await i.deferUpdate();
                await interaction.guild.channels.cache.forEach(channel => channel.delete().catch(console.error));
                await interaction.guild.roles.cache.forEach(role => {
                    if (role.editable && role.id !== interaction.guild.id) role.delete().catch(console.error);
                });

                for (const roleData of template.roles) {
                    const permissions = roleData.permissions.map(permission => PermissionsBitField.Flags[permission]);
                    await interaction.guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        permissions: permissions,
                        hoist: roleData.hoist,
                        mentionable: roleData.mentionable
                    }).catch(console.error);
                }

                for (const categoryData of template.channels) {
                    const category = await interaction.guild.channels.create({
                        name: categoryData.name,
                        type: ChannelType.GuildCategory
                    });

                    for (const channelData of categoryData.channels) {
                        await interaction.guild.channels.create({
                            name: channelData.name,
                            type: ChannelType[channelData.type],
                            parent: category.id
                        });
                    }
                }

                try {
                    await interaction.editReply({ content: `Sunucu şablonu başarıyla uygulandı: ${templateName}`, components: [] });
                } catch (error) {
                    console.error('Failed to edit the interaction reply:', error);
                }
            } else {
                await i.update({ content: 'İşlem iptal edildi.', components: [] }).catch(console.error);
            }
        });

        collector.on('end', collected => {
            if (!collected.size) {
                interaction.editReply({ content: 'Zaman aşımına uğradı, işlem iptal edildi.', components: [] }).catch(console.error);
            }
        });
    }
});

client.login(config.token);