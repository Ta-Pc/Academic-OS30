declare module 'papaparse' {
  export interface PapaParseResult {
    data: unknown[];
    errors: Array<{ message: string; row?: number }>;
    meta: { fields?: string[] };
  }
  const Papa: {
    parse: (input: string, options: { header?: boolean; skipEmptyLines?: boolean }) => PapaParseResult;
  };
  export default Papa;
}



