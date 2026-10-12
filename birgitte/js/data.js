/* Birgitte Lund — prototype data.
   ONLY facts visible on Birgitte's current prototype site are used here.
   Anything unknown is null and the interface is designed around the gap:
   - price: null  → "Price on request" (Artwork No. 16)
   - story / medium / year: null → row is simply not shown
   Only Artwork No. 9 has a published story and medium. */

window.BIRG = {
  artist: {
    name: 'Birgitte Lund',
    // Birgitte's own words, from the Current Series page of her site
    statement:
      'The Spirit of Strange Flowers is an art project I have been working on for the past four years, which poetically interprets collected wild plants and flowers.'
  },

  series: [
    { id: 'strange-flowers', title: 'The Spirit of Strange Flowers', current: true, total: 19 }
  ],

  // sheet sizes in cm, width × height as hung (mounted)
  sizes: {
    A5: [14.8, 21],
    A4: [21, 29.7],
    A3: [29.7, 42],
    A2: [42, 59.4]
  },

  works: [
    { id: '01', n: 1,  size: 'A3', cm: [42, 29.7], price: 1950, tint: '#4a4a52', ratio: 1.118 },
    { id: '02', n: 2,  size: 'A2', cm: [42, 59.4], price: 2250, tint: '#b2551a', ratio: 0.721 },
    { id: '03', n: 3,  size: 'A3', cm: [42, 29.7], price: 1950, tint: '#3f6a66', ratio: 1.394 },
    { id: '04', n: 4,  size: 'A3', cm: [29.7, 42], price: 1950, tint: '#8a6a58', ratio: 0.705 },
    { id: '05', n: 5,  size: 'A2', cm: [42, 59.4], price: 2250, tint: '#2a3358', ratio: 0.721 },
    { id: '06', n: 6,  size: 'A2', cm: [42, 59.4], price: 2250, tint: '#d9bd1c', ratio: 0.688 },
    { id: '09', n: 9,  size: 'A2', cm: [42, 59.4], price: 2250, tint: '#c5964a', ratio: 0.707,
      unmounted: [47, 21], medium: 'Monoprint on fabric',
      story: [
        'A luminous seed head rises from a long, pale stem that gently bends and divides as it travels through the composition. Its fine, radiating filaments form a broad, almost circular crown, glowing against a warm field of deep ochre and brown. Beneath it, the background shifts through muted pink and grey before becoming a deep blue-green, where the stem continues into a darker, more atmospheric space.',
        'A smaller, delicate cluster grows from the stem midway down, echoing the larger form above it. The pale stem remains sharply defined against the darker ground, while subtle ripples and variations in the surrounding colour create a sense of depth.',
        'The combination of the radiant seed head, branching stem and changing fields of colour gives the work a sense of quiet transformation, as though the plant is moving through several different atmospheres within a single image.'
      ] },
    { id: '16', n: 16, size: 'A5', cm: [14.8, 21], price: null, tint: '#7d5a6c', ratio: 0.699 },
    { id: '19', n: 19, size: 'A3', cm: [29.7, 42], price: 1950, tint: '#a38a6e', ratio: 0.707 }
  ].map(function (w) {
    w.series = 'strange-flowers';
    w.title = 'Artwork No. ' + w.n;
    w.img = 'assets/works/' + w.id + '.jpg';
    w.status = 'available';
    return w;
  })
};

/* UI strings, English + Danish. Birgitte's own texts (titles, stories) are not translated:
   in the Studio she adds an English and a Danish version herself. */
