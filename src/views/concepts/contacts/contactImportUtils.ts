import Papa from 'papaparse';
import { Platform } from './types'; // مسیر فایل تایپ‌های خود را اصلاح کنید

// استخراج اینترفیس به اینجا تا در کل پروژه قابل استفاده باشد
export interface EditableContactRow {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    note: string;
    platformUserName: string;
    platform: Platform;
    tags: string[];
    isValid: boolean;
    errors: string[];
    isSelected: boolean;
}

/**
 * تولید و دانلود فایل CSV نمونه برای کاربر
 */
export const downloadSampleCsv = (fileName: string = "AnyBot_Sample.csv"): void => {
    const headers = "نام و نام خانوادگی,شماره موبایل,ای دی پلتفرم,ادرس ایمیل,یادداشت\n";
    const sampleData = "مهرداد نصیری,09123456789,mehrdad_ns,mehrdad@example.com,مشتری VIP\nسارا رضایی,,sara_rz,,نیاز به پیگیری";
    
    // استفاده از BOM برای پشتیبانی صحیح از کاراکترهای فارسی در اکسل
    const blob = new Blob(["\uFEFF" + headers + sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    
    // پاکسازی مموری
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * خواندن فایل CSV، مپ کردن ستون‌ها و اعمال ولیدیشن‌های اولیه
 */
export const parseContactsCsv = (file: File): Promise<EditableContactRow[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const rows: EditableContactRow[] = results.data.map((row: any) => {
                        const errors: string[] = [];
                        const fullName = row['نام و نام خانوادگی']?.trim() || '';
                        const phoneNumber = row['شماره موبایل']?.trim() || '';
                        const platformUserName = row['ای دی پلتفرم']?.trim() || ''; 
                        const email = row['ادرس ایمیل']?.trim() || '';
                        const note = row['یادداشت']?.trim() || '';
                        
                        // ولیدیشن‌ها
                        if (!fullName) errors.push('نام کامل الزامی است');
                        if (!phoneNumber && !platformUserName) errors.push('شماره موبایل یا آیدی پلتفرم الزامی است');

                        const isValid = errors.length === 0;
                        
                        // تولید آیدی یکتا با Fallback برای محیط‌های بدون SSL
                        const generateId = () => {
                            return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
                                ? crypto.randomUUID()
                                : `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                        };

                        return {
                            id: generateId(),
                            fullName, 
                            phoneNumber, 
                            platformUserName, 
                            email, 
                            note,
                            platform: 'WhatsApp' as Platform, 
                            tags: [],                         
                            isValid, 
                            errors,
                            isSelected: isValid
                        };
                    });
                    
                    resolve(rows);
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};