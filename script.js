const targetColorElement = document.getElementById("target-color");
const paintArea = document.getElementById("paint-area");
const similarityElement = document.getElementById("similarity");
const hitsElement = document.getElementById("hits");
const attemptsElement = document.getElementById("attempts");

const hueSlider = document.getElementById("hue-slider");
const saturationSlider = document.getElementById("saturation-slider");
const lightnessSlider = document.getElementById("lightness-slider");

const hueValueLabel = document.getElementById("hue-value");
const saturationValueLabel = document.getElementById("saturation-value");
const lightnessValueLabel = document.getElementById("lightness-value");

let targetColor, currentColor;
let hits = 0;
let attempts = 0;
let movementCount = 0; // Contador de movimentos nas barras
let countdown; // Armazena o intervalo do temporizador
let timeRemainingLimit = null; // Padrão: 30 segundos (modo médio)
let timeRemaining = timeRemainingLimit; // Inicialize a variável timeRemaining

let targetColorChanges = 0; // Contador de mudanças da cor alvo

const targetColorChangesElement = document.getElementById("target-color-changes");
let timerElement = document.getElementById("timer");
const colorList = document.getElementById("color-list");


const easyButton = document.getElementById("easy");
const mediumButton = document.getElementById("medium");
const hardButton = document.getElementById("hard");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game");

// Background color /////

// Seleciona os elementos
const body = document.body;

// Ao carregar a página ou ao exibir a tela de início, ativa a animação
if (startScreen.style.display !== "none") {
    body.classList.add("change-bg"); // Adiciona a animação
}

// Função para iniciar o jogo com o tempo de acordo com o modo escolhido
function startGame() {
    startScreen.style.display = "none";
    gameScreen.style.display = "block";

    body.classList.remove("change-bg"); // Remove a animação quando o jogo começar


    // Atualiza imediatamente timeRemaining com o limite de tempo
    timeRemaining = timeRemainingLimit;
    updateTimer();  // Atualiza o display de tempo imediatamente

    setNewTargetColor();
    startCountdown();
}

// Funções para cada modo de dificuldade
easyButton.addEventListener("click", () => {
    timeRemainingLimit = 60; // 1 minuto
    startGame();
});

mediumButton.addEventListener("click", () => {
    timeRemainingLimit = 30; // 30 segundos
    startGame();
});

hardButton.addEventListener("click", () => {
    timeRemainingLimit = 15; // 15 segundos
    startGame();
});


// Função para atualizar o background do slider de Hue com um gradiente arco-íris
hueSlider.addEventListener('input', () => {
    const hueValue = hueSlider.value; // Pega o valor do hue
    const hueColor = `hsl(${hueValue}, 100%, 50%)`; // Cor para o thumb do slider

    // Atualiza o thumb com a cor do hue
    hueSlider.style.setProperty('color', hueColor); // Altera a cor do thumb

    // Atualiza o background do slider com um gradiente de arco-íris
    hueSlider.style.background = `linear-gradient(to right, 
        hsl(0, 100%, 50%), 
        hsl(60, 100%, 50%), 
        hsl(120, 100%, 50%), 
        hsl(180, 100%, 50%), 
        hsl(240, 100%, 50%), 
        hsl(300, 100%, 50%), 
        hsl(360, 100%, 50%))`; // Gradiente arco-íris de 0 a 360 graus

    // Atualiza os sliders de Saturação e Luminosidade para refletir o Hue
    saturationSlider.style.background = `linear-gradient(to right, hsl(${hueValue}, 0%, 50%), hsl(${hueValue}, 100%, 50%))`;
    lightnessSlider.style.background = `linear-gradient(to right, black, hsl(${hueValue}, 100%, 50%), white)`;

    // Atualiza a cor na área de pintura
    updateColor(); // Atualiza a cor em tempo real
    hueValueLabel.textContent = hueSlider.value; // Atualiza o valor do hue na label
    checkSimilarity(); // Verifica a similaridade sempre que o hue mudar
});

