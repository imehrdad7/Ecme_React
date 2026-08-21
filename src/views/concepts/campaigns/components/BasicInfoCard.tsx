import Input from '@/components/ui/Input'

type Props = {
    campaignName: string;
    setCampaignName: (val: string) => void;
}

const BasicInfoCard = ({ campaignName, setCampaignName }: Props) => {
    return (
        <div className="p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs">۱</span>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">اطلاعات پایه</h4>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نام کمپین (جهت رهگیری در پنل)</label>
                <Input 
                    placeholder="مثال: تخفیف ویژه شب یلدا" 
                    value={campaignName} 
                    onChange={(e) => setCampaignName(e.target.value)} 
                    className="bg-gray-50 dark:bg-gray-800/50" 
                />
            </div>
        </div>
    )
}

export default BasicInfoCard