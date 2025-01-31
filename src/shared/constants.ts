export const channels = {
  QUIT: 'quit',
  INSTALL_CLI: 'install-cli',
  START_CLI: 'start-cli',
  STOP_CLI: 'stop-cli',
  OPEN_EXTERNAL_LINK: 'open-external-link',
} as const;

// Log channels for debugging
console.log('Channels configured:', channels);