window.STR = {
  en: {
    series: 'Series', about: 'Birgitte', collection: 'Collection', acquire: 'Acquire', menu: 'Menu', close: 'Close',
    artist: 'Artist', scroll: 'Scroll', enter: 'Walk the series', meetB: 'Meet Birgitte', fromSeries: 'From the series',
    originalWorks: 'Original works', currentSeries: 'Current series', trueScale: 'Shown at true relative scale',
    all: 'All', works: 'works', work: 'work', sold: 'Sold', available: 'Available', reserved: 'Reserved',
    priceOnRequest: 'Price on request', size: 'Size', mounted: 'Mounted', unmounted: 'Unmounted', medium: 'Medium',
    year: 'Year', price: 'Price', availability: 'Availability', more: 'More…', less: 'Less…',
    acquireWork: 'Acquire this work', askAbout: 'Ask about this work', askPrice: 'Ask for the price',
    save: 'Save to My Collection', saved: 'Saved in My Collection', lookCloser: 'Look closer', onWall: 'See it on a wall',
    soldNote: 'This work has found its home.', soldMore: 'See other works', next: 'Next work', prev: 'Previous work',
    similar: 'Works of similar size', unique: 'One original. Once acquired, it is gone.',
    reservedNote: 'This work is reserved while an acquisition is being confirmed.',
    collectionTitle: 'My Collection', collectionLead: 'Works you want to return to. Saving does not reserve a work.',
    collectionEmpty: 'Nothing saved yet. Open a work and choose “Save to My Collection”.',
    remove: 'Remove', cartTitle: 'Your acquisition', cartLead: 'Original works are one of a kind, so nothing is held until Birgitte confirms.',
    cartEmpty: 'Nothing here yet.', total: 'Total', continue: 'Continue', details: 'Your details', name: 'Name', email: 'Email',
    address: 'Delivery address', note: 'A note to Birgitte (optional)', place: 'Request these works', protoNoPay: 'Prototype. No payment is taken.',
    thanksTitle: 'Thank you.', thanksBody: 'Birgitte has received your request and the works are reserved for you. She will confirm and arrange payment and delivery with you personally.',
    backSeries: 'Back to the series', enquiry: 'Ask about', send: 'Send to Birgitte', message: 'Message',
    enquirySent: 'Sent. Birgitte will reply to you personally.', yourWords: 'In her words', facts: 'The series',
    nineteen: '19 individual original works', sizesRange: 'A5 to A2', lookingClosely: 'Looking closely',
    detailOf: 'Detail, ', madeWith: 'Prototype built from the works on Birgitte’s current site.',
    studio: 'Studio', viewAs: 'View as Birgitte', backToSite: 'Back to the site', protoTag: 'Prototype · no payment is taken',
    closer: 'Closer', wallPlaster: 'Plaster', wallClay: 'Clay', wallInk: 'Ink', onWallNote: 'Shown at true size beside a 170 cm figure and a 200 cm sofa.',
    // studio
    sToday: 'Today', sWorks: 'Works', sSeries: 'Series', sInbox: 'Inbox', sAdd: 'Add a work',
    sHello: 'Hello, Birgitte.', sHelloLead: 'Everything on the site is managed here. Changes appear on the site instantly.',
    sAvail: 'available', sResv: 'reserved', sSold: 'sold', sValue: 'Value of available works', sNew: 'new in inbox',
    sShown: 'Shown on site', sEdit: 'Edit', sPrice: 'Price (DKK)', sStatus: 'Status', sTitle: 'Title', sStory: 'Story (English)', sStoryDa: 'Story (Danish)',
    sPhoto: 'Photo of the work', sDrop: 'Drop a photo here, or tap to choose', sSave: 'Save work', sSeriesSel: 'Series', sOrient: 'Orientation',
    sPortrait: 'Portrait', landscape: 'Landscape', sMedium: 'Medium', sOptional: 'optional', sDelete: 'Remove from site',
    sNewSeries: 'Start a new series', sSeriesName: 'Name of the series', sCreate: 'Create series', sMoveUp: 'Move earlier', sMoveDown: 'Move later',
    sInboxEmpty: 'No messages yet. Make an enquiry or request works on the public site and it will arrive here.',
    sOrder: 'Acquisition request', sEnquiry: 'Enquiry', sConfirm: 'Confirm sale', sRelease: 'Release works', sHandled: 'Mark as handled', sReply: 'Reply by email',
    sConfirmed: 'Sale confirmed', sReleased: 'Released', sTip: 'Tip', sFirstTip: 'Try it: on the site, ask about a work or request one. It will arrive here.',
    sChecklist: 'To complete the site', sCk1: 'Add a price for Artwork No. 16', sCk2: 'Write a short story for each work', sCk3: 'Add exhibitions, writing and archive',
    sCk4: 'Add the remaining works of the series', saved2: 'Saved', sOnlySession: 'Saved for this session only (browser storage is full).'
  },
  da: {
    series: 'Serien', about: 'Birgitte', collection: 'Samling', acquire: 'Erhverv', menu: 'Menu', close: 'Luk',
    artist: 'Kunstner', scroll: 'Scroll', enter: 'Gå ind i serien', meetB: 'Mød Birgitte', fromSeries: 'Fra serien',
    originalWorks: 'Originale værker', currentSeries: 'Aktuel serie', trueScale: 'Vist i sand relativ størrelse',
    all: 'Alle', works: 'værker', work: 'værk', sold: 'Solgt', available: 'Til salg', reserved: 'Reserveret',
    priceOnRequest: 'Pris på forespørgsel', size: 'Størrelse', mounted: 'Monteret', unmounted: 'Uden montering', medium: 'Teknik',
    year: 'År', price: 'Pris', availability: 'Tilgængelighed', more: 'Mere…', less: 'Mindre…',
    acquireWork: 'Erhverv dette værk', askAbout: 'Spørg til dette værk', askPrice: 'Spørg om prisen',
    save: 'Gem i Min samling', saved: 'Gemt i Min samling', lookCloser: 'Se nærmere', onWall: 'Se det på en væg',
    soldNote: 'Dette værk har fundet sit hjem.', soldMore: 'Se andre værker', next: 'Næste værk', prev: 'Forrige værk',
    similar: 'Værker i samme størrelse', unique: 'Ét originalt værk. Når det er erhvervet, er det væk.',
    reservedNote: 'Dette værk er reserveret, mens et køb bekræftes.',
    collectionTitle: 'Min samling', collectionLead: 'Værker du vil vende tilbage til. At gemme reserverer ikke et værk.',
    collectionEmpty: 'Intet gemt endnu. Åbn et værk og vælg “Gem i Min samling”.',
    remove: 'Fjern', cartTitle: 'Dit køb', cartLead: 'Originale værker er unikke, så intet holdes, før Birgitte har bekræftet.',
    cartEmpty: 'Der er intet her endnu.', total: 'I alt', continue: 'Fortsæt', details: 'Dine oplysninger', name: 'Navn', email: 'E-mail',
    address: 'Leveringsadresse', note: 'En hilsen til Birgitte (valgfri)', place: 'Anmod om disse værker', protoNoPay: 'Prototype. Der trækkes ingen betaling.',
    thanksTitle: 'Tak.', thanksBody: 'Birgitte har modtaget din anmodning, og værkerne er reserveret til dig. Hun bekræfter og aftaler betaling og levering med dig personligt.',
    backSeries: 'Tilbage til serien', enquiry: 'Spørg til', send: 'Send til Birgitte', message: 'Besked',
    enquirySent: 'Sendt. Birgitte svarer dig personligt.', yourWords: 'Med hendes egne ord', facts: 'Serien',
    nineteen: '19 individuelle originale værker', sizesRange: 'A5 til A2', lookingClosely: 'Set på nært hold',
    detailOf: 'Detalje, ', madeWith: 'Prototype bygget på værkerne fra Birgittes nuværende side.',
    studio: 'Atelier', viewAs: 'Se som Birgitte', backToSite: 'Tilbage til siden', protoTag: 'Prototype · der trækkes ingen betaling',
    closer: 'Tættere på', wallPlaster: 'Puds', wallClay: 'Ler', wallInk: 'Blæk', onWallNote: 'Vist i sand størrelse ved siden af en 170 cm høj figur og en 200 cm sofa.',
    sToday: 'I dag', sWorks: 'Værker', sSeries: 'Serier', sInbox: 'Indbakke', sAdd: 'Tilføj et værk',
    sHello: 'Hej, Birgitte.', sHelloLead: 'Alt på siden styres herfra. Ændringer vises med det samme på siden.',
    sAvail: 'til salg', sResv: 'reserveret', sSold: 'solgt', sValue: 'Værdi af værker til salg', sNew: 'nye i indbakken',
    sShown: 'Vist på siden', sEdit: 'Rediger', sPrice: 'Pris (DKK)', sStatus: 'Status', sTitle: 'Titel', sStory: 'Historie (engelsk)', sStoryDa: 'Historie (dansk)',
    sPhoto: 'Foto af værket', sDrop: 'Slip et foto her, eller tryk for at vælge', sSave: 'Gem værk', sSeriesSel: 'Serie', sOrient: 'Format',
    sPortrait: 'Højformat', landscape: 'Tværformat', sMedium: 'Teknik', sOptional: 'valgfri', sDelete: 'Fjern fra siden',
    sNewSeries: 'Start en ny serie', sSeriesName: 'Seriens navn', sCreate: 'Opret serie', sMoveUp: 'Flyt tidligere', sMoveDown: 'Flyt senere',
    sInboxEmpty: 'Ingen beskeder endnu. Send en forespørgsel eller bestil værker på den offentlige side, så lander det her.',
    sOrder: 'Købsanmodning', sEnquiry: 'Forespørgsel', sConfirm: 'Bekræft salg', sRelease: 'Frigiv værker', sHandled: 'Marker som håndteret', sReply: 'Svar på e-mail',
    sConfirmed: 'Salg bekræftet', sReleased: 'Frigivet', sTip: 'Tip', sFirstTip: 'Prøv selv: spørg til et værk på siden, eller bestil et. Det lander her.',
    sChecklist: 'For at færdiggøre siden', sCk1: 'Tilføj en pris til Artwork No. 16', sCk2: 'Skriv en kort historie til hvert værk', sCk3: 'Tilføj udstillinger, tekster og arkiv',
    sCk4: 'Tilføj seriens øvrige værker', saved2: 'Gemt', sOnlySession: 'Kun gemt i denne session (browserlageret er fuldt).'
  }
};
