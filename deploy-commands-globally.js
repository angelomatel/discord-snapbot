const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const clientId = '703308998853656637';

const commandsToAdd = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ('data' in command && 'execute' in command) {
        // Register the commands globally
        commandsToAdd.push(command.data.toJSON());
        console.log(`Loading command ${command.data.name}`);
    } else {
        console.log(`Command ${file} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.BIG_CATMAN);

// and deploy your commands globally
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        const commands = await rest.get(
            Routes.applicationCommands(clientId),
        ); // Get the current set of commands

        // Remove current commands
        for (const command of commands) {
            await rest.delete(
                Routes.applicationCommand(clientId, command.id),
            );
            console.log(`Deleted command ${command.name}`);
        }

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commandsToAdd },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();