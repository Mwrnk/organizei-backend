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

### Verificar Nickname
- **GET** `/users/check-nickname`
- **Descrição**: Verifica se um nickname está disponível
- **Query Params**:
  - `nickname`: Nickname a ser verificado

### Verificar Email
- **GET** `/users/check-email`
- **Descrição**: Verifica se um email está disponível
- **Query Params**:
  - `email`: Email a ser verificado

### Obter Usuário
- **GET** `/users/:id`
- **Descrição**: Retorna um usuário específico
- **Parâmetros**:
  - `id`: ID do usuário (MongoDB ObjectId)

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

### Upload de Imagem de Perfil
- **PATCH** `/users/:id/image`
- **Descrição**: Atualiza a imagem de perfil do usuário
- **Parâmetros**:
  - `id`: ID do usuário (MongoDB ObjectId)
- **Body**: FormData com o campo `image` contendo o arquivo da imagem

## Flashcards

### Listar Flashcards
- **GET** `/flashcards`
- **Descrição**: Retorna todos os flashcards do usuário

### Obter Flashcard
- **GET** `/flashcards/:id`
- **Descrição**: Retorna um flashcard específico
- **Parâmetros**:
  - `id`: ID do flashcard (MongoDB ObjectId)

### Obter Flashcards por Card
- **GET** `/flashcards/card/:cardId`
- **Descrição**: Retorna todos os flashcards de um card específico
- **Parâmetros**:
  - `cardId`: ID do card (MongoDB ObjectId)

### Iniciar Revisão
- **GET** `/flashcards/startreview/:cardId`
- **Descrição**: Inicia uma sessão de revisão para um card
- **Parâmetros**:
  - `cardId`: ID do card (MongoDB ObjectId)

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

### Deletar Flashcard
- **DELETE** `/flashcards/:id`
- **Descrição**: Remove um flashcard
- **Parâmetros**:
  - `id`: ID do flashcard (MongoDB ObjectId)

## Cards

### Listar Cards
- **GET** `/cards`
- **Descrição**: Retorna todos os cards do usuário

### Obter Card
- **GET** `/cards/:id`
- **Descrição**: Retorna um card específico
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)

### Buscar Card por Título
- **GET** `/cards/title/:title`
- **Descrição**: Busca um card pelo título
- **Parâmetros**:
  - `title`: Título do card

### Listar Cards por Lista
- **GET** `/lists/:listId/cards`
- **Descrição**: Retorna todos os cards de uma lista
- **Parâmetros**:
  - `listId`: ID da lista (MongoDB ObjectId)

### Listar Cards por Usuário
- **GET** `/cards/user/:userId`
- **Descrição**: Retorna todos os cards de um usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)

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

### Curtir Card
- **POST** `/cards/:id/like`
- **Descrição**: Adiciona uma curtida em um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)

### Descurtir Card
- **POST** `/cards/:id/unlike`
- **Descrição**: Remove uma curtida de um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)

### Upload de Arquivos
- **POST** `/cards/:id/files`
- **Descrição**: Faz upload de arquivos para um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
- **Body**: FormData com o campo `files` contendo os arquivos (máximo 5)

### Download de PDF
- **GET** `/cards/:id/pdf/:pdfIndex/download`
- **Descrição**: Faz download de um PDF específico do card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
  - `pdfIndex`: Índice do PDF

### Visualizar PDF
- **GET** `/cards/:id/pdf/:pdfIndex/view`
- **Descrição**: Visualiza um PDF específico do card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)
  - `pdfIndex`: Índice do PDF

### Listar PDFs
- **GET** `/cards/:id/pdfs`
- **Descrição**: Lista todos os PDFs de um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)

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

### Deletar Card
- **DELETE** `/cards/:id`
- **Descrição**: Remove um card
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)

## Listas

### Listar Listas
- **GET** `/lists`
- **Descrição**: Retorna todas as listas do usuário

### Obter Lista
- **GET** `/lists/:id`
- **Descrição**: Retorna uma lista específica
- **Parâmetros**:
  - `id`: ID da lista (MongoDB ObjectId)

### Listar Listas por Usuário
- **GET** `/lists/user/:userId`
- **Descrição**: Retorna todas as listas de um usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)

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

### Deletar Lista
- **DELETE** `/lists/:id`
- **Descrição**: Remove uma lista
- **Parâmetros**:
  - `id`: ID da lista (MongoDB ObjectId)

## Comentários

### Listar Comentários
- **GET** `/comments`
- **Descrição**: Retorna todos os comentários

### Listar Comentários por Card
- **GET** `/comments/:cardId`
- **Descrição**: Retorna todos os comentários de um card
- **Parâmetros**:
  - `cardId`: ID do card (MongoDB ObjectId)

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

### Deletar Comentário
- **DELETE** `/comments/:commentId`
- **Descrição**: Remove um comentário
- **Parâmetros**:
  - `commentId`: ID do comentário

## Tags

### Listar Tags
- **GET** `/tags`
- **Descrição**: Retorna todas as tags

### Obter Tag
- **GET** `/tags/:id`
- **Descrição**: Retorna uma tag específica
- **Parâmetros**:
  - `id`: ID da tag (MongoDB ObjectId)

### Buscar Tag por Nome
- **GET** `/tags/name/:name`
- **Descrição**: Busca uma tag pelo nome
- **Parâmetros**:
  - `name`: Nome da tag

### Criar Tag
- **POST** `/tags`
- **Descrição**: Cria uma nova tag
- **Body**:
```json
{
    "name": "Nome da tag"
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

### Deletar Tag
- **DELETE** `/tags/:id`
- **Descrição**: Remove uma tag
- **Parâmetros**:
  - `id`: ID da tag (MongoDB ObjectId)

## Planos

### Listar Planos
- **GET** `/plans`
- **Descrição**: Retorna todos os planos disponíveis (rota pública)

### Obter Plano Atual
- **GET** `/users/:userId/plan`
- **Descrição**: Retorna o plano atual do usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)

### Obter Histórico de Planos
- **GET** `/users/:userId/plan-history`
- **Descrição**: Retorna o histórico de planos do usuário
- **Parâmetros**:
  - `userId`: ID do usuário (MongoDB ObjectId)

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

### Obter Estatísticas
- **GET** `/quiz/stats`
- **Descrição**: Retorna estatísticas dos quizzes

### Obter Histórico
- **GET** `/quiz/history`
- **Descrição**: Retorna histórico de quizzes

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

### Listar Cards Publicados
- **GET** `/cards`
- **Descrição**: Retorna todos os cards publicados

### Baixar Card
- **POST** `/download/:id`
- **Descrição**: Baixa um card publicado
- **Parâmetros**:
  - `id`: ID do card (MongoDB ObjectId)

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
- **Resposta de Sucesso** (200):
```json
{
    "response": "Resposta da IA"
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