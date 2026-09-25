const sala = document.body.dataset.room;
const textarea = document.getElementById("editor");
const preview = document.getElementById("preview");
const md = window.markdownit();
const protocolo = location.protocol === "https:" ? "wss:" : "ws:";
const conexao = new WebSocket(protocolo + "//" + location.host + "/ws/" + sala);
const ESPERA_ENVIO = 150;
let envioAgendado = null;

function renderPreview() {
    preview.innerHTML = md.render(textarea.value);
}

conexao.onopen = function () {
    console.log("WebSocket conectado");
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

textarea.addEventListener("input", function () {
    renderPreview();
    clearTimeout(envioAgendado);
    envioAgendado = setTimeout(function () {
        if (conexao.readyState !== WebSocket.OPEN) {
            return;
        }
        conexao.send(JSON.stringify({
            type: "update",
            text: textarea.value
        }));
    }, ESPERA_ENVIO);
});

conexao.onclose = function () {
    console.log("WebSocket fechado");
};

conexao.onerror = function () {
    console.error("Erro no WebSocket");
};
