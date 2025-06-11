# Documentação da API Organizei

## Autenticação
Todos os endpoints (exceto login e registro) requerem autenticação via token JWT no header:
```
Authorization: Bearer <seu_token>
```

## Usuários

### Listar Usuários
- **GET** `/users`
- **Descrição**: Retorna todos os usuários
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "users": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "name": "Nome do Usuário",
            "email": "usuario@exemplo.com",
            "nickname": "usuario123"
        }
    ]
}
```

### Verificar Nickname
- **GET** `/users/check-nickname`
- **Descrição**: Verifica se um nickname está disponível
- **Query Params**:
  - `nickname`: Nickname a ser verificado
- **Status Codes**:
  - 200: Nickname disponível
  - 400: Nickname inválido
- **Resposta de Sucesso** (200):
```json
{
    "available": true
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Nickname inválido",
    "message": "O nickname deve conter apenas letras, números e underscore"
}
```

### Verificar Email
- **GET** `/users/check-email`
- **Descrição**: Verifica se um email está disponível
- **Query Params**:
  - `email`: Email a ser verificado
- **Status Codes**:
  - 200: Email disponível
  - 400: Email inválido
- **Resposta de Sucesso** (200):
```json
{
    "available": true
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Email inválido",
    "message": "Formato de email inválido"
}
```

### Obter Usuário
- **GET** `/users/:id`
- **Descrição**: Retorna um usuário específico
- **Parâmetros**:
  - `id`: ID do usuário (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Usuário não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "nickname": "usuario123"
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Usuário não encontrado",
    "message": "Não foi possível encontrar um usuário com o ID fornecido"
}
```

### Login
- **POST** `/login`
- **Descrição**: Autentica um usuário e retorna um token JWT
- **Body**:
```json
{
    "email": "usuario@exemplo.com",
    "password": "senha123"
}
```
- **Status Codes**:
  - 200: Login bem-sucedido
  - 400: Dados inválidos
  - 401: Credenciais inválidas
- **Resposta de Sucesso** (200):
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "60d21b4667d0d8992e610c85",
        "name": "Nome do Usuário",
        "email": "usuario@exemplo.com"
    }
}
```
- **Resposta de Erro** (401):
```json
{
    "error": "Credenciais inválidas",
    "message": "Email ou senha incorretos"
}
```

### Registro
- **POST** `/signup`
- **Descrição**: Cria uma nova conta de usuário
- **Body**:
```json
{
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "password": "senha123"
}
```
- **Status Codes**:
  - 201: Usuário criado com sucesso
  - 400: Dados inválidos
  - 409: Email já cadastrado
- **Resposta de Sucesso** (201):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "message": "Usuário criado com sucesso"
}
```
- **Resposta de Erro** (409):
```json
{
    "error": "Email já cadastrado",
    "message": "Este email já está sendo utilizado por outro usuário"
}
```

### Editar Usuário
- **PATCH** `/users/:id`
- **Descrição**: Atualiza informações do usuário
- **Parâmetros**:
  - `id`: ID do usuário (MongoDB ObjectId)
- **Body**:
```json
{
    "name": "Novo Nome",
    "email": "novo@email.com"
}
```
- **Status Codes**:
  - 200: Usuário atualizado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Usuário não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "Novo Nome",
    "email": "novo@email.com",
    "message": "Usuário atualizado com sucesso"
}
```
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para editar este usuário"
}
```

### Upload de Imagem de Perfil
- **PATCH** `/users/:id/image`
- **Descrição**: Atualiza a imagem de perfil do usuário
- **Parâmetros**:
  - `id`: ID do usuário (MongoDB ObjectId)
