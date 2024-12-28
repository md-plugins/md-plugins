export interface MenuItem {
  name: string;
  path?: string;
  icon?: string;
  iconColor?: string;
  rightIcon?: string;
  rightIconColor?: string;
  badge?: string;
  children?: MenuItem[];
  external?: boolean;
  expanded?: boolean;
}

export interface MenuNode {
  name: string;
  path?: string;
  external?: boolean;
  children?: MenuNode[];
}

export interface FlatMenuEntry {
  name: string;
  category: string | null;
  path: string;
  prev?: FlatMenuEntry;
  next?: FlatMenuEntry;
}

export type FlatMenu = Record<string, FlatMenuEntry>;

export interface NavItem extends FlatMenuEntry {
  classes: string;
}

export interface RelatedItem {
  name: string;
  category: string;
  path: string;
}
