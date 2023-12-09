# API de Música e Playlist

Este repositório contém o código de uma API backend desenvolvida com TypeScript, Express e Knex. A API permite a criação de músicas e playlists, além de suportar as operações de atualização e exclusão de músicas em uma playlist.

## Tecnologias Utilizadas

- TypeScript
- Express
- Knex

## Endpoints

### Usuario

- **POST /signup**: Cria um usuario.
- **POST /login**: Gera Token de Authenticação.
- 
### Música

- **POST /musica**: Cria uma nova música.
- **GET /musicas**: Busca todas as músicas.

### Playlist

- **POST /playlist**: Cria uma nova playlist.
- **GET /playlist**: Busca todas as playlists.

### Música na Playlist

- **POST /playlist/:id/musica**: Adiciona uma música à playlist pelo ID da playlist.
- **PUT /playlist/:id/musica/:idMusica**: Atualiza uma música em uma playlist pelos IDs da playlist e da música.
- **DELETE /playlist/:id/musica/:idMusica**: Remove uma música de uma playlist pelos IDs da playlist e da música.

## Como Executar

1. Clone este repositório
2. Instale as dependências com `npm install`
3. Inicie o servidor com `npm start`

Visite `localhost:3000` no seu navegador para ver a API em ação.

## Contribuição

Contribuições são sempre bem-vindas. Sinta-se à vontade para abrir uma issue ou enviar um pull request.

