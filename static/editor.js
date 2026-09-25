const sala = document.body.dataset.room;
const textarea = document.getElementById("editor");
const protocolo = location.protocol === "https:" ? "wss:" : "ws:";
const conexao = new WebSocket(protocolo + "//" + location.host + "/ws/" + sala);
const ESPERA_ENVIO = 150;
let envioAgendado = null;

conexao.onopen = function () {
    console.log("WebSocket conectado");
};

conexao.onmessage = function (evento) {
    const dados = JSON.parse(evento.data);
    if (dados.type === "init") {
        textarea.value = dados.text;
        return;
    }
    if (dados.type !== "update") {
        return;
    }
    const posicao = textarea.selectionStart;
    textarea.value = dados.text;
    textarea.setSelectionRange(posicao, posicao);
};

textarea.addEventListener("input", function () {
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
