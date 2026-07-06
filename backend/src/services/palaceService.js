function createPalaceService(repository) {
  return {
    listForUser(userId) {
      return repository.findAllByUser(userId);
    },
  };
}

module.exports = { createPalaceService };
