let isManualCusto = false;
let internalData = {
    ultimoAcesso: null,
    diaAtual: null,
    proximoCorte: null,
    diasCorte: 0,
    diasCompra: 0,
    valorDiaCompra: 0
};

function getRefDate() {
    const inputDate = document.getElementById('dataReferencia').value;
    if (!inputDate) return new Date();
    const parts = inputDate.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getRefDateString() {
    const date = getRefDate();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseCurrency(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

function formatCurrencyBR(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDateToBR(dateStr) {
    if (!dateStr || dateStr.length !== 10) return "--";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function toggleMenu() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');
    const isOpen = menu.classList.contains('active');
    menu.classList.toggle('active', !isOpen);
    overlay.style.display = !isOpen ? 'block' : 'none';
}

function handleCurrencyInput(input, triggersAutoMode = false) {
    let value = input.value.replace(/\D/g, "");
    if (value === "") value = "0";
    input.value = formatCurrencyBR(parseFloat(value) / 100);

    if (triggersAutoMode) {
        resetCustoDiario();
    } else {
        saveAndCalc();
    }
}

function handleCustoManual(input) {
    let value = input.value.replace(/\D/g, "");
    if (value === "") value = "0";
    input.value = formatCurrencyBR(parseFloat(value) / 100);

    isManualCusto = true;
    input.classList.add('input-manual');
    saveAndCalc();
}

function handleRecebidoChange() {
    resetCustoDiario();
}

function resetCustoDiario() {
    isManualCusto = false;
    document.getElementById('custoDiarioConfig').classList.remove('input-manual');
    saveAndCalc();
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getPreviousWorkDay(year, month) {
    let targetDate = new Date(year, month, 19);
    while (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
        targetDate.setDate(targetDate.getDate() - 1);
    }
    return targetDate;
}

function calculateNextCorte(currentState) {
    const isRecebido = currentState !== undefined ? currentState : document.getElementById('recebido').checked;
    const refDate = getRefDate();
    let targetYear = refDate.getFullYear();
    let targetMonth = refDate.getMonth();

    if (isRecebido) {
        targetMonth += 1;
        if (targetMonth > 11) { targetMonth = 0; targetYear += 1; }
    }

    const resultDate = getPreviousWorkDay(targetYear, targetMonth);
    return `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}-${String(resultDate.getDate()).padStart(2, '0')}`;
}

function updateDiasCorte() {
    if (!internalData.proximoCorte) return;
    const refDate = getRefDate();
    refDate.setHours(0, 0, 0, 0);
    const [year, month, day] = internalData.proximoCorte.split('-').map(Number);
    const dataCorte = new Date(year, month - 1, day);
    dataCorte.setHours(0, 0, 0, 0);
    internalData.diasCorte = Math.ceil((dataCorte - refDate) / (1000 * 60 * 60 * 24));
}

function updateDiasCompra() {
    const refDateStr = getRefDateString();
    const refDate = getRefDate();
    if (!internalData.proximoCorte) return;

    if (refDateStr < internalData.proximoCorte) {
        let m = refDate.getMonth() - 1;
        let y = refDate.getFullYear();
        if (m < 0) { m = 11; y--; }
        internalData.diasCompra = getDaysInMonth(y, m);
    } else {
        internalData.diasCompra = getDaysInMonth(refDate.getFullYear(), refDate.getMonth());
    }
}

function updateValorDiaCompra() {
    if (!isManualCusto) {
        const vale = parseCurrency(document.getElementById('vale').value);
        const cesta = parseCurrency(document.getElementById('cesta').value);
        internalData.valorDiaCompra = internalData.diasCompra > 0 ? (vale + cesta) / internalData.diasCompra : 0;
        document.getElementById('custoDiarioConfig').value = formatCurrencyBR(internalData.valorDiaCompra);
    } else {
        internalData.valorDiaCompra = parseCurrency(document.getElementById('custoDiarioConfig').value);
    }
}

function calculateFinalResults() {
    const saldo = parseCurrency(document.getElementById('saldo').value);
    const reserva = parseCurrency(document.getElementById('reserva').value);
    const valorDia = internalData.valorDiaCompra;
    const diasCorte = internalData.diasCorte;

    if (valorDia === 0) {
        document.getElementById('diasRestantes').innerText = "0.00";
        document.getElementById('saldoLivre').innerText = "R$ 0,00";
        return;
    }

    const diasRestantes = ((saldo - reserva) / valorDia) - diasCorte;

    document.getElementById('diasRestantes').innerText = diasRestantes.toFixed(2);

    if (diasRestantes > 0) {
        const saldoLivre = (valorDia * diasRestantes) + valorDia;
        document.getElementById('saldoLivre').innerText = formatCurrencyBR(saldoLivre);
        document.getElementById('container-saldo-livre').style.opacity = "1";
    } else {
        document.getElementById('saldoLivre').innerText = "R$ 0,00";
        document.getElementById('container-saldo-livre').style.opacity = "0.4";
    }
}

function applyBusinessRules() {
    const refDate = getRefDate();
    const refDateStr = getRefDateString();
    const realTodayStr = getTodayString();

    document.getElementById('sim-indicator').style.display = (refDateStr !== realTodayStr) ? 'block' : 'none';

    const lastAccessStr = internalData.ultimoAcesso || refDateStr;
    const lastParts = lastAccessStr.split('-');
    const checkboxRecebido = document.getElementById('recebido');

    if (refDate.getFullYear() > parseInt(lastParts[0]) || refDate.getMonth() > (parseInt(lastParts[1]) - 1)) {
        checkboxRecebido.checked = false;
    }

    internalData.proximoCorte = calculateNextCorte(checkboxRecebido.checked);

    if (refDateStr >= internalData.proximoCorte) {
        checkboxRecebido.checked = true;
        internalData.proximoCorte = calculateNextCorte(true);
    }

    updateDiasCorte();
    updateDiasCompra();
    updateValorDiaCompra();
}

function saveAndCalc() {
    internalData.proximoCorte = calculateNextCorte();
    updateDiasCorte();
    updateDiasCompra();
    updateValorDiaCompra();
    calculateFinalResults();
    saveData();
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('label-acesso').innerText = formatDateToBR(internalData.ultimoAcesso);
    document.getElementById('label-dia-atual').innerText = internalData.diaAtual;
    document.getElementById('label-proximo-corte').innerText = formatDateToBR(internalData.proximoCorte);
    document.getElementById('label-corte').innerText = internalData.diasCorte;
    document.getElementById('label-compra').innerText = internalData.diasCompra;
    document.getElementById('label-valor-dia-compra').innerText = formatCurrencyBR(internalData.valorDiaCompra);
}

function saveData() {
    // Captura a data do momento exato do salvamento (saída)
    const dataSaida = getTodayString();

    const data = {
        vale: document.getElementById('vale').value,
        cesta: document.getElementById('cesta').value,
        reserva: document.getElementById('reserva').value,
        saldo: document.getElementById('saldo').value,
        recebido: document.getElementById('recebido').checked,
        custoDiarioManual: document.getElementById('custoDiarioConfig').value,
        isManualCusto: isManualCusto,
        ultimoAcesso: dataSaida // Atualiza com a data de "agora"
    };
    localStorage.setItem('valeFluxControl_v41', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('valeFluxControl_v41');
    const todayStr = getTodayString();

    // Forçamos sempre o input de data para HOJE no carregamento
    document.getElementById('dataReferencia').value = todayStr;

    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('vale').value = data.vale;
        document.getElementById('cesta').value = data.cesta;
        document.getElementById('reserva').value = data.reserva;
        document.getElementById('saldo').value = data.saldo;
        document.getElementById('recebido').checked = data.recebido;

        isManualCusto = data.isManualCusto || false;
        if (isManualCusto) {
            document.getElementById('custoDiarioConfig').value = data.custoDiarioManual;
            document.getElementById('custoDiarioConfig').classList.add('input-manual');
        }

        internalData.ultimoAcesso = data.ultimoAcesso || todayStr;
    } else {
        internalData.ultimoAcesso = todayStr;
    }
}

function toggleAbate(show) {
    const modal = document.getElementById('modal-abate');
    const inputAbate = document.getElementById('valorAbate');
    
    if (show) {
        modal.style.display = 'flex';
        inputAbate.value = "";
        setTimeout(() => inputAbate.focus(), 100); // Delay para garantir o focus
    } else {
        modal.style.display = 'none';
    }
}

function confirmarAbate() {
    const saldoInput = document.getElementById('saldo');
    const abateInput = document.getElementById('valorAbate');
    
    const saldoAtual = parseCurrency(saldoInput.value);
    const valorParaDeduzir = parseCurrency(abateInput.value);
    
    if (valorParaDeduzir > 0) {
        const novoSaldo = Math.max(0, saldoAtual - valorParaDeduzir);
        saldoInput.value = formatCurrencyBR(novoSaldo);
        
        saveAndCalc();
        toggleAbate(false);
    }
}

window.onload = function () {
    loadData();
    internalData.diaAtual = getRefDate().getDate();
    applyBusinessRules();
    calculateFinalResults();
    updateDisplay();
    //saveData();
    // Adiciona EventListeners para eventos antes inline
    document.getElementById('btn-grip').addEventListener('click', toggleMenu);
    document.getElementById('overlay').addEventListener('click', toggleMenu);
    document.getElementById('dataReferencia').addEventListener('change', saveAndCalc);
    document.getElementById('vale').addEventListener('input', (e) => handleCurrencyInput(e.target, true));
    document.getElementById('cesta').addEventListener('input', (e) => handleCurrencyInput(e.target, true));
    document.getElementById('reserva').addEventListener('input', (e) => handleCurrencyInput(e.target));
    document.getElementById('custoDiarioConfig').addEventListener('input', (e) => handleCustoManual(e.target));
    document.getElementById('btn-refresh-custo').addEventListener('click', resetCustoDiario);
    document.getElementById('saldo').addEventListener('input', (e) => handleCurrencyInput(e.target));
    document.getElementById('recebido').addEventListener('change', handleRecebidoChange);

    document.getElementById('btn-open-abate').addEventListener('click', () => toggleAbate(true));
    document.getElementById('btn-cancel-abate').addEventListener('click', () => toggleAbate(false));
    document.getElementById('btn-confirm-abate').addEventListener('click', confirmarAbate);
    
    document.getElementById('valorAbate').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value === "") value = "0";
        e.target.value = formatCurrencyBR(parseFloat(value) / 100);
    });

    // Atalho: Enter no campo de abate confirma
    document.getElementById('valorAbate').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') confirmarAbate();
    });

    document.getElementById('valorAbate').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value === "") value = "0";
        e.target.value = formatCurrencyBR(parseFloat(value) / 100);
    });

    // Fechar ao clicar fora do conteúdo branco do modal
    document.getElementById('modal-abate').addEventListener('click', (e) => {
        if (e.target.id === 'modal-abate') toggleAbate(false);
    });

    //Captura o fechamento/saída do app[cite: 2]
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveData(); // Salva tudo, incluindo o novo 'ultimoAcesso'[cite: 2]
        }
    });
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}