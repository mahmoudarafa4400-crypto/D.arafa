// التطبيق الرئيسي للموقع
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
        
        // رابط Formspree المعدل
        this.formspreeEndpoint = 'https://formspree.io/f/mqeekowj';
        console.log('✅ Formspree endpoint loaded:', this.formspreeEndpoint);
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
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAppointmentForm(form);
        });
    }
    
    async handleAppointmentForm(form) {
        // جمع البيانات من النموذج
        const serviceId = document.getElementById('serviceType').value;
        const appointmentData = {
            name: document.getElementById('patientName').value.trim(),
            phone: document.getElementById('patientPhone').value.trim(),
            service: serviceId,
            serviceName: this.getServiceName(serviceId),
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            timestamp: new Date().toLocaleString('ar-EG'),
            clinic: 'عيادات الدكتور محمود عرفة - المنوفية',
            clinicPhone: '01018673010',
            clinicEmail: 'mahmoudarafa598@gmail.com'
        };
        
        // التحقق من البيانات
        const validation = this.validateFormData(appointmentData);
        if (!validation.isValid) {
            this.showAppointmentResult({
                success: false,
                message: validation.message
            });
            return;
        }
        
        // إظهار حالة التحميل
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'جاري إرسال البيانات...';
        submitBtn.disabled = true;
        
        try {
            // 1. إرسال البيانات إلى Formspree
            console.log('📤 بدء إرسال البيانات إلى Formspree...');
            const emailResult = await this.sendToFormspree(appointmentData);
            
            // 2. حفظ البيانات محلياً
            let localResult = { appointmentId: 'APP_' + Date.now().toString().slice(-8) };
            if (typeof BookingSystem !== 'undefined') {
                localResult = BookingSystem.processAppointment(appointmentData);
            }
            
            // 3. إرسال إشعار واتساب
            const whatsappUrl = this.sendWhatsAppNotification(appointmentData);
            
            if (emailResult.success) {
                console.log('✅ Formspree نجح، عرض رسالة النجاح');
                this.showAppointmentResult({
                    success: true,
                    message: `🎉 تم حجز الموعد بنجاح!

📋 تفاصيل الحجز:
━━━━━━━━━━━━━━━━━━━━
👤 **الاسم:** ${appointmentData.name}
📞 **الهاتف:** ${appointmentData.phone}
🦷 **الخدمة:** ${appointmentData.serviceName}
📅 **التاريخ:** ${appointmentData.date}
⏰ **الوقت:** ${appointmentData.time}

━━━━━━━━━━━━━━━━━━━━
📧 تم إرسال تأكيد إلى: ${appointmentData.clinicEmail}
📞 سيتم التواصل معك قريباً لتأكيد الموعد.

🔢 **رقم الحجز:** ${localResult.appointmentId}`,
                    appointmentId: localResult.appointmentId
                });
                
                // إعادة تعيين النموذج
                form.reset();
                this.setDefaultDate();
                
                // عرض رابط واتساب للتواصل السريع
                setTimeout(() => {
                    this.showWhatsAppLink(whatsappUrl, appointmentData);
                }, 1500);
                
            } else {
                console.log('⚠️ Formspree فشل، عرض رسالة بديلة');
                this.showAppointmentResult({
                    success: false,
                    message: `⚠️ تم حفظ الحجز محلياً فقط

🔢 **رقم الحجز:** ${localResult.appointmentId}

📞 **يرجى الاتصال بالعيادة مباشرة لتأكيد الموعد:**
01018673010

⏰ أو المحاولة مرة أخرى لاحقاً.`
                });
            }
            
        } catch (error) {
            console.error('💥 خطأ غير متوقع:', error);
            this.showAppointmentResult({
                success: false,
                message: `❌ حدث خطأ غير متوقع

📞 يرجى الاتصال بنا مباشرة:
01018673010

📱 أو مراسلتنا على واتساب`
            });
            
        } finally {
            // استعادة حالة الزر
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    validateFormData(data) {
        // التحقق من الاسم
        if (!data.name || data.name.length < 3) {
            return {
                isValid: false,
                message: '⚠️ الرجاء إدخال اسم صحيح (3 أحرف على الأقل)'
            };
        }
        
        // التحقق من الهاتف
        const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
        if (!data.phone || !phoneRegex.test(data.phone)) {
            return {
                isValid: false,
                message: '⚠️ الرجاء إدخال رقم هاتف مصري صحيح (11 رقم، مثال: 01018673010)'
            };
        }
        
        // التحقق من الخدمة
        if (!data.service) {
            return {
                isValid: false,
                message: '⚠️ الرجاء اختيار الخدمة المطلوبة'
            };
        }
        
        // التحقق من التاريخ
        if (!data.date) {
            return {
                isValid: false,
                message: '⚠️ الرجاء اختيار التاريخ'
            };
        }
        
        // التحقق من الوقت
        if (!data.time) {
            return {
                isValid: false,
                message: '⚠️ الرجاء اختيار الوقت'
            };
        }
        
        return { isValid: true, message: '' };
    }
    
    getServiceName(serviceId) {
        const services = {
            '1': "تقويم الأسنان",
            '2': "زراعة الأسنان", 
            '3': "تبييض الأسنان",
            '4': "طب الفم والأسنان"
        };
        return services[serviceId] || 'خدمة غير معروفة';
    }
    
    async sendToFormspree(appointmentData) {
        try {
            console.group('📨 إرسال إلى Formspree');
            console.log('البيانات المرسلة:', appointmentData);
            
            // الطريقة الصحيحة لإرسال البيانات إلى Formspree
            const formData = new URLSearchParams();
            
            // أسماء الحقول الإنجليزية المطلوبة
            formData.append('name', appointmentData.name);
            formData.append('phone', appointmentData.phone);
            formData.append('service', appointmentData.serviceName);
            formData.append('date', appointmentData.date);
            formData.append('time', appointmentData.time);
            formData.append('clinic', appointmentData.clinic);
            formData.append('timestamp', appointmentData.timestamp);
            
            // هذه الحقول إلزامية لـ Formspree
            formData.append('_replyto', appointmentData.clinicEmail);
            formData.append('_subject', `New Appointment - ${appointmentData.clinic}`);
            formData.append('email', appointmentData.clinicEmail); // حقل email إضافي
            
            console.log('بيانات FormData:', Object.fromEntries(formData));
            
            // إرسال البيانات باستخدام x-www-form-urlencoded
            const response = await fetch(this.formspreeEndpoint, {
                method: 'POST',
                body: formData.toString(),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'omit',
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            });
            
            console.log('استجابة Formspree:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: response.headers
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('نتيجة Formspree:', result);
                console.groupEnd();
                return {
                    success: true,
                    data: result,
                    next: result.next // رابط التوجيه التالي إذا كان موجوداً
                };
            } else {
                const errorText = await response.text();
                console.error('نص الخطأ:', errorText);
                
                // محاولة طريقة بديلة
                console.log('🔄 محاولة طريقة بديلة...');
                const fallbackResult = await this.sendToFormspreeFallback(appointmentData);
                
                console.groupEnd();
                return fallbackResult;
            }
            
        } catch (error) {
            console.error('خطأ في الاتصال:', error);
            console.groupEnd();
            return {
                success: false,
                error: error.message,
                fallback: await this.sendToFormspreeFallback(appointmentData)
            };
        }
    }
    
    async sendToFormspreeFallback(appointmentData) {
        try {
            console.log('🔧 تشغيل الطريقة البديلة...');
            
            // طريقة بديلة باستخدام FormData عادي
            const formData = new FormData();
            
            // نفس البيانات ولكن بـ FormData
            formData.append('name', appointmentData.name);
            formData.append('phone', appointmentData.phone);
            formData.append('service', appointmentData.serviceName);
            formData.append('date', appointmentData.date);
            formData.append('time', appointmentData.time);
            formData.append('_replyto', appointmentData.clinicEmail);
            formData.append('_subject', 'حجز موعد جديد - عيادة الدكتور محمود عرفة');
            formData.append('email', appointmentData.clinicEmail);
            
            const response = await fetch(this.formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ الطريقة البديلة نجحت:', result);
                return {
                    success: true,
                    data: result,
                    method: 'fallback'
                };
            }
            
            throw new Error('الطريقة البديلة فشلت');
            
        } catch (fallbackError) {
            console.error('❌ الطريقة البديلة فشلت:', fallbackError);
            
            // محاولة أخيرة بـ JSON
            try {
                const jsonResponse = await fetch(this.formspreeEndpoint, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: appointmentData.name,
                        phone: appointmentData.phone,
                        service: appointmentData.serviceName,
                        date: appointmentData.date,
                        time: appointmentData.time,
                        _replyto: appointmentData.clinicEmail,
                        _subject: 'حجز موعد - JSON method'
                    }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (jsonResponse.ok) {
                    return { success: true, method: 'json' };
                }
                
            } catch (jsonError) {
                console.error('❌ طريقة JSON فشلت:', jsonError);
            }
            
            return {
                success: false,
                error: fallbackError.message,
                lastTry: 'failed'
            };
        }
    }
    
    sendWhatsAppNotification(appointmentData) {
        const message = `🔔 حجز موعد جديد - عيادة الدكتور محمود عرفة

👤 المريض: ${appointmentData.name}
📞 الهاتف: ${appointmentData.phone}
🦷 الخدمة: ${appointmentData.serviceName}
📅 التاريخ: ${appointmentData.date}
⏰ الوقت: ${appointmentData.time}
🕐 وقت التسجيل: ${appointmentData.timestamp}

📍 العنوان: المنوفية، مصر
📞 هاتف العيادة: 01018673010

يرجى التواصل مع المريض لتأكيد الموعد.`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = this.config.whatsapp || '201018673010';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        console.log('📱 رابط واتساب:', whatsappUrl);
        return whatsappUrl;
    }
    
    showAppointmentResult(result) {
        const resultElement = document.getElementById('appointmentResult');
        if (!resultElement) return;
        
        // تنظيف وتجهيز العنصر
        resultElement.className = 'appointment-result';
        resultElement.innerHTML = '';
        
        if (result.success) {
            resultElement.classList.add('success');
            resultElement.innerHTML = `
                <div style="text-align: center; padding: 25px;">
                    <div style="font-size: 64px; color: #10b981; margin-bottom: 20px; animation: bounce 1s;">🎉</div>
                    <div style="white-space: pre-line; line-height: 1.8; text-align: right; font-size: 17px; padding: 0 15px; background: rgba(255,255,255,0.9); border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        ${result.message}
                    </div>
                    <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #10b98115, #3b82f615); border-radius: 15px; border-right: 5px solid #10b981;">
                        <div style="text-align: right; margin-bottom: 15px;">
                            <strong style="color: #10b981; font-size: 18px;">📋 معلومات الحجز:</strong>
                        </div>
                        <div style="text-align: right; line-height: 2; font-size: 16px;">
                            <strong>🔢 رقم الحجز:</strong> <span style="background: #10b98120; padding: 5px 10px; border-radius: 5px; font-family: monospace;">${result.appointmentId}</span><br>
                            <strong>📅 تاريخ الحجز:</strong> ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
                            <strong>🕐 وقت الحجز:</strong> ${new Date().toLocaleTimeString('ar-EG')}<br>
                            <strong>✅ الحالة:</strong> <span style="color: #10b981; font-weight: bold;">مؤكد</span>
                        </div>
                    </div>
                </div>
            `;
            
            // إضافة أزرار إضافية
            this.setupPostBookingActions(result.appointmentId, resultElement);
            
        } else {
            resultElement.classList.add('error');
            resultElement.innerHTML = `
                <div style="text-align: center; padding: 25px;">
                    <div style="font-size: 64px; color: #ef4444; margin-bottom: 20px;">⚠️</div>
                    <div style="white-space: pre-line; line-height: 1.8; text-align: right; font-size: 17px; padding: 0 15px; background: rgba(255,255,255,0.9); border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        ${result.message}
                    </div>
                    <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #ef444415, #f9731615); border-radius: 15px; border-right: 5px solid #ef4444;">
                        <div style="text-align: right; margin-bottom: 15px;">
                            <strong style="color: #ef4444; font-size: 18px;">📞 طرق بديلة للتواصل:</strong>
                        </div>
                        <div style="text-align: right; line-height: 2; font-size: 16px;">
                            <strong>📞 الاتصال المباشر:</strong> <a href="tel:01018673010" style="color: #3b82f6; text-decoration: none; font-weight: bold;">01018673010</a><br>
                            <strong>📱 الواتساب:</strong> <a href="https://wa.me/201018673010" style="color: #25D366; text-decoration: none; font-weight: bold;">01018673010</a><br>
                            <strong>📧 البريد الإلكتروني:</strong> <a href="mailto:mahmoudarafa598@gmail.com" style="color: #8b5cf6; text-decoration: none; font-weight: bold;">mahmoudarafa598@gmail.com</a><br>
                            <strong>📍 العنوان:</strong> المنوفية، مصر
                        </div>
                    </div>
                </div>
            `;
        }
        
        // إخفاء النتيجة بعد 30 ثانية
        setTimeout(() => {
            if (resultElement.innerHTML.includes('🎉')) {
                // إذا كانت رسالة نجاح، لا تخفيها بسرعة
                setTimeout(() => {
                    resultElement.className = 'appointment-result';
                    resultElement.textContent = '';
                }, 30000);
            } else {
                resultElement.className = 'appointment-result';
                resultElement.textContent = '';
            }
        }, result.success ? 30000 : 20000);
    }
    
    showWhatsAppLink(whatsappUrl, appointmentData) {
        const resultElement = document.getElementById('appointmentResult');
        if (!resultElement || !resultElement.classList.contains('success')) return;
        
        const whatsappLink = document.createElement('div');
        whatsappLink.style.marginTop = '30px';
        whatsappLink.style.padding = '25px';
        whatsappLink.style.background = 'linear-gradient(135deg, #25D36615, #128C7E15)';
        whatsappLink.style.borderRadius = '15px';
        whatsappLink.style.borderRight = '5px solid #25D366';
        whatsappLink.style.animation = 'slideInUp 0.5s ease-out';
        
        whatsappLink.innerHTML = `
            <div style="text-align: right; margin-bottom: 20px;">
                <strong style="color: #128C7E; font-size: 20px;">💬 التواصل السريع عبر واتساب:</strong>
                <p style="color: #666; font-size: 15px; margin-top: 5px;">اضغط على الزر أدناه للتواصل الفوري مع العيادة</p>
            </div>
            <div style="text-align: center;">
                <a href="${whatsappUrl}" target="_blank" 
                   style="display: inline-block; margin: 15px 0; padding: 15px 30px; background: linear-gradient(135deg, #25D366, #128C7E); color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 6px 15px rgba(37, 211, 102, 0.4); transition: all 0.3s; border: none; cursor: pointer;">
                    📱 اضغط هنا للتواصل عبر واتساب
                </a>
                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.8); border-radius: 10px;">
                    <p style="font-size: 15px; color: #666; text-align: right; margin: 0;">
                        <strong>📞 بدائل التواصل:</strong><br>
                        • الاتصال المباشر: <a href="tel:01018673010" style="color: #3b82f6; text-decoration: none; font-weight: bold;">01018673010</a><br>
                        • البريد الإلكتروني: <a href="mailto:mahmoudarafa598@gmail.com" style="color: #8b5cf6; text-decoration: none; font-weight: bold;">mahmoudarafa598@gmail.com</a><br>
                        • العنوان: المنوفية، مصر
                    </p>
                </div>
            </div>
        `;
        
        // إضافة تأثير hover للرابط
        const link = whatsappLink.querySelector('a');
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-3px) scale(1.03)';
            link.style.boxShadow = '0 10px 20px rgba(37, 211, 102, 0.5)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0) scale(1)';
            link.style.boxShadow = '0 6px 15px rgba(37, 211, 102, 0.4)';
        });
        
        link.addEventListener('click', (e) => {
            console.log('📱 فتح واتساب:', whatsappUrl);
            // يمكن فتح في نافذة جديدة أو نفس النافذة
            // window.open(whatsappUrl, '_blank');
        });
        
        resultElement.appendChild(whatsappLink);
    }
    
    setupPostBookingActions(appointmentId, resultElement) {
        // إضافة زر لحفظ الحجز
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '💾 حفظ معلومات الحجز';
        saveBtn.style.cssText = 'margin: 10px; padding: 15px 30px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);';
        
        saveBtn.onclick = () => {
            const bookingDetails = `معلومات حجز عيادة الدكتور محمود عرفة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔢 رقم الحجز: ${appointmentId}
👤 الاسم: ${document.getElementById('patientName')?.value || 'غير محفوظ'}
📞 الهاتف: ${document.getElementById('patientPhone')?.value || 'غير محفوظ'}
🦷 الخدمة: ${this.getServiceName(document.getElementById('serviceType')?.value) || 'غير محفوظة'}
📅 التاريخ: ${document.getElementById('appointmentDate')?.value || 'غير محفوظ'}
⏰ الوقت: ${document.getElementById('appointmentTime')?.value || 'غير محفوظ'}
🕐 وقت الحجز: ${new Date().toLocaleString('ar-EG')}
📍 العنوان: المنوفية، مصر
📞 هاتف العيادة: 01018673010
📧 البريد الإلكتروني: mahmoudarafa598@gmail.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ يرجى الاحتفاظ بهذه المعلومات للرجوع إليها`;
            
            // حفظ كملف نصي
            const blob = new Blob([bookingDetails], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `حجز_عيادة_الدكتور_محمود_عرفة_${appointmentId}.txt`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            // رسالة تأكيد
            const msg = document.createElement('div');
            msg.textContent = '✅ تم حفظ معلومات الحجز في ملف نصي';
            msg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 15px; border-radius: 8px; z-index: 10000; animation: fadeInOut 3s;';
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 3000);
        };
        
        // إضافة زر للتقويم
        const calendarBtn = document.createElement('button');
        calendarBtn.innerHTML = '📅 إضافة تذكير بالتقويم';
        calendarBtn.style.cssText = 'margin: 10px; padding: 15px 30px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);';
        
        calendarBtn.onclick = () => {
            const title = 'موعد عيادة الدكتور محمود عرفة';
            const details = `موعد في عيادة الدكتور محمود عرفة
رقم الحجز: ${appointmentId}
هاتف العيادة: 01018673010`;
            const location = 'المنوفية، مصر';
            
            // إنشاء رابط Google Calendar
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 3);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            
            const startStr = startDate.toISOString().replace(/[-:.]/g, '').slice(0, -4) + 'Z';
            const endStr = endDate.toISOString().replace(/[-:.]/g, '').slice(0, -4) + 'Z';
            
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&dates=${startStr}/${endStr}`;
            
            window.open(calendarUrl, '_blank', 'noopener,noreferrer');
        };
        
        // إضافة تأثير hover للأزرار
        [saveBtn, calendarBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-3px)';
                btn.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
            });
        });
        
        // إضافة الأزرار إلى صفحة النتيجة
        if (resultElement) {
            const actionDiv = document.createElement('div');
            actionDiv.style.marginTop = '30px';
            actionDiv.style.textAlign = 'center';
            actionDiv.style.padding = '25px';
            actionDiv.style.background = 'rgba(248, 250, 252, 0.9)';
            actionDiv.style.borderRadius = '15px';
            actionDiv.style.border = '2px dashed #cbd5e1';
            actionDiv.appendChild(saveBtn);
            actionDiv.appendChild(calendarBtn);
            resultElement.appendChild(actionDiv);
        }
    }
    
    setDefaultDate() {
        const dateInput = document.getElementById('appointmentDate');
        if (dateInput) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 3);
            dateInput.value = futureDate.toISOString().split('T')[0];
        }
        
        const timeSelect = document.getElementById('appointmentTime');
        if (timeSelect) {
            timeSelect.value = '10:00 ص';
        }
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
        
        // تعيين الحد الأدنى للتاريخ إلى اليوم
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('appointmentDate');
        if (dateInput) {
            dateInput.min = today;
            this.setDefaultDate();
        }
        
        // تحسين تجربة المستخدم
        const nameInput = document.getElementById('patientName');
        const phoneInput = document.getElementById('patientPhone');
        
        if (nameInput) {
            nameInput.placeholder = 'مثال: أحمد محمد';
            nameInput.addEventListener('focus', () => {
                nameInput.style.borderColor = '#3b82f6';
            });
        }
        
        if (phoneInput) {
            phoneInput.placeholder = 'مثال: 01018673010';
            phoneInput.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) {
                    e.target.value = value.slice(0, 11);
                }
            });
        }
        
        // إضافة أنماط CSS ديناميكية
        this.addDynamicStyles();
        
        // اختبار Formspree عند التحميل
        setTimeout(() => this.testFormspreeConnection(), 2000);
    }
    
    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes slideInUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-10px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }
            .appointment-result.success {
                animation: slideInUp 0.5s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
    
    async testFormspreeConnection() {
        console.log('🔍 اختبار اتصال Formspree...');
        try {
            // اختبار بسيط
            const testData = new URLSearchParams();
            testData.append('test', 'connection');
            testData.append('_replyto', 'test@example.com');
            testData.append('_subject', 'Test Connection');
            
            const response = await fetch(this.formspreeEndpoint, {
                method: 'POST',
                body: testData.toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            console.log('✅ Formspree connection test:', response.status, response.statusText);
            
            if (response.ok) {
                console.log('🎯 Formspree جاهز للاستخدام!');
            } else {
                console.warn('⚠️ Formspree قد يحتاج إعدادات إضافية');
            }
            
        } catch (error) {
            console.error('❌ Formspree connection failed:', error);
        }
    }
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof ClinicConfig !== 'undefined') {
            window.clinicApp = new DentalClinicApp();
            console.log('🚀 تطبيق العيادة تم تحميله بنجاح!');
            console.log('📧 Formspree endpoint:', window.clinicApp.formspreeEndpoint);
            console.log('🏥 العيادة:', window.clinicApp.config.name);
        } else {
            console.error('❌ ClinicConfig غير معرّف! تأكد من تحميل config.js أولاً');
            
            // خيار بديل إذا فشل تحميل config.js
            const fallbackConfig = {
                services: [
                    { id: 1, name: "تقويم الأسنان", description: "تقويم الأسنان", image: "" },
                    { id: 2, name: "زراعة الأسنان", description: "زراعة الأسنان", image: "" },
                    { id: 3, name: "تبييض الأسنان", description: "تبييض الأسنان", image: "" },
                    { id: 4, name: "طب الفم والأسنان", description: "طب الفم والأسنان", image: "" }
                ],
                appointmentTimes: ["9:00 ص", "10:00 ص", "11:00 ص", "12:00 ظ", "1:00 ظ", "2:00 ظ", "3:00 ظ", "4:00 ع", "5:00 ع", "6:00 ع", "7:00 م", "8:00 م"],
                whatsapp: "201018673010"
            };
            
            window.ClinicConfig = fallbackConfig;
            window.clinicApp = new DentalClinicApp();
            console.log('🔄 تم تحميل إعدادات بديلة');
        }
    } catch (error) {
        console.error('💥 خطأ في تحميل التطبيق:', error);
    }
});

// دالة لاختبار Formspree يدوياً من الـ Console
window.testFormspreeManually = async function() {
    console.group('🧪 اختبار Formspree يدوياً');
    
    const testData = {
        name: 'اختبار النظام',
        phone: '01018673010',
        service: 'تقويم الأسنان',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 ص',
        email: 'mahmoudarafa598@gmail.com'
    };
    
    try {
        const formData = new URLSearchParams();
        formData.append('name', testData.name);
        formData.append('phone', testData.phone);
        formData.append('service', testData.service);
        formData.append('date', testData.date);
        formData.append('time', testData.time);
        formData.append('_replyto', testData.email);
        formData.append('_subject', 'اختبار النظام - حجز موعد');
        
        console.log('📤 إرسال بيانات اختبار:', testData);
        
        const response = await fetch('https://formspree.io/f/mqeekowj', {
            method: 'POST',
            body: formData.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });
        
        console.log('📨 الاستجابة:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ الاختبار ناجح:', result);
            alert('✅ اختبار Formspree ناجح! البيانات سترسل إلى mahmoudarafa598@gmail.com');
        } else {
            const errorText = await response.text();
            console.error('❌ الاختبار فاشل:', errorText);
            alert('❌ اختبار Formspree فاشل. تحقق من Console للمزيد من التفاصيل.');
        }
        
    } catch (error) {
        console.error('💥 خطأ في الاختبار:', error);
        alert('❌ حدث خطأ في الاختبار: ' + error.message);
    }
    
    console.groupEnd();
};

// دالة مساعدة لتنسيق التاريخ
window.formatDate = function(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.warn('⚠️ خطأ في تنسيق التاريخ:', error);
        return dateString;
    }
};

// إضافة رسالة ترحيب في الـ Console
console.log('%c🏥 عيادات الدكتور محمود عرفة 🦷', 'color: #1e3a8a; font-size: 18px; font-weight: bold;');
console.log('%c📍 المنوفية، مصر | 📞 01018673010', 'color: #3b82f6; font-size: 14px;');
console.log('%c💡 استخدم testFormspreeManually() لاختبار النظام', 'color: #10b981; font-size: 12px;');