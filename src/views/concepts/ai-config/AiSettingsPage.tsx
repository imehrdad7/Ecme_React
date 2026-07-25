import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
    HiArrowRight, 
    HiOutlineSave, 
    HiSparkles, 
    HiX,
    HiOutlinePlus,
    HiOutlineVariable
} from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

import { useAiStore } from '../../../store/useAiStore'
import { useSessionUser } from '@/store/authStore'

// ==========================================
// Zod Validation Schema
// ==========================================
const configValidationSchema = z.object({
    isActive: z.boolean(),
    selectedModel: z.number(),
    temperature: z.number().min(0).max(1),
    promptRole: z.array(z.string()).min(1, { message: 'تعیین حداقل یک نقش الزامی است' }),
    promptTone: z.array(z.string()).min(1, { message: 'تعیین لحن الزامی است' }),
    promptRules: z.array(z.string()).min(1, { message: 'تعیین قوانین الزامی است' }),
    fallbackMessage: z.string().min(3, { message: 'وارد کردن پیام جایگزین الزامی است' }),
    promptVariables: z.array(
        z.object({
            key: z.string().min(1, 'نام متغیر الزامی است'),
            value: z.string().min(1, 'مقدار الزامی است')
        })
    )
})

type ConfigFormSchema = z.infer<typeof configValidationSchema>

// ==========================================
// Default AI Behaviors
// ==========================================
const DEFAULT_ROLES = [
    'شما یک دستیار هوشمند و مودب برای پشتیبانی مشتریان هستید.',
    'وظیفه اصلی شما راهنمایی کاربران و پاسخ به سوالات آن‌هاست.'
]
const DEFAULT_TONES = [
    'لحن شما باید صمیمی، محترمانه و حرفه‌ای باشد.',
    'پاسخ‌ها را کوتاه، مفید و بدون حاشیه ارائه دهید.'
]
const DEFAULT_RULES = [
    'از ارائه اطلاعات غلط یا ساختگی جداً خودداری کنید.',
    'در مورد برندهای رقیب و سیاست‌های قیمت‌گذاری اظهار نظر نکنید.'
]
const DEFAULT_FALLBACK = 'متاسفانه در حال حاضر اطلاعاتی برای پاسخ به این سوال ندارم. لطفاً با تیم پشتیبانی تماس بگیرید.'

