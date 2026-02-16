# Quantum Work

Plataforma de empregos remotos globais.

## Estrutura

- `index.html` - Landing page com formulário de candidatos
- `welcome.html` - Página de boas-vindas
- `api/` - Backend Node.js + Express + SQLite
  - `server.js` - Servidor Express com endpoints REST
  - `database.js` - Configuração do SQLite
- `admin/` - Painel administrativo
  - `index.html` - Interface web para gerenciar candidatos
- `data/` - Banco de dados SQLite

## Instalação

```bash
npm install
```

## Executar

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/candidates` | Cadastrar candidato |
| GET | `/api/candidates` | Listar candidatos |
| GET | `/api/candidates/:id` | Ver candidato |
| PUT | `/api/candidates/:id` | Atualizar candidato |
| DELETE | `/api/candidates/:id` | Remover candidato |
| GET | `/api/candidates/export/csv` | Exportar CSV |
| GET | `/api/stats/skills` | Estatísticas por skill |

## Admin

Acesse: http://localhost:3000/admin/

Login: admin / admin123

## Deploy

O frontend está em Vercel. O backend precisa de servidor Node.js.

## Próximos Passos

- [ ] Sistema de emails para novos cadastros
- [ ] Scraper de vagas remotas
- [ ] Painel de empregadores
- [ ] Integração com Stripe para pagamentos