// Função para atualizar o valor do slider e a cor
function handleSliderInput(slider, label) {
    label.textContent = slider.value; // Atualiza o valor do slider na label
    updateColor(); // Atualiza a cor em tempo real
    checkSimilarity(); // Verifica a similaridade
}

// Adiciona o evento 'input' para cada slider usando a função genérica
[hueSlider, saturationSlider, lightnessSlider].forEach((slider, index) => {
    const label = [hueValueLabel, saturationValueLabel, lightnessValueLabel][index];
    slider.addEventListener("input", () => handleSliderInput(slider, label));
});


// Função para atualizar a cor da área de pintura baseada no HSL dos sliders
function updateColor() {
    const hue = hueSlider.value; // Pega o valor do Hue
    const saturation = saturationSlider.value; // Pega o valor da Saturação
    const lightness = lightnessSlider.value; // Pega o valor da Luminosidade

    // Cria a cor HSL
    currentColor = { hue: parseInt(hue), saturation: parseInt(saturation), lightness: parseInt(lightness) };

    // Atualiza a área de pintura com a cor gerada (diretamente em HSL)
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    paintArea.style.backgroundColor = color;
}

// Função para ser chamada quando as barras forem "soltas" (change)
function onSliderChange() {
    movementCount++; // Incrementa o movimento
    if (movementCount >= 3) {
        attempts++; // Conta a tentativa a cada 3 movimentos
        attemptsElement.textContent = attempts;
        movementCount = 0; // Reseta o contador de movimentos
    }
}

// Adiciona o evento 'change' para cada barra de cor
hueSlider.addEventListener("change", onSliderChange);
saturationSlider.addEventListener("change", onSliderChange);
lightnessSlider.addEventListener("change", onSliderChange);

// Função para calcular similaridade entre duas cores HSL
function getSimilarity(color1, color2) {
    // Calculando as diferenças nos valores de Hue, Saturação e Luminosidade
    const hueDiff = Math.abs(color1.hue - color2.hue);
    const saturationDiff = Math.abs(color1.saturation - color2.saturation);
    const lightnessDiff = Math.abs(color1.lightness - color2.lightness);

    // Garantir que a diferença de Hue esteja dentro do intervalo de 0 a 180 graus (circular)
    const hueDistance = Math.min(hueDiff, 360 - hueDiff);

    // Similaridade calculada com base nas diferenças, considerando um valor máximo de 100
    const similarity = 100 - (hueDistance + saturationDiff + lightnessDiff) / 3;

    return Math.max(0, similarity); // Garante que a similaridade não fique negativa
}



// Função para converter HSL em HEX
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}



// Função para salvar a cor acertada e exibir na lista
function saveColor(color) {
    const listItem = document.createElement("li");
    const hexColor = hslToHex(color.hue, color.saturation, color.lightness);
    listItem.style.backgroundColor = hexColor;
    listItem.textContent = hexColor; // Mostra o código HEX em vez de HSL
    listItem.style.color = color.lightness > 50 ? "black" : "white"; // Ajusta a cor do texto para contraste


    // Função para copiar o texto e exibir "copiado"
    listItem.addEventListener('click', function () {
        // Copia o texto para a área de transferência
        navigator.clipboard.writeText(hexColor).then(() => {
            // Temporariamente muda o texto para "copiado"
            const originalText = listItem.textContent;
            listItem.innerHTML = "<i class='fa-regular fa-copy'></i>";
            setTimeout(() => {
                listItem.textContent = originalText;
            }, 1000); // Retorna ao texto original após 1 segundo
        }).catch(err => {
            console.error('Erro ao copiar para área de transferência: ', err);
        });
    });

    // Adiciona o item no início da lista
    colorList.prepend(listItem);

}


