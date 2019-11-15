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

function authenticate() {
    let email = document.querySelector(".Email").value;
    let senha = document.querySelector(".Senha").value;

    let json = `{"email": "${email}", "senha": "${senha}"}`;

    fetch(API + "/login/usuarios", {
        'method': 'POST',
        'body': json,
        'headers': {'Content-Type':'application/json'} 
    }).then(r => r.json())
    .then(j => {
        localStorage.setItem("token", j.token);
        localStorage.setItem("email",email);
        alert("Usuário logado com sucesso!");
        console.log(j.token)
        
    });
}

function viewCadastro(){
    let $main = document.querySelector("main");
    let $templateView1 = document.querySelector(".cadastro")

    $main.innerHTML = $templateView1.innerHTML;

    let $button = document.querySelector(".save")
    $button.addEventListener("click",save)

    console.log("veio aqui?")
   
}

function login() {
    let $main = document.querySelector("main");
    let $templateView = document.querySelector(".login");

    $main.innerHTML = $templateView.innerHTML;
    
    let $button = document.querySelector(".save");
    $button.addEventListener("click", authenticate);
}


function perfilUsuario(){
    if(localStorage.getItem("token") === null){
        login();
    }else{
        let $main = document.querySelector("main");
        let $perfil = document.querySelector(".perfil")
        $main.innerHTML = $perfil.innerHTML;

        fetch(API + "/usuarios/" + localStorage.getItem("email"),{
            'method': "GET",
        }).then(r => r.json())
        .then(j => {
            let $nome = document.querySelector(".nomeUsuario")
            let $email = document.querySelector(".emailUsuario")
            let $cartao = document.querySelector(".senhaUsuario")
            let $senha = document.querySelector(".cartaoDeCreditoUsuario")

            $nome.innerText = "Nome: " + j.nome+ " " + j.ultimoNome;
            $email.innerText = "Email: " + j.email;
            $cartao.innerText = "Cartão de Credito: " + j.cartaoDeCredito;
            $senha.innerText = "Senha: " + j.senha;
        })

        fetch(API+"/usuarios/campanhas/"+localStorage.getItem("email"),{
            'method':"GET"
        }).then(r => r.json())
        .then(j => {
            let lista = j;
            console.log(lista)
            for(let i = 0; i < j.length; i++){
                let $campanhaDono = document.querySelector(".campanhasDono"); 

                let $div = document.createElement("div")

                let $nome = document.createElement("p");
                let $descricao = document.createElement("p");
                let $dataLimite = document.createElement("p")
                let $status = document.createElement("p");
                let $url = document.createElement("p");
                let $meta = document.createElement("p");
                let $doacoes = document.createElement("p");



                $nome.innerText = "Nome: " + lista[i].nome
                $descricao.innerText = "Descricao: " + lista[i].descricao;
                $dataLimite.innerText = "Data Limite: " + lista[i].dataLimite.substring(0,10);
                $status.innerText = "Status: " + lista[i].status;
                $url.innerText = "URL: "+ lista[i].url
                $meta.innerText = "Meta: " + lista[i].meta;
                $doacoes.innerText = "Doacoes: " + lista[i].doacoes;

                $div.appendChild($nome)
                $div.appendChild($descricao)
                $div.appendChild($dataLimite);
                $div.appendChild($status)
                $div.appendChild($url)
                $div.appendChild($meta)
                $div.appendChild($doacoes)
                $div.appendChild(document.createElement("hr"))
                $campanhaDono.appendChild($div);
            }
        })

    }

}

(function init(){
    console.log("inicionou")
    
    let hash = location.hash;
    let $main = document.querySelector("main");

    let $cadastro = document.querySelector(".linkCadastro")
    $cadastro.addEventListener('click',viewCadastro)

    let $login = document.querySelector(".linkLogin");
    $login.addEventListener('click', login);

    let $perfil = document.querySelector(".perfilUsuario");
    $perfil.addEventListener('click',perfilUsuario)

    

    if(hash === "#Cadastro"){
        viewCadastro();
    } else if (hash === "#Login") {
        login();
    }else if(hash === "#Usuario"){
        perfilUsuario();
    }
    else{
        $main.innerHTML = '';
    }
    
}())