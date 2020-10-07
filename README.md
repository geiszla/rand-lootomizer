# Rand Lootomizer

A loot table randomizer inspired by [SethBling's](https://www.youtube.com/watch?v=3JEXAZOrykQ), but modifies the loots a bit, so that the game is statistically guaranteed to be finishable. By removing the `killed_by_player` conditions from items, we can make sure they drop something even if they are blocks/chests/etc.

## Get Started

1. Download a binary for your system from [Releases](https://github.com/geiszla/rand-lootomizer/releases)
2. Put the loot table directory (`loot_table`) in the same directory, where the binary is
3. Run the binary

The script shuffles the drop tables in place, so you just need to put the loot table in a data pack and put it in the `datapacks` directory (`%appdata%/.minecraft/saves/<world>/datapacks`).

## Contribute

1. Clone the project
2. Send pull requests!
