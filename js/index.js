//let API = "http://localhost:8080/v1/api"
let API = "https://projsoftajude.herokuapp.com/v1/api"


//função que cadastra um usuario
function save() {
    let nome = document.querySelector(".Nome").value;
    let ultimoNome = document.querySelector(".UltimoNome").value;
    let email = document.querySelector(".Email").value;
    let cartao = document.querySelector(".CartaoDeCredito").value;
    let senha = document.querySelector(".Senha").value;
    let json = `{"nome":"${ nome }", "ultimoNome":"${ ultimoNome }", "email":"${ email }", "cartaoDeCredito":"${ cartao }", "senha":"${ senha }"}`;

    fetch(API + "/usuarios", {
        'method': 'POST',
        'body': json,
        'headers': { 'Content-Type': 'application/json' }
    })
    .then(r => {
        if (r.status === 200) {
            console.log(r);
            alert("Usuário cadastrado com sucesso!");
            setTimeout(login, 0);
        }
        else {
            alert("Usuário não foi cadastrado, email já existente");
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

    let json = `{"email":"${ email }", "senha":"${ senha }"}`;

    fetch(API + "/login/usuarios", {
        'method': 'POST',
        'body': json,
        'headers': { 'Content-Type': 'application/json' }
    })
    .then(r => {
        if (r.status === 401) {
            localStorage.removeItem("email");
            localStorage.removeItem("token");
        } else if (r.status === 200) {
            setTimeout(perfilUsuario, 0);
        } else {
            alert("email ou senha incorreto");
        }
        return r.json();
    })
    .then(j => {
            localStorage.setItem("token", j.token);
            localStorage.setItem("email", email);

            console.log(j.token);
        });
}

// função que mostra a view de cadastro
function viewCadastro() {
    let $main = document.querySelector("main");
    let $templateView1 = document.querySelector(".cadastro");

    $main.innerHTML = $templateView1.innerHTML;

    let $button = document.querySelector(".save");
    $button.addEventListener("click", save);
}

// função que mostra a tela de login
function login() {
    location.hash = "#Login";
    let $main = document.querySelector("main");
    let $templateView = document.querySelector(".login");

    $main.innerHTML = $templateView.innerHTML;

    let $button = document.querySelector(".save");
    $button.addEventListener("click", _ => { setTimeout(authenticate, 0) });
}

// função que ve as respostas de um comentario
function veRespostas(id, coment) {
    let $campanhaComentario = document.querySelector(".campanhaComentarios");
    $campanhaComentario.innerHTML = '';

    let $h2 = document.createElement("h2");
    $h2.innerText = "Comentarios Respondidos: " + coment;

    $campanhaComentario.appendChild($h2);
    $campanhaComentario.appendChild(document.createElement("hr"));

    fetch(API + "/comentario/respostas/" + id, {
        "method": "GET"
    })
    .then(r => {
        if (r.status === 401) {
            localStorage.removeItem("email");
            localStorage.removeItem("token");
        }

        return r.json();
    })
    .then(k => {
        console.log(k);
        let $campanhaComentario = document.querySelector(".campanhaComentarios");
        for (let i = 0; i < k.length; i++) {
            let $div = document.createElement("div");
            let $comentario = document.createElement("p");
            let $a = document.createElement("a");
            let $nome = document.createElement("h4");

            let $button = document.createElement("button");
            $button.classList.add("save");

            $button.innerText = "Apagar Comentário";

            if (!(localStorage.getItem("token") === null) && localStorage.getItem("email") === k[i].commentOwner) {
                $button.addEventListener('click', _ => { apagaComentario(k[i].id, url) });
                $div.appendChild($button);
            }

            $nome.innerText = k[i].commentOwner + " disse:";
            $comentario.innerText = k[i].comentario;
            $a.href = "#comentario/" + k[i].id;

            // parte para ver as respostas de um comentario
            $a.addEventListener('click', _ => { veRespostas(k[i].id, k[i].comentario) });

            $a.appendChild($nome);
            $div.appendChild($a);
            $div.appendChild($comentario);
            if (localStorage.getItem("email") === k[i].commentOwner) {
                $button.addEventListener('click', _ => {
                    fetch(API + "/auth/comentario/deletar/" + k[i].id, {
                        'method': 'DELETE',
                        'headers': { 'Authorization': "Bearer " + localStorage.getItem("token") }
                    })
                    .then(r => {
                        if (r.status === 200) {
                            setTimeout(_ => { veRespostas(id, coment)}, 0);
                        }
                    })
                });
                $div.appendChild($button);
            }

            $div.appendChild(document.createElement("hr"));
            $campanhaComentario.appendChild($div);
        }

        if (localStorage.getItem("token") != null) {
            let $input = document.createElement("input");
            $input.classList.add("input");
            $input.placeholder = "Digite sua resposta";
            let $button = document.createElement("button");
            $button.classList.add("save");
            $button.innerText = "Responder Comentário";

            $campanhaComentario.appendChild($input);
            $campanhaComentario.appendChild($button);

            $button.addEventListener('click', _ => {
                let comentario = $input.value;

                let json = `{"comentario":"${ comentario }", "idComentario":${ id }}`;
                console.log(json);
                fetch(API + "/auth/comentario/", {
                    "method":"POST",
                    'body': json,
                    'headers': { "Authorization": "Bearer " + localStorage.getItem("token"), "Content-type": "application/json" }
                })
                .then(r => {
                    console.log(r);
                    if (r.status === 401) {
                        localStorage.removeItem("email");
                        localStorage.removeItem("token");
                    }
                    if (r.status != 201) {
                        //setTimeout(login,0);
                    }
                    return r.json();
                })
                .then(j => {
                    setTimeout(_ => { veRespostas(id, coment) }, 0);
                })
            })
        }
    })
}

// função para dar/remover likes ou dislikes
function like_dislike(action, url) {
    if (!(localStorage.getItem("token") === null)) {
        let json = `{"email":"${ localStorage.getItem("email") }", "urlCampanha":"${ url }"}`;
        
         fetch(API + "/auth/" + action, {
            'method': "POST",
            'body': json,
            'headers': { "Authorization": "Bearer " + localStorage.getItem("token"), "Content-type": "application/json" }
        })
        .then(r => {
            if (r.status === 401) {
                localStorage.removeItem("email");
                localStorage.removeItem("token");
            }
            if (r.status === 409) {
                fetch(API + "/auth/" + action + "/campanha/remove/" + url, {
                    'method': "DELETE",
                    'headers': { "Authorization": "Bearer " + localStorage.getItem("token") }
                })
                .then(re => {
                    // substitui a response de addLike pela response de removeLike
                    r = re;   
                    setTimeout(_ => { campanha(url) }, 0);  
                })
            } else {
                setTimeout(_ => { campanha(url) }, 0);
            }
        })
    }
}

// função para apagar um comentário
function apagaComentario(id, url) {
    fetch(API + "/auth/comentario/deletar/" + id, {
        'method': 'DELETE',
        'headers': { 'Authorization': "Bearer " + localStorage.getItem("token") }
    })
    .then(r => {
        if (r.status === 200) {
            setTimeout(_ => { campanha(url) }, 0);
        }
        if (r.status === 401) {
            localStorage.removeItem("email");
            localStorage.removeItem("token");
        }
    })
}

// função para alterar as informações de uma campanha
function alteraCampanha(url) {
    document.querySelector("main").innerHTML = document.querySelector(".alteraCampanha").innerHTML;

    let $botaoEncerraCampanha = document.querySelector(".encerrarCampanha");
    $botaoEncerraCampanha.addEventListener('click', _ => {
        let conf = confirm("Tem certeza de que deseja encerrar a campanha?");
        if (conf == true) {
            fetch(API + "/auth/campanha/encerrar/" + url, {
                'method': 'PUT',
                'headers': { "Authorization": "Bearer " + localStorage.getItem('token'), "Content-type": "application/json" }
            })
            .then(r => {
                if (r.status === 200) {
                    alert("A campanha foi encerrada");
                    setTimeout(_ => {campanha(url)}, 0);
                }
                if (r.status === 401) {
                    localStorage.removeItem("email");
                    localStorage.removeItem("token");
                }
                return r.json();
            })
        }
    })

    let $botaoAlteraDealine = document.querySelector(".alteraDeadlineBotao");
    $botaoAlteraDealine.addEventListener('click', _ => {
        let data = document.querySelector('.alteraDeadline').value;
        console.log(data);
        fetch(API + "/auth/campanha/deadline/" + url, {
            'method': 'PUT',
            'body': `{"data": "${ data }"}`,
            'headers': { "Authorization": "Bearer " + localStorage.getItem('token'), "Content-type": "application/json"}
        })
        .then(r => {
            if (r.status === 200) {
                alert("Deadline alterado com sucesso!");
                setTimeout(_ => { campanha(url) }, 0);
            }
            if (r.status === 401) {
                localStorage.removeItem("email");
                localStorage.removeItem("token");
            }
        })
    })

    let $botaoAlteraMeta = document.querySelector(".alteraMetaBotao");
    $botaoAlteraMeta.addEventListener('click', _ => {
        let meta = document.querySelector(".alteraMeta").value;
        console.log(meta);
        fetch(API + "/auth/campanha/meta/" + url, {
            'method': 'PUT',
            'body': `{"meta": ${ meta }}`,
            'headers':{ "Authorization": "Bearer " + localStorage.getItem('token'), "Content-type": "application/json" }
        })
        .then(r => {
            if (r.status === 200) {
                alert("Meta alterada com sucesso");
                setTimeout(_ => {campanha(url)}, 0);
            }
            if (r.status === 401) {
                localStorage.removeItem("email");
                localStorage.removeItem("token");
            }
        })
    })

    let $botaoAlteraDescricao = document.querySelector(".alteraDescricaoBotao");
    $botaoAlteraDescricao.addEventListener('click', _ => {
        let desc = document.querySelector(".alteraDescricao").value;

        fetch(API + '/auth/campanha/descricao/' + url, {
            'method': 'PUT',
            'body': `{"descricao": "${ desc }"}`,
            'headers': { "Authorization": "Bearer " + localStorage.getItem('token'), "Content-type": "application/json" }
        })
        .then(r => {
            if (r.status === 200) {
                alert("Descrição alterada com sucesso");
                setTimeout(_ => { campanha(url) }, 0);
            }
            if (r.status === 401) {
                localStorage.removeItem("email");
                localStorage.removeItem("token");
            }
        })
    })

}

// função que mostra a view de campanha
function campanha(url) {
    let $main = document.querySelector("main");
    $main.innerHTML = document.querySelector(".campanha").innerHTML;

    fetch(API + "/campanha/" + url, {
        "method": "GET"
    })
    .then(r => r.json())
        .then(j => {
            document.querySelector(".campanhaNome").innerText = "Nome: " + j.nome;
            document.querySelector(".campanhaDescricao").innerText = "Descrição: " + j.descricao;
            document.querySelector(".campanhaDataLimite").innerText = "Data Limite: " + j.dataLimite.substring(0, 10);
            document.querySelector(".campanhaStatus").innerText = "Status: " + j.status;
            document.querySelector(".campanhaUrl").innerText = "URL: " + j.url;
            document.querySelector(".campanhaMeta").innerText = "Meta: R$ " + j.meta;
            document.querySelector(".campanhaDoacoes").innerText = "Doações: R$ " + j.doacoes;
            document.querySelector(".campanhaLikes").innerText = "Likes: " + j.likes;
            document.querySelector(".campanhaDislikes").innerText = "Dislikes: " + j.dislikes;
            document.querySelector(".campanhaDono").innerText = "Dono: " + j.dono.email;

            let $infoCampanha = document.querySelector(".infoCampanha");

            //console.log("a")
            if (!(localStorage.getItem("token") === null)) {
                let $input = document.createElement("input");
                $input.classList.add("input");
                $input.placeholder = "Digite o valor que deseja doar (em R$)";
                let $button = document.createElement("button");
                $button.classList.add("save");

                $button.innerText = "Fazer doação";

                $infoCampanha.appendChild($input);
                $infoCampanha.appendChild($button);

                $button.addEventListener('click', _ => {
                    let json = `{"emailDoador":"${ localStorage.getItem("email") }", "quantia":"${ $input.value }", "urlCampanha":"${ j.url }"}`;
                    console.log(json);
                    fetch(API + "/auth/doacao", {
                        "method": "POST",
                        'body': json,
                        "headers": { "Authorization": "Bearer " + localStorage.getItem("token"), "Content-type": "application/json" }
                    })
                    .then(r => {
                        if (r.status === 401) {
                            localStorage.removeItem("email");
                            localStorage.removeItem("token");
                        }
                        if (r.status === 404 || isNaN($input.value)) {
                            alert('Digite uma quantia válida')
                        }
                        return r.json();
                    })
                    .then(j => {
                        setTimeout(_ => { campanha(url) }, 0);
                    })
                })

                // chama função que dá ou remove um like
                let $likeButton = document.createElement("button");
                $likeButton.innerText = "Like";
                $likeButton.addEventListener('click', _ => {
                    setTimeout(_ => { like_dislike("like", url) } , 0);
                });

                // chama função que dá ou remove um dislike
                let $dislike = document.createElement("button");
                $dislike.innerText = "Dislike"
                $dislike.addEventListener('click', _ => {
                    setTimeout(_ => { like_dislike("dislike", url) } , 0);
                });

                $likeButton.classList.add("save");
                $dislike.classList.add("save");

                $infoCampanha.appendChild($likeButton);
                $infoCampanha.appendChild($dislike)
            }

            if (!(localStorage.getItem("token") === null) && localStorage.getItem("email") === j.dono.email) {
                let $altera = document.createElement("button");
                $altera.innerText = "Alterar informações da campanha";
                $altera.addEventListener('click',_ => {alteraCampanha(url)});
                $altera.classList.add("save");
                $infoCampanha.appendChild($altera);
            }

            // adiciona o comentario
            fetch(API + "/comentario/campanha/" + url, {
                "method": "GET"
            })
            .then(r => {
                if (r.status === 401) {
                    localStorage.removeItem("email");
                    localStorage.removeItem("token");
                }
                return r.json();
            })
            .then(k => {
                console.log(k);
                let $campanhaComentario = document.querySelector(".campanhaComentarios");
                for (let i = 0; i < k.length; i++) {
                    let $div = document.createElement("div");
                    let $comentario = document.createElement("p");
                    let $a = document.createElement('a');
                    let $nome = document.createElement("h4");
                    let $button = document.createElement("button");
                    $button.classList.add("save");
                    $button.innerText = "Apagar comentário";
                    $nome.innerText = k[i].commentOwner + " disse:";
                    $comentario.innerText = k[i].comentario;
                    $a.href = "#comentario/" + k[i].id;
                    
                    // parte para ver as respostas de um comentario
                    $a.addEventListener('click', _ => { veRespostas(k[i].id, k[i].comentario) });
                    $a.appendChild($nome);
                    $div.appendChild($a);
                    $div.appendChild($comentario);
                    if (!(localStorage.getItem("token") === null) && localStorage.getItem("email") === k[i].commentOwner) {
                        $div.appendChild($button);
                        $button.addEventListener('click', _ => {apagaComentario(k[i].id,url)});
                    }
                    $div.appendChild(document.createElement("hr"));
                    $campanhaComentario.appendChild($div);
                }
                if (localStorage.getItem("token") != null) {
                    let $input = document.createElement("input");
                    $input.classList.add("input");
                    $input.placeholder = "Digite seu comentário";
                    let $button = document.createElement("button");
                    $button.classList.add("save");
                    $button.innerText = "Salvar Comentário";
                    $campanhaComentario.appendChild($input);
                    $campanhaComentario.appendChild($button);
                    $button.addEventListener('click', _ => {
                        let comentario = $input.value;
                        let json = `{"comentario":"${ comentario }", "idCampanha":${ j.id }}`;
                        console.log(json);
                        fetch(API + "/auth/comentario/", {
                            "method": "POST",
                            'body': json,
                            'headers': { "Authorization": "Bearer " + localStorage.getItem("token"), "Content-type": "application/json" }
                        }).
                        then(r => {
                            console.log(r);
                            if (r.status != 200) {
                                setTimeout(login, 0);
                            }
                            return r.json();
                        })
                        .then(j => {
                            console.log(j);
                            setTimeout(_ => { campanha(url) }, 0);
                        })
                    })
                }
            })
        })
}

// salva uma campanha
function saveCamp() {
    let nome = document.querySelector(".nomeCamp").value;
    let descricao = document.querySelector(".descricaoCamp").value;
    let meta = document.querySelector(".metaCamp").value;
    let data = document.querySelector(".dataCamp").value;
    let json = `{"nome":"${ nome }", "descricao":"${ descricao }", "meta":${ meta }, "dataLimite":"${ data }"}`;

    fetch(API + "/auth/campanha", {
        'method': 'POST',
        'body': json,
        'headers': { "Authorization": "Bearer " + localStorage.getItem("token"), 'Content-Type': 'application/json' }
    }).
    then(r => {
        if (r.status === 401) {
            localStorage.removeItem("email");
            localStorage.removeItem("token");
        }
        if (r.status === 201) {
            alert("Campanha cadastrada com sucesso.");
            return r.json();
        } else {
            alert("Não foi possível criar a campanha.")
            return undefined;
        }
        
    })
}

// função auxiliar que percorre uma lista de campanhas e exibe um resumo delas
function listaCampanhas(lista, tam, retorno) {
    for (let i = 0; i < tam; i++) {
        let $div = document.createElement("div");
        let $nome = document.createElement("a");
        $nome.href = "#campanha/" + lista[i].url;
        let $meta = document.createElement("p");
        let $likes = document.createElement("p");

        $nome.innerText = "Nome: " + lista[i].nome;
        $nome.addEventListener('click', _ => { campanha(lista[i].url) });
        $meta.innerText = "Meta: R$ " + lista[i].meta;
        $likes.innerText = "Qtd. de Likes: " + lista[i].likes;

        $div.appendChild($nome);
        $div.appendChild($meta);
        $div.appendChild($likes);
        $div.appendChild(document.createElement("hr"));
        retorno.appendChild($div);
    }
}

// encontra campanhas atraves de substring (contidas somente no titulo)
function findCampanhaBySubstr() {
    let substring = document.querySelector(".busca").value;

    let $main = document.querySelector("main");
    let $home = document.querySelector(".home");
    $main.innerHTML = $home.innerHTML;

    let $campanhasHome = document.querySelector(".campanhasHome");
    $campanhasHome.innerHTML = "";


    if (!(localStorage.getItem("token") === null)) {
        fetch(API + "/campanha/find/busca=" + substring, {
            'method': "GET"
        })
        .then(r => {
            if(r.status === 401){
                localStorage.removeItem("email");
                localStorage.removeItem("token");
            }
            return r.json();
        })
        .then(j => {
            setTimeout(_ => { listaCampanhas(j, Math.min(j.length, 5), $campanhasHome) }, 0)
        });
    }
}

// encapsula saveCamp
function cadastraCampanha() {
    location.hash = "#cadastraCamp";

    if (localStorage.getItem("token") === null) {
        setTimeout(login, 0);
    } else {
        let $main = document.querySelector("main");
        let $campanha = document.querySelector(".cadastraCamp");
        $main.innerHTML = $campanha.innerHTML;

        let $cadastra = document.querySelector(".botaoCamp");
        $cadastra.addEventListener('click', _ => { setTimeout(saveCamp, 0) });
    }
}

// mostra a view da página inicial
function home() {
    location.hash = "";

    let $main = document.querySelector("main");
    let $home = document.querySelector(".home");

    $main.innerHTML = $home.innerHTML;

    ordenaPor("meta");

    let $button = document.querySelector(".select");
    $button.addEventListener("click", _ => {
        let ord = document.querySelector(".selectOrd").value;
        ordenaPor(ord);
    })
}

// função para ordenar as campanhas da página inicial de acordo com um parâmetro
function ordenaPor(ord) {
    let $campanhasHome = document.querySelector(".campanhasHome");
    $campanhasHome.innerHTML = "";
    
    fetch(API + "/campanha/sort/" + ord, {
        'method': 'GET'
    })
    .then(r => {
        if (r.status === 401) {
            localStorage.removeItem("email");
            localStorage.removeItem("token");
        }
        return r.json();
    })
    .then(j => {
        console.log(j);
        listaCampanhas(j, Math.min(j.length, 5), $campanhasHome);
    })
}


// encontra campanhas atraves de uma substring que pode estar contida no 
// titulo ou na descricao da campanha
function findBySubstr() {
    let substring = document.querySelector(".campBySubstr").value;
    console.log(substring);
    fetch(API + "/campanha/find/descr/busca=" + substring, {
        'method': "GET",
    })
    .then(r => {
        if (r.status === 401) {
            localStorage.removeItem("email");
            localStorage.removeItem("token");
        }
        return r.json();
    })
    .then(j => {
        let $campanhas = document.querySelector(".campanhasUsuario");
        $campanhas.innerHTML = "";

        let $title = document.createElement("h3");
        $title.innerText = "Campanhas encontradas com: " + substring;
        $campanhas.appendChild($title);

        listaCampanhas(j, j.length, $campanhas);
    });   
}


// função que mostra a view do usuario
function perfilUsuario() {
    location.hash = "#Usuario";

    if (localStorage.getItem("token") === null) {
        setTimeout(login, 0);
    } else {
        let $main = document.querySelector("main");
        let $perfil = document.querySelector(".perfil");
        $main.innerHTML = $perfil.innerHTML;

        let $sair = document.querySelector(".sair");
        $sair.addEventListener('click', _ => {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            setTimeout(login, 0);
        })

        // find campanha by substring on title/description
        let $pesquisar = document.querySelector(".pesquisar");
        $pesquisar.addEventListener('click', _ => setTimeout(findBySubstr, 0));

        // informações do usuario
        fetch(API + "/usuarios/" + localStorage.getItem("email"), {
            'method': "GET",
        })
        .then(r => {
            if (r.status === 401) {
                localStorage.removeItem("email");
                localStorage.removeItem("token");
            }
            return r.json();
        })
        .then(j => {
            let $nome = document.querySelector(".nomeUsuario");
            let $email = document.querySelector(".emailUsuario");
            let $cartao = document.querySelector(".senhaUsuario");
            let $senha = document.querySelector(".cartaoDeCreditoUsuario");

            $nome.innerText = "Nome: " + j.nome + " " + j.ultimoNome;
            $email.innerText = "Email: " + j.email;
            $cartao.innerText = "Cartão de Credito: " + j.cartaoDeCredito;
            $senha.innerText = "Senha: " + j.senha;
        })

        let $addCamp = document.querySelector(".cadastrarCampanha");
        $addCamp.addEventListener('click', cadastraCampanha);

        // fetch para pegar as campanhas que o usuario eh dono
        fetch(API + "/usuarios/campanhas/" + localStorage.getItem("email"), {
            'method': "GET"
        })
        .then(r => {
            if (r.status === 401) {
                localStorage.removeItem("email");
                localStorage.removeItem("token");
            }
            return r.json()
        })
        .then(j => {
            let lista = j;
            console.log(lista);
            for (let i = 0; i < j.length; i++) {
                let $div = document.createElement("div");
                let $nome = document.createElement("a");
                $nome.href = "#campanha/" + lista[i].url;
                let $descricao = document.createElement("p");
                let $dataLimite = document.createElement("p");
                let $status = document.createElement("p");
                let $url = document.createElement("p");
                let $meta = document.createElement("p");
                let $doacoes = document.createElement("p");

                let $campanhaDono = document.querySelector(".campanhasDono");
                $nome.innerText = "Nome: " + lista[i].nome;
                $nome.addEventListener('click', _ => { campanha(lista[i].url) });
                $descricao.innerText = "Descrição: " + lista[i].descricao;
                $dataLimite.innerText = "Data Limite: " + lista[i].dataLimite.substring(0, 10);
                $status.innerText = "Status: " + lista[i].status;
                $url.innerText = "URL: " + lista[i].url
                $meta.innerText = "Meta: R$ " + lista[i].meta;
                $doacoes.innerText = "Doações: R$ " + lista[i].doacoes;

                $div.appendChild($nome);
                $div.appendChild($descricao);
                $div.appendChild($dataLimite);
                $div.appendChild($status);
                $div.appendChild($url);
                $div.appendChild($meta);
                $div.appendChild($doacoes);
                $div.appendChild(document.createElement("hr"));
                $campanhaDono.appendChild($div);
            }
        })


        // campanhas que o usuario doou
        fetch(API + "/auth/campanha/doacao", {
            'method': "GET",
            "headers": {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        }).then(r => {
            if (r.status != 200) {
                setTimeout(login, 0);
                localStorage.removeItem("token")
                return undefined;
            }
            return r.json()
        })
            .then(j => {
                if (j === undefined) return;
                let lista = j;
                console.log(lista)
                for (let i = 0; i < j.length; i++) {
                    let $campanhasDoadas = document.querySelector(".campanhasDoadas");

                    let $div = document.createElement("div")

                    let $nome = document.createElement("a");
                    let $descricao = document.createElement("p");
                    let $dataLimite = document.createElement("p")
                    let $status = document.createElement("p");
                    let $url = document.createElement("p");
                    let $meta = document.createElement("p");
                    let $doacoes = document.createElement("p");



                    $nome.innerText = "Nome: " + lista[i].nome
                    $nome.href = "#campanha/" + lista[i].url
                    $nome.addEventListener('click', _ => { campanha(lista[i].url) })
                    $descricao.innerText = "Descricao: " + lista[i].descricao;
                    $dataLimite.innerText = "Data Limite: " + lista[i].dataLimite.substring(0, 10);
                    $status.innerText = "Status: " + lista[i].status;
                    $url.innerText = "URL: " + lista[i].url
                    $meta.innerText = "Meta: R$ " + lista[i].meta;
                    $doacoes.innerText = "Doações: R$ " + lista[i].doacoes;

                    $div.appendChild($nome)
                    $div.appendChild($descricao)
                    $div.appendChild($dataLimite);
                    $div.appendChild($status)
                    $div.appendChild($url)
                    $div.appendChild($meta)
                    $div.appendChild($doacoes)
                    $div.appendChild(document.createElement("hr"))
                    $campanhasDoadas.appendChild($div);
                }
            })

    }

}


// função que inicia a aplicação
(function init() {
    let hash = location.hash;
    let $main = document.querySelector("main");

    let $home = document.querySelector(".home");
    $home.addEventListener('click', home);

    let $login = document.querySelector(".linkLogin");
    $login.addEventListener('click', login);

    let $cadastro = document.querySelector(".linkCadastro");
    $cadastro.addEventListener('click', viewCadastro);

    let $perfil = document.querySelector(".perfilUsuario");
    $perfil.addEventListener('click', perfilUsuario);

    let $buscaCampanha = document.querySelector(".botaoBusca");
    $buscaCampanha.addEventListener('click', findCampanhaBySubstr);

    if (hash === "#Cadastro") {
        setTimeout(viewCadastro, 0);
    } else if (hash === "#Login") {
        setTimeout(login, 0);
    } else if (hash === "#Usuario") {
        setTimeout(perfilUsuario, 0);
    } else if (hash.substr(0, 10) === "#campanha/") {
        setTimeout(_ => { campanha(hash.substr(10)) });
    } else {
        setTimeout(home, 0);
    }

}())