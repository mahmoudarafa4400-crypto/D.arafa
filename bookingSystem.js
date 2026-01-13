class BookingSystem {
    constructor() {
        this.appointments = [];
        this.nextId = 1;
    }
    
    static processAppointment(data) {
        if (!BookingSystem.validateData(data)) {
            return {
                success: false,
                message: "الرجاء ملء جميع الحقول المطلوبة بشكل صحيح"
            };
        }
        
        const appointment = {
            id: BookingSystem.generateId(),
            ...data,
            timestamp: new Date().toISOString(),
            status: "مؤكد"
        };
        
        BookingSystem.saveToStorage(appointment);
        
        return {
            success: true,
            message: "تم حجز الموعد بنجاح! سيتم التواصل معك للتأكيد",
            appointmentId: appointment.id
        };
    }
    
    static validateData(data) {
        if (!data.name || data.name.trim().length < 3) {
            return false;
        }
        
        if (!data.phone || !BookingSystem.isValidPhone(data.phone)) {
            return false;
        }
        
        if (!data.service || !data.date || !data.time) {
            return false;
        }
        
        return true;
    }
    
    static isValidPhone(phone) {
        const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
        return phoneRegex.test(phone);
    }
    
    static generateId() {
        return 'APP' + Date.now() + Math.floor(Math.random() * 1000);
    }
    
    static saveToStorage(appointment) {
        try {
            let appointments = JSON.parse(localStorage.getItem('clinicAppointments')) || [];
            appointments.push(appointment);
            localStorage.setItem('clinicAppointments', JSON.stringify(appointments));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    }
    
    static getAppointments() {
        try {
            return JSON.parse(localStorage.getItem('clinicAppointments')) || [];
        } catch (error) {
            console.error('خطأ في قراءة البيانات:', error);
            return [];
        }
    }
    
    static searchAppointments(query) {
        const appointments = BookingSystem.getAppointments();
        return appointments.filter(app => 
            app.name.includes(query) || 
            app.phone.includes(query) ||
            app.id === query
        );
    }
    
    static getStatistics() {
        const appointments = BookingSystem.getAppointments();
        const today = new Date().toISOString().split('T')[0];
        
        return {
            total: appointments.length,
            today: appointments.filter(app => app.date === today).length,
            confirmed: appointments.filter(app => app.status === 'مؤكد').length,
            pending: appointments.filter(app => app.status === 'قيد الانتظار').length
        };
    }
}

function formatAppointmentDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function convertTo24Hour(timeStr) {
    if (!timeStr) return '';
    
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
        hours = '00';
    }
    
    if (modifier === 'م') {
        hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours}:${minutes}`;
}