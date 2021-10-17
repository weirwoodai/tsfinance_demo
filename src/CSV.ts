class CSV {
  private _separator: string;
  constructor(separator = ",") {
    this._separator = separator;
  }

  get separator(): string {
    return this._separator;
  }

  set separator(separator: string) {
    this._separator = separator;
  }

  convert(data: any[]) {
    //Get the name of all the properties of this object
    const headersReference = Object.keys(data[0]);

    //go through all the elements in the Data[] to build arrays that only
    //contain the values of the properties. The first element of this resulting
    //array will contain the names of the properties.
    return data
      .reduce(
        (t, d) => {
          //make sure the headers of all the objects are the same
          const headers = Object.keys(d);
          if (!CSV.sameMembers(headersReference, headers)) {
            throw new Error("Different amount of fields!");
          }
          //get the values of this object and construct a string separated by
          //the 'separator' character defined in this CSV
          return [...t, Object.values(d).join(this.separator)];
        },
        [headersReference.join(this.separator)]
      )
      .join("\n");
  }

  private static containsAll(a: string[], b: string[]) {
    return b.every((e: any) => a.includes(e));
  }

  private static sameMembers(a: string[], b: string[]) {
    return CSV.containsAll(a, b) && CSV.containsAll(b, a);
  }
}

export default CSV;
