
let API = "http://localhost:8080/v1/api"

function carregando(){
    let $body = document.querySelector(".centro");
    let $div = document.createElement("div")
    $body.appendChild($div);
    $div.innerHTML = "Adicionando usuario..."
    setTimeout(()=> {$body.removeChild($div)},3000);
}

function save(){
    let nome = document.querySelector(".Nome input").value;
    let ultimoNome = document.querySelector(".UltimoNome input").value
    let email = document.querySelector(".Email input").value
    let cartao = document.querySelector(".CartaoDeCredito input").value
    let senha = document.querySelector(".Senha input").value
    console.log(nome)
    let json = `{"nome": "${nome}","ultimoNome": "${ultimoNome}","email":"${email}","cartaoDeCredito":"${cartao}","senha":"${senha}"}`;
    
    fetch(API + "/usuarios" , {
        'method':'POST',
        'body': json,
        'headers' : {'Content-Type':'application/json'}
    }).then(r => r.json())
    .then(j => {
        console.log(j)
        carregando()
    })
}


(function init(){
    console.log("inicionou")
    let $button = document.querySelector(".save")
    $button.addEventListener("click",save)
    
}())