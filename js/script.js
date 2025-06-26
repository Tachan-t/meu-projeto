/**
 * @file Lógica de envio do formulário para o Google Apps Script.
 * @author Parceiro de Programacao
 */

// *******************************************************************
// IMPORTANTE: COLOQUE O URL DO APLICATIVO DA WEB DO SEU APPS SCRIPT AQUI!
// Você obteve este URL no Passo 3 da configuração do Apps Script.
// Exemplo: 'https://script.google.com/macros/s/AKfycBx.../exec'
// *******************************************************************
const appScriptURL = 'https://script.google.com/macros/s/AKfycbxG9_8_zZQYxCKYlDUIrom3s2XZMqd5kKAZ5UrWMBtkbOBRIP02f6TXkFSroruLWFKv6A/exec'; 

// URL da API de polos
const API_POLOS_URL = 'https://api-polos.unifecaf.edu.br/api/v1/routine/polosativoscomsupervisores';

let listaPolos = []; // Para armazenar os dados dos polos da API

// Mapeamento dos campos do formulário para as chaves da API
// ESTES NOMES AGORA ESTÃO CONFORMES O JSON REAL QUE VOCÊ FORNECEU E SUAS ÚLTIMAS SOLICITAÇÕES!
const mapeamentoCampos = {
    'Email': 'pol_email', // Email do Polo
    'Nome do Responsavel pelo Polo': 'pol_coordinator_name', // AJUSTADO para 'pol_coordinator_name'
    'Telefone do Responsavel pelo Polo': 'pol_phone_number', // AJUSTADO para 'pol_phone_number'
    'Email do Responsavel pelo Polo': 'pol_coordinator_email', // AJUSTADO para 'pol_coordinator_email'
    'Nome e Numero do Polo': 'pol_name', // Nome do Polo
    'CNPJ do Polo': 'pol_cnpj', // CNPJ do Polo
    'Endereco do Polo': 'pol_address' // Endereço do Polo. Usaremos também 'pol_address_complement' e 'pol_district'
};


// Função para lidar com a exibição/ocultação do campo de parceria (movida para fora do DOMContentLoaded)
function toggleParceriaFields() {
    const parceriaFields = document.getElementById('parceriaFields');
    const linkContratoInput = document.getElementById('Link_Contrato_de_Parceria'); 
    const estruturaParceriaRadio = document.getElementById('estruturaParceria'); 

    if (estruturaParceriaRadio.checked) {
        parceriaFields.style.display = 'block';
        linkContratoInput.setAttribute('required', 'required');
    } else {
        parceriaFields.style.display = 'none';
        linkContratoInput.removeAttribute('required');
        linkContratoInput.value = ''; 
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    const estruturaPropriaRadio = document.getElementById('estruturaPropria');
    const estruturaParceriaRadio = document.getElementById('estruturaParceria');

    const selectPolo = document.getElementById('selecionarPolo');
    const carregandoPolosMsg = document.getElementById('carregandoPolos');
    const erroCarregamentoPolosMsg = document.getElementById('erroCarregamentoPolos');

    // Adiciona ouvintes de evento aos radio buttons
    estruturaPropriaRadio.addEventListener('change', toggleParceriaFields);
    estruturaParceriaRadio.addEventListener('change', toggleParceriaFields);

    // Chama a função uma vez ao carregar a página para definir o estado inicial
    toggleParceriaFields();

    // --- Carregamento e Preenchimento dos Polos da API ---
    async function carregarPolos() {
        console.log('Tentando carregar polos da API...');
        try {
            const response = await fetch(API_POLOS_URL);
            console.log('Resposta da API recebida:', response);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const rawData = await response.json(); // Dados brutos da API
            console.log('Dados da API (RAW JSON):', rawData); 
            
            // Acessa o array de polos que está dentro do primeiro elemento do array retornado pela API
            const data = rawData[0]; 
            console.log('Dados da API (Polos extraídos - array de 265 objetos):', data); 
            
            if (!Array.isArray(data)) { 
                console.error('Erro: O primeiro elemento da resposta da API não é um array de polos. Verifique a estrutura da API.');
                erroCarregamentoPolosMsg.textContent = 'Erro: Formato de dados inesperado da API (esperava array de polos).';
                erroCarregamentoPolosMsg.style.display = 'block';
                selectPolo.innerHTML = '<option value="">Não foi possível carregar os polos</option>';
                selectPolo.disabled = true;
                return; 
            }

            listaPolos = data; // Armazena a lista completa de polos

            if (listaPolos.length === 0) {
                selectPolo.innerHTML = '<option value="">Nenhum polo ativo encontrado.</option>';
                console.warn('API retornou uma lista vazia de polos.');
            } else {
                selectPolo.innerHTML = '<option value="">-- Selecione um Polo --</option>'; // Limpa opções e adiciona default
                listaPolos.forEach((polo, index) => {
                    // Verificando as propriedades críticas antes de usar
                    if (polo.pol_name && polo.pol_mentor_id_reference) { 
                        const option = document.createElement('option');
                        option.value = polo.pol_mentor_id_reference; // Usando o ID de referência do mentor como valor único
                        option.textContent = polo.pol_name; // Exibe o nome do polo
                        selectPolo.appendChild(option);
                    } else {
                        // Se estiver faltando, registre no console para depuração
                        console.warn(`Polo ${index} ignorado: faltando 'pol_name' ou 'pol_mentor_id_reference'.`, polo);
                    }
                });
            }

            carregandoPolosMsg.style.display = 'none'; // Esconde a mensagem de carregamento
            erroCarregamentoPolosMsg.style.display = 'none'; // Esconde mensagem de erro
            selectPolo.disabled = false; // Habilita o select
        } catch (error) {
            console.error('Erro ao carregar polos da API:', error);
            carregandoPolosMsg.style.display = 'none';
            erroCarregamentoPolosMsg.textContent = 'Erro ao carregar polos: ' + error.message;
            erroCarregamentoPolosMsg.style.display = 'block'; // Exibe mensagem de erro
            selectPolo.innerHTML = '<option value="">Não foi possível carregar os polos</option>';
            selectPolo.disabled = true; // Desabilita o select em caso de erro
        }
    }

    // Chama a função para carregar os polos assim que a página carrega
    carregarPolos();

    // --- Lógica de pré-preenchimento ao selecionar um polo ---
    selectPolo.addEventListener('change', function() {
        const poloIdSelecionado = this.value;
        const poloSelecionado = listaPolos.find(polo => polo.pol_mentor_id_reference == poloIdSelecionado);

        if (poloSelecionado) {
            console.log('Polo selecionado para preencher:', poloSelecionado); 

            // Preenche os campos do formulário com base no mapeamento
            document.getElementById('Email').value = poloSelecionado[mapeamentoCampos['Email']] || '';
            document.getElementById('Nome_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Nome do Responsavel pelo Polo']] || '';
            document.getElementById('Telefone_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Telefone do Responsavel pelo Polo']] || '';
            document.getElementById('Email_do_Responsavel_pelo_Polo').value = poloSelecionado[mapeamentoCampos['Email do Responsavel pelo Polo']] || '';
            document.getElementById('Nome_e_Numero_do_Polo').value = poloSelecionado[mapeamentoCampos['Nome e Numero do Polo']] || '';
            document.getElementById('CNPJ_do_Polo').value = poloSelecionado[mapeamentoCampos['CNPJ do Polo']] || '';
            
            // Para o endereço, concatenamos os campos da API para um endereço mais completo
            let enderecoCompleto = poloSelecionado[mapeamentoCampos['Endereco do Polo']] || '';
            if (poloSelecionado.pol_address_complement) { 
                enderecoCompleto += ', ' + poloSelecionado.pol_address_complement;
            }
            if (poloSelecionado.pol_district) { 
                enderecoCompleto += ' - ' + poloSelecionado.pol_district;
            }
            document.getElementById('Endereco_do_Polo').value = enderecoCompleto;
        } else {
            // Limpa os campos se nada for selecionado ou se a opção padrão for escolhida
            document.getElementById('Email').value = '';
            document.getElementById('Nome_do_Responsavel_pelo_Polo').value = '';
            document.getElementById('Telefone_do_Responsavel_pelo_Polo').value = '';
            document.getElementById('Email_do_Responsavel_pelo_Polo').value = '';
            document.getElementById('Nome_e_Numero_do_Polo').value = '';
            document.getElementById('CNPJ_do_Polo').value = '';
            document.getElementById('Endereco_do_Polo').value = '';
        }
    });
});

