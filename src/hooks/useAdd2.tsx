import { useState, useCallback } from "react";

function useAdd2() {
  const [value, setValue] = useState(0);

  const doubleValue = useCallback(() => {
    setValue((prev) => prev * 2);
  }, []);

  const addTwo = useCallback(() => {
    setValue((prev) => prev + 2);
  }, []);

  return { value, doubleValue, addTwo };
}

export default useAdd2;