- **Body**: FormData com o campo `image` contendo o arquivo da imagem
- **Status Codes**:
  - 200: Imagem atualizada com sucesso
  - 400: Arquivo inválido
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Usuário não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "message": "Imagem de perfil atualizada com sucesso",
    "imageUrl": "https://api.organizei.com/images/profile/123.jpg"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Arquivo inválido",
    "message": "O arquivo deve ser uma imagem válida (JPG, PNG ou GIF)"
}
```

## Flashcards

### Listar Flashcards
- **GET** `/flashcards`
- **Descrição**: Retorna todos os flashcards do usuário
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "flashcards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "front": "Pergunta do flashcard",
            "back": "Resposta do flashcard",
            "tags": ["tag1", "tag2"],
            "lastReview": "2024-03-20T10:00:00Z",
            "nextReview": "2024-03-21T10:00:00Z"
        }
    ]
}
```

### Obter Flashcard
- **GET** `/flashcards/:id`
- **Descrição**: Retorna um flashcard específico
- **Parâmetros**:
  - `id`: ID do flashcard (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Flashcard não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "front": "Pergunta do flashcard",
    "back": "Resposta do flashcard",
    "tags": ["tag1", "tag2"],
    "lastReview": "2024-03-20T10:00:00Z",
    "nextReview": "2024-03-21T10:00:00Z"
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Flashcard não encontrado",
    "message": "Não foi possível encontrar um flashcard com o ID fornecido"
}
```

### Obter Flashcards por Card
- **GET** `/flashcards/card/:cardId`
- **Descrição**: Retorna todos os flashcards de um card específico
- **Parâmetros**:
  - `cardId`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "flashcards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "front": "Pergunta do flashcard",
            "back": "Resposta do flashcard",
            "tags": ["tag1", "tag2"]
        }
    ]
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Card não encontrado",
    "message": "Não foi possível encontrar um card com o ID fornecido"
}
```

### Iniciar Revisão
- **GET** `/flashcards/startreview/:cardId`
- **Descrição**: Inicia uma sessão de revisão para um card
- **Parâmetros**:
  - `cardId`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "sessionId": "60d21b4667d0d8992e610c85",
    "flashcards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "front": "Pergunta do flashcard",
            "tags": ["tag1", "tag2"]
        }
    ]
}
```

### Criar Flashcard
- **POST** `/flashcards`
- **Descrição**: Cria um novo flashcard
- **Body**:
```json
{
    "front": "Pergunta do flashcard",
    "back": "Resposta do flashcard",
    "tags": ["tag1", "tag2"]
}
```
- **Status Codes**:
  - 201: Flashcard criado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
- **Resposta de Sucesso** (201):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "front": "Pergunta do flashcard",
    "back": "Resposta do flashcard",
    "tags": ["tag1", "tag2"],
    "message": "Flashcard criado com sucesso"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Dados inválidos",
    "message": "Os campos 'front' e 'back' são obrigatórios"
}
```

### Criar Flashcard com IA
- **POST** `/flashcards/withAI`
- **Descrição**: Cria um novo flashcard usando IA
- **Body**:
```json
{
    "content": "Conteúdo para gerar flashcards",
    "amount": 5
}
```
- **Status Codes**:
  - 201: Flashcards criados com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 429: Limite de requisições excedido
- **Resposta de Sucesso** (201):
```json
{
    "flashcards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "front": "Pergunta gerada pela IA",
            "back": "Resposta gerada pela IA",
            "tags": ["ia", "gerado"]
        }
    ],
    "message": "Flashcards criados com sucesso"
}
```
- **Resposta de Erro** (429):
```json
{
    "error": "Limite excedido",
    "message": "Você atingiu o limite de requisições para geração de flashcards"
}
```

### Editar Flashcard
- **PATCH** `/flashcards/:id`
- **Descrição**: Atualiza um flashcard existente
- **Parâmetros**:
  - `id`: ID do flashcard (MongoDB ObjectId)
