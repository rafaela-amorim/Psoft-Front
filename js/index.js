let API = "http://localhost:8080/v1/api"


//função que cadastra um usuario
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
    }).then(r => {
        if(r.status === 200){
            console.log(r)
            alert("usuario cadastrado com sucesso!")
            setTimeout(login,0);
        }
        return r.json();
    })
    .then(j => {
        
    })
}

// função que autentica o login de um usuario
function authenticate() {
    let email = document.querySelector(".Email").value;
    let senha = document.querySelector(".Senha").value;

    let json = `{"email": "${email}", "senha": "${senha}"}`;

    fetch(API + "/login/usuarios", {
        'method': 'POST',
        'body': json,
        'headers': {'Content-Type':'application/json'} 
    }).then(r => {
        if(r.status === 200)
            setTimeout(perfilUsuario,0);
        return r.json();
    })
    .then(j => {
        localStorage.setItem("token", j.token);
        localStorage.setItem("email",email);

        console.log(j.token)
        
    });
}

// função que mostra a view de cadastro
function viewCadastro(){
    let $main = document.querySelector("main");
    let $templateView1 = document.querySelector(".cadastro")

    $main.innerHTML = $templateView1.innerHTML;

    let $button = document.querySelector(".save")
    $button.addEventListener("click",save)

    console.log("veio aqui?")
   
}

// função que mostra a tela de login
function login() {
    location.hash = "#Login";
    let $main = document.querySelector("main");
    let $templateView = document.querySelector(".login");

    $main.innerHTML = $templateView.innerHTML;
    
    let $button = document.querySelector(".save");
    $button.addEventListener("click", _ => {setTimeout(authenticate,0)});
}

// função que ve as respostas de um comentario
function veRespostas(id, coment){
    console.log("????????")
    let $campanhaComentario = document.querySelector(".campanhaComentarios");
    $campanhaComentario.innerHTML = '';

    let $h2 = document.createElement("h2");
    $h2.innerText = "Comentarios Respondidos: "+coment;

    $campanhaComentario.appendChild($h2)
    $campanhaComentario.appendChild(document.createElement("hr"))

    fetch(API+"/comentario/respostas/"+id,{
        "method":"GET"
    }).then(r => r.json())
    .then(k => {
        console.log(k)
        let $campanhaComentario = document.querySelector(".campanhaComentarios");
        for(let i = 0; i < k.length; i++){
            let $div = document.createElement("div")
            let $comentario = document.createElement("p")
            let $a = document.createElement('a')
            let $nome = document.createElement("h4");


            $nome.innerText = k[i].commentOwner + " Disse:"
            $comentario.innerText = k[i].comentario;
            $a.href = "#comentario/"+k[i].id;

            // parte para ver as respostas de um comentario
            $a.addEventListener('click', _ => {veRespostas(k[i].id,k[i].comentario)})

            $a.appendChild($nome)
            $div.appendChild($a)
            $div.appendChild($comentario)
            $div.appendChild(document.createElement("hr"))
            $campanhaComentario.appendChild($div)
        }
        if(localStorage.getItem("token") != null){
            let $input = document.createElement("input");
            let $button = document.createElement("button");
            $button.innerText = "Responder Comentario";



            $campanhaComentario.appendChild($input);
            $campanhaComentario.appendChild($button);

            

            $button.addEventListener('click',_ => {
                let comentario = $input.value;

                let json = `{"comentario":"${comentario}","idComentario":${id}}`;
                console.log(json)
                fetch(API+"/auth/comentario/",{
                    "method":"POST",
                    'body': json,
                    'headers':{"Authorization":"Bearer "+localStorage.getItem("token"),"Content-type":"application/json"}
                }).then(r => {
                    console.log(r)
                    if(r.status != 201){
                        //setTimeout(login,0);
                    }
                    return r.json()
                })
                .then(j => {
                    console.log(j);
                    setTimeout(_ => {veRespostas(id,coment)},0);
                })
            })
        }
    })
}


