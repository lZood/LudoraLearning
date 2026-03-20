import re

mapping = {
    "wood.png": "wood.png",
    "wheat.png": "wheat.png",
    "torch.png": "torch.gif",
    "sword.png": "sword.png",
    "stone.png": "stone.png",
    "spyglass.png": "spyglass.png",
    "shield.png": "shield.png",
    "sheep.png": "sheep.png",
    "shears.png": "shears.png",
    "saddle.png": "saddle.png",
    "sand.png": "sand.png",
    "pig.png": "pig.png",
    "pickaxe.png": "pickaxe.png",
    "minecart.png": "minecart.png",
    "map.png": "map.png",
    "log.png": "log.png",
    "ladder.png": "ladder.png",
    "iron_bars.png": "iron_bars.png",
    "honey_bottle.png": "honey.png",
    "honey.png": "honey.png",
    "grass.png": "grass.png",
    "golden_apple.png": "golden_apple.png",
    "gapple.png": "golden_apple.png",
    "furnace.png": "furnace.png",
    "flower.png": "flower.png",
    "flower_pot.png": "flower_pot.png",
    "fishing_rod.png": "fishing_rod.png",
    "fence.png": "Fence.webp",
    "crossbow.png": "crossbow.png",
    "cow.png": "cow.png",
    "cookie.png": "Cookie_JE2_BE2.png",
    "composter.png": "composter.png",
    "apple.png": "apple.png",
    "arrow.png": "arrow.png",
    "axe.png": "axe.png",
    "barrel.png": "barrel.png",
    "bed.png": "bed.png",
    "boat.png": "boat.png",
    "bottle.png": "bottle.png",
    "bow.png": "bow.png",
    "bowl.png": "bowl.png",
    "bread.png": "bread.png",
    "brush.png": "brush.png",
    "cake.png": "cake.png",
    "campfire.png": "campfire.gif",
    "candle.png": "candle.png",
    "carrot.png": "carrot.png",
    "cauldron.png": "cauldron.png",
    "chain.png": "chain.png",
    "chest.png": "chest.gif",
    "chicken.png": "chicken.png",
    "clock.png": "clock.gif",
    "compass.png": "compass.gif"
}

placeholder_prefix = "/images/placeholders/"
target_prefix = "/images/evaluacion/"

with open(r'c:\Users\José Carlos\Documents\Desarrollo\LudoraLearning\src\app\portal-alumno\evaluacion\questions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_path(match):
    full_path = match.group(1)
    filename = full_path.replace(placeholder_prefix, "")
    
    if filename in mapping:
        new_filename = mapping[filename]
        return f"imageUrl: '{target_prefix}{new_filename}'"
    else:
        # If not in specific mapping, just update the prefix if it matches
        new_path = full_path.replace(placeholder_prefix, target_prefix)
        return f"imageUrl: '{new_path}'"

# Match imageUrl: '/images/placeholders/...'
new_content = re.sub(r"imageUrl: '(/images/placeholders/.+?)'", replace_path, content)

with open(r'c:\Users\José Carlos\Documents\Desarrollo\LudoraLearning\src\app\portal-alumno\evaluacion\questions.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement complete.")