- **Body**:
```json
{
    "front": "Nova pergunta",
    "back": "Nova resposta",
    "tags": ["nova_tag"]
}
```
- **Status Codes**:
  - 200: Flashcard atualizado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Flashcard não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "front": "Nova pergunta",
    "back": "Nova resposta",
    "tags": ["nova_tag"],
    "message": "Flashcard atualizado com sucesso"
}
```

### Fazer Revisão de Flashcard
- **PATCH** `/flashcards/doreview/:id`
- **Descrição**: Registra uma revisão de um flashcard
- **Parâmetros**:
  - `id`: ID do flashcard (MongoDB ObjectId)
- **Body**:
```json
{
    "rating": 1 // 1 para difícil, 2 para médio, 3 para fácil
}
```
- **Status Codes**:
  - 200: Revisão registrada com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 404: Flashcard não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "message": "Revisão registrada com sucesso",
    "nextReview": "2024-03-21T10:00:00Z"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Dados inválidos",
    "message": "O rating deve ser 1, 2 ou 3"
}
```

### Deletar Flashcard
- **DELETE** `/flashcards/:id`
- **Descrição**: Remove um flashcard
- **Parâmetros**:
  - `id`: ID do flashcard (MongoDB ObjectId)
- **Status Codes**:
  - 204: Flashcard removido com sucesso
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Flashcard não encontrado
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para excluir este flashcard"
}
```

## Cards

### Listar Cards
- **GET** `/cards`
- **Descrição**: Retorna todos os cards do usuário
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "cards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "title": "Título do card",
            "content": "Conteúdo do card",
            "listId": "60d21b4667d0d8992e610c86",
            "tags": ["tag1", "tag2"],
            "likes": 5,
            "createdAt": "2024-03-20T10:00:00Z",
            "updatedAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

### Obter Card
- **GET** `/cards/:id`
- **Descrição**: Retorna um card específico
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "title": "Título do card",
    "content": "Conteúdo do card",
    "listId": "60d21b4667d0d8992e610c86",
    "tags": ["tag1", "tag2"],
    "likes": 5,
    "files": [
        {
            "name": "arquivo.pdf",
            "url": "https://api.organizei.com/files/123.pdf",
            "type": "application/pdf"
        }
    ],
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Card não encontrado",
    "message": "Não foi possível encontrar um card com o ID fornecido"
}
```

### Buscar Card por Título
- **GET** `/cards/title/:title`
- **Descrição**: Busca um card pelo título
- **Parâmetros**:
  - `title`: Título do card
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "cards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "title": "Título do card",
            "content": "Conteúdo do card",
            "listId": "60d21b4667d0d8992e610c86",
            "tags": ["tag1", "tag2"]
        }
    ]
}
```

### Listar Cards por Lista
- **GET** `/lists/:listId/cards`
- **Descrição**: Retorna todos os cards de uma lista
- **Parâmetros**:
  - `listId`: ID da lista (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Lista não encontrada
- **Resposta de Sucesso** (200):
```json
{
    "cards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "title": "Título do card",
            "content": "Conteúdo do card",
            "tags": ["tag1", "tag2"]
        }
    ]
}
```

### Listar Cards por Usuário
- **GET** `/cards/user/:userId`
- **Descrição**: Retorna todos os cards de um usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Usuário não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "cards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "title": "Título do card",
            "content": "Conteúdo do card",
            "listId": "60d21b4667d0d8992e610c86",
            "tags": ["tag1", "tag2"]
        }
    ]
}
```

### Criar Card
- **POST** `/cards`
- **Descrição**: Cria um novo card
- **Body**:
```json
{
    "title": "Título do card",
    "content": "Conteúdo do card",
    "listId": "id_da_lista",
    "tags": ["tag1", "tag2"]
}
```
- **Status Codes**:
  - 201: Card criado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 404: Lista não encontrada
- **Resposta de Sucesso** (201):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "title": "Título do card",
    "content": "Conteúdo do card",
    "listId": "60d21b4667d0d8992e610c86",
    "tags": ["tag1", "tag2"],
    "message": "Card criado com sucesso"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Dados inválidos",
    "message": "O campo 'title' é obrigatório"
}
```

### Curtir Card
- **POST** `/cards/:id/like`
- **Descrição**: Adiciona uma curtida em um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 200: Curtida adicionada com sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "message": "Card curtido com sucesso",
    "likes": 6
}
```

