import Container from '@/components/shared/Container'
import classNames from '@/utils/classNames'
import { APP_NAME } from '@/constants/app.constant'
import { PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'
import { useLocation } from 'react-router-dom'

export type FooterPageContainerType = 'gutterless' | 'contained'

type FooterProps = {
    pageContainerType: FooterPageContainerType
    className?: string
}

const FooterContent = () => {
    return (
        <div className="flex items-center justify-between flex-auto w-full">
            <span>
                کپی رایت &copy; {`${new Date().getFullYear()}`}{' '}
                <span className="font-semibold">{`${APP_NAME}`}</span> همه حقوق محفوظ است.
            </span>
            <div className="">
                <a
                    className="text-gray"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    شرایط و مقررات
                </a>
                <span className="mx-2 text-muted"> | </span>
                <a
                    className="text-gray"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    حریم خصوصی و سیاست
                </a>
            </div>
        </div>
    )
}

export default function Footer({
    pageContainerType = 'contained',
    className,
}: FooterProps) {
    const location = useLocation()

    // 🌟 لیست هوشمند آدرس‌هایی که فوتر نباید در آن‌ها نمایش داده شود
    const hiddenPaths = [
        // ۱. آدرس‌های کاملاً ثابت (دقت کنید که بین /^ و $/ قرار می‌گیرند)
        /^\/concepts\/inbox$/,
        /^\/chat$/,
        
        // ۲. آدرس‌های داینامیک (بخش متغیر با [a-zA-Z0-9-]+ جایگزین شده است)
        // این الگو آدرسِ کانتکت‌های هر کمپینی با هر آیدی‌ای را مخفی می‌کند:
        /^\/concepts\/campaigns\/[a-zA-Z0-9-]+\/contacts\/?$/,

        // 💡 راهنمای اضافه کردن در آینده:
        // اگر خواستید صفحه ویرایشِ کمپین را هم مخفی کنید این را اضافه می‌کنید:
        // /^\/concepts\/campaigns\/[a-zA-Z0-9-]+\/edit\/?$/,
    ]

    // 👈 بررسی اینکه آیا مسیر فعلی با حداقل یکی از الگوهای بالا همخوانی دارد یا خیر
    const shouldHide = hiddenPaths.some(pattern => pattern.test(location.pathname))

    if (shouldHide) {
        return null
    }

    return (
        <footer
            className={classNames(
                `footer flex flex-auto items-center h-16 ${PAGE_CONTAINER_GUTTER_X}`,
                className,
            )}
        >
            {pageContainerType === 'contained' ? (
                <Container>
                    <FooterContent />
                </Container>
            ) : (
                <FooterContent />
            )}
        </footer>
    )
}