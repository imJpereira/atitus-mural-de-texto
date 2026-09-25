# Mural de texto markdown

Editor de texto colaborativo em tempo real com preview em markdown, no estilo do [Dontpad](http://dontpad.com).

O usuário informa o nome de uma sala na página inicial e é levado para `/{sala}`. Todos que entrarem na mesma sala editam o mesmo texto ao mesmo tempo, com o markdown renderizado ao lado.


## Funcionalidades

- **Salas por URL**: acessar `/{sala}` cria a sala automaticamente, sem cadastro nem login.
- **Edição em tempo real**: o que um usuário digita aparece para os demais da sala via WebSocket.
- **Preview em markdown**: editor à esquerda, preview renderizado à direita.
- **Reconexão automática**: se a conexão cair, o cliente reconecta e recebe o estado atual da sala.
- **Preview seguro**: HTML embutido no texto é escapado, não executado.

## Stack

| Camada | Tecnologia |
| -- | -- |
| Servidor | Python + [Tornado](https://www.tornadoweb.org/) |
| Comunicação | WebSocket |
| Cliente | JavaScript puro, HTML e CSS (sem frameworks) |
| Markdown | [markdown-it](https://github.com/markdown-it/markdown-it), renderizado no cliente |
| Dependências e ambiente | [uv](https://docs.astral.sh/uv/) |

## Como rodar

Pré-requisito: [uv](https://docs.astral.sh/uv/) instalado (ele baixa o Python 3.14 e as dependências sozinho).

```bash
uv sync
uv run main.py
```

Acesse http://localhost:8080 e informe o nome de uma sala.

## Rotas

| Rota | Descrição |
| -- | -- |
| `/` | Home, com o campo para o nome da sala |
| `/{sala}` | Editor da sala |
| `/ws/{sala}` | Endpoint WebSocket da sala |

O nome da sala deve casar com `^[a-zA-Z0-9_-]{1,50}$`. Nomes fora desse padrão respondem 404, o que também evita conflito com `/ws` e `/static`.

## Protocolo WebSocket

Mensagens em JSON:

- servidor → cliente, ao conectar: `{"type": "init", "text": "..."}`
- cliente → servidor: `{"type": "update", "text": "..."}`
- servidor → demais clientes da sala: `{"type": "update", "text": "..."}`

## Decisões de projeto

- **Sincronização**: o texto inteiro é enviado a cada mudança, com debounce de ~150 ms. O último a escrever vence.
- **Cursor**: a posição (`selectionStart`) é guardada e restaurada ao receber uma atualização remota.
- **Persistência**: as salas ficam em um dicionário em memória; o texto é perdido ao reiniciar o servidor.
- **Segurança**: HTML desativado no markdown (`html: false`), mensagens limitadas a 100.000 bytes e `check_origin` no padrão do Tornado.
- **Salas vazias**: não há limpeza automática.

## Limitações conhecidas

- Edições simultâneas podem se sobrescrever, já que vale o último a escrever.
- O cursor pode se deslocar durante uma edição concorrente.
- Sem persistência: reiniciar o servidor apaga todas as salas.
- Sem autenticação: qualquer pessoa com o link edita a sala.

## Estrutura prevista

```
├── main.py           # ponto de entrada
├── servidor.py       # rotas, handlers e dicionário de salas
├── pyproject.toml    # dependências (uv)
├── uv.lock           # versões travadas (uv)
├── static/
│   ├── editor.js     # WebSocket, textarea e preview
│   └── style.css
├── templates/
│   ├── home.html     # input do nome da sala
│   └── editor.html   # textarea + preview markdown
└── tests/            # testes automatizados (pytest)
```