### Descurtir Card
- **POST** `/cards/:id/unlike`
- **Descrição**: Remove uma curtida de um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 200: Curtida removida com sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "message": "Curtida removida com sucesso",
    "likes": 5
}
```

### Upload de Arquivos
- **POST** `/cards/:id/files`
- **Descrição**: Faz upload de arquivos para um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Body**: FormData com o campo `files` contendo os arquivos (máximo 5)
- **Status Codes**:
  - 200: Arquivos enviados com sucesso
  - 400: Arquivos inválidos
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "message": "Arquivos enviados com sucesso",
    "files": [
        {
            "name": "arquivo.pdf",
            "url": "https://api.organizei.com/files/123.pdf",
            "type": "application/pdf"
        }
    ]
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Arquivos inválidos",
    "message": "O número máximo de arquivos permitido é 5"
}
```

### Download de PDF
- **GET** `/cards/:id/pdf/:pdfIndex/download`
- **Descrição**: Faz download de um PDF específico do card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
  - `pdfIndex`: Índice do PDF
- **Status Codes**:
  - 200: Download iniciado
  - 401: Não autenticado
  - 404: PDF não encontrado
- **Resposta**: Arquivo PDF para download

### Visualizar PDF
- **GET** `/cards/:id/pdf/:pdfIndex/view`
- **Descrição**: Visualiza um PDF específico do card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
  - `pdfIndex`: Índice do PDF
- **Status Codes**:
  - 200: PDF carregado
  - 401: Não autenticado
  - 404: PDF não encontrado
- **Resposta**: Visualização do PDF no navegador

### Listar PDFs
- **GET** `/cards/:id/pdfs`
- **Descrição**: Lista todos os PDFs de um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "pdfs": [
        {
            "name": "documento.pdf",
            "url": "https://api.organizei.com/files/123.pdf",
            "size": "1.5MB",
            "createdAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

### Editar Card
- **PATCH** `/cards/:id`
- **Descrição**: Atualiza um card existente
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Body**:
```json
{
    "title": "Novo título",
    "content": "Novo conteúdo",
    "tags": ["nova_tag"]
}
```
- **Status Codes**:
  - 200: Card atualizado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "title": "Novo título",
    "content": "Novo conteúdo",
    "tags": ["nova_tag"],
    "message": "Card atualizado com sucesso"
}
```

### Deletar Card
- **DELETE** `/cards/:id`
- **Descrição**: Remove um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 204: Card removido com sucesso
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Card não encontrado
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para excluir este card"
}
```

## Listas

### Listar Listas
- **GET** `/lists`
- **Descrição**: Retorna todas as listas do usuário
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "lists": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "title": "Título da lista",
            "description": "Descrição da lista",
            "createdAt": "2024-03-20T10:00:00Z",
            "updatedAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

### Obter Lista
- **GET** `/lists/:id`
- **Descrição**: Retorna uma lista específica
- **Parâmetros**:
  - `id`: ID da lista (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Lista não encontrada
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "title": "Título da lista",
    "description": "Descrição da lista",
    "cards": [
        {
            "id": "60d21b4667d0d8992e610c86",
            "title": "Título do card",
            "content": "Conteúdo do card"
        }
    ],
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Lista não encontrada",
    "message": "Não foi possível encontrar uma lista com o ID fornecido"
}
```

### Listar Listas por Usuário
- **GET** `/lists/user/:userId`
- **Descrição**: Retorna todas as listas de um usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Usuário não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "lists": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "title": "Título da lista",
            "description": "Descrição da lista",
            "createdAt": "2024-03-20T10:00:00Z",
            "updatedAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

### Criar Lista
- **POST** `/lists`
- **Descrição**: Cria uma nova lista
- **Body**:
```json
{
    "title": "Título da lista",
    "description": "Descrição da lista"
}
```
- **Status Codes**:
  - 201: Lista criada com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
- **Resposta de Sucesso** (201):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "title": "Título da lista",
    "description": "Descrição da lista",
    "message": "Lista criada com sucesso"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Dados inválidos",
    "message": "O campo 'title' é obrigatório"
}
```

### Editar Lista
- **PUT** `/lists/:id`
- **Descrição**: Atualiza uma lista existente
- **Parâmetros**:
  - `id`: ID da lista (MongoDB ObjectId)
- **Body**:
```json
{
    "title": "Novo título",
    "description": "Nova descrição"
}
```
- **Status Codes**:
  - 200: Lista atualizada com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Lista não encontrada
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "title": "Novo título",
    "description": "Nova descrição",
    "message": "Lista atualizada com sucesso"
}
```
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para editar esta lista"
}
```

