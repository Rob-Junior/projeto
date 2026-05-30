
const btnLoginBarra = document.querySelector('.btnLogin'); // pega o botão "Login" do menu
const fecharLogin = document.querySelector('.fechar'); // pega o botão de fechar (X)
const sobressair = document.querySelector('.sobressair'); // pega a caixa de login/registro
const formsLogin = document.querySelectorAll('.telaLogin'); // pega o botão "Login" do menu do HTML
const resgisterLink = document.querySelectorAll('.registrar'); // pega o link "Registrar-se"
const alterarLink = document.querySelector('.alterar'); // pega o link "Esqueci a senha/alterar os dados"

//Quando clica no botão Login do menu principal, ele adiciona a classe ativoLogin. Isso faz a janela de Login aparecer na tela.
btnLoginBarra.addEventListener('click', () => {
    sobressair.classList.add('ativoLogin');
}
);

//Quando clica no X (fechar), remove a classe ativoLogin. Assim, a janela de login/registro some da tela.
fecharLogin.addEventListener('click', () => {
    if (sobressair.classList.contains('ativo') || sobressair.classList.contains('ativot')) {
        sobressair.classList.remove('ativoLogin', 'ativo', 'ativot');
    } else {
        sobressair.classList.remove('ativoLogin');
    }
});

//Quando clica em "Registrar-se", adiciona a classe ativo. No CSS, isso vai trocar a tela de Login para a tela de Registro.
resgisterLink.forEach(link => { // forEach percorre a lista e aplica o mesmo evento em cada link.
    link.addEventListener('click', () => {
        if (sobressair.classList.contains('ativot')) {
            sobressair.classList.remove('ativot'),
                sobressair.classList.add('ativo');
        } else {
            sobressair.classList.add('ativo');
        }
    });
});

//Quando clica em "Forgot Password", adiciona a classe ativo. No CSS, isso vai trocar a tela de Login para a tela de Registro.
alterarLink.addEventListener('click', () => {
    sobressair.classList.add('ativot');
});

//Quando clica em "Login" (dentro da tela de Registro e Esqueci Senha), ele remove a classe ativo e atvot. Assim, volta para a tela de Login.
formsLogin.forEach(link => {
    link.addEventListener('click', () => {
        sobressair.classList.remove('ativo', 'ativot');
    });
});

// --- Conectar com PHP ---
// Registrar usuário
const registerForm = document.querySelector('.formsRegister form');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;
    const tipo = document.getElementById('tipoUsuario').value;

    fetch('../../backend/registro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, tipo })
    })
        .then(res => res.text())
        .then(data => alert(data))
        .catch(err => alert('Erro: ' + err));
});

// Login
const loginForm = document.querySelector('.formsLogin form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    fetch('../../backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                // Salva no localStorage
                localStorage.setItem('usuarioLogado', data.username);
                localStorage.setItem('tipoUsuario', data.tipo);

                // Atualiza interface
                mostrarUsuarioLogado();

                alert(`Bem-vindo, ${data.username}!`);
                sobressair.classList.remove('ativoLogin', 'ativo', 'ativot');
            } else {
                alert(data.message);
            }
        })
        .catch(err => alert('Erro: ' + err));
});

// Recuperar senha
const recuperarForm = document.querySelector('.formsAlteracao form');

recuperarForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = recuperarForm.querySelector('input[type="text"]').value;
    const email = recuperarForm.querySelector('input[type="email"]').value;

    fetch('../../backend/recuperar_senha.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            email
        })
    })
        .then(res => res.json())
        .then(data => {
            const mensagem = document.querySelector('.mensagem-recuperacao');
            mensagem.style.display = 'block';
            if (data.status === "success") {
                mensagem.innerHTML = `
                <p style="color: lightgreen;">
                    Sua senha é: <strong>${data.password}</strong>
                </p>
            `;
            } else {
                mensagem.innerHTML = `
                <p style="color: red;">
                    ${data.message}
                </p>
            `;
            }
        })
        .catch(err => {
            alert("Erro ao recuperar senha");
            console.log(err);
        });
});

// Log-out
function logout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('tipoUsuario');
    location.reload();
}

