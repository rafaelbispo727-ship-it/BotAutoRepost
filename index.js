const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');

// Substitua com suas credenciais
const apiId = 21117228; // Seu api_id
const apiHash = '1d7a0af6fbdafe916ac803e444bc2100'; // Seu api_hash

// Usa a StringSession que você vai salvar no Railway
const stringSession = new StringSession(process.env.STRING_SESSION);

// IDs dos canais
const sourceChannelId = -1002631368556; // ID do canal de origem
const destinationChannelId = -1002258297029; // ID do canal de destino

const lastMessageIdFile = 'last_message_id.txt';

async function main() {
  console.log("Conectando...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start();

  console.log("✅ Conectado! O bot está rodando e vai repostar a cada 30 segundos.");

  // Inicia o processo de repostagem
  setInterval(async () => {
    await repostNextMedia(client);
  }, 30 * 1000); // 30 segundos (ajuste se quiser mais tempo)
}

async function repostNextMedia(client) {
  try {
    let lastProcessedId = 999999999;
    if (fs.existsSync(lastMessageIdFile)) {
      const fileContent = fs.readFileSync(lastMessageIdFile, 'utf8');
      if (fileContent) {
        lastProcessedId = parseInt(fileContent);
      }
    }

    const messages = await client.getMessages(sourceChannelId, {
      limit: 1,
      maxId: lastProcessedId - 1
    });

    if (messages.length === 0) {
      console.log("Não há mais mídias para repostar.");
      return;
    }

    const message = messages[0];
    const media = message.media;
    const caption = message.message;
    const entities = message.entities || [];

    if (!media) {
      console.log("Mensagem sem mídia, pulando...");
      fs.writeFileSync(lastMessageIdFile, message.id.toString());
      return;
    }

    // Tenta copiar a mensagem com formatação
    try {
      console.log("Copiando mensagem...");
      await client.invoke(new Api.messages.ForwardMessages({
        fromPeer: sourceChannelId,
        id: [message.id],
        toPeer: destinationChannelId,
        dropAuthor: false,
        dropMediaCaptions: false,
        silent: false,
      }));
      console.log("✅ Mídia copiada com sucesso!");
    } catch (copyError) {
      console.log("❌ CopyMessage falhou, tentando fallback...");

      try {
        const messageParams = {
          file: media,
          message: caption || ""
        };

        if (entities && entities.length > 0) {
          messageParams.entities = entities;
        }

        await client.sendMessage(destinationChannelId, messageParams);
        console.log("✅ Mídia enviada via sendMessage!");
      } catch (sendError) {
        console.error("❌ Falha total:", sendError.message);
        throw sendError;
      }
    }

    fs.writeFileSync(lastMessageIdFile, message.id.toString());

  } catch (error) {
    console.error("Erro no repost:", error);
  }
}

main();