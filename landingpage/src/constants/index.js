import { people01, people02, people03, facebook, instagram, linkedin, twitter, airbnb, binance, coinbase, dropbox, send, shield, star  } from "../assets";

export const navLinks = [
  {
    id: "home",
    title: "Home",
    path: "/home", // Internal link
  },
  {
    id: "features",
    title: "Features",
    path: "/features", // Internal link
  },
  {
    id: "product",
    title: "Produkt",
    path: "/product", // Internal link
  },
  {
    id: "conditions",
    title: "Konditionen",
    path: "/conditions", // Internal link
  },
  {
    id: "login",
    title: "Login",
    href: "http://localhost:3000", // External link
  },
];



export const features = [
  {
    id: "feature-1",
    icon: star,
    title: "Effizienz",
    content:
      "TimeTab minimiert den manuellen Aufwand und automatisiert die Erstellung von Schichtplänen, sodass Sie wertvolle Zeit sparen.",
  },
  {
    id: "feature-2",
    icon: shield,
    title: "Mitarbeiterzufriedenheit",
    content:
      "Durch Berücksichtigung individueller Präferenzen und Verfügbarkeiten bei der automatisierten Schichtplanung trägt unser Tool dazu bei, die Zufriedenheit und Motivation Ihrer Mitarbeiter zu steigern.",
  },
  {
    id: "feature-3",
    icon: send,
    title: "Zuverlässigkeit",
    content:
      " Mit intelligenten Algorithmen werden Fehler vermieden und eine verlässliche, bedarfsgerechte Personalzuordnung sichergestellt.",
  },
];

export const feedback = [
  {
    id: "feedback-1",
    content:
      "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.",
    name: "Herman Jensen",
    title: "Founder & Leader",
    img: people01,
  },
  {
    id: "feedback-2",
    content:
      "Money makes your life easier. If you're lucky to have it, you're lucky.",
    name: "Steve Mark",
    title: "Founder & Leader",
    img: people02,
  },
  {
    id: "feedback-3",
    content:
      "It is usually people in the money business, finance, and international trade that are really rich.",
    name: "Kenn Gallagher",
    title: "Founder & Leader",
    img: people03,
  },
];

export const stats = [
  {
    id: "stats-1",
    title: "Schneller als die manuelle Planung",
    value: "20X ",
  },
  {
    id: "stats-2",
    title: "Steigerung der Mitarbeiterzufriedenheit",
    value: "25%",
  },
  {
    id: "stats-3",
    title: "Reduzierung von Planungsfehlern",
    value: "95%",
  },
];

export const footerLinks = [
  {
    title: "Useful Links",
    links: [
      {
        name: "Content",
        link: "https://www.hoobank.com/content/",
      },
      {
        name: "How it Works",
        link: "https://www.hoobank.com/how-it-works/",
      },
      {
        name: "Create",
        link: "https://www.hoobank.com/create/",
      },
      {
        name: "Explore",
        link: "https://www.hoobank.com/explore/",
      },
      {
        name: "Terms & Services",
        link: "https://www.hoobank.com/terms-and-services/",
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        name: "Help Center",
        link: "https://www.hoobank.com/help-center/",
      },
      {
        name: "Partners",
        link: "https://www.hoobank.com/partners/",
      },
      {
        name: "Suggestions",
        link: "https://www.hoobank.com/suggestions/",
      },
      {
        name: "Blog",
        link: "https://www.hoobank.com/blog/",
      },
      {
        name: "Newsletters",
        link: "https://www.hoobank.com/newsletters/",
      },
    ],
  },
  {
    title: "Partner",
    links: [
      {
        name: "Our Partner",
        link: "https://www.hoobank.com/our-partner/",
      },
      {
        name: "Become a Partner",
        link: "https://www.hoobank.com/become-a-partner/",
      },
    ],
  },
];

export const socialMedia = [
  {
    id: "social-media-1",
    icon: instagram,
    link: "https://www.instagram.com/",
  },
  {
    id: "social-media-2",
    icon: facebook,
    link: "https://www.facebook.com/",
  },
  {
    id: "social-media-3",
    icon: twitter,
    link: "https://www.twitter.com/",
  },
  {
    id: "social-media-4",
    icon: linkedin,
    link: "https://www.linkedin.com/",
  },
];

export const clients = [
  {
    id: "client-1",
    logo: airbnb,
  },
  {
    id: "client-2",
    logo: binance,
  },
  {
    id: "client-3",
    logo: coinbase,
  },
  {
    id: "client-4",
    logo: dropbox,
  },
];