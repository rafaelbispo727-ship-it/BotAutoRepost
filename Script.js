


const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const input = require('input');

// Substitua com suas credenciais e IDs dos canais
const apiId = 21117228; // Seu api_id
const apiHash = '1d7a0af6fbdafe916ac803e444bc2100'; // Seu api_hash
// Se você já tem a string da sessão, cole aqui. Se não, deixe ""
const stringSession = new StringSession(""); 

const sourceChannelId = -1002631368556; // ID do canal de origem
const destinationChannelId = -1002258297029; // ID do canal de destino

const lastMessageIdFile = 'last_message_id.txt';

async function main() {
  console.log("Conectando...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Por favor, digite seu número de telefone: "),
    password: async () => await input.text("Por favor, digite sua senha de verificação de duas etapas: "),
    phoneCode: async () => await input.text("Por favor, digite o código que você recebeu no Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("Conectado! O bot está rodando e vai repostar a cada 10 minutos.");

  // Inicia o processo de repostagem a cada 10 minutos
  setInterval(async () => {
    await repostNextMedia(client);
  }, 30 * 1000); // 10 minutos em milissegundos
}

async function repostNextMedia(client) {
  try {
    let lastProcessedId = 999999999; // Valor inicial grande
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
    
    console.log("Legenda:", caption);
    console.log("Entidades:", entities);
    console.log("Número de entidades:", entities.length);

    if (!media) {
      console.log("A próxima mensagem não contém mídia. Pulando para a anterior...");
      // Se não tem mídia, salva o ID para não processar novamente e avança
      fs.writeFileSync(lastMessageIdFile, message.id.toString());
      return;
    }

    // MÉTODO PRINCIPAL: CopyMessage via API (preserva 100% da formatação)
    try {
      console.log("Copiando mensagem com formatação preservada...");
      await client.invoke(new Api.messages.ForwardMessages({
        fromPeer: sourceChannelId,
        id: [message.id],
        toPeer: destinationChannelId,
        dropAuthor: false,
        dropMediaCaptions: false,
        silent: false,
        scheduleDate: undefined
      }));
      console.log("✅ Mídia copiada com sucesso! (Emojis, links e formatação preservados)");
    } catch (copyError) {
      console.log("❌ CopyMessage falhou, tentando sendMessage como fallback...");
      
      // FALLBACK: sendMessage com entidades
      try {
        const messageParams = {
          file: media,
          message: caption || ""
        };

        // Adiciona entidades apenas se existirem
        if (entities && entities.length > 0) {
          messageParams.entities = entities;
          console.log(`Preservando formatação com ${entities.length} entidades`);
        } else {
          console.log("Nenhuma entidade encontrada - enviando texto simples");
        }

        await client.sendMessage(destinationChannelId, messageParams);
        console.log("✅ Mídia enviada com sendMessage (formatação parcial)!");
      } catch (sendError) {
        console.error("❌ Todos os métodos falharam:", sendError.message);
        throw sendError;
      }
    }
    
    // Salva o ID da mensagem para continuar de onde parou na próxima vez
    fs.writeFileSync(lastMessageIdFile, message.id.toString());

  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
}

main();