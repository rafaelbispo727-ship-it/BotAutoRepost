# 🚀 Instruções para Deploy no Railway

## Passo 1: Gerar Sessão do Telegram Localmente

1. **Instale as dependências** (se ainda não fez):
   ```bash
   npm install
   ```

2. **Execute o gerador de sessão**:
   ```bash
   npm run generate:session
   ```

3. **Siga as instruções**:
   - Digite seu número de telefone (com código do país, ex: +5511999999999)
   - Digite o código que receber no Telegram
   - Se tiver 2FA ativado, digite sua senha
   - **COPIE** a StringSession que aparecer (será usada na variável `STRING_SESSION`)

## Passo 2: Configurar no Railway

1. **Acesse o Railway** e crie um novo projeto
2. **Conecte seu repositório** ou faça upload dos arquivos
3. **Configure as variáveis de ambiente**:
   - `API_ID`: 21117228
   - `API_HASH`: 1d7a0af6fbdafe916ac803e444bc2100
   - `STRING_SESSION`: [cole a StringSession que você copiou no passo 1]
   
   **Configuração dos 3 pares de canais (substitua pelos seus IDs reais):**
   - `SOURCE_CHANNEL_1`: [ID do seu canal de origem 1]
   - `DESTINATION_CHANNEL_1`: [ID do seu canal de destino 1]
   - `SOURCE_CHANNEL_2`: [ID do seu canal de origem 2]
   - `DESTINATION_CHANNEL_2`: [ID do seu canal de destino 2]
   - `SOURCE_CHANNEL_3`: [ID do seu canal de origem 3]
   - `DESTINATION_CHANNEL_3`: [ID do seu canal de destino 3]

## Passo 3: Deploy

1. **Start Command**: use `npm start` (executa `index.js`)
2. **Faça o deploy**
3. **Verifique os logs** para confirmar que está funcionando
4. **Pronto!** Sua aplicação vai rodar 24/7 no Railway

## ⚠️ Importante

- A sessão do Telegram é válida por tempo indeterminado
- Se precisar renovar, execute novamente o `npm run generate:session`
- Mantenha suas credenciais seguras e não compartilhe a `STRING_SESSION`
- O bot processa os 3 pares de canais em paralelo a cada 30 segundos
- Cada par tem seu próprio arquivo de controle (`last_message_id_pair_X.txt`)
- Se um par falhar, os outros continuam funcionando normalmente

## 🔧 Troubleshooting

Se der erro no Railway:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme se a `STRING_SESSION` está correta
3. Verifique os logs do Railway para mais detalhes
