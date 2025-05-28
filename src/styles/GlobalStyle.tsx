import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    height: 100%; /* Garante que o html possa ser uma referência para altura 100% */
    width: 100%;  /* Ocupa toda a largura da viewport */
    overflow-x: hidden; /* Previne scroll horizontal acidental no nível do html */
  }

  body {
    margin: 0;       /* Remove margens padrão do navegador */
    padding: 0;      /* Remove paddings padrão */
    min-height: 100%;/* O body deve ter pelo menos a altura da tag html (que é 100% da viewport) */
                     /* Alternativamente, min-height: 100vh; diretamente aqui também funciona bem */
    width: 100%;     /* O body ocupa toda a largura da tag html */
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                 Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f0fdf4; /* Cor de fundo base para áreas fora do seu app principal, se houver */
    color: #1f2937;
    line-height: 1.5; /* Um espaçamento entre linhas padrão mais legível */
  }

  #root { /* Assumindo que seu app React monta em <div id="root"></div> no index.html */
    min-height: 100vh; /* Garante que o container raiz do React possa ocupar toda a altura da viewport */
    width: 100%;       /* E toda a largura */
    display: flex;     /* Permite que SidebarContainer (se for filho direto) se comporte bem como item flex */
    flex-direction: column; /* Se #root precisar organizar múltiplos filhos diretos verticalmente */
                           /* Se SidebarContainer for o único filho principal, isso pode não ser estritamente
                              necessário, mas geralmente não prejudica e pode ajudar. */
  }

  /* Outros resets e estilos base que você já tinha ou queira adicionar */
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 0.75em 0;
    font-weight: 600;
    line-height: 1.2;
  }

  p {
    margin: 0 0 1em 0;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul, ol {
    padding-left: 20px;
    margin: 0 0 1em 0;
  }
`;

export default GlobalStyle;