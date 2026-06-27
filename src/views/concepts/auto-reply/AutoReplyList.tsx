import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Tag from '@/components/ui/Tag'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FaTelegramPlane, FaInstagram, FaWhatsapp, FaGlobe, FaCommentDots, FaCommentAlt, FaRobot } from 'react-icons/fa' 
import { HiOutlineSearch, HiPlus, HiOutlinePencil, HiOutlineTrash, HiExclamation, HiLightningBolt } from 'react-icons/hi'
import { apiGetAutoReplies, apiDeleteAutoReply, AutoReplyResponse } from '@/services/autoReplyService'
import { useSessionUser } from '@/store/authStore' 

const { Tr, Th, Td, THead, TBody } = Table
debugger
const AutoReplyList = () => {
    const navigate = useNavigate()
    const [searchText, setSearchText] = useState('')
    const { user, setUser } = useSessionUser() 
    
    const [rules, setRules] = useState<AutoReplyResponse[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedRule, setSelectedRule] = useState<AutoReplyResponse | null>(null)

    // 🌟 دریافت دیتا از سرور هنگام لود صفحه
    useEffect(() => {
        const fetchRules = async () => {
            setIsLoading(true)
            try {
                const currentCompanyId = user.companyId
                
                const currentBotId = undefined; // یا مثلاً: selectedBotIdFilter

                const result: any = await apiGetAutoReplies({
                    CompanyId: currentCompanyId,
                    BotId: currentBotId
                })
                
                const fetchedItems = result || [];
                setRules(fetchedItems)
            } catch (error: any) {
                console.error('Error fetching auto-replies:', error)
                toast.push(
                    <Notification title="خطا در دریافت اطلاعات" type="danger" duration={5000}>
                        {error?.message || 'مشکلی در ارتباط با سرور پیش آمد.'}
                    </Notification>,
                    { placement: 'top-center' }
                )
            } finally {
                setIsLoading(false)
            }
        }

        fetchRules()
    }, [])

    const filteredRules = rules.filter(rule => 
        rule.title?.includes(searchText) || 
        (rule.keywords && rule.keywords.some(k => k.includes(searchText)))
    )

    const openDeleteDialog = (rule: AutoReplyResponse) => {
        setSelectedRule(rule)
        setIsDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false)
        setSelectedRule(null)
    }

    // 🌟 اتصال عملیات حذف به سرور
    const handleDeleteConfirm = async () => {
        if (!selectedRule) return
        setIsDeleting(true)
        
        try {
            await apiDeleteAutoReply(selectedRule.id)
            
            // آپدیت رابط کاربری پس از موفقیت
            setRules(rules.filter(r => r.id !== selectedRule.id))
            
            toast.push(
                <Notification title="حذف موفقیت‌آمیز" type="success" duration={3000}>
                    قانون "{selectedRule.title}" با موفقیت حذف شد.
                </Notification>,
                { placement: 'top-center' }
            )
            closeDeleteDialog()
        } catch (error: any) {
            toast.push(
                <Notification title="خطا" type="danger">
                    {error?.response?.data?.message || 'مشکلی در حذف پیش آمد.'}
                </Notification>, 
                { placement: 'top-center' }
            )
        } finally {
            setIsDeleting(false)
        }
    }

    const renderStatusDot = (isActive: boolean) => {
        const dotBg = isActive ? 'bg-emerald-500' : 'bg-red-500'
        const label = isActive ? 'فعال' : 'غیرفعال'

        return (
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0 mt-1" title={`وضعیت: ${label}`}>
                {isActive && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotBg} opacity-75`}></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotBg}`}></span>
            </span>
        )
    }

    const renderKeywords = (keywords: string[]) => {
        if (!keywords || keywords.length === 0) return <span className="text-xs text-gray-400">بدون کلمه کلیدی</span>
        
        const displayKeywords = keywords.slice(0, 3)
        const remainingCount = keywords.length - 3

        return (
            <div className="flex flex-wrap items-center gap-1.5">
                {displayKeywords.map((word, idx) => (
                    <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                        {word}
                    </span>
                ))}
                {remainingCount > 0 && (
                    <span className="text-[11px] text-indigo-500 font-medium px-1" title={keywords.slice(3).join(', ')}>
                        +{remainingCount}
                    </span>
                )}
            </div>
        )
    }

    const renderBotIcons = (bots: string[]) => {
        if (!bots || bots.length === 0) return <span className="text-xs text-gray-400">-</span>
        
        return (
            <div className="flex items-center gap-1.5">
                {bots.map((bot, idx) => {
                    let Icon = FaRobot; let color = 'text-gray-500'; let bg = 'bg-gray-100 dark:bg-gray-800/40';
                    
                    if (bot === 'Telegram') { Icon = FaTelegramPlane; color = 'text-sky-500'; bg = 'bg-sky-50 dark:bg-sky-900/30' }
                    else if (bot === 'Instagram') { Icon = FaInstagram; color = 'text-pink-600'; bg = 'bg-pink-50 dark:bg-pink-900/30' }
                    else if (bot === 'WhatsApp') { Icon = FaWhatsapp; color = 'text-green-500'; bg = 'bg-green-50 dark:bg-green-900/30' }
                    else if (bot === 'Web') { Icon = FaGlobe; color = 'text-indigo-500'; bg = 'bg-indigo-50 dark:bg-indigo-900/30' }
                    else if (bot === 'Rubika') { Icon = FaCommentDots; color = 'text-orange-500'; bg = 'bg-orange-50 dark:bg-orange-900/30' }
                    else if (bot === 'Bale') { Icon = FaCommentAlt; color = 'text-teal-500'; bg = 'bg-teal-50 dark:bg-teal-900/30' }

                    return (
                        <div key={idx} className={`w-6 h-6 rounded-md flex items-center justify-center ${bg}`} title={bot}>
                            <Icon className={`text-xs ${color}`} />
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                    <h3 className="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">پاسخ‌های خودکار</h3>
                    <p className="text-gray-500 text-sm">مدیریت قوانینی که ربات‌ها بر اساس کلمات کلیدی پاسخ می‌دهند</p>
                </div>
                <Button 
                    variant="solid" 
                    icon={<HiPlus className="text-lg" />} 
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => navigate('/concepts/auto-reply/create')} 
                >
                    تعریف قانون جدید
                </Button>
            </div>

            <Card className="flex-1">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        type="text"
                        placeholder="جستجو در نام قانون یا کلمات کلیدی..."
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
                                <Th className="hidden md:table-cell">کلمات کلیدی (محرک)</Th>
                                <Th className="hidden sm:table-cell">نوع تطابق</Th>
                                <Th className="hidden sm:table-cell">ربات‌های متصل</Th>
                                <Th>عملیات</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <Tr>
                                    <Td colSpan={5} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500">در حال دریافت قوانین...</span>
                                        </div>
                                    </Td>
                                </Tr>
                            ) : filteredRules.length > 0 ? (
                                filteredRules.map((rule) => (
                                    <Tr key={rule.id}>
                                        <Td>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <HiLightningBolt className="text-xl" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        {renderStatusDot(rule.isActive)}
                                                        <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                                            {rule.title}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="md:hidden flex flex-col gap-2 mt-1">
                                                        {renderKeywords(rule.keywords)}
                                                        <div className="sm:hidden flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-gray-400">متصل به:</span>
                                                            {renderBotIcons(rule.bots)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Td>
                                        
                                        <Td className="hidden md:table-cell max-w-[200px]">
                                            {renderKeywords(rule.keywords)}
                                        </Td>
                                        
                                        <Td className="hidden sm:table-cell">
                                            <Tag className={`border-0 rounded-md text-xs ${rule.matchType === 'exact' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {rule.matchType === 'exact' ? 'دقیقاً یکسان' : 'شامل کلمه'}
                                            </Tag>
                                        </Td>
                                        
                                        <Td className="hidden sm:table-cell">
                                            {renderBotIcons(rule.bots)}
                                        </Td>
                                        
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    className="text-gray-500 hover:text-indigo-600 transition-colors"
                                                    onClick={() => navigate(`/concepts/auto-reply/edit/${rule.id}`)}
                                                >
                                                    <HiOutlinePencil className="text-xl" />
                                                </button>
                                                <button 
                                                    className="text-gray-500 hover:text-red-600 transition-colors"
                                                    onClick={() => openDeleteDialog(rule)}
                                                >
                                                    <HiOutlineTrash className="text-xl" />
                                                </button>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan={5} className="text-center py-8 text-gray-500">
                                        هیچ قانون پاسخ خودکاری یافت نشد.
                                    </Td>
                                </Tr>
                            )}
                        </TBody>
                    </Table>
                </div>
            </Card>

            <Dialog
                isOpen={isDeleteDialogOpen}
                onClose={closeDeleteDialog}
                closable={!isDeleting}
                contentClassName="pb-0"
            >
                <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center flex-shrink-0">
                            <HiExclamation className="text-2xl" />
                        </div>
                        <div className="flex-1 mt-1">
                            <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">حذف پاسخ خودکار</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                آیا از حذف قانون <span className="font-bold text-gray-800 dark:text-gray-200">"{selectedRule?.title}"</span> مطمئن هستید؟ ربات‌ها دیگر به این کلمات کلیدی واکنش نشان نخواهند داد.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-5 pb-6 border-t border-gray-100 dark:border-gray-800">
                        <Button 
                            type="button" 
                            variant="default" 
                            disabled={isDeleting}
                            onClick={closeDeleteDialog}
                        >
                            انصراف
                        </Button>
                        <Button
                            loading={isDeleting}
                            variant="solid"
                            className="bg-red-600 hover:bg-red-500 text-white border-0"
                            onClick={handleDeleteConfirm}
                        >
                            {isDeleting ? 'در حال حذف...' : 'بله، حذف شود'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default AutoReplyList