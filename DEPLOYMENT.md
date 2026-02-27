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

## Supabase Configuration

### Criar Tabela Profiles
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **SQL Editor** no seu projeto
3. Execute este comando para criar a tabela profiles:

```sql
-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_supporter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

**Se a tabela já existir mas não tiver a coluna bio, execute:**

```sql
-- Adicionar coluna bio se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
```

### Criar Tabela Reports

Execute estes comandos para criar a tabela reports:

```sql
-- Criar tabela reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  game TEXT NOT NULL,
  cpu TEXT NOT NULL,
  gpu TEXT NOT NULL,
  ram_gb INTEGER NOT NULL,
  resolution TEXT NOT NULL,
  preset TEXT NOT NULL,
  tweaks TEXT,
  fps_avg INTEGER NOT NULL,
  fps_1low INTEGER NOT NULL,
  stability_note TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  likes INTEGER DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reports
CREATE POLICY "Anyone can view reports" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reports" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);
```

### Criar Buckets de Storage
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **Storage** no seu projeto

#### Bucket para Avatares
3. Clique em **Create bucket**
4. Nome: `avatars`
5. Marque como **Public bucket**

#### Bucket para Imagens de Reports
6. Clique em **Create bucket**
7. Nome: `images`
8. Marque como **Public bucket**
9. Configure as políticas RLS (se necessário)

### Configurar Row Level Security (RLS)

**Execute estes comandos UM POR VEZ no SQL Editor:**

```sql
-- Primeiro: Deletar política existente (se existir)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
```

```sql
-- Política 1: Upload de avatar (simplificada)
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
```

```sql
-- Política 2: Leitura pública de avatares
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

**Se ainda não funcionar, tente esta versão alternativa:**

```sql
-- Deletar política existente
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

-- Política 1 alternativa: Upload de avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
);
```

### Políticas RLS para Bucket de Imagens

**Execute estes comandos para configurar o bucket de imagens:**

```sql
-- Políticas para bucket 'images'
CREATE POLICY "Users can upload report images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Report images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
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