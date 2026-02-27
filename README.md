# Vai rodar?

Plataforma de benchmarks de jogos PC onde a comunidade compartilha configurações reais testadas em hardware brasileiro.

## Sobre o Projeto

**Vai rodar?** é uma plataforma colaborativa onde gamers brasileiros compartilham e descobrem presets otimizados para seus hardwares. Encontre configurações reais que funcionam no seu setup!

### Funcionalidades
- 🔍 **Busca Inteligente**: Encontre jogos PC com busca em tempo real
- 📊 **Reports Detalhados**: FPS médio, 1% low, configurações específicas
- 👥 **Comunidade**: Veja o que funciona para outros usuários
- 🎯 **Hardware Brasileiro**: Focado em configurações reais do mercado nacional
- 🔥 **Jogos Populares**: Indicador de jogos com mais submits recentes

## Tecnologias
- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: RAWG (dados de jogos), Supabase
- **Deploy**: Vercel

## Instalação e Execução

1. **Clone o repositório**
   ```bash
   git clone https://github.com/eduardotai/jogaliso.git
   cd jogaliso
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env.local` com:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_RAWG_API_KEY=your_rawg_api_key
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse** [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto
```
├── app/                    # Next.js App Router
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard do usuário
│   ├── perfil/            # Perfil do usuário
│   ├── reports/           # Lista de reports
│   ├── submit/            # Submissão de reports
│   └── ...
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
└── ...
```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## Licença

Este projeto está sob a licença MIT.