// função que mostra a view de campanha
function campanha(url){
    let $main = document.querySelector("main")
    $main.innerHTML = document.querySelector(".campanha").innerHTML;

    fetch(API+"/campanha/"+url,{
        "method":"GET"
    }).then(r => r.json())
    .then(j => {
        document.querySelector(".campanhaNome").innerText = "Nome: " + j.nome;
        document.querySelector(".campanhaDescricao").innerText = "Descricao: " + j.descricao;
        document.querySelector(".campanhaDataLimite").innerText = "Data Limite: " + j.dataLimite.substring(0,10);
        document.querySelector(".campanhaStatus").innerText = "Status: "+j.status;
        document.querySelector(".campanhaUrl").innerText = "ULR: "+j.url;
        document.querySelector(".campanhaMeta").innerText = "Meta: "+j.meta;
        document.querySelector(".campanhaDoacoes").innerText = "Doacoes: "+j.doacoes;

        if(!(localStorage.getItem("token") === null)){
            let $infoCampanha = document.querySelector(".infoCampanha");
            let $input = document.createElement("input");
            let $button = document.createElement("button");

            $button.innerText = "Fazer doação"

            $infoCampanha.appendChild($input)
            $infoCampanha.appendChild($button)

            $button.addEventListener('click', _ => {
                let json = `{"emailDoador":"${localStorage.getItem("email")}","quantia":"${$input.value}","urlCampanha":"${j.url}"}`
                console.log(json)
                fetch(API+"/auth/doacao",{
                    "method":"POST",
                    'body':json,
                    "headers":{"Authorization":"Bearer "+localStorage.getItem("token"),"Content-type":"application/json"}
                }).then(r => r.json())
                .then(j => {
                    console.log(j);
                    setTimeout(campanha(url),0);
                })
            })

        }

        // adiciona o comentario
        fetch(API+"/comentario/campanha/"+url,{
            "method":"GET"
        }).then(r => r.json())
        .then(k => {
            console.log(k)
            let $campanhaComentario = document.querySelector(".campanhaComentarios");
            for(let i = 0; i < k.length; i++){
                let $div = document.createElement("div")
                let $comentario = document.createElement("p")
                let $a = document.createElement('a')
                let $nome = document.createElement("h4");


                $nome.innerText = k[i].commentOwner + " Disse:"
                $comentario.innerText = k[i].comentario;
                $a.href = "#comentario/"+k[i].id;

                // parte para ver as respostas de um comentario
                $a.addEventListener('click', _ => {veRespostas(k[i].id,k[i].comentario)})

                $a.appendChild($nome)
                $div.appendChild($a)
                $div.appendChild($comentario)
                $div.appendChild(document.createElement("hr"))
                $campanhaComentario.appendChild($div)
            }
            if(localStorage.getItem("token") != null){
                let $input = document.createElement("input");
                let $button = document.createElement("button");
                $button.innerText = "Salvar Comentario";



                $campanhaComentario.appendChild($input);
                $campanhaComentario.appendChild($button);

                

                $button.addEventListener('click',_ => {
                    let comentario = $input.value;

                    let json = `{"comentario":"${comentario}","idCampanha":${j.id}}`;
                    console.log(json)
                    fetch(API+"/auth/comentario/",{
                        "method":"POST",
                        'body': json,
                        'headers':{"Authorization":"Bearer "+localStorage.getItem("token"),"Content-type":"application/json"}
                    }).then(r => {
                        console.log(r)
                        if(r.status != 200){
                            setTimeout(login,0);
                        }
                        return r.json()
                    })
                    .then(j => {
                        console.log(j);
                        setTimeout(_ => {campanha(url)},0);
                    })
                })
            }
        })
        
    })
}

// metodo que mostra a view do usuario
function perfilUsuario(){
    location.hash = "#Usuario"
    if(localStorage.getItem("token") === null){
        setTimeout(login,0);
    }else{
        let $main = document.querySelector("main");
        let $perfil = document.querySelector(".perfil")
        $main.innerHTML = $perfil.innerHTML;

        let $sair = document.querySelector(".sair")
        $sair.addEventListener('click',_ => {

            setTimeout(login,0);
            localStorage.removeItem("token");
        })

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

                let $nome = document.createElement("a");
                $nome.href = "#campanha/"+lista[i].url
                let $descricao = document.createElement("p");
                let $dataLimite = document.createElement("p")
                let $status = document.createElement("p");
                let $url = document.createElement("p");
                let $meta = document.createElement("p");
                let $doacoes = document.createElement("p");



                $nome.innerText = "Nome: " + lista[i].nome
                $nome.addEventListener('click', _ => {campanha(lista[i].url)})
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

        fetch(API+"/auth/campanha/doacao",{
            'method':"GET",
            "headers":{
                "Authorization":"Bearer "+localStorage.getItem("token")
            } 
        }).then(r => {
            if(r.status != 200){
                setTimeout(login,0);
                localStorage.removeItem("token")
                return undefined;
            }
            return r.json()})
        .then(j =>{
            if(j === undefined) return;
            let lista = j;
            console.log(lista)
            for(let i = 0; i < j.length; i++){
                let $campanhaDono = document.querySelector(".campanhasDoadas"); 

                let $div = document.createElement("div")

                let $nome = document.createElement("a");
                let $descricao = document.createElement("p");
                let $dataLimite = document.createElement("p")
                let $status = document.createElement("p");
                let $url = document.createElement("p");
                let $meta = document.createElement("p");
                let $doacoes = document.createElement("p");



                $nome.innerText = "Nome: " + lista[i].nome
                $nome.href = "#campanha/"+lista[i].url
                $nome.addEventListener('click', _ => {campanha(lista[i].url)})
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
        setTimeout(viewCadastro,0);
    } else if (hash === "#Login") {
        setTimeout(login(),0);
    }else if(hash === "#Usuario"){
        setTimeout(perfilUsuario,0);
    }
    else if(hash.substr(0,10) === "#campanha/"){
        setTimeout(_ => {campanha(hash.substr(9))});
    }
    else{
        $main.innerHTML = '';
    }
    
}())