function mostrarUsuarioLogado() {
    const usuario = localStorage.getItem('usuarioLogado');
    const tipo = localStorage.getItem('tipoUsuario');
    const btnLogin = document.querySelector('.btnLogin');
    const usuarioLogado = document.querySelector('.usuarioLogado');
    const btnVendedor = document.querySelector('.btnVendedor');

    // Esconde botão vendedor inicialmente
    if (btnVendedor) {
        btnVendedor.style.display = 'none';
    }
    if (usuario) {
        btnLogin.style.display = 'none';
        usuarioLogado.style.display = 'flex';
        document.getElementById('nomeUsuario').textContent = usuario;

        // MOSTRA SOMENTE SE FOR VENDEDOR
        if (tipo === 'vendedor') {
            if (btnVendedor) {
                btnVendedor.style.display = 'inline-block';
            }
        }
    }
}

// Executa ao carregar a página
window.onload = mostrarUsuarioLogado;

// ------------------- CARRINHO -------------------
// ------------------- CARRINHO -------------------

// Função chamada pelo botão Comprar
function adicionarCarrinho(botao) {
    const nome = botao.getAttribute('data-nome');
    const preco = parseFloat(botao.getAttribute('data-preco'));
    const imagem = botao.parentElement.querySelector('img').src;

    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    const produtoExistente = carrinho.find(item => item.nome === nome);

    if (produtoExistente) {
        produtoExistente.quantidade += 1;
    } else {
        carrinho.push({
            nome,
            preco,
            quantidade: 1,
            imagem
        });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Atualiza contador do carrinho
    atualizarQtdCarrinho();

    alert(`${nome} adicionado ao carrinho!`);

    // Redireciona para a página do carrinho
    window.location.href = 'carrinho.html';
}

// Atualizar quantidade do carrinho
function atualizarQtdCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    let total = 0;

    carrinho.forEach(item => {
        total += item.quantidade;
    });

    const spanQtd = document.getElementById('qtdCarrinho');

    if (spanQtd) {
        spanQtd.textContent = total;
    }
}

// Atualiza o número do carrinho quando a página carrega
window.addEventListener('load', atualizarQtdCarrinho);
// --- FINALIZAR COMPRA ---
// Essa função verifica se o usuário está logado antes de ir para o checkout
document.addEventListener("DOMContentLoaded", () => {
    const btnFinalizar = document.getElementById("btnFinalizar");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", () => {
            const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

            // Se o carrinho estiver vazio, mostra alerta
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio!");
                return;
            }

            // Verifica se o usuário está logado
            const usuarioLogado = localStorage.getItem("usuarioLogado");

            if (!usuarioLogado) {
                // Usuário não logado → avisa e redireciona
                alert("Você precisa estar logado para finalizar a compra!");
                window.location.href = "carrinho.html";
                return;
            }

            // Usuário logado → pode ir para o checkout
            window.location.href = "checkout.html";
        });
    }
});


// ---------------- PRODUTOS + PESQUISA ----------------

// VARIÁVEIS GLOBAIS
let produtosGlobais = [];
let termoPesquisa = "";

// ---------------- ELEMENTOS GLOBAIS ----------------
let containerGeneros;
let tituloGeneros;

// ---------------- INICIALIZAÇÃO ----------------
window.addEventListener("DOMContentLoaded", () => {

    const inputPesquisa = document.getElementById("pesquisa");

    // 🔥 PEGAR ELEMENTOS DOS GÊNEROS (IMPORTANTE)
    containerGeneros = document.querySelector('.containerGeneros');
    tituloGeneros = document.querySelector('section.areaFiltros h1');

    // evento da pesquisa
    if (inputPesquisa) {
        inputPesquisa.addEventListener("input", (e) => {

            termoPesquisa = e.target.value.toLowerCase().trim();

            // 🔥 AQUI FAZ OS GÊNEROS SUMIREM
            if (termoPesquisa.length > 0) {

                if (containerGeneros) containerGeneros.style.display = "none";
                if (tituloGeneros) tituloGeneros.style.display = "none";

            } else {

                if (containerGeneros) containerGeneros.style.display = "flex";
                if (tituloGeneros) tituloGeneros.style.display = "block";
            }

            renderizarProdutos();
        });
    }

    carregarProdutos();
});

// ---------------- CARREGAR PRODUTOS ----------------
async function carregarProdutos() {

    const container = document.getElementById('produtosContainer');
    if (!container) return;

    try {

        const resposta = await fetch('../../backend/buscar_produtos.php');
        produtosGlobais = await resposta.json();

        renderizarProdutos();

    } catch (erro) {
        console.log("Erro ao carregar produtos", erro);
    }
}