### Deletar Lista
- **DELETE** `/lists/:id`
- **Descrição**: Remove uma lista
- **Parâmetros**:
  - `id`: ID da lista (MongoDB ObjectId)
- **Status Codes**:
  - 204: Lista removida com sucesso
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Lista não encontrada
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para excluir esta lista"
}
```

## Comentários

### Listar Comentários
- **GET** `/comments`
- **Descrição**: Retorna todos os comentários
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "comments": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "content": "Conteúdo do comentário",
            "cardId": "60d21b4667d0d8992e610c86",
            "userId": "60d21b4667d0d8992e610c87",
            "userName": "Nome do Usuário",
            "createdAt": "2024-03-20T10:00:00Z",
            "updatedAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

### Listar Comentários por Card
- **GET** `/comments/:cardId`
- **Descrição**: Retorna todos os comentários de um card
- **Parâmetros**:
  - `cardId`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "comments": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "content": "Conteúdo do comentário",
            "userId": "60d21b4667d0d8992e610c87",
            "userName": "Nome do Usuário",
            "createdAt": "2024-03-20T10:00:00Z",
            "updatedAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Card não encontrado",
    "message": "Não foi possível encontrar um card com o ID fornecido"
}
```

### Criar Comentário
- **POST** `/comments`
- **Descrição**: Adiciona um novo comentário
- **Body**:
```json
{
    "content": "Conteúdo do comentário",
    "cardId": "card_id"
}
```
- **Status Codes**:
  - 201: Comentário criado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (201):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "content": "Conteúdo do comentário",
    "cardId": "60d21b4667d0d8992e610c86",
    "userId": "60d21b4667d0d8992e610c87",
    "userName": "Nome do Usuário",
    "message": "Comentário criado com sucesso"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Dados inválidos",
    "message": "O campo 'content' é obrigatório"
}
```

### Atualizar Comentário
- **PUT** `/comments/:commentId`
- **Descrição**: Atualiza um comentário existente
- **Parâmetros**:
  - `commentId`: ID do comentário
- **Body**:
```json
{
    "content": "Novo conteúdo do comentário"
}
```
- **Status Codes**:
  - 200: Comentário atualizado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Comentário não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "content": "Novo conteúdo do comentário",
    "message": "Comentário atualizado com sucesso"
}
```
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para editar este comentário"
}
```

### Deletar Comentário
- **DELETE** `/comments/:commentId`
- **Descrição**: Remove um comentário
- **Parâmetros**:
  - `commentId`: ID do comentário
- **Status Codes**:
  - 204: Comentário removido com sucesso
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Comentário não encontrado
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para excluir este comentário"
}
```

## Tags

### Listar Tags
- **GET** `/tags`
- **Descrição**: Retorna todas as tags
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "tags": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "name": "tag1",
            "count": 5,
            "createdAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

