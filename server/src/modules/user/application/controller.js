import * as service from './service.js';

export async function getApplicationStatus(req, res) {
  const data = await service.getApplicationStatus(req.user.id);
  res.status(200).json({ success: true, data });
}

export async function submitApplication(req, res) {
  const data = await service.submitApplication(req.user.id, req.body, req.file);
  res.status(201).json({
    success: true,
    message: 'Application successfully submitted',
    data,
  });
}
