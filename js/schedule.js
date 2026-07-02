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
        this.closeSuccessBtn = document.getElementById('closeSuccessBtn');

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
        this.step4 = document.getElementById('step4');

        // Form
        this.scheduleForm = document.getElementById('scheduleForm');

        // PIX elements
        this.copyPixBtn = document.getElementById('copyPixBtn');
        this.whatsappLink = document.getElementById('whatsappLink');

        // Data state
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.formData = {};

        // Horários ocupados (simulado - em produção vem do backend)
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

        // Event listeners - Modal
        this.openScheduleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.openModal());
        });

        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', () => this.closeModal());

        // Event listeners - Calendar
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());

        // Event listeners - Navigation
        this.nextStepBtn.addEventListener('click', () => this.goToStep2());
        this.backStepBtn.addEventListener('click', () => this.goToStep1());
        this.closeConfirmationBtn.addEventListener('click', () => this.closeModal());
        this.closeSuccessBtn?.addEventListener('click', () => this.closeModal());

        // Event listeners - PIX
        this.copyPixBtn?.addEventListener('click', () => this.copyPixKey());
        this.whatsappLink?.addEventListener('click', () => this.handleWhatsappClick());

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
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.resetModal();
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.resetModal();
    }

    resetModal() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.formData = {};

        this.step1.style.display = 'block';
        this.step2.style.display = 'none';
        this.step3.style.display = 'none';
        if (this.step4) {
            this.step4.style.display = 'none';
        }

        this.timesSection.style.display = 'none';
        this.nextStepBtn.disabled = true;

        this.renderCalendar();
        this.scheduleForm.reset();
    }

    // ==================== CALENDÁRIO ====================
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Atualiza título do mês
        const monthName = this.getMonthName(month);
        this.currentMonthDisplay.textContent = `${monthName} ${year}`;

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

                dayBtn.addEventListener('click', () => this.selectDate(dateString, day, month, year));
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
        event.target.classList.add('selected');

        this.selectedDate = dateString;
        this.selectedTime = null; // Reset tempo quando muda data

        // Renderiza horários para essa data
        this.renderTimes(dateString, day, month, year);

        // Mostra seção de horários
        this.timesSection.style.display = 'block';
        this.nextStepBtn.disabled = true; // Desabilita até escolher hora
    }

    renderTimes(dateString, day, month, year) {
        const monthName = this.getMonthName(month);
        const dayName = this.getDayName(new Date(year, month, day).getDay());

        this.selectedDateDisplay.textContent = `${dayName}, ${day} de ${monthName}`;

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
                timeBtn.addEventListener('click', () => this.selectTime(timeString, timeBtn));
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
        this.nextStepBtn.disabled = false;

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

        this.step1.style.display = 'none';
        this.step2.style.display = 'block';

        this.updateSummary();
    }

    goToStep1() {
        this.step2.style.display = 'none';
        this.step1.style.display = 'block';
    }

    goToStep3() {
        this.step1.style.display = 'none';
        this.step2.style.display = 'none';
        this.step3.style.display = 'block';
        if (this.step4) {
            this.step4.style.display = 'none';
        }

        // Preenche dados de confirmação
        this.populateConfirmation();

        // Gera URL do WhatsApp com mensagem preenchida
        this.generateWhatsappMessage();
    }

    goToStep4() {
        this.step1.style.display = 'none';
        this.step2.style.display = 'none';
        this.step3.style.display = 'none';

        if (this.step4) {
            this.step4.style.display = 'block';
        }
    }

    // ==================== ATUALIZA RESUMO ====================
    updateSummary() {
        if (this.selectedDate && this.selectedTime) {
            const [year, month, day] = this.selectedDate.split('-').map(Number);
            const monthName = this.getMonthName(month - 1);
            const dayName = this.getDayName(new Date(year, month - 1, day).getDay());

            document.getElementById('summaryDate').textContent = `${dayName}, ${day} de ${monthName}`;
            document.getElementById('summaryTime').textContent = this.selectedTime;
        }
    }

    // ==================== CONFIRMAÇÃO ====================
    populateConfirmation() {
        const [year, month, day] = this.selectedDate.split('-').map(Number);
        const monthName = this.getMonthName(month - 1);
        const dayName = this.getDayName(new Date(year, month - 1, day).getDay());

        document.getElementById('confirmName').textContent = this.formData.name || '-';
        document.getElementById('confirmEmail').textContent = this.formData.email || '-';
        document.getElementById('confirmWhatsapp').textContent = this.formData.whatsapp || '-';
        document.getElementById('confirmDate').textContent = `${dayName}, ${day} de ${monthName}`;
        document.getElementById('confirmTime').textContent = this.selectedTime || '-';
    }

    // ==================== GERA MENSAGEM WHATSAPP ====================
    generateWhatsappMessage() {
        const name = this.formData.name || '[Nome não preenchido]';
        const email = this.formData.email || '[Email não preenchido]';
        const whatsapp = this.formData.whatsapp || '[WhatsApp não preenchido]';
        const description = this.formData.description || '[Descrição não preenchida]';

        const [year, month, day] = this.selectedDate.split('-').map(Number);
        const monthName = this.getMonthName(month - 1);
        const dayName = this.getDayName(new Date(year, month - 1, day).getDay());
        const dateFormatted = `${dayName}, ${day} de ${monthName}`;

        const time = this.selectedTime;

        // Mensagem formatada
        const messageText = `Olá Gislana! 💜

Realizei o pagamento do PIX e gostaria de confirmar meu agendamento.

*Meus dados:*
👤 Nome: ${name}
📧 Email: ${email}
📱 WhatsApp: ${whatsapp}

*Horário da sessão:*
📅 Data: ${dateFormatted}
🕐 Horário: ${time}

*Descrição do que vou trabalhar:*
${description}

Aguardo a confirmação! 🙏`;

        // Encoda a mensagem para URL
        const encodedMessage = encodeURIComponent(messageText);

        // Número de WhatsApp da Gislana (SUBSTITUA PELO NÚMERO REAL)
        // Formato: 55 + DDD + número (sem formatação)
        const whatsappNumber = '5511987654321'; // ALTERAR PARA O NÚMERO REAL

        // Gera URL do WhatsApp
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Atualiza o link do botão
        if (this.whatsappLink) {
            this.whatsappLink.href = whatsappUrl;
        }

        console.log('✓ Mensagem WhatsApp gerada');
    }
    // ==================== COPIAR CHAVE PIX ====================
    copyPixKey() {
        const pixKey = document.getElementById('pixKey').textContent;

        navigator.clipboard.writeText(pixKey).then(() => {
            // Feedback visual
            const btn = this.copyPixBtn;
            const originalText = btn.textContent;

            btn.classList.add('copied');
            btn.textContent = '✓';

            setTimeout(() => {
                btn.classList.remove('copied');
                btn.textContent = originalText;
            }, 2000);

            console.log('✓ Chave PIX copiada:', pixKey);
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            alert('Erro ao copiar chave PIX');
        });
    }

    // ==================== HANDLE WHATSAPP CLICK ====================
    handleWhatsappClick() {
        console.log('✓ Mensagem enviada via WhatsApp');

        // Aguarda um pouco e mostra a tela de sucesso
        setTimeout(() => {
            this.goToStep4();
        }, 500);
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

    // ==================== SALVA DADOS DO FORMULÁRIO ====================
    saveFormData(data) {
        this.formData = data;
        console.log('✓ Dados do formulário salvos:', data);
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