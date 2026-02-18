const students = {
    "6701001": {
        name: "สมชาย ใจดี",
        department: "วิศวกรรมคอมพิวเตอร์",
        class: "ปี 1",
        tuition: 25000,
        insurance: 500,
        paid: 25500,
        paymentHistory: [
            {
                date: "2024-07-20",
                amount: 25500,
                slip: "images/slip-placeholder.png",
                submissionTimestamp: "2024-07-21T10:00:00Z"
            }
        ]
    },
    "6701002": {
        name: "สมหญิง จริงใจ",
        department: "บริหารธุรกิจ",
        class: "ปี 2",
        tuition: 22000,
        insurance: 500,
        paid: 10000,
        paymentHistory: [
            {
                date: "2024-07-15",
                amount: 10000,
                slip: "images/slip-placeholder.png",
                submissionTimestamp: "2024-07-16T11:30:00Z"
            }
        ]
    },
    "6701003": {
        name: "มานะ อดทน",
        department: "ศิลปกรรมศาสตร์",
        class: "ปี 4",
        tuition: 28000,
        insurance: 500,
        paid: 0,
        paymentHistory: []
    }
};

const bankSettings = {
    bankName: "ธนาคารกรุงเทพ",
    accountNumber: "123-4-56789-0",
    accountName: "มหาวิทยาลัย ABC",
    qrCode: "#" // CORRECTED: Use a safe placeholder instead of an empty string
};
