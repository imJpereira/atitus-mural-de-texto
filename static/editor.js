const sala = document.body.dataset.room;
const textarea = document.getElementById("editor");
const protocolo = location.protocol === "https:" ? "wss:" : "ws:";
const conexao = new WebSocket(protocolo + "//" + location.host + "/ws/" + sala);

conexao.onopen = function () {
    console.log("WebSocket conectado");
};

conexao.onmessage = function (evento) {
    const dados = JSON.parse(evento.data);
    if (dados.type !== "init") {
        return;
    }
    textarea.value = dados.text;
};

conexao.onclose = function () {
    console.log("WebSocket fechado");
};

conexao.onerror = function () {
    console.error("Erro no WebSocket");
};
