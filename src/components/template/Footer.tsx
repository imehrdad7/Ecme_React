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

    const hiddenPaths = [
        /^\/concepts\/inbox$/,
        /^\/chat$/,
        /^\/concepts\/bots\/bot-create$/,
        /^\/concepts\/bots\/bot-list$/,
        /^\/concepts\/auto-reply\/list$/,
        /^\/concepts\/auto-reply\/create$/,
        /^\/concepts\/CampaignList$/,
        /^\/concepts\/hand-off\/HandoffSettingsForm$/,
        /^\/concepts\/campaigns\/[a-zA-Z0-9-]+\/contacts\/?$/,
    ]

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