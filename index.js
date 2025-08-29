

const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const input = require('input');

// Substitua com suas credenciais e IDs dos canais
const apiId = 21117228; // Seu api_id
const apiHash = '1d7a0af6fbdafe916ac803e444bc2100'; // Seu api_hash
// Se você já tem a string da sessão, cole aqui. Se não, deixe ""
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || ""); 

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
  console.log(client.session.save());
  // Inicia o processo de repostagem a cada 10 minutos
  setInterval(async () => {
    await repostNextMedia(client);
  }, 10 * 60 * 1000); // 10 minutos em milissegundos
}

async function repostNextMedia(client) {
  try {
    let lastProcessedId = Infinity; // Começa de um número bem alto
    // Se o arquivo existe, ele lê o ID do último post.
    if (fs.existsSync(lastMessageIdFile)) {
      const fileContent = fs.readFileSync(lastMessageIdFile, 'utf8');
      if (fileContent) {
        lastProcessedId = parseInt(fileContent);
      }
    }

    // Pega a próxima mensagem do canal com um ID menor que o último processado
    const messages = await client.getMessages(sourceChannelId, {
      limit: 1, 
      maxId: lastProcessedId - 1 // Busca a mensagem imediatamente anterior
    });

    if (messages.length === 0) {
      console.log("Não há mais mídias para repostar.");
      return;
    }

    const message = messages[0];
    const media = message.media;
    const caption = message.message;

    if (!media) {
      console.log("A próxima mensagem não contém mídia. Pulando para a anterior...");
      // Se não tem mídia, salva o ID para não processar novamente e avança
      fs.writeFileSync(lastMessageIdFile, message.id.toString());
      return;
    }

    console.log(`Repostando mídia com ID ${message.id}...`);
    await client.sendMessage(destinationChannelId, {
      file: media,
      message: caption,
    });

    console.log(`Mídia repostada com sucesso!`);
    
    // Salva o ID da mensagem para continuar de onde parou na próxima vez
    fs.writeFileSync(lastMessageIdFile, message.id.toString());

  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
}

main();