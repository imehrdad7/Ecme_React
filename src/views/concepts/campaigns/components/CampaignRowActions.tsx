import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
    HiOutlinePlay, HiOutlinePause, HiOutlineStop, 
    HiOutlineTrash, HiOutlinePencil, HiOutlineUsers, 
    HiOutlineChartBar, HiDotsVertical, HiOutlineDocumentDuplicate,
    HiOutlineEye , HiOutlineUserAdd

} from 'react-icons/hi';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { apiExecuteCampaignAction, apiCloneCampaign } from '@/services/CampaignService';
import { CampaignStatus } from '../types';
import { useSessionUser } from '@/store/authStore' 

interface CampaignRowActionsProps {
    campaignId: string;
    status: number;
    totalRecipients: number;
    openDeleteModal: (id: string) => void;
    openViewContactsModal: (id: string) => void;
}

export const CampaignRowActions = ({ campaignId, status, totalRecipients, openDeleteModal, openViewContactsModal }: CampaignRowActionsProps) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
    
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user } = useSessionUser() 
    
    const [isCloning, setIsCloning] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                menuRef.current && !menuRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                setIsMenuOpen(false);
            }
        };

        const handleScroll = () => {
            if (isMenuOpen) setIsMenuOpen(false);
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, { capture: true });
        };
    }, [isMenuOpen]);

    const handleToggleMenu = () => {
        if (!isMenuOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuCoords({
                top: rect.bottom + 4, 
                left: rect.left, 
            });
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const executeAction = async (action: 'start' | 'pause' | 'cancel') => {
        setLoadingAction(action);
        setIsMenuOpen(false); 
        
        try {
            await apiExecuteCampaignAction(campaignId, action);
            toast.push(<Notification type="success" title="موفق">دستور با موفقیت ارسال شد.</Notification>, { placement: 'top-center' });
        } catch (error: any) {
            const errorMessage = error.response?.data?.Message || "خطایی رخ داد.";
            toast.push(<Notification type="danger" title="خطا">{errorMessage}</Notification>, { placement: 'top-center' });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleClone = async () => {
        setIsCloning(true);
        setIsMenuOpen(false);
        
        try {
        const requestData = {
            campaignId: campaignId,
            companyId: user?.companyId ?? ''
        };

        const response = await apiCloneCampaign(campaignId, requestData);
        const newCampaignId = response; 
        
        toast.push(<Notification type="success" title="موفق">کمپین با موفقیت کپی شد.</Notification>, { placement: 'top-center' });
        navigate(`/concepts/campaigns/${newCampaignId}/edit`);
        
    } catch (error: any) {
            const errorMessage = error.response?.data?.Message || "خطا در کپی کردن کمپین.";
            toast.push(<Notification type="danger" title="خطا">{errorMessage}</Notification>, { placement: 'top-center' });
        } finally {
            setIsCloning(false);
        }
    };

    const renderPrimaryAction = () => {
        if (loadingAction) {
            return <span className="text-xs font-medium text-gray-400 animate-pulse bg-gray-50 px-3 py-1.5 rounded-md">صبر کنید...</span>;
        }

        switch (status) {
            case CampaignStatus.Draft:
                // 🌟 منطق جدید برای دکمه‌های حالت پیش‌نویس
                if (totalRecipients === 0) {
                    return (
                        <button onClick={() => navigate(`/concepts/campaigns/${campaignId}/contacts`)} className="flex items-center justify-center w-full gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors shadow-sm border border-amber-100">
                            <HiOutlineUsers className="text-sm" />افزودن مخاطبین
                        </button>
                    );
                } else {
                    return (
                       <div className="flex flex-col gap-2 w-full sm:w-32">
                            <button onClick={() => executeAction('start')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors shadow-sm border border-emerald-100 w-full">
                                <HiOutlinePlay className="text-sm" /> شروع کمپین
                            </button>

                            <button onClick={() => navigate(`/concepts/campaigns/${campaignId}/contacts`)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors shadow-sm border border-amber-100 w-full">
                                <HiOutlineUsers className="text-sm" /> تکمیل مخاطبین
                            </button>
                        </div>
                    );
                }

            case CampaignStatus.Paused:
                return (
                    <div className="flex flex-col gap-2 w-full sm:w-32">
                        <button onClick={() => executeAction('start')} className="flex items-center justify-center w-full gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors">
                            <HiOutlinePlay className="text-sm" /> ادامه ارسال
                        </button>
                    </div>
                );

            case CampaignStatus.Retrying:
            case CampaignStatus.InProgress:
                return (
                    <div className="flex flex-col gap-2 w-full sm:w-32">
                        <button onClick={() => executeAction('pause')} className="flex items-center justify-center w-full gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors">
                            <HiOutlinePause className="text-sm" /> توقف موقت
                        </button>
                    </div>
                );
            case CampaignStatus.Completed:
            case CampaignStatus.Cancelled:
                return (
                    <div className="flex flex-col gap-2 w-full sm:w-32">
                        <button onClick={() => navigate(`/concepts/campaigns/${campaignId}/report`)} className="flex items-center justify-center w-full gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                            <HiOutlineChartBar className="text-sm" /> گزارش
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const menuContent = isMenuOpen ? (
        <div 
            ref={menuRef}
            style={{ 
                top: menuCoords.top, 
                left: menuCoords.left, 
                width: '160px'
            }}
            className="fixed bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-[9999] animate-[fadeIn_0.1s_ease-out]"
        >
            <button 
                onClick={handleClone} 
                disabled={isCloning}
                className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
                <HiOutlineDocumentDuplicate className="text-gray-400 text-lg" /> 
                {isCloning ? 'در حال کپی...' : 'کپی کردن کمپین'}
            </button>

            <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsMenuOpen(false); 
                    openViewContactsModal(campaignId); 
                }} 
                className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
                <HiOutlineEye className="text-gray-400 text-lg" /> مشاهده گیرندگان
            </button>
            
            <div className="h-px bg-gray-100 my-1 mx-2"></div>
            {status === CampaignStatus.Draft && (
                <>
                    {/* اگر کاربری خواست از منوی سه نقطه هم کمپین را شروع کند */}
                    {totalRecipients > 0 && (
                        <button onClick={() => { executeAction('start'); }} className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <HiOutlinePlay className="text-gray-400" /> شروع کمپین
                        </button>
                    )}
                    <button onClick={() => { setIsMenuOpen(false); navigate(`/concepts/campaigns/${campaignId}/edit`); }} className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <HiOutlinePencil className="text-gray-400" /> ویرایش متن
                    </button>
                </>
            )}

            {(status === CampaignStatus.InProgress || status === CampaignStatus.Paused || status === CampaignStatus.Retrying) && (
                <>
                    <button onClick={() => { setIsMenuOpen(false); navigate(`/concepts/campaigns/${campaignId}/report`); }} className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <HiOutlineChartBar className="text-gray-400" /> مشاهده گزارش
                    </button>
                    <button onClick={() => { executeAction('cancel'); }} className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <HiOutlineStop className="text-red-400" /> لغو کامل
                    </button>
                </>
            )}

            {(status === CampaignStatus.Draft || status === CampaignStatus.Cancelled || status === CampaignStatus.Completed) && (
                <>
                    {(status === CampaignStatus.Draft) && <div className="h-px bg-gray-100 my-1 mx-2"></div>}
                    <button onClick={() => { setIsMenuOpen(false); openDeleteModal(campaignId); }} className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <HiOutlineTrash className="text-red-400" /> حذف کمپین
                    </button>
                </>
            )}
        </div>
    ) : null;

    return (
        <div className="flex items-center justify-end gap-1">
            {/* 1. دکمه اصلی */}
            {renderPrimaryAction()}

            {/* 2. دکمه سه‌نقطه */}
            <button 
                ref={buttonRef}
                onClick={handleToggleMenu}
                className={`p-1.5 rounded-md transition-colors ${isMenuOpen ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}
            >
                <HiDotsVertical className="text-lg" />
            </button>

            {/* 3. رندر کردن منو در بادی */}
            {isMenuOpen && createPortal(menuContent, document.body)}
        </div>
    );
};