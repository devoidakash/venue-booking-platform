import * as service from './service.js';

export async function getApplications(req, res) {
  const data = await service.getApplications(req.query.status);
  res.status(200).json({ success: true, data });
}

export async function updateApplication(req, res) {
  const data = await service.updateApplication(
    req.admin.id,
    req.params.applicationId,
    req.body
  );
  res.status(201).json({
    success: true,
    message: 'Application updated successfully',
    data: data,
  });
}

export async function getApplicationsCounts() {
  const data = await service.getApplicationsCounts();
  res.status(201).json({
    success: true,
    data,
  });
}
