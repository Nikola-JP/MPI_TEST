const express = require('express');
const folderService = require('../services/folderService');
const folderRepository = require('../repositories/folderRepository');
const { requireUser } = require('../middleware/auth');

const router = express.Router();

router.use(requireUser);

router.get('/root', async (req, res, next) => {
  try {
    const root = await folderService.getRootFolder();
    if (!root) {
      return res.status(404).json({ error: 'Root folder not found' });
    }
    await folderService.requirePermission(req.user.user_id, root.folder_id, 'READ');
    return res.json(root);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/children', async (req, res, next) => {
  try {
    const folderId = Number(req.params.id);
    const folder = await folderRepository.findFolderById(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    await folderService.requirePermission(req.user.user_id, folderId, 'READ');
    const children = await folderService.getChildren(folderId);
    return res.json(children);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { tenantId, parentId, name, type } = req.body;
    if (!tenantId || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (parentId) {
      await folderService.requirePermission(req.user.user_id, parentId, 'WRITE');
    }
    const folderId = await folderService.createFolder({
      tenantId,
      parentId: parentId || null,
      name,
      type
    });
    return res.status(201).json({ folderId });
  } catch (error) {
    return next(error);
  }
});

router.post('/generate-template', async (req, res, next) => {
  try {
    const { tenantId, ouName, academicYear, subjectName } = req.body;
    if (!tenantId || !ouName || !academicYear || !subjectName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const root = await folderService.getRootFolder();
    if (!root) {
      return res.status(404).json({ error: 'Root folder not found' });
    }
    await folderService.requirePermission(req.user.user_id, root.folder_id, 'WRITE');
    const result = await folderService.generateTemplate({ tenantId, ouName, academicYear, subjectName });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/permissions', async (req, res, next) => {
  try {
    const folderId = Number(req.params.id);
    await folderService.requirePermission(req.user.user_id, folderId, 'READ');
    const permissions = await folderService.getFolderPermissions(folderId);
    return res.json(permissions);
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/permissions', async (req, res, next) => {
  try {
    const folderId = Number(req.params.id);
    const { userId, level } = req.body;
    if (!userId || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await folderService.requirePermission(req.user.user_id, folderId, 'OWNER');
    await folderService.setFolderPermission({ folderId, userId, level });
    return res.status(201).json({ status: 'ok' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
