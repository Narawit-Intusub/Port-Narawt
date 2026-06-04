export type SubNavItem = {
  name: string;
  href: string;
  icon: string;
  activePattern: RegExp;
};

export type NavItem = {
  title: string;
  subItems: SubNavItem[];
};

export const navConfigs: NavItem[] = [
  {
    title: "Portfolio",
    subItems: [
      {
        name: "Intro",
        href: "/#intro",
        icon: "Home01Icon",
        activePattern: /^\/(#intro)?$/,
      },
      {
        name: "Works",
        href: "/#projects",
        icon: "FolderSharedIcon",
        activePattern: /#projects$/,
      },
      {
        name: "Stack",
        href: "/#stack",
        icon: "DatabaseIcon",
        activePattern: /#stack$/,
      },
    ],
  },
  {
    title: "Entertainment",
    subItems: [
      {
        name: "Arcade",
        href: "/arcade",
        icon: "GameController01Icon",
        activePattern: /^\/arcade/,
      },
    ],
  },
];

export const specialLabels: Record<string, string> = {
  arcade: "Arcade",
  games: "Games",
};

export const otherNavItem = [
  {
    name: "Claw Machine",
    href: "/arcade/games/claw-machine",
    icon: "ToyBrickIcon",
  },
];
