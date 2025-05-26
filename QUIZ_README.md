# Sistema de Quiz - Organizei Backend

## Visão Geral

O sistema de quiz permite que usuários joguem perguntas e respostas baseadas no conteúdo dos PDFs dos seus cards. As perguntas são geradas automaticamente usando IA (OpenAI GPT-4o-mini) e os usuários ganham OrgPoints ao acertar as respostas.

## Funcionalidades

### 1. Iniciar Quiz
- **Endpoint**: `POST /quiz/start/:cardId`
- **Descrição**: Inicia uma nova sessão de quiz baseada no conteúdo do PDF do card escolhido
- **Autenticação**: Requerida
- **Parâmetros**:
  - `cardId`: ID do card que contém o PDF para gerar a pergunta

**Exemplo de Resposta**:
```json
{
  "status": "success",
  "data": {
    "sessionId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "question": {
      "question": "Qual é o conceito principal abordado no documento?",
      "options": [
        "Opção A",
        "Opção B", 
        "Opção C",
        "Opção D"
      ]
    },
    "cardTitle": "Título do Card"
  }
}
```

### 2. Responder Pergunta
- **Endpoint**: `POST /quiz/answer/:sessionId`
- **Descrição**: Envia a resposta para uma pergunta do quiz
- **Autenticação**: Requerida
- **Parâmetros**:
  - `sessionId`: ID da sessão de quiz
- **Body**:
  ```json
  {
    "answer": 2,
    "timeSpent": 30
  }
  ```
  - `answer`: Índice da resposta escolhida (0-3)
  - `timeSpent`: Tempo gasto em segundos (opcional)

**Exemplo de Resposta**:
```json
{
  "status": "success",
  "data": {
    "isCorrect": true,
    "correctAnswer": 2,
    "correctOption": "Opção C",
    "pointsEarned": 10,
    "totalOrgPoints": 25
  }
}
```

### 3. Estatísticas do Usuário
- **Endpoint**: `GET /quiz/stats`
- **Descrição**: Retorna estatísticas gerais do usuário nos quizzes
- **Autenticação**: Requerida

**Exemplo de Resposta**:
```json
{
  "status": "success",
  "data": {
    "totalQuizzes": 15,
    "correctAnswers": 12,
    "accuracy": 80,
    "totalPointsEarned": 120,
    "currentOrgPoints": 25
  }
}
```

### 4. Histórico de Quizzes
- **Endpoint**: `GET /quiz/history?page=1&limit=10`
- **Descrição**: Retorna o histórico de quizzes do usuário com paginação
- **Autenticação**: Requerida
- **Query Parameters**:
  - `page`: Página atual (padrão: 1)
  - `limit`: Itens por página (padrão: 10)

**Exemplo de Resposta**:
```json
{
  "status": "success",
  "data": {
    "quizzes": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "cardTitle": "Título do Card",
        "question": "Qual é o conceito principal?",
        "userAnswer": "Opção B",
        "correctAnswer": "Opção C",
        "isCorrect": false,
        "pointsEarned": 0,
        "timeSpent": 45,
        "completedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalDocs": 15,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Sistema de Pontuação

### OrgPoints
- **Resposta Correta**: +1 OrgPoint
- **Resposta Incorreta**: 0 OrgPoints

### Pontos da Sessão
- **Resposta Correta**: 10 pontos
- **Resposta Incorreta**: 0 pontos

## Regras de Negócio

1. **Acesso ao Card**: O usuário deve ser dono do card OU o card deve estar publicado
2. **PDF Obrigatório**: O card deve ter pelo menos um PDF para gerar perguntas
3. **Sessão Única**: Apenas uma sessão ativa por usuário/card por vez
4. **Resposta Única**: Cada pergunta pode ser respondida apenas uma vez
5. **Geração de Pergunta**: Baseada nos primeiros 3000 caracteres do primeiro PDF do card

## Modelos de Dados

### QuizSession
```typescript
interface IQuizSession {
  userId: ObjectId;           // ID do usuário
  cardId: ObjectId;           // ID do card
  question: IQuizQuestion;    // Pergunta gerada
  userAnswer?: number;        // Resposta do usuário (0-3)
  isCorrect?: boolean;        // Se a resposta está correta
  pointsEarned: number;       // Pontos ganhos na sessão
  timeSpent?: number;         // Tempo gasto em segundos
  status: "active" | "completed"; // Status da sessão
  createdAt: Date;
  completedAt?: Date;
}
```

### QuizQuestion
```typescript
interface IQuizQuestion {
  question: string;           // Texto da pergunta
  options: string[];          // 4 opções de resposta
  correctAnswer: number;      // Índice da resposta correta (0-3)
}
```

## Dependências Adicionais

- `pdf-parse`: Para extração de texto dos PDFs
- `openai`: Para geração de perguntas via IA

## Configuração

Certifique-se de que a variável de ambiente `OPENAI_API_KEY` está configurada no arquivo `.env`.

## Fluxo de Uso

1. **Usuário escolhe um card** que possui PDF
2. **Inicia o quiz** via `POST /quiz/start/:cardId`
3. **Sistema extrai texto** do primeiro PDF do card
4. **IA gera uma pergunta** com 4 opções de resposta
5. **Usuário responde** via `POST /quiz/answer/:sessionId`
6. **Sistema valida** a resposta e atualiza pontuação
7. **OrgPoints são creditados** se a resposta estiver correta

## Tratamento de Erros

- **Card não encontrado**: 404
- **Card sem PDF**: 400
- **Sessão já ativa**: 400
- **Resposta inválida**: 400
- **Sessão já finalizada**: 400
- **Acesso negado**: 403
- **Usuário não autenticado**: 401 