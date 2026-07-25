import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { apiGetAdminInvoices, InvoiceListItemDto } from '@/services/AdminInvoiceService'
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi'


const InvoiceList = () => {
    const [invoices, setInvoices] = useState<InvoiceListItemDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const pageSize = 10

    useEffect(() => {
        fetchInvoices()
    }, [pageNumber])

    const fetchInvoices = async () => {
        setIsLoading(true)
        try {
            const res = await apiGetAdminInvoices({ pageNumber, pageSize })
            if (res) {
                setInvoices(res.items)
                setTotalCount(res.totalCount)
            }
        } catch (error) {
            console.error("خطا در دریافت فاکتورها")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('fa-IR', { 
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        }).format(new Date(dateString))
    }

    const totalPages = Math.ceil(totalCount / pageSize)

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">تاریخچه فاکتورها و پرداخت‌ها</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-right">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <tr>
                            <th className="p-4">نام شرکت</th>
                            <th className="p-4">پلن خریداری شده</th>
                            <th className="p-4">مبلغ (تومان)</th>
                            <th className="p-4">کد پیگیری</th>
                            <th className="p-4">تاریخ ثبت</th>
                            <th className="p-4 text-center">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">در حال دریافت داده‌ها...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">هیچ فاکتوری یافت نشد.</td></tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{invoice.companyName}</td>
                                    <td className="p-4 text-gray-600">{invoice.planName}</td>
                                    <td className="p-4 font-semibold text-gray-800">{invoice.amount.toLocaleString()}</td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">{invoice.referenceNumber || '---'}</td>
                                    <td className="p-4 text-gray-500">{formatDate(invoice.createdAt)}</td>
                                    <td className="p-4 text-center flex justify-center">
                                        {invoice.isSuccessful ? (
                                            <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                <HiOutlineCheckCircle className="text-sm" /> موفق
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                                <HiOutlineXCircle className="text-sm" /> ناموفق
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalCount > pageSize && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                        نمایش {(pageNumber - 1) * pageSize + 1} تا {Math.min(pageNumber * pageSize, totalCount)} از {totalCount} فاکتور
                    </span>
                    <div className="flex gap-2">
                        <Button size="sm" disabled={pageNumber === 1 || isLoading} onClick={() => setPageNumber(prev => prev - 1)}>
                            قبلی
                        </Button>
                        <Button size="sm" disabled={pageNumber >= totalPages || isLoading} onClick={() => setPageNumber(prev => prev + 1)}>
                            بعدی
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InvoiceList