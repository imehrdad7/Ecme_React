import { useState, useEffect } from 'react';
import { HiOutlineUserAdd, HiOutlineTrash, HiOutlinePencil, HiOutlineShieldCheck } from 'react-icons/hi';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { InviteOperatorModal } from './InviteOperatorModal';
import { useSessionUser } from '@/store/authStore' 
import { apiGetTeamMembers } from '@/services/teamService';
import { EditOperatorModal } from './EditOperatorModal';
import { DeleteOperatorModal } from './DeleteOperatorModal';
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'


// تایپ فرضی برای اعضای تیم
type TeamMember = {
    id: string;
    phoneNumber: string;
    role: 'SuperAdmin' | 'Admin' | 'User';
    isActive: boolean;
    firstName: string;  
    lastName: string;
    email: string;
};

const TeamManagement = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const { user, setUser } = useSessionUser() 
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
    const fetchTeamMembers = async () => {
        if (!user?.companyId) return;
        
        setIsLoading(true);
        try {
            const response = await apiGetTeamMembers<any>(user?.companyId);
            const items = response?.data || response || [];
            setTeamMembers(items);
        } catch (error) {
            console.error("خطا در دریافت لیست تیم:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // دریافت دیتا در زمان لود شدن کامپوننت
    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const handleActionSuccess = (message: string) => {
        toast.push(
            <Notification title="موفقیت‌آمیز" type="success" duration={4000}>
                {message}
            </Notification>,
            { placement: 'top-center' }
        );
        fetchTeamMembers();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">
            
            {/* هدر صفحه */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">مدیریت تیم و اپراتورها</h2>
                    <p className="text-sm text-gray-500 mt-1">همکاران خود را دعوت کنید تا در پاسخ‌گویی به مشتریان به شما کمک کنند.</p>
                </div>
                <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    icon={<HiOutlineUserAdd className="text-lg" />}
                    onClick={() => setShowAddModal(true)}
                >
                    افزودن اپراتور جدید
                </Button>
            </div>

            {/* جدول لیست اعضا */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                            <tr>
                                <th className="py-4 px-6 font-medium">نام و نام خانوادگی</th>
                                <th className="py-4 px-6 font-medium">شماره تماس (نام کاربری)</th>
                                <th className="py-4 px-6 font-medium">نقش</th>
                                <th className="py-4 px-6 font-medium">وضعیت</th>
                                <th className="py-4 px-6 font-medium text-left">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {teamMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                    
                                    {/* اطلاعات پایه کاربر */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar size={40} shape="circle" className="bg-indigo-50 text-indigo-600 font-bold">
                                                {member.firstName.charAt(0)}
                                            </Avatar>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{member.firstName + " " +member.lastName}</span>
                                        </div>
                                    </td>

                                    {/* شماره تماس */}
                                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-mono text-sm" dir="ltr">
                                        {member.phoneNumber}
                                    </td>

                                    {/* نقش کاربری */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5">
                                            {member.role === 'User' ? (
                                               <Tag className="bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                                                اپراتور
                                                </Tag>
                                            ) : (
                                                 <Tag className="bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800">
                                                    <HiOutlineShieldCheck className="text-sm mr-1 inline" />مدیر سیستم
                                                </Tag>
                                            )}
                                        </div>
                                    </td>

                                    {/* وضعیت */}
                                    <td className="py-4 px-6">
                                        {member.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> فعال
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span> غیرفعال
                                            </span>
                                        )}
                                    </td>

                                    {/* دکمه‌های عملیات */}
                                    <td className="py-4 px-6 text-left">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* دکمه ویرایش */}
                                            {member.role !== 'Admin' && member.role !== 'SuperAdmin' && (
                                                <Button 
                                                    size="sm" shape="circle" variant="plain" 
                                                    onClick={() => setEditingMember(member)}
                                                    icon={<HiOutlinePencil className="text-gray-500 hover:text-indigo-600 text-lg" />} 
                                                />
                                            )}          
                                            {member.role !== 'Admin' && member.role !== 'SuperAdmin' && (
                                                <Button 
                                                    size="sm" shape="circle" variant="plain" 
                                                    onClick={() => setDeletingMember(member)}
                                                    icon={<HiOutlineTrash className="text-gray-500 hover:text-red-500 text-lg" />} 
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteOperatorModal 
                isOpen={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                onSuccess={() => handleActionSuccess('همکار جدید با موفقیت به تیم اضافه شد.')}
            />
            <EditOperatorModal 
                isOpen={!!editingMember} 
                onClose={() => setEditingMember(null)} 
                onSuccess={() => handleActionSuccess('اطلاعات کاربر با موفقیت به‌روزرسانی شد.')}
                member={editingMember}
            />

            <DeleteOperatorModal 
                isOpen={!!deletingMember} 
                onClose={() => setDeletingMember(null)} 
                onSuccess={() => handleActionSuccess('دسترسی همکار با موفقیت لغو شد.')}
                member={deletingMember}
            />
        </div>
    );
};

export default TeamManagement;