// --- Lógica de envio do formulário ---
document.getElementById('myForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário (recarregar a página)

    const form = event.target;
    const formData = new FormData(form);
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Limpa e esconde mensagens anteriores
    feedbackMessage.textContent = '';
    feedbackMessage.className = '';
    feedbackMessage.style.display = 'none';

    // Desabilitar o botão para evitar múltiplos envios
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        const response = await fetch(appScriptURL, {
            method: 'POST',
            body: formData // Envia os dados do formulário
        });

        if (response.ok) {
            const data = await response.text(); // Lê a resposta de texto do Apps Script
            feedbackMessage.textContent = "Dados enviados com sucesso! " + data;
            feedbackMessage.className = 'success';
            form.reset(); // Limpa o formulário após o envio
            // Reseta o estado dos campos de parceria após o reset do formulário
            document.getElementById('estruturaPropria').checked = true; // Volta para a opção padrão
            document.getElementById('parceriaFields').style.display = 'none'; // Esconde o campo de parceria
            document.getElementById('Link_Contrato_de_Parceria').removeAttribute('required'); // Remove a obrigatoriedade
            document.getElementById('Link_Contrato_de_Parceria').value = '';

            // Também reseta a seleção do polo e limpa os campos preenchidos pela API
            const selectPolo = document.getElementById('selecionarPolo');
            selectPolo.value = ''; // Define a opção padrão do select
            // Dispara um evento 'change' no select para limpar os campos, caso a API não seja recarregada
            const changeEvent = new Event('change');
            selectPolo.dispatchEvent(changeEvent);

        } else {
            // Se a resposta não for OK (ex: erro 500 no Apps Script)
            const errorText = await response.text(); // Tenta ler o texto do erro
            throw new Error(`Erro ao enviar dados. Status: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        // Captura erros de rede ou outros erros no fetch
        feedbackMessage.textContent = "Erro ao enviar os dados: " + error.message;
        feedbackMessage.className = 'error';
        console.error('Erro:', error);
    } finally {
        // Sempre exibe a mensagem (sucesso ou erro)
        feedbackMessage.style.display = 'block';
        submitButton.disabled = false; // Reabilita o botão
        submitButton.textContent = 'Enviar Cadastro do Polo'; // Restaura o texto do botão
    }
});