// ---------------- RENDERIZAR ----------------
function renderizarProdutos() {

    const container = document.getElementById('produtosContainer');
    if (!container) return;

    container.innerHTML = "";
    
    let lista = [...produtosGlobais];

    // FILTRO CATEGORIA
    const categoria = new URLSearchParams(window.location.search).get('categoria');

    if (categoria) {
        lista = lista.filter(produto =>
            produto.categoria?.trim().toLowerCase() === categoria.trim().toLowerCase()
        );
    }

    // FILTRO PESQUISA
    if (termoPesquisa !== "") {
        lista = lista.filter(produto =>
            produto.nome?.toLowerCase().includes(termoPesquisa)
        );
    }

    // AVALIAÇÃO 

    // PERCORRE TODOS OS PRODUTOS

    lista.forEach(produto => {

        // CRIA O CARD DO PRODUTO
        container.innerHTML += `

        <div class="card">

            <!-- IMAGEM -->
            <img src="${produto.imagem}" alt="${produto.nome}">

            <!-- NOME -->
            <h3>${produto.nome}</h3>

            <!-- DESCRIÇÃO -->
            <p>Produto disponível na loja</p>

            <!-- PREÇO -->
            <p>Preço: R$ ${produto.preco}</p>

            <!-- ========================= -->
            <!-- ÁREA DE AVALIAÇÃO -->
            <!-- ========================= -->

            <div class="avaliacao">

                <!-- SELECT DAS ESTRELAS -->
                <select class="nota">

                    <option value="5">⭐⭐⭐⭐⭐</option>
                    <option value="4">⭐⭐⭐⭐</option>
                    <option value="3">⭐⭐⭐</option>
                    <option value="2">⭐⭐</option>
                    <option value="1">⭐</option>

                </select>

                <!-- CAMPO DE COMENTÁRIO -->
                <textarea 
                    class="comentario"
                    placeholder="Digite seu comentário"
                ></textarea>

                <!-- BOTÃO ENVIAR -->
                <button 
                    class="btnAvaliar"

                    onclick="enviarAvaliacao(${produto.id}, this)"
                >

                    Avaliar Produto

                </button>

                <!-- LOCAL ONDE AS AVALIAÇÕES VÃO APARECER -->
                <!-- BOTÃO MOSTRAR AVALIAÇÕES -->
                <button
                    class="btnMostrarAvaliacoes"

                    onclick="toggleAvaliacoes(${produto.id})"
                >

                    Mostrar Avaliações

                </button>

                <!-- ÁREA OCULTA -->
                <div

                    class="listaAvaliacoes oculto"

                    id="avaliacoes-${produto.id}"
                >
                </div>

            </div>
            
            <!-- BOTÃO FAVORITAR -->
            <button
                class="btnWishlist"
                onclick='adicionarWishlist(${JSON.stringify(produto).replace(/'/g, "&apos;")})'
            >
                Favoritar
            </button>
            
            <!-- BOTÃO COMPRAR -->
            <button 

                class="btnComprar"

                data-nome="${produto.nome}"

                data-preco="${produto.preco}"

                onclick="adicionarCarrinho(this)"
            >

                Comprar

            </button>

        </div>
    `;

        // CARREGA AS AVALIAÇÕES AUTOMATICAMENTE
        setTimeout(() => {

            carregarAvaliacoes(produto.id);

        }, 100);

    });
}
// ========================================
// ENVIAR AVALIAÇÃO
// ========================================

async function enviarAvaliacao(produtoId, botao) {

    // PEGA O CARD
    const card = botao.parentElement;

    // PEGA A NOTA
    const nota = card.querySelector('.nota').value;

    // PEGA O COMENTÁRIO
    const comentario = card.querySelector('.comentario').value;

    // PEGA O USUÁRIO LOGADO
    const usuario = localStorage.getItem('usuarioLogado');

    // VERIFICA LOGIN
    if (!usuario) {

        alert("Você precisa estar logado!");

        return;
    }

    try {

        // ENVIA PARA O PHP
        const resposta = await fetch(

            '../../backend/salvar_avaliacao.php',

            {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    produto_id: produtoId,

                    usuario: usuario,

                    nota: nota,

                    comentario: comentario

                })

            }
        );

        // PEGA RESPOSTA
        const dados = await resposta.json();

        // ALERTA
        alert(dados.message);

        // LIMPA CAMPO
        card.querySelector('.comentario').value = "";

        // RECARREGA
        carregarAvaliacoes(produtoId);

    } catch (erro) {

        console.log(erro);
    }
}

// ========================================
// CARREGAR AVALIAÇÕES
// ========================================