### Obter Tag
- **GET** `/tags/:id`
- **Descrição**: Retorna uma tag específica
- **Parâmetros**:
  - `id`: ID da tag (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Tag não encontrada
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "tag1",
    "count": 5,
    "createdAt": "2024-03-20T10:00:00Z"
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Tag não encontrada",
    "message": "Não foi possível encontrar uma tag com o ID fornecido"
}
```

### Buscar Tag por Nome
- **GET** `/tags/name/:name`
- **Descrição**: Busca uma tag pelo nome
- **Parâmetros**:
  - `name`: Nome da tag
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Tag não encontrada
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "tag1",
    "count": 5,
    "createdAt": "2024-03-20T10:00:00Z"
}
```

### Criar Tag
- **POST** `/tags`
- **Descrição**: Cria uma nova tag
- **Body**:
```json
{
    "name": "Nome da tag"
}
```
- **Status Codes**:
  - 201: Tag criada com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 409: Tag já existe
- **Resposta de Sucesso** (201):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "Nome da tag",
    "message": "Tag criada com sucesso"
}
```
- **Resposta de Erro** (409):
```json
{
    "error": "Tag já existe",
    "message": "Já existe uma tag com este nome"
}
```

### Editar Tag
- **PUT** `/tags/:id`
- **Descrição**: Atualiza uma tag existente
- **Parâmetros**:
  - `id`: ID da tag (MongoDB ObjectId)
- **Body**:
```json
{
    "name": "Novo nome da tag"
}
```
- **Status Codes**:
  - 200: Tag atualizada com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Tag não encontrada
  - 409: Tag já existe
- **Resposta de Sucesso** (200):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "Novo nome da tag",
    "message": "Tag atualizada com sucesso"
}
```
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para editar esta tag"
}
```

### Deletar Tag
- **DELETE** `/tags/:id`
- **Descrição**: Remove uma tag
- **Parâmetros**:
  - `id`: ID da tag (MongoDB ObjectId)
- **Status Codes**:
  - 204: Tag removida com sucesso
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Tag não encontrada
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para excluir esta tag"
}
```

## Planos

### Listar Planos
- **GET** `/plans`
- **Descrição**: Retorna todos os planos disponíveis (rota pública)
- **Status Codes**:
  - 200: Sucesso
- **Resposta de Sucesso** (200):
```json
{
    "plans": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "title": "Plano Básico",
            "description": "Acesso a recursos básicos",
            "price": 9.90,
            "features": [
                "Até 100 cards",
                "Até 10 listas",
                "Suporte por email"
            ],
            "createdAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

### Obter Plano Atual
- **GET** `/users/:userId/plan`
- **Descrição**: Retorna o plano atual do usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Usuário não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "plan": {
        "id": "60d21b4667d0d8992e610c85",
        "title": "Plano Básico",
        "description": "Acesso a recursos básicos",
        "startDate": "2024-03-20T10:00:00Z",
        "endDate": "2024-04-20T10:00:00Z"
    }
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Usuário não encontrado",
    "message": "Não foi possível encontrar um usuário com o ID fornecido"
}
```

### Obter Histórico de Planos
- **GET** `/users/:userId/plan-history`
- **Descrição**: Retorna o histórico de planos do usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
  - 404: Usuário não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "history": [
        {
            "planId": "60d21b4667d0d8992e610c85",
            "title": "Plano Básico",
            "startDate": "2024-03-20T10:00:00Z",
            "endDate": "2024-04-20T10:00:00Z",
            "status": "active"
        }
    ]
}
```

### Criar Plano
- **POST** `/plans`
- **Descrição**: Cria um novo plano
- **Body**:
```json
{
    "title": "Título do plano",
    "description": "Descrição do plano",
    "startDate": "2024-03-20",
    "endDate": "2024-04-20"
}
```
- **Status Codes**:
  - 201: Plano criado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
- **Resposta de Sucesso** (201):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "title": "Título do plano",
    "description": "Descrição do plano",
    "startDate": "2024-03-20T10:00:00Z",
    "endDate": "2024-04-20T10:00:00Z",
    "message": "Plano criado com sucesso"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Dados inválidos",
    "message": "A data de início deve ser anterior à data de término"
}
```

