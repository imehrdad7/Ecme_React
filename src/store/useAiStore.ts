import { create } from 'zustand';
import { 
    apiGetAiConfiguration, 
    apiUpsertAiConfiguration, 
    apiGetKnowledgeDocuments, 
    apiAddKnowledgeDocument, 
    apiDeleteKnowledgeDocument,
    AiConfigurationResponse,
    KnowledgeDocumentResponse,
    UpsertAiConfigurationRequest,
    AddKnowledgeDocumentRequest
} from '../services/AiService'; // مسیر فایل سرویس را بر اساس پروژه خودتان تنظیم کنید

interface AiStore {
  // --- States ---
  config: AiConfigurationResponse | null;
  documents: KnowledgeDocumentResponse[];
  isLoading: boolean;
  error: string | null;
  
  // --- Actions ---
  fetchConfig: (companyId: string) => Promise<void>;
  saveConfig: (data: UpsertAiConfigurationRequest) => Promise<void>;
  fetchDocuments: (companyId: string) => Promise<void>;
  uploadKnowledge: (data: AddKnowledgeDocumentRequest) => Promise<void>;
  removeDocument: (id: string, companyId: string) => Promise<void>;
}

export const useAiStore = create<AiStore>((set, get) => ({
  config: null,
  documents: [],
  isLoading: false,
  error: null,

  fetchConfig: async (companyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiGetAiConfiguration(companyId);
      // نکته: اگر ApiService شما مستقیماً دیتا را برمی‌گرداند فقط بنویسید response
      // اما اگر کل آبجکت Axios را برمی‌گرداند باید response.data را بگیرید
      set({ config: response || response, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'خطا در دریافت تنظیمات ربات', isLoading: false });
    }
  },

  saveConfig: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiUpsertAiConfiguration(data);
      // آپدیت کردن استیت محلی (Local State) بدون نیاز به ریکوئست مجدد
      set((state) => ({ 
          config: { ...state.config, ...data, id: state.config?.id || '' } as AiConfigurationResponse, 
          isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'خطا در ذخیره تنظیمات', isLoading: false });
    }
  },

  fetchDocuments: async (companyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiGetKnowledgeDocuments(companyId);
      set({ documents: response || response, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'خطا در دریافت لیست منابع دانشی', isLoading: false });
    }
  },

  uploadKnowledge: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiAddKnowledgeDocument(data);
      // رفرش کردن خودکار لیست فایل‌ها بعد از آپلود موفق
      await get().fetchDocuments(data.companyId); 
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'خطا در آپلود منبع جدید', isLoading: false });
    }
  },

  removeDocument: async (id, companyId) => {
    set({ isLoading: true, error: null });
    try {
      await apiDeleteKnowledgeDocument(id, companyId);
      // حذف سریع آیتم از استیت برای تجربه کاربری بهتر (بدون نیاز به لودینگ مجدد کل لیست)
      set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'خطا در حذف منبع دانشی', isLoading: false });
    }
  }
}));