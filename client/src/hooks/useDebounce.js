import { useEffect, useState } from "react";

/**
 * Custom hook trì hoãn cập nhật giá trị tìm kiếm (tránh gọi lọc/API liên tục mỗi lần gõ phím)
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
