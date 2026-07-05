export const platformsData = [
    {
        company: 'Nintendo',
        consoles: [
            {
                name: 'Nintendo Entertainment System',
                generation: 3,
                releaseYear: 1983
            },
            {
                name: 'Super Nintendo Entertainment System',
                generation: 4,
                releaseYear: 1990
            },
            { name: 'Nintendo 64', generation: 5, releaseYear: 1996 },
            { name: 'Nintendo GameCube', generation: 6, releaseYear: 2001 },
            { name: 'Wii', generation: 7, releaseYear: 2006 },
            { name: 'Wii U', generation: 8, releaseYear: 2012 },
            { name: 'Nintendo Switch', generation: 8, releaseYear: 2017 },
            { name: 'Nintendo Switch 2', generation: 9, releaseYear: 2025 },
            { name: 'Game Boy', generation: 4, releaseYear: 1989 },
            { name: 'Game Boy Color', generation: 5, releaseYear: 1998 },
            { name: 'Game Boy Advance', generation: 6, releaseYear: 2001 },
            { name: 'Nintendo DS', generation: 7, releaseYear: 2004 },
            { name: 'Nintendo 3DS', generation: 8, releaseYear: 2011 },
            { name: 'Game & Watch', generation: 1, releaseYear: 1980 }
        ]
    },
    {
        company: 'Sony',
        consoles: [
            { name: 'PlayStation', generation: 5, releaseYear: 1994 },
            { name: 'PlayStation 2', generation: 6, releaseYear: 2000 },
            { name: 'PlayStation 3', generation: 7, releaseYear: 2006 },
            { name: 'PlayStation 4', generation: 8, releaseYear: 2013 },
            { name: 'PlayStation 5', generation: 9, releaseYear: 2020 },
            { name: 'PSP', generation: 7, releaseYear: 2004 },
            { name: 'PS Vita', generation: 8, releaseYear: 2011 }
        ]
    },
    {
        company: 'Microsoft',
        consoles: [
            { name: 'Xbox', generation: 6, releaseYear: 2001 },
            { name: 'Xbox 360', generation: 7, releaseYear: 2005 },
            { name: 'Xbox One', generation: 8, releaseYear: 2013 },
            { name: 'Xbox Series X/S', generation: 9, releaseYear: 2020 }
        ]
    },
    {
        company: 'Sega',
        consoles: [
            { name: 'Master System', generation: 3, releaseYear: 1985 },
            { name: 'Sega Genesis', generation: 4, releaseYear: 1988 },
            { name: 'Sega Saturn', generation: 5, releaseYear: 1994 },
            { name: 'Dreamcast', generation: 6, releaseYear: 1998 }
        ]
    },
    {
        company: 'Atari',
        consoles: [
            { name: 'Atari 2600', generation: 2, releaseYear: 1977 },
            { name: 'Atari 5200', generation: 2, releaseYear: 1982 },
            { name: 'Atari 7800', generation: 3, releaseYear: 1986 },
            { name: 'Atari Jaguar', generation: 5, releaseYear: 1993 }
        ]
    }
];

export const platformCascaderOptions = platformsData.map((companyData) => ({
    value: companyData.company,
    label: companyData.company,
    children: companyData.consoles.map((console) => ({
        value: console.name,
        label: console.name
    }))
}));
