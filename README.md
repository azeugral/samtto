# Samtto · Tatupunk em Manaus

Prévia do site do Samtto ([@ssamtto](https://www.instagram.com/ssamtto/)). HTML, CSS e JS puros, sem build no servidor.
Publicado em https://azeugral.github.io/samtto/

## Estrutura

| Página | Conteúdo | Destaque do Instagram |
|---|---|---|
| `index.html` | Apresentação, ficha, amostra de tatuagens, como agendar, local, CTA | — |
| `portfolio.html` | Tatuagens com filtros + lightbox ("Quero algo assim" leva ao agendar) | TATUSS, CURADOS, PROJETOS |
| `papo.html` | Perguntas frequentes | PAPO/IDEIAS |
| `orcamento.html` | Formulário que monta a mensagem e abre o WhatsApp | AGENDAR / PARCERIAS (bio) |

Configuração do cliente (WhatsApp, upload da imagem de referência) fica no topo de `js/main.js`, no objeto `CONFIG`.
As páginas são geradas por `../_ref/build.py` (header e footer iguais em todas): editar o script e rodar `python _ref/build.py` na pasta do projeto.

## Identidade

- Paleta: tinta `#0a0808`, papel `#ece6da`, sangue `#c80000` (medido no destaque do perfil), sangue escuro `#7e0c02` (do logo).
- Fontes: **Rubik Dirt** (títulos, carimbo de xerox), **Sedgwick Ave Display** (rabiscos/tags), Unbounded 800 (subtítulos), IBM Plex Sans (texto), JetBrains Mono (rótulos e botões).
- Raio zero. Botão principal é uma fita vermelha com as pontas rasgadas.
- Fundo único: uma camada fixa com chamas tribais vermelhas que andam com a rolagem, arame farpado e grão de xerox.
- Logo oficial (`assets/brand/logo.webp`, original em `../_ref/brand/Logo.jpg`) e a face original no rodapé, no 404 e no favicon sem fundo (`assets/brand/face.png`, original em `../_ref/brand/Face.png`).
- Marca do hero: SAMTTO em papel com o vermelho deslocado por baixo (serigrafia fora de registro) e "tatupunk" pichado por cima. Entra como estêncil, o vermelho escorrega pro lugar e a tag aparece por último.
- Outras animações: títulos aparecem como cópia de xerox passando; trabalhos são cartazes colados com fita que "batem" na parede; arame que se desenha; troca de página com rasgo (View Transitions).
- Retirado em 08/10 a pedido: fitas em X, status da agenda no hero, página e seção de disponíveis, loja, carinha interativa.

## Imagem de referência no agendar

O WhatsApp não aceita anexo por link (`wa.me`), então a imagem sobe para o **Cloudinary** (preset unsigned, plano grátis) e o link entra no texto da mensagem, como no site do Maronez. Configurar `cloudinaryCloud` e `cloudinaryPreset` em `js/main.js`. Enquanto estiver vazio, a mensagem abre com "mando a imagem em seguida" e a pessoa anexa pelo clipe.

## Dados extraídos do Instagram (08/10/2026)

- Nome: 💢Samtto💢 · @ssamtto · 2.776 seguidores (não exibidos no site)
- Bio: Artista · 🇧🇷-🏴‍☠️ · 💢TATUPUNK · 🗣️COMISSÕES ABERTAS · MANAUS @manivatattoo · AGENDAR/PARCERIAS
- WhatsApp: `wa.me/message/QKAXWV63BVPDD1` (link de mensagem, não aceita texto pronto)
- Estúdio: Maniva (@manivatattoo), "Estúdio privado · Tatuagem autoral · Tatuagem comercial · Manaus - Amazonas"
- Destaques: PRINTS/QUADROS, DISPONÍVEIS, CURADOS, TATUSS, PAPO/IDEIAS, PROJETOS, 150$-200$ (conteúdo dos destaques exige login, não foi lido)
- Frases dele usadas no site: "Marque sua pele com tatupunk", "Reserve ou encomende sua ideia na estética punk", "Sai do padrão ae", "Punks not dead"
- Hashtags: #tatupunk #undergroundartist #punksnotdead #ignorantstyletattoo
- Agenda: "Agenda de outubro aberta, vagas 01-10/10" (post de 02/10)
- Camiseta: pré-venda R$ 100, tamanhos M e G, 6 unidades (post de 28/09)
- Evento: reel de 08/10 "10 de outubro às 16:00" (não entrou no site, falta saber o que é)
- Post político de 06/10 ficou de fora de propósito.

## CONFIRMAR antes de publicar de verdade

Buscar `todo` / `a preencher` nas páginas e `CONFIRMAR` no código.

1. ~~Logo em alta~~ recebido em 08/10.
2. **Fotos do zip** em `assets/img/` (hoje são as miniaturas do Instagram): Tatuss, Curados, Projetos, Disponíveis e loja.
3. **Número do WhatsApp** com DDI em `js/main.js` → `whatsappNumber`. Sem ele, o site copia a mensagem e abre o link da bio.
4. **Bio** em 2 ou 3 frases e uma definição de tatupunk nas palavras dele.
5. **Valores**: valor mínimo ou faixa; sinal e remarcação.
6. **Upload da imagem**: preset unsigned do Cloudinary (`cloudinaryCloud` / `cloudinaryPreset`).
7. **Disponíveis e loja**: voltam se ele quiser (o código ficou no histórico do git).
8. **Endereço e horário** do Maniva (ou só "endereço no chat", por ser estúdio privado). Com endereço entra o mapa.
9. **Guest spots** fora de Manaus e **cuidados** pós-tattoo.
10. **Domínio** (trocar `SITE` em `_ref/build.py`, canonical, sitemap e robots).

---
Site por [L R G Z](https://lrgz.com.br)