// ==========================================
// Custom Minimal Tag Input 
// ==========================================
const TagInput = ({ value = [], onChange, placeholder, disabled }: { value: string[], onChange: (v: string[]) => void, placeholder: string, disabled?: boolean }) => {
    const [inputValue, setInputValue] = useState('')

    const handleAdd = () => {
        if (inputValue.trim()) {
            onChange([...value, inputValue.trim()])
            setInputValue('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    const removeTag = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove))
    }

    return (
        <div className="flex flex-col gap-3 w-full mt-2">
            <div className="relative flex items-center">
                <input
                    type="text"
                    disabled={disabled}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full h-11 pl-4 pr-11 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 outline-none text-gray-700 dark:text-gray-200 transition-all text-sm disabled:opacity-50"
                />
                <button 
                    type="button" 
                    onClick={handleAdd}
                    disabled={disabled || !inputValue.trim()}
                    className="absolute right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50 disabled:hover:bg-indigo-100 transition-colors"
                >
                    <HiOutlinePlus />
                </button>
            </div>
            
            {value.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                    {value.map((tag, index) => (
                        <div key={index} className="flex items-start justify-between gap-3 group px-1 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                                <span className="text-indigo-400 mt-1 text-[10px]">■</span>
                                <span className="leading-relaxed">{tag}</span>
                            </div>
                            {!disabled && (
                                <button 
                                    type="button" 
                                    onClick={() => removeTag(index)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
                                >
                                    <HiX />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ==========================================
// Main Component
// ==========================================
const AiSettingsPage = () => {
    const navigate = useNavigate()
    const { user } = useSessionUser()
    const CompanyId = user?.companyId || ''

    const { config, isLoading, fetchConfig, saveConfig } = useAiStore()

    const configForm = useForm<ConfigFormSchema>({
        resolver: zodResolver(configValidationSchema),
        defaultValues: {
            isActive: true,
            selectedModel: 2,
            temperature: 0.7,
            promptRole: DEFAULT_ROLES,
            promptTone: DEFAULT_TONES,
            promptRules: DEFAULT_RULES,
            fallbackMessage: DEFAULT_FALLBACK,
            promptVariables: []
        }
    })

    const { fields: variableFields, append: appendVariable, remove: removeVariable } = useFieldArray({
        control: configForm.control,
        name: "promptVariables"
    });

    const isAiActive = configForm.watch('isActive')

    useEffect(() => {
        if (CompanyId) fetchConfig(CompanyId)
    }, [CompanyId, fetchConfig])

    // مقداردهی اولیه فرم هنگام دریافت اطلاعات از بک‌اند
    useEffect(() => {
        if (config) {
            const safeConfig = config as any;
            
            // تبدیل JSON متغیرها از بک‌اند به آرایه برای فرم
            let parsedVariables: { key: string; value: string }[] = [];
            if (safeConfig.promptVariablesJson) {
                try {
                    const varsObj = JSON.parse(safeConfig.promptVariablesJson);
                    parsedVariables = Object.keys(varsObj).map(key => ({
                        key,
                        value: varsObj[key]
                    }));
                } catch (e) {
                    console.error("Failed to parse variables JSON");
                }
            }

            configForm.reset({
                isActive: safeConfig.isActive ?? true,
                selectedModel: safeConfig.selectedModel ?? 2,
                temperature: safeConfig.temperature ?? 0.7,
                promptRole: safeConfig.role ? safeConfig.role.split('\n') : DEFAULT_ROLES,
                promptTone: safeConfig.tone ? safeConfig.tone.split('\n') : DEFAULT_TONES,
                promptRules: safeConfig.businessRules ? safeConfig.businessRules.split('\n') : DEFAULT_RULES,
                fallbackMessage: safeConfig.fallbackMessage || DEFAULT_FALLBACK,
                promptVariables: parsedVariables
            })
        }
    }, [config, configForm])

    const handleSaveConfig = async (values: ConfigFormSchema) => {
        try {
            // تبدیل آرایه متغیرها به یک آبجکت JSON برای بک‌اند
            const variablesObj: Record<string, string> = {};
            values.promptVariables.forEach(v => {
                if (v.key && v.value) {
                    // حذف براکت‌های احتمالی اگر کاربر اشتباها وارد کرده باشد
                    const cleanKey = v.key.replace(/[{}]/g, '').trim(); 
                    variablesObj[cleanKey] = v.value.trim();
                }
            });

            const payload = {
                companyId: CompanyId,
                isActive: values.isActive,
                selectedModel: values.selectedModel,
                temperature: values.temperature,
                promptVariablesJson: JSON.stringify(variablesObj),
                role: values.promptRole.join('\n'),
                tone: values.promptTone.join('\n'),
                businessRules: values.promptRules.join('\n'),
                fallbackMessage: values.fallbackMessage,
                systemPrompt: `### نقش ###\n${values.promptRole.join('\n')}\n### لحن ###\n${values.promptTone.join('\n')}\n### قوانین ###\n${values.promptRules.join('\n')}`
            };

            await saveConfig(payload);
            
            toast.push(
                <Notification title="تنظیمات ذخیره شد" type="success" duration={4000}>
                    رفتار و مدل هوش مصنوعی با موفقیت بروزرسانی گردید.
                </Notification>, { placement: 'top-center' }
            )
        } catch (error) {
            toast.push(
                <Notification title="خطا" type="danger" duration={5000}>
                    مشکلی در ذخیره تنظیمات پیش آمد. لطفاً فیلدها را بررسی کنید.
                </Notification>, { placement: 'top-center' }
            )
        }
    }

    return (
        <div className="flex flex-col gap-6 relative pb-12 w-full max-w-5xl mx-auto">
            
            <div className="sticky top-[55px] md:top-[70px] z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all mt-2">                
                <div className="flex items-center gap-4">
                    <Button 
                        shape="circle" variant="plain" 
                        className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        icon={<HiArrowRight className="text-xl" />} onClick={() => navigate(-1)}
                    />
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">تنظیمات هوش مصنوعی</h3>
                        <p className="text-gray-500 text-sm mt-0.5 hidden md:block">پیکربندی رفتار و چارچوب پاسخ‌دهی ربات</p>
                    </div>
                </div>

                <Button
                    form="ai-config-form" size="sm" loading={isLoading} variant="solid" type="submit"
                    icon={<HiOutlineSave className="text-lg" />}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 px-6"
                >
                    ذخیره تنظیمات
                </Button>
            </div>

            <Form id="ai-config-form" onSubmit={configForm.handleSubmit(handleSaveConfig)} className="flex flex-col gap-6">
                
                {/* کارت اول: پیکربندی پایه */}
                <Card className="w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm rounded-3xl p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5 mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isAiActive ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                ⚙️
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">پیکربندی پایه</h4>
                                <p className="text-xs text-gray-500 mt-1">انتخاب مدل و فعال‌سازی</p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-3 p-2 px-4 rounded-xl transition-colors ${isAiActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
                            <span className={`text-sm font-bold ${isAiActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500'}`}>
                                {isAiActive ? 'هوش مصنوعی فعال است' : 'هوش مصنوعی خاموش'}
                            </span>
                            <Controller
                                name="isActive" control={configForm.control}
                                render={({ field }) => (
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input type="checkbox" className="sr-only peer" checked={field.value} onChange={field.onChange} />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-indigo-600"></div>
                                    </label>
                                )}
                            />
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-300 ${!isAiActive ? 'opacity-40 pointer-events-none' : ''}`}>
                        <FormItem label="مدل زبانی (LLM)" invalid={Boolean(configForm.formState.errors.selectedModel)} errorMessage={configForm.formState.errors.selectedModel?.message}>
                            <Controller
                                name="selectedModel" control={configForm.control}
                                render={({ field }) => (
                                    <select 
                                        disabled={!isAiActive}
                                        className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                                        value={field.value} onChange={(e) => field.onChange(Number(e.target.value))}
                                    >
                                        <option value={0}>GPT-4o</option>
                                        <option value={1}>GPT-4o Mini</option>
                                        <option value={2}>DeepSeek Chat</option>
                                        <option value={3}>Claude 3.5 Sonnet</option>
                                    </select>
                                )}
                            />
                        </FormItem>

                        <FormItem label={`درجه خلاقیت (${configForm.watch('temperature')})`} invalid={Boolean(configForm.formState.errors.temperature)} errorMessage={configForm.formState.errors.temperature?.message}>
                            <Controller
                                name="temperature" control={configForm.control}
                                render={({ field }) => (
                                    <div className="pt-2">
                                        <input 
                                            type="range" min="0" max="1" step="0.1" disabled={!isAiActive}
                                            className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                            value={field.value} onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 font-medium mt-2 px-1">
                                            <span>دقیق و پایدار (0)</span>
                                            <span>آزاد و خلاقانه (1)</span>
                                        </div>
                                    </div>
                                )}
                            />
                        </FormItem>
                    </div>
                </Card>

                {/* کارت دوم: پرامپت بیلدر */}
                <Card className={`w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm rounded-3xl p-6 md:p-8 transition-all duration-300 ${!isAiActive ? 'opacity-40 pointer-events-none' : ''}`}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <HiSparkles className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">ساختار دستورات هوش مصنوعی</h4>
                                <p className="text-xs text-gray-500 mt-1">شخصیت، لحن و قوانین ربات را در قالب جملات کوتاه بنویسید.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">
                        <div>
                            <h5 className="text-base font-bold text-blue-600 dark:text-blue-400">۱. نقش و هویت ربات</h5>
                            <FormItem 
                                invalid={Boolean(configForm.formState.errors.promptRole)} 
                                errorMessage={configForm.formState.errors.promptRole?.message} 
                                className="mb-0"
                            >
                                <Controller
                                    name="promptRole" control={configForm.control}
                                    render={({ field }) => (
                                        <TagInput 
                                            disabled={!isAiActive} value={field.value} onChange={field.onChange} 
                                            placeholder="مثال: تو یک دستیار فروش خبره هستی..." 
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="h-px w-full bg-gray-100 dark:bg-gray-800"></div>

                        <div>
                            <h5 className="text-base font-bold text-purple-600 dark:text-purple-400">۲. لحن پاسخگویی</h5>
                            <FormItem invalid={Boolean(configForm.formState.errors.promptTone)} errorMessage={configForm.formState.errors.promptTone?.message} className="mb-0">
                                <Controller
                                    name="promptTone" control={configForm.control}
                                    render={({ field }) => (
                                        <TagInput 
                                            disabled={!isAiActive} value={field.value} onChange={field.onChange} 
                                            placeholder="مثال: پاسخ‌ها باید دوستانه و کوتاه باشند..." 
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="h-px w-full bg-gray-100 dark:bg-gray-800"></div>

                        <div>
                            <h5 className="text-base font-bold text-red-600 dark:text-red-400">۳. قوانین و محدودیت‌ها</h5>
                            <FormItem invalid={Boolean(configForm.formState.errors.promptRules)} errorMessage={configForm.formState.errors.promptRules?.message} className="mb-0">
                                <Controller
                                    name="promptRules" control={configForm.control}
                                    render={({ field }) => (
                                        <TagInput 
                                            disabled={!isAiActive} value={field.value} onChange={field.onChange} 
                                            placeholder="مثال: اگر قیمت را نمیدانستی کاربر را به سایت ارجاع بده..." 
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="h-px w-full bg-gray-100 dark:bg-gray-800"></div>

                        <div>
                            <h5 className="text-base font-bold text-amber-600 dark:text-amber-400">۴. پیام جایگزین (Fallback Message)</h5>
                            <p className="text-xs text-gray-500 mt-1 mb-3">وقتی ربات متوجه منظور کاربر نشود یا جوابی نداشته باشد، این پیام را می‌فرستد.</p>
                            <FormItem 
                                invalid={Boolean(configForm.formState.errors.fallbackMessage)} 
                                errorMessage={configForm.formState.errors.fallbackMessage?.message} 
                                className="mb-0"
                            >
                                <Controller
                                    name="fallbackMessage" control={configForm.control}
                                    render={({ field }) => (
                                        <textarea 
                                            {...field}
                                            disabled={!isAiActive}
                                            rows={2}
                                            placeholder="مثال: متاسفانه پاسخ این سوال را نمی‌دانم..."
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 outline-none text-gray-700 dark:text-gray-200 transition-all text-sm disabled:opacity-50 resize-none leading-relaxed"
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                    </div>
                </Card>

                {/* کارت سوم: متغیرهای داینامیک */}
                <Card className={`w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm rounded-3xl p-6 md:p-8 transition-all duration-300 ${!isAiActive ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <HiOutlineVariable className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">متغیرهای پویا (Dynamic Variables)</h4>
                                <p className="text-xs text-gray-500 mt-1">با تعریف متغیرها، می‌توانید در بخش قوانین از <span className="dir-ltr inline-block bg-gray-100 dark:bg-gray-700 px-1 rounded">{"{{نام_متغیر}}"}</span> استفاده کنید.</p>
                            </div>
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="dashed" 
                            disabled={!isAiActive}
                            icon={<HiOutlinePlus />} 
                            onClick={() => appendVariable({ key: '', value: '' })}
                        >
                            افزودن متغیر جدید
                        </Button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {variableFields.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                هنوز هیچ متغیری تعریف نکرده‌اید.
                            </div>
                        ) : (
                            variableFields.map((field, index) => (
                                <div key={field.id} className="flex flex-col md:flex-row items-start md:items-center gap-3 group relative bg-gray-50/50 dark:bg-gray-900/20 p-3 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                    
                                    {/* Key Input (نام متغیر) */}
                                    <div className="w-full md:w-1/3">
                                        <Controller
                                            name={`promptVariables.${index}.key`}
                                            control={configForm.control}
                                            render={({ field: inputField }) => (
                                                <div className="flex items-center h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all dir-ltr overflow-hidden shadow-sm">
                                                    <span className="pl-3 pr-1 text-gray-400 select-none font-bold text-sm tracking-widest bg-gray-50 dark:bg-gray-900 h-full flex items-center border-r border-gray-100 dark:border-gray-700">
                                                        {"{{"}
                                                    </span>
                                                    <input
                                                        {...inputField}
                                                        disabled={!isAiActive}
                                                        placeholder="VarName"
                                                        className="flex-1 w-full bg-transparent border-none outline-none text-indigo-600 dark:text-indigo-400 font-semibold text-base text-center px-2 placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
                                                        onChange={(e) => {
                                                            // حذف خودکار اسپیس و آکولادهای اضافه در زمان تایپ
                                                            const cleanValue = e.target.value.replace(/[{ }\-!@#$%^&*()+=\[\]\\|;:'",.<>/?]/g, '');
                                                            inputField.onChange(cleanValue);
                                                        }}
                                                    />
                                                    <span className="pr-3 pl-1 text-gray-400 select-none font-bold text-sm tracking-widest bg-gray-50 dark:bg-gray-900 h-full flex items-center border-l border-gray-100 dark:border-gray-700">
                                                        {"}}"}
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    
                                    {/* علامت مساوی نمایشی */}
                                    <div className="hidden md:flex items-center justify-center text-gray-400">
                                        =
                                    </div>

                                    {/* Value Input (مقدار متغیر) */}
                                    <div className="w-full md:flex-1 flex items-center gap-2">
                                        <Controller
                                            name={`promptVariables.${index}.value`}
                                            control={configForm.control}
                                            render={({ field: inputField }) => (
                                                <input
                                                    {...inputField}
                                                    disabled={!isAiActive}
                                                    placeholder="مقدار متغیر (مثلاً: فروشگاه دیجی‌کالا)"
                                                    className="w-full h-11 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 transition-all text-sm shadow-sm"
                                                />
                                            )}
                                        />
                                        
                                        {/* دکمه حذف */}
                                        <button
                                            type="button"
                                            disabled={!isAiActive}
                                            onClick={() => removeVariable(index)}
                                            className="w-11 h-11 shrink-0 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                                        >
                                            <HiX className="text-lg" />
                                        </button>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>
                </Card>

            </Form>
        </div>
    )
}

export default AiSettingsPage