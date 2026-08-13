// User-supplied cartoon-movie posters. The filename-derived display title is stable.
const CARTOON_MOVIE_RAW = String.raw`
A Bug's Life	0fdec24d
A Monster in Paris	3832d2f3
Abominable	7da8449f
Antz	777eb53d
Arthur Christmas	88b1bb56
Big Hero 6	55eec69c
Bolt	89eb33c5
Brave	130f26a9
Captain Underpants The First Epic Movie	54c5c5e0
Cars	c89a847e
Cloudy With a Chance of Meatballs	7d6b28f0
Coco	336af319
Despicable Me 2	6de0f572
Despicable Me	f93a0418
Dog Man	c5c57564
Dr. Seuss' Horton Hears a Who!	80d34218
Elemental	3e539b05
Elio	cb4c0fcb
Finding Dory	e60c46da
Finding Nemo	ff497063
Flushed Away	09d22136
Frozen	7aadf6e0
Happy Feet	8a60dc7f
How to Train Your Dragon 2	c62249ad
How to Train Your Dragon The Hidden World	441fc8a2
How to Train Your Dragon	d2d0e7d3
Ice Age	4e4fd662
Incredibles 2	847b3ed8
Inside Out 2	57670dc5
Inside Out	88d8006f
KPop Demon Hunters	e27fe128
Kung Fu Panda 2	c206664f
Kung Fu Panda 3	79e75572
Kung Fu Panda	5c49d7f7
Leo	af5f083b
Lightyear	8a44e897
Madagascar 3 Europe's Most Wanted	4ff36323
Megamind	040ff631
Migration	ab03d32c
Moana	b109a06c
Monster House	cee62530
Monsters University	42a08c2a
Monsters vs. Aliens	49cbb496
Monsters, Inc.	056bedfb
Mr. Peabody & Sherman	4b198d35
Ne Zha II	ddc083f8
Nimona	03b0651c
Onward	8614f5bc
Orion and the Dark	f75e85a9
Over the Hedge	bd252e54
Penguins of Madagascar	811691eb
Puss in Boots The Last Wish	a4531f54
Puss in Boots	68ac3024
Ralph Breaks the Internet	a671bb54
Rango	06b6d6dc
Ratatouille	8703fbb5
Raya and the Last Dragon	f5fba8b0
Rio	159799e3
Rise of the Guardians	d6289a7f
Sausage Party	2d5831c6
Shrek 2	fa351329
Shrek	17ca525d
Smallfoot	36b766d1
Soul	2e27e016
Spider-Man Across the Spider-Verse	fcd799e8
Spider-Man Into the Spider-Verse	01ebb41d
Strange World	159412ae
Surf's Up	7525efcb
Tangled	b3ddc49f
Teenage Mutant Ninja Turtles Mutant Mayhem	cfd624f0
The Adventures of Tintin	100b3c85
The Amazing Maurice	ad2a0956
The Angry Birds Movie 2	b4216331
The Bad Guys 2	6008600e
The Bad Guys	c9f41028
The Book of Life	f70b33fe
The Croods A New Age	47db48b7
The Good Dinosaur	7bb6c6c8
The Incredibles	12049b12
The LEGO Batman Movie	28de36bb
The LEGO Movie 2 The Second Part	84995dbf
The Lego Movie	43c42581
The Little Prince	32997483
The Mitchells vs. the Machines	a4516db9
The Peanuts Movie	3a6827ed
The Sea Beast	4214c407
The Secret Life of Pets	720a4dcb
The Wild Robot	61d37e4a
Toy Story 2	b15ec580
Toy Story 3	f99d2494
Toy Story 4	bc6a25ea
Toy Story	1445b552
Transformers One	0e2af6b4
Trolls	87057133
Ultraman Rising	ff8eb249
Up	d66cbb75
Vivo	7f612319
WALL-E	b3c8314d
Wreck-It Ralph	e878e83c
Zootopia	b4201bbc
`;

export const CARTOON_MOVIE_CARDS = CARTOON_MOVIE_RAW.trim().split("\n").map((record, index) => {
  const [name, hash] = record.split("\t");
  return [name, `/manus-storage/cartoon_movie_${String(index + 1).padStart(3, "0")}_${hash}.webp`] as const;
});

export const CARTOON_MOVIE_NAMES = CARTOON_MOVIE_CARDS.map(([name]) => name);
export const CARTOON_MOVIE_ASSETS: Record<string, string> = Object.fromEntries(CARTOON_MOVIE_CARDS);
