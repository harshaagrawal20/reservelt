import express from 'express';
import {
  createPricelist,
  getAllPricelists,
  getPricelistById,
  updatePricelist,
  deletePricelist
} from '../controllers/pricelist.controller.js';

const router = express.Router();

router.post('/', createPricelist);
router.get('/', getAllPricelists);
router.get('/:id', getPricelistById);
router.put('/:id', updatePricelist);
router.delete('/:id', deletePricelist);

export default router;