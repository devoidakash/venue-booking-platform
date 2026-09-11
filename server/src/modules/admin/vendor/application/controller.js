import * as service from './service.js';

export async function getApplications(req, res) {
  const data = await service.getApplications(req.query.status);
  res.status(200).json({ status: true, data });
}

export async function updateApplication(req, res) {
  await service.updateApplication(
    req.admin.id,
    req.params.applicationId,
    req.body
  );
  res
    .status(201)
    .json({ status: true, message: 'Vendor application status updated' });
}

export async function getApplicationsCount(req, res) {
  const data = await service.getApplicationsCount();
  res.status(200).json({ status: true, data });
}
