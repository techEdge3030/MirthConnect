interface GlobalScriptItem {
  string: string[];
}

export interface GlobalScript {
  map: {
    entry: GlobalScriptItem[];
  };
}
