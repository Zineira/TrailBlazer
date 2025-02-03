# 🚀 MapBot - TrailBlazer  

## 📌 Requisitos  

Antes de começar, certifica-te de que tens:  

- *Node.js* ([Baixar aqui](https://nodejs.org/))  
- *npm* (já incluído com o Node.js)  

Também precisarás das seguintes *API Keys*:  
- *OpenAI API Key* ([Obter aqui](https://platform.openai.com/settings/organization/api-keys))  
- *Google Maps API Key* ([Obter aqui](https://console.cloud.google.com/google/maps-apis/credentials))  

## 📥 Instalação  

1. *Clonar o repositório:*  
   ```sh
   git clone https://github.com/Zineira/chatbot.git
   cd chatbot-main
   ```

2. *Instalar as dependências:*  
   ```sh
   npm install
   ```
   

3. *Configurar as API Keys:*  
   Copia o arquivo .env.example para .env e adiciona as tuas API Keys:  
   ```sh
   cp .env.example .env
   ```

   No arquivo .env, deve ficar assim:  
   ```sh
   OPENAI_API_KEY="sua-chave-aqui"
   GOOGLE_MAPS_API_KEY="sua-chave-aqui"
   ```

4. *Iniciar o TrailBlazer:*  
   ```sh
   npm start
   ```

Agora estás pronto para usar o *MapBot - TrailBlazer*! 🚀
