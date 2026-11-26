const isString = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;
const PHONE_REGEX = /^(0|\+84)\d{9,10}$/;
const CODE_REGEX = /^[a-z0-9-]{2,30}$/;

const build = (partial) => (body) => {
  const errors = {};
  const check = (field, valid, message, required = true) => {
    const value = body[field];
    if (value === undefined) {
      if (required && !partial) errors[field] = message;
      return;
    }
    if (!valid(value)) errors[field] = message;
  };

  check('code', (v) => typeof v === 'string' && CODE_REGEX.test(v.trim().toLowerCase()), 'Mã rạp chỉ gồm chữ thường, số, dấu gạch ngang (2-30 ký tự)');
  check('name', (v) => isString(v, 2, 100), 'Tên rạp phải từ 2 đến 100 ký tự');
  check('cityId', (v) => isString(v, 2, 30), 'Mã thành phố không hợp lệ');
  check('cityName', (v) => isString(v, 2, 60), 'Tên thành phố không hợp lệ');
  check('address', (v) => isString(v, 5, 200), 'Địa chỉ phải từ 5 đến 200 ký tự');
  check('phone', (v) => v === '' || (typeof v === 'string' && PHONE_REGEX.test(v.trim())), 'Số điện thoại không hợp lệ', false);
  check('isActive', (v) => typeof v === 'boolean', 'isActive phải là true/false', false);
  return errors;
};

export const validateCreateTheater = build(false);
export const validateUpdateTheater = build(true);
