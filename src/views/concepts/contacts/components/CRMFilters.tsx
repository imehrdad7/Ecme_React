import React from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { HiOutlineSearch, HiOutlineTag, HiOutlineFilter } from 'react-icons/hi'
import { Platform } from '../types'

type CRMFiltersProps = {
    searchQuery: string;
    handleSearchChange: (value: string) => void;
    filterTag: string | 'All';
    handleTagFilterChange: (tag: string | 'All') => void;
    appTags: Record<string, { color: string; id: string }>
    filterPlatform: Platform | 'All';
    handlePlatformChange: (plat: Platform | 'All') => void;
}

const CRMFilters: React.FC<CRMFiltersProps> = ({
    searchQuery,
    handleSearchChange,
    filterTag,
    handleTagFilterChange,
    appTags,
    filterPlatform,
    handlePlatformChange
}) => {
    return (
        <Card className=" border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="flex-1 w-full relative">
                    <Input 
                        placeholder="جستجوی نام، آیدی، شماره موبایل..." 
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                        className="bg-gray-50 dark:bg-gray-800/50"
                    />
                </div>
                
                <div className="w-full md:w-auto flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 ml-1 whitespace-nowrap"><HiOutlineTag className="inline mr-1"/> برچسب:</span>
                        <select
                            value={filterTag}
                            onChange={(e) => handleTagFilterChange(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none min-w-[120px] cursor-pointer"
                        >
                            <option value="All" className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                همه برچسب‌ها
                            </option>
                            {Object.keys(appTags).map(tag => (
                                <option key={tag} value={tag} className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                    {tag}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3">
                        <span className="text-xs font-bold text-gray-400 ml-1 whitespace-nowrap"><HiOutlineFilter className="inline mr-1"/> پلتفرم:</span>
                        {['All', 'Telegram', 'WhatsApp', 'Instagram', 'Web'].map((plat) => (
                            <button
                                key={plat}
                                onClick={() => handlePlatformChange(plat as Platform | 'All')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${filterPlatform === plat ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                {plat === 'All' ? 'همه' : plat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default CRMFilters;