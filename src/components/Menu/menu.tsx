import React, { createContext, useState, useMemo } from 'react'
import classNames from 'classnames';
import MenuItem, { MenuItemProps } from './menuItem';
import SubMenu, { SubMenuProps } from './subMenu';
// 字面量Mode
export type MenuMode = 'horizontal' | 'vertical';

type SelectCallback = (selectedIndex: string) => void;

export interface MenuProps {
    defaultIndex?: string; // 默认选中哪个
    className?: string;
    mode?: MenuMode; // 水平还是垂直
    style?: React.CSSProperties;
    onSelect?: SelectCallback; // 点击之后触发的事件
    defaultOpenSubMenus?: string[]; // 默认打开的subMenu
}
// 在Menu组件身上绑定的静态属性
interface MenuProperties {
    Item: typeof MenuItem;
    SubMenu: typeof SubMenu;
}
// Menu的上下文的数据类型
interface IMenuContext {
    index: string;
    onSelect?: SelectCallback;
    mode?: MenuMode;
    defaultOpenSubMenus?: string[];
}

export const MenuContext = createContext<IMenuContext>({ index: '0' });

const Menu: React.FC<MenuProps> & MenuProperties = ({
    mode,
    className,
    style,
    children,
    defaultIndex,
    defaultOpenSubMenus,
    onSelect
}) => {
    // 默认选中的那个index
    const [currentActive, setActive] = useState<string>(defaultIndex!);
    // 合并出来的className
    const classes = classNames('menu', className, {
        [`menu-vertical`]: mode === 'vertical',
        [`menu-horizontal`]: mode !== 'vertical',
    });
    // MenuContext的数据
    const passedContext: IMenuContext = useMemo(() => ({
        index: currentActive,
        // 重写一下onSelect
        onSelect: (currentIndex: string) => {
            setActive(currentIndex);
            onSelect?.(currentIndex);
        },
        mode,
        defaultOpenSubMenus
    }), [currentActive, onSelect, mode, defaultOpenSubMenus]);
    // 判断渲染组件是不是MenuItem, 并返回筛选后的children
    const renderChildren = useMemo(() => {
        return React.Children.map(children, (child, index) => {
            const childElement = child as React.FunctionComponentElement<MenuItemProps | SubMenuProps>;
            // 拿到静态属性
            const { displayName } = childElement.type;
            if (displayName === 'MenuItem' || displayName === 'SubMenu') {
                return React.cloneElement(childElement, { index: index.toString() });
            }
            // 如果不是MenuItem
            console.error('Warning: Menu has a child which is not a MenuItem component');
        })
    }, [children]);
    return (
        <ul className={classes} style={style} data-testid="test-menu">
            <MenuContext.Provider value={passedContext}>
                {renderChildren}
            </MenuContext.Provider>
        </ul>
    )
}

Menu.Item = MenuItem;

Menu.SubMenu = SubMenu;

Menu.defaultProps = {
    defaultIndex: '0',
    mode: 'horizontal',
    defaultOpenSubMenus: []
}

export default Menu