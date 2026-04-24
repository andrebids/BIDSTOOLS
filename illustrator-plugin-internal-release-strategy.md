# Estratégia de release: plugin interno para Illustrator

## Contexto

Este plugin é:

- ferramenta interna;
- proprietária;
- para cerca de `11 utilizadores`;
- sem objetivo de comercialização pública;
- sem necessidade de Adobe Exchange/Marketplace.

## Decisão principal

Para este cenário, a melhor estratégia é:

- `desenvolvimento` com pasta local + link simbólico/junction;
- `beta interno` com instalação por cópia controlada ou script;
- `release interna` com instalador próprio simples.

Não recomendo, para já:

- publicar em marketplace Adobe;
- investir cedo em fluxo comercial de `ZXP` para distribuição pública;
- complicar com infra de licensing.

## Modelo de distribuição recomendado

## Fase 1: Desenvolvimento

### Objetivo

Permitir iteração rápida sem reinstalar nem reiniciar Illustrator constantemente.

### Como funciona

- código fica no workspace de desenvolvimento;
- cria-se um `link` da pasta do plugin para a pasta de extensões CEP do utilizador;
- o Illustrator carrega a extensão a partir desse link;
- alterações de UI/lógica são testadas localmente.

### Ambiente

Um único developer ou poucos developers.

### Instalação

- manual;
- apenas máquinas de desenvolvimento.

## Fase 2: Beta interno

### Objetivo

Entregar a 2-4 utilizadores chave para validar fluxo real.

### Como funciona

Distribuir o plugin de forma simples:

- copiar pasta do plugin para a pasta de extensões CEP do utilizador;
- ou executar um script `.bat` / PowerShell que:
  - fecha Illustrator;
  - copia/atualiza ficheiros;
  - reabre Illustrator.

### Recomendação

Nesta fase, ainda não precisas de instalador formal.

O mais prático é:

- uma pasta `release`;
- um script `install-plugin.ps1`;
- um script `update-plugin.ps1`.

### Vantagens

- muito rápido de montar;
- fácil de corrigir;
- baixo custo.

### Desvantagens

- menos amigável;
- depende mais de apoio manual;
- maior risco de erro humano.

## Fase 3: Release interna estável

### Objetivo

Distribuição previsível para os `11 utilizadores`.

### Como funciona

Criar um instalador simples para Windows que:

- deteta a pasta de extensões CEP do utilizador;
- instala/atualiza a versão do plugin;
- opcionalmente cria backup da versão anterior;
- opcionalmente cria atalho para documentação interna.

### Formato recomendado

Um destes:

- `Inno Setup`
- `NSIS`
- script PowerShell assinado e empacotado

### Recomendação

Para o teu caso, eu escolheria:

- `Inno Setup`

porque:

- é simples;
- maduro;
- fácil de manter;
- bom para updates internos.

## Estrutura operacional recomendada

## 1. Repositório / fonte

Ter uma estrutura clara:

- `plugin/`
- `installer/`
- `docs/`
- `releases/`

Exemplo:

```text
BIDSTOOLS/
  plugin/
    CSXS/
    client/
    host/
  installer/
    setup.iss
    scripts/
  docs/
  releases/
```

## 2. Versionamento

Usar versões simples:

- `0.1.0` dev
- `0.2.0` beta
- `1.0.0` release interna

Guardar versão em:

- `manifest.xml`
- ficheiro `version.txt` opcional
- nome do package de release

## 3. Canal de distribuição

Como é interno e pequeno, usar:

- pasta de rede interna;
- SharePoint;
- OneDrive empresarial;
- ou repositório Git interno com pacote compilado.

### Recomendação prática

Uma pasta central:

```text
\\servidor\plugins\illustrator-measure-plugin\
```

ou equivalente cloud interno, contendo:

- `latest/`
- `archive/`
- `release-notes.txt`

## 4. Processo de update

### Simples

- utilizador corre novo instalador;
- instalador substitui a versão existente.

### Melhor

