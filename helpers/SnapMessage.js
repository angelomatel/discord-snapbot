const { getColor } = require('./EmbedColor');
const { MessageEmbed, EmbedBuilder } = require('discord.js');

const EnchantKeywords = {
    'AntiMage1': 'Anti-Mage 1: MPen. + 1.5%',
    'AntiMage2': 'Anti-Mage 2: MPen. + 3%',
    'AntiMage3': 'Anti-Mage 3: MPen. + 4.5%',
    'AntiMage4': 'Anti-Mage 4: MPen. + 6%',

    'Arcane1': 'Arcane 1: M. Dmg Increase + 2%',
    'Arcane2': 'Arcane 2: M. Dmg Increase + 4%',
    'Arcane3': 'Arcane 3: M. Dmg Increase + 6%',
    'Arcane4': 'Arcane 4: M. Dmg Increase + 8%',

    'Arch1': 'Arch 1: Ranged Phy. ATK + 2.5%',
    'Arch2': 'Arch 2: Ranged Phy. ATK + 5%',
    'Arch3': 'Arch 3: Ranged Phy. ATK + 7.5%',
    'Arch4': 'Arch 4: Ranged Phy. ATK + 10%',

    'Armor1': 'Armor 1: Cri.Res + 5',
    'Armor2': 'Armor 2: Cri.Res + 10',
    'Armor3': 'Armor 3: Cri.Res + 15',
    'Armor4': 'Armor 4: Cri.Res + 20',

    'ArmorBreaking1': 'Armor Breaking 1: Phy. Pen + 1.5%',
    'ArmorBreaking2': 'Armor Breaking 2: Phy. Pen + 3%',
    'ArmorBreaking3': 'Armor Breaking 3: Phy. Pen + 4.5%',
    'ArmorBreaking4': 'Armor Breaking 4: Phy. Pen + 6%',

    'Blasphemy1': 'Blasphemy 1: Skill Dmg Reduc. + 5%',
    'Blasphemy2': 'Blasphemy 2: Skill Dmg Reduc. + 10%',
    'Blasphemy3': 'Blasphemy 3: Skill Dmg Reduc. + 15%',
    'Blasphemy4': 'Blasphemy 4: Skill Dmg Reduc. + 20%',

    'DivineBlessing1': 'Divine Blessing 1: M. DMG Reduc. + 2.5%',
    'DivineBlessing2': 'Divine Blessing 2: M. DMG Reduc. + 5%',
    'DivineBlessing3': 'Divine Blessing 3: M. DMG Reduc. + 7.5%',
    'DivineBlessing4': 'Divine Blessing 4: M. DMG Reduc. + 10%',

    'Insight1': 'Insight 1: Ignore M.Def + 5%',
    'Insight2': 'Insight 2: Ignore M.Def + 10%',
    'Insight3': 'Insight 3: Ignore M.Def + 15%',
    'Insight4': 'Insight 4: Ignore M.Def + 20%',

    'Magic1': 'Magic 1: Variable Cast Time Reduction + 2.5%',
    'Magic2': 'Magic 2: Variable Cast Time Reduction + 5%',
    'Magic3': 'Magic 3: Variable Cast Time Reduction + 7.5%',
    'Magic4': 'Magic 4: Variable Cast Time Reduction + 10%',

    'Morale1': 'Morale 1: Ignore DEF + 5%',
    'Morale2': 'Morale 2: Ignore DEF + 10%',
    'Morale3': 'Morale 3: Ignore DEF + 15%',
    'Morale4': 'Morale 4: Ignore DEF + 20%',

    'Sharp1': 'Sharp 1: Crit.DMG + 5%',
    'Sharp2': 'Sharp 2: Crit.DMG + 10%',
    'Sharp3': 'Sharp 3: Crit.DMG + 15%',
    'Sharp4': 'Sharp 4: Crit.DMG + 20%',

    'SharpBlade1': 'Sharp Blade 1: Melee Phy. ATK + 5%',
    'SharpBlade2': 'Sharp Blade 2: Melee Phy. ATK + 10%',
    'SharpBlade3': 'Sharp Blade 3: Melee Phy. ATK + 15%',
    'SharpBlade4': 'Sharp Blade 4: Melee Phy. ATK + 20%',

    'Tenacity1': 'Tenacity 1: Phy. DMG Reduc. + 2.5%',
    'Tenacity2': 'Tenacity 2: Phy. DMG Reduc. + 5%',
    'Tenacity3': 'Tenacity 3: Phy. DMG Reduc. + 7.5%',
    'Tenacity4': 'Tenacity 4: Phy. DMG Reduc. + 10%',

    'Zeal1': 'Zeal 1: Auto Attack DMG + 2.5%',
    'Zeal2': 'Zeal 2: Auto Attack DMG + 5%',
    'Zeal3': 'Zeal 3: Auto Attack DMG + 7.5%',
    'Zeal4': 'Zeal 4: Auto Attack DMG + 10%',

    'MaxHpPer': 'MaxHp%',
    'MaxSpPer': 'MaxSp%',
    'PhyDmgInc': 'Phy. Dmg Inc.',
    'AttackSpeed': 'Attack Spd',
    'CritDmg': 'Crit.Dmg',
    'CritDef': 'Crit.Def',
    'HealingIncrease': 'Healing Increase',
    'HealingReceived': 'Healing Received',

    'SilenceRes': 'Silence Res',
    'FreezeRes': 'Freeze Res',
    'StoneRes': 'Stone Res',
    'StunRes': 'Stun Res',
    'BurnRes': 'Burn Resistance',
    'PoisonRes': 'Poison Res',
    'SnareRes': 'Snare Res',
    'FearRes': 'Fear Res',
    'CurseRes': 'Curse Res',
}

module.exports = {
    /**
     * 
     * @param {*} item 
     * @param {*} guildName
     * @returns {MessageEmbed}
     * @description Creates an embed message for the item
     */
    Create: function (item, guildName) {
        const embed = new EmbedBuilder()
            .setTitle(item.FullName)
            .setDescription(`*Please keep this to ${guildName}*\nExpires <t:${item.EndTime}:R>`)
            .setThumbnail(item.ImageUrl)
            .setColor(getColor(item.Price))
            .addFields(
                {
                    name: 'Price',
                    value: `Ƶ ${item.Price.toLocaleString()}`,
                },
            )

        if (item.Enchants) {
            embed.addFields({
                name: 'Enchant',
                value: item.Enchants.map((e) => {
                    if (e.Enchant in EnchantKeywords) {
                        return `${EnchantKeywords[e.Enchant]}${(e.Level) ? ` +${e.Level / 10}%` : ''}`;
                    } else {
                        return `${e.Enchant} +${e.Level}`;
                    }
                }).join('\n')
            })
        }
        return embed;
    }
}