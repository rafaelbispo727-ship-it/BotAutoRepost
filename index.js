const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

const sourceChannelId = parseInt(process.env.SOURCE_CHANNEL_ID);
const destinationChannelId = parseInt(process.env.DESTINATION_CHANNEL_ID);

const lastMessageIdFile = 'last_message_id.txt';

async function main() {
  console.log("Conectando...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({}); 

  console.log("Conectado! O bot está rodando e vai repostar a cada 10 minutos.");

  setInterval(async () => {
    await repostNextMedia(client);
  }, 10 * 60 * 1000); // 10 minutos
}

async function repostNextMedia(client) {
  try {
    let lastProcessedId = 0;
    if (fs.existsSync(lastMessageIdFile)) {
      const fileContent = fs.readFileSync(lastMessageIdFile, 'utf8');
      if (fileContent) {
        lastProcessedId = parseInt(fileContent);
      }
    }

    const messages = await client.getMessages(sourceChannelId, {
      limit: 1, 
      minId: lastProcessedId + 1
    });

    if (messages.length === 0) {
      console.log("Não há novas mídias para repostar.");
      return;
    }

    const message = messages[0];

    // Verifica se a mensagem tem mídia
    if (!message.media) {
      console.log("A próxima mensagem não contém mídia. Pulando...");
      fs.writeFileSync(lastMessageIdFile, message.id.toString());
      return;
    }
    
    // Extrai o texto da legenda e as entidades (incluindo emojis)
    const caption = message.message;
    const entities = message.entities;

    console.log(`Repostando mídia com ID ${message.id}...`);

    // Envia a mídia com a legenda e suas entidades
    await client.sendMessage(destinationChannelId, {
      file: message.media, // O objeto de mídia é copiado diretamente
      message: caption, // O texto da legenda
      entities: entities, // As entidades que contêm as informações de formatação, links e emojis
    });

    console.log(`Mídia repostada com sucesso!`);
    fs.writeFileSync(lastMessageIdFile, message.id.toString());

  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
}

main();