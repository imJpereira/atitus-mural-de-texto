const NOME_SALA = /^[a-zA-Z0-9_-]{1,50}$/;

const formulario = document.getElementById("form-sala");
const campoSala = document.getElementById("sala");
const textoAjuda = document.getElementById("ajuda");
const textoErro = document.getElementById("erro");

function nomeValido(nome) {
    return NOME_SALA.test(nome);
}

function mostrarErro() {
    campoSala.setAttribute("aria-invalid", "true");
    textoAjuda.hidden = true;
    textoErro.hidden = false;
}

function limparErro() {
    campoSala.setAttribute("aria-invalid", "false");
    textoAjuda.hidden = false;
    textoErro.hidden = true;
}

function validarNome() {
    if (!nomeValido(campoSala.value)) {
        mostrarErro();
        return false;
    }
    limparErro();
    return true;
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!validarNome()) {
        return;
    }
    window.location.assign("/" + campoSala.value);
});

campoSala.addEventListener("blur", function () {
    if (campoSala.value === "") {
        return;
    }
    validarNome();
});
