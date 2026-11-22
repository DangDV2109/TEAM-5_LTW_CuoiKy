const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)\d{9,10}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,64}$/;

const isString = (v) => typeof v === 'string';

const checkName = (name, errors) => {
  if (!isString(name) || name.trim().length < 2 || name.trim().length > 50) {
    errors.name = 'Họ tên phải từ 2 đến 50 ký tự';
  }
};
const checkPhone = (phone, errors) => {
  if (!isString(phone) || !PHONE_REGEX.test(phone.trim())) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
};
const checkNewPassword = (password, errors, field = 'password') => {
  if (!isString(password) || !PASSWORD_REGEX.test(password)) {
    errors[field] = 'Mật khẩu phải từ 6 ký tự, gồm cả chữ và số';
  }
};

export const validateRegister = ({ name, email, password, phone }) => {
  const errors = {};
  checkName(name, errors);
  if (!isString(email) || !EMAIL_REGEX.test(email.trim())) errors.email = 'Email không hợp lệ';
  checkNewPassword(password, errors);
  if (phone !== undefined && phone !== '') checkPhone(phone, errors);
  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!isString(email) || !EMAIL_REGEX.test(email.trim())) errors.email = 'Email không hợp lệ';
  if (!isString(password) || password.length === 0) errors.password = 'Vui lòng nhập mật khẩu';
  return errors;
};

export const validateUpdateProfile = ({ name, phone, dateOfBirth, avatar }) => {
  const errors = {};
  if (name !== undefined) checkName(name, errors);
  if (phone !== undefined && phone !== '') checkPhone(phone, errors);
  if (dateOfBirth !== undefined && dateOfBirth !== '') {
    const d = new Date(dateOfBirth);
    if (Number.isNaN(d.getTime()) || d > new Date()) errors.dateOfBirth = 'Ngày sinh không hợp lệ';
  }
  if (avatar !== undefined && (!isString(avatar) || avatar.length > 500)) {
    errors.avatar = 'Đường dẫn ảnh đại diện không hợp lệ';
  }
  return errors;
};

export const validateChangePassword = ({ currentPassword, newPassword }) => {
  const errors = {};
  if (!isString(currentPassword) || currentPassword.length === 0) {
    errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
  }
  checkNewPassword(newPassword, errors, 'newPassword');
  if (!errors.newPassword && newPassword === currentPassword) {
    errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
  }
  return errors;
};
