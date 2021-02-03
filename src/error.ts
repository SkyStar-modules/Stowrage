export class NameDuplicationError extends Error {

    public name = "Name Duplication";
    public message: string;

    public constructor(name: string) {
        super();
        this.message = name + " is already used as item name";
        return;
    }
}