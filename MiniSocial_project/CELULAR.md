# 🚀 MiniSocial - Guia de Execução no Celular

## ⚠️ IMPORTANTE: Configuração de Rede Local

O projeto foi configurado para funcionar em **telefone físico** conectado à mesma rede Wi-Fi.

### IP da Máquina Configurado

```
172.16.1.154:3001
```

**Se você estiver em uma rede diferente, altere o IP em:**

```
src/config/apiConfig.js
```

## 🔧 Passos para Executar

### 1️⃣ Terminal 1 - Iniciar JSON Server

```bash
cd c:\Users\55435579813\Desktop\MiniSocial\MiniSocial_project
npm run server
```

Saída esperada:
```
JSON Server started on PORT :3001
Watching db.json...
```

### 2️⃣ Terminal 2 - Iniciar Expo

```bash
cd c:\Users\55435579813\Desktop\MiniSocial\MiniSocial_project
npm start
```

Saída esperada:
```
Starting Metro Bundler
Waiting on http://localhost:8082
```

### 3️⃣ No Telefone

- Abra o aplicativo **Expo Go**
- Escaneie o QR code exibido no terminal
- Aguarde o bundle fazer download
- O aplicativo abrirá automaticamente

## 📱 Testando o Fluxo

1. **Selecione as preferências**
2. **Toque em "Próximo"**
3. **Perfil deve aparecer**
4. **Scroll para ver publicações**
5. **Clique em "seguidores" ou "seguindo"** para ver a lista
6. **Teste seguir/deixar de seguir**

## 🐛 Se Ocorrer Erro "Bad URL"

**Verifique:**

1. JSON Server está rodando na porta 3001?
   ```bash
   netstat -ano | findstr :3001
   ```

2. O IP na `apiConfig.js` é o correto?
   ```bash
   ipconfig
   ```

3. O telefone está na mesma rede Wi-Fi?

4. A URL está no formato correto?
   ```
   http://172.16.1.154:3001/users
   ✅ Correto
   
   172.16.1.154:3001/users
   ❌ Errado (falta http://)
   ```

## 🌐 Testando a API Manualmente

No terminal, execute:

```bash
curl http://172.16.1.154:3001/users/1
```

Resultado esperado:
```json
{
  "id": "1",
  "name": "Késsia Milena",
  "username": "kessia.milena",
  ...
}
```

## 📊 Estrutura de Dados

O banco de dados está em:

```
db.json
├── users (perfis)
├── posts (publicações)
└── followers/following/favoritePosts (relacionamentos)
```

## ✅ Checklist

- [ ] JSON Server rodando na porta 3001
- [ ] Expo iniciado
- [ ] Telefone conectado na mesma rede Wi-Fi
- [ ] QR code escaneado com sucesso
- [ ] App carregou sem erro "Bad URL"
- [ ] Preferências → Perfil navegação funciona
- [ ] Perfil exibe corretamente
- [ ] Publicações visíveis
- [ ] Seguidores/Seguindo funciona
- [ ] SafeArea respeitada (sem corte de conteúdo)

---

**Desenvolvido com Expo SDK 57 e React Native 0.86**
