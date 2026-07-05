export const platformsData = [
    {
        company: 'Nintendo',
        consoles: [
            {
                id: 'nintendo_nes',
                name: 'Nintendo Entertainment System',
                generation: 3,
                releaseYear: 1983
            },
            {
                id: 'nintendo_snes',
                name: 'Super Nintendo Entertainment System',
                generation: 4,
                releaseYear: 1990
            },
            {
                id: 'nintendo_n64',
                name: 'Nintendo 64',
                generation: 5,
                releaseYear: 1996
            },
            {
                id: 'nintendo_gamecube',
                name: 'Nintendo GameCube',
                generation: 6,
                releaseYear: 2001
            },
            {
                id: 'nintendo_wii',
                name: 'Wii',
                generation: 7,
                releaseYear: 2006
            },
            {
                id: 'nintendo_wii_u',
                name: 'Wii U',
                generation: 8,
                releaseYear: 2012
            },
            {
                id: 'nintendo_switch',
                name: 'Nintendo Switch',
                generation: 8,
                releaseYear: 2017
            },
            {
                id: 'nintendo_switch_2',
                name: 'Nintendo Switch 2',
                generation: 9,
                releaseYear: 2025
            },
            {
                id: 'nintendo_game_boy',
                name: 'Game Boy',
                generation: 4,
                releaseYear: 1989
            },
            {
                id: 'nintendo_game_boy_color',
                name: 'Game Boy Color',
                generation: 5,
                releaseYear: 1998
            },
            {
                id: 'nintendo_game_boy_advance',
                name: 'Game Boy Advance',
                generation: 6,
                releaseYear: 2001
            },
            {
                id: 'nintendo_ds',
                name: 'Nintendo DS',
                generation: 7,
                releaseYear: 2004
            },
            {
                id: 'nintendo_3ds',
                name: 'Nintendo 3DS',
                generation: 8,
                releaseYear: 2011
            },
            {
                id: 'nintendo_game_and_watch',
                name: 'Game & Watch',
                generation: 1,
                releaseYear: 1980
            }
        ]
    },
    {
        company: 'Sony',
        consoles: [
            {
                id: 'sony_playstation',
                name: 'PlayStation',
                generation: 5,
                releaseYear: 1994
            },
            {
                id: 'sony_playstation_2',
                name: 'PlayStation 2',
                generation: 6,
                releaseYear: 2000
            },
            {
                id: 'sony_playstation_3',
                name: 'PlayStation 3',
                generation: 7,
                releaseYear: 2006
            },
            {
                id: 'sony_playstation_4',
                name: 'PlayStation 4',
                generation: 8,
                releaseYear: 2013
            },
            {
                id: 'sony_playstation_5',
                name: 'PlayStation 5',
                generation: 9,
                releaseYear: 2020
            },
            { id: 'sony_psp', name: 'PSP', generation: 7, releaseYear: 2004 },
            {
                id: 'sony_ps_vita',
                name: 'PS Vita',
                generation: 8,
                releaseYear: 2011
            }
        ]
    },
    {
        company: 'Microsoft',
        consoles: [
            {
                id: 'microsoft_xbox',
                name: 'Xbox',
                generation: 6,
                releaseYear: 2001
            },
            {
                id: 'microsoft_xbox_360',
                name: 'Xbox 360',
                generation: 7,
                releaseYear: 2005
            },
            {
                id: 'microsoft_xbox_one',
                name: 'Xbox One',
                generation: 8,
                releaseYear: 2013
            },
            {
                id: 'microsoft_xbox_series_x_s',
                name: 'Xbox Series X/S',
                generation: 9,
                releaseYear: 2020
            }
        ]
    },
    {
        company: 'Sega',
        consoles: [
            {
                id: 'sega_master_system',
                name: 'Master System',
                generation: 3,
                releaseYear: 1985
            },
            {
                id: 'sega_genesis',
                name: 'Sega Genesis',
                generation: 4,
                releaseYear: 1988
            },
            {
                id: 'sega_saturn',
                name: 'Sega Saturn',
                generation: 5,
                releaseYear: 1994
            },
            {
                id: 'sega_dreamcast',
                name: 'Dreamcast',
                generation: 6,
                releaseYear: 1998
            }
        ]
    },
    {
        company: 'Atari',
        consoles: [
            {
                id: 'atari_2600',
                name: 'Atari 2600',
                generation: 2,
                releaseYear: 1977
            },
            {
                id: 'atari_5200',
                name: 'Atari 5200',
                generation: 2,
                releaseYear: 1982
            },
            {
                id: 'atari_7800',
                name: 'Atari 7800',
                generation: 3,
                releaseYear: 1986
            },
            {
                id: 'atari_jaguar',
                name: 'Atari Jaguar',
                generation: 5,
                releaseYear: 1993
            }
        ]
    },
    {
        company: 'Other',
        consoles: [
            {
                id: 'other_pc',
                name: 'PC',
                generation: undefined,
                releaseYear: undefined
            },
            {
                id: 'other_android',
                name: 'Android',
                generation: undefined,
                releaseYear: undefined
            },
            {
                id: 'other_ios',
                name: 'iOS',
                generation: undefined,
                releaseYear: undefined
            },
            {
                id: 'other_virtual_reality',
                name: 'Virtual Reality',
                generation: undefined,
                releaseYear: undefined
            }
        ]
    }
];

export const platformCascaderOptions = platformsData.map((companyData) => ({
    value: companyData.company,
    label: companyData.company,
    children: companyData.consoles.map((console) => ({
        value: console.id,
        label: console.name
    }))
}));
