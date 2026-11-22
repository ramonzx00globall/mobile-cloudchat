# IPA pessoal para SideStore

Este fork inclui `.github/workflows/personal-unsigned-ipa.yml`. O workflow usa um runner macOS com Xcode, gera o projeto iOS com Expo, instala os pods, compila sem assinatura e empacota o `.app` como IPA. Não pede conta paga do Apple Developer Program para compilar. O SideStore assina o IPA com sua conta Apple ao instalar.

## Como gerar

1. Coloque o conteúdo deste projeto em um repositório GitHub seu. Mantenha o workflow em `.github/workflows/`.
2. No repositório, abra **Actions → IPA pessoal sem assinatura → Run workflow**.
3. Quando o job terminar, abra a execução e baixe o artefato **AtendimentoPessoal-IPA**.
4. Extraia o ZIP do artefato. Dentro dele estará `AtendimentoPessoal.ipa`, para importar no SideStore.

O nome e o identificador do app estão definidos no workflow (`Atendimento Pessoal` e `com.atendimento.pessoal`). O build aponta para `https://cloudchat.cloudhumans.com`.

## Escopo deste build

`EXPO_PUBLIC_DISABLE_PUSH=true` evita exigir o arquivo Firebase da instância oficial e desativa notificações push no app pessoal. O fluxo de atendimento por abertura direta do app continua disponível. Esse modo também remove as permissões nativas de push e de domínios associados. A parte de push pode ser reativada depois com uma configuração Firebase própria e credenciais Apple adequadas.

O workflow ainda precisa ser executado em macOS para validar a compilação nativa. A checagem de versão mínima do servidor continua em 4.1.0; o aviso do CloudChat pode aparecer até validarmos a compatibilidade na instalação real. O ajuste de templates também depende da resposta real da API CloudChat para ser confirmado.

Não coloque login, senha, token, arquivo `.env` nem dados de clientes no repositório.
