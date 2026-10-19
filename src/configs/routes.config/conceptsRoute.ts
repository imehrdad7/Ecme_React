import { lazy } from 'react'
import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'
import { SuperAdmin, ADMIN, USER } from '@/constants/roles.constant'


const conceptsRoute: Routes = [
    {
        key: 'concepts.bots.botList',
        path: '/concepts/bots/bot-list',
        component: lazy(() => import('@/views/concepts/bots/bot-list/BotList')),
        authority: [SuperAdmin, ADMIN],
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
        key: 'concepts.BroadcastList',
        path: '/concepts/BroadcastList',
        component: lazy(() => import('@/views/concepts/broadcasts/BroadcastList')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'concepts.broadcasts.create',
        path: '/concepts/broadcasts/create', 
        component: lazy(() => import('@/views/concepts/broadcasts/BroadcastCreate')),
        authority: [SuperAdmin, ADMIN],
    },
    {
        key: 'concepts.broadcasts.detail',
        path: '/concepts/broadcasts/detail/:id', 
        component: lazy(() => import('@/views/concepts/broadcasts/BroadcastDetail')),
        authority: [SuperAdmin, ADMIN],
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
    }, {
        key: 'concepts.aiConfig',
        path: '/concepts/ai-settings',
        component: lazy(() => import('@/views/concepts/ai-config/AiSettingsPage')),
        authority: [SuperAdmin, ADMIN],
    }, {
        key: 'concepts.knowledge',
        path: '/concepts/knowledge',
        component: lazy(() => import('@/views/concepts/knowledge/KnowledgeManager')),
        authority: [SuperAdmin, ADMIN],
    }, {
        key: 'concepts.plans',
        path: '/concepts/plans',
        component: lazy(() => import('@/views/concepts/plan/PlanList')),
        authority: [SuperAdmin, ADMIN],
    }, {
        key: 'concepts.Pricing',
        path: '/concepts/Pricing',
        component: lazy(() => import('@/views/concepts/client/Pricing')),
        authority: [SuperAdmin, ADMIN, USER],
    }, {
        key: 'concepts.PricingCompare',
        path: '/concepts/PricingCompare',
        component: lazy(() => import('@/views/concepts/client/PricingCompare')),
        authority: [SuperAdmin, ADMIN, USER],
    }, {
        key: 'client.billing.verify',
        path: '/billing/verify',
        component: lazy(() => import('@/views/concepts/client/PaymentVerify')),
        authority: [SuperAdmin, ADMIN, USER],
    }, {
        key: 'concepts.InvoiceList',
        path: '/concepts/InvoiceList',
        component: lazy(() => import('@/views/concepts/invoices/InvoiceList')),
        authority: [SuperAdmin, ADMIN],
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
        authority: [SuperAdmin, ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.handoff.HandoffSettingsForm',
        path: '/concepts/hand-off/HandoffSettingsForm',
        component: lazy(() => import('@/views/concepts/hand-off/HandoffSettingsForm')),
        authority: [SuperAdmin, ADMIN],
    },









]

export default conceptsRoute
