import React from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { HiX, HiOutlineTag, HiCheck, HiOutlineTrash } from 'react-icons/hi'
import { availableTagThemes } from '../../types'

type TagManagementModalProps = {
    isOpen: boolean;
    onClose: () => void;
    appTags: Record<string, { color: string; id: string }>;
    newTagName: string;
    setNewTagName: (name: string) => void;
    selectedThemeId: string;
    setSelectedThemeId: (id: string) => void;
    handleCreateAppTag: () => void;
    handleDeleteAppTag: (tagName: string) => void;
}

const TagManagementModal: React.FC<TagManagementModalProps> = ({
    isOpen, onClose, appTags, newTagName, setNewTagName, 
    selectedThemeId, setSelectedThemeId, handleCreateAppTag, handleDeleteAppTag
}) => {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} closable={false} width={500} contentClassName="p-0 border-0 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex flex-col">
                <div className="relative bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800/80 p-6 flex items-center gap-4">
                    <button onClick={onClose} className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors">
                        <HiX className="text-xl" />
                    </button>
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <HiOutlineTag className="text-2xl" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">مدیریت برچسب‌ها (Tags)</h4>
                        <p className="text-xs text-gray-500 mt-1">ساخت و حذف برچسب برای دسته‌بندی بهتر مخاطبین</p>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-6 custom-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                    <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">نام برچسب جدید</label>
                            <div className="flex gap-2">
                                <Input placeholder="مثال: مشتری VIP" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="bg-white dark:bg-gray-900 flex-1" onKeyDown={(e) => e.key === 'Enter' && handleCreateAppTag()} />
                                <Button variant="solid" className="bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={handleCreateAppTag}>افزودن</Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">رنگ برچسب</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                {availableTagThemes.map(theme => (
                                    <button key={theme.id} onClick={() => setSelectedThemeId(theme.id)} style={{ backgroundColor: theme.color }} className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${selectedThemeId === theme.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-indigo-500' : ''}`}>
                                        {selectedThemeId === theme.id && <HiCheck className="text-white text-sm drop-shadow-md" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 border-b border-gray-100 dark:border-gray-800 pb-2">
                            لیست برچسب‌های فعلی
                        </h5>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(appTags).map(([tagName, tagData]) => (
                                    <div 
                                    key={tagName} 
                                    className="flex items-center justify-between p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group bg-white dark:bg-gray-900 shadow-sm"
                                >
                                    <span 
                                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border truncate ${tagData.color}`}                              
                                        title={tagName}
                                    >
                                        {tagName}
                                    </span>
                                    <button 
                                        onClick={() => handleDeleteAppTag(tagName)} 
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                                        title="حذف برچسب"
                                    >
                                        <HiOutlineTrash className="text-base" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        {Object.keys(appTags).length === 0 && (
                            <div className="text-center text-xs text-gray-400 py-4">
                                هیچ برچسبی ثبت نشده است.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default TagManagementModal;