### Atualizar Plano do Usuário
- **PUT** `/users/:userId/plan`
- **Descrição**: Atualiza o plano do usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)
- **Body**:
```json
{
    "planId": "id_do_plano"
}
```
- **Status Codes**:
  - 200: Plano atualizado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Usuário ou plano não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "message": "Plano atualizado com sucesso",
    "plan": {
        "id": "60d21b4667d0d8992e610c85",
        "title": "Plano Básico",
        "startDate": "2024-03-20T10:00:00Z",
        "endDate": "2024-04-20T10:00:00Z"
    }
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Plano não encontrado",
    "message": "Não foi possível encontrar um plano com o ID fornecido"
}
```

## Quiz

### Iniciar Quiz
- **POST** `/quiz/start/:cardId`
- **Descrição**: Inicia um quiz para um card
- **Parâmetros**:
  - `cardId`: ID do card (MongoDB ObjectId)
- **Body**:
```json
{
    "amount": 5 // Quantidade de perguntas
}
```
- **Status Codes**:
  - 201: Quiz iniciado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (201):
```json
{
    "sessionId": "60d21b4667d0d8992e610c85",
    "questions": [
        {
            "id": "60d21b4667d0d8992e610c86",
            "question": "Pergunta do quiz",
            "options": [
                "Opção 1",
                "Opção 2",
                "Opção 3",
                "Opção 4"
            ]
        }
    ],
    "message": "Quiz iniciado com sucesso"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Dados inválidos",
    "message": "A quantidade de perguntas deve estar entre 1 e 10"
}
```

### Responder Questão
- **POST** `/quiz/answer/:sessionId`
- **Descrição**: Responde uma questão do quiz
- **Parâmetros**:
  - `sessionId`: ID da sessão do quiz
- **Body**:
```json
{
    "answer": "Resposta da questão"
}
```
- **Status Codes**:
  - 200: Resposta registrada com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 404: Sessão não encontrada
- **Resposta de Sucesso** (200):
```json
{
    "correct": true,
    "score": 1,
    "totalQuestions": 5,
    "currentQuestion": 2,
    "message": "Resposta correta!"
}
```
- **Resposta de Erro** (400):
```json
{
    "error": "Dados inválidos",
    "message": "A resposta é obrigatória"
}
```

### Obter Estatísticas
- **GET** `/quiz/stats`
- **Descrição**: Retorna estatísticas dos quizzes
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "totalQuizzes": 10,
    "averageScore": 7.5,
    "bestScore": 9.0,
    "totalQuestions": 50,
    "correctAnswers": 38,
    "accuracy": 76
}
```

### Obter Histórico
- **GET** `/quiz/history`
- **Descrição**: Retorna histórico de quizzes
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "history": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "cardId": "60d21b4667d0d8992e610c86",
            "cardTitle": "Título do Card",
            "score": 8,
            "totalQuestions": 10,
            "completedAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

## Comunidade

### Publicar Card
- **POST** `/publish/:id`
- **Descrição**: Publica um card na comunidade
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Body**:
```json
{
    "description": "Descrição da publicação"
}
```
- **Status Codes**:
  - 201: Card publicado com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Card não encontrado
