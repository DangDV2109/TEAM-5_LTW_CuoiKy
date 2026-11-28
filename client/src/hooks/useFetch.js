import { useCallback, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { apiError } from "../utils";

/**
 * Custom hook gọi API GET dùng chung (hỗ trợ loading, error, meta pagination, reload và cleanup khi unmount)
 */
export default function useFetch(url, params) {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const paramsKey = JSON.stringify(params || {});

  const reload = useCallback(() => {
    if (!url) return () => {};
    let cancelled = false;
    setLoading(true);
    setData(null);

    axiosClient
      .get(url, { params })
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setMeta(res.meta || {});
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setData([]);
        setError(apiError(err, "Không tải được dữ liệu"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, paramsKey]);

  useEffect(() => {
    const cleanup = reload();
    return cleanup;
  }, [reload]);

  return { data, meta, loading, error, reload, setData };
}
