const ERROR_CONFIG = {
  VENUE_IMAGES_REQUIRED: {
    statusCode: 400,
    message: 'Please upload 5 venue images',
    code: 'VENUE_IMAGES_REQUIRED',
  },
  PROOF_DOCUMENT_REQUIRED: {
    statusCode: 400,
    message: 'Please upload the venue proof document',
    code: 'PROOF_DOCUMENT_REQUIRED',
  },
  NO_EXISTING_VENUE_FOUND: {
    statusCode: 400,
    message: 'No existing venue found',
    code: 'NO_EXISTING_VENUE_FOUND',
  },
};

export default ERROR_CONFIG;
