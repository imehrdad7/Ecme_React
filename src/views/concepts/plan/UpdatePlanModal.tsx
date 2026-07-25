import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetPlanById, apiUpdatePlan } from '@/services/PlanService'

interface Props {
    planId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdatePlanModal = ({ planId, isOpen, onClose, onSuccess }: Props) => {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    
    // استیت‌های اولویت و پیشنهاد ویژه
    const [displayOrder, setDisplayOrder] = useState('')
    const [isRecommended, setIsRecommended] = useState(false)

    const [isFetching, setIsFetching] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && planId) {
            fetchPlanDetails()
        }
    }, [isOpen, planId])

    const fetchPlanDetails = async () => {
        setIsFetching(true)
        try {
            const res = await apiGetPlanById(planId!)
            if (res) {
                setName(res.name)
                setPrice(String(res.price))
                setDisplayOrder(res.displayOrder != null ? String(res.displayOrder) : '')
                setIsRecommended(res.isRecommended || false)
                
                // نکته: اگر بک‌اند برای آپدیت به بقیه فیلدها (مثل features) نیاز دارد، 
                // باید آن‌ها را در یک استیت مخفی نگه دارید، وگرنه نیازی نیست.
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات</Notification>, { placement: 'top-center' })
            onClose()
        } finally {
            setIsFetching(false)
        }
    }

    const handleSubmit = async () => {
        if (!planId || !name.trim()) return

        setIsLoading(true)
        try {
            await apiUpdatePlan(planId, {
                id: planId,
                name,
                price: Number(price) || 0,
                displayOrder: displayOrder ? Number(displayOrder) : null,
                isRecommended: Boolean(isRecommended)
                // اگر بک‌اند کل آبجکت را یکجا می‌خواهد، باید مقادیر قبلی فیچرها را هم اینجا پاس بدهید
            })
            toast.push(<Notification title="موفق" type="success">اطلاعات پایه پلن ویرایش شد.</Notification>, { placement: 'top-center' })
            onSuccess()
            onClose()
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">مشکلی در ویرایش پیش آمد.</Notification>, { placement: 'top-center' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        // عرض مودال را کمی کمتر کردیم چون حالا فرم کوچکتر شده است
        <Dialog isOpen={isOpen} onClose={onClose} width={500}>
            <h5 className="mb-4 text-gray-800">ویرایش اطلاعات پایه پلن</h5>
            {isFetching ? (
                <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
            ) : (
                <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-2">
                    
                    {/* اطلاعات پایه */}
                    <div className="flex flex-col gap-4 bg-gray-50 p-5 rounded-lg border border-gray-100">
                        <div>
                            <label className="block text-sm font-medium mb-1">نام پلن</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">قیمت (تومان)</label>
                            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isLoading} className="dir-ltr text-left" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">اولویت نمایش (اختیاری)</label>
                            <Input 
                                type="number" 
                                placeholder="خالی = حفظ اولویت قبلی" 
                                value={displayOrder} 
                                onChange={(e) => setDisplayOrder(e.target.value)} 
                                disabled={isLoading} 
                                className="dir-ltr text-left" 
                            />
                        </div>
                        
                        <div className="flex items-center mt-2">
                            <span className="text-sm font-medium text-gray-700 ml-3">نمایش به عنوان پیشنهاد ویژه:</span>
                            <Switcher 
                                checked={isRecommended} 
                                onChange={() => setIsRecommended(!isRecommended)} 
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-4 border-t sticky bottom-0 bg-white">
                        <Button variant="plain" onClick={onClose} disabled={isLoading}>انصراف</Button>
                        <Button variant="solid" className="bg-indigo-600 hover:bg-indigo-500" loading={isLoading} onClick={handleSubmit}>
                            ذخیره تغییرات
                        </Button>
                    </div>
                </div>
            )}
        </Dialog>
    )
}

export default UpdatePlanModal