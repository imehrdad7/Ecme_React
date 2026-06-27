import { THEME_ENUM } from '@/constants/theme.constant'
import { Direction, Mode, ControlSize, LayoutType } from '@/@types/theme'

export type ThemeConfig = {
    themeSchema: string
    direction: Direction
    mode: Mode
    panelExpand: boolean
    controlSize: ControlSize
    layout: {
        type: LayoutType
        sideNavCollapse: boolean
    }
}

/**
تغییر تم نرم افزار 
Change Theme
 */

// export const themeConfig: ThemeConfig = {
//     themeSchema: '',
//     direction: THEME_ENUM.DIR_RTL,
//     mode: THEME_ENUM.MODE_LIGHT,
//     panelExpand: false,
//     controlSize: 'md',
//     layout: {
//         type: THEME_ENUM.LAYOUT_COLLAPSIBLE_SIDE,
//         sideNavCollapse: false,
//     },
// }


export const themeConfig: ThemeConfig = {
    themeSchema: '',
    direction: THEME_ENUM.DIR_RTL,
    mode: THEME_ENUM.MODE_LIGHT,
    panelExpand: false,
    controlSize: 'md',
    layout: {
        type: THEME_ENUM.LAYOUT_COLLAPSIBLE_SIDE,
        sideNavCollapse: true,
    },
}
