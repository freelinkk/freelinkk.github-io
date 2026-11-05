/* ==========================================================================
   MIX ARCHIVE – the list behind /mix.html.  Edit this file to add or fix mixes.

   Fields
     title      name of the mix
     artist     artist / alias it was released or played under   ('' if unknown)
     type       'club' | 'radio' | 'mixtape'
     location   venue / station / city   ('' if unknown – shows as "—")
     date       'YYYY-MM-DD', or less exact: 'YYYY-MM', 'YYYY-Q4' (a quarter), 'YYYY'   ('' if unknown)
     youtube    [ 'VIDEO_ID', ... ]                          (optional)
     soundcloud [ 'https://api.soundcloud.com/tracks/ID', ... ]   (optional)
     mixcloud   [ '/user/show-name/', ... ]   the part of the Mixcloud URL after mixcloud.com   (optional)
     description  text shown above the player when the row is opened (optional).
                  A blank line starts a new paragraph.

   HUMAN MUSIC: every Human Music episode must use  description: HUMAN_MUSIC_DESCRIPTION
   (defined just below) so the show blurb appears in its drop-down.
                private tracks: keep the ?secret_token=... on the end

   Anything left blank still works: it is searchable by what is filled in, and
   undated mixes always sort to the bottom.
   ========================================================================== */
var HUMAN_MUSIC_DESCRIPTION = [
  "Jason (@freelink0000) and Andrew (@andrew_kambel) have been sharing music with each other since the days of Vine, dabbing, and the Harlem Shake. The music, often unconventional or unexpected, always is shared from a place of genuine fascination and love for the art form. And now they’re doing it on the airwaves.",
  "Join us for a monthly live radio show in which we do a dive into whatever has tickled our curiosity lately. Human Music will feature chats and discussion, live listening, perhaps even a TikTok challenge or two. Expect the many sonic encounters of our caffeine fuelled late-night discoveries, anti-algorithmic searches, as we fall face first down the endless interconnected rabbit holes of our internet lives. Discover what makes us human, and how music can connect two friends throughout the years."
].join("\n\n");

window.MIXES = [

  /* ---- radio ---- */
  { title: 'BRR #90', artist: 'link.exe', type: 'radio', location: 'Blue Rider Radio', date: '2026-10-02',
    youtube: ['YHWSOICxFbc'],
    soundcloud: ['https://api.soundcloud.com/tracks/2416604946'] },

  { title: 'Future Intel', artist: 'link.exe', type: 'radio', location: 'Future Intel HQ, The Hague', date: '2026-10-01',
    youtube: ['hhY6s2lwbLY'],
    soundcloud: ['https://api.soundcloud.com/tracks/2415205029'] },

  { title: 'Radio TNP', artist: 'Sing the Body Electronic', type: 'radio', location: 'Radio Tempo Não Pára', date: '2026-09-25',
    soundcloud: ['https://api.soundcloud.com/tracks/2407729818'] },

  { title: 'Radio Panini', artist: 'freelink & tipp.exe', type: 'radio', location: 'Radio Panini', date: '2026-10-30',
    description: 'High speed round the city limits via freelink and tipp.exe. No holds barred 160s \u2018n footwork replete with all the playful glee that strands of today\u2019s interpretations of these styles are doused with. Grins to the front. Music is allowed to be a laugh after all.',
    youtube: ['jTCJe7BdZwU'],
    soundcloud: ['https://api.soundcloud.com/tracks/2432229978'] },

  { title: 'Human Music (Episode 2)', artist: 'Jason Clark + Andrew Kambel', type: 'radio', location: 'Radio WORM, Rotterdam', date: '2026-10-22',
    description: HUMAN_MUSIC_DESCRIPTION,
    mixcloud: ['/radiowormrotterdam/human-music-w-jason-clark-andrew-kambel-22102026/'] },

  { title: 'Human Music (Episode 1)', artist: 'Jason Clark + Andrew Kambel', type: 'radio', location: 'Radio WORM, Rotterdam', date: '2026-09-24',
    description: HUMAN_MUSIC_DESCRIPTION,
    mixcloud: ['/radiowormrotterdam/human-music-w-jason-clark-andrew-kambel-24092026/'] },

  { title: 'Fluorescent Light', artist: 'freelink', type: 'radio', location: 'Feed Amsterdam', date: '2024-10-31',
    youtube: ['90kYO54PQek'],
    soundcloud: ['https://api.soundcloud.com/tracks/1949392527'] },

  { title: 'Future Intel', artist: 'freelink', type: 'radio', location: 'Future Intel HQ, The Hague', date: '2023-04-21',
    youtube: ['dv389eVwzMU'],
    soundcloud: ['https://api.soundcloud.com/tracks/1498829773'] },

  { title: 'Weesper Radio', artist: 'freelink', type: 'radio', location: 'Weesper Radio', date: '2023-02-15',
    soundcloud: ['https://api.soundcloud.com/tracks/1469866054'] },

  { title: 'Tokyovitamin Radio', artist: 'DJ Freelink', type: 'radio', location: 'Tokyovitamin Radio', date: '2016-06-16',
    soundcloud: ['https://api.soundcloud.com/tracks/269404597'] },

  { title: 'Sonic Acts presents: Feedback Loops', artist: 'freelink', type: 'radio', location: 'Radio WORM, Rotterdam', date: '2024-03-11',
    description: 'Reflections on the Sonic Acts Biennale.\n\nFind me at 1:36:00.',
    mixcloud: ['/radiowormrotterdam/sonic-acts-feedback-loops-110324/'] },

  /* ---- club ---- */
  { title: '5 Year Anniversary Party', artist: 'freelink', type: 'club', location: 'Treehouse NDSM', date: '2024-11-02',
    soundcloud: ['https://api.soundcloud.com/tracks/1948783491'] },

  { title: 'Set 1 & 2', artist: 'freelink', type: 'club', location: 'Van Gogh Museum', date: '2023-11-24',
    soundcloud: ['https://api.soundcloud.com/tracks/1675077645'] },

  { title: 'Oosterbar', artist: 'freelink', type: 'club', location: 'Oosterbar', date: '2019-Q4',
    soundcloud: ['https://api.soundcloud.com/tracks/725845945?secret_token=s-2vflfBkZusn'] },

  /* ---- mixtapes ---- */
  { title: 'BAILE4BEA', artist: 'freelink', type: 'mixtape', location: '', date: '2025-04-01',
    soundcloud: ['https://api.soundcloud.com/tracks/2066070252'] },

  { title: 'Dissociative Daydreaming', artist: 'freelink', type: 'mixtape', location: '', date: '2023-11-06',
    soundcloud: ['https://api.soundcloud.com/tracks/1654972815'] },

  { title: 'Anxiety Remedy', artist: 'freelink', type: 'mixtape', location: '', date: '2022-12-14',
    soundcloud: ['https://api.soundcloud.com/tracks/1403574238'] },

  { title: 'Covid @ home', artist: 'freelink', type: 'mixtape', location: '', date: '2020-05-01',
    soundcloud: ['https://api.soundcloud.com/tracks/810556453'] },

  { title: 'ov1_16112018_mix', artist: 'freelink', type: 'mixtape', location: '', date: '2018-11-16',
    soundcloud: ['https://api.soundcloud.com/tracks/530974548'] }
];
