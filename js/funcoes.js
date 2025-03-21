var temporizador = document.querySelector("#temporizador");
var contador = document.querySelector("#contador_maca");
var tela = document.querySelector("canvas");
var desenhar = tela.getContext("2d");
var dimensaoCobra = 110; // Tamanho aumentado
var dimensaoMaca = 40;
var taxaDeMovimento = 50; // Movimento corresponde ao tamanho
var corpo;
var tempoAtualMinutos, tempoAtualSegundos, temporizadorSegundos, temporizadorMinutos, cronometro, movimentacao;
var macasColetadas = 0;
var nivel = 1;
var xMaca, yMaca;
var direcoes = {"esquerda":false, "cima":false, "direita":true, "baixo":false}
var tempoMaca;

// Carregamento de imagens
var imagemCobra = new Image();
imagemCobra.src = 'images/m.png';

var imagemMaca = new Image();
imagemMaca.src = 'images/maca.png';

function iniciarJogo() {
    document.getElementById("play").disabled = true;
    resetarValores();
    configurarCanvas();
    iniciarContadores();
    corpo = [600, 300]; // Posição inicial
    gerarCoordenadaMaca();
    iniciarIntervalos();
}

function resetarValores() {
    temporizadorSegundos = 0;
    temporizadorMinutos = 0;
    macasColetadas = 0;
    nivel = 1;
    direcoes = {"esquerda":false, "cima":false, "direita":true, "baixo":false};
}

function configurarCanvas() {
    tela.width = 1260;
    tela.height = 510;
    desenhar.fillStyle = "lightgreen";
    desenhar.fillRect(0, 0, tela.width, tela.height);
}

function iniciarContadores() {
    temporizador.innerHTML = "00:00";
    contador.innerHTML = 0;
    document.getElementById("tempo_label").style.display = "block";
    document.getElementById("contador_label").style.display = "block";
}

function iniciarIntervalos() {
    cronometro = setInterval(iniciarTemporizador, 1000);
    movimentacao = setInterval(movimentarCobra, 250); // Velocidade inicial mais lenta
}

function movimentarCobra() {
    apagarFrame();
    desenharMaca();
    verificarDirecao();
    desenharCobra();
    testarColisoes();
}

function desenharCobra() {
    desenhar.drawImage(imagemCobra, corpo[0], corpo[1], dimensaoCobra, dimensaoCobra);
}

function testarColisoes() {
    testarColisaoMaca();
}

function testarColisaoMaca() {
    const cabecaX = corpo[0];
    const cabecaY = corpo[1];
    
    if (cabecaX < xMaca + dimensaoMaca &&
        cabecaX + dimensaoCobra > xMaca &&
        cabecaY < yMaca + dimensaoMaca &&
        cabecaY + dimensaoCobra > yMaca) {
        
        clearTimeout(tempoMaca);
        gerarCoordenadaMaca();
        contabilizarMaca();
    }
}

function gerarCoordenadaMaca() {
    // Posiciona a maçã em múltiplos do tamanho da cobra
    const colunas = Math.floor(tela.width / dimensaoCobra);
    const linhas = Math.floor(tela.height / dimensaoCobra);
    
    xMaca = Math.floor(Math.random() * colunas) * dimensaoCobra;
    yMaca = Math.floor(Math.random() * linhas) * dimensaoCobra;
    
    // Tempo para a maçã desaparecer (diminui com o nível)
    const tempoDesaparecer = 3000 - (nivel * 200);
    tempoMaca = setTimeout(gerarCoordenadaMaca, Math.max(1000, tempoDesaparecer));
}

function desenharMaca() {
    desenhar.drawImage(imagemMaca, xMaca, yMaca, dimensaoMaca, dimensaoMaca);
}

function verificarDirecao() {
    const vel = taxaDeMovimento;
    let newX = corpo[0];
    let newY = corpo[1];
    
    if(direcoes.esquerda) newX -= vel;
    if(direcoes.direita) newX += vel;
    if(direcoes.cima) newY -= vel;
    if(direcoes.baixo) newY += vel;

    // Teleporte nas bordas
    newX = (newX + tela.width) % tela.width;
    newY = (newY + tela.height) % tela.height;

    corpo[0] = newX;
    corpo[1] = newY;
}

function mudarDirecao(evento) {
    const key = evento.key;
    const direcao = {
        ArrowLeft: 'esquerda',
        a: 'esquerda',
        ArrowUp: 'cima',
        w: 'cima',
        ArrowRight: 'direita',
        d: 'direita',
        ArrowDown: 'baixo',
        s: 'baixo'
    }[key.toLowerCase()];
    
    if(direcao && !direcoes[getDirecaoOposta(direcao)]) {
        direcoes = Object.keys(direcoes).reduce((acc, k) => {
            acc[k] = k === direcao;
            return acc;
        }, {});
    }
}

function getDirecaoOposta(direcao) {
    return {
        esquerda: 'direita',
        direita: 'esquerda',
        cima: 'baixo',
        baixo: 'cima'
    }[direcao];
}

function finalizarJogo(mensagem) {
    clearInterval(cronometro);
    clearInterval(movimentacao);
    clearTimeout(tempoMaca);
    alert(mensagem);
    reiniciarJogo();
}

function reiniciarJogo() {
    document.getElementById("play").disabled = false;
    document.getElementById("tempo_label").style.display = "none";
    document.getElementById("contador_label").style.display = "none";
}

function iniciarTemporizador() {
    temporizadorSegundos++;
    if(temporizadorSegundos >= 60) {
        temporizadorSegundos = 0;
        temporizadorMinutos++;
    }
    temporizador.innerHTML = `${formatarTempo(temporizadorMinutos)}:${formatarTempo(temporizadorSegundos)}`;
}

function formatarTempo(valor) {
    return valor < 10 ? `0${valor}` : valor;
}

function apagarFrame() {
    desenhar.fillStyle = "lightgreen";
    desenhar.fillRect(0, 0, tela.width, tela.height);
}

function contabilizarMaca() {
    macasColetadas++;
    contador.innerHTML = macasColetadas;
    
    if(macasColetadas === 20) {
        nivel++;
        macasColetadas = 0;
        contador.innerHTML = 0;
        alert(`Parabéns! Você alcançou o nível ${nivel}`);
        
        // Aumenta dificuldade gradualmente
        clearInterval(movimentacao);
        const novaVelocidade = 250 - (nivel * 15); // Aumento de velocidade menor
        movimentacao = setInterval(movimentarCobra, Math.max(100, novaVelocidade));
    }
}

document.addEventListener('keydown', mudarDirecao);
imagemCobra.onload = imagemMaca.onload = iniciarJogo;