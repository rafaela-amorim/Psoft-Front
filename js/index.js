let API = "http://localhost:8080/v1/api"


function save(){
    let nome = document.querySelector(".Nome").value;
    let ultimoNome = document.querySelector(".UltimoNome").value
    let email = document.querySelector(".Email").value
    let cartao = document.querySelector(".CartaoDeCredito").value
    let senha = document.querySelector(".Senha").value
    let json = `{"nome": "${nome}","ultimoNome": "${ultimoNome}","email":"${email}","cartaoDeCredito":"${cartao}","senha":"${senha}"}`;
    
    fetch(API + "/usuarios" , {
        'method':'POST',
        'body': json,
        'headers' : {'Content-Type':'application/json'}
    }).then(r => r.json())
    .then(j => {
        console.log(j)
        alert("usuario cadastrado com sucesso!")
    })
}


(function init(){
    console.log("inicionou")
    let $button = document.querySelector(".save")
    $button.addEventListener("click",save)
    
}())