# Letis Wedding Mobile

Versão Android (React Native + Expo + TypeScript) do painel administrativo do Letis Wedding.
A lista pública continua no site: https://letis-wedding.netlify.app/l/{uid}

## Configuração

1. Copie `.env.example` para `.env` e preencha:
   - `EXPO_PUBLIC_FIREBASE_*`: mesmas chaves do `.env.local` do projeto web
   - `EXPO_PUBLIC_WEB_URL`: `https://letis-wedding.netlify.app`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Web client ID (OAuth tipo Web) do Firebase/Google Cloud
2. Firebase Console: adicione um app **Android** com o pacote `com.fernandomk6.letiswedding`,
   baixe o `google-services.json` e coloque na raiz do projeto.
3. Adicione o SHA-1 (e SHA-256) do keystore do build em Configurações do projeto > app Android
   (`eas credentials` mostra os valores). Sem isso o login com Google falha com `DEVELOPER_ERROR`.
4. Baixe o `google-services.json` novamente depois de adicionar o SHA-1.

## Build de desenvolvimento

```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android
npx expo start --dev-client
```

As variáveis do `.env` também precisam existir no EAS (`eas env:create`), porque o arquivo
`.env` não vai no build na nuvem.
