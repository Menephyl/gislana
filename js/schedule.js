// ==================== SCHEDULE.JS ====================
// Gerencia calendário, seleção de data/hora, navegação entre steps

class ScheduleManager {
    constructor() {
        // Elementos do DOM
        this.modal = document.getElementById('scheduleModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.closeBtn = document.getElementById('closeScheduleBtn');

        // Buttons
        this.openScheduleBtns = document.querySelectorAll('[id*="openScheduleBtn"]');
        this.nextStepBtn = document.getElementById('nextStepBtn');
        this.backStepBtn = document.getElementById('backStepBtn');
        this.confirmScheduleBtn = document.getElementById('confirmScheduleBtn');
        this.closeConfirmationBtn = document.getElementById('closeConfirmationBtn');

        // Calendar elements
        this.calendarDays = document.getElementById('calendarDays');
        this.currentMonthDisplay = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');

        // Times elements
        this.timesSection = document.getElementById('timesSection');
        this.timesGrid = document.getElementById('timesGrid');
        this.selectedDateDisplay = document.getElementById('selectedDateDisplay');

        // Steps
        this.step1 = document.getElementById('step1');
        this.step2 = document.getElementById('step2');
        this.step3 = document.getElementById('step3');

        // Form
        this.scheduleForm = document.getElementById('scheduleForm');

        // Data state
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.formData = {};

        // Número WhatsApp da Gislana
        this.whatsappNumber = '553291640120';

        // Horários ocupados (simulado)
        this.bookedSlots = [
            '2024-01-15-09:00',
            '2024-01-15-14:00',
            '2024-01-16-10:00',
            '2024-01-18-13:00',
            '2024-01-18-15:00'
        ];

        this.init();
    }

    init() {
        console.log('✓ ScheduleManager inicializado');

        // ==================== EVENT LISTENERS - MODAL ====================
        if (this.openScheduleBtns && this.openScheduleBtns.length > 0) {
            this.openScheduleBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal();
                });
            });
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', () => this.closeModal());
        }

        // ==================== EVENT LISTENERS - CALENDAR ====================
        if (this.prevMonthBtn) {
            this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        }

        if (this.nextMonthBtn) {
            this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
        }

        // ==================== EVENT LISTENERS - NAVIGATION ====================
        if (this.nextStepBtn) {
            this.nextStepBtn.addEventListener('click', () => this.goToStep2());
        }

        if (this.backStepBtn) {
            this.backStepBtn.addEventListener('click', () => this.goToStep1());
        }

        if (this.closeConfirmationBtn) {
            this.closeConfirmationBtn.addEventListener('click', () => this.closeModal());
        }

        // ==================== EVENT LISTENERS - FORM ====================
        if (this.scheduleForm) {
            this.scheduleForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Counter de caracteres
        const descriptionTextarea = document.getElementById('userDescription');
        if (descriptionTextarea) {
            descriptionTextarea.addEventListener('input', () => {
                const charCount = document.getElementById('charCount');
                if (charCount) {
                    charCount.textContent = descriptionTextarea.value.length;
                }
            });
        }

        // ==================== EVENT LISTENERS - WHATSAPP ====================
        const whatsappBtn = document.getElementById('whatsappBtn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => this.sendWhatsappMessage());
        }

        // Botão voltar no step 3
        const backBtn2 = document.getElementById('backStepBtn2');
        if (backBtn2) {
            backBtn2.addEventListener('click', () => {
                if (this.step3) this.step3.style.display = 'none';
                if (this.step2) this.step2.style.display = 'block';
            });
        }

        // Previne fechar ao clicar na modal
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Renderiza calendário inicial
        this.renderCalendar();
    }

    // ==================== MODAL ====================
    openModal() {
        if (!this.modal) return;
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.resetModal();
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetModal();
    }

    resetModal() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.formData = {};

        if (this.step1) this.step1.style.display = 'block';
        if (this.step2) this.step2.style.display = 'none';
        if (this.step3) this.step3.style.display = 'none';

        if (this.timesSection) this.timesSection.style.display = 'none';
        if (this.nextStepBtn) this.nextStepBtn.disabled = true;

        this.renderCalendar();

        if (this.scheduleForm) this.scheduleForm.reset();
    }

    // ==================== CALENDÁRIO ====================
    renderCalendar() {
        if (!this.calendarDays) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Atualiza título do mês
        const monthName = this.getMonthName(month);
        if (this.currentMonthDisplay) {
            this.currentMonthDisplay.textContent = `${monthName} ${year}`;
        }

        // Limpa dias anteriores
        this.calendarDays.innerHTML = '';

        // Primeiro dia do mês
        const firstDay = new Date(year, month, 1).getDay();

        // Número de dias no mês
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Cria cells vazias para dias da semana anterior
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day disabled';
            this.calendarDays.appendChild(emptyCell);
        }

        // Hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Cria botões para cada dia do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = this.formatDate(date);
            const dayBtn = document.createElement('button');
            dayBtn.className = 'calendar-day';
            dayBtn.textContent = day;
            dayBtn.type = 'button';

            // Desabilita finais de semana (sábado=6, domingo=0)
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            // Desabilita datas passadas
            const isPast = date < today;

            if (isWeekend || isPast) {
                dayBtn.classList.add('disabled');
                dayBtn.disabled = true;
            } else {
                dayBtn.classList.add('available');
                dayBtn.dataset.date = dateString;
                dayBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.selectDate(dateString, day, month, year);
                });
            }

            this.calendarDays.appendChild(dayBtn);
        }
    }

    selectDate(dateString, day, month, year) {
        // Remove seleção anterior
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Marca novo selecionado
        document.querySelector(`[data-date="${dateString}"]`)?.classList.add('selected');

        this.selectedDate = dateString;
        this.selectedTime = null;

        // Renderiza horários para essa data
        this.renderTimes(dateString, day, month, year);

        // Mostra seção de horários
        if (this.timesSection) {
            this.timesSection.style.display = 'block';
        }

        if (this.nextStepBtn) {
            this.nextStepBtn.disabled = true;
        }
    }

    renderTimes(dateString, day, month, year) {
        if (!this.timesGrid) return;

        const monthName = this.getMonthName(month);
        const dayName = this.getDayName(new Date(year, month, day).getDay());

        if (this.selectedDateDisplay) {
            this.selectedDateDisplay.textContent = `${dayName}, ${day} de ${monthName}`;
        }

        this.timesGrid.innerHTML = '';

        // Horários: 8h a 17h
        const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

        hours.forEach(hour => {
            const timeString = `${String(hour).padStart(2, '0')}:00`;
            const slotId = `${dateString}-${timeString}`;
            const timeBtn = document.createElement('button');
            timeBtn.className = 'time-slot';
            timeBtn.textContent = `${hour}h`;
            timeBtn.type = 'button';
            timeBtn.dataset.time = timeString;

            // Verifica se horário está ocupado
            const isBooked = this.bookedSlots.includes(slotId);

            if (isBooked) {
                timeBtn.classList.add('booked');
                timeBtn.disabled = true;
            } else {
                timeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.selectTime(timeString, timeBtn);
                });
            }

            this.timesGrid.appendChild(timeBtn);
        });
    }

    selectTime(timeString, element) {
        // Remove seleção anterior
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Marca novo selecionado
        element.classList.add('selected');
        this.selectedTime = timeString;

        // Habilita botão "PRÓXIMO"
        if (this.nextStepBtn) {
            this.nextStepBtn.disabled = false;
        }

        // Atualiza resumo
        this.updateSummary();
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    // ==================== NAVEGAÇÃO ENTRE STEPS ====================
    goToStep2() {
        if (!this.selectedDate || !this.selectedTime) {
            alert('Por favor, selecione uma data e horário');
            return;
        }

        if (this.step1) this.step1.style.display = 'none';
        if (this.step2) this.step2.style.display = 'block';

        this.updateSummary();
    }

    goToStep1() {
        if (this.step2) this.step2.style.display = 'none';
        if (this.step1) this.step1.style.display = 'block';
    }

    goToStep3() {
        if (this.step1) this.step1.style.display = 'none';
        if (this.step2) this.step2.style.display = 'none';
        if (this.step3) this.step3.style.display = 'block';

        // Preenche dados de confirmação
        this.populateConfirmation();
    }

    // ==================== ATUALIZA RESUMO ====================
    updateSummary() {
        if (this.selectedDate && this.selectedTime) {
            const [year, month, day] = this.selectedDate.split('-').map(Number);
            const monthName = this.getMonthName(month - 1);
            const dayName = this.getDayName(new Date(year, month - 1, day).getDay());

            const summaryDate = document.getElementById('summaryDate');
            const summaryTime = document.getElementById('summaryTime');

            if (summaryDate) {
                summaryDate.textContent = `${dayName}, ${day} de ${monthName}`;
            }

            if (summaryTime) {
                summaryTime.textContent = this.selectedTime;
            }
        }
    }

    // ==================== VALIDAÇÃO E SUBMISSÃO DO FORMULÁRIO ====================
    handleFormSubmit(e) {
        e.preventDefault();

        // Coleta dados do formulário
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userWhatsapp = document.getElementById('userWhatsapp');
        const userDescription = document.getElementById('userDescription');

        if (!userName || !userEmail || !userWhatsapp || !userDescription) {
            alert('Erro: Campos do formulário não encontrados');
            return;
        }

        const name = userName.value.trim();
        const email = userEmail.value.trim();
        const whatsapp = userWhatsapp.value.trim();
        const description = userDescription.value.trim();

        // Validação básica
        if (!name || name.length < 3) {
            alert('Por favor, digite seu nome completo (mínimo 3 caracteres)');
            userName.focus();
            return;
        }

        if (!email || !this.isValidEmail(email)) {
            alert('Por favor, digite um email válido');
            userEmail.focus();
            return;
        }

        if (!whatsapp || whatsapp.length < 10) {
            alert('Por favor, digite um WhatsApp válido com DDD');
            userWhatsapp.focus();
            return;
        }

        if (!description || description.length < 10) {
            alert('Por favor, descreva o que deseja trabalhar (mínimo 10 caracteres)');
            userDescription.focus();
            return;
        }

        // Salva dados
        this.formData = {
            name,
            email,
            whatsapp,
            description,
            timestamp: new Date().toISOString()
        };

        console.log('✓ Formulário validado:', this.formData);

        // Vai para Step 3 (Confirmação)
        this.goToStep3();
    }

    // ==================== VALIDAÇÕES ====================
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ==================== CONFIRMAÇÃO ====================
    populateConfirmation() {
        if (!this.selectedDate) return;

        const [year, month, day] = this.selectedDate.split('-').map(Number);
        const monthName = this.getMonthName(month - 1);
        const dayName = this.getDayName(new Date(year, month - 1, day).getDay());

        // Preenche dados pessoais
        const confirmName = document.getElementById('confirmName');
        const confirmEmail = document.getElementById('confirmEmail');
        const confirmWhatsapp = document.getElementById('confirmWhatsapp');
        const confirmDate = document.getElementById('confirmDate');
        const confirmTime = document.getElementById('confirmTime');
        const confirmDescription = document.getElementById('confirmDescription');

        if (confirmName) confirmName.textContent = this.formData.name || '-';
        if (confirmEmail) confirmEmail.textContent = this.formData.email || '-';
        if (confirmWhatsapp) confirmWhatsapp.textContent = this.formData.whatsapp || '-';
        if (confirmDate) confirmDate.textContent = `${dayName}, ${day} de ${monthName}`;
        if (confirmTime) confirmTime.textContent = this.selectedTime || '-';
        if (confirmDescription) confirmDescription.textContent = this.formData.description || '-';

        console.log('✓ Confirmação populada com dados');
    }

    // ==================== GERA E ENVIA MENSAGEM WHATSAPP ====================
    sendWhatsappMessage() {
        if (!this.selectedDate || !this.selectedTime) {
            alert('Erro: Data ou horário não selecionados');
            return;
        }

        const [year, month, day] = this.selectedDate.split('-').map(Number);
        const monthName = this.getMonthName(month - 1);
        const dayName = this.getDayName(new Date(year, month - 1, day).getDay());
        const dateFormatted = `${dayName}, ${day} de ${monthName}`;
        const time = this.selectedTime;

        // Formata o WhatsApp (remove caracteres especiais)
        const whatsappFormatted = this.formData.whatsapp.replace(/\D/g, '');

        // Mensagem formatada para WhatsApp
        const messageText = `🟣 *CONFIRMAÇÃO DE AGENDAMENTO* 🟣

Olá Gislana! 💜


Vim pelo site para confirmar meu agendamento de sessão.

*👤 DADOS PESSOAIS:*
Nome: ${this.formData.name}
Email: ${this.formData.email}
WhatsApp: ${this.formData.whatsapp}

*📅 HORÁRIO DA SESSÃO:*
Data: ${dateFormatted}
Horário: ${time}h

*🎯 O QUE VOU TRABALHAR:*
${this.formData.description}

*💰 SOBRE O ORÇAMENTO:*
Qual é o valor da sessão? Você oferece opções de pagamento ou consulta social?

Aguardo sua confirmação! 🙏💜`;

        // Encoda a mensagem para URL (preserva quebras de linha)
        const encodedMessage = encodeURIComponent(messageText);

        // URL do WhatsApp
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

        console.log('✓ Mensagem WhatsApp gerada');
        console.log('📱 Enviando para:', this.whatsappNumber);
        console.log('📝 Mensagem:', messageText);

        // Abre WhatsApp em nova aba
        window.open(whatsappUrl, '_blank');

        // Mostra mensagem de sucesso
        this.showSuccessMessage();

        // Fecha o modal após 2 segundos
        setTimeout(() => {
            this.closeModal();
        }, 2000);
    }

    // ==================== MENSAGEM DE SUCESSO ====================
    showSuccessMessage() {
        // Cria um overlay de sucesso temporário
        const successOverlay = document.createElement('div');
        successOverlay.className = 'success-message';
        successOverlay.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✨</div>
                <h3>Mensagem Enviada!</h3>
                <p>Sua solicitação foi enviada para o WhatsApp da Gislana 💜</p>
                <p class="success-subtitle">Aguarde a confirmação. Você será contatada em breve!</p>
            </div>
        `;

        document.body.appendChild(successOverlay);

        // Anima entrada
        setTimeout(() => {
            successOverlay.classList.add('show');
        }, 100);

        // Remove após 3 segundos
        setTimeout(() => {
            successOverlay.classList.remove('show');
            setTimeout(() => {
                successOverlay.remove();
            }, 300);
        }, 3000);
    }

    // ==================== UTILS ====================
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getMonthName(monthIndex) {
        const months = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro'
        ];
        return months[monthIndex];
    }

    getDayName(dayIndex) {
        const days = [
            'Domingo',
            'Segunda',
            'Terça',
            'Quarta',
            'Quinta',
            'Sexta',
            'Sábado'
        ];
        return days[dayIndex];
    }

    // ==================== RETORNA DADOS PARA ENVIAR AO SERVIDOR ====================
    getScheduleData() {
        return {
            date: this.selectedDate,
            time: this.selectedTime,
            name: this.formData.name,
            email: this.formData.email,
            whatsapp: this.formData.whatsapp,
            description: this.formData.description,
            createdAt: new Date().toISOString()
        };
    }
}

// ==================== INICIALIZA O GERENCIADOR DE AGENDAMENTO ====================
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleManager = new ScheduleManager();
    console.log('✓ ScheduleManager disponível globalmente');
});