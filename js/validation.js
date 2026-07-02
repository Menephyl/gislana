// ==================== VALIDATION.JS ====================
// Validação em tempo real dos campos do formulário

class FormValidator {
    constructor(scheduleManager) {
        this.scheduleManager = scheduleManager;

        // Elementos do formulário
        this.form = document.getElementById('scheduleForm');
        this.nameInput = document.getElementById('userName');
        this.emailInput = document.getElementById('userEmail');
        this.whatsappInput = document.getElementById('userWhatsapp');
        this.descriptionInput = document.getElementById('userDescription');
        this.confirmBtn = document.getElementById('confirmScheduleBtn');

        // Elementos de feedback
        this.nameValidation = document.getElementById('userNameValidation');
        this.emailValidation = document.getElementById('userEmailValidation');
        this.whatsappValidation = document.getElementById('userWhatsappValidation');
        this.charCount = document.getElementById('charCount');

        this.init();
    }

    init() {
        console.log('✓ FormValidator inicializado');

        // Event listeners
        this.nameInput.addEventListener('input', () => this.validateName());
        this.nameInput.addEventListener('blur', () => this.validateName());

        this.emailInput.addEventListener('input', () => this.validateEmail());
        this.emailInput.addEventListener('blur', () => this.validateEmail());

        this.whatsappInput.addEventListener('input', (e) => this.validateWhatsapp(e));
        this.whatsappInput.addEventListener('blur', () => this.validateWhatsapp());

        this.descriptionInput.addEventListener('input', () => this.validateDescription());
        this.descriptionInput.addEventListener('blur', () => this.validateDescription());

        // Submit do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // ==================== VALIDAÇÃO: NOME ====================
    validateName() {
        const name = this.nameInput.value.trim();

        if (name.length === 0) {
            this.setFieldStatus(this.nameInput, this.nameValidation, null, '');
            this.checkFormValidity();
            return false;
        }

        if (name.length < 3) {
            this.setFieldStatus(this.nameInput, this.nameValidation, false, 'Mínimo 3 caracteres');
            this.checkFormValidity();
            return false;
        }

        if (name.length > 100) {
            this.setFieldStatus(this.nameInput, this.nameValidation, false, 'Máximo 100 caracteres');
            this.checkFormValidity();
            return false;
        }

        // Validar se contém apenas letras e espaços
        const validNamePattern = /^[a-záéíóúâêôãõç\s]+$/i;
        if (!validNamePattern.test(name)) {
            this.setFieldStatus(this.nameInput, this.nameValidation, false, 'Apenas letras permitidas');
            this.checkFormValidity();
            return false;
        }

        this.setFieldStatus(this.nameInput, this.nameValidation, true, 'Nome válido');
        this.checkFormValidity();
        return true;
    }

    // ==================== VALIDAÇÃO: EMAIL ====================
    validateEmail() {
        const email = this.emailInput.value.trim();

        if (email.length === 0) {
            this.setFieldStatus(this.emailInput, this.emailValidation, null, '');
            this.checkFormValidity();
            return false;
        }

        // Regex para validar email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailPattern.test(email);

        if (!isValid) {
            this.setFieldStatus(this.emailInput, this.emailValidation, false, 'Email inválido');
            this.checkFormValidity();
            return false;
        }

        this.setFieldStatus(this.emailInput, this.emailValidation, true, 'Email válido');
        this.checkFormValidity();
        return true;
    }

    // ==================== VALIDAÇÃO: WHATSAPP ====================
    validateWhatsapp(event) {
        let whatsapp = this.whatsappInput.value;

        // Remove caracteres não numéricos para contar
        const numbersOnly = whatsapp.replace(/\D/g, '');

        // Aplica máscara automática
        if (event && event.inputType === 'insertText') {
            whatsapp = this.formatWhatsapp(numbersOnly);
            this.whatsappInput.value = whatsapp;
        }

        if (whatsapp.length === 0) {
            this.setFieldStatus(this.whatsappInput, this.whatsappValidation, null, '');
            this.checkFormValidity();
            return false;
        }

        // Valida comprimento (11 dígitos para BR)
        if (numbersOnly.length < 11) {
            this.setFieldStatus(this.whatsappInput, this.whatsappValidation, false, 'Número incompleto (11 dígitos)');
            this.checkFormValidity();
            return false;
        }

        if (numbersOnly.length > 11) {
            this.setFieldStatus(this.whatsappInput, this.whatsappValidation, false, 'Número inválido');
            this.checkFormValidity();
            return false;
        }

        this.setFieldStatus(this.whatsappInput, this.whatsappValidation, true, 'WhatsApp válido');
        this.checkFormValidity();
        return true;
    }

    // Formata WhatsApp: (XX) 9XXXX-XXXX
    formatWhatsapp(numbers) {
        numbers = numbers.replace(/\D/g, '');

        if (numbers.length === 0) return '';
        if (numbers.length <= 2) return `(${numbers}`;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;

        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }

    // ==================== VALIDAÇÃO: DESCRIÇÃO ====================
    validateDescription() {
        const description = this.descriptionInput.value.trim();
        const length = description.length;

        // Atualiza contador
        this.charCount.textContent = length;

        if (length === 0) {
            this.setFieldStatus(this.descriptionInput, null, null, '');
            this.checkFormValidity();
            return false;
        }

        if (length < 10) {
            this.setFieldStatus(this.descriptionInput, null, false, `Mínimo 10 caracteres (${length}/10)`);
            this.checkFormValidity();
            return false;
        }

        if (length > 500) {
            this.setFieldStatus(this.descriptionInput, null, false, 'Máximo 500 caracteres');
            this.checkFormValidity();
            return false;
        }

        this.setFieldStatus(this.descriptionInput, null, true, `${length}/500 caracteres`);
        this.checkFormValidity();
        return true;
    }

    // ==================== HELPER: SET FIELD STATUS ====================
    setFieldStatus(input, feedbackElement, isValid, message) {
        // Remove classes anteriores
        input.classList.remove('valid', 'invalid');

        if (feedbackElement) {
            feedbackElement.classList.remove('success', 'error');
            feedbackElement.textContent = '';
        }

        if (isValid === null) {
            // Vazio - sem feedback
            return;
        }

        if (isValid) {
            input.classList.add('valid');
            if (feedbackElement) {
                feedbackElement.classList.add('success');
                feedbackElement.textContent = message;
            }
        } else {
            input.classList.add('invalid');
            if (feedbackElement) {
                feedbackElement.classList.add('error');
                feedbackElement.textContent = message;
            }
        }

        // NÃO chama checkFormValidity aqui - será chamado nas funções de validação
    }

    // ==================== VERIFICA VALIDAÇÃO COMPLETA ====================
    checkFormValidity() {
        // Validação do Nome
        const name = this.nameInput.value.trim();
        const isNameValid = name.length >= 3 &&
            name.length <= 100 &&
            /^[a-záéíóúâêôãõç\s]+$/i.test(name);

        // Validação do Email
        const email = this.emailInput.value.trim();
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        // Validação do WhatsApp
        const whatsapp = this.whatsappInput.value.replace(/\D/g, '');
        const isWhatsappValid = whatsapp.length === 11;

        // Validação da Descrição
        const description = this.descriptionInput.value.trim();
        const isDescriptionValid = description.length >= 10 && description.length <= 500;

        // Form é válido apenas se TODOS os campos estão válidos
        const isFormValid = isNameValid && isEmailValid && isWhatsappValid && isDescriptionValid;

        // Habilita botão apenas se tudo válido
        this.confirmBtn.disabled = !isFormValid;

        console.log('Form Validity:', {
            name: isNameValid,
            email: isEmailValid,
            whatsapp: isWhatsappValid,
            description: isDescriptionValid,
            formValid: isFormValid,
            buttonDisabled: this.confirmBtn.disabled
        });
    }

    // ==================== SUBMIT DO FORMULÁRIO ====================
    handleSubmit(e) {
        e.preventDefault();

        // Validações finais
        if (!this.validateName() || !this.validateEmail() || !this.validateWhatsapp() || !this.validateDescription()) {
            alert('Por favor, corrija os erros no formulário');
            return;
        }

        // Salva dados no scheduleManager
        this.scheduleManager.saveFormData({
            name: this.nameInput.value.trim(),
            email: this.emailInput.value.trim(),
            whatsapp: this.whatsappInput.value.trim(),
            description: this.descriptionInput.value.trim()
        });

        // Simula processamento de pagamento
        this.processPayment();
    }

    // ==================== PROCESSAMENTO DE PAGAMENTO ====================
    processPayment() {
        // Desabilita botão durante processamento
        this.confirmBtn.disabled = true;
        this.confirmBtn.textContent = '⏳ Processando Pagamento...';

        // Simula delay do pagamento (em produção, integra com Stripe/PayPal)
        setTimeout(() => {
            console.log('✓ Pagamento processado');
            console.log('Dados do agendamento:', this.scheduleManager.getScheduleData());

            // Vai para step 3 (PIX)
            this.scheduleManager.goToStep3();

            // Restaura botão
            this.confirmBtn.disabled = false;
            this.confirmBtn.textContent = '✓ CONFIRMAR AGENDAMENTO (R$ 50)';

            // Envia dados para o servidor (opcional)
            this.sendToServer();
        }, 1500);
    }

    // ==================== ENVIAR PARA SERVIDOR ====================
    sendToServer() {
        const data = this.scheduleManager.getScheduleData();

        // Em produção, faça uma requisição POST
        /*
        fetch('/api/agendamentos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
          console.log('✓ Agendamento salvo:', result);
          
          // Enviar email de confirmação
          this.sendConfirmationEmail(data.email);
        })
        .catch(error => console.error('Erro:', error));
        */

        console.log('📧 Dados prontos para enviar ao servidor:', data);
    }

    // ==================== ENVIAR EMAIL DE CONFIRMAÇÃO ====================
    sendConfirmationEmail(email) {
        // Em produção, integre com serviço de email (SendGrid, Nodemailer, etc)
        console.log(`✓ Email de confirmação seria enviado para ${email}`);
    }
}

// ==================== INICIALIZAR VALIDADOR ====================
document.addEventListener('DOMContentLoaded', () => {
    const maxRetries = 10;
    let retries = 0;

    const waitForScheduleManager = setInterval(() => {
        if (window.scheduleManager) {
            clearInterval(waitForScheduleManager);
            window.formValidator = new FormValidator(window.scheduleManager);
            console.log('✓ FormValidator iniciado com sucesso');
        } else if (retries++ >= maxRetries) {
            clearInterval(waitForScheduleManager);
            console.error('❌ ScheduleManager não foi inicializado');
        }
    }, 100);
});