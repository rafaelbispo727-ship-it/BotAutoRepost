const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 21117228; 
const apiHash = "1d7a0af6fbdafe916ac803e444bc2100";

const stringSession = new StringSession(""); // vazio no início

(async () => {
  console.log("Iniciando login...");
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.start({
    phoneNumber: async () => await input.text("Digite seu número de telefone: "),
    password: async () => await input.text("Digite sua senha de 2FA (se tiver): "),
    phoneCode: async () => await input.text("Digite o código recebido no Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("Login feito com sucesso!");
  console.log("Sua StringSession é:\n", client.session.save());
})();


