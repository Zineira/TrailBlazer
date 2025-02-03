# 🚀 MapBot - TrailBlazer 

## 📌 Requisitos  

Antes de começar, certifica-te de que tens os seguintes requisitos instalados:  

- **Node.js** ([Baixar aqui](https://nodejs.org/))  
- **npm** (incluído com o Node.js)  

Para utilizar este projeto, é necessário ter as seguintes **API Keys**:  
- **OpenAI API Key** ([Obter aqui](https://platform.openai.com/settings/organization/api-keys))  
- **Google Maps API Key** ([Obter aqui](https://console.cloud.google.com/google/maps-apis/credentials))  

## 📥 Instalação  

1. **Clonar o repositório:**  
   ```sh
   git clone https://github.com/Zineira/chatbot.git
   cd chatbot-main
2. **instalar as dependências**
   ```sh
   npm install
   ```
3. **Set up das API keys:**

   copiar o .env.example para .env e adicionar as API keys ao .env

   ```sh
   cp .env.example .env
   ```
   
   no ficheiro .env deve ter isto
   ```
   OPENAI_API_KEY="sua-chave-aqui"
   GOOGLE_MAPS_API_KEY="sua-chave-aqui"
   ```

4. **Correr o TrailBlazer**
   ```sh
   npm start
   ```
