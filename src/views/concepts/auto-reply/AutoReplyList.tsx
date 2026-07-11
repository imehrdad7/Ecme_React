import { useState, useEffect, Fragment } from 'react' 
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Tag from '@/components/ui/Tag'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Spinner from '@/components/ui/Spinner' 
import { FaRobot, FaGlobe, FaTelegramPlane, FaInstagram, FaWhatsapp, FaImage, FaVideo, FaFileAlt, FaPowerOff } from 'react-icons/fa' // FaPowerOff اضافه شد
import { HiOutlineSearch, HiPlus, HiOutlinePencil, HiOutlineTrash, HiExclamation, HiOutlineChatAlt2, HiOutlineLightningBolt, HiOutlineTrendingUp, HiX, HiChevronUp, HiChevronDown } from 'react-icons/hi'
import { apiGetAutoReplies, apiDeleteAutoReply, apiToggleAutoReply } from '@/services/autoReplyService'
import { useSessionUser } from '@/store/authStore' 

const { Tr, Th, Td, THead, TBody } = Table

export interface AutoReplyListDto {
    id: string;
    name?: string;
    title?: string;
    priority: number;
    matchCount: number;
    isActive: boolean;
    triggersCount: number;
    responsesCount: number;
    botId?: string | null;
    botName?: string; 
    botPlatform?: string; 
    triggers?: { id: string; value: string; matchType: number }[]; 
    responses?: { id: string; content: string; replyType: number }[]; 
}

