import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Notification from '@/components/ui/Notification';
import toast from '@/components/ui/toast';
import { apiGetApiKeys, apiGenerateApiKey, apiRevokeApiKey } from '@/services/ApiKeyService';
// تعریف اینترفیس کلیدها بر اساس بک‌اند جدید
interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    scopes: string;
    isActive: boolean;
    createdAt: string;
}

const ApiTokenManager = ({ onBack }: { onBack?: () => void }) => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    // استیت‌های مودال ساخت کلید
    const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
    const [newKeyName, setNewKeyName] = useState<string>('');
    const [newKeyScope, setNewKeyScope] = useState<string>('messages:send');

    // استیت‌های نمایش توکن تازه ساخته شده
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    // استیت‌های مودال ابطال
    const [revokeDialogOpen, setRevokeDialogOpen] = useState<boolean>(false);
    const [selectedKeyToRevoke, setSelectedKeyToRevoke] = useState<ApiKey | null>(null);

    // دریافت لیست کلیدها در زمان لود صفحه
    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setIsFetching(true);
        try {
            const response = await apiGetApiKeys();
            // فرض بر این است که دیتا مستقیماً یا داخل یک پراپرتی برمی‌گردد
            setApiKeys(response || []);
        } catch (error) {
            console.error('Error fetching api keys:', error);
            showToast('خطا', 'دریافت لیست کلیدها با خطا مواجه شد.', 'danger');
        } finally {
            setIsFetching(false);
        }
    };

    const showToast = (title: string, message: string, type: 'success' | 'danger') => {
        toast.push(
            <Notification title={title} type={type}>
                {message}
            </Notification>,
            { placement: 'top-center' }
        );
    };

    const handleOpenCreateDialog = () => {
        setNewKeyName('');
        setNewKeyScope('messages:send');
        setGeneratedToken(null);
        setCreateDialogOpen(true);
    };

    const handleGenerateKey = async () => {
        if (!newKeyName.trim()) {
            showToast('خطا', 'لطفاً نام کلید را وارد کنید.', 'danger');
            return;
        }

        setIsLoading(true);
        setCopySuccess(false);

        try {
            const response = await apiGenerateApiKey({
                name: newKeyName,
                scopes: newKeyScope
            });

            // فرض بر این است که بک‌اند ApiKey را داخل پراپرتی apiKey برمی‌گرداند
            const newToken = response?.apiKey;

            if (newToken) {
                setGeneratedToken(newToken);
                showToast('موفقیت', 'کلید دسترسی جدید با موفقیت ایجاد شد.', 'success');
                fetchKeys(); // آپدیت لیست در پس‌زمینه
            } else {
                throw new Error("توکن در خروجی یافت نشد");
            }
        } catch (error) {
            console.error('Error generating token:', error);
            showToast('خطا', 'مشکلی در تولید کلید به وجود آمد. لطفاً دوباره تلاش کنید.', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmRevoke = (key: ApiKey) => {
        setSelectedKeyToRevoke(key);
        setRevokeDialogOpen(true);
    };

    const handleRevokeKey = async () => {
        if (!selectedKeyToRevoke) return;

        setIsLoading(true);
        try {
            await apiRevokeApiKey(selectedKeyToRevoke.id);
            showToast('موفقیت', `کلید "${selectedKeyToRevoke.name}" با موفقیت باطل شد.`, 'success');
            setRevokeDialogOpen(false);
            fetchKeys(); // آپدیت لیست
        } catch (error) {
            console.error('Error revoking token:', error);
            showToast('خطا', 'مشکلی در ابطال کلید به وجود آمد.', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToken = () => {
        if (generatedToken) {
            navigator.clipboard.writeText(generatedToken);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-5xl mx-auto mt-8">
            <div className="mb-6 flex items-center">
                <Button
                    size="sm"
                    variant="plain"
                    onClick={onBack}
                    icon={<i className="text-xl">←</i>}
                >
                    بازگشت به اطلاعات شرکت
                </Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {/* هدر */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-4 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">کلیدهای دسترسی (API Keys)</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            کلیدهای اتصال نرم‌افزارها و وب‌سایت‌های خارجی به حساب AnyBot خود را مدیریت کنید.
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        onClick={handleOpenCreateDialog}
                        className="bg-blue-500 hover:bg-blue-600 text-white whitespace-nowrap"
                    >
                        + ساخت کلید جدید
                    </Button>
                </div>

                {/* جدول کلیدها */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-right border-collapse min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">نام کلید</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">پیشوند کلید</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">دسترسی‌ها</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">وضعیت</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">تاریخ ایجاد</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 w-24">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isFetching ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">در حال دریافت اطلاعات...</td>
                                </tr>
                            ) : apiKeys.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">هیچ کلیدی ساخته نشده است.</td>
                                </tr>
                            ) : (
                                apiKeys.map((key) => (
                                    <tr key={key.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-800 font-medium">{key.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-500 font-mono" dir="ltr">{key.prefix}</td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {key.scopes === 'all' ? 'دسترسی کامل' : 'ارسال پیام'}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {key.isActive ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">فعال</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">باطل شده</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">{formatDate(key.createdAt)}</td>
                                        <td className="py-3 px-4 text-sm">
                                            {key.isActive && (
                                                <button
                                                    onClick={() => confirmRevoke(key)}
                                                    className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                                >
                                                    ابطال
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* مودال ساخت کلید / نمایش توکن نهایی */}
            <Dialog
                isOpen={createDialogOpen}
                onClose={() => !generatedToken && setCreateDialogOpen(false)}
                onRequestClose={() => !generatedToken && setCreateDialogOpen(false)}
            // بستن مودال وقتی توکن تولید شده فقط با دکمه "متوجه شدم" امکان‌پذیر است تا کاربر مجبور شود پیام هشدار را ببیند
            >
                <div className="flex flex-col h-full">
                    {!generatedToken ? (
                        // 1. فرم ایجاد کلید
                        <>
                            <h5 className="mb-6 font-bold text-lg text-gray-800">ساخت کلید API جدید</h5>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">نام کلید (مثلاً: سایت فروشگاه)</label>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                    placeholder="نامی برای تشخیص این کلید وارد کنید"
                                />
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">سطح دسترسی (Scope)</label>
                                <select
                                    value={newKeyScope}
                                    onChange={(e) => setNewKeyScope(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="messages:send">فقط ارسال پیام (توصیه شده امنیتی)</option>
                                    <option value="all">دسترسی کامل (Full Access)</option>
                                </select>
                            </div>

                            <div className="text-right flex justify-end gap-3 mt-auto">
                                <Button variant="plain" onClick={() => setCreateDialogOpen(false)}>
                                    انصراف
                                </Button>
                                <Button variant="solid" className="bg-blue-500 hover:bg-blue-600 text-white" loading={isLoading} onClick={handleGenerateKey}>
                                    ایجاد کلید
                                </Button>
                            </div>
                        </>
                    ) : (
                        // 2. نمایش کلید تولید شده (یک‌بار مصرف)
                        <div className="py-2">
                            <h5 className="mb-2 font-bold text-lg text-green-600 text-center">کلید با موفقیت ایجاد شد</h5>

                            <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 my-6 rounded-l-md">
                                <p className="text-sm font-bold text-yellow-800 mb-1">⚠️ هشدار امنیتی بسیار مهم:</p>
                                <p className="text-xs text-yellow-700 leading-relaxed">
                                    لطفاً همین الان این کلید را کپی کرده و در تنظیمات نرم‌افزار خود ذخیره کنید. به دلیل استفاده از رمزنگاری پیشرفته (Hashing)، این کلید <strong>دیگر هرگز به شما نمایش داده نخواهد شد.</strong>
                                </p>
                            </div>

                            <div className="flex items-center gap-2 mb-8">
                                <input
                                    type="text"
                                    readOnly
                                    value={generatedToken}
                                    dir="ltr"
                                    className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded-md font-mono text-sm text-gray-800 focus:outline-none"
                                />
                                <Button
                                    variant="solid"
                                    onClick={handleCopyToken}
                                    className={`w-24 ${copySuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-800'} text-white`}
                                >
                                    {copySuccess ? 'کپی شد' : 'کپی کلید'}
                                </Button>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    variant="solid"
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={() => setCreateDialogOpen(false)}
                                >
                                    متوجه شدم، کلید را کپی کردم
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>

            {/* مودال تاییدیه ابطال */}
            <Dialog
                isOpen={revokeDialogOpen}
                onClose={() => setRevokeDialogOpen(false)}
                onRequestClose={() => setRevokeDialogOpen(false)}
            >
                <div className="flex flex-col h-full justify-between">
                    <h5 className="mb-4 font-bold text-lg text-gray-800">ابطال کلید دسترسی</h5>
                    <p className="mb-6 text-gray-600 leading-relaxed text-sm">
                        آیا از ابطال کلید <strong>"{selectedKeyToRevoke?.name}"</strong> اطمینان دارید؟
                        <br /><br />
                        <span className="text-red-500 font-semibold">هشدار:</span> با انجام این کار، تمام نرم‌افزارهایی که با این کلید متصل هستند بلافاصله قطع خواهند شد و این عملیات غیرقابل بازگشت است.
                    </p>
                    <div className="text-right mt-6 flex justify-end gap-3">
                        <Button variant="plain" onClick={() => setRevokeDialogOpen(false)}>
                            انصراف
                        </Button>
                        <Button variant="solid" color="red-600" loading={isLoading} onClick={handleRevokeKey}>
                            بله، کلید باطل شود
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ApiTokenManager;