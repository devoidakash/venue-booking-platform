const storageKeys = {
  getVenueCoverImageKey(vendorId, venueId) {
    return `venues/${vendorId}/${venueId}/cover_image`;
  },
};

export default storageKeys;
