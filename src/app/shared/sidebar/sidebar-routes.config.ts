import { RouteInfo } from "./sidebar.metadata";

export const ROUTES: RouteInfo[] = [
  {
    path: "/app/dashboard",
    title: "Dashboard",
    icon: "fas fa-columns",
    class: "",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: []
  },
  {
    path: "/app/schedule",
    title: "Schedule",
    icon: "fas fa-list-alt",
    class: "",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: []
  },
  /*{
    path: "/app/training-calendar",
    title: "Calendar",
    icon: "fas icon-calendar",
    class: "",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: []
  },*/
  {
    path: "/app/marketing-inquiry",
    title: "Inquiry",
    icon: "fas fa-mail-bulk",
    class: "",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: []
  },
  {
    path: "/app/deal",
    title: "Deal",
    icon: "fas fa fa-money",
    class: "",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: []
  },
  /*{
    path: "/app/contact",
    title: "Contact",
    icon: "fas fa-mail-bulk",
    class: "",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: []
  },*/
  {
    path: "",
    title: "Administration",
    icon: "fas fa-users-cog",
    class: "has-sub",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: [
      {
        path: "/app/course",
        title: "Course",
        icon: "icon-notebook",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      },
      {
        path: "/app/facilitator",
        title: "Facilitator",
        icon: "icon-users",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      },
      {
        path: "/app/venue",
        title: "Venue",
        icon: "icon-map",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      },
      {
        path: "/app/cost",
        title: "Costing",
        icon: "icon-wallet",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      }
    ]
  },
  {
    path: "",
    title: "Sales",
    icon: "fas fa-funnel-dollar",
    class: "has-sub",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: [
      {
        path: "/app/inquiry",
        title: "Inquiry",
        icon: "far fa-envelope-open",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      },
      {
        path: "/app/account",
        title: "Account",
        icon: "far fa-file-alt",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      }
    ]
  }
];