const AutoReplyList = () => {
    const navigate = useNavigate()
    const [searchText, setSearchText] = useState('')
    const { user } = useSessionUser() 
    
    const [rules, setRules] = useState<AutoReplyListDto[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedRule, setSelectedRule] = useState<AutoReplyListDto | null>(null)

    const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
    const [expandedType, setExpandedType] = useState<'triggers' | 'responses' | null>(null)

    useEffect(() => {
        if (!user || !user.companyId) return;

        const fetchRules = async () => {
            setIsLoading(true)
            try {
                const currentCompanyId = user.companyId
                const result: any = await apiGetAutoReplies({ CompanyId: currentCompanyId })
                setRules(result || [])
            } catch (error: any) {
                toast.push(<Notification title="خطا" type="danger">مشکلی در ارتباط با سرور پیش آمد.</Notification>, { placement: 'top-center' })
            } finally {
                setIsLoading(false)
            }
        }
        fetchRules()
    }, [user.companyId])

    const filteredRules = rules.filter(rule => {
        if (!searchText) return true;
        const targetName = rule.name || rule.title || '';
        return targetName.toLowerCase().includes(searchText.toLowerCase());
    });

    const handleDeleteConfirm = async () => {
        if (!selectedRule) return
        setIsDeleting(true)
        try {
            await apiDeleteAutoReply(selectedRule.id)
            setRules(rules.filter(r => r.id !== selectedRule.id))
            toast.push(<Notification title="موفقیت" type="success">قانون با موفقیت حذف شد.</Notification>, { placement: 'top-center' })
            setIsDeleteDialogOpen(false)
            setSelectedRule(null)
        } catch {
            toast.push(<Notification title="خطا" type="danger">خطا در حذف قانون.</Notification>, { placement: 'top-center' })
        } finally {
            setIsDeleting(false)
        }
    }

    // 🌟 تابع جدید برای تغییر وضعیت (تغییر بین فعال و غیرفعال)
    const handleToggleStatus = async (ruleId: string, currentStatus: boolean) => {
        try {
            // فرض بر این است که API شما یک آیدی می‌گیرد و وضعیت آن را در دیتابیس برعکس می‌کند
            await apiToggleAutoReply(ruleId); 
            
            // آپدیت سریع لیست در فرانت‌اند بدون نیاز به رفرش
            setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !currentStatus } : r));
            
            toast.push(
                <Notification title="موفقیت" type="success">
                    {currentStatus ? 'قانون غیرفعال شد.' : 'قانون فعال شد.'}
                </Notification>, 
                { placement: 'top-center' }
            );
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">تغییر وضعیت انجام نشد.</Notification>, { placement: 'top-center' });
        }
    }

    const toggleExpand = (ruleId: string, type: 'triggers' | 'responses') => {
        if (expandedRowId === ruleId && expandedType === type) {
            setExpandedRowId(null)
            setExpandedType(null)
        } else {
            setExpandedRowId(ruleId)
            setExpandedType(type)
        }
    }

    const getPlatformInfo = (platform?: string) => {
        if (!platform) return { icon: FaGlobe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
        if (platform.includes('Telegram')) return { icon: FaTelegramPlane, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/30' };
        if (platform.includes('Instagram')) return { icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/30' };
        if (platform.includes('WhatsApp')) return { icon: FaWhatsapp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' };
        return { icon: FaRobot, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' };
    }

    const renderStatusDot = (isActive: boolean) => {
        const dotBg = isActive ? 'bg-emerald-500' : 'bg-red-500'
        return (
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0 mt-1" title={isActive ? 'فعال' : 'غیرفعال'}>
                {isActive && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotBg} opacity-75`}></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotBg}`}></span>
            </span>
        )
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                    <h3 className="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">پاسخ‌های خودکار</h3>
                    <p className="text-gray-500 text-sm">مدیریت قوانینی که ربات‌ها بر اساس کلمات کلیدی پاسخ می‌دهند</p>
                </div>
                <Button variant="solid" icon={<HiPlus className="text-lg" />} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/concepts/auto-reply/create')}>
                    تعریف قانون جدید
                </Button>
            </div>

            <Card className="flex-1">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        type="text"
                        placeholder="جستجو در عنوان قانون..."
                        className="max-w-md"
                        prefix={<HiOutlineSearch className="text-lg" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <THead>
                            <Tr>
                                <Th>عنوان قانون</Th>
                                <Th className="text-center">کلمات کلیدی (محرک)</Th>
                                <Th className="text-center">محتوای پیام‌ها</Th>
                                <Th className="hidden lg:table-cell text-center">اولویت / کارکرد</Th>
                                <Th className="hidden sm:table-cell">ربات متصل</Th>
                                <Th>عملیات</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <Tr>
                                    <Td colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Spinner size="30px" />
                                            <span className="text-gray-500 text-sm mt-2">در حال دریافت قوانین...</span>
                                        </div>
                                    </Td>
                                </Tr>
                            ) : filteredRules.length > 0 ? (
                                filteredRules.map((rule) => {
                                    const platInfo = getPlatformInfo(rule.botPlatform);
                                    const ruleTitle = rule.name || rule.title || 'بدون عنوان';
                                    const isExpanded = expandedRowId === rule.id;
                                    
                                    return (
                                        <Fragment key={rule.id}>
                                            <Tr className={`transition-colors ${isExpanded ? 'bg-gray-50/80 dark:bg-gray-800/50 relative z-10' : ''}`}>
                                                <Td>
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex items-center gap-2">
                                                            {renderStatusDot(rule.isActive)}
                                                            <span className={`font-bold text-sm ${isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                                                {ruleTitle}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Td>
                                                
                                                <Td className="text-center">
                                                    <button onClick={() => toggleExpand(rule.id, 'triggers')} className="group relative outline-none">
                                                        <Tag className={`gap-1.5 cursor-pointer transition-all shadow-sm border ${isExpanded && expandedType === 'triggers' ? 'bg-amber-500 text-white border-amber-600' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400'}`}>
                                                            <HiOutlineLightningBolt className="text-sm" />
                                                            <span className="font-bold">{rule.triggersCount}</span> کلمه
                                                            {isExpanded && expandedType === 'triggers' ? <HiChevronUp className="ml-1" /> : <HiChevronDown className="ml-1 opacity-50" />}
                                                        </Tag>
                                                    </button>
                                                </Td>

                                                <Td className="text-center">
                                                    <button onClick={() => toggleExpand(rule.id, 'responses')} className="group relative outline-none">
                                                        <Tag className={`gap-1.5 cursor-pointer transition-all shadow-sm border ${isExpanded && expandedType === 'responses' ? 'bg-blue-500 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'}`}>
                                                            <HiOutlineChatAlt2 className="text-sm" />
                                                            <span className="font-bold">{rule.responsesCount}</span> پیام
                                                            {isExpanded && expandedType === 'responses' ? <HiChevronUp className="ml-1" /> : <HiChevronDown className="ml-1 opacity-50" />}
                                                        </Tag>
                                                    </button>
                                                </Td>
                                                
                                                <Td className="hidden lg:table-cell text-center">
                                                    <div className="flex flex-col items-center gap-1 text-xs">
                                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md w-max">
                                                            <span className="opacity-70">اولویت:</span> <span className="font-bold">{rule.priority}</span>
                                                        </div>
                                                        {rule.matchCount > 0 && <div className="text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1"><HiOutlineTrendingUp /> {rule.matchCount} استفاده</div>}
                                                    </div>
                                                </Td>

                                                <Td className="hidden sm:table-cell">
                                                    {rule.botId ? (
                                                        <Tag className={`${platInfo.bg} ${platInfo.color} border-0 flex items-center gap-1.5 max-w-[150px]`}>
                                                            <platInfo.icon className="text-sm flex-shrink-0" />
                                                            <span className="truncate" title={rule.botName}>{rule.botName || 'مختص یک ربات'}</span>
                                                        </Tag>
                                                    ) : (
                                                        <Tag className="bg-emerald-50 text-emerald-600 border-0 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                                                            <FaGlobe /> سراسری
                                                        </Tag>
                                                    )}
                                                </Td>
                                                
                                                <Td>
                                                    <div className="flex items-center gap-3">
                                                        {/* 🌟 دکمه تغییر وضعیت فعال/غیرفعال */}
                                                        <button 
                                                            className={`${rule.isActive ? 'text-orange-500 hover:text-orange-600' : 'text-emerald-500 hover:text-emerald-600'} transition-colors`} 
                                                            onClick={() => handleToggleStatus(rule.id, rule.isActive)} 
                                                            title={rule.isActive ? 'خاموش (غیرفعال) کردن قانون' : 'روشن (فعال) کردن قانون'}
                                                        >
                                                            <FaPowerOff className="text-lg" />
                                                        </button>

                                                        <button 
                                                            className="text-gray-500 hover:text-indigo-600 transition-colors" 
                                                            onClick={() => navigate(`/concepts/auto-reply/edit/${rule.id}`, { 
                                                                state: { 
                                                                    botPlatform: rule.botPlatform, 
                                                                    botName: rule.botName 
                                                                } 
                                                            })}           
                                                            title="ویرایش"
                                                        >
                                                            <HiOutlinePencil className="text-xl" />
                                                        </button>
                                                        
                                                        <button 
                                                            className="text-gray-500 hover:text-red-600 transition-colors" 
                                                            onClick={() => { setSelectedRule(rule); setIsDeleteDialogOpen(true) }} 
                                                            title="حذف"
                                                        >
                                                            <HiOutlineTrash className="text-xl" />
                                                        </button>
                                                    </div>
                                                </Td>
                                            </Tr>

                                            {isExpanded && (
                                                <Tr className="bg-gray-50/50 dark:bg-gray-800/30 shadow-inner">
                                                    <Td colSpan={6} className="p-0 border-b-2 border-indigo-200 dark:border-indigo-800">
                                                        <div className="p-6 animate-[fadeSlideDown_0.2s_ease-out_forwards]">
                                                            
                                                            {expandedType === 'triggers' && (
                                                                <div className="flex flex-col gap-4">
                                                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 border-b border-gray-200 dark:border-gray-700 pb-2">
                                                                        <HiOutlineLightningBolt className="text-lg" />
                                                                        <h4 className="font-bold text-sm">لیست کلمات کلیدی این قانون</h4>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {rule.triggers && rule.triggers.length > 0 ? (
                                                                            rule.triggers.map(t => (
                                                                                <div key={t.id} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 pl-2 pr-3 py-1.5 rounded-xl shadow-sm">
                                                                                    <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{t.value}</span>
                                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.matchType === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                                                                                        {t.matchType === 1 ? 'دقیق' : 'شامل'}
                                                                                    </span>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <span className="text-sm text-gray-400">کلمه‌ای یافت نشد.</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {expandedType === 'responses' && (
                                                                <div className="flex flex-col gap-4">
                                                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 border-b border-gray-200 dark:border-gray-700 pb-2">
                                                                        <HiOutlineChatAlt2 className="text-lg" />
                                                                        <h4 className="font-bold text-sm">پیام‌های ارسال‌شونده توسط ربات</h4>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                        {rule.responses && rule.responses.length > 0 ? (
                                                                            rule.responses.map((res, index) => (
                                                                                <div key={res.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex items-start gap-3 shadow-sm">
                                                                                    <div className="mt-1 flex-shrink-0 text-gray-400">
                                                                                        {res.replyType === 1 && <HiOutlineChatAlt2 className="text-lg" />}
                                                                                        {res.replyType === 2 && <FaImage className="text-lg" />}
                                                                                        {res.replyType === 3 && <FaVideo className="text-lg" />}
                                                                                        {res.replyType === 4 && <FaFileAlt className="text-lg" />}
                                                                                    </div>
                                                                                    <div className="flex flex-col flex-1 overflow-hidden">
                                                                                        <span className="text-[10px] text-gray-400 font-bold mb-1 border-b border-gray-100 dark:border-gray-800 pb-1 w-full">پیام {index + 1}</span>
                                                                                        {res.replyType === 1 ? (
                                                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{res.content}</p>
                                                                                        ) : (
                                                                                            <a href={res.content} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline truncate w-full block" dir="ltr">
                                                                                                مشاهده فایل پیوست
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <span className="text-sm text-gray-400">پیامی یافت نشد.</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Fragment>
                                    )
                                })
                            ) : (
                                <Tr><Td colSpan={6} className="text-center py-16 text-gray-500">هیچ قانون پاسخ خودکاری یافت نشد. همین الان برای ایجاد اولین قانون اقدام کنید</Td></Tr>
                            )}
                        </TBody>
                    </Table>
                </div>
            </Card>

            <Dialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} closable={!isDeleting} contentClassName="pb-0">
                <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center flex-shrink-0">
                            <HiExclamation className="text-2xl" />
                        </div>
                        <div className="flex-1 mt-1">
                            <h5 className="text-lg font-bold mb-2">حذف پاسخ خودکار</h5>
                            <p className="text-sm text-gray-500 leading-relaxed">آیا از حذف این قانون مطمئن هستید؟</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-5 pb-6 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(false)}>انصراف</Button>
                        <Button loading={isDeleting} variant="solid" className="bg-red-600 hover:bg-red-500" onClick={handleDeleteConfirm}>بله، حذف شود</Button>
                    </div>
                </div>
            </Dialog>

            <style>{`
                @keyframes fadeSlideDown { 
                    0% { opacity: 0; transform: translateY(-10px); } 
                    100% { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    )
}

export default AutoReplyList