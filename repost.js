const { Api, TelegramClient, events } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

// Substitua com suas credenciais e IDs dos canais
const apiId = 21117228; // Seu api_id
const apiHash = '1d7a0af6fbdafe916ac803e444bc2100'; // Seu api_hash
// Se você já tem a string da sessão, cole aqui. Se não, deixe ""
const stringSession = new StringSession(""); 

const sourceChannelId = -1002631368556; // ID do canal de origem
const destinationChannelId = -1002258297029; // ID do canal de destino

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

    console.log("Conectado! O bot está ouvindo por novas mídias.");

    client.addEventHandler(async (event) => {
        const message = event.message;

        if (message.peerId.channelId.toString() === sourceChannelId.toString().substring(4) && message.media) {
            console.log(`Nova mídia detectada com ID ${message.id}.`);

            // Encaminha a mensagem inteira, preservando todos os emojis e formatação
            await client.forwardMessages(destinationChannelId, [message.id], { fromPeer: sourceChannelId });

            console.log("Mídia encaminhada com sucesso!");
        }
    }, new events.NewMessage({}));
}

main();