function assignRole(message) {
    if (message.id === '751844808963915887') {
        console.log(message.content)
        message.react(':apple:');
    }
}

module.exports = { assignRole };

// var role = message.guild.roles.find(role => role.name === "MyRole");
// message.member.addRole(role);