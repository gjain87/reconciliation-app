/**
 * Safely converts Java BigDecimal (numbers, strings, or Jackson objects) to a JavaScript number
 */
export function parseBigDecimal(val: any): number {
    if (val === null || val === undefined || val === '') {
      return 0;
    }
  
    // 1. Direct number
    if (typeof val === 'number') {
      return isNaN(val) ? 0 : val;
    }
  
    // 2. Serialized as String (standard Jackson default for BigDecimal: "191.88")
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]+/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
  
    // 3. Serialized as an object with unscaledValue and scale: { unscaledValue: 19188, scale: 2 }
    if (typeof val === 'object') {
      if ('unscaledValue' in val && 'scale' in val) {
        const unscaled = Number(val.unscaledValue);
        const scale = Number(val.scale);
        return isNaN(unscaled) || isNaN(scale) ? 0 : unscaled / Math.pow(10, scale);
      }
      // Object wrapping like { value: "191.88" } or { amount: 191.88 }
      if ('value' in val) return parseBigDecimal(val.value);
      if ('amount' in val) return parseBigDecimal(val.amount);
    }
  
    return 0;
  }
  
  /**
   * Formats parsed BigDecimal into USD currency representation ($#,##0.00)
   */
  export function formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') {
      return '$0.00';
    }
    const numericVal = parseBigDecimal(val);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericVal);
  }