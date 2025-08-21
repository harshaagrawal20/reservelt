import Pricelist from '../models/pricelist.model.js';

export const createPricelist = async (req, res) => {
  try {
    const pricelist = await Pricelist.create(req.body);
    res.status(201).json({ success: true, pricelist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create pricelist', error: error.message });
  }
};

export const getAllPricelists = async (req, res) => {
  try {
    const pricelists = await Pricelist.find();
    res.json({ success: true, pricelists });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pricelists', error: error.message });
  }
};

export const getPricelistById = async (req, res) => {
  try {
    const pricelist = await Pricelist.findById(req.params.id);
    if (!pricelist) return res.status(404).json({ success: false, message: 'Pricelist not found' });
    res.json({ success: true, pricelist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pricelist', error: error.message });
  }
};

export const updatePricelist = async (req, res) => {
  try {
    const pricelist = await Pricelist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pricelist) return res.status(404).json({ success: false, message: 'Pricelist not found' });
    res.json({ success: true, pricelist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update pricelist', error: error.message });
  }
};

export const deletePricelist = async (req, res) => {
  try {
    const pricelist = await Pricelist.findByIdAndDelete(req.params.id);
    if (!pricelist) return res.status(404).json({ success: false, message: 'Pricelist not found' });
    res.json({ success: true, message: 'Pricelist deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete pricelist', error: error.message });
  }
};