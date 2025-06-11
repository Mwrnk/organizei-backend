# Organiz.ei
 
 ## 📚 Introdução
 
 Bem-vindo ao Organizei, somos um projeto desenvolvido para buscar ajudar estudantes a se organizarem de forma que seus estudos possam ser otimizados. Nossa API ainda está em construção, mas por aqui você já consegue visualizar algumas coisas como tela de login mobile e web.
 O projeto contará com as entidades Usuário, Quadro, Lista, Card, tipoCard, e plano.
 
 ### Tecnologias Utilizadas
 - **Backend:**
   - Node.js com **Express**
   - **bcrypt / bcryptjs** 
   - **dotenv** 
   - **jsonwebtoken** 
   - **knex** 
   - **mongoose** 
   - **uuid** 
   - **zod**
 
 - **Frontend Web:**
   - **React 19**
   - **Styled Components**
 
 - **Mobile (React Native com Expo):**
   - **Expo**
   - **React Navigation**
   - **Axios**
   - **AsyncStorage**
   - **Reanimated, Safe Area Context, NetInfo, etc.**
 
 ## ⚙️ Instalação
 
 ### Requisitos
 
 Para rodar a API localmente, você precisa dos seguintes pré-requisitos:
 
 - **Node.js**: versão 16.x ou superior
 - **npm** ou **yarn**: para gerenciar pacotes
 - **MongoDB**: local ou em nuvem (MongoDB Atlas)

## 📁 Estrutura do Projeto

```
organizei-backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── migrations/
└── tests/
```

## 🔧 Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/organizei-backend.git
cd organizei-backend
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Copie o conteúdo do `.env.example` (se existir)
- Preencha as variáveis necessárias:
  ```
  DATABASE_URL=sua_url_do_mongodb
  JWT_SECRET=seu_secret_jwt
  PORT=3000
  ```

4. Configure o banco de dados:
- Certifique-se de ter o MongoDB instalado e rodando
- Execute as migrações:
  ```bash
  npm run migrate
  # ou
  yarn migrate
  ```

## 🚀 Executando o Projeto

Para iniciar o servidor em modo desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

Para iniciar o servidor em produção:
```bash
npm start
# ou
yarn start
```

## 📝 Documentação da API

A documentação completa da API está disponível em `/api-docs` quando o servidor estiver rodando.

Principais endpoints:
- `POST /auth/login` - Autenticação de usuário
- `POST /auth/register` - Registro de novo usuário
- `GET /boards` - Listar quadros do usuário
- `POST /boards` - Criar novo quadro

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.