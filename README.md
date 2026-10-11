# Samtto · Tatupunk em Manaus

Prévia do site do Samtto ([@ssamtto](https://www.instagram.com/ssamtto/)). HTML, CSS e JS puros, sem build no servidor.
Publicado em https://azeugral.github.io/samtto/

## Estrutura (v2, 11/10: formato do invocad0.com com a paleta do Samtto)

Home = "desktop" com 9 ícones em pixel art (desenhados em `../_ref/icons.py`, só a paleta dele). Toda página interna segue o mesmo molde: ícone + título sublinhado, sanfonas de informação e o conteúdo.

| Página | Conteúdo |
|---|---|
| `index.html` | Marca SAMTTO + desktop de ícones |
| `disponiveis.html` | Sanfonas (agenda, valores, encomendas, "quero na minha cidade") + folhas de flash com "Reservar desta folha" |
| `orcamento.html` | Agende sua tattoo: formulário numa janela, mensagem pronta no WhatsApp |
| `loja.html` | Produtos, "Adicionar" / "Comprar" / "Perguntar valor" |
| `produto.html?p=id` | Página única de produto: tamanho, quantidade, adicionar ao carrinho |
| `carrinho.html` | Carrinho (fica salvo no navegador) + finalizar: retirada no Maniva ou envio com CEP, pedido vai pronto pro WhatsApp |
| `portfolio.html` | Acervo: 53 tattoos, filtros por estilo, 12 por vez |
| `sobre.html`, `papo.html` | Sobre e dúvidas em sanfonas |
| `nao-clica.html` | A carinha original interativa (o "Paciência online" do Samtto), conta quantas vezes irritaram ele |

Produtos: lista `PRODUTOS` em `../_ref/build.py` (gera `js/produtos.js`). `preco: None` = "Consultar". Fontes: Pixelify Sans (interface), IBM Plex Sans (texto), Rubik Dirt + Sedgwick só na marca. v1 guardada em `../_ref/build-v1.py`, `style-v1.css`, `main-v1.js`.

## Loja: como funciona e próximos passos

Hoje (estático, GitHub Pages): carrinho no navegador → pedido montado → WhatsApp. Ele confirma estoque e frete e manda o pagamento (Pix ou link de cartão).
Para pagamento automático: (1) link de pagamento do Mercado Pago por produto, ou (2) loja Nuvemshop/Shopify integrada, ou (3) WordPress + WooCommerce + Mercado Pago + Melhor Envio, igual ao invocad0 (precisa de hospedagem paga).

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
2. ~~Fotos do zip~~ entraram em 08/10 (53). Lista, títulos, região, estilos e recorte de cada uma em `../_ref/portfolio.py`; rodar `python _ref/portfolio.py` regera `assets/img/port/`. Conferir com ele os nomes que dei às peças e se quer separar as curadas.
3. **Número do WhatsApp** com DDI em `js/main.js` → `whatsappNumber`. Sem ele, o site copia a mensagem e abre o link da bio.
4. **Bio** em 2 ou 3 frases e uma definição de tatupunk nas palavras dele.
5. **Valores**: valor mínimo ou faixa; sinal e remarcação; faixa R$ 150–200 dos disponíveis.
6. **Upload da imagem**: preset unsigned do Cloudinary (`cloudinaryCloud` / `cloudinaryPreset`).
7. **Loja**: preços dos quadros e prints, lista real de produtos, envio (Correios?) e forma de pagamento. **Disponíveis**: marcar folhas já tatuadas.
8. **Endereço e horário** do Maniva (ou só "endereço no chat", por ser estúdio privado). Com endereço entra o mapa.
9. **Guest spots** fora de Manaus e **cuidados** pós-tattoo.
10. **Domínio** (trocar `SITE` em `_ref/build.py`, canonical, sitemap e robots).

---
Site por [L R G Z](https://lrgz.com.br)
