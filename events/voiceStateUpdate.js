const waitingSystem = require('../systems/waitingSystem');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        await waitingSystem.handleVoiceStateUpdate(oldState, newState);
    },
};