// Content taken from "Knjiga bez tačke" (public/docs/knjiga-bez-tacke.pdf).

export const BOOK_PDF = '/docs/knjiga-bez-tacke.pdf'
export const BOOK_COVER = '/img/korice.jpg'

export const quotes: string[] = [
  'Čitaj polako. I zapamti – ovde nigde ne postoji tačka.',
  'Neke priče nisu napisane da se završe. One samo nastavljaju da rastu.',
  'Od tog marta, mi pišemo naš zajednički film. Film života, u kome glavne uloge igramo samo ti i ja.',
  'Minđuše nismo našli. Ali smo našli nešto mnogo važnije – naš ritam.',
  'Prošlost je te noći umrla. Ti si bila ono što dolazi.',
  'Bih.',
  'Sve dobija tvoju boju kada si pored mene.',
  'I u tom trenutku, svet je prestao da žuri.',
  'Ti nemoj da ideš po brbolazine, nego po put k’o svi normalni ljudi!',
  'Mi smo kraljevi neplaniranih obrta. Naš život je konstantni plot twist.',
  'Moje omiljeno mesto je pored tebe. Tu se osećam kao kod kuće.',
  'Zagrliću te toliko jako da naplatim daljini dug unapred.',
  'Ti si moja konstanta. Moj mir i moj najlepši nemir u isto vreme.',
  'Temišvar stvarno nije kraj sveta. To je nekih 150 kilometara.',
  'Najlepši deo naše priče još nije napisan.',
  'Mi smo male kornjačice koje polako koračaju svetom. 🐢🐢',
]

export type Poem = { title: string; lines: string[] }

export const poems: Poem[] = [
  {
    title: 'Geometrija tvog lica',
    lines: [
      'Na tvom licu ne postoji pogrešan ugao,',
      'Ti si svetlo koje nijedan objektiv',
      'ne može da prevari.',
      'Tvoj osmeh je onaj tihi,',
      'neuhvatljivi trenutak',
      'U kom se spajaju',
      'sve moje rane i tvoji dodiri.',
      'Ne volim te samo u tvom najboljem svetlu,',
      'Volim te i kad si umorna,',
      'zamišljena i tiha.',
    ],
  },
  {
    title: 'Za Anči',
    lines: [
      'Tvoj osmeh budi jutra sva,',
      'U tebi je moja svetlost čista.',
      'U očima tvojim hiljadu je reči,',
      'Svaka me tišina uz tebe izleči.',
      'Bez igara praznih, bez laži i sena,',
      'Mi gradimo nešto za sva vremena.',
      'Sa tobom je lako, sa tobom je pravo,',
      'Uz tebe je srce konačno zdravo.',
    ],
  },
  {
    title: 'Naša klupica na Kraljevici',
    lines: [
      'Ona pamti svaki naš korak, svaki uzdah i smeh,',
      'To drvo je svedok kako smo rasli kroz dane.',
      'Tamo gde smo se sklanjali od sveta i briga,',
      'Dok su se iznad nas lagano njihale grane.',
      'Jer na toj klupici, pod zvezdanim nebom,',
      'Naučili smo da se volimo najiskrenije, baš tako.',
    ],
  },
  {
    title: 'Sreća i Srećica',
    lines: [
      'Kada ti meni šapneš ono prosto „Srećo“,',
      'I kada ja tebi „Srećice moja“ vratim,',
      'Ceo svet se smanji u jednoj sekundi,',
      'I ja tek tada zapravo shvatim:',
      'Da nam ne trebaju nikakve teške reči,',
      'Nema priče iza toga, ali ima svega u nama.',
    ],
  },
  {
    title: 'Put kroz brbolazine',
    lines: [
      'Pusti puteve kojima gaze svi normalni ljudi,',
      'Mi smo od onih što gaze kroz trnje i mrak.',
      'Neka nas šibaju grane, neka nas vetrovi lome,',
      'Uz tebe je i najteži korak neverovatno lak.',
      'Ti si moja Srećica, moj najslađi spas,',
      'Jer tvoje usne su moj jedini i najsigurniji glas.',
    ],
  },
]

export type Chapter = { title: string; when?: string; emoji: string; teaser: string }

export const chapters: Chapter[] = [
  { title: 'Kišni dan, samo obična proba ili ipak ne', emoji: '🌧️', teaser: 'Steva, predstava za Svetog Savu i „kao mladi pred venčanje“.' },
  { title: 'Sedam dana izoštravanja slike', when: '20–24. mart', emoji: '🔌', teaser: 'Punjač koji baš tad nije bio tu, minđuše u pustom Kotlujevcu.' },
  { title: 'Iz mračne komore: Dupla ekspozicija', when: '21. mart', emoji: '🎞️', teaser: 'Fotke koje sam mrzeo, a zbog kojih si mi pisala.' },
  { title: 'Kapitol, klupica i dečija iskrenost', when: '26. mart', emoji: '🌳', teaser: 'Prvi izlazak i poljubac u obraz kod kapije doma.' },
  { title: 'Kulminacija, 1:14h', when: '27. mart', emoji: '💘', teaser: '„Bih.“ — i beskrajna priča je zvanično počela.' },
  { title: 'Naš mali pakt sa svetom (Incident 1:16)', when: '27. mart', emoji: '🤫', teaser: 'Dva minuta. Toliko je trajala tajna od Baneta.' },
  { title: 'Tri za večnost', when: '1. april', emoji: '💋', teaser: '„E, vidi... prošao moj tata kombijem!“' },
  { title: 'Pitalice, magični ranac i „Radio Mileva“', emoji: '🎒', teaser: 'Trikovi sa kartama i klupica na Kraljevici.' },
  { title: 'Muzej naših blesavih poklona', emoji: '🐢', teaser: 'Mala kornjača, slika sa mora i najbolje vanilice.' },
  { title: 'Zbogom jednom domu', when: '16. jun', emoji: '🎓', teaser: 'Matura, diploma i povratak u Boljevac.' },
  { title: 'Brbolazine, višnje i letnja avantura', when: 'jul', emoji: '🍒', teaser: 'Najstrastveniji poljubac, bez režije.' },
  { title: 'Put od 150 kilometara', when: 'jul', emoji: '🚐', teaser: 'Rumunija, medicina i ta prokleta daljina.' },
  { title: 'Apartman 29/30', emoji: '🥞', teaser: 'Palačinke iz rerne i mali prozor u budućnost.' },
  { title: 'Pismo za jedno novo poglavlje', emoji: '💌', teaser: 'Ti si moja konstanta.' },
  { title: 'Epilog ili novi početak?! – Naša zajednička olovka', emoji: '✍️', teaser: 'Od ove stranice knjigu pišemo zajedno.' },
]

/** Themes the next pages of the book should cover. */
export const nextChapters = [
  { id: 'jul-31', title: '31. jul', emoji: '🌙', hint: 'Šta se desilo tog dana? Gde ste bili, šta ste rekli jedno drugom?' },
  { id: 'avg-31', title: '31. avgust', emoji: '🌅', hint: 'Poslednji dan leta — šta želite da zapamtite zauvek?' },
  { id: 'sep-18', title: '18. septembar', emoji: '🚐', hint: 'Dan koji je promenio ritam. Opišite ga kao scenu iz filma.' },
  { id: 'daljina', title: 'Daljina', emoji: '🌍', hint: '150 kilometara, kombiji, vikendi i naš sistem. Kako se volimo na daljinu?' },
]
