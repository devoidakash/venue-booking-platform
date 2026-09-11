import * as service from './service.js';

export async function getApplications(req, res) {
  const data = await service.getApplications(req.query.status);
  res.status(200).json({ status: true, data });
}

export async function updateApplication(req, res) {
  await service.updateApplication(req.admin.id, req.params.id, req.body);
  res.status(201).json({ status: true, message: 'Status updated' });
}

export async function getApplicationsCount(req, res) {
  const data = await service.getApplicationsCount();
  res.status(200).json({ status: true, data });
}