- instalador verifica versão atual;
- se for mais antiga, atualiza;
- se igual, não faz nada;
- se houver erro, faz rollback básico.

## Estratégia concreta para os 11 utilizadores

## Recomendação final

### Desenvolvimento

- `symlink/junction`
- debug mode ativo
- sem instalador

### Beta

- 2 a 4 utilizadores
- script de instalação simples
- updates manuais controlados

### Produção interna

- instalador `Inno Setup`
- pacote fechado por versão
- distribuição por pasta interna/OneDrive/SharePoint

## Processo sugerido

1. Desenvolver localmente.
2. Gerar pasta `release` limpa.
3. Testar em 1 máquina sem ambiente de dev.
4. Distribuir a 2-4 testers internos.
5. Corrigir.
6. Gerar instalador para os 11 utilizadores.
7. Publicar release notes curtas.

## Instalação alvo no utilizador

O instalador deve copiar o plugin para a pasta CEP do utilizador.

Em Windows, tipicamente a instalação por utilizador vai para uma destas localizações:

- `%AppData%\Adobe\CEP\extensions`
- ou pasta comum Adobe CEP, dependendo do método de instalação

Para o teu caso, o mais seguro é usar a pasta por utilizador.

## O que o instalador deve fazer

## Obrigatório

- verificar se o Illustrator está fechado;
- criar pasta do plugin;
- copiar ficheiros;
- remover ficheiros obsoletos da versão anterior;
- escrever versão instalada;
- terminar com instrução simples: abrir Illustrator.

## Recomendado

- backup da versão anterior;
- log de instalação;
- opção silenciosa para IT;
- desinstalador.

## O que não é necessário agora

- Adobe Exchange;
- licença online;
- login por utilizador;
- auto-update complexo;
- assinatura comercial/publicação pública;
- telemetria pesada.

## Riscos e mitigação

## Risco 1: diferenças de versão do Illustrator

Mitigação:

- definir logo versões suportadas;
- testar pelo menos nas máquinas mais representativas.

## Risco 2: utilizadores com plugin antigo

Mitigação:

- instalador com overwrite controlado;
- número de versão visível no painel ou about box.

## Risco 3: users editam a pasta instalada manualmente

Mitigação:

- não dar a pasta de desenvolvimento;
- distribuir apenas pacote de release.

## Risco 4: dependência de suporte manual

Mitigação:

- documentação curta;
- instalador único;
- changelog por versão.

## Política de release recomendada

## Tipos de versão

- `dev`: uso só do developer
- `beta`: testers internos
- `stable`: utilizadores gerais

## Cadência

Para equipa pequena:

- updates beta quando necessário;
- stable apenas quando houver melhoria real e testada.

## Convenção

- `0.x` enquanto o cálculo e UX ainda estão a mudar;
- `1.0.0` quando o fluxo base estiver estável.

## Checklist de release interna

- `manifest.xml` com versão atualizada
- testes de escala `1:1`
- testes de escala `38 mm = 1 m`
- teste de leitura `W/H/Perim/Area`
- teste de edição `X/Y/W/H`
- teste de criação de cota horizontal
- teste de criação de cota vertical
- teste de instalação em máquina limpa
- release notes

## Plano de ação recomendado

## Agora

1. Desenvolver em modo local com link.
2. Estruturar projeto para permitir build de release.
3. Preparar script simples de empacotamento.

## Quando o MVP estiver funcional

1. Criar pacote beta interno.
2. Testar com 2-4 utilizadores.
3. Recolher bugs reais.

## Depois

1. Criar instalador interno.
2. Distribuir aos 11 utilizadores.
3. Manter pasta central de versões.

## Decisão final

Para uma ferramenta proprietária, interna e com apenas `11 utilizadores`, a estratégia certa é:

- `não marketplace`
- `não distribuição pública`
- `não complexidade comercial`
- `sim a instalador interno simples`
- `sim a processo de beta controlado`

É a abordagem com melhor equilíbrio entre custo, controlo e manutenção.

