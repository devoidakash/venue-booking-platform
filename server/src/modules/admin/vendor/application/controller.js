import {
  getApplications,
  getApplicationsCount,
  reviewApplication,
} from './service.js';

export async function listApplications(req, res) {
  const data = await getApplications(req.query.status);
  res.status(200).json({ status: true, data });
}

export async function updateApplication(req, res) {
  await reviewApplication(req.admin.id, req.params.id, req.body);
  res.status(201).json({ status: true, message: 'Status updated' });
}

export async function listApplicationCount(req, res) {
  const data = await getApplicationsCount();
  res.status(200).json({ status: true, data });
}
