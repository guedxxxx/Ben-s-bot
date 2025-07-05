require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  Events
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const GUEDX_ID = '955969285686181898';
const BEN_ID = '1327435436473454602';
const OWNER_ROLE_ID = '1375281684282474628';
const MANAGER_ROLE_ID = '1391159425128988802';
const LTC_ADDRESS = 'Lc9Yh8QE8GTPd2zGPcHk1PAjdeUYtxvjFD';

const userTickets = new Map();
const userEmbeds = new Map();
const unauthorizedAttempts = new Map();
const afkTimers = new Map();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (message.content === '!market') {
    if (![GUEDX_ID, BEN_ID].includes(message.author.id)) {
      const attempts = unauthorizedAttempts.get(message.author.id) || 0;
      if (attempts === 0) {
        await message.channel.send('Ping me again and I will nut all over your face');
      } else {
        await message.channel.send(`🍆 💦 Aaaaghh <@${message.author.id}> 😫😩`);
      }
      unauthorizedAttempts.set(message.author.id, attempts + 1);
      return;
    }

    const welcomeMsg = `
------------------------------------------------------------

🛒 WELCOME TO BEN'S MARKET 🛒

At Ben's Market, we specialize in selling exclusive Pets and Sheckles for Grow a Garden.

🌱 Our Pets give you better performance, faster grinding, and unique advantages to enjoy the game more.

💰 Our Sheckles service lets you get fruits directly, giving you the freedom to upgrade your farm without hours of tedious grinding.

💵 We accept multiple payment methods: Litecoin, CashApp, PayPal, and Robux. No hidden fees, and Robux taxes are covered.

⏳ Fast support: Staff will be with you within minutes to help with your purchase.

🔒 Safe, private, and simple – your satisfaction is our priority.

⬇️ Click the button below to open the shop and start choosing what you need to level up your Grow a Garden experience!

------------------------------------------------------------
`;

    const openButton = new ButtonBuilder()
      .setCustomId('open_shop')
      .setLabel('Open Shop')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(openButton);

    await message.channel.send({
      content: welcomeMsg,
      components: [row]
    });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton() && interaction.customId === 'open_shop') {
    const categoryMenu = new StringSelectMenuBuilder()
      .setCustomId('category_select')
      .setPlaceholder('Choose a category')
      .addOptions([
        { label: 'Pets', value: 'pets' },
        { label: 'Sheckles', value: 'sheckles' }
      ]);

    const row = new ActionRowBuilder().addComponents(categoryMenu);
    await interaction.reply({ content: 'Choose a category below:', components: [row], ephemeral: true });
  }

  if (interaction.isStringSelectMenu()) {
    const selectedId = interaction.customId;
    const user = interaction.user;
    const guild = interaction.guild;

    if (selectedId === 'category_select') {
      const choice = interaction.values[0];
      if (choice === 'pets') {
        const subMenu = new StringSelectMenuBuilder()
          .setCustomId('pets_submenu')
          .setPlaceholder('Select type')
          .addOptions([
            { label: 'Pets', value: 'pets_main' },
            { label: 'Aged Pets', value: 'aged_pets' }
          ]);
        const row = new ActionRowBuilder().addComponents(subMenu);
        await interaction.update({ content: 'Choose pets category:', components: [row] });
      }

      if (choice === 'sheckles') {
        if (userTickets.has(user.id)) {
          await interaction.reply({ content: 'You already have a ticket, close it before creating another one.', ephemeral: true });
          return;
        }
        const channel = await guild.channels.create({
          name: `ticket-${user.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: BEN_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: GUEDX_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: OWNER_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: MANAGER_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
          ]
        });

        const message = await channel.send(`<@${BEN_ID}>\nHow many fruits do you want? 1 Fruit = 35T Sheckles`);
        userTickets.set(user.id, channel.id);
        userEmbeds.set(user.id, message.id);

        afkTimers.set(user.id, setTimeout(() => {
          channel.send(`<@${user.id}>, are you still there? Please complete your order or let us know if you need help.`);
        }, 5 * 60 * 1000));

        const moreMenu = new StringSelectMenuBuilder()
          .setCustomId('additional_purchase')
          .setPlaceholder('Anything else?')
          .addOptions([
            { label: 'No, thanks', value: 'no' },
            { label: 'Yes, let me take a look', value: 'yes' }
          ]);
        const moreRow = new ActionRowBuilder().addComponents(moreMenu);
        await interaction.reply({ content: 'Do you want to add anything else?', components: [moreRow], ephemeral: true });
      }
    }

    if (selectedId === 'pets_submenu') {
      const choice = interaction.values[0];
      let products = [];
      if (choice === 'pets_main') {
        products = [
          { label: 'Queen Bee | 700 or 3$', value: 'queen_bee' },
          { label: 'Dragonfly | 900 or 4.5$', value: 'dragonfly' },
          { label: 'Mimic Octopus | 900 or 4.5$', value: 'mimic_octopus' },
          { label: 'Butterfly | 900 or 4.5$', value: 'butterfly' },
          { label: 'Raccoon | 1200 or 5$', value: 'raccoon' },
          { label: 'Disco Bee | 1400 or 5.5$', value: 'disco_bee' },
          { label: 'Fennec Fox | 2000 or 7.5$', value: 'fennec_fox' },
          { label: 'Mantis | 250 or 0.8$', value: 'mantis' },
          { label: 'Cooked Owl | 250 or 0.8$', value: 'cooked_owl' },
          { label: 'Toucan | 225 or 0.7$', value: 'toucan' },
          { label: 'Red Fox | 350 or 1.4$', value: 'red_fox' },
          { label: 'Chicken Zombie | 350 or 1.4$', value: 'chicken_zombie' }
        ];
      }
      if (choice === 'aged_pets') {
        products = [
          { label: 'Age 20 | 100 or 0.5$', value: 'age_20' },
          { label: 'Age 30 | 250 or 1.5$', value: 'age_30' },
          { label: 'Age 45 | 600 or 3$', value: 'age_45' },
          { label: 'Age 60 | 1000 or 5$', value: 'age_60' },
          { label: 'Age 75 | 1600 or 8$', value: 'age_75' }
        ];
      }

      const productMenu = new StringSelectMenuBuilder()
        .setCustomId('product_select')
        .setPlaceholder('Choose a product')
        .addOptions(products);

      const row = new ActionRowBuilder().addComponents(productMenu);
      await interaction.update({ content: 'Choose a product below:', components: [row] });
    }
  }
});

client.login(process.env.TOKEN);
