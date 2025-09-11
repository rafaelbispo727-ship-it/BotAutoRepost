const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

async function run() {
  // Use as credenciais do seu código
  const apiId = 21117228;
  const apiHash = '1d7a0af6fbdafe916ac803e444bc2100';

  console.log('🔐 Gerando sessão do Telegram...');
  console.log('📱 Você receberá um código no Telegram');
  console.log('🔑 Se tiver 2FA ativado, precisará da senha também\n');

  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({
      phoneNumber: async () => await input.text('📱 Digite seu número de telefone (com código do país, ex: +5511999999999): '),
      password: async () => await input.text('🔑 Digite sua senha 2FA (se não tiver, pressione Enter): '),
      phoneCode: async () => await input.text('📨 Digite o código que você recebeu no Telegram: '),
      onError: (err) => console.log('❌ Erro:', err),
    });

    const sessionString = client.session.save();
    console.log('\n✅ Sessão gerada com sucesso!');
    console.log('\n📋 COPIE a linha abaixo e configure no Railway:');
    console.log('='.repeat(80));
    console.log(`TELEGRAM_SESSION=${sessionString}`);
    console.log('='.repeat(80));
    console.log('\n🚀 Agora você pode fazer deploy no Railway sem problemas!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao gerar sessão:', error);
    process.exit(1);
  }
}

run();



