const axios = require('axios');
const fs = require('fs');

// Đọc file JSON chứa dữ liệu công ty
const companiesData = JSON.parse(fs.readFileSync('./src/main/resources/company-data.json', 'utf8'));

// Hàm tạo công ty
async function createCompany(company) {
    try {
        const response = await axios.post('http://localhost:8080/api/v1/companies', company);
        console.log(`Created company: ${company.name}`);
        return response.data;
    } catch (error) {
        console.error(`Error creating company ${company.name}:`, error.message);
        return null;
    }
}

// Hàm tạo tất cả công ty
async function createAllCompanies() {
    console.log('Starting to create companies...');

    for (const company of companiesData.companies) {
        await createCompany(company);
        // Thêm delay 1 giây giữa các request để tránh quá tải server
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Finished creating companies');
}

// Chạy script
createAllCompanies(); 