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

// --- Lógica de exibição/ocultação do campo de parceria ---
document.addEventListener('DOMContentLoaded', function() {
    const estruturaPropriaRadio = document.getElementById('estruturaPropria');
    const estruturaParceriaRadio = document.getElementById('estruturaParceria');
    const parceriaFields = document.getElementById('parceriaFields');
    const linkContratoInput = document.getElementById('Link_Contrato_de_Parceria'); // Note o ID atualizado aqui

    function toggleParceriaFields() {
        if (estruturaParceriaRadio.checked) {
            parceriaFields.style.display = 'block';
            linkContratoInput.setAttribute('required', 'required'); // Torna o campo obrigatório
        } else {
            parceriaFields.style.display = 'none';
            linkContratoInput.removeAttribute('required'); // Remove a obrigatoriedade
            linkContratoInput.value = ''; // Limpa o valor quando escondido
        }
    }

    // Adiciona ouvintes de evento aos radio buttons
    estruturaPropriaRadio.addEventListener('change', toggleParceriaFields);
    estruturaParceriaRadio.addEventListener('change', toggleParceriaFields);

    // Chama a função uma vez ao carregar a página para definir o estado inicial
    toggleParceriaFields();
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
            toggleParceriaFields(); // Esconde o campo de parceria
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