- **Resposta de Sucesso** (201):
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "cardId": "60d21b4667d0d8992e610c86",
    "description": "Descrição da publicação",
    "publishedAt": "2024-03-20T10:00:00Z",
    "message": "Card publicado com sucesso"
}
```
- **Resposta de Erro** (403):
```json
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para publicar este card"
}
```

### Listar Cards Publicados
- **GET** `/cards`
- **Descrição**: Retorna todos os cards publicados
- **Status Codes**:
  - 200: Sucesso
  - 401: Não autenticado
- **Resposta de Sucesso** (200):
```json
{
    "cards": [
        {
            "id": "60d21b4667d0d8992e610c85",
            "title": "Título do card",
            "content": "Conteúdo do card",
            "description": "Descrição da publicação",
            "author": {
                "id": "60d21b4667d0d8992e610c87",
                "name": "Nome do Autor"
            },
            "likes": 5,
            "downloads": 10,
            "publishedAt": "2024-03-20T10:00:00Z"
        }
    ]
}
```

### Baixar Card
- **POST** `/download/:id`
- **Descrição**: Baixa um card publicado
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Status Codes**:
  - 200: Card baixado com sucesso
  - 401: Não autenticado
  - 404: Card não encontrado
- **Resposta de Sucesso** (200):
```json
{
    "message": "Card baixado com sucesso",
    "card": {
        "id": "60d21b4667d0d8992e610c85",
        "title": "Título do card",
        "content": "Conteúdo do card",
        "files": [
            {
                "name": "arquivo.pdf",
                "url": "https://api.organizei.com/files/123.pdf"
            }
        ]
    }
}
```
- **Resposta de Erro** (404):
```json
{
    "error": "Card não encontrado",
    "message": "Não foi possível encontrar um card com o ID fornecido"
}
```

## Chat com IA

### Iniciar Conversa
- **POST** `/chat`
- **Descrição**: Inicia uma conversa com a IA
- **Body**:
```json
{
    "message": "Sua mensagem para a IA"
}
```
- **Status Codes**:
  - 200: Resposta recebida com sucesso
  - 400: Dados inválidos
  - 401: Não autenticado
  - 429: Limite de requisições excedido
- **Resposta de Sucesso** (200):
```json
{
    "response": "Resposta da IA",
    "conversationId": "60d21b4667d0d8992e610c85",
    "tokensUsed": 150
}
```
- **Resposta de Erro** (429):
```json
{
    "error": "Limite excedido",
    "message": "Você atingiu o limite de requisições para o chat com IA"
}
```

## Códigos de Erro Comuns

- **400**: Requisição inválida (dados incorretos ou faltando)
- **401**: Não autorizado (token inválido ou ausente)
- **403**: Acesso proibido (sem permissão)
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## Exemplos de Uso Incorreto

1. **Autenticação Faltando**:
```http
GET /flashcards/123
// Erro 401: Token não fornecido
```

2. **ID Inválido**:
```http
GET /flashcards/123
// Erro 400: ID inválido (deve ser um MongoDB ObjectId válido)
```

3. **Dados Faltando**:
```http
POST /flashcards
{
    "front": "Pergunta"
    // Erro 400: Campo 'back' é obrigatório
}
```

4. **Acesso a Recurso de Outro Usuário**:
```http
DELETE /flashcards/123
// Erro 403: Você não tem permissão para acessar este recurso
```

## Códigos de Status HTTP

### Códigos de Sucesso
- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **204 No Content**: Requisição bem-sucedida sem conteúdo de resposta

### Códigos de Erro
- **400 Bad Request**: Requisição inválida (dados incorretos ou faltando)
- **401 Unauthorized**: Não autenticado (token inválido ou ausente)
- **403 Forbidden**: Acesso proibido (sem permissão)
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito com o estado atual do recurso
- **429 Too Many Requests**: Limite de requisições excedido
- **500 Internal Server Error**: Erro interno do servidor

## Exemplos de Uso

### Exemplo de Requisição Bem-sucedida
```http
GET /users/60d21b4667d0d8992e610c85
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Resposta (200 OK)
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com"
}
```

### Exemplo de Requisição com Erro
```http
GET /users/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Resposta (404 Not Found)
{
    "error": "Usuário não encontrado",
    "message": "Não foi possível encontrar um usuário com o ID fornecido"
}
```

### Exemplo de Requisição sem Autenticação
```http
GET /users/60d21b4667d0d8992e610c85

// Resposta (401 Unauthorized)
{
    "error": "Não autenticado",
    "message": "Token de autenticação não fornecido"
}
```

### Exemplo de Requisição sem Permissão
```http
DELETE /users/60d21b4667d0d8992e610c85
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Resposta (403 Forbidden)
{
    "error": "Não autorizado",
    "message": "Você não tem permissão para excluir este usuário"
}
```