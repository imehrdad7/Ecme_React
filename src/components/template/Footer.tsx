import Container from '@/components/shared/Container'
import classNames from '@/utils/classNames'
import { APP_NAME } from '@/constants/app.constant'
import { PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'
import { useLocation } from 'react-router-dom' // 👈 این هوک را ایمپورت کنید

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
                <span className="font-semibold">{`${APP_NAME}`}</span> همه
                حقوق محفوظ است.
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
    // گرفتن مسیر فعلی
    const location = useLocation()

    // 👈 لیست مسیرهایی که فوتر نباید در آن‌ها نمایش داده شود (مثل صفحه چت شما)
    const hiddenPaths = ['/concepts/inbox', '/chat']

    // 👈 بررسی اینکه آیا مسیر فعلی کاربر شامل یکی از مسیرهای بالا هست یا خیر
    const shouldHide = hiddenPaths.some(path => location.pathname.includes(path))

    // اگر باید مخفی شود، کلا هیچی رندر نکن
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