// Função para verificar a similaridade e reiniciar o jogo se necessário
function checkSimilarity() {
    const similarity = getSimilarity(targetColor, currentColor);
    similarityElement.textContent = `${similarity.toFixed(2)}%`;

    // Exibe o elemento apenas se a similaridade for 90% ou mais
    if (similarity >= 90) {
        similarityElement.parentElement.style.display = "inline"; // Exibe o elemento
    } else {
        similarityElement.parentElement.style.display = "none"; // Esconde o elemento
    }

    if (similarity >= 95) {
        hits++;
        hitsElement.textContent = hits;

        // Salva a cor acertada na lista
        saveColor(currentColor);

        setNewTargetColor(); // Atualiza o alvo e mistura as barras
        resetTimer();
    }
}

// Função para atualizar o temporizador na tela
function updateTimer() {
    timerElement.textContent = `${timeRemaining}s`;
}

// Função para reiniciar o temporizador para 30 segundos
function resetTimer() {
    clearInterval(countdown); // Para o temporizador atual
    timeRemaining = timeRemainingLimit; // Reseta o tempo para o valor selecionado
    updateTimer(); // Atualiza o HTML
    startCountdown(); // Inicia o novo temporizador
}

// Função para iniciar o temporizador e fazer a contagem regressiva
function startCountdown() {


    // Verifica se o temporizador já está em execução
    if (countdown) {
        clearInterval(countdown); // Limpa o intervalo anterior
    }

    countdown = setInterval(() => {
        timeRemaining--;  // Decrementa o tempo

        updateTimer();  // Atualiza o display do tempo restante

        // Se o tempo acabar, muda a cor alvo automaticamente e reseta o temporizador
        if (timeRemaining <= 0) {
            autoChangeTargetColor(); // Muda a cor automaticamente
            resetTimer(); // Reinicia o temporizador
        }
    }, 1000); // Atualiza a cada segundo
}


// Função para mudar a cor alvo automaticamente e contar a mudança
function autoChangeTargetColor() {
    setNewTargetColor();
    resetTimer();
    targetColorChanges++;
    targetColorChangesElement.textContent = targetColorChanges;
}

// Chama esta função quando o usuário acertar para reiniciar o alvo e o temporizador
function onUserHit() {
    hits++; // Incrementa os acertos
    hitsElement.textContent = hits;
    saveColor(currentColor); // Salva a cor acertada
    setNewTargetColor(); // Define uma nova cor alvo
    resetTimer(); // Reinicia o temporizador
}


// Função para gerar cor alvo aleatória
function setNewTargetColor() {
    const randomHue = Math.floor(Math.random() * 360);
    const randomSaturation = Math.floor(Math.random() * 100); // Saturação aleatória de 0 a 100
    const randomLightness = Math.floor(Math.random() * 100); // Luminosidade aleatória de 0 a 100

    // Gera a cor alvo em HSL
    targetColor = { hue: randomHue, saturation: randomSaturation, lightness: randomLightness };
    targetColorElement.style.backgroundColor = `hsl(${randomHue}, ${randomSaturation}%, ${randomLightness}%)`;

    currentColor = { hue: 0, saturation: 0, lightness: 100 }; // Cor inicial (branco)
    paintArea.style.backgroundColor = `hsl(${currentColor.hue}, ${currentColor.saturation}%, ${currentColor.lightness}%)`;

    movementCount = 0; // Reseta o contador de movimentos

    // Reposiciona as barras aleatoriamente
    randomizeSliders();
}

// Função para definir posições aleatórias nos sliders
function randomizeSliders() {
    hueSlider.value = Math.floor(Math.random() * 360); // Hue varia de 0 a 360
    saturationSlider.value = Math.floor(Math.random() * 100); // Saturação varia de 0 a 100
    lightnessSlider.value = Math.floor(Math.random() * 100); // Luminosidade varia de 0 a 100

    // Atualiza os valores na interface
    hueValueLabel.textContent = hueSlider.value;
    saturationValueLabel.textContent = saturationSlider.value;
    lightnessValueLabel.textContent = lightnessSlider.value;

    // Atualiza a similaridade após reposicionar os sliders
    checkSimilarity();
}




