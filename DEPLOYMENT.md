# 🚀 Deployment Guide - Vai Rodar?

## Repositórios

### Desenvolvimento
- **URL**: https://github.com/eduardotai/jogaliso
- **Propósito**: Desenvolvimento e testes
- **Remote**: `development`

### Produção
- **URL**: https://github.com/eduardotai/vairodar
- **Propósito**: Código em produção (Vercel)
- **Remote**: `production`

## Workflow

### Desenvolvimento
```bash
# Após fazer mudanças
git add .
git commit -m "feat: descrição da mudança"

# Push para desenvolvimento
git push development master
```

### Produção
```bash
# Quando estiver pronto para produção
git push production master
```

## Vercel Configuration

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Importe o repositório **vairodar** (produção)
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_RAWG_API_KEY`

## Branches

- `master`: Código estável (produção)
- Use branches para features se necessário

## Importante

- ✅ **Sempre teste localmente** antes de push para produção
- ✅ **Use `npm run build`** para verificar se compila
- ✅ **Push para produção** apenas código testado e aprovado
- ✅ **Desenvolvimento** é para experimentação e visualização</content>
</xai:function_call">Create deployment documentation.