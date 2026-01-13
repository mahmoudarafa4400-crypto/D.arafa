class DentalClinicApp {
    constructor() {
        this.config = ClinicConfig;
        this.init();
    }
    
    init() {
        this.setCurrentYear();
        this.loadServices();
        this.loadServiceOptions();
        this.loadTimeOptions();
        this.loadStatistics();
        this.setupFormHandler();
        this.setupNavigation();
        this.setupEvents();
    }
    
    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    loadServices() {
        const servicesGrid = document.getElementById('servicesGrid');
        const footerServices = document.getElementById('footerServices');
        
        if (!servicesGrid && !footerServices) return;
        
        if (servicesGrid) servicesGrid.innerHTML = '';
        if (footerServices) footerServices.innerHTML = '';
        
        this.config.services.forEach(service => {
            if (servicesGrid) {
                const serviceCard = this.createServiceCard(service);
                servicesGrid.appendChild(serviceCard);
            }
            
            if (footerServices) {
                const serviceItem = this.createServiceListItem(service);
                footerServices.appendChild(serviceItem);
            }
        });
    }
    
    createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <img src="${service.image}" alt="${service.name}" class="service-img">
            <div class="service-content">
                <h3>${service.name}</h3>
                <p>${service.description}</p>
            </div>
        `;
        return card;
    }
    
    createServiceListItem(service) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#services`;
        a.textContent = service.name;
        a.onclick = (e) => {
            e.preventDefault();
            document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
        };
        li.appendChild(a);
        return li;
    }
    
    loadServiceOptions() {
        const serviceSelect = document.getElementById('serviceType');
        if (!serviceSelect) return;
        
        this.config.services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });
    }
    
    loadTimeOptions() {
        const timeSelect = document.getElementById('appointmentTime');
        if (!timeSelect) return;
        
        this.config.appointmentTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
    }
    
    loadStatistics() {
        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;
        
        const stats = [
            { number: "5000+", text: "مريض راضٍ" },
            { number: "15+", text: "سنة خبرة" },
            { number: "98%", text: "معدل نجاح" },
            { number: "24/7", text: "دعم فني" }
        ];
        
        stats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <div class="stat-number">${stat.number}</div>
                <div class="stat-text">${stat.text}</div>
            `;
            statsGrid.appendChild(statCard);
        });
    }
    
    setupFormHandler() {
        const form = document.getElementById('appointmentForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAppointmentForm(form);
        });
    }
    
    handleAppointmentForm(form) {
        const appointmentData = {
            name: document.getElementById('patientName').value,
            phone: document.getElementById('patientPhone').value,
            service: document.getElementById('serviceType').value,
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value
        };
        
        const result = BookingSystem.processAppointment(appointmentData);
        this.showAppointmentResult(result);
        
        if (result.success) {
            form.reset();
            this.sendWhatsAppNotification(appointmentData);
        }
    }
    
    showAppointmentResult(result) {
        const resultElement = document.getElementById('appointmentResult');
        if (!resultElement) return;
        
        resultElement.className = 'appointment-result';
        resultElement.textContent = result.message;
        
        if (result.success) {
            resultElement.classList.add('success');
        } else {
            resultElement.classList.add('error');
        }
        
        setTimeout(() => {
            resultElement.className = 'appointment-result';
            resultElement.textContent = '';
        }, 5000);
    }
    
    sendWhatsAppNotification(appointmentData) {
        const serviceName = this.config.services.find(s => s.id == appointmentData.service)?.name || 'خدمة';
        const message = `حجز موعد جديد:
الاسم: ${appointmentData.name}
الهاتف: ${appointmentData.phone}
الخدمة: ${serviceName}
التاريخ: ${appointmentData.date}
الوقت: ${appointmentData.time}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${this.config.whatsapp}?text=${encodedMessage}`;
        
        console.log('رابط واتساب للحجز:', whatsappUrl);
    }
    
    setupNavigation() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
            
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                });
            });
        }
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupEvents() {
        const bookBtn = document.getElementById('bookAppointmentBtn');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                document.getElementById('appointment').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('appointmentDate');
        if (dateInput) {
            dateInput.min = today;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.clinicApp = new DentalClinicApp();
});