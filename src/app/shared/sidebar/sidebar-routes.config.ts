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
  {
    path: "/app/administration/course-registration",
    title: "Course Registration",
    icon: "fas ft-file-plus",
    class: "",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: []
  },
  {
    path: "/app/training-calendar",
    title: "Training Calendar",
    icon: "fas icon-calendar",
    class: "",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: []
  },
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
  {
    path: "",
    title: "Training Setup",
    icon: "fas icon-docs",
    class: "has-sub",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: [
      {
        path: "/app/administration/course",
        title: "Course",
        icon: "icon-notebook",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      },
      {
        path: "/app/administration/facilitator",
        title: "Facilitator",
        icon: "icon-users",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      },
      {
        path: "/app/administration/venue",
        title: "Venue",
        icon: "icon-map",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      },
      {
        path: "/app/administration/cost",
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
        path: "/app/sales/inquiry",
        title: "Inquiry",
        icon: "far fa-envelope-open",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      },
      {
        path: "/app/sales/account",
        title: "Account",
        icon: "far fa-file-alt",
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
    title: "System Setup",
    icon: "fas fa-users-cog",
    class: "has-sub",
    badge: "",
    badgeClass: "",
    isExternalLink: false,
    submenu: [
      {
        path: "/app/setup/user",
        title: "User",
        icon: "fas ft-users",
        class: "",
        badge: "",
        badgeClass: "",
        isExternalLink: false,
        submenu: []
      }
    ]
  }
];
