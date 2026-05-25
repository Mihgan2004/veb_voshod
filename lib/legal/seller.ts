/** Реквизиты ИП и контакты магазина РАССВЕТ (источник: карточка ИП, выписка ЕГРИП). */
export const SELLER = {
  brand: "РАССВЕТ",
  legalName: "Индивидуальный предприниматель Остапенко Михаил Вадимович",
  shortName: "ИП Остапенко Михаил Вадимович",
  personName: "Остапенко Михаил Вадимович",
  inn: "312010878603",
  ogrnip: "326310000035685",
  registrationDate: "26.04.2026",
  bank: {
    name: 'ООО «Банк Точка»',
    inn: "9721194461",
    account: "40802810320000987388",
    corrAccount: "30101810745374525104",
    bik: "044525104",
    address:
      "109044, г. Москва, вн.тер.г. муниципальный округ Южнопортовый, пер. 3-й Крутицкий, д. 11, помещ. 7Н",
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://voshod.shop",
  email: "tratonis2004@mail.ru",
  phone: "8 920 576-04-39",
  phoneTel: "+79205760439",
  telegramUrl: "https://t.me/moderatorBOCXOD",
  telegramHandle: "t.me/moderatorBOCXOD",
  legalPublishedAt: "26.04.2026",
} as const;
