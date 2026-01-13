// ملف تهيئة البيانات والإعدادات
const ClinicConfig = {
    name: "عيادات الدكتور محمود عرفة",
    location: "المنوفية، مصر",
    phone: "01018673010",
    whatsapp: "201018673010",
    motto: "نحن نعمل من أجل ابتسامتك وليس من أجل أموالك، والأرزاق بيد الله وهذا من فضله وحده",
    
    services: [
        {
            id: 1,
            name: "تقويم الأسنان",
            description: "تقويم الأسنان باحدث التقنيات العالمية لتحقيق ابتسامة متناسقة وصحية.",
            doctor: "د. عمر عزيز",
            specialization: "استشاري تقويم الأسنان",
            image: "https://i.postimg.cc/KYJHwFsP/download-(1).jpg",
            features: [
                "تقويم الأسنان الثابت والمتحرك",
                "تقويم شفاف (إنفزلاين)",
                "تقويم للأطفال والكبار",
                "متابعة دورية وضمان النتائج"
            ]
        },
        {
            id: 2,
            name: "زراعة الأسنان",
            description: "حل دائم ومثالي لتعويض الأسنان المفقودة بأحدث غرسات التيتانيوم العالمية.",
            doctor: "د. يوسف عزام",
            specialization: "ماجستير زراعة الأسنان",
            image: "https://i.postimg.cc/t40QNXLG/Are-you-missing-a-tooth-and-looking-for-a-permanent-solution-A-single-dental-implant-offers-a-natur.jpg",
            features: [
                "زراعة فورية في نفس اليوم",
                "غرسات سويسرية وألمانية",
                "جراحة بالليزر بدون ألم",
                "ضمان مدى الحياة للغرسات"
            ]
        },
        {
            id: 3,
            name: "تبييض الأسنان",
            description: "تبييض متقدم وآمن باستخدام أحدث التقنيات لتحقيق ابتسامة ناصعة البياض.",
            doctor: "د. محمود عرفة",
            specialization: "أخصائي طب الفم والأسنان",
            image: "https://i.postimg.cc/L4bcBr5H/download.jpg",
            features: [
                "تبييض بالليزر في جلسة واحدة",
                "تبييض منزلي آمن",
                "نتائج فورية تدوم لأعوام",
                "خالي من الآثار الجانبية"
            ]
        },
        {
            id: 4,
            name: "طب الفم والأسنان",
            description: "تشخيص وعلاج شامل لمشاكل الفم والأسنان بأحدث الأجهزة والتقنيات.",
            doctor: "د. محمود عرفة",
            specialization: "أخصائي طب الفم والأسنان",
            image: "https://i.postimg.cc/02GRZgxm/Close-up-of-dentist-treatment-a-Health-Medical-Photo-by-Misty-Day.jpg",
            features: [
                "حشوات تجميلية وعلاج الجذور",
                "خلع جراحي بدون ألم",
                "علاج اللثة المتقدم",
                "فحوصات وقائية شاملة"
            ]
        }
    ],
    
    workingHours: {
        weekdays: "من السبت إلى الخميس: 9 صباحاً - 9 مساءً",
        friday: "الجمعة: 2 ظهراً - 9 مساءً"
    },
    
    appointmentTimes: [
        "9:00 ص", "10:00 ص", "11:00 ص", "12:00 ظ",
        "1:00 ظ", "2:00 ظ", "3:00 ظ", "4:00 ع",
        "5:00 ع", "6:00 ع", "7:00 م", "8:00 م"
    ],
    
    socialMedia: {
        facebook: "https://www.facebook.com",
        instagram: "https://www.instagram.com"
    }
};