async function carregarAvaliacoes(produtoId) {

    try {

        // BUSCA NO PHP
        const resposta = await fetch(

            `../../backend/listar_avaliacoes.php?produto_id=${produtoId}`
        );

        // CONVERTE
        const avaliacoes = await resposta.json();

        // PEGA CONTAINER
        const container = document.getElementById(

            `avaliacoes-${produtoId}`
        );

        // LIMPA
        container.innerHTML = "";

        // PERCORRE TODAS
        avaliacoes.forEach(avaliacao => {

            // ESTRELAS
            const estrelas = "⭐".repeat(avaliacao.nota);

            // HTML
            container.innerHTML += `

                <div class="itemAvaliacao">

                    <strong>
                        ${avaliacao.usuario}
                    </strong>

                    <p>${estrelas}</p>

                    <p>${avaliacao.comentario}</p>

                    <button
                        class="btnExcluir"

                        onclick="excluirAvaliacao(
                            ${avaliacao.id},
                            ${produtoId}
                        )"
                    >

                        Excluir

                    </button>

                </div>

            `;
        });

    } catch (erro) {

        console.log(erro);
    }
}

// ========================================
// EXCLUIR AVALIAÇÃO
// ========================================

async function excluirAvaliacao(id, produtoId) {

    // CONFIRMA
    const confirmar = confirm(

        "Deseja excluir esta avaliação?"
    );

    // CANCELA
    if (!confirmar) {

        return;
    }

    try {

        // ENVIA PARA PHP
        const resposta = await fetch(

            '../../backend/excluir_avaliacao.php',

            {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    id: id

                })

            }
        );

        // RESPOSTA
        const dados = await resposta.json();

        // ALERTA
        alert(dados.message);

        // RECARREGA
        carregarAvaliacoes(produtoId);

    } catch (erro) {

        console.log(erro);
    }
}
// ========================================
// MOSTRAR / OCULTAR AVALIAÇÕES
// ========================================

function toggleAvaliacoes(produtoId) {

    // PEGA A DIV
    const container = document.getElementById(

        `avaliacoes-${produtoId}`
    );

    // VERIFICA
    if (container.classList.contains('oculto')) {

        // REMOVE OCULTO
        container.classList.remove('oculto');

    } else {

        // ADICIONA OCULTO
        container.classList.add('oculto');
    }
}


// ========================================
// WISHLIST
// ========================================

// ADICIONAR À WISHLIST
function adicionarWishlist(produto) {

    // PEGA WISHLIST
    let wishlist = JSON.parse(

        localStorage.getItem('wishlist')

    ) || [];

    // VERIFICA SE JÁ EXISTE
    const existe = wishlist.find(

        item => item.id == produto.id
    );

    // SE NÃO EXISTIR
    if (!existe) {

        // ADICIONA
        wishlist.push(produto);

        // SALVA
        localStorage.setItem(

            'wishlist',

            JSON.stringify(wishlist)
        );

        alert(

            'Produto adicionado à wishlist!'
        );

    } else {

        alert(

            'Produto já está na wishlist!'
        );
    }
}

// CARREGAR WISHLIST
function carregarWishlist() {

    // PEGA CONTAINER
    const container = document.getElementById(

        'wishlist-container'
    );

    // SE NÃO EXISTIR, PARA
    if (!container) {

        return;
    }

    // PEGA WISHLIST
    let wishlist = JSON.parse(

        localStorage.getItem('wishlist')

    ) || [];

    // WISHLIST VAZIA
    if (wishlist.length === 0) {

        container.innerHTML = `

            <h2>

                Sua lista está vazia.

            </h2>

        `;

        return;
    }

    // PERCORRE PRODUTOS
    wishlist.forEach(produto => {

        container.innerHTML += `

    <div class="card">

        <img
            src="${produto.imagem}"

            alt="${produto.nome}"
        >

        <h3>

            ${produto.nome}

        </h3>

        <p>

            R$ ${produto.preco}

        </p>

        <button

            class="btnRemoverWishlist"

            onclick="removerWishlist(${produto.id})"
        >

            Remover

        </button>

    </div>

`;
    });
}

// EXECUTA AO ABRIR A PÁGINA
window.addEventListener(

    'DOMContentLoaded',

    carregarWishlist
);

// REMOVER PRODUTO DA WISHLIST
function removerWishlist(id) {

    // PEGA WISHLIST
    let wishlist = JSON.parse(

        localStorage.getItem('wishlist')

    ) || [];

    // REMOVE PRODUTO
    wishlist = wishlist.filter(

        produto => produto.id != id
    );

    // SALVA NOVAMENTE
    localStorage.setItem(

        'wishlist',

        JSON.stringify(wishlist)
    );

    // RECARREGA PÁGINA
    location.reload();
}