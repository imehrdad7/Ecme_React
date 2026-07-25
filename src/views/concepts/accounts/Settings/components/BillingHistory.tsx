import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import moment from 'jalali-moment'
import classNames from '@/utils/classNames'
import { TbChevronRight, TbChevronLeft } from 'react-icons/tb'

export enum SubscriptionStatus {
    PendingPayment = 0,
    Active = 1,
    Reserved = 2,
    Expired = 3,
    Canceled = 4
}

export type SubscriptionHistoryItem = {
    id: string;
    planName: string;
    startDate: string;
    endDate: string;
    status: SubscriptionStatus;
}

type BillingHistoryProps = {
    data: SubscriptionHistoryItem[]
    className?: string
}

const { Tr, Th, Td, THead, TBody } = Table
const columnHelper = createColumnHelper<SubscriptionHistoryItem>()

const statusConfig = {
    [SubscriptionStatus.PendingPayment]: { text: 'در انتظار پرداخت', badgeClass: 'bg-amber-500', textClass: 'text-amber-600' },
    [SubscriptionStatus.Active]: { text: 'در حال استفاده', badgeClass: 'bg-emerald-500 animate-pulse', textClass: 'text-emerald-600' },
    [SubscriptionStatus.Reserved]: { text: 'رزرو برای آینده', badgeClass: 'bg-blue-500', textClass: 'text-blue-600' },
    [SubscriptionStatus.Expired]: { text: 'پایان یافته', badgeClass: 'bg-gray-400', textClass: 'text-gray-500' },
    [SubscriptionStatus.Canceled]: { text: 'لغو شده', badgeClass: 'bg-red-500', textClass: 'text-red-600' }
}

const columns = [
    columnHelper.display({
        id: 'index',
        header: 'ردیف',
        cell: (props) => (
            <span className="font-semibold text-gray-500">
                {props.row.index + 1 + props.table.getState().pagination.pageIndex * props.table.getState().pagination.pageSize}
            </span>
        ),
    }),
    columnHelper.accessor('planName', {
        header: 'پلن اشتراکی',
        cell: (props) => {
            const row = props.row.original
            return (
                <span className={classNames("font-bold", row.status === SubscriptionStatus.Active ? "text-emerald-800 dark:text-emerald-400" : "text-gray-700")}>
                    {row.planName}
                </span>
            )
        },
    }),
    columnHelper.accessor('status', {
        header: 'وضعیت',
        cell: (props) => {
            const status = props.row.original.status
            const config = statusConfig[status] || statusConfig[SubscriptionStatus.Expired]
            return (
                <div className="flex items-center gap-2">
                    <Badge className={config.badgeClass} />
                    <span className={classNames("heading-text font-bold", config.textClass)}>
                        {config.text}
                    </span>
                </div>
            )
        },
    }),
    columnHelper.accessor('startDate', {
        header: 'تاریخ شروع',
        cell: (props) => {
            const row = props.row.original
            return <div className="flex items-center text-sm">{row.startDate ? moment(row.startDate).locale('fa').format('YYYY/MM/DD') : '-'}</div>
        },
    }),
    columnHelper.accessor('endDate', {
        header: 'تاریخ پایان',
        cell: (props) => {
            const row = props.row.original
            // 👈 کلاس font-semibold برداشته شد تا وزن فونت از ردیف (Tr) ارث‌بری شود
            return <div className="flex items-center text-sm">{row.endDate ? moment(row.endDate).locale('fa').format('YYYY/MM/DD') : '-'}</div>
        },
    }),
]

const BillingHistory = ({ data = [], ...rest }: BillingHistoryProps) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    })

    return (
        <div {...rest}>
            <Table>
                <THead className="!bg-transparent">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th key={header.id} colSpan={header.colSpan}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table.getRowModel().rows.map((row) => {
                        const isActive = row.original.status === SubscriptionStatus.Active;
                        return (
                            <Tr 
                                key={row.id}
                                /* 👈 کلاس font-bold و text-gray-900 برای بولد کردن کل سطر فعال اضافه شد */
                               className={isActive 
                                ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-r-4 border-r-emerald-500 shadow-sm transition-all font-black text-black text-base' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-gray-600'}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <Td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Td>
                                ))}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
            
            {data.length > 10 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            icon={<TbChevronRight />} 
                            onClick={() => table.previousPage()} 
                            disabled={!table.getCanPreviousPage()}
                        >
                            قبلی
                        </Button>
                        
                        <Button 
                            size="sm" 
                            onClick={() => table.nextPage()} 
                            disabled={!table.getCanNextPage()} 
                            className="flex items-center gap-1"
                        >
                            بعدی <TbChevronLeft />
                        </Button>
                    </div>
                    <span className="text-sm font-semibold text-gray-500">
                        صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}
                    </span>
                </div>
            )}
        </div>
    )
}

export default BillingHistory