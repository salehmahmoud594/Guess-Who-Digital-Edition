from pathlib import Path
import json
from PIL import Image

SOURCE = Path('/home/ubuntu/chars_ingest/chars')
OUTPUT = Path('/home/ubuntu/webdev-static-assets/fictional_crops')
OUTPUT.mkdir(parents=True, exist_ok=True)

names = [
    # FIC-01
    'Copper Quinn', 'Mister Vale', 'Luma Finch', 'Nia North', 'Orin Glow', 'Sable Reed',
    'Tessa Moon', 'Bram Kestrel', 'Yara Sun', 'Milo March', 'Ari Lantern', 'Cleo Quill',
    'Juno Tide', 'Pax Wilder', 'Mara Bloom', 'Ivo Flint', 'Zara Moss', 'Theo Kite',
    'Nell Orbit', 'Owen Prism', 'Rhea Pocket', 'Sol Harbor', 'Mina Dusk', 'Ezra Lark',
    'Vera Comet', 'Kian Paper', 'Lina Fern', 'Noah Ember', 'Aya Rook', 'Finn Meadow',
    # FIC-02
    'Mira Slate', 'Rowan Dusk', 'Anika Haze', 'Jules Parable', 'Soren Vale', 'Pippa North',
    'Dalia Quill', 'Hugo Finch', 'Selene Moss', 'Calder Reed', 'Imogen Star', 'Basil Crane',
    'Lark Winter', 'Cassian Bloom', 'Rumi Ember', 'Estelle Kite', 'Marlowe Finch', 'Sia Harbor',
    'Oona Prism', 'Rafe Meadow', 'Ines Lantern', 'Lev Pocket', 'Mabel Dusk', 'Taro Glow',
    'Faye North', 'Cato Quill', 'Jessa Bloom', 'Venn Slate', 'Nori Orbit', 'Bram Meadow',
    # FIC-03
    'Celia Rook', 'Oren Tide', 'Amara Flint', 'Niko Fern', 'Priya Comet', 'Elias Kite',
    'Marnie Glow', 'Solene Harbor', 'Tobin Vale', 'Asha Moss', 'Rooke Lantern', 'Mica Bloom',
    'Ysolde Dusk', 'Ren Paper', 'Maela North', 'Koda Ember', 'Livia Prism', 'Arden Pocket',
    'Kira Meadow', 'Thane Slate', 'Mira Riddle', 'Olek Finch', 'Suri Tide', 'Bellamy Reed',
    'Etta Comet', 'Dorian Fern', 'Maeve Orbit', 'Kellan Glow', 'Rina Harbor', 'Oswin Bloom',
    # FIC-04
    'Amelie Rook', 'Jorin Moss', 'Tala Moon', 'Remy Flint', 'Nessa Quill', 'Harlan Tide',
    'Eira Lantern', 'Miro Vale', 'Sana Bloom', 'Otto Prism', 'Jun Ember', 'Lorna Meadow',
    'Cress North', 'Vito Orbit', 'Fara Dusk', 'Paxel Paper', 'Amina Glow', 'Hugo Harbor',
    'Tilda Fern', 'Soren Riddle', 'Yara Pocket', 'Cosmo Reed', 'Nila Comet', 'Peregrine Vale',
    'Imani Moss', 'Alaric Tide', 'Beatrix Bloom', 'Kofi Flint', 'Elowen Orbit', 'August Glow',
    # Overflow from the supplied ZIP (kept stable, not silently discarded)
    'Aster Vale', 'Briar Sun', 'Cora Lantern', 'Dune Kestrel', 'Elian Moss', 'Freya Slate',
    'Gala North', 'Hollis Reed', 'Imani Prism', 'Jora Bloom', 'Kato Dusk', 'Leni Harbor',
    'Miro Fern', 'Nola Orbit', 'Oriel Flint', 'Pia Comet', 'Quillan Meadow', 'Rhea Lantern',
    'Sera Rook', 'Tavi Paper', 'Uma Tide', 'Vero Glow', 'Willa Pocket', 'Xara Moon',
    'Yuki Fern', 'Zane Ember', 'Aven Quill', 'Belen Harbor', 'Ciro Moss', 'Daria Prism',
]

def ordered_group(stem: str) -> list[Path]:
    base = SOURCE / f'{stem}.png'
    return [base] + [SOURCE / f'{stem} ({index}).png' for index in range(1, 5)]

groups = [
    ('fictional_01', ordered_group('Gemini_Generated_Image_61531u61531u6153')),
    ('fictional_02', ordered_group('Gemini_Generated_Image_osakodosakodosak')),
    ('fictional_03', ordered_group('Gemini_Generated_Image_pmc5fmpmc5fmpmc5')),
    ('fictional_04', ordered_group('Gemini_Generated_Image_yojuwhyojuwhyoju')),
    ('fictional_overflow', [
        SOURCE / 'Gemini_Generated_Image_o7ti7ao7ti7ao7ti.png',
        SOURCE / 'Prompt 1 Sheet B.png',
        SOURCE / 'Prompt 1 Sheet C.png',
        SOURCE / 'Prompt 1 Sheet D.png',
        SOURCE / 'Prompt 1 Sheet E.png',
    ]),
]

manifest = []
name_index = 0
for group_name, sheets in groups:
    for sheet_index, sheet_path in enumerate(sheets, start=1):
        if not sheet_path.exists():
            raise FileNotFoundError(sheet_path)
        with Image.open(sheet_path).convert('RGB') as sheet:
            width, height = sheet.size
            for column in range(6):
                left = round(column * width / 6) + 8
                right = round((column + 1) * width / 6) - 8
                tile = sheet.crop((left, 0, right, height))

                # Preserve the narrow generated tile without distortion by placing
                # it on a clean 4:5 card-art canvas using the exact category field.
                target_width = round(tile.height * 0.8)
                card = Image.new('RGB', (target_width, tile.height), '#DDE7F6')
                x = (target_width - tile.width) // 2
                card.paste(tile, (x, 0))

                asset_id = name_index + 1
                filename = f'fictional_characters_{asset_id:03d}.png'
                output_path = OUTPUT / filename
                card.save(output_path, format='PNG', optimize=True)
                manifest.append({
                    'id': asset_id,
                    'category': 'fictional_characters',
                    'name': names[name_index],
                    'filename': filename,
                    'sourceSheet': f'{group_name}_sheet_{sheet_index:02d}',
                    'sourceFilename': sheet_path.name,
                    'sourceColumn': column + 1,
                    'status': 'cropped_unhosted',
                    'hostedUrl': None,
                })
                name_index += 1

if name_index != 150:
    raise RuntimeError(f'Expected 150 crops, produced {name_index}')

(OUTPUT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'created {name_index} cropped assets in {OUTPUT}')
