// محاكاة لنظام حجوزات بلغة C++
class BookingSystem {
    constructor() {
        this.appointments = [];
        this.nextId = 1;
    }
    
    // دالة للحصول على اسم الطبيب من رقم الخدمة
    static getDoctorByService(serviceId) {
        const doctors = {
            '1': { name: 'د. عمر عزيز', title: 'استشاري تقويم الأسنان' },
            '2': { name: 'د. يوسف عزام', title: 'ماجستير زراعة الأسنان' },
            '3': { name: 'د. محمود عرفة', title: 'أخصائي طب الفم والأسنان' },
            '4': { name: 'د. محمود عرفة', title: 'أخصائي طب الفم والأسنان' }
        };
        return doctors[serviceId] || { name: 'طبيب العيادة', title: 'أخصائي' };
    }
    
    // محاكاة لدالة تأكيد الحجز
    static processAppointment(data) {
        // محاكاة للتحقق من البيانات
        if (!BookingSystem.validateData(data)) {
            return {
                success: false,
                message: "الرجاء ملء جميع الحقول المطلوبة بشكل صحيح"
            };
        }
        
        const doctorInfo = BookingSystem.getDoctorByService(data.service);
        const appointment = {
            id: BookingSystem.generateId(),
            ...data,
            doctor: doctorInfo.name,
            doctorTitle: doctorInfo.title,
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
    
    // محاكاة لدالة التحقق
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
    
    // محاكاة لدالة التحقق من الهاتف
    static isValidPhone(phone) {
        const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
        return phoneRegex.test(phone);
    }
    
    // محاكاة لتوليد ID
    static generateId() {
        return 'APP' + Date.now() + Math.floor(Math.random() * 1000);
    }
    
    // محاكاة لحفظ البيانات
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
    
    // محاكاة لدالة جلب الحجوزات
    static getAppointments() {
        try {
            return JSON.parse(localStorage.getItem('clinicAppointments')) || [];
        } catch (error) {
            console.error('خطأ في قراءة البيانات:', error);
            return [];
        }
    }
    
    // محاكاة لدالة البحث
    static searchAppointments(query) {
        const appointments = BookingSystem.getAppointments();
        return appointments.filter(app => 
            app.name.includes(query) || 
            app.phone.includes(query) ||
            app.id === query
        );
    }
    
    // محاكاة لدالة الإحصاءات
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

// دالة مساعدة للنمط الإجرائي مثل C
function formatAppointmentDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// دالة لتحويل الوقت إلى تنسيق 24 ساعة
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