import React, { ReactNode } from 'react';

interface TooltipProps {
    content: string | ReactNode;
    children: ReactNode;
    position?: 'top' | 'bottom';
}

const ModernTooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
    return (
        <div className="relative flex items-center justify-center group">
            {/* اِلمان اصلی (مثلا دکمه شما) */}
            {children}

            {/* بدنه تولتیپ */}
            <div 
                className={`
                    absolute whitespace-nowrap z-50 pointer-events-none
                    opacity-0 invisible scale-95
                    group-hover:opacity-100 group-hover:visible group-hover:scale-100
                    transition-all duration-200 ease-out
                    flex flex-col items-center
                    ${position === 'top' ? 'bottom-full mb-2 group-hover:-translate-y-1' : 'top-full mt-2 group-hover:translate-y-1'}
                `}
            >
                <div className="bg-gray-800/95 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl border border-gray-700/50">
                    {content}
                </div>
                
                {/* فلش (Arrow) کوچک زیر/بالای تولتیپ */}
                <div 
                    className={`
                        w-2 h-2 bg-gray-800/95 border-gray-700/50 rotate-45
                        ${position === 'top' ? '-mt-1 border-r border-b' : '-mb-1 border-l border-t order-first'}
                    `}
                ></div>
            </div>
        </div>
    );
};

export default ModernTooltip;