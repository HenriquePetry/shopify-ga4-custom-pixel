# Custom Pixel GA4 para Shopify Plus

Este repositório contém um custom pixel para implementação de eventos padrão do Google Analytics 4 (GA4) em lojas Shopify Plus. O pixel foi projetado para rastrear eventos de e-commerce seguindo o formato de evento padrão do GA4.

## Funcionalidades

- Rastreamento completo do funil de e-commerce (visualização de produto, adição ao carrinho, checkout, compra)
- Integração com Google Tag Manager
- Mapeamento automático dos eventos Shopify para eventos GA4
- Rastreamento de listas de produtos e pesquisas
- Persistência de informações de navegação via sessionStorage

## Eventos Suportados

O pixel mapeia os seguintes eventos Shopify para eventos GA4:

| Evento Shopify | Evento GA4 |
|----------------|------------|
| checkout_completed | purchase |
| payment_info_submitted | add_payment_info |
| checkout_shipping_info_submitted | add_shipping_info |
| checkout_started | begin_checkout |
| product_added_to_cart | add_to_cart |
| cart_viewed | view_cart |
| page_viewed | page_viewed |
| product_viewed | view_item |
| search_submitted | search |
| collection_viewed | view_item_list |

## Instalação

1. No painel admin da Shopify Plus, navegue até Configurações > Aplicativos e vendas de canais > Desenvolver aplicativos
2. Crie um novo pixel personalizado
3. Copie e cole o código do arquivo `custom-pixel.js` no editor de código
4. **Importante:** Substitua a variável `webGTMID` na linha 6 com sua própria ID do GTM:
   ```javascript
   var webGTMID = 'XXX-XXXXXX';
   ```
5. Salve e publique o pixel

## Configuração Adicional

### Google Tag Manager

Configure seu contêiner GTM para processar os eventos da dataLayer. Os eventos já estão formatados de acordo com as especificações do GA4.

### Armazenamento de Sessão

O pixel utiliza `sessionStorage` para manter informações sobre listas de produtos entre páginas. Isso permite que as fontes de tráfego (como coleções ou resultados de pesquisa) sejam rastreadas corretamente quando um usuário navega para um produto.

## Personalização

Para personalizar o pixel para sua loja:

1. Ajuste os nomes dos eventos conforme necessário no objeto `shopifyStandardEventToGtagEventsMap`
2. Modifique as funções de mapeamento de dados conforme seus requisitos específicos
3. Adicione eventos personalizados usando o método `analytics.subscribe`

## Estrutura do Código

- **Inicialização:** Configuração inicial de variáveis e dataLayer
- **Funções Utilitárias:** Funções para manipulação de dados e formatos
- **Adaptadores de Eventos:** Conversão de eventos Shopify para formato GA4
- **Handlers de Eventos:** Processamento e envio de eventos para o dataLayer

## Compatibilidade

Este pixel é compatível com a versão mais recente da Shopify Plus e segue as diretrizes de implementação do Google Analytics 4.

## Licença

MIT License

## Contribuição

Contribuições são bem-vindas! Por favor, crie um issue ou pull request para sugestões ou melhorias.
