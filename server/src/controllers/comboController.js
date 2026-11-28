import Combo from "../models/Combo.js";
import { ApiError, asyncHandler, ok } from "../utils/helpers.js";

export const listCombos = asyncHandler(async (req, res) => {
  const showAll = req.query.all === "true" && req.user?.role === "ADMIN";
  const combos = await Combo.find(showAll ? {} : { active: true }).sort({ price: 1 }).lean();
  ok(res, combos.map((c) => ({ ...c, id: String(c._id) })));
});

export const createCombo = asyncHandler(async (req, res) => ok(res, await Combo.create(req.body), {}, 201));

export const updateCombo = asyncHandler(async (req, res) => {
  const combo = await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!combo) throw new ApiError(404, "Không tìm thấy combo");
  ok(res, combo);
});

export const deleteCombo = asyncHandler(async (req, res) => {
  const combo = await Combo.findByIdAndDelete(req.params.id);
  if (!combo) throw new ApiError(404, "Không tìm thấy combo");
  ok(res, { deleted: true });
});
