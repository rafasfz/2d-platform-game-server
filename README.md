## Rodando em desenvolvimento

Crie um `.env` na raiz do projeto, usando como base o `.env.example` e coloque uma private key para o JWT. Agora siga as instruções no terminal.

```bash
    # Instala as dependências do projeto
    yarn # ou npm install

    # Roda as migrations
    yarn prisma db push # ou npx prisma db push

    # Iniciliza o servidor 🙂
    yarn dev # ou npm run dev
```

