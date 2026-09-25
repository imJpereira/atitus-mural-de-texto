const sala = document.body.dataset.room;
const textarea = document.getElementById("editor");
const status = document.getElementById("status");
const preview = document.getElementById("preview");
const md = window.markdownit();
const protocolo = location.protocol === "https:" ? "wss:" : "ws:";
const ESPERA_ENVIO = 150;
const ESPERA_RECONEXAO = 2000;
let envioAgendado = null;
let reconexaoAgendada = null;
let conexao = null;

function renderPreview() {
    preview.innerHTML = md.render(textarea.value);
}

function conectar() {
    if (conexao && (conexao.readyState === WebSocket.CONNECTING || conexao.readyState === WebSocket.OPEN)) {
        return;
    }

    conexao = new WebSocket(protocolo + "//" + location.host + "/ws/" + sala);

    conexao.onopen = function () {
        console.log("WebSocket conectado");
        clearTimeout(reconexaoAgendada);
        reconexaoAgendada = null;
        clearTimeout(envioAgendado);
        envioAgendado = null;
        status.hidden = true;
    };

    conexao.onmessage = function (evento) {
        const dados = JSON.parse(evento.data);
        if (dados.type === "init") {
            textarea.value = dados.text;
            renderPreview();
            return;
        }
        if (dados.type !== "update") {
            return;
        }
        const posicao = textarea.selectionStart;
        textarea.value = dados.text;
        textarea.setSelectionRange(posicao, posicao);
        renderPreview();
    };

    conexao.onclose = function () {
        console.log("WebSocket fechado");
        clearTimeout(envioAgendado);
        envioAgendado = null;
        agendarReconexao();
    };

    conexao.onerror = function () {
        console.error("Erro no WebSocket");
    };
}

function agendarReconexao() {
    if (reconexaoAgendada !== null) {
        return;
    }
    status.hidden = false;
    reconexaoAgendada = setTimeout(function () {
        reconexaoAgendada = null;
        conectar();
    }, ESPERA_RECONEXAO);
}

textarea.addEventListener("input", function () {
    renderPreview();
    clearTimeout(envioAgendado);
    envioAgendado = setTimeout(function () {
        if (!conexao || conexao.readyState !== WebSocket.OPEN) {
            return;
        }
        conexao.send(JSON.stringify({
            type: "update",
            text: textarea.value
        }));
    }, ESPERA_ENVIO);
});

conectar();
