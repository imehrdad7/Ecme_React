import { lazy } from 'react'
import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'
import { SuperAdmin, ADMIN, USER } from '@/constants/roles.constant'


const conceptsRoute: Routes = [
    {
        key: 'concepts.bots.botList',
        path: '/concepts/bots/bot-list',
        component: lazy(() => import('@/views/concepts/bots/bot-list/BotList')),
        authority: [SuperAdmin, ADMIN, USER],
    },
    {
        key: 'concepts.bots.botCreate',
        path: '/concepts/bots/bot-create',
        component: lazy(() => import('@/views/concepts/bots/bot-create/BotCreate')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'concepts.bots.botEdit',
        path: '/concepts/bots/bot-edit/:id',
        component: lazy(() => import('@/views/concepts/bots/bot-edit/BotEdit')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'concepts.autoReply.list',
        path: '/concepts/auto-reply/list',
        component: lazy(() => import('@/views/concepts/auto-reply/AutoReplyList')),
        authority: [SuperAdmin, ADMIN, USER],
    },
    {
        key: 'concepts.autoReply.create',
        path: '/concepts/auto-reply/create', 
        component: lazy(() => import('@/views/concepts/auto-reply/AutoReplyForm')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'concepts.autoReply.edit',
        path: '/concepts/auto-reply/edit/:id',
        component: lazy(() => import('@/views/concepts/auto-reply/AutoReplyForm')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'concepts.inbox',
        path: '/concepts/inbox',
        component: lazy(() => import('@/views/concepts/Inbox/Inbox')),
        authority: [SuperAdmin, ADMIN, USER],
    },
    {
        key: 'concepts.dashboard',
        path: '/concepts/dashboard',
        component: lazy(() => import('@/views/concepts/dashboard/Dashboard')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'concepts.Integrations',
        path: '/concepts/Integrations',
        component: lazy(() => import('@/views/concepts/integrations/Integrations')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'concepts.WidgetBuilder',
        path: '/concepts/WidgetBuilder',
        component: lazy(() => import('@/views/concepts/widget-builder/WidgetBuilder')),
        authority: [SuperAdmin, ADMIN, USER],
    },
    {
        key: 'concepts.CampaignList',
        path: '/concepts/CampaignList',
        component: lazy(() => import('@/views/concepts/campaigns/CampaignList')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'campaigns-create',
        path: '/concepts/campaigns/create',
        component: lazy(() => import('@/views/concepts/campaigns/CampaignForm')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'campaigns-edit',
        path: '/concepts/campaigns/:id/edit',
        component: lazy(() => import('@/views/concepts/campaigns/CampaignForm')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'campaigns-contacts',
        path: '/concepts/campaigns/:campaignId/contacts',
        component: lazy(() => import('@/views/concepts/campaigns/CampaignContacts')),
        authority: [SuperAdmin, ADMIN], 
    },
    {
        key: 'campaigns-Report',
        path: '/concepts/campaigns/:campaignId/report',
        component: lazy(() => import('@/views/concepts/campaigns/CampaignReport')),
        authority: [SuperAdmin, ADMIN], 
    },
    {
        key: 'concepts.crm',
        path: '/concepts/contacts',
        component: lazy(() => import('@/views/concepts/contacts/ContactsCRM')),
        authority: [SuperAdmin, ADMIN],
    },{
        key: 'concepts.aiConfig',
        path: '/concepts/ai-settings',
        component: lazy(() => import('@/views/concepts/ai-config/AiSettingsPage')),
        authority: [SuperAdmin, ADMIN],
    },{
        key: 'concepts.knowledge',
        path: '/concepts/knowledge',
        component: lazy(() => import('@/views/concepts/knowledge/KnowledgeManager')),
        authority: [SuperAdmin, ADMIN],
    },{
        key: 'concepts.plans',
        path: '/concepts/plans',
        component: lazy(() => import('@/views/concepts/plan/PlanList')),
        authority: [SuperAdmin, ADMIN],
    },{
        key: 'concepts.Pricing',
        path: '/concepts/Pricing',
        component: lazy(() => import('@/views/concepts/client/Pricing')),
        authority: [SuperAdmin, ADMIN, USER],
    },{
        key: 'concepts.PricingCompare',
        path: '/concepts/PricingCompare',
        component: lazy(() => import('@/views/concepts/client/PricingCompare')),
        authority: [SuperAdmin, ADMIN, USER],
    },{
        key: 'client.billing.verify',
        path: '/billing/verify',
        component: lazy(() => import('@/views/concepts/client/PaymentVerify')),
        authority: [SuperAdmin, ADMIN, USER], 
    },{
        key: 'concepts.InvoiceList',
        path: '/concepts/InvoiceList',
        component: lazy(() => import('@/views/concepts/invoices/InvoiceList')),
        authority: [SuperAdmin, ADMIN], 
    },








    {
        key: 'concepts.ai.chat',
        path: `${CONCEPTS_PREFIX_PATH}/ai/chat`,
        component: lazy(() => import('@/views/concepts/ai/Chat')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.ai.image',
        path: `${CONCEPTS_PREFIX_PATH}/ai/image`,
        component: lazy(() => import('@/views/concepts/ai/Image')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.customers.customerList',
        path: `${CONCEPTS_PREFIX_PATH}/customers/customer-list`,
        component: lazy(
            () => import('@/views/concepts/customers/CustomerList'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
    },
    {
        key: 'concepts.customers.customerEdit',
        path: `${CONCEPTS_PREFIX_PATH}/customers/customer-edit/:id`,
        component: lazy(
            () => import('@/views/concepts/customers/CustomerEdit'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            header: {
                title: 'ویرایش مشتری',
                description:
                    'Manage customer details, purchase history, and preferences.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.customers.customerCreate',
        path: `${CONCEPTS_PREFIX_PATH}/customers/customer-create`,
        component: lazy(
            () => import('@/views/concepts/customers/CustomerCreate'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            header: {
                title: 'ایجاد مشتری',
                description:
                    'Manage customer details, track purchases, and update preferences easily.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.customers.customerDetails',
        path: `${CONCEPTS_PREFIX_PATH}/customers/customer-details/:id`,
        component: lazy(
            () => import('@/views/concepts/customers/CustomerDetails'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.products.productList',
        path: `${CONCEPTS_PREFIX_PATH}/products/product-list`,
        component: lazy(() => import('@/views/concepts/products/ProductList')),
                authority: [SuperAdmin, ADMIN, USER],
    },
    {
        key: 'concepts.products.productEdit',
        path: `${CONCEPTS_PREFIX_PATH}/products/product-edit/:id`,
        component: lazy(() => import('@/views/concepts/products/ProductEdit')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            header: {
                title: 'ویرایش محصول',
                description:
                    'Quickly manage product details, stock, and availability.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.products.productCreate',
        path: `${CONCEPTS_PREFIX_PATH}/products/product-create`,
        component: lazy(
            () => import('@/views/concepts/products/ProductCreate'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            header: {
                title: 'ایجاد محصول',
                description:
                    'Quickly add products to your inventory. Enter key details, manage stock, and set availability.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.projects.scrumBoard',
        path: `${CONCEPTS_PREFIX_PATH}/projects/scrum-board`,
        component: lazy(() => import('@/views/concepts/projects/ScrumBoard')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.projects.projectList',
        path: `${CONCEPTS_PREFIX_PATH}/projects/project-list`,
        component: lazy(() => import('@/views/concepts/projects/ProjectList')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.projects.projectDetails',
        path: `${CONCEPTS_PREFIX_PATH}/projects/project-details/:id`,
        component: lazy(
            () => import('@/views/concepts/projects/ProjectDetails'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.projects.projectTasks',
        path: `${CONCEPTS_PREFIX_PATH}/projects/tasks`,
        component: lazy(() => import('@/views/concepts/projects/Tasks')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.projects.projectIssue',
        path: `${CONCEPTS_PREFIX_PATH}/projects/tasks/:id`,
        component: lazy(() => import('@/views/concepts/projects/Issue')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.orders.orderList',
        path: `${CONCEPTS_PREFIX_PATH}/orders/order-list`,
        component: lazy(() => import('@/views/concepts/orders/OrderList')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.orders.orderEdit',
        path: `${CONCEPTS_PREFIX_PATH}/orders/order-edit/:id`,
        component: lazy(() => import('@/views/concepts/orders/OrderEdit')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            header: {
                title: 'ویرایش سفارش',
                contained: true,
                description: 'Manage and track orders efficiently',
            },
            footer: false,
        },
    },
    {
        key: 'concepts.orders.orderCreate',
        path: `${CONCEPTS_PREFIX_PATH}/orders/order-create`,
        component: lazy(() => import('@/views/concepts/orders/OrderCreate')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            header: {
                title: 'نظم ایجاد کنید',
                contained: true,
                description:
                    'Create new customer orders quickly and accurately',
            },
            footer: false,
        },
    },
    {
        key: 'concepts.orders.orderDetails',
        path: `${CONCEPTS_PREFIX_PATH}/orders/order-details/:id`,
        component: lazy(() => import('@/views/concepts/orders/OrderDetails')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            header: {
                contained: true,
                title: lazy(
                    () =>
                        import(
                            '@/views/concepts/orders/OrderDetails/components/OrderDetailHeader'
                        ),
                ),
                extraHeader: lazy(
                    () =>
                        import(
                            '@/views/concepts/orders/OrderDetails/components/OrderDetailHeaderExtra'
                        ),
                ),
            },
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.account.settings',
        path: `${CONCEPTS_PREFIX_PATH}/account/settings`,
        component: lazy(() => import('@/views/concepts/accounts/Settings')),
        authority: [SuperAdmin, ADMIN, USER],
        meta: {
            header: {
                title: 'تنظیمات',
            },
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.account.activityLog',
        path: `${CONCEPTS_PREFIX_PATH}/account/activity-log`,
        component: lazy(() => import('@/views/concepts/accounts/ActivityLog')),
        authority: [SuperAdmin, ADMIN],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.account.rolesPermissions',
        path: `${CONCEPTS_PREFIX_PATH}/account/roles-permissions`,
        component: lazy(
            () => import('@/views/concepts/accounts/RolesPermissions'),
        ),
        authority: [SuperAdmin, ADMIN],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.account.pricing',
        path: `${CONCEPTS_PREFIX_PATH}/account/pricing`,
        component: lazy(() => import('@/views/concepts/accounts/Pricing')),
                authority: [SuperAdmin, ADMIN],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.helpCenter.supportHub',
        path: `${CONCEPTS_PREFIX_PATH}/help-center/support-hub`,
        component: lazy(
            () => import('@/views/concepts/help-center/SupportHub'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.helpCenter.article',
        path: `${CONCEPTS_PREFIX_PATH}/help-center/article/:id`,
        component: lazy(() => import('@/views/concepts/help-center/Article')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.helpCenter.editArticle',
        path: `${CONCEPTS_PREFIX_PATH}/help-center/edit-article/:id`,
        component: lazy(
            () => import('@/views/concepts/help-center/EditArticle'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            footer: false,
        },
    },
    {
        key: 'concepts.helpCenter.manageArticle',
        path: `${CONCEPTS_PREFIX_PATH}/help-center/manage-article`,
        component: lazy(
            () => import('@/views/concepts/help-center/ManageArticle'),
        ),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            footer: false,
        },
    },
    {
        key: 'concepts.calendar',
        path: `${CONCEPTS_PREFIX_PATH}/calendar`,
        component: lazy(() => import('@/views/concepts/calendar/Calendar')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.fileManager',
        path: `${CONCEPTS_PREFIX_PATH}/file-manager`,
        component: lazy(() => import('@/views/concepts/files/FileManager')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.mail',
        path: `${CONCEPTS_PREFIX_PATH}/mail`,
        component: lazy(() => import('@/views/concepts/mail/Mail')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.chat',
        path: `${CONCEPTS_PREFIX_PATH}/chat`,
        component: lazy(() => import('@/views/concepts/chat/Chat')),
                authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
]

export default conceptsRoute
