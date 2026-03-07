# **Vale Flux Control 💳📉**

O **Vale Flux Control** é uma aplicação web progressiva (PWA) minimalista projetada para ajudar profissionais a gerirem o saldo dos seus benefícios (Vale Refeição e Cesta Básica) de forma inteligente.

A aplicação calcula automaticamente a projeção de gastos diários e dias restantes até ao próximo carregamento, permitindo um controlo rigoroso do fluxo financeiro mensal.

## **✨ Funcionalidades**

* **Cálculo Automático de Custo Diário:** Baseado nos dias úteis e no valor total dos benefícios.  
* **Modo Simulador:** Altere a "Data de Referência" para prever cenários futuros sem afetar os dados reais de acesso.  
* **Gatilho de Recebimento:** Ao marcar o benefício como "Recebido", o sistema reseta automaticamente o custo diário para o novo ciclo.  
* **Reserva de Segurança:** Define um valor mínimo que não deve ser ultrapassado.  
* **PWA (Progressive Web App):** Pode ser instalado no telemóvel (Android/iOS) e funciona como um app nativo.  
* **Monitor de Sistema:** Painel detalhado com datas de corte, dias de compra e métricas internas.

## **🚀 Tecnologias Utilizadas**

* **HTML5/CSS3:** Interface responsiva com estética *Dark Mode*.  
* **JavaScript (Vanilla):** Lógica de cálculo e manipulação de datas sem dependências externas.  
* **LocalStorage:** Persistência de dados local para privacidade total do utilizador.  
* **Service Workers & Manifest: Support** Suporte para funcionamento offline e instalação.

## **📲 Como Instalar (PWA)**

Esta aplicação foi desenhada para ser instalada. Após aceder ao link da aplicação:

1. **No Android (Chrome):** Clique nos três pontos no canto superior direito e selecione "Instalar aplicação".  
2. **No iOS (Safari):** Clique no ícone de partilha e selecione "Adicionar ao Ecrã Principal".

## **🛠️ Estrutura do Repositório**

* index.html: Ficheiro principal contendo toda a estrutura, estilos e lógica.  
* manifest.json: Configurações de identidade do PWA (ícones, cores, nome).  
* sw.js: Service Worker para gestão de cache e modo offline.  
* /icons: Imagens de marca nos tamanhos 192px e 512px.

## **🔧 Configuração para Deploy**

O projeto está otimizado para a **Vercel** ou **Firebase Hosting**.

1. Faça o upload dos ficheiros para um repositório GitHub.  
2. Conecte o repositório à Vercel.  
3. O deploy será feito automaticamente com HTTPS (obrigatório para o PWA funcionar).

*Desenvolvido com foco em eficiência e simplicidade financeira.*