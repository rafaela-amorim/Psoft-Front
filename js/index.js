
function save(){
    let nome = document.querySelector(".Nome input").value;
    let ultimoNome = document.querySelector(".UltimoNome input").value
    let email = document.querySelector(".Email input").value
    let cartao = document.querySelector(".CartaoDeCredito input").value
    let senha = document.querySelector(".Senha input").value
    console.log(nome)
    let json = `{"nome": "${nome}","ultimoNome": "${ultimoNome}","email":"${email}","cartaoDeCredito":"${cartao}","senha":"${senha}"}`;
    console.log(json)
}


(function init(){
    console.log("inicionou")
    let $button = document.querySelector(".save")
    $button.addEventListener("click",save)
    
}())