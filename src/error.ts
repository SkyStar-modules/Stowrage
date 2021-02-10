export class NameDuplicationError extends Error {
  public name = "\u001b[31;1mNAME DUPLICATION\u001b[0m";
  public message: string;

  public constructor(name: string) {
    super();
    this.message = name + " is already used as item name";
    return;
  }
}

export class NameNotFoundError extends Error {
  public name = "\u001b[31;1mNAME NOT FOUND\u001b[0m";
  public message: string;

  public constructor(name: string) {
    super();
    this.message = `entry name "${name}" could not be found`;
    return;
  }
}

export class IDNotFoundError extends Error {
  public name = "\u001b[31;1mNAME DUPLICATION\u001b[0m";
  public message: string;

  public constructor(id: number) {
    super();
    this.message = `entry id "${id}" could not be found`;
    return;
  }
}