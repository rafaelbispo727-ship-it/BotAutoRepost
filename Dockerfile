# Usa a imagem oficial do Node.js
FROM node:20-alpine

# Define a pasta de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração do seu projeto
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da sua aplicação
COPY . .

# Inicia a aplicação
CMD ["node